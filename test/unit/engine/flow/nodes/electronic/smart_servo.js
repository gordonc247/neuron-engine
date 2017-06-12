var expect = require('chai').expect;
var sinon = require("sinon");

var index = require('../../../../../../lib/engine/flow/index');
var events = require('../../../../../../lib/engine/flow/events');
var node = require('../../../../../../lib/engine/flow/node');
var protocol = require('../../../../../../lib/protocol');

var DEFAULT_CONF = {
  driver: 'mock', 
  loglevel: 'WARN',
  serverIP: '192.168.100.1',
  socketServerPort: 8082,
  userKey: 'a2a9705fc33071cc212af979ad9e52d75bc096936fb28fe18d0a6b56067a6bf8',
  uuid: '76FA49A9-78D8-4AE5-82A3-EC960138E908',
  device: '',
  runtime: 'node',
};

var inId,inPort,inValue, outId,outPort,outValue;

function nodeOutputChanged(id, portName, value){
  outId = id;
  outPort = portName;
  outValue = value; 
}

function nodeInputChanged(id, portName, value){
  inId = id;
  inPort = portName;
  inValue = value; 
}

var positionCases = [
 {
    position: 1000,
    wantInPort: 'position',
    wantInValue: 1000
 },
 {
    position: 4000,
    wantInPort: 'position',
    wantInValue: 4000
 },
 {
    position: 200,
    wantInPort: 'position',
    wantInValue: 200
 }
];

var speedCases = [
 {
    speed: 100,
    wantInPort: 'speed',
    wantInValue: 100
 },
 {
    speed: 40,
    wantInPort: 'speed',
    wantInValue: 40
 },
 {
    speed: 0,
    wantInPort: 'speed',
    wantInValue: 0
 }
];

describe('SMART_SERVO node', function(){
  var enine;
  var driver;
  var id;
  var _activeNodeCache;
  var client;

  before(function() {
    engine = index.create(DEFAULT_CONF);
    driver = engine.setDriver('mock'); 
    engine.on(events.NODEOUTPUT, nodeOutputChanged);
    engine.on(events.NODEINPUT, nodeInputChanged);
    driver._generate(protocol.serialize({
      no: 1, // block no
      type: 0x10,
      data: [{
        'BYTE': 0x60
      }]
    }));
    _activeNodeCache = engine.getActiveNodeCache();
    for (var ID in _activeNodeCache){
      if (_activeNodeCache[ID].type === "SMART_SERVO"){
        id = ID;
      }
    }
  });

  after(function() {
/*
    nodes = engine.getActiveNodes();
    for(var i = 0; i < nodes.length; i++){
      engine.removeNode(nodes[i].id);
    }
*/
    engine.removeListener(events.NODEOUTPUT, nodeOutputChanged);
    engine.removeListener(events.NODEINPUT, nodeInputChanged);
    engine.stop();
    engine = null;
  });

  it('When input changed, should report to app and send to block', function() {
    for (var i = 0; i < positionCases.length; i++){
      _activeNodeCache[id].updateInput('position',positionCases[i].position,true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(positionCases[i].wantInPort); 
      expect(inValue).to.be.eql(positionCases[i].wantInValue); 

      _activeNodeCache[id].updateInput('speed',speedCases[i].speed,true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(speedCases[i].wantInPort); 
      expect(inValue).to.be.eql(speedCases[i].wantInValue);        
    }
  });
});