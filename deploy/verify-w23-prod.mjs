import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
const BASE="https://gwth.ai", OUT="completion/W23/prod"
mkdirSync(OUT,{recursive:true})
const ROUTES=[["home","/"],["login","/login"],["labs","/labs"],["pilot","/labs/job-advert-claude-vs-chatgpt"]]
const rep=[], errs=[]
const b=await chromium.launch()
for(const scheme of ["light","dark"]){
 for(const [w,vp] of [["1440",{width:1440,height:900}],["390",{width:390,height:844}]]){
  const ctx=await b.newContext({viewport:vp,colorScheme:scheme})
  await ctx.addInitScript(s=>{try{localStorage.setItem("theme",s)}catch{}},scheme)
  const p=await ctx.newPage()
  p.on("console",m=>{if(m.type()==="error")errs.push(`[${scheme}/${w}] ${m.text()}`)})
  p.on("pageerror",e=>errs.push(`[${scheme}/${w}] ${e.message}`))
  for(const [name,path] of ROUTES){
   let st=0; try{const r=await p.goto(BASE+path,{waitUntil:"load",timeout:45000});st=r?r.status():0}catch(e){errs.push(`goto ${path}: ${e.message}`)}
   await p.waitForTimeout(800)
   const m=await p.evaluate(()=>{const de=document.documentElement;return{vw:de.clientWidth,sw:Math.max(de.scrollWidth,document.body.scrollWidth)}})
   await p.screenshot({path:`${OUT}/${name}-${scheme}-${w}.png`,fullPage:true})
   const ov=m.sw-m.vw
   rep.push({name,scheme,w,st,overflow:ov})
   console.log(`${name} ${scheme}/${w} http=${st} overflow=${ov>1?"+"+ov:"0"}`)
  }
  await ctx.close()
 }
}
await b.close()
writeFileSync(`${OUT}/prod-report.json`,JSON.stringify(rep,null,2))
console.log(`\nconsole errors: ${errs.length}`); errs.forEach(e=>console.log("  "+e))
