/**
 * @Author: John Isaacs <john>
 * @Date:   05-Jun-182018
 * @Filename: index.js
 * @Last modified by:   john
 * @Last modified time: 11-Sep-182018
 */


//
// let fs = require('fs'),
//        PDFParser = require("pdf2json");
//
//     let pdfParser = new PDFParser();
//
//     pdfParser.on("pdfParser_dataError", function(errData){console.error(errData.parserError)});
//     pdfParser.on("pdfParser_dataReady", function(pdfData){
//         fs.writeFile("test/r102829.json", pdfParser.getRawTextContent());
//     });
//
//     pdfParser.loadPDF("test/r102829.pdf");
//fuction export for module to be called by app.js

var schedule = require('node-schedule');
var timetableurl = "http://celcat.rgu.ac.uk/RGU_MAIN_TIMETABLE/";
var weekbusy = [];
module.exports = {
  getTimetables: function() {
    console.log(Date.now());
    var timestamp = new Date(Date.now()).toLocaleString();
    getNextFile(0, timestamp);
    //get timetables every 24 hours
    schedule.scheduleJob('0 1 * * *', retTimetables);
  }
}


//fuction to start incremental timetable parsing
function retTimetables() {
  var timestamp = new Date(Date.now()).toLocaleString();
  getNextFile(0, timestamp);
}



const pdf_table_extractor = require("pdf-table-extractor");
const http = require('http');
const fs = require('fs');
const path = require('path');
const moment = require('moment')
moment.locale('en-gb');
var rooms = [{
        room: "n424 - CISCO Lab",
        roomID: "r102889"
      },
      {
        room: "n523 - Security Lab",
        roomID: "r102823"
      }, {
        room: "n525 - Project Lab",
        roomID: "r102824"
      }, {
        room: "n526 - Usability Lab",
        roomID: "r102891"
      }, {
        room: "n527 - CAD Lab",
        roomID: "r102825"
      },
      {
        room: "n528 - PG Lab",
        roomID: "r102826"
      },
      {
        room: "n529 - PG Lab",
        roomID: "r102827"
      }, {
        room: "n530 - Multimedia Lab",
        roomID: "r102828"
      },{
    room: "n533 - Big Lab",
    roomID: "r102829"
  }
  , {
    room: "Green-Room",
    roomID: "r59135"
  }
];

var outputdata = [];

//this function returns when the PDF parser successfully completes
function success(result) {
  //json object to hold week data
  var output = {
    "week": []
  };
  //var currentWeek = getCurrentWeek(result)
  //getDayTables(result);

  //var day = result.pageTables[currentWeek];
  //console.log(day);
  var currentWeekTables = getDayTables(result);
  //console.log(currentWeek);
  //the timetable format we use stores day data between columns 11 and 18
  for (var i = 0; i < 7; i++) {
    var dayoutput = {
      "day": getDay(i),
      "events": []
    };
    if (currentWeekTables[i]) {
      var daydata = currentWeekTables[i];
      //console.log(daydata);
      //json object to hold day data

      var regex = /([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]/
      var moduleregex = /\C\M\d{4}|\C\M\M\d{3}/
      //this is basically a manual parser to get the data needed. Everything is pushed into the output JSON array
      //console.log("daydata: " + daydata.length)
      for (var j = 1; j < daydata.length; j++) {
        //check the daydata actually exists and is not emppty
        if (!daydata || daydata[j] != "") {
          //  try{
          if (daydata[j].indexOf("\n") < daydata[j].indexOf(",")) {
            //console.log(daydata[j])

            //var regex = /([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]/

            var event = daydata[j].split('\n')[0]
            var cleandaydata = daydata[j].replace(/(\r\n\t|\n|\r\t)/gm, "");
            //console.log(cleandaydata);
            var timestring = cleandaydata.match(regex)[0];

            var module = ""
            try {
              module = cleandaydata.match(moduleregex)[0];
              //console.log(module);
            } catch (err) {
              console.log(cleandaydata)
              console.log("no module code for event")
            }
            if (module != "") {
              event = module + " :" + event;
            }
            //console.log(timestring);
            var start = timestring.split('-')[0] //daydata[j].split('\n')[1].split(',')[1].split('-')[0];
            var end = timestring.split('-')[1] //daydata[j].split('\n')[1].split(',')[1].split('-')[1];

            //console.log('start: ' + start + ' end: ' + end);
            start = start.trim();
            end = end.trim();
            dayoutput.events.push({
              "module": module,
              "event": event,
              "start": start,
              "end": end
            })
          } else {
            var event = daydata[j].split(',')[0]
            var cleandaydata = daydata[j].replace(/(\r\n\t|\n|\r\t)/gm, "");
            var timestring = cleandaydata.match(regex)[0];
            try {
              module = cleandaydata.match(moduleregex)[0];
              //console.log(module)
            } catch (err) {
              console.log(cleandaydata)
              console.log("no module code for event")
            }
            if (module != "") {
              event = module + " :" + event;
            }
            var start = timestring.split('-')[0] //daydata[j].split('\n')[1].split(',')[1].split('-')[0];
            var end = timestring.split('-')[1] //daydata[j].split('\n')[1].split(',')[1].split('-')[1];
            dayoutput.events.push({
              "module": module,
              "event": event,
              "start": start,
              "end": end
            })
          }
          //}catch (err)
          //{
          //console.log(err);
          //}
        } else {

        }
      }
    }

    output.week.push(dayoutput);
  }
  //get current file name (i.e the files that has just closed)
  var filename = path.basename(result.pdfPath)
  rID = filename.split('_')[0] //split on '_' to get ID and Name
  rN = filename.split('_')[1]
  rN = rN.substring(0, rN.length - 4); //drop extension
  //console.log("outdata: " + outputdata.length)
  for (var i = outputdata.length - 1; i >= 0; i--) {

    var obj = outputdata[i];
    if (obj.roomID == rID) {
      obj.timetable = output;
    }
  }
  if (outputdata.length == rooms.length) {
    fs.writeFile('./timetables/data.json', JSON.stringify(outputdata), 'utf8', function() {
      console.log("saved");
    });
    generateBusyData();
  }


}

function generateBusyData() {
  var roombusy = []
  for (r = 0; r < outputdata.length; r++) {
    var weekbusy = [];
    var roomFileName = outputdata[r]['roomName'].split(' ')[0];
    fs.writeFile('./public/' + roomFileName + '.tsv', "", 'utf8', function() {
      console.log("deleted");
    });
    var logger = fs.createWriteStream('./public/' + roomFileName + '.tsv', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write('day\thour\tvalue\n')

    for (d = 0; d < outputdata[r]['timetable']['week'].length; d++) {
      var day = parseInt(d) + 1;
      //console.log(outputdata[r]['timetable']['week'].length)
      var timebusy = new Array(9);
      for (idx = 0; idx < timebusy.length; idx++) {
        timebusy[idx] = 0;
      }
      for (e = 0; e < outputdata[r]['timetable']['week'][d]['events'].length; e++) {

        var momentstart = moment(outputdata[r]['timetable']['week'][d]['events'][e].start, 'HH:mm').subtract(1, "minutes")
        var momentend = moment(outputdata[r]['timetable']['week'][d]['events'][e].end, 'HH:mm')
        //console.log("s"+momentstart)
        //console.log("s"+outputdata[r]['timetable']['week'][d]['events'][e].start)
        if (moment("9:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[0] = 1

        }
        if (moment("10:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[1] = 1
        }
        if (moment("11:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[2] = 1
        }
        if (moment("12:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[3] = 1
        }
        if (moment("13:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[4] = 1
        }
        if (moment("14:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[5] = 1
        }
        if (moment("15:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[6] = 1
        }
        if (moment("16:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[7] = 1
        }
        if (moment("17:00", "HH:mm").isBetween(momentstart, momentend)) {
          timebusy[8] = 1
        }



      }
      for (tb = 0; tb < timebusy.length; tb++) {
        logger.write(day + '\t' + (parseInt(tb) + 1) + '\t' + timebusy[tb] + '\n')
      }
      weekbusy.push(timebusy);
    }
    logger.end();
    roombusy.push(weekbusy);
  }


  fs.writeFile('./timetables/roombusy.json', JSON.stringify(roombusy), 'utf8', function() {
    console.log("saved");
  });

  var cumulativeBusy = new Array(roombusy[0].length);
  for (c = 0; c < cumulativeBusy.length; c++) {
    cumulativeBusy[c] = new Array(9);
  }

  for (r = 0; r < roombusy.length; r++) {
    for (d = 0; d < roombusy[r].length; d++) {
      for (h = 0; h < roombusy[r][d].length; h++) {
        if (cumulativeBusy[d][h]) {
          cumulativeBusy[d][h] = parseInt(cumulativeBusy[d][h]) + parseInt(roombusy[r][d][h]);
        } else {
          cumulativeBusy[d][h] = parseInt(roombusy[r][d][h]);
        }
      }
    }
  }
  //var logger = fs.createWriteStream(roomFileName+'.txt', {
  //    flags: 'a' // 'a' means appending (old data will be preserved)
  //  })
  //  logger.write('day\thour\tvalue')
  fs.writeFile('./public/combined.tsv', "", 'utf8', function() {
    console.log("deleted");
  });
  var logger = fs.createWriteStream('./public/combined.tsv', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  logger.write('day\thour\tvalue\n')
  for (d = 0; d < cumulativeBusy.length; d++) {
    for (h = 0; h < cumulativeBusy[0].length; h++) {
      logger.write((parseInt(d) + 1) + '\t' + (parseInt(h) + 1) + '\t' + cumulativeBusy[d][h] + '\n')
    }
  }

  fs.writeFile('./timetables/cumulative.json', JSON.stringify(cumulativeBusy), 'utf8', function() {
    console.log("saved");
  });
}

//gets the current week from the timetable
function getCurrentWeek(result, i) {
  //console.log(result.pageTables[0].tables);
  console.log("pagetablesdata: " + result.pageTables.length)
  for (w = 0; w < result.pageTables.length; w++) {
    //if(result.pageTables[w].tables){
    //day of the week is stored in column 4 (this may change :( )
    //console.log(daydata);
    //console.log(result.pageTables[w].tables);
    var dayTable = getDayTable(result.pageTables[w].tables);
    //console.log(dayTable)
    var daydata = result.pageTables[w].tables[dayTable];
    var daywholedate = daydata[0]

    //wednesdays are buggy (have a length greater than 18 so no new line)???
    if (daywholedate.indexOf("\n") < 0) {
      daywholedate = daywholedate.split('y')[0] + 'y' + '\n' + daywholedate.split('y')[1]
    }
    daydate = daywholedate.split('\n')[1];
    //adding a week for testing
    var weekstart = moment().startOf('isoWeek').format('L'); //.add(1, 'days')
    if (weekstart == daydate) {
      return w;

    }
  }
  //}
}
//function to check where the first table of daydata. This needs some more work to be really timtable change proof.
function getDayTable(tables) {
  //console.log(tables)
  for (d = 0; d < tables.length; d++) {
    if (tables[d][0].indexOf('Monday') > -1) {
      return d;
    }
  }
}

function getDayTableforDay(tables, day) {
  //console.log(tables)
  for (d = 0; d < tables.length; d++) {
    if (tables[d][0].indexOf(day) > -1) {
      return d;
    }
  }
  return -1;
}

function getDayTables(result) {

  var currentWeekTables = [];
  for (w = 0; w < result.pageTables.length; w++) {
    //if(result.pageTables[w].tables){
    //day of the week is stored in column 4 (this may change :( )
    //console.log(daydata);
    //console.log(result.pageTables[w].tables);
    var dayTable = getDayTable(result.pageTables[w].tables);
    //console.log(dayTable)
    var daydata = result.pageTables[w].tables[dayTable];
    var daywholedate = daydata[0]

    //wednesdays are buggy (have a length greater than 18 so no new line)???
    if (daywholedate.indexOf("\n") < 0) {
      daywholedate = daywholedate.split('y')[0] + 'y' + '\n' + daywholedate.split('y')[1]
    }
    daydate = daywholedate.split('\n')[1];
    //adding a week for testing
    var weekstart = moment().startOf('isoWeek').format('L'); //.add(1, 'days')
    if (weekstart == daydate) {
      var monday = findDay(w, result.pageTables, 'Monday');
      currentWeekTables.push(monday);
      var tuesday = findDay(w, result.pageTables, 'Tuesday');
      currentWeekTables.push(tuesday );
      var wednesday = findDay(w, result.pageTables, 'Wednesday');
      currentWeekTables.push(wednesday);
      var thursday = findDay(w, result.pageTables, 'Thursday');
      currentWeekTables.push(thursday);
      var friday = findDay(w, result.pageTables, 'Friday');
      currentWeekTables.push(friday);
      var saturday = findDay(w, result.pageTables, 'Saturday');
      currentWeekTables.push(saturday);
      var sunday = findDay(w, result.pageTables, 'Sunday');
      currentWeekTables.push(sunday);
      return currentWeekTables;
    }

  }
}

function findDay(page, pagetables, day) {
  var row = getDayTableforDay(pagetables[w].tables, day);
  if (row > 0) {
    return pagetables[w].tables[row]
  } else {
    row = getDayTableforDay(pagetables[w + 1].tables, day);
    return pagetables[w + 1].tables[row]
  }
}

//Error
function error(err) {
  console.error('Error: ' + err);
}


//function to identify the next timetable file to be parsed
function getNextFile(fileNo, ts) {
  console.log("timestamp: " + ts)
  var i = fileNo
  var file = fs.createWriteStream("./timetables/" + rooms[i].roomID + '_' + rooms[i].room + ".pdf");
  //fire the link to the uni timetable based on the room ID.
  var request = http.get(timetableurl + rooms[i].roomID + ".pdf", function(response) {
    //console.log(response);
    //pipe file the response to output stream (could probably be parsed in memory more efficiently)
    response.pipe(file);
  });
  //when this specific file is finished saving start mining it foe the timetable info.
  file.on('close', function() {
    var filepath = this.path;
    console.log('request finished downloading file ' + filepath);

    //get current file name (i.e the files that has just closed)
    var filename = path.basename(filepath)
    //console.log(filename)
    rID = filename.split('_')[0] //split on '_' to get ID and Name
    rN = filename.split('_')[1]
    rN = rN.substring(0, rN.length - 4); //drop extension
    console.log("got data for roomID " + rID + " & roomName " + rN);
    outputdata.push({
      roomID: rID,
      roomName: rN,
      timestamp: ts
    });
    //PDF parsed
    //extract data
    pdf_table_extractor(filepath, success, error);

    //.then(function(output){
    //outputdata.push({room:rooms[0].room, timetable: output})
    //if(outputdata.length == rooms.length){
    //console.log(outputdata);
    //}
    //});
    //when done check if this is the last file, if so stop otherwise keep going
    if (fileNo < rooms.length - 1) {
      getNextFile(fileNo + 1, ts);
    } else {
      //console.log(outputdata);
    }

  });

}



//helper functions unused
function getDay(dayno) {
  switch (dayno) {
    case 0:
      return "Monday";
    case 1:
      return "Tuesday";
    case 2:
      return "Wednesday";
    case 3:
      return "Thursday";
    case 4:
      return "Friday";
    case 5:
      return "Saturday";
    case 6:
      return "Sunday";
    default:
      return "Error day " + dayno

  }
}

function getTime(timeSlot) {
  switch (timeSlot) {
    case 1:
      return "8:00";
    case 2:
      return "9:00";
    case 3:
      return "10:00";
    case 4:
      return "11:00";
    case 5:
      return "12:00";
    case 6:
      return "13:00";
    case 7:
      return "14:00";
    case 8:
      return "15:00";
    case 9:
      return "16:00";
    case 10:
      return "17:00";
    case 11:
      return "18:00";
    case 12:
      return "19:00";
    case 13:
      return "20:00";
    case 14:
      return "21:00";

  }
}
