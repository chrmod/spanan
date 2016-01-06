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

describe("SpananWrapper", function () {
  var target;

  beforeEach(function () {
    target = {};
  });

  function subject(otherTarget) {
    return new spanan.SpananWrapper(otherTarget || target);
  }

  describe("constructor", function () {
    it("sets `target` as property", function () {
      expect(subject().target).to.eql(target);
    });

    it("sets contentWindow as a target if provided with iframe", function () {
      var iframe = spanan.createIframe();
      expect(subject(iframe).target).to.eql(iframe.contentWindow);

      // cleanup
      document.body.removeChild(iframe);
    });
  });

  describe("#isReady", function () {
    var iframeURL = "./fixtures/basic.html",
        iframe;

    afterEach(function () {
      document.body.removeChild(iframe);
    });

    it("is false if iframe is not loaded", function () {
      iframe = spanan.createIframe(iframeURL);
      expect(subject(iframe).isReady).to.eql(false);
    });

    it("is true if iframe is loaded", function (done) {
      iframe = spanan.createIframe(iframeURL);
      var wrapper = subject(iframe);

      setTimeout(function () {
        expect(wrapper.isReady).to.eql(true);
        done();
      }, 200);
    });
  });

  describe("#send", function () {
    it("calls 'postMessage' on target", function (done) {
      target.postMessage = function () {
        done();
      };
      subject().send('test');
    });

    it("calls postMessage with SpananProtocol", function (done) {
      var fnName = "test",
          fnArgs = [1,2,3];

      target.postMessage = function (msg) {
        var serializedCall = new SpananProtocol(fnName, fnArgs);
        expect(msg).to.eql(serializedCall.toString());
        done();
      };

      subject().send(fnName, fnArgs);
    });

    it("calls postMessage with wildcard as targetOrigin", function (done) {
      target.postMessage = function (msg, targetOrigin) {
        if ( targetOrigin === "*" ) {
          done();
        }
      };
      subject().send('test');
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
    it("inherits from SpananWrapper", function () {
      var proxy = subject();
      expect(proxy).to.be.instanceOf(spanan.SpananWrapper);
    });

    it("has iframe contentWindow as its 'target' property", function () {
      expect(subject().target).to.eql(spananIframe().contentWindow);
    });

    it("convert function calls into postMessage calls on iframe", function (done) {
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
