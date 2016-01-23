/*eslint-env mocha */
/*global chai */

import Wrapper from "../wrapper";
import Transfer from "../transfer";
import spanan from "../spanan";

var expect = chai.expect;

describe("Wrapper", function () {
  var target, _subject;

  beforeEach(function () {
    target = {
      postMessage: function () {}
    };
  });

  afterEach(function () {
    _subject = undefined;
  });

  function subject(otherTarget) {
    _subject = _subject || new Wrapper(otherTarget || target);
    return _subject;
  }

  describe("#constructor", function () {
    it("sets `target` as property", function () {
      expect(subject().target).to.eql(target);
    });

    it("sets contentWindow as a target if provided with iframe", function () {
      var iframe = spanan.createIframe();
      expect(subject(iframe).target).to.eql(iframe.contentWindow);

      // cleanup
      document.body.removeChild(iframe);
    });

    it("has default timeout - 1000ms", function () {
      expect(subject()).to.have.property("timeout", 1000);
    });

    it("accepts timeout from options", function () {
      var wrapper = new Wrapper({}, { timeout: 400 });
      expect(wrapper).to.have.property("timeout", 400);
    });

    it("sets own id", function () {
      expect(subject()).to.have.any.key("id");
    });
  });

  describe("#ready", () => {
    afterEach(() => {
      // make sure that init callback is called and loading interval is stopped
      subject()._callbacks[0]();
    });

    it("returns promise", () => {
      expect(subject().ready()).to.be.instanceof(Promise);
    });

    it("postMessage on wrapped object with init string", done => {
      target = {
        postMessage(msg) { msg === "spanan?" ? done() : null; }
      };

      subject().ready();
    });

    it("assign 0 callback", () => {
      subject().ready();
      expect(subject()._callbacks).to.have.any.key('0');
    });

    it("gets resolved on callback", () => {
      const loadingPromise = subject().ready();
      subject()._callbacks[0]();
      return loadingPromise;
    });

    it("called twice return same promise object", () => {
      const promise1 = subject().ready();
      const promise2 = subject().ready();
      expect(promise1).to.equal(promise2);
    });

    it("keeps sending init string every 100ms until getting response", (done) => {
      let sendCount = 0;

      target = {
        postMessage() { sendCount++; }
      };

      subject().ready();

      setTimeout(() => {
        subject()._callbacks[0]();
        expect(sendCount).to.eql(3);
        done();
      }, 350);
    });

  });

  describe("#dispatchMessage", () => {
    it("calls callback", (done) => {
      const transferId = 1;
      subject()._callbacks[transferId] = done;
      subject().dispatchMessage({ transferId });
    });

    it("deletes called callback", () => {
      const transferId = 1;
      subject()._callbacks[transferId] = () => {};
      subject().dispatchMessage({ transferId });
      expect(subject()._callbacks).to.not.have.key(transferId);
    });
  });

  describe("#send", function () {

    it("calls ready on itself", done => {
      subject().ready = () => { done(); return Promise.resolve() };
      subject().send("test", [1]);
    });

    it("returns promise", function () {
      expect(subject().send("test")).to.be.instanceof(Promise);
    });

    it("promise get rejected after timeout", function () {
      var wrapper = new Wrapper(target, { timeout: 0 });
      return expect(wrapper.send("test")).to.eventually.be.rejected;
    });

    context("target ready", function () {
      beforeEach(() => {
        subject().ready = Promise.resolve;
      });

      it("calls 'postMessage' with Transfer", function (done) {
        var fnName = "test",
            fnArgs = [1,2,3];

        target.postMessage = function (msg) {
          var serializedCall = new Transfer(fnName, fnArgs);
          expect(msg).to.eql(serializedCall.toString());
          done();
        };

        subject().send(fnName, fnArgs);
      });

      it("calls 'postMessage' on target", function (done) {
        target.postMessage = function () {
          done();
        };
        subject().send("test");
      });

      it("calls postMessage with wildcard as targetOrigin", function (done) {
        target.postMessage = function (msg, targetOrigin) {
          if ( targetOrigin === "*" ) {
            done();
          }
        };
        subject().send("test");
      });

      it("subscribe callback on its callback list", function (done) {
        subject().send("test");
        setTimeout(function () {
          expect(Object.keys(subject()._callbacks)).to.have.length(1);
          done();
        }, 240);
      });

      it("promise get resolved after callback being called", function (done) {
        var promise = subject().send("test");

        promise.then(done);

        setTimeout(function () {
          subject()._callbacks[promise.transferId]();
        }, 10);
      });
    });

    context("target not ready", function () {
      beforeEach(() => {
        subject().ready = Promise.reject;
      });

      it("does not call 'postMessage' on target", function () {
        var called = false;

        target.postMessage = function () {
          called = true;
        };

        subject().send("test");

        expect(called).to.eql(false);
      });
    });
  });
});
