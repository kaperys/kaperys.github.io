---
layout: post
title: "Instrumenting Go using AWS X-Ray"
summary: "Observability of production workloads can often be a challenge - particularly so when you run a microservice based architecture. When each service performs one or more operations (such as database queries, file operations, publishing messages, etc) and one user request could invoke any amount of services, how do you debug issues and identify potential bottlenecks?"
date: 2019-01-15
---

# {{ page.title }}

{{ page.summary }}

That's where [distributed tracing](https://www.oreilly.com/ideas/distributed-tracing-what-it-is-and-why-it-will-become-a-default-tool) comes in.

![An example AWS X-Ray service map](/img/instrumenting-go-with-xray/service-map.png "An example AWS X-Ray service map")

Distributed tracing is a concept in which requests are tracked as they traverse services for the purpose of debugging and root cause analysis. Typically, a unique request identifier is assigned to the incoming request at the point of ingress, which is passed from service to service. Each service records [segments](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-segments) and [subsegments](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-subsegments) (often otherwise called "spans") of data about the request and the behaviour of the service handling the request. The end-to-end tracking of a request is known as a "trace".

Usually request segment data contains information such as timestamps, user or authentication information, response codes, metrics such as DNS lookup time or TLS negotiation time, etc. It's also possible for applications to record custom additional segments and subsegments of information by "instrumenting" your code.
Distributed tracing can be used to help answer questions such as:

- Which services are not performing well enough? What's the average response time for a request from service A to service B?
- Am I making unnecessary API calls or database queries?
- Do I have bottlenecks? If so, where are they?
- Can I optimise requests and/or operations using concurrency? Where are the blocking processes?
- Why is a particular request unsuccessful? Which component isn't working?

## AWS X-Ray

[AWS X-Ray](https://aws.amazon.com/xray/) is Amazon's managed distributed tracing tool and is available in most regions. X-Ray is designed to help developers debug production distributed applications and identify errors. X-Ray currently works with EC2, ECS, Lambda and Elastic Beanstalk.

![An example AWS X-Ray trace](/img/instrumenting-go-with-xray/example-trace.png "An example AWS X-Ray trace")

The above screenshot, from [Amazon's documentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html), shows an example X-Ray trace, in which a game state is saved using DynamoDB. It shows the parent request segment (the dark blue segment at the top) and each instrumented operation subsegment (the following segments) below. Although the example above shows a request to a single service X-Ray is capable of tracing a single request throughout many services.

AWS X-Ray is made up of two components - [the daemon](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon.html) and [the API](https://docs.aws.amazon.com/xray/latest/devguide/xray-api.html).

The X-Ray daemon is an application responsible for listening for raw segment data emitted by applications and relaying it to the X-Ray API. Within AWS the X-Ray daemon is available to Lambda functions and (when enabled) Elastic Beanstalk environments. Outside of AWS, and in AWS environments which don't provide the X-Ray daemon, like EC2, it can be installed and [run locally](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-local.html).

The [X-Ray API](https://docs.aws.amazon.com/xray/latest/devguide/xray-api.html) provides access to all X-Ray functionality via AWS SDKs, CLI tools and over HTTPS.

### X-Ray Daemon

There are two options for installing the X-Ray daemon. Either download and install the X-Ray daemon or pull the [official Docker image](https://hub.docker.com/r/amazon/aws-xray-daemon).

Personally, I prefer to use the daemon Docker image as it's portable and allows for an easier deployment. This is what we'll use for the purposes of this article.

> If you prefer, you can [install the X-Ray daemon on your host](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-local.html) machine and skip this section.

Here's [an example Makefile](https://github.com/kaperys/blog/blob/master/instrumenting-go-using-aws-xray/Makefile) which runs the X-Ray daemon Docker container:

```makefile
.PHONY: xray

xray:
	docker run --rm \
		--env AWS_ACCESS_KEY_ID=$$(aws configure get aws_access_key_id) \
		--env AWS_SECRET_ACCESS_KEY=$$(aws configure get aws_secret_access_key) \
		--env AWS_REGION=eu-west-2 \
		--name xray-daemon \
		--publish 2000:2000/udp \
		amazon/aws-xray-daemon -o
```

Let's break this down, line by line:

```bash
docker run --rm
```

**Line 4**: This line tells Docker that we want to run the following container. By default, a container's file system persists even after the container exists  - using the --rm flag tells Docker to remove it.

```bash
--env AWS_ACCESS_KEY_ID=$$(aws configure get aws_access_key_id) \  
--env AWS_SECRET_ACCESS_KEY=$$(aws configure get aws_secret_access_key) \
--env AWS_REGION=eu-west-2 \
```

**Lines 5–7**: These lines tell Docker to set these environment variables inside the running container. These environment variables are used by the X-Ray daemon to authenticate with the AWS X-Ray API. We can use aws configure shell commands to retrieve our AWS credentials at runtime.

```bash
--name xray-daemon \
```

**Line 8**: This line tells Docker to name the running container "xray-daemon", instead of a [random name](https://github.com/moby/moby/blob/master/pkg/namesgenerator/names-generator.go#L824).

```bash
--publish 2000:2000/udp \
```

**Line 9**: This line tells Docker to bind the host port 2000/udp to port 2000/udp inside the container. This allows us to access the daemon at `127.0.0.1:2000`.

```bash
amazon/aws-xray-daemon -o
```

**Line 10**: This line tells Docker to run the "amazon/aws-xray-daemon" container. If Docker doesn't already have this image cached it will download the latest version from the Docker Hub. The [`-o` flag](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-configuration.html#xray-daemon-configuration-commandline) is passed to the container entrypoint and tells the X-Ray daemon to run in local mode (which doesn't check for EC2 instance metadata).

> The terminal session you use must have access to your AWS credentials. You can test this by running `aws configure get aws_access_key_id`. You should see your access key ID.

To start the X-Ray daemon Docker container, simply run `make xray`. You should see output similar to the following:

![Running the AWS X-Ray daemon container](/img/instrumenting-go-with-xray/make-xray.png "Running the AWS X-Ray daemon container")

The X-Ray daemon is now listening for raw segment data on `127.0.0.1:2000`.

## Instrumenting Go

Now the X-Ray daemon is listening we're ready to send it raw segment data. We can use the AWS provided [X-Ray SDK](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go.html) to instrument our code, which sends segment data to `127.0.0.1:2000` by default.

Out-of-the-box the SDK provides:

- An [`http.Handler` wrapper](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-handler.html) for inbound HTTP traffic.

The inbound HTTP wrapper records HTTP method, client address, response code, timing, user agent and content length for each sampled request.

> Sampling controls the rate at which requests are traced by the X-Ray SDK. By default the first request in every second is sampled, then 5% of all requests thereafter. You can [configure the daemon](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-configuration.html) to suit your needs.

- An [`http.Client` wrapper](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-httpclients.html) for outbound HTTP traffic.

The outbound HTTP wrapper records similar data to the inbound HTTP traffic wrapper. Requests made using a wrapped `http.Client` must use the `http.Request` `WithContext()` method.

- A [`client.Client` wrapper](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-awssdkclients.html) for AWS SDK clients.

Similarly to the outbound HTTP wrapper, all calls made using a wrapped `client.Client` must use the `WithContext()` version of the method invoked. X-Ray records downstream calls in trace subsegments and displays the services used in the [Service Map](https://docs.aws.amazon.com/xray/latest/devguide/xray-console.html#xray-console-servicemap).

- An `sql.Open` replacement for SQL connections.

The `xray.Open` function replaces `sql.Open`. Similarly to outbound HTTP and AWS SDK clients, context must also be passed to instrumented client methods. `xray.DB` method signatures are the same as `sql.DB`, except they expect a `context.Context` as the first parameter.

- [Methods for instrumenting custom code](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-subsegments.html).

The X-Ray SDK provides an `xray.Capture` function which is used for recording custom segments of data. The `xray.Capture` function is actually used internally by the SDK for recording most segments of data.

- Methods for recording additional [annotations](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-segment.html#xray-sdk-go-segment-annotations) and [metadata](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-segment.html#xray-sdk-go-segment-metadata).

It's also possible to record additional fields of data in segments and subsegments by using annotations and metadata. Annotations are indexed and searchable in the X-Ray console, metadata is not. The X-Ray SDK provides methods for recording key-value pairs of data as both annotations and metadata.

In a [previous article](https://kaperys.io/2018/10/17/docker-builder-pattern/), I created a small Go app which submitted photos taken with your webcam to [AWS' Rekognition](https://aws.amazon.com/rekognition/) API and displayed the results. For the purposes of this article I've made a slight change; instead of taking photos with your webcam, two random images are retrieved from [picsum.photos](https://picsum.photos/).

> If you want to follow along with this article you can grab the accompanying code from [GitHub](https://github.com/kaperys/blog/tree/master/instrumenting-go-using-aws-xray).

### Inbound HTTP

A typical HTTP handler might look like the following:

```go
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    // [...]
})
```

Only a slight change is necessary to instrument this handler  -  and we can use the `xray.Handler()` function from the X-Ray SDK for this. The `xray.Handler()` function accepts two parameters; an `xray.SegmentNamer` and a `http.Handler`.

The first parameter sets the service name. The service name is used to identify the particular service amongst others within the X-Ray console  -  it shows in both X-Ray traces and the Service Map. The X-Ray documentation contains a more in-depth section about [segment naming strategies](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-go-handler.html#xray-sdk-go-segments-naming).

The second parameter is the `http.Handler` we want to instrument. We can simply take the second parameter (the `func`) from the earlier code and move it here, wrapped in `http.HandlerFunc`.

Now we've satisfied the `xray.Handler` function, we can use it in the `http.Handle` function to serve instrumented requests.

```go
http.Handle("/", xray.Handler(xray.NewFixedSegmentNamer("..."), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    // [...]
})))
```

### Outbound HTTP

Usually outbound HTTP requests look similar to the following:

```go
client := &http.Client{}
req, _ := http.NewRequest(http.MethodGet, "...", nil)
res, _ := client.Do(req)
```

Instrumenting the `http.Client` type is as simple as wrapping it with the `xray.Client()` function. The X-Ray SDK creates a shallow copy of the `http.Client` but wraps `Transport` with `xray.RoundTripper()`.

Requests made using an instrumented client must use context. To retrieve context from the initial request we can use `r.Context()`.

```go
client := xray.Client(&http.Client{})
req, _ := http.NewRequest(http.MethodGet, "...", nil)
res, _ := client.Do(req.WithContext(r.Context()))
```

### AWS Services

Most AWS SDK clients are created in the same way  - ` (service-name).New(&aws.Config{})`. Here's a typical example of how you could use the Rekognition SDK client:

```go
svc := rekognition.New(session.New(&aws.Config{}))
labels, err := svc.DetectLabels(&rekognition.DetectLabelsInput{Image: &rekognition.Image{Bytes: v}})
```

Similarly to outbound HTTP traffic, AWS SDK clients are instrumented by wrapping the `client.Client` in `xray.AWS()` and passing context. Most client methods have a `WithContext()` version.

```go
svc := rekognition.New(session.New(&aws.Config{}))
xray.AWS(svc.Client)
labels, err := svc.DetectLabelsWithContext(r.Context(), &rekognition.DetectLabelsInput{Image: &rekognition.Image{Bytes: v}})
```

### Let's try it out!

We're ready to try it out. Firstly, make sure the X-Ray Docker daemon is running (make xray) and run our Go program with go run main.go.

Visiting the page in the browser should show something like the following:

![An example image from picsum.photos](/img/instrumenting-go-with-xray/sample-photo.jpeg "An example image from picsum.photos")

```bash
Nature %99.7065200805664
Outdoors %99.4658432006836
Ocean %99.4658432006836
Sea %99.4658432006836
Water %99.4658432006836
Bird %94.42656707763672
Animal %94.42656707763672
Sky %69.50778198242188 
Sunrise %66.34564971923828
Weather %59.46468734741211
Sand %56.408626556396484
Soil %55.84718322753906
```

It still works - great!

You should see output from the X-Ray Docker daemon, similar to the following:

```bash
[Info] Successfully sent batch of 21 segments (0.148 seconds)
```

This means that the daemon was able to successfully send collected traces to the X-Ray API.

## X-Ray Console

We should now be able to see traces in the X-Ray console. X-Ray appears under "Developer Tools" in the AWS Console.

Clicking on "Traces", on the left hand side, shows us a table of reported traces and some useful information such as average response time, HTTP response code and URL.

![Traces recorded by the AWS X-Ray API](/img/instrumenting-go-with-xray/app-trace.png "Traces recorded by the AWS X-Ray API")

By clicking into a particular trace we can drill down into the instrumented operations.

![Segments recorded for a particular trace](/img/instrumenting-go-with-xray/app-segments.png "Segments recorded for a particular trace")

The first segment, named "VisionService.Analyse", represents the lifespan of the request made to the app. Below that are subsegments which represent instrumented operations which occurred during the request.

Each new subsegment is a child of the previous subsegment, and occurred during the parent operation. For example "dns" occurred during "picsum.photos", which occurred during the main segment. The graph can be read from the top left to bottom right.

Since X-Ray is aware of outbound calls within our app, it is able to identify service boundaries, and can therefore generate a Service Map showing the flow of traffic within our application. We're able to easily see how one client request actually invokes three services.

![Vision App service map](/img/instrumenting-go-with-xray/app-service-map.png "Vision App service map")

## Conclusion

We've seen how quick and easy it is to instrument applications using the AWS X-Ray SDK, and how distributed tracing could be used to identify bottlenecks and debug errors. We've also seen how by instrumenting our code we're able to easily trace requests throughout a distributed system using a Service Map.

---

This article was originally published on Medium - [https://medium.com/@kaperys/instrumenting-go-using-aws-x-ray-10952aff00cc](https://medium.com/@kaperys/instrumenting-go-using-aws-x-ray-10952aff00cc) &middot; Published {{ page.date }}
