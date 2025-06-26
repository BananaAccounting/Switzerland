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

// @id = ch.banana.switzerland.import.migrosbank
// @api = 1.0
// @pubdate = 2024-11-08
// @publisher = Banana.ch SA
// @description = Migros Bank - Import account statement .csv (Banana+ Advanced)
// @description.en = Migros Bank - Import account statement .csv (Banana+ Advanced)
// @description.de = Migros Bank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Migros Bank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Migros Bank - Importa movimenti .csv (Banana+ Advanced)
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

   let convertionParam = defineConversionParam(string);
   var transactions = Banana.Converter.csvToArray(string, convertionParam.separator, '"');
   let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

   // Format 1
   var format1 = new MBFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new MBFormat2();
   if (format2.match(transactionsData)) {
      transactions = format2.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Migros Bank Credit Card Format 1
 */
function MBFormatCC1() {
   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
      let form = [];

      let convertedColumns = [];
      convertedColumns = convertHeaderIt(columns);
      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      convertedColumns = convertHeaderFr(columns);
      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^\d{4}-\d{2}-\d{2}/))
            formatMatched = true;
         else
            formatMatched = false;
      
         if (formatMatched && transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
            transaction["DateValue"].match(/^\d{4}-\d{2}-\d{2}/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["TransactionId"])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["Amount"] && transaction["Amount"].length > 0)
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
            transactionsData[i]["Date"].match(/^\d{4}-\d{2}-\d{2}/)) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "yyyy-mm-dd"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "yyyy-mm-dd"));
      mappedLine.push(""); // Doc is the TransactionId
      mappedLine.push(transaction["TransactionId"]);
      let description = this.getDescription(transaction);
      mappedLine.push(description);
      if (transaction["Amount"].substring(0, 1) === "-") {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
         mappedLine.push("");
      }

      return mappedLine;
   }

   this.getDescription = function (transaction) {
      let description = "";
      if (transaction["Details"])
         description += ", " + transaction["Details"];
      if (transaction["MerchantName"])
         description += transaction["MerchantName"];
      if (transaction["MerchantPlace"])
         description += ", " + transaction["MerchantPlace"];
      if (transaction["MerchantCountry"])
         description += ", " + transaction["MerchantCountry"];
      return description;
   }
}

/**
 * Migros Bank Format 2
 */
function MBFormat2() {
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
            transaction["DateValue"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["Description"])
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

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      let description = this.getDescription(transaction);
      mappedLine.push(description);
      let amount = transaction["Amount"];
      if (amount.length > 0) {
         //check decimal separator, if is comma, we replace it.
         if (amount.indexOf(",") >= 0)
            amount = amount.replace(',', '.');
         if (amount[0] === "-") {
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));

         } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
            mappedLine.push("");
         }
      }

      return mappedLine;
   }

   this.getDescription = function (transaction) {
      let description = "";
      description = transaction["Description"];
      if (transaction["Description2"])
         description += ", " + transaction["Description2"];
      if (transaction["Description3"])
         description += ", " + transaction["Description3"];
      return description;
   }
}


/**
 * Migros Bank Format 1 A):
 * Kontoauszug bis: 04.09.2023 ;;;
 * ;;;
 * Kontonummer: 543.278.22;;;
 * Bezeichnung: Privat;;;
 * Saldo: CHF 38547.7;;;
 * ;;;
 * Ramer E. & Ramer-Zahner D.;;;
 * In den Steinreben 6C;;;
 * 4153 Reinach BL;;;
 * ;;;
 * ;;;
 * Datum;Buchungstext;Betrag;Valuta
 * 04.09.23;Zahlungseingang;1838.00;04.09.23
 * 04.09.23;Zahlungs;-204.45;04.09.23
 * 
 * Migros Bank Format 1 B), valutare in futuro se fare un formato differente per conti privati,
 * per ora cambia solo la data e le intestazioni:
 * Moristra rerva eo:;2023-09-13
 * Moristra rerva lant:;2023-10-10
 * ;
 * Sciercipsidea:;Rerva haragine
 * ;
 * ;
 * ;
 * Data;Testo di registrazione;Importo;Valuta
 * 15.09.2023;Frunt stantuisu me quaesecerinum XXX/UT/PUS, Dis Frangunattis 47h, 1782 Raraequone;-105.45;15.09.2023
 * 15.09.2023;DIDUNT Humquit-Costripe EO, Dis Volluvis 1, 7888 Prescrente;-230.95;15.09.2023
 * 19.09.2023;CLAVIANTO AUFERVA EO, DIS MINENT 8, 6686 COLUMEA;-150.80;19.09.2023
 */
var MBFormat1 = class MBFormat1 {

   constructor() {
      this.colDate = 0;
      this.colDescr = 1;
      this.colAmount = 2;
      this.colDateValuta = 3;

      this.colCount = 4;
      this.decimalSeparator = ".";
      this.dateFormat = "dd.mm.yy";
   }

   /** Return true if the transactions match this format */
   match(transactions) {

      if (transactions.length === 0)
         return false;

      for (var i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length == this.colCount)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^(0[1-9]|[12][0-9]|3[01])[-.](0[1-9]|1[0-2])[-.]\d{2}$/)) {
            formatMatched = true;
         } else if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^(0[1-9]|[12][0-9]|3[01])[-.](0[1-9]|1[0-2])[-.]\d{4}$/)) {
            this.dateFormat = "dd.mm.yyyy";
            formatMatched = true;
         }
         else {
            formatMatched = false;
         }

         if (formatMatched && transaction[this.colDateValuta] &&
            transaction[this.colDateValuta].match(/\b\d{2}[.-]\d{2}[.-](?:\d{2}|\d{4})\b/g)) {
            formatMatched = true;
         }
         else {
            formatMatched = false;
         }

         if (formatMatched) {
            return true;
         }
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   convert(rows) {
      var transactionsToImport = [];

      for (var i = 0; i < rows.length; i++) {
         let transaction = rows[i];
         if (transaction.length == this.colCount &&
            transaction[this.colDate].match(/^(0[1-9]|[12][0-9]|3[01])[-.](0[1-9]|1[0-2])[-.](\d{4}|\d{2})$/)) {
            transactionsToImport.push(this.mapTransaction(rows[i]));
         }
      }

      // Sort rows by date
      if (this.dateFormat !== "dd.mm.yyyy") // transactions in the format B are already provided in the correct order.
         transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   mapTransaction(transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction[this.colDate], this.dateFormat));
      mappedLine.push(""); // Doc is empty for now
      mappedLine.push(transaction[this.colDescr]);
      var amount = transaction[this.colAmount];
      if (amount.length > 0) {
         //check decimal separator, if is comma, we replace it.
         if (amount.indexOf(",") >= 0)
            amount = amount.replace(',', '.');
         if (amount[0] === "-") {
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));

         } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
            mappedLine.push("");
         }
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
   convertionParam.separator = ";";

   /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 7;
   convertionParam.dataLineStart = 8;

   return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
   var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
   var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
   let form = [];

   let convertedColumns = [];
   convertedColumns = convertHeaderIt(columns);
   //Load the form with data taken from the array. Create objects
   if (convertedColumns.length > 0) {
      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   convertedColumns = convertHeaderFr(columns);
   //Load the form with data taken from the array. Create objects
   if (convertedColumns.length > 0) {
      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   return [];
}

function convertHeaderIt(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Data":
            convertedColumns[i] = "Date";
            break;
         case "Testo di registrazione":
            convertedColumns[i] = "Description";
            break;
         case "Comunicazione":
            convertedColumns[i] = "Description2";
            break;
         case "Numero di riferimento":
            convertedColumns[i] = "Description3";
            break;
         case "Importo":
            convertedColumns[i] = "Amount";
            break;
         case "Valuta":
            convertedColumns[i] = "DateValue";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      || convertedColumns.indexOf("Description") < 0
      || convertedColumns.indexOf("Description2") < 0
      || convertedColumns.indexOf("Description3") < 0
      || convertedColumns.indexOf("Amount") < 0
      || convertedColumns.indexOf("DateValue") < 0) {
      return [];
   }

   return convertedColumns;
}

function convertHeaderFr(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Date":
            convertedColumns[i] = "Date";
            break;
         case "Libellé":
            convertedColumns[i] = "Description";
            break;
         case "Message":
            convertedColumns[i] = "Description2";
            break;
         case "Numéro de référence":
            convertedColumns[i] = "Description3";
            break;
         case "Montant":
            convertedColumns[i] = "Amount";
            break;
         case "Valeur":
            convertedColumns[i] = "DateValue";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      || convertedColumns.indexOf("Description") < 0
      || convertedColumns.indexOf("Description2") < 0
      || convertedColumns.indexOf("Description3") < 0
      || convertedColumns.indexOf("Amount") < 0
      || convertedColumns.indexOf("DateValue") < 0) {
      return [];
   }

   return convertedColumns;
}

function convertHeaderEn(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Date":
            convertedColumns[i] = "Date";
            break;
         case "ValutaDate":
            convertedColumns[i] = "DateValue";
            break;         
         case "TransactionId":
            convertedColumns[i] = "TransactionId";
            break;
         case "CardId":
            convertedColumns[i] = "CardId";
            break;
         case "Currency":
            convertedColumns[i] = "Currency";
            break;
         case "Amount":
            convertedColumns[i] = "Amount";
            break;
         case "MerchantName":
            convertedColumns[i] = "MerchantName";
            break;
         case "MerchantPlace":
            convertedColumns[i] = "MerchantPlace";
            break;
         case "MerchantCountry":
            convertedColumns[i] = "MerchantCountry";
            break;
         case "Details":
            convertedColumns[i] = "Description";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      || convertedColumns.indexOf("Description") < 0
      || convertedColumns.indexOf("Description2") < 0
      || convertedColumns.indexOf("Description3") < 0
      || convertedColumns.indexOf("Amount") < 0
      || convertedColumns.indexOf("DateValue") < 0) {
      return [];
   }

   return convertedColumns;
}

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


