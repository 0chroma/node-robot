var EventEmitter = require("events").EventEmitter;
var util = require("util");
var serialport = require("serialport");
var _ = require("underscore");

var SensorAdapter = require("./adapter-sensors");
var MotorAdapter = require("./adapter-motors");

var Adapter = module.exports = function(devicePath){
  EventEmitter.call(this);

  var sp = this.serialPort = new serialport.SerialPort(devicePath, {
      parser: serialport.parsers.raw
  }, false);
  this.requestCounter = 0;

  //mixin classes for dealing with various things
  SensorAdapter.call(this);
  MotorAdapter.call(this);

  //open the connection, write the initiation sequence, then load the program onto the Ev3
  var self = this;
  sp.open(function(err){
    if(err) return console.log(err);
    sp.write(Adapter.commands.INIT,function(){
      self._loadProgram(function(){
        self.emit("ready");
      });
    });
  });

}

util.inherits(Adapter, EventEmitter);
_.extend(Adapter.prototype, SensorAdapter.prototype);
_.extend(Adapter.prototype, MotorAdapter.prototype);


Adapter.commands = {
  INIT: new Buffer([0x07,0x00,0x00,0x00,0x80,0x00,0x00,0x02,0x01]),
  INIT_DOWNLOAD: new Buffer("2500010001920F0100002F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E72626600", "hex"),
  PROGRAM: Buffer("140102000193004C45474F0F01000065000500050000004C00000000000000080000000B01000000000000000000000C01000000000000000000000D01000000000000000000000E0100000000000000000000841200841300820000820000841C01820000820000842E2E2F617070732F427269636B2050726F6772616D2F4F6E427269636B496D6167653132008400821B08300060858332000000403482020046646046821300348205004768604782080031604430006005444161820B00A5000161A6000140820400A30001004162820B00A5000262A6000240820400A30002004163820B00A5000463A6000440820400A30004004164820B00A5000864A6000840820400A30008008640408285FF0A0A0A0A0A", "hex"),
  STOP_DOWNLOAD: new Buffer("0600030001980000", "hex"),
  TERMINATE: new Buffer("070055008000000201","hex"),
  RUN_PROGRAM: new Buffer("2D000400800020C00801842F6D6E742F72616D6469736B2F70726A732F6D6F62696C652E7262660040440301404440", "hex" )
}

Adapter.prototype._getRequestCounter = function(){
  if(this.requestCounter >= parseInt("FFFF", 16)) this.requestCounter = 0; //reset if we run out of digits since we're limited to 4 digits
  var cstring = (this.requestCounter++).toString(16);
  while(cstring.length < 4)
    cstring = "0"+cstring;
  return cstring;
}

Adapter.prototype._loadProgram = function(cb){
  var sp = this.serialPort;
  sp.write(Adapter.commands.INIT_DOWNLOAD,function(){
      sp.write(Adapter.commands.PROGRAM,function(){
        sp.write(Adapter.commands.STOP_DOWNLOAD,function(){
          sp.write(Adapter.commands.RUN_PROGRAM, function(){
            if(cb) cb();
          })
        });
      });
    });
}

Adapter.prototype.close = function(cb){
  var sp = this.serialPort;
  sp.write(Adapter.commands.TERMINATE, function(){
    sp.close();
    if(cb) cb();
  })
}