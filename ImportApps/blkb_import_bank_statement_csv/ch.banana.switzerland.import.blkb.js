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


/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec( string) {

	string = cleanupText( string);

	var importUtilities = new ImportUtilities(Banana.document);
	var fieldSeparator = findSeparator(string);
	var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');
	transactions = completeRows(transactions);
    transactions = transactions.filter(filterTransactions);
    transactions = transactions.sort(sortTransactions);
    transactions = transactions.map(mapTransactions);

    var header = [["Date","Description","Income","Expenses"]];
    return Banana.Converter.arrayToTsv( header.concat(transactions));
}

// This is the implementation of the importing filter

// Index of columns in csv file
var colType     		= 0;
var colDate     		= 1;
var colDescr    		= 2;
var colDebit    		= 4;
var colCredit   		= 5;


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
 * The function completeRows complete detail rows with fields
 from total row and mark lines to be imported with ">" 
 */
function completeRows( transactions) {

	var rowType;
	var date;
	var debit;
	var credit;

	//add empty column to format with 6 columns (without Betrag Detail)
	for (i=0;i<transactions.length;i++)
	{
		var element = transactions[i];
		if (element.length!=6)
			break;
		element.splice(2,0,"");
	}
	
	for (i=0;i<transactions.length;i++)
	{
		var element = transactions[i];
		
		if (element.length<7)
			break;

		//update only detail rows adding missing fields
		if (element[0] == "" && rowType == "TOTAL")
		{
			//Detail row
			//Amount is the second field
			if (element[2]=="" && element[3]=="" && element[4]=="")
			{
				element.splice(3,1,debit);
				element.splice(4,1,credit);
			}
			else
			{
				//move amount to debit credit columns
				var amount = element[2];
				element.splice(2,1,"");
				if (debit.length>0)
					element.splice(3,1,amount);
				else if (credit.length>0)
					element.splice(4,1,amount);
			}
			element.splice(0,1,date);
			element.splice(0,0,">");
		}
		else
		{
			if (element[0].match(/[0-9\.]+/g))
			{
				//Save data from total row
				rowType = "TOTAL";
				date = element[0];
				debit = element[3];
				credit = element[4];
				//check if detail follows, if not keep the row like detail row
				if (i+1<transactions.length)
				{
					var nextElement = transactions[i+1];
					if (nextElement[0].length > 0)
						element.splice(0,0,">");
					else	
						element.splice(0,0,"");
				}
				//last row to keep if has date
				else if (i+1==transactions.length)
				{
					element.splice(0,0,">");
				}
			}
			else
			{
				//not considered row
				rowtype = "";
				element.splice(0,0,"");
			}
		}
		transactions[i]=element;
	}
	return transactions;
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

/**
 * The function filterTransactions is used to filter the transactions
 * thought the method Array.filter().
 */
function filterTransactions( element, index, array) {
    return element[colType] == ">";
}

/**
 * The function sortTransactions is used to sort the transactions
 * thought the method Array.sort().
 */
function sortTransactions( a, b) {
	return -1;
}

/**
 * The function mapTransactions filter the columns and set the header line.
 */
function mapTransactions( element) {
    var mappedLine = [];
	
	if (element[colDate] == null || element[colDescr] == null || element[colCredit] == null || element[colDebit] == null)
	{
		mappedLine.push( "");
		mappedLine.push( "Error importing data");
		mappedLine.push( "");
		mappedLine.push( "");
		return mappedLine;
	}
	
	mappedLine.push( element[colDate]);
	mappedLine.push( element[colDescr]);
	if (element[colCredit].length>0)
		mappedLine.push( Banana.Converter.toInternalNumberFormat( element[colCredit]));
	else	
		mappedLine.push( "");
		
	if (element[colDebit].length>0)
		mappedLine.push( Banana.Converter.toInternalNumberFormat( element[colDebit]));
	else
		mappedLine.push( "");
	
    return mappedLine;
}
