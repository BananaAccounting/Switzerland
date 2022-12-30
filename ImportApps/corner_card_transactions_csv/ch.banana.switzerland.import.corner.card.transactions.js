// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.switzerland.import.corner.card.transactions
// @api = 1.0
// @pubdate = 2021-11-05
// @publisher = Banana.ch SA
// @description = Corner Card - Import credit card transactions (*.csv)
// @description.de = Corner Card - Kreditkartentransaktionen importieren (*.csv)
// @description.en = Corner Card - Import credit card transactions (*.csv)
// @description.it = Corner Card - Importa movimenti carta di credito (*.csv)
// @description.fr = Corner Card - Importation de transactions par carte de crédit (*.csv)
// @task = import.transactions
// @doctype = *
// @docproperties = 
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

//Main function
function exec(inData,isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest!==true && !importUtilities.verifyBananaAdvancedVersion())
	   return "";

	convertionParam = defineConversionParam(inData);
	//Add the header if present 
	if (convertionParam.header) {
		inData = convertionParam.header + inData;
	}
	let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
  
	// Format 1
	var format1 = new ImportCornerCardFormat1();
	if (format1.match(transactions))
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
 * CSV Format1 (en)
 * Date;Description;Card;Currency;Amount;Status
 * 02/11/2021;Penthorda Fentittrunix, Prolor, OS;**2618;LAC;49.90;Seratem curruniunch
 * 02/11/2021;Venes adisu;**2618;LAC;100.00;Pricite curruniunch
 * 01/11/2021;NUMN * O8251O5CF7;**2618;LAC;2.71;Pricite curruniunch
 * 01/11/2021;SECTUDABO*CUTANGOBASE;**2618;LAC;56.57;Pricite curruniunch
 */

var ImportCornerCardFormat1 = class ImportCornerCardFormat1 extends ImportUtilities {

	constructor(banDocument) {
		super(banDocument);

		this.colDate = 0;
		this.colDescr = 1;
		this.colCard = 2;
		this.colCurrency = 3;
		this.colAmount = 4;
		this.colStatus= 5;
    }

	match(transactions) {
		if (transactions.length === 0)
		   return false;
	
		for (var i=0;i<transactions.length;i++)
		{
		   var transaction = transactions[i];
	
		   var formatMatched=false;
		   if ( transaction.length  === (this.colStatus + 1)  )
			  formatMatched = true;
		   else
			  formatMatched = false;
	
		   if (formatMatched && transaction[this.colDate].match(/[0-9\/]+/g) && transaction[this.colDate].length === 10)
			  formatMatched = true;
		   else
			  formatMatched = false;
	
		   if (formatMatched)
			  return true;
		}
	
		return false;
	 }
	//The purpose of this function is to let the users define:
	// - the parameters for the conversion of the CSV file;
	// - the fields of the csv/table
	convertCsvToIntermediaryData(transactions) {

		let form = [];
		let intermediaryData = [];

		/** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
		We suppose the data will always begin right away after the header line */
		convertionParam.headerLineStart = 0;
		convertionParam.dataLineStart = 1;

		//Variables used to save the columns titles and the rows values
		let columns = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
		let rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
		let lang = this.getLanguage(transactions, convertionParam.headerLineStart);

		//Load the form with data taken from the array. Create objects
		this.loadForm(form, columns, rows);
		//get the language of the headers
		//For each row of the form, we call the rowConverter() function and we save the converted data
		for (var i = 0; i < form.length; i++) {
			let convertedRow = {};
			let transaction = form[i];
			switch(lang){
				case "it":
				if(transaction["Data"].match(/[0-9\/]+/g) && transaction["Data"].length == 10){
					convertedRow = this.translateHeaderIt(transaction, convertedRow);
					intermediaryData.push(convertedRow);
				}
				break;
				case "en":
				if(transaction["Date"].match(/[0-9\/]+/g) && transaction["Date"].length == 10)
					convertedRow = this.translateHeaderEn(transaction, convertedRow);
					intermediaryData.push(convertedRow);
				break;
				default:
				Banana.console.info("csv format not recognised");
			}
		}
    //Return the converted CSV data into the Banana document table
    return intermediaryData;
	}	

	getLanguage(transactions,headerRow) {
		//Check language on header field: "Description".
		let lang = "en";
		let headerData = transactions[headerRow];
		for (var i = 0; i < headerData.length; i++) {
			let element = headerData[i];
			switch(element){
				case "Descrizione":
				lang = "it";
				break;
			}
		}
		return lang;
	}

	translateHeaderEn(inputRow, convertedRow) {

		convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Date"],"dd/mm/yyyy");
		convertedRow["Description"] = inputRow["Description"];
		convertedRow["ExternalReference"] = inputRow["Card"];
		convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow["Amount"]);
		convertedRow["Notes"] = inputRow["Status"];

		return convertedRow;
	  }
	
	  translateHeaderIt(inputRow, convertedRow) {

		convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Data"],"dd/mm/yyyy");
		convertedRow["Description"] = inputRow["Descrizione"];
		convertedRow["ExternalReference"] = inputRow["Carta"];
		convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow["Importo"]);
		convertedRow["Notes"] = inputRow["Stato"];

		return convertedRow;
	  }



	//The purpose of this function is to let the user specify how to convert the categories
 	postProcessIntermediaryData(intermediaryData) {

		/** INSERT HERE ALL THE DESCRIPTIONS OF THE VALUES THAT GOES ON THE "Account Credit" COLUMN
		*	If the Amount value has one of these descriptions, then we invert that value.
		*	When inverted the value goes on the "Account Credit" column */
		var negatives = [];

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
			for (var j = 0; j < negatives.length; j++) {
				if (convertedData["Description"] && convertedData["Expenses"]) {
					if (convertedData["Description"] === negatives[j]) {
						convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
					}
				}
			}
		}
	}
}

function defineConversionParam(inData) {
	var convertionParam = {};
	/** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
	convertionParam.format = "csv"; // available formats are "csv", "html"
	//get text delimiter
	convertionParam.textDelim = '\"';
	// get separator
	convertionParam.separator = findSeparator(inData);
  
	/** SPECIFY THE COLUMN TO USE FOR SORTING
	If sortColums is empty the data are not sorted */
	convertionParam.sortColums = ["Date", "Description"];
	convertionParam.sortDescending = false;
  
	return convertionParam;
  }

  /**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(inData) {

	var commaCount=0;
	var semicolonCount=0;
	var tabCount=0;
 
	for(var i = 0; i < 1000 && i < inData.length; i++) {
	   var c = inData[i];
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

