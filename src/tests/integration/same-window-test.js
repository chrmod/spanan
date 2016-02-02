/*eslint-env mocha */
/*global chai */

import _ from "../../index";

var expect = chai.expect;

describe("Integration - same window", () => {
  let agent;

  beforeEach(() => {
    agent = spanan.import(window);
    spanan.startListening();
  });

  afterEach(() => {
    spanan.stopListening();
    document.body.removeChild(agent.target);
  });

  it("function with no return value", () => {
    spanan.export({
      test() {}
    });

    return expect(agent.test()).to.eventually.be.undefined;
  });
/*
  context("echo function", () => {

    beforeEach(() => {
      spanan.export({
        echo(x) { return x; }
      });
    });

    it("String", () => {
      let value = "test";
      return expect(agent.echo(value)).to.eventually.equal(value);
    });

    it("Number", () => {
      let value = 1111;
      return expect(agent.echo(value)).to.eventually.equal(value);
    });
  });
  */

});
