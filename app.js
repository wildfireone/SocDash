/**
 * @Author: John Isaacs <john>
 * @Date:   23-Mar-182018
 * @Filename: server.js
 * @Last modified by:   john
 * @Last modified time: 21-Aug-182018
 */

// server.js
// load the things we need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var timetables = require('./timetableJson');
const fs = require('fs');




// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', function(req, res) {

  var tagline = "Commit messages are memory.";
   res.render('index');
});

//start the timetables process
timetables.getTimetables();

//start the server
var port = 8080;
http.listen(port, function() {
  console.log(port +' is the magic port');
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
    var d = new Date();
    var n = d.getDay() - 1;
    if (n < 0) {
      n = 6;
    }
    n=2;
    console.log(n)
    //this generats a JSON paylod to be sent to the client. Every room with the now and next items
    for (var x = 0; x < obj.length; x++) {
      var room = {}
      room.room = obj[x].roomName;
      room.id=obj[x].roomID;
      room.timestamp = obj[x].timestamp;

      var week = obj[x].timetable.week[n];
      var day = week.day;
      var events = week.events;
      console.log(room.room +":" +events.length);
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
        
        for (var e = 0; e < events.length; e++) {

          var starthours = parseInt(events[e].start.split(':')[0]);
          var startmins = parseInt(events[e].start.split(':')[1]);
          console.log(starthours + ' ' + startmins)
          var endhours = parseInt(events[e].end.split(':')[0]);
          var endmins = parseInt(events[e].end.split(':')[1]);
          console.log(endhours + ' ' + endmins)
          var startinday = startmins + (starthours * 60);
          var endinday = endmins + (endhours * 60);
          console.log(startinday + ' ' + minutesinday + ' ' +endinday)
          if (minutesinday > startinday && minutesinday < endinday) {

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
