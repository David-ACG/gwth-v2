import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
const BASE="http://192.168.178.50:3001"
const OUT=process.env.OUT||"completion/W23/after"
mkdirSync(OUT,{recursive:true})
const b=await chromium.launch()
for(const scheme of ["light","dark"]){
 for(const [w,vp] of [["1440",{width:1440,height:900}],["390",{width:390,height:844}]]){
  const ctx=await b.newContext({viewport:vp,colorScheme:scheme})
  await ctx.addInitScript(s=>{try{localStorage.setItem("theme",s)}catch{}},scheme)
  const p=await ctx.newPage()
  await p.goto(BASE+"/login",{waitUntil:"networkidle",timeout:45000})
  await p.waitForTimeout(600)
  await p.screenshot({path:`${OUT}/login-${scheme}-${w}.png`,fullPage:true})
  console.log(`login ${scheme}/${w} -> ${OUT}/login-${scheme}-${w}.png url=${p.url()}`)
  await ctx.close()
 }
}
await b.close()
