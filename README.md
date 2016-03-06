# Spanan

Spanan is a JavaScript library that simplify cross **iframe** communication.

With Spanan, Javascript applications can expose their functions for other
applications to use. Core concept here is that two apps should be able to
communicatie via API in **client-to-client** fashion.

In order to establish communication we need two applications - one that will
**export** functions to use (called "server") and one that will **import** them
(called "client"). Both of them can be separate application, hosted on
different domains.

Spanan is meant as a building block for new kind of web applications that share
their business logic. Until now exposing API was server-to-server or
client-to-server concept, but we believe that client-to-client is as much
important.

Important: at current stage your are using Spanan in production on your own
risk.

# Usage

First, Server need to expose some API. After loading Spanan library all you
need to do is listing of functions you want to export:


```js

// running at URL http://my-local-storage.com/
spanan.export({
  get: function (key) {
    return localStorage.getItem(key);
  },

  set: function (key, value) {
    localStorage.setItem(key, value);
  }
});
```

On client side you need to inform Spanan from where it should import functions:

```js
var myLocalStorage = spanan.import("http://my-local-storage.com/");
```

Under the hood Spanan will create invisible iframe and grant access to it via
internal API.

After that you will be able to access exported functions:

```js
myLocalStorage.get('test');
```

Returned values are promises that will be resolved after server finish calling
them. Because of that you are able to chain requests such as this:

```js
myLocalStorage.set('test', 'spanan is cool').then(function () {
  return todoService.get('test');
}).then(function (value) {
  console.log(value); // => 'spanan is cool'
});
```

# How it works?

Under the hood Spanan wraps `window.postMessage` (overcomimg some of its
limitations) to create remote procedure call (RPC) mechanism between html
documents. Each method invocation on client side generate a postMessage call to
given iframe and return a promise object. At the server side the message is
received and a given method is called. If it return a promise the promise, its
resolution will trigger resolution of client side promise. If it returns
a value, the client promise will be resolved with that value.

# Future

- Example above is limited to two applications that iteract with each other in
  only one direction. Future releases of Spanan will provide two way
  communication channel.

# Installation

In your html document add:

```html
<script src="path/to/yourCopyOf/spanan.js"></script>
```

it will provide both server and client API, as your apps very often will do
both.

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

# Tests

```
npm test
```

# Building for distribution

```
npm run build
```

# Contribution

Before submiting a pull request, please first create an issue describing what
and why you would like to change. This workflow will ensure the development
direction.
