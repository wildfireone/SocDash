/**
 * @Author: John Isaacs <john>
 * @Date:   05-Jun-182018
 * @Filename: index.js
 * @Last modified by:   john
 * @Last modified time: 25-Jul-182018
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

module.exports = {
  getTimetables: function() {
    getNextFile(0);
  }
}




const pdf_table_extractor = require("pdf-table-extractor");
const http = require('http');
const fs = require('fs');
const path = require('path');
const moment = require('moment')
moment.locale('en-gb');
var rooms = [{
  room: "n523",
  roomID: "r102823"
}, {
  room: "n525",
  roomID: "r102824"
}, {
  room: "n526",
  roomID: "r102891"
}, {
  room: "n527",
  roomID: "r102825"
}, {
  room: "n528",
  roomID: "r102826"
}, {
  room: "n529",
  roomID: "r102827"
}, {
  room: "n530",
  roomID: "r102828"
}, {
  room: "n533",
  roomID: "r102829"
}];

var outputdata = [];


function success(result) {
  //console.log(JSON.stringify(result));
  var output = {
    "week": []
  };
  var currentWeek = getCurrentWeek(result)
  var day = result.pageTables[currentWeek];
  //console.log(currentWeek);
  for (var i = 11; i < 18; i++) {
    //for (var j=0 ;i<result.pageTables[0].tables[i].length;j++){


    var daydata = day.tables[i];
    //output.days.push(getDay(i));
    //console.log(JSON.stringify());
    //if(result.pageTables[0].tables[i][j]!=""){
    //console.log("j: "+result.pageTables[0].tables[i][j]);
    //}
    //}
    //console.log(day);

    var dayoutput = {
      "day": getDay(i),
      "events": []
    };


    for (var j = 1; j < daydata.length; j++) {
      if (daydata[j] != "") {
        //console.log(getTime(j));
        //console.log(JSON.stringify(daydata[j]));
        //console.log(daydata.indexOf("y"));
        //  console.log(daydata[j].split('y')[0]);
        if (daydata[j].indexOf("\n") < daydata[j].indexOf(",")) {
          var event = daydata[j].split('\n')[0]
          //console.log("event: " + event);
          var start = daydata[j].split('\n')[1].split(',')[1].split('-')[0];
          var end = daydata[j].split('\n')[1].split(',')[1].split('-')[1];

          //console.log('start: ' + start + ' end: ' + end);
          start = start.trim();
          end = end.trim();
          dayoutput.events.push({
            "event": event,
            "start": start,
            "end": end
          })
        } else {
          var event = daydata[j].split(',')[0]
          //console.log("event: " + event);
          var start = daydata[j].split('\n')[0].split('-')[0];
          var end = daydata[j].split('\n')[0].split('-')[1];
          //console.log('start: ' + start + ' end: ' + end);
          dayoutput.events.push({
            "event": event,
            "start": start,
            "end": end
          })
        }
      } else {

      }
    }
    output.week.push(dayoutput);
  }
  //get current file name (i.e the files that has just closed)
  var filename = path.basename(result.pdfPath)
  //console.log(filename)
  rID = filename.split('_')[0] //split on '_' to get ID and Name
  rN = filename.split('_')[1]
  rN = rN.substring(0, rN.length - 4); //drop extension
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
function getCurrentWeek(result,i) {

  for (w = 0; w < result.pageTables.length; w++) {
    //if(result.pageTables){

    var daydata = result.pageTables[w].tables[11];
    //console.log(daydata);
    var daywholedate = daydata[0]
    //wednesdays are buggy (have a length greater than 18 so no new line)???
    if (daywholedate.indexOf("\n") < 0) {
      daywholedate = daywholedate.split('y')[0] + 'y' + '\n' + daywholedate.split('y')[1]
    }
    daydate = daywholedate.split('\n')[1];
    //adding a week for testing
    var weekstart = moment().add(7, 'days').startOf('isoWeek').format('L');
    if(weekstart == daydate){
      return w;

    }
  //}
  }
}

//Error
function error(err) {
  console.error('Error: ' + err);
}



function getNextFile(fileNo) {
  var i = fileNo
  var file = fs.createWriteStream("./timetables/" + rooms[i].roomID + '_' + rooms[i].room + ".pdf");
  var request = http.get("http://celcat.rgu.ac.uk/RGU_MAIN_TIMETABLE/" + rooms[i].roomID + ".pdf", function(response) {
    //console.log(response);
    response.pipe(file);

  });

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
      roomName: rN
    });
    //PDF parsed
    pdf_table_extractor(filepath, success, error);

    //.then(function(output){
    //outputdata.push({room:rooms[0].room, timetable: output})
    //if(outputdata.length == rooms.length){
    //console.log(outputdata);
    //}
    //});
    if (fileNo < rooms.length - 1) {
      getNextFile(fileNo + 1);
    } else {
      //console.log(outputdata);
    }

  });

}




function getDay(dayno) {
  switch (dayno) {
    case 11:
      return "Monday";
    case 12:
      return "Tuesday";
    case 13:
      return "Wednesday";
    case 14:
      return "Thursday";
    case 15:
      return "Friday";
    case 16:
      return "Saturday";
    case 17:
      return "Sunday";

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
