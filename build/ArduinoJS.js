'use strict';var ARDJS=ARDJS||{};ARDJS.namespace=function(a){var a=a.split("."),d=ARDJS,e;"ARDJS"===a[0]&&(a=a.slice(1));for(e=0;e<a.length;e+=1)"undefined"===typeof d[a[e]]&&(d[a[e]]={}),d=d[a[e]];return d};ARDJS.inherit=function(a){function d(){}if(null==a)throw TypeError();if(Object.create)return Object.create(a);var e=typeof a;if("object"!==e&&"function"!==e)throw TypeError();d.prototype=a;return new d};
if(!Function.prototype.bind)Function.prototype.bind=function(a){if("function"!==typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var d=Array.prototype.slice.call(arguments,1),e=this,b=function(){},c=function(){return e.apply(this instanceof b?this:a||window,d.concat(Array.prototype.slice.call(arguments)))};b.prototype=this.prototype;c.prototype=new b;return c};ARDJS.namespace("ARDJS.Event");ARDJS.Event=function(){var a;a=function(a){this.type=a;this.target=null;this.name="Event"};a.CONNECTED="connected";a.CHANGE="change";a.COMPLETE="complete";return a}();ARDJS.namespace("ARDJS.EventDispatcher");
ARDJS.EventDispatcher=function(){var a;a=function(a){this._target=a||null;this._eventListeners={};this.name="EventDispatcher"};a.prototype={addEventListener:function(a,e){this._eventListeners[a]||(this._eventListeners[a]=[]);this._eventListeners[a].push(e)},removeEventListener:function(a,e){for(var b=0,c=this._eventListeners[a].length;b<c;b++)this._eventListeners[a][b]==e&&this._eventListeners[a].splice(b,1)},hasEventListener:function(a){return this._eventListeners[a]?!0:!1},dispatchEvent:function(a,
e){a.target=this._target;var b=!1,c;for(c in e)a[c.toString()]=e[c];if(this.hasEventListener(a.type)){c=0;for(var j=this._eventListeners[a.type].length;c<j;c++)try{this._eventListeners[a.type][c].call(this,a),b=!0}catch(k){}}return b}};return a}();ARDJS.namespace("ARDJS.ArduinoEvent");
ARDJS.ArduinoEvent=function(){var a,d=ARDJS.Event;a=function(a){this.name="ArduinoEvent";d.call(this,a)};a.ANALOG_DATA="analodData";a.DIGITAL_DATA="digitalData";a.FIRMWARE_VERSION="firmwareVersion";a.FIRMWARE_NAME="firmwareName";a.STRING_MESSAGE="stringMessage";a.SYSEX_MESSAGE="sysexMessage";a.CAPABILITY_RESPONSE="capabilityResponse";a.PIN_STATE_RESPONSE="pinStateResponse";a.ANALOG_MAPPING_RESPONSE="analogMappingResponse";a.READY="arduinoReady";a.prototype=ARDJS.inherit(d.prototype);return a.prototype.constructor=
a}();ARDJS.namespace("ARDJS.SocketEvent");ARDJS.SocketEvent=function(){var a,d=ARDJS.Event;a=function(a){this.name="SocketEvent";d.call(this,a)};a.CONNECTED="socketConnected";a.MESSAGE="socketMessage";a.CLOSE="socketClosed";a.prototype=ARDJS.inherit(d.prototype);return a.prototype.constructor=a}();ARDJS.namespace("ARDJS.Socket");
ARDJS.Socket=function(){var a,d=ARDJS.EventDispatcher,e=ARDJS.SocketEvent;a=function(a,c,e,k){this.name="Socket";d.call(this,this);this._host=a;this._port=c;this._protocol=k||"default-protocol";this._useSocketIO=e||!1;this._socket=null;this._readyState="";this.init(this)};a.prototype=ARDJS.inherit(d.prototype);a.prototype.constructor=a;a.prototype.init=function(a){if(a._useSocketIO){a._socket=io.connect("http://"+a._host+":"+a._port);try{a._socket.on("connect",function(){a.dispatchEvent(new e(e.CONNECTED));
a._socket.on("message",function(c){a.dispatchEvent(new e(e.MESSAGE),{message:c})})})}catch(c){console.log("Error "+c)}}else try{if("MozWebSocket"in window)a._socket=new MozWebSocket("ws://"+a._host+":"+a._port,a._protocol);else if("WebSocket"in window)a._socket=new WebSocket("ws://"+a._host+":"+a._port,a._protocol);else throw console.log("Websockets not supported by this browser"),"Websockets not supported by this browser";console.log("Starting up...");a._socket.onopen=function(){a.dispatchEvent(new e(e.CONNECTED));
a._socket.onmessage=function(c){a.dispatchEvent(new e(e.MESSAGE),{message:c.data})};a._socket.onclose=function(){a._readyState=a._socket.readyState;a.dispatchEvent(new e(e.CLOSE))}}}catch(d){console.log("Error "+d)}};a.prototype.send=function(a){this._socket.send(a)};a.prototype.__defineGetter__("readyState",function(){return this._readyState});return a}();ARDJS.namespace("ARDJS.Pin");
ARDJS.Pin=function(){var a,d=ARDJS.EventDispatcher,e=ARDJS.Event;a=function(e,c){this.type=c;this.name="Pin";this._number=e;this._value=-1;this._lastValue=-1;this._average=0;this._minimum=Math.pow(2,16);this._maximum=0;this._avg=0;this._sum=0;this._numSamples=0;this._analogReporting=a.OFF;this._evtDispatcher=new d(this)};a.prototype={get number(){return this._number},get average(){return this._average},get minimum(){return this._minimum},get maximum(){return this._maximum},get value(){return this._value},
set value(a){this.calculateMinMaxAndMean(a);this._lastValue=this._value;this._value=this._preFilterValue=a;this.detectChange(this._lastValue,this._value)},get analogReporting(){return this._analogReporting},set analogReporting(a){this._analogReporting=a},get lastValue(){return this._lastValue},get preFilterValue(){return this._preFilterValue},detectChange:function(a,c){a!=c&&this.dispatchEvent(new e(e.CHANGE))},clearWeight:function(){this._sum=this._average;this._numSamples=1},calculateMinMaxAndMean:function(a){var c=
Number.MAX_VALUE;this._minimum=Math.min(a,this._minimum);this._maximum=Math.max(a,this._maximum);this._sum+=a;this._average=this._sum/++this._numSamples;this._numSamples>=c&&this.clearWeight()},clear:function(){this._minimum=this._maximum=this._average=this._lastValue=this._preFilterValue;this.clearWeight()},addEventListener:function(a,c){this._evtDispatcher.addEventListener(a,c)},removeEventListener:function(a,c){this._evtDispatcher.removeEventListener(a,c)},hasEventListener:function(a){return this._evtDispatcher.hasEventListener(a)},
dispatchEvent:function(a,c){return this._evtDispatcher.dispatchEvent(a,c)}};a.HIGH=1;a.LOW=0;a.ON=1;a.OFF=0;a.DIN=0;a.DOUT=1;a.AIN=2;a.AOUT=3;a.PWM=3;a.SERVO=4;a.SHIFT=5;a.I2C=6;a.TOTAL_PIN_MODES=7;return a}();ARDJS.namespace("ARDJS.I2CBase");
ARDJS.I2CBase=function(){var a,d=ARDJS.Pin,e=ARDJS.EventDispatcher,b=ARDJS.ArduinoEvent;a=function(c,j,k){if(void 0!=c){this.name="I2CDevice";this.board=c;var i=k||0,k=i&255,i=i>>8&255;this._address=j;this._evtDispatcher=new e(this);j=c.getI2cPins();if(2==j.length){if(c.getPin(j[0]).type!=d.I2C)c.getPin(j[0]).type=d.I2C,c.getPin(j[1]).type=d.I2C;c.addEventListener(b.SYSEX_MESSAGE,this.onSysExMessage.bind(this));c.sendSysex(a.I2C_CONFIG,[k,i])}else console.log("Error, this board does not support i2c")}};a.prototype=
{get address(){return this._address},onSysExMessage:function(c){var c=c.message,e=this.board.getValueFromTwo7bitBytes(c[1],c[2]),b=[];if(c[0]==a.I2C_REPLY&&e==this._address){for(var e=3,d=c.length;e<d;e+=2)b.push(this.board.getValueFromTwo7bitBytes(c[e],c[e+1]));this.handleI2C(b)}},sendI2CRequest:function(c){var e=[],b=c[0];e[0]=c[1];e[1]=b<<3;for(var b=2,d=c.length;b<d;b++)e.push(c[b]&127),e.push(c[b]>>7&127);this.board.sendSysex(a.I2C_REQUEST,e)},update:function(){},handleI2C:function(){},addEventListener:function(a,
e){this._evtDispatcher.addEventListener(a,e)},removeEventListener:function(a,e){this._evtDispatcher.removeEventListener(a,e)},hasEventListener:function(a){return this._evtDispatcher.hasEventListener(a)},dispatchEvent:function(a,e){return this._evtDispatcher.dispatchEvent(a,e)}};a.I2C_REQUEST=118;a.I2C_REPLY=119;a.I2C_CONFIG=120;a.WRITE=0;a.READ=1;a.READ_CONTINUOUS=2;a.STOP_READING=3;return a}();ARDJS.namespace("ARDJS.ui.BlinkM");
ARDJS.ui.BlinkM=function(){var a,d=ARDJS.I2CBase;a=function(a,b){this.name="BlinkM";d.call(this,a,b||9)};a.prototype=ARDJS.inherit(d.prototype);a.prototype.constructor=a;a.prototype.goToRGBColorNow=function(a){this.sendI2CRequest([d.WRITE,this.address,110,a[0],a[1],a[2]])};a.prototype.fadeToRGBColor=function(a,b){b=b||-1;0<=b&&this.sendI2CRequest([d.WRITE,this.address,102,b]);this.sendI2CRequest([d.WRITE,this.address,99,a[0],a[1],a[2]])};a.prototype.fadeToRandomRGBColor=function(a,b){b=b||-1;0<=b&&
this.sendI2CRequest([d.WRITE,this.address,102,b]);this.sendI2CRequest([d.WRITE,this.address,67,a[0],a[1],a[2]])};a.prototype.fadeToHSBColor=function(a,b){b=b||-1;0<=b&&this.sendI2CRequest([d.WRITE,this.address,102,b]);this.sendI2CRequest([d.WRITE,this.address,104,a[0],a[1],a[2]])};a.prototype.fadeToRandomHSBColor=function(a,b){b=b||-1;0<=b&&this.sendI2CRequest([d.WRITE,this.address,102,b]);this.sendI2CRequest([d.WRITE,this.address,72,a[0],a[1],a[2]])};a.prototype.setFadeSpeed=function(a){this.sendI2CRequest([d.WRITE,
this.address,102,a])};a.prototype.playLightScript=function(a,b,c){this.sendI2CRequest([d.WRITE,this.address,112,a,b||1,c])};a.prototype.stopScript=function(){this.sendI2CRequest([d.WRITE,this.address,111])};a.prototype.handleI2C=function(a){console.log("BlinkM: "+a)};return a}();ARDJS.namespace("ARDJS.ui.CompassHMC6352");
ARDJS.ui.CompassHMC6352=function(){var a,d=ARDJS.I2CBase,e=ARDJS.Event;a=function(a,c){this._lastHeading=this._heading=0;this.name="CompassHMC6352";d.call(this,a,c||33);this.sendI2CRequest([d.WRITE,this.address,71,116,81]);this.sendI2CRequest([d.WRITE,this.address,65]);this.startReading()};a.prototype=ARDJS.inherit(d.prototype);a.prototype.constructor=a;a.prototype.__defineGetter__("heading",function(){return this._heading});a.prototype.handleI2C=function(a){this._heading=Math.floor((a[1]<<8|a[2])/
10);this._heading!=this._lastHeading&&this.dispatchEvent(new e(e.CHANGE));this._lastHeading=this._heading};a.prototype.startReading=function(){this.sendI2CRequest([d.READ_CONTINUOUS,this.address,127,2])};a.prototype.stopReading=function(){this.sendI2CRequest([d.STOP_READING,this.address])};return a}();ARDJS.namespace("ARDJS.ui.PhysicalInputBase");
ARDJS.ui.PhysicalInputBase=function(){var a,d=ARDJS.EventDispatcher;a=function(){this.name="PhysicalInputBase";this._evtDispatcher=new d(this)};a.prototype={addEventListener:function(a,b){this._evtDispatcher.addEventListener(a,b)},removeEventListener:function(a,b){this._evtDispatcher.removeEventListener(a,b)},hasEventListener:function(a){return this._evtDispatcher.hasEventListener(a)},dispatchEvent:function(a,b){return this._evtDispatcher.dispatchEvent(a,b)}};return a}();ARDJS.namespace("ARDJS.ui.ButtonEvent");ARDJS.ui.ButtonEvent=function(){var a,d=ARDJS.Event;a=function(a){this.name="ButtonEvent";d.call(this,a)};a.PRESS="pressed";a.RELEASE="released";a.LONG_PRESS="longPress";a.SUSTAINED_PRESS="sustainedPress";a.prototype=ARDJS.inherit(d.prototype);return a.prototype.constructor=a}();ARDJS.namespace("ARDJS.ui.Button");
ARDJS.ui.Button=function(){var a,d=ARDJS.ui.PhysicalInputBase,e=ARDJS.Event,b=ARDJS.ui.ButtonEvent;a=function(c,b,k){d.call(this);this.name="Button";this._pin=c;this.buttonMode=b||a.PULL_DOWN;this.longPressDelay=k||1E3;this._debounceInterval=20;this._repeatCount=0;this._timer=null;this._timeout=null;c.addEventListener(e.CHANGE,this.onPinChange.bind(this))};a.prototype=ARDJS.inherit(d.prototype);a.prototype.constructor=a;a.prototype.onPinChange=function(c){var c=c.target.value,e;this.buttonMode===
a.PULL_DOWN?e=1===c?this.pressed:this.released:this.buttonMode===a.PULL_UP&&(e=1===c?this.released:this.pressed);null!==this._timeout&&clearTimeout(this._timeout);this._timeout=setTimeout(e.bind(this),this._debounceInterval)};a.prototype.pressed=function(){this._timeout=null;this.dispatchEvent(new b(b.PRESS));this._timer=setInterval(this.sustainedPress.bind(this),this.longPressDelay)};a.prototype.released=function(){this._timeout=null;this.dispatchEvent(new b(b.RELEASE));if(null!=this._timer)clearInterval(this._timer),
this._timer=null;this._repeatCount=0};a.prototype.sustainedPress=function(){0<this._repeatCount?this.dispatchEvent(new b(b.SUSTAINED_PRESS)):this.dispatchEvent(new b(b.LONG_PRESS));this._repeatCount++};a.prototype.__defineGetter__("debounceInterval",function(){return this._debounceInterval});a.prototype.__defineSetter__("debounceInterval",function(a){this._debounceInterval=a});a.prototype.__defineGetter__("pinNumber",function(){return this._pin.number});a.PULL_DOWN=0;a.PULL_UP=1;return a}();ARDJS.namespace("ARDJS.ui.RFIDEvent");ARDJS.ui.RFIDEvent=function(){var a,d=ARDJS.Event;a=function(a,b){this.tag=b;d.call(this,a)};a.ADD_TAG="addTag";a.REMOVE_TAG="removeTag";a.prototype=ARDJS.inherit(d.prototype);return a.prototype.constructor=a}();ARDJS.namespace("ARDJS.ui.ID12RFIDReader");
ARDJS.ui.ID12RFIDReader=function(){var a,d=ARDJS.EventDispatcher,e=ARDJS.ArduinoEvent,b=ARDJS.ui.RFIDEvent;a=function(a){this.name="ID12RFIDReader";this.ID12_READER=13;this.READ_EVENT=1;this.REMOVE_EVENT=2;this.board=a;this._evtDispatcher=new d(this);a.addEventListener(e.SYSEX_MESSAGE,this.onSysExMessage.bind(this))};a.prototype={onSysExMessage:function(a){a=a.message;a[0]==this.ID12_READER&&this.processRFIDData(a)},dec2hex:function(a){return(a+256).toString(16).substr(-2).toUpperCase()},processRFIDData:function(a){for(var e=
this.board.getValueFromTwo7bitBytes(a[1],a[2]),d="",i=3,u=a.length;i<u;i+=2)d+=this.dec2hex(this.board.getValueFromTwo7bitBytes(a[i],a[i+1]));e==this.READ_EVENT?this.dispatch(new b(b.ADD_TAG,d)):e==this.REMOVE_EVENT&&this.dispatch(new b(b.REMOVE_TAG,d))},dispatch:function(a){this.dispatchEvent(a)},addEventListener:function(a,e){this._evtDispatcher.addEventListener(a,e)},removeEventListener:function(a,e){this._evtDispatcher.removeEventListener(a,e)},hasEventListener:function(a){return this._evtDispatcher.hasEventListener(a)},
dispatchEvent:function(a,e){return this._evtDispatcher.dispatchEvent(a,e)}};return a}();ARDJS.namespace("ARDJS.ui.Servo");ARDJS.ui.Servo=function(){var a,d=ARDJS.Pin;a=function(a,b){this.name="Servo";this._pin=a.getDigitalPin(b);a.sendServoAttach(b)};a.prototype={set angle(a){if(this._pin.type==d.SERVO)this._angle=a,this._pin.value=this._angle},get angle(){if(this._pin.type==d.SERVO)return this._angle}};return a}();ARDJS.namespace("ARDJS.Arduino");
ARDJS.Arduino=function(){var a=ARDJS.Pin,d=ARDJS.EventDispatcher,e=ARDJS.Event,b=ARDJS.SocketEvent,c=ARDJS.ArduinoEvent;return function(j,k,i,u){function D(a){h.removeEventListener(c.FIRMWARE_VERSION,D);23<=10*a.version?h.send([l,I,m]):console.log("You must upload StandardFirmata version 2.3 or greater from Arduino version 1.0 or higher")}function J(){console.log("debug: startup");h.dispatchEvent(new c(c.READY));h.enableDigitalPinReporting()}function E(a){a=a.substring(0,1);return a.charCodeAt(0)}
function F(f){var g=f.target.number,c=f.target.value;switch(f.target.type){case a.DOUT:a:{f=Math.floor(g/8);if(c==a.HIGH)s[f]|=c<<g%8;else if(c==a.LOW)s[f]&=~(1<<g%8);else{console.log("invalid value passed to sendDigital, value must be 0 or 1");break a}h.sendDigitalPort(f,s[f])}break;case a.AOUT:if(15<g||c>Math.pow(2,14)){f=[];if(c>Math.pow(2,16))throw console.log("Extended Analog values > 16 bits are not currently supported by StandardFirmata"),"Extended Analog values > 16 bits are not currently supported by StandardFirmata";
f[0]=l;f[1]=K;f[2]=g;f[3]=c&127;f[4]=c>>7&127;c>=Math.pow(2,14)&&(f[5]=c>>14&127);f.push(m);h.send(f)}else h.send([y|g&15,c&127,c>>7&127]);break;case a.SERVO:f=h.getDigitalPin(g),f.type==a.SERVO&&f.lastValue!=c&&h.send([y|g&15,c%128,c>>7])}}function t(f){if(f.type==a.DOUT||f.type==a.AOUT||f.type==a.SERVO)f.hasEventListener(e.CHANGE)||f.addEventListener(e.CHANGE,F);else if(f.hasEventListener(e.CHANGE))try{f.removeEventListener(e.CHANGE,F)}catch(c){console.log("debug: caught pin removeEventListener exception")}}
this.name="Arduino";var y=224,l=240,m=247,K=111,I=107,h=this,u=u||"default-protocol",i=i||!1,n,B=0,z=0,r=[],o=[],p=0,s=[],v,C=[],G=[],H=[],q=[],w=0,x=0,A=new d(this);n=new ARDJS.Socket(j,k,i,u);n.addEventListener(b.CONNECTED,function(){console.log("Socket Status: (open)");h.dispatchEvent(new e(e.CONNECTED));h.addEventListener(c.FIRMWARE_VERSION,D);h.reportVersion()});n.addEventListener(b.MESSAGE,function(f){var f=f.message,f=1*f,g;if(0<p&&128>f){if(p--,r[p]=f,0==p)switch(B){case 144:var e=8*z;g=e+
8;var f=r[1]|r[0]<<7,b={};g>=w&&(g=w);for(var d=0,i=e;i<g;i++){b=h.getDigitalPin(i);if(void 0==b)break;if(b.type==a.DIN&&(e=f>>d&1,e!=b.value))b.value=e,h.dispatchEvent(new c(c.DIGITAL_DATA),{pin:b.number,value:b.value});d++}break;case 249:x=r[1]+r[0]/10;h.dispatchEvent(new c(c.FIRMWARE_VERSION),{version:x});break;case y:g=h.getAnalogPin(z);if(void 0==g)break;g.value=h.getValueFromTwo7bitBytes(r[1],r[0])/1023;g.value!=g.lastValue&&h.dispatchEvent(new c(c.ANALOG_DATA),{pin:z,value:g.value})}}else if(0>
p)if(f==m){p=0;switch(o[0]){case 121:g=o;f="";for(d=3;d<g.length;d+=2)b=String.fromCharCode(g[d]),b+=String.fromCharCode(g[d+1]),f+=b;x=g[1]+g[2]/10;h.dispatchEvent(new c(c.FIRMWARE_NAME),{name:f,version:x});break;case 113:g=o;f="";for(d=1;d<g.length;d+=2)b=String.fromCharCode(g[d]),b+=String.fromCharCode(g[d+1]),f+=b.charAt(0);h.dispatchEvent(new c(c.STRING_MESSAGE),{message:f});break;case 108:for(var f=o,b={},d=1,e=g=0,i=f.length,j;d<=i;)if(127==f[d]){G[g]=g;j=void 0;if(b[a.DOUT])j=a.DOUT;if(b[a.AIN])j=
a.AIN,C[e++]=g;j=new a(g,j);j.capabilities=b;t(j);q[g]=j;j.capabilities[a.I2C]&&H.push(j.number);b={};g++;d++}else b[f[d]]=f[d+1],d+=2;v=Math.ceil(g/8);console.log("debug: num ports = "+v);for(f=0;f<v;f++)s[f]=0;w=g;console.log("debug: num pins = "+w);console.log("debug: system reset");h.send(255);setTimeout(J,500);console.log("debug: configured");break;case 110:f=o;b=f.length;d=f[1];e=f[2];i=q[d];4<b?g=h.getValueFromTwo7bitBytes(f[3],f[4]):3<b&&(g=f[3]);if(i.type!=e)i.type=e,t(i);if(i.value!=g)i.value=
g;h.dispatchEvent(new c(c.PIN_STATE_RESPONSE),{pin:d,type:e,value:g});break;case 106:g=o;f=g.length;for(b=1;b<f;b++)127!=g[b]&&(C[g[b]]=b-1);break;default:h.dispatchEvent(new c(c.SYSEX_MESSAGE),{message:o})}o=[]}else o.push(f);else switch(240>f?(g=f&240,z=f&15):g=f,g){case 249:case 144:case y:p=2;B=g;break;case l:p=-1,B=g}});n.addEventListener(b.CLOSE,function(){console.log("Socket Status: "+n.readyState+" (Closed)")});this.getValueFromTwo7bitBytes=function(a,b){return b<<7|a};this.getSocket=function(){return n};
this.reportVersion=function(){h.send(249)};this.reportFirmware=function(){h.send([l,121,m])};this.disableDigitalPinReporting=function(){for(var f=0;f<v;f++)h.sendDigitalPortReporting(f,a.OFF)};this.enableDigitalPinReporting=function(){for(var f=0;f<v;f++)h.sendDigitalPortReporting(f,a.ON)};this.sendDigitalPortReporting=function(a,b){h.send([208|a,b])};this.setAnalogPinReporting=function(f,b){h.send([192|f,b]);h.getAnalogPin(f).type=a.AIN;h.getAnalogPin(f).analogReporting=b};this.setPinMode=function(a,
b){h.getDigitalPin(a).type=b;t(h.getDigitalPin(a));h.send([244,a,b])};this.getAnalogData=function(a){return h.getAnalogPin(a).value};this.getDigitalData=function(a){return h.getDigitalPin(a).value};this.getFirmwareVersion=function(){return x};this.sendAnalog=function(f,b){var c=h.getDigitalPin(f);if(c.type!=a.PWM)c.type=a.PWM,t(c);c.value=b};this.sendExtendedAnalog=function(f,b){var c=h.getDigitalPin(f);if(c.type!=a.AOUT)c.type=a.AOUT,t(c);c.value=b};this.sendDigital=function(a,b){h.getDigitalPin(a).value=
b};this.sendDigitalPort=function(a,b){h.send([144|a&15,b&127,b>>7])};this.sendString=function(a){for(var b=[],c=0,d=a.length;c<d;c++)b.push(E(a[c])&127),b.push(E(a[c])>>7&127);this.sendSysex(113,b)};this.sendSysex=function(a,b){var c=[];c[0]=l;c[1]=a;for(var d=0,e=b.length;d<e;d++)c.push(b[d]);c.push(m);h.send(c)};this.sendServo=function(a,b){h.getDigitalPin(a).value=b};this.sendServoAttach=function(b,c,d){var c=c||544,d=d||2400,e=[];e[0]=l;e[1]=112;e[2]=b;e[3]=c%128;e[4]=c>>7;e[5]=d%128;e[6]=d>>
7;e[7]=m;h.send(e);b=h.getDigitalPin(b);b.type=a.SERVO;t(b)};this.getServo=function(b){b=h.getDigitalPin(b);return b.type==a.SERVO?b.value:-1};this.queryPinState=function(a){h.send([l,109,a.number,m])};this.queryAnalogMapping=function(){h.send([l,105,m])};this.setSamplingInterval=function(a){h.send([l,122,a&127,a>>7&127,m])};this.getPin=function(a){return q[a]};this.getAnalogPin=function(a){return q[C[a]]};this.getDigitalPin=function(a){return q[G[a]]};this.getPinCount=function(){return w};this.getI2cPins=
function(){return H};this.reportCapabilities=function(){for(var a={"0":"input",1:"output",2:"analog",3:"pwm",4:"servo",5:"shift",6:"i2c"},b=0,c=q.length;b<c;b++)for(var d in q[b].capabilities)console.log("pin "+b+"\tmode: "+a[d]+"\tresolution (# of bits): "+q[b].capabilities[d])};this.send=function(a){n.send(a)};this.close=function(){console.log("socket = "+n);n.close()};this.addEventListener=function(a,b){A.addEventListener(a,b)};this.removeEventListener=function(a,b){A.removeEventListener(a,b)};
this.hasEventListener=function(a){return A.hasEventListener(a)};this.dispatchEvent=function(a,b){return A.dispatchEvent(a,b)}}}();
