function SpananProtocol(methodName, methodArgs = []) {
  if(methodName.indexOf(":") > -1) {
    [this.methodName, ...this.methodArgs] = methodName.split(":");
  } else {
    this.methodName = methodName;
    this.methodArgs = Array.prototype.map.call(methodArgs, String);
  }
}

SpananProtocol.prototype = {
  toString: function () {
    return [this.methodName, ...this.methodArgs].join(":");
  },
  argsToString: function () {
    return this.methodArgs.join(":");
  }
}
