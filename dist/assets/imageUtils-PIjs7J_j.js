import{c as n,j as s}from"./index-BsPOadNx.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=n("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),m=({bold:e=!1,className:a=""})=>s.jsx("span",{className:`${e?"icon-saudi_riyal_bold_new":"icon-saudi_riyal_new"} ${a}`,"aria-label":"SAR"}),o=e=>e?Array.isArray(e)?e.flatMap(a=>a.includes(";")?a.split(";").filter(Boolean):[a]):typeof e=="string"&&e.includes(";")?e.split(";").filter(Boolean):e?[e]:[]:[],r=new Set(["","null","undefined","[object Object]"]),c=e=>{const a=e.trim().replace(/^['"]|['"]$/g,"");return r.has(a)?"":a},i=(e,a="/placeholder.svg")=>{const t=o(e).map(c).filter(Boolean);return t.length>0?t:[a]},g=(e,a="/placeholder.svg")=>i(e,a)[0];export{d as C,m as R,g};
