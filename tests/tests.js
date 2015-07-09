var expect = chai.expect;

describe("spanan.import", function () {
  var iframeURL = "./fixtures/basic.html";

  afterEach(function () {
    var iframe = spananIframe();
    document.body.removeChild(iframe);
  });

  function spananIframe() {
    return document.querySelector("iframe.spanan");
  }

  function subject(options) {
    return spanan.import(iframeURL, options);
  }

  describe("creates iframe", function () {

    it("add it to DOM", function () {
      function iframeCount() {
        return document.querySelectorAll("iframe").length;
      }
      var startingIframeCount = iframeCount()
      subject();
      expect(iframeCount() - startingIframeCount).to.eql(1);
    });

    it("gives it 'spanan' class attribute", function () {
      expect(spananIframe()).to.not.be.exist;
      subject();
      expect(spananIframe()).to.be.exist;
    });

    it("gives it proper src attribute", function () {
      subject();
      expect(spananIframe().getAttribute("src")).to.eql(iframeURL);
    });

    it("gives it 'display: none' style attribute", function () {
      subject();
      expect(spananIframe().style.display).to.eql("none");
    });
  });

  describe("return proxy object", function () {
    it("has iframe as its property", function () {
      expect(subject().iframe).to.eql(spananIframe());
    });

    it("convert function calls into postMessage calls on iframe", function (done) {
      expect(1);
      var proxy = subject();
      spananIframe().contentWindow.postMessage = function () {
        done();
      };
      proxy.nonExistingMethod();
    });

    it("calls on proxy object properties return a promise", function () {
      var proxy = subject();
      expect(proxy.nonExistingMethod()).to.be.instanceof(Promise);
    });

    it("calls to undefined methods return rejected promise", function () {
      var proxy = subject({timeout: 50});
      return expect(proxy.nonexistingmethod()).to.eventually.be.rejected;
    });

    it("calls to 'echo' methods return promise resolved to passed value", function () {
      var proxy = subject();
      return expect(proxy.echo("test")).to.eventually.equal("test");
    });
  });

});
