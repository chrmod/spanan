/*eslint-env mocha */
/*global chai */

import Spanan from "../spanan";
import Wrapper from "../wrapper";

var expect = chai.expect;

describe("Spanan", function () {

  describe("#constructor", () => {
    it("sets empty array of pendingMessages", () => {
      const spanan = new Spanan();
      expect(spanan).to.have.property("pendingMessages").that.deep.equals([]);
    });

    it("sets empty wrappers dict", () => {
      const spanan = new Spanan();
      expect(spanan).to.have.property("wrappers").that.deep.equal(new Map());
    });
  });

  describe("#registerWrapper", () => {
    it("puts wrapper on wrappers dict", () => {
      const spanan = new Spanan();
      const wrapper = new Wrapper();
      spanan.registerWrapper(wrapper);
      expect(spanan.wrappers.get(wrapper.id)).to.equal(wrapper);
    });
  });

  describe(".createIframe", function () {
    var iframeURL = "./fixtures/basic.html";

    afterEach(function () {
      var iframe = spananIframe();
      document.body.removeChild(iframe);
    });

    function spananIframe() {
      return document.querySelector("iframe.spanan");
    }

    function subject() {
      return Spanan.createIframe(iframeURL);
    }

    describe("creates iframe", function () {
      it("add it to DOM", function () {
        function iframeCount() {
          return document.querySelectorAll("iframe").length;
        }
        var startingIframeCount = iframeCount();
        subject();
        expect(iframeCount() - startingIframeCount).to.eql(1);
      });

      it("gives it 'spanan' class attribute", function () {
        expect(spananIframe()).to.not.be.exist;
        subject();
        expect(spananIframe()).to.be.exist;
      });

      it("gives it proper src attribute", function () {
        expect(subject().getAttribute("src")).to.eql(iframeURL);
      });

      it("gives it 'display: none' style attribute", function () {
        expect(subject().style.display).to.eql("none");
      });
    });

  });

  describe("#import", function () {
    var iframeURL = "./fixtures/basic.html";

    afterEach(function () {
      var iframe = spananIframe();
      document.body.removeChild(iframe);
    });

    function spananIframe() {
      return document.querySelector("iframe.spanan");
    }

    function subject() {
      return (new Spanan()).import(iframeURL);
    }

    it("calls #registerWrapper with a Wrapper object", done => {
      const spanan = new Spanan();
      spanan.registerWrapper = wrapper => {
        expect(wrapper).to.be.instanceOf(Wrapper);
        done();
      }
      spanan.import(iframeURL);
    });

    describe("return proxy object", function () {
      it("inherits from Wrapper", function () {
        var proxy = subject();
        expect(proxy).to.be.instanceOf(Wrapper);
      });

      it("has iframe contentWindow as its 'target' property", function () {
        expect(subject().target).to.eql(spananIframe().contentWindow);
      });

      it("calls on proxy object properties return a promise", function () {
        var proxy = subject();
        expect(proxy.nonExistingMethod()).to.be.instanceof(Promise);
      });

      it("calls to undefined methods return rejected promise", function () {
        var proxy = subject();
        return expect(proxy.nonexistingmethod()).to.eventually.be.rejected;
      });

      context("iframe loaded", function () {
        var proxy;

        beforeEach(function () {
          proxy = subject();
          proxy.ready = Promise.resolve;
        });

        it("convert function calls into postMessage calls on iframe", function (done) {
          spananIframe().contentWindow.postMessage = function () {
            done();
          };
          proxy.nonExistingMethod();
        });

        it("calls to 'echo' methods return promise resolved to passed value", function (done) {
          var promise = proxy.echo("test");

          promise.then(function (response) {
            expect(response).to.equal("test");
            done();
          });

          setTimeout(function () {
            proxy._callbacks[promise.transferId]("test");
          }, 250);
        });
      });
    });

  });

  describe("incoming messages", function () {
    var spanan;

    beforeEach(() => {
      spanan = new Spanan();
    });

    afterEach(function () {
      spanan.pendingMessages = [];
    });

    it("starts with empty pendingMessages list", function () {
      expect(spanan.pendingMessages).to.have.length(0);
    });

    context("when listening", function () {
      beforeEach(function () {
        spanan.startListening();
      });

      afterEach(function () {
        spanan.stopListening();
      });

      it("puts incoming message into queue", function (done) {
        window.postMessage("test", "*");
        setTimeout(function () {
          expect(spanan.pendingMessages).to.have.length(1);
          done();
        }, 200);
      });
    });

    context("when not listening", function () {
      it("does not puts incoming message into queue", function (done) {
        window.postMessage("test", "*");
        setTimeout(function () {
          expect(spanan.pendingMessages).to.have.length(0);
          done();
        }, 200);
      });
    });
  });
});
