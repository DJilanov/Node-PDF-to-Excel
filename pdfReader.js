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
                        writeToTxt(fileName, getInformation(rows, config.startRow, config.endRow), getInformation(rows, config.startTitle, config.endTitle));
                    }
                } else {
                    let processor = pdfExtract(fullPath, {
                        type: 'ocr',
                        ocr_flags: [
                            '-psm 1',       // automatically detect page orientation
                        ]
                    }, (err) => {
                        if (err) {
                            return refactorImageDataToUsable(err);
                        }
                    });
                    processor.on('complete', (data) => {
                        inspect(data.text_pages, 'extracted text pages');
                        refactorImageDataToUsable(null, data.text_pages, fileName);
                    });
                    processor.on('error', (err) => {
                        inspect(err, 'error while extracting pages');
                        return refactorImageDataToUsable(err);
                    });
                }
            });
        });
    }

    function refactorImageDataToUsable(err, pagesData, fileName) {
        if (err) {
            return console.log(err);
        }
        // it is text based pdf
        const config = companyConfiguration.getCompanyConfiguration(pagesData[0]);
        let startRow = 0;
        let endRow = 0;
        let data = [];
        for(pageCounter = 0; pageCounter < pagesData.length; pageCounter++) {
            let pageData = pagesData[pageCounter].split('\n');
            for(let innerCounter = 0; innerCounter < pageData.length; innerCounter++) {
                if(pageData[innerCounter].indexOf(config.startRow) > -1) {
                    startRow = innerCounter + 1;
                }
            }
            data.push(...pageData.slice(startRow))
        }
        writeToTxt(fileName, data)
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

    function rotatePdfImage(pdf, pageNumber) {
        new rotate(pdf, pageNumber, {
            direction:'east'
        }).write().then(outfile => {
            // do something
            console.log(outfile);
        })
    }

    function writeToTxt(fileName, data, titleData) {
        let stream = fs.createWriteStream(path + fileName + '.txt', {
            flags: 'a'
        });
        if(titleData) {
            titleData.forEach(
                (row) => { 
                    stream.write(row.join(', ') + '\n'); 
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
    
    module.exports = {
        parsePdfData: parsePdfData
    };
}());