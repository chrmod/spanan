/*eslint-env mocha */
/*global chai */

import Spanan from "../../facade";

var expect = chai.expect;

describe("Integration - custom transfer", function () {
  let spanan;
  let agent;
  let url = "fixtures/echo.html?config=";
  url += encodeURIComponent(JSON.stringify({
    meta: {
      target: "test"
    }
  }));

  before(function () {
    spanan = new Spanan();
  });


  afterEach(function () {
    document.body.removeChild(document.querySelector("iframe.spanan"));
    spanan.server.stopListening();
    agent.loadingPromise.stop();
  });

  after(function () {
    spanan.destroy();
  });

  context("export and import meta matches", function () {

    beforeEach(function (done) {
      agent = spanan.import(url, {
        meta: {
          target: "test"
        }
      }).createProxy();
      agent.iframe.addEventListener("load", function () {
        done();
      });
    });

    it("echos data", function () {
      let value = {a: 1};
      return expect(agent.echo(value)).to.eventually.deep.equal(value);
    });

    it("iframe executes exported function on valid request", function (done) {
      agent.echo('hello');

      setTimeout(function () {
        try {
          const div = agent.iframe.contentDocument.querySelector("#test");
          expect(div.innerHTML).to.equal("hello");
        } catch (e) {
          done(e);
          return;
        }
        done();
      }, 200);
    });
  });

  context("export and import meta are different", function () {

    beforeEach(function (done) {
      agent = spanan.import(url, {
        meta: {
          target: "wrong-target"
        }
      }).createProxy();
      agent.iframe.addEventListener("load", function () {
        done();
      });
    });

    it("rejects the call", function () {
      return expect(agent.echo("test")).to.eventually.be.rejected;
    });
  });

});
