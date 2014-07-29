var events = require("events");
var util = require("util");

var Sequence = module.exports = function(scheduler, steps){
  this.steps = steps || [];
  this.scheduler = scheduler;
  this.executing = false;
  this.interruptable = true;
  this.interrupted = false;
  this._timeouts = [];
  this._currentDoneFunc = function(){};
}

util.inherits(Sequence, events.EventEmitter);

Sequence.prototype.do = function(fn){
  this.steps.push({fn: fn});
  return this;
}

Sequence.prototype.wait = function(condition, interval){
  interval = interval || 20; //default interval
  var condFn = condition;
  if(typeof condition == "string"){
    condFn = function(){
      return eval(condition);
    }
  }
  this.steps.push({condition: condFn, interval: interval});
  return this;
}

Sequence.prototype.after = function(delay, fn){
  this.steps.push({delay: delay, fn: fn});
  return this;
}


Sequence.prototype.onInterrupt = function(fn){
  //functional sugar to make setting events easier
  this.on("interrupt", fn);
  return this;
}

Sequence.prototype.onCancel = function(fn){
  //functional sugar to make setting events easier
  this.on("cancel", fn);
  return this;
}

Sequence.prototype.schedule = function(){
  //functional sugar to make scheduling easier
  this.scheduler.schedule(this);
  return this;
}

Sequence.prototype._runConditionStep = function(step, done){
  //TODO: get it so this supports async condition functions eventually
  var condFn = step.condition;
  var interval = step.interval;

  //loop over every so often and check the condition
  var checkAndRun = function(){
    if(condFn()){
      done();
    }else{
      var t = setTimeout(checkAndRun, interval);
      this._timeouts.push(t);
    }
  }.bind(this);

  checkAndRun();
}

Sequence.prototype._runDelayStep = function(step, done){
  var delay = step.delay;
  var fn = step.fn;

  var timeout = setTimeout(function(){
    this._runStepFn(fn, done);
  }.bind(this), delay);

  this._timeouts.push(timeout);
}

Sequence.prototype._runStepFn = function(fn, done){
  //this is so the done func isn't prematurely called if this function
  //does some sort of async stuff because control over calling done()
  //should be the sole responsibility of the user-defined function at this point
  this._currentDoneFunc = function(){};
  //check to see if done is defined on the func,
  //if it is then call async otherwise just fire
  //`done()` immediately after
  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  if(fn.toString().match(FN_ARGS)[1] != ""){ //has done func
    fn.call(this, done);
  }else{
    done(fn.call(this));
  }
}

Sequence.prototype._run = function(index, steps, done){
  //at the start check to see if we were interrupted
  if(this.interrupted){

    //emit the interrupt event and return
    this.emit("interrupt");
    done();

  }else{
    //perform the step at the given index
    var step = steps[index];
    var next = function(){
      //clear out the current done func
      this._currentDoneFunc = function(){};

      this.emit("step", index, step);
      if(index+1 >= steps.length){
        done();
      }else{
        this._run(index+1, steps, done);
      }
    }.bind(this);

    //set a handle to the current done func for this task
    //this way we can finish a task prematurely if it gets interrupted
    this._currentDoneFunc = next;

    if(step.condition)
      this._runConditionStep(step, next);
    else if(step.delay)
      this._runDelayStep(step, next);
    else
      this._runStepFn(step.fn, next);

  }
}

Sequence.prototype.run = function(){
  if(this.executing)
    throw new Error("Sequence.run() called, but sequence is already running");

  this.executing = true;
  this.emit("start");

  this._run(0, this.steps, function(){
    this.executing = false;
    this.emit("complete", this.interrupted);
    //reset the interrupt state so we can be run again
    this.interrupted = false;
  }.bind(this));
}

Sequence.prototype.cancel = function(){
  return this.emit("cancel");
}


Sequence.prototype.interrupt = function(done){
  if(done) this.once("complete", done);
  if(this.interruptable && this.executing){
    this.interrupted = true;
    //clear any timeouts that were set during _run()
    this._timeouts.forEach(clearTimeout);
    //finish the currently running step
    this._currentDoneFunc();
    this._currentDoneFunc = function(){};
    return true
  }
  return false;
}