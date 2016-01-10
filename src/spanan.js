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

  import(url) {
    var iframe = this.createIframe(url),
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
