var EventEmitter = require("events").EventEmitter;
var util = require("util");
var serialport = require("serialport");

var Adapter = module.exports = function(devicePath){
  EventEmitter.call(this);

  var sp = this.serialPort = new serialport.SerialPort(devicePath, {
      parser: serialport.parsers.raw
  }, false);
  this.requestCounter = 0;
  this.callbacks = {};

  var self = this;
  sp.on('open', function (){
    sp.on('data', function(packet){
      this.emit('data', packet);
      this.processSensor(packet);
    });
  });
}

util.inherits(Adapter, EventEmitter);

Adapter.prototype.readSensor = function(port, mode, type, cb){
  var requestId = this.requestCounter++;
  this.callbacks[requestId] = cb;
  var command = new Buffer("0B00"+requestId+"0001009A000"+ (port-1) + type +"0"+ mode +"60","hex");
  this.serialPort.write(command);
  //TODO: have some sort of timeout system in place
}

Adapter.prototype.processSensor = function(packet){
  var requestId = packet.toString('hex').substr(4,4);
  callbacks[requestId](null, packet);
}