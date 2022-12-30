// @id = ch.banana.switzerland.import.bancastato
// @api = 1.0
// @pubdate = 2020-06-30
// @publisher = Banana.ch SA
// @description = BancaStato - Import bank account statement (*.csv)
// @description.it = BancaStato - Importa movimenti estratto conto bancario (*.csv)
// @description.en = BancaStato - Import bank account statement (*.csv)
// @description.de = BancaStato - Kontoauszug importieren (*.csv)
// @description.fr = BancaStato - Importer un relevé de compte bancaire (*.csv)
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
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   // Format 4
   var format4 = new BancaStatoFormat4();
   if (format4.match(transactions))
   {
      transactions = format4.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 3
   var format3 = new BancaStatoFormat3();
   if ( format3.match( transactions))
   {
      transactions = format3.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new BancaStatoFormat2();
   if ( format2.match( transactions))
   {
      transactions = format2.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 1
   var format1 = new BancaStatoFormat1();
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
 * BancaStatoFormat4 Format 4
 * 
 * Data;Data valuta;Numero di ordine;"Tipo di ordine testo di contabilizzazione";Addebiti (CHF);Accrediti (CHF);Saldo (CHF)
 * 11.10.2022;11.10.2022;123456789;"Descrizione Pagamento";;208.85;60’908.02
 * 10.10.2022;10.10.2022;123456789;"Descrizione Pagamento in entrata";1’710.30;;60’699.17
 * 07.10.2022;07.10.2022;123456789;"Descrizione Pagamento
 * Data operazione: 07.10.2022, importo totale originale: CHF 439.20, spese totali a carico del cliente: CHF 0.00, importo accreditato: CHF 439.20";;439.20;62’409.47
 * 06.10.2022;06.10.2022;123456789;"Pagamento collettivo credito
 * Data operazione: 06.10.2022, importo totale originale: CHF 293.00, spese totali a carico del cliente: CHF 0.00, importo accreditato: CHF 293.00";;293.00;61’970.27
 * 05.10.2022;05.10.2022;123456789;"Descrizione Pagamento";;340.30;61’677.27
 * 04.10.2022;04.10.2022;234567890;"Descrizione Pagamento Data operazione: 04.10.2022, importo totale originale: CHF 1'168.25, spese totali a carico del cliente: CHF 0.00, importo accreditato: CHF 1'168.25";;1’168.25;61’336.97
 * 04.10.2022;04.10.2022;345678901;"Descrizione Pagamento in entrata";80.00;;60’168.72
 * 03.10.2022;03.10.2022;456789012;"Descrizione Pagamento";;340.30;60’248.72
 * 
 */
 function BancaStatoFormat4() {

   this.colDate        = 0;
   this.colDateValuta  = 1;
   this.conNrOrdine    = 2;
   this.colDescr       = 3;
   this.colDebit       = 4;
   this.colCredit      = 5;
   this.colBalance     = 6;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;

      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];

         var formatMatched = false;

         if ( transaction.length  === (this.colBalance+1)  )
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];
         if ( transaction.length  < (this.colBalance+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) &&   transaction[this.colDateValuta].match(/[0-9\.]+/g))
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date","DateValue","Doc","ExternalReference","Description","Income","Expenses"]];
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

      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDate],"dd.mm.yyyy"));
      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDateValuta],"dd.mm.yyyy"));
      mappedLine.push( ""); // Doc is empty for now
      mappedLine.push( element[this.conNrOrdine]);
      mappedLine.push( element[this.colDescr]);
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], "."));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], "."));


      return mappedLine;
   }
}

/**
 * BancaStatoFormat3 Format 3
 * Example: bancastato.#20141209
 * Data;Data valuta;Rif.Esterno;Tipo;Testo di contabilizzazione;Addebiti;Accrediti;Saldo
 * Totale movimenti;;;;;227792.99;240591.43;
 * Saldo finale;;;;;;;50218.09
 * 30.05.2018;30.05.2018;133992566;Credito;Pagamento in entrata: CPPP Condominio PALOMBELLA;;2000;50218.09
 * 30.05.2018;31.05.2018;133965294;Apertura prestito;"Apertura prestito: Anticipo fisso (09)  CHF, 1.35%, 31.05.2018-30.06.2018";;135000;48218.09
 * 30.05.2018;30.05.2018;133941285;Credito;Pagamento in entrata: Lavori d'intonaco;;25000;-86781.91
 * 30.05.2018;30.05.2018;133941284;Credito;Pagamento in entrata: Lavori d'intonaco;;6000;-111781.91
 * 30.05.2018;30.05.2018;133941280;Credito;Pagamento in entrata: Lavori d'intonaco;;3500;-117781.91
 * 30.05.2018;31.05.2018;133515274;Account Management Fee - Debit Order;Account Management Fee - Debit Order: Conto BASE corrente CHF;8;;-121281.91
 * 30.05.2018;29.05.2018;133922368;Tax: Cantonal Tax;Tax: Cantonal Tax: CHF;10;;-121273.91
 * 29.05.2018;29.05.2018;133921234;Mortgage Acc Mngt Fee - Debit Order;Spese: spese gestione conto ipoteca;5;;-121263.91
 * 29.05.2018;31.05.2018;133921104;Chiusura a scadenza;"Chiusura a scadenza: Anticipo fisso (09)  CHF, 1.35%, 31.05.2018-31.05.2018";135156.94;;-121258.91
 */

function BancaStatoFormat3() {

   this.colDate        = 0;
   this.colDateValuta  = 1;
   this.colExtRef      = 2;
   this.colDescr       = 4;
   this.colDebit       = 6;
   this.colCredit      = 5;
   this.colBalance     = 7;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length <= 1)
          return false;
      if ( transactions[0].length !== (this.colBalance+1))
          return false;
      for (var row = 0; row < transactions.length; row++) {
         if (transactions[row][this.colDate].match(/[0-9\.]+/g)) {
            if (!transactions[row][this.colDateValuta].match(/[0-9\.]+/g))
               return false;
         }
      }
      return true;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];
         if ( transaction.length  < (this.colBalance+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) &&   transaction[this.colDateValuta].match(/[0-9\.]+/g))
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date","DateValue","Doc","ExternalReference","Description","Income","Expenses"]];
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

      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      mappedLine.push( element[this.colExtRef]);
      mappedLine.push( element[this.colDescr]);
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], "."));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], "."));

      return mappedLine;
   }
}

/**
 * BancaStatoFormat2 Format 2
 * Example: bancastato.#20141209
 * Data;Data valuta;Rif.Esterno;Tipo;Testo di contabilizzazione;Importo pagamento collettivo;Addebiti;Accrediti;Saldo
 * Totale movimenti;;;;;;832331.24;854698.98;
 * Saldo finale;;;;;;;;-366054.75
 * 17.11.2017;17.11.2017;108368047;Pagamento;"Pagamento a favore di: AIL
 * AIL
 * VIA DELLA POSTA
 * 6900 LUGANO";;11915.6;;-366054.75
 * 16.11.2017;16.11.2017;111645032;Pagamento;"Pagamento a favore di: SWISS LIFE SA 8022 ZURIGO
 * SWISS LIFE SA
 * 8022 ZURIGO";;5000;;-354139.15
 * 16.11.2017;16.11.2017;111734964;Versamento postale;Pagamento in entrata: Plastifil SA;;;6492.14;-349139.15
 * 15.11.2017;15.11.2017;111678259;Credito;Pagamento in entrata: SECURITON AG;;;771.7;-355631.29
 * 15.11.2017;15.11.2017;107874714;Pagamento;"PAGAMENTO AVS
 * CASSA CANTONALE DI COMPENSAZIONE
 * AVS/AI/IPG
 * VIA GHIRINGHELLI 15A
 * 6501 BELLINZONA";;4148.25;;-356402.99
 * 15.11.2017;15.11.2017;105399573;Pagamento;"Pagamento a favore di: AIL
 * AIL
 * VIA DELLA POSTA
 * 6900 LUGANO";;8952.2;;-352254.74
 */

function BancaStatoFormat2() {

   this.colDate        = 0;
   this.colDateValuta  = 1;
   this.colExtRef      = 2;
   this.colDescr       = 4;
   this.colDebit       = 7;
   this.colCredit      = 6;
   this.colBalance     = 8;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length <= 1)
          return false;
      if ( transactions[0].length !== (this.colBalance+1))
          return false;
      return true;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];
         if ( transaction.length  < (this.colBalance+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) &&   transaction[this.colDateValuta].match(/[0-9\.]+/g))
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date","DateValue","Doc","ExternalReference","Description","Income","Expenses"]];
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

      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat( element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      mappedLine.push( element[this.colExtRef]);
      mappedLine.push( element[this.colDescr]);
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colDebit], "."));
      mappedLine.push( Banana.Converter.toInternalNumberFormat( element[this.colCredit], "."));

      return mappedLine;
   }
}

/**
 * BancaStatoFormat1 Format 1
 * Example: bancastato.#20141209
 * Data,Descrizione movimento,Rif. esterno,Testo contabilizzazione,Data valuta,Quantità,Saldo,Divisa
 * 09.12.14,Credito,40508997,Pagamento in entrata: AAA AAA,10.12.14,26'500.00,187'308.94,CHF
 * 05.12.14,Credito,40332639,Pagamento in entrata: BBB BBB,05.12.14,200.00,160'808.94,CHF
 * 03.12.14,Versamento postale,40239155,Pagamento in entrata: Secondo cedola postale,03.12.14,3'996.45,160'608.94,CHF
 * 02.12.14,Versamento postale,40176096,Pagamento in entrata: Secondo cedola postale,02.12.14,1'996.45,156'612.49,CHF
 */

function BancaStatoFormat1() {

   this.colDate        = 0;
   this.colDateValuta  = 4;
   this.colExtRef      = 2;
   this.colDescr       = 3;
   this.colAmount      = 5;
   this.colBalance     = 6;
   this.colDivisa      = 7;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length <= 1)
         return false;

      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];

         var formatMatched = false;

         if ( transaction.length  === (this.colDivisa+1)  )
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 8)
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length === 8)
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
         if ( transaction.length  < (this.colBalance+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) &&   transaction[this.colDateValuta].match(/[0-9\.]+/g))
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date
      transactionsToImport = this.sort(transactionsToImport);

      // Add header and return
      var header = [["Date","DateValue","Doc","ExternalReference","Description","Income","Expenses"]];
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
      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now
      mappedLine.push( element[this.colExtRef]);
      mappedLine.push( element[this.colDescr]);
      var amount = element[this.colAmount];
      if ( amount.length > 0) {
         if ( amount[0] === "-") {
            mappedLine.push( "");
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push( Banana.Converter.toInternalNumberFormat( amount, "."));
         } else {
            mappedLine.push( Banana.Converter.toInternalNumberFormat( amount, "."));
            mappedLine.push( "");
         }
      }

      return mappedLine;
   }
}
