---
title: "Models: SigLIP, SigLIP 2 and CLIP"
description: Choose the open multimodal model that indexes and searches a collection, and pin its version.
---

Embeddings come from open models that run on your own machine or cloud account. Choose one in `config.json`.

## SigLIP (default)

[SigLIP](https://arxiv.org/abs/2303.15343) is an open multimodal embedding model created by Google DeepMind.

```json
{
  "model_config": {
    "model_type": "siglip",
    "model_name": "google/siglip-base-patch16-224",
    "device": "mps"
  }
}
```

In our tests on a museum collection it found clearly better matches than CLIP for English queries, and it stays usable for queries in other languages, where CLIP mostly fails. Search works best in English. It indexes about three times slower than CLIP, and its index is about 1.5 times larger.

## SigLIP 2

[SigLIP 2](https://arxiv.org/abs/2502.14786) is the second version of SigLIP. It needs `transformers` 4.50 or later. Queries are lowercased and padded to 64 tokens, the way the model was trained.

```json
{
  "model_config": {
    "model_type": "siglip2",
    "model_name": "google/siglip2-base-patch16-224",
    "device": "mps"
  }
}
```

## CLIP

[CLIP](https://arxiv.org/abs/2103.00020) by OpenAI, which version 1 used by default.

```json
{
  "model_config": {
    "model_type": "clip",
    "model_name": "openai/clip-vit-base-patch32",
    "device": "mps"
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

A collection written by a pipeline of its own records the models it holds and their revisions in `index_info.json`, so it needs none of this. See [Collection format](../collection-format/#index_infojson).

## Changing the model

An index can only be searched with the model that built it. The site checks this when it starts and explains what to do if they differ. An index built with CLIP in version 1 keeps working once `config.json` names CLIP again. After choosing another model, build a new index.

`device` is `mps` for an Apple Silicon GPU, `cuda` for an NVIDIA GPU or `cpu`. Serving needs no GPU.
