var spanan = {
  import: function (url) {
    var iframe = document.createElement('iframe');

    iframe.className = 'spanan';
    iframe.src = url;
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    var handler = {
      get: function (target, name) {
        return name in target ?
          target[name] :
          this.send(target, name);
      },
      send: function (target, name) {
        return function () {
          target.iframe.contentWindow.postMessage("test", "http://localhost");
          return new Promise(function (resolve, reject) { });
        };
      }
    };

    var iframeWrapper = {
      iframe: iframe
    };

    return new Proxy(iframeWrapper, handler);
  }
};

window.spanan = spanan;
