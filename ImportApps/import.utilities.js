// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
* class ImportUtilities
* Contains methods that can be shared by extensions for importing bank data
*/

var ImportUtilities = class ImportUtilities {
    constructor(banDocument) {
        this.banDocument = banDocument;
        if (this.banDocument === undefined)
            this.banDocument = Banana.document;
    }

    //The purpose of this function is to convert all the data into a format supported by Banana
    convertToBananaFormat(intermediaryData) {
        var columnTitles = [];

        //Create titles only for fields not starting with "_"
        for (var name in intermediaryData[0]) {
            if (name.substring(0, 1) !== "_") {
                columnTitles.push(name);
            }
        }
        //Function call Banana.Converter.objectArrayToCsv() to create a CSV with new data just converted
        var convertedCsv = Banana.Converter.objectArrayToCsv(columnTitles, intermediaryData, "\t");

        return convertedCsv;
    }

    // Convert to an array of objects where each object property is the banana columnNameXml
    convertCsvToIntermediaryData(inData, convertionParam) {
        var form = [];
        var intermediaryData = [];
        //Add the header if present 
        if (convertionParam.header) {
            inData = convertionParam.header + inData;
        }

        //Read the CSV file and create an array with the data
        var csvFile = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

        //Variables used to save the columns titles and the rows values
        var columns = this.getHeaderData(csvFile, convertionParam.headerLineStart); //array
        var rows = this.getRowData(csvFile, convertionParam.dataLineStart); //array of array

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //Create the new CSV file with converted data
        var convertedRow;
        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            convertedRow = convertionParam.rowConverter(form[i]);
            intermediaryData.push(convertedRow);
        }

        //Return the converted CSV data into the Banana document table
        return intermediaryData;
    }

    // Convert to an array of objects where each object property is the banana columnNameXml
    convertHtmlToIntermediaryData(inData, convertionParam) {
        var form = [];
        var intermediaryData = [];

        //Read the HTML file and create an array with the data
        var htmlFile = [];
        var htmlRows = inData.match(/<tr[^>]*>.*?<\/tr>/gi);
        for (var rowNr = 0; rowNr < htmlRows.length; rowNr++) {
            var htmlRow = [];
            var htmlFields = htmlRows[rowNr].match(/<t(h|d)[^>]*>.*?<\/t(h|d)>/gi);
            for (var fieldNr = 0; fieldNr < htmlFields.length; fieldNr++) {
                var htmlFieldRe = />(.*)</g.exec(htmlFields[fieldNr]);
                htmlRow.push(htmlFieldRe.length > 1 ? htmlFieldRe[1] : "");
            }
            htmlFile.push(htmlRow);
        }

        //Variables used to save the columns titles and the rows values
        var columns = this.getHeaderData(htmlFile, convertionParam.headerLineStart); //array
        var rows = this.getRowData(htmlFile, convertionParam.dataLineStart); //array of array

        //Convert header names
        for (var i = 0; i < columns.length; i++) {
            var convertedHeader = columns[i];
            convertedHeader = convertedHeader.toLowerCase();
            convertedHeader = convertedHeader.replace(" ", "_");
            var indexOfHeader = columns.indexOf(convertedHeader);
            if (indexOfHeader >= 0 && indexOfHeader < i) { // Header alreay exist
                //Avoid headers with same name adding an incremental index
                var newIndex = 2;
                while (columns.indexOf(convertedHeader + newIndex.toString()) !== -1 && newIndex < 99)
                    newIndex++;
                convertedHeader = convertedHeader + newIndex.toString()
            }
            columns[i] = convertedHeader;
        }

        // Banana.console.log(JSON.stringify(columns, null, "   "));

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //Create the new CSV file with converted data
        var convertedRow;
        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            convertedRow = convertionParam.rowConverter(form[i]);
            intermediaryData.push(convertedRow);
        }

        //Return the converted CSV data into the Banana document table
        return intermediaryData;
    }

    // Convert to an array of objects where each object property is the banana columnNameXml
    convertToIntermediaryData(inData, convertionParam) {
        if (convertionParam.format === "html") {
            return this.convertHtmlToIntermediaryData(inData, convertionParam);
        } else {
            return this.convertCsvToIntermediaryData(inData, convertionParam);
        }
    }

    //The purpose of this function is to return all the titles of the columns
    getHeaderData(csvFile, startLineNumber) {
        if (!startLineNumber) {
            startLineNumber = 0;
        }
        var headerData = csvFile[startLineNumber];
        for (var i = 0; i < headerData.length; i++) {

            headerData[i] = headerData[i].trim();

            if (!headerData[i]) {
                headerData[i] = i;
            }

            //Avoid duplicate headers
            var headerPos = headerData.indexOf(headerData[i]);
            if (headerPos >= 0 && headerPos < i) { // Header already exist
                var postfixIndex = 2;
                while (headerData.indexOf(headerData[i] + postfixIndex.toString()) !== -1 && postfixIndex <= 99)
                    postfixIndex++; // Append an incremental index
                headerData[i] = headerData[i] + postfixIndex.toString()
            }

        }
        return headerData;
    }

    getLang() {

        var lang = 'en';
        if (this.banDocument)
            lang = this.banDocument.locale;
        else if (Banana.application.locale)
            lang = Banana.application.locale;
        if (lang.length > 2)
            lang = lang.substr(0, 2);
        return lang;
    }
    
    //The purpose of this function is to return all the data of the rows
    getRowData(csvFile, startLineNumber) {
        if (!startLineNumber) {
            startLineNumber = 1;
        }
        var rowData = [];
        for (var i = startLineNumber; i < csvFile.length; i++) {
            rowData.push(csvFile[i]);
        }
        return rowData;
    }

    //The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
    //Each object represents a row of the csv file
    loadForm(form, columns, rows) {
        for (var j = 0; j < rows.length; j++) {
            var obj = {};
            for (var i = 0; i < columns.length; i++) {
                obj[columns[i]] = rows[j][i];
            }
            form.push(obj);
        }
    }

    // The purpose of this function is to sort the data
    sortData(intermediaryData, convertionParam) {
        if (convertionParam.sortColums && convertionParam.sortColums.length) {
            intermediaryData.sort(
                function (row1, row2) {
                    for (var i = 0; i < convertionParam.sortColums.length; i++) {
                        var columnName = convertionParam.sortColums[i];
                        if (row1[columnName] > row2[columnName])
                            return 1;
                        else if (row1[columnName] < row2[columnName])
                            return -1;
                    }
                    return 0;
                });

            if (convertionParam.sortDescending)
                intermediaryData.reverse();
        }

        return intermediaryData;
    }

    verifyBananaPlusVersion() {
        if (!this.banDocument)
            return false;

        var BAN_VERSION_MIN = "10.0";

        // supported Version
        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, BAN_VERSION_MIN) >= 0) {
            return true;
        }

        // not supported version
        var lang = this.getLang();
        var msg = "This extension requires Banana Accounting+";
        this.banDocument.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
        return false;
    }

    //Check if the version of Banana Accounting is compatible with this class
    verifyBananaAdvancedVersion() {
        if (!this.banDocument)
            return false;

        if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
            var lang = this.getLang();
            var msg = "This extension requires Banana Accounting+ Advanced";
            this.banDocument.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
            return false;
        }

        return true;
    }

    getErrorMessage(errorId, lang) {
        if (!lang)
            lang = 'en';
        switch (errorId) {
            case "ID_ERR_FORMAT_UNKNOWN":
                 if (lang == 'it')
                    return "Formato del file *.csv non riconosciuto";
                 else if (lang == 'fr')
                    return "Format de fichier *.csv non reconnu";
                 else if (lang == 'de')
                    return "Unerkanntes *.csv-Dateiformat";
                 else
                    return "Unrecognised *.csv file format";
        }
        return '';
     }

    getLang() {
        var lang = 'en';
        if (Banana.application.locale)
            lang = Banana.application.locale;
        if (lang.length > 2)
            lang = lang.substring(0, 2);
        return lang;
     }

    getUnknownFormatError(){
        let errId = "ID_ERR_FORMAT_UNKNOWN"; //error
        let lang = this.getLang();
        let msg = this.getErrorMessage(errId, lang);
        Banana.document.addMessage(msg, errId);
    }
}
