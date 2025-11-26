// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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



// @id = ch.banana.switzerland.import.raiffeisen
// @api = 1.0
// @pubdate = 2025-10-29
// @publisher = Banana.ch SA
// @description = Raiffeisen - Import account statement .csv (Banana+ Advanced)
// @description.en = Raiffeisen - Import account statement .csv (Banana+ Advanced)
// @description.de = Raiffeisen - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Raiffeisen - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Raiffeisen - Importa movimenti .csv (Banana+ Advanced)
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
function exec(string, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

	var transactions = Banana.Converter.csvToArray(string, ';', '§');

	// Format 6
	var format6 = new RaiffeisenFormat6();
	let transactionsData = format6.getFormattedData(transactions, importUtilities);
	if (format6.match(transactionsData)) {
		let trToImport = format6.convert(transactionsData);
		return Banana.Converter.arrayToTsv(trToImport);
	}
	// Format 5
	var format5 = new RaiffeisenFormat5();
	transactionsData = format5.getFormattedData(transactions, importUtilities);
	if (format5.match(transactionsData)) {
		let trToImport = format5.convert(transactionsData);
		return Banana.Converter.arrayToTsv(trToImport);
	}

	// Format 4
	var format4 = new RaiffeisenFormat4();
	if (format4.match(transactions)) {
		let trToImport = format4.convert(transactions);
		return Banana.Converter.arrayToTsv(trToImport);
	}

	// Format 3
	var format3 = new RaiffeisenFormat3();
	if (format3.match(transactions)) {
		let trToImport = format3.convert(transactions);
		return Banana.Converter.arrayToTsv(trToImport);
	}

	// Format 2
	var format2 = new RaiffeisenFormat2();
	if (format2.match(transactions)) {
		let trToImport = format2.convert(transactions);
		var result = Banana.Converter.arrayToTsv(trToImport);
		result = result.replace('"', '');
		return result;
	}

	// Format 1
	var format1 = new RaiffeisenFormat1();
	if (format1.match(transactions)) {
		let trToImport = format1.convert(transactions);
		return Banana.Converter.arrayToTsv(trToImport);
	}

	importUtilities.getUnknownFormatError();

	return "";
}

/**
 * Raiffeisen Format 6
 * From July 2024 Added Details Column
 * 
 * IBAN;Booked At;Text;Details;Credit/Debit Amount;Balance;Valuta Date
 * IC1182551737356068462;2024-07-02 00:00:00.0;Apuelor Antabo A Petimenunt 48.30.2667, 78:46, Sidem Mitruntqua-At. 830788lwslbs8327;;-11.45;2078.76;2024-07-02 00:00:00.0
 * IC1182551737356068462;2024-07-03 00:00:00.0;Metrinctio EXERE hoc STATUM, SECT;TAE RACURRE CARABIRE OS BOX 78.72 -;10;2088.76;2024-07-03 00:00:00.0
 * IC1182551737356068462;2024-07-05 00:00:00.0;O-Grequis Scellit (sTall) Ex Viunit OS 6362 Albulige;OS Umedeps y�u: Obsquonsecustquat BOX 11.42 -;-40.7;2048.06;2024-07-05 00:00:00.0
 */
function RaiffeisenFormat6() {
	this.getFormattedData = function (transactions, importUtilities) {
		let headerLineStart = 0;
		let dataLineStart = 1;
		let processedTransactions = [];

		// Processing transactions to combine continuous lines
		for (let i = 0; i < transactions.length; i++) {
			let currentTransaction = transactions[i];

			// If this is a main transaction row (has date)
			if (currentTransaction[1]) {
				let combinedText = currentTransaction[2];

				// Look ahead for continuation rows
				while (i + 1 < transactions.length &&   // next row exists
					!transactions[i + 1][1] && 		// next row has no date (indicating continuation)
					transactions[i + 1][2]) {	 	// next row has text to combine
					// Combine text with separator
					combinedText += " " + transactions[i + 1][2];
					i++; // Skip the continuation row in next iteration
				}

				// Create processed transaction with combined text
				let processedTransaction = [...currentTransaction];
				processedTransaction[2] = combinedText;
				processedTransactions.push(processedTransaction);
			}
		}

		// We do a copy as the getHeaderData modifies the content and we need to keep the original version clean.
		let transactionsCopy = JSON.parse(JSON.stringify(processedTransactions));

		if (transactionsCopy.length < dataLineStart)
			return [];
		let columns = importUtilities.getHeaderData(transactionsCopy, headerLineStart); //array
		let rows = importUtilities.getRowData(transactionsCopy, dataLineStart); //array of array

		let form = [];

		/** We convert the original headers into a custom format to be able to work with the same
		 * format regardless of original's headers language or the position of the header column.
		 * We need to translate all the .csv fields as the loadForm() method expects the header and
		 * the rows to have the same length.
		 * */
		let convertedColumns = [];

		convertedColumns = this.convertHeaderEn(columns, convertedColumns);
		if (convertedColumns.length > 0) {
			importUtilities.loadForm(form, convertedColumns, rows);
			return form;
		}

		return [];

	}

	this.convertHeaderEn = function (columns) {
		let convertedColumns = [];
		for (var i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case "IBAN":
					convertedColumns[i] = "IBAN";
					break;
				case "Booked At":
					convertedColumns[i] = "Date";
					break;
				case "Text":
					convertedColumns[i] = "Description";
					break;
				case "Details":
					convertedColumns[i] = "Details";
					break;
				case "Credit/Debit Amount":
					convertedColumns[i] = "Amount";
					break;
				case "Balance":
					convertedColumns[i] = "Balance";
					break;
				case "Valuta Date":
					convertedColumns[i] = "DateValue";
					break;
				default:
					break;
			}
		}

		if (convertedColumns.indexOf("Date") < 0
			|| convertedColumns.indexOf("Description") < 0
			|| convertedColumns.indexOf("Amount") < 0) {
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
			var formatMatched = true;

			if ((formatMatched && transaction.hasOwnProperty("Details") && transaction["Date"] && transaction["Date"].length >= 10 &&
				transaction["Date"].match(/^\d{4}-\d{2}-\d{2}/)) || (formatMatched && transaction.hasOwnProperty("Details")))
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

		for (var i = 0; i < transactionsData.length; i++) {
			if ((transactionsData[i].hasOwnProperty("Details") && transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
				transactionsData[i]["Date"].match(/^\d{4}-\d{2}-\d{2}/)) || (transactionsData[i].hasOwnProperty("Details"))) {
				transactionsToImport.push(this.mapTransaction(transactionsData[i]));
			}
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (transaction) {
		let mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "yyyy.mm.dd"));
		mappedLine.push(Banana.Converter.toInternalDateFormat("", "yyyy.mm.dd"));
		mappedLine.push("");
		mappedLine.push("");
		let trDescription = transaction["Description"] + " " + transaction["Details"];
		mappedLine.push(trDescription);
		if (transaction["Amount"][0] !== "-")
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
		else
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));

		return mappedLine;
	}
}

/**
 * Raiffeisen Format 5
 * From December 2018 Added IBAN Column
 * 
 * Example 1:
 *
 * IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
 * CHXXXXXXXXXXXXXXXXXXX;2018-01-01 20:49:45.0;Prelevamento Bancomat BR;-482.2;6541.01;2018-01-03 00:00:00.0
 * CHXXXXXXXXXXXXXXXXXXX;2018-01-04 04:04:16.0;Acquisto TAMOIL;-66.57;6474.44;2018-01-04 00:00:00.0
 * CHXXXXXXXXXXXXXXXXXXX;2018-04-06 12:04:17.0;Ordine collettivo e-banking da pagamenti singoli;-1967;239.1;2018-04-06 00:00:00.0
 * ;Sezione della circolazione 6528 Camorino CHF 209.00;;;;
 * ;SUVA CHF 1'025.55;;;;
 * ;Clima SA CHF 167.35;;;;
 * ;Clima SA CHF 167.35;;;;
 * ;Finance Suisse CHF 397.75;;;;
 *
 *
 * Example 2:
 *
 * IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
 * CHXXXXXXXXXXXXXXXXXXX;01.01.2021 00:00;Prelevamento Bancomat BR;-482.2;6541.01;01.01.2021 00:00
 * CHXXXXXXXXXXXXXXXXXXX;03.02.2021 00:00;Acquisto TAMOIL;-66.57;6474.44;03.02.2021 00:00
 * CHXXXXXXXXXXXXXXXXXXX;04.05.2021 00:00;Ordine collettivo e-banking da pagamenti singoli;-1967;239.1;04.05.2021 00:00
 * 
 * 
 * Example 3:
 * 
 * IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
 * CHXXXXXXXXXXXXXXXXXXX;2021-01-01 00:00:00.0;Prelevamento Bancomat BR;-482.2;6541.01;2021-01-01 00:00:00.0
 * ;;Description 1 on next row;;;
 * CHXXXXXXXXXXXXXXXXXXX;2018-01-04 04:04:16.0;Acquisto TAMOIL;-66.57;6474.44;2018-01-04 00:00:00.0
 * ;;Description 2 on next row;;;
 */
function RaiffeisenFormat5() {

	this.dateFormat = "yyyy-mm-dd";

	this.getFormattedData = function (transactions, importUtilities) {
		let headerLineStart = 0;
		let dataLineStart = 1;

		let transactionsCopy = JSON.parse(JSON.stringify(transactions));

		if (transactionsCopy.length < dataLineStart)
			return [];
		let columns = importUtilities.getHeaderData(transactionsCopy, headerLineStart); //array
		let rows = importUtilities.getRowData(transactionsCopy, dataLineStart); //array of array

		let form = [];

		let convertedColumns = [];

		convertedColumns = this.convertHeaderEn(columns, convertedColumns);
		if (convertedColumns.length > 0) {
			importUtilities.loadForm(form, convertedColumns, rows);
			return form;
		}

		return [];
	}

	this.convertHeaderEn = function (columns) {
		let convertedColumns = [];
		for (var i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case "IBAN":
					convertedColumns[i] = "IBAN";
					break;
				case "Booked At":
					convertedColumns[i] = "Date";
					break;
				case "Text":
					convertedColumns[i] = "Description";
					break;
				case "Credit/Debit Amount":
					convertedColumns[i] = "Amount";
					break;
				case "Balance":
					convertedColumns[i] = "Balance";
					break;
				case "Valuta Date":
					convertedColumns[i] = "DateValue";
					break;
				default:
					break;
			}
		}

		if (convertedColumns.indexOf("Date") < 0
			|| convertedColumns.indexOf("Description") < 0
			|| convertedColumns.indexOf("Amount") < 0) {
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
			let date = transaction["Date"].slice(0, 10); // Get only the date part
			var formatMatched = false;
			if (this.isValidDate(date))
				formatMatched = true;
			else
				formatMatched = false;

			let dateValue = transaction["DateValue"].slice(0, 10); // Get only the date part
			if (this.isValidDate(dateValue))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction["IBAN"] && transaction["IBAN"].length > 0)
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}

		return false;
	}

	this.isValidDate = function (date) {
		if (date && date.length == 10 && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
			this.dateFormat = "yyyy-mm-dd";
			return true;
		} else if (date && date.length == 10 && date.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
			this.dateFormat = "dd.mm.yyyy";
			return true;
		}
		return false;
	}

	this.convert = function (transactionsData) {
		var transactionsToImport = [];
		let lastImportedIndex = -1;

		for (var i = 0; i < transactionsData.length; i++) {
			let transaction = transactionsData[i];
			let date = transaction["Date"].slice(0, 10); // Get only the date part
			if (this.isValidDate(date)) { // Normal transaction
				transactionsToImport.push(this.mapTransaction(transaction));
				lastImportedIndex = transactionsToImport.length - 1;
			} else {// Continuation line for description, Only from example 3 format
				if (lastImportedIndex >= 0) {
					const extra = (transaction["Description"] && transaction["Description"].trim()) || "";
					if (extra) {
						const existing = (transactionsToImport[lastImportedIndex][3] || "").toString().trim();
						transactionsToImport[lastImportedIndex][3] = (existing + " " + extra).trim();
					}
				}
			}
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (transaction) {
		let mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], this.dateFormat));
		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], this.dateFormat));
		mappedLine.push("");
		mappedLine.push(transaction["Description"]);
		if (transaction["Amount"][0] !== "-") {
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
			mappedLine.push("");
		}
		else {
			mappedLine.push("");
			let cleanedAmount = transaction["Amount"].substring(1);
			mappedLine.push(Banana.Converter.toInternalNumberFormat(cleanedAmount, '.'));
		}

		return mappedLine;
	}
}

/**
 * Raiffeisen Format 4
 * From December 2017 date is in Timestamp
 *
 * Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
 * 2017-12-01 01:23:58.0;E-Banking Auftrag (Kontoübertrag) Christian Bernasconi  Konto CHxxxxx0002167071;-200;19647.09;2017-12-01 00:00:00.0
 * 2017-12-01 01:23:58.0;E-Banking Auftrag (Kontoübertrag) Christian Bernasconi  Konto CHxxxxx0002167071;-40.3;19606.79;2017-12-01 00:00:00.0
 */
function RaiffeisenFormat4() {
	this.colDate = 0;
	this.colDescr = 1;
	this.colAmount = 2;
	this.colBalance = 3;
	this.colDateValuta = 4;

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;
			/* array should have all columns */
			if (transaction.length === (this.colDateValuta + 1))
				formatMatched = true;
			else
				formatMatched = false;
			if (formatMatched && transaction[this.colDate].length > 15
				&& transaction[this.colDate].match(/^[0-9]+\-[0-9]+\-[0-9]+\s[0-9]+\:[0-9]+\:[0-9]+\.[0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDateValuta].length > 15
				&& transaction[this.colDateValuta].match(/^[0-9]+\-[0-9]+\-[0-9]+\s[0-9]+\:[0-9]+\:[0-9]+\.[0-9]+$/))
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

		// Filter and map rows
		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			if (transaction.length < (this.colBalance + 1))
				continue;
			if (transaction[this.colDate].length >= 15
				&& transaction[this.colDateValuta].length >= 15)
				transactionsToImport.push(this.mapTransaction(transaction));
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (element) {
		var mappedLine = [];
		var dateText = element[this.colDate].substring(0, 10);
		mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd"));
		dateText = element[this.colDateValuta].substring(0, 10);
		mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd"));
		mappedLine.push(""); // Doc is empty for now
		mappedLine.push(element[this.colDescr]);
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], '.'));
				mappedLine.push("");
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}

		return mappedLine;
	}
}

/**
 * Raiffeisen Format 3
 *
 * Booked At;Text;Credit/Debit Amount;Balance;Valuta Date;;;;;
 * 03.01.13;Gutschrift Daniel Storrer;195;6080.25;03.01.13;;;;;
 * ;Hauptstrasse 76a 9105 Schonengrund 101305  CHF 195.00;;;;;;;;
 * 03.01.13;E-Banking Sammelauftrag;-465;5615.25;03.01.13;;;;;
 * ;Weber Reinhard Buffalo Dancers 9100 Herisau Jahresbeitrag 2013 ‡ 50.-/600 abz. 3 Mt. Ausfall ‡ 45.-/135.- CHF 465.00;;;;;;;;Privat
 */
function RaiffeisenFormat3() {
	this.colDate = 0;
	this.colDescr = 1;
	this.colAmount = 2;
	this.colBalance = 3;
	this.colDateValuta = 4;

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;
			if (transaction.length === (this.colDateValuta + 1))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+( [0-9]+:[0-9]+)?$/) &&
				transaction[this.colDate].length >= 8)
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+( [0-9]+:[0-9]+)?$/) &&
				transaction[this.colDateValuta].length >= 8)
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

		// Filter and map rows
		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			if (transaction.length < (this.colBalance + 1))
				continue;
			if (transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+( [0-9]+:[0-9]+)?$/) && transaction[this.colDate].length >= 8 &&
				transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+( [0-9]+:[0-9]+)?$/) && transaction[this.colDateValuta].length >= 8)
				transactionsToImport.push(this.mapTransaction(transaction));
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (element) {
		var mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
		mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
		mappedLine.push(""); // Doc is empty for now
		mappedLine.push(element[this.colDescr]);
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], '.'));
				mappedLine.push("");
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}

		return mappedLine;
	}
}

/**
 * Raiffeisen Format 2
 *
 * Example: raiffeisen.#20101028.csv
 * Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
 * 06/10/2010;XX;700;4031.82;06/10/2010
 * 06/10/2010;XX;983;5014.82;06/10/2010
 *
	
 */
function RaiffeisenFormat2() {
	this.colDate = 0;
	this.colDescr = 1;
	this.colAmount = 2;
	this.colBalance = 3;
	this.colDateValuta = 4;

	this.dateFormat = "";

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;

			if (transaction.length === (this.colDateValuta + 1))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDate].match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{2,4}$/)) {
				this.dateFormat = "dd/mm/yyyy";
				formatMatched = true;
			} else if (formatMatched && transaction[this.colDate].match(/^[0-9]{2,4}\-[0-9]{2}\-[0-9]{2}$/)) {
				this.dateFormat = "yyyy.mm.dd";
				formatMatched = true;
			}
			else {
				formatMatched = false;
			}

			if (formatMatched && transaction[this.colDateValuta].match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{2,4}$/)) {
				formatMatched = true;
			} else if (formatMatched && transaction[this.colDateValuta].match(/^[0-9]{2,4}\-[0-9]{2}\-[0-9]{2}$/)) {
				formatMatched = true;
			} else {
				formatMatched = false;
			}

			if (formatMatched)
				return true;
		}
		return false;
	}

	/** Convert the transaction to the format to be imported */
	this.convert = function (transactions) {
		var transactionsToImport = [];

		// Filter and map rows
		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			if (transaction.length < (this.colDateValuta + 1)) {
				continue;
			}

			if ((transaction[this.colDate].match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{2,4}$/) &&
				transaction[this.colDateValuta].match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{2,4}$/)) ||
				(transaction[this.colDate].match(/^[0-9]{2,4}\-[0-9]{2}\-[0-9]{2}$/) ||
					transaction[this.colDateValuta].match(/^[0-9]{2,4}\-[0-9]{2}\-[0-9]{2}$/))) {
				transactionsToImport.push(this.mapTransaction(transaction));
			}
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (element) {
		var mappedLine = [];

		var date = Banana.Converter.toInternalDateFormat(element[this.colDate], this.dateFormat);
		mappedLine.push(date);
		var dateValue = Banana.Converter.toInternalDateFormat(element[this.colDateValuta], this.dateFormat);
		mappedLine.push(dateValue);
		mappedLine.push(""); // Doc is empty for now
		mappedLine.push(element[this.colDescr]);
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], '.'));
				mappedLine.push("");
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}

		return mappedLine;
	}
}

/**
 * Raiffeisen Format 1
 *
 * Example: raiffeisen.#20080304.csv
 * 2008-01-03;XXX, Bern;100;54.25;2008-01-03
 * ;CHF 100.00  XXX;;;
 * 2008-03-04;XXX;-100;54.25;2008-01-03
 * ;CHF 100.00  XXX;;;XX *
 *
 */
function RaiffeisenFormat1() {
	this.colDate = 0;
	this.colDescr = 1;
	this.colAmount = 2;
	this.colBalance = 3;
	this.colDateValuta = 4;

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;
			if (transaction.length === (this.colDateValuta + 1))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDate].match(/^[0-9\-]+$/) &&
				transaction[this.colDate].length === 10)
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDateValuta].match(/^[0-9\-]+$/) &&
				transaction[this.colDateValuta].length === 10)
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

		// Filter and map rows
		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			if (transaction.length < (this.colBalance + 1))
				continue;
			if (transaction[this.colDate].match(/^[0-9\-]+$/) && transaction[this.colDate].length === 10 &&
				transaction[this.colDateValuta].match(/^[0-9\-]+$/) && transaction[this.colDateValuta].length === 10)
				transactionsToImport.push(this.mapTransaction(transaction));
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (element) {
		var mappedLine = [];

		var date = element[this.colDate].replace(/-/g, ''); //remove -
		mappedLine.push(date);
		var dateValuta = element[this.colDateValuta].replace(/-/g, ''); //remove -
		mappedLine.push(dateValuta);
		mappedLine.push(""); // Doc is empty for now
		mappedLine.push(element[this.colDescr]);
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], '.'));
				mappedLine.push("");
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}

		return mappedLine;
	}
}
