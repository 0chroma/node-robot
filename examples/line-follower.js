var move = function(shouldMoveLeft){
  scheduler.sequence(function(){
      
    if(shouldMoveLeft)
      robot.motors.set(100, 0, 0, 0); //move left wheel
    else
      robot.motors.set(0, 0, 0, 100); //move right wheel
      
  }).once(function(){ robot.sensors.light.value == LightSensor.WHITE}, function(){ //once we moved off the line
  
    move(!shouldMoveLeft); //call move with the opposite direction
    
  }).schedule();
});
 
move(true);