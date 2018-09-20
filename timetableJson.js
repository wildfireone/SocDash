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
  }, {
    room: "n533 - Big Lab",
    roomID: "r102829"
  }, {
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
  var currentWeek = getCurrentWeek(result)

  var day = result.pageTables[currentWeek];
  //console.log(currentWeek);
  //the timetable format we use stores day data between columns 11 and 18
  for (var i = 4; i < 11; i++) {
    var dayoutput = {
      "day": getDay(i),
      "events": []
    };
    if (day.tables[i]) {
      var daydata = day.tables[i];
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
            try{
            module = cleandaydata.match(moduleregex)[0];
            console.log(module);
            }
            catch(err) {
              console.log(cleandaydata)
              console.log("no module code for event")
            }
            if(module!=""){
              event = module + " :"+event;
            }
            //console.log(timestring);
            var start = timestring.split('-')[0] //daydata[j].split('\n')[1].split(',')[1].split('-')[0];
            var end = timestring.split('-')[1] //daydata[j].split('\n')[1].split(',')[1].split('-')[1];

            //console.log('start: ' + start + ' end: ' + end);
            start = start.trim();
            end = end.trim();
            dayoutput.events.push({
              "module":module,
              "event": event,
              "start": start,
              "end": end
            })
          } else {
            var event = daydata[j].split(',')[0]
            var cleandaydata = daydata[j].replace(/(\r\n\t|\n|\r\t)/gm, "");
            var timestring = cleandaydata.match(regex)[0];
            try{
            module = cleandaydata.match(moduleregex)[0];
            console.log(module)
            }
            catch(err) {
              console.log(cleandaydata)
              console.log("no module code for event")
            }
            if(module!=""){
              event = module + " :"+event;
            }
            var start = timestring.split('-')[0] //daydata[j].split('\n')[1].split(',')[1].split('-')[0];
            var end = timestring.split('-')[1] //daydata[j].split('\n')[1].split(',')[1].split('-')[1];
            dayoutput.events.push({
              "module":module,
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
  console.log("outdata: " + outputdata.length)
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

  }


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
    case 4:
      return "Monday";
    case 5:
      return "Tuesday";
    case 6:
      return "Wednesday";
    case 7:
      return "Thursday";
    case 8:
      return "Friday";
    case 9:
      return "Saturday";
    case 10:
      return "Sunday";
    default:
      return "Error day "+ dayno

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
