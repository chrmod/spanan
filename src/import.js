function spanan() {}

spanan.import = function (url, options = {}) {
  var wrapper = {
    iframe: spanan.createIframe(url)
  };

  var handler = {
    get: function (target, name) {
      return name in target ?
        target[name] :
        this.send(name);
    },

    send: function (name) {
      return function () {
        var methodCall = new SpananProtocol(name, arguments);

        return new Promise(function (resolve, reject) {
          var loadingCheckerInterval,
              rejectTimeout;

          rejectTimeout = setTimeout(function () {
            clearInterval(loadingCheckerInterval);
            reject();
          }, options.timeout || 1000);

          loadingCheckerInterval = setInterval(function () {
            if(!wrapper.loaded) { return; }
            clearInterval(loadingCheckerInterval);

            wrapper.iframe.contentWindow.postMessage(methodCall.toString(), "http://localhost:7357");
            wrapper.lastCallCb = function (...args) {
              clearTimeout(rejectTimeout);
              resolve.apply(null, args);
            };
          }, 50);
        });
      };
    }
  };

  wrapper.iframe.addEventListener("load", function () {
    wrapper.loaded = true;
  });

  window.addEventListener("message", function (e) {
    wrapper.lastCallCb && wrapper.lastCallCb(e.data);
  });

  return new Proxy(wrapper, handler);
}

spanan.createIframe = function(url) {
  var iframe = document.createElement("iframe");

  iframe.src           = url;
  iframe.className     = "spanan";
  iframe.style.display = "none";

  document.body.appendChild(iframe);

  return iframe;
}
