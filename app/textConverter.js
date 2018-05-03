// Import the file system
const fs = require('fs');

// Get our path
const path = process.argv[process.argv.length - 1];

(function() {
    function writeToTxt(fileName, rows, config) {
        let data = getInformation(rows, config.startRow, config.endRow)
        let titleData = getInformation(rows, config.startTitle, config.endTitle)
        let stream = fs.createWriteStream(path + fileName + '.txt', {
            flags: 'a'
        });
        if(titleData) {
            titleData.forEach(
                (row) => { 
                    if(row.join) {
                        stream.write(row.join(', ') + '\n'); 
                    } else {
                        stream.write(row + '\n'); 
                    }
                }
            );
        }
        data.forEach(
            (row) => { 
                if(row.join) {
                    stream.write(row.join(', ') + '\n'); 
                } else {
                    stream.write(row + '\n'); 
                }
            }
        );
        stream.end();
    }

    function getInformation(rows, start, end) {
        let startingRow = 0;
        let endingRow = 0;

        for(let index = 0; index < rows.length; index++) {
            if(rows[index].indexOf(start) > -1) {
                if(startingRow === 0) {
                    startingRow = index;
                }
            }
            if(rows[index].indexOf(end) > -1) {
                endingRow = index;
            }
        }

        return rows.slice(startingRow, endingRow + 1);
    }
    
    module.exports = {
        writeToTxt: writeToTxt
    };
}());