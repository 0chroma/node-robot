var Motors = module.exports = function(adapter){
  this.states = {A: 0, B: 0, C: 0, D: 0};
  this.adapter = adapter;
}

Motors.prototype.set = function(query, val, cb){
  //usage: set({"A": 50, "B,C": 100}, function(){...});
  //alternatively: set("A,B", 100, function(){...});
  //callback in both cases is optional
  var params = [];
  if(typeof query == "object"){
    //in this case, the callback will be the second argument, not the third
    cb = val;
    //expand each comma separated key into distinct keys
    for(var i in query){
      var obj;
      if(i.indexOf(","))
        params.push(this._expand(i, query[i]));
      else{
        var obj = {};
        obj[i]=query[i];
        params.push(obj);
      }
    }
  }else{
    params.push(this._expand(query, val));
  }
  //combine keys into one object
  var states = {};
  params.forEach(function(param){
    for(var i in param){
      states[i] = param[i];
    }
  })

  //set motors/internal states
  for(var i in this.states){
    this.states[i] = states[i];
  }
  this.adapter.setMotors(states.A, states.B, states.C, states.D, cb);
}

Motors.prototype._expand = function(query, val){
  var obj = {};
  query.replace(/\s/g,'').split(",").forEach(function(item){
    if(item=="*")
      obj = {A: val, B: val, C: val, D: val};
    else
      obj[item] = val;
  })
  return obj;
}

Motors.prototype.get = function(ports){
  //usage: get("A") -> 100
  //alternatively: get("A,B") -> [100, 40]
  if(ports == "*")
    return this.states;
  else if(!ports.indexOf(","))
    return this.states[ports];
  else{
    var ret = [];
    ports.split(",").forEach(function(i){
      ret.push(this.states[i])
    })
  }
}