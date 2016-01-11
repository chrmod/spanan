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
  });

  describe("#ready", function () {
    var iframeURL = "./fixtures/basic.html",
        iframe;

    afterEach(function () {
      if ( iframe ) {
        document.body.removeChild(iframe);
      }
    });

    it("returns promise", function () {
      expect(subject().ready()).to.be.instanceof(Promise);
    });

    it("does not resolve if iframe is not loaded", function () {
      iframe = spanan.createIframe(iframeURL);
      expect(subject(iframe).ready()).to.not.be.fullfilled;
    });

    it("does resolve when iframe is loaded", function (done) {
      iframe = spanan.createIframe(iframeURL);
      var wrapper = subject(iframe);

      setTimeout(function () {
        expect(wrapper.ready()).to.be.fullfilled;
        done();
      }, 200);
    });
  });

  describe("#send", function () {

    it("calls postMessage with Transfer", function (done) {
      var fnName = "test",
          fnArgs = [1,2,3];

      target.postMessage = function (msg) {
        var serializedCall = new Transfer(fnName, fnArgs);
        expect(msg).to.eql(serializedCall.toString());
        done();
      };

      subject().send(fnName, fnArgs);
    });

    it("returns promise", function () {
      expect(subject().send("test")).to.be.instanceof(Promise);
    });

    it("promise get rejected after timeout", function () {
      var wrapper = new Wrapper(target, { timeout: 0 });
      return expect(wrapper.send("test")).to.eventually.be.rejected;
    });

    context("target ready", function () {
      beforeEach(function () {
        return subject().ready();
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
