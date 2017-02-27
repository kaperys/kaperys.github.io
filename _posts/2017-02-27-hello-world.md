---
layout: post
title:  Hello World
summary: Testing!
---

If, like me, Eloquent is your ORM of choice, but you don't really need the full power of Laravel in your application you'll probably already know how to setup Eloquent outside Laravel (if not, check out my guide). But have you ever wanted to use Laravel's pagination classes with your Eloquent models/collections? The pagination classes seem to be really (oddly) tightly-coupled to the framework, but there is a work-around. In this post, I'll show you how to paginate your models and collections - it's easier than you might think!

## Installing

Firstly, we're going to need the pagination component. You can install this using composer with `composer require illuminate/pagination`. Once you have the pagination classes installed in your project, we can start paginating your models and collections.

## Getting going

Before we can use the `paginate()` method there are a few things we need to do first. We're going to need to know what page the user is currently on, and how many results they want. For this, I'm going to use a `$_GET` variable and set fallback defaults.

```php
$id = (isset($_GET['page']) && !empty($_GET['page'])) ? (int) $_GET['page'] : 1;
$pp = (isset($_GET['show']) && !empty($_GET['show'])) ? (int) $_GET['show'] : 10;
```

So now we have an `$id` variable that contains the page page the user is currently on, which falls back to 1 and a $pp variable that contains the amount of results to show, that falls back to 10. Great! We still can't use `paginate()` just yet though..

The next thing we need to do is setup the current path and page resolvers. The path resolver is responsible for formatting the links to be used in the pagination controls (lastPage(), nextPage(), etc) and the page resolver is responsible for setting the current page index. The resolvers are set after model instantiation, but before querying. In this example I'll be using a very simple news feed. Here's how I'd setup the resolvers:

```php
$articles = new Article;

Illuminate\Pagination\Paginator::currentPathResolver(function() { return '/news'; });
Illuminate\Pagination\Paginator::currentPageResolver(function() use($id) { return $id });

// ...
```

Notice how we're currying the current page index into the page resolver. This is because the index is dynamic.

Now we've setup the index variable, per page variable and the resolvers we can start using the `paginate()` method

Using pagination is as simple as replacing your `get()`, `first()` or `all()` method with `paginate()`. When we paginate though, we want to pass in the amount of results we want to show (remember the $pp variable?). So putting it all together, we have code that looks like this:

```php
$articles = new Article;

Illuminate\Pagination\Paginator::currentPathResolver(function() { return '/news'; });
Illuminate\Pagination\Paginator::currentPageResolver(function() use($id) { return $id });

$articles = $articles->orderBy('date', DESC)->paginate($pp);
```

Simple, right? Now we have our paginated collection we want to be able to move through the pages. The pagination component offers a simple API for this. We can use the following methods to navigate our paginated collection; `previousPageUrl()` and `nextPageUrl()`. There are also various other helper methods such as `total()` and `perPage()`. All the available methods are listed in [Laravel's documentation](https://laravel.com/docs/5.2/pagination#displaying-results-in-a-view) (scroll down to 'Additional Helper Methods').
