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
// @id = ch.banana.switzerland.import.cornerbank.trans
// @api = 1.0
// @pubdate = 2021-11-05
// @publisher = Banana.ch SA
// @description = Corner Bank import Transactions CSV [BETA]
// @task = import.transactions
// @doctype = 100.*; 110.*; 130.*
// @docproperties = 
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @includejs = import.apps.js



//Main function
function exec(inData) {

	var importApps=new ImportApps();
	
	//1. Function call to define the conversion parameters
	var convertionParam = importApps.defineConversionParam();

	//2. we can eventually process the input text
	inData = importApps.preProcessInData(inData);

	//3. intermediaryData is an array of objects where the property is the banana column name
   	var intermediaryData = importApps.convertToIntermediaryData(inData, convertionParam);

	//4. translate categories and Description 
	// can define as much postProcessIntermediaryData function as needed
	importApps.postProcessIntermediaryData(intermediaryData);

   	//5. sort data
   	intermediaryData = importApps.sortData(intermediaryData, convertionParam);

   	//6. convert to banana format
	//column that start with "_" are not converted
	return importApps.convertToBananaFormat(intermediaryData);
}

