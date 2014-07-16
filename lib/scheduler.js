var Sequence = require("./sequence");

var Scheduler = module.exports = function(manualStart){
  this.sequences = [];
  this.active = false; //true when running a sequence
  this.started = false;

  if(!manualStart)
    this.start();
}

Scheduler.prototype.sequence = function(fn){
  var seq = new Sequence(this);
  if(fn) seq.do(fn);
  return seq;
}

Scheduler.prototype.schedule = function(seq){
  this.sequences.push(seq);
  if(!this.active && this.started) this._runNext();
}

Scheduler.prototype.start = function(){
  if(this.started)
    throw new Error("start() called when Scheduler already started");
  this.started = true;
  this._runNext();
}

Scheduler.prototype._runNext = function(){
  //don't run if we were stopped
  if(this.started){
    this.active = true;
    var seq = this.sequences.shift();
    if(seq){
      seq.on("completed", function(){
        this._runNext();
      }.bind(this))
      seq.run();
    }else{
      //ran out of sequences, set ourselves to inactive
      this.active = false;
    }
  }else{
    //probably stopped halfway through a task, so set that we're not active
    this.active = false;
  }
}

Scheduler.prototype.stop = function(){
  if(!this.started)
    throw new Error("stop() called when Scheduler wasn't started");
  this.started = false;
}