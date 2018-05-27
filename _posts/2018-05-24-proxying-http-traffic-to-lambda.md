---
layout: post
title:  Proxying HTTP traffic to a Go Lambda function
summary: Sometimes when you're developing Lambda functions it's nice to have a simple way to mock API Gateway's Lambda proxy. Here's how you could do this.
---

Sometimes when you're developing a Lambda function it nice to have some kind of tool to send an actual RPC to the function, in place of API Gateway's Lambda proxy. I would always suggest using unit tests for the greatest reliability when testing your Lambda, however for the purposes of alpha testing it's nice to be able to proxy HTTP requests to your Lambda's RPCs.

**Disclaimer:** awslabs have a great tool for this. In my case though, setting up a framework and implementing my own request and response types was a little overkill. If you're looking for something to use regularly to send HTTP traffic to your Lambda definitely check out [https://github.com/awslabs/aws-lambda-go-api-proxy](https://github.com/awslabs/aws-lambda-go-api-proxy).

## Your Lambda function

AWS' Lambda library expects a `Handler` function to be passed to the `lambda.Start` function. Handlers can accept between 0 and 2 arguments, and return between 0 and 2 arguments. The rules (from the [AWS Lambda dos](https://godoc.org/github.com/aws/aws-lambda-go/lambda#Start)) for a Lambda function's Handler signature are as follows:

* handler must be a function
* handler may take between 0 and two arguments.
* if there are two arguments, the first argument must satisfy the "context.Context" interface.
* handler may return between 0 and two arguments.
* if there are two return values, the second argument must be an error.
* if there is one return value it must be an error.

Example signatures:

```
	func ()
	func () error
	func (TIn) error
	func () (TOut, error)
	func (TIn) (TOut, error)
	func (context.Context) error
	func (context.Context, TIn) error
	func (context.Context) (TOut, error)
	func (context.Context, TIn) (TOut, error)
```

Where "TIn" and "TOut" are types compatible with the "encoding/json" standard library.

## Understanding how API Gateway calls Lambda

When you use API Gateway to invoke a Lambda function, the API Gateway Lambda proxy makes an RPC to `Function.Invoke`, passing an [`InvokeRequest`](https://godoc.org/github.com/aws/aws-lambda-go/lambda/messages#InvokeRequest) into the call. Most properties of the `InvokeRequest` are populated by API Gateway. The `Payload` property is populated with the request body sent to API Gateway.

When API Gateway calls the `Function.Invoke` method, the `InvokeRequest` type is converted to an [`APIGatewayProxyRequest`](https://godoc.org/github.com/aws/aws-lambda-go/events#APIGatewayProxyRequest) (the `InvokeRequest` isn't literally converted to this type, just a type that has the same structure). The `APIGatewayProxyRequest` type contains all the information from the original `InvokeRequest` and more. The `APIGatewayProxyRequest` type is passed to your Lambda's Handler function in place of `TIn`.

Once your Lambda has completed, you should return an [`APIGatewayProxyResponse`](https://godoc.org/github.com/aws/aws-lambda-go/events#APIGatewayProxyResponse) (you don't have to literally return this type, just a type that has the same structure). The `APIGatewayProxyResponse` is converted to an [`InvokeResponse`](https://godoc.org/github.com/aws/aws-lambda-go/lambda/messages#InvokeResponse). API Gateway responds to the original HTTP request with `InvokeResponse.Payload`, assuming there was no error.

## Mocking API Gateway

Firstly, since we're mocking API Gateway, we'll need an HTTP server.

```go
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "hello world")
})

log.Fatal(http.ListenAndServe(":8081", nil))
```

Now we've got a server listening on `localhost:8081`, we need to transform the `http.Request` into an `InvokeRequest`.

```go
func createLambdaRequest(r *http.Request) (*messages.InvokeRequest, error) {
    b := r.Body
    defer b.Close()

    p, err := ioutil.ReadAll(b)
    if err != nil {
        return nil, fmt.Errorf("could not read the payload: %v", err)
    }

    t := time.Now()
    return &messages.InvokeRequest{
        Payload:      p,
        RequestId:    "0",
        XAmznTraceId: "",
        Deadline: messages.InvokeRequest_Timestamp{
            Seconds: int64(t.Unix()),
            Nanos:   int64(t.Nanosecond()),
        },
        InvokedFunctionArn:    "",
        CognitoIdentityId:     "",
        CognitoIdentityPoolId: "",
        ClientContext:         []byte{},
    }, nil
}
```

With the `InvokeRequest` we can call Lambda.

```go
func parseLambdaResponse(req *messages.InvokeRequest) (messages.InvokeResponse, error) {
	res := messages.InvokeResponse{}

	c, err := rpc.Dial("tcp", fmt.Sprintf(":%d", lp))
	if err != nil {
		return res, fmt.Errorf("could not create rpc client: %v", err)
	}
	defer c.Close()

	if err := c.Call("Function.Invoke", req, &res); err != nil {
		return res, fmt.Errorf("could not call lambda function: %v", err)
	}

	if res.Error != nil {
		return res, fmt.Errorf("lambda returned an error: %v", res.Error)
	}

	return res, nil
}
```

Now all we need to do is tie the code together.

```go
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/rpc"
	"time"

	"github.com/aws/aws-lambda-go/lambda/messages"
)

var pp, lp int

func main() {
	flag.IntVar(&pp, "PROXY_PORT", 9898, "the proxy port")
	flag.IntVar(&lp, "LAMBDA_PORT", 8787, "the lambda port")
	flag.Parse()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		req, err := createLambdaRequest(r)
		if err != nil {
			fmt.Fprintln(w, err)
			w.WriteHeader(http.StatusBadRequest)

			return
		}

		res, err := parseLambdaResponse(req)
		if err != nil {
			fmt.Fprintln(w, err)
			w.WriteHeader(http.StatusBadRequest)

			return
		}

		fmt.Fprintf(w, string(res.Payload))
	})

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", pp), nil))
}

func createLambdaRequest(r *http.Request) (*messages.InvokeRequest, error) {
	b := r.Body
	defer b.Close()

	p, err := ioutil.ReadAll(b)
	if err != nil {
		return nil, fmt.Errorf("could not read the payload: %v", err)
	}

	t := time.Now()
	return &messages.InvokeRequest{
		Payload:      p,
		RequestId:    "0",
		XAmznTraceId: "",
		Deadline: messages.InvokeRequest_Timestamp{
			Seconds: int64(t.Unix()),
			Nanos:   int64(t.Nanosecond()),
		},
		InvokedFunctionArn:    "",
		CognitoIdentityId:     "",
		CognitoIdentityPoolId: "",
		ClientContext:         []byte{},
	}, nil
}

func parseLambdaResponse(req *messages.InvokeRequest) (messages.InvokeResponse, error) {
	res := messages.InvokeResponse{}

	c, err := rpc.Dial("tcp", fmt.Sprintf(":%d", lp))
	if err != nil {
		return res, fmt.Errorf("could not create rpc client: %v", err)
	}
	defer c.Close()

	if err := c.Call("Function.Invoke", req, &res); err != nil {
		return res, fmt.Errorf("could not call lambda function: %v", err)
	}

	if res.Error != nil {
		return res, fmt.Errorf("lambda returned an error: %v", res.Error)
	}

	return res, nil
}
```

## Proxying to Lambda

..
