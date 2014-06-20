var Adapter = require("../lib/ev3-adapter");

suite("Adapter", function(){
  test("should get sensor data", function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.readSensor(1 /*port 1*/, 0, 10/*touch sensor*/, function(err, data){
      console.log(data);
      done();
    })
  })
});