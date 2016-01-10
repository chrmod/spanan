class Transfer {

  constructor(methodName, methodArgs = []) {
    if(methodName.indexOf(":") > -1) {
      [this.methodName, ...this.methodArgs] = methodName.split(":");
    } else {
      this.methodName = methodName;
      this.methodArgs = Array.prototype.map.call(methodArgs, String);
    }
    this.id = Transfer.nextId();
  }

  toString() {
    return [this.methodName, ...this.methodArgs].join(":");
  }

  argsToString() {
    return this.methodArgs.join(":");
  }

  static nextId() {
    Transfer._nextId = Transfer._nextId || 0;
    Transfer._nextId += 1;
    return Transfer._nextId;
  }

}

export default Transfer;
