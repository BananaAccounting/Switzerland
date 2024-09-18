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

// @id = ch.banana.switzerland.import.viseca
// @api = 1.0
// @pubdate = 2024-08-28
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
   let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

   // Viseca Card Payments, this format works with the header names.
   var visecaFormat = new VisecaFormat();
   if (visecaFormat.match(transactionsData)) {
      transactions = visecaFormat.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }
   
   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Viseco (One) Format
 * Transaktionsliste,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * Erstellt am 14.07.24 12:55,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,Trans.-Buchungsdatum zwischen 01.04.24 und 28.08.24,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,Trans.-CAC-Code ist leer auf Ebene 0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 * POSITION J/N,POSITIONSFOLGE,TEILEN J/N,TEILUNGSREIHENFOLGE,TRANSAKTIONSDATUM,VORNAME,NACHNAME,KARTENNUMMER,H�NDLERNAME,TRANS. BESCHREIBUNG,POSITIONSBESCHR.,POSITIONSMENGE,KOSTEN PRO EINHEIT F�R POSITION,GET. BESCHR.,Teilung: Menge,Teilung: Kosten pro Einheit,ORIGINALW�HR.,ORIGINAL-BRUTTOBETRAG,BRUTTOBETRAG RECHNUNG,TRANS.-STATUS,STRITTIG J/N,BELEG-CODE BESCHREIBUNG,STEUER ABGESCHLOSSEN,ANMERK. ZU TRANS. J/N,TRANS.-ANMERKUNG,KARTENW�HRUNG,TRANSAKTIONSSW�HRUNG,TRANS.-BUCHUNGSDATUM,W�HRUNGSSATZ,TRANS.-ORIGINALNETTOBETR.,ORIGINAL-ERM�SSIGUNGSBETR.,TRANS.-STEUERBETRAG,TRANS.-STEUERSATZ,ST.-CD,AUFGEF. ZEICHENFOLGE,TRANS.-CAC-CODE 1,TRANS.-CAC-BESCHR. 1,TRANS.-CAC-CODE 2,TRANS.-CAC-BESCHR. 2,POSITION CAC-CODE 1,POSITION CAC-BESCHR. 1,POSITION CAC-CODE 2,POSITION CAC-BESCHR. 2,POSITION STEUERBETR.,POSITION STEUERSATZ,POSITION STEUER BESCHR.,POSITION NACHLASS,RECHNUNGSBRUTTOBETR. POSITION,GET. RECHNUNGSBRUTTOBETR.,GET. RECHNUNGSNETTOBETR.,GET. ORIGINALBRUTTOBETR.,GET. CAC-CODE 1,GET. CAC-BESCHR. 1,GET. CAC-CODE 2,GET. CAC-BESCHR. 2
 * N,0,N,0,20.05.24,Gavin,Summers,************1234,Zurich Boutique,,,0.00,0.00,,0.00,0.00,CHF,14.00,14.00,Importiert,N,N,N,N,,CHF,CHF,22.07.24,1.00,4.00,0.00,0.00,0.00,0 Prozent,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,16.06.24,Gavin,Summers,************1234,Matterhorn Market,,,0.00,0.00,,0.00,0.00,CHF,85.99,86.00,Importiert,N,N,N,N,,CHF,CHF,01.08.24,1.00,83.99,0.00,0.00,0.00,0 Prozent nicht ber�cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,30.07.24,Gavin,Summers,************1234,Edelweiss Traders,,,0.00,0.00,,0.00,0.00,CHF,68.95,68.95,Importiert,N,N,N,N,,CHF,CHF,01.08.24,1.00,65.95,0.00,0.00,0.00,0 Prozent nicht ber�cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
 * N,0,N,0,05.08.24,Gavin,Summers,************1234,Lucerne Luxuries,,,0.00,0.00,,0.00,0.00,CHF,62.95,62.95,Importiert,N,N,N,N,,CHF,CHF,05.08.24,1.00,65.95,0.00,0.00,0.00,0 Prozent nicht ber�cksichtigt,,,,,,,,,,0.00,0.00,,0,0,0,0,0,,,,
*/
function VisecaFormat() {

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

   convertionParam.headerLineStart = 5;
   convertionParam.dataLineStart = 6;

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Description"];
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