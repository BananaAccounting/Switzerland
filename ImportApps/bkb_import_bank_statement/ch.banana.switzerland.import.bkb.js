// @id = ch.banana.switzerland.import.bkb
// @api = 1.0
// @pubdate = 2023-02-22
// @publisher = Banana.ch SA
// @description = Basler Kantonalbank - Import bank account statement (*.csv)
// @description.en = Basler Kantonalbank - Import bank account statement (*.csv)
// @description.de = Basler Kantonalbank - Kontoauszug importieren (*.csv)
// @description.fr = Basler Kantonalbank - Importer un relevé de compte bancaire (*.csv)
// @description.it = Basler Kantonalbank - Importa movimenti estratto conto bancario (*.csv)
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
  
	if (isTest!==true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');


   // Format 1
   var format1 = new BKBFormat1();
   if ( format1.match( transactions))
   {
      Banana.console.debug("format1");
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new BKBFormat2();
   if (format2.match( transactions))
   {
      transactions = format2.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * BKB Format 1
 *
 * Example A:
 * Datum	Valuta	Buchungstext	Belastung	Gutschrift	Saldo
 * 7/1/2016	7/1/2016	Kassentransaktion BKB Buchungsnr. 382829086	"2,000.00"		"4,569.06"
 * 6/30/2016	6/30/2016	Paketgebühr BKB Buchungsnr. 382582120	30		"6,569.06"
 * 6/30/2016	6/30/2016	Rückvergütung Gebühren BKB Buchungsnr. 382578169		18	"6,599.06"
 * 6/30/2016	6/30/2016	Gebühren sonst. Dienstleistungen Dienstleistungsgebühren BKB Buchungsnr. 382578143	90.9
 */
function BKBFormat1() {
   this.colDate = 0;
   this.colDateValuta = 1;
   this.colDescr = 2;
   this.colDebit = 3;
   this.colCredit = 4;
   this.colBalance = 5;

   this.colCount = 6;
   this.dateFormat = "mm/dd/yyyy";
   this.decimalSeparator = ".";

   /** Return true if the transactions match this format */
   this.match = function(transactions) {

      if (transactions.length === 0) 
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
   
         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length >= this.colCount) 
            formatMatched = true;
         else 
            formatMatched = false;
   
         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
            formatMatched = true;
            else 
               formatMatched = false;
      
            if (formatMatched && transaction[this.colDateValuta] &&
            transaction[this.colDateValuta].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
               formatMatched = true;
         else 
            formatMatched = false;
   
         if (formatMatched) 
            return true;
       }
   
       return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(rows) {
      var transactionsToImport = [];

      for (var i = 1; i < rows.length; i++)
         transactionsToImport.push(this.mapTransaction(rows[i]));

      // Sort rows by date
      if (transactionsToImport.length > 1) {
         if (transactionsToImport[0][0] > transactionsToImport[transactionsToImport.length-1][0]) {
            transactionsToImport = transactionsToImport.reverse();
         }
      }

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], this.dateFormat));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta], this.dateFormat));
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat( element[this.colCredit], this.decimalSeparator));
      mappedLine.push(Banana.Converter.toInternalNumberFormat( element[this.colDebit], this.decimalSeparator));

      return mappedLine;
   }

}

/**
 * BKB Format 2
 * Datum;Valuta;Buchungstext;Belastung;Gutschrift;Saldo CHF
 * 10.02.2023;10.02.2023;Subsim Flumquobandione DE Lansonius 2;;3'295.62;24'271.29
 * 06.02.2023;06.02.2023;FER-LANO COMPLUDUCTUR DE 8255 PERBENT;915.1;;20'975.67
 * 03.02.2023;03.02.2023;DICULIS STESENDINIUSTO 1811 OCUSCIEREM;758.9;;21'890.77
 * 01.02.2023;01.02.2023;FER HYACTABURGENSI DE 1811 OCUSCIEREM;1'341.80;;22'649.67
 * 26.01.2023;20.01.2023;Brumentate nix Somnibullituungi Ferumenem: NUNCH DE EXEMULTIS;80.8;;23'991.47
 * 10.01.2023;10.01.2023;FER HYACTABURGENSI DE 1811 OCUSCIEREM;683.25;;24'072.27
 * 03.01.2023;03.01.2023;Subsim Flumquobandione DE Lansonius 2;;4'992.95;24'755.52
 */
function BKBFormat2() {
   this.colDate = 0;
   this.colDateValuta = 1;
   this.colDescr = 2;
   this.colDebit = 3;
   this.colCredit = 4;
   this.colBalance = 5;

   this.colCount = 6;
   this.dateFormat = "dd.mm.yyyy";
   this.decimalSeparator = ".";

   /** Return true if the transactions match this format */
   this.match = function(transactions) {

      if (transactions.length === 0) 
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
   
         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length >= this.colCount) 
            formatMatched = true;
         else 
            formatMatched = false;
   
         if (formatMatched && transaction[this.colDate] &&
           transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
           formatMatched = true;
         else 
            formatMatched = false;
   
         if (formatMatched && transaction[this.colDateValuta] &&
           transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else 
            formatMatched = false;
   
         if (formatMatched) 
            return true;
       }
   
       return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(rows) {
      var transactionsToImport = [];

      for (var i = 1; i < rows.length; i++)
         transactionsToImport.push(this.mapTransaction(rows[i]));

      // Sort rows by date
      if (transactionsToImport.length > 1) {
         if (transactionsToImport[0][0] > transactionsToImport[transactionsToImport.length-1][0]) {
            transactionsToImport = transactionsToImport.reverse();
         }
      }

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], this.dateFormat));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta], this.dateFormat));
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat( element[this.colCredit], this.decimalSeparator));
      mappedLine.push(Banana.Converter.toInternalNumberFormat( element[this.colDebit], this.decimalSeparator));

      return mappedLine;
   }
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator( string) {

   var commaCount=0;
   var semicolonCount=0;
   var tabCount=0;

   for(var i = 0; i < 1000 && i < string.length; i++) {
      var c = string[i];
      if (c === ',')
         commaCount++;
      else if (c === ';')
         semicolonCount++;
      else if (c === '\t')
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount)
   {
      return '\t';
   }
   else if (semicolonCount > commaCount)
   {
      return ';';
   }

   return ',';
}


