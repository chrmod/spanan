/*eslint-env mocha */
/*global chai */

import Spanan from "../../facade";

var expect = chai.expect;

describe("Integration - echo page", () => {
  let spanan;
  let agent;

  before(function () {
    spanan = new Spanan();
  });

  beforeEach(() => {
    agent = spanan.import("fixtures/echo.html").createProxy();
  });

  afterEach(() => {
    document.body.removeChild(document.querySelector("iframe.spanan"));
    spanan.stopListening();
  });

  afterEach(() => {
    spanan.stopListening();
  });

  after(function () {
    spanan.destroy();
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
