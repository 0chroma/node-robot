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