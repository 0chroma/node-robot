var util = require("util");
var events = require("events");

var sensor_types = {
  IR: "21",
  TOUCH: "10",
  COLOR: "1d",
  ULTRASONIC: 0,
  GYRO: 0
}






var Sensor = function(adapter, input_port, mode, manualStartReadLoop){
  events.EventEmitter.call(this);

  this.adapter = adapter;
  this.input_port = input_port; // a number 1-4
  this.mode = 0;
  this.type_bit = 0;
  
  this.value = null;
  this.averageValue = null;
  this._lastValues = [];
  this.averageValueSampleSet = 10; //get last 10 values for averaging

  this._readLoopActive = false;
  this._lastReadLoopErr = null;

  if(!manualStartReadLoop)
    adapter.on("ready", this.startReadLoop.bind(this));

  //set up the on("change") event
  this._lastAvg = null;
  this.on("data", function(val, avgValue){
    if(this._lastAvg == null){
      this._lastAvg = avgValue;
    }else{
      if(this._changed(this._lastAvg, avgValue)){
        this.emit("change", avgValue, this._lastAvg);
      }
      this._lastAvg = avgValue;
    }
  }.bind(this));
}

util.inherits(Sensor, events.EventEmitter);

Sensor.prototype.read = function(cb){
  var self = this;
  var counter = this.adapter.readSensor(this.input_port, this.mode, this.type_bit, function(err, packet){
    self._processSensorCallback(err, packet, cb);
  });
}

Sensor.prototype._changed = function(oldValue, newValue){
  return oldValue != newValue;
}

Sensor.prototype._pushNewValue = function(value){
  this._lastValues.push(value);
  if(this._lastValues.length > this.averageValueSampleSet)
    this._lastValues.splice(0, this._lastValues.length - this.averageValueSampleSet);
}

Sensor.prototype._recalcAverage = function(newValue){
  //calculates the average of this._lastValues after newValue is pushed
  this._pushNewValue(newValue);
  var sum=0;
  for(var i=0;i<this._lastValues.length;i++) sum += this._lastValues[i];
  return sum/this._lastValues.length;
}

Sensor.prototype._recalcMode = function(newValue){
  //calculates the most common value found in this._lastValues after newValue is pushed
  this._pushNewValue(newValue);

  //count the values
  var readingCount = {};
  for(var i=0; i<this._lastValues.length; i++){
    var key = this._lastValues[i];
    readingCount[key] = readingCount[key] ? readingCount[key]+1 : 1;
  }

  //find the most common one
  var mode = null;
  var modeCount = -Infinity;
  for(var key in readingCount){
    if(readingCount[key] > modeCount){
      mode = key;
      modeCount = readingCount[key];
    }
  }
  if(typeof newValue == "boolean") //workaround because setting a bool to a key will make it a string
    return mode == "true";
  else
    return mode;
}

Sensor.prototype._processSensorCallback = function(err, packet, cb){
  //overridden in child classes
  cb(err, packet);
}


Sensor.prototype.startReadLoop = function(){
  this._readLoopActive = true;
  this._readLoop();
}

Sensor.prototype._readLoop = function(){
  if(this._readLoopActive){
    this.read(function(err, value, avgValue){
      if(err) this._lastReadLoopErr = err;
      var emitReady = this.value == null;
      this.value = value;
      this.averageValue = avgValue;
      //on("ready") gets called if this was the first
      //successful read loop call since the last stopReadLoop()
      //or during the first successful iteration of the read loop
      if(emitReady) this.emit("ready", value, avgValue);
      this.emit("data", value, avgValue);
      this._readLoop();
    }.bind(this));
  }
}

Sensor.prototype.stopReadLoop = function(){
  this._readLoopActive = false;
  this.value = null;
}







var ColorSensor = function(adapter, input_port, mode, manualStartReadLoop){
  Sensor.apply(this, arguments);
  this.type_bit = "1d";
  this.mode = mode || ColorSensor.modes.COLOR;
}

util.inherits(ColorSensor, Sensor);

ColorSensor.modes = {
  RINTENSITY: 0,
  AINTENSITY: 1,
  COLOR: 2
};

ColorSensor.colors = {
  NULL: "00",
  BLACK: "0c",
  BLUE: "19",
  GREEN: "25",
  YELLOW: "32",
  RED: "3e",
  WHITE: "4b",
  BROWN: "57"
}

ColorSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.toString("hex").substr(10,2);

  //if mode is light intensity, change the result to numeric value
  if(this.mode == ColorSensor.modes.RINTENSITY || this.mode == ColorSensor.modes.AINTENSITY){
    payload = parseInt(payload,16);
  }

  cb(null, payload, this._recalcMode(payload)); //payload will be a ColorSensor.colors constant
}







var TouchSensor = function(adapter, input_port, mode, manualStartReadLoop){
  Sensor.apply(this, arguments);
  this.type_bit = "10";
}

util.inherits(TouchSensor, Sensor);

TouchSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.toString("hex").substr(10,2);
  var result = false;
  if(payload == "00") { result = false; } else if(payload == "64") { result=true; }

  cb(null, result, this._recalcMode(result));
}







var InfraSensor = function(adapter, input_port, mode, manualStartReadLoop){
  Sensor.apply(this, arguments);
  this.type_bit = "00";
}

util.inherits(InfraSensor, Sensor);

InfraSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.toString("hex").substr(10,2);
  var result = parseInt(payload, 16);

  cb(null, result, this._recalcAverage(result));
}







module.exports = {
  'ColorSensor': ColorSensor,
  'TouchSensor': TouchSensor,
  'InfraSensor': InfraSensor
}