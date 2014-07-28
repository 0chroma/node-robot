var r = require('../index');
var Adapter = r.ev3.Adapter;
var TouchSensor = r.ev3.sensors.TouchSensor;

var a = new Adapter("/dev/rfcomm0");

var s = new TouchSensor(a, 1);

s.on("change", function(newVal, oldVal){
  console.log("Changed to " + (newVal ? "pressed" : "released"));
})

process.on('SIGINT', function() {
  //when the user hits ctrl+c, close the adapter
  a.close();
});
