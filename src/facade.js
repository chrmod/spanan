import Wrapper from "./wrapper";

export default class Spanan {
  constructor() {
    this.exportedFunctions = Object.create(null);
    this.wrappers = new Map();
    this.messageListener = this.messageListener.bind(this);
  }

  registerWrapper(wrapper) {
    this.wrappers.set(wrapper.id, wrapper);
  }

  dispatchMessage(ev) {
    let msg;

    if ( typeof ev.data === "string" && ev.data.indexOf("spanan?") === 0 ) {
      let wrapperId = ev.data.split("?")[1];

      if (this.wrappers.has(wrapperId)) {
        this.wrappers.get(wrapperId).activate();
      } else {
        ev.source.postMessage(ev.data, "*");
      }
      return;
    }

    try {
      msg = JSON.parse(ev.data);
    } catch (e) {
      return false;
    }

    let isResponse = Boolean(msg.wrapperId) && Boolean(msg.transferId);

    if ( isResponse ) {
      let wrapper = this.wrappers.get(msg.wrapperId);

      if (wrapper) {
        wrapper.dispatchMessage(msg);
        return true;
      } else {
        return false;
      }
    } else if ( msg.fnName && msg.fnArgs ) {
      msg.source = ev.source;
      return this.dispatchCall(msg);
    } else {
      return false;
    }
  }

  dispatchCall(msg) {
    const exportedFunction = this.exportedFunctions[msg.fnName];

    if ( !exportedFunction ) {
      return false;
    }

    let value = exportedFunction.apply(null, msg.fnArgs);

    let valuePromise = (value && value.then) ? value : Promise.resolve(value);

    this.sendResponse(msg, valuePromise);

    return true;
  }

  sendResponse(msg, valuePromise) {
    let responseTransfer = {
      transferId: msg.id,
      wrapperId: msg.wrapperId
    };

    valuePromise.then( (value) => {
      responseTransfer.response = value;

      let response = JSON.stringify(responseTransfer);

      msg.source.postMessage(response, "*");
    });
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

  export(functions) {
    this.exportedFunctions = functions;
  }

  import(target) {
    if ( typeof target === "string" ) {
      target = Spanan.createIframe(target);
    }

    const wrapper = new Wrapper(target);

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
