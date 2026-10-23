// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.switzerland.import.shkb
// @api = 1.0
// @pubdate = 2026-10-22
// @publisher = Banana.ch SA
// @description = Schaffhauser Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.it = Schaffhauser Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Schaffhauser Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Schaffhauser Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Schaffhauser Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   let convertionParam = defineConversionParam(inData);

   var transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, 
      convertionParam.textDelim);

   // Schaffhauser Kantonalbank Format 1, this format works with the header names.
   var shkbFormat1 = new SHKBFormat1();
   var transactionsData = shkbFormat1.getFormattedData(transactions, convertionParam, importUtilities);
   if (shkbFormat1.match(transactionsData)) {
      transactions = shkbFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Schaffhauser Kantonalbank Format 1
 *
 * The file starts with an account information block, followed by the
 * transactions list (newest first):
 *
 * Kontoauszug bis: 31.12.2025 ;;;
 * ;;;
 * Kontonummer: 111.111-1 222;;;
 * Bezeichnung: Kontokorrent BUSINESS CHF;;;
 * Saldo: CHF 1234.11;;;
 * ;;;
 * MyBusiness AG;;;
 * Street. 4;;;
 * 8604 Paris;;;
 * ;;;
 * ;;;
 * Datum;Buchungstext;Betrag;Valuta
 * 31.12.25;Test;-12.00;31.12.25
 * 29.12.25;Test;-54.95;24.12.25
 * 24.12.25;Test;-42.00;22.12.25
 */
function SHKBFormat1() {

   this.dateRegex = /^\d{2}\.\d{2}\.\d{2}$/;

   this.getFormattedData = function (inData, convertionParam, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
      var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
      let form = [];

      var convertedColumns = this.convertHeaderDe(columns);

      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   this.convertHeaderDe = function (columns) {
      var convertedColumns = [];

      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Datum":
               convertedColumns[i] = "Date";
               break;
            case "Buchungstext":
               convertedColumns[i] = "Description";
               break;
            case "Betrag":
               convertedColumns[i] = "Amount";
               break;
            case "Valuta":
               convertedColumns[i] = "DateValue";
               break;
            default:
               convertedColumns[i] = columns[i];
               break;
         }
      }

      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      for (var i = 0; i < transactionsData.length; i++) {
         let transaction = transactionsData[i];
         Banana.console.log(JSON.stringify(transaction));
         if (transaction["Date"] && this.dateRegex.test(transaction["Date"].trim()) )
            return true;
      }
      return false;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         let transaction = transactionsData[i];
         if (transaction["Date"] && this.dateRegex.test(transaction["Date"].trim()))
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }

      // The bank exports the newest transactions first, sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"].trim(), "dd.mm.yy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"].trim(), "dd.mm.yy"));
      mappedLine.push("");
      mappedLine.push(transaction["Description"] ? transaction["Description"].replace(/\s+/g, " ").trim() : "");

      var amount = transaction["Amount"].trim();
      if (amount.indexOf("-") === 0) {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount.substring(1), '.'));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
         mappedLine.push("");
      }

      return mappedLine;
   }
}


function defineConversionParam(inData) {

   var inData = Banana.Converter.csvToArray(inData);
   var convertionParam = {};
   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   convertionParam.format = "csv"; // available formats are "csv", "html"
   //get text delimiter
   convertionParam.textDelim = '"';
   // get separator
   convertionParam.separator = ";"

      /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 11;
   convertionParam.dataLineStart = 12;

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Doc"];
   convertionParam.sortDescending = false;

   return convertionParam;
}
