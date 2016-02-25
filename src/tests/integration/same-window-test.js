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
  });

  it("function with no return value", () => {
    spanan.export({
      test() { }
    });

    return expect(agent.test()).to.eventually.be.undefined;
  });
  context("echo function conserve data type", () => {

    beforeEach(() => {
      spanan.export({
        echo(x) { return x; }
      });
    });

    it("Boolean", () => {
      let value = true;
      return expect(agent.echo(value)).to.eventually.equal(value);
    });

    it("String", () => {
      let value = "test";
      return expect(agent.echo(value)).to.eventually.equal(value);
    });

    it("Number", () => {
      let value = 1111;
      return expect(agent.echo(value)).to.eventually.equal(value);
    });

    it("Array", () => {
      let value = [1,2,3];
      return expect(agent.echo(value)).to.eventually.deep.equal(value);
    });

    it("Object", () => {
      let value = { a: 11, b: 22 };
      return expect(agent.echo(value)).to.eventually.deep.equal(value);
    });
  });

});
