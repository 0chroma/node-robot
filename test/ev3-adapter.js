var Adapter = require("../lib/ev3/adapter");
var runIfSp = require("./util").runIfSp;

suite("Adapter", function(){
  test("should get sensor data", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      a.readSensor(1 /*port 1*/, 0, 10/*touch sensor*/, function(err, data){
        console.log("raw readsensor data:" + data);
        a.close(done);
      })
    })
  }));

  test("should be able to set motors", runIfSp(function(done){
    var a = new Adapter(process.env.SERIAL_PORT);
    a.once("ready", function(){
      a.setMotors(100, 100, 100, 100, function(err){
        if(err) throw err;
        a.close(done);
      })
    })
  }))
});