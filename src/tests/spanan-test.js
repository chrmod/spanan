import spanan from '../spanan';
import Transfer from '../transfer';

var expect = chai.expect;

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
    target = {
      postMessage: function () {}
    };
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

  describe("#ready", function () {
    var iframeURL = "./fixtures/basic.html",
        iframe;

    afterEach(function () {
      if ( iframe ) {
        document.body.removeChild(iframe);
      }
    });

    it("returns promise", function () {
      expect(subject().ready()).to.be.instanceof(Promise);
    });

    it("does not resolve if iframe is not loaded", function () {
      iframe = spanan.createIframe(iframeURL);
      expect(subject(iframe).ready()).to.not.be.fullfilled;
    });

    it("does resolve when iframe is loaded", function (done) {
      iframe = spanan.createIframe(iframeURL);
      var wrapper = subject(iframe);

      setTimeout(function () {
        expect(wrapper.ready()).to.be.fullfilled;
        done();
      }, 200);
    });
  });

  describe("#send", function () {

    it("calls postMessage with Transfer", function (done) {
      var fnName = "test",
          fnArgs = [1,2,3];

      target.postMessage = function (msg) {
        var serializedCall = new Transfer(fnName, fnArgs);
        expect(msg).to.eql(serializedCall.toString());
        done();
      };

      subject().send(fnName, fnArgs);
    });

    it("returns promise", function () {
      expect(subject().send('test')).to.be.instanceof(Promise);
    });

    context("target ready", function () {
      it("calls 'postMessage' on target", function (done) {
        target.postMessage = function () {
          done();
        };
        subject().send('test');
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

    context("target not ready", function () {
      it("does not call 'postMessage' on target", function () {
        var called = false;

        target.postMessage = function () {
          called = true;
        };

        subject().send('test');

        expect(called).to.eql(false);
      });
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

    it("calls on proxy object properties return a promise", function () {
      var proxy = subject();
      expect(proxy.nonExistingMethod()).to.be.instanceof(Promise);
    });

    it("calls to undefined methods return rejected promise", function () {
      var proxy = subject({timeout: 50});
      return expect(proxy.nonexistingmethod()).to.eventually.be.rejected;
    });

    context("iframe loaded", function () {
      var proxy;

      beforeEach(function () {
        proxy = subject();
        return proxy.ready();
      });

      it("convert function calls into postMessage calls on iframe", function (done) {
        spananIframe().contentWindow.postMessage = function () {
          done();
        };
        proxy.nonExistingMethod();
      });

      it("calls to 'echo' methods return promise resolved to passed value", function () {
        return expect(proxy.echo("test")).to.eventually.equal("test");
      });
    });
  });

});

describe("spanan - incoming messages", function () {
  afterEach(function () {
    spanan.pendingMessages = [];
  });

  it("starts with empty pendingMessages list", function () {
    expect(spanan.pendingMessages).to.have.length(0);
  });

  context("when listening", function () {
    beforeEach(function () {
      spanan.startListening();
    });

    afterEach(function () {
      spanan.stopListening();
    });

    it("puts incoming message into queue", function (done) {
      window.postMessage("test", "*");
      setTimeout(function () {
        expect(spanan.pendingMessages).to.have.length(1);
        done();
      }, 200);
    });
  });

  context("when not listening", function () {
    it("does not puts incoming message into queue", function (done) {
      window.postMessage("test", "*");
      setTimeout(function () {
        expect(spanan.pendingMessages).to.have.length(0);
        done();
      }, 200);
    });
  });
});
