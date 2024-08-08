// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.switzerland.import.swkb
// @api = 1.0
// @pubdate = 2024-08-03
// @publisher = Banana.ch SA
// @description = Schwyzer KantonalBank - Import movements .csv (Banana+ Advanced)
// @description.it = Schwyzer KantonalBank - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Schwyzer KantonalBank - Import movements .csv (Banana+ Advanced)
// @description.de = Schwyzer KantonalBank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Schwyzer KantonalBank - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   //If the file contains double quotations marks, remove them
   var cleanString = string;
   if (cleanString.match(/""/)) {
      cleanString = cleanString.replace(/^"/mg, "");
      cleanString = cleanString.replace(/"$/mg, "");
      cleanString = cleanString.replace(/""/g, "\"");
   }

   let convertionParam = defineConversionParam(string);

   var transactions = Banana.Converter.csvToArray(string, convertionParam.separator, '"');
   let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

   // Schwyzer KantonalBank Format, this format works with the header names.
   var swkbFormat = new SWKBFormat();
   if (swkbFormat.match(transactionsData)) {
      transactions = swkbFormat.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Schwyzer KantonalBank Format
 *
 * "Kontoauszug bis: 30.06.2024 ";;;
 * ;;;
 * Kontonummer: 12345-6789;;;
 * Bezeichnung: Geschäftskonto;;;
 * Saldo: CHF 31716.78;;;
 * ;;;
 * My Company SA;;;
 * Via Delle Scuole 10;;;
 * Lugano, TI;;;
 * ;;;
 * ;;;
 * Datum;Buchungstext;Betrag;Valuta
 * 30.06.24;Text;-1;30.06.24
 * 28.06.24;Text;-5;30.06.24
 * 28.06.24;Text;-44.95;27.06.24
 * 28.06.24;Text;-645.75;27.06.24
 * 27.06.24;Text;-7;30.06.24
 * 27.06.24;Text;5000;27.06.24
 * 26.06.24;Text;-1368.85;26.06.24
*/
function SWKBFormat() {

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 8 &&
            transaction["Date"].match(/^\d{2}.\d{2}.\d{2}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 8 &&
            transactionsData[i]["Date"].match(/^\d{2}.\d{2}.\d{2}$/)) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["Description"]);
      if (transaction["Amount"].match(/^[0-9]/))
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
      else
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

      return mappedLine;
   }
}

function defineConversionParam(inData) {

   var inData = Banana.Converter.csvToArray(inData);
   var header = String(inData[0]);
   var convertionParam = {};
   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   convertionParam.format = "csv"; // available formats are "csv", "html"
   //get text delimiter
   convertionParam.textDelim = '"';
   // get separator
   if (header.indexOf(';') >= 0) {
      convertionParam.separator = ';';
   } else {
      convertionParam.separator = ',';
   }

   /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 22;
   convertionParam.dataLineStart = 24;

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Doc"];
   convertionParam.sortDescending = false;

   return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
   var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
   var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
   let form = [];

   let convertedColumns = [];

   convertedColumns = convertHeaderDe(columns);

   //Load the form with data taken from the array. Create objects
   if (convertedColumns.length > 0) {
      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   return [];
}

function convertHeaderDe(columns) {
   let convertedColumns = [];

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
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0) {
      return [];
   }

   return convertedColumns;
}
