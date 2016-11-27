/*eslint-env mocha */
/*global chai */

import { RequestTransfer, BaseTransfer } from "../../transfer";

var expect = chai.expect;

describe("BaseTransfer", function () {

  describe(".fromString", function () {
    it("constructs transfer object", function () {
      expect(BaseTransfer.fromString('{ "id": 1, "wrapperId": 2, "fnName": "action", "fnArgs": []}')).to.be.instanceOf(RequestTransfer);
    });

    it("sets all core properties", function () {
      const msg = {
        id: 1,
        fnName: "set",
        fnArgs: [1,2,3],
        wrapperId: 2,
      };
      const transfer = RequestTransfer.fromString(JSON.stringify(msg));
      expect(transfer).to.have.property("id").deep.equal(msg.id);
      expect(transfer).to.have.property("fnName").deep.equal(msg.fnName);
      expect(transfer).to.have.property("fnArgs").deep.equal(msg.fnArgs);
      expect(transfer).to.have.property("wrapperId").deep.equal(msg.wrapperId);
    });

    it("sets aliased properties", function () {
      const msg = {
        id: 1,
        action: "set",
        args: [1,2,3],
        wrapId: 2,
      };
      const config = {
        requestProperties: {
          fnName: "action",
          fnArgs: "args",
          wrapperId: "wrapId",
        }
      };
      const transfer = RequestTransfer.fromString(JSON.stringify(msg), config);
      expect(transfer).to.property("id").equal(msg.id);
      expect(transfer).to.property("fnName").deep.equal(msg[config.requestProperties.fnName]);
      expect(transfer).to.property("fnArgs").deep.equal(msg[config.requestProperties.fnArgs]);
      expect(transfer).to.property("wrapperId").deep.equal(msg.wrapId);
    });
  });
});

describe("RequestTransfer", function () {

  describe("#construtor", function () {
    it("accepts fnName and fnArgs", function () {
      var fnCall = new RequestTransfer("test", [1,2,3]);
      expect(fnCall.fnName).to.equal("test");
      expect(fnCall.fnArgs).to.eql([1,2,3]);
    });

    it("accepts fnArgs being function arguments", function () {
      (function () {
        var fnCall = new RequestTransfer("test", arguments);
        expect(fnCall.fnName).to.equal("test");
        expect(fnCall.fnArgs).to.eql([1,2,3]);
      })(1,2,3);
    });

    it("sets uniqe id", function () {
      const transfer1 = new RequestTransfer("test", []);
      const transfer2 = new RequestTransfer("test", []);
      expect(transfer1.id).to.not.equal(transfer2.id);
    });
  });

  describe("#toString", function () {
    it("stringify core properties", function () {
      const transfer = new RequestTransfer("test", [1,2,3]);
      expect(JSON.parse(transfer.toString())).to.deep.equal({
        id: transfer.id,
        fnName: transfer.fnName,
        fnArgs: transfer.fnArgs,
      });
    });

    it("aliases core properties based on config", function () {
      const requestProperties = {
        fnName: "action",
        fnArgs: "args",
      };
      const transfer = new RequestTransfer("test", [1,2,3], { requestProperties });
      transfer.wrapperId = 123;
      expect(JSON.parse(transfer.toString())).to.deep.equal({
        id: transfer.id,
        [requestProperties.fnName]: transfer.fnName,
        [requestProperties.fnArgs]: transfer.fnArgs,
        wrapperId: transfer.wrapperId,
      });
    });

    it("ignores additional properties", function () {
      const transfer = new RequestTransfer("test", [1,2,3]);
      transfer.someProperty = "someValue";
      expect(JSON.parse(transfer.toString())).to.deep.equal({
        id: transfer.id,
        fnName: transfer.fnName,
        fnArgs: transfer.fnArgs,
      });
    });

    it("passes meta from configuration object", function () {
      const meta = { target: "spanan", module: "core" };
      const transfer = new RequestTransfer("test", [1,2,3], { meta });
      expect(JSON.parse(transfer.toString())).to.deep.equal({
        id: transfer.id,
        fnName: transfer.fnName,
        fnArgs: transfer.fnArgs,
        target: meta.target,
        module: meta.module,
      });
    });
  });

});
