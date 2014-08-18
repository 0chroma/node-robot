var assert = require("assert");
var runIfSp = require("./util").runIfSp;
var mockMotorAdapter = require("./util").mockMotorAdapter;
var Adapter = require("../lib/ev3/adapter");
var Motors = require("../lib/ev3/motors");

suite("Ev3 motors", function(){

  test("should get all motors correctly before being set", function(){
    var adapterCalled = false;
    var a = mockMotorAdapter(function(a,b,c,d,cb){
      cb();
    });
    var m = new Motors(a);
    assert.equal(m.get("A"), 0);
    assert.deepEqual(m.get("B,C"), [0,0]);
    assert.deepEqual(m.get("*"), {
      A: 0,
      B: 0,
      C: 0,
      D: 0
    });
  });

  test("should get all motors correctly after being set", function(done){
    var adapterCalled = false;
    var a = mockMotorAdapter(function(a,b,c,d,cb){
      cb();
    });
    var m = new Motors(a);
    m.set("*", 100, function(){
      assert.equal(m.get("A"), 100);
      assert.deepEqual(m.get("B,C"), [100,100]);
      assert.deepEqual(m.get("*"), {
        A: 100,
        B: 100,
        C: 100,
        D: 100
      });
      done();
    });
  });

  test("should set all motors correctly", function(done){
    var adapterCalled = false;
    var a = mockMotorAdapter(function(a,b,c,d,cb){
      assert.equal(a, 100);
      assert.equal(b, 100);
      assert.equal(c, 100);
      assert.equal(d, 100);
      adapterCalled=true;
      cb();
    });
    var m = new Motors(a);
    m.set("*", 100, function(){
      assert(adapterCalled);
      done();
    });
  });

  test("should set some motors correctly", function(done){
    var adapterCalled = false;
    var a = mockMotorAdapter(function(a,b,c,d,cb){
      assert.equal(a, 50);
      assert.equal(b, 50);
      assert(!c);
      assert(!d);
      adapterCalled=true;
      cb();
    });
    var m = new Motors(a);
    m.set("A, B", 50, function(){
      assert(adapterCalled);
      done();
    });
  });

  test("should set motors correctly w/ object param", function(done){
    var adapterCalled = false;
    var a = mockMotorAdapter(function(a,b,c,d,cb){
      assert.equal(a, 50);
      assert.equal(b, 50);
      assert.equal(c, 20);
      assert(!d);
      adapterCalled=true;
      cb();
    });
    var m = new Motors(a);
    m.set({
      "A,B": 50,
      "C": 20
    }, function(){
      assert(adapterCalled);
      done();
    });
  });

});