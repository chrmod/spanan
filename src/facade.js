import Wrapper from "./wrapper";
import Server from "./server";

export default class {
  constructor(ctx = window || global) {
    if (ctx.spanan) {
      throw new Error("spanan already loaded");
    }
    this.ctx = ctx;
    this.ctx.spanan = this;
  }

  destroy() {
    if (this.server) {
      this.server.stopListening();
    }
    delete this.ctx.spanan;
  }

  export(functions, config) {
    if (!this.server) {
      this.server = new Server(this.ctx, config);
    }
    this.server.setup(functions);
    this.server.startListening();
  }

  import(target, config = {}) {
    if (!this.server) {
      this.server = new Server(this.ctx);
    }
    this.server.startListening();

    if ( typeof target === "string" ) {
      target = this.constructor.createIframe(target);
    }

    const wrapper = new Wrapper(target, config);

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
