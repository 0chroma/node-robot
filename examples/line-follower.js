var robot = require("node-robot");
var scheduler = new robot.Scheduler();
var ColorSensor = robot.ev3.sensors.ColorSensor;

var a = new robot.ev3.Adapter("/dev/tty.EV3-SerialPort")
var motors = new robot.ev3.Motors(a);
var colorSensor = new ColorSensor(a, 1, ColorSensor.modes.COLOR);

//this assumes we're following a black line on a white background

var move = function(shouldMoveLeft){
  scheduler.sequence(function(){
      
    if(shouldMoveLeft)
      motors.set("A,B", 100); //move left wheels
    else
      motors.set("C,D", 100); //move right wheels
      
  }).wait(function(){

    //wait until we moved off the line
    return colorSensor.value != ColorSensor.colors.BLACK;
    
  }).do(function(){

    motors.set("*", 0); //stop all motors
    move(!shouldMoveLeft); //call move with the opposite direction
    
  }).schedule();
});
 
move(true);