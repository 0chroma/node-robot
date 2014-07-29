var SensorAdapter = module.exports = function(){
  if(!this.serialPort)
    throw new Error("SensorAdapter is meant to be used as a mixin and not as a standalone class!")

  var self = this;
  var sp = this.serialPort;
  sp.on('open', function (){
    sp.on('data', function(packet){
      self.emit('data', packet);
      self.processSensor(packet);
    });
  });

  this.callbacks = {};
}


SensorAdapter.prototype.readSensor = function(port, mode, type, cb){
  var requestId = this._getRequestCounter();
  this.callbacks[requestId] = cb;
  var command = new Buffer("0B00"+requestId+"0001009A000"+ (port-1) + type +"0"+ mode +"60","hex");
  this.serialPort.write(command);
}

SensorAdapter.prototype.processSensor = function(packet){
  var requestId = packet.toString('hex').substr(4,4);
  if(this.callbacks[requestId]){ //throw out anything that we don't have a callback for. Not ideal, but it works.
    this.callbacks[requestId](null, packet);
    delete this.callbacks[requestId];
  }
}