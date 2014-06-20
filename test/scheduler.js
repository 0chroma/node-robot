var Scheduler = require("../lib/scheduler");

suite("Scheduler", function(){
  test("should fire after time", function(done){
    var s = new Scheduler();
    s.scheduleTimeout(function(){
      done();
    }, 30);
  })
});