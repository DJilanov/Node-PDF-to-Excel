// Import the file system
const pdfExtract = require('pdf-extract');
const inspect = require('eyes').inspector({maxLength:20000});

// we add converters
const textConverter = require('./textConverter');

// Company configs
const companyConfiguration = require('./companyConfiguration');

(function() {
    function processImagePdf(fullPath, fileName) {
        let processor = pdfExtract(fullPath, {
            type: 'ocr',
            ocr_flags: [
                '-psm 1',       // automatically detect page orientation
                '-l eng'
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
        textConverter.writeToTxt(fileName, data, config);
    }
    
    module.exports = {
        processImagePdf: processImagePdf
    };
}());