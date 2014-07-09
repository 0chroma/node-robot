var Adapter = require("../lib/ev3/adapter");
var runIfSp = require("./util").runIfSp;

suite("Adapter", function(){
  test("should get sensor data", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.readSensor(1 /*port 1*/, 0, 10/*touch sensor*/, function(err, data){
      console.log("raw readsensor data:" + data);
      done();
    })
  }))
});