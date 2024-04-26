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
// @description = Corner Card - Import account statement .csv (Banana+ Advanced)
// @description.de = Corner Card - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Corner Card - Import account statement .csv (Banana+ Advanced)
// @description.it = Corner Card - Importa movimenti .csv (Banana+ Advanced)
// @description.fr = Corner Card - Importer mouvements .csv (Banana+ Advanced)
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
function exec(inData, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

	convertionParam = defineConversionParam(inData);
	//Add the header if present 
	if (convertionParam.header) {
		inData = convertionParam.header + inData;
	}
	let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

	// Format 1
	var format1 = new ImportCornerCardFormat1();
	if (format1.match(transactions)) {
		let intermediaryData = format1.convertCsvToIntermediaryData(transactions);
		return Banana.Converter.arrayToTsv(intermediaryData);
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
		this.colStatus = 5;
	}

	match(transactions) {
		if (transactions.length === 0)
			return false;

		for (var i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;
			if (transaction.length === (this.colStatus + 1))
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

		var transactionsToImport = [];

		for (var i = 1; i < transactions.length; i++) // First row contains the header
		{
			var transaction = transactions[i];

			if (transaction.length === 0) {
				// Righe vuote
				continue;
			}

			if (transaction[this.colDate] && transaction[this.colDate].match(/[0-9\/]+/g) &&
				transaction[this.colDate].length == 10) {
				transactionsToImport.push(this.mapTransaction(transaction));
			}
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "Description", "ExternalReference", "Income", "Expenses", "Notes"]];
		return header.concat(transactionsToImport);
	}

	mapTransaction(element) {

		var mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], "dd/mm/yyyy"));
		mappedLine.push(element[this.colDescr]);
		mappedLine.push(element[this.colCard]);
		var amount = element[this.colAmount];
		if (amount) {
			if (amount[0] === "-") {
				amount = amount.replace(/-/g, ''); //remove minus sign
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
				mappedLine.push("");
			} else {
				mappedLine.push("");
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}
		mappedLine.push(element[this.colStatus]);

		return mappedLine;
	}

	/** Sort transactions by date */
	sort(transactions) {
		if (transactions.length <= 0)
			return transactions;
		var i = 0;
		var previousDate = transactions[0][this.colDate];
		while (i < transactions.length) {
			var date = transactions[i][this.colDate];
			if (previousDate > 0 && previousDate > date)
				return transactions.reverse();
			else if (previousDate > 0 && previousDate < date)
				return transactions;
			i++;
		}
		return transactions;
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

	var commaCount = 0;
	var semicolonCount = 0;
	var tabCount = 0;

	for (var i = 0; i < 1000 && i < inData.length; i++) {
		var c = inData[i];
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

