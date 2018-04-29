// Define column names
const ALPHA = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

(function() {
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
    
    module.exports = {
        writeToExcel: writeToExcel
    };
}());