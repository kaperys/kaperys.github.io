---
layout: post
title: "Create lean Docker images using the Builder Pattern"
summary: "If you've ever used Docker to compile software during development you'll quickly find that often your images become large. In this post we'll discuss how the builder pattern can be used to create leaner images containing only runtime dependencies, and touch on a few Docker best practices."
date: 2018-10-17
---

# {{ page.title }}

{{ page.summary }}

Often one of the most challenging aspects of building applications packaged with Docker is the resulting image size. In production you want only your compiled application and runtime dependencies present inside your image - there's no need for development dependencies; such as a compiler, tooling, test files, artifacts, vendor code, etc.

Docker 17.05 introduced [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds), which allow you to use multiple `FROM` statements in a single Dockerfile. Each `FROM` instruction defines a new base image for the following instructions, and begins a new build stage. Before multi-stage builds it was possible to to achieve the same effect, but the process required 2 Dockerfiles.

Using multi-stage builds allows you to selectively copy files between build stages - this is the basis of the builder pattern.

I've created a small Go sample application we'll use for the purposes of this article (grab the code from GitHub at https://github.com/kaperys/blog/tree/master/docker-builder-pattern). Although in this example we'll be compiling a Go application, some other use cases could be:

- copying your compiled application to a debugging image running a tool such as Delve.
- compiling a static website using a tool such as Jekyl or Hugo, and copying the HTML and assets to an nginx image.
- allowing other members of your organisation to compile and run your software without the need to install dependencies on their machine.

## An example

Let's consider the following code:

```go
package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/rekognition"
	"github.com/gin-gonic/gin"
)

func main() {
	svc := rekognition.New(session.New(&aws.Config{Region: aws.String("eu-west-1")}))

	r := gin.Default()

	r.StaticFS("/", http.Dir("html"))
	r.POST("/analyse", func(c *gin.Context) {
		var req struct{ Image string }

		if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		img, err := base64.StdEncoding.DecodeString(req.Image)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		labels, err := svc.DetectLabels(&rekognition.DetectLabelsInput{Image: &rekognition.Image{Bytes: img}})
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if len(labels.Labels) == 0 {
			c.JSON(http.StatusOK, nil)
			return
		}

		type label struct {
			Name       string  `json:"label"`
			Confidence float64 `json:"confidence"`
		}

		var ll []label
		for _, l := range labels.Labels {
			ll = append(ll, label{Name: *l.Name, Confidence: *l.Confidence})
		}

		c.JSON(http.StatusOK, ll)
		return
	})

	log.Fatal(r.Run())
}
```

The above application is a small HTTP server which exposes two routes. Line 20 creates a static file system handler, serving static files from the html directory. Line 21 accepts JSON containing image data and submits it to [AWS' Rekognition API](https://aws.amazon.com/rekognition/), returning the results to the caller.

To compile the application we'll need our source code, the Go compiler and vendor code ([AWS' SDK](https://github.com/aws/aws-sdk-go) and [Gin](https://github.com/gin-gonic/gin)). An example Dockerfile capable of compiling the application could look like this:

```docker
FROM golang:latest
ADD . /go/src/github.com/kaperys/blog/docker-builder-pattern
WORKDIR /go/src/github.com/kaperys/blog/docker-builder-pattern
RUN go get
RUN go build -o server .
ENTRYPOINT [ "./server" ]
```

Line 2 adds the working directory to the image. Line 4 installs vendor code. Line 5 compiles the application.

We can build the image with the following command:

```bash
docker build -t vision-app .
```

Great - this does everything we need. However, the resulting image is unnecessarily large.

![920MB Docker image size](/img/docker-builder-pattern/before-image-size.png "'docker image list' result")

The resulting image is 920MB, but the compiled binary is only 18MB. One of the reasons for this is that the golang image is based from Debian 8 and contains the Go compiler and various tooling.

In a production image we only need our compiled application and runtime dependencies. We can use multi-stage builds and the builder pattern to create a much leaner image.

## Multi-stage builds

Using a multi-stage build enables abstraction of concerns when building images. Each `FROM` instruction begins a new build stage in an "intermediate" container, within which the following instructions are executed. Typically, there will be two concerns when using Docker containers; build and run. We already have a container we can use to build our application (the builder). Now we need one to run it.

```docker
FROM golang
COPY . /go/src/github.com/kaperys/blog/docker-builder-pattern
WORKDIR /go/src/github.com/kaperys/blog/docker-builder-pattern
RUN go get && CGO_ENABLED=0 GOOS=linux go build -o server .

FROM scratch
LABEL maintainer="Mike Kaperys <mike@kaperys.io>"
COPY --from=0 /go/src/github.com/kaperys/blog/docker-builder-pattern/server /opt/kaperys/vision/server
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
ADD html/ /opt/kaperys/vision/html
EXPOSE 8080
WORKDIR /opt/kaperys/vision
ENTRYPOINT [ "./server" ]
```

There's a lot going on in the above Dockerfile. Let's break it down.

```docker
FROM golang
COPY . /go/src/github.com/kaperys/blog/docker-builder-pattern
WORKDIR /go/src/github.com/kaperys/blog/docker-builder-pattern
```

**1–3**: We've seen these lines before. Line 1 tells Docker to use the golang base image. Line 2 adds the working directory to the image. Line 3 sets the working directory inside the container.

```docker
RUN go get && CGO_ENABLED=0 GOOS=linux go build -o server .
```

**4**: This line has changed slightly. In the previous example this line was split into two lines. In this example I've merged the two. This is because Docker creates a new layer in the final image for every `RUN` , `ADD` and `COPY` instruction. Docker has published an article about best practices which has a section about [minimising the number of layers](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#minimize-the-number-of-layers).

We're now retrieving dependencies and compiling our software with the same Dockerfile instruction. `CGO_ENABLED=0` tells the Go compiler to disable support for C code linking. This is required since the `scratch` image we're planning to use contains no system libraries.

## Builder Pattern

```docker
FROM scratch
```

**6**: This line creates a new build stage, based from the [`scratch`](https://hub.docker.com/_/scratch/) image. `scratch` is a reserved single-layer image. You can think of `scratch` as an empty image.

> This image is most useful in the context of building base images (such as debian and busybox) or super minimal images (that contain only a single binary and whatever it requires, such as hello-world).
>> https://hub.docker.com/_/scratch/

```docker
LABEL maintainer="Mike Kaperys <mike@kaperys.io>"
```

**7**: This line simply adds the maintainer tag to the final image.

```docker
COPY --from=0 /go/src/github.com/kaperys/blog/docker-builder-pattern/server /opt/kaperys/vision/server
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
```

**8–9**: These lines use the COPY instruction to extract files from the first stage in the Dockerfile (--from=0). Line 8 copies the compiled Go binary. Line 9 copies the ca-certificates (since these don't exist in the scratch image).

```docker
ADD html/ /opt/kaperys/vision/html
```

**10**: This line adds runtime dependencies that weren't necessary at compile time. In this example these are static .html files.

```docker
EXPOSE 8080
```

**11**: This line tells Docker that the container listens on port 8080, but doesn't actually publish the port. See the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/#expose) for more information.

```docker
WORKDIR /opt/kaperys/vision
```

**12**: This line sets the working directory inside the container.

```docker
ENTRYPOINT [ "./server" ]
```

**13**: This line tells Docker what the container should do at runtime. In this example we want to run the server binary.

We can now build the image again using the same command:

```bash
docker build -t vision-app .
```

![18.2MB Docker image size](/img/docker-builder-pattern/after-image-size.png "'docker image list' result")

The resulting image is only 18.2MB - a huge reduction from our original 920MB!

## Conclusion

We've seen how multi-stage builds and the Builder Pattern can be used to drastically reduce the size of a Docker image. By creating a second build stage and copying files from the builder, we've been able to create a lean image containing only runtime dependencies.

---

This article was originally published on Medium - [https://medium.com/@kaperys/create-lean-docker-images-using-the-builder-pattern-37fe2b5d97d4](https://medium.com/@kaperys/create-lean-docker-images-using-the-builder-pattern-37fe2b5d97d4) &middot; Published {{ page.date }}
