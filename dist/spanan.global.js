!function(e){function r(e,r,o){return 4===arguments.length?t.apply(this,arguments):void n(e,{declarative:!0,deps:r,declare:o})}function t(e,r,t,o){n(e,{declarative:!1,deps:r,executingRequire:t,execute:o})}function n(e,r){r.name=e,e in v||(v[e]=r),r.normalizedDeps=r.deps}function o(e,r){if(r[e.groupIndex]=r[e.groupIndex]||[],-1==g.call(r[e.groupIndex],e)){r[e.groupIndex].push(e);for(var t=0,n=e.normalizedDeps.length;n>t;t++){var a=e.normalizedDeps[t],u=v[a];if(u&&!u.evaluated){var d=e.groupIndex+(u.declarative!=e.declarative);if(void 0===u.groupIndex||u.groupIndex<d){if(void 0!==u.groupIndex&&(r[u.groupIndex].splice(g.call(r[u.groupIndex],u),1),0==r[u.groupIndex].length))throw new TypeError("Mixed dependency cycle detected");u.groupIndex=d}o(u,r)}}}}function a(e){var r=v[e];r.groupIndex=0;var t=[];o(r,t);for(var n=!!r.declarative==t.length%2,a=t.length-1;a>=0;a--){for(var u=t[a],i=0;i<u.length;i++){var s=u[i];n?d(s):l(s)}n=!n}}function u(e){return y[e]||(y[e]={name:e,dependencies:[],exports:{},importers:[]})}function d(r){if(!r.module){var t=r.module=u(r.name),n=r.module.exports,o=r.declare.call(e,function(e,r){if(t.locked=!0,"object"==typeof e)for(var o in e)n[o]=e[o];else n[e]=r;for(var a=0,u=t.importers.length;u>a;a++){var d=t.importers[a];if(!d.locked)for(var i=0;i<d.dependencies.length;++i)d.dependencies[i]===t&&d.setters[i](n)}return t.locked=!1,r},{id:r.name});t.setters=o.setters,t.execute=o.execute;for(var a=0,i=r.normalizedDeps.length;i>a;a++){var l,s=r.normalizedDeps[a],c=v[s],f=y[s];f?l=f.exports:c&&!c.declarative?l=c.esModule:c?(d(c),f=c.module,l=f.exports):l=p(s),f&&f.importers?(f.importers.push(t),t.dependencies.push(f)):t.dependencies.push(null),t.setters[a]&&t.setters[a](l)}}}function i(e){var r,t=v[e];if(t)t.declarative?f(e,[]):t.evaluated||l(t),r=t.module.exports;else if(r=p(e),!r)throw new Error("Unable to load dependency "+e+".");return(!t||t.declarative)&&r&&r.__useDefault?r["default"]:r}function l(r){if(!r.module){var t={},n=r.module={exports:t,id:r.name};if(!r.executingRequire)for(var o=0,a=r.normalizedDeps.length;a>o;o++){var u=r.normalizedDeps[o],d=v[u];d&&l(d)}r.evaluated=!0;var c=r.execute.call(e,function(e){for(var t=0,n=r.deps.length;n>t;t++)if(r.deps[t]==e)return i(r.normalizedDeps[t]);throw new TypeError("Module "+e+" not declared as a dependency.")},t,n);void 0!==typeof c&&(n.exports=c),t=n.exports,t&&t.__esModule?r.esModule=t:r.esModule=s(t)}}function s(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(m)for(var n in r)"default"!==n&&c(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,x(t,"__useDefault",{value:!0}),t}function c(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&x(e,t,n)}catch(o){return e[t]=r[t],!1}}function f(r,t){var n=v[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var u=n.normalizedDeps[o];-1==g.call(t,u)&&(v[u]?f(u,t):p(u))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function p(e){if(I[e])return I[e];if("@node/"==e.substr(0,6))return I[e]=s(D(e.substr(6)));var r=v[e];if(!r)throw"Module "+e+" not present.";return a(e),f(e,[]),v[e]=void 0,r.declarative&&x(r.module.exports,"__esModule",{value:!0}),I[e]=r.declarative?r.module.exports:r.esModule}var v={},g=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},m=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(h){m=!1}var x;!function(){try{Object.defineProperty({},"a",{})&&(x=Object.defineProperty)}catch(e){x=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var y={},D="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,I={"@empty":{}};return function(e,n,o,a){return function(u){u(function(u){for(var d={_nodeRequire:D,register:r,registerDynamic:t,get:p,set:function(e,r){I[e]=r},newModule:function(e){return e}},i=0;i<n.length;i++)(function(e,r){r&&r.__esModule?I[e]=r:I[e]=s(r)})(n[i],arguments[i]);a(d);var l=p(e[0]);if(e.length>1)for(var i=1;i<e.length;i++)p(e[i]);return o?l["default"]:l})}}}("undefined"!=typeof self?self:global)

(["1"], [], true, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.registerDynamic("2", ["3", "4"], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _slice = Array.prototype.slice;

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _transfer = $__require("3");

  var _uuid = $__require("4");

  var _uuid2 = _interopRequireDefault(_uuid);

  var loadingPromises = new WeakMap();

  var _default = function () {
    /**
     * options = {
     *   timeout: 1000,
     *   meta: {
     *
     *   },
     *   requestProperties: {
     *
     *   }
     * }
     */

    function _default(target) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, _default);

      this._isLoaded = false;
      this._callbacks = Object.create(null);
      this.timeout = options.timeout || 1000;
      this.requestConfig = {
        meta: options.meta,
        requestProperties: options.requestProperties
      };
      this.id = (0, _uuid2["default"])();

      if (target instanceof HTMLElement && target.nodeName === "IFRAME") {
        this.iframe = target;
        this.target = target.contentWindow;
      } else {
        this.target = target;
      }
    }

    _createClass(_default, [{
      key: "createRequestTransfer",
      value: function createRequestTransfer(fnName, fnArgs) {
        return new _transfer.RequestTransfer(fnName, fnArgs, this.requestConfig);
      }
    }, {
      key: "send",
      value: function send(fnName) {
        var _this = this;

        for (var _len = arguments.length, fnArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          fnArgs[_key - 1] = arguments[_key];
        }

        var transfer = this.createRequestTransfer(fnName, fnArgs);
        var rejectTimeout = undefined;

        var promise = new Promise(function (resolve, reject) {
          rejectTimeout = setTimeout(reject.bind(null, "timeout"), _this.timeout);

          if (!_this.loadingPromise) {
            _this.loadingPromise = _this.ready();
          }

          _this.loadingPromise.then(function () {
            _this.postTransfer(transfer);

            _this._callbacks[transfer.id] = function () {
              clearTimeout(rejectTimeout);
              resolve.apply(null, arguments);
            };
          });
        });

        promise.transferId = transfer.id;
        promise.rejectTimeout = rejectTimeout;

        return promise;
      }
    }, {
      key: "createProxy",
      value: function createProxy() {
        var wrapper = this;
        var handler = {
          get: function get(target, name) {
            return name in target ? target[name] : this.send(name);
          },

          send: function send(name) {
            return function () {
              return wrapper.send.apply(wrapper, [name].concat(_slice.call(arguments)));
            };
          }
        };

        return new Proxy(this, handler);
      }
    }, {
      key: "dispatchMessage",
      value: function dispatchMessage(response) {
        var transferId = response.transferId;
        var callback = this._callbacks[transferId];

        if (callback) {
          callback.call(null, response.response);
          delete this._callbacks[transferId];
        }
      }
    }, {
      key: "ready",
      value: function ready() {
        var _this2 = this;

        var initTransfer = this.createRequestTransfer("-spanan-init-", []);
        var interval = undefined;

        var loadingPromise = new Promise(function (resolve) {
          _this2._callbacks[initTransfer.id] = function () {
            loadingPromise.stop();
            resolve();
          };

          interval = setInterval(_this2.postTransfer.bind(_this2), 100, initTransfer);
        });

        loadingPromise.stop = clearInterval.bind(null, interval);

        return loadingPromise;
      }
    }, {
      key: "postTransfer",
      value: function postTransfer(transfer) {
        transfer.wrapperId = this.id;
        var message = transfer.toString();
        this.target.postMessage(message, "*");
        return transfer;
      }
    }]);

    return _default;
  }();

  exports["default"] = _default;
  module.exports = exports["default"];
  return module.exports;
});
$__System.registerDynamic('4', [], true, function ($__require, exports, module) {
  'use strict';

  var define,
      global = this || self,
      GLOBAL = global;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  exports['default'] = function () {
    // copied from http://stackoverflow.com/a/2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };

  module.exports = exports['default'];
  return module.exports;
});
$__System.registerDynamic("3", ["4"], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _get = function get(_x4, _x5, _x6) {
    var _again = true;_function: while (_again) {
      var object = _x4,
          property = _x5,
          receiver = _x6;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);if (parent === null) {
          return undefined;
        } else {
          _x4 = parent;_x5 = property;_x6 = receiver;_again = true;desc = parent = undefined;continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;if (getter === undefined) {
          return undefined;
        }return getter.call(receiver);
      }
    }
  };

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _uuid = $__require("4");

  var _uuid2 = _interopRequireDefault(_uuid);

  var BaseTransfer = function () {
    function BaseTransfer() {
      _classCallCheck(this, BaseTransfer);

      this.id = (0, _uuid2["default"])();
    }

    _createClass(BaseTransfer, [{
      key: "toString",
      value: function toString() {
        return JSON.stringify(this);
      }
    }], [{
      key: "fromString",
      value: function fromString(str, config) {
        var conf = prepareConfig(config);
        var msg = JSON.parse(str);
        var isResponse = Boolean(msg.wrapperId) && Boolean(msg.transferId);
        var isRequest = Boolean(msg[conf.requestProperties.fnName]) && Boolean(msg[conf.requestProperties.fnArgs]);

        if (isResponse) {
          return ResponseTransfer.fromObject(msg, conf);
        } else if (isRequest) {
          return RequestTransfer.fromObject(msg, conf);
        } else {
          throw "Non-spanan message";
        }
      }
    }, {
      key: "isValid",
      value: function isValid(transfer) {
        var _ref = arguments.length <= 1 || arguments[1] === undefined ? { meta: {} } : arguments[1];

        var meta = _ref.meta;

        var isMetaMatching = Object.keys(meta).every(function (key) {
          return transfer.config.meta[key] === meta[key];
        });

        return isMetaMatching;
      }
    }]);

    return BaseTransfer;
  }();

  exports.BaseTransfer = BaseTransfer;

  var DEFAULT_CONFIG = {
    requestProperties: {
      id: "id",
      fnName: "fnName",
      fnArgs: "fnArgs",
      wrapperId: "wrapperId"
    },
    meta: {}
  };

  function prepareConfig() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var requestProperties = Object.assign({}, DEFAULT_CONFIG.requestProperties, config.requestProperties || {});
    var meta = Object.assign({}, DEFAULT_CONFIG.meta, config.meta || {});

    return {
      requestProperties: requestProperties,
      meta: meta
    };
  }

  var RequestTransfer = function (_BaseTransfer) {
    _inherits(RequestTransfer, _BaseTransfer);

    function RequestTransfer(fnName, fnArgs, config) {
      if (fnArgs === undefined) fnArgs = [];

      _classCallCheck(this, RequestTransfer);

      _get(Object.getPrototypeOf(RequestTransfer.prototype), "constructor", this).call(this);

      if (!fnName) {
        throw "missing fnName";
      } else {
        this.fnName = fnName;
      }

      if (!fnArgs) {
        throw "missing fnArgs";
      } else {
        this.fnArgs = Array.prototype.slice.call(fnArgs);
      }

      this.config = prepareConfig(config);
    }

    _createClass(RequestTransfer, [{
      key: "toString",
      value: function toString() {
        var _Object$assign;

        var transfer = Object.assign((_Object$assign = {}, _defineProperty(_Object$assign, this.config.requestProperties.id, this.id), _defineProperty(_Object$assign, this.config.requestProperties.fnName, this.fnName), _defineProperty(_Object$assign, this.config.requestProperties.fnArgs, this.fnArgs), _defineProperty(_Object$assign, this.config.requestProperties.wrapperId, this.wrapperId), _Object$assign), this.config.meta);
        return JSON.stringify(transfer);
      }
    }], [{
      key: "fromObject",
      value: function fromObject(msg, config) {
        var conf = prepareConfig(config);
        var transfer = new RequestTransfer(msg[conf.requestProperties.fnName], msg[conf.requestProperties.fnArgs]);

        // Handle aliased main properties
        Object.keys(conf.requestProperties).forEach(function (propName) {
          var alias = conf.requestProperties[propName];
          if (alias && msg[alias]) {
            transfer[propName] = msg[alias];
          } else {
            throw "missing requestProperty " + propName + " aliased with " + alias;
          }
        });

        // Check meta properties existance
        Object.keys(conf.meta).forEach(function (propName) {
          var msgValue = msg[propName];
          var metaValue = conf.meta[propName];
          if (!msgValue) {
            throw "missing meta property " + propName;
          } else if (msgValue !== metaValue) {
            throw "incorect meta property " + propName + " value \"" + metaValue + " !== " + msgValue + "\"";
          }
        });

        return transfer;
      }
    }]);

    return RequestTransfer;
  }(BaseTransfer);

  exports.RequestTransfer = RequestTransfer;

  var ResponseTransfer = function (_BaseTransfer2) {
    _inherits(ResponseTransfer, _BaseTransfer2);

    function ResponseTransfer(originalTransfer, response) {
      _classCallCheck(this, ResponseTransfer);

      _get(Object.getPrototypeOf(ResponseTransfer.prototype), "constructor", this).call(this);
      this.transferId = originalTransfer.id;
      this.wrapperId = originalTransfer.wrapperId;
      this.response = response;
    }

    _createClass(ResponseTransfer, null, [{
      key: "fromObject",
      value: function fromObject(msg) {
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return Object.assign(Object.create(ResponseTransfer.prototype), msg);
      }
    }]);

    return ResponseTransfer;
  }(BaseTransfer);

  exports.ResponseTransfer = ResponseTransfer;
  return module.exports;
});
$__System.registerDynamic("5", ["3"], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _transfer = $__require("3");

  var _default = function () {
    function _default(ctx, config) {
      _classCallCheck(this, _default);

      this.ctx = ctx;
      this.config = config;
      this.dispatchMessage = this.dispatchMessage.bind(this);
      this.exportedFunctions = Object.create(null);
      this.isListening = false;
      this.wrappers = new Map();
    }

    _createClass(_default, [{
      key: "setup",
      value: function setup(functions) {
        this.exportedFunctions = functions;
      }
    }, {
      key: "startListening",
      value: function startListening() {
        if (!this.isListening) {
          this.ctx.addEventListener("message", this.dispatchMessage);
          this.isListening = true;
        }
      }
    }, {
      key: "stopListening",
      value: function stopListening() {
        this.ctx.removeEventListener("message", this.dispatchMessage);
        this.isListening = false;
      }
    }, {
      key: "registerWrapper",
      value: function registerWrapper(wrapper) {
        this.wrappers.set(wrapper.id, wrapper);
      }
    }, {
      key: "dispatchMessage",
      value: function dispatchMessage(ev) {
        var transfer = undefined;

        try {
          transfer = _transfer.BaseTransfer.fromString(ev.data, this.config);
        } catch (e) {
          return false;
        }

        if (transfer instanceof _transfer.ResponseTransfer) {
          var wrapper = this.wrappers.get(transfer.wrapperId);

          if (wrapper) {
            wrapper.dispatchMessage(transfer);
            return true;
          } else {
            return false;
          }
        } else if (transfer instanceof _transfer.RequestTransfer) {
          transfer.source = ev.source;
          return this.dispatchCall(transfer);
        } else {
          return false;
        }
      }
    }, {
      key: "dispatchCall",
      value: function dispatchCall(msg) {
        var exportedFunction = this.exportedFunctions[msg.fnName];

        if (msg.fnName === "-spanan-init-") {
          exportedFunction = function () {
            return true;
          };
        }

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
        var _this = this;

        return valuePromise.then(function (value) {
          var responseTransfer = new _transfer.ResponseTransfer(msg, value, _this.config);
          msg.source.postMessage(responseTransfer.toString(), "*");
        });
      }
    }]);

    return _default;
  }();

  exports["default"] = _default;
  ;
  module.exports = exports["default"];
  return module.exports;
});
$__System.registerDynamic("6", ["2", "5"], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _wrapper = $__require("2");

  var _wrapper2 = _interopRequireDefault(_wrapper);

  var _server = $__require("5");

  var _server2 = _interopRequireDefault(_server);

  var _default = function () {
    function _default() {
      var ctx = arguments.length <= 0 || arguments[0] === undefined ? window || global : arguments[0];

      _classCallCheck(this, _default);

      if (ctx.spanan) {
        throw new Error("spanan already loaded");
      }
      this.ctx = ctx;
      this.ctx.spanan = this;
    }

    _createClass(_default, [{
      key: "destroy",
      value: function destroy() {
        if (this.server) {
          this.server.stopListening();
        }
        delete this.ctx.spanan;
      }
    }, {
      key: "export",
      value: function _export(functions, config) {
        if (!this.server) {
          this.server = new _server2["default"](this.ctx, config);
        }
        this.server.setup(functions);
        this.server.startListening();
      }
    }, {
      key: "import",
      value: function _import(target) {
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        if (!this.server) {
          this.server = new _server2["default"](this.ctx);
        }
        this.server.startListening();

        if (typeof target === "string") {
          target = this.constructor.createIframe(target);
        }

        var wrapper = new _wrapper2["default"](target, config);

        this.server.registerWrapper(wrapper);

        return wrapper;
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

    return _default;
  }();

  exports["default"] = _default;
  module.exports = exports["default"];
  return module.exports;
});
$__System.registerDynamic("1", ["6"], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }

  var _facade = $__require("6");

  var _facade2 = _interopRequireDefault(_facade);

  new _facade2["default"]();
  return module.exports;
});
})
(function(factory) {
  factory();
});