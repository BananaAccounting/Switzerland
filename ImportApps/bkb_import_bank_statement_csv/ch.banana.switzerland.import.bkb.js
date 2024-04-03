// @id = ch.banana.switzerland.import.bkb
// @api = 1.0
// @pubdate = 2024-03-27
// @publisher = Banana.ch SA
// @description = Basler Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.en = Basler Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Basler Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Basler Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Basler Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
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
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   // Format 1
   var format1 = new BKBFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2, uses the headers description and not positions as the others format.
   var format2 = new BKBFormat2();
   let transactionsData = format2.getFormattedData(transactions, importUtilities);
   if (format2.match(transactionsData)) {
      transactions = format2.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * BKB Format 2
 * Buchungsdatum;Valutadatum;Auftragsart;Text;Belastungsbetrag (CHF);Gutschriftsbetrag (CHF);Saldo (CHF)
 * 11.03.2024;11.03.2024;Vernect de Occupa;"XXX Prorinciectusa AN"
 * 8401 Winterthur
 * "Finovential;6138.1;;35872.24"
 * 07.03.2024;07.03.2024;Erventinga;"Agnumens Quaddunt"
 * Rendidem 4
 * EO-7868 Flocuidesse
 * "2023110001;;22600;82619.07"
 * 06.03.2024;06.03.2024;Vernect de Occupa;"PERE FUNGENUTO XXX"
 * SHABILIQUAEPS 44
 * 4142 MUENCHENSTEIN
 * "Tagitrass Prit Spissit 2557;5534;;46582.80"
 * 04.03.2024;04.03.2024;Vernect de Occupa;"Ovessignuludive Marte-Metum"
 * Medentuundiuva 4
 * 4001 Basel
 * "Finovential;24208.1;;73646.80"
 *
 */
function BKBFormat2() {
   this.decimalSeparator = ".";

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
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
            case "Buchungsdatum":
               convertedColumns[i] = "Date";
               break;
            case "Valutadatum":
               convertedColumns[i] = "DateValue";
               break;
            case "Text":
            case "Buchungstext":
               convertedColumns[i] = "Description";
               break;
            case "Gutschriftsbetrag (CHF)":
            case "Gutschriftsbetrag (EUR)":
            case "Gutschriftsbetrag (USD)":
               convertedColumns[i] = "Income";
               break;
            case "Belastungsbetrag (CHF)":
            case "Belastungsbetrag (EUR)":
            case "Belastungsbetrag (USD)":
               convertedColumns[i] = "Expenses";
               break;
               break;
            case "Auftragsart":
               convertedColumns[i] = "Category";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
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

         if (transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
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
         if (rows[i]["Date"] && rows[i]["Date"].length >= 10 &&
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
      let date = element['Date'].substring(0, 10);

      if (date.indexOf(".") > -1) {
         mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yyyy"));
         mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yyyy"));
      } else {
         mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "mm/dd/yyyy"));
         mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "mm/dd/yyyy"));
      }
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element['Description'].replace(/\r\n/g, " "); //remove new line && new row characters
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element['Income'], this.decimalSeparator));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element['Expenses'], this.decimalSeparator));

      return mappedLine;
   }

}

/**
 * BKB Format 1
 *
 * Example A: (with date format: mm/dd/yyyy)
 * Datum	Valuta	Buchungstext	Belastung	Gutschrift	Saldo
 * 7/1/2016	7/1/2016	Kassentransaktion BKB Buchungsnr. 382829086	"2,000.00"		"4,569.06"
 * 6/30/2016	6/30/2016	Paketgebühr BKB Buchungsnr. 382582120	30		"6,569.06"
 * 6/30/2016	6/30/2016	Rückvergütung Gebühren BKB Buchungsnr. 382578169		18	"6,599.06"
 * 6/30/2016	6/30/2016	Gebühren sonst. Dienstleistungen Dienstleistungsgebühren BKB Buchungsnr. 382578143	90.9
 * 
 * Example B: (with date format: dd.mm.yyyy)
 * Datum;Valuta;Buchungstext;Belastung;Gutschrift;Saldo CHF
 * 10.02.2023;10.02.2023;Subsim Flumquobandione DE Lansonius 2;;3'295.62;24'271.29
 * 06.02.2023;06.02.2023;FER-LANO COMPLUDUCTUR DE 8255 PERBENT;915.1;;20'975.67
 * 03.02.2023;03.02.2023;DICULIS STESENDINIUSTO 1811 OCUSCIEREM;758.9;;21'890.77
 */
function BKBFormat1() {
   this.colDate = 0;
   this.colDateValuta = 1;
   this.colDescr = 2;
   this.colDebit = 3;
   this.colCredit = 4;
   this.colBalance = 5;

   this.colCount = 6;
   this.decimalSeparator = ".";

   /** Return true if the transactions match this format */

   this.match = function (transactions) {

      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length == this.colCount)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^(0?[1-9]|1[012])[\/.](0?[1-9]|[12][0-9]|3[01])[\/.]\d{4}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDateValuta] &&
            transaction[this.colDateValuta].match(/^(0?[1-9]|1[012])[\/.](0?[1-9]|[12][0-9]|3[01])[\/.]\d{4}$/))
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

      for (var i = 1; i < rows.length; i++)
         transactionsToImport.push(this.mapTransaction(rows[i]));

      // Sort rows by date
      if (transactionsToImport.length > 1) {
         if (transactionsToImport[0][0] > transactionsToImport[transactionsToImport.length - 1][0]) {
            transactionsToImport = transactionsToImport.reverse();
         }
      }

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   this.mapTransaction = function (element) {
      var mappedLine = [];
      let date = element[this.colDate].substring(0, 10);

      if (date.indexOf(".") > -1) {
         mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], "dd.mm.yyyy"));
         mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta], "dd.mm.yyyy"));
      } else {
         mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], "mm/dd/yyyy"));
         mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta], "mm/dd/yyyy"));
      }
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], this.decimalSeparator));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], this.decimalSeparator));

      return mappedLine;
   }

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


