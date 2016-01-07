import Transfer from '../transfer';

var expect = chai.expect;

describe("Transfer", function () {

  it("constructs from methodName and methodArgs", function () {
    var methodCall = new Transfer("test", [1,2,3]);
    expect(methodCall.methodName).to.equal("test");
    expect(methodCall.methodArgs).to.eql(["1","2","3"]);
  });

  it("constructs from serialized string", function () {
    var methodCall = new Transfer("test:1:2:3");
    expect(methodCall.methodName).to.equal("test");
    expect(methodCall.methodArgs).to.eql(["1","2","3"]);
  });

  it("constructs with methodArgs being function arguments", function () {
    (function () {
      var methodCall = new Transfer("test", arguments);
      expect(methodCall.methodName).to.equal("test");
      expect(methodCall.methodArgs).to.eql(["1","2","3"]);
    })(1,2,3);
  });

  describe("#toString", function () {
    it("serializes method call", function () {
      var methodCall = new Transfer("test", [1,2,3])
      expect(methodCall.toString()).to.equal("test:1:2:3");
    });
  });

  describe("#argsToString", function () {
    it("serializes method call", function () {
      var methodCall = new Transfer("test", [1,2,3])
      expect(methodCall.argsToString()).to.equal("1:2:3");
    });
  });

});
