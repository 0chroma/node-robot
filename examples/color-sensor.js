var r = require('../index');
var Adapter = r.ev3.Adapter;
var ColorSensor = r.ev3.sensors.ColorSensor;

var a = new Adapter("/dev/rfcomm0");

var s = new ColorSensor(a, 1);

var colorToString = {};

colorToString[ColorSensor.colors.NULL] = "None";
colorToString[ColorSensor.colors.BLACK] = "Black";
colorToString[ColorSensor.colors.BLUE] = "Blue";
colorToString[ColorSensor.colors.GREEN] = "Green";
colorToString[ColorSensor.colors.YELLOW] = "Yellow";
colorToString[ColorSensor.colors.RED] = "Red";
colorToString[ColorSensor.colors.WHITE] = "White";
colorToString[ColorSensor.colors.BROWN] = "Brown";

s.on("change", function(newVal, oldVal){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write("Color sensor reading: " + colorToString[newVal]);
})

process.on('SIGINT', function() {
  //when the user hits ctrl+c, close the adapter
  process.stdout.write("\n");
  a.close();
});
