import uuid from "./uuid";

export class BaseTransfer {
  constructor() {
    this.id = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }

  static fromString(str, config) {
    const conf = prepareConfig(config);
    const msg = JSON.parse(str);
    const isResponse = Boolean(msg.wrapperId) && Boolean(msg.transferId);
    const isRequest = Boolean(msg[conf.requestProperties.fnName])
      && Boolean(msg[conf.requestProperties.fnArgs]);

    if (isResponse) {
      return ResponseTransfer.fromObject(msg, conf);
    } else if (isRequest) {
      return RequestTransfer.fromObject(msg, conf);
    } else {
      throw "Non-spanan message";
    }
  }

  static isValid(transfer, { meta } = { meta: {} }) {
    const isMetaMatching = Object.keys(meta).every(key => {
      return transfer.config.meta[key] === meta[key];
    });

    return isMetaMatching;
  }
}

const DEFAULT_CONFIG = {
  requestProperties: {
    id: "id",
    fnName: "fnName",
    fnArgs: "fnArgs",
    wrapperId: "wrapperId",
  },
  meta: {}
};

function prepareConfig(config = {}) {
  const requestProperties = Object.assign(
    {},
    DEFAULT_CONFIG.requestProperties,
    config.requestProperties || {}
  );
  const meta = Object.assign({}, DEFAULT_CONFIG.meta, config.meta || {});

  return {
    requestProperties,
    meta,
  };
}

export class RequestTransfer extends BaseTransfer {

  constructor(fnName, fnArgs = [], config) {
    super();

    if (!fnName) {
      throw "missing fnName";
    } else {
      this.fnName = fnName;
    }

    if (!fnArgs) {
      throw "missing fnArgs";
    } else {
      this.fnArgs = Array.prototype.slice.call(fnArgs);
    }

    this.config = prepareConfig(config);
  }

  toString() {
    const transfer = Object.assign({
      [this.config.requestProperties.id]:     this.id,
      [this.config.requestProperties.fnName]: this.fnName,
      [this.config.requestProperties.fnArgs]: this.fnArgs,
      [this.config.requestProperties.wrapperId]: this.wrapperId,
    }, this.config.meta);
    return JSON.stringify(transfer);
  }

  static fromObject(msg, config) {
    const conf = prepareConfig(config);
    const transfer = new RequestTransfer(
      msg[conf.requestProperties.fnName],
      msg[conf.requestProperties.fnArgs]
    );

    // Handle aliased main properties
    Object.keys(conf.requestProperties).forEach(propName => {
      const alias = conf.requestProperties[propName];
      if (alias && msg[alias]) {
        transfer[propName] = msg[alias];
      } else {
        throw `missing requestProperty ${propName} aliased with ${alias}`;
      }
    });

    // Check meta properties existance
    Object.keys(conf.meta).forEach(propName => {
      const msgValue = msg[propName];
      const metaValue = conf.meta[propName];
      if (!msgValue) {
        throw `missing meta property ${propName}`;
      } else if (msgValue !== metaValue) {
        throw `incorect meta property ${propName} value "${metaValue} !== ${msgValue}"`;
      }
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

  static fromObject(msg, config = {}) {
    return Object.assign(
      Object.create(ResponseTransfer.prototype),
      msg
    );
  }

}
