(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5301:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(441)}])},8418:function(e,t,n){"use strict";function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(l){o=!0,i=l}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}t.default=void 0;var o,i=(o=n(7294))&&o.__esModule?o:{default:o},a=n(6273),s=n(387),l=n(7190);var c={};function u(e,t,n,r){if(e&&a.isLocalURL(t)){e.prefetch(t,n,r).catch((function(e){0}));var o=r&&"undefined"!==typeof r.locale?r.locale:e&&e.locale;c[t+"%"+n+(o?"%"+o:"")]=!0}}var f=function(e){var t,n=!1!==e.prefetch,o=s.useRouter(),f=i.default.useMemo((function(){var t=r(a.resolveHref(o,e.href,!0),2),n=t[0],i=t[1];return{href:n,as:e.as?a.resolveHref(o,e.as):i||n}}),[o,e.href,e.as]),d=f.href,p=f.as,h=e.children,m=e.replace,v=e.shallow,y=e.scroll,x=e.locale;"string"===typeof h&&(h=i.default.createElement("a",null,h));var g=(t=i.default.Children.only(h))&&"object"===typeof t&&t.ref,b=r(l.useIntersection({rootMargin:"200px"}),2),k=b[0],j=b[1],w=i.default.useCallback((function(e){k(e),g&&("function"===typeof g?g(e):"object"===typeof g&&(g.current=e))}),[g,k]);i.default.useEffect((function(){var e=j&&n&&a.isLocalURL(d),t="undefined"!==typeof x?x:o&&o.locale,r=c[d+"%"+p+(t?"%"+t:"")];e&&!r&&u(o,d,p,{locale:t})}),[p,d,j,x,n,o]);var N={ref:w,onClick:function(e){t.props&&"function"===typeof t.props.onClick&&t.props.onClick(e),e.defaultPrevented||function(e,t,n,r,o,i,s,l){("A"!==e.currentTarget.nodeName||!function(e){var t=e.currentTarget.target;return t&&"_self"!==t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)&&a.isLocalURL(n))&&(e.preventDefault(),null==s&&r.indexOf("#")>=0&&(s=!1),t[o?"replace":"push"](n,r,{shallow:i,locale:l,scroll:s}))}(e,o,d,p,m,v,y,x)},onMouseEnter:function(e){t.props&&"function"===typeof t.props.onMouseEnter&&t.props.onMouseEnter(e),a.isLocalURL(d)&&u(o,d,p,{priority:!0})}};if(e.passHref||"a"===t.type&&!("href"in t.props)){var _="undefined"!==typeof x?x:o&&o.locale,E=o&&o.isLocaleDomain&&a.getDomainLocale(p,_,o&&o.locales,o&&o.domainLocales);N.href=E||a.addBasePath(a.addLocale(p,_,o&&o.defaultLocale))}return i.default.cloneElement(t,N)};t.default=f},7190:function(e,t,n){"use strict";function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(l){o=!0,i=l}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}Object.defineProperty(t,"__esModule",{value:!0}),t.useIntersection=function(e){var t=e.rootMargin,n=e.disabled||!a,l=o.useRef(),c=r(o.useState(!1),2),u=c[0],f=c[1],d=o.useCallback((function(e){l.current&&(l.current(),l.current=void 0),n||u||e&&e.tagName&&(l.current=function(e,t,n){var r=function(e){var t=e.rootMargin||"",n=s.get(t);if(n)return n;var r=new Map,o=new IntersectionObserver((function(e){e.forEach((function(e){var t=r.get(e.target),n=e.isIntersecting||e.intersectionRatio>0;t&&n&&t(n)}))}),e);return s.set(t,n={id:t,observer:o,elements:r}),n}(n),o=r.id,i=r.observer,a=r.elements;return a.set(e,t),i.observe(e),function(){a.delete(e),i.unobserve(e),0===a.size&&(i.disconnect(),s.delete(o))}}(e,(function(e){return e&&f(e)}),{rootMargin:t}))}),[n,t,u]);return o.useEffect((function(){if(!a&&!u){var e=i.requestIdleCallback((function(){return f(!0)}));return function(){return i.cancelIdleCallback(e)}}}),[u]),[d,u]};var o=n(7294),i=n(9311),a="undefined"!==typeof IntersectionObserver;var s=new Map},2936:function(e,t,n){"use strict";var r=n(5893),o=n(1664),i=n(3180),a=function(e){var t=e.title,n=e.href;return(0,r.jsx)(o.default,{href:n,passHref:!0,children:(0,r.jsx)("a",{title:t,className:"underline underline-offset-4 decoration-slate-500 hover:text-slate-500",children:(0,r.jsx)("li",{className:"text-sm font-mono",children:t})})})};t.Z=function(){return(0,r.jsxs)("header",{children:[(0,r.jsx)("h1",{className:"font-mono font-bold text-xl",children:i.title}),(0,r.jsxs)("div",{className:"mt-4 pb-8 inline-block border-b border-gray-200",children:[(0,r.jsx)("p",{className:"text-sm",children:i.intro}),(0,r.jsx)("nav",{className:"mt-4",children:(0,r.jsxs)("ul",{className:"flex space-x-4",children:[(0,r.jsx)(a,{title:"LinkedIn",href:"https://uk.linkedin.com/in/mikekaperys"}),(0,r.jsx)(a,{title:"GitHub",href:"https://github.com/kaperys"}),(0,r.jsx)(a,{title:"Twitter",href:"https://twitter.com/_kaperys"}),(0,r.jsx)(a,{title:"Talks",href:"https://speakerdeck.com/kaperys"})]})})]})]})}},441:function(e,t,n){"use strict";n.r(t),n.d(t,{__N_SSG:function(){return l}});var r=n(5893),o=n(1664),i=n(9008),a=n(2936),s=n(3180),l=!0;t.default=function(e){var t=e.posts;return console.log(s),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(i.default,{children:[(0,r.jsx)("title",{children:s.title}),(0,r.jsx)("link",{rel:"canonical",href:"https://kaperys.io"}),(0,r.jsx)("meta",{name:"description",content:s.meta.description}),(0,r.jsx)("meta",{name:"keywords",content:s.meta.keywords})]}),(0,r.jsxs)("div",{className:"container mx-auto my-12 px-6",children:[(0,r.jsx)(a.Z,{}),(0,r.jsx)("div",{className:"mt-8 flex flex-col space-y-8",children:null===t||void 0===t?void 0:t.map((function(e,t){return(0,r.jsx)("article",{children:(0,r.jsx)(o.default,{href:e.slug,passHref:!0,children:(0,r.jsxs)("a",{title:e.title,children:[(0,r.jsx)("h2",{className:"font-mono font-bold",children:e.title}),(0,r.jsx)("p",{className:"my-2 text-sm line-clamp-4",children:e.summary}),(0,r.jsx)("p",{className:"text-sm text-slate-500",children:e.date})]})})},t)}))})]})]})}},9008:function(e,t,n){e.exports=n(5443)},1664:function(e,t,n){e.exports=n(8418)},3180:function(e){"use strict";e.exports=JSON.parse('{"title":"Mike Kaperys","intro":"I\'m a software engineer from Sheffield, United Kingdom. I\'m currently working at Utility Warehouse building telephony services using Go and Kubernetes.","meta":{"description":"I\'m a software engineer from Sheffield, United Kingdom. I\'m currently working at Utility Warehouse building telephony services using Go and Kubernetes.","keywords":"mike kaperys, software engineer, sheffield, golang, go, kubernetes"}}')}},function(e){e.O(0,[774,888,179],(function(){return t=5301,e(e.s=t);var t}));var t=e.O();_N_E=t}]);