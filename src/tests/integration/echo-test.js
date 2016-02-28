/*eslint-env mocha */
/*global chai */

import _ from "../../index";

var expect = chai.expect;

describe("Integration - echo page", () => {
  let agent;

  beforeEach(() => {
    agent = spanan.import("fixtures/echo.html");
    spanan.startListening();
  });

  afterEach(() => {
    document.body.removeChild(document.querySelector("iframe.spanan"));
    spanan.stopListening();
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
