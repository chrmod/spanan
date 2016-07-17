import uuid from "./uuid";

class BaseTransfer {
  constructor() {
    this.id = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}

const DEFAULT_CONFIG = {
  requestProperties: {
    id: "id",
    fnName: "fnName",
    fnArgs: "fnArgs",
    wrapperId: "wrapperId",
    transferId: "transferId",
  },
  meta: {}
};

export class RequestTransfer extends BaseTransfer {

  constructor(fnName, fnArgs = [], config = {}) {
    super();
    this.fnName = fnName;
    this.fnArgs = Array.prototype.slice.call(fnArgs);
    this.config = {
      requestProperties: Object.assign({}, DEFAULT_CONFIG.requestProperties, config.requestProperties),
      meta: Object.assign({}, DEFAULT_CONFIG.meta, config.meta),
    };
  }

  toString() {
    const transfer = Object.assign({
      [this.config.requestProperties.id]:     this.id,
      [this.config.requestProperties.fnName]: this.fnName,
      [this.config.requestProperties.fnArgs]: this.fnArgs,
      [this.config.requestProperties.wrapperId]: this.wrapperId,
      [this.config.requestProperties.transferId]: this.transferId,
    }, this.config.meta);
    return JSON.stringify(transfer);
  }

  static fromString(str, config = {}) {
    const msg = JSON.parse(str);
    const requestProperties = Object.assign(
      {},
      DEFAULT_CONFIG.requestProperties,
      config.requestProperties || {}
    );
    const transfer = new RequestTransfer(
      msg[requestProperties.fnName],
      msg[requestProperties.fnArgs],
      config
    );
    Object.keys(requestProperties).forEach(propName => {
      const alias = requestProperties[propName];
      transfer[propName] = msg[alias];
    });
    return transfer;
  }
}

export class ResponseTransfer extends BaseTransfer {
  constructor(originalTransfer, response) {
    super();
    this.transferId = originalTransfer.id;
    this.wrapperId = originalTransfer.wrapperId;
    this.response = response;
  }
}
