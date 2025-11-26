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

// @id = ch.banana.switzerland.import.acrevisbank
// @api = 1.0
// @pubdate = 2025-06-12
// @publisher = Banana.ch SA
// @description = Acrevis Bank - Import movements .csv (Banana+ Advanced)
// @description.it = Acrevis Bank - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Acrevis Bank - Import movements .csv (Banana+ Advanced)
// @description.de = Acrevis Bank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Acrevis Bank - Importer mouvements .csv (Banana+ Advanced)
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
 
    let convertionParam = defineConversionParam(string);
 
    var transactions = Banana.Converter.csvToArray(string, convertionParam.separator, '"');
 
    // Acrevis Bank Format, this format works with the header names.
    var acrevisBankFormat1 = new AcrevisBankFormat1();
    let transactionsData = acrevisBankFormat1.getFormattedData(transactions, importUtilities);
    if (acrevisBankFormat1.match(transactionsData)) {
       transactions = acrevisBankFormat1.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * Acrevis Bank Format
  *
  * Kontoauszug bis: 26.05.2025 ;;;
  * ;;;
  * Kontonummer: 12 1.123.456.78;;;
  * Bezeichnung: Gemeinde;;;
  * Saldo: CHF 45520.83;;;
  * ;;;
  * Freie Christengem. Wil;;;
  * Sonnmattstrasse 800;;;
  * 1234 Rickenbach e4. Wil;;;
  * ;;;
  * ;;;
  * Datum;Buchungstext;Betrag;Valuta
  * 26.05.25;Dietrich Torino und Niccolo Paganini;200.00;26.05.25
  * 26.05.25;Dietrich Carla Sollis;720.00;26.05.25
  * 26.05.25;Dietrich Yves La Roche;150.00;26.05.25
  * 26.05.25;Dietrich Samuel und Kaitlin Berger;350.00;26.05.25
 */
 function AcrevisBankFormat1() {
 
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
         var columns = importUtilities.getHeaderData(inData, 11); //array
         var rows = importUtilities.getRowData(inData, 12); //array of array
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
      mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["Description"]);
      if (transaction["Amount"].substring(0, 1) === "-") {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
         mappedLine.push("");
      }
 
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
    convertionParam.headerLineStart = 11;
    convertionParam.dataLineStart = 12;
 
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
          case "Datum":
             convertedColumns[i] = "Date";
             break;
          case "Valuta":
             convertedColumns[i] = "DateValue";
             break;
          case "Betrag":
             convertedColumns[i] = "Amount";
             break;  
          case "Buchungstext":
             convertedColumns[i] = "Description";
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