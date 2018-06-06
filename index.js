/**
 * @Author: John Isaacs <john>
 * @Date:   05-Jun-182018
 * @Filename: index.js
 * @Last modified by:   john
 * @Last modified time: 05-Jun-182018
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

    var pdf_table_extractor = require("pdf-table-extractor");

    //PDF parsed
    function success(result)
    {
      for (var i=11 ;i<18;i++){
        //for (var j=0 ;i<result.pageTables[0].tables[i].length;j++){
        var day = result.pageTables[2].tables[i];
        console.log(getDay(i));
          //console.log(JSON.stringify());
        //if(result.pageTables[0].tables[i][j]!=""){
          //console.log("j: "+result.pageTables[0].tables[i][j]);
        //}
      //}
      console.log(day);
      var daydata = day;
      for(var j=1; j<daydata.length;j++){
        if(daydata[j] != ""){
        //console.log(getTime(j));
        //console.log(JSON.stringify(daydata[j]));
        //console.log(daydata.indexOf("y"));
      //  console.log(daydata[j].split('y')[0]);
      console.log(daydata[j].indexOf("\n"))
      console.log(daydata[j].indexOf(","))
        var event = daydata[j].split('\n')[0]
        console.log("event: " + event);
        var start = daydata[j].split('\n')[1].split(',')[1].split('-')[0];
        var end = daydata[j].split('\n')[1].split(',')[1].split('-')[1];
        console.log('start: '+start+' end: '+end);
      }
      else{

      }
      }
    }
      // console.log(JSON.stringify());
    }

    //Error
    function error(err)
    {
       console.error('Error: ' + err);
    }

    pdf_table_extractor("test/r102829.pdf",success,error);


    function getDay(dayno){
      switch (dayno)
      {
        case 11 : return "Monday";
        case 12 : return "Tuesday";
        case 13 : return "Wednesday";
        case 14 : return "Thursday";
        case 15 : return "Friday";
        case 16 : return "Saturday";
        case 17 : return "Sunday";

      }
    }

    function getTime(timeSlot){
      switch (timeSlot)
      {
        case 1 : return "8:00";
        case 2 : return "9:00";
        case 3 : return "10:00";
        case 4 : return "11:00";
        case 5 : return "12:00";
        case 6 : return "13:00";
        case 7 : return "14:00";
        case 8 : return "15:00";
        case 9 : return "16:00";
        case 10 : return "17:00";
        case 11 : return "18:00";
        case 12 : return "19:00";
        case 13 : return "20:00";
        case 14 : return "21:00";

      }
    }