
var Scheduler = module.exports = function(){
  this.tasks = {};
  this._taskCounter = 0;
}

Scheduler.prototype.scheduleTimeout = function(fn, time, interruptable){
  return this._schedule(fn, time, "timeout", interruptable);
}

Scheduler.prototype.scheduleInterval = function(fn, time, interruptable){
  return this._schedule(fn, time, "interval", interruptable);
}

Scheduler.prototype._schedule = function(fn, time, type, interruptable){
  //schedules a task with a given name

  //set up default parameter values etc.
  var self = this;
  var index = this._taskCounter++;
  //extract the name of the function we were passed using regex
  //this way someone can look it up later if need be
  var fn_name_regex = /^function\s*([^\(]*)\(\s*([^\)]*)\)/m;
  var name = fn.toString().match(fn_name_regex)[1];
  //have a time of 0 by default
  time = time || 0;
  //set a timeout by default
  type = type || "timeout";
  //interruptable if the parameter wasn't specified by default
  interruptable = (typeof interruptable) == "boolean" ? interruptable : true;

  //add a task object so we can keep track of it
  this.tasks[index] = {
    'name': name,
    'fn': fn,
    'time': time,
    'interruptable': interruptable,
    'type': type,
    '_handle': null
  }
  
  //func that will fire this task
  var fire = function(){
    self._fireTask(index);
  };

  //actually hook it up to node's timers
  if(type == "timeout" && time > 0){
    this.tasks[index]._handle = setTimeout(fire, time);
  }else if(type == "timeout" && time <= 0){
    this.tasks[index]._handle = setImmediate(fire);
  }else if(type == "interval"){
    this.tasks[index]._handle = setInterval(fire, time)
  }else{
    throw new Error("Invalid schedule type passed to Scheduler._schedule: "+type+" with timeout of "+time);
  }

  return index;
};

Scheduler.prototype._fireTask = function(index){
  //fires the callbacks of scheduled tasks with two args:
  //the task object that we created in this.tasks, and an object w/ all tasks scheduled
  var task = this.tasks[index];
  delete this.tasks[index];
  task.fn(task, this.tasks);
}

Scheduler.prototype.interruptTasks = function(){
  this.tasks.forEach(function(item, index){
    console.log(item, index);
    //TODO: finish this method
  });
}