module.exports = {
  runIfSp: function(testFunc){
    return process.env.SERIAL_PORT ? testFunc : null;
  }
}