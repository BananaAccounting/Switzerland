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

// @id = ch.banana.switzerland.import.vzdepotbank
// @api = 1.0
// @pubdate = 2025-12-29
// @publisher = Banana.ch SA
// @description = VZ Depotbank - Import account statement .csv (Banana+ Advanced)
// @description.it = VZ Depotbank - Importa movimenti .csv (Banana+ Advanced)
// @description.en = VZ Depotbank - Import account statement .csv (Banana+ Advanced)
// @description.de = VZ Depotbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = VZ Depotbank - Importer mouvements .csv (Banana+ Advanced)
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

   let separator = findSeparator(string);

   var transactions = Banana.Converter.csvToArray(string, separator, '"');

   // VZ Depotbank Format, this format works with the header names.
   var vzDepotbankFormat1 = new VZDepotbankFormat1();
   let transactionsData = vzDepotbankFormat1.getFormattedData(transactions, importUtilities);
   if (vzDepotbankFormat1.match(transactionsData)) {
      transactions = vzDepotbankFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * VZ Depotbank Format 1
 *  
 * Buchungsdatum;Valutadatum;Auftragsnummer;Konto;IBAN;Buchungstext;Gutschrift;Belastung;Saldo
 * 24.12.2025;24.12.2025;88074906629464;Privatkonto;CH12345678910;test;;-9634;287.33
 * 24.12.2025;24.12.2025;88293120341210;Privatkonto;CH12345678910;test2;1500;;10521.33
 * 22.12.2025;22.12.2025;88074906629464;Privatkonto;CH12345678910;test;-200;;12021.33
*/
function VZDepotbankFormat1() {

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = false;

         if (transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^\d{2}.\d{2}.\d{4}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["OrderNumber"])
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
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
            transactionsData[i]["Date"].match(/^\d{2}.\d{2}.\d{4}$/)) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.getFormattedData = function (inData, importUtilities) {

      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
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

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push(transaction["OrderNumber"]);
      mappedLine.push(transaction["Description"]);
      mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Income"], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Expenses"].substring(1), '.'));

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

   convertionParam.separator = findSeparator(inData);

   /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 0;
   convertionParam.dataLineStart = 1;

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Doc"];
   convertionParam.sortDescending = false;

   return convertionParam;
}

function convertHeaderDe(columns) {
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
            convertedColumns[i] = "OrderNumber";
            break;
         case "Buchungstext":
            convertedColumns[i] = "Description";
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
      || convertedColumns.indexOf("DateValue") < 0) {
      return [];
   }

   return convertedColumns;
}

function findSeparator(inData) {

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < 1000 && i < inData.length; i++) {
      var c = inData[i];
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