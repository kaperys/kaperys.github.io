---
title: Blog
navigation: true
order: 3

layout: blog
---

<ul class="blog-posts-feed">
  {% for post in site.posts %}
    <li class="post-item">
      <a href="{{ post.url }}" title="{{ post.title }}">
        <p class="post-date">{{ post.date | date_to_long_string }}</p>
        <p class="post-title">{{ post.title }}</p>
        <p class="post-summary">{{ post.summary }}</p>
      </a>
    </li>
  {% endfor %}
</ul>
