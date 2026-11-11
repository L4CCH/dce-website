---
title: "Models: SigLIP, SigLIP 2 and CLIP"
description: Choose the open multimodal model that indexes and searches a collection, and pin its version.
---

Embeddings come from open models that run on your own machine or cloud account. Choose one in `config.json` before indexing; the site then searches with the model the collection records.

## SigLIP (default)

[SigLIP](https://openaccess.thecvf.com/content/ICCV2023/html/Zhai_Sigmoid_Loss_for_Language_Image_Pre-Training_ICCV_2023_paper.html) is an open multimodal embedding model created by Google DeepMind.

```json
{
  "model_config": {
    "model_type": "siglip",
    "model_name": "google/siglip-base-patch16-224"
  }
}
```

In our tests on a museum collection it found clearly better matches than CLIP for English queries, and it stays usable for queries in other languages, where CLIP mostly fails. Search works best in English. It indexes three to four times slower than CLIP, and its index is about 1.5 times larger.

## SigLIP 2

[SigLIP 2](https://arxiv.org/abs/2502.14786) is the second version of SigLIP. Queries are lowercased and padded to 64 tokens, the way the model was trained.

```json
{
  "model_config": {
    "model_type": "siglip2",
    "model_name": "google/siglip2-base-patch16-224"
  }
}
```

## CLIP

[CLIP](https://proceedings.mlr.press/v139/radford21a.html), by OpenAI, was the default model of version 1.

```json
{
  "model_config": {
    "model_type": "clip",
    "model_name": "openai/clip-vit-base-patch32"
  }
}
```

## Pinning the model version

Any of the models above can take a `model_revision`: the commit of the model on Hugging Face. The index and the searches then keep using the same weights, even after the model is updated there.

```json
{
  "model_config": {
    "model_type": "siglip2",
    "model_name": "google/siglip2-base-patch16-224",
    "model_revision": "75de2d55ec2d0b4efc50b3e9ad70dba96a7b2fa2"
  }
}
```

`python -m src.ingest` records the model in `index_info.json` but not its revision, so keep the same `model_revision` in the `config.json` of every machine that serves the collection. A pipeline of its own can record the revision there, and the site then loads it. See [Collection format](../collection-format/#index_infojson).

## Changing the model

An index can only be searched with the model that built it. `python -m src.ingest` will not add to a folder indexed with another model, so after choosing another model, index into a new folder with `--data-dir`. The site searches with the model the collection records, whatever `config.json` names, and `DCE_MODEL` picks another of its models by key or name. It refuses to start if the collection holds no vectors from the model it would use. An index built by version 1 is in a layout this version no longer reads: serve it with v2.0.0-beta.2, or index its images again.

`device` in `model_config` sets where the site runs the model: `cuda` for an NVIDIA GPU, `mps` for an Apple Silicon GPU, or `cpu`. The default is `cuda`, and a device the machine lacks falls back to the CPU, so serving needs no GPU. Indexing uses the first of `cuda`, `mps`, and `cpu` that the machine has; `python -m src.ingest --device` overrides it.

The published container image holds SigLIP and indexes with it. To index with another model in a container, build an image whose `config.json` names it. A container that serves a collection built with another model downloads that model when it starts.
