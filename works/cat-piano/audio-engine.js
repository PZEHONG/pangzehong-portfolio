window.MeowAudio=class{
  constructor(){this.context=null;this.master=null;this.buffers=[];this.volume=.7;this.muted=false;this.voices=new Set();this.loading=null;this.generation=0;}
  async ready(){
    if(!this.context){
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)throw new Error('当前浏览器不支持音频播放，请用新版浏览器打开。');
      this.context=new Audio({latencyHint:'interactive'});
      this.master=this.context.createGain();this.master.gain.value=this.muted?0:this.volume*.75;
      const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-6;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.16;
      limiter.connect(this.master);this.master.connect(this.context.destination);this.input=limiter;
    }
    const resume=this.context.state!=='running'?this.context.resume():Promise.resolve();
    if(!this.loading){
      if(!Array.isArray(window.MEOW_SAMPLES)||window.MEOW_SAMPLES.length!==7)throw new Error('猫叫音色没有加载成功，请刷新页面后再试。');
      this.loading=Promise.all(window.MEOW_SAMPLES.map(async sample=>{
        const binary=atob(sample.data),data=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
        return this.context.decodeAudioData(data.buffer);
      })).then(buffers=>{this.buffers=buffers;}).catch(()=>{this.loading=null;throw new Error('猫叫音色没加载好，请点「重新加载」再试一次。');});
    }
    await Promise.all([resume,this.loading]);
    if(this.context.state!=='running')throw new Error('声音还未启动，请再点一下猫咪。');
  }
  async play(index){
    const generation=this.generation;await this.ready();if(generation!==this.generation)return false;
    if(!this.buffers[index])throw new Error('这个音阶暂时没有加载成功。');
    if(this.voices.size>=20){const old=this.voices.values().next().value;old.stop();this.voices.delete(old);}
    const source=this.context.createBufferSource();source.buffer=this.buffers[index];source.connect(this.input);this.voices.add(source);
    source.onended=()=>{this.voices.delete(source);source.disconnect();};source.start();return true;
  }
  setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.updateGain();}
  setMuted(muted){this.muted=muted;this.updateGain();}
  updateGain(){if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*.75,this.context.currentTime,.012);}
  stopAll(){this.generation++;for(const source of this.voices){try{source.stop();}catch{}}this.voices.clear();}
};
