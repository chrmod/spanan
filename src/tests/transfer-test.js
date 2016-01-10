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

    it("sets id bigger than last transfer id", function () {
      Transfer._nextId = 3;

      expect(new Transfer("test", []).id).to.eql(4);
      expect(new Transfer("test", []).id).to.eql(5);
    });
  });

  describe(".nextId", function () {
    it("returns autoincremented number", function () {
      Transfer._nextId = 0;

      expect(Transfer.nextId()).to.eql(1);
      expect(Transfer.nextId()).to.eql(2);
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
