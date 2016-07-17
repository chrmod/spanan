import Wrapper from "./wrapper";
import Server from "./server";

export default class {
  constructor(ctx = window || global) {
    if (ctx.spanan) {
      throw new Error("spanan already loaded");
    }
    this.ctx = ctx;
    this.ctx.spanan = this;
    this.server = new Server(ctx);
  }

  destroy() {
    this.server.stopListening();
    delete this.ctx.spanan;
  }

  export(functions) {
    this.server.setup(functions);
    this.server.startListening();
  }

  import(target) {
    this.server.startListening();

    if ( typeof target === "string" ) {
      target = this.constructor.createIframe(target);
    }

    const wrapper = new Wrapper(target);

    this.server.registerWrapper(wrapper);

    return wrapper;
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
