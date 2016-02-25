import uuid from "./uuid";

class Transfer {

  constructor(fnName, fnArgs = []) {
    this.fnName = fnName;
    this.fnArgs = Array.prototype.slice.call(fnArgs);
    this.id = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }

}

export default Transfer;
