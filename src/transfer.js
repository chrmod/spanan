import uuid from "./uuid";

class Transfer {

  constructor(methodName, methodArgs = []) {
    if(methodName.indexOf(":") > -1) {
      [this.methodName, ...this.methodArgs] = methodName.split(":");
    } else {
      this.methodName = methodName;
      this.methodArgs = Array.prototype.map.call(methodArgs, String);
    }
    this.id = uuid();
  }

  toString() {
    return [this.methodName, ...this.methodArgs].join(":");
  }

  argsToString() {
    return this.methodArgs.join(":");
  }

}

export default Transfer;
