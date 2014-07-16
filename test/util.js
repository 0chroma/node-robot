module.exports = {
  runIfSp: function(testFunc){
    return process.env.SERIAL_PORT ? testFunc : null;
  },
  mockSensorAdapter: function(cb){
    return {
      readSensor: function(a,b,c,done){
        return cb(done);
      }
    }
  },
  mockMotorAdapter: function(cb){
    return {
      setMotors: function(a,b,c,d,done){
        return cb(done);
      }
    }
  }
}