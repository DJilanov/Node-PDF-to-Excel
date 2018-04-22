// Import the watching library
let watchr = require('watchr')

// Import the pdf reading library
let pdf2table = require('pdf2table');

// Import the file system
let fs = require('fs');

// Define our watching parameters
let path = process.argv[process.argv.length - 1];

// Define column names
const ALPHA = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function listener(changeType, fullPath, currentStat, previousStat) {
    let split = fullPath.split('.');
    let ending = split[split.length - 1];
    if (ending.toLowerCase() !== 'pdf') {
        return;
    }
    if (changeType === 'create') {
        parsePdfData(fullPath);
    }
}

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
            writeToExcel(rows, fileName);
        });
    });
}

function writeToExcel(objects, spreadsheetName) {
    var self = this;
    try {
        var rowsOfData = objects;
        var lineNum = 1;
        var worksheetColumns = [];

        _.forEach(selectedFields, function () {
            worksheetColumns.push({ wch: 25 });
        });

        var workbook = {
            SheetNames: [spreadsheetName],
            Sheets: {
                [spreadsheetName]: {
                    '!ref': 'A1:',
                    '!cols': worksheetColumns
                }
            }
        };

        for (var i = 0; i < selectedFields.length; i++) {
            worksheetColumns.push({ wch: 25 });
            var currentCell = self._calculateCurrentCellReference(i, lineNum);
            workbook.Sheets[spreadsheetName][currentCell] = { t: "s", v: selectedFields[i].displayName, s: { font: { bold: true } } };
        }

        lineNum++;

        rowsOfData.forEach(function (offer) {
            var fieldMap = self._transformFieldsAndMapToColumnNames(offer);
            for (var i = 0; i < selectedFields.length; i++) {
                var displayValue = fieldMap[selectedFields[i].displayName];
                var currentCell = self._calculateCurrentCellReference(i, lineNum);
                workbook.Sheets[spreadsheetName][currentCell] = {
                    t: "s",
                    v: displayValue,
                    s: {
                        font: { sz: "11", bold: false },
                        alignment: { wrapText: true, vertical: 'top' },
                        fill: { fgColor: { rgb: 'ffffff' } },
                        border: {
                            left: { style: 'thin', color: { auto: 1 } },
                            right: { style: 'thin', color: { auto: 1 } },
                            top: { style: 'thin', color: { auto: 1 } },
                            bottom: { style: 'thin', color: { auto: 1 } }
                        }
                    }
                };
            }
            lineNum++;
        });

        var lastColumnInSheet = selectedFields.length - 1;
        var endOfRange = self._calculateCurrentCellReference(lastColumnInSheet, lineNum);
        workbook.Sheets[spreadsheetName]['!ref'] += endOfRange;
        var fileName = spreadsheetName + '.xlsx';
        var workbookOutput = xlsx.write(workbook, { bookSST: true, type: 'binary' });

        var s2ab = function (s) {
            var buffer = new ArrayBuffer(s.length);
            var view = new Uint8Array(buffer);
            for (var i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buffer;
        };

        saveAs(new this.$window.Blob([s2ab(workbookOutput)], { type: "application/octet-stream" }), fileName);
        self.excelFinished = false;
        self.excelProjects = [];
        self.exceloffset = 0;
    }
    catch (e) {
        console.log('Error in Excel Save: ' + e.message);
    }
}

function _calculateCurrentCellReference(index, lineNumber){
    return (index > 25) ? ALPHA[Math.floor((index / 26) - 1)] + ALPHA[index % 26] + lineNumber : ALPHA[index] + lineNumber;
}

function _longFormCalculateCurrentCellReference(index, lineNumber){
    var currentCellReference = '';
    var alphaVal = '';
    if (index > 25) {
        var firstLetterVal = Math.floor((index / 26) - 1);
        var secondLetterVal = index % 26;
        alphaVal = ALPHA[firstLetterVal] + ALPHA[secondLetterVal];
        currentCellReference = alphaVal + lineNumber;
    } else {
        alphaVal = ALPHA[index];
        currentCellReference = alphaVal + lineNumber;
    }
    return currentCellReference;
}


let stalker = watchr.open(path, listener);

// Set the default configuration for the stalker/watcher
// http://rawgit.com/bevry/watchr/master/docs/index.html#Watcher%23setConfig
stalker.setConfig({
    stat: null,
    interval: 5007,
    persistent: true,
    catchupDelay: 2000,
    preferredMethods: ['watch', 'watchFile'],
    followLinks: true,
    ignorePaths: false,
    ignoreHiddenFiles: false,
    ignoreCommonPatterns: true,
    ignoreCustomPatterns: null
});