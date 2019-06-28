---
layout: default
---

<div class="home">

    <h1>Mike Kaperys</h1>

    <p>I'm a software engineer from Sheffield, UK. I'm currently working at <a href="https://www.utilitywarehouse.co.uk/" title="Utility Warehouse">Utility Warehouse</a>, previously at <a href="https://www.uaccount.uk/" title="U Account">U Account</a>.</p>

    <ul>
        <li><a href="https://uk.linkedin.com/in/mikekaperys" title="LinkedIn">LinkedIn</a></li>
        <li><a href="https://twitter.com/_kaperys" title="Twitter">Twitter</a></li>
        <li><a href="https://github.com/kaperys" title="GitHub">GitHub</a></li>
        <li><a href="https://speakerdeck.com/kaperys" title="Talks">Talks</a></li>
    </ul>

    <hr>

    <div class="posts">
        {% for post in site.posts %}
            <div class="post">
                <h2 class="title">{{ post.title }}</h2>
                <p>{{ post.summary }}</p>
                <a href="{{ post.url }}" title="{{ post.title }}">Read More &rarr;</a>
            </div>
        {% endfor %}
    </div>

</div>