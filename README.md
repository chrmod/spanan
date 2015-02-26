# Spanan
Spanan is a JavaScript library that simplify cross iframe communication. It
wraps `window.postMessage` (overcomimg some of its limitations) to create
remote procedure call (RPC) mechanism between html documents.

With Spanan, JavaScript application can expose their API or consume other
applications API. Core concept here is that document can export some functions,
so other document can import them.

On consuming side (client api) all method calls return a promise object that
will be resolved by serving side (server api). In this way serving side which
is JavaScript application on a foreign domain, can be considered as an agent
that will return a value whenever it is willing to.

Spanan is a building block for new kind of web applications that share their
business logic across multiple async agents, that communicate with each other
to achieve more ambitious goals.

# Example

Lets build a simple TODO application that will be accessible from any website.

## Server API

Serving side define a list of methods that will be available on the client.

```js
// running at URL http://my-todo-service.com/
spanan.export({
  all: function () {
    return JSON.parse(localStorage.getItem('todos')) || [];
  },

  add: function (todo) {
    var todos = this.all();
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
  }
});
```
That's it. Now lets see how we can interact with our TODO app.

## Client API

```js
// running anywhere in the browser
var todoService = spanan.import("http://my-todo-service.stub/");

todoService.all().then(function (todos) {
  console.log(todos); // => []
}).then(function () {
  return todoService.add('test spanan');
}).then(function () {
  return todoService.all();
  }).then(function (todos) {
  console.log(todos); // => ['test spanan']
});
```

# Future

- Example above is limited to two applications that iteract with each other in
  only one direction. Future releases of Spanan will provide two way
  communication channel.

# Installation

In your html document add:

```html
<script src="path/to/yourCopyOf/spanan.js"></script>
```

it will provide both server and client API, as your apps very often will do both.

# Reasons behind Spanan

- `postMessage` API is one way communication. Spanan makes it two way: a method
  call, return a value (via promise object).
- Cross website communication tends to happen between server-server or
  client-server. Spanan works in client-client environment.
- Cross-Origin communication is restricted by CORS policies. Spanan removes all
  restrictions, so you can build experimental apps more easily.  (Important:
  this render you apps open to XSS attacs. Spanan will address access
  restricions in later versions)

# Limitations

- Exported method arguments and retuned values must be serializable to JSON.
  That means when you pass an object it will be changed into JSON using
  `JSON.stringify`, thus it will lose its prototype.

# Contribution

Before submiting a pull request, please first create an issue describing what
and why you would like to change. This workflow will ensure the development
direction.

# License

Copyright (c) 2015 Krzysztof Modras. Licensed Creative Commons
[CC BY-NC-SA 3.0](http://creativecommons.org/licenses/by-nc-sa/3.0/).
