export default class {

  constructor(ctx) {
    this.ctx = ctx;
    this.messageListener = this.messageListener.bind(this);
    this.exportedFunctions = Object.create(null);
    this.isListening = false;
    this.wrappers = new Map();
  }

  setup(functions) {
    this.exportedFunctions = functions;
  }

  startListening() {
    if (!this.isListening) {
      this.ctx.addEventListener("message", this.messageListener);
      this.isListening = true;
    }
  }

  stopListening() {
    this.ctx.removeEventListener("message", this.messageListener);
    this.isListening = false;
  }

  registerWrapper(wrapper) {
    this.wrappers.set(wrapper.id, wrapper);
  }

  messageListener(ev) {
    this.dispatchMessage(ev);
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
};
