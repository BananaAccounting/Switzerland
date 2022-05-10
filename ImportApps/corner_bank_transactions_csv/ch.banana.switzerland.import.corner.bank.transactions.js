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
// @description = Corner Bank import Transactions (*.csv) [BETA]
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
  let convertionParam = "";
  let intermediaryData = "";

  if (!inData) return "";

  var importCornerBankTransactions = new ImportCornerBankTransactions(
    Banana.document
  );

  if (
    isTest !== true &&
    !importCornerBankTransactions.verifyBananaAdvancedVersion()
  )
    return "";

  //1. Function call to define the conversion parameters
  convertionParam = importCornerBankTransactions.defineConversionParam();

  //2. we can eventually process the input text
  inData = importCornerBankTransactions.preProcessInData(inData);

  //3. intermediaryData is an array of objects where the property is the banana column name
  intermediaryData = importCornerBankTransactions.convertCsvToIntermediaryData(inData,convertionParam);
 
  //filters the elements.
  var isTotalRow = function (row) {
    return row["Date"].length > 0;
  };
  intermediaryData = intermediaryData.filter(isTotalRow);
 
  //4. translate categories and Description
  // can define as much postProcessIntermediaryData function as needed
  importCornerBankTransactions.postProcessIntermediaryData(intermediaryData);

  //5. sort data
  intermediaryData = importCornerBankTransactions.sortData(intermediaryData,convertionParam);

  //6. convert to banana format
  //column that start with "_" are not converted
  return importCornerBankTransactions.convertToBananaFormat(intermediaryData);
}

var ImportCornerBankTransactions = class ImportCornerBankTransactions extends ImportUtilities {
  //The purpose of this function is to let the users define:
  // - the parameters for the conversion of the CSV file;
  // - the fields of the csv/table
  defineConversionParam() {
    var convertionParam = {};

    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    convertionParam.separator = ";";
    convertionParam.textDelim = '"';

    /** SPECIFY THE COLUMN TO USE FOR SORTING
		 If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date"];
    convertionParam.sortDescending = true;
    /** END */

    /* rowConvert is a function that convert the inputRow (passed as parameter)
     *  to a convertedRow object
     * - inputRow is an object where the properties is the column name found in the CSV file
     * - convertedRow is an  object where the properties are the column name to be exported in Banana
     * For each column that you need to export in Banana create a line that create convertedRow column
     * The right part can be any fuction or value
     * Remember that in Banana
     * - Date must be in the format "yyyy-mm-dd"
     * - Number decimal separator must be "." and there should be no thousand separator */
    convertionParam.rowConverter = function (inputRow, lang) {
      var convertedRow = {};
      switch (lang) {
        case "it":
          return translateHeaderIt(inputRow, convertedRow);
        case "de":
          return translateHeaderDe(inputRow, convertedRow);
        default:
          return convertedRow;
      }
    };
    return convertionParam;
  }

  //Override the utilities method by adding language control
  convertCsvToIntermediaryData(inData, convertionParam) {
    var form = [];
    var intermediaryData = [];
    var lang = "";
    //Add the header if present
    if (convertionParam.header) {
      inData = convertionParam.header + inData;
    }

    //Read the CSV file and create an array with the data
    var csvFile = Banana.Converter.csvToArray(inData,convertionParam.separator,convertionParam.textDelim);
    /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
    We suppose the data will always begin right away after the header line
    I take the first non-empty line as a reference since in the various test files
    the initial lines are different.
    */
    let fileFirstLine=this.getFileFirstLine(csvFile);
    convertionParam.headerLineStart =fileFirstLine+4;
    convertionParam.title=fileFirstLine+2;
    convertionParam.dataLineStart =fileFirstLine+5;

    //Variables used to save the columns titles and the rows values
    var columns = this.getHeaderData(csvFile, convertionParam.headerLineStart); //array
    let title= this.getTitle(csvFile, convertionParam.title);
    var rows = this.getRowData(csvFile, convertionParam.dataLineStart); //array of array

    //Load the form with data taken from the array. Create objects
    this.loadForm(form, columns, rows);
    //get the language of the headers
    lang = this.getLanguage(title);
    //Create the new CSV file with converted data
    var convertedRow;
    //For each row of the form, we call the rowConverter() function and we save the converted data
    for (var i = 0; i < form.length; i++) {
      convertedRow = convertionParam.rowConverter(form[i], lang);
      intermediaryData.push(convertedRow);
    }
    //Return the converted CSV data into the Banana document table
    return intermediaryData;
  }

  preProcessInData(inData) {
    return inData;
  }

  /**
   * Returns the header of the file
   * @param {*} csvFile 
   * @param {*} titleLine line with the header
   * @returns 
   */
  getTitle(csvFile,titleLine){
    let titleData=csvFile[titleLine];
    for (var i = 0; i < titleData.length; i++) {
      if(titleData[i]){
        return titleData[i];
      }
    }
    return false;
  }

  /**
   * Returns the first line that is not completely empty, this should be the first line of the file 
   * @param {*} csvFile matrix with csv file data
   * @returns 
   */
  getFileFirstLine(csvFile){
    for (var i = 0; i < csvFile.length; i++) {
      let row=csvFile[i];
      for (var j = 0; j < row.length; j++) {
        if(row[j]){
          return i; //return the inital line number
        }
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
};

function translateHeaderIt(inputRow, convertedRow) {
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

function translateHeaderDe(inputRow, convertedRow) {
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
