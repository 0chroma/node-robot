var seq = scheduler.sequence(function(){
  //init phase
}).after(2000, function(){
  //do after 2000 ms
}).once(function(){ return foo == bar}, function(){
  //do something once foo == bar
})

seq.on("interrupt", function(reason){
  //handle any cleanup for the sequence
})
seq.on("cancel", function(){
  //handle if the sequence was never run
})

seq.schedule();

//alternatively

scheduler.uninterruptableSequence(/*...*/);

// then

scheduler.interrupt("myReason", function(){
  //cancels all scheduled sequences
  //gets called once the uninterruptable sequences/cleanups clear out
  
  //we can schedule something to be run here
});

//alternatively
scheduler.uninterruptableInterrupt(/*...*/)



//////////////////////////////

//this forces that all state tracking should be done via the main robot class or with local variables

scheduler.sequence(function(s){
  s.do(function(){

  }).after(2000, function(){

  }).once(function(){ return foo == bar }, function(){

  }).after(2000, function(){
    //at the end of a sequence we should do something else
    //so our robot isn't idle
    scheduleSomeOtherSequence();
  })

  return s;
}).whenInterrupted(function(reason, s){
  //cleanup sequence (can't be interrupted)

  return s;

  //once the returned sequence finishes the sequence passed by the interupt will run
}).schedule();


scheduler.uninterruptableSequence(function(s){
  // ...
  return s;
}).schedule();

//then

scheduler.interrupt("myReason", function(s){
  // ...
  return s;
  // this sequence will get run once all scheduled cleanup and uninterruptable sequences finish
  //this is used for when we need to do stuff like respond to sensor data
}).whenInterrupted(/*...*/); //interupt sequences can be interrupted too

//alternatively
scheduler.uninterruptableInterrupt("myReason", function(s){ /*...*/ });

/////////////////////////////

var sequence = robot.sequence(function(){
  robot.motors.set("A,B", 100);
}).after(2000, function(){
  //turn
  robot.motors.set({
    "A": 50,
    "B": -50
  })
}).once(function(){ return robot.sensors.light.value == sensors.LightSensor.colors.BLACK }, function(){
  robot.motors.set("A,B", -100);
}).finally(function(err, result){
  //if err then we got an interrupt
})

//alternatively
.then(function(done){
  robot.motors.set("*", 100); //all motors at 100%
  robot.scheduler.scheduleTimeout(done, 2000);
})

sequence.run();

///////////////////////

var MyRobot = function(){
  Robot.apply(this, arguments);

  this.on("")
}

util.inherits(MyRobot, Robot);

MyRobot.prototype.moveForward = function(){

}



//------------------


var r = new Robot();

r.addState("moveForward", 
  [["forward", 2000]]);

r.stateListener("moveForward", "colorChange", function(oldColor, newColor, currentState) {
  if newcolor == black
    r.changeState("moveBackward");

})



//-------------------------


var r = new Robot(/* ... */);

r.run(function(){
  r.on("sensor", function(type, oldValue, newValue){
    if(type != "color") return;
    if(/* out of field */){
      r.commands.back(2000).then(function(){
        r.repeatedSequence([
          ["back", 100],
          function check(break){
            if(r.sensors.color.getValue() == "black"){
              r.commands.turn(180);
              break();

            }
          }
        ])
      });
    }
  })
  r.sequence([
    ["forward", 2000],
    /* ... */
  ])
});