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
// @description = Corner Bank - Import bank account statement (*.csv)
// @description.de = Corner Bank - Kontoauszug importieren (*.csv)
// @description.en = Corner Bank - Import bank account statement (*.csv)
// @description.fr = Corner Bank - Importer un relevé de compte bancaire (*.csv)
// @description.it = Corner Bank - Importa movimenti estratto conto bancario (*.csv)
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

  if (isTest!==true && !importUtilities.verifyBananaAdvancedVersion())
     return "";

  convertionParam = defineConversionParam();
  //Add the header if present 
  if (convertionParam.header) {
      inData = convertionParam.header + inData;
  }
  let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

  // Format 1
  var format1 = new ImportCornerBankFormat1();
  if (format1.match( transactions))
  {
    let intermediaryData = format1.convertCsvToIntermediaryData(transactions,convertionParam);
    intermediaryData = format1.sortData(intermediaryData, convertionParam);
    format1.postProcessIntermediaryData(intermediaryData);
    return format1.convertToBananaFormat(intermediaryData);
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

  constructor(banDocument){
    super(banDocument);

    this.colConto = 1;
    this.colDate = 2;
    this.colDescr = 3;
    this.colDetail = 4;
    this.colDateValuta = 5;
    this.colAmount= 6;
  
    this.currentLength = 19;
  }

  match(transactions) {
    if ( transactions.length === 0)
       return false;

    for (var i=0;i<transactions.length;i++)
    {
       var transaction = transactions[i];

       var formatMatched=false;
       if ( transaction.length  === (this.currentLength)  )
          formatMatched = true;
       else
          formatMatched = false;

       if (formatMatched && transaction[this.colDate].match(/[0-9\/]+/g) && transaction[this.colDate].length === 8)
          formatMatched = true;
       else
          formatMatched = false;

       if ( formatMatched && transaction[this.colDateValuta].match(/[0-9\/]+/g) && transaction[this.colDateValuta].length === 8)
          formatMatched = true;
       else
          formatMatched = false;

       if (formatMatched)
          return true;
    }

    return false;
 }
  //Override the utilities method by adding language control
  convertCsvToIntermediaryData(transactions, convertionParam) {
    var form = [];
    var intermediaryData = [];
    var lang = "";

    /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
    We suppose the data will always begin right away after the header line */
    convertionParam.headerLineStart = 6;
    convertionParam.dataLineStart = 7;
    convertionParam.title = 4;

    //Variables used to save the columns titles and the rows values
    var columns = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
    let title= this.getTitle(transactions, convertionParam.title);
    var rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array

    //Load the form with data taken from the array. Create objects
    this.loadForm(form, columns, rows);
    //get the language of the headers
    lang = this.getLanguage(title);
    //For each row of the form, we call the rowConverter() function and we save the converted data
    for (var i = 0; i < form.length; i++) {
      let convertedRow = {};
      let transaction = form[i];
      switch(lang){
        case "it":
        if(transaction["Data registrazione"].match(/[0-9\/]+/g) && transaction["Data registrazione"].length == 8){
          convertedRow = this.translateHeaderIt(transaction, convertedRow);
          intermediaryData.push(convertedRow);
        }
        break;
        case "de":
          if(transaction["Erfassungsdatum"].match(/[0-9\/]+/g) && transaction["Erfassungsdatum"].length == 8){
            convertedRow = this.translateHeaderDe(transaction, convertedRow);
            intermediaryData.push(convertedRow);
          }
          break;
        default:
          Banana.console.info("csv format not recognised");
      }
  }
    //Return the converted CSV data into the Banana document table
    return intermediaryData;
  }

  /**
   * Returns the header of the file
   * @param {*} transactions 
   * @param {*} titleLine line with the header
   * @returns 
   */
  getTitle(transactions,titleRow){
    let rowData=transactions[titleRow];
    for (var i = 0; i < rowData.length; i++) {
      if(rowData[i]){
        return rowData[i];
      }
    }
    return false;
  }

  getLanguage(title) {//trovare il title
    //I check the description field (since in de and nl the date field is the same
    var lang = "";
    if(title){
      if (title === "Elenco movimenti") {
        lang = "it";
        return lang;
      }
      if (title === "Kontenbewegungen") {
        lang = "de";
        return lang;
      }
    }
    return lang;
  }

  //The purpose of this function is to let the user specify how to convert the categories
  postProcessIntermediaryData(intermediaryData) {
    /** INSERT HERE THE LIST OF ACCOUNTS NAME AND THE CONVERSION NUMBER
     *   If the content of "Account" is the same of the text
     *   it will be replaced by the account number given */
    //Accounts conversion
    var accounts = {
      "Raiffeisen Kontokorrent": "1020",
      Bar: "1000",

      //...
    };

    /** INSERT HERE THE LIST OF CATEGORIES NAME AND THE CONVERSION NUMBER
     *   If the content of "ContraAccount" is the same of the text
     *   it will be replaced by the account number given */

    //Categories conversion
    var categories = {
      "Abschreibung Praxisinnenausbau": "6921",
      "Abschreibungen mobile Sachanlagen": "6920",
      "AHV, IV, EO, ALV": "5700",
      "Aufwand für drittleistungen": "4400",
      "Ausserordentlicher Aufwand": "8010",
      "Ausserordentlicher Ertrag": "8000",
      "Bankkreditzinsaufwand": "6800",
      "Bankspesen und -gebühren": "6840",
      "Beiträge/Spenden/Vergabungen": "6520",
      "Berufliche Vorsorge": "5720",
      "Bruttoertrag Barverkäufe": "3000",
      "Bruttoertrag Handel Artikel": "3200",
      "Büromaterial und Fachliteratur": "6500",
      "Darlehenszinsaufwand": "6801",
      "Direkte Einkaufsspesen/Frachten/Transporte": "4070",
      "Einkauf von Bestandteilen": "4001",
      "Ertrag Miete/Infrastruktur": "3400",
      "Erträge aus Postcheck- und Bank": "6850",
      "Fahrzeugaufwand": "6200",
      "FAK": "5710",
      "Gebühren und Abgaben": "6360",
      "Gründungsaufwand": "6580",
      "Handelseinkauf": "4200",
      "inaktiv": "6574",
      "Informatikaufwand": "6570",
      "Krankentaggeldversicherung": "5740",
      "Kursgewinne flüssige Mittel": "6892",
      "Kursverluste": "6842",
      "Löhne Handel": "5200",
      "Löhne Produktion": "5000",
      "Löhne Verwaltung": "5600",
      "Materialaufwand / Einkauf von Apparaten": "4000",
      "Mietaufwand": "6000",
      "Mobiliar und Einrichtung": "1510",
      "Nebenkosten": "6030",
      "Privatanteile Verwaltungsaufwand": "6550",
      "Quellensteuer": "5790",
      "Rechts- und Beratungsaufwand": "6530",
      "Reinigung und Entsorgung": "6460",
      "Reise- und Repräsentationsaufwand": "6640",
      "Reparaturen / Unterhalt mobile Sachanlagen": "6100",
      "Sachversicherungen": "6300",
      "Skonti": "3290", //Duplicate category name but different numbers: => 3090
      "Sonstiger Personalaufwand": "5089", //Duplicate category name but different numbers: => 5880
      "Spesenentschädigungen effektiv": "5820",
      "Spesenentschädigungen pauschal": "5830",
      "Steuern": "8900",
      "Strom/Wasser": "6400",
      "Telefon/Telefax/Porti/Internet": "6510",
      "Temporäre Arbeitnehmer": "5900",
      "Unfallversicherung": "5730",
      "Werbeaufwand": "6600",
      "Zinsaufwand Gesellschafter": "6820",

      //...
    };

    //Apply the conversions
    for (var i = 0; i < intermediaryData.length; i++) {
      var convertedData = intermediaryData[i];

      //Convert
      if (convertedData["ContraAccount"]) {
        var cleanContraAccount = convertedData["ContraAccount"]
          .replace(/\(.*/, "")
          .trim(); //We delete everything between parentheses
        if (categories.indexOf(cleanContraAccount) > -1)
          convertedData["ContraAccount"] = categories[cleanContraAccount];
      }

      if (convertedData["Account"]) {
        if (accounts.indexOf(convertedData["Account"]) > -1)
          convertedData["Account"] = accounts[convertedData["Account"]];
      }

      if (convertedData["_Description2"]) {
        convertedData["Description"] =
          convertedData["_Description2"] + ", " + convertedData["Description"];
      }
    }
  }

  translateHeaderIt(inputRow, convertedRow) {
    convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Data registrazione"],"dd.mm.yy");
    convertedRow["DateValue"] = Banana.Converter.toInternalDateFormat(inputRow["Data valuta"],"dd.mm.yy");
    convertedRow["Description"] = inputRow["Descrizione"];
    convertedRow["_Description2"] = inputRow["Dettaglio"];
    /* use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format
     *  we already have negative amounts in Betrag and don't need the to fill the column Expenses*/
    convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow["Importo"],".");
    //convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow["Importo"], ".");
    convertedRow["_Balance"] = Banana.Converter.toInternalNumberFormat(inputRow["Saldo"],".");
    return convertedRow;
  }

  translateHeaderDe(inputRow, convertedRow) {
    convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Erfassungsdatum"],"dd.mm.yy");
    convertedRow["DateValue"] = Banana.Converter.toInternalDateFormat(inputRow["Valutadatum"],"dd.mm.yy");
    convertedRow["Description"] = inputRow["Bezeichnung"];
    convertedRow["_Description2"] = inputRow["Detail"];
    /* use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format
     *  we already have negative amounts in Betrag and don't need the to fill the column Expenses*/
    convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow["Betrag"],".");
    //convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow["Importo"], ".");
    convertedRow["_Balance"] = Banana.Converter.toInternalNumberFormat(inputRow["Saldo"],".");
    return convertedRow;
  }
};

function defineConversionParam() {
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
