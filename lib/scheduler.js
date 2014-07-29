var Sequence = require("./sequence");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var Scheduler = module.exports = function(manualStart){
  this.sequences = [];
  this.currentSequence = null;
  this.active = false; //true when running a sequence
  this.started = false;

  EventEmitter.call(this);

  if(!manualStart)
    this.start();
}

util.inherits(Scheduler, EventEmitter);

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
  //we're using setImmediate because we could possibly be doing infinite recursion,
  //and this prevents us from hitting stack size limits
  setImmediate(function(){
    //don't run if we were stopped
    if(this.started){
      this.active = true;
      var seq = this.sequences.shift();
      this.currentSequence = seq;
      if(seq){
        seq.once("complete", function(){
          this.emit("sequenceFinished", seq);
          this._runNext();
        }.bind(this));
        seq.run();
      }else{
        //ran out of sequences, set ourselves to inactive
        this.emit("empty");
        this.active = false;
      }
    }else{
      //probably stopped halfway through a task, so set that we're not active
      this.active = false;
    }
  }.bind(this));
}

Scheduler.prototype.stop = function(){
  if(!this.started)
    throw new Error("stop() called when Scheduler wasn't started");
  this.started = false;
}

Scheduler.prototype.interrupt = function(cb){
  this.sequences.forEach(function(seq){
    seq.cancel();
  });
  this.sequences = [];
  if(this.active) this.currentSequence.interrupt(cb);
  else cb();
}