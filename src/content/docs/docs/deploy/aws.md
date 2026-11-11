---
title: On AWS
description: Deploy a Digital Collections Explorer site to AWS with one command, see its cost first, and open it to the public over HTTPS.
sidebar:
  order: 0
---

`deploy/aws/` creates one small EC2 machine that runs the same bootstrap script as any Linux server. Before creating anything it lists what it will create and looks up the current AWS prices, and it does nothing until you type `yes`. The scripts need the AWS CLI, signed in to the account.

```bash
deploy/aws/deploy.sh my-collection --source s3://bucket/prefix --anonymous
deploy/aws/status.sh my-collection
deploy/aws/destroy.sh my-collection     # removes everything it created
```

The images must already be reachable from the cloud: in an S3 bucket, or listed in a `.parquet` manifest at an `s3://` or `https://` address. For a private bucket in the same account, add `--source-bucket` with its name. The site opens once indexing has finished, at the address that `deploy.sh` and `status.sh` print. There is no SSH: administrators connect through AWS Session Manager, with the `aws ssm start-session` command that `deploy.sh` prints.

`deploy.sh` also takes:

- `--region`, us-west-2 unless `AWS_REGION` names another. Give every script the same `--region`.
- `--instance-type`, one of t3.small, t3.medium (the default), t3.large, t3.xlarge, c7i.xlarge, or c7i.2xlarge.
- `--disk-gib`, the disk size in GB, 30 by default. It can be set only when the machine is first created.
- `--allowed-cidr`, the addresses that may open the site, everyone by default. It cannot be combined with `--https`.
- `--no-https` and `--no-domain`, to undo `--https` and `--domain`.
- `--collection-file collection.json`, to describe the site from the start.
- `--budget` and `--email`, together, to receive an email when the account's monthly AWS bill passes an amount you choose.
- `--yes`, to skip the confirmation.

## Change a deployment

Run `deploy.sh` again with the same name and only the options you want to change. Everything you leave out keeps its current value, and the script lists what will change before it asks you to confirm. It never lets an update replace the machine, which would delete the index.

Indexing is the only heavy work, so index on a large machine and serve from a small one. Changing `--instance-type` restarts the machine as the new type and keeps its index and its address.

```bash
deploy/aws/deploy.sh my-collection --source s3://bucket/prefix --anonymous --instance-type c7i.2xlarge
deploy/aws/deploy.sh my-collection --instance-type t3.medium
```

`status.sh` reports how indexing went and what it cost: how long it took, images per second, the files that failed, the cost of the run and of every 1,000 images, and what the machine costs per month from now on.

## Open it to the public

Add `--https`. The site gets an `https://` address from CloudFront, with no domain name or certificate to arrange, and the machine stops accepting traffic from anywhere else. CloudFront also keeps copies of the images and the page's files, so the machine does not send them to every visitor. `deploy.sh` then sets [`proxy_hops`](../../limits/) to 1, so that each visitor is limited separately.

```bash
deploy/aws/deploy.sh my-collection --https
```

## At a domain of your own

Request a certificate for the domain in AWS Certificate Manager in us-east-1, where CloudFront looks for certificates, whatever region the site runs in. Add the DNS record that `aws acm describe-certificate` shows, and once the certificate is issued, deploy with the domain and the certificate. The script then says which CNAME record to add where your domain's DNS is kept. The CloudFront address keeps working, so links already shared do not break.

```bash
aws acm request-certificate --region us-east-1 --domain-name collection.example.org --validation-method DNS
aws acm describe-certificate --region us-east-1 --certificate-arn arn:aws:acm:us-east-1:...
deploy/aws/deploy.sh my-collection --https --domain collection.example.org --certificate-arn arn:aws:acm:us-east-1:...
```

## Under a path of your website

`--base-path /maps` serves the site at `/maps/`, for a website of your own whose proxy forwards that path to it. It is set when the machine is first created. Without `--https`, point the proxy at the machine's fixed address on port 80, set `proxy_hops` to 1 with `configure.sh`, and limit `--allowed-cidr` to the proxy's address, so that visitors cannot go around it. See [Under a path on an existing website](../under-a-path/) for the proxy.

## Describe it, limit it, update it

```bash
deploy/aws/describe.sh my-collection --file collection.json        # title, introduction, suggested searches
deploy/aws/configure.sh my-collection --set searches_per_minute=30  # limits, without a restart
deploy/aws/update.sh my-collection --image ghcr.io/l4cch/digital-collections-explorer:latest
deploy/aws/mcp.sh my-collection --on                                # answer AI assistants at /mcp
```

`update.sh` moves the site to another version without indexing again; the site is offline for a minute or two. `mcp.sh` turns on the [MCP server](../../mcp-server/) with links to the site's own address, including its domain and path, and waits until it answers. Run it again, or add `--mcp` to `deploy.sh`, whenever the address changes. `mcp.sh --off` turns the server off.

## A collection prepared elsewhere

A collection built by your own pipeline needs no indexing on the machine. Copy the folder to a bucket in the region where the machine will run, and start from it with `--from` in place of `--source`.

```bash
aws s3 sync my-collection s3://my-bucket/my-collection
deploy/aws/deploy.sh my-collection --from s3://my-bucket/my-collection
```

To replace the data of a running site, import the folder. The site keeps serving its current data until the copy is complete, then restarts on the new data. It keeps its limits but takes its description from the imported folder. A site started with `--source`, or from another bucket, must first be allowed to read the bucket with `--source-bucket`.

```bash
deploy/aws/deploy.sh my-collection --source-bucket my-bucket
deploy/aws/import.sh my-collection --from s3://my-bucket/my-collection
```
