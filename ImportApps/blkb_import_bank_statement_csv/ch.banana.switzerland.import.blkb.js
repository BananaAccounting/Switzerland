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

var applicationSupportIsDetail = Banana.compareVersion &&
   (Banana.compareVersion(Banana.application.version, "10.0.12") >= 0);
/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
       return "";

	var cleanString = string;
	if (cleanString.match(/""/)) {
		cleanString = cleanString.replace(/^"/g, "");
		cleanString = cleanString.replace(/"$/g, "");
		cleanString = cleanString.replace(/""/g, '');
	}

	var fieldSeparator = findSeparator(cleanString);

	var transactions = Banana.Converter.csvToArray(cleanString, fieldSeparator, '"');

	var blkbFormat4 = new BLKBFormat4();
	let transactionsData = blkbFormat4.getFormattedData(transactions, importUtilities);
	if (blkbFormat4.match(transactionsData)) {
		transactions = blkbFormat4.convert(transactionsData);
		return Banana.Converter.arrayToTsv(transactions);
	}	

	// Basellandschaftliche Kantonalbank Format, this format works with the header names.
    var blkbFormat3 = new BLKBFormat3();
    transactionsData = blkbFormat3.getFormattedData(transactions, importUtilities);
    if (blkbFormat3.match(transactionsData)) {
       transactions = blkbFormat3.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }

	// Basellandschaftliche Kantonalbank Format, this format works with the header names.
	var blkbFormat2 = new BLKBFormat2();
	transactionsData = blkbFormat2.getFormattedData(transactions, importUtilities);
	if (blkbFormat2.match(transactionsData)) {
		transactions = blkbFormat2.convert(transactionsData);
		return Banana.Converter.arrayToTsv(transactions);
	}

    // Basellandschaftliche Kantonalbank Old Format, this format works with the column index.
	var blkbFormat1 = new BLKBFormat1();
	if (blkbFormat1.match(transactions)) {
		transactions = blkbFormat1.convert(transactions);
		return Banana.Converter.arrayToTsv(transactions);
	}

	importUtilities.getUnknownFormatError();

    return "";
}

/**
 * Format 4
 * 
 * Auftragsdatum;Buchungstext;Betrag Einzelzahlung (CHF);Belastungsbetrag (CHF);Gutschriftsbetrag (CHF);Valutadatum;Saldo (CHF)
 * 31.01.2025;"Menetianduperum / Nor.-At. 258750247
 * COMNIUVA-CONE 6
 * Puniurem: ME 745200150 ET-NAM 55.51.43
 * Mitteilung: TELEFONKARTEN AUFLADEN
 * Semplatas w-quobset / Nor.-At. 360605503
 * Nittrigero: FACIEIUNTRIUVIVIT 4343"; ; ;607.95;31.01.2025;535003.27
 */
function BLKBFormat4() {
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

		var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;
        var lastCompleteTransactionPrinted = false;

        // Filter and map rows
        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            if (transaction["Description"]) { //Valid transaction (complete & detail).
                if (!this.isDetailRow(transaction)) { // Normal row.
                    lastCompleteTransactionPrinted = false;
                    if (isPreviousCompleteTransaction) {
                        transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                    }
                    lastCompleteTransaction = transaction;
                    isPreviousCompleteTransaction = true;
                } else { // Detail row.
                    if (transaction['SinglePaymentAmount'] && transaction['SinglePaymentAmount'].length > 1) {
						Banana.console.log("Detail row with single payment amount: " + JSON.stringify(transaction));
                        if (applicationSupportIsDetail && !lastCompleteTransactionPrinted) {
                            lastCompleteTransaction['IsDetail'] = 'S';
                            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                            lastCompleteTransactionPrinted = true;
                        }
                        this.fillDetailRow(transaction, lastCompleteTransaction);
                        if (applicationSupportIsDetail) {
                            transaction['IsDetail'] = 'D';
                        }
                        transactionsToImport.push(this.mapTransaction(transaction));
                        isPreviousCompleteTransaction = false;
                    } else {
                        this.fillDetailRow(transaction, lastCompleteTransaction);
                        transactionsToImport.push(this.mapTransaction(transaction));
                        isPreviousCompleteTransaction = false;
                    }
                }
            }
        }

        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

		// Sort rows by date, keeping detail rows grouped after their parent summary row.
        // First, group transactions into blocks: each block starts with a non-detail row
        // and includes all subsequent detail rows.
        var groups = [];
        var currentGroup = [];
        for (var j = 0; j < transactionsToImport.length; j++) {
            var isDetail = transactionsToImport[j][6]; // IsDetail column
            if (isDetail === 'D' && currentGroup.length > 0) {
                // Detail row belongs to the current group
                currentGroup.push(transactionsToImport[j]);
            } else {
                // Start a new group (summary or normal row)
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = [transactionsToImport[j]];
            }
        }
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        // Reverse the groups to sort by date ascending
        groups.reverse();

        // Flatten groups back into a single array
        transactionsToImport = [];
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].length; j++) {
                transactionsToImport.push(groups[i][j]);
            }
        }

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses", "IsDetail"]];
        return header.concat(transactionsToImport);
    }

	this.fillDetailRow = function (detailRow, totalRow) {
        // Copy dates
        detailRow["Date"] = totalRow["Date"];
        detailRow["DateValue"] = totalRow["DateValue"];
        if (detailRow["SinglePaymentAmount"] && detailRow["SinglePaymentAmount"].length > 1) {
            if (totalRow["DebitAmount"].length > 1) {
                detailRow["DebitAmount"] = detailRow["SinglePaymentAmount"];
            } else if (totalRow["CreditAmount"].length > 1) {
                detailRow["CreditAmount"] = detailRow["SinglePaymentAmount"];
            }
        } else {
            detailRow["DebitAmount"] = totalRow["DebitAmount"];
            detailRow["CreditAmount"] = totalRow["CreditAmount"];
        }
    }

    this.isDetailRow = function (transaction) {
        if (transaction["Date"].trim().length === 0
            && transaction["DateValue"].trim().length === 0)
            return true;
        return false;
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
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push(Banana.Converter.stringToCamelCase(transaction["Description"].replace(/\s+/g, ' ').trim()));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["DebitAmount"], '.'));
		mappedLine.push(transaction["IsDetail"]);

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

/**
 * Format 3
 * 
 * 
 */
function BLKBFormat3() {
	/** Return true if the transactions match this format */
	this.match = function (transactionsData) {
		
		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];
			var formatMatched = true;
			
			if (formatMatched && transaction["Datum"] && transaction["Datum"].length >= 8 &&
				transaction["Datum"].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction["Valuta"] && transaction["Valuta"].length >= 8 &&
				transaction["Valuta"].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/))
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
			if (transactionsData[i]["Datum"] && transactionsData[i]["Datum"].length >= 8 &&
				transactionsData[i]["Datum"].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) &&
				transactionsData[i]["Valuta"] && transactionsData[i]["Valuta"].length >= 8 &&
				transactionsData[i]["Valuta"].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
				transactionsToImport.push(this.mapTransaction(transactionsData[i]));
			}
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.getFormattedData = function(inData, importUtilities) {
		var columns = importUtilities.getHeaderData(inData, 0); //array
		var rows = importUtilities.getRowData(inData, 1); //array of array
		let form = [];
		//Load the form with data taken from the array. Create objects
		importUtilities.loadForm(form, columns, rows);
		return form;
	}

	this.mapTransaction = function (transaction) {
		let mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Datum"], "mm/dd/yyyy"));
		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Valuta"], "mm/dd/yyyy"));
		mappedLine.push("");
		mappedLine.push(Banana.Converter.stringToCamelCase(transaction["Buchungstext"]));
		
		if (transaction["Gutschrift"] && transaction["Gutschrift"].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Gutschrift"], '.'));
		else	
			mappedLine.push("");
			
		if (transaction["Belastung"] && transaction["Belastung"].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Belastung"], '.'));
		else
			mappedLine.push("");

		return mappedLine;
	}
}

function BLKBFormat2() {
	/** Return true if the transactions match this format */
	this.match = function (transactionsData) {
		
		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];
			var formatMatched = true;
			
			if (formatMatched && transaction["Datum"] && transaction["Datum"].length >= 10 &&
				transaction["Datum"].match(/^\d{2}.\d{2}.\d{4}$/) && transaction.hasOwnProperty("Valuta"))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction["Valuta"] && transaction["Valuta"].length >= 10 &&
				transaction["Valuta"].match(/^\d{2}.\d{2}.\d{4}$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (transaction.hasOwnProperty("Betrag Einzelzahlung") || transaction.hasOwnProperty("Betrag Detail")) {
				formatMatched = false;
				continue;
			}

			if (formatMatched)
				return true;
		}

		return false;
	}
	
	this.convert = function (transactionsData) {
		var transactionsToImport = [];

		for (var i = 0; i < transactionsData.length; i++) {
			if (transactionsData[i]["Datum"] && transactionsData[i]["Datum"].length >= 10 &&
				transactionsData[i]["Datum"].match(/^\d{2}.\d{2}.\d{4}$/) &&
				transactionsData[i]["Valuta"] && transactionsData[i]["Valuta"].length >= 10 &&
				transactionsData[i]["Valuta"].match(/^\d{2}.\d{2}.\d{4}$/)) {
				transactionsToImport.push(this.mapTransaction(transactionsData[i]));
			}
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.getFormattedData = function(inData, importUtilities) {
		var columns = importUtilities.getHeaderData(inData, 0); //array
		var rows = importUtilities.getRowData(inData, 1); //array of array
		let form = [];
		//Load the form with data taken from the array. Create objects
		importUtilities.loadForm(form, columns, rows);
		return form;
	}

	this.mapTransaction = function (transaction) {
		let mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Datum"], "dd.mm.yyyy"));
		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Valuta"], "dd.mm.yyyy"));
		mappedLine.push("");
		mappedLine.push(Banana.Converter.stringToCamelCase(transaction["Buchungstext"]));
		
		if (transaction["Gutschrift"] && transaction["Gutschrift"].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Gutschrift"], '.'));
		else	
			mappedLine.push("");
			
		if (transaction["Belastung"] && transaction["Belastung"].length > 0)
			mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Belastung"], '.'));
		else
			mappedLine.push("");

		return mappedLine;

	}
}

/**
 * 	Format 1
 * 
 * 
 * 
 **/
function BLKBFormat1() {

	// Index of columns in csv file	
	this.colDate     		= 0;
	this.colDescr    		= 1;
	this.colDetail			= 2; // Amount of single payment
	this.colDebit    		= 3;
	this.colCredit   		= 4;	
	this.colDateValuta   	= 5; // Valuta date
	
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

			if (formatMatched && transaction[this.colDateValuta] && transaction[this.colDateValuta].length >= 10 &&
				transaction[this.colDateValuta].match(/^\d{2}.\d{2}.\d{4}$/))
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

		/** Complete, filter and map rows */
		var lastCompleteTransaction = null;
		var isPreviousCompleteTransaction = false;
		var lastCompleteTransactionPrinted = false;

		for (i = 1; i < transactions.length; i++) // First row contains the header
		{
			var transaction = transactions[i];

			if (transaction.length === 0) {
				// Righe vuote
				continue;
			} else if (!this.isDetailRow(transaction)) { // Normal row
				lastCompleteTransactionPrinted = false;
				if (isPreviousCompleteTransaction === true && transaction[this.colDate].match(/^\d{2}.\d{2}.\d{4}$/)) {
					transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));					
				}		
				if (transaction[this.colDate].match(/^\d{2}.\d{2}.\d{4}$/))	{
					lastCompleteTransaction = transaction;
					isPreviousCompleteTransaction = true;
				}
			} else { // Detail row
				if (transaction[this.colDetail] && transaction[this.colDetail].length > 0) {
					// Adding total row first, if not yet added
					if (applicationSupportIsDetail && !lastCompleteTransactionPrinted) {
						lastCompleteTransaction['IsDetail'] = 'S';
						transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
						lastCompleteTransactionPrinted = true;
					}
					// Then add detail row
					this.fillDetailRow(transaction, lastCompleteTransaction);
					if (applicationSupportIsDetail) {
						transaction['IsDetail'] = 'D';
					}
					transactionsToImport.push(this.mapTransaction(transaction));
					isPreviousCompleteTransaction = false;
				} else {
					this.fillDetailRow(transaction, lastCompleteTransaction);
					transactionsToImport.push(this.mapTransaction(transaction));
					isPreviousCompleteTransaction = false;
				}
			}
		}
		if (isPreviousCompleteTransaction === true) {
			transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "Description", "Income", "Expenses", "IsDetail"]];
		return header.concat(transactionsToImport);
	}

	/** Return true if the transaction is a transaction row */
	this.isDetailRow = function (transaction) {
		if (transaction[this.colDate].length === 0) {// Date (first field) is empty		
			return true;
		}
		return false;
	}

	/** Fill the detail rows with the missing values. The value are copied from the preceding total row */
	this.fillDetailRow = function (detailRow, totalRow) {
		// Copy dates		
		detailRow[this.colDate] = totalRow[this.colDate];

		// Copy amount from complete row to detail row
		if (detailRow[this.colDetail] && detailRow[this.colDetail].length > 0) {
			if (totalRow[this.colDebit].length > 0) {
				detailRow[this.colDebit] = detailRow[this.colDetail];
			} else if (totalRow[this.colCredit].length > 0) {
				detailRow[this.colCredit] = detailRow[this.colDetail];
			}
		} else {
			detailRow[this.colDebit] = totalRow[this.colDebit];
			detailRow[this.colCredit] = totalRow[this.colCredit];
		}
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
		mappedLine.push(transaction["IsDetail"]);

		return mappedLine;
	}
	
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


