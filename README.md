node-robot
==========

A node.js framework for programming robots. The framework centers around scheduling interruptable sequences of tasks which can get interrupted by things like sensor events. There are adapters for communicating with the Lego Mindstorms EV3 bricks over Bluetooth included, however, you can use any communication adapter you'd like (eg johnny-five).

This started as a rewrite of [ev3-Nodejs-bluetooth-Api](https://github.com/davidyang/ev3-Nodejs-bluetooth-Api).

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

  mySynchronousFunction(); //if we don't accept a done() argument,
                           //the next step is called after the function returns

}).after(2000, function(done){ //called after 2s

  myAsyncFunction(function(){
    done(); //this task in the sequence won't complete until done() is called
  })

}).wait(function(){

  return foo > bar; //called over and over until we return true

}).do(function(){ //called once foo > bar

  doSomethingElse();

})

seq.schedule();

mySensor.on("change", function(value){
  scheduler.interrupt(function(){
    scheduleSomeReactionSequence(value);
  });
});
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

sequence.on("start", function(){
  //called when sequence is run
})

sequence.on("complete", function(interrupted){
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

Note that these don't return `this` since they're standard `EventEmitter` events. In other words, you can't do `on("event").schedule();`


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

EV3 Adapter & Connecting to the EV3 Brick
=========================================

The adapter is what the other APIs use to communicate with the EV3 brick. It maintains the serial port connection and does some other protocol-related tasks.

It takes a single argument: the path to the tty device on your machine.

I haven't tested this method, but on Windows you can navigate to Device Manager and open the list of Ports. There you can right-click on the device you wish to assign a port number. After right-clicking, click Properties. There should be a tab called Port Settings. In here, you should find a setting to assign a port number. You can pass that port number (eg COM1) to the adapter.

On OSX, this device should be created automatically (look in `/dev/` for the relevant device, it should follow the format `/dev/tty.<brick name>-SerialPort`)

On Linux, you need to pair/connect to the device using whichever bluetooth GUI/command line tool you prefer, then running the following:

```bash
sudo rfcomm bind /dev/rfcomm0 <device address>
sudo chmod /dev/rfcomm0 777 #allow access to the serial port for all users, should be ok for 99% of cases

#when you're done and want to remove the device, run this:
sudo rfcomm release /dev/rfcomm0
```

The device address will look like something like `00:16:53:3F:92:CC` and you can copy and paste it from whichever tool you used to pair with the brick.

Note that after pairing & setting up the serial port, the device will appear as disconnected. The computer only connects to the brick when the serial port is opened, so this is completely normal.


Usage is straightforward, just make sure you don't do anything with it until the `on("ready")` event is fired:

```javascript
var robot = require("node-robot");
var adapter = new robot.ev3.Adapter("/dev/rfcomm0")

adapter.on("ready", function(){
  //initiate your application here
});
```


EV3 Sensors API
===============

The EV3 sensors API gives you a nice API for getting sensor data and regularly reads the sensor's data for you using a read loop. The frequency that the sensor data is fetched is continuous; as soon as we get a result back, we ask for a new value from the sensor.

All sensor classes have the following API:

```javascript
var robot = require("node-robot");
var adapter = new robot.ev3.Adapter("/dev/rfcomm0")
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
var touchSensor = sensors.TouchSensor(adapter, port)
touchSensor.value == true //will be a boolean

// RINTENSITY and AINTENSITY (Reflected Light Intensity and Ambient Light Intensity modes) also supported
// those modes will return a number instead of a color
var colorSensor = sensors.ColorSensor(adapter, port, sensors.ColorSensor.modes.COLOR)
//values for this sensor can be compared using the ColorSensor.colors constants, eg:
colorSensor.value == ColorSensor.colors.BLACK
//Avail colors: NULL, BLACK, BLUE, GREEN, YELLOW, RED, WHITE, BROWN

var infraSensor = new sensors.InfraSensor(adapter, port)
infraSensor.value > 0 //will be an integer

```

Turning off the read loop (not recommended)
-------------------------------------------

By default the sensors API will continually read the sensor reading from the EV3. If you don't want this behavior, you can turn this off by passing in `true` as the fourth argument of any of the sensors:

```javascript
var sensor = new robot.ev3.TouchSensor(adapter, 1, null, true); //set up manual reading

//manually read a sensor
sensor.read(function(err, value, averageValue){
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
var adapter = new robot.ev3.Adapter("/dev/rfcomm0")
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
