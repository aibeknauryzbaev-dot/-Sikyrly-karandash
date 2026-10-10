'use strict';
const $=s=>document.querySelector(s);
const stage=$('#stage');
function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);stage.style.transform=`scale(${s}) translate(-50%,-50%)`}
addEventListener('resize',fit);fit();

/* ---------- дыбыс (Web Audio) ---------- */
let muted=false,ac=null;
function tone(f,t,d,type='sine',v=.15){if(muted)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
 const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;o.connect(g);g.connect(ac.destination);
 const n=ac.currentTime+t;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.start(n);o.stop(n+d)}catch(e){}}
const snd={ok(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.25))},bad(){tone(220,0,.25,'triangle');tone(180,.15,.3,'triangle')},
 click(){tone(660,0,.08,'square',.06)},win(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*.14,.35))}};
$('#snd').onclick=()=>{muted=!muted;$('#sndimg').src=muted?'assets/ui/mute.png':'assets/ui/sound.png';snd.click()};

/* ---------- экрандар ---------- */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active')}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{snd.click();show(b.dataset.go)});

/* ---------- мәліметтер ---------- */
const FLAT={tri:'үшбұрыш',circle:'дөңгелек',square:'шаршы',rect:'тіктөртбұрыш'};
const SOLID={cube:'куб',sphere:'шар',cylinder:'цилиндр',cone:'конус',pyramid:'пирамида',cuboid:'тікбұрышты параллелепипед'};
const OBJ=[['football','шар'],['globe','шар'],['dice','куб'],['box','тікбұрышты параллелепипед'],['tissue','тікбұрышты параллелепипед'],
 ['roadcone','конус'],['partyhat','конус'],['can','цилиндр'],['drum','цилиндр'],['pyramid_obj','пирамида']];
const solidKey=n=>Object.keys(SOLID).find(k=>SOLID[k]===n);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuf(a).slice(0,n);
const img=(d,n)=>`<img src="assets/${d}/${n}.png" alt="">`;

function svgRS(type,angle,len){
 const cx=280,cy=110,x1=cx-len/2,x2=cx+len/2;let g;
 if(type==='seg')g=`<line x1="${x1}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#1f3fa8" stroke-width="7" stroke-linecap="round"/><circle cx="${x1}" cy="${cy}" r="11" fill="#e63946"/><circle cx="${x2}" cy="${cy}" r="11" fill="#e63946"/>`;
 else g=`<line x1="${x1}" y1="${cy}" x2="${x2-16}" y2="${cy}" stroke="#1f3fa8" stroke-width="7" stroke-linecap="round"/><polygon points="${x2+6},${cy} ${x2-24},${cy-17} ${x2-24},${cy+17}" fill="#1f3fa8"/><circle cx="${x1}" cy="${cy}" r="11" fill="#e63946"/>`;
 return `<svg viewBox="0 0 560 220"><g transform="rotate(${angle} ${cx} ${cy})">${g}</g></svg>`}
const miniSeg='<svg viewBox="0 0 110 40"><line x1="14" y1="20" x2="96" y2="20" stroke="#1f3fa8" stroke-width="4"/><circle cx="14" cy="20" r="6" fill="#e63946"/><circle cx="96" cy="20" r="6" fill="#e63946"/></svg>';
const miniRay='<svg viewBox="0 0 110 40"><line x1="14" y1="20" x2="90" y2="20" stroke="#1f3fa8" stroke-width="4"/><polygon points="104,20 88,12 88,28" fill="#1f3fa8"/><circle cx="14" cy="20" r="6" fill="#e63946"/></svg>';

/* ---------- сұрақ құрастырушылар ---------- */
const O=l=>({label:l});
function qFlat(k){return{prompt:'Бұл қандай фигура?',visual:img('shapes',k),opts:Object.values(FLAT).map(O),ans:FLAT[k]}}
function qSolid(k){const names=pick(Object.values(SOLID).filter(n=>n!==SOLID[k]),3).concat(SOLID[k]);
 return{prompt:'Бұл қандай дене?',visual:img('shapes',k),opts:shuf(names).map(O),ans:SOLID[k]}}
function qObj([o,n],six){return{prompt:'Бұл зат қандай денеге ұқсас?',visual:img('objects',o),
 opts:(six?Object.keys(SOLID):pick(Object.keys(SOLID).filter(k=>SOLID[k]!==n),3).concat(solidKey(n))).map(k=>({label:SOLID[k],img:'shapes/'+k})),ans:n,six}}
function qRS(type,i){const a=[-28,-14,0,12,24,-20,8,30][i%8],len=[300,360,260,340][i%4];
 return{prompt:'Бұл — сәуле ме, кесінді ме?',visual:svgRS(type,a,len),opts:[O('Сәуле'),O('Кесінді')],ans:type==='ray'?'Сәуле':'Кесінді',two:true}}
const STAGES=[
 {name:'1-кезең: Фигураны таны',bg:'bg-classroom',hint:'Фигураның атын таңда',
  make(){const k=Object.keys(FLAT);return shuf(k.concat(k)).map(qFlat)}},
 {name:'2-кезең: Затты өз үйіне орналастыр',bg:'bg-town',hint:'Затқа қараңыз да, сәйкес денені басыңыз',
  make(){return pick(OBJ,8).map(o=>qObj(o,true))}},
 {name:'3-кезең: Сәуле мен кесінді',bg:'bg-classroom',hintHtml:`${miniSeg}<span><b>Кесінді</b> — екі ұшы да нүкте</span>${miniRay}<span><b>Сәуле</b> — бір ұшы нүкте, екінші жағы — жебе</span>`,
  make(){const t=shuf(['ray','ray','ray','ray','seg','seg','seg','seg']);return t.map((x,i)=>qRS(x,i))}},
 {name:'4-кезең: Сиқырлы сандық',bg:'bg-treasure',hint:'Барлық білімді еске түсір!',
  make(){return shuf([...pick(Object.keys(FLAT),2).map(qFlat),...pick(Object.keys(SOLID),3).map(qSolid),...pick(OBJ,3).map(o=>qObj(o,false)),qRS('ray',3),qRS('seg',5)])}}
];

/* ---------- күй ---------- */
let done=[false,false,false,false],sStars=[0,0,0,0],sTasks=[0,0,0,0];
let cur=0,qs=[],qi=0,stars=0,locked=false;

/* ---------- карта ---------- */
const POS=[[329,292,'#e63946'],[378,539,'#2f6bff'],[913,536,'#1fa51f'],[1052,292,'#8a3ffc']];
const SHORT=['Фигураны таны','Затты орналастыр','Сәуле / кесінді','Сиқырлы сандық'];
function drawMap(){const box=$('#mapbtns');box.innerHTML='';
 POS.forEach(([x,y,c],i)=>{const open=i===0||done[i-1];
  const b=document.createElement('button');b.className='mapbtn'+(open?'':' locked')+(done[i]?' done':'')+(open&&!done[i]?' cur':'');
  b.style.cssText=`left:${x}px;top:${y}px;background:radial-gradient(circle at 35% 30%,#fff8,${c} 60%)`;
  b.innerHTML=`${i+1}<img class="st" src="assets/ui/star.png" alt="">`;
  b.setAttribute('aria-label',STAGES[i].name);
  b.onclick=()=>{if(!open){snd.bad();return}snd.click();startStage(i)};
  const l=document.createElement('div');l.className='mapname';l.style.cssText=`left:${x}px;top:${y}px`;l.textContent=SHORT[i];
  box.append(b,l)});
 $('#mapStars').textContent=sStars.reduce((a,b)=>a+b,0)}
function openMap(){drawMap();show('map')}
$('#start').onclick=()=>{snd.click();openMap()};

/* ---------- сұрақтар ---------- */
const CHR={ask:['pen3','boy3','girl3'],good:['pen1','boy1','girl1','pen4'],bad:['boy4','girl4','pen7']};
const setCh=k=>{$('#qch').src=`assets/characters/${shuf(CHR[k])[0]}.png`};
function startStage(i){cur=i;qs=STAGES[i].make();qi=0;stars=0;
 const q=$('#quiz');q.className='screen active '+STAGES[i].bg;$('#qtitle').textContent=STAGES[i].name;
 document.querySelectorAll('.screen').forEach(s=>s!==q&&s.classList.remove('active'));showQ()}
function showQ(){const q=qs[qi];locked=false;
 $('#qprog').textContent=`${qi+1} / ${qs.length}`;$('#qstars').textContent=stars;
 const S=STAGES[cur];$('#hint').innerHTML=S.hintHtml||S.hint;
 $('#prompt').textContent=q.prompt;$('#visual').innerHTML=q.visual;
 const o=$('#opts');o.className='opts'+(q.six?' six':'');o.innerHTML='';
 shuf(q.opts).forEach(op=>{const b=document.createElement('button');b.className='opt';
  b.innerHTML=(op.img?img(...op.img.split('/')):'')+`<span>${op.label}</span>`;
  b.onclick=()=>answer(b,op.label);o.append(b)});
 $('#fb').textContent='';$('#fb').className='fb';$('#next').classList.add('hidden');setCh('ask')}
function answer(b,label){if(locked)return;const q=qs[qi];
 if(label===q.ans){locked=true;b.classList.add('good');stars++;$('#qstars').textContent=stars;
  $('#fb').textContent='Жарайсың! Дұрыс жауап! ✔';$('#fb').className='fb good';snd.ok();burst();setCh('good');
  document.querySelectorAll('.opt').forEach(x=>x.disabled=true);
  const n=$('#next');n.querySelector('span').textContent=qi===qs.length-1?'АЯҚТАУ':'КЕЛЕСІ';n.classList.remove('hidden')}
 else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),600);
  $('#fb').textContent='Қайта ойланып көр!';$('#fb').className='fb bad';snd.bad();setCh('bad')}}
$('#next').onclick=()=>{snd.click();if(qi<qs.length-1){qi++;showQ()}else finish()};
$('#qhome').onclick=()=>{snd.click();openMap()};
function burst(){const f=$('#fx');for(let i=0;i<14;i++){const s=document.createElement('span');s.className='fxs';s.textContent=['⭐','✨','🌟'][i%3];
 s.style.left=(560+Math.random()*200)+'px';s.style.top=(300+Math.random()*80)+'px';
 s.style.setProperty('--dx',(Math.random()*700-350)+'px');s.style.setProperty('--dy',(Math.random()*-420-30)+'px');f.append(s);setTimeout(()=>s.remove(),1200)}}
function finish(){done[cur]=true;sStars[cur]=stars;sTasks[cur]=qs.length;
 if(cur===3){$('#wstars').textContent=sStars.reduce((a,b)=>a+b,0);$('#wtasks').textContent=sTasks.reduce((a,b)=>a+b,0);
  show('win');snd.win();let n=0;const t=setInterval(()=>{burst();if(++n>5)clearInterval(t)},350)}
 else{openMap();snd.ok()}}
$('#again').onclick=()=>{snd.click();done=[false,false,false,false];sStars=[0,0,0,0];sTasks=[0,0,0,0];openMap()};
$('#whome').onclick=()=>{snd.click();show('home')};
drawMap();
