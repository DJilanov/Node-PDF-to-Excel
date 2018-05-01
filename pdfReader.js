// Import the pdf reading library
const pdf2table = require('pdf2table');
const inspect = require('eyes').inspector({maxLength:20000});
const pdfExtract = require('pdf-extract');
const pathModule = require('path');

// Import the file system
const fs = require('fs');

// Define our watching parameters
// const path = process.argv[process.argv.length - 1];
// const path = 'C:/training/node-pdf-to-excel/testing/';
const path = '/home/osboxes/Public/node-pdf-to-excel/training/';

// Excel converter
const excelConverter = require('./excelConverter');

// Company configs
const companyConfiguration = require('./companyConfiguration');

// Configuration for saving file
const saveToExcel = false;

(function() {
    function parsePdfData(fullPath) {
        let fileName = pathModule.basename(fullPath.split('.')[0]);
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
                    let processor = pdfExtract(fullPath, {
                        type: 'ocr',
                        ocr_flags: [
                            '-psm 1',       // automatically detect page orientation
                        ]
                    }, function(err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                    processor.on('complete', function(data) {
                        inspect(data.text_pages, 'extracted text pages');
                        callback(null, data.text_pages);
                    });
                    processor.on('error', function(err) {
                        inspect(err, 'error while extracting pages');
                        return callback(err);
                    });
                }
            });
        });
    }

    function callback(err, data) {

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
        let stream = fs.createWriteStream(path + fileName + '.txt', {
            flags: 'a'
        });
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