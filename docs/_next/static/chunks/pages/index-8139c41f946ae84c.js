(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5301:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(441)}])},8418:function(e,t,n){"use strict";function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,a=!1,s=void 0;try{for(var i,o=e[Symbol.iterator]();!(r=(i=o.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(l){a=!0,s=l}finally{try{r||null==o.return||o.return()}finally{if(a)throw s}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}t.default=void 0;var a,s=(a=n(7294))&&a.__esModule?a:{default:a},i=n(6273),o=n(387),l=n(7190);var c={};function u(e,t,n,r){if(e&&i.isLocalURL(t)){e.prefetch(t,n,r).catch((function(e){0}));var a=r&&"undefined"!==typeof r.locale?r.locale:e&&e.locale;c[t+"%"+n+(a?"%"+a:"")]=!0}}var f=function(e){var t,n=!1!==e.prefetch,a=o.useRouter(),f=s.default.useMemo((function(){var t=r(i.resolveHref(a,e.href,!0),2),n=t[0],s=t[1];return{href:n,as:e.as?i.resolveHref(a,e.as):s||n}}),[a,e.href,e.as]),d=f.href,p=f.as,h=e.children,m=e.replace,v=e.shallow,y=e.scroll,x=e.locale;"string"===typeof h&&(h=s.default.createElement("a",null,h));var b=(t=s.default.Children.only(h))&&"object"===typeof t&&t.ref,g=r(l.useIntersection({rootMargin:"200px"}),2),j=g[0],k=g[1],N=s.default.useCallback((function(e){j(e),b&&("function"===typeof b?b(e):"object"===typeof b&&(b.current=e))}),[b,j]);s.default.useEffect((function(){var e=k&&n&&i.isLocalURL(d),t="undefined"!==typeof x?x:a&&a.locale,r=c[d+"%"+p+(t?"%"+t:"")];e&&!r&&u(a,d,p,{locale:t})}),[p,d,k,x,n,a]);var w={ref:N,onClick:function(e){t.props&&"function"===typeof t.props.onClick&&t.props.onClick(e),e.defaultPrevented||function(e,t,n,r,a,s,o,l){("A"!==e.currentTarget.nodeName||!function(e){var t=e.currentTarget.target;return t&&"_self"!==t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)&&i.isLocalURL(n))&&(e.preventDefault(),null==o&&r.indexOf("#")>=0&&(o=!1),t[a?"replace":"push"](n,r,{shallow:s,locale:l,scroll:o}))}(e,a,d,p,m,v,y,x)},onMouseEnter:function(e){t.props&&"function"===typeof t.props.onMouseEnter&&t.props.onMouseEnter(e),i.isLocalURL(d)&&u(a,d,p,{priority:!0})}};if(e.passHref||"a"===t.type&&!("href"in t.props)){var _="undefined"!==typeof x?x:a&&a.locale,E=a&&a.isLocaleDomain&&i.getDomainLocale(p,_,a&&a.locales,a&&a.domainLocales);w.href=E||i.addBasePath(i.addLocale(p,_,a&&a.defaultLocale))}return s.default.cloneElement(t,w)};t.default=f},7190:function(e,t,n){"use strict";function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,a=!1,s=void 0;try{for(var i,o=e[Symbol.iterator]();!(r=(i=o.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(l){a=!0,s=l}finally{try{r||null==o.return||o.return()}finally{if(a)throw s}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}Object.defineProperty(t,"__esModule",{value:!0}),t.useIntersection=function(e){var t=e.rootMargin,n=e.disabled||!i,l=a.useRef(),c=r(a.useState(!1),2),u=c[0],f=c[1],d=a.useCallback((function(e){l.current&&(l.current(),l.current=void 0),n||u||e&&e.tagName&&(l.current=function(e,t,n){var r=function(e){var t=e.rootMargin||"",n=o.get(t);if(n)return n;var r=new Map,a=new IntersectionObserver((function(e){e.forEach((function(e){var t=r.get(e.target),n=e.isIntersecting||e.intersectionRatio>0;t&&n&&t(n)}))}),e);return o.set(t,n={id:t,observer:a,elements:r}),n}(n),a=r.id,s=r.observer,i=r.elements;return i.set(e,t),s.observe(e),function(){i.delete(e),s.unobserve(e),0===i.size&&(s.disconnect(),o.delete(a))}}(e,(function(e){return e&&f(e)}),{rootMargin:t}))}),[n,t,u]);return a.useEffect((function(){if(!i&&!u){var e=s.requestIdleCallback((function(){return f(!0)}));return function(){return s.cancelIdleCallback(e)}}}),[u]),[d,u]};var a=n(7294),s=n(9311),i="undefined"!==typeof IntersectionObserver;var o=new Map},2936:function(e,t,n){"use strict";var r=n(5893),a=n(1664),s=n(7929),i=function(e){var t=e.title,n=e.href;return(0,r.jsx)(a.default,{href:n,passHref:!0,children:(0,r.jsx)("a",{title:t,className:"underline underline-offset-4 decoration-slate-500 hover:text-slate-500",children:(0,r.jsx)("li",{className:"text-sm font-mono",children:t})})})};t.Z=function(){return(0,r.jsxs)("header",{children:[(0,r.jsx)("h1",{className:"font-mono font-bold text-xl",children:s.TN}),(0,r.jsxs)("div",{className:"mt-4 pb-8 inline-block border-b border-gray-200",children:[(0,r.jsx)("p",{className:"text-sm",children:s.mf}),(0,r.jsx)("nav",{className:"mt-4",children:(0,r.jsxs)("ul",{className:"flex space-x-4",children:[(0,r.jsx)(i,{title:"LinkedIn",href:"https://uk.linkedin.com/in/mikekaperys"}),(0,r.jsx)(i,{title:"GitHub",href:"https://github.com/kaperys"}),(0,r.jsx)(i,{title:"Twitter",href:"https://twitter.com/_kaperys"}),(0,r.jsx)(i,{title:"Talks",href:"https://speakerdeck.com/kaperys"})]})})]})]})}},441:function(e,t,n){"use strict";n.r(t),n.d(t,{__N_SSG:function(){return l}});var r=n(5893),a=n(1664),s=n(9008),i=n(2936),o=n(7929),l=!0;t.default=function(e){var t=e.posts;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(s.default,{children:[(0,r.jsx)("title",{children:o.TN}),(0,r.jsx)("link",{rel:"canonical",href:"https://kaperys.io"}),(0,r.jsx)("meta",{name:"description",content:o.$y.W}),(0,r.jsx)("meta",{name:"keywords",content:o.$y.H})]}),(0,r.jsxs)("div",{className:"container mx-auto my-12 px-6",children:[(0,r.jsx)(i.Z,{}),(0,r.jsx)("div",{className:"mt-8 flex flex-col space-y-8",children:null===t||void 0===t?void 0:t.map((function(e,t){return(0,r.jsx)("article",{children:(0,r.jsx)(a.default,{href:e.slug,passHref:!0,children:(0,r.jsxs)("a",{title:e.title,children:[(0,r.jsx)("h2",{className:"font-mono font-bold",children:e.title}),(0,r.jsx)("p",{className:"my-2 text-sm line-clamp-4",children:e.summary}),(0,r.jsx)("p",{className:"text-sm text-slate-500",children:e.date})]})})},t)}))}),(0,r.jsx)("div",{className:"mt-8 border-t border-gray-200 pt-8",children:(0,r.jsxs)("p",{className:"text-sm text-slate-500",children:["You can find my older posts on"," ",(0,r.jsx)(a.default,{href:"https://medium.com/@kaperys",passHref:!0,children:(0,r.jsx)("a",{title:"Mike Kaperys on Medium",className:"hover:underline underline-offset-4 decoration-slate-500",children:"Medium"})}),"."]})})]})]})}},9008:function(e,t,n){e.exports=n(5443)},1664:function(e,t,n){e.exports=n(8418)},7929:function(e){"use strict";e.exports=JSON.parse('{"TN":"Mike Kaperys","mf":"I\'m a software engineer from Sheffield, United Kingdom. I\'m currently working at Utility Warehouse building telephony services using Go and Kubernetes.","$y":{"W":"I\'m a software engineer from Sheffield, United Kingdom. I\'m currently working at Utility Warehouse building telephony services using Go and Kubernetes.","H":"mike kaperys, software engineer, sheffield, golang, go, kubernetes"}}')}},function(e){e.O(0,[774,888,179],(function(){return t=5301,e(e.s=t);var t}));var t=e.O();_N_E=t}]);