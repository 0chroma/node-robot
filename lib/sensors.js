var util = require("util");
var events = require("events");

var sensor_types = {
  IR: "21",
  TOUCH: "10",
  COLOR: "1d",
  ULTRASONIC: 0,
  GYRO: 0
}

var Sensor = function(adapter, input_port){
  events.EventEmitter.call(this);

  this.adapter = adapter;
  this.input_port = input_port; // a number 1-4
  this.mode = 0;
  this.type_bit = 0;
}

util.inherits(Sensor, events.EventEmitter);

Sensor.prototype.read = function(cb){
  var counter = this.adapter.readSensor(this.input_port, this.mode, this.type_bit, function(){
    cb.apply(this, arguments);
  });
}




var ColorSensor = function(serial_port, input_port, mode){
  Sensor.apply(this, arguments);
  this.type_bit = "1d"
  this.mode = mode || ColorSensor.MODE_COLOR;
}

util.inherits(ColorSensor, Sensor);

ColorSensor.MODE_RINTENSITY = 0;
ColorSensor.MODE_AINTENSITY = 1;
ColorSensor.MODE_COLOR = 2;




module.exports = {
  'ColorSensor': ColorSensor
}