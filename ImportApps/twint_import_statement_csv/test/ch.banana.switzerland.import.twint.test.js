// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.switzerland.import.twint.test
// @api = 1.0
// @pubdate = 2025-09-22
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.twint.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.twint.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.twint.sbaa/ch.banana.switzerland.import.twint.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportTwint());

// Here we define the class, the name of the class is not important
function TestImportTwint() {
}

// This method will be called at the beginning of the test case
TestImportTwint.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportTwint.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportTwint.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportTwint.prototype.cleanup = function () {

}

TestImportTwint.prototype.testImportDoubleEntry = function () {
   let fileNameList = [];
   let ac2File = "file:script/../test/testcases/Double-entry test Twint.ac2";

   fileNameList.push("file:script/../test/testcases/csv_twint_example_format1_business_20231120.csv");
   fileNameList.push("file:script/../test/testcases/csv_twint_example_format1_business_20250902.csv");

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);
   let importUtilities = new ImportUtilities(banDocument);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   for (let i = 0; i < fileNameList.length; i++) {
      let fileName = fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file, "file not valid");
      let fileContent = file.read();
      Test.assert(fileContent, "file content not readable");
      let userParam = getUserParam_DoubleEntry();
      let transactions = processTwintTransactions(fileContent, userParam, banDocument, importUtilities);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

TestImportTwint.prototype.testImportIncomeExpenses = function () {
   let fileNameList = [];
   let ac2File = "file:script/../test/testcases/Income & Expenses test Twint.ac2";

   fileNameList.push("file:script/../test/testcases/csv_twint_example_format1_business_20231120.csv");

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);
   let importUtilities = new ImportUtilities(banDocument);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   for (let i = 0; i < fileNameList.length; i++) {

      let fileName = fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      let fileContent = file.read();
      Test.assert(fileContent);
      let userParam = getUserParam_IncomeExpenses();
      let transactions = processTwintTransactions(fileContent, userParam, banDocument, importUtilities);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

function getUserParam_DoubleEntry() {
   var params = {};

   params.dateFormat = "yyyy.mm.dd";
   params.twintAccount = "1000"; // Bank account
   params.twintIn = "3600"; // Revenues account.
   params.twintFee = "6940"; // Costs account.

   return params;

}

function getUserParam_IncomeExpenses() {
   var params = {};

   params.dateFormat = "yyyy.mm.dd";
   params.twintAccount = "1000"; // Bank account
   params.twintIn = "3000"; // Revenues account.
   params.twintFee = "6900"; // Costs account.

   return params;

}