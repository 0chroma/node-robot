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

EV3 Sensors API
===============

The EV3 sensors API gives you a nice API for getting sensor data and regularly reads the sensor's data for you using a read loop. The frequency that the sensor data is fetched is continuous; as soon as we get a result back, we ask for a new value from the sensor.

All sensor classes have the following API:

```javascript
var robot = require("node-robot");
var adapter = new robot.ev3.Adapter("/dev/tty.EV3-SerialPort")
//make a new TouchSensor on input port 1
var sensor = new robot.ev3.sensors.TouchSensor(adapter, 1);

sensor.on("ready", function(){
  //called after the first value is read off of the sensor
  //basically the same thing as sensor.once("data", function(){ ... })
});


//note that these values will initially be set to null before on("ready") or on("data") fire
sensor.value //the last immediate value read from the sensor
sensor.averageValue //a running average of the sensor value using past readings

//use this to change the number of readings used to calculate averageValue (default: 10)
sensor.averageValueSampleSet = 20;

sensor.on("change", function(newValue, oldValue){
  //called whenever sensor.averageValue changes between read loop calls
})

sensor.on("data", function(value){
  //called whenever the read loop gets data from the sensor
})
```

The following sensors are available:

```javascript
var sensors = require("node-robot").ev3.sensors;
sensors.TouchSensor(adapter, port)
touchSensor.value == true //will be a boolean

// RINTENSITY and AINTENSITY also supported
sensors.ColorSensor(adapter, port, sensors.ColorSensor.modes.COLOR)
//values for this sensor can be compared using the ColorSensor.colors constants, eg:
colorSensor.value == ColorSensor.colors.BLACK
//Avail colors: NULL, BLACK, BLUE, GREEN, YELLOW, RED, WHITE, BROWN

sensors.InfraSensor(adapter, port)
touchSensor.value > 0 //will be an integer

```

Turning off the read loop (not recommended)
-------------------------------------------

By default the sensors API will continually read the sensor reading from the EV3. If you don't want this behavior, you can turn this off by passing in `true` as the fourth argument of any of the sensors:

```javascript
var sensor = new robot.ev3.TouchSensor(adapter, 1, null, true); //set up manual reading

//manually read a sensor
sensor.read(function(value, averageValue){
  // ...
})
```

Note that averageValue will only be caluclated with the values the library fetches for each individual read() call, so it won't be very useful unless you're calling read() at regular intervals in your code. You can still change the number of samples used to calculate the average by setting `sensor.averageValueSampleSet`.

Also note that things like sensor.value, sensor.averageValue, and the sensor.on("change") event will not be available with the read loop disabled.


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
