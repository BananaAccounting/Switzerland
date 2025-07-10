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
//
//
// @id = ch.banana.switzerland.import.blkb
// @api = 1.0
// @pubdate = 2025-07-09
// @publisher = Banana.ch SA
// @description = Basellandschaftliche Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.en = Basellandschaftliche Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.it = Basellandschaftliche Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
// @description.de = Basellandschaftliche Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Basellandschaftliche Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *.*
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @task = import.transactions
// @timeout = -1
// @includejs = import.utilities.js


/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	string = cleanupText( string);
	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
       return "";

	var fieldSeparator = findSeparator(string);

	var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');
	

	// Basellandschaftliche Kantonalbank Format, this format works with the header names.
    var blkbFormat1 = new BLKBFormat1();
    let transactionsData = blkbFormat1.getFormattedData(transactions, importUtilities);
    if (blkbFormat1.match(transactionsData)) {
		Banana.console.log("BLKBFormat1 match");
       transactions = blkbFormat1.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }

    // Basellandschaftliche Kantonalbank Old Format, this format works with the column index.
	var blkbOldFormat = new BLKBOldFormat();
	if (blkbOldFormat.match(transactions)) {
		Banana.console.log("BLKBOldFormat match");
		transactions = blkbOldFormat.convert(transactions);
		return Banana.Converter.arrayToTsv(transactions);
	}

	importUtilities.getUnknownFormatError();

    return "";
}

/**
 * Format 1
 * 
 * Auftragsdatum;Buchungstext;Betrag Einzelzahlung (CHF);Belastungsbetrag (CHF);Gutschriftsbetrag (CHF);Valutadatum;Saldo (CHF)
 * 31.01.2025;"Menetianduperum / Nor.-At. 258750247
 * COMNIUVA-CONE 6
 * Puniurem: ME 745200150 ET-NAM 55.51.43
 * Mitteilung: TELEFONKARTEN AUFLADEN
 * Semplatas w-quobset / Nor.-At. 360605503
 * Nittrigero: FACIEIUNTRIUVIVIT 4343"; ; ;607.95;31.01.2025;535003.27
 */
function BLKBFormat1() {
	/** Return true if the transactions match this format */
    this.match = function (transactionsData) {
        
        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            var formatMatched = true;
            
            if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
                transaction["Date"].match(/^\d{2}.\d{2}.\d{4}$/))
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
        
            if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
                    transactionsData[i]["Date"].match(/^\d{2}.\d{2}.\d{4}$/)) {
                    transactionsToImport.push(this.mapTransaction(transactionsData[i]));
            }
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

	this.getFormattedData = function (inData, importUtilities) {
         var columns = importUtilities.getHeaderData(inData, 0); //array
         var rows = importUtilities.getRowData(inData, 1); //array of array
         let form = [];
   
         let convertedColumns = [];
   
         convertedColumns = this.convertHeaderDe(columns);
   
         //Load the form with data taken from the array. Create objects
         if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
         }
   
         return [];
    }

	this.mapTransaction = function (transaction) {
        let mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push(Banana.Converter.stringToCamelCase(transaction["Description"]));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["DebitAmount"], '.'));

        return mappedLine;
    }

	this.convertHeaderDe = function (columns) {
		let convertedColumns = [];
	
		for (var i = 0; i < columns.length; i++) {
		switch (columns[i]) {
			case "Auftragsdatum":
				convertedColumns[i] = "Date";
				break;
			case "Valutadatum":
				convertedColumns[i] = "DateValue";
				break;
			case "Betrag":
				convertedColumns[i] = "Amount";
				break;  
			case "Buchungstext":
				convertedColumns[i] = "Description";
				break; 
			case "Betrag Einzelzahlung (CHF)":
				convertedColumns[i] = "SinglePaymentAmount";
				break;
			case "Belastungsbetrag (CHF)":
				convertedColumns[i] = "DebitAmount";
				break;
			case "Gutschriftsbetrag (CHF)":
				convertedColumns[i] = "CreditAmount";
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
}

function BLKBOldFormat() {

	// Index of columns in csv file	
	// this.colType     		= 0;
	this.colDate     		= 0;
	this.colDescr    		= 1;
	this.colDebit    		= 2;
	this.colCredit   		= 3;	
	
	// Return true if the transactions match this format
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (var i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			var formatMatched = true;
			
			if (formatMatched && transaction[this.colDate] && transaction[this.colDate].length >= 10 &&
				transaction[this.colDate].match(/^\d{2}.\d{2}.\d{4}$/))
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

		for (var i = 0; i < transactions.length; i++) {
			if (transactions[i][this.colDate] && transactions[i][this.colDate].length >= 10 &&
				transactions[i][this.colDate].match(/^\d{2}.\d{2}.\d{4}$/)) {
				transactionsToImport.push(this.mapTransaction(transactions[i]));
			}
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (transaction) {
		var mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction[this.colDate], "dd.mm.yyyy"));
		mappedLine.push(Banana.Converter.stringToCamelCase(transaction[this.colDescr]));
		
		if (transaction[this.colCredit] && transaction[this.colCredit].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction[this.colCredit], '.'));
		else	
			mappedLine.push("");
			
		if (transaction[this.colDebit] && transaction[this.colDebit].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction[this.colDebit], '.'));
		else
			mappedLine.push("");

		return mappedLine;
	}
	

	// /**
	//  * The function completeRows complete detail rows with fields
	//  from total row and mark lines to be imported with ">" 
	// */
	// this.completeRows = function ( transactions) {

	// 	var rowType;
	// 	var date;
	// 	var debit;
	// 	var credit;

	// 	//add empty column to format with 6 columns (without Betrag Detail)
	// 	for (i=0;i<transactions.length;i++)
	// 	{
	// 		var element = transactions[i];
	// 		if (element.length!=6)
	// 			break;
	// 		element.splice(2,0,"");
	// 	}
		
	// 	for (i=0;i<transactions.length;i++)
	// 	{
	// 		var element = transactions[i];
			
	// 		if (element.length<7)
	// 			break;

	// 		//update only detail rows adding missing fields
	// 		if (element[0] == "" && rowType == "TOTAL")
	// 		{
	// 			//Detail row
	// 			//Amount is the second field
	// 			if (element[2]=="" && element[3]=="" && element[4]=="")
	// 			{
	// 				element.splice(3,1,debit);
	// 				element.splice(4,1,credit);
	// 			}
	// 			else
	// 			{
	// 				//move amount to debit credit columns
	// 				var amount = element[2];
	// 				element.splice(2,1,"");
	// 				if (debit.length>0)
	// 					element.splice(3,1,amount);
	// 				else if (credit.length>0)
	// 					element.splice(4,1,amount);
	// 			}
	// 			element.splice(0,1,date);
	// 			element.splice(0,0,">");
	// 		}
	// 		else
	// 		{
	// 			if (element[0].match(/[0-9\.]+/g))
	// 			{
	// 				//Save data from total row
	// 				rowType = "TOTAL";
	// 				date = element[0];
	// 				debit = element[3];
	// 				credit = element[4];
	// 				//check if detail follows, if not keep the row like detail row
	// 				if (i+1<transactions.length)
	// 				{
	// 					var nextElement = transactions[i+1];
	// 					if (nextElement[0].length > 0)
	// 						element.splice(0,0,">");
	// 					else	
	// 						element.splice(0,0,"");
	// 				}
	// 				//last row to keep if has date
	// 				else if (i+1==transactions.length)
	// 				{
	// 					element.splice(0,0,">");
	// 				}
	// 			}
	// 			else
	// 			{
	// 				//not considered row
	// 				rowtype = "";
	// 				element.splice(0,0,"");
	// 			}
	// 		}
	// 		transactions[i]=element;
	// 	}
	// 	return transactions;
	// }

	// /**
	//  * The function filterTransactions is used to filter the transactions
	//  * thought the method Array.filter().
	//  */
	// this.filterTransactions = function ( element, index, array) {
	// 	return element[colType] == ">";
	// }

	// /**
	//  * The function sortTransactions is used to sort the transactions
	//  * thought the method Array.sort().
	//  */
	// this.sortTransactions = function ( a, b) {
	// 	return -1;
	// }

	// /**
	//  * The function mapTransactions filter the columns and set the header line.
	//  */
	// this.mapTransactions = function ( element) {
	// 	var mappedLine = [];
		
	// 	if (element[colDate] == null || element[colDescr] == null || element[colCredit] == null || element[colDebit] == null)
	// 	{
	// 		mappedLine.push( "");
	// 		mappedLine.push( "Error importing data");
	// 		mappedLine.push( "");
	// 		mappedLine.push( "");
	// 		return mappedLine;
	// 	}
		
	// 	mappedLine.push( element[colDate]);
	// 	mappedLine.push( element[colDescr]);
	// 	if (element[colCredit].length>0)
	// 		mappedLine.push( Banana.Converter.toInternalNumberFormat( element[colCredit]));
	// 	else	
	// 		mappedLine.push( "");
			
	// 	if (element[colDebit].length>0)
	// 		mappedLine.push( Banana.Converter.toInternalNumberFormat( element[colDebit]));
	// 	else
	// 		mappedLine.push( "");
		
	// 	return mappedLine;
	// }

	// this.execute = function ( transactions) {

	// 	Banana.console.log("transactions: " + JSON.stringify(transactions));
	// 	//complete rows
	// 	transactions = this.completeRows(transactions);
		
	// 	//filter transactions
	// 	transactions = transactions.filter(this.filterTransactions);
		
	// 	//sort transactions
	//     transactions = transactions.sort(this.sortTransactions);
		
	// 	//map transactions
	// 	transactions = transactions.map(this.mapTransactions);

		

	// 	var header = [["Date", "Description", "Income", "Expenses"]];

	// 	transactions = Banana.Converter.arrayToTsv(header.concat(transactions));

	// 	Banana.console.log("transactions after map: " + JSON.stringify(transactions));
		
	// 	return transactions;
	// }
}



/**
 * The function cleanupText is used to remove useless text from input file, 
   in order to permit the conversion of data to table format.
 */
function cleanupText( string) {
	//remove tab
	string = string.replace(/\t/g, ' ');
	return string;
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


