/*
Based on https://github.com/inductivekickback/ev3/blob/master/ev3/direct_command.py#L1793
*/
var protocol = require("./protocol-constants");
var util = require("util");

var Command = function(){
  
}


var Parameter = function(value, type){
  var length = protocol.PARAM_TYPE_LENS[type];
  type = type || protocol.ParamType.LC1;

  Buffer.call(this, length);

  switch type {
    case protocol.ParamType.LC1:
      this.writeUInt8(value, 0);
  }
}
util.inherits(Paramter, Buffer);


var InputReadyRawCommand = function(input_port, mode, device_type, layer){
  this._opcode = new Buffer([protocol.Opcode.INPUT_DEVICE, protocol.InputDeviceSubcode.READY_SI]);

  this._params = [
    new Parameter(layer || protocol.USB_CHAIN_LAYER_MASTER),
    input_port,
    device_type || 0,
    mode || -1,
    1 //number of values
  ];

  this._replyParams = [
    protocol.DataFormat.DATA_F
  ];
}

util.inherits(OutputReadCommand, Command);


module.exports = {
  Command: Command,
  InputReadySiCommand: InputReadySiCommand