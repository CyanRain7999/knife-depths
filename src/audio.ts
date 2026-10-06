export class Audio {
 private ctx?:AudioContext;private last=0;enabled=true;
 unlock(){if(!this.enabled)return;try{this.ctx||=new AudioContext();if(this.ctx.state==='suspended')void this.ctx.resume();}catch{this.enabled=false;}}
 play(kind:string){
  if(!this.enabled||!this.ctx)return;const now=this.ctx.currentTime;if(kind==='throw'&&now-this.last<.11)return;if(kind==='throw')this.last=now;
  const notes:Record<string,[number,number,number]>={throw:[440,.035,.016],crit:[820,.06,.025],hurt:[95,.13,.07],upgrade:[660,.24,.06],skill:[220,.3,.06],clear:[520,.2,.05],death:[65,.6,.06],bossphase:[110,.4,.05],bosskill:[880,.4,.06]};
  const[f,d,v]=notes[kind]||notes.throw;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=kind==='throw'?'triangle':'square';osc.frequency.setValueAtTime(f,now);osc.frequency.exponentialRampToValueAtTime(kind==='hurt'||kind==='death'?f*.35:f*1.7,now+d);gain.gain.setValueAtTime(v,now);gain.gain.exponentialRampToValueAtTime(.001,now+d);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(now);osc.stop(now+d);
 }
}
