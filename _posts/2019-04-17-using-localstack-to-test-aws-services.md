---
layout: post
title: "Using LocalStack to test AWS services locally"
summary: "Nowadays, cloud providers offer many managed software solutions - from Redis to Kubernetes, object storage to machine learning, and everything in between. The appeal of managed services is clear - no complex installation and configuration, very little maintenance, lower cost, increased resiliency, etc; everywhere except your host machine. So, how can developers easily build applications which utilise a cloud provider's services outside of their environment?"
date: 2019-04-17
---

# {{ page.title }}

{{ page.summary }}

Often, the answer to this question is something along the lines of "create a docker-compose.yml file containing the required services". Whilst this might be one solution, we've now re-introduced most of the overhead that using managed services removed.

If your chosen cloud provider is AWS, there's an easier way…

## LocalStack

[LocalStack](https://localstack.cloud/) provides a local testing environment for applications utilising AWS managed services. It's language agnostic and features pluggable services, offline access and error injection.

![A typical LocalStack CI workflow](/img/using-localstack-to-test-aws-services/workflow.png "A typical LocalStack workflow")

LocalStack can be installed using Python pip:

```bash
pip install localstack
```

> There is also an official [`localstack/localstack` Docker image](https://hub.docker.com/r/localstack/localstack) available from the Docker Hub, should you prefer.

### Running Services

To start LocalStack, simply use the `localstack start` command. Starting LocalStack initialises a local version of many AWS services, including; API Gateway, Kinesis, Dynamo DB, Elasticsearch, S3, Firehose, Lambda, SQS, Redshift, CloudWatch and more. The full list of services is available on [LocalStack's GitHub repository](https://github.com/localstack/localstack#overview).

By default LocalStack initialises all available services bound to localhost, although this, and many other properties, are easily configured using [environment variables](https://github.com/localstack/localstack#configurations).

## AWS CLI

Since LocalStack provides the same APIs as AWS does, it's possible to use the official AWS CLI tool to interact with LocalStack services simply by overriding the service endpoint, using the `--endpoint` flag. The list of LocalStack endpoints is available in their [GitHub repository](https://github.com/localstack/localstack#overview).

For instance, to use the AWS CLI to access S3 running on LocalStack, use the following:

```bash
aws s3 ls --endpoint http://localhost:4572
```

The LocalStack authors also provide a wrapper for the AWS CLI, which makes interaction with LocalStack services even easier. [`awslocal`](https://github.com/localstack/awscli-local) removes the requirement for the `--endpoint` flag and is used in exactly the same way as the AWS CLI - no need to remember port numbers any more! Simply switch `aws` for `awslocal`.

## Developing with LocalStack

Similarly to using the AWS CLI, developing applications to use LocalStack is as simple as overriding the service endpoint.

I recently published a wrapper for the Go AWS SDK which allows you to wrap `aws.Config` types for use with LocalStack: [https://github.com/kaperys/awslocal](https://github.com/kaperys/awslocal).

> Although `awslocal` is a library, I don't actually recommend importing it into your projects. Instead, just copy the code. [A little copying is better than a little dependency](https://www.youtube.com/watch?v=PAAkCSZUG1c&t=9m28s).

---

This article was originally published on Medium - [https://medium.com/@kaperys/using-localstack-to-test-aws-services-locally-cd863c989c7b](https://medium.com/@kaperys/using-localstack-to-test-aws-services-locally-cd863c989c7b) &middot; Published {{ page.date | date_to_long_string }}
