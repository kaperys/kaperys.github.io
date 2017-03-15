---
layout: post
title:  Enabling SSL on a GitHub pages website using a custom domain
summary: GitHub pages doesn't offer SSL when using a custom domain with your website. Here's how I got that green padlock using CloudFlare.
---

GitHub pages do not offer SSL when you use a custom domain, like they do when using the default &#42;.github.io subdomain. If, like me, you want your website served over SSL while using a custom domain with GH pages, then it is possible but there are a few hoops to jump through first.

I'm going to assume you already have your custom domain set up and are serving your GH pages hosted website on you custom domian. If not, GitHub have some [pretty good docs](https://help.github.com/articles/using-a-custom-domain-with-github-pages/) on how to set this set up.

Firstly, if you don't already have one, you'll have to sign up for a [CloudFlare](https://www.cloudflare.com/a/sign-up) account. Follow the instructions to setup your DNS with CloudFlare (you'll have to change your domain nameservers with your registrar). CloudFlare will scan your existing DNS records and mirror the configuration in your profile.

Once the domain is setup with CloudFlare, go to 'Crypto' and ensure the SSL level is set to 'Full'. Once you update it, or if it's already set, it can take up to 24 hours for certificate issuance (although it usually doesn't take that long).

You're now running your GH hosted website over SSL!

If you want to forward all your HTTP traffic to HTTPS, it's simple to setup in your CloudFlare control panel. Just go to 'Page Rules' and add a rule for your wildcard domain (for example, mine is http://&#42;kaperys.io/&#42;) setting the action to 'Always use HTTPS'.
