(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _spanan = require("./spanan");

var _spanan2 = _interopRequireDefault(_spanan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.spanan = new _spanan2.default();

},{"./spanan":2}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _wrapper = require("./wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Spanan = function () {
  function Spanan() {
    _classCallCheck(this, Spanan);

    this.exportedFunctions = Object.create(null);
    this.wrappers = new Map();
    this.messageListener = this.messageListener.bind(this);
  }

  _createClass(Spanan, [{
    key: "registerWrapper",
    value: function registerWrapper(wrapper) {
      this.wrappers.set(wrapper.id, wrapper);
    }
  }, {
    key: "dispatchMessage",
    value: function dispatchMessage(ev) {
      var msg = undefined;

      if (typeof ev.data === "string" && ev.data.indexOf("spanan?") === 0) {
        var wrapperId = ev.data.split("?")[1];
        this.wrappers.get(wrapperId).activate();
        return;
      }

      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return false;
      }

      var isResponse = Boolean(msg.wrapperId);

      if (isResponse) {
        var wrapper = this.wrappers.get(msg.wrapperId);

        if (wrapper) {
          wrapper.dispatchMessage(msg);
          return true;
        } else {
          return false;
        }
      } else if (msg.fnName && msg.fnArgs) {
        msg.source = ev.source;
        return this.dispatchCall(msg);
      } else {
        return false;
      }
    }
  }, {
    key: "dispatchCall",
    value: function dispatchCall(msg) {
      var exportedFunction = this.exportedFunctions[msg.fnName];

      if (!exportedFunction) {
        return false;
      }

      var value = exportedFunction.apply(null, msg.fnArgs);

      var valuePromise = value && value.then ? value : Promise.resolve(value);

      this.sendResponse(msg, valuePromise);

      return true;
    }
  }, {
    key: "sendResponse",
    value: function sendResponse(msg, valuePromise) {
      var responseTransfer = {
        transferId: msg.transferId
      };

      valuePromise.then(function (value) {
        responseTransfer.response = value;

        var response = JSON.stringify(responseTransfer);

        msg.source.postMessage(response);
      });
    }
  }, {
    key: "messageListener",
    value: function messageListener(ev) {
      this.dispatchMessage(ev);
    }
  }, {
    key: "startListening",
    value: function startListening() {
      window.addEventListener("message", this.messageListener);
    }
  }, {
    key: "stopListening",
    value: function stopListening() {
      window.removeEventListener("message", this.messageListener);
    }
  }, {
    key: "export",
    value: function _export(functions) {
      this.exportedFunctions = functions;
    }
  }, {
    key: "import",
    value: function _import(target) {
      if (typeof target === "string") {
        target = Spanan.createIframe(target);
      }

      var wrapper = new _wrapper2.default(target);

      this.registerWrapper(wrapper);

      var handler = {
        get: function get(target, name) {
          return name in target ? target[name] : this.send(name);
        },
        send: function send(name) {
          return function () {
            return wrapper.send(name, arguments);
          };
        }
      };

      return new Proxy(wrapper, handler);
    }
  }], [{
    key: "createIframe",
    value: function createIframe(url) {
      var iframe = document.createElement("iframe");

      iframe.src = url;
      iframe.className = "spanan";
      iframe.style.display = "none";

      document.body.appendChild(iframe);

      return iframe;
    }
  }]);

  return Spanan;
}();

exports.default = Spanan;

},{"./wrapper":5}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uuid = require("./uuid");

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transfer = function () {
  function Transfer(methodName) {
    var methodArgs = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, Transfer);

    if (methodName.indexOf(":") > -1) {
      var _methodName$split = methodName.split(":");

      var _methodName$split2 = _toArray(_methodName$split);

      this.methodName = _methodName$split2[0];
      this.methodArgs = _methodName$split2.slice(1);
    } else {
      this.methodName = methodName;
      this.methodArgs = Array.prototype.map.call(methodArgs, String);
    }
    this.id = (0, _uuid2.default)();
  }

  _createClass(Transfer, [{
    key: "toString",
    value: function toString() {
      return [this.methodName].concat(_toConsumableArray(this.methodArgs)).join(":");
    }
  }, {
    key: "argsToString",
    value: function argsToString() {
      return this.methodArgs.join(":");
    }
  }]);

  return Transfer;
}();

exports.default = Transfer;

},{"./uuid":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // copied from http://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transfer = require("./transfer");

var _transfer2 = _interopRequireDefault(_transfer);

var _uuid = require("./uuid");

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var loadingPromises = new WeakMap();

var _class = function () {
  function _class(target) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, _class);

    this._isLoaded = false;
    this._callbacks = Object.create(null);
    this.timeout = options.timeout || 1000;
    this.id = (0, _uuid2.default)();

    if (target instanceof HTMLElement && target.nodeName === "IFRAME") {
      this.iframe = target;
      this.target = target.contentWindow;
    } else {
      this.target = target;
    }
  }

  _createClass(_class, [{
    key: "send",
    value: function send(fnName, fnArgs) {
      var _this = this;

      var transfer = new _transfer2.default(fnName, fnArgs),
          promise;

      promise = new Promise(function (resolve, reject) {
        var rejectTimeout = setTimeout(reject.bind(null, "timeout"), _this.timeout);

        _this.ready().then(function () {
          _this.target.postMessage(transfer.toString(), "*");

          _this._callbacks[transfer.id] = function () {
            clearTimeout(rejectTimeout);
            resolve.apply(null, arguments);
          };
        });
      });

      promise.transferId = transfer.id;

      return promise;
    }
  }, {
    key: "dispatchMessage",
    value: function dispatchMessage(response) {
      var transferId = response.transferId;
      if (transferId in this._callbacks) {
        this._callbacks[transferId].apply();
        delete this._callbacks[transferId];
      }
    }
  }, {
    key: "activate",
    value: function activate() {
      this._callbacks[0]();
    }
  }, {
    key: "ready",
    value: function ready() {
      var _this2 = this;

      var loadingPromise = loadingPromises.get(this);

      if (!loadingPromise) {
        loadingPromise = new Promise(function (resolve) {
          var interval = undefined;
          _this2._callbacks[0] = function () {
            resolve();
            clearInterval(interval);
          };
          interval = setInterval(function () {
            _this2.target.postMessage("spanan?" + _this2.id, "*");
          }, 100);
        });

        loadingPromises.set(this, loadingPromise);
      }

      return loadingPromise;
    }
  }]);

  return _class;
}();

exports.default = _class;

},{"./transfer":3,"./uuid":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvc3BhbmFuLmpzIiwic3JjL3RyYW5zZmVyLmpzIiwic3JjL3V1aWQuanMiLCJzcmMvd3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDRUEsT0FBTyxNQUFQLEdBQWdCLHNCQUFoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0FxQjtBQUNuQixXQURtQixNQUNuQixHQUFjOzBCQURLLFFBQ0w7O0FBQ1osU0FBSyxpQkFBTCxHQUF5QixPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQXpCLENBRFk7QUFFWixTQUFLLFFBQUwsR0FBZ0IsSUFBSSxHQUFKLEVBQWhCLENBRlk7QUFHWixTQUFLLGVBQUwsR0FBdUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLENBQXZCLENBSFk7R0FBZDs7ZUFEbUI7O29DQU9ILFNBQVM7QUFDdkIsV0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixRQUFRLEVBQVIsRUFBWSxPQUE5QixFQUR1Qjs7OztvQ0FJVCxJQUFJO0FBQ2xCLFVBQUksZUFBSixDQURrQjs7QUFHbEIsVUFBSyxPQUFPLEdBQUcsSUFBSCxLQUFZLFFBQW5CLElBQStCLEdBQUcsSUFBSCxDQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsTUFBK0IsQ0FBL0IsRUFBbUM7QUFDckUsWUFBSSxZQUFZLEdBQUcsSUFBSCxDQUFRLEtBQVIsQ0FBYyxHQUFkLEVBQW1CLENBQW5CLENBQVosQ0FEaUU7QUFFckUsYUFBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixTQUFsQixFQUE2QixRQUE3QixHQUZxRTtBQUdyRSxlQUhxRTtPQUF2RTs7QUFNQSxVQUFJO0FBQ0YsY0FBTSxLQUFLLEtBQUwsQ0FBVyxHQUFHLElBQUgsQ0FBakIsQ0FERTtPQUFKLENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVixlQUFPLEtBQVAsQ0FEVTtPQUFWOztBQUlGLFVB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anMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgU3BhbmFuIGZyb20gXCIuL3NwYW5hblwiO1xuXG53aW5kb3cuc3BhbmFuID0gbmV3IFNwYW5hbigpO1xuIiwiaW1wb3J0IFdyYXBwZXIgZnJvbSBcIi4vd3JhcHBlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGFuYW4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmV4cG9ydGVkRnVuY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLndyYXBwZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMubWVzc2FnZUxpc3RlbmVyID0gdGhpcy5tZXNzYWdlTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyV3JhcHBlcih3cmFwcGVyKSB7XG4gICAgdGhpcy53cmFwcGVycy5zZXQod3JhcHBlci5pZCwgd3JhcHBlcik7XG4gIH1cblxuICBkaXNwYXRjaE1lc3NhZ2UoZXYpIHtcbiAgICBsZXQgbXNnO1xuXG4gICAgaWYgKCB0eXBlb2YgZXYuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJiBldi5kYXRhLmluZGV4T2YoXCJzcGFuYW4/XCIpID09PSAwICkge1xuICAgICAgbGV0IHdyYXBwZXJJZCA9IGV2LmRhdGEuc3BsaXQoXCI/XCIpWzFdO1xuICAgICAgdGhpcy53cmFwcGVycy5nZXQod3JhcHBlcklkKS5hY3RpdmF0ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBtc2cgPSBKU09OLnBhcnNlKGV2LmRhdGEpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgaXNSZXNwb25zZSA9IEJvb2xlYW4obXNnLndyYXBwZXJJZCk7XG5cbiAgICBpZiAoIGlzUmVzcG9uc2UgKSB7XG4gICAgICBsZXQgd3JhcHBlciA9IHRoaXMud3JhcHBlcnMuZ2V0KG1zZy53cmFwcGVySWQpO1xuXG4gICAgICBpZiAod3JhcHBlcikge1xuICAgICAgICB3cmFwcGVyLmRpc3BhdGNoTWVzc2FnZShtc2cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBtc2cuZm5OYW1lICYmIG1zZy5mbkFyZ3MgKSB7XG4gICAgICBtc2cuc291cmNlID0gZXYuc291cmNlO1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hDYWxsKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaENhbGwobXNnKSB7XG4gICAgY29uc3QgZXhwb3J0ZWRGdW5jdGlvbiA9IHRoaXMuZXhwb3J0ZWRGdW5jdGlvbnNbbXNnLmZuTmFtZV07XG5cbiAgICBpZiAoICFleHBvcnRlZEZ1bmN0aW9uICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB2YWx1ZSA9IGV4cG9ydGVkRnVuY3Rpb24uYXBwbHkobnVsbCwgbXNnLmZuQXJncyk7XG5cbiAgICBsZXQgdmFsdWVQcm9taXNlID0gKHZhbHVlICYmIHZhbHVlLnRoZW4pID8gdmFsdWUgOiBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuXG4gICAgdGhpcy5zZW5kUmVzcG9uc2UobXNnLCB2YWx1ZVByb21pc2UpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzZW5kUmVzcG9uc2UobXNnLCB2YWx1ZVByb21pc2UpIHtcbiAgICBsZXQgcmVzcG9uc2VUcmFuc2ZlciA9IHtcbiAgICAgIHRyYW5zZmVySWQ6IG1zZy50cmFuc2ZlcklkLFxuICAgIH07XG5cbiAgICB2YWx1ZVByb21pc2UudGhlbiggKHZhbHVlKSA9PiB7XG4gICAgICByZXNwb25zZVRyYW5zZmVyLnJlc3BvbnNlID0gdmFsdWU7XG5cbiAgICAgIGxldCByZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlVHJhbnNmZXIpO1xuXG4gICAgICBtc2cuc291cmNlLnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG1lc3NhZ2VMaXN0ZW5lcihldikge1xuICAgIHRoaXMuZGlzcGF0Y2hNZXNzYWdlKGV2KTtcbiAgfVxuXG4gIHN0YXJ0TGlzdGVuaW5nKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICBzdG9wTGlzdGVuaW5nKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICBleHBvcnQoZnVuY3Rpb25zKSB7XG4gICAgdGhpcy5leHBvcnRlZEZ1bmN0aW9ucyA9IGZ1bmN0aW9ucztcbiAgfVxuXG4gIGltcG9ydCh0YXJnZXQpIHtcbiAgICBpZiAoIHR5cGVvZiB0YXJnZXQgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICB0YXJnZXQgPSBTcGFuYW4uY3JlYXRlSWZyYW1lKHRhcmdldCk7XG4gICAgfVxuXG4gICAgY29uc3Qgd3JhcHBlciA9IG5ldyBXcmFwcGVyKHRhcmdldCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyV3JhcHBlcih3cmFwcGVyKTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICBnZXQodGFyZ2V0LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuYW1lIGluIHRhcmdldCA/XG4gICAgICAgICAgdGFyZ2V0W25hbWVdIDpcbiAgICAgICAgICB0aGlzLnNlbmQobmFtZSk7XG4gICAgICB9LFxuXG4gICAgICBzZW5kKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gd3JhcHBlci5zZW5kKG5hbWUsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJveHkod3JhcHBlciwgaGFuZGxlcik7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlSWZyYW1lKHVybCkge1xuICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXG4gICAgaWZyYW1lLnNyYyAgICAgICAgICAgPSB1cmw7XG4gICAgaWZyYW1lLmNsYXNzTmFtZSAgICAgPSBcInNwYW5hblwiO1xuICAgIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cbiAgICByZXR1cm4gaWZyYW1lO1xuICB9XG59XG4iLCJpbXBvcnQgdXVpZCBmcm9tIFwiLi91dWlkXCI7XG5cbmNsYXNzIFRyYW5zZmVyIHtcblxuICBjb25zdHJ1Y3RvcihtZXRob2ROYW1lLCBtZXRob2RBcmdzID0gW10pIHtcbiAgICBpZihtZXRob2ROYW1lLmluZGV4T2YoXCI6XCIpID4gLTEpIHtcbiAgICAgIFt0aGlzLm1ldGhvZE5hbWUsIC4uLnRoaXMubWV0aG9kQXJnc10gPSBtZXRob2ROYW1lLnNwbGl0KFwiOlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tZXRob2ROYW1lID0gbWV0aG9kTmFtZTtcbiAgICAgIHRoaXMubWV0aG9kQXJncyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChtZXRob2RBcmdzLCBTdHJpbmcpO1xuICAgIH1cbiAgICB0aGlzLmlkID0gdXVpZCgpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIFt0aGlzLm1ldGhvZE5hbWUsIC4uLnRoaXMubWV0aG9kQXJnc10uam9pbihcIjpcIik7XG4gIH1cblxuICBhcmdzVG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kQXJncy5qb2luKFwiOlwiKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zZmVyO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICAvLyBjb3BpZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTE3NTIzXG4gIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgciA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdJTE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gIH0pO1xufVxuIiwiaW1wb3J0IFRyYW5zZmVyIGZyb20gXCIuL3RyYW5zZmVyXCI7XG5pbXBvcnQgdXVpZCBmcm9tIFwiLi91dWlkXCI7XG5cbmNvbnN0IGxvYWRpbmdQcm9taXNlcyA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodGFyZ2V0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLl9pc0xvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy50aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0IHx8IDEwMDA7XG4gICAgdGhpcy5pZCA9IHV1aWQoKTtcblxuICAgIGlmICggdGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgdGFyZ2V0Lm5vZGVOYW1lID09PSBcIklGUkFNRVwiICkge1xuICAgICAgdGhpcy5pZnJhbWUgPSB0YXJnZXQ7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldC5jb250ZW50V2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB9XG4gIH1cblxuICBzZW5kKGZuTmFtZSwgZm5BcmdzKSB7XG4gICAgdmFyIHRyYW5zZmVyID0gbmV3IFRyYW5zZmVyKGZuTmFtZSwgZm5BcmdzKSxcbiAgICAgICAgcHJvbWlzZTtcblxuICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIHJlamVjdFRpbWVvdXQgPSBzZXRUaW1lb3V0KHJlamVjdC5iaW5kKG51bGwsIFwidGltZW91dFwiKSwgdGhpcy50aW1lb3V0KTtcblxuICAgICAgdGhpcy5yZWFkeSgpLnRoZW4oICgpID0+IHtcbiAgICAgICAgdGhpcy50YXJnZXQucG9zdE1lc3NhZ2UodHJhbnNmZXIudG9TdHJpbmcoKSwgXCIqXCIpO1xuXG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1t0cmFuc2Zlci5pZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHJlamVjdFRpbWVvdXQpO1xuICAgICAgICAgIHJlc29sdmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcHJvbWlzZS50cmFuc2ZlcklkID0gdHJhbnNmZXIuaWQ7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3BhdGNoTWVzc2FnZShyZXNwb25zZSkge1xuICAgIGNvbnN0IHRyYW5zZmVySWQgPSByZXNwb25zZS50cmFuc2ZlcklkO1xuICAgIGlmICh0cmFuc2ZlcklkIGluIHRoaXMuX2NhbGxiYWNrcykge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW3RyYW5zZmVySWRdLmFwcGx5KCk7XG4gICAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW3RyYW5zZmVySWRdO1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrc1swXSgpO1xuICB9XG5cbiAgcmVhZHkoKSB7XG4gICAgbGV0IGxvYWRpbmdQcm9taXNlID0gbG9hZGluZ1Byb21pc2VzLmdldCh0aGlzKTtcblxuICAgIGlmICghbG9hZGluZ1Byb21pc2UpIHtcbiAgICAgIGxvYWRpbmdQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGxldCBpbnRlcnZhbDtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzWzBdID0gKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfVxuICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy50YXJnZXQucG9zdE1lc3NhZ2UoYHNwYW5hbj8ke3RoaXMuaWR9YCwgXCIqXCIpO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfSk7XG5cbiAgICAgIGxvYWRpbmdQcm9taXNlcy5zZXQodGhpcywgbG9hZGluZ1Byb21pc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBsb2FkaW5nUHJvbWlzZTtcbiAgfVxufVxuIl19
