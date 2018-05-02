const felfhues = 'FELDHUES';

(function() {
    function getFelfhuesConfig(objects, spreadsheetName) {
        return {
            startRow: 'Abruf',
            endRow: 'Bestellwert',
            startTitle: 'Fax.',
            endTitle: 'Werk'
        }
    }

    function isFelfhues(data) {
        for(let index = 0; index < data.length; index++) {
            if(data[index].indexOf(felfhues) > -1) {
                return true;
            }
        }
        return false;
    }

    function getCompanyConfiguration(rows) {
        if(isFelfhues(rows)) {
            return getFelfhuesConfig();
        }
    }
    
    module.exports = {
        getCompanyConfiguration: getCompanyConfiguration
    };
}());