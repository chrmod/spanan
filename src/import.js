(function (global) {

  function createIframe(url) {
    var iframe = global.document.createElement("iframe");

    iframe.className = "spanan";
    iframe.src = url;
    iframe.style.display = "none";

    iframe.addEventListener("load", function () {
      iframe.loaded = true;
    });

    global.document.body.appendChild(iframe);

    return iframe;
  }

  global.spanan = {
    import: function (url, options = {}) {
      var spanan = this;

      var handler = {
        get: function (target, name) {
          return name in target ?
            target[name] :
            this.send(target, name);
        },
        send: function (target, name) {
          return function () {
            var methodCall = new SpananProtocol(name, arguments);

            return new Promise(function (resolve, reject) {
              var loadingCheckerInterval,
                  rejectTimeout = setTimeout(function () {
                    clearInterval(loadingCheckerInterval);
                    reject();
                  }, options.timeout || 1000);

              if (!target.iframe.loaded) {
                loadingCheckerInterval = global.setInterval(function () {
                  if(target.iframe.loaded) {
                    clearInterval(loadingCheckerInterval);
                    target.iframe.contentWindow.postMessage(methodCall.toString(), "http://localhost:7357");
                    spanan.lastCallCb = function () {
                      clearTimeout(rejectTimeout);
                      resolve.apply(this,arguments);
                    };
                  }
                }, 50);
              }
            });
          };
        }
      };

      var iframeWrapper = {
        iframe: createIframe(url)
      };

      return new Proxy(iframeWrapper, handler);
    }
  };

  global.addEventListener("message", function (e) {
    global.spanan.lastCallCb(e.data);
  });
})(window);
