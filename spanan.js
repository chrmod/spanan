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

      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return false;
      }

      if (msg.wrapperId) {
        var wrapper = this.wrappers.get(msg.wrapperId);

        if (wrapper) {
          wrapper.dispatchMessage(msg);
          return true;
        } else {
          return false;
        }
      } else if (msg.fnName && msg.fnArgs) {
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
    value: function _import(url) {
      var iframe = Spanan.createIframe(url),
          wrapper = new _wrapper2.default(iframe);

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
        var rejectTimeout = setTimeout(reject, _this.timeout);

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
            _this2.target.postMessage("spanan?", "*");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvc3BhbmFuLmpzIiwic3JjL3RyYW5zZmVyLmpzIiwic3JjL3V1aWQuanMiLCJzcmMvd3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDRUEsT0FBTyxNQUFQLEdBQWdCLHNCQUFoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0FxQjtBQUNuQixXQURtQixNQUNuQixHQUFjOzBCQURLLFFBQ0w7O0FBQ1osU0FBSyxpQkFBTCxHQUF5QixPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQXpCLENBRFk7QUFFWixTQUFLLFFBQUwsR0FBZ0IsSUFBSSxHQUFKLEVBQWhCLENBRlk7QUFHWixTQUFLLGVBQUwsR0FBdUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLENBQXZCLENBSFk7R0FBZDs7ZUFEbUI7O29DQU9ILFNBQVM7QUFDdkIsV0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixRQUFRLEVBQVIsRUFBWSxPQUE5QixFQUR1Qjs7OztvQ0FJVCxJQUFJO0FBQ2xCLFVBQUksZUFBSixDQURrQjs7QUFHbEIsVUFBSTtBQUNGLGNBQU0sS0FBSyxLQUFMLENBQVcsR0FBRyxJQUFILENBQWpCLENBREU7T0FBSixDQUVFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsZUFBTyxLQUFQLENBRFU7T0FBVjs7QUFJRixVQUFLLElBQUksU0FBSixFQUFnQjtBQUNuQixZQUFJLFVBQVUsS0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixJQUFJLFNBQUosQ0FBNUIsQ0FEZTs7QUFHbkIsWUFBSSxPQUFKLEVBQWE7QUFDWCxrQkFBUSxlQUFSLENBQXdCLEdBQXhCLEVBRFc7QUFFWCxpQkFBTyxJQUFQLENBRlc7U0FBYixNQUdPO0FBQ0wsaUJBQU8sS0FBUCxDQURLO1NBSFA7T0FIRixNQVNPLElBQUssSUFBSSxNQUFKLElBQWMsSUFBSSxNQUFKLEVB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QW5DOzs7OzRCQU1NOzs7QUFDTixVQUFJLGlCQUFpQixnQkFBZ0IsR0FBaEIsQ0FBb0IsSUFBcEIsQ0FBakIsQ0FERTs7QUFHTixVQUFJLENBQUMsY0FBRCxFQUFpQjtBQUNuQix5QkFBaUIsSUFBSSxPQUFKLENBQVksbUJBQVc7QUFDdEMsY0FBSSxvQkFBSixDQURzQztBQUV0QyxpQkFBSyxVQUFMLENBQWdCLENBQWhCLElBQXFCLFlBQU07QUFDekIsc0JBRHlCO0FBRXpCLDBCQUFjLFFBQWQsRUFGeUI7V0FBTixDQUZpQjtBQU10QyxxQkFBVyxZQUFhLFlBQU07QUFDNUIsbUJBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsU0FBeEIsRUFBbUMsR0FBbkMsRUFENEI7V0FBTixFQUVyQixHQUZRLENBQVgsQ0FOc0M7U0FBWCxDQUE3QixDQURtQjs7QUFZbkIsd0JBQWdCLEdBQWhCLENBQW9CLElBQXBCLEVBQTBCLGNBQTFCLEVBWm1CO09BQXJCOztBQWVBLGFBQU8sY0FBUCxDQWxCTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgU3BhbmFuIGZyb20gXCIuL3NwYW5hblwiO1xuXG53aW5kb3cuc3BhbmFuID0gbmV3IFNwYW5hbigpO1xuIiwiaW1wb3J0IFdyYXBwZXIgZnJvbSBcIi4vd3JhcHBlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGFuYW4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmV4cG9ydGVkRnVuY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLndyYXBwZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMubWVzc2FnZUxpc3RlbmVyID0gdGhpcy5tZXNzYWdlTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyV3JhcHBlcih3cmFwcGVyKSB7XG4gICAgdGhpcy53cmFwcGVycy5zZXQod3JhcHBlci5pZCwgd3JhcHBlcik7XG4gIH1cblxuICBkaXNwYXRjaE1lc3NhZ2UoZXYpIHtcbiAgICBsZXQgbXNnO1xuXG4gICAgdHJ5IHtcbiAgICAgIG1zZyA9IEpTT04ucGFyc2UoZXYuZGF0YSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICggbXNnLndyYXBwZXJJZCApIHtcbiAgICAgIGxldCB3cmFwcGVyID0gdGhpcy53cmFwcGVycy5nZXQobXNnLndyYXBwZXJJZCk7XG5cbiAgICAgIGlmICh3cmFwcGVyKSB7XG4gICAgICAgIHdyYXBwZXIuZGlzcGF0Y2hNZXNzYWdlKG1zZyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIG1zZy5mbk5hbWUgJiYgbXNnLmZuQXJncyApIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoQ2FsbChtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZGlzcGF0Y2hDYWxsKG1zZykge1xuICAgIGNvbnN0IGV4cG9ydGVkRnVuY3Rpb24gPSB0aGlzLmV4cG9ydGVkRnVuY3Rpb25zW21zZy5mbk5hbWVdO1xuXG4gICAgaWYgKCAhZXhwb3J0ZWRGdW5jdGlvbiApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWUgPSBleHBvcnRlZEZ1bmN0aW9uLmFwcGx5KG51bGwsIG1zZy5mbkFyZ3MpO1xuXG4gICAgbGV0IHZhbHVlUHJvbWlzZSA9ICh2YWx1ZSAmJiB2YWx1ZS50aGVuKSA/IHZhbHVlIDogUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcblxuICAgIHRoaXMuc2VuZFJlc3BvbnNlKG1zZywgdmFsdWVQcm9taXNlKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc2VuZFJlc3BvbnNlKG1zZywgdmFsdWVQcm9taXNlKSB7XG4gICAgbGV0IHJlc3BvbnNlVHJhbnNmZXIgPSB7XG4gICAgICB0cmFuc2ZlcklkOiBtc2cudHJhbnNmZXJJZCxcbiAgICB9O1xuXG4gICAgdmFsdWVQcm9taXNlLnRoZW4oICh2YWx1ZSkgPT4ge1xuICAgICAgcmVzcG9uc2VUcmFuc2Zlci5yZXNwb25zZSA9IHZhbHVlO1xuXG4gICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShyZXNwb25zZVRyYW5zZmVyKTtcblxuICAgICAgbXNnLnNvdXJjZS5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBtZXNzYWdlTGlzdGVuZXIoZXYpIHtcbiAgICB0aGlzLmRpc3BhdGNoTWVzc2FnZShldik7XG4gIH1cblxuICBzdGFydExpc3RlbmluZygpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5tZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgc3RvcExpc3RlbmluZygpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5tZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgZXhwb3J0KGZ1bmN0aW9ucykge1xuICAgIHRoaXMuZXhwb3J0ZWRGdW5jdGlvbnMgPSBmdW5jdGlvbnM7XG4gIH1cblxuICBpbXBvcnQodXJsKSB7XG4gICAgY29uc3QgaWZyYW1lID0gU3BhbmFuLmNyZWF0ZUlmcmFtZSh1cmwpLFxuICAgICAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoaWZyYW1lKTtcblxuICAgIHRoaXMucmVnaXN0ZXJXcmFwcGVyKHdyYXBwZXIpO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgIGdldCh0YXJnZXQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUgaW4gdGFyZ2V0ID9cbiAgICAgICAgICB0YXJnZXRbbmFtZV0gOlxuICAgICAgICAgIHRoaXMuc2VuZChuYW1lKTtcbiAgICAgIH0sXG5cbiAgICAgIHNlbmQobmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVyLnNlbmQobmFtZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm94eSh3cmFwcGVyLCBoYW5kbGVyKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVJZnJhbWUodXJsKSB7XG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cbiAgICBpZnJhbWUuc3JjICAgICAgICAgICA9IHVybDtcbiAgICBpZnJhbWUuY2xhc3NOYW1lICAgICA9IFwic3BhbmFuXCI7XG4gICAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuICAgIHJldHVybiBpZnJhbWU7XG4gIH1cbn1cbiIsImltcG9ydCB1dWlkIGZyb20gXCIuL3V1aWRcIjtcblxuY2xhc3MgVHJhbnNmZXIge1xuXG4gIGNvbnN0cnVjdG9yKG1ldGhvZE5hbWUsIG1ldGhvZEFyZ3MgPSBbXSkge1xuICAgIGlmKG1ldGhvZE5hbWUuaW5kZXhPZihcIjpcIikgPiAtMSkge1xuICAgICAgW3RoaXMubWV0aG9kTmFtZSwgLi4udGhpcy5tZXRob2RBcmdzXSA9IG1ldGhvZE5hbWUuc3BsaXQoXCI6XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1ldGhvZE5hbWUgPSBtZXRob2ROYW1lO1xuICAgICAgdGhpcy5tZXRob2RBcmdzID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKG1ldGhvZEFyZ3MsIFN0cmluZyk7XG4gICAgfVxuICAgIHRoaXMuaWQgPSB1dWlkKCk7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gW3RoaXMubWV0aG9kTmFtZSwgLi4udGhpcy5tZXRob2RBcmdzXS5qb2luKFwiOlwiKTtcbiAgfVxuXG4gIGFyZ3NUb1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2RBcmdzLmpvaW4oXCI6XCIpO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNmZXI7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIC8vIGNvcGllZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxMTc1MjNcbiAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgIHZhciByID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxKSlbMF0lMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgVHJhbnNmZXIgZnJvbSBcIi4vdHJhbnNmZXJcIjtcbmltcG9ydCB1dWlkIGZyb20gXCIuL3V1aWRcIjtcblxuY29uc3QgbG9hZGluZ1Byb21pc2VzID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YXJnZXQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuX2lzTG9hZGVkID0gZmFsc2U7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLnRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgfHwgMTAwMDtcbiAgICB0aGlzLmlkID0gdXVpZCgpO1xuXG4gICAgaWYgKCB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiB0YXJnZXQubm9kZU5hbWUgPT09IFwiSUZSQU1FXCIgKSB7XG4gICAgICB0aGlzLmlmcmFtZSA9IHRhcmdldDtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0LmNvbnRlbnRXaW5kb3c7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgfVxuXG4gIHNlbmQoZm5OYW1lLCBmbkFyZ3MpIHtcbiAgICB2YXIgdHJhbnNmZXIgPSBuZXcgVHJhbnNmZXIoZm5OYW1lLCBmbkFyZ3MpLFxuICAgICAgICBwcm9taXNlO1xuXG4gICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgcmVqZWN0VGltZW91dCA9IHNldFRpbWVvdXQocmVqZWN0LCB0aGlzLnRpbWVvdXQpO1xuXG4gICAgICB0aGlzLnJlYWR5KCkudGhlbiggKCkgPT4ge1xuICAgICAgICB0aGlzLnRhcmdldC5wb3N0TWVzc2FnZSh0cmFuc2Zlci50b1N0cmluZygpLCBcIipcIik7XG5cbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzW3RyYW5zZmVyLmlkXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQocmVqZWN0VGltZW91dCk7XG4gICAgICAgICAgcmVzb2x2ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBwcm9taXNlLnRyYW5zZmVySWQgPSB0cmFuc2Zlci5pZDtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZGlzcGF0Y2hNZXNzYWdlKHJlc3BvbnNlKSB7XG4gICAgY29uc3QgdHJhbnNmZXJJZCA9IHJlc3BvbnNlLnRyYW5zZmVySWQ7XG4gICAgaWYgKHRyYW5zZmVySWQgaW4gdGhpcy5fY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3NbdHJhbnNmZXJJZF0uYXBwbHkoKTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbdHJhbnNmZXJJZF07XG4gICAgfVxuICB9XG5cbiAgcmVhZHkoKSB7XG4gICAgbGV0IGxvYWRpbmdQcm9taXNlID0gbG9hZGluZ1Byb21pc2VzLmdldCh0aGlzKTtcblxuICAgIGlmICghbG9hZGluZ1Byb21pc2UpIHtcbiAgICAgIGxvYWRpbmdQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGxldCBpbnRlcnZhbDtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzWzBdID0gKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfVxuICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy50YXJnZXQucG9zdE1lc3NhZ2UoXCJzcGFuYW4/XCIsIFwiKlwiKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH0pO1xuXG4gICAgICBsb2FkaW5nUHJvbWlzZXMuc2V0KHRoaXMsIGxvYWRpbmdQcm9taXNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbG9hZGluZ1Byb21pc2U7XG4gIH1cbn1cbiJdfQ==
