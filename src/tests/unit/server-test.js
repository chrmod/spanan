/*eslint-env mocha */
/*global chai */

import Server from "../../server";
import Wrapper from "../../wrapper";
import { RequestTransfer } from "../../transfer";

var expect = chai.expect;

describe("Server", function () {
  let server,
      ctx = {
        addEventListener() {},
        removeEventListener() {},
      };

  beforeEach(function () {
    server = new Server(ctx);
  });

  describe("#constructor", () => {
    it("sets empty wrappers dict", () => {
      expect(server).to.have.property("wrappers").that.deep.equal(new Map());
    });

    it("set isListening flag to false", function () {
      expect(server).to.have.property("isListening").to.be.false;
    });

    it("accepts config objects and sets it as own property", function () {
      let config = { meta: { test: true } };
      expect(new Server(ctx, config)).to.have.property("config", config);
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
        server.startListening()
        expect(server).to.have.property("isListening").that.is.true;
      });

      it("call addEventListener on window", function (done) {
        ctx.addEventListener = function () {
          done();
        }
        server.startListening()
      });
    });

    context("listening", function () {
      beforeEach(function () {
        server.isListening = true;
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
        server.startListening()
      });
    });
  });

  describe("#registerWrapper", function () {
    it("puts wrapper on wrappers dict", function () {
      const wrapper = new Wrapper();
      server.registerWrapper(wrapper);
      expect(server.wrappers.get(wrapper.id)).to.equal(wrapper);
    });
  });

  describe("#dispatchMessage", function () {

    context("on spanan request", function () {
      it("calls dispatchCall", done => {
        server.dispatchCall = () => done();
        server.dispatchMessage({
          data: `{ "id": 1, "wrapperId": 2,  "fnName": "echo", "fnArgs": ["test"] }`
        });
      });

      it("pass message to dispatchCall", done => {
        let message = { id: 1, wrapperId: 2, fnName: "echo", fnArgs: [] };
        server.dispatchCall = (msg) => {
          expect(msg).to.have.property("fnName").that.deep.equal(message.fnName);
          expect(msg).to.have.property("fnArgs").that.deep.equal(message.fnArgs);
          done();
        };
        server.dispatchMessage({
          data: JSON.stringify(message)
        });
      });

      it("attaches event source to message", done => {
        let source = {};
        server.dispatchCall = (msg) => {
          expect(msg).to.have.property("source", source);
          done();
        };
        server.dispatchMessage({
          data: `{ "id": 1, "wrapperId": 2, "fnName": "echo", "fnArgs": ["test"] }`,
          source
        });
      });

      it("returns same as dispatchCall", function () {
        const data = `{ "id": 1, "wrapperId": 2, "fnName": "echo", "fnArgs": ["test"] }`;
        server.dispatchCall = () => true;
        expect( server.dispatchMessage({data}) ).to.equal(true);

        server.dispatchCall = () => false;
        expect( server.dispatchMessage({ data }) ).to.equal(false);
      });

      context("with custom config", function () {
        const config = {
          meta: {
          },
          requestProperties: {
            fnName: "action",
          }
        };

        beforeEach(function () {
          server = new Server(ctx, config);
        });

        it("dispatchesCall correctly", function (done) {
          server.dispatchCall = () => done();
          server.dispatchMessage({
            data: `{ "id": 1, "wrapperId": 2, "action": "echo", "fnArgs": ["test"] }`
          });
        });

        it("returns false on message that does not meet config spec", function () {

          expect( server.dispatchMessage({
            data: `{ "id": 1, "wrapperId": 2, "custom-fnName-param": "echo", "fnArgs": ["test"] }`
          }) ).to.equal(false);
        });
      });
    });

    context("on spanan response", function () {
      let wrapper, cb;

      beforeEach(() => {
        cb = () => {};
        wrapper = { id: 1, dispatchMessage: () => cb() };
        server.registerWrapper(wrapper);
      });

      it("passes message to it's wrapper", done => {
        cb = done;
        server.dispatchMessage({
          data: `{ "wrapperId": ${wrapper.id}, "transferId": 2 }`
        });
      });

      it("returns true", function () {
        expect(server.dispatchMessage({
          data: `{ "wrapperId": ${wrapper.id}, "transferId": 2 }`
        })).to.equal(true);
      });

      it("returns false on message with invalid wrapperId", function () {
        expect(server.dispatchMessage({
          data: '{ "wrapperId": 111, "transferId": 2 }'
        })).to.equal(false);
      });

    });

    context("on non spanan message", function () {

      it("returns false if message was not JSON", function () {
        expect(
          server.dispatchMessage({ data: 'testmessage' })
        ).to.equal(false);
      });

      it("returns false if message was non spanan JSON", function () {
        expect(
          server.dispatchMessage({ data: '{}' })
        ).to.equal(false);
      });

    });

  });

  describe("#dispatchCall", function () {

    context("message matches exported function", function () {
      let testFn;

      beforeEach( function () {
        testFn = function () {};
        server.setup({ test: (...args) => testFn.apply(null, args) });
      });

      it("returns true", function () {
        expect(
          server.dispatchCall({ fnName: "test" })
        ).to.be.true;
      });

      it("calls exported function with fnArgs", function (done) {
        const fnArgs = [1,2,3];

        testFn = (...args) => {
          expect(args).to.deep.equal(fnArgs);
          done();
        };

        server.dispatchCall({ fnName: "test", fnArgs })
      });

      it("calls sendResponse with message and valuePromise", function (done) {
        let message = { fnName: "test", fnArgs: [] };
        server.sendResponse = (msg, valuePromise) => {
          expect(msg).to.equal(message);
          expect(valuePromise).to.be.instanceOf(Promise);
          done();
        }
        server.dispatchCall(message);
      });
    });

    it("returns false if message did not match any exported function", function () {
      expect(
        server.dispatchCall({ fnName: "test" })
      ).to.be.false;
    });
  });

  describe("#sendResponse", function () {
    context("resolved valuePromise", function () {
      it("calls postMessage on a source with value of valuePromise", function (done) {
        const returnedValue = "1234";
        const valuePromise = Promise.resolve(returnedValue);
        const source = {};
        const msg = { source, id: 1, wrapperId: 2 };
        source.postMessage = (content) => {
          let responseTransfer = JSON.parse(content);
          try {
            expect(responseTransfer)
              .to.have.property('transferId').equal(msg.id);
            expect(responseTransfer)
              .to.have.property('response').equal(returnedValue);
            expect(responseTransfer)
              .to.have.property('wrapperId').equal(msg.wrapperId);
            done();
          } catch(e) {
            done(e);
          }
        };
        server.sendResponse(msg, valuePromise);
      });
    });

    context("unresolved valuePromise", function () {
      it("does not call postMessage on a source", function (done) {
        const valuePromise = new Promise( (res, rej) => {} );
        const source = {};
        const msg = { source };
        let postMessageCalled = false;
        source.postMessage = () => { postMessageCalled = true };

        server.sendResponse(msg, valuePromise);

        setTimeout( () => {
          expect(postMessageCalled).to.be.false;
          done();
        }, 200);
      });
    });
  });
});
