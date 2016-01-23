/*eslint-env mocha */
/*global chai */

import Transfer from "../transfer";

var expect = chai.expect;

describe("Transfer", function () {

  describe("#construtor", function () {
    it("accepts methodName and methodArgs", function () {
      var methodCall = new Transfer("test", [1,2,3]);
      expect(methodCall.methodName).to.equal("test");
      expect(methodCall.methodArgs).to.eql(["1","2","3"]);
    });

    it("accepts methodArgs being function arguments", function () {
      (function () {
        var methodCall = new Transfer("test", arguments);
        expect(methodCall.methodName).to.equal("test");
        expect(methodCall.methodArgs).to.eql(["1","2","3"]);
      })(1,2,3);
    });

    it("accepts serialized string", function () {
      var methodCall = new Transfer("test:1:2:3");
      expect(methodCall.methodName).to.equal("test");
      expect(methodCall.methodArgs).to.eql(["1","2","3"]);
    });

    it("sets uniqe id", function () {
      const transfer1 = new Transfer("test", []);
      const transfer2 = new Transfer("test", []);
      expect(transfer1.id).to.not.equal(transfer2.id);
    });
  });

  describe("#toString", function () {
    it("serializes method call", function () {
      var methodCall = new Transfer("test", [1,2,3]);
      expect(methodCall.toString()).to.equal("test:1:2:3");
    });
  });

  describe("#argsToString", function () {
    it("serializes method call", function () {
      var methodCall = new Transfer("test", [1,2,3]);
      expect(methodCall.argsToString()).to.equal("1:2:3");
    });
  });

});
