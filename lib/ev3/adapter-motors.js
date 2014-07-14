var MotorAdapter = module.exports = function(){
  if(!this.serialPort)
    throw new Error("SensorAdapter is meant to be used as a mixin and not as a standalone class!")

}

MotorAdapter.prototype.setMotors = function(a,b,c,d,cb){
  var output = this._getOutputSequence(a,b,c,d);
  this.serialPort.write(output, cb);
}

MotorAdapter.prototype._getOutputSequence = function(a,b,c,d){

  var OUTPUT_HEADER_SEQ = "000004"; 
  var OUTPUT_DELIMITER_SEQ = "30";

  //modify header
  var header = OUTPUT_HEADER_SEQ; 

  var body_a =  "";
  if(a != null) body_a = OUTPUT_DELIMITER_SEQ + this._getHexOutput(a) + OUTPUT_BODY_SEQ + "301000000830100000040";

  var body_b =  "";
  if(b != null) body_b = OUTPUT_DELIMITER_SEQ + this._getHexOutput(b) + OUTPUT_BODY_SEQ + "302000000830200000040";

  var body_c =  "";
  if(c != null) body_c = OUTPUT_DELIMITER_SEQ + this._getHexOutput(c) + OUTPUT_BODY_SEQ + "303000000830300000040";

  var body_d =  "";
  if(d != null) body_d = OUTPUT_DELIMITER_SEQ + this._getHexOutput(d) + OUTPUT_BODY_SEQ + "304000000830400000040";

  //get counter
  var size = ((this._getRequestCounter()+header+body_a+body_b+body_c+body_d).length/2).toString(16); //check this 
  var prefix = size + "00" + this._getRequestCounter() + header ;
  var body = prefix + body_a + body_b + body_c + body_d; 
  //console.log(body.toUpperCase());
  return  new Buffer( body.toUpperCase(), "hex");
};

MotorAdapter.prototype._getHexOutput = function(output){
  var res = "";
    if(output < 0 && output >= -32) {
    output = 256 + output;
    res =  output.toString(16);
    
  }
  else if ( output < -32 ){
    output = 256 + output;
    res =  output.toString(16);
    res = "81" + res;
  }
  
  if (output >= 0 && output < 32) {
    res =  output.toString(16);
  }
  else if ( output >= 32 ) {
    res =  output.toString(16);
    res = "81" + res;
  }
  
  //one digit
  if (res.length == 1){
    res = "0" +res;
  } 
  
  return res;
}