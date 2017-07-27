# Spanan [![Build Status](https://travis-ci.org/chrmod/spanan.svg?branch=master)](https://travis-ci.org/chrmod/spanan)

Spanan is simple library for building Promise-based remote function invocation.
It wraps one way messaging APIs (like window.postMessage) with a Proxy object
that returns a promise.

# Usage

Given a iframe object:

```javascript
const iframeWrapper = new Spanan((message) => {
  iframe.contentWindow.postMessage(JSON.stringify(message), '*');
});
const iframeProxy = iframeWrapper.createProxy();
const echoResponse = iframeProxy.echo(1);
echoResponse.then(response => console.log(response));
```

Spanan will send a message to iframe in a form:

```json
{
  "functionName": "echo",
  "args": [ 1 ],
  "uuid": <some uuid>
}
```

To resolve `echoPromise`, response must be dispatched on iframeWrapper:

```
iframe.contentWindow.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  iframeWrapper.dispatch({
    uuid: message.responseId,
    returnedValue: message.response,
  });
});
```

## Exposing API

Given a object that all own properties are function:

```js
const action = {
  echo(text) {
    return text;
  },
};
```

Spanan can automatically respond to upcoming messages that matches the desired
shape. By default upcoming messages must have 3 properties: `udid`, `action` and `args`.

```js
Spanan.export(actions, {
  respond(response, request) {
    window.postMessage(JSON.stringify({
      type: 'response',
      id: request.udid,
      returnedValue: response,
    }));
  },
});
```

Now, Spanan need to listen to upcoming messages:

```
window.addEventListener('message' (ev) => {
  const message = JSON.parse(ev.data);

  Spanan.dispatch(message);
});
```

Second argument for `export` is an options object that can configure default
Spanan behavior, it has following properties:

* `respond(response, request)` - being called for every messsage that was successfully dispatched
* `filter(request)` - called for every message, if returns true, the matching action will be called
* `transform(request)` - called for every positively filtered message. It must return an object with `action` and `args` properties. `action` is being used to match the name of the function that should be called, `args` are the arguments passed to the function.

# Requirements

Spanan uses Javascript Proxy API so require will work in Firefox >= 40 or
Chromium >= 49.

# Reasons behind Spanan

- `postMessage` API is one way communication. Spanan makes it two way: a method
  call, return a value (via promise object).
- Cross website communication tends to happen between server-server or
  client-server. Spanan works in client-client environment.


# Development

Test runner (testem) is integratrated with development server:

```
raureif test
```

# Tests

Run tests in CI mode by:

```
raureif test --ci
```

# Building for distribution

```
raureif build
```

# Contribution

Before submiting a pull request, please first create an issue describing what
and why you would like to change. This workflow will ensure the development
direction.
