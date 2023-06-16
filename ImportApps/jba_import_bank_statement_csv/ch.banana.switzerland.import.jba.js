// @id = ch.banana.switzerland.import.jba
// @api = 1.0
// @pubdate = 2023-06-16
// @publisher = Banana.ch SA
// @description = Julius Bär - Import bank account statement .csv (Banana+ Advanced)
// @description.de = Julius Bär - Kontoauszug importieren .csv (Banana+ Advanced)
// @description.en = Julius Bär - Import bank account statement .csv (Banana+ Advanced)
// @description.fr = Julius Bär - Importer un relevé de compte bancaire .csv (Banana+ Advanced)
// @description.it = Julius Bär - Importa movimenti estratto conto bancario .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
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
   var format1 = new JBAFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
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
   } else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}

/**
 * JBAFormat1 (no Header)
 * Files have some useless characters at the end of each row, those are ignored, 
 * and useless empty spaces are removed.
 * 
 */
function ZKBFormat5() {
   this.colDate = 0;
   this.colDescr = 1;
   this.colExternalRef = 2;
   this.colValuta = 3;
   this.colDebit = 4;
   this.colCredit = 5;

   this.colCount = 6;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length === this.colCount)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched) return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function (transactions) {
      var transactionsToImport = [];

      for (i = 1; i < transactions.length; i++) // First row contains the header
      {
         var transaction = transactions[i];

         if (transaction.length === 0) {
            // Righe vuote
            continue;
         }
         if (transaction.length === this.colCount) {
            transactionsToImport.push(this.mapTransaction(transaction));
         }

      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.mapTransaction = function (element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push(""); // Doc is empty for now
      mappedLine.push(element[this.colExternalRef]);
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));

      return mappedLine;
   }
}