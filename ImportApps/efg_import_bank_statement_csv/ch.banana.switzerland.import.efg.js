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

// @id = ch.banana.switzerland.import.efg
// @api = 1.0
// @pubdate = 2026-07-09
// @publisher = Banana.ch SA
// @description = EFG - Import account statement .csv (Banana+ Advanced)
// @description.en = EFG - Import account statement .csv (Banana+ Advanced)
// @description.de = EFG - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = EFG - Importer mouvements .csv (Banana+ Advanced)
// @description.it = EFG - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputencoding = utf8
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
   var format1 = new EFGFormat1();
   var transactionsData = format1.getFormattedData(transactions, importUtilities);
   if (format1.match(transactionsData)) {
      transactions = format1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * EFG - Format 1 (*.csv)
 */
var EFGFormat1 = class EFGFormat1 {
   constructor() {
      this.decimalSeparator = ".";
   }

   getFormattedData(inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0);
      var rows = importUtilities.getRowData(inData, 1);
      var form = [];

      var convertedColumns = this.convertHeaderIt(columns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   convertHeaderIt(columns) {
      var convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data registrazione":
               convertedColumns[i] = "Date";
               break;
            case "Data valuta":
               convertedColumns[i] = "DateValue";
               break;
            case "Transazione":
               convertedColumns[i] = "Description";
               break;
            case "Descrizione":
               convertedColumns[i] = "Description2";
               break;
            case "Importo":
               convertedColumns[i] = "Amount";
               break;
            case "DIV":
               convertedColumns[i] = "Currency";
               break;
            case "Saldo":
               convertedColumns[i] = "Balance";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("DateValue") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Amount") < 0
         || convertedColumns.indexOf("Currency") < 0
         || convertedColumns.indexOf("Balance") < 0) {
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

         if (transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/) &&
            transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
            transaction["DateValue"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/) &&
            transaction["Amount"] && transaction["Amount"].length > 0 &&
            transaction["Currency"] && transaction["Currency"].length === 3)
            return true;
      }
      return false;
   }

   /** Convert the transaction to the format to be imported */
   convert(rows) {
      var transactionsToImport = [];

      for (var i = 0; i < rows.length; i++) {
         if (rows[i]["Date"] && rows[i]["Date"].length >= 10 &&
            rows[i]["Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
            transactionsToImport.push(this.mapTransaction(rows[i]));
      }

      transactionsToImport = transactionsToImport.reverse();

      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   mapTransaction(element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd/mm/yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd/mm/yyyy"));
      mappedLine.push("");
      mappedLine.push(getCompleteDescription(element));

      if (element['Amount'].match(/^\-/)) {
         var amount = element['Amount'].replace(/-/g, '');
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(element['Amount'], this.decimalSeparator));
         mappedLine.push("");
      }

      return mappedLine;
   }
}

function getCompleteDescription(element) {
   var description = element['Description'];
   var description2 = element['Description2'];

   if (description2 && description2.length > 0)
      description += " " + description2;

   return description.replace(/\r\n/g, " ").replace(/\n/g, " ");
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
