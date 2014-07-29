var robot = require("../index");
var scheduler = new robot.Scheduler();
var ColorSensor = robot.ev3.sensors.ColorSensor;

var adapter = new robot.ev3.Adapter("/dev/rfcomm0");
var motors = new robot.ev3.Motors(adapter);
var colorSensor = new ColorSensor(adapter, 1, ColorSensor.modes.COLOR);

//this assumes we're following a black line on a white background

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

process.on('SIGINT', function() {
  //when the user hits ctrl+c, close the adapter
  adapter.close();
  process.exit(0);
});