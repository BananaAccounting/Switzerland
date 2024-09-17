// @id = ch.banana.switzerland.import.swisscard
// @api = 1.0
// @pubdate = 2024-07-25
// @publisher = Banana.ch SA
// @description = Swisscard - Import movements .csv (Banana+ Advanced)
// @description.it = Swisscard - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Swisscard - Import movements .csv (Banana+ Advanced)
// @description.de = Swisscard - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Swisscard - Importer mouvements .csv (Banana+ Advanced)
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
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   var fieldSeparator = findSeparator(string);

   let convertionParam = defineConversionParam(string);

   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '');
   let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

   // Format 2
   var format2 = new SwisscardFormat2();
   if (format2.match(transactionsData)) {
      transactions = format2.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 1
   var format1 = new SwisscardFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Swisscard Format 2
 * Example:
 */
function SwisscardFormat2() {
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/) && transaction["Registered category"])
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
      if (transaction["Registered category"]) {
         mappedLine.push(transaction["Description"] + " - " + transaction["Registered category"]);
      } else {
         mappedLine.push(transaction["Description"]);
      }
      if (transaction["Amount"].match(/^[0-9]/))
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
      else
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

      return mappedLine;
   }
}

/**
 * Swisscard Format 1
 * Example:
 */

function SwisscardFormat1() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colCardNr = 2;
   this.colAmount = 4;
   this.colAmountType = 5;
   this.colCategory = 7;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length <= 1)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;

         if (transaction.length === (this.colCategory + 1))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
   }


   /** Convert the transaction to the format to be imported */
   this.convert = function (transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colCategory + 1))
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            transactionsToImport.push(this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }


   /** Sort transactions by date */
   this.sort = function (transactions) {
      if (transactions.length <= 0)
         return transactions;
      var i = 0;
      var previousDate = transactions[0][this.colDate];
      while (i < transactions.length) {
         var date = transactions[i][this.colDate];
         if (previousDate > 0 && previousDate > date)
            return transactions.reverse();
         else if (previousDate > 0 && previousDate < date)
            return transactions;
         i++;
      }
      return transactions;
   }

   this.mapTransaction = function (element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push(""); // Doc is empty for now
      mappedLine.push(element[this.colCardNr]);
      mappedLine.push(element[this.colDescr] + " " + element[this.colCategory]);
      var amount = element[this.colAmount];
      if (amount.length > 0) {
         if (amount[0] === "-") {
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
            mappedLine.push("");

         } else {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
         }
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
         case "Data transazione":
            convertedColumns[i] = "Date";
            break;
         case "Descrizione":
            convertedColumns[i] = "Description";
            break;
         case "Importo":
            convertedColumns[i] = "Amount";
            break;
         case "Categoria Registrata":
            convertedColumns[i] = "Registered category";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      || convertedColumns.indexOf("Description") < 0
      || convertedColumns.indexOf("Amount") < 0
      || convertedColumns.indexOf("Registered category") < 0) {
      return [];
   }

   return convertedColumns;
}

function convertHeaderDe(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Transaktionsdatum":
            convertedColumns[i] = "Date";
            break;
         case "Beschreibung":
            convertedColumns[i] = "Description";
            break;
         case "Betrag":
            convertedColumns[i] = "Amount";
            break;
         case "Registrierte Kategorie":
            convertedColumns[i] = "Registered category";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0
      || convertedColumns.indexOf("Description") < 0
      || convertedColumns.indexOf("Amount") < 0
      || convertedColumns.indexOf("Registered category") < 0) {
      return [];
   }

   return convertedColumns;
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
