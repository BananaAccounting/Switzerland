// @id = ch.banana.filter.import.zkb
// @api = 1.0
// @pubdate = 2020-06-30
// @publisher = Banana.ch SA
// @description = Zürcher Kantonalbank (*.csv)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)

//errors
ID_ERR_EXPERIMENTAL_REQUIRED = "ID_ERR_EXPERIMENTAL_REQUIRED";
ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";

var applicationSupportIsDetail = Banana.compareVersion &&
        (Banana.compareVersion(Banana.application.version, "10.0.12") >= 0)

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string,isTest) {


   if (isTest !== true && !verifyBananaVersion()) {
      Banana.console.debug("test");
      return "@Cancel";
  }

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   // Format 4
   var format4 = new ZKBFormat4();
   if ( format4.match( transactions))
   {
      transactions = format4.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 3
   var format3 = new ZKBFormat3();
   if ( format3.match( transactions))
   {
      transactions = format3.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new ZKBFormat2();
   if ( format2.match( transactions))
   {
      transactions = format2.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 1
   var format1 = new ZKBFormat1();
   if ( format1.match( transactions))
   {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   return "@Error: Unknow format";
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

   if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t';
   } else if (semicolonCount > commaCount)	{
      return ';';
   }

   return ',';
}

/**
 * ZKB Format 4
 * With ZKB-Referenz and Referenznummer columns
 *
 * Example
 * "Datum";"Buchungstext";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF"
 * "03.11.2016";"Lastschrift: Elektrizitaetswerk";"6600-1104-0789-0001";"";"80.00";"";"04.11.2016";"177'923.47"
 * "02.11.2016";"Gutschrift: B S";"7408-1028-0789-0002";"";"";"1'705.00";"02.11.2016";"178'003.47"
 * "31.10.2016";"Gutschrift: Herr J H W";"7413-1031-6964-0005";"";"";"155.00";"31.10.2016";"176'298.47"
 *
 */
function ZKBFormat4() {
   this.colDate     		= 0;
   this.colDescr    		= 1;
   this.colExternalRef     = 2;
   this.colDebit    		= 4;
   this.colCredit   		= 5;
   this.colDateValuta    	= 6;
   this.colBalance      	= 7;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;
      if ( transactions[0].length === (this.colBalance+1))
         return true;
      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i=1;i<transactions.length;i++) // First row contains the header
      {
         var transaction = transactions[i];

         if ( transaction.length === 0) {
            // Righe vuote
            continue;
         } else if ( !this.isDetailRow(transaction)) {
            if ( isPreviousCompleteTransaction === true)
               transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow( transaction, lastCompleteTransaction);
            transactionsToImport.push( this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if ( isPreviousCompleteTransaction === true) {
         transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function(transaction) {
      if ( transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function(detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if ( detailRow[this.colDetail].length > 0) {
         if ( totalRow[this.colDebit].length > 0) {
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
   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push( Banana.Converter.stringToCamelCase( tidyDescr));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], '.'));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], '.'));

      return mappedLine;
   }
}

/**
 * ZKB Format 3
 * A) With ZKB-Referenz and Referenznummer columns
 *
 * Example
 * "Datum";"Buchungstext";"Whg";"Betrag Detail";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF"
 * "13.10.2014";"ONLINEBANK";"";"";"7403-1013-7792-0001";"";"17'042.55";"";"13.10.2014";"7'926.55"
 * "";"Lotz Natalia";"";"";"";"";"";"";"";""
 * "08.10.2014";"Postvergütung";"";"";"8580-1008-0437-0002";"";"";"17'042.55";"08.10.2014";"24'969.10"
 * "";"POSTFINANCE EGAB/PCE";"";"";"";"";"";"";"";""
 * "30.09.2014";"Gebühr Kontoführu";"";"";"X111496933650001";"";"12.00";"";"30.09.2014";"7'926.55"
 * "30.06.2014";"Gebühr Kontoführu";"";"";"X111489051350001";"";"12.00";"";"30.06.2014";"7'938.55"
 * "22.05.2014";"1 Vergütung(en)";"";"";"7460-0522-2026-0001";"";"620.00";"";"22.05.2014";"7'950.55"
 *
 * B) With ZKB-Referenz, Referenznummer and Notes columns
 *
 * Example
 *  Datum;Buchungstext;Whg;Betrag Detail;ZKB-Referenz;Referenznummer;Belastung CHF;Gutschrift CHF;Valuta;Saldo CHF;Zahlungszweck
 *  31.12.2016;Migros;;;IBEP010300109113;;92.75;;31.12.2016;166686.11;
 *  ;Migros M;;;;;;;;;
 *  31.12.2016;Volg ZZZ;;;IBEP010300089040;;34.85;;31.12.2016;166778.86;
 *  ;Volg ZZZ KARTEN-NR. 73615725;;;;;;;;;
 *  31.12.2016;ZKB ZZZ;;;L145268912820001;;400;;31.12.2016;166813.71;
 *  ;KARTEN-NR. ABCD;;;;;;;;;
 *  31.12.2016;Preise Bareinz;;;X111567996700005;;7.05;;31.12.2016;167213.71;
 *  31.12.2016;Geb Kontofuhrung;;;X111567996700004;;12;;31.12.2016;167220.76;
 *  31.12.2016;Lastschrift: Grundversicherungen;;;6607010306680000;;1023.00;;31.12.2016;167232.76;
 *  ;Grundversicherungen;;;;;;;;;Rechnung Nr.: XYCFV Periode 01.12.2016-31.12.2016
 * 
 * C) With ZKB-Referenz, Referenznummer Notes and Details columns
 * 
 * Example
 * "Datum";"Buchungstext";"Whg";"Betrag Detail";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF";"Zahlungszweck";"Details"
 *  "11.02.2022";"Einkauf";"";"";"L123456789";"";"3202.00";"";"10.02.2022";"23708.77";"";""
 *  "10.02.2022";"Belastungen";"";"";"QRA987654321";"";"1000.00";"";"10.02.2022";"26910.77";"";""
 *  "";"Nummer 1";"CHF";"500.00";"";"";"";"";"";"";"";""
 *  "";"Nummer 2";"CHF";"500.00";"";"";"";"";"";"";"";""
 *  "10.02.2022";"Gutschrift Auftraggeber";"";"";" l987654321";"";"";"243.03";"10.02.2022";"27910.77";"l987654321 PAYOUT";"Herr Muller, Zürich"
 *  "10.02.2022";"Gutschrift Auftraggeber";"";"";"l987654321";"";"";"1712.72";"10.02.2022";"27667.74";"l987654321 PAYOUT";"Herr Muller, Zürich"
 *  "10.02.2022";"Einkauf";"";"";"H12345678910";"";"1.00";"";"09.02.2022";"25955.02";"";""
 *  "10.02.2022";"Einkauf";"";"";"H9876543210-1";"";"26.50";"";"09.02.2022";"25956.02";"";""
 */
function ZKBFormat3() {

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;
      if ( transactions[0].length === 10)
         return true;
      if ( transactions[0].length === 11)
         return true;
      if ( transactions[0].length === 12)
         return true;
      return false;
   }

   this.transactionIsNotEmpty = function(obj) {
       if (obj.length > 2 && (obj[0].length > 0 || obj[1].length > 0))
           return true;
       return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var lastCompleteTransactionPrinted = false;
      var isPreviousCompleteTransaction = false;
      var transactionBlockNr = 0;

      /** Remove emtpy rows */
      transactions = transactions.filter(this.transactionIsNotEmpty);

      for (i=1; i<transactions.length; i++) { // First row contains the header

         var transaction = transactions[i];
         if ( transaction.length === 0)
            continue; // Empty row, skip

         var mappedTransaction = this.mapTransaction(transaction);
         mappedTransaction['_RowNr'] = i;

         if ( !this.isDetailRow(mappedTransaction)) {
            transactionBlockNr++;
            mappedTransaction['_BlockNr'] = transactionBlockNr;
            lastCompleteTransactionPrinted = false;
            if ( isPreviousCompleteTransaction === true) {
               // Print total row
               transactionsToImport.push( lastCompleteTransaction);
            }
            lastCompleteTransaction = mappedTransaction;
            isPreviousCompleteTransaction = true;
         } else {
            mappedTransaction['_BlockNr'] = transactionBlockNr;
            if (mappedTransaction['_AmountDetail']) {
               // If there is a detail amount there are more than one details rows
               // Print the the compund row, if not yet printed
               if (applicationSupportIsDetail && !lastCompleteTransactionPrinted) {
                  lastCompleteTransaction['IsDetail'] = 'S';
                  transactionsToImport.push(lastCompleteTransaction);
                  lastCompleteTransactionPrinted = true;
               }

               // Print the detail row as detail row
               this.fillDetailRow( mappedTransaction, lastCompleteTransaction);
               if (applicationSupportIsDetail)
                  mappedTransaction['IsDetail'] = 'D';
               transactionsToImport.push( mappedTransaction);
               isPreviousCompleteTransaction = false;
            } else {
               // If there is NOT a detail amount there is only one detail row

               // Print only the detail row as single row
               this.fillDetailRow( mappedTransaction, lastCompleteTransaction);
               transactionsToImport.push( mappedTransaction);
               isPreviousCompleteTransaction = false;
            }
         }
      }

      if ( isPreviousCompleteTransaction === true) {
         transactionsToImport.push(lastCompleteTransaction);
      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();
      transactionsToImport.sort(this.sortCounterpartTransactions);

      // Add header and return
      var headers = ["Date","DateValue","Doc","ExternalReference","Description","Income","Expenses","ExchangeCurrency","Notes","IsDetail"];
      if (Banana.document && Banana.document.table("Transactions")) {
          // Remove columnd that are not present in the table transaction
         var headersTableTransaction = Banana.document.table("Transactions").columnNames;
         headersTableTransaction += ["Income","Expenses","IsDetail"];
         headers = headers.filter(function(item){return headersTableTransaction.indexOf(item) >= 0;});
      }
      return this.mapTransactionArray(headers, transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function(transaction) {
      if ( transaction["Date"].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function(detailRow, totalRow) {
      // Copy dates
      detailRow["Date"] = totalRow["Date"];
      detailRow["DateValue"] = totalRow["DateValue"];

      // Copy amount from complete row to detail row
      if ( detailRow["_AmountDetail"].length > 0) {
         if ( totalRow["Income"].length > 0) {
            detailRow["Income"] = detailRow["_AmountDetail"];
         } else if (totalRow["Expenses"].length > 0) {
            detailRow["Expenses"] = detailRow["_AmountDetail"];
         }
      } else {
         detailRow["Income"] = totalRow["Income"];
         detailRow["Expenses"] = totalRow["Expenses"];
      }

      if ( detailRow["Description"].length === 0)
         detailRow["Description"] = totalRow["Description"];

      if ( detailRow["ExternalReference"].length === 0)
         detailRow["ExternalReference"] = totalRow["ExternalReference"];
   }

   /** Return true if the transaction is a transaction row */
   this.mapTransaction = function(element) {

      var mappedLine = {};

      mappedLine['Date']=Banana.Converter.toInternalDateFormat(element[0],'dd.mm.yyyy');
      mappedLine['Description']=element[1];
      mappedLine['ExchangeCurrency']=element[2];
      mappedLine['_AmountDetail']=Banana.Converter.toInternalNumberFormat(element[3],".");
      mappedLine['ExternalReference']=element[4];
      mappedLine['_Reference']=element[5];
      mappedLine['Expenses']=Banana.Converter.toInternalNumberFormat(element[6],".");
      mappedLine['Income']=Banana.Converter.toInternalNumberFormat(element[7],".");
      mappedLine['DateValue']=Banana.Converter.toInternalDateFormat(element[8]);
      mappedLine['_Balance']=Banana.Converter.toInternalNumberFormat(element[9],".");
      //append the details only if are there.
      if(element[10] && element[11])
         mappedLine['Notes']=element[10]+", "+element[11];
      else if(!element[10] && element[11])
         mappedLine['Notes']=element[11];
      else if(!element[11] && element[10])
         mappedLine['Notes']=element[10];
      else  
         mappedLine['Notes']="";
      // Clean / Fill fields
      mappedLine["Description"] = mappedLine["Description"].replace(/ {2,}/g, '').trim();
      mappedLine["Description"] = Banana.Converter.stringToCamelCase(mappedLine["Description"]);

      return mappedLine;
   }

   this.mapTransactionArray = function(headers, objArray) {
      var mappedObject = [];

      // Write header
      var headerName = "";
      var rowElement = [];
      for (var h = 0; h < headers.length; h++) {
         headerName = headers[h];
         rowElement.push(headerName);
      }
      mappedObject.push(rowElement);

      // Write objArray
      for (var i = 0; i < objArray.length; i++) {
         var obj = objArray[i];
         rowElement = [];
         for (h = 0; h < headers.length; h++) {
            headerName = headers[h];
            rowElement.push(obj[headerName] ? obj[headerName] : "");
         }
         mappedObject.push(rowElement);
      }

      return mappedObject;
   }

   this.sortCounterpartTransactions = function(a, b) {
      if (a["Date"] > b["Date"]) {
          return 1;
      } else if (a["Date"] < b["Date"]){
        return -1;
      } else {
         if (a["_RowNr"] > b["_RowNr"]) {
             return 1;
         } else if (a["_RowNr"] < b["_RowNr"])
             return -1;
         return 0;
      }
   }

}

/**
 * ZKB Format 2
 * With ZKB-Referenz and Referenznummer columns
 *
 * Example A (some total rows has 0 or more detail rows)
 * "Datum";"Buchungstext";"Betrag Detail";"ZKB-Referenz";"Referenznummer";"Belastung CHF";"Gutschrift CHF";"Valuta";"Saldo CHF"
 * "12.10.2012";"ONLINEBANK Auftrags-Nr. XXXXXXXXXXXXXXXX";;"REFXXXXXXXXXX";;"1'354.95";"";"12.10.2012";"132.59"
 * ;"AUTOMOBIL AG, STRASSE; DORF";"";;;;
 * "12.10.2012";"Devisenverkauf Auftrags-Nr. XXXXXXXXXXXXXXX";;"REFXXXXXXXXXX";;"";"1'500.00";"12.10.2012";"1487.54"
 * ;"AUTOMOBIL AG, STRASSE; DORF";"";;;;
 * "28.09.2012";"Belastung Versand";;"REFXXXXXXXXXX";;"2.55";"";"30.09.2012";"-12.46"
 *
 * Example B (every total rows has at least one detail row)
 * "Datum","Buchungstext","Betrag Detail","ZKB-Referenz","Referenznummer","Belastung CHF","Gutschrift CHF","Valuta","Saldo CHF"
 * "05.11.2009","Mery's",,"REFXXXXXXXXXX",,"98.00","","04.11.2009","1899.60"
 * ,"Mery's KARTEN-NR. XXXXXXX CHF        98.00","",,,,
 * "30.10.2009","ONLINEBANK Auftrags-Nr. XXXX-XXXX-XXXX-XXXX",,"REFXXXXXXXXXX",,"221.95","","30.10.2009","3017.45"
 * ,"SWISSCOM (SCHWEIZ) AG CONTACT CENTER MOBILE 3050 BERN","66.10",,,,
 * ,"SWISSCOM (SCHWEIZ) AG ALTE TIEFENAUSTRASSE 6 3050 BERN","155.85",,,,
 */
function ZKBFormat2() {
   this.colDate     		= 0;
   this.colDescr    		= 1;
   this.colDetail          = 2;
   this.colDebit    		= 5;
   this.colCredit   		= 6;
   this.colDateValuta    	= 7;
   this.colBalance      	= 8;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;
      if ( transactions[0].length === (this.colBalance+1))
         return true;
      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      /** Complete, filter and map rows */
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i=1;i<transactions.length;i++) // First row contains the header
      {
         var transaction = transactions[i];

         if ( transaction.length === 0) {
            // Righe vuote
            continue;
         } else if ( !this.isDetailRow(transaction)) {
            if ( isPreviousCompleteTransaction === true)
               transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow( transaction, lastCompleteTransaction);
            transactionsToImport.push( this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if ( isPreviousCompleteTransaction === true) {
         transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function(transaction) {
      if ( transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function(detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if ( detailRow[this.colDetail].length > 0) {
         if ( totalRow[this.colDebit].length > 0) {
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
   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      mappedLine.push( Banana.Converter.stringToCamelCase( tidyDescr));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], '.'));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], '.'));

      return mappedLine;
   }
}

/**
 * ZKB Format 1
 *
 * Example A:
 * "Datum","Buchungstext","Betrag Detail","Belastung CHF","Gutschrift CHF","Valuta","Saldo CHF"
 * "08.03.2009","Shell Rosenberg",,"6.60","","06.03.2009","2878.26"
 * ,"Shell Rosenberg KARTEN-NR. XXXXXXXX CHF         6.60","",,,,
 * "02.03.2009","Lastschrift Auftrags-Nr. XXXX-XXXX-XXXX-XXXX",,"89.05","","03.03.2009","2884.86"
 * ,"SUNRISE COMMUNICATIONS AG SUNRISE HAGENHOLZSTRASSE 20 / 22 CH - 8050 ZUERICH","",,,,
 * "28.02.2009","Lastschrift Auftrags-Nr. XXXX-XXXX-XXXX-XXXX",,"330.85","","02.03.2009","2973.91"
 * ,"KRANKENKASSE","",,,,
 * "27.02.2009","ONLINEBANK Auftrags-Nr. XXXX-XXXX-XXXX-XXXX",,"1588.10","","27.02.2009","3304.76"
 * ,"AXA LEBENSVERSICHERUNG 1000 LAUSANNE 3","88.10",,,,
 * ,"MR PINCO, STRASSE, DORF","1500.00",,,,
 */
function ZKBFormat1() {
   this.colDate     		= 0;
   this.colDescr    		= 1;
   this.colDetail         = 2;
   this.colDebit    		= 3;
   this.colCredit   		= 4;
   this.colDateValuta    	= 5;
   this.colBalance      	= 6;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;
      if ( transactions[0].length === (this.colBalance+1))
         return true;
      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Complete, filter and map rows
      var lastCompleteTransaction = null;
      var isPreviousCompleteTransaction = false;

      for (i=1;i<transactions.length;i++) // First row contains the header
      {
         var transaction = transactions[i];

         if ( transaction.length === 0) {
            // Righe vuote
            continue;
         } else if ( !this.isDetailRow(transaction)) {
            if ( isPreviousCompleteTransaction === true)
               transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
            lastCompleteTransaction = transaction;
            isPreviousCompleteTransaction = true;
         } else {
            this.fillDetailRow( transaction, lastCompleteTransaction);
            transactionsToImport.push( this.mapTransaction(transaction));
            isPreviousCompleteTransaction = false;
         }
      }
      if ( isPreviousCompleteTransaction === true) {
         transactionsToImport.push( this.mapTransaction(lastCompleteTransaction));
      }

      // Sort rows by date (just invert)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return true if the transaction is a transaction row */
   this.isDetailRow = function(transaction) {
      if ( transaction[this.colDate].length === 0) // Date (first field) is empty
         return true;
      return false;
   }

   /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
   this.fillDetailRow = function(detailRow, totalRow) {
      // Copy dates
      detailRow[this.colDate] = totalRow[this.colDate];
      detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

      // Copy amount from complete row to detail row
      if ( detailRow[this.colDetail].length > 0) {
         if ( totalRow[this.colDebit].length > 0) {
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
   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
      mappedLine.push( Banana.Converter.stringToCamelCase( tidyDescr));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], '.'));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], '.'));

      return mappedLine;
   }
}

function verifyBananaVersion() {
   if (!Banana.document)
       return false;

   var lang = getLang();

   var BAN_VERSION_MIN = "10.0.12";
   var BAN_DEV_VERSION_MIN = "";
   var CURR_VERSION = bananaRequiredVersion(BAN_VERSION_MIN, BAN_DEV_VERSION_MIN);
   var CURR_LICENSE = isBananaAdvanced();

   if (!CURR_VERSION) {
       var msg = getErrorMessage(ID_ERR_VERSION_NOTSUPPORTED, lang);
       msg = msg.replace("%1", BAN_VERSION_MIN);
       Banana.document.addMessage(msg, ID_ERR_VERSION_NOTSUPPORTED);
       return false;
   }
   if (!CURR_LICENSE) {
       var msg = getErrorMessage(ID_ERR_LICENSE_NOTVALID, lang);
       Banana.document.addMessage(msg, ID_ERR_LICENSE_NOTVALID);
       return false;
   }
   return true;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
   /**
    * Check Banana version
    */
   if (expmVersion) {
       requiredVersion = requiredVersion + "." + expmVersion;
   }
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
       return true;
   }
   return false;
}

function isBananaAdvanced() {
   // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
   // to check if all application functionalities are permitted
   // the version Advanced returns isWithinMaxRowLimits always false
   // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.12") >= 0) {
       var license = Banana.application.license;
       if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
           return true;
       }
   }

   return false;
}

function getErrorMessage(errorId, lang) {
   if (!lang)
       lang = 'en';
   switch (errorId) {
       case ID_ERR_EXPERIMENTAL_REQUIRED:
           return "The Experimental version is required";
       case ID_ERR_LICENSE_NOTVALID:
           return "This extension requires Banana Accounting+ Advanced";
       case ID_ERR_VERSION_NOTSUPPORTED:
           if (lang == 'it')
               return "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
           else if (lang == 'fr')
               return "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
           else if (lang == 'de')
               return "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";
           else
               return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
   }
   return '';
}

function getLang() {
   var lang = 'en';
   if (Banana.document)
       lang = Banana.document.locale;
   else if (Banana.application.locale)
       lang = Banana.application.locale;
   if (lang.length > 2)
       lang = lang.substr(0, 2);
   return lang;
}
