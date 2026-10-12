import{c as a,e as h,b as g,d as u,h as y,j as e,S as f,L as c}from"./index-BsPOadNx.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=a("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=a("ShoppingCart",[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=a("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),C=()=>{var r;const{isAuthenticated:i,user:s,logout:l}=h(),{items:n}=g(),{isRTL:o,t,language:d,setLanguage:m}=u(),x=y(),p=(s==null?void 0:s.name)||(s==null?void 0:s.fullName)||((r=s==null?void 0:s.email)==null?void 0:r.split("@")[0])||"";return e.jsxs("header",{className:"sticky top-0 z-40 bg-background",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border/60 px-4 py-1.5 text-[11px] text-muted-foreground md:px-8",children:[e.jsxs("span",{children:[e.jsx(f,{className:"me-1 inline h-3 w-3 text-primary"}),t("Deliver to","التوصيل إلى")," ",e.jsx("span",{className:"font-medium text-foreground",children:t("KSA, GCC & Worldwide","السعودية والخليج والعالم")})," ",e.jsx("span",{className:"rounded-[3px] bg-primary/10 px-1 py-px text-[9px] font-semibold uppercase text-primary",children:t("Global","عالمي")})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("button",{type:"button",onClick:()=>m(d==="ar"?"en":"ar"),className:"flex items-center gap-1 hover:text-foreground",children:[e.jsx(b,{className:"h-3.5 w-3.5"}),o?"EN":"العربية"]}),i?e.jsxs("button",{type:"button",onClick:()=>{l(),x("/assistant")},className:"flex items-center gap-1 font-medium text-foreground hover:text-primary",title:t("Log out","تسجيل الخروج"),children:[e.jsx(k,{className:"h-3.5 w-3.5"}),p]}):e.jsx(c,{to:"/login?redirect=/assistant",className:"font-medium text-foreground hover:text-primary",children:t("Log In","تسجيل الدخول")}),e.jsx(j,{className:"h-3.5 w-3.5"}),e.jsxs("span",{className:"relative",children:[e.jsx(N,{className:"h-3.5 w-3.5"}),n.length>0&&e.jsx("span",{className:"absolute -top-1.5 -end-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground",children:n.length})]})]})]}),e.jsx("div",{className:"flex items-center px-4 py-3 md:px-8",children:e.jsx(c,{to:"/assistant",className:"flex shrink-0 items-center","aria-label":"Benna - Home",children:e.jsx("img",{src:"https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif",alt:"Benna",width:180,height:56,decoding:"async",className:"h-12 w-auto"})})})]})},L=()=>null;export{L as F,C as H,N as S};
