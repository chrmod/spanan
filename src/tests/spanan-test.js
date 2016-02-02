/*eslint-env mocha */
/*global chai */

import Spanan from "../spanan";
import Wrapper from "../wrapper";

var expect = chai.expect;

describe("Spanan", function () {

  beforeEach(() => {
    this.spanan = new Spanan();
  });

  afterEach(() => {
    delete this.spanan;
  });

  describe("#constructor", () => {
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

  describe("#export", () => {
    it("registers function callbacks", () => {
      const spanan = new Spanan();
      const test = () => {};
      spanan.export({ test });
      expect(spanan).to.have.deep.property("exportedFunctions.test", test);
    });
  });

  describe("#import", function () {
    var iframeURL = "./fixtures/basic.html";

    afterEach(function () {
      var iframe = spananIframe();
      if ( iframe ) {
        document.body.removeChild(iframe);
      }
    });

    function spananIframe() {
      return document.querySelector("iframe.spanan");
    }

    function subject() {
      return (new Spanan()).import(iframeURL);
    }

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
          const spanan = new Spanan();

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
          const spanan = new Spanan();
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

    context("when listening", function () {

      beforeEach(function () {
        spanan.startListening();
      });

      afterEach(function () {
        spanan.stopListening();
      });

      it("calls dispatchMessage", function (done) {
        spanan.dispatchMessage = () => done();
        window.postMessage("test", "*");
      });

    });

    context("when not listening", function () {

      it("does not puts incoming message into queue", function (done) {
        spanan.dispatchMessage = () => done(new Error("should not happen"));
        window.postMessage("test", "*");
        setTimeout(done, 200);
      });

    });
  });

  describe("#dispatchCall", () => {


    context("message matches exported function", () => {
      let testFn;

      beforeEach( () => {
        testFn = function () {};
        this.spanan.export({ test: (...args) => testFn.apply(null, args) });
      });

      it("returns true", () => {
        expect(
          this.spanan.dispatchCall({ fnName: "test" })
        ).to.be.true;
      });

      it("calls exported function with fnArgs", done => {
        const fnArgs = [1,2,3];

        testFn = (...args) => {
          expect(args).to.deep.equal(fnArgs);
          done();
        };

        this.spanan.dispatchCall({ fnName: "test", fnArgs })
      });

      it("calls sendResponse with message and valuePromise", done => {
        let message = { fnName: "test", fnArgs: [] };
        this.spanan.sendResponse = (msg, valuePromise) => {
          expect(msg).to.equal(message);
          expect(valuePromise).to.be.instanceOf(Promise);
          done();
        }
        this.spanan.dispatchCall(message);
      });
    });

    it("returns false if message did not match any exported function", () => {
      expect(
        this.spanan.dispatchCall({ fnName: "test" })
      ).to.be.false;
    });
  });

  describe("#sendResponse", () => {
    context("resolved valuePromise", () => {
      it("calls postMessage on a source with value of valuePromise", done => {
        const returnedValue = "1234";
        const valuePromise = Promise.resolve(returnedValue);
        const source = {};
        const msg = { source, transferId: 1 };
        source.postMessage = (content) => {
          let responseTransfer = JSON.parse(content);
          expect(responseTransfer).to.deep.equal({
            transferId: msg.transferId,
            response: returnedValue,
          });
          done();
        };
        this.spanan.sendResponse(msg, valuePromise);
      });
    });

    context("unresolved valuePromise", () => {
      it("does not call postMessage on a source", done => {
        const valuePromise = new Promise( (res, rej) => {} );
        const source = {};
        const msg = { source };
        let postMessageCalled = false;
        source.postMessage = () => { postMessageCalled = true };

        this.spanan.sendResponse(msg, valuePromise);

        setTimeout( () => {
          expect(postMessageCalled).to.be.false;
          done();
        }, 200);
      });
    });
  });

  describe("#dispatchMessage", () => {
    let spanan;

    beforeEach(() => {
      spanan = new Spanan();
    });

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
          data: `{ "wrapperId": ${wrapper.id} }`
        });
      });

      it("returns true", () => {
        expect(spanan.dispatchMessage({
          data: `{ "wrapperId": ${wrapper.id} }`
        })).to.equal(true);
      });

      it("returns false on message with invalid wrapperId", () => {
        expect(spanan.dispatchMessage({
          data: '{ "wrapperId": 111 }'
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
