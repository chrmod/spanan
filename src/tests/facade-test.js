/*eslint-env mocha */
/*global chai */

import Spanan from "../facade";
import Wrapper from "../wrapper";

var expect = chai.expect;

describe("Spanan", function () {
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
    it("sets empty wrappers dict", () => {
      expect(spanan).to.have.property("wrappers").that.deep.equal(new Map());
    });

    it("set isListening flag to false", function () {
      expect(spanan).to.have.property("isListening").to.be.false;
    });

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

    it("call #stopListening", function (done) {
      let stopListening = spanan.stopListening;
      spanan.stopListening = function () {
        done();
        spanan.stopListening = stopListening
      };
      spanan.destroy();
    });
  });

  describe("#registerWrapper", () => {
    it("puts wrapper on wrappers dict", () => {
      const wrapper = new Wrapper();
      spanan.registerWrapper(wrapper);
      expect(spanan.wrappers.get(wrapper.id)).to.equal(wrapper);
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

  describe("#startListening", function () {
    let addEventListener;

    beforeEach(function () {
      addEventListener = ctx.addEventListener;
      ctx.addEventListener = function () {};
    });

    afterEach(function () {
      ctx.addEventListener = addEventListener;
    });

    context("not listening", function () {
      it("sets isListening to true", function () {
        spanan.startListening()
        expect(spanan).to.have.property("isListening").that.is.true;
      });

      it("call addEventListener on window", function (done) {
        ctx.addEventListener = function () {
          done();
        }
        spanan.startListening()
      });
    });

    context("listening", function () {
      beforeEach(function () {
        spanan.isListening = true;
      });

      it("doesn't call addEventListener on window", function (done) {
        let called = false;
        ctx.addEventListener = function () {
          called = true;
        }
        setTimeout(function () {
          if (!called) {
            done();
          }
        }, 100);
        spanan.startListening()
      });
    });
  });

  describe("#export", () => {

    it("registers function callbacks", () => {
      const test = () => {};
      spanan.export({ test });
      expect(spanan).to.have.deep.property("exportedFunctions.test", test);
    });

    it("calls #startListening", function (done) {
      spanan.startListening = function () { done(); };
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
      spanan.startListening = function () { done(); };
      spanan.import();
    });

    it("calls #registerWrapper with a Wrapper object", done => {
      spanan.registerWrapper = wrapper => {
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

  describe("#dispatchCall", () => {

    context("message matches exported function", () => {
      let testFn;

      beforeEach( () => {
        testFn = function () {};
        spanan.export({ test: (...args) => testFn.apply(null, args) });
      });

      it("returns true", () => {
        expect(
          spanan.dispatchCall({ fnName: "test" })
        ).to.be.true;
      });

      it("calls exported function with fnArgs", done => {
        const fnArgs = [1,2,3];

        testFn = (...args) => {
          expect(args).to.deep.equal(fnArgs);
          done();
        };

        spanan.dispatchCall({ fnName: "test", fnArgs })
      });

      it("calls sendResponse with message and valuePromise", done => {
        let message = { fnName: "test", fnArgs: [] };
        spanan.sendResponse = (msg, valuePromise) => {
          expect(msg).to.equal(message);
          expect(valuePromise).to.be.instanceOf(Promise);
          done();
        }
        spanan.dispatchCall(message);
      });
    });

    it("returns false if message did not match any exported function", () => {
      expect(
        spanan.dispatchCall({ fnName: "test" })
      ).to.be.false;
    });
  });

  describe("#sendResponse", () => {
    context("resolved valuePromise", () => {
      it("calls postMessage on a source with value of valuePromise", done => {
        const returnedValue = "1234";
        const valuePromise = Promise.resolve(returnedValue);
        const source = {};
        const msg = { source, id: 1, wrapperId: 2 };
        source.postMessage = (content) => {
          let responseTransfer = JSON.parse(content);
          expect(responseTransfer).to.deep.equal({
            transferId: msg.id,
            response: returnedValue,
            wrapperId: msg.wrapperId
          });
          done();
        };
        spanan.sendResponse(msg, valuePromise);
      });
    });

    context("unresolved valuePromise", () => {
      it("does not call postMessage on a source", done => {
        const valuePromise = new Promise( (res, rej) => {} );
        const source = {};
        const msg = { source };
        let postMessageCalled = false;
        source.postMessage = () => { postMessageCalled = true };

        spanan.sendResponse(msg, valuePromise);

        setTimeout( () => {
          expect(postMessageCalled).to.be.false;
          done();
        }, 200);
      });
    });
  });

  describe("#dispatchMessage", () => {

    context("on init message", () => {
      it("calls activate on wrapper", done => {
        let wrapper = {
          id: "1",
          activate: () => done(),
        };
        spanan.wrappers.set(wrapper.id, wrapper);
        spanan.dispatchMessage({ data: `spanan?${wrapper.id}` });
      });
    });

    context("on spanan request", () => {
      it("calls dispatchCall", done => {
        spanan.dispatchCall = () => done();
        spanan.dispatchMessage({
          data: `{ "fnName": "echo", "fnArgs": ["test"] }`
        });
      });

      it("pass message to dispatchCall", done => {
        let message = { fnName: "echo", fnArgs: [] };
        spanan.dispatchCall = (msg) => {
          expect(msg).to.have.property("fnName").that.deep.equal(message.fnName);
          expect(msg).to.have.property("fnArgs").that.deep.equal(message.fnArgs);
          done();
        };
        spanan.dispatchMessage({
          data: JSON.stringify(message)
        });
      });

      it("attaches event source to message", done => {
        let source = {};
        spanan.dispatchCall = (msg) => {
          expect(msg).to.have.property("source", source);
          done();
        };
        spanan.dispatchMessage({
          data: `{ "fnName": "echo", "fnArgs": ["test"] }`,
          source
        });
      });

      it("returns same as dispatchCall", () => {
        spanan.dispatchCall = () => true;
        expect( spanan.dispatchMessage({
          data: `{ "fnName": "echo", "fnArgs": ["test"] }`
        }) ).to.equal(true);

        spanan.dispatchCall = () => false;
        expect( spanan.dispatchMessage({
          data: `{ "fnName": "echo", "fnArgs": ["test"] }`
        }) ).to.equal(false);
      });
    });

    context("on spanan response", () => {
      let wrapper, cb;

      beforeEach(() => {
        cb = () => {};
        wrapper = { id: 1, dispatchMessage: () => cb() };
        spanan.registerWrapper(wrapper);
      });

      it("passes message to it's wrapper", done => {
        cb = done;
        spanan.dispatchMessage({
          data: `{ "wrapperId": ${wrapper.id}, "transferId": 2 }`
        });
      });

      it("returns true", () => {
        expect(spanan.dispatchMessage({
          data: `{ "wrapperId": ${wrapper.id}, "transferId": 2 }`
        })).to.equal(true);
      });

      it("returns false on message with invalid wrapperId", () => {
        expect(spanan.dispatchMessage({
          data: '{ "wrapperId": 111, "transferId": 2 }'
        })).to.equal(false);
      });

    });

    context("on non spanan message", () => {

      it("returns false if message was not JSON", () => {
        expect(
          spanan.dispatchMessage({ data: 'testmessage' })
        ).to.equal(false);
      });

      it("returns false if message was non spanan JSON", () => {
        expect(
          spanan.dispatchMessage({ data: '{}' })
        ).to.equal(false);
      });

    });

  });
});
