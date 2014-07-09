var sensors = require("../lib/ev3/sensors");
var Adapter = require("../lib/ev3/adapter");


suite("Ev3 sensors", function(){
  test("should get touch sensor data", function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    var s = sensors.TouchSensor(a, 1);
    s.read(function(err, val){
      console.log("touch value: "+val);
      done();
    })
  })

  test("should get color sensor data", function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    var s = sensors.ColorSensor(a, 2, ColorSensor.modes.RINTENSITY);
    s.read(function(err, val){
      console.log("color value: "+val);
      done();
    })
  })

  test("should get IR sensor data", function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    var s = sensors.InfraSensor(a, 3);
    s.read(function(err, val){
      console.log("ir value: "+val);
      done();
    })
  })
});