var robot = require("node-robot");
var scheduler = new robot.Scheduler();
var ColorSensor = robot.ev3.sensors.ColorSensor;

var adapter = new robot.ev3.Adapter("/dev/tty.EV3-SerialPort")
var motors = new robot.ev3.Motors(adapter);
var colorSensor = new ColorSensor(adapter, 1, ColorSensor.modes.COLOR);

//this assumes we're following a black line on a white background

var move = function(shouldMoveLeft){
  scheduler.sequence(function(){
      
    if(shouldMoveLeft)
      motors.set("A,B", 50); //move left wheels
    else
      motors.set("C,D", 50); //move right wheels
      
  }).wait(function(){

    //wait until we moved off the line
    return colorSensor.value != ColorSensor.colors.BLACK;
    
  }).do(function(){

    motors.set("*", 0); //stop all motors
    move(!shouldMoveLeft); //do the whole sequence again, but
                           //turn in the opposite direction
    
  }).schedule(); //schedule the sequence to be run
};

adapter.on("ready", function(){
  move(true); //kick off the loop once the
              //adapter is ready
});
