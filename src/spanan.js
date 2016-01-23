import Wrapper from "./wrapper";

export default class Spanan {
  constructor() {
    this.wrappers = new Map();
    this.messageListener = this.messageListener.bind(this);
  }

  registerWrapper(wrapper) {
    this.wrappers.set(wrapper.id, wrapper);
  }

  dispatchMessage(ev) {
    let msg, wrapper;

    try {
      msg = JSON.parse(ev.data);
    } catch (e) {
      return false;
    }

    wrapper = this.wrappers.get(msg.wrapperId);

    if (wrapper) {
      wrapper.dispatchMessage(msg);
      return true;
    } else {
      return false;
    }
  }

  messageListener(ev) {
    this.dispatchMessage(ev);
  }

  startListening() {
    window.addEventListener("message", this.messageListener);
  }

  stopListening() {
    window.removeEventListener("message", this.messageListener);
  }

  import(url) {
    const iframe = Spanan.createIframe(url),
        wrapper = new Wrapper(iframe);

    this.registerWrapper(wrapper);

    const handler = {
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
