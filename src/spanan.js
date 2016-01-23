import Wrapper from "./wrapper";

export default class Spanan {
  constructor() {
    this.pendingMessages = [];
    this.messageListener = this.messageListener.bind(this);
  }

  messageListener(e) {
    this.pendingMessages.push(e);
  }

  startListening() {
    window.addEventListener("message", this.messageListener);
  }

  stopListening() {
    window.removeEventListener("message", this.messageListener);
  }

  import(url) {
    var iframe = Spanan.createIframe(url),
        wrapper = new Wrapper(iframe);

    var handler = {
      get(target, name) {
        return name in target ?
          target[name] :
          this.send(name);
      },

      send(name) {
        return function () {
          return wrapper.send(name, arguments);
        };
      }
    };

    return new Proxy(wrapper, handler);
  }

  static createIframe(url) {
    var iframe = document.createElement("iframe");

    iframe.src           = url;
    iframe.className     = "spanan";
    iframe.style.display = "none";

    document.body.appendChild(iframe);

    return iframe;
  }
}
