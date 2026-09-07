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

// @id = ch.banana.switzerland.import.bcv
// @api = 1.0
// @pubdate = 2026-06-08
// @publisher = Banana.ch SA
// @description = Banque Cantonale Vaudoise - Import account statement .xlsx/.csv (Banana+ Advanced)
// @description.en = Banque Cantonale Vaudoise - Import account statement .xlsx/.csv (Banana+ Advanced)
// @description.de = Banque Cantonale Vaudoise - Bewegungen importieren .xlsx/.csv (Banana+ Advanced)
// @description.fr = Banque Cantonale Vaudoise - Importer mouvements .xlsx/.csv (Banana+ Advanced)
// @description.it = Banque Cantonale Vaudoise - Importa movimenti .xlsx/.csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputencoding = utf-8
// @inputfilefilter = Text files (*.txt *.csv *.xlsx);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv *.xlsx);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv *.xlsx);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv *.xlsx);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {
   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   var fieldSeparator = findSeparator(inData);
   var transactions = Banana.Converter.csvToArray(inData, fieldSeparator, '"');

   var format1 = new BCVFormat1();
   var transactionsData = format1.getFormattedData(transactions, importUtilities);
   if (format1.match(transactionsData)) {
      transactions = format1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * BCV Format 1
 *
 * Transactions list;;;;;45950.986465497685
 * Account No. : CHXX XXXXX XXXX XXXX XXXX
 * Account holder : Test SA
 * Balance :
 * Curr. :
 * Execution date;Transactions;Debit;Credit;Value date;Balance
 * 30.09.2025;Test;1350;;30.09.2025;
 * 19.09.2025;Test;;4250;19.09.2025;
 */
function BCVFormat1() {
   this.decimalSeparator = ".";

   this.getFormattedData = function (inData, importUtilities) {
      var headerLineStart = this.findHeaderLine(inData);
      if (headerLineStart < 0)
         return [];

      var columns = importUtilities.getHeaderData(inData, headerLineStart);
      var rows = importUtilities.getRowData(inData, headerLineStart + 1);
      var convertedColumns = this.convertHeaderEn(columns);
      var form = [];

      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.findHeaderLine = function (rows) {
      for (var i = 0; i < rows.length; i++) {
         if (rows[i].indexOf("Execution date") >= 0 &&
            rows[i].indexOf("Transactions") >= 0 &&
            rows[i].indexOf("Debit") >= 0 &&
            rows[i].indexOf("Credit") >= 0) {
            return i;
         }
      }
      return -1;
   }

   this.convertHeaderEn = function (columns) {
      var convertedColumns = [];

      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Execution date":
               convertedColumns[i] = "Date";
               break;
            case "Transactions":
               convertedColumns[i] = "Description";
               break;
            case "Debit":
               convertedColumns[i] = "Expenses";
               break;
            case "Credit":
               convertedColumns[i] = "Income";
               break;
            case "Value date":
               convertedColumns[i] = "DateValue";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0 ||
         convertedColumns.indexOf("Description") < 0 ||
         convertedColumns.indexOf("Expenses") < 0 ||
         convertedColumns.indexOf("Income") < 0 ||
         convertedColumns.indexOf("DateValue") < 0) {
         return [];
      }

      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = false;

         if (transaction["Date"] && transaction["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["DateValue"] &&
            transaction["DateValue"].match(/^\d{2}\.\d{2}\.\d{4}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && (transaction["Expenses"] || transaction["Income"]))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (transactionsData[i]["Date"] &&
            transactionsData[i]["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/) &&
            (transactionsData[i]["Expenses"] || transactionsData[i]["Income"])) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // The BCV export is newest first.
      transactionsToImport = transactionsToImport.reverse();

      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   this.mapTransaction = function (transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push(cleanDescription(transaction["Description"]));

      if (transaction["Income"] && transaction["Income"].length > 0) {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Income"], this.decimalSeparator));
         mappedLine.push("");
      } else {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Expenses"], this.decimalSeparator));
      }

      return mappedLine;
   }
}

function cleanDescription(description) {
   if (!description)
      return "";
   return description.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(inData) {
   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < 1000 && i < inData.length; i++) {
      var c = inData[i];
      if (c === ",")
         commaCount++;
      else if (c === ";")
         semicolonCount++;
      else if (c === "\t")
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount)
      return "\t";
   else if (semicolonCount > commaCount)
      return ";";

   return ",";
}
