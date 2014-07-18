var sensors = require("../lib/ev3/sensors");
var Adapter = require("../lib/ev3/adapter");
var runIfSp = require("./util").runIfSp;


suite("Ev3 sensors", function(){

  test("should get touch sensor data", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      var s = new sensors.TouchSensor(a, 1);
      s.read(function(err, val, averageValue){
        console.log("touch value: "+val);
        console.log("average value: "+averageValue);
        done();
      })
    });
  }))

  test("should get color sensor data", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      var s = new sensors.ColorSensor(a, 2, sensors.ColorSensor.modes.RINTENSITY);
      s.read(function(err, val, averageValue){
        console.log("color value: "+val);
        console.log("average value: "+averageValue);
        done();
      })
    });
  }))

  test("should get IR sensor data", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      var s = new sensors.InfraSensor(a, 3);
      s.read(function(err, val, averageValue){
        console.log("ir value: "+val);
        console.log("average value: "+averageValue);
        done();
      })
    });
  }))

  test("read loop should work", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      var s = new sensors.TouchSensor(a, 1);
      s.once("ready", function(value){
        console.log("value from read loop: "+value);
        assert(s.value != null);
        assert(s.averageValue != null)
        done();
      })
    });
  }))
});