// @id = ch.banana.switzerland.import.zugerkb
// @api = 1.0
// @pubdate = 2024-08-26
// @publisher = Banana.ch SA
// @description = Zuger Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Zuger Kantonalbank -  Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Zuger Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.fr = Zuger Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Zuger Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
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

   var fieldSeparator = ";";
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   // Format 1
   var format1 = new ZugerKBFormat1();
   let transactionsData = format1.getFormattedData(transactions, importUtilities);
   if (format1.match(transactionsData)) {
      transactions = format1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Zuger KantonalBank format 1
 */
function ZugerKBFormat1() {
   this.decimalSeparator = ".";

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 22); //array
      var rows = importUtilities.getRowData(inData, 24); //array of array
      let form = [];

      let convertedColumns = [];

      convertedColumns = this.convertHeaderDe(columns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.convertHeaderDe = function (columns) {
      let convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Datum":
               convertedColumns[i] = "Date";
               break;
            case "Valuta":
               convertedColumns[i] = "DateValue";
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

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("DateValue") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Amount") < 0) {
         return [];
      }
      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {

      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];

         var formatMatched = false;

         if (transaction["Date"] && transaction["Date"].length >= 8 &&
            transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (transaction["DateValue"] && transaction["DateValue"].length >= 8 &&
            transaction["DateValue"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function (rows) {
      var transactionsToImport = [];

      for (var i = 0; i < rows.length; i++) {
         if (rows[i]["Date"] && rows[i]["Date"].length >= 8 &&
            rows[i]["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            transactionsToImport.push(this.mapTransaction(rows[i]));
      }

      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   this.mapTransaction = function (element) {
      var mappedLine = [];
      mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yy"));
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element['Description'].replace(/\r\n/g, " "); //remove new line && new row characters
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      let amount = element['Amount'];
      if (amount.indexOf('-') < 0) {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
         mappedLine.push(Banana.Converter.toInternalNumberFormat('', this.decimalSeparator));
      } else {
         amount = amount.replace(/-/g, ''); //remove minus sign
         mappedLine.push(Banana.Converter.toInternalNumberFormat('', this.decimalSeparator));
         mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
      }

      return mappedLine;
   }

}