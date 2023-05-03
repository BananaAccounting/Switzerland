// @id = ch.banana.switzerland.import.swisscard
// @api = 1.0
// @pubdate = 2023-05-02
// @publisher = Banana.ch SA
// @description = Swisscard - Import transactions (*.csv)
// @description.it = Swisscard - Importa movimenti (*.csv)
// @description.en = Swisscard - Import transactions (*.csv)
// @description.de = Swisscard - Bewegungen importieren (*.csv)
// @description.fr = Swisscard - Importer mouvements (*.csv)
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
function exec(string,isTest) {

	var importUtilities = new ImportUtilities(Banana.document);
  
	if (isTest!==true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '');

   // Format 1
   var format1 = new SwisscardFormat1();
   if ( format1.match( transactions))
   {
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

/**
 * Swisscard Format 1
 * Example:
 */

function SwisscardFormat1() {

   this.colDate        = 0;
   this.colDescr       = 1;
   this.colCardNr      = 2;
   this.colAmount      = 4;
   this.colAmountType  = 5;
   this.colCategory    = 7;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length <= 1)
         return false;

      for (i = 0; i<transactions.length; i++ )
      {
         var transaction = transactions[i];

         var formatMatched = false;

         if ( transaction.length  === (this.colCategory+1)  )
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
   }


   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];
         if ( transaction.length  < (this.colCategory+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date","Doc","ExternalReference","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }


   /** Sort transactions by date */
   this.sort = function( transactions) {
      if (transactions.length<=0)
         return transactions;
      var i=0;
      var previousDate = transactions[0][this.colDate];
      while (i<transactions.length)
      {
         var date = transactions[i][this.colDate];
         if (previousDate > 0 && previousDate > date)
            return transactions.reverse();
         else if (previousDate > 0 && previousDate < date)
            return transactions;
         i++;
      }
      return transactions;
   }

   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push( ""); // Doc is empty for now
      mappedLine.push( element[this.colCardNr]);
      mappedLine.push( element[this.colDescr] + " " + element[this.colCategory]);
      var amount = element[this.colAmount];
      if ( amount.length > 0) {
         if ( amount[0] === "-") {
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push( Banana.Converter.toInternalNumberFormat( amount, "."));
            mappedLine.push( "");

         } else {
            mappedLine.push( "");
            mappedLine.push( Banana.Converter.toInternalNumberFormat( amount, "."));
         }
      }

      return mappedLine;
   }
}
