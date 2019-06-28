---
layout: post
title: "An introduction to serverless Go applications using AWS"
summary: "Serverless has always been a bit of a buzzword and seems to be the trend at the moment — probably justifiably. In this post we'll discuss building serverless Go functions, testing, configuration and deployment to AWS."
date: 2018-11-10
---

# {{ page.title }}

{{ page.summary }}

## What is serverless?

Serverless is essentially an on-demand execution model for computing workloads, which is supported by many cloud providers — such as AWS, Azure and Google Cloud.

_Serverless doesn't mean that there are no servers involved._

Serverless functions are exactly what they sound like — functions which run on-demand on a cloud provider's platform.

Typically an interface is provided for developers to upload their code and the cloud provider takes care of the rest. The cloud provider manages hosting and execution of the code, resource allocation, auto-scaling, logging, metrics, security (somewhat) and more. You're (usually) only billed for the time your application is actually running.

Often serverless functions are executed inside stateless Docker containers and invoked using triggers provided by cloud providers, like a database event, new queue entry or HTTP proxy event.

Serverless functions are usually used for workloads of unknown or unpredictable demand, since they are provisioned and executed only when they're needed. Some example use-cases for this could be:

- A Slack integration which responds to slash commands.
- A mobile app which makes a backup of photographs you take.
- An API for AJAX calls powering a SPA CloudFront distribution.

### AWS Lambda

[Lambda](https://aws.amazon.com/lambda/) is Amazon's FaaS (function as a service) platform and is part of their [serverless application model](https://github.com/awslabs/serverless-application-model) (SAM).

On January 15th 2018 AWS announced support for [Go Lambda functions](https://aws.amazon.com/about-aws/whats-new/2018/01/aws-lambda-supports-go/). AWS provide a [library](https://github.com/aws/aws-lambda-go) for easily implementing Lambda functions in Go which we'll be using for the example in this post.

There are [many interface signatures](https://github.com/aws/aws-lambda-go/blob/fa1a118928cc98dce34b990f0ab244dc13b1a8e6/lambda/entry.go#L27-L35) supported by Lambda handlers and AWS provide [types for many existing Lambda triggers](https://github.com/aws/aws-lambda-go/tree/master/events) (such as S3, SQS, API Gateway, DynamoDB, CloudWatch, Lex and many more).

## An example

I've created an example function we'll use for the purposes of this post. You can grab the code from GitHub at [https://github.com/kaperys/blog/tree/master/serverless-go-intro](https://github.com/kaperys/blog/tree/master/serverless-go-intro).

The high level requirements for this function are simple. I want to build an API which I can provide a search string and then have one or more applicable emojis returned. I also don't want to manage the emoji data (this introduces an obvious dependency, but that's fine for this example).

Here's the code:

```go
package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/pkg/errors"
)

// searchKey is the name of the query string parameter which will be used to search emoji data.
const searchKey = "search"

// EmojiEntry represents the emoji data provided, per entry, in the source JSON file.
// Source: https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json.
type EmojiEntry struct {
	Emoji          string   `json:"emoji"`
	Description    string   `json:"description"`
	Category       string   `json:"category"`
	Aliases        []string `json:"aliases"`
	Tags           []string `json:"tags"`
	UnicodeVersion string   `json:"unicode_version"`
	IOSVersion     string   `json:"ios_version"`
}

func main() {
	lambda.Start(handler)
}

func handler(event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	emojis, err := getEmojis(event.QueryStringParameters)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       strings.Join(emojis, ""),
	}, nil
}

// getEmojis searches available emoji tags and aliases for the given search term.
func getEmojis(qs map[string]string) ([]string, error) {
	search, ok := qs[searchKey]
	if !ok {
		return nil, errors.Errorf("%q is a required query string parameter", searchKey)
	}

	emojis, err := getData(os.Getenv("SOURCE_URL"))
	if err != nil {
		return nil, errors.Wrap(err, "could not retrieve emoji data")
	}

	se := make(map[string][]string)
	for _, e := range emojis {
		for _, alias := range e.Aliases {
			if _, ok := se[alias]; !ok {
				se[alias] = []string{e.Emoji}
			} else {
				se[alias] = append(se[alias], e.Emoji)
			}
		}

		for _, tag := range e.Tags {
			if _, ok := se[tag]; !ok {
				se[tag] = []string{e.Emoji}
			} else {
				se[tag] = append(se[tag], e.Emoji)
			}
		}
	}

	result, ok := se[search]
	if !ok {
		return nil, errors.Errorf("no results for %q", search)
	}

	return result, nil
}

// getData retrieves the emoji data from the url and attempts to unmarshal it into a slice of EmojiData.
func getData(url string) ([]EmojiEntry, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, errors.Wrap(err, "could not create the request")
	}

	client := http.Client{Timeout: time.Second * 2}

	res, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "could not make the request")
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, errors.Wrap(err, "could not read the response")
	}

	var emojis []EmojiEntry
	if err = json.Unmarshal(body, &emojis); err != nil {
		return nil, errors.Wrap(err, "could not unmarshal the response")
	}

	return emojis, nil
}
```

The important part is the `handler` function defined on line 35.

```go
func handler(event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {}
```

Here we implemented one of the supported Lambda handler signatures. In this example we're using the predefined [APIGatewayProxy types](https://github.com/aws/aws-lambda-go/blob/master/events/apigw.go) since we'll be using API Gateway to invoke our function.

The rest of the code is "business logic" and really could be anything.

## Local development

Now we've written our Lambda function, how do we run it locally? There are a few options here.

### Unit tests

Firstly, and possibly most obviously, we could run the unit tests for the function (since your application should have unit tests anyway!). Since Lambda functions are literally that, functions, it's very easy to invoke your function in a unit test. You can check out the [unit tests for the example application](https://github.com/kaperys/blog/blob/master/serverless-go-intro/main_test.go) on GitHub.

Although unit tests are a great way to test that your business logic and handlers are doing what you expect, they can't cover integrations with the AWS services we'll be using.

### AWS SAM

AWS SAM CLI is a tool provided by AWS for development and deployment (amongst [other things](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html#benefits-of-using-sam)) of serverless applications. It allows us to run Lambda functions locally, validate AWS SAM templates, retrieve logs, generate event payloads, deploy our applications and more.

AWS SAM CLI is available for Windows, Mac and Linux and requires Docker, the AWS CLI and Python Pip to be installed. There are [installation instructions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) for SAM CLI available on AWS' website.

There are two SAM CLI commands that we could use to test our function — the [`start-api`](https://github.com/kaperys/blog/blob/master/serverless-go-intro/Makefile#L19) command and the [`invoke`](https://github.com/kaperys/blog/blob/master/serverless-go-intro/Makefile#L22) command (there are [more commands available](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html) if your Lambda function uses an alternative trigger, like an S3 or SQS event).

The [`start-api`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html) command, according to AWS' documentation:

> Allows you to run your serverless application locally for quick development and testing. When you run this command in a directory that contains your serverless functions and your AWS SAM template, it creates a local HTTP server that hosts all of your functions.
> When it's accessed (through a browser, CLI, and so on), it starts a Docker container locally to invoke the function. It reads the CodeUri property of the AWS::Serverless::Function resource to find the path in your file system that contains the Lambda function code.
>> https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html

Essentially `start-api` allows us to spawn a local API Gateway with which we can invoke our Lambda function.

The [`invoke`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html) command, according to AWS’ documentation:

> Invokes a local Lambda function once and quits after invocation completes.
> This is useful for developing serverless functions that handle asynchronous events (such as Amazon S3 or Amazon Kinesis events). It can also be useful if you want to compose a script of test cases.
>> https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html

`invoke` allows us to manually invoke the function with a given payload.

Both the `start-api` and `invoke` commands require a [template.yml](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-template-basics.html) file. The template file describes the architecture required by our serverless application. For our example application we'll need to describe a [serverless function resource](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction).

Here's the [template.yml](https://github.com/kaperys/blog/blob/master/serverless-go-intro/template.yml) file we'll be using for our emoji function:

```yaml
AWSTemplateFormatVersion : '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Description: Emoji Service
Resources:
  SearchEmojis:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: go1.x
      Handler: handler
      Environment:
        Variables:
          SOURCE_URL: https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json
      Events:
        RootHandler:
          Type: Api
          Properties:
            Path: '/'
            Method: get

Outputs:
  Endpoint:
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
```

The `AWS::Serverless::Function` resource describes the attributes of our function, such as the runtime, handler, memory requirements, timeout, etc. Within the function resource definition we can also describe the API we want to use to invoke the Lambda function.

In our example, we're telling SAM that we want to create a serverless function called "SearchEmojis". The template states that the "SearchEmojis" function should execute the "handler" binary using the `go1.x` runtime, and that we want to provide the `SOURCE_URL` environment variable to the function. It also states that we want to provision an API which will invoke the Lambda function when a GET request is made to the root handler.

We can now execute our Lambda function locally, using either the `start-api` or `invoke` commands. Since we're going to be using API Gateway, I'll use `start-api` (I've also provided an `invoke` example in the [Makefile](https://github.com/kaperys/blog/blob/master/serverless-go-intro/Makefile)).

![Starting SAM local with start-api](/img/serverless-go-on-aws/sam-start-api.png "Using 'sam start-api'")

## Deployment

AWS SAM CLI also provides functionality to [package and deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-deploying.html) your serverless applications. We'll use the [`sam package`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html) and [`sam deploy`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) commands to do this. Both commands are aliases for their `aws cloudformation [command]` equivalents.

The [`package`](https://github.com/kaperys/blog/blob/master/serverless-go-intro/Makefile#L24) command uses the template.yml file to package the application into a release and uploads the resources to an AWS S3 bucket. Once the upload is complete a copy of the template.yml file is created and the local artifacts are replaced with the remote ones.

To package our application we need to pass a couple of flags to the `sam package` command. Firstly SAM needs to know the template filename. Secondly we'll need to provide the name of the AWS S3 bucket where we want to store our release. Lastly the name of the packaged output file.

![Building the Go binary and packaging using 'sam package'](/img/serverless-go-on-aws/make-package.png "Using 'sam package'")

Once our application has been packaged we can use the [`deploy`](https://github.com/kaperys/blog/blob/master/serverless-go-intro/Makefile#L27) command to roll out the application. By default, the `deploy` command creates and executes a CloudFormation change set.

To deploy our application we need to pass a couple of flags to the `sam deploy` command. Firstly the CloudFormation stack name. This name is used to uniquely identify the stack. If a stack with this name doesn't already exist CloudFormation will provision a new one, otherwise it will update the existing one. Secondly we'll need to pass the packaged template filename. And lastly we need to tell CloudFormation that our packaged template is allowed to create IAM roles (we'll need to create an IAM role to allow API Gateway to invoke Lambda).

![Deploying the SAM package using 'sam deploy'](/img/serverless-go-on-aws/make-deploy.png "Using 'sam deploy'")

Great! Our serverless application has been deployed. Since we added [an endpoint output to our template.yml](https://gist.github.com/kaperys/025120acfe89cb5ca05ac15927aaf1c9#file-template-yml-L21-L23) file we're able to use the AWS CloudFormation CLI to discover the URL of the API Gateway endpoint.

![Retrieving the API Gateway URL using the cloudformation CLI](/img/serverless-go-on-aws/cloudformation-describe-stack.png "The cloudformation CLI")

We can now invoke our Lambda function using the API Gateway endpoint we can see in the `Outputs` array. We can use `curl` to try it out.

![Testing the deployed Lambda application using curl](/img/serverless-go-on-aws/testing-the-lambda.png "Testing the Lambda using curl")

## Conclusion

In this post we've seen how we can use the AWS SAM CLI tool to easily build, test and deploy serverless Go applications with AWS. With a simple template.yml file and some tooling we can make these often challenging tasks as simple as executing a few commands.

---

This article was originally published on Medium - [https://medium.com/@kaperys/an-introduction-to-serverless-go-applications-using-aws-a258bc2a7b72](https://medium.com/@kaperys/an-introduction-to-serverless-go-applications-using-aws-a258bc2a7b72) &middot; Published {{ page.date }}
