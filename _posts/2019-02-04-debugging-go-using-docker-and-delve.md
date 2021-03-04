---
layout: post
title: "Debugging Go using Delve, Docker and VS Code"
summary: "Debugging a program can often be frustrating. Particularly so when your program is compiled and running inside a Docker container  - it can seem like you spend more time compiling than actually fixing the bug! Using a debugger can alleviate some of the pain points associated with debugging."
date: 2019-02-04
---

# {{ page.title }}

{{ page.summary }}

[Delve](https://github.com/go-delve/delve) is a debugging tool for the Go programming language. It's designed to be simple and not get in the way.

In this post we'll discuss how you could use Delve and Visual Studio Code to debug a Go application running inside a Docker container.

## Getting started

To use Visual Studio Code with Delve we'll need the [vscode-go](https://github.com/Microsoft/vscode-go) extension. To install this, open the quick command palette (`CTRL+P`) and enter `ext install ms-vscode.Go`.

> If you'd like to follow along with this article you can download the code from GitHub: [https://github.com/kaperys/blog/tree/master/delve-into-docker](https://github.com/kaperys/blog/tree/master/delve-into-docker)

### Dockerfile

To begin debugging our application we'll need to first download Delve. The easiest way to download Delve is to `go get` it. Once we have Delve installed, we can use the `dlv debug` command to being the debugging process.

The `dlv debug` command compiles the program with the necessary flags, starts the program and attaches to the running process. Since we're going to be running the Delve API inside a Docker container and using an external client to connect, we'll need to start Delve using the `--headless` flag and tell it which port to listen on  -  we'll use `--listen=:40000` for this.

Here's an example [Dockerfile](https://github.com/kaperys/blog/blob/master/delve-into-docker/Dockerfile) which does everything we need:

```docker
FROM golang
WORKDIR /go/src/github.com/kaperys/delve-into-docker-app
EXPOSE 40000 1541

RUN go get github.com/derekparker/delve/cmd/dlv
ADD main.go .

CMD [ "dlv", "debug", "github.com/kaperys/delve-into-docker-app", "--listen=:40000", "--headless=true", "--api-version=2", "--log" ]
```

We can build the container using `docker build -t delve-into-docker-app .`, or, if you're following along with my code, you can use [`make build`](https://github.com/kaperys/blog/blob/master/delve-into-docker/Makefile#L2).

Now we've built the container we're ready to start it. We can use the following command to start the container (or [`make run`](https://github.com/kaperys/blog/blob/master/delve-into-docker/Makefile#L6) if you're following along).

```bash
docker run --rm --publish 40000:40000 --publish 1541:1541 --security-opt=seccomp:unconfined --name delve-into-docker delve-into-docker-app
```

This command tells Docker to run the `delve-into-docker-app` image and name it `delve-into-docker`. It publishes ports 40000 (for the Delve API server) and 1541 (for our program) and [tells Docker not to use the default seccomp profile](https://docs.docker.com/engine/security/seccomp/#run-without-the-default-seccomp-profile), which is necessary to allow dlv to fork processes.

### Visual Studio Code

To use Visual Studio Code to debug we'll need a [`launch.json`](https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes) file. This file contains all the information Visual Studio Code will need to connect to and control Delve. Visual Studio Code will look for this file in the `.vscode` directory.

Here's an example [`launch.json`](https://github.com/kaperys/blog/blob/master/delve-into-docker/.vscode/launch.json) file which contains the configuration necessary to connect Delve running on our Docker container:

```json
{
      "version": "0.2.0",
      "configurations": [
            {
                  "name": "Delve into Docker",
                  "type": "go",
                  "request": "launch",
                  "mode": "remote",
                  "remotePath": "/go/src/github.com/kaperys/delve-into-docker-app",
                  "port": 40000,
                  "host": "172.17.0.2",
                  "program": "${workspaceRoot}",
                  "showLog": true
            }
      ]
}
```

Let's break down what each property does:

- `name` sets the name of the launch configuration in Visual Studio Code. This name appears in the debug launch configuration drop-down menu.
- `type` tells Visual Studio Code which debugger extension to use. We're using Delve which is included in the `vscode-go` extension.
- `request` tells Visual Studio Code what to do with your launch configuration. It determines if Visual Studio Code should attempt to launch a new debugger process or attach to an existing one.
- `mode` is specific to the Go debugger and determines the behaviour of the underlying Delve process. Since we're going to be connecting to a remote Delve API server, we'll use "remote". There's more information regarding the `mode` property on the [`vscode-go wiki pages](https://github.com/Microsoft/vscode-go/wiki/Debugging-Go-code-using-VS-Code#set-up-configurations-in-launchjson).
- `remotePath` tells Visual Studio Code where to find your application code on the remote server. This is necessary for Visual Studio Code to be able to map your local breakpoints to ones on the remote server.
- `port` tells Visual Studio Code which port the remote API server is listening on. This must match the port we published when starting our Docker container.
- `host` tells Visual Studio Code where the API server is listening. This value must be the IP address of your running Docker container. You can find the IP address using the following command: `docker inspect delve-into-docker --format '{% raw %}{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}{% endraw %}'`.
- `program` tells Visual Studio Code where your program source code is. Since ours is in the root directory of the project, we can use "${workspaceRoot}".
- `showLog` simply tells Visual Studio Code to show the output from the Delve debugger.

## Debugging

Now we're set up we're ready to begin debugging! Here's the demo program we'll use:

```go
package main

import (
	"log"
	"net/http"
	"strings"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		message := r.URL.Path
		message = strings.TrimPrefix(message, "/")
		message = "Hello, " + message + "!"

		w.Write([]byte(message))
	})

	log.Print("starting web server")
	if err := http.ListenAndServe(":1541", nil); err != nil {
		log.Fatal(err)
	}
}
```

To start with we'll add a breakpoint at line 11. To add a breakpoint in Visual Studio Code, click just to the left of the line numbers in the editor or press `SHIFT + F9` to add one to the current line.

![Adding a breakpoint in Visual Studio](/img/debugging-go-using-docker-and-delve/breakpoint.png "Adding a breakpoint in Visual Studio")

It's important to note that Delve will only allow us to add a breakpoint whilst the application isn't running. This means we'll need to add our first breakpoint _before_ starting the debugger. After this, we can add breakpoints whilst the program is paused.

To start debugging either press `F5` or go to Debug > Start Debugging in the menu. The blue status bar at the bottom of the editor will go orange once Visual Studio Code is connected to the Delve API server.

> If you're struggling to get Visual Studio Code connected to Delve there's a helpful ["Troubleshooting" section in the vscode-go wiki pages](https://github.com/Microsoft/vscode-go/wiki/Debugging-Go-code-using-VS-Code#troubleshooting).

Once Visual Studio Code is connected to Delve and you have a breakpoint set you can start debugging by visiting `localhost:1541`. Visiting the URL will invoke the web server and pause at the first breakpoint.

![Stepping through the code in Visual Studio Code](/img/debugging-go-using-docker-and-delve/debugging.png "Stepping through the code in Visual Studio Code")

Debugging allows you to step through your program, line by line. Visual Studio Code shows you the call stack and local variables in the left two panels.

You're able to step through the program using the controls towards the top of the editor. From left to right, the controls are; continue, step over, step into, step out, restart and stop. Here's what each control does:

- "Continue" (`F5`) skips the current breakpoint and moves to the next one (or allows the program to run as normal if there aren't any more).
- "Step over" (`F10`) jumps from the current line to the next line.
- "Step into" (`F11`) steps into functions on the current line.
- "Step out" steps out of the current function and back into the calling function.
- "Restart" (`CTRL + SHIFT + F5`) disconnects and reconnects Visual Studio Code from Delve.
- "Stop" (`SHIFT + F5`), unsurprisingly, stops debugging.

## Conclusion

In this article we've seen how Delve and Visual Studio Code could be used to debug a Go program running inside a Docker container. Although we've only discussed a trivial program, it's easy to see how powerful Delve could be when debugging a complex program.

---

This article was originally published on Medium - [https://medium.com/@kaperys/delve-into-docker-d6c92be2f823](https://medium.com/@kaperys/delve-into-docker-d6c92be2f823) &middot; Published {{ page.date | date_to_long_string }}
