// Copyright [2017] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = ch.banana.switzerland.import.corner.bank.transactions
// @api = 1.0
// @pubdate = 2017-06-14
// @publisher = Banana.ch SA
// @description = Corner Bank - Import account statement .csv (Banana+ Advanced)
// @description.de = Corner Bank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Corner Bank - Import account statement .csv (Banana+ Advanced)
// @description.fr = Corner Bank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Corner Bank - Importa movimenti .csv (Banana+ Advanced)
// @task = import.transactions
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

//Main function
function exec(inData, isTest) {
  var importUtilities = new ImportUtilities(Banana.document);

  if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
    return "";

  let convertionParam = defineConversionParam();
  //Add the header if present 
  if (convertionParam.header) {
    // inData = convertionParam.header + inData;
  }
  let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
  let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

  // Format 1
  var format1 = new ImportCornerBankFormat1();
  if (format1.match(transactions)) {
    transactions = format1.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 2
  var format2 = new ImportCornerBankFormat2();
  if (format2.match(transactions)) {
    transactions = format2.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 3
  var format3 = new ImportCornerBankFormat3();
  if (format3.match(transactionsData)) {
    transactions = format3.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format is unknow, return an error
  importUtilities.getUnknownFormatError();

  return "";
}

/**
 * CSV Format 1
 *
 * ;;;;;;;;;;;;;;;;;;;;
 * ;Conto No.;123456/01 CHF;;;;;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;;
 * ;Elenco movimenti;;;;;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;;
 * ;Conto No.;Data registrazione;Descrizione;Dettaglio;Data valuta;Importo;;;;;;;;;;;;
 * ;123456/01;31/12/21;Descrizione1;;31/12/21;-40.0;;;;;;;;;;;;
 * ;;;Spese;40,00- CHF;;;;;;;;;;;;;;;
 * ;;;Ns.rif: 2022LI60101010101ABCDEFG;;;;;;;;;;;;;;;;
 * ;123456/01;31/12/21;Descrizione 2;;31/12/21;-34.6;;;;;;;;;;;;
 * ;;;Spese;7,50 CHF;;;;;;;;;;;;;;;
 * ;;;Spese reclamate;21,20 CHF;;;;;;;;;;;;;;;
 * ;;;Totale spese;28,70 CHF;;;;;;;;;;;;;;;
 * ;;;Ns.rif: 202112DD00000000024C11823;;;;;;;;;;;;;;;;
 * ;123456/01;31/12/21;Descrizione 3;;31/12/21;236.5;;;;;;;;;;;;
 */

var ImportCornerBankFormat1 = class ImportCornerBankFormat1 extends ImportUtilities {

  constructor(banDocument) {
    super(banDocument);

    this.colConto = 1;
    this.colDate = 2;
    this.colDescr = 3;
    this.colDetail = 4;
    this.colDateValuta = 5;
    this.colAmount = 6;

    this.currentLength = 19;
  }

  match(transactions) {
    if (transactions.length === 0)
      return false;

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      if (transaction.length === (this.currentLength))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[this.colDate].match(/[0-9\/]+/g) && transaction[this.colDate].length === 8)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[this.colDateValuta].match(/[0-9\/]+/g) && transaction[this.colDateValuta].length === 8)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched)
        return true;
    }

    return false;
  }

  /** Convert the transaction to the format to be imported */
  convert(transactions) {
    var transactionsToImport = [];

    // Filter and map rows
    for (var i = 0; i < transactions.length; i++) {
      //We take only the complete rows.
      var transaction = transactions[i];
      if (transaction.length < (this.currentLength))
        continue;
      if ((transaction[this.colDate] && transaction[this.colDate].length === 8) &&
        (transaction[this.colDateValuta] && transaction[this.colDateValuta].length === 8)) {
        transactionsToImport.push(this.mapTransaction(transaction));
      }
    }

    // Sort rows by date (just invert)
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  mapTransaction(element) {
    var mappedLine = [];

    mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
    mappedLine.push(""); // Doc is empty for now
    element[this.colDetail] == "" ? mappedLine.push(element[this.colDescr]) : mappedLine.push(element[this.colDetail] + ", " + element[this.colDescr]);
    let amount = element[this.colAmount];
    if (amount.length > 0) {
      if (amount[0] === "-") {
        mappedLine.push("");
        amount = amount.replace(/-/g, ''); //remove minus sign
        mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
      } else {
        mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
        mappedLine.push("");
      }
    }

    return mappedLine;
  }
};

/**
 * CSV Format 2
 *
 * Indea-Me.;330217/01 CHF;;;;
 * ;;;;;
 * Ficerieriectudit;;;;;
 * ;;;;;
 * Konto-Nr.;Erfassungsdatum;Bezeichnung;Detail;Valutadatum;Betrag
 * 330217/01;31.03.2023;Plapillumedducipse;;31.03.2023;-1.1
 * ;;Latipsuceligant;;;
 * ;;Xxx;01.01.2023  9,5000 %;;
 * ;;Oluditerunto;0,17- COR;;
 * ;;Intare Lia: 1202NHK5576738QR81JWWLY4;;;
 * 330217/01;29.03.2023;Probiresto navivens que�aeps;;31.03.2023;-43.08
 * ;;D.R.EX. 8,8% Morespeddum;1,80 COR;;
 * ;;Intare Lia: 8240HXY1054264KA73YKVHI3;;;
 * 330217/01;27.03.2023;I-silique;;27.03.2023;-29.9
 * ;;Ter Coeperm xxx 42.15.2320;;;
 * ;;CH3204177224321861564;;;
 * ;;MERANECT ELIS;;;
 * ;;INGISTANES 12O;;;
 * ;;8805 RICHTERSWIL;;;
 * ;;LOCUTIMULUM AN;;;
 * ;;IN - FUIT;;;
 * ;;000000000000000000010071783;;;
 * ;;TENSAMOX 2531534 NENT 72164 OCUNUNT;;;
 * ;;TERIUM: SCRO-MAXILLA.EX;;;
 * ;;BKL64777817724636;;;
 * ;;Evente lis Subittro;29,90 CHF;;
 * ;;Intare Lia: MC4813047621;;;
 */

var ImportCornerBankFormat2 = class ImportCornerBankFormat2 extends ImportUtilities {

  constructor(banDocument) {
    super(banDocument);

    this.colConto = 0;
    this.colDate = 1;
    this.colDescr = 2;
    this.colDetail = 3;
    this.colDateValuta = 4;
    this.colAmount = 5;

    this.currentLength = 6;
  }

  match(transactions) {
    if (transactions.length === 0)
      return false;

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      if (transaction.length === (this.currentLength))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length === 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched)
        return true;
    }

    return false;
  }
  /** Convert the transaction to the format to be imported */
  convert(transactions) {
    var transactionsToImport = [];

    // Filter and map rows
    for (var i = 0; i < transactions.length; i++) {
      //We take only the complete rows.
      var transaction = transactions[i];
      if (transaction.length < (this.colBalance + 1))
        continue;
      if ((transaction[this.colDate] && transaction[this.colDate].match(/[0-9\.]+/g)) &&
        (transaction[this.colDateValuta] && transaction[this.colDateValuta].match(/[0-9\.]+/g))) {
        transactionsToImport.push(this.mapTransaction(transaction));
      }
    }

    // Sort rows by date (just invert)
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  mapTransaction(element) {
    var mappedLine = [];

    mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
    mappedLine.push(""); // Doc is empty for now
    mappedLine.push(element[this.colDescr] + " " + element[this.colDetail]);
    let amount = element[this.colAmount];
    if (amount.length > 0) {
      if (amount[0] === "-") {
        mappedLine.push("");
        amount = amount.replace(/-/g, ''); //remove minus sign
        mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
      } else {
        mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
        mappedLine.push("");
      }
    }

    return mappedLine;
  }
};

/**
 * CSV Format 3
 * Conto No.;362635/01 CHF;;;;
 * ;;;;;
 * Elenco movimenti;;;;;
 * ;;;;;
 * Data registrazione;Descrizione;Dettaglio;Data valuta;Importo;Saldo
 */ 
var ImportCornerBankFormat3 = class ImportCornerBankFormat3 extends ImportUtilities {

  match(transactionsData) {
    if (transactionsData.length === 0)
       return false;

    for (var i = 0; i < transactionsData.length; i++) {
       var transaction = transactionsData[i];
       var formatMatched = true;

       if (formatMatched && transaction["Date"] && transaction["Date"].length === 10 &&
          transaction["Date"].match(/[0-9\/]+/g))
          formatMatched = true;
       else
          formatMatched = false;

       if (formatMatched)
          return true;
    }

    return false;
  }

  convert(transactionsData) {
    var transactionsToImport = [];

    for (var i = 0; i < transactionsData.length; i++) {
       if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length === 10 &&
          transactionsData[i]["Date"].match(/[0-9\/]+/g)) {
          transactionsToImport.push(this.mapTransaction(transactionsData[i]));
       }
    }

    // Sort rows by date
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  mapTransaction(transaction) {
    let mappedLine = [];

    mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"]));
    mappedLine.push(Banana.Converter.toInternalDateFormat(""));
    mappedLine.push("");
    mappedLine.push("");
    mappedLine.push(transaction["Description"]);
    if (transaction["Amount"][0] === "-")
       mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
    else
       mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

    return mappedLine;
  }
};

function defineConversionParam() {
  var convertionParam = {};
  /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
  convertionParam.format = "csv"; // available formats are "csv", "html"
  //get text delimiter
  convertionParam.textDelim = '"';
  // get separator
  convertionParam.separator = ';';

  /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 4;
   convertionParam.dataLineStart = 5;

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
  if (convertedColumns.length > 0) {
    importUtilities.loadForm(form, convertedColumns, rows);
    return form;
  }

  convertedColumns = convertHeaderIt(columns);
  if (convertedColumns.length > 0) {
    importUtilities.loadForm(form, convertedColumns, rows);
    return form;
  }

  return [];
}

function convertHeaderDe(columns) {
  let convertedColumns = [];

  for (var i = 0; i < columns.length; i++) {
     switch (columns[i]) {
        case "Datum":
           convertedColumns[i] = "Date";
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

  if (convertedColumns.indexOf("Date") < 0) {
     return [];
  }

  return convertedColumns;
}

function convertHeaderIt(columns) {
  let convertedColumns = [];

  for (var i = 0; i < columns.length; i++) {
     switch (columns[i]) {
        case "Data registrazione":
           convertedColumns[i] = "Date";
           break;
        case "Descrizione":
           convertedColumns[i] = "Description";
           break;
        case "Importo":
           convertedColumns[i] = "Amount";
           break;
        default:
           break;
     }
  }

  if (convertedColumns.indexOf("Date") < 0) {
     return [];
  }

  return convertedColumns;
}


