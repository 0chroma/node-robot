var robot = require("../index");
var scheduler = new robot.Scheduler();
var ColorSensor = robot.ev3.sensors.ColorSensor;

var adapter = new robot.ev3.Adapter("/dev/rfcomm0");
var motors = new robot.ev3.Motors(adapter);
var colorSensor = new ColorSensor(adapter, 1);
var touchSensor = new robot.ev3.sensors.TouchSensor(adapter, 2);

//this assumes we're following a blue line on a white background
//also assumes there is a wall at the end of the line we're following

var move = function(){
  scheduler.sequence(function(){
    console.log("running");
      
    motors.set({"A,B": 20, "C,D": 0}); //move left wheels
      
  }).wait(function(){

    //wait until we moved off the line
    return colorSensor.value == ColorSensor.colors.WHITE;
    
  }).do(function(){

      motors.set({"A,B": 0, "C,D": 20}); //move right wheels

  }).wait(function(){

    //wait until we're back on the line

    if(colorSensor.value == ColorSensor.colors.BLUE) console.log("blue now");
    return colorSensor.value == ColorSensor.colors.BLUE;

  }).wait(function(){
    
    //now wait until we're off the line
    if(colorSensor.value == ColorSensor.colors.WHITE) console.log("now white");
    return colorSensor.value == ColorSensor.colors.WHITE;

  }).do(function(){

    motors.set({"A,B": 20, "C,D": 0}); //move left wheels

  }).wait(function(){

    //wait until we're back on the line
    return colorSensor.value == ColorSensor.colors.BLUE;

  }).do(function(){

    console.log("rescheduling");
    this.schedule(); //reschedule the sequence now that we're back at the starting conditions
    
  }).schedule(); //schedule the sequence to be run
};

colorSensor.on("ready", function(){
  move(); //kick off the loop once the
          //adapter is ready
});

touchSensor.on("change", function(value){
  if(value == true){
    //if the touch sensor is pressed, we hit a wall
    //interrupt the sequence being run, stop the motors, and print that we finished
    scheduler.interrupt(function(){
      motors.set("*", 0, function(){
        console.log("Goal reached!");
        adapter.close();
      });
    });
  }
})

process.on('SIGINT', function() {
  //when the user hits ctrl+c, close the adapter
  adapter.close();
  process.exit(0);
});