/*
Based on https://github.com/inductivekickback/ev3/blob/master/ev3/direct_command.py#L1793
*/
var c = require("./protocol-constants");

var Command = module.exports = function(adapter){
  this.adapter = adapter;
}

