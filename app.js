/**
 * @Author: John Isaacs <john>
 * @Date:   23-Mar-182018
 * @Filename: server.js
 * @Last modified by:   john
 * @Last modified time: 23-Nov-182018
 */

// server.js
// load the things we need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var timetables = require('./timetableJson');
var flipit = require('./flipreverseip');
const requestIp = require('request-ip');
const fs = require('fs');
var moment = require('moment');
moment().format();
var args = process.argv.slice(2);



// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', function(req, res) {

  var tagline = "Commit messages are memory.";
  res.render('index');
});
app.get('/test', function(req, res) {

  var tagline = "Commit messages are memory.";
  res.render('indexnew');
});

app.get('/graph', function(req, res) {

  var tagline = "Commit messages are memory.";
  res.render('graph');
});

app.get('/ping', function(req, res) {
  var clientIp = requestIp.getClientIp(req);
  console.log(clientIp);
  //console.log(clientIp + " "+flipit.reverseLookup(req.connection.remoteAddress));

});

//start the timetables process
timetables.getTimetables();

//start the server


var port =  8080;
if (args[0]) {
  port = args[0];
}
http.listen(port, function() {
  console.log(port + ' is the magic port');
  //check for new data every minute.
  setInterval(intervalFunc, 60000);
});

//socket io incomming. When a new client connects to the system they will get the latest data
io.on('connection', function(socket) {
  console.log('a user connected');
  socket.emit('info', 'Connected to server...socket:' + socket.id);
  //socket.emit('data', 'initial data');
  getData(function(response) {
    socket.emit('data', response);
  });


});

//function to read the json produced by the timetale parser.
function getData(callback) {
  var obj;
  var response = {}
  response.rooms = [];
  fs.readFile('./timetables/data.json', 'utf8', function(err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    var d = new Date(Date.now());
    var datestring = d.toLocaleString()
    var tzo = d.getTimezoneOffset();
    var n = d.getDay() - 1;
    if (n < 0) {
      n = 6;
    }
    //n = 3;
    console.log(n)
    console.log("getting data")
    //this generats a JSON paylod to be sent to the client. Every room with the now and next items
      console.log(JSON.stringify(obj.length))
    for (var x = 0; x < obj.length; x++) {
      var room = {}

      room.room = obj[x].roomName;
      room.id = obj[x].roomID;
      room.timestamp = obj[x].timestamp;
      room.timestampupdate = datestring;

      var week = obj[x].timetable.week[n];
      var day = week.day;
      var events = week.events;
      var nowmoment = moment().tz("Europe/London").add(1,"hours");
      console.log(nowmoment);
      console.log(room.room + ":" + events.length);
      if (events.length == 0) {
        room.now = "Free until close";
        room.next = "Free until close";
        room.nowstate = 'free';
        room.nextstate = 'free';
      } else {
        var hour = d.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min = d.getMinutes();
        //console.log(hour + ' ' + min)
        min = (min < 10 ? "0" : "") + min;
        var minutesinday = parseInt(min) + (hour * 60);

        room.now = "Free";
        room.next = "Free until close";
        room.nowstate = 'free';
        room.nextstate = 'free';


        for (var e = events.length-1; e >= 0; e--) {

          // var starthours = parseInt(events[e].start.split(':')[0]);
          // var startmins = parseInt(events[e].start.split(':')[1]);
          // //console.log(starthours + ' ' + startmins)
          // var endhours = parseInt(events[e].end.split(':')[0]);
          // var endmins = parseInt(events[e].end.split(':')[1]);
          // //console.log(endhours + ' ' + endmins)
          // var startinday = startmins + (starthours * 60);
          // var endinday = endmins + (endhours * 60);

          var startmoment  = moment(events[e].start, 'HH:mm').subtract(1,'minutes');
          var endmoment  = moment(events[e].end, 'HH:mm');


          //console.log(startinday + ' ' + minutesinday + ' ' +endinday)
          if (nowmoment.isBetween(startmoment,endmoment)) {

            room.now = events[e].event + " Started at " + events[e].start + " ends at " + events[e].end
            room.nowstate = 'busy';
            if (e + 1 < events.length) {
              if (events[e].end == events[e + 1].start) {
                room.next = events[e + 1].event + " Starts at " + events[e + 1].start + " ends at " + events[e + 1].end
                room.nextstate = 'busy';
              } else {
                room.next = "Free until " + events[e + 1].start;
                room.nextstate = 'free';
              }
            } else {
              room.next = 'Free until close'
              room.nextstate = 'free';
            }
            //return;
          } else if (nowmoment.isBefore(startmoment)) {
            room.now = "Free until " + events[e].start;
            room.nowstate = 'free';
            room.next = events[e].event + " Starts at " + events[e].start + " ends at " + events[e].end
            room.nextstate = 'busy';
          }

        }


      }
      response.rooms.push(room);
    }
    callback(response);
  });
}

//every minute emit the new data to any (all) listening client
function intervalFunc() {
  getData(function(response) {
    io.emit('data', response);
  });
}
