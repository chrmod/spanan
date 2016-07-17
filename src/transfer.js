import uuid from "./uuid";

class BaseTransfer {
  constructor() {
    this.id = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}

export class RequestTransfer extends BaseTransfer {

  constructor(fnName, fnArgs = []) {
    super();
    this.fnName = fnName;
    this.fnArgs = Array.prototype.slice.call(fnArgs);
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
