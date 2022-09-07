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
// @description = Corner Card import Transactions (*.csv) [BETA]
// @task = import.transactions
// @doctype = 100.*; 110.*; 130.*
// @docproperties = 
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @includejs = import.utilities.js

/** CSV file example


  Date			Description				Card			Currency			Amount			Status

02/11/2021		Laederach Choco			*1234		  	  CHF				 45.50		 Pending transaction
02/11/2021		Annual Quote			*1234	  		  CHF				101.80		 Settled transaction
01/11/2021		Microsoft ADV			*1234	  		  CHF				 66.90		 Settled transaction
01/11/2021		Google ADS				*1234	  		  CHF				 64.90		 Settled transaction

*/


//Main function
function exec(inData,isTest) {

	let convertionParam = "";
    let intermediaryData = "";

    if (!inData)
        return "";

	var importCornerCardTransactions=new ImportCornerCardTransactions(Banana.document);

	if (isTest!==true && !importCornerCardTransactions.verifyBananaAdvancedVersion())
		return "";
	
	//1. Function call to define the conversion parameters
	convertionParam = importCornerCardTransactions.defineConversionParam(inData);

	//2. we can eventually process the input text
	inData = importCornerCardTransactions.preProcessInData(inData);

	//3. intermediaryData is an array of objects where the property is the banana column name
   	intermediaryData = importCornerCardTransactions.convertToIntermediaryData(inData, convertionParam);

	//4. translate categories and Description 
	// can define as much postProcessIntermediaryData function as needed
	importCornerCardTransactions.postProcessIntermediaryData(intermediaryData);

   	//5. sort data
   	intermediaryData = importCornerCardTransactions.sortData(intermediaryData, convertionParam);

   	//6. convert to banana format
	//column that start with "_" are not converted
	return importCornerCardTransactions.convertToBananaFormat(intermediaryData);
}

var ImportCornerCardTransactions = class ImportCornerCardTransactions extends ImportUtilities {

	constructor(banDocument) {
		super(banDocument);
    }
	//The purpose of this function is to let the users define:
	// - the parameters for the conversion of the CSV file;
	// - the fields of the csv/table
	defineConversionParam(inData) {

		var csvData = Banana.Converter.csvToArray(inData);
        var header = String(csvData[0]);
        var convertionParam = {};

		var convertionParam = {};

		/** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
		convertionParam.format = "csv"; // available formats are "csv", "html"
		convertionParam.separator = ';';
		convertionParam.textDelim = '';

		/** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
		We suppose the data will always begin right away after the header line */
		convertionParam.headerLineStart = 0;
		convertionParam.dataLineStart = 1;


		/** SPECIFY THE COLUMN TO USE FOR SORTING
		If sortColums is empty the data are not sorted */
		convertionParam.sortColums = [""];
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
		convertionParam.rowConverter = function(inputRow) {
			var convertedRow = {};

			/** MODIFY THE FIELDS NAME AND THE CONVERTION HERE 
			*   The right part is a statements that is then executed for each inputRow
			
			/*   Field that start with the underscore "_" will not be exported 
			*    Create this fields so that you can use-it in the postprocessing function */
			
			convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Date"],"dd/mm/yyyy");
			convertedRow["Description"] = inputRow["Description"];
			convertedRow["ExternalReference"] = inputRow["Card"];
			convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow["Amount"]);
			convertedRow["Notes"] = inputRow["Status"];


			/** END */


			return convertedRow;
		};
		return convertionParam;
	}	



 	preProcessInData(inData) {
	return inData;
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

