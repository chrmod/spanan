import Wrapper from '../wrapper';
import Transfer from '../transfer';
import spanan from '../spanan';

var expect = chai.expect;

describe("Wrapper", function () {
  var target;

  beforeEach(function () {
    target = {
      postMessage: function () {}
    };
  });

  function subject(otherTarget) {
    return new Wrapper(otherTarget || target);
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
      expect(subject().send('test')).to.be.instanceof(Promise);
    });

    context("target ready", function () {
      it("calls 'postMessage' on target", function (done) {
        target.postMessage = function () {
          done();
        };
        subject().send('test');
      });

      it("calls postMessage with wildcard as targetOrigin", function (done) {
        target.postMessage = function (msg, targetOrigin) {
          if ( targetOrigin === "*" ) {
            done();
          }
        };
        subject().send('test');
      });
    });

    context("target not ready", function () {
      it("does not call 'postMessage' on target", function () {
        var called = false;

        target.postMessage = function () {
          called = true;
        };

        subject().send('test');

        expect(called).to.eql(false);
      });
    });
  });
});
