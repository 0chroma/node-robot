var Sequence = require("../lib/sequence");
var assert = require('assert');

suite("Sequence", function(){
  test("runs a sequence correctly", function(done){
    var s = new Sequence();
    var ran = {};
    s.do(function(){
      ran.first = true;
    }).after(10, function(){
      ran.second = true;
    }).when("true == true", function(){
      if(ran.first && ran.second)
        done();
      else
        throw Error("first two steps didn't run!");
    }).run();
  });
  test("interrupts when() correctly", function(done){
    var s = new Sequence();
    var interrupted = false;
    s.when("false == true", function(){
      throw new Error("this should never run");
    }).run();

    s.on("completed", function(i){
      console.log(i);
      interrupted = i;
    })

    setTimeout(function(){
      s.interrupt(function(){
        assert(interrupted);
        done();
      })
    }, 30);
  });
  test("interrupts after() correctly", function(done){
    var s = new Sequence();
    var ran = false;
    s.after(1000, function(){
      ran = true;
      //this way if this ever gets called by stray code
      //we'll get a done() called twice error
      done();
    }).run();

    s.on("completed", function(interrupted){
      if(ran) throw new Error("condition ran!");
      if(!interrupted) throw new Error("wasn't interrupted!");
      done();
    })

    setTimeout(function(){
      s.interrupt()
    }, 30);
  });

  test("when() gets run when a condition is fufilled", function(done){
    var s = new Sequence();
    var ran = false;
    var cond = false;
    s.when(function(){ return cond == true }, function(){
      ran = true;
    }, 5).do(function(){
      assert(ran);
      assert(cond);
      done();
    }).run();

    setTimeout(function(){
      cond = true;
    }, 30)
  })
});