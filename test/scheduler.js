var Scheduler = require("../lib/scheduler");
var assert = require('assert');

suite("Scheduler", function(){
  test("should run a sequence", function(done){
    var s = new Scheduler();
    s.sequence(function(){
      done();
    }).schedule();
  });

  test("should run a sequence after a delay", function(done){
    var s = new Scheduler(true);
    var called = false;
    s.sequence(function(){
      
    }).after(30, function(){
      called = true;
    }).schedule();

    s.sequence(function(){
      assert(called);
      done();
    }).schedule();

    s.start();
  })

  test("should emit an empty event when finished", function(done){
    var s = new Scheduler(true);
    var called = false;
    s.sequence(function(){
      called = true;
    }).schedule();

    s.on("empty", function(){
      assert(called);
      done();
    })

    s.start();
  });

  test("should run a sequence after a delay", function(done){
    var s = new Scheduler(true);
    s.sequence(function(){
      
    }).after(30, function(){
      throw new Error("this should never get called!");
    }).schedule();

    var canceled = false;
    s.sequence(function(){}).onCancel(function(){
      canceled = true;
    }).schedule();

    s.start();

    s.interrupt(function(){
      assert(canceled);
      done();
    })
  })
});