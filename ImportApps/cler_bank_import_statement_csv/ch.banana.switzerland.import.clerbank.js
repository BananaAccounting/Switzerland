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

// @id = ch.banana.switzerland.import.clerbank
// @api = 1.0
// @pubdate = 2025-01-30
// @publisher = Banana.ch SA
// @description = Cler Bank - Import movements .csv (Banana+ Advanced)
// @description.it = Cler Bank - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Cler Bank - Import movements .csv (Banana+ Advanced)
// @description.de = Cler Bank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Cler Bank - Importer mouvements .csv (Banana+ Advanced)
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
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);
 
    // Cler Bank Format, this format works with the header names.
    var clerBankFormat1 = new ClerBankFormat1();
    if (clerBankFormat1.match(transactionsData)) {
       transactions = clerBankFormat1.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * Cler Bank Format
  *
  * Data di registrazione;Data valuta;Tipo di ordine;Testo;Importo di addebito (EUR);Importo di accredito (EUR);Saldo (EUR)
  * 31.10.2022;31.10.2022;Pagamento in Svizzera;Clothing purchase at ABC Boutique;11.32;;5467.92
  * 31.10.2022;31.10.2022;Trasferimento di conto;Clothing purchase at ABC Boutique;411.04;;5479.24
  * 31.10.2022;31.10.2022;Pagamento all'estero;Coffee and snacks at Caffeine Delight;1750.00;;5890.28
 */
 function ClerBankFormat1() {
 
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
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push("");
        mappedLine.push(transaction["Description"]);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["DebitAmount"], '.'));
 
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
    convertionParam.headerLineStart = 0;
    convertionParam.dataLineStart = 1;
 
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
 
    convertedColumns = convertHeaderIt(columns);
 
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
          case "Data di registrazione":
             convertedColumns[i] = "Date";
             break;
          case "Data valuta":
             convertedColumns[i] = "DateValue";
             break;
          case "Tipo di ordine":
             convertedColumns[i] = "Order Type";
             break;  
          case "Testo":
             convertedColumns[i] = "Description";
             break; 
          case "Importo di addebito (EUR)":
          case "Importo di addebito (CHF)":
             convertedColumns[i] = "DebitAmount";
             break;
          case "Importo di accredito (EUR)":
          case "Importo di accredito (CHF)":
             convertedColumns[i] = "CreditAmount";
             break;
          case "Saldo (EUR)":
          case "Saldo (CHF)":
             convertedColumns[i] = "Balance";
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