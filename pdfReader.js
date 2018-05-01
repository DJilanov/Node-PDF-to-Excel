// Import the pdf reading library
const pdf2table = require('pdf2table');

// Import the pdf rotating library
const rotate = require('commonpdf').Rotate

// Import the file system
const fs = require('fs');

// Define our watching parameters
// const path = process.argv[process.argv.length - 1];
const path = 'C:/training/node-pdf-to-excel/testing/';

// Excel converter
const excelConverter = require('./excelConverter');

// Company configs
const companyConfiguration = require('./companyConfiguration');

// Configuration for saving file
const saveToExcel = false;

(function() {
    function parsePdfData(fullPath) {
        let fileName = fullPath.split('\\')[fullPath.split('\\').length - 1].split('.')[0];
        fs.readFile(fullPath, (err, buffer) => {
            if (err) {
                return console.log(err);
            }
            pdf2table.parse(buffer, (err, rows, rowsdebug) => {
                if (err) {
                    return console.log(err);
                }
                if(rows.length) {
                    // it is text based pdf
                    const config = companyConfiguration.getCompanyConfiguration(rows);
                    if(saveToExcel) {
    
                    } else {
                        writeToTxt(fileName, getInformation(rows, config));
                    }
                } else {
                    // it is image based pdf
                    rotatePdfImage(fullPath, 0);
                }
            });
        });
    }

    function getInformation(rows, config) {
        let startingRow = 0;
        let endingRow = 0;

        for(let index = 0; index < rows.length; index++) {
            if(rows[index].indexOf(config.startRow) > -1) {
                if(startingRow === 0) {
                    startingRow = index;
                }
            }
            if(rows[index].indexOf(config.endRow) > -1) {
                endingRow = index;
            }
        }

        return rows.slice(startingRow, endingRow + 1);
    }

    function rotatePdfImage(pdf, pageNumber) {
        new rotate(pdf, pageNumber, {
            direction:'east'
        }).write().then(outfile => {
            // do something
            console.log(outfile);
        })
    }

    function writeToTxt(fileName, data) {
        let stream = fs.createWriteStream(path + fileName + '.txt');
        data.forEach(
            (row) => { 
                stream.write(row.join(', ') + '\n'); 
            }
        );
        stream.end();
    }
    
    module.exports = {
        parsePdfData: parsePdfData
    };
}());