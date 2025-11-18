// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.switzerland.import.cic
// @api = 1.0
// @pubdate = 2025-05-19
// @publisher = Banana.ch SA
// @description = Bank CIC - Import account statement .csv (Banana+ Advanced)
// @description.en = Bank CIC - Import account statement .csv (Banana+ Advanced)
// @description.de = Bank CIC - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Banque CIC - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Banca CIC - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   // Format 1
   var format1 = new CICFormat1();
   let transactionsData = format1.getFormattedData(transactions, importUtilities);
   if (format1.match(transactionsData)) {
      transactions = format1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Bank CIC - Format 1 (*.xlsx)
 */
var CICFormat1 = class CICFormat1 {
   constructor() {
      this.fieldSeparator = ";";
      this.decimalSeparator = ".";
   }

   getFormattedData(inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
      let form = [];

      let convertedColumns = [];

      convertedColumns = this.convertHeaderDe(columns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   convertHeaderDe(columns) {
      let convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Buchungsdatum":
               convertedColumns[i] = "Date";
               break;
            case "Valutadatum":
               convertedColumns[i] = "DateValue";
               break;
            case "Auftragsnummer":
               convertedColumns[i] = "ExternalReference";
               break;
            case "Beschreibung":
               convertedColumns[i] = "Description";
               break;
            case "Buchungsdetails":
               convertedColumns[i] = "Description2";
               break;
            case "Gutschrift":
               convertedColumns[i] = "Income";
               break;
            case "Belastung":
               convertedColumns[i] = "Expenses";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }
      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   match(transactionsData) {

      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];

         var formatMatched = false;

         if (transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
            transaction["DateValue"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
      return false;
   }

   /** Convert the transaction to the format to be imported */
   convert(rows) {
      var transactionsToImport = [];

      for (var i = 0; i < rows.length; i++) {
         if (rows[i]["Date"] && rows[i]["Date"].length >= 10 &&
            rows[i]["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            transactionsToImport.push(this.mapTransaction(rows[i]));
      }

      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   mapTransaction(element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yyyy"));
      mappedLine.push(""); // Doc is empty for now
      mappedLine.push(element['ExternalReference']);
      mappedLine.push(getCompleteDescription(element));
      if (element['Income'] && element['Income'].length > 0) {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(element['Income'], this.decimalSeparator));
         mappedLine.push("");
      } else {
         let amount = element['Expenses'].replace(/-/g, ''); //remove minus sign
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
      }

      return mappedLine;
   }
}

function getCompleteDescription(element) {
   let tidyDescr1 = element['Description'].replace(/\r\n/g, " "); //remove new line && new row characters
   let tidyDescr2 = element['Description2'].replace(/\r\n/g, " "); //remove new line && new row characters
   let description = tidyDescr1;
   if (tidyDescr2 && tidyDescr2.length > 0) {
      description += " " + tidyDescr2;
   }
   return description;
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < 1000 && i < string.length; i++) {
      var c = string[i];
      if (c === ',')
         commaCount++;
      else if (c === ';')
         semicolonCount++;
      else if (c === '\t')
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t';
   }
   else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}


