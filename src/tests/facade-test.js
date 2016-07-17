/*eslint-env mocha */
/*global chai */

import Spanan from "../facade";
import Wrapper from "../wrapper";

var expect = chai.expect;

describe("Facade", function () {
  let ctx = {
    addEventListener() {},
    removeEventListener() {},
  };
  let spanan;

  beforeEach(() => {
    spanan = new Spanan(ctx);
  });

  afterEach(() => {
    spanan.destroy();
  });

  describe("#constructor", () => {
    it("sets itself as property of passed context", function () {
      expect(ctx).to.have.property("spanan").that.equal(spanan);
    });

    it("throws error is spanan is already loaded onto context", function () {
      ctx.spanan = {};
      expect(function () {
        new Spanan(ctx);
      }).to.throw("spanan already loaded");
    });
  });

  describe("#destroy", function () {

    beforeEach(function () {
      // removes previous instance
      spanan.destroy();
      spanan = new Spanan(ctx);
    });

    it("deletes spanan from its context", function () {
      spanan.destroy();
      expect(ctx).to.not.have.property("spanan");
    });

    it("call #stopListening on server", function (done) {
      let stopListening = spanan.server.stopListening;
      spanan.server.stopListening = function () {
        done();
        spanan.server.stopListening = stopListening
      };
      spanan.destroy();
    });
  });


  describe(".createIframe", function () {
    var iframeURL = "non-existing-page.html";

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


  describe("#export", () => {

    it("registers function callbacks", () => {
      const test = () => {};
      spanan.export({ test });
      expect(spanan.server).to.have.deep.property("exportedFunctions.test", test);
    });

    it("calls #startListening", function (done) {
      spanan.server.startListening = function () { done(); };
      spanan.export({});
    });
  });

  describe("#import", function () {
    var iframeURL = "non-existing-page.html";

    afterEach(function () {
      var iframe = spananIframe();
      if ( iframe ) {
        document.body.removeChild(iframe);
      }
    });

    function spananIframe() {
      return document.querySelector("iframe.spanan");
    }

    it("calls #startListening", function (done) {
      spanan.server.startListening = function () { done(); };
      spanan.import();
    });

    it("calls #registerWrapper with a Wrapper object", done => {
      spanan.server.registerWrapper = wrapper => {
        expect(wrapper).to.be.instanceOf(Wrapper);
        done();
      }
      spanan.import(iframeURL);
    });

    context("accepts argument of different types", () => {
      let createIframe;

      beforeEach(() => {
        createIframe = Spanan.createIframe;
      });

      afterEach(() => {
        Spanan.createIframe = createIframe;
      });

      context("called with URL", () => {

        it("creates iframe with Spanan.createIframe", done => {
          const url = "test.url";

          Spanan.createIframe = (iframeUrl) => {
            expect(iframeUrl).to.equal(url);
            done();
          };

          spanan.import(url);
        });

      });

      context("called with postMessage enable object", () => {

        it("doesn't call Spanan.createIframe", done => {
          const obj = {
            postMessage() {}
          };
          let called = false;

          Spanan.createIframe = () => {
            called = true;
          };

          spanan.import(obj);

          setTimeout(() => {
            expect(called).to.equal(false);
            done();
          }, 200);
        });

      });

    });

    describe("return Wrapper", function () {
      var subject;

      beforeEach(function () {
        subject = spanan.import(iframeURL);
      });

      it("inherits from Wrapper", function () {
        expect(subject).to.be.instanceOf(Wrapper);
      });

      it("has iframe contentWindow as its 'target' property", function () {
        expect(subject).to.have.property("target")
                       .that.eql(spananIframe().contentWindow);
      });
    });
  });
});
