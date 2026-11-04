---
title: On AWS
description: Deploy a Digital Collections Explorer site to AWS with one command, see its cost first, and open it to the public over HTTPS.
sidebar:
  order: 0
---

`deploy/aws/` creates one small EC2 machine that runs the same bootstrap script as any Linux server. Before creating anything it lists what it will create and looks up the current AWS prices, and it does nothing until you type `yes`.

```bash
deploy/aws/deploy.sh my-collection --source s3://bucket/prefix --anonymous
deploy/aws/status.sh my-collection
deploy/aws/destroy.sh my-collection     # removes everything it created
```

The images must already be reachable from the cloud, at an `s3://` or `https://` address. There is no SSH: administrators connect through AWS Session Manager. Pass `--budget` and `--email` to be warned when the monthly bill passes an amount you choose.

## Change a deployment

Run `deploy.sh` again with the same name and only the options you want to change. Everything you leave out keeps its current value, and the script lists what will change before it asks you to confirm. It never lets an update replace the machine, which would delete the index.

Indexing is the only heavy work, so index on a large machine and serve from a small one. Changing `--instance-type` restarts the machine as the new type and keeps its index and its address.

```bash
deploy/aws/deploy.sh my-collection --source s3://bucket/prefix --anonymous --instance-type c7i.2xlarge
deploy/aws/deploy.sh my-collection --instance-type t3.medium
```

`status.sh` reports how indexing went and what it cost: how long it took, images per second, the files that failed, the cost of the run and of every 1,000 images, and what the machine costs per month from now on.

## Open it to the public

Add `--https`. The site gets an `https://` address from CloudFront, with no domain name or certificate to arrange, and the machine stops accepting traffic from anywhere else. CloudFront also keeps copies of the images, which takes most of the load off a small machine.

```bash
deploy/aws/deploy.sh my-collection --https
```

## At a domain of your own

Request a certificate for the domain in AWS Certificate Manager in us-east-1, where CloudFront looks for certificates, whatever region the site runs in. Add the DNS record it asks for, and once the certificate is issued, deploy with the domain and the certificate. The script then says which CNAME record to add where your domain's DNS is kept. The CloudFront address keeps working, so links already shared do not break.

```bash
aws acm request-certificate --region us-east-1 --domain-name collection.example.org --validation-method DNS
deploy/aws/deploy.sh my-collection --https --domain collection.example.org --certificate-arn arn:aws:acm:us-east-1:...
```

## Under a path of your website

`--base-path /maps` serves the site at `/maps/`, for a website of your own whose proxy forwards that path to it. It is set when the machine is first created. See [Under a path on an existing website](/docs/deploy/under-a-path/) for the proxy.

## Describe it, limit it, update it

```bash
deploy/aws/describe.sh my-collection --file collection.json        # title, introduction, suggested searches
deploy/aws/configure.sh my-collection --set searches_per_minute=30  # limits, without a restart
deploy/aws/update.sh my-collection --image ghcr.io/hinxcode/digital-collections-explorer:latest
deploy/aws/mcp.sh my-collection --on                                # answer AI assistants at /mcp
```

`update.sh` moves the site to another version without indexing again. `mcp.sh` turns on the [MCP server](/docs/mcp-server/) with links to the site's own address, including its domain and path, and waits until it answers.

## A collection prepared elsewhere

A collection built by your own pipeline needs no indexing on the machine. Copy the folder to a bucket in the region where the machine will run, and start from it with `--from` in place of `--source`. To replace the data of a running site, let its machine read the bucket and import the folder; the site keeps serving its current data until the copy is complete.

```bash
aws s3 sync my-collection s3://my-bucket/my-collection
deploy/aws/deploy.sh my-collection --from s3://my-bucket/my-collection
deploy/aws/deploy.sh my-collection --source-bucket my-bucket
deploy/aws/import.sh my-collection --from s3://my-bucket/my-collection
```
