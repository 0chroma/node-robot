node-robot
==========

A node.js framework for programming robots using Node.js. There are adapters for communicating with the Lego Mindstorms EV3 bricks included, however, you can use any communication adapter you'd like (eg johnny-five).

This started as a rewrite of [ev3-Nodejs-bluetooth-Api](https://github.com/davidyang/ev3-Nodejs-bluetooth-Api).

The library consists of two parts: a collection of classes for interacting with ev3, and a task scheduler.

Installation
------------

To install, just run `npm install node-robot`.

Examples
--------

See the `examples/` directory for some examples of programs

Scheduler
=========

The library comes with a full featured task scheduler. The general pattern is as follows:

- Schedule a sequences of tasks
- Reschedule a sequences once the scheduler is empty
- Interrupt scheduled tasks when sensors are triggered

Doing this is relatively straightforward and can be done using any robot communication library you want:

```javascript
var Scheduler = require("node-robot").Scheduler;

var scheduler = new Scheduler();

scheduler.on("empty", function(){
  console.log("scheduler no longer has sequences scheduled!");
})

var seq = scheduler.sequence(function(){

  mySynchronousFunction();

}).after(2000, function(done){ //called after 2s

  myAsyncFunction(function(){
    done();
  })

}).wait(function(){

  return foo > bar;

}).do(function(){ //called once foo > bar

  doSomethingElse();

})

seq.schedule();
```

`wait()` and conditional checking
---------------------------------

note that the `wait()` function will call the condition function every 20 ms by default to see if it's true. You can change this interval like so:

```javascript
//call every 5 ms instead
.wait(function(){ return foo > bar }, 5); 
```

Interrupting sequences
----------------------

A common situation is when you get an on("change") event from a sensor or something similar, and you want to respond to it by stopping all currently running sequences. To do this, you can use the built in interrupt feature:

```javascript
scheduler.interrupt(function(){
  //called once the currently running task in the sequence finishes up
  //you can schedule another sequence here if you want
})
```

Scheduler events
----------------

There are a few different events that you can use from the scheduler

```javascript
scheduler.on("sequenceFinished", function(seq){
  //called each time a sequence finishes
})

scheduler.on("empty", function(){
  //called whenever the scheduler has nothing to do
})
```

Sequence events
---------------

You can also listen for events on sequences:

```javascript
var sequence = scheduler.sequence(function(){ /* ... */ });

sequence.on("completed", function(interrupted){
  //called when sequence finishes.
  //interrupted will be true if it was interrupted during execution
})

sequence.on("interrupt", function(){
  //called when the sequence gets an interrupt
  //this event is only emitted after it finishes the currently
  //running step, not immediately when it recieves the interrupt
})

sequence.on("cancel", function(){
  //called when the sequence is canceled
  //this happens when the scheduler gets an interrupt
  //and unschedules the sequence before it gets to run
})

sequence.on("step", function(index, step){
  //called each time a step in the sequence finishes.
  //index will contain the index of the step ran
  //step will contain the step object itself
});
```


Starting and stopping the scheduler
-----------------------------------

You can stop and start the scheduler like so:

```javascript
scheduler.start();
scheduler.active == true //true if there are tasks scheduled which are currently running
scheduler.started == true //true
scheduler.stop(); //won't interrupt the currently running task
scheduler.started == false //true
```

Sensors
=======

TODO

EV3 Motors API
==============

Get access to the motors API like so:

```javascript
var robot = require("node-robot");
var adapter = new robot.ev3.Adapter("/dev/tty.EV3-SerialPort")
var motors = new robot.ev3.Motors(adapter);
```

`get()`
-------
Get the state of the motors like so:

```javascript
motors.get("A") // -> 0
motors.get("A,B") // -> [0, 100]
motors.get("*") // -> {A: 0, B: 100, C: 100, D: 0}
```

`set()`
-------
Set the state of the motors like so:

```javascript
motors.set("A", 100);
motors.set("A, B", 100);
motors.set("*", 100, function(){ /* optional callback */ });
motors.set({
  "A,B": 100,
  "C,D": -100
}, function(){
  //optional callback for once the command has been sent
});
```