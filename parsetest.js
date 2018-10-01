var pdf2table = require('pdf2table');
var fs = require('fs');

fs.readFile('./timetables/r102829_n533 - Big Lab.pdf', function (err, buffer) {
    if (err) return console.log(err);

    pdf2table.parse(buffer, function (err, rows, rowsdebug) {
        if(err) return console.log(err);

        console.log(rows);
    });
});
