// @id = ch.banana.switzerland.import.ubs
// @api = 1.0
// @pubdate = 2019-09-06
// @publisher = Banana.ch SA
// @description = UBS - Import bank account statement in CSV format
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
function exec(inData, isTest) {
  if (!inData) return "";

  var importUtilities = new ImportUtilities(Banana.document);

  if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
    return "";

  convertionParam = defineConversionParam(inData);
  //Add the header if present 
  if (convertionParam.header) {
      inData = convertionParam.header + inData;
  }
  let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

  // Format Credit Card
  var formatCc1Ubs = new UBSFormatCc1();
  if (formatCc1Ubs.match(transactions)) {
    transactions = formatCc1Ubs.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 1
  var format1Ubs = new UBSFormat1();
  if (format1Ubs.match(transactions)) {
    transactions = format1Ubs.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 2
  var format2Ubs = new UBSFormat2();
  if (format2Ubs.match(transactions)) {
    let intermediaryData = format2Ubs.convertCsvToIntermediaryData(transactions,convertionParam);
    intermediaryData = format2Ubs.sortData(intermediaryData, convertionParam);
    format2Ubs.postProcessIntermediaryData(intermediaryData);
    return format2Ubs.convertToBananaFormat(intermediaryData);
  }

  // Format is unknow, return an error
  return "@Error: Unknow format";
}

/**
 * UBS Format 1
 *
 * Valuation date;Banking relationship;Portfolio;Product;IBAN;Ccy.;Date from;Date to;Description;Trade date;Booking date;Value date;Description 1;Description 2;Description 3;Transaction no.;Exchange rate in the original amount in settlement currency;Individual amount;Debit;Credit;Balance
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;e-banking Order;BWS - CHENEVAL, BWS GERMANLINGUA,  DE DE DE 80331     MUECHEN,  INVOICE : M25252,  STD: ALICE CHENEVAL;;ZD81181TI0690091;;;3'416.82;;206'149.34
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;Amount paid;;;ZD81181TI0690091;1.113334;3069;;;
 */
function UBSFormat1() {
  // Index of columns in csv file
  this.colCount = 21;

  this.colCurrency = 5;
  this.colDate = 10;
  this.colDateValue = 11;
  this.colDescr1 = 12;
  this.colDescr2 = 13;
  this.colDescr3 = 14;
  this.colDescr4 = 15;
  this.colExchRate = -5;
  this.colDetails = -4;
  this.colDebit = -3;
  this.colCredit = -2;
  this.colBalance = -1;

  /** Return true if the transactions match this format */
  this.match = function (transactions) {
    if (transactions.length === 0) return false;

    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      /* array should have all columns */
      if (transaction.length >= this.colCount) formatMatched = true;
      else formatMatched = false;

      if (formatMatched && transaction[this.colDate] &&
        transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      )
        formatMatched = true;
      else formatMatched = false;

      if (
        formatMatched && transaction[this.colDateValue] &&
        transaction[this.colDateValue].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      )
        formatMatched = true;
      else formatMatched = false;

      if (formatMatched) return true;
    }

    return false;
  };

  /** Convert the transaction to the format to be imported */
  this.convert = function (transactions) {
    this.colCount =
      transactions.length > 1 ? transactions[0].length : this.colCount;

    transactions = this.convertTransactions(transactions);

    if (transactions.length > 1) {
      //Sort by date
      if (transactions[0][0] > transactions[transactions.length - 1][0]) {
        //Sort transactions
        transactions = transactions.reverse();
      }
    }

    var header = [
      [
        "Date",
        "DateValue",
        "Doc",
        "Description",
        "Income",
        "Expenses",
        "IsDetail",
      ],
    ];
    return header.concat(transactions);
  };

  /** Convert the transaction to the format to be imported */
  this.convertTransactions = function (transactions) {
    var transactionsToImport = [];

    /** Complete, filter and map rows */
    var lastCompleteTransaction = null;

    for (
      var i = 0;
      i < transactions.length;
      i++ // First row contains the header
    ) {
      var mappedTransaction = [];
      var transaction = transactions[i];

      if (
        transaction.length <= this.colDate ||
        !transaction[this.colDate].match(/[0-9\.]+/g)
      )
        continue;

      if (
        transaction.length >= this.colCount + this.colBalance &&
        (transaction[this.colCount + this.colDebit].length > 0 ||
          transaction[this.colCount + this.colCredit].length > 0 ||
          transaction[this.colCount + this.colBalance].length > 0)
      ) {
        // Is a complete row
        if (lastCompleteTransaction) {
          mappedTransaction = this.mapTransaction(lastCompleteTransaction);
          mappedTransaction.push("");
          transactionsToImport.push(mappedTransaction);
          lastCompleteTransaction = null;
        }
        lastCompleteTransaction = transaction;
      } else if (
        transaction.length >= this.colCount + this.colDetails &&
        transaction[this.colCount + this.colDetails].length > 0
      ) {
        // Is a detail row
        if (
          transaction[this.colCount + this.colExchRate].match(/[0-9]+\.[0-9]+/g)
        ) {
          // Is a multicurrency detail row
          if (lastCompleteTransaction) {
            mappedTransaction = this.mapTransaction(lastCompleteTransaction);
            mappedTransaction.push("");
            transactionsToImport.push(mappedTransaction);
            lastCompleteTransaction = null;
          }
        } else {
          // Is a normal detail row
          if (
            transaction[this.colDescr1] ===
              "Cashpayment charges deducted by post" &&
            lastCompleteTransaction &&
            lastCompleteTransaction[this.colDescr1] ===
              "Incomings UBS BESR Quick"
          ) {
            // Post charges are contabilised at the end of the period, skip this row
            if (lastCompleteTransaction !== null) {
              mappedTransaction = this.mapTransaction(lastCompleteTransaction);
              mappedTransaction.push("");
              transactionsToImport.push(mappedTransaction);
              lastCompleteTransaction = null;
            }
          } else {
            if (lastCompleteTransaction !== null) {
              mappedTransaction = this.mapTransaction(lastCompleteTransaction);
              mappedTransaction.push("S");
              transactionsToImport.push(mappedTransaction);
              lastCompleteTransaction = null;
            }
            mappedTransaction = this.mapDetailTransaction(transaction);
            mappedTransaction.push("D");
            transactionsToImport.push(mappedTransaction);
          }
        }
      }
    }

    if (lastCompleteTransaction !== null) {
      transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
    }

    return transactionsToImport;
  };

  this.mapTransaction = function (element) {
    var mappedLine = [];

    if (
      element[this.colDate] === null ||
      element[this.colDescr1] === null ||
      element[this.colDescr2] === null ||
      element[this.colDescr3] === null ||
      element[this.colDescr4] === null ||
      element[element.length + this.colCredit] === null ||
      element[element.length + this.colDebit] === null
    ) {
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push("Error importing data");
      mappedLine.push("");
      mappedLine.push("");
      return mappedLine;
    }

    mappedLine.push(
      Banana.Converter.toInternalDateFormat(element[this.colDate], "dd.mm.yyyy")
    );
    mappedLine.push(
      Banana.Converter.toInternalDateFormat(
        element[this.colDateValue],
        "dd.mm.yyyy"
      )
    );
    mappedLine.push("");
    mappedLine.push(this.mapDescription(element));
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(
        element[element.length + this.colCredit],
        "."
      )
    );
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(
        element[element.length + this.colDebit],
        "."
      )
    );

    return mappedLine;
  };

  this.mapDetailTransaction = function (element) {
    var mappedLine = [];

    if (
      element[this.colDate] === null ||
      element[this.colDescr1] === null ||
      element[this.colDescr2] === null ||
      element[this.colDescr3] === null ||
      element[this.colDescr4] === null ||
      element[element.length + this.colCredit] === null ||
      element[element.length + this.colDebit] === null
    ) {
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push("Error importing data");
      mappedLine.push("");
      mappedLine.push("");
      return mappedLine;
    }

    mappedLine.push(
      Banana.Converter.toInternalDateFormat(element[this.colDate], "dd.mm.yyyy")
    );
    mappedLine.push(
      Banana.Converter.toInternalDateFormat(
        element[this.colDateValue],
        "dd.mm.yyyy"
      )
    );
    mappedLine.push("");
    mappedLine.push(this.mapDescription(element));
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(
        element[this.colCount + this.colDetails].replace(",", ""),
        "."
      )
    );
    mappedLine.push("");

    return mappedLine;
  };

  /**
   * Return the descrition for the requested line.
   */
  this.mapDescription = function (line) {
    var descr = line[this.colDescr1];
    if (line[this.colDescr2].length) descr += ", " + line[this.colDescr2];
    if (line[this.colDescr3].length) descr += ", " + line[this.colDescr3];

    descr = Banana.Converter.stringToCamelCase(descr);
    descr = descr.replace(/"/g, '\\"');
    return '"' + descr + '"';
  };
}

/**
 * UBS Format 2
 * 
 * This new format (09.2022) use the import utilities class.
 * This format has no detail rows.
 *
 * Numero di conto:;0234 00103914.40;
 * IBAN:;CH29 0023 4234 1039 1440 G;
 * Dal:;2022-09-15;
 * Al:;2022-09-19;
 * Saldo iniziale:;1719.34;
 * Saldo finale:;631.07;
 * Valutazione in:;CHF;
 * Numero di transazioni in questo periodo:;13;
 *
 * Data dell'operazione;Ora dell'operazione;Data di registrazione;Data di valuta;Moneta;Importo della transazione;Addebito/Accredito;Saldo;N. di transazione;Descrizione1;Descrizione2;Descrizione3;Note a piè di pagina;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-150.00;Addebito;600;123456TI1234567;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-92.00;Addebito;692;2345678TI2345678;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-10.00;Addebito;702;3456789TI3456789;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-40.00;Addebito;742;4567890TI4567890;"Versamento";"Ordine di pagamento via e-banking";;;
 *
 */
var UBSFormat2 = class UBSFormat2 extends ImportUtilities {
  // Index of columns in csv file

  constructor(banDocument) {
    super(banDocument);
    this.colCount = 12;

    this.colDateOperation = 0;
    this.colTime = 1;
    this.colDateRec = 2;
    this.colDateValue = 3;
    this.colCurrency = 4;
    this.colAmount = 5;
    this.colOpType = 6;
    this.colBalance = 7;
    this.colTransNr = 8;
    this.colDescr1 = 9;
    this.colDescr2 = 10;
    this.colDescr3 = 11;
    this.colNotes = 12;
  }



  /** Return true if the transactions match this format */
  match (transactions) {
    if (transactions.length === 0) return false;

    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      /* array should have all columns */
      if (transaction.length >= this.colCount) formatMatched = true;
      else formatMatched = false;

      if (
        formatMatched &&
        transaction[this.colDateOperation] &&
        transaction[this.colDateOperation].match(/^[0-9]+\-[0-9]+\-[0-9]+$/)
      )
        formatMatched = true;
      else formatMatched = false;

      if (
        formatMatched &&
        transaction[this.colDateValue] &&
        transaction[this.colDateValue].match(/^[0-9]+\-[0-9]+\-[0-9]+$/)
      )
        formatMatched = true;
      else formatMatched = false;

      if (formatMatched) return true;
    }

    return false;
  }

  /** Convert the transaction to the format to be imported */
  convertCsvToIntermediaryData (transactions, convertionParam) {
    var form = [];
    var intermediaryData = [];

  /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
    We suppose the data will always begin right away after the header line */
    convertionParam.headerLineStart = 9;
    convertionParam.dataLineStart = 10;

    //Variables used to save the columns titles and the rows values
    let columns = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
    let rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
    let lang = this.getLanguage(columns);

    //Load the form with data taken from the array. Create objects
    this.loadForm(form, columns, rows);

    //For each row of the form, we call the rowConverter() function and we save the converted data
    for (var i = 0; i < form.length; i++) {
        let convertedRow = {};
        switch(lang){
          case "it":
          convertedRow = this.translateHeaderIt(form[i], convertedRow);
          intermediaryData.push(convertedRow);
          break;
          case "de":
            convertedRow = this.translateHeaderDe(form[i], convertedRow);
            intermediaryData.push(convertedRow);
            break;
          case "fr":
            convertedRow = this.translateHeaderFr(form[i], convertedRow);
            intermediaryData.push(convertedRow);
            break;
          case "en":
            convertedRow = this.translateHeaderEn(form[i], convertedRow);
            intermediaryData.push(convertedRow);
            break;
          default:
            Banana.console.info("csv language not recognised");
        }
    }

    return intermediaryData;
  }

  formatColumnsNames(columnsTemps) {
    let columns = [];
    for (var i = 0; i <= columnsTemps.length; i++) {
        var colName = columnsTemps[i];
        /**
         * Actually we use Started Date as the Completed Date is not Always present
         * Could be possible to check the state of the transaction using the field "State" to 
         * define wich date to use, as far we know a transaction can have two main states: COMPLETED 
         * and PENDING.
         */
        switch (colName) {
            case "Started Date":
                colName = "Date";
                break;
        }
        columns.push(colName);
    }

    return columns;
  }

  getLanguage(columns) {
   /**
    * Check the csv header fields to define the language.
    * The file is available in the following languages: IT,FR,DE,EN.
    */
      var lang = "";
      if(columns){
        if (columns[this.colDateOperation] === "Data dell'operazione" &&
        columns[this.colTime] === "Ora dell'operazione" && columns[this.colDateRec] === "Data di registrazione") {
          lang = "it";
          return lang;
        }
        if (columns[this.colDateOperation] === "Abschlussdatum" &&
        columns[this.colTime] === "Abschlusszeit" && columns[this.colDateRec] === "Buchungsdatum") {
          lang = "de";
          return lang;
        }

        if (columns[this.colDateOperation] === "Date de transaction" &&
        columns[this.colTime] === "Heure de transaction" && columns[this.colDateRec] === "Date de comptabilisation") {
          lang = "fr";
          return lang;
        }

        //Trade date;Trade time;Booking date
        if (columns[this.colDateOperation] === "Trade date" &&
        columns[this.colTime] === "Trade time" && columns[this.colDateRec] === "Booking date") {
          lang = "en";
          return lang;
        }
      }
      return lang;
  }

  translateHeaderIt(inputRow, convertedRow) {
    //get the Banana Columns Name from csv file columns name
    let descText = "";
    let dateText = "";
    let dateValueText = "";

    dateText = inputRow["Data dell'operazione"].substring(0, 10);
    dateValueText = inputRow["Data di valuta"].substring(0, 10);

    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd");
    convertedRow['DateValue'] = Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd");
    descText = inputRow["Descrizione1"] + " " + inputRow["Descrizione2"] + " "+inputRow["Descrizione3"];
    convertedRow["Description"] = descText;
    convertedRow["ExternalReference"] = inputRow["N. di transazione"];
    //define if the amount is an income or an expenses.
    convertedRow["Expenses"] = "";
    convertedRow["Income"] = "";

    if (inputRow["Importo della transazione"].indexOf("-") == -1) {
        convertedRow["Income"] = inputRow["Importo della transazione"];
    } else {
        convertedRow["Expenses"] = inputRow["Importo della transazione"];
    }

    return convertedRow;
  }

  translateHeaderDe(inputRow, convertedRow) {
    //get the Banana Columns Name from csv file columns name
    let descText = "";
    let dateText = "";
    let dateValueText = "";

    dateText = inputRow["Abschlussdatum"].substring(0, 10);
    dateValueText = inputRow["Valutadatum"].substring(0, 10);

    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd");
    convertedRow['DateValue'] = Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd");

    descText = inputRow["Beschreibung1"] + " " + inputRow["Beschreibung2"] + " "+inputRow["Beschreibung3"];
    convertedRow["Description"] = descText;
    convertedRow["ExternalReference"] = inputRow["Transaktions-Nr."];
    //define if the amount is an income or an expenses.
    convertedRow["Expenses"] = "";
    convertedRow["Income"] = "";

    if (inputRow["Transaktionsbetrag"].indexOf("-") == -1) {
        convertedRow["Income"] = inputRow["Transaktionsbetrag"];
    } else {
        convertedRow["Expenses"] = inputRow["Transaktionsbetrag"];
    }

    return convertedRow;
  }

  translateHeaderFr(inputRow, convertedRow) {
    //get the Banana Columns Name from csv file columns name
    let descText = "";
    let dateText = "";
    let dateValueText = "";

    dateText = inputRow["Date de transaction"].substring(0, 10);
    dateValueText = inputRow["Date de valeur"].substring(0, 10);

    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd");
    convertedRow['DateValue'] = Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd");
    descText = inputRow["Description1"] + " " + inputRow["Description2"] + " "+inputRow["Description3"];
    convertedRow["Description"] = descText;
    convertedRow["ExternalReference"] = inputRow["N° de transaction"];
    //define if the amount is an income or an expenses.
    convertedRow["Expenses"] = "";
    convertedRow["Income"] = "";

    if (inputRow["Montant de la transaction"].indexOf("-") == -1) {
        convertedRow["Income"] = inputRow["Montant de la transaction"];
    } else {
        convertedRow["Expenses"] = inputRow["Montant de la transaction"];
    }

    return convertedRow;
  }

  translateHeaderEn(inputRow, convertedRow) {
    //get the Banana Columns Name from csv file columns name
    let descText = "";
    let dateText = "";
    let dateValueText = "";


    dateText = inputRow["Trade date"].substring(0, 10);
    dateValueText = inputRow["Value date"].substring(0, 10);

    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd");
    convertedRow['DateValue'] = Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd");
    descText = inputRow["Description1"] + " " + inputRow["Description2"] + " "+inputRow["Description3"];
    convertedRow["Description"] = descText;
    convertedRow["ExternalReference"] = inputRow["Transaction no."];
    //define if the amount is an income or an expenses.
    convertedRow["Expenses"] = "";
    convertedRow["Income"] = "";

    if (inputRow["Transaction amount"].indexOf("-") == -1) {
        convertedRow["Income"] = inputRow["Transaction amount"];
    } else {
        convertedRow["Expenses"] = inputRow["Transaction amount"];
    }

    return convertedRow;
  }

  //The purpose of this function is to let the user specify how to convert the categories
  postProcessIntermediaryData(intermediaryData) {
    /** INSERT HERE THE LIST OF ACCOUNTS NAME AND THE CONVERSION NUMBER 
     *   If the content of "Account" is the same of the text 
     *   it will be replaced by the account number given */
    //Accounts conversion
    var accounts = {
        //...
    }

    /** INSERT HERE THE LIST OF CATEGORIES NAME AND THE CONVERSION NUMBER 
     *   If the content of "ContraAccount" is the same of the text 
     *   it will be replaced by the account number given */

    //Categories conversion
    var categories = {
        //...
    }

    //Apply the conversions
    for (var i = 0; i < intermediaryData.length; i++) {
        var convertedData = intermediaryData[i];

        //Invert values
        if (convertedData["Expenses"]) {
            convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
        }
    }
  }
}

/**
 * UBS Credit Card Format 1
 *
 * sep=;
 * Numéro de compte;Numéro de carte;Titulaire de compte/carte;Date d'achat;Texte comptable;Secteur;Montant;Monnaie originale;Cours;Monnaie;Débit;Crédit;Ecriture
 * ZZZZ ZZZZ ZZZZ;;SIMON JEAN;19.10.2017;Report de solde;;;;;CHF;;0.00;
 * ZZZZ ZZZZ ZZZZ;XXXX XXXX XXXX XXXX;JEAN SIMON;16.11.2017;Cafe de Paris Geneve CHE;Restaurants, Bar;119.40;CHF;;;;;
 * ZZZZ ZZZZ ZZZZ;XXXX XXXX XXXX XXXX;JEAN SIMON;13.11.2017;www.banana.ch            LUGANO       CHE;Magasin d ordinateurs;189.00;CHF;;CHF;189.00;;15.11.2017
 */
function UBSFormatCc1() {
  // Index of columns in csv file
  this.colCount = 13;

  this.colCardNo = 2;
  this.colDateDoc = 3;
  this.colDescr = 4;
  this.colCurrency = -4;
  this.colDebit = -3;
  this.colCredit = -2;
  this.colDate = -1;

  /** Return true if the transactions match this format */
  this.match = function (transactions) {
    if (transactions.length === 0) return false;

    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      /* array should have all columns */
      if (transaction.length >= this.colCount) formatMatched = true;
      else formatMatched = false;

      if (
        formatMatched &&
        transaction[this.colCount + this.colDate] &&
        transaction[this.colCount + this.colDate].match(
          /^[0-9]+\.[0-9]+\.[0-9]+$/
        )
      )
        formatMatched = true;
      else formatMatched = false;

      if (formatMatched) return true;
    }

    return false;
  };

  /** Convert the transaction to the format to be imported */
  this.convert = function (transactions) {
    this.colCount =
      transactions.length > 1 ? transactions[0].length : this.colCount;

    transactions = this.convertTransactions(transactions);

    if (transactions.length > 1) {
      //Sort by date
      if (transactions[0][0] > transactions[transactions.length - 1][0]) {
        //Sort transactions
        transactions = transactions.reverse();
      }
    }

    var header = [
      ["Date", "DateDocument", "Doc", "Description", "Income", "Expenses"],
    ];
    return header.concat(transactions);
  };

  /** Convert the transaction to the format to be imported */
  this.convertTransactions = function (transactions) {
    var transactionsToImport = [];

    /** Complete, filter and map rows */
    var lastCompleteTransaction = null;

    for (
      var i = 0;
      i < transactions.length;
      i++ // First row contains the header
    ) {
      var transaction = transactions[i];
      if (
        transaction.length <= this.colCount + this.colDate ||
        !transaction[transaction.length + this.colDate].match(
          /^[0-9]+\.[0-9]+\.[0-9]+$/
        )
      )
        continue;
      var mappedTransaction = this.mapTransaction(transaction);
      transactionsToImport.push(mappedTransaction);
    }

    return transactionsToImport;
  };

  this.mapTransaction = function (element) {
    var mappedLine = [];

    if (
      element[element.length + this.colDate] === null ||
      element[this.colDescr] === null ||
      element[element.length + this.colCredit] === null ||
      element[element.length + this.colDebit] === null
    ) {
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push("Error importing data");
      mappedLine.push("");
      mappedLine.push("");
      return mappedLine;
    }

    var descr;

    mappedLine.push(
      Banana.Converter.toInternalDateFormat(
        element[element.length + this.colDate],
        "dd.mm.yyyy"
      )
    );
    mappedLine.push("");
    mappedLine.push("");
    mappedLine.push(this.convertDescription(element[this.colDescr]));
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(
        element[element.length + this.colCredit],
        "."
      )
    );
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(
        element[element.length + this.colDebit],
        "."
      )
    );

    return mappedLine;
  };

  this.convertDescription = function (text) {
    var convertedDescr = text.replace(/  +/g, " ");
    convertedDescr = convertedDescr.replace(/"/g, '\\"');
    return '"' + convertedDescr + '"'; // Banana.Converter.stringToCamelCase(convertedDescr);
  };
}

function defineConversionParam(inData) {

  var csvData = Banana.Converter.csvToArray(inData);
  var header = String(csvData[0]);
  var convertionParam = {};
  /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
  convertionParam.format = "csv"; // available formats are "csv", "html"
  //get text delimiter
  convertionParam.textDelim = '\"';
  // get separator
  convertionParam.separator = ';';

  /** SPECIFY THE COLUMN TO USE FOR SORTING
  If sortColums is empty the data are not sorted */
  convertionParam.sortColums = ["Date", "Description"];
  convertionParam.sortDescending = false;

  return convertionParam;
}
