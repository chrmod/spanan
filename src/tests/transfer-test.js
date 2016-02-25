/*eslint-env mocha */
/*global chai */

import Transfer from "../transfer";

var expect = chai.expect;

describe("Transfer", function () {

  describe("#construtor", function () {
    it("accepts fnName and fnArgs", function () {
      var fnCall = new Transfer("test", [1,2,3]);
      expect(fnCall.fnName).to.equal("test");
      expect(fnCall.fnArgs).to.eql([1,2,3]);
    });

    it("accepts fnArgs being function arguments", function () {
      (function () {
        var fnCall = new Transfer("test", arguments);
        expect(fnCall.fnName).to.equal("test");
        expect(fnCall.fnArgs).to.eql([1,2,3]);
      })(1,2,3);
    });

    it("sets uniqe id", function () {
      const transfer1 = new Transfer("test", []);
      const transfer2 = new Transfer("test", []);
      expect(transfer1.id).to.not.equal(transfer2.id);
    });
  });

  describe("#toString", function () {
    it("aliases JSON.stringify", function () {
      let transfer = new Transfer("test", [1,2,3]);
      expect(JSON.parse(transfer.toString())).to.deep.equal(transfer);
    });
  });

});
