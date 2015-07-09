var expect = chai.expect;

describe("SpananProtocol", function () {
  it("constructs from methodName and methodArgs", function () {
    var methodCall = new SpananProtocol("test", [1,2,3]);
    expect(methodCall.methodName).to.equal("test");
    expect(methodCall.methodArgs).to.eql(["1","2","3"]);
  });

  it("constructs from serialized string", function () {
    var methodCall = new SpananProtocol("test:1:2:3");
    expect(methodCall.methodName).to.equal("test");
    expect(methodCall.methodArgs).to.eql(["1","2","3"]);
  });

  it("constructs with methodArgs being function arguments", function () {
    (function () {
      var methodCall = new SpananProtocol("test", arguments);
      expect(methodCall.methodName).to.equal("test");
      expect(methodCall.methodArgs).to.eql(["1","2","3"]);
    })(1,2,3);
  });

  describe("#toString", function () {
    it("serializes method call", function () {
      var methodCall = new SpananProtocol("test", [1,2,3])
      expect(methodCall.toString()).to.equal("test:1:2:3");
    });
  });

  describe("#argsToString", function () {
    it("serializes method call", function () {
      var methodCall = new SpananProtocol("test", [1,2,3])
      expect(methodCall.argsToString()).to.equal("1:2:3");
    });
  });
});

describe("spanan.createIframe", function () {
  var iframeURL = "./fixtures/basic.html";

  afterEach(function () {
    var iframe = spananIframe();
    document.body.removeChild(iframe);
  });

  function spananIframe() {
    return document.querySelector("iframe.spanan");
  }

  function subject() {
    return spanan.createIframe(iframeURL);
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
      expect(subject().getAttribute("src")).to.eql(iframeURL);
    });

    it("gives it 'display: none' style attribute", function () {
      expect(subject().style.display).to.eql("none");
    });
  });

});

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
