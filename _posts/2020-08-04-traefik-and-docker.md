---
layout: post
title: "Using Traefik with docker-compose"
summary: "If, like me, you host a server running containerised applications and want the operational cost of using an orchastrator such as Kubernetes, you'll probably find that running a docker-compose stack does everything you need. However systems like Kubernetes and applications designed specifically for Kubernetes solve lots of common problems; one such problem is cluster/server ingress (exposing applications internal to your server to external traffic). In this post, I'll discuss how I use Traefik to manage ingress to my server using docker-compose."
date: 2020-08-04
---

# {{ page.title }}

{{ page.summary }}

## What is Traefik? 

[Traefik](https://traefik.io) is a modern reverse proxy and load balancer designed to handle complex deployments and large volumes of traffic whilst being simple to operate. In other words, it's an edge service responsible for listening to public and private ingresses and routing traffic to the correct service. Traefik allows you to configure [routing middleware](https://docs.traefik.io/middlewares/overview/), provides [automatic HTTPS](https://docs.traefik.io/https/acme/), [encrypts cluster communication](https://docs.traefik.io/https/tls/#client-authentication-mtls), performs [automatic configuration discovery](https://docs.traefik.io/providers/overview/), supports [distributed tracing](https://docs.traefik.io/observability/tracing/overview/) and more!

![Traefik overview image](/img/traefik-and-docker/overview.png "Traefik overview image")


## How do I use it?

*Note: I'm running a single node using docker-compose. You'll probably need to adapt my configs if you're using Docker Swarm.*

As I mentioned, I run Traefik in a Docker container using `docker-compose`. Helpfully, Containous, the authors of Traefik, maintain a [Docker image](https://hub.docker.com/_/traefik) which I use for this. Here's a stripped back version of my `docker-compose.yaml` file:

```yaml
version: "3.3"

services:
  traefik:
    image: "traefik:v2.2"
    container_name: "traefik"
    command:
      # - "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.http.address=:80"
    networks:
      - "internal"
    ports:
      - "80:80"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

networks:
  internal:
    driver: "bridge"
```

This compose file tells Docker that I want a container called `traefik` running Traefik version 2.2. The `command` flags are passed to the traefik binary running inside the container and tell Traefik to enable insecure API communications, enable the Docker provider, disable service exposure by default and create an entrypoint called `http` using port 80.

Let's break down what that means:

- `--log.level=DEBUG`. This enables debug logging - useful when debugging routes. I've left this in, but commented out, as it's useful to have handy.
- `--api.insecure=true`. This tells Traefik to expose the API on the default entrypoint (http). Setting this to false would require a router to access the API.
- `--providers.docker=true`. This enables the Docker Traefik provider. This, in conjunction with the Docker socket volume mount, allows Traefik to introspect Docker containers.
- `--providers.docker.exposedbydefault=false`. This tells Traefik to not expose containers by default. Instead, require us to explicity create routers per service.

I also define an "internal" network for Traefik to use to communicate with other containers. This creates network isolation between services fronted by Traefik and those not.



Traefik API/dashboard




```yaml
version: "3.3"

services:
  prometheus:
    hostname: "prometheus"
    container_name: "prometheus"
    image: "prom/prometheus:latest"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
    volumes:
      - "./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(`prometheus.kaperys.io`)"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"
      - "traefik.http.routers.prometheus.entrypoints=http"

networks:
  default:
    external:
      name: "traefik_internal"
```

labels

network

_-_

https

middleware

metrics


---

Published {{ page.date | date_to_long_string }}
