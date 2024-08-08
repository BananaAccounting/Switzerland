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

// @id = ch.banana.switzerland.import.cbaa
// @api = 1.0
// @pubdate = 2024-07-08
// @publisher = Banana.ch SA
// @description = Clientis Bank Aareland - Import movements .csv (Banana+ Advanced)
// @description.it = Clientis Bank Aareland - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Clientis Bank Aareland - Import movements .csv (Banana+ Advanced)
// @description.de = Clientis Bank Aareland - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Clientis Bank Aareland - Importer mouvements .csv (Banana+ Advanced)
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
 
    // CBAA Format, this format works with the header names.
    var cbaaFormat = new CbaaFormat1();
    if (cbaaFormat.match(transactionsData)) {
       transactions = cbaaFormat.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * CBAA Format
  *
  * "Peripsictam sim: 11.52.1334 ";;;;
  * ;;;;
  * Atuluressit: 37 7.666.378.87;;;;
  * Nutuditubit: Celiquisunch;;;;
  * Tride: PRA 86070.2;;;;
  * ;;;;
  * D�ceanunt-Ocus Porte FreT;;;;
  * Noculascrit 4o;;;;
  * 5011 Fox AG;;;;
  * ;;;;
  * ;;;;
  * Datum;Buchungstext;Betrag;Saldo;Valuta
  * 28.06.2024;Fray�caph;1426.4;30593.02;28.06.2024
  * 28.06.2024;Fray�caph;205.95;29166.62;28.06.2024
  * 28.06.2024;Fray�caph;29.4;28960.67;28.06.2024
  * 28.06.2024;Fray�caph;214.05;28931.27;28.06.2024
  * 28.06.2024;Fray�caph;29.4;28717.22;28.06.2024
 */
 function CbaaFormat1() {
 
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
    convertionParam.headerLineStart = 11;
    convertionParam.dataLineStart = 12;
 
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
 
    convertedColumns = convertHeaderFr(columns);
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
          case "Montant":
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