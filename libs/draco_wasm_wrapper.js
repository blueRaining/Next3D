var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (l) {
  var n = 0;
  return function () {
    return n < l.length ? { done: !1, value: l[n++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (l) {
  return { next: $jscomp.arrayIteratorImpl(l) };
};
$jscomp.makeIterator = function (l) {
  var n = "undefined" != typeof Symbol && Symbol.iterator && l[Symbol.iterator];
  return n ? n.call(l) : $jscomp.arrayIterator(l);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (l) {
  l = [
    "object" == typeof globalThis && globalThis,
    l,
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
  ];
  for (var n = 0; n < l.length; ++n) {
    var m = l[n];
    if (m && m.Math == Math) return m;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (l, n, m) {
        if (l == Array.prototype || l == Object.prototype) return l;
        l[n] = m.value;
        return l;
      };
$jscomp.IS_SYMBOL_NATIVE =
  "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (l, n) {
  var m = $jscomp.propertyToPolyfillSymbol[n];
  if (null == m) return l[n];
  m = l[m];
  return void 0 !== m ? m : l[n];
};
$jscomp.polyfill = function (l, n, m, q) {
  n &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(l, n, m, q)
      : $jscomp.polyfillUnisolated(l, n, m, q));
};
$jscomp.polyfillUnisolated = function (l, n, m, q) {
  m = $jscomp.global;
  l = l.split(".");
  for (q = 0; q < l.length - 1; q++) {
    var h = l[q];
    if (!(h in m)) return;
    m = m[h];
  }
  l = l[l.length - 1];
  q = m[l];
  n = n(q);
  n != q &&
    null != n &&
    $jscomp.defineProperty(m, l, { configurable: !0, writable: !0, value: n });
};
$jscomp.polyfillIsolated = function (l, n, m, q) {
  var h = l.split(".");
  l = 1 === h.length;
  q = h[0];
  q = !l && q in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var A = 0; A < h.length - 1; A++) {
    var g = h[A];
    if (!(g in q)) return;
    q = q[g];
  }
  h = h[h.length - 1];
  m = $jscomp.IS_SYMBOL_NATIVE && "es6" === m ? q[h] : null;
  n = n(m);
  null != n &&
    (l
      ? $jscomp.defineProperty($jscomp.polyfills, h, {
          configurable: !0,
          writable: !0,
          value: n,
        })
      : n !== m &&
        (($jscomp.propertyToPolyfillSymbol[h] = $jscomp.IS_SYMBOL_NATIVE
          ? $jscomp.global.Symbol(h)
          : $jscomp.POLYFILL_PREFIX + h),
        (h = $jscomp.propertyToPolyfillSymbol[h]),
        $jscomp.defineProperty(q, h, {
          configurable: !0,
          writable: !0,
          value: n,
        })));
};
$jscomp.polyfill(
  "Promise",
  function (l) {
    function n() {
      this.batch_ = null;
    }
    function m(g) {
      return g instanceof h
        ? g
        : new h(function (p, u) {
            p(g);
          });
    }
    if (
      l &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          "undefined" === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf("[native code]"))
    )
      return l;
    n.prototype.asyncExecute = function (g) {
      if (null == this.batch_) {
        this.batch_ = [];
        var p = this;
        this.asyncExecuteFunction(function () {
          p.executeBatch_();
        });
      }
      this.batch_.push(g);
    };
    var q = $jscomp.global.setTimeout;
    n.prototype.asyncExecuteFunction = function (g) {
      q(g, 0);
    };
    n.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var g = this.batch_;
        this.batch_ = [];
        for (var p = 0; p < g.length; ++p) {
          var u = g[p];
          g[p] = null;
          try {
            u();
          } catch (x) {
            this.asyncThrow_(x);
          }
        }
      }
      this.batch_ = null;
    };
    n.prototype.asyncThrow_ = function (g) {
      this.asyncExecuteFunction(function () {
        throw g;
      });
    };
    var h = function (g) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var p = this.createResolveAndReject_();
      try {
        g(p.resolve, p.reject);
      } catch (u) {
        p.reject(u);
      }
    };
    h.prototype.createResolveAndReject_ = function () {
      function g(x) {
        return function (F) {
          u || ((u = !0), x.call(p, F));
        };
      }
      var p = this,
        u = !1;
      return { resolve: g(this.resolveTo_), reject: g(this.reject_) };
    };
    h.prototype.resolveTo_ = function (g) {
      if (g === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (g instanceof h) this.settleSameAsPromise_(g);
      else {
        a: switch (typeof g) {
          case "object":
            var p = null != g;
            break a;
          case "function":
            p = !0;
            break a;
          default:
            p = !1;
        }
        p ? this.resolveToNonPromiseObj_(g) : this.fulfill_(g);
      }
    };
    h.prototype.resolveToNonPromiseObj_ = function (g) {
      var p = void 0;
      try {
        p = g.then;
      } catch (u) {
        this.reject_(u);
        return;
      }
      "function" == typeof p
        ? this.settleSameAsThenable_(p, g)
        : this.fulfill_(g);
    };
    h.prototype.reject_ = function (g) {
      this.settle_(2, g);
    };
    h.prototype.fulfill_ = function (g) {
      this.settle_(1, g);
    };
    h.prototype.settle_ = function (g, p) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            g +
            ", " +
            p +
            "): Promise already settled in state" +
            this.state_
        );
      this.state_ = g;
      this.result_ = p;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    h.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var g = this;
      q(function () {
        if (g.notifyUnhandledRejection_()) {
          var p = $jscomp.global.console;
          "undefined" !== typeof p && p.error(g.result_);
        }
      }, 1);
    };
    h.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var g = $jscomp.global.CustomEvent,
        p = $jscomp.global.Event,
        u = $jscomp.global.dispatchEvent;
      if ("undefined" === typeof u) return !0;
      "function" === typeof g
        ? (g = new g("unhandledrejection", { cancelable: !0 }))
        : "function" === typeof p
        ? (g = new p("unhandledrejection", { cancelable: !0 }))
        : ((g = $jscomp.global.document.createEvent("CustomEvent")),
          g.initCustomEvent("unhandledrejection", !1, !0, g));
      g.promise = this;
      g.reason = this.result_;
      return u(g);
    };
    h.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var g = 0; g < this.onSettledCallbacks_.length; ++g)
          A.asyncExecute(this.onSettledCallbacks_[g]);
        this.onSettledCallbacks_ = null;
      }
    };
    var A = new n();
    h.prototype.settleSameAsPromise_ = function (g) {
      var p = this.createResolveAndReject_();
      g.callWhenSettled_(p.resolve, p.reject);
    };
    h.prototype.settleSameAsThenable_ = function (g, p) {
      var u = this.createResolveAndReject_();
      try {
        g.call(p, u.resolve, u.reject);
      } catch (x) {
        u.reject(x);
      }
    };
    h.prototype.then = function (g, p) {
      function u(G, Y) {
        return "function" == typeof G
          ? function (ba) {
              try {
                x(G(ba));
              } catch (fa) {
                F(fa);
              }
            }
          : Y;
      }
      var x,
        F,
        ka = new h(function (G, Y) {
          x = G;
          F = Y;
        });
      this.callWhenSettled_(u(g, x), u(p, F));
      return ka;
    };
    h.prototype.catch = function (g) {
      return this.then(void 0, g);
    };
    h.prototype.callWhenSettled_ = function (g, p) {
      function u() {
        switch (x.state_) {
          case 1:
            g(x.result_);
            break;
          case 2:
            p(x.result_);
            break;
          default:
            throw Error("Unexpected state: " + x.state_);
        }
      }
      var x = this;
      null == this.onSettledCallbacks_
        ? A.asyncExecute(u)
        : this.onSettledCallbacks_.push(u);
      this.isRejectionHandled_ = !0;
    };
    h.resolve = m;
    h.reject = function (g) {
      return new h(function (p, u) {
        u(g);
      });
    };
    h.race = function (g) {
      return new h(function (p, u) {
        for (
          var x = $jscomp.makeIterator(g), F = x.next();
          !F.done;
          F = x.next()
        )
          m(F.value).callWhenSettled_(p, u);
      });
    };
    h.all = function (g) {
      var p = $jscomp.makeIterator(g),
        u = p.next();
      return u.done
        ? m([])
        : new h(function (x, F) {
            function ka(ba) {
              return function (fa) {
                G[ba] = fa;
                Y--;
                0 == Y && x(G);
              };
            }
            var G = [],
              Y = 0;
            do
              G.push(void 0),
                Y++,
                m(u.value).callWhenSettled_(ka(G.length - 1), F),
                (u = p.next());
            while (!u.done);
          });
    };
    return h;
  },
  "es6",
  "es3"
);
$jscomp.checkEs6ConformanceViaProxy = function () {
  try {
    var l = {},
      n = Object.create(
        new $jscomp.global.Proxy(l, {
          get: function (m, q, h) {
            return m == l && "q" == q && h == n;
          },
        })
      );
    return !0 === n.q;
  } catch (m) {
    return !1;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = !1;
$jscomp.ES6_CONFORMANCE =
  $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS &&
  $jscomp.checkEs6ConformanceViaProxy();
$jscomp.owns = function (l, n) {
  return Object.prototype.hasOwnProperty.call(l, n);
};
$jscomp.polyfill(
  "Array.prototype.copyWithin",
  function (l) {
    function n(m) {
      m = Number(m);
      return Infinity === m || -Infinity === m ? m : m | 0;
    }
    return l
      ? l
      : function (m, q, h) {
          var A = this.length;
          m = n(m);
          q = n(q);
          h = void 0 === h ? A : n(h);
          m = 0 > m ? Math.max(A + m, 0) : Math.min(m, A);
          q = 0 > q ? Math.max(A + q, 0) : Math.min(q, A);
          h = 0 > h ? Math.max(A + h, 0) : Math.min(h, A);
          if (m < q)
            for (; q < h; )
              q in this ? (this[m++] = this[q++]) : (delete this[m++], q++);
          else
            for (h = Math.min(h, A + q - m), m += h - q; h > q; )
              --h in this ? (this[--m] = this[h]) : delete this[--m];
          return this;
        };
  },
  "es6",
  "es3"
);
$jscomp.typedArrayCopyWithin = function (l) {
  return l ? l : Array.prototype.copyWithin;
};
$jscomp.polyfill(
  "Int8Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Uint8Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Uint8ClampedArray.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Int16Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Uint16Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Int32Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Uint32Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Float32Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
$jscomp.polyfill(
  "Float64Array.prototype.copyWithin",
  $jscomp.typedArrayCopyWithin,
  "es6",
  "es5"
);
var DracoDecoderModule = (function () {
  var l =
    "undefined" !== typeof document && document.currentScript
      ? document.currentScript.src
      : void 0;
  "undefined" !== typeof __filename && (l = l || __filename);
  return function (n) {
    function m(e) {
      return a.locateFile ? a.locateFile(e, V) : V + e;
    }
    function q(e, b) {
      e || u("Assertion failed: " + b);
    }
    function h(e, b, c) {
      var d = b + c;
      for (c = b; e[c] && !(c >= d); ) ++c;
      if (16 < c - b && e.subarray && Ea) return Ea.decode(e.subarray(b, c));
      for (d = ""; b < c; ) {
        var f = e[b++];
        if (f & 128) {
          var t = e[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | t);
          else {
            var ca = e[b++] & 63;
            f =
              224 == (f & 240)
                ? ((f & 15) << 12) | (t << 6) | ca
                : ((f & 7) << 18) | (t << 12) | (ca << 6) | (e[b++] & 63);
            65536 > f
              ? (d += String.fromCharCode(f))
              : ((f -= 65536),
                (d += String.fromCharCode(
                  55296 | (f >> 10),
                  56320 | (f & 1023)
                )));
          }
        } else d += String.fromCharCode(f);
      }
      return d;
    }
    function A(e, b) {
      return e ? h(la, e, b) : "";
    }
    function g(e, b) {
      0 < e % b && (e += b - (e % b));
      return e;
    }
    function p(e) {
      ra = e;
      a.HEAP8 = Z = new Int8Array(e);
      a.HEAP16 = new Int16Array(e);
      a.HEAP32 = H = new Int32Array(e);
      a.HEAPU8 = la = new Uint8Array(e);
      a.HEAPU16 = new Uint16Array(e);
      a.HEAPU32 = new Uint32Array(e);
      a.HEAPF32 = new Float32Array(e);
      a.HEAPF64 = new Float64Array(e);
    }
    function u(e) {
      if (a.onAbort) a.onAbort(e);
      e += "";
      ja(e);
      Fa = !0;
      e = new WebAssembly.RuntimeError(
        "abort(" + e + "). Build with -s ASSERTIONS=1 for more info."
      );
      va(e);
      throw e;
    }
    function x(e, b) {
      return String.prototype.startsWith ? e.startsWith(b) : 0 === e.indexOf(b);
    }
    function F() {
      try {
        if (ma) return new Uint8Array(ma);
        if (sa) return sa(W);
        throw "both async and sync fetching of the wasm failed";
      } catch (e) {
        u(e);
      }
    }
    function ka() {
      return ma ||
        (!ta && !ha) ||
        "function" !== typeof fetch ||
        x(W, "file://")
        ? Promise.resolve().then(F)
        : fetch(W, { credentials: "same-origin" })
            .then(function (e) {
              if (!e.ok) throw "failed to load wasm binary file at '" + W + "'";
              return e.arrayBuffer();
            })
            .catch(function () {
              return F();
            });
    }
    function G(e) {
      for (; 0 < e.length; ) {
        var b = e.shift();
        if ("function" == typeof b) b(a);
        else {
          var c = b.func;
          "number" === typeof c
            ? void 0 === b.arg
              ? wa.get(c)()
              : wa.get(c)(b.arg)
            : c(void 0 === b.arg ? null : b.arg);
        }
      }
    }
    function Y(e) {
      this.excPtr = e;
      this.ptr = e - D.SIZE;
      this.set_type = function (b) {
        H[(this.ptr + D.TYPE_OFFSET) >> 2] = b;
      };
      this.get_type = function () {
        return H[(this.ptr + D.TYPE_OFFSET) >> 2];
      };
      this.set_destructor = function (b) {
        H[(this.ptr + D.DESTRUCTOR_OFFSET) >> 2] = b;
      };
      this.get_destructor = function () {
        return H[(this.ptr + D.DESTRUCTOR_OFFSET) >> 2];
      };
      this.set_refcount = function (b) {
        H[(this.ptr + D.REFCOUNT_OFFSET) >> 2] = b;
      };
      this.set_caught = function (b) {
        Z[(this.ptr + D.CAUGHT_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != Z[(this.ptr + D.CAUGHT_OFFSET) >> 0];
      };
      this.set_rethrown = function (b) {
        Z[(this.ptr + D.RETHROWN_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != Z[(this.ptr + D.RETHROWN_OFFSET) >> 0];
      };
      this.init = function (b, c) {
        this.set_type(b);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        H[(this.ptr + D.REFCOUNT_OFFSET) >> 2] += 1;
      };
      this.release_ref = function () {
        var b = H[(this.ptr + D.REFCOUNT_OFFSET) >> 2];
        H[(this.ptr + D.REFCOUNT_OFFSET) >> 2] = b - 1;
        return 1 === b;
      };
    }
    function ba() {
      return 0 < ba.uncaught_exceptions;
    }
    function fa(e) {
      function b() {
        if (!ua && ((ua = !0), (a.calledRun = !0), !Fa)) {
          Ga = !0;
          G(Ha);
          G(Ia);
          Ja(a);
          if (a.onRuntimeInitialized) a.onRuntimeInitialized();
          if (a.postRun)
            for (
              "function" == typeof a.postRun && (a.postRun = [a.postRun]);
              a.postRun.length;

            )
              Ka.unshift(a.postRun.shift());
          G(Ka);
        }
      }
      if (!(0 < ia)) {
        if (a.preRun)
          for (
            "function" == typeof a.preRun && (a.preRun = [a.preRun]);
            a.preRun.length;

          )
            La.unshift(a.preRun.shift());
        G(La);
        0 < ia ||
          (a.setStatus
            ? (a.setStatus("Running..."),
              setTimeout(function () {
                setTimeout(function () {
                  a.setStatus("");
                }, 1);
                b();
              }, 1))
            : b());
      }
    }
    function v() {}
    function z(e) {
      return (e || v).__cache__;
    }
    function S(e, b) {
      var c = z(b),
        d = c[e];
      if (d) return d;
      d = Object.create((b || v).prototype);
      d.ptr = e;
      return (c[e] = d);
    }
    function da(e) {
      if ("string" === typeof e) {
        for (var b = 0, c = 0; c < e.length; ++c) {
          var d = e.charCodeAt(c);
          55296 <= d &&
            57343 >= d &&
            (d = (65536 + ((d & 1023) << 10)) | (e.charCodeAt(++c) & 1023));
          127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
        }
        b = Array(b + 1);
        c = 0;
        d = b.length;
        if (0 < d) {
          d = c + d - 1;
          for (var f = 0; f < e.length; ++f) {
            var t = e.charCodeAt(f);
            if (55296 <= t && 57343 >= t) {
              var ca = e.charCodeAt(++f);
              t = (65536 + ((t & 1023) << 10)) | (ca & 1023);
            }
            if (127 >= t) {
              if (c >= d) break;
              b[c++] = t;
            } else {
              if (2047 >= t) {
                if (c + 1 >= d) break;
                b[c++] = 192 | (t >> 6);
              } else {
                if (65535 >= t) {
                  if (c + 2 >= d) break;
                  b[c++] = 224 | (t >> 12);
                } else {
                  if (c + 3 >= d) break;
                  b[c++] = 240 | (t >> 18);
                  b[c++] = 128 | ((t >> 12) & 63);
                }
                b[c++] = 128 | ((t >> 6) & 63);
              }
              b[c++] = 128 | (t & 63);
            }
          }
          b[c] = 0;
        }
        e = r.alloc(b, Z);
        r.copy(b, Z, e);
        return e;
      }
      return e;
    }
    function xa(e) {
      if ("object" === typeof e) {
        var b = r.alloc(e, Z);
        r.copy(e, Z, b);
        return b;
      }
      return e;
    }
    function aa() {
      throw "cannot construct a VoidPtr, no constructor in IDL";
    }
    function T() {
      this.ptr = Ma();
      z(T)[this.ptr] = this;
    }
    function R() {
      this.ptr = Na();
      z(R)[this.ptr] = this;
    }
    function X() {
      this.ptr = Oa();
      z(X)[this.ptr] = this;
    }
    function w() {
      this.ptr = Pa();
      z(w)[this.ptr] = this;
    }
    function C() {
      this.ptr = Qa();
      z(C)[this.ptr] = this;
    }
    function I() {
      this.ptr = Ra();
      z(I)[this.ptr] = this;
    }
    function J() {
      this.ptr = Sa();
      z(J)[this.ptr] = this;
    }
    function E() {
      this.ptr = Ta();
      z(E)[this.ptr] = this;
    }
    function U() {
      this.ptr = Ua();
      z(U)[this.ptr] = this;
    }
    function B() {
      throw "cannot construct a Status, no constructor in IDL";
    }
    function K() {
      this.ptr = Va();
      z(K)[this.ptr] = this;
    }
    function L() {
      this.ptr = Wa();
      z(L)[this.ptr] = this;
    }
    function M() {
      this.ptr = Xa();
      z(M)[this.ptr] = this;
    }
    function N() {
      this.ptr = Ya();
      z(N)[this.ptr] = this;
    }
    function O() {
      this.ptr = Za();
      z(O)[this.ptr] = this;
    }
    function P() {
      this.ptr = $a();
      z(P)[this.ptr] = this;
    }
    function Q() {
      this.ptr = ab();
      z(Q)[this.ptr] = this;
    }
    function y() {
      this.ptr = bb();
      z(y)[this.ptr] = this;
    }
    function k() {
      this.ptr = cb();
      z(k)[this.ptr] = this;
    }
    n = n || {};
    var a = "undefined" !== typeof n ? n : {},
      Ja,
      va;
    a.ready = new Promise(function (e, b) {
      Ja = e;
      va = b;
    });
    var db = !1,
      eb = !1;
    a.onRuntimeInitialized = function () {
      db = !0;
      if (eb && "function" === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.onModuleParsed = function () {
      eb = !0;
      if (db && "function" === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.isVersionSupported = function (e) {
      if ("string" !== typeof e) return !1;
      e = e.split(".");
      return 2 > e.length || 3 < e.length
        ? !1
        : 1 == e[0] && 0 <= e[1] && 4 >= e[1]
        ? !0
        : 0 != e[0] || 10 < e[1]
        ? !1
        : !0;
    };
    var na = {},
      ea;
    for (ea in a) a.hasOwnProperty(ea) && (na[ea] = a[ea]);
    var ta = !1,
      ha = !1,
      ya = !1,
      fb = !1;
    ta = "object" === typeof window;
    ha = "function" === typeof importScripts;
    ya =
      "object" === typeof process &&
      "object" === typeof process.versions &&
      "string" === typeof process.versions.node;
    fb = !ta && !ya && !ha;
    var V = "",
      za,
      Aa;
    if (ya) {
      V = ha ? require("path").dirname(V) + "/" : __dirname + "/";
      var Ba = function (e, b) {
        za || (za = require("fs"));
        Aa || (Aa = require("path"));
        e = Aa.normalize(e);
        return za.readFileSync(e, b ? null : "utf8");
      };
      var sa = function (e) {
        e = Ba(e, !0);
        e.buffer || (e = new Uint8Array(e));
        q(e.buffer);
        return e;
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, "/");
      process.argv.slice(2);
      a.inspect = function () {
        return "[Emscripten Module object]";
      };
    } else if (fb)
      "undefined" != typeof read &&
        (Ba = function (e) {
          return read(e);
        }),
        (sa = function (e) {
          if ("function" === typeof readbuffer)
            return new Uint8Array(readbuffer(e));
          e = read(e, "binary");
          q("object" === typeof e);
          return e;
        }),
        "undefined" !== typeof print &&
          ("undefined" === typeof console && (console = {}),
          (console.log = print),
          (console.warn = console.error =
            "undefined" !== typeof printErr ? printErr : print));
    else if (ta || ha)
      ha
        ? (V = self.location.href)
        : "undefined" !== typeof document &&
          document.currentScript &&
          (V = document.currentScript.src),
        l && (V = l),
        (V =
          0 !== V.indexOf("blob:") ? V.substr(0, V.lastIndexOf("/") + 1) : ""),
        (Ba = function (e) {
          var b = new XMLHttpRequest();
          b.open("GET", e, !1);
          b.send(null);
          return b.responseText;
        }),
        ha &&
          (sa = function (e) {
            var b = new XMLHttpRequest();
            b.open("GET", e, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
    var Ed = a.print || console.log.bind(console),
      ja = a.printErr || console.warn.bind(console);
    for (ea in na) na.hasOwnProperty(ea) && (a[ea] = na[ea]);
    na = null;
    var ma;
    a.wasmBinary && (ma = a.wasmBinary);
    "object" !== typeof WebAssembly && u("no native wasm support detected");
    var oa,
      Fa = !1,
      Ea =
        "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
    "undefined" !== typeof TextDecoder && new TextDecoder("utf-16le");
    var Z,
      la,
      H,
      gb = a.INITIAL_MEMORY || 16777216;
    if (
      (oa = a.wasmMemory
        ? a.wasmMemory
        : new WebAssembly.Memory({ initial: gb / 65536, maximum: 32768 }))
    )
      var ra = oa.buffer;
    gb = ra.byteLength;
    p(ra);
    var wa,
      La = [],
      Ha = [],
      Ia = [],
      Ka = [],
      Ga = !1,
      ia = 0,
      Ca = null,
      pa = null;
    a.preloadedImages = {};
    a.preloadedAudios = {};
    var W = "./libs/draco_decoder.wasm";
    x(W, "data:application/octet-stream;base64,") || (W = m(W));
    var D = {
        DESTRUCTOR_OFFSET: 0,
        REFCOUNT_OFFSET: 4,
        TYPE_OFFSET: 8,
        CAUGHT_OFFSET: 12,
        RETHROWN_OFFSET: 13,
        SIZE: 16,
      },
      qa = {
        mappings: {},
        buffers: [null, [], []],
        printChar: function (e, b) {
          var c = qa.buffers[e];
          0 === b || 10 === b
            ? ((1 === e ? Ed : ja)(h(c, 0)), (c.length = 0))
            : c.push(b);
        },
        varargs: void 0,
        get: function () {
          qa.varargs += 4;
          return H[(qa.varargs - 4) >> 2];
        },
        getStr: function (e) {
          return A(e);
        },
        get64: function (e, b) {
          return e;
        },
      };
    Ha.push({
      func: function () {
        hb();
      },
    });
    var kb = {
      __cxa_allocate_exception: function (e) {
        return ib(e + D.SIZE) + D.SIZE;
      },
      __cxa_throw: function (e, b, c) {
        new Y(e).init(b, c);
        "uncaught_exception" in ba
          ? ba.uncaught_exceptions++
          : (ba.uncaught_exceptions = 1);
        throw e;
      },
      abort: function () {
        u();
      },
      array_bounds_check_error: function (e, b) {
        throw "Array index " + e + " out of bounds: [0," + b + ")";
      },
      emscripten_memcpy_big: function (e, b, c) {
        la.copyWithin(e, b, b + c);
      },
      emscripten_resize_heap: function (e) {
        e >>>= 0;
        var b = la.length;
        if (2147483648 < e) return !1;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, e + 100663296);
          d = Math.min(2147483648, g(Math.max(16777216, e, d), 65536));
          a: {
            try {
              oa.grow((d - ra.byteLength + 65535) >>> 16);
              p(oa.buffer);
              var f = 1;
              break a;
            } catch (t) {}
            f = void 0;
          }
          if (f) return !0;
        }
        return !1;
      },
      fd_close: function (e) {
        return 0;
      },
      fd_seek: function (e, b, c, d, f) {},
      fd_write: function (e, b, c, d) {
        for (var f = 0, t = 0; t < c; t++) {
          for (
            var ca = H[(b + 8 * t) >> 2],
              jb = H[(b + (8 * t + 4)) >> 2],
              Da = 0;
            Da < jb;
            Da++
          )
            qa.printChar(e, la[ca + Da]);
          f += jb;
        }
        H[d >> 2] = f;
        return 0;
      },
      memory: oa,
      setTempRet0: function (e) {},
    };
    (function () {
      function e(f, t) {
        a.asm = f.exports;
        wa = a.asm.__indirect_function_table;
        ia--;
        a.monitorRunDependencies && a.monitorRunDependencies(ia);
        0 == ia &&
          (null !== Ca && (clearInterval(Ca), (Ca = null)),
          pa && ((f = pa), (pa = null), f()));
      }
      function b(f) {
        e(f.instance);
      }
      function c(f) {
        return ka()
          .then(function (t) {
            return WebAssembly.instantiate(t, d);
          })
          .then(f, function (t) {
            ja("failed to asynchronously prepare wasm: " + t);
            u(t);
          });
      }
      var d = { env: kb, wasi_snapshot_preview1: kb };
      ia++;
      a.monitorRunDependencies && a.monitorRunDependencies(ia);
      if (a.instantiateWasm)
        try {
          return a.instantiateWasm(d, e);
        } catch (f) {
          return (
            ja("Module.instantiateWasm callback failed with error: " + f), !1
          );
        }
      (function () {
        return ma ||
          "function" !== typeof WebAssembly.instantiateStreaming ||
          x(W, "data:application/octet-stream;base64,") ||
          x(W, "file://") ||
          "function" !== typeof fetch
          ? c(b)
          : fetch(W, { credentials: "same-origin" }).then(function (f) {
              return WebAssembly.instantiateStreaming(f, d).then(
                b,
                function (t) {
                  ja("wasm streaming compile failed: " + t);
                  ja("falling back to ArrayBuffer instantiation");
                  return c(b);
                }
              );
            });
      })().catch(va);
      return {};
    })();
    var hb = (a.___wasm_call_ctors = function () {
      return (hb = a.___wasm_call_ctors = a.asm.__wasm_call_ctors).apply(
        null,
        arguments
      );
    });
    a.___em_js__array_bounds_check_error = function () {
      return (a.___em_js__array_bounds_check_error =
        a.asm.__em_js__array_bounds_check_error).apply(null, arguments);
    };
    var lb = (a._emscripten_bind_VoidPtr___destroy___0 = function () {
        return (lb = a._emscripten_bind_VoidPtr___destroy___0 =
          a.asm.emscripten_bind_VoidPtr___destroy___0).apply(null, arguments);
      }),
      Ma = (a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = function () {
        return (Ma = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 =
          a.asm.emscripten_bind_DecoderBuffer_DecoderBuffer_0).apply(
          null,
          arguments
        );
      }),
      mb = (a._emscripten_bind_DecoderBuffer_Init_2 = function () {
        return (mb = a._emscripten_bind_DecoderBuffer_Init_2 =
          a.asm.emscripten_bind_DecoderBuffer_Init_2).apply(null, arguments);
      }),
      nb = (a._emscripten_bind_DecoderBuffer___destroy___0 = function () {
        return (nb = a._emscripten_bind_DecoderBuffer___destroy___0 =
          a.asm.emscripten_bind_DecoderBuffer___destroy___0).apply(
          null,
          arguments
        );
      }),
      Na = (a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 =
        function () {
          return (Na =
            a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 =
              a.asm.emscripten_bind_AttributeTransformData_AttributeTransformData_0).apply(
            null,
            arguments
          );
        }),
      ob = (a._emscripten_bind_AttributeTransformData_transform_type_0 =
        function () {
          return (ob =
            a._emscripten_bind_AttributeTransformData_transform_type_0 =
              a.asm.emscripten_bind_AttributeTransformData_transform_type_0).apply(
            null,
            arguments
          );
        }),
      pb = (a._emscripten_bind_AttributeTransformData___destroy___0 =
        function () {
          return (pb = a._emscripten_bind_AttributeTransformData___destroy___0 =
            a.asm.emscripten_bind_AttributeTransformData___destroy___0).apply(
            null,
            arguments
          );
        }),
      Oa = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 =
        function () {
          return (Oa =
            a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 =
              a.asm.emscripten_bind_GeometryAttribute_GeometryAttribute_0).apply(
            null,
            arguments
          );
        }),
      qb = (a._emscripten_bind_GeometryAttribute___destroy___0 = function () {
        return (qb = a._emscripten_bind_GeometryAttribute___destroy___0 =
          a.asm.emscripten_bind_GeometryAttribute___destroy___0).apply(
          null,
          arguments
        );
      }),
      Pa = (a._emscripten_bind_PointAttribute_PointAttribute_0 = function () {
        return (Pa = a._emscripten_bind_PointAttribute_PointAttribute_0 =
          a.asm.emscripten_bind_PointAttribute_PointAttribute_0).apply(
          null,
          arguments
        );
      }),
      rb = (a._emscripten_bind_PointAttribute_size_0 = function () {
        return (rb = a._emscripten_bind_PointAttribute_size_0 =
          a.asm.emscripten_bind_PointAttribute_size_0).apply(null, arguments);
      }),
      sb = (a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 =
        function () {
          return (sb =
            a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 =
              a.asm.emscripten_bind_PointAttribute_GetAttributeTransformData_0).apply(
            null,
            arguments
          );
        }),
      tb = (a._emscripten_bind_PointAttribute_attribute_type_0 = function () {
        return (tb = a._emscripten_bind_PointAttribute_attribute_type_0 =
          a.asm.emscripten_bind_PointAttribute_attribute_type_0).apply(
          null,
          arguments
        );
      }),
      ub = (a._emscripten_bind_PointAttribute_data_type_0 = function () {
        return (ub = a._emscripten_bind_PointAttribute_data_type_0 =
          a.asm.emscripten_bind_PointAttribute_data_type_0).apply(
          null,
          arguments
        );
      }),
      vb = (a._emscripten_bind_PointAttribute_num_components_0 = function () {
        return (vb = a._emscripten_bind_PointAttribute_num_components_0 =
          a.asm.emscripten_bind_PointAttribute_num_components_0).apply(
          null,
          arguments
        );
      }),
      wb = (a._emscripten_bind_PointAttribute_normalized_0 = function () {
        return (wb = a._emscripten_bind_PointAttribute_normalized_0 =
          a.asm.emscripten_bind_PointAttribute_normalized_0).apply(
          null,
          arguments
        );
      }),
      xb = (a._emscripten_bind_PointAttribute_byte_stride_0 = function () {
        return (xb = a._emscripten_bind_PointAttribute_byte_stride_0 =
          a.asm.emscripten_bind_PointAttribute_byte_stride_0).apply(
          null,
          arguments
        );
      }),
      yb = (a._emscripten_bind_PointAttribute_byte_offset_0 = function () {
        return (yb = a._emscripten_bind_PointAttribute_byte_offset_0 =
          a.asm.emscripten_bind_PointAttribute_byte_offset_0).apply(
          null,
          arguments
        );
      }),
      zb = (a._emscripten_bind_PointAttribute_unique_id_0 = function () {
        return (zb = a._emscripten_bind_PointAttribute_unique_id_0 =
          a.asm.emscripten_bind_PointAttribute_unique_id_0).apply(
          null,
          arguments
        );
      }),
      Ab = (a._emscripten_bind_PointAttribute___destroy___0 = function () {
        return (Ab = a._emscripten_bind_PointAttribute___destroy___0 =
          a.asm.emscripten_bind_PointAttribute___destroy___0).apply(
          null,
          arguments
        );
      }),
      Qa =
        (a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
          function () {
            return (Qa =
              a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
                a.asm.emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0).apply(
              null,
              arguments
            );
          }),
      Bb =
        (a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 =
          function () {
            return (Bb =
              a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 =
                a.asm.emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1).apply(
              null,
              arguments
            );
          }),
      Cb =
        (a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 =
          function () {
            return (Cb =
              a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 =
                a.asm.emscripten_bind_AttributeQuantizationTransform_quantization_bits_0).apply(
              null,
              arguments
            );
          }),
      Db = (a._emscripten_bind_AttributeQuantizationTransform_min_value_1 =
        function () {
          return (Db =
            a._emscripten_bind_AttributeQuantizationTransform_min_value_1 =
              a.asm.emscripten_bind_AttributeQuantizationTransform_min_value_1).apply(
            null,
            arguments
          );
        }),
      Eb = (a._emscripten_bind_AttributeQuantizationTransform_range_0 =
        function () {
          return (Eb =
            a._emscripten_bind_AttributeQuantizationTransform_range_0 =
              a.asm.emscripten_bind_AttributeQuantizationTransform_range_0).apply(
            null,
            arguments
          );
        }),
      Fb = (a._emscripten_bind_AttributeQuantizationTransform___destroy___0 =
        function () {
          return (Fb =
            a._emscripten_bind_AttributeQuantizationTransform___destroy___0 =
              a.asm.emscripten_bind_AttributeQuantizationTransform___destroy___0).apply(
            null,
            arguments
          );
        }),
      Ra =
        (a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 =
          function () {
            return (Ra =
              a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 =
                a.asm.emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0).apply(
              null,
              arguments
            );
          }),
      Gb =
        (a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 =
          function () {
            return (Gb =
              a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 =
                a.asm.emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1).apply(
              null,
              arguments
            );
          }),
      Hb =
        (a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 =
          function () {
            return (Hb =
              a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 =
                a.asm.emscripten_bind_AttributeOctahedronTransform_quantization_bits_0).apply(
              null,
              arguments
            );
          }),
      Ib = (a._emscripten_bind_AttributeOctahedronTransform___destroy___0 =
        function () {
          return (Ib =
            a._emscripten_bind_AttributeOctahedronTransform___destroy___0 =
              a.asm.emscripten_bind_AttributeOctahedronTransform___destroy___0).apply(
            null,
            arguments
          );
        }),
      Sa = (a._emscripten_bind_PointCloud_PointCloud_0 = function () {
        return (Sa = a._emscripten_bind_PointCloud_PointCloud_0 =
          a.asm.emscripten_bind_PointCloud_PointCloud_0).apply(null, arguments);
      }),
      Jb = (a._emscripten_bind_PointCloud_num_attributes_0 = function () {
        return (Jb = a._emscripten_bind_PointCloud_num_attributes_0 =
          a.asm.emscripten_bind_PointCloud_num_attributes_0).apply(
          null,
          arguments
        );
      }),
      Kb = (a._emscripten_bind_PointCloud_num_points_0 = function () {
        return (Kb = a._emscripten_bind_PointCloud_num_points_0 =
          a.asm.emscripten_bind_PointCloud_num_points_0).apply(null, arguments);
      }),
      Lb = (a._emscripten_bind_PointCloud___destroy___0 = function () {
        return (Lb = a._emscripten_bind_PointCloud___destroy___0 =
          a.asm.emscripten_bind_PointCloud___destroy___0).apply(
          null,
          arguments
        );
      }),
      Ta = (a._emscripten_bind_Mesh_Mesh_0 = function () {
        return (Ta = a._emscripten_bind_Mesh_Mesh_0 =
          a.asm.emscripten_bind_Mesh_Mesh_0).apply(null, arguments);
      }),
      Mb = (a._emscripten_bind_Mesh_num_faces_0 = function () {
        return (Mb = a._emscripten_bind_Mesh_num_faces_0 =
          a.asm.emscripten_bind_Mesh_num_faces_0).apply(null, arguments);
      }),
      Nb = (a._emscripten_bind_Mesh_num_attributes_0 = function () {
        return (Nb = a._emscripten_bind_Mesh_num_attributes_0 =
          a.asm.emscripten_bind_Mesh_num_attributes_0).apply(null, arguments);
      }),
      Ob = (a._emscripten_bind_Mesh_num_points_0 = function () {
        return (Ob = a._emscripten_bind_Mesh_num_points_0 =
          a.asm.emscripten_bind_Mesh_num_points_0).apply(null, arguments);
      }),
      Pb = (a._emscripten_bind_Mesh___destroy___0 = function () {
        return (Pb = a._emscripten_bind_Mesh___destroy___0 =
          a.asm.emscripten_bind_Mesh___destroy___0).apply(null, arguments);
      }),
      Ua = (a._emscripten_bind_Metadata_Metadata_0 = function () {
        return (Ua = a._emscripten_bind_Metadata_Metadata_0 =
          a.asm.emscripten_bind_Metadata_Metadata_0).apply(null, arguments);
      }),
      Qb = (a._emscripten_bind_Metadata___destroy___0 = function () {
        return (Qb = a._emscripten_bind_Metadata___destroy___0 =
          a.asm.emscripten_bind_Metadata___destroy___0).apply(null, arguments);
      }),
      Rb = (a._emscripten_bind_Status_code_0 = function () {
        return (Rb = a._emscripten_bind_Status_code_0 =
          a.asm.emscripten_bind_Status_code_0).apply(null, arguments);
      }),
      Sb = (a._emscripten_bind_Status_ok_0 = function () {
        return (Sb = a._emscripten_bind_Status_ok_0 =
          a.asm.emscripten_bind_Status_ok_0).apply(null, arguments);
      }),
      Tb = (a._emscripten_bind_Status_error_msg_0 = function () {
        return (Tb = a._emscripten_bind_Status_error_msg_0 =
          a.asm.emscripten_bind_Status_error_msg_0).apply(null, arguments);
      }),
      Ub = (a._emscripten_bind_Status___destroy___0 = function () {
        return (Ub = a._emscripten_bind_Status___destroy___0 =
          a.asm.emscripten_bind_Status___destroy___0).apply(null, arguments);
      }),
      Va = (a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 =
        function () {
          return (Va =
            a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 =
              a.asm.emscripten_bind_DracoFloat32Array_DracoFloat32Array_0).apply(
            null,
            arguments
          );
        }),
      Vb = (a._emscripten_bind_DracoFloat32Array_GetValue_1 = function () {
        return (Vb = a._emscripten_bind_DracoFloat32Array_GetValue_1 =
          a.asm.emscripten_bind_DracoFloat32Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      Wb = (a._emscripten_bind_DracoFloat32Array_size_0 = function () {
        return (Wb = a._emscripten_bind_DracoFloat32Array_size_0 =
          a.asm.emscripten_bind_DracoFloat32Array_size_0).apply(
          null,
          arguments
        );
      }),
      Xb = (a._emscripten_bind_DracoFloat32Array___destroy___0 = function () {
        return (Xb = a._emscripten_bind_DracoFloat32Array___destroy___0 =
          a.asm.emscripten_bind_DracoFloat32Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      Wa = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function () {
        return (Wa = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 =
          a.asm.emscripten_bind_DracoInt8Array_DracoInt8Array_0).apply(
          null,
          arguments
        );
      }),
      Yb = (a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
        return (Yb = a._emscripten_bind_DracoInt8Array_GetValue_1 =
          a.asm.emscripten_bind_DracoInt8Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      Zb = (a._emscripten_bind_DracoInt8Array_size_0 = function () {
        return (Zb = a._emscripten_bind_DracoInt8Array_size_0 =
          a.asm.emscripten_bind_DracoInt8Array_size_0).apply(null, arguments);
      }),
      $b = (a._emscripten_bind_DracoInt8Array___destroy___0 = function () {
        return ($b = a._emscripten_bind_DracoInt8Array___destroy___0 =
          a.asm.emscripten_bind_DracoInt8Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      Xa = (a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = function () {
        return (Xa = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 =
          a.asm.emscripten_bind_DracoUInt8Array_DracoUInt8Array_0).apply(
          null,
          arguments
        );
      }),
      ac = (a._emscripten_bind_DracoUInt8Array_GetValue_1 = function () {
        return (ac = a._emscripten_bind_DracoUInt8Array_GetValue_1 =
          a.asm.emscripten_bind_DracoUInt8Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      bc = (a._emscripten_bind_DracoUInt8Array_size_0 = function () {
        return (bc = a._emscripten_bind_DracoUInt8Array_size_0 =
          a.asm.emscripten_bind_DracoUInt8Array_size_0).apply(null, arguments);
      }),
      cc = (a._emscripten_bind_DracoUInt8Array___destroy___0 = function () {
        return (cc = a._emscripten_bind_DracoUInt8Array___destroy___0 =
          a.asm.emscripten_bind_DracoUInt8Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      Ya = (a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = function () {
        return (Ya = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 =
          a.asm.emscripten_bind_DracoInt16Array_DracoInt16Array_0).apply(
          null,
          arguments
        );
      }),
      dc = (a._emscripten_bind_DracoInt16Array_GetValue_1 = function () {
        return (dc = a._emscripten_bind_DracoInt16Array_GetValue_1 =
          a.asm.emscripten_bind_DracoInt16Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      ec = (a._emscripten_bind_DracoInt16Array_size_0 = function () {
        return (ec = a._emscripten_bind_DracoInt16Array_size_0 =
          a.asm.emscripten_bind_DracoInt16Array_size_0).apply(null, arguments);
      }),
      fc = (a._emscripten_bind_DracoInt16Array___destroy___0 = function () {
        return (fc = a._emscripten_bind_DracoInt16Array___destroy___0 =
          a.asm.emscripten_bind_DracoInt16Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      Za = (a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 =
        function () {
          return (Za = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 =
            a.asm.emscripten_bind_DracoUInt16Array_DracoUInt16Array_0).apply(
            null,
            arguments
          );
        }),
      gc = (a._emscripten_bind_DracoUInt16Array_GetValue_1 = function () {
        return (gc = a._emscripten_bind_DracoUInt16Array_GetValue_1 =
          a.asm.emscripten_bind_DracoUInt16Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      hc = (a._emscripten_bind_DracoUInt16Array_size_0 = function () {
        return (hc = a._emscripten_bind_DracoUInt16Array_size_0 =
          a.asm.emscripten_bind_DracoUInt16Array_size_0).apply(null, arguments);
      }),
      ic = (a._emscripten_bind_DracoUInt16Array___destroy___0 = function () {
        return (ic = a._emscripten_bind_DracoUInt16Array___destroy___0 =
          a.asm.emscripten_bind_DracoUInt16Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      $a = (a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = function () {
        return ($a = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 =
          a.asm.emscripten_bind_DracoInt32Array_DracoInt32Array_0).apply(
          null,
          arguments
        );
      }),
      jc = (a._emscripten_bind_DracoInt32Array_GetValue_1 = function () {
        return (jc = a._emscripten_bind_DracoInt32Array_GetValue_1 =
          a.asm.emscripten_bind_DracoInt32Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      kc = (a._emscripten_bind_DracoInt32Array_size_0 = function () {
        return (kc = a._emscripten_bind_DracoInt32Array_size_0 =
          a.asm.emscripten_bind_DracoInt32Array_size_0).apply(null, arguments);
      }),
      lc = (a._emscripten_bind_DracoInt32Array___destroy___0 = function () {
        return (lc = a._emscripten_bind_DracoInt32Array___destroy___0 =
          a.asm.emscripten_bind_DracoInt32Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      ab = (a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 =
        function () {
          return (ab = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 =
            a.asm.emscripten_bind_DracoUInt32Array_DracoUInt32Array_0).apply(
            null,
            arguments
          );
        }),
      mc = (a._emscripten_bind_DracoUInt32Array_GetValue_1 = function () {
        return (mc = a._emscripten_bind_DracoUInt32Array_GetValue_1 =
          a.asm.emscripten_bind_DracoUInt32Array_GetValue_1).apply(
          null,
          arguments
        );
      }),
      nc = (a._emscripten_bind_DracoUInt32Array_size_0 = function () {
        return (nc = a._emscripten_bind_DracoUInt32Array_size_0 =
          a.asm.emscripten_bind_DracoUInt32Array_size_0).apply(null, arguments);
      }),
      oc = (a._emscripten_bind_DracoUInt32Array___destroy___0 = function () {
        return (oc = a._emscripten_bind_DracoUInt32Array___destroy___0 =
          a.asm.emscripten_bind_DracoUInt32Array___destroy___0).apply(
          null,
          arguments
        );
      }),
      bb = (a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = function () {
        return (bb = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 =
          a.asm.emscripten_bind_MetadataQuerier_MetadataQuerier_0).apply(
          null,
          arguments
        );
      }),
      pc = (a._emscripten_bind_MetadataQuerier_HasEntry_2 = function () {
        return (pc = a._emscripten_bind_MetadataQuerier_HasEntry_2 =
          a.asm.emscripten_bind_MetadataQuerier_HasEntry_2).apply(
          null,
          arguments
        );
      }),
      qc = (a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = function () {
        return (qc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 =
          a.asm.emscripten_bind_MetadataQuerier_GetIntEntry_2).apply(
          null,
          arguments
        );
      }),
      rc = (a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 =
        function () {
          return (rc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 =
            a.asm.emscripten_bind_MetadataQuerier_GetIntEntryArray_3).apply(
            null,
            arguments
          );
        }),
      sc = (a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = function () {
        return (sc = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 =
          a.asm.emscripten_bind_MetadataQuerier_GetDoubleEntry_2).apply(
          null,
          arguments
        );
      }),
      tc = (a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = function () {
        return (tc = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 =
          a.asm.emscripten_bind_MetadataQuerier_GetStringEntry_2).apply(
          null,
          arguments
        );
      }),
      uc = (a._emscripten_bind_MetadataQuerier_NumEntries_1 = function () {
        return (uc = a._emscripten_bind_MetadataQuerier_NumEntries_1 =
          a.asm.emscripten_bind_MetadataQuerier_NumEntries_1).apply(
          null,
          arguments
        );
      }),
      vc = (a._emscripten_bind_MetadataQuerier_GetEntryName_2 = function () {
        return (vc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 =
          a.asm.emscripten_bind_MetadataQuerier_GetEntryName_2).apply(
          null,
          arguments
        );
      }),
      wc = (a._emscripten_bind_MetadataQuerier___destroy___0 = function () {
        return (wc = a._emscripten_bind_MetadataQuerier___destroy___0 =
          a.asm.emscripten_bind_MetadataQuerier___destroy___0).apply(
          null,
          arguments
        );
      }),
      cb = (a._emscripten_bind_Decoder_Decoder_0 = function () {
        return (cb = a._emscripten_bind_Decoder_Decoder_0 =
          a.asm.emscripten_bind_Decoder_Decoder_0).apply(null, arguments);
      }),
      xc = (a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = function () {
        return (xc = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 =
          a.asm.emscripten_bind_Decoder_DecodeArrayToPointCloud_3).apply(
          null,
          arguments
        );
      }),
      yc = (a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function () {
        return (yc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 =
          a.asm.emscripten_bind_Decoder_DecodeArrayToMesh_3).apply(
          null,
          arguments
        );
      }),
      zc = (a._emscripten_bind_Decoder_GetAttributeId_2 = function () {
        return (zc = a._emscripten_bind_Decoder_GetAttributeId_2 =
          a.asm.emscripten_bind_Decoder_GetAttributeId_2).apply(
          null,
          arguments
        );
      }),
      Ac = (a._emscripten_bind_Decoder_GetAttributeIdByName_2 = function () {
        return (Ac = a._emscripten_bind_Decoder_GetAttributeIdByName_2 =
          a.asm.emscripten_bind_Decoder_GetAttributeIdByName_2).apply(
          null,
          arguments
        );
      }),
      Bc = (a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 =
        function () {
          return (Bc =
            a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3).apply(
            null,
            arguments
          );
        }),
      Cc = (a._emscripten_bind_Decoder_GetAttribute_2 = function () {
        return (Cc = a._emscripten_bind_Decoder_GetAttribute_2 =
          a.asm.emscripten_bind_Decoder_GetAttribute_2).apply(null, arguments);
      }),
      Dc = (a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = function () {
        return (Dc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 =
          a.asm.emscripten_bind_Decoder_GetAttributeByUniqueId_2).apply(
          null,
          arguments
        );
      }),
      Ec = (a._emscripten_bind_Decoder_GetMetadata_1 = function () {
        return (Ec = a._emscripten_bind_Decoder_GetMetadata_1 =
          a.asm.emscripten_bind_Decoder_GetMetadata_1).apply(null, arguments);
      }),
      Fc = (a._emscripten_bind_Decoder_GetAttributeMetadata_2 = function () {
        return (Fc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 =
          a.asm.emscripten_bind_Decoder_GetAttributeMetadata_2).apply(
          null,
          arguments
        );
      }),
      Gc = (a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function () {
        return (Gc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 =
          a.asm.emscripten_bind_Decoder_GetFaceFromMesh_3).apply(
          null,
          arguments
        );
      }),
      Hc = (a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 =
        function () {
          return (Hc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 =
            a.asm.emscripten_bind_Decoder_GetTriangleStripsFromMesh_2).apply(
            null,
            arguments
          );
        }),
      Ic = (a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = function () {
        return (Ic = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 =
          a.asm.emscripten_bind_Decoder_GetTrianglesUInt16Array_3).apply(
          null,
          arguments
        );
      }),
      Jc = (a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = function () {
        return (Jc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 =
          a.asm.emscripten_bind_Decoder_GetTrianglesUInt32Array_3).apply(
          null,
          arguments
        );
      }),
      Kc = (a._emscripten_bind_Decoder_GetAttributeFloat_3 = function () {
        return (Kc = a._emscripten_bind_Decoder_GetAttributeFloat_3 =
          a.asm.emscripten_bind_Decoder_GetAttributeFloat_3).apply(
          null,
          arguments
        );
      }),
      Lc = (a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 =
        function () {
          return (Lc =
            a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Mc = (a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 =
        function () {
          return (Mc =
            a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeIntForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Nc = (a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 =
        function () {
          return (Nc =
            a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Oc = (a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 =
        function () {
          return (Oc =
            a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Pc = (a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 =
        function () {
          return (Pc =
            a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Qc = (a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 =
        function () {
          return (Qc =
            a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Rc = (a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 =
        function () {
          return (Rc =
            a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Sc = (a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 =
        function () {
          return (Sc =
            a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 =
              a.asm.emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3).apply(
            null,
            arguments
          );
        }),
      Tc = (a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 =
        function () {
          return (Tc =
            a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 =
              a.asm.emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5).apply(
            null,
            arguments
          );
        }),
      Uc = (a._emscripten_bind_Decoder_SkipAttributeTransform_1 = function () {
        return (Uc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 =
          a.asm.emscripten_bind_Decoder_SkipAttributeTransform_1).apply(
          null,
          arguments
        );
      }),
      Vc = (a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 =
        function () {
          return (Vc =
            a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 =
              a.asm.emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1).apply(
            null,
            arguments
          );
        }),
      Wc = (a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 =
        function () {
          return (Wc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 =
            a.asm.emscripten_bind_Decoder_DecodeBufferToPointCloud_2).apply(
            null,
            arguments
          );
        }),
      Xc = (a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = function () {
        return (Xc = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 =
          a.asm.emscripten_bind_Decoder_DecodeBufferToMesh_2).apply(
          null,
          arguments
        );
      }),
      Yc = (a._emscripten_bind_Decoder___destroy___0 = function () {
        return (Yc = a._emscripten_bind_Decoder___destroy___0 =
          a.asm.emscripten_bind_Decoder___destroy___0).apply(null, arguments);
      }),
      Zc =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM =
          function () {
            return (Zc =
              a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM =
                a.asm.emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM).apply(
              null,
              arguments
            );
          }),
      $c =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM =
          function () {
            return ($c =
              a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM =
                a.asm.emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM).apply(
              null,
              arguments
            );
          }),
      ad =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM =
          function () {
            return (ad =
              a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM =
                a.asm.emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM).apply(
              null,
              arguments
            );
          }),
      bd =
        (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM =
          function () {
            return (bd =
              a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM =
                a.asm.emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM).apply(
              null,
              arguments
            );
          }),
      cd = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID =
        function () {
          return (cd = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID =
            a.asm.emscripten_enum_draco_GeometryAttribute_Type_INVALID).apply(
            null,
            arguments
          );
        }),
      dd = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION =
        function () {
          return (dd =
            a._emscripten_enum_draco_GeometryAttribute_Type_POSITION =
              a.asm.emscripten_enum_draco_GeometryAttribute_Type_POSITION).apply(
            null,
            arguments
          );
        }),
      ed = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL =
        function () {
          return (ed = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL =
            a.asm.emscripten_enum_draco_GeometryAttribute_Type_NORMAL).apply(
            null,
            arguments
          );
        }),
      fd = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR =
        function () {
          return (fd = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR =
            a.asm.emscripten_enum_draco_GeometryAttribute_Type_COLOR).apply(
            null,
            arguments
          );
        }),
      gd = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD =
        function () {
          return (gd =
            a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD =
              a.asm.emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD).apply(
            null,
            arguments
          );
        }),
      hd = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC =
        function () {
          return (hd = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC =
            a.asm.emscripten_enum_draco_GeometryAttribute_Type_GENERIC).apply(
            null,
            arguments
          );
        }),
      id = (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE =
        function () {
          return (id =
            a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE =
              a.asm.emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE).apply(
            null,
            arguments
          );
        }),
      jd = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD =
        function () {
          return (jd =
            a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD =
              a.asm.emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD).apply(
            null,
            arguments
          );
        }),
      kd = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH =
        function () {
          return (kd =
            a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH =
              a.asm.emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH).apply(
            null,
            arguments
          );
        }),
      ld = (a._emscripten_enum_draco_DataType_DT_INVALID = function () {
        return (ld = a._emscripten_enum_draco_DataType_DT_INVALID =
          a.asm.emscripten_enum_draco_DataType_DT_INVALID).apply(
          null,
          arguments
        );
      }),
      md = (a._emscripten_enum_draco_DataType_DT_INT8 = function () {
        return (md = a._emscripten_enum_draco_DataType_DT_INT8 =
          a.asm.emscripten_enum_draco_DataType_DT_INT8).apply(null, arguments);
      }),
      nd = (a._emscripten_enum_draco_DataType_DT_UINT8 = function () {
        return (nd = a._emscripten_enum_draco_DataType_DT_UINT8 =
          a.asm.emscripten_enum_draco_DataType_DT_UINT8).apply(null, arguments);
      }),
      od = (a._emscripten_enum_draco_DataType_DT_INT16 = function () {
        return (od = a._emscripten_enum_draco_DataType_DT_INT16 =
          a.asm.emscripten_enum_draco_DataType_DT_INT16).apply(null, arguments);
      }),
      pd = (a._emscripten_enum_draco_DataType_DT_UINT16 = function () {
        return (pd = a._emscripten_enum_draco_DataType_DT_UINT16 =
          a.asm.emscripten_enum_draco_DataType_DT_UINT16).apply(
          null,
          arguments
        );
      }),
      qd = (a._emscripten_enum_draco_DataType_DT_INT32 = function () {
        return (qd = a._emscripten_enum_draco_DataType_DT_INT32 =
          a.asm.emscripten_enum_draco_DataType_DT_INT32).apply(null, arguments);
      }),
      rd = (a._emscripten_enum_draco_DataType_DT_UINT32 = function () {
        return (rd = a._emscripten_enum_draco_DataType_DT_UINT32 =
          a.asm.emscripten_enum_draco_DataType_DT_UINT32).apply(
          null,
          arguments
        );
      }),
      sd = (a._emscripten_enum_draco_DataType_DT_INT64 = function () {
        return (sd = a._emscripten_enum_draco_DataType_DT_INT64 =
          a.asm.emscripten_enum_draco_DataType_DT_INT64).apply(null, arguments);
      }),
      td = (a._emscripten_enum_draco_DataType_DT_UINT64 = function () {
        return (td = a._emscripten_enum_draco_DataType_DT_UINT64 =
          a.asm.emscripten_enum_draco_DataType_DT_UINT64).apply(
          null,
          arguments
        );
      }),
      ud = (a._emscripten_enum_draco_DataType_DT_FLOAT32 = function () {
        return (ud = a._emscripten_enum_draco_DataType_DT_FLOAT32 =
          a.asm.emscripten_enum_draco_DataType_DT_FLOAT32).apply(
          null,
          arguments
        );
      }),
      vd = (a._emscripten_enum_draco_DataType_DT_FLOAT64 = function () {
        return (vd = a._emscripten_enum_draco_DataType_DT_FLOAT64 =
          a.asm.emscripten_enum_draco_DataType_DT_FLOAT64).apply(
          null,
          arguments
        );
      }),
      wd = (a._emscripten_enum_draco_DataType_DT_BOOL = function () {
        return (wd = a._emscripten_enum_draco_DataType_DT_BOOL =
          a.asm.emscripten_enum_draco_DataType_DT_BOOL).apply(null, arguments);
      }),
      xd = (a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = function () {
        return (xd = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT =
          a.asm.emscripten_enum_draco_DataType_DT_TYPES_COUNT).apply(
          null,
          arguments
        );
      }),
      yd = (a._emscripten_enum_draco_StatusCode_OK = function () {
        return (yd = a._emscripten_enum_draco_StatusCode_OK =
          a.asm.emscripten_enum_draco_StatusCode_OK).apply(null, arguments);
      }),
      zd = (a._emscripten_enum_draco_StatusCode_DRACO_ERROR = function () {
        return (zd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR =
          a.asm.emscripten_enum_draco_StatusCode_DRACO_ERROR).apply(
          null,
          arguments
        );
      }),
      Ad = (a._emscripten_enum_draco_StatusCode_IO_ERROR = function () {
        return (Ad = a._emscripten_enum_draco_StatusCode_IO_ERROR =
          a.asm.emscripten_enum_draco_StatusCode_IO_ERROR).apply(
          null,
          arguments
        );
      }),
      Bd = (a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER =
        function () {
          return (Bd = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER =
            a.asm.emscripten_enum_draco_StatusCode_INVALID_PARAMETER).apply(
            null,
            arguments
          );
        }),
      Cd = (a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION =
        function () {
          return (Cd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION =
            a.asm.emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION).apply(
            null,
            arguments
          );
        }),
      Dd = (a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = function () {
        return (Dd = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION =
          a.asm.emscripten_enum_draco_StatusCode_UNKNOWN_VERSION).apply(
          null,
          arguments
        );
      });
    a.___errno_location = function () {
      return (a.___errno_location = a.asm.__errno_location).apply(
        null,
        arguments
      );
    };
    a.stackSave = function () {
      return (a.stackSave = a.asm.stackSave).apply(null, arguments);
    };
    a.stackRestore = function () {
      return (a.stackRestore = a.asm.stackRestore).apply(null, arguments);
    };
    a.stackAlloc = function () {
      return (a.stackAlloc = a.asm.stackAlloc).apply(null, arguments);
    };
    a._setThrew = function () {
      return (a._setThrew = a.asm.setThrew).apply(null, arguments);
    };
    a._free = function () {
      return (a._free = a.asm.free).apply(null, arguments);
    };
    var ib = (a._malloc = function () {
      return (ib = a._malloc = a.asm.malloc).apply(null, arguments);
    });
    a.dynCall_jiji = function () {
      return (a.dynCall_jiji = a.asm.dynCall_jiji).apply(null, arguments);
    };
    var ua;
    pa = function b() {
      ua || fa();
      ua || (pa = b);
    };
    a.run = fa;
    if (a.preInit)
      for (
        "function" == typeof a.preInit && (a.preInit = [a.preInit]);
        0 < a.preInit.length;

      )
        a.preInit.pop()();
    fa();
    v.prototype = Object.create(v.prototype);
    v.prototype.constructor = v;
    v.prototype.__class__ = v;
    v.__cache__ = {};
    a.WrapperObject = v;
    a.getCache = z;
    a.wrapPointer = S;
    a.castObject = function (b, c) {
      return S(b.ptr, c);
    };
    a.NULL = S(0);
    a.destroy = function (b) {
      if (!b.__destroy__)
        throw "Error: Cannot destroy object. (Did you create it yourself?)";
      b.__destroy__();
      delete z(b.__class__)[b.ptr];
    };
    a.compare = function (b, c) {
      return b.ptr === c.ptr;
    };
    a.getPointer = function (b) {
      return b.ptr;
    };
    a.getClass = function (b) {
      return b.__class__;
    };
    var r = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (r.needed) {
          for (var b = 0; b < r.temps.length; b++) a._free(r.temps[b]);
          r.temps.length = 0;
          a._free(r.buffer);
          r.buffer = 0;
          r.size += r.needed;
          r.needed = 0;
        }
        r.buffer ||
          ((r.size += 128), (r.buffer = a._malloc(r.size)), q(r.buffer));
        r.pos = 0;
      },
      alloc: function (b, c) {
        q(r.buffer);
        b = b.length * c.BYTES_PER_ELEMENT;
        b = (b + 7) & -8;
        r.pos + b >= r.size
          ? (q(0 < b), (r.needed += b), (c = a._malloc(b)), r.temps.push(c))
          : ((c = r.buffer + r.pos), (r.pos += b));
        return c;
      },
      copy: function (b, c, d) {
        d >>>= 0;
        switch (c.BYTES_PER_ELEMENT) {
          case 2:
            d >>>= 1;
            break;
          case 4:
            d >>>= 2;
            break;
          case 8:
            d >>>= 3;
        }
        for (var f = 0; f < b.length; f++) c[d + f] = b[f];
      },
    };
    aa.prototype = Object.create(v.prototype);
    aa.prototype.constructor = aa;
    aa.prototype.__class__ = aa;
    aa.__cache__ = {};
    a.VoidPtr = aa;
    aa.prototype.__destroy__ = aa.prototype.__destroy__ = function () {
      lb(this.ptr);
    };
    T.prototype = Object.create(v.prototype);
    T.prototype.constructor = T;
    T.prototype.__class__ = T;
    T.__cache__ = {};
    a.DecoderBuffer = T;
    T.prototype.Init = T.prototype.Init = function (b, c) {
      var d = this.ptr;
      r.prepare();
      "object" == typeof b && (b = xa(b));
      c && "object" === typeof c && (c = c.ptr);
      mb(d, b, c);
    };
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      nb(this.ptr);
    };
    R.prototype = Object.create(v.prototype);
    R.prototype.constructor = R;
    R.prototype.__class__ = R;
    R.__cache__ = {};
    a.AttributeTransformData = R;
    R.prototype.transform_type = R.prototype.transform_type = function () {
      return ob(this.ptr);
    };
    R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
      pb(this.ptr);
    };
    X.prototype = Object.create(v.prototype);
    X.prototype.constructor = X;
    X.prototype.__class__ = X;
    X.__cache__ = {};
    a.GeometryAttribute = X;
    X.prototype.__destroy__ = X.prototype.__destroy__ = function () {
      qb(this.ptr);
    };
    w.prototype = Object.create(v.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    a.PointAttribute = w;
    w.prototype.size = w.prototype.size = function () {
      return rb(this.ptr);
    };
    w.prototype.GetAttributeTransformData =
      w.prototype.GetAttributeTransformData = function () {
        return S(sb(this.ptr), R);
      };
    w.prototype.attribute_type = w.prototype.attribute_type = function () {
      return tb(this.ptr);
    };
    w.prototype.data_type = w.prototype.data_type = function () {
      return ub(this.ptr);
    };
    w.prototype.num_components = w.prototype.num_components = function () {
      return vb(this.ptr);
    };
    w.prototype.normalized = w.prototype.normalized = function () {
      return !!wb(this.ptr);
    };
    w.prototype.byte_stride = w.prototype.byte_stride = function () {
      return xb(this.ptr);
    };
    w.prototype.byte_offset = w.prototype.byte_offset = function () {
      return yb(this.ptr);
    };
    w.prototype.unique_id = w.prototype.unique_id = function () {
      return zb(this.ptr);
    };
    w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
      Ab(this.ptr);
    };
    C.prototype = Object.create(v.prototype);
    C.prototype.constructor = C;
    C.prototype.__class__ = C;
    C.__cache__ = {};
    a.AttributeQuantizationTransform = C;
    C.prototype.InitFromAttribute = C.prototype.InitFromAttribute = function (
      b
    ) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return !!Bb(c, b);
    };
    C.prototype.quantization_bits = C.prototype.quantization_bits =
      function () {
        return Cb(this.ptr);
      };
    C.prototype.min_value = C.prototype.min_value = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return Db(c, b);
    };
    C.prototype.range = C.prototype.range = function () {
      return Eb(this.ptr);
    };
    C.prototype.__destroy__ = C.prototype.__destroy__ = function () {
      Fb(this.ptr);
    };
    I.prototype = Object.create(v.prototype);
    I.prototype.constructor = I;
    I.prototype.__class__ = I;
    I.__cache__ = {};
    a.AttributeOctahedronTransform = I;
    I.prototype.InitFromAttribute = I.prototype.InitFromAttribute = function (
      b
    ) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return !!Gb(c, b);
    };
    I.prototype.quantization_bits = I.prototype.quantization_bits =
      function () {
        return Hb(this.ptr);
      };
    I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
      Ib(this.ptr);
    };
    J.prototype = Object.create(v.prototype);
    J.prototype.constructor = J;
    J.prototype.__class__ = J;
    J.__cache__ = {};
    a.PointCloud = J;
    J.prototype.num_attributes = J.prototype.num_attributes = function () {
      return Jb(this.ptr);
    };
    J.prototype.num_points = J.prototype.num_points = function () {
      return Kb(this.ptr);
    };
    J.prototype.__destroy__ = J.prototype.__destroy__ = function () {
      Lb(this.ptr);
    };
    E.prototype = Object.create(v.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    a.Mesh = E;
    E.prototype.num_faces = E.prototype.num_faces = function () {
      return Mb(this.ptr);
    };
    E.prototype.num_attributes = E.prototype.num_attributes = function () {
      return Nb(this.ptr);
    };
    E.prototype.num_points = E.prototype.num_points = function () {
      return Ob(this.ptr);
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      Pb(this.ptr);
    };
    U.prototype = Object.create(v.prototype);
    U.prototype.constructor = U;
    U.prototype.__class__ = U;
    U.__cache__ = {};
    a.Metadata = U;
    U.prototype.__destroy__ = U.prototype.__destroy__ = function () {
      Qb(this.ptr);
    };
    B.prototype = Object.create(v.prototype);
    B.prototype.constructor = B;
    B.prototype.__class__ = B;
    B.__cache__ = {};
    a.Status = B;
    B.prototype.code = B.prototype.code = function () {
      return Rb(this.ptr);
    };
    B.prototype.ok = B.prototype.ok = function () {
      return !!Sb(this.ptr);
    };
    B.prototype.error_msg = B.prototype.error_msg = function () {
      return A(Tb(this.ptr));
    };
    B.prototype.__destroy__ = B.prototype.__destroy__ = function () {
      Ub(this.ptr);
    };
    K.prototype = Object.create(v.prototype);
    K.prototype.constructor = K;
    K.prototype.__class__ = K;
    K.__cache__ = {};
    a.DracoFloat32Array = K;
    K.prototype.GetValue = K.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return Vb(c, b);
    };
    K.prototype.size = K.prototype.size = function () {
      return Wb(this.ptr);
    };
    K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
      Xb(this.ptr);
    };
    L.prototype = Object.create(v.prototype);
    L.prototype.constructor = L;
    L.prototype.__class__ = L;
    L.__cache__ = {};
    a.DracoInt8Array = L;
    L.prototype.GetValue = L.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return Yb(c, b);
    };
    L.prototype.size = L.prototype.size = function () {
      return Zb(this.ptr);
    };
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      $b(this.ptr);
    };
    M.prototype = Object.create(v.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    a.DracoUInt8Array = M;
    M.prototype.GetValue = M.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return ac(c, b);
    };
    M.prototype.size = M.prototype.size = function () {
      return bc(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      cc(this.ptr);
    };
    N.prototype = Object.create(v.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    a.DracoInt16Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return dc(c, b);
    };
    N.prototype.size = N.prototype.size = function () {
      return ec(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      fc(this.ptr);
    };
    O.prototype = Object.create(v.prototype);
    O.prototype.constructor = O;
    O.prototype.__class__ = O;
    O.__cache__ = {};
    a.DracoUInt16Array = O;
    O.prototype.GetValue = O.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return gc(c, b);
    };
    O.prototype.size = O.prototype.size = function () {
      return hc(this.ptr);
    };
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      ic(this.ptr);
    };
    P.prototype = Object.create(v.prototype);
    P.prototype.constructor = P;
    P.prototype.__class__ = P;
    P.__cache__ = {};
    a.DracoInt32Array = P;
    P.prototype.GetValue = P.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return jc(c, b);
    };
    P.prototype.size = P.prototype.size = function () {
      return kc(this.ptr);
    };
    P.prototype.__destroy__ = P.prototype.__destroy__ = function () {
      lc(this.ptr);
    };
    Q.prototype = Object.create(v.prototype);
    Q.prototype.constructor = Q;
    Q.prototype.__class__ = Q;
    Q.__cache__ = {};
    a.DracoUInt32Array = Q;
    Q.prototype.GetValue = Q.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return mc(c, b);
    };
    Q.prototype.size = Q.prototype.size = function () {
      return nc(this.ptr);
    };
    Q.prototype.__destroy__ = Q.prototype.__destroy__ = function () {
      oc(this.ptr);
    };
    y.prototype = Object.create(v.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    a.MetadataQuerier = y;
    y.prototype.HasEntry = y.prototype.HasEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && "object" === typeof b && (b = b.ptr);
      c = c && "object" === typeof c ? c.ptr : da(c);
      return !!pc(d, b, c);
    };
    y.prototype.GetIntEntry = y.prototype.GetIntEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && "object" === typeof b && (b = b.ptr);
      c = c && "object" === typeof c ? c.ptr : da(c);
      return qc(d, b, c);
    };
    y.prototype.GetIntEntryArray = y.prototype.GetIntEntryArray = function (
      b,
      c,
      d
    ) {
      var f = this.ptr;
      r.prepare();
      b && "object" === typeof b && (b = b.ptr);
      c = c && "object" === typeof c ? c.ptr : da(c);
      d && "object" === typeof d && (d = d.ptr);
      rc(f, b, c, d);
    };
    y.prototype.GetDoubleEntry = y.prototype.GetDoubleEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && "object" === typeof b && (b = b.ptr);
      c = c && "object" === typeof c ? c.ptr : da(c);
      return sc(d, b, c);
    };
    y.prototype.GetStringEntry = y.prototype.GetStringEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && "object" === typeof b && (b = b.ptr);
      c = c && "object" === typeof c ? c.ptr : da(c);
      return A(tc(d, b, c));
    };
    y.prototype.NumEntries = y.prototype.NumEntries = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return uc(c, b);
    };
    y.prototype.GetEntryName = y.prototype.GetEntryName = function (b, c) {
      var d = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      return A(vc(d, b, c));
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      wc(this.ptr);
    };
    k.prototype = Object.create(v.prototype);
    k.prototype.constructor = k;
    k.prototype.__class__ = k;
    k.__cache__ = {};
    a.Decoder = k;
    k.prototype.DecodeArrayToPointCloud = k.prototype.DecodeArrayToPointCloud =
      function (b, c, d) {
        var f = this.ptr;
        r.prepare();
        "object" == typeof b && (b = xa(b));
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return S(xc(f, b, c, d), B);
      };
    k.prototype.DecodeArrayToMesh = k.prototype.DecodeArrayToMesh = function (
      b,
      c,
      d
    ) {
      var f = this.ptr;
      r.prepare();
      "object" == typeof b && (b = xa(b));
      c && "object" === typeof c && (c = c.ptr);
      d && "object" === typeof d && (d = d.ptr);
      return S(yc(f, b, c, d), B);
    };
    k.prototype.GetAttributeId = k.prototype.GetAttributeId = function (b, c) {
      var d = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      return zc(d, b, c);
    };
    k.prototype.GetAttributeIdByName = k.prototype.GetAttributeIdByName =
      function (b, c) {
        var d = this.ptr;
        r.prepare();
        b && "object" === typeof b && (b = b.ptr);
        c = c && "object" === typeof c ? c.ptr : da(c);
        return Ac(d, b, c);
      };
    k.prototype.GetAttributeIdByMetadataEntry =
      k.prototype.GetAttributeIdByMetadataEntry = function (b, c, d) {
        var f = this.ptr;
        r.prepare();
        b && "object" === typeof b && (b = b.ptr);
        c = c && "object" === typeof c ? c.ptr : da(c);
        d = d && "object" === typeof d ? d.ptr : da(d);
        return Bc(f, b, c, d);
      };
    k.prototype.GetAttribute = k.prototype.GetAttribute = function (b, c) {
      var d = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      return S(Cc(d, b, c), w);
    };
    k.prototype.GetAttributeByUniqueId = k.prototype.GetAttributeByUniqueId =
      function (b, c) {
        var d = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        return S(Dc(d, b, c), w);
      };
    k.prototype.GetMetadata = k.prototype.GetMetadata = function (b) {
      var c = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      return S(Ec(c, b), U);
    };
    k.prototype.GetAttributeMetadata = k.prototype.GetAttributeMetadata =
      function (b, c) {
        var d = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        return S(Fc(d, b, c), U);
      };
    k.prototype.GetFaceFromMesh = k.prototype.GetFaceFromMesh = function (
      b,
      c,
      d
    ) {
      var f = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      d && "object" === typeof d && (d = d.ptr);
      return !!Gc(f, b, c, d);
    };
    k.prototype.GetTriangleStripsFromMesh =
      k.prototype.GetTriangleStripsFromMesh = function (b, c) {
        var d = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        return Hc(d, b, c);
      };
    k.prototype.GetTrianglesUInt16Array = k.prototype.GetTrianglesUInt16Array =
      function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Ic(f, b, c, d);
      };
    k.prototype.GetTrianglesUInt32Array = k.prototype.GetTrianglesUInt32Array =
      function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Jc(f, b, c, d);
      };
    k.prototype.GetAttributeFloat = k.prototype.GetAttributeFloat = function (
      b,
      c,
      d
    ) {
      var f = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      d && "object" === typeof d && (d = d.ptr);
      return !!Kc(f, b, c, d);
    };
    k.prototype.GetAttributeFloatForAllPoints =
      k.prototype.GetAttributeFloatForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Lc(f, b, c, d);
      };
    k.prototype.GetAttributeIntForAllPoints =
      k.prototype.GetAttributeIntForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Mc(f, b, c, d);
      };
    k.prototype.GetAttributeInt8ForAllPoints =
      k.prototype.GetAttributeInt8ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Nc(f, b, c, d);
      };
    k.prototype.GetAttributeUInt8ForAllPoints =
      k.prototype.GetAttributeUInt8ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Oc(f, b, c, d);
      };
    k.prototype.GetAttributeInt16ForAllPoints =
      k.prototype.GetAttributeInt16ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Pc(f, b, c, d);
      };
    k.prototype.GetAttributeUInt16ForAllPoints =
      k.prototype.GetAttributeUInt16ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Qc(f, b, c, d);
      };
    k.prototype.GetAttributeInt32ForAllPoints =
      k.prototype.GetAttributeInt32ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Rc(f, b, c, d);
      };
    k.prototype.GetAttributeUInt32ForAllPoints =
      k.prototype.GetAttributeUInt32ForAllPoints = function (b, c, d) {
        var f = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        return !!Sc(f, b, c, d);
      };
    k.prototype.GetAttributeDataArrayForAllPoints =
      k.prototype.GetAttributeDataArrayForAllPoints = function (b, c, d, f, t) {
        var ca = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        d && "object" === typeof d && (d = d.ptr);
        f && "object" === typeof f && (f = f.ptr);
        t && "object" === typeof t && (t = t.ptr);
        return !!Tc(ca, b, c, d, f, t);
      };
    k.prototype.SkipAttributeTransform = k.prototype.SkipAttributeTransform =
      function (b) {
        var c = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        Uc(c, b);
      };
    k.prototype.GetEncodedGeometryType_Deprecated =
      k.prototype.GetEncodedGeometryType_Deprecated = function (b) {
        var c = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        return Vc(c, b);
      };
    k.prototype.DecodeBufferToPointCloud =
      k.prototype.DecodeBufferToPointCloud = function (b, c) {
        var d = this.ptr;
        b && "object" === typeof b && (b = b.ptr);
        c && "object" === typeof c && (c = c.ptr);
        return S(Wc(d, b, c), B);
      };
    k.prototype.DecodeBufferToMesh = k.prototype.DecodeBufferToMesh = function (
      b,
      c
    ) {
      var d = this.ptr;
      b && "object" === typeof b && (b = b.ptr);
      c && "object" === typeof c && (c = c.ptr);
      return S(Xc(d, b, c), B);
    };
    k.prototype.__destroy__ = k.prototype.__destroy__ = function () {
      Yc(this.ptr);
    };
    (function () {
      function b() {
        a.ATTRIBUTE_INVALID_TRANSFORM = Zc();
        a.ATTRIBUTE_NO_TRANSFORM = $c();
        a.ATTRIBUTE_QUANTIZATION_TRANSFORM = ad();
        a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = bd();
        a.INVALID = cd();
        a.POSITION = dd();
        a.NORMAL = ed();
        a.COLOR = fd();
        a.TEX_COORD = gd();
        a.GENERIC = hd();
        a.INVALID_GEOMETRY_TYPE = id();
        a.POINT_CLOUD = jd();
        a.TRIANGULAR_MESH = kd();
        a.DT_INVALID = ld();
        a.DT_INT8 = md();
        a.DT_UINT8 = nd();
        a.DT_INT16 = od();
        a.DT_UINT16 = pd();
        a.DT_INT32 = qd();
        a.DT_UINT32 = rd();
        a.DT_INT64 = sd();
        a.DT_UINT64 = td();
        a.DT_FLOAT32 = ud();
        a.DT_FLOAT64 = vd();
        a.DT_BOOL = wd();
        a.DT_TYPES_COUNT = xd();
        a.OK = yd();
        a.DRACO_ERROR = zd();
        a.IO_ERROR = Ad();
        a.INVALID_PARAMETER = Bd();
        a.UNSUPPORTED_VERSION = Cd();
        a.UNKNOWN_VERSION = Dd();
      }
      Ga ? b() : Ia.unshift(b);
    })();
    if ("function" === typeof a.onModuleParsed) a.onModuleParsed();
    a.Decoder.prototype.GetEncodedGeometryType = function (b) {
      if (b.__class__ && b.__class__ === a.DecoderBuffer)
        return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b);
      if (8 > b.byteLength) return a.INVALID_GEOMETRY_TYPE;
      switch (b[7]) {
        case 0:
          return a.POINT_CLOUD;
        case 1:
          return a.TRIANGULAR_MESH;
        default:
          return a.INVALID_GEOMETRY_TYPE;
      }
    };
    return n.ready;
  };
})();
"object" === typeof exports && "object" === typeof module
  ? (module.exports = DracoDecoderModule)
  : "function" === typeof define && define.amd
  ? define([], function () {
      return DracoDecoderModule;
    })
  : "object" === typeof exports &&
    (exports.DracoDecoderModule = DracoDecoderModule);
