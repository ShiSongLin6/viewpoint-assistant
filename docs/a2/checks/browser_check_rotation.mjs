// Real-browser check (headless Edge, real mouse events) of two A2 changes:
// 1) dragging the camera upward past the pole keeps moving (no stop at +90°);
// 2) "Rotate sphere" turns the globe view without changing the selected camera angle.
import { spawn } from 'node:child_process'; import fs from 'node:fs';
import { dirname, resolve } from 'node:path'; import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
// Path to Microsoft Edge on Windows; set EDGE to another Chromium browser if needed.
const EDGE=process.env.EDGE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PROTO=resolve(here,'../../../prototype/index.html').split('\\').join('/');
const OUT=resolve(here,'browser_check_rotation_'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'.txt');
const port=9600+Math.floor(Math.random()*90);
const p=spawn(EDGE,['--headless=new','--disable-gpu','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${process.env.TEMP}/edge-rot-${port}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let info;
for(let i=0;i<60;i++){try{info=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(info.find(t=>t.type==='page'))break;}catch{}await sleep(250);}
const ws=new WebSocket(info.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
let id=0;const pend=new Map();const errs=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errs.push(m.params.exceptionDetails.text);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}});
const send=(method,params={})=>new Promise(res=>{const i=++id;pend.set(i,m=>res(m.result));ws.send(JSON.stringify({id:i,method,params}));});
const ev=async x=>(await send('Runtime.evaluate',{expression:x,returnByValue:true})).result.value;
await send('Runtime.enable');await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:1400,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'file:///'+PROTO});await sleep(1500);
const read=()=>ev(`document.getElementById('thetaVal').innerText+' / '+document.getElementById('phiVal').innerText+' · '+document.getElementById('plainAngle').innerText`);
const centre=sel=>ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
async function drag(x,y,dx,dy,steps=10){
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
  for(let k=1;k<=steps;k++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+dx*k/steps,y:y+dy*k/steps,button:'left',buttons:1});await sleep(15);}
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+dx,y:y+dy,button:'left',buttons:0,clickCount:1});await sleep(120);
}
const log=[];const L=s=>{log.push(s);console.log(s);};
L('Real-browser check · headless Microsoft Edge · real mouse drag events · '+new Date().toISOString());
// --- 1. camera drag past the pole (cat preview as main view, Adjust camera mode)
await ev(`document.getElementById('btnSwapView').click()`);await sleep(400);
await ev(`document.getElementById('btnCameraMode').click()`);await sleep(200);
L('1) Adjust camera, drag the cat preview upward in steps. Start: '+await read());
let [cx,cy]=await centre('#cameraPreview');
const seq=[];
for(let k=0;k<12;k++){await drag(cx,cy+60,0,-120);seq.push(await read());}
seq.forEach((s,i)=>L('   step '+(i+1)+': '+s));
const th=seq.map(s=>parseFloat(s.split('/')[0])), ph=seq.map(s=>parseFloat(s.split('/')[1]));
let crossings=0; for(let i=1;i<th.length;i++){ if(Math.abs(((th[i]-th[i-1])%360+360)%360-180)<1) crossings++; }
const stuck=ph.some((v,i)=>i>0&&v===ph[i-1]&&th[i]===th[i-1]);
L('   pole crossings seen (direction flips by 180° while the drag continues): '+crossings+'; any step where the camera did not move: '+stuck);
// --- 2. Rotate sphere: globe view turns, selected angle stays
await ev(`document.getElementById('btnSwapView').click()`);await sleep(400);
await ev(`document.getElementById('btnRotateMode').click()`);await sleep(200);
const before=await read();
const pix=()=>ev(`(()=>{const c=document.getElementById('sphere');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(h*31+d[i])%1000000007;return h})()`);
const p0=await pix();
[cx,cy]=await centre('#sphere');
await drag(cx-80,cy,160,0);await drag(cx,cy-60,0,120);
const after=await read(), p1=await pix();
L('2) Rotate sphere, drag the globe twice. Angle before: '+before+' | after: '+after);
L('   selected angle unchanged: '+(before===after)+'; globe image changed: '+(p0!==p1));
L('page errors: '+JSON.stringify(errs));
fs.writeFileSync(OUT,log.join('\n')+'\n');
try{await send('Browser.close');}catch{} p.kill(); process.exit(0);
