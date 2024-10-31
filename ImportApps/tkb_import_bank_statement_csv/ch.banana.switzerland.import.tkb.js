// @id = ch.banana.switzerland.import.tkb
// @api = 1.0
// @pubdate = 2024-10-31
// @publisher = Banana.ch SA
// @description = Thurgauer Kantonalbank - Import bank account statement  (*.csv)
// @description.de = Thurgauer Kantonalbank -  Kontoauszug importieren (*.csv)
// @description.en = Thurgauer Kantonalbank - Import bank account statement (*.csv)
// @description.fr = Thurgauer Kantonalbank - Importer un relevé de compte bancaire (*.csv)
// @description.it = Thurgauer Kantonalbank - Importa movimenti estratto conto bancario (*.csv)
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

var applicationSupportIsDetail = Banana.compareVersion &&
   (Banana.compareVersion(Banana.application.version, "10.0.12") >= 0);
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

   // Format 4
   var format4 = new TKBFormat4();
   if (format4.match(transactionsData)) {
      transactions = format4.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 3
   var format3 = new TKBFormat3();
   if (format3.match(transactions)) {
      transactions = format3.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new TKBFormat2();
   if (format2.match(transactions)) {
      transactions = format2.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 1
   var format1 = new TKBFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Example
 * Buchungsdatum;Valutadatum;Auftragsart;Buchungstext;Betrag Einzelzahlung (CHF);Belastung (CHF);Gutschrift (CHF);Saldo in (CHF)
 * 28.02.2024;28.02.2024;Pulo�cent;"Sevolucela / Xxx.-Eo.  5413226066
 * hat.me AleI
 * Emovimindiunno 75
 * 8045 Z�rich
 * Nuidivo
 * Muliunnata: OCCIUSIVIT BY-84030035864 32-87-4048 PAUT HAT";;;2676.24;3020.50
 * 27.02.2024;27.02.2024;Pulo�cent;"Sevolucela / Xxx.-Eo.  2363577442
 * LINO DITQUAM ALEI
 * SOLAMQUA-WEEK 3 72010 HEDESUBA
 * Subserunter
 * Muliunnata:
 * /XXX/842-710836420-367242487-711561///UBI/ET:RKB82.87.61:QUAT-EO.
 * 000053:BRUTTO165,20:KOM2,10:VP157228737:FIL:TRX9
 * RIURANE-44761868503-711561";;;741.51;2607.84
*/
function TKBFormat4() {
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Buchungsdatum"] && transaction["Buchungsdatum"].length >= 10 &&
            transaction["Buchungsdatum"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["Valutadatum"] && transaction["Valutadatum"].length >= 10 &&
            transaction["Valutadatum"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
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

      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;
      var lastCompleteTransactionPrinted = false;


      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         if (transaction["Belastung (CHF)"] || transaction["Gutschrift (CHF)"] || transaction['Betrag Einzelzahlung (CHF)']) { // valid rows have transactions with amount.
            if (!this.isDetailRow(transaction)) { // Normal row
               lastCompleteTransactionPrinted = false;
               if (isPreviousCompleteTransaction) {
                  transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
               }
               lastCompleteTransaction = transaction;
               isPreviousCompleteTransaction = true;
            } else { // Detail row
               if (transaction['Betrag Einzelzahlung (CHF)'] && transaction['Betrag Einzelzahlung (CHF)'].length > 0) {
                  if (applicationSupportIsDetail && !lastCompleteTransactionPrinted) {
                     lastCompleteTransaction['IsDetail'] = 'S';
                     transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                     lastCompleteTransactionPrinted = true;
                  }

                  this.fillDetailRow(transaction, lastCompleteTransaction);
                  if (applicationSupportIsDetail) {
                     transaction['IsDetail'] = 'D';
                  }
                  transactionsToImport.push(this.mapTransaction(transaction));
                  isPreviousCompleteTransaction = false;
               } else {
                  this.fillDetailRow(transaction, lastCompleteTransaction);
                  transactionsToImport.push(this.mapTransaction(transaction));
                  isPreviousCompleteTransaction = false;
               }
            }
         }
      }

      if (isPreviousCompleteTransaction === true) {
         transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses", "IsDetail"]];
      return header.concat(transactionsToImport);
   }

   this.isDetailRow = function (transaction) {
      if (transaction["Buchungsdatum"].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   this.fillDetailRow = function (detailRow, totalRow) {
      // Copy dates
      detailRow["Buchungsdatum"] = totalRow["Buchungsdatum"];

      // Copy amount from complete row to detail row
      if (detailRow["Betrag Einzelzahlung (CHF)"] && detailRow["Betrag Einzelzahlung (CHF)"].length > 0) {
         if (totalRow["Belastung (CHF)"].length > 0) {
            detailRow["Belastung (CHF)"] = detailRow["Betrag Einzelzahlung (CHF)"];
         } else if (totalRow["Gutschrift (CHF)"].length > 0) {
            detailRow["Gutschrift (CHF)"] = detailRow["Betrag Einzelzahlung (CHF)"];
         }
      } else {
         detailRow["Belastung (CHF)"] = totalRow["Belastung (CHF)"];
         detailRow["Gutschrift (CHF)"] = totalRow["Gutschrift (CHF)"];
      }
   }

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Buchungsdatum"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Valutadatum"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["Buchungstext"]);
      mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Gutschrift (CHF)"], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Belastung (CHF)"], '.'));
      mappedLine.push(transaction["IsDetail"]);

      return mappedLine;
   }
}

/**
 * Example
 * Buchungsdatum;Buchungstext;Belastung;Gutschrift;Saldo CHF;
 * 29.06.2017;Warenbezug und Dienstleistungen Maestro Karte Kartennummer 1234567890 28.06.2017 15:01;79.60;;;
 * 29.06.2017;" Gutschrift / Ref.-Nr. 1234567890 Pinco Pallino Schulstrasse 16 4567 Arniswil Schweiz ";;1'640.00;;
 * 29.06.2017;" Belastung e-banking / Ref.-Nr. 1234567890 SWISSCOM (SCHWEIZ) AG ALTE TIEFENAUSTRASSE 6 CH-3050 BERN ";26.25;;;
 * 29.06.2017;" Belastung e-banking / Ref.-Nr. 1234567890 SWISSCOM (SCHWEIZ) AG ALTE TIEFENAUSTRASSE 6 CH-3050 BERN ";70.00;;;
 * 29.06.2017;" Belastung e-banking / Ref.-Nr. 1234567890 SWISSCOM (SCHWEIZ) AG ALTE TIEFENAUSTRASSE 6 CH-3050 BERN ";94.60;;;
 * 21.06.2017;" Posteinzahlung / Ref.-Nr. 1234567890 Einzahler: LAUT EINZAHLUNGSBELEG AUF GUTSCHRIFTSANZEIGE POSTCHECK Postgebühr: CHF 2.35 separat verrechnet ";;179.82;;
 * 21.06.2017;" Gutschrift / Ref.-Nr. 1234567890 Aduno SA Via Argine 5 6930 Bedano Mitteilung: VERTRAG ABC123 REF.123456 DOK 1 FR. 1'100,00 KOMM/ABZ 16,70 ";;1'083.30;;
*/
function TKBFormat3() {
   this.colDate = 0;
   this.colDescr = 1;
   this.colDebit = 2;
   this.colCredit = 3;
   this.colBalance = 4;

   this.colCount = 5;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length === this.colCount ||
            (transaction.length === this.colCount + 1 && transaction[this.colCount].length === 0))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDescr] && transaction[this.colDescr].match(/[a-zA-Z]/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function (transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i = 1; i < transactions.length; i++) // First row contains the header
      {
         var transaction = transactions[i];

         if (transaction.length === 0) {
            // Righe vuote
            continue;
         } else if (!this.isDetailRow(transaction)) {
            if (isPreviousCompleteTransaction === true)
               transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow(transaction, lastCompleteTransaction);
            transactionsToImport.push(this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if (isPreviousCompleteTransaction === true) {
         transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
      }

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function (transaction) {
      if (transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function (detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if (detailRow[this.colDetail].length > 0) {
         if (totalRow[this.colDebit].length > 0) {
            detailRow[this.colDebit] = detailRow[this.colDetail];
         } else if (totalRow[this.colCredit].length > 0) {
            detailRow[this.colCredit] = detailRow[this.colDetail];
         }
      } else {
         detailRow[this.colDebit] = totalRow[this.colDebit];
         detailRow[this.colCredit] = totalRow[this.colCredit];
      }
   }

   /** Return true if the transaction is a transaction row */
   this.mapTransaction = function (element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push("");
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));

      return mappedLine;
   }
}

/**
 * Example
 * Buchung;Valuta;Buchungstext;Belastung;Gutschrift;Saldo CHF;
 * 26.10.2015;26.10.2015;Zahlungseingang / Ref.-Nr. 512024845 CONCARDIS GMBH;;631.98;799.32;
 * 23.10.2015;23.10.2015;Zahlungseingang / Ref.-Nr. 511545235 CONCARDIS GMBH;;52.51;167.34;
 * 23.10.2015;23.10.2015;Belastung e-banking / Ref.-Nr. 511414344 STOP SHOP MELLINGEN GMBH;16'000.00;;114.83;
 */
function TKBFormat2() {
   this.colDate = 0;
   this.colDateValuta = 1;
   this.colDescr = 2;
   this.colDebit = 3;
   this.colCredit = 4;
   this.colBalance = 5;

   this.colCount = 6;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length === this.colCount ||
            (transaction.length === this.colCount + 1 && transaction[this.colCount].length === 0))
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

         if (formatMatched && transaction[this.colDescr] && transaction[this.colDescr].match(/[a-zA-Z]/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function (transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i = 1; i < transactions.length; i++) // First row contains the header
      {
         var transaction = transactions[i];

         if (transaction.length === 0) {
            // Righe vuote
            continue;
         } else if (!this.isDetailRow(transaction)) {
            if (isPreviousCompleteTransaction === true)
               transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow(transaction, lastCompleteTransaction);
            transactionsToImport.push(this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if (isPreviousCompleteTransaction === true) {
         transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function (transaction) {
      if (transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function (detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if (detailRow[this.colDetail].length > 0) {
         if (totalRow[this.colDebit].length > 0) {
            detailRow[this.colDebit] = detailRow[this.colDetail];
         } else if (totalRow[this.colCredit].length > 0) {
            detailRow[this.colCredit] = detailRow[this.colDetail];
         }
      } else {
         detailRow[this.colDebit] = totalRow[this.colDebit];
         detailRow[this.colCredit] = totalRow[this.colCredit];
      }
   }

   /** Return true if the transaction is a transaction row */
   this.mapTransaction = function (element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));

      return mappedLine;
   }
}

/**
 * Example 1
 * Datum,Buchungstext,Betrag Detail,Belastung,Gutschrift,Valuta,Saldo
 * 18.07.2008,"BESR-Gutschriftsanzeige, Ohne Details / Ref.-Nr. 41174122",,,10.00,18.07.2008,2'660.83
 * 18.07.2008,"BESR-Gutschriftsanzeige, (Anzahl Buchungen: 1 / Ref.-Nr. 41174121)",,,1.00,18.07.2008,2'650.83
 * ,Zahlungseingang ESR / Ref.-Nr. 40697724 320639000000000000000000173 ,,,,,
 *
 * Datum;Buchungstext;Betrag Detail;Belastung;Gutschrift;Valuta;Saldo
 * 03.09.2012;Vergütung Inland / 356660513 .;;1'500.00;;03.09.2012;9'602.74
 * ;Vergütung Inland / 356660513 . BIRRER ROLF U/O VRENI RIGISTRASSE 6 6353 WEGGIS - - Info - - WOHNUNG UND GARAGE ;;;;;
 * 03.09.2012;Gutschrift / 356729730 .;;;700.00;03.09.2012;10'302.74
 * ;Gutschrift / 356729730 . Luzia Menia Rigistrasse 8 6353 Weggis - - Info - - MIETANTEIL HALDENGUT/GARAGE ;;;;;
*/
function TKBFormat1() {
   this.colDate = 0;
   this.colDescr = 1;
   this.colDetail = 2;
   this.colDebit = 3;
   this.colCredit = 4;
   this.colDateValuta = 5;
   this.colBalance = 6;

   this.colCount = 7;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
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
   this.convert = function (transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i = 1; i < transactions.length; i++) // First row contains the header
      {
         var transaction = transactions[i];

         if (transaction.length === 0) {
            // Righe vuote
            continue;
         } else if (!this.isDetailRow(transaction)) {
            if (isPreviousCompleteTransaction === true)
               transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow(transaction, lastCompleteTransaction);
            transactionsToImport.push(this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if (isPreviousCompleteTransaction === true) {
         transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date (just invert)
      if (transactionsToImport.length > 1 &&
         transactionsToImport[0][0] > transactionsToImport[transactionsToImport.length - 1][0]) {
         transactionsToImport = transactionsToImport.reverse();
      }

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function (transaction) {
      if (transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function (detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if (detailRow[this.colDetail].length > 0) {
         if (totalRow[this.colDebit].length > 0) {
            detailRow[this.colDebit] = detailRow[this.colDetail];
         } else if (totalRow[this.colCredit].length > 0) {
            detailRow[this.colCredit] = detailRow[this.colDetail];
         }
      } else {
         detailRow[this.colDebit] = totalRow[this.colDebit];
         detailRow[this.colCredit] = totalRow[this.colCredit];
      }
   }

   /** Return true if the transaction is a transaction row */
   this.mapTransaction = function (element) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push(""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));

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
   //Load the form with data taken from the array. Create objects
   importUtilities.loadForm(form, columns, rows);
   return form;
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


