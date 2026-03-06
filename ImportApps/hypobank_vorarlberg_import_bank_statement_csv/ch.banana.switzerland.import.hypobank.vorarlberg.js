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

// @id = ch.banana.switzerland.import.hypobank.vorarlberg
// @api = 1.0
// @pubdate = 2026-06-03
// @publisher = Banana.ch SA
// @description = Hypobank Vorarlberg - Import bank account statement (*.csv)
// @description.it = Hypobank Vorarlberg - Importa estratto conto bancario (*.csv)
// @description.en = Hypobank Vorarlberg - Import bank account statement (*.csv)
// @description.de = Hypobank Vorarlberg - Kontoauszug importieren (*.csv)
// @description.fr = Hypobank Vorarlberg - Importer un relevé de compte bancaire (*.csv)
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

   // Hypobank Vorarlberg Format, this format works with the header names.
   var hypobankVorarlbergFormat1 = new HypobankVorarlbergFormat1();
   if (hypobankVorarlbergFormat1.match(transactionsData)) {
      transactions = hypobankVorarlbergFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Hypobank Vorarlberg Format
 *
 * IBAN;Auszugsnummer;Buchungsdatum;Valutadatum;Umsatzzeit;Zahlungsreferenz;Waehrung;Betrag;Buchungstext;Umsatztext;Name des Partners;Name des ultimate Partners;Name des ultimate Auftraggebers;Creditor ID;Mandat ID;Kontoverbindung des Partners;Partner BIC;Auftraggeberreferenz;Verwendungszweck;Kategorie;Notiz;Original Auftragsbetrag;Original W�hrung;Bestandskategorie;Umsatzkategorie;Entgeltinformationen;Eigene Referenz
 * A0000000000000000000;12;2025-12-31;2025-12-31;2025-12-31-21.35.45.616362;;EUR;-40,51;Abschluss;Test description;;;;;;;;;;Sonstiges;;;;;;;
 * A0000000000000000000;12;2025-12-31;2025-12-30;2025-12-31-07.34.03.125484;;EUR;-125,00;POS;Test description;;;;;;;;;;Freizeit & Genuss;;;;;;;
 * A0000000000000000000;12;2025-12-30;2025-12-30;2025-12-30-14.15.40.717674;;EUR;-52,32;SEPA-Zahlung;Test description;Partner 1;;;;;A0000000000000000001;XXXXXXXXXXX;;Motivation;Sonstiges;;-52,32;;;;;1111111111111111111111111111
*/
function HypobankVorarlbergFormat1() {

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^\d{4}-\d{2}-\d{2}$/))
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
            transactionsData[i]["Date"].match(/^\d{4}-\d{2}-\d{2}$/)) {
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

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "yyyy.mm.dd"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "yyyy.mm.dd"));
      mappedLine.push("");
      mappedLine.push(transaction["PaymentReference"]);
      mappedLine.push(getDescription(transaction));
      if (transaction["Amount"] && transaction["Amount"].startsWith("-")) {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), ','));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], ','));
         mappedLine.push("");
      }

      return mappedLine;
   }
}

function getDescription(transaction) {
   if (!transaction)
      return "";
   const { "Description": description, "TransactionText": transactionText, "PartnerName": partnerName } = transaction;
   return [description, transactionText, partnerName]
      .filter(value => value && typeof value === "string" && value.trim() !== "")
      .join(", ").replace(/ +/g, " ");
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
         case "IBAN":
            convertedColumns[i] = "IBAN";
            break;
         case "Auszugsnummer":
            convertedColumns[i] = "Doc";
            break;
         case "Buchungsdatum":
            convertedColumns[i] = "Date";
            break;
         case "Valutadatum":
            convertedColumns[i] = "DateValue";
            break;
         case "Umsatzzeit":
            convertedColumns[i] = "SalesPeriod";
            break;
         case "Zahlungsreferenz":
            convertedColumns[i] = "PaymentReference";
            break;
         case "Waehrung":
            convertedColumns[i] = "Currency";
            break;
         case "Betrag":
            convertedColumns[i] = "Amount";
            break;
         case "Buchungstext":
            convertedColumns[i] = "Description";
            break;
         case "Umsatztext":
            convertedColumns[i] = "TransactionText";
            break;
         case "Name des Partners":
            convertedColumns[i] = "PartnerName";
            break;
         case "Name des ultimate Partners":
            convertedColumns[i] = "UltimatePartnerName";
            break;
         case "Name des ultimate Auftraggebers":
            convertedColumns[i] = "UltimateClientName";
            break;
         case "Creditor ID":
            convertedColumns[i] = "CreditorID";
            break;
         case "Mandat ID":
            convertedColumns[i] = "MandateID";
            break;
         case "Kontoverbindung des Partners":
            convertedColumns[i] = "PartnerAccount";
            break;
         case "Partner BIC":
            convertedColumns[i] = "PartnerBIC";
            break;
         case "Auftraggeberreferenz":
            convertedColumns[i] = "ClientReference";
            break;
         case "Verwendungszweck":
            convertedColumns[i] = "Purpose";
            break;
         case "Kategorie":
            convertedColumns[i] = "Category";
            break;
         case "Notiz":
            convertedColumns[i] = "Note";
            break;
         case "Original Auftragsbetrag":
            convertedColumns[i] = "OriginalOrderAmount";
            break;
         case "Bestandskategorie":
            convertedColumns[i] = "InventoryCategory";
            break;
         case "Umsatzkategorie":
            convertedColumns[i] = "RevenueCategory";
            break;
         case "Entgeltinformationen":
            convertedColumns[i] = "FeeInformation";
            break;
         case "Eigene Referenz":
            convertedColumns[i] = "OwnReference";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      && convertedColumns.indexOf("OrderType") < 0) {
      return [];
   }

   return convertedColumns;
}