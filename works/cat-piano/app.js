(()=>{
'use strict';
const notes=window.CAT_NOTES,audio=new window.MeowAudio(),$=s=>document.querySelector(s);
const cats=$('#cats'),keyboard=$('#keyboard');
notes.forEach((n,i)=>{
  const angle=(-154+i*360/7)*Math.PI/180,x=50+36*Math.cos(angle),y=50+36*Math.sin(angle);
  const cat=document.createElement('button');cat.className='cat-button';cat.dataset.note=i;cat.style.left=x+'%';cat.style.top=y+'%';cat.setAttribute('aria-label',`${n.name}，${n.sol}，${n.note}`);cat.innerHTML=window.catSVG(n,i)+`<span class="cat-label"><b>${n.sol}</b><span>${n.name}</span></span>`;cats.append(cat);
  const key=document.createElement('button');key.className='piano-key';key.dataset.note=i;key.style.setProperty('--key-color',n.color);key.style.setProperty('--key-light',n.keyLight);key.setAttribute('aria-label',`${n.sol}，${n.note}，快捷键 ${n.key}`);key.innerHTML=`<span class="key-number">0${i+1}</span><span class="key-solfege">${n.sol}</span><span class="key-note">${n.note}</span><kbd class="key-shortcut">${n.key}</kbd>`;keyboard.append(key);
});
const keys=[...document.querySelectorAll('.piano-key')],catButtons=[...document.querySelectorAll('.cat-button')];
const holds=new Map(),flashTimers=new Map();let centerTimer,particleCount=0,recording=false,recordPending=false,recordToken=0,recordStart=0,events=[],duration=0,recordTicker,sequence=null,sequenceToken=0,timers=new Set();
const songs={
star:{title:'小星星',beat:360,notes:[[0,1],[0,1],[4,1],[4,1],[5,1],[5,1],[4,2],[3,1],[3,1],[2,1],[2,1],[1,1],[1,1],[0,2],[4,1],[4,1],[3,1],[3,1],[2,1],[2,1],[1,2],[4,1],[4,1],[3,1],[3,1],[2,1],[2,1],[1,2],[0,1],[0,1],[4,1],[4,1],[5,1],[5,1],[4,2],[3,1],[3,1],[2,1],[2,1],[1,1],[1,1],[0,2]]},
joy:{title:'欢乐颂',beat:340,notes:[[2,1],[2,1],[3,1],[4,1],[4,1],[3,1],[2,1],[1,1],[0,1],[0,1],[1,1],[2,1],[2,1.5],[1,.5],[1,2],[2,1],[2,1],[3,1],[4,1],[4,1],[3,1],[2,1],[1,1],[0,1],[0,1],[1,1],[2,1],[1,1.5],[0,.5],[0,2]]},
scale:{title:'七音阶散步',beat:370,notes:[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,2],[5,1],[4,1],[3,1],[2,1],[1,1],[0,2]]},
lawrence:{title:'劳伦斯先生圣诞快乐',beat:300,notes:[[1,1],[2,1],[1,1],[5,1],[1,1],[1,1],[2,1],[1,1],[2,1],[4,1],[2,1],[1,1],[2,1],[1,1],[5,1],[0,1],[0,1],[6,1],[4,1],[2,1],[1,1],[2,1],[1,1],[5,1],[1,1],[1,1],[2,1],[1,1],[2,1],[4,1],[2,1],[1,1],[2,1],[1,1],[0,1],[5,1],[0,1],[5,1],[4,1],[4,1],[2,1],[1,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[1,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[1,1],[5,2]]}};
function displayError(error){$('#notice-text').textContent=error.message||'声音加载失败，请点「重新加载」再试一次。';$('#notice').hidden=false;}
function paint(index,active){keys[index].classList.toggle('is-active',active);catButtons[index].classList.toggle('is-active',active);}
function held(index){return [...holds.values()].includes(index);}
function animate(index){
  clearTimeout(flashTimers.get(index));paint(index,true);
  flashTimers.set(index,setTimeout(()=>{if(!held(index))paint(index,false);flashTimers.delete(index);},360));
  const n=notes[index];$('#center-note').textContent=n.sol+' · 喵';$('#center-hint').textContent=n.name+'正在唱歌';$('#stage-center').classList.add('sounding');
  clearTimeout(centerTimer);centerTimer=setTimeout(()=>{$('#stage-center').classList.remove('sounding');$('#center-note').textContent='轮到你啦';$('#center-hint').textContent='每一声喵，都算数';},700);
  if(particleCount<12&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const p=document.createElement('span');p.className='particle';p.textContent=['♪','♫','✧'][index%3];p.style.left=catButtons[index].style.left;p.style.top=`${parseFloat(catButtons[index].style.top)-8}%`;$('#note-particles').append(p);particleCount++;setTimeout(()=>{p.remove();particleCount--;},800);
  }
}
async function trigger(index,manual=true){
  if(manual&&sequence)stopSequence();
  const time=performance.now();
  try{const played=await audio.play(index);if(!played)return;$('#notice').hidden=true;animate(index);
    if(manual&&recording){const at=time-recordStart;if(at>=0&&at<60000){events.push({note:index,at});$('#record-status').textContent=`正在记录 · ${events.length} 个音符`;}}
  }catch(error){displayError(error);}
}
function press(id,index){if(holds.has(id))return;holds.set(id,index);trigger(index);}
function release(id){const index=holds.get(id);holds.delete(id);if(index!==undefined&&!held(index)&&!flashTimers.has(index))paint(index,false);}
for(const button of [...keys,...catButtons]){
  button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.focus({preventScroll:true});try{button.setPointerCapture(e.pointerId);}catch{}press('p'+e.pointerId,+button.dataset.note);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>release('p'+e.pointerId));
  button.addEventListener('click',e=>{if(e.detail===0)trigger(+button.dataset.note);});
}
function isEditingTarget(target){return target instanceof Element&&!!target.closest('input,select,textarea,[contenteditable="true"],dialog[open]');}
const keyMap={KeyA:0,KeyS:1,KeyD:2,KeyF:3,KeyG:4,KeyH:5,KeyJ:6,Digit1:0,Digit2:1,Digit3:2,Digit4:3,Digit5:4,Digit6:5,Digit7:6};
window.addEventListener('keydown',e=>{if(e.code in keyMap&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!isEditingTarget(e.target)){e.preventDefault();press('k'+e.code,keyMap[e.code]);}if(e.code==='Escape')stopSequence();});
window.addEventListener('keyup',e=>release('k'+e.code));
function resetHolds(){holds.clear();for(let i=0;i<7;i++)paint(i,false);}
window.addEventListener('blur',resetHolds);
document.addEventListener('visibilitychange',()=>{if(document.hidden){resetHolds();stopSequence();if(recording)stopRecording();audio.stopAll();}});
function muteUI(){const effective=audio.muted||audio.volume===0;$('#mute-btn').setAttribute('aria-pressed',String(effective));$('#mute-btn').setAttribute('aria-label',effective?'开启声音':'静音');$('#mute-btn use').setAttribute('href',effective?'#i-muted':'#i-volume');}
$('#volume').addEventListener('input',e=>{audio.setVolume(+e.target.value/100);$('#volume-value').textContent=e.target.value;if(audio.volume>0)audio.setMuted(false);muteUI();});
$('#mute-btn').addEventListener('click',()=>{if(audio.volume===0){audio.setVolume(.7);$('#volume').value='70';$('#volume-value').textContent='70';audio.setMuted(false);}else audio.setMuted(!audio.muted);muteUI();});
$('#retry-btn').addEventListener('click',async()=>{try{await audio.ready();$('#notice').hidden=true;}catch(error){displayError(error);}});
function later(fn,ms){const timer=setTimeout(()=>{timers.delete(timer);fn();},ms);timers.add(timer);}
function cancelRecordStart(){recordToken++;if(!recordPending)return;recordPending=false;$('#record-btn span').textContent=events.length?'重录':'录一段';$('#record-status').textContent=events.length?`已记录 ${events.length} 个音符`:'留住你随手弹出的小灵感';}
function stopSequence(){cancelRecordStart();sequenceToken++;for(const timer of timers)clearTimeout(timer);timers.clear();sequence=null;audio.stopAll();$('#demo-btn').classList.remove('is-playing');$('#demo-btn span').textContent='听一首小曲';$('#demo-btn use').setAttribute('href','#i-play');$('#replay-btn').classList.remove('is-playing');$('#replay-btn span').textContent='回放';$('#demo-caption>span:last-child').textContent='用猫叫，重新认识熟悉的旋律';}
async function playSequence(kind,list,length){
  stopSequence();if(recording)stopRecording();sequence=kind;const token=sequenceToken;
  const btn=kind==='demo'?$('#demo-btn'):$('#replay-btn');btn.classList.add('is-playing');btn.querySelector('span').textContent='停止';if(kind==='demo')btn.querySelector('use').setAttribute('href','#i-stop');
  try{await audio.ready();if(sequenceToken!==token)return;
    for(const item of list)later(()=>{if(sequenceToken===token)trigger(item.note,false);},item.at);
    later(()=>{if(sequenceToken===token)stopSequence();},length+650);
  }catch(error){stopSequence();displayError(error);}
}
$('#demo-btn').addEventListener('click',()=>{if(sequence==='demo'){stopSequence();return;}const song=songs[$('#song').value];let at=0;const list=song.notes.map(([note,beats])=>{const item={note,at};at+=song.beat*beats;return item;});playSequence('demo',list,at);$('#demo-caption>span:last-child').textContent=`正在演奏 · ${song.title} · 点猫咪可接着弹`;});
$('#song').addEventListener('change',()=>{if(sequence==='demo')stopSequence();});
function timeText(ms){const seconds=Math.floor(ms/1000);return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function stopRecording(){if(!recording)return;duration=Math.min(60000,performance.now()-recordStart);recording=false;clearInterval(recordTicker);$('#record-btn').classList.remove('is-recording');$('#record-btn span').textContent='重录';$('#record-time').textContent=timeText(duration);$('#record-status').textContent=events.length?`已记录 ${events.length} 个音符`:'还没弹音符，再试一次吧';$('#replay-btn').disabled=!events.length;$('#clear-btn').disabled=!events.length;}
$('#record-btn').addEventListener('click',async()=>{
  if(recording){stopRecording();return;}if(recordPending){cancelRecordStart();return;}stopSequence();
  const token=++recordToken;recordPending=true;$('#record-btn span').textContent='取消';$('#record-status').textContent='准备音色中 · 再点可取消';
  try{await audio.ready();}catch(error){if(token===recordToken){cancelRecordStart();displayError(error);}return;}
  if(token!==recordToken||!recordPending)return;recordPending=false;
  events=[];duration=0;recording=true;recordStart=performance.now();$('#record-btn').classList.add('is-recording');$('#record-btn span').textContent='结束录制';$('#record-status').textContent='正在记录 · 弹几声喵吧';$('#record-time').textContent='00:00';$('#replay-btn').disabled=true;$('#clear-btn').disabled=true;
  recordTicker=setInterval(()=>{const elapsed=performance.now()-recordStart;$('#record-time').textContent=timeText(Math.min(60000,elapsed));if(elapsed>=60000)stopRecording();},100);
});
$('#replay-btn').addEventListener('click',()=>{if(sequence==='replay'){stopSequence();return;}if(events.length)playSequence('replay',events.slice(),duration);});
$('#clear-btn').addEventListener('click',()=>{stopSequence();if(recording)stopRecording();events=[];duration=0;$('#replay-btn').disabled=true;$('#clear-btn').disabled=true;$('#record-time').textContent='00:00';$('#record-btn span').textContent='录一段';$('#record-status').innerHTML='留住你随手弹出的小灵感 <span>最长 60 秒</span>';});
$('#help-btn').addEventListener('click',()=>{stopSequence();resetHolds();if(recording)stopRecording();$('#help-dialog').showModal();});
for(const id of ['#close-help','#help-done'])$(id).addEventListener('click',()=>$('#help-dialog').close());
$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
})();
