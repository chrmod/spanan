import { BaseTransfer, ResponseTransfer, RequestTransfer } from "./transfer";

export default class {

  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.dispatchMessage = this.dispatchMessage.bind(this);
    this.exportedFunctions = Object.create(null);
    this.isListening = false;
    this.wrappers = new Map();
  }

  setup(functions) {
    this.exportedFunctions = functions;
  }

  startListening() {
    if (!this.isListening) {
      this.ctx.addEventListener("message", this.dispatchMessage);
      this.isListening = true;
    }
  }

  stopListening() {
    this.ctx.removeEventListener("message", this.dispatchMessage);
    this.isListening = false;
  }

  registerWrapper(wrapper) {
    this.wrappers.set(wrapper.id, wrapper);
  }

  dispatchMessage(ev) {
    let transfer;

    try {
      transfer = BaseTransfer.fromString(ev.data, this.config);
    } catch (e) {
      return false;
    }


    if (transfer instanceof ResponseTransfer) {
      let wrapper = this.wrappers.get(transfer.wrapperId);

      if (wrapper) {
        wrapper.dispatchMessage(transfer);
        return true;
      } else {
        return false;
      }
    } else if (transfer instanceof RequestTransfer) {
      transfer.source = ev.source;
      return this.dispatchCall(transfer);
    } else {
      return false;
    }
  }

  dispatchCall(msg) {
    let exportedFunction = this.exportedFunctions[msg.fnName];

    if (msg.fnName === "-spanan-init-") {
      exportedFunction = () => true;
    }

    if ( !exportedFunction ) {
      return false;
    }

    let value = exportedFunction.apply(null, msg.fnArgs);

    let valuePromise = (value && value.then) ? value : Promise.resolve(value);

    this.sendResponse(msg, valuePromise);

    return true;
  }

  sendResponse(msg, valuePromise) {
    return valuePromise.then(value => {
      const responseTransfer = new ResponseTransfer(msg, value, this.config);
      msg.source.postMessage(responseTransfer.toString(), "*");
    });
  }
};
