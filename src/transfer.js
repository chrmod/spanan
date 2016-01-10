export default class {

  constructor(methodName, methodArgs = []) {
    if(methodName.indexOf(":") > -1) {
      [this.methodName, ...this.methodArgs] = methodName.split(":");
    } else {
      this.methodName = methodName;
      this.methodArgs = Array.prototype.map.call(methodArgs, String);
    }
  }

  toString() {
    return [this.methodName, ...this.methodArgs].join(":");
  }

  argsToString() {
    return this.methodArgs.join(":");
  }

}
