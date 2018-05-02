const felfhues = 'FELDHUES';
const falceast = 'FALC EAST';

(function() {
    function getFelfhuesConfig(objects, spreadsheetName) {
        return {
            startRow: 'Abruf',
            endRow: 'Bestellwert',
            startTitle: 'Fax.',
            endTitle: 'Werk'
        }
    }
    function getFalcEastConfig(objects, spreadsheetName) {
        return {
            startRow: ':.cod.art',
            endRow: 'Totale EUR',
            // startTitle: 'Fax.',
            // endTitle: 'Werk'
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

    function isFalcEast(data) {
        if(data.indexOf(falceast) > -1) {
            return true;
        } else {
            return false;
        }
    }

    function getCompanyConfiguration(rows) {
        if(isFelfhues(rows)) {
            return getFelfhuesConfig();
        }
        if(isFalcEast(rows)) {
            return getFalcEastConfig();
        }
    }
    
    module.exports = {
        getCompanyConfiguration: getCompanyConfiguration
    };
}());