!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dtShape=e()}(this,(function(){"use strict";function t(t){return null==t||t.nodeType?"simple":t instanceof Array?"array":"object"==typeof t?"object":"simple"}function e(e,r,o,s,c,...a){let[u,i]=s;Object.keys(e).forEach((l=>{let f=t(e[l]),p=e[l],d="array"===t(r),h=!isNaN(l),b=Symbol("ignore___");if("simple"!==f&&i){if(p=i({value:p,key:l,breadcrumbs:`${c}/${l}`,IGNORE:b},...a),p===b)return;f=t(p)}if("simple"===f){if(!u)return void(r[l]=p);let t=u({value:p,key:l,breadcrumbs:`${c}/${l}`,IGNORE:b},...a);if(t===b)return;const e=function(t,e){return e instanceof Array&&!isNaN(t)}(l,r);e?r.push(t):r[l]=t}if("object"===f){const t={};d&&h?r.push(t):r[l]=t,o.push(n(p,t,o,s,`${c}/${l}`,a))}if("array"===f){const t=[];d&&h?r.push(t):r[l]=t,o.push(n(p,t,o,s,`${c}/${l}`,a))}}))}function*n(t,n,r,o,s,c){yield e(t,n,r,o,s,...c)}function r({data:n,keyCallback:r,objectCallback:o},...s){let c,a=[],u="root",i=[r,o];switch(t(n)){case"array":c=[],e(n,c,a,i,u,...s);break;case"object":c={},e(n,c,a,i,u,...s);break;case"simple":return n}for(const t of a)t.next();return c}function o(t,e){return function(n,r){const{convert:o,isDTO:s,isDTM:c,walk:a}=t();let u,i;s(r)?(u=r.export(),i=r.copy()):c(r)?(u=a({data:r}),i=a({data:r})):([i,,u]=o.from("std").toFlat(t,r),console.warn('A non "dt-object" data segment was inserted. Autoconverted to "dt-object".'));const l=new RegExp("^root/");u.forEach((t=>{t[0]===t[2]&&(t[0]=n,t[2]=n),t[2]=t[2].replace(l,`${n}/`),t[3].forEach(((e,r)=>t[3][r]=e.replace(l,`${n}/`)))})),e.insert([i,,u])}}function s(t,e){return t=>e.export(t)}function c(t,e){return function(n="root"){const r=e.getCopy(n),{walk:o}=t();return r?o({data:r}):null}}function a(t,e,n){return function(){let r=[],o={};const{convert:s,draft:c,INIT_DATA_TYPES:a,main:{load:u}}=t(),i={set:c.set(r,o),connect:c.connect(o),save:c.save(o),push:c.push(o)},[l,...f]=arguments,{as:p}=l({...n,...i},...f)||{},d=0===r.length?e.export():r,h=!!p&&a.includes(p);let b;return"dt-object"===p?u(d):p&&!h?(console.error(`Model '${p}' is unknown data-model.`),null):(b=p?s.to(p,t,d):u(d),e.resetScan(),b)}}function u(t,e,n){return function(){const{main:{load:r},draft:o}=t(),[s,...c]=arguments;let a=[],u={};const i={set:o.set(a,u),connect:o.connect(u),save:o.save(u),push:o.push(u)};return s({...n,...i},...c),e.resetScan(),0===a.length?this:r(a)}}function i(t){return function(e,n){t.setupFilter(e,n)}}function l(t,e){const{flatData:n}=t(),[r,l]=n(t,e),f={insertSegment:o(t,r),export:s(0,r),copy:c(t,r),model:a(t,r,l),query:u(t,r,l),setupFilter:i(r),listSegments:()=>Object.keys(r.getIndexes()).reduce(((t,e)=>(e.includes("/")||t.push(e),t)),[]),index:p};function p(t){if(null==t)return null;let e=r.getLine(t);if(e){let t,[n,r,o,s]=e;return t=r instanceof Array?[...r]:{...r},[n,t,o,[...s]]}return null}return f.extractList=function(t,e,n){return function(r,o){const s=n("root"),{main:{load:c},INIT_DATA_TYPES:a}=t(),u=[...a,"dt-object"];let i=!1,l="";if(o&&(o.as||(i=!0,l='Options should be an object and property "as" is required'),i||u.includes(o.as)||(i=!0,l=`Invalid option "as" value: ${o.as}.`),i))throw new Error(l);return r.map((t=>{let n=e.export(t);return 0===n.length?s[1].hasOwnProperty(t)?s[1][t]:null:n})).map((t=>null==t?null:t instanceof Array?c(t).model((()=>o)):t))}}(t,r,p),f}function f(t,e,n){return function(r){const[o,,s]=r,c=s[0][0],[a,u,i]=t,l=n();a[c]=o,s.forEach((t=>{const[,,n]=t;u[n]=t,i.push(t),l.forEach((n=>e(n,t)))}))}}function p(t){return function(e){const[,n,r]=t;if(e&&!n[e])return[];if(!e){const t=[];return r.forEach((e=>{const[n,r,o,s]=e,c=r instanceof Array?[...r]:{...r};t.push([n,c,o,[...s]])})),t}const o=[];return r.forEach((t=>{const[n,r,s,c]=t,a=new RegExp(`^${e}/`);if(s===e||s.match(a)){let t=n===s?"root":n,e=r instanceof Array?[...r]:{...r},u=s.includes("/")?s.replace(a,"root/"):"root",i=c.map((t=>t.replace(a,"root/")));o.push([t,e,u,i])}})),o}}function d(t,e,n,r){return function(o,s){const c=r(),[,,a]=t;if(c.includes(o))return console.error(`Filter name "${o}" is already defined`),this;e[o]=s,a.forEach((t=>n(o,t)))}}function h(t){return function(e){const n=t.getIndexes(),r=n[e],o=[];return r?(o.push(r),b(n,o,r[3]),t.setupScanList(o),this):(t.setupScanList([]),this)}}function b(t,e,n){n.forEach((n=>{const r=t[n];r&&(e.push(r),b(t,e,r[3]))}))}function m(t){return function(e){const n=[];return t.getScanList().forEach((t=>{t[0]===e&&n.push(t)})),t.setupScanList(n),this}}function y(t){return function(e){const n=[],r=e instanceof Array?e:[e];return t.getScanList().forEach((t=>{const e=t[0];r.forEach((r=>{e.includes(r)&&n.push(t)}))})),t.setupScanList(n),this}}function $(t){return function(e){t.getScanList().forEach((n=>{const[r,o,s,c]=n,a=o instanceof Array,u=()=>"$__NEXT__LOOK_",i=()=>"$__FINISH__WITH__THE__LOOKING_";let l=!1;const f=c.map((t=>{let e=t.replace(`${s}/`,"");return[r,e]}));if(a)0===o.length?p([]):o.every(((t,n)=>{if(l)return!1;const c=e({value:t,key:n,name:r,flatData:o,breadcrumbs:s,links:f,next:u,finish:i});return"$__FINISH__WITH__THE__LOOKING_"===c&&(l=!0),!["$__FINISH__WITH__THE__LOOKING_","$__NEXT__LOOK_"].includes(c)}));else{const t=Object.entries(o);0===t.length?p({}):t.every((([t,n])=>{if(l)return!1;const c=e({value:n,key:t,name:r,flatData:o,breadcrumbs:s,links:f,next:u,finish:i});return"$__FINISH__WITH__THE__LOOKING_"===c&&(l=!0),!["$__FINISH__WITH__THE__LOOKING_","$__NEXT__LOOK_"].includes(c)}))}function p(t){e({value:null,key:null,name:r,flatData:t,breadcrumbs:s,links:f,empty:!0,next:u,finish:i})}t.resetScan()}))}}function _(t){return function(e){const n=[];return t.getScanList().every((t=>t[2]!==e||(n.push(t),!1))),t.setupScanList(n),this}}function g({flatData:t}){return t instanceof Array}function E({name:t,flatData:e}){return!(e instanceof Array||isNaN(t))}function j({flatData:t}){return!(t instanceof Array)}function O({name:t,breadcrumbs:e}){return t===e}function v(t,e){const[n,r,o]=e,s=[n,r,o],c={},a={list:g,listObject:E,object:j,root:O};let u=o;const i=()=>Object.keys(a),l=(t,e)=>{if(a[t]){const[n,o,s,u]=e;if(c[t]||(c[t]=[]),a[t]({name:n,flatData:o,breadcrumbs:s,edges:u})){const e=r[s];c[t].push(e)}}};i().forEach((t=>o.forEach((e=>l(t,e)))));const b={insert:f(s,l,i),export:p(s),getCopy:t=>n[t]?n[t]:null,getIndexes:()=>r,getLine:t=>r[t]?r[t]:null,getFilters:()=>c,getScanList:()=>u,setupScanList:t=>u=t,setupFilter:d(s,a,l,i),resetScan:()=>{u=o}};var v;return[b,{from:h(b),use:(v=b,function(t){const e=v.getFilters()[t];return e&&v.setupScanList(e),this}),get:_(b),find:m(b),like:y(b),look:$(b)}]}var k=function(t,e){const n=e instanceof Array?[]:{},{walk:r}=t(),o=[["root",n,"root",[]]],s={root:o[0]},c=r({data:e,keyCallback:function({value:t,key:e,breadcrumbs:n}){const r=new RegExp(`/${e}$`),o=n.replace(r,"");return s[o][1][e]=t,t},objectCallback:function({value:t,key:e,breadcrumbs:n}){const r=t instanceof Array?[]:{},c=e,a=new RegExp(`/${e}$`),u=n.replace(a,""),i=[c,r,n,[]];return s[u][3].push(n),o.push(i),s[n]=o.at(-1),t}});return[{root:c},s,o]},I=function(t){let e={};return t.reverse().forEach((([t,n,r,o])=>{const s=n instanceof Array?[...n]:{...n};e[r]=s,o.forEach((t=>{if(e[t]){const n=t.replace(`${r}/`,"");e[r][n]=e[t]}}))})),e.root},S=function(t,e){const n=Object.entries(e),{walk:r}=t(),o={},s=[],c={},a={};function u(t){c[t]||(c[t]="object");const e=t.split("/");1!=e.length&&(e.pop(),1!=e.length&&u(e.join("/")))}return n.forEach((([t,e])=>{t.startsWith("root")||(t=`root/${t}`),u(t),function(t,e){Object.keys(e).forEach((e=>{isNaN(e)||(c[t]="array")}))}(t,e),a[t]=e})),Object.entries(c).forEach((([t,e])=>{if("object"===a[t])return;if(a[t]){const n=a[t]instanceof Array;if("array"===e&&!n){const e=Object.values(a[t]);a[t]=e}return}const n="object"===e?{}:[];a[t]=n})),Object.entries(a).sort().forEach((([t,e])=>{const n=t.split("/").pop(),r=t.replace(`/${n}`,""),c=[n,e instanceof Array?[...e]:{...e},t,[]];o[t]=c,s.push(c),"root"!==t&&r&&o[r]&&o[r][3].push(t)})),[r({data:e}),o,s]},A=function(t){const e={};return t.forEach((t=>{const[,n,r]=t;if(0===Object.keys(n).length)return;const o=r.replace("root/",""),s=n instanceof Array?[...n]:{...n};e[o]=s})),e},N=function(t,e){const{walk:n}=t(),r={},o={root:[]},s=[];function c(t){if("root"===t)return;const e=t.split("/");e.pop();const n=e.join("/");o[n]||(o[n]=[]),n.includes("/")&&c(n)}e.forEach((t=>{const[e,n]=t,r="root"===e?"root":`root/${e}`;o[r]?o[r].push(n):o[r]=[n],c(r)}));let a=Object.entries(o).sort();const u={root:"object"};return a.forEach((([t,e])=>{if("root"===t)return;const n=t.split("/"),r=n.pop(),o=n.join("/");"array"!==u[o]&&!isNaN(r)&&(u[o]="array"),0===e.length&&(u[t]="object")})),a=Object.entries(o).sort(),a.forEach((([t,e])=>{const[n,o,c]=function(t){let e,n,r;if("root"==t)return e="root",n="root",r=null,[e,n,r];const o=t.split("/");return 2===o.length&&(e="root",n="root",r=o.pop()),o.length>2&&(r=o.pop(),e=o.pop(),n=0===o.length?`root/${e}`:`${o.join("/")}/${e}`),[e,n,r]}(t),a=0===e.length,i=1===e.length;let l,f;if(a){if(r[`${o}/${c}`])return;return null==c?(f="object"===u.root?{}:[],l=["root",f,"root",[]],r.root=l,void s.push(l)):(f="object"===u[`${o}/${c}`]?{}:[],l=[c,f,`${o}/${c}`,[]],r[`${o}/${c}`]=l,void s.push(l))}if(!i)return l=[c,e,`${o}/${c}`,[]],r[`${o}/${c}`]=l,void s.push(l);if(r[`${o}`])r[o][1][c]=e[0];else{const t={};t[c]=e[0],l=[n,t,o,[]],r[o]=l,s.push(l)}})),s.reverse(),s.forEach((t=>{const[e,n,o]=t,s=o.replace(`/${e}`,""),c=r[s];s!==o&&c&&c[3].push(o)})),s.reverse(),[n({data:e}),r,s]},T=function(t){let e=[];return t.forEach((t=>{const[n,r,o]=t,s=r instanceof Array;let c="";"root"!==n&&(c=o.replace("root/","")),s?0==c.length?r.forEach(((t,n)=>e.push(["root",t]))):r.forEach((t=>e.push([c,t]))):Object.entries(r).forEach((([t,n])=>{0==c.length?e.push([t,n]):e.push([`${c}/${t}`,n])}))})),e};const x=t=>(e,n)=>{switch(t){case"std":case"standard":return k(e,n);case"tuple":case"tuples":return N(e,n);case"breadcrumb":case"breadcrumbs":const t=Object.entries(n);return N(e,t);case"file":case"files":const r=n.map((t=>{let e=t.split("/");1===e.length&&(e=["root"].concat(e));const n=e.pop();return[e.join("/"),n]}));return N(e,r);case"midFlat":return S(e,n)}return[["object",0],{}]};var w={from:function(t){return{toFlat:x(t)}},to:function(t,e,n){const r={},{walk:o}=e(),s=new Set,c=new Set;let a,u=0;switch(t){case"flat":case"dt-model":return o({data:n});case"std":case"standard":return I(n);case"midflat":case"midFlat":return A(n);case"tuple":case"tuples":return T(n);case"files":return a=T(n),a.map((([t,e])=>"function"==typeof e?`${t}/function:${e.name}`:e?.nodeType?`${t}/HtmlElement:${e.tagName?e.tagName.toLowerCase():"notSpecified"}`:"root"===t?e:`${t}/${e}`));case"breadcrumb":case"breadcrumbs":let t;return a=T(n),a.forEach((([t,e])=>s.has(t)?c.add(t):s.add(t))),a.forEach((([e,n])=>{c.has(e)?(t!==e&&(t=e,u=0),r["root"===e?u:`${e}/${u}`]=n,u++):r[e]=n})),r}}};function L(t,e,n){const r=t[e],o=r[2];r[2]=n,t[o]=r,r[3].forEach(((e,r)=>{const s=new RegExp(`^${o}/`),c=e.replace(s,`${n}/`);L(t[e],e,c)}))}var F={push:function(t){return function(e,n){const r=!!t[e]&&t[e][1];return r&&r instanceof Array?("object"==typeof value||r.push(n),this):this}},set:function(t,e){return function(n,r){const o=r instanceof Array,s=[];return s.push(n),o?s.push([...r]):s.push({...r}),s.push(n),s.push([]),t.push(s),e[n]=s,this}},connect:function(t){return function(e){e.forEach((e=>{let n=e.split("/");const r=n.pop(),o=n.pop(),s=t[o];if(!t[r])return this;if(!s)return this;if(s[1][r])return this;let c=`${s[2]}/${r}`;return L(t,r,c),s[3].includes(c)||s[3].push(c),this}))}},save:function(t){return function(e,n,r){const o=!!t[e]&&t[e][1];return o?(o[n]||(o[n]=r),this):this}}};const D=["std","standard","tuple","tuples","breadcrumb","breadcrumbs","file","files","midFlat","midflat","flat","dt-model"],H={dependencies:()=>({walk:r,flatData:v,flatObject:l,convert:w,INIT_DATA_TYPES:D,main:{load:H.load},isDTO:t=>"function"==typeof t.insertSegment,isDTM:t=>t instanceof Array&&t[0]instanceof Array&&4===t[0].length&&"root"===t[0][0],draft:F}),init(t,e={}){let{model:n}=Object.assign({},{model:"std"},e),r=H.dependencies;return D.includes(n)?l(r,["flat","dt-model"].includes(n)?H.load(t):w.from(n).toFlat(r,t)):(console.error(`Can't understand your data-model: ${n}. Please, find what is possible on https://github.com/PeterNaydenov/dt-toolbox`),null)},load(t){const e={};t.forEach((t=>{const[,,n]=t;e[n]=t}));const n=r({data:t});return l(H.dependencies,[n,e,t])},flating(t,e={}){let{model:n}=Object.assign({},{model:"std"},e);if(!D.includes(n))return null;let[,,r]=w.from("std").toFlat(H.dependencies,t);return r},converting(t,e={}){let{model:n,as:r}=Object.assign({},{model:"std",as:"std"},e);if(!D.includes(n))return null;if(!D.includes(r))return null;let[,,o]=w.from("std").toFlat(H.dependencies,t);return w.to(r,H.dependencies,o)},getWalk:()=>r},{init:W,load:C,flating:K,converting:G,getWalk:R}=H,P={init:W,load:C,flat:K,convert:G,getWalk:R};function q(t,e){const n=Object.entries(e),r=e instanceof Array;return t.query((e=>{const o=["root"],s={};r?e.set("root",[]):e.set("root",{}),n.forEach((([n,r])=>{let o,[c,a]=function(t){let e=null,n=null;return t.includes("!")?[n,e]=t.split("!"):e=t,[e.split("/"),n]}(n);"list"===a&&(o=[]),"fold"===a&&(o={}),"load"===a&&(o=function(t){let e;return t.forEach((t=>{let n=typeof t;"function"===n&&(n=typeof(t=t())),e=null!=n?t:null})),e}(r)),"load"!==a&&r.forEach((n=>{let r=null,s=null!=t.index(`root/${n}`);if(s)e.get(`root/${n}`).look((({key:t,value:e,flatData:n})=>{if("list"===a)o.push(e);else{if("fold"!==a)return o=n,"next";o[t]=e}}));else{const c=n.split("/"),u=c.pop();c.length>0&&(r=`root/${c.join("/")}`,s=null!=t.index(r)),e.look((({key:t,value:e,breadcrumbs:n})=>{if(s&&n!=r)return"next";t===u&&("list"===a?o.push(e):"fold"===a?o[t]=e:o=e)}))}})),"object"==typeof o&&0===Object.entries(o).length||null!=o&&(s[c.join("/")]=o)}));Object.entries(s).forEach((([t,n])=>{const r=t.split("/"),s=r.pop();let c="root";r.forEach((t=>{o.includes(t)||(e.set(t,{}),e.connect([`${c}/${t}`]),o.push(t)),c=t})),null!=n&&("object"==typeof n?(e.set(s,n),e.connect([`${c}/${s}`])):e.save(c,s,n))}))}))}return q.getDTtoolbox=()=>P,q}));
