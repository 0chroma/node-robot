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
    }).wait("true == true").do(function(){
      if(ran.first && ran.second)
        done();
      else
        throw Error("first two steps didn't run!");
    }).run();
  });
  test("interrupts wait() correctly", function(done){
    var s = new Sequence();
    var interrupted = false;
    s.wait("false == true").do(function(){
      throw new Error("this should never run");
    }).run();

    s.on("complete", function(i){
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

    s.on("complete", function(interrupted){
      if(ran) throw new Error("condition ran!");
      if(!interrupted) throw new Error("wasn't interrupted!");
      done();
    })

    setTimeout(function(){
      s.interrupt()
    }, 30);
  });

  test("wait() finishes when a condition is fufilled", function(done){
    var s = new Sequence();
    var ran = false;
    var cond = false;
    s.wait(function(){
      return cond == true
    }, 5).do(function(){
      ran = true;
    }).do(function(){
      assert(ran);
      assert(cond);
      done();
    }).run();

    setTimeout(function(){
      cond = true;
    }, 30)
  })

  test("sequence not interrupted when user-defined function is running", function(done){
    var s = new Sequence();
    var ran = false;
    s.do(function(done){
      setTimeout(function(){
        ran = true;
        done();
      }, 35);
    }).run();

    s.interrupt(function(){
      assert(ran);
      done();
    })
  })
});