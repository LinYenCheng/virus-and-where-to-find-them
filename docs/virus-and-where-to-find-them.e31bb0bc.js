parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"hRTX":[function(require,module,exports) {
"use strict";module.exports=function(r,n){return function(){for(var t=new Array(arguments.length),e=0;e<t.length;e++)t[e]=arguments[e];return r.apply(n,t)}};
},{}],"Feqj":[function(require,module,exports) {
"use strict";var r=require("./helpers/bind"),e=Object.prototype.toString;function t(r){return"[object Array]"===e.call(r)}function n(r){return void 0===r}function o(r){return null!==r&&!n(r)&&null!==r.constructor&&!n(r.constructor)&&"function"==typeof r.constructor.isBuffer&&r.constructor.isBuffer(r)}function u(r){return"[object ArrayBuffer]"===e.call(r)}function f(r){return"undefined"!=typeof FormData&&r instanceof FormData}function i(r){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(r):r&&r.buffer&&r.buffer instanceof ArrayBuffer}function c(r){return"string"==typeof r}function a(r){return"number"==typeof r}function l(r){return null!==r&&"object"==typeof r}function s(r){return"[object Date]"===e.call(r)}function p(r){return"[object File]"===e.call(r)}function y(r){return"[object Blob]"===e.call(r)}function d(r){return"[object Function]"===e.call(r)}function b(r){return l(r)&&d(r.pipe)}function j(r){return"undefined"!=typeof URLSearchParams&&r instanceof URLSearchParams}function v(r){return r.replace(/^\s*/,"").replace(/\s*$/,"")}function m(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&("undefined"!=typeof window&&"undefined"!=typeof document)}function B(r,e){if(null!=r)if("object"!=typeof r&&(r=[r]),t(r))for(var n=0,o=r.length;n<o;n++)e.call(null,r[n],n,r);else for(var u in r)Object.prototype.hasOwnProperty.call(r,u)&&e.call(null,r[u],u,r)}function g(){var r={};function e(e,t){"object"==typeof r[t]&&"object"==typeof e?r[t]=g(r[t],e):r[t]=e}for(var t=0,n=arguments.length;t<n;t++)B(arguments[t],e);return r}function h(){var r={};function e(e,t){"object"==typeof r[t]&&"object"==typeof e?r[t]=h(r[t],e):r[t]="object"==typeof e?h({},e):e}for(var t=0,n=arguments.length;t<n;t++)B(arguments[t],e);return r}function A(e,t,n){return B(t,function(t,o){e[o]=n&&"function"==typeof t?r(t,n):t}),e}module.exports={isArray:t,isArrayBuffer:u,isBuffer:o,isFormData:f,isArrayBufferView:i,isString:c,isNumber:a,isObject:l,isUndefined:n,isDate:s,isFile:p,isBlob:y,isFunction:d,isStream:b,isURLSearchParams:j,isStandardBrowserEnv:m,forEach:B,merge:g,deepMerge:h,extend:A,trim:v};
},{"./helpers/bind":"hRTX"}],"phSU":[function(require,module,exports) {
"use strict";var e=require("./../utils");function r(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}module.exports=function(i,n,t){if(!n)return i;var a;if(t)a=t(n);else if(e.isURLSearchParams(n))a=n.toString();else{var c=[];e.forEach(n,function(i,n){null!=i&&(e.isArray(i)?n+="[]":i=[i],e.forEach(i,function(i){e.isDate(i)?i=i.toISOString():e.isObject(i)&&(i=JSON.stringify(i)),c.push(r(n)+"="+r(i))}))}),a=c.join("&")}if(a){var l=i.indexOf("#");-1!==l&&(i=i.slice(0,l)),i+=(-1===i.indexOf("?")?"?":"&")+a}return i};
},{"./../utils":"Feqj"}],"xpeW":[function(require,module,exports) {
"use strict";var t=require("./../utils");function e(){this.handlers=[]}e.prototype.use=function(t,e){return this.handlers.push({fulfilled:t,rejected:e}),this.handlers.length-1},e.prototype.eject=function(t){this.handlers[t]&&(this.handlers[t]=null)},e.prototype.forEach=function(e){t.forEach(this.handlers,function(t){null!==t&&e(t)})},module.exports=e;
},{"./../utils":"Feqj"}],"IAOH":[function(require,module,exports) {
"use strict";var r=require("./../utils");module.exports=function(t,u,e){return r.forEach(e,function(r){t=r(t,u)}),t};
},{"./../utils":"Feqj"}],"mXc0":[function(require,module,exports) {
"use strict";module.exports=function(t){return!(!t||!t.__CANCEL__)};
},{}],"njyv":[function(require,module,exports) {
"use strict";var e=require("../utils");module.exports=function(t,r){e.forEach(t,function(e,o){o!==r&&o.toUpperCase()===r.toUpperCase()&&(t[r]=e,delete t[o])})};
},{"../utils":"Feqj"}],"Lpyz":[function(require,module,exports) {
"use strict";module.exports=function(e,i,s,t,n){return e.config=i,s&&(e.code=s),e.request=t,e.response=n,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e};
},{}],"NZT3":[function(require,module,exports) {
"use strict";var r=require("./enhanceError");module.exports=function(e,n,o,t,u){var a=new Error(e);return r(a,n,o,t,u)};
},{"./enhanceError":"Lpyz"}],"Ztkp":[function(require,module,exports) {
"use strict";var t=require("./createError");module.exports=function(e,s,r){var u=r.config.validateStatus;!u||u(r.status)?e(r):s(t("Request failed with status code "+r.status,r.config,null,r.request,r))};
},{"./createError":"NZT3"}],"R56a":[function(require,module,exports) {
"use strict";module.exports=function(t){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(t)};
},{}],"uRyQ":[function(require,module,exports) {
"use strict";module.exports=function(e,r){return r?e.replace(/\/+$/,"")+"/"+r.replace(/^\/+/,""):e};
},{}],"dm4E":[function(require,module,exports) {
"use strict";var e=require("../helpers/isAbsoluteURL"),r=require("../helpers/combineURLs");module.exports=function(s,u){return s&&!e(u)?r(s,u):u};
},{"../helpers/isAbsoluteURL":"R56a","../helpers/combineURLs":"uRyQ"}],"Zn5P":[function(require,module,exports) {
"use strict";var e=require("./../utils"),t=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];module.exports=function(r){var i,o,n,s={};return r?(e.forEach(r.split("\n"),function(r){if(n=r.indexOf(":"),i=e.trim(r.substr(0,n)).toLowerCase(),o=e.trim(r.substr(n+1)),i){if(s[i]&&t.indexOf(i)>=0)return;s[i]="set-cookie"===i?(s[i]?s[i]:[]).concat([o]):s[i]?s[i]+", "+o:o}}),s):s};
},{"./../utils":"Feqj"}],"Rpqp":[function(require,module,exports) {
"use strict";var t=require("./../utils");module.exports=t.isStandardBrowserEnv()?function(){var r,e=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");function a(t){var r=t;return e&&(o.setAttribute("href",r),r=o.href),o.setAttribute("href",r),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}return r=a(window.location.href),function(e){var o=t.isString(e)?a(e):e;return o.protocol===r.protocol&&o.host===r.host}}():function(){return!0};
},{"./../utils":"Feqj"}],"MLCl":[function(require,module,exports) {
"use strict";var e=require("./../utils");module.exports=e.isStandardBrowserEnv()?{write:function(n,t,o,r,i,u){var s=[];s.push(n+"="+encodeURIComponent(t)),e.isNumber(o)&&s.push("expires="+new Date(o).toGMTString()),e.isString(r)&&s.push("path="+r),e.isString(i)&&s.push("domain="+i),!0===u&&s.push("secure"),document.cookie=s.join("; ")},read:function(e){var n=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return n?decodeURIComponent(n[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}};
},{"./../utils":"Feqj"}],"akUF":[function(require,module,exports) {
"use strict";var e=require("./../utils"),r=require("./../core/settle"),t=require("./../helpers/buildURL"),s=require("../core/buildFullPath"),o=require("./../helpers/parseHeaders"),n=require("./../helpers/isURLSameOrigin"),a=require("../core/createError");module.exports=function(i){return new Promise(function(u,l){var d=i.data,p=i.headers;e.isFormData(d)&&delete p["Content-Type"];var c=new XMLHttpRequest;if(i.auth){var f=i.auth.username||"",h=i.auth.password||"";p.Authorization="Basic "+btoa(f+":"+h)}var m=s(i.baseURL,i.url);if(c.open(i.method.toUpperCase(),t(m,i.params,i.paramsSerializer),!0),c.timeout=i.timeout,c.onreadystatechange=function(){if(c&&4===c.readyState&&(0!==c.status||c.responseURL&&0===c.responseURL.indexOf("file:"))){var e="getAllResponseHeaders"in c?o(c.getAllResponseHeaders()):null,t={data:i.responseType&&"text"!==i.responseType?c.response:c.responseText,status:c.status,statusText:c.statusText,headers:e,config:i,request:c};r(u,l,t),c=null}},c.onabort=function(){c&&(l(a("Request aborted",i,"ECONNABORTED",c)),c=null)},c.onerror=function(){l(a("Network Error",i,null,c)),c=null},c.ontimeout=function(){var e="timeout of "+i.timeout+"ms exceeded";i.timeoutErrorMessage&&(e=i.timeoutErrorMessage),l(a(e,i,"ECONNABORTED",c)),c=null},e.isStandardBrowserEnv()){var v=require("./../helpers/cookies"),T=(i.withCredentials||n(m))&&i.xsrfCookieName?v.read(i.xsrfCookieName):void 0;T&&(p[i.xsrfHeaderName]=T)}if("setRequestHeader"in c&&e.forEach(p,function(e,r){void 0===d&&"content-type"===r.toLowerCase()?delete p[r]:c.setRequestHeader(r,e)}),e.isUndefined(i.withCredentials)||(c.withCredentials=!!i.withCredentials),i.responseType)try{c.responseType=i.responseType}catch(g){if("json"!==i.responseType)throw g}"function"==typeof i.onDownloadProgress&&c.addEventListener("progress",i.onDownloadProgress),"function"==typeof i.onUploadProgress&&c.upload&&c.upload.addEventListener("progress",i.onUploadProgress),i.cancelToken&&i.cancelToken.promise.then(function(e){c&&(c.abort(),l(e),c=null)}),void 0===d&&(d=null),c.send(d)})};
},{"./../utils":"Feqj","./../core/settle":"Ztkp","./../helpers/buildURL":"phSU","../core/buildFullPath":"dm4E","./../helpers/parseHeaders":"Zn5P","./../helpers/isURLSameOrigin":"Rpqp","../core/createError":"NZT3","./../helpers/cookies":"MLCl"}],"g5IB":[function(require,module,exports) {

var t,e,n=module.exports={};function r(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function i(e){if(t===setTimeout)return setTimeout(e,0);if((t===r||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}function u(t){if(e===clearTimeout)return clearTimeout(t);if((e===o||!e)&&clearTimeout)return e=clearTimeout,clearTimeout(t);try{return e(t)}catch(n){try{return e.call(null,t)}catch(n){return e.call(this,t)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:r}catch(n){t=r}try{e="function"==typeof clearTimeout?clearTimeout:o}catch(n){e=o}}();var c,s=[],l=!1,a=-1;function f(){l&&c&&(l=!1,c.length?s=c.concat(s):a=-1,s.length&&h())}function h(){if(!l){var t=i(f);l=!0;for(var e=s.length;e;){for(c=s,s=[];++a<e;)c&&c[a].run();a=-1,e=s.length}c=null,l=!1,u(t)}}function m(t,e){this.fun=t,this.array=e}function p(){}n.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];s.push(new m(t,e)),1!==s.length||l||i(h)},m.prototype.run=function(){this.fun.apply(null,this.array)},n.title="browser",n.env={},n.argv=[],n.version="",n.versions={},n.on=p,n.addListener=p,n.once=p,n.off=p,n.removeListener=p,n.removeAllListeners=p,n.emit=p,n.prependListener=p,n.prependOnceListener=p,n.listeners=function(t){return[]},n.binding=function(t){throw new Error("process.binding is not supported")},n.cwd=function(){return"/"},n.chdir=function(t){throw new Error("process.chdir is not supported")},n.umask=function(){return 0};
},{}],"A14q":[function(require,module,exports) {
var process = require("process");
var e=require("process"),t=require("./utils"),r=require("./helpers/normalizeHeaderName"),n={"Content-Type":"application/x-www-form-urlencoded"};function a(e,r){!t.isUndefined(e)&&t.isUndefined(e["Content-Type"])&&(e["Content-Type"]=r)}function i(){var t;return"undefined"!=typeof XMLHttpRequest?t=require("./adapters/xhr"):void 0!==e&&"[object process]"===Object.prototype.toString.call(e)&&(t=require("./adapters/http")),t}var o={adapter:i(),transformRequest:[function(e,n){return r(n,"Accept"),r(n,"Content-Type"),t.isFormData(e)||t.isArrayBuffer(e)||t.isBuffer(e)||t.isStream(e)||t.isFile(e)||t.isBlob(e)?e:t.isArrayBufferView(e)?e.buffer:t.isURLSearchParams(e)?(a(n,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):t.isObject(e)?(a(n,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(t){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};t.forEach(["delete","get","head"],function(e){o.headers[e]={}}),t.forEach(["post","put","patch"],function(e){o.headers[e]=t.merge(n)}),module.exports=o;
},{"./utils":"Feqj","./helpers/normalizeHeaderName":"njyv","./adapters/xhr":"akUF","./adapters/http":"akUF","process":"g5IB"}],"HALK":[function(require,module,exports) {
"use strict";var e=require("./../utils"),r=require("./transformData"),a=require("../cancel/isCancel"),t=require("../defaults");function s(e){e.cancelToken&&e.cancelToken.throwIfRequested()}module.exports=function(n){return s(n),n.headers=n.headers||{},n.data=r(n.data,n.headers,n.transformRequest),n.headers=e.merge(n.headers.common||{},n.headers[n.method]||{},n.headers),e.forEach(["delete","get","head","post","put","patch","common"],function(e){delete n.headers[e]}),(n.adapter||t.adapter)(n).then(function(e){return s(n),e.data=r(e.data,e.headers,n.transformResponse),e},function(e){return a(e)||(s(n),e&&e.response&&(e.response.data=r(e.response.data,e.response.headers,n.transformResponse))),Promise.reject(e)})};
},{"./../utils":"Feqj","./transformData":"IAOH","../cancel/isCancel":"mXc0","../defaults":"A14q"}],"fBI1":[function(require,module,exports) {
"use strict";var e=require("../utils");module.exports=function(t,r){r=r||{};var o={},a=["url","method","params","data"],n=["headers","auth","proxy"],s=["baseURL","url","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"];e.forEach(a,function(e){void 0!==r[e]&&(o[e]=r[e])}),e.forEach(n,function(a){e.isObject(r[a])?o[a]=e.deepMerge(t[a],r[a]):void 0!==r[a]?o[a]=r[a]:e.isObject(t[a])?o[a]=e.deepMerge(t[a]):void 0!==t[a]&&(o[a]=t[a])}),e.forEach(s,function(e){void 0!==r[e]?o[e]=r[e]:void 0!==t[e]&&(o[e]=t[e])});var i=a.concat(n).concat(s),c=Object.keys(r).filter(function(e){return-1===i.indexOf(e)});return e.forEach(c,function(e){void 0!==r[e]?o[e]=r[e]:void 0!==t[e]&&(o[e]=t[e])}),o};
},{"../utils":"Feqj"}],"trUU":[function(require,module,exports) {
"use strict";var e=require("./../utils"),t=require("../helpers/buildURL"),r=require("./InterceptorManager"),o=require("./dispatchRequest"),s=require("./mergeConfig");function i(e){this.defaults=e,this.interceptors={request:new r,response:new r}}i.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{}).url=arguments[0]:e=e||{},(e=s(this.defaults,e)).method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[o,void 0],r=Promise.resolve(e);for(this.interceptors.request.forEach(function(e){t.unshift(e.fulfilled,e.rejected)}),this.interceptors.response.forEach(function(e){t.push(e.fulfilled,e.rejected)});t.length;)r=r.then(t.shift(),t.shift());return r},i.prototype.getUri=function(e){return e=s(this.defaults,e),t(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},e.forEach(["delete","get","head","options"],function(t){i.prototype[t]=function(r,o){return this.request(e.merge(o||{},{method:t,url:r}))}}),e.forEach(["post","put","patch"],function(t){i.prototype[t]=function(r,o,s){return this.request(e.merge(s||{},{method:t,url:r,data:o}))}}),module.exports=i;
},{"./../utils":"Feqj","../helpers/buildURL":"phSU","./InterceptorManager":"xpeW","./dispatchRequest":"HALK","./mergeConfig":"fBI1"}],"qFUg":[function(require,module,exports) {
"use strict";function t(t){this.message=t}t.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},t.prototype.__CANCEL__=!0,module.exports=t;
},{}],"VgQU":[function(require,module,exports) {
"use strict";var e=require("./Cancel");function n(n){if("function"!=typeof n)throw new TypeError("executor must be a function.");var o;this.promise=new Promise(function(e){o=e});var r=this;n(function(n){r.reason||(r.reason=new e(n),o(r.reason))})}n.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},n.source=function(){var e;return{token:new n(function(n){e=n}),cancel:e}},module.exports=n;
},{"./Cancel":"qFUg"}],"yisB":[function(require,module,exports) {
"use strict";module.exports=function(n){return function(t){return n.apply(null,t)}};
},{}],"Wzmt":[function(require,module,exports) {
"use strict";var e=require("./utils"),r=require("./helpers/bind"),n=require("./core/Axios"),u=require("./core/mergeConfig"),t=require("./defaults");function i(u){var t=new n(u),i=r(n.prototype.request,t);return e.extend(i,n.prototype,t),e.extend(i,t),i}var l=i(t);l.Axios=n,l.create=function(e){return i(u(l.defaults,e))},l.Cancel=require("./cancel/Cancel"),l.CancelToken=require("./cancel/CancelToken"),l.isCancel=require("./cancel/isCancel"),l.all=function(e){return Promise.all(e)},l.spread=require("./helpers/spread"),module.exports=l,module.exports.default=l;
},{"./utils":"Feqj","./helpers/bind":"hRTX","./core/Axios":"trUU","./core/mergeConfig":"fBI1","./defaults":"A14q","./cancel/Cancel":"qFUg","./cancel/CancelToken":"VgQU","./cancel/isCancel":"mXc0","./helpers/spread":"yisB"}],"O4Aa":[function(require,module,exports) {
module.exports=require("./lib/axios");
},{"./lib/axios":"Wzmt"}],"MSGv":[function(require,module,exports) {
module.exports="virus.a6810822.png";
},{}],"Focm":[function(require,module,exports) {
"use strict";var t=o(require("axios")),a=o(require("./virus.png"));function o(t){return t&&t.__esModule?t:{default:t}}function n(t,a){return c(t)||e(t,a)||r()}function r(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function e(t,a){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t)){var o=[],n=!0,r=!1,e=void 0;try{for(var c,i=t[Symbol.iterator]();!(n=(c=i.next()).done)&&(o.push(c.value),!a||o.length!==a);n=!0);}catch(s){r=!0,e=s}finally{try{n||null==i.return||i.return()}finally{if(r)throw e}}return o}}function c(t){if(Array.isArray(t))return t}var i=L.map("map").setView([23.5,120.644],5),s=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(i),u=L.icon({iconUrl:a.default,iconSize:[25,25],iconAnchor:[22,22],popupAnchor:[-10,-25]}),d=[],l=[];function p(t){for(var a=t.split("\n"),o=[],n=a[0].split(","),r=1;r<a.length;r++){for(var e={},c=a[r].split(","),i=0;i<n.length;i++)e[n[i]]=c[i];o.push(e)}return JSON.stringify(o)}var h=function(t){var a=n(t,2),o=a[0],r=a[1],e=function(t,a){var o=Math.random(),n=Math.random();if(a&&n<o){var r=n;n=o,o=r}return[n*t*Math.cos(2*Math.PI*o/n),n*t*Math.sin(2*Math.PI*o/n)]}(arguments.length>1&&void 0!==arguments[1]?arguments[1]:9e4,!0),c=e[0]/6378137,i=e[1]/(6378137*Math.cos(Math.PI*(parseFloat(o)/180)));return[parseFloat(o)+c*(180/Math.PI).toFixed(5),parseFloat(r)+i*(180/Math.PI).toFixed(5)]};t.default.all([t.default.get("https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/analytics/country"),t.default.get("https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/v2/analytics/area?limit=100")]).then(t.default.spread(function(t,a){t.data.filter(function(t){return"China"!==t.country&&"Hong Kong"!==t.country&&"N/A"!==t.country}).map(function(t){return[t.country,t.total_confirmed,"確診","".concat(t.lat," ").concat(t.lng),t.country]}).concat(a.data.filter(function(t){return"N/A"!==t.state}).map(function(t){return[t.state,t.total_confirmed,"確診","".concat(t.lat," ").concat(t.lng),t.state]})).forEach(function(t){var a=parseInt(t[1]),o=L.marker(t[3].split(" "),{icon:u}).bindPopup("".concat(t[4],"確診：").concat(t[1]));for(l.push(o);a--;){var n=t[3].split(" ");a>1e3?d.push(h(n,3*a)):a>2e3?d.push(h(n,1.5*a)):a>3e3?d.push(h(n,1.2*a)):a>4e3?d.push(h(n,1.1*a)):d.push(h(n,100*a))}});var o=L.layerGroup(l).addTo(i);L.heatLayer(d,{radius:25,blur:20,minOpacity:.5}).addTo(i);i.on("zoomend",function(){var t=i.getZoom();t<5&&i.removeLayer(o),t>=5&&(i.hasLayer(o)?console.log("layer already added"):i.addLayer(o))})})),t.default.get("https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/v2/stats/diff/global").then(function(t){var a=[],o=[],n=[],r=[],e=[];t.data.forEach(function(t){a.push(t.ytd.toString().substring(0,10)),o.push(t.diffConfirmed),n.push(t.todayConfirmed),r.push(t.todayDeath),e.push(t.todayRecover)});c3.generate({bindto:"#chart--line",data:{x:"date",xFormat:"%Y-%m-%d",columns:[["date"].concat(a),["增加數量"].concat(o),["全球確診病例"].concat(n)],axes:{"全球確診病例":"y","增加數量":"y2"}},axis:{x:{type:"timeseries",tick:{format:"%m-%d"}},y2:{show:!0}}}),c3.generate({bindto:"#chart--bar",data:{x:"date",xFormat:"%Y-%m-%d",columns:[["date"].concat(a),["死亡數量"].concat(r),["恢復數量"].concat(e)],axes:{"死亡數量":"y","恢復數量":"y2"}},axis:{x:{type:"timeseries",tick:{format:"%m-%d"}},y2:{show:!0}}});var c=t.data[0],i=c.todayConfirmed,s=c.todayDeath,u=c.todayRecover;c3.generate({bindto:"#chart--dounut",data:{columns:[["治療中",i-s-u],["恢復",u],["死亡",s]],type:"donut"},donut:{title:"武漢肺炎",label:{format:function(t,a,o){return t}}}})}),$("#btn-open").click(function(){$("#modal").css("opacity",1),$("#modal").css("zIndex",1e3),$("#btn-open").css("zIndex",-1)}),$("#btn-close").click(function(){$("#modal").css("opacity",0),$("#modal").css("zIndex",-1),$("#btn-open").css("zIndex",2)});
},{"axios":"O4Aa","./virus.png":"MSGv"}]},{},["Focm"], null)
//# sourceMappingURL=virus-and-where-to-find-them.e31bb0bc.js.map