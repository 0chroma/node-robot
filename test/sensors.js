var sensors = require("../lib/sensors");

suite("sensors", function(){
  test("should get touch sensor data", function(done){
    var a = new Adapter(process.env.EV3_SERIAL_PORT);
    var s = sensors.TouchSensor(a, 1);
    s.read(function(err, val){
      console.log(val);
      done();
    })
  })

  test("should get color sensor data", function(done){
    var a = new Adapter(process.env.EV3_SERIAL_PORT);
    var s = sensors.ColorSensor(a, 2);
    s.read(function(err, val){
      console.log(val);
      done();
    })
  })

  test("should get IR sensor data", function(done){
    var a = new Adapter(process.env.EV3_SERIAL_PORT);
    var s = sensors.InfraSensor(a, 3);
    s.read(function(err, val){
      console.log(val);
      done();
    })
  })
});