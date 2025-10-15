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

// @id = ch.banana.switzerland.import.viseca
// @api = 1.0
// @pubdate = 2025-10-15
// @publisher = Banana.ch SA
// @description = Viseca (One) - Import movements .xls (Banana+ Advanced)
// @description.it = Viseca (One) - Importa movimenti .xls (Banana+ Advanced)
// @description.en = Viseca (One) - Import movements .xls (Banana+ Advanced)
// @description.de = Viseca (One) - Bewegungen importieren .xls (Banana+ Advanced)
// @description.fr = Viseca (One) - Importer mouvements .xls (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv *.xls);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv *.xls);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv *.xls);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv *.xls);;Tutti i files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

   if (!inData)
      return "";

   var importUtilities = new ImportUtilities(Banana.document);

   if (!isTest && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   convertionParam = defineConversionParam(inData);

   let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

   // Viseca Card Payments, this format works with the header names.
   // Format 1
   var visecaFormat1 = new VisecaFormat1();
   let transactionsData = visecaFormat1.getFormattedData(transactions, importUtilities);
   if (visecaFormat1.match(transactionsData)) {
      transactions = visecaFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var visecaFormat2 = new VisecaFormat2();
   transactionsData = visecaFormat2.getFormattedData(transactions, importUtilities);
   if (visecaFormat2.match(transactionsData)) {
      transactions = visecaFormat2.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 3
   var visecaFormat3 = new VisecaFormat3();
   transactionsData = visecaFormat3.getFormattedData(transactions, importUtilities);
   if (visecaFormat3.match(transactionsData)) {
      transactions = visecaFormat3.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Viseco (One) Format 1
 * Transaktionsliste,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * Erstellt am 14.07.24 12:55,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,Trans.-Buchungsdatum zwischen 01.04.24 und 28.08.24,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,Trans.-CAC-Code ist leer auf Ebene 0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * POSITION J/N,POSITIONSFOLGE,TEILEN J/N,TEILUNGSREIHENFOLGE,TRANSAKTIONSDATUM,VORNAME,NACHNAME,KARTENNUMMER,H NDLERNAME,TRANS. BESCHREIBUNG,POSITIONSBESCHR.,POSITIONSMENGE,KOSTEN PRO EINHEIT F R POSITION,GET. BESCHR.,Teilung: Menge,Teilung: Kosten pro Einheit,ORIGINALW HR.,ORIGINAL-BRUTTOBETRAG,BRUTTOBETRAG RECHNUNG,TRANS.-STATUS,STRITTIG J/N,BELEG-CODE BESCHREIBUNG,STEUER ABGESCHLOSSEN,ANMERK. ZU TRANS. J/N,TRANS.-ANMERKUNG,KARTENW HRUNG,TRANSAKTIONSSW HRUNG,TRANS.-BUCHUNGSDATUM,W HRUNGSSATZ,TRANS.-ORIGINALNETTOBETR.,ORIGINAL-ERM SSIGUNGSBETR.,TRANS.-STEUERBETRAG,TRANS.-STEUERSATZ,ST.-CD,AUFGEF. ZEICHENFOLGE,TRANS.-CAC-CODE 1,TRANS.-CAC-BESCHR. 1,TRANS.-CAC-CODE 2,TRANS.-CAC-BESCHR. 2,POSITION CAC-CODE 1,POSITION CAC-BESCHR. 1,POSITION CAC-CODE 2,POSITION CAC-BESCHR. 2,POSITION STEUERBETR.,POSITION STEUERSATZ,POSITION STEUER BESCHR.,POSITION NACHLASS,RECHNUNGSBRUTTOBETR. POSITION,GET. RECHNUNGSBRUTTOBETR.,GET. RECHNUNGSNETTOBETR.,GET. ORIGINALBRUTTOBETR.,GET. CAC-CODE 1,GET. CAC-BESCHR. 1,GET. CAC-CODE 2,GET. CAC-BESCHR. 2
 * N,0,N,0,20.05.24,Gavin,Summers,************1234,Zurich Boutique,,,0.00,0.00,,0.00,0.00,CHF,14.00,14.00,Importiert,N,N,N,N,,CHF,CHF,22.07.24,1.00,4.00,0.00,0.00,0.00,0 Prozent,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,16.06.24,Gavin,Summers,************1234,Matterhorn Market,,,0.00,0.00,,0.00,0.00,CHF,85.99,86.00,Importiert,N,N,N,N,,CHF,CHF,01.08.24,1.00,83.99,0.00,0.00,0.00,0 Prozent nicht ber cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,30.07.24,Gavin,Summers,************1234,Edelweiss Traders,,,0.00,0.00,,0.00,0.00,CHF,68.95,68.95,Importiert,N,N,N,N,,CHF,CHF,01.08.24,1.00,65.95,0.00,0.00,0.00,0 Prozent nicht ber cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,05.08.24,Gavin,Summers,************1234,Lucerne Luxuries,,,0.00,0.00,,0.00,0.00,CHF,62.95,62.95,Importiert,N,N,N,N,,CHF,CHF,05.08.24,1.00,65.95,0.00,0.00,0.00,0 Prozent nicht ber cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
*/
function VisecaFormat1() {

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

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 5); //array
      var rows = importUtilities.getRowData(inData, 6); //array of array
      let form = [];

      let convertedColumns = [];

      convertedColumns = convertHeaderDe(columns);

      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      convertedColumns = convertHeaderEn(columns);

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
      mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["First Name"] + " " + transaction["Last Name"] + " - " + transaction["Merchant Name"]);
      if (transaction["Amount"].match(/^[0-9]/))
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
      else
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

      return mappedLine;
   }
}

/**
 * Viseco (One) Format 2
 * Transaktionsliste,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * 
 * Erstellt am 01.10.24 10:45,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * 
 * TRANSAKTIONSDATUM,TRANS.-UST.-BESCHR.,ORIGINAL-BRUTTOBETRAG,ORIGINALWÄHR.,TRANS.-STATUS,TEILEN J/N,POSITION J/N,TRANS.-GESAMTWERT,TRANS REFERENZ,BRUTTOBETRAG RECHNUNG,AUFGEF. ZEICHENFOLGE,TRANS.-ANMERKUNG,STEUERFEHLERNR.,STEUERBELEG J/N,TRANS.-STEUERSATZ,TRANS.-STEUERBETRAG,TRANS.-BUCHUNGSDATUM,TRANS.-ORIGINALNETTOBETR.,ORIGINAL-ERMÄSSIGUNGSBETR.,STRITTIG J/N,ISO-CODE,TRANS STATUS,WÄHRUNGSSATZ,DCAL-TRANS.-CODE,ANZ. KILOMETER,ZIELLAND,UST./STEUER,INLANDSKAUF J/N,TRANS. PERSÖNLICH J/N,TRANS. FAKT. KUNDE J/N,BELEG-CODE BESCHREIBUNG,TRANS. RÜCKZAHLBAR J/N,TRANS. ERSTATTUNGSF. J/N,HÄNDLERNAME,Händler Umsatzsteuer-ID,MCC-CODE,VORNAME,NACHNAME,KARTENNUMMER,RECHNUNGSWÄHR.-CODE,TRANS.-CAC-CODE 1,TRANS.-CAC-BESCHR. 1,TRANS.-CAC-CODE 2,TRANS.-CAC-BESCHR. 2,TRANS.-CAC-CODE 3,TRANS.-CAC-BESCHR. 3,TRANS.-CAC-CODE 4,TRANS.-CAC-BESCHR. 4,TRANS.-CAC-CODE 5,TRANS.-CAC-BESCHR. 5,TRANS.-CAC-CODE 6,TRANS.-CAC-BESCHR. 6,TRANS.-CAC-CODE 7,TRANS.-CAC-BESCHR. 7,TRANS.-CAC-CODE 8,TRANS.-CAC-BESCHR. 8,TRANS.-CAC-CODE 9,TRANS.-CAC-BESCHR. 9,TRANS.-CAC-CODE 10,TRANS.-CAC-BESCHR. 10,TRANS.-CAC-CODE 11,TRANS.-CAC-BESCHR. 11,TRANS.-CAC-CODE 12,TRANS.-CAC-BESCHR. 12,POSITION CAC-CODE 1,POSITION CAC-BESCHR. 1,POSITION CAC-CODE 2,POSITION CAC-BESCHR. 2,POSITION CAC-CODE 3,POSITION CAC-BESCHR. 3,POSITION CAC-CODE 4,POSITION CAC-BESCHR. 4,POSITION CAC-CODE 5,POSITION CAC-BESCHR. 5,POSITION CAC-CODE 6,POSITION CAC-BESCHR. 6,POSITION CAC-CODE 7,POSITION CAC-BESCHR. 7,POSITION CAC-CODE 8,POSITION CAC-BESCHR. 8,POSITION CAC-CODE 9,POSITION CAC-BESCHR. 9,POSITION CAC-CODE 10,POSITION CAC-BESCHR. 10,POSITION CAC-CODE 11,POSITION CAC-BESCHR. 11,POSITION CAC-CODE 12,POSITION CAC-BESCHR. 12,POSITIONSFOLGE,POSITIONSBESCHR.,POSITIONSMENGE,RECHNUNGSBRUTTOBETR. POSITION,POSITION STEUER BESCHR.,POSITION STEUERSATZ,POSITION STEUERBETR.,WARENCODE POSITION,POSITIONSANMERKUNG,KOSTEN PRO EINHEIT FÜR POSITION,POSITION GESAMT,POSITION NACHLASS,TEILUNGSREIHENFOLGE,GET. RECHNUNGSBRUTTOBETR.,GET. ORIGINALBRUTTOBETR.,GET. STEUERBETRAG,GET. RECHNUNGSNETTOBETR.,GET. STEUERSATZ,GET. STEUERBESCHR.,GET. CAC-CODE 1,GET. CAC-BESCHR. 1,GET. CAC-CODE 2,GET. CAC-BESCHR. 2,GET. CAC-CODE 3,GET. CAC-BESCHR. 3,GET. CAC-CODE 4,GET. CAC-BESCHR. 4,GET. CAC-CODE 5,GET. CAC-BESCHR. 5,GET. CAC-CODE 6,GET. CAC-BESCHR. 6,GET. CAC-CODE 7,GET. CAC-BESCHR. 7,GET. CAC-CODE 8,GET. CAC-BESCHR. 8,GET. CAC-CODE 9,GET. CAC-BESCHR. 9,GET. CAC-CODE 10,GET. CAC-BESCHR. 10,GET. CAC-CODE 11,GET. CAC-BESCHR. 11,GET. CAC-CODE 12,GET. CAC-BESCHR. 12,
 * 
 * ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * 
 * 
 * 
 */
function VisecaFormat2() {
   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^\d{2}.\d{2}.\d{4}$/))
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
      var columns = importUtilities.getHeaderData(inData, 4); //array
      var rows = importUtilities.getRowData(inData, 5); //array of array
      let form = [];

      let convertedColumns = [];

      convertedColumns = convertHeaderDe(columns);

      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      convertedColumns = convertHeaderEn(columns);

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
      mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["First Name"] + " " + transaction["Last Name"] + " - " + transaction["Merchant Name"]);
      if (transaction["Amount"].match(/^[0-9]/))
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
      else
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

      return mappedLine;
   }
}

function defineConversionParam(inData) {

   var convertionParam = {};
   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   convertionParam.format = "csv"; // available formats are "csv", "html"
   //get text delimiter
   convertionParam.textDelim = '\"';
   // get separator
   convertionParam.separator = findSeparator(inData);

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Description"];
   convertionParam.sortDescending = false;

   return convertionParam;
}

function convertHeaderDe(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "TRANSAKTIONSDATUM":
            convertedColumns[i] = "Date";
            break;
         case "VORNAME":
            convertedColumns[i] = "First Name";
            break;
         case "NACHNAME":
            convertedColumns[i] = "Last Name";
            break;
         case "HÄNDLERNAME":
            convertedColumns[i] = "Merchant Name";
            break;
         case "BRUTTOBETRAG RECHNUNG":
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

/**
 * Viseco (One) Format 3
 * TransactionId,CardId,Date,ValutaDate,Amount,Currency,OriginalAmount,OriginalCurrency,MerchantName,MerchantPlace,MerchantCountry,StateType,Details,Type
 * TRX2025123456789012345,1239456ABC3Z1234,2025-05-08 12:04:06,2025-05-09 00:00:00,8.500,EUR,8.500,EUR,Vichy,FRA,BOOKED,Vichy,merchant
 * TRX2025012345678901234,1239456ABC3Z1234,2025-05-06 21:29:11,2025-05-07 00:00:00,256.960,EUR,256.960,EUR,hotel,FRA,BOOKED,hotel,merchant
 * TRX2025123456789001234,1239456ABC3Z1234,2025-04-16 14:18:01,2025-04-17 00:00:00,14.300,EUR,12.900,CHF,Test,,,BOOKED,Test,merchant
 * 
 */
function VisecaFormat3() {
   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].substring(0, 10).match(/^\d{4}-\d{2}-\d{2}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
      let form = [];

      let convertedColumns = convertHeaderEn(columns);

      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {

         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
            transactionsData[i]["Date"].substring(0, 10).match(/^\d{4}-\d{2}-\d{2}$/)) {
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

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "yyyy-mm-dd"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "yyyy-mm-dd"));
      mappedLine.push("");
      mappedLine.push(transaction["Transaction Id"]);
      mappedLine.push(this.getDescription(transaction));
      if (transaction["Amount"].substring(0, 1) === '-') { // Income has the minus sign
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
         mappedLine.push("");
      } else { // Expenses
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
      }

      return mappedLine;
   }

   this.getDescription = function (transaction) {

      if (!transaction) return "";

      const { "Merchant Name": name, "Merchant Place": place, "Details": details } = transaction;

      // Crea un array, filtra i valori vuoti e unisci con virgola
      return [name, place, details]
         .filter(value => value && value.trim() !== "")
         .join(", ");
   }
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
            convertedColumns[i] = "Transaction Id";
            break;
         case "Amount":
            convertedColumns[i] = "Amount";
            break;
         case "Currency":
            convertedColumns[i] = "Currency";
            break;
         case "MerchantName":
            convertedColumns[i] = "Merchant Name";
            break;
         case "MerchantPlace":
            convertedColumns[i] = "Merchant Place";
            break;
         case "MerchantCountry":
            convertedColumns[i] = "Merchant Country";
            break;
         case "StateType":
            convertedColumns[i] = "State Type";
            break;
         case "Details":
            convertedColumns[i] = "Details";
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

/**
 * The function findSeparator is used to find the field separator.
 */
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

