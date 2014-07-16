module.exports = {
  'ev3': {
    'sensors': require("./lib/ev3/sensors"),
    'Motors': require("./lib/ev3/motors"),
    'Adapter': require("./lib/ev3/adapter")
  },
  'Scheduler': require("./lib/scheduler")
}