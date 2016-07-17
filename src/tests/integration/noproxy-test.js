/*eslint-env mocha */
/*global chai */

import Spanan from "../../facade";

var expect = chai.expect;

describe("Integration - noproxy", function () {
  let spanan;
  let agent;

  before(function () {
    spanan = new Spanan();
  });

  beforeEach(function () {
    agent = spanan.import("fixtures/echo.html");
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

  it("Boolean", function () {
    let value = true;
    return expect(agent.send("echo", value)).to.eventually.equal(value);
  });

  it("String", function () {
    let value = "test";
    return expect(agent.send("echo", value)).to.eventually.equal(value);
  });

  it("Number", function () {
    let value = 1111;
    return expect(agent.send("echo", value)).to.eventually.equal(value);
  });

  it("Array", function () {
    let value = [1,2,3];
    return expect(agent.send("echo", value)).to.eventually.deep.equal(value);
  });

  it("Object", function () {
    let value = { a: 11, b: 22 };
    return expect(agent.send("echo", value)).to.eventually.deep.equal(value);
  });

});
