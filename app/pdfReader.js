// Import the pdf reading library
const pdf2table = require('pdf2table');
const pathModule = require('path');
const fs = require('fs');

// we add converters
const textConverter = require('./textConverter');
const imageConverter = require('./imageConverter');

// Define our watching parameters
// const path = process.argv[process.argv.length - 1];
const path = 'C:/training/node-pdf-to-excel/testing/';
// const path = '/home/osboxes/Public/node-pdf-to-excel/training/';

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
                        textConverter.writeToTxt(fileName, rows, config);
                    }
                } else {
                    imageConverter.processImagePdf(fullPath);
                }
            });
        });
    }
    
    module.exports = {
        parsePdfData: parsePdfData
    };
}());