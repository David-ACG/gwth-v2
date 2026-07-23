import { chromium } from "playwright"
import { readFileSync } from "node:fs"
const BASE="http://192.168.178.50:3001", JAR="/tmp/w23-jar.txt"
function jar(p){const c=[];for(const l of readFileSync(p,"utf8").split("\n")){if(!l||(l.startsWith("#")&&!l.startsWith("#HttpOnly_")))continue;const f=l.replace(/^#HttpOnly_/,"").split("\t");if(f.length<7)continue;const[d,,cp,s,e,n,v]=f;c.push({name:n,value:v,domain:d.replace(/^\./,""),path:cp||"/",expires:Number(e)||-1,httpOnly:false,secure:s==="TRUE",sameSite:"Lax"})}return c}
const routes=[["lesson","/course/applied-ai-skills/lesson/welcome-to-gwth"],["dashboard","/dashboard"],["progress","/progress"],["labs","/labs"],["pilot","/labs/job-advert-claude-vs-chatgpt"],["home","/"]]
const b=await chromium.launch()
for(const [w,vp] of [["390",{width:390,height:844}],["1440",{width:1440,height:900}]]){
 const ctx=await b.newContext({viewport:vp});await ctx.addCookies(jar(JAR));const p=await ctx.newPage()
 for(const [name,path] of routes){
  await p.goto(BASE+path,{waitUntil:"networkidle",timeout:45000});await p.waitForTimeout(500)
  const m=await p.evaluate(()=>{const de=document.documentElement;const vw=de.clientWidth;const sw=Math.max(de.scrollWidth,document.body.scrollWidth);const off=[];if(sw>vw+1){for(const el of document.querySelectorAll("*")){const r=el.getBoundingClientRect();if(r.right>vw+1&&r.width>8&&r.height>4){off.push({t:el.tagName.toLowerCase(),c:(typeof el.className==="string"?el.className:"").slice(0,40),right:Math.round(r.right),txt:(el.textContent||"").trim().slice(0,30)})}}off.sort((a,b)=>b.right-a.right)}return{vw,sw,overflow:sw-vw,off:off.slice(0,4)}})
  const flag=m.overflow>1?`OVERFLOW +${m.overflow}px`:"ok"
  console.log(`${name} @${w}: vw=${m.vw} sw=${m.sw} ${flag}`)
  if(m.overflow>1)for(const o of m.off)console.log(`    ${o.t}.${o.c} right=${o.right} "${o.txt}"`)
 }
 await ctx.close()
}
await b.close()
