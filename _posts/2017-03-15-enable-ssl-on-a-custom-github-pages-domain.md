---
layout: post
title:  Enabling SSL on a GitHub pages website using a custom domain
summary: GitHub pages doesn't offer SSL when using a custom domain with your website. Here's how I got that green padlock using CloudFlare.
---

GitHub pages do not offer SSL when you use a custom domain, like they do when using the default &#42;.github.io subdomain. If, like me, you want your website served over HTTPS while using a custom domain with GH pages, then while it is possible, there are a few hoops to jump through.

I'm going to assume you already have your custom domain set up and are serving your GH pages hosted website on your custom domian. If not, GitHub have some [pretty good docs](https://help.github.com/articles/using-a-custom-domain-with-github-pages/) on how to set this set up.

Firstly, if you don't already have one, you'll need to sign up for a [CloudFlare](https://www.cloudflare.com/a/sign-up) account. Follow the instructions to setup your domain with CloudFlare. During the setup process, CloudFlare will scan your existing DNS records and mirror them in your profile. You can them choose which DNS records should push traffic through CloudFlare and which should bypass. At the end of this process you'll need to change your domains nameservers.

Once the domain is setup with CloudFlare, go to 'Crypto' and ensure the SSL level is set to 'Full'. Once you update it, or if it's already set, it can take up to 24 hours for certificate issuance (although it usually doesn't take that long).

That's it! To test the setup, go to https://*yourdomain.com*.

You'll notice the non-https site is still served. If you want to forward all your HTTP traffic to HTTPS, it's simple to setup in your CloudFlare control panel. Just go to 'Page Rules' and add a rule for your wildcard domain (for example, mine is http://&#42;kaperys.io/&#42;) setting the action to 'Always use HTTPS'.
