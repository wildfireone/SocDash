/**
 * @Author: John Isaacs <john>
 * @Date:   23-Mar-182018
 * @Filename: server.js
 * @Last modified by:   john
 * @Last modified time: 26-Jul-182018
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

// use res.render to load up an ejs view file



app.get('/', function(req, res) {
  var drinks = [{
      name: 'Bloody Mary',
      drunkness: 3
    },
    {
      name: 'Martini',
      drunkness: 5
    },
    {
      name: 'Scotch',
      drunkness: 10
    }
  ];
  var tagline = "Commit messages are memory.";

  res.render('index', {
    drinks: drinks,
    tagline: tagline
  });
});

// about page
app.get('/about', function(req, res) {
  res.render('about');
});

timetables.getTimetables();
http.listen(8080, function() {
  console.log('8080 is the magic port');
  setInterval(intervalFunc, 60000);
});

io.on('connection', function(socket) {
console.log('a user connected');
socket.emit('info', 'Connected to server...socket:' + socket.id);
//socket.emit('data', 'initial data');
getData(function(response) {
  socket.emit('data', response);
});


});


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
    for (var x = 0; x < obj.length; x++) {
      var room = {}
      room.room = obj[x].roomName;

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
        room.now = 'Free';
        for (var e = 0; e < events.length; e++) {
          var starthours = parseInt(events[e].start.split(':')[0]);
          var startmins = parseInt(events[e].start.split(':')[1]);
          //console.log(starthours + ' ' + startmins)
          var endhours = parseInt(events[e].end.split(':')[0]);
          var endmins = parseInt(events[e].end.split(':')[1]);
          //console.log(endhours + ' ' + endmins)
          var startinday = startmins + (starthours * 60);
          var endinday = endmins + (endhours * 60);
          //console.log(startinday + ' ' + minutesinday + ' ' +endinday)
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

function intervalFunc() {
  getData(function(response) {
    io.emit('data', response);
  });
}
