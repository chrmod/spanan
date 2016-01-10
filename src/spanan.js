import Wrapper from "./wrapper";

export default {
  pendingMessages: [],

  messageListener(e) {
    this.pendingMessages.push(e);
  },

  startListening() {
    this.messageListener = this.messageListener.bind(this);
    window.addEventListener("message", this.messageListener);
  },

  stopListening() {
    window.removeEventListener("message", this.messageListener);
  },

  import(url, options = {}) {
    var iframe = this.createIframe(url),
        wrapper = new Wrapper(iframe);

    var handler = {
      get: function (target, name) {
        return name in target ?
          target[name] :
          this.send(name);
      },

      send: function (name) {
        return function () {
          var fnName = name,
              fnArgs = arguments;

          return new Promise(function (resolve, reject) {
            var rejectTimeout;

            rejectTimeout = setTimeout(function () {
              reject();
            }, options.timeout || 1000);

            wrapper.ready().then(function () {
              wrapper.send(fnName, fnArgs);

              wrapper.lastCallCb = function (...args) {
                clearTimeout(rejectTimeout);
                resolve.apply(null, args);
              };
            });
          });
        };
      }
    };

    window.addEventListener("message", function (e) {
      wrapper.lastCallCb && wrapper.lastCallCb(e.data);
    });

    return new Proxy(wrapper, handler);
  },

  createIframe(url) {
    var iframe = document.createElement("iframe");

    iframe.src           = url;
    iframe.className     = "spanan";
    iframe.style.display = "none";

    document.body.appendChild(iframe);

    return iframe;
  }
};
