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


// @id = ch.banana.switzerland.import.creditsuisse.test
// @api = 1.0
// @pubdate = 2025-10-03
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.creditsuisse.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.creditsuisse.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.creditsuisse.sbaa/ch.banana.switzerland.import.creditsuisse.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportCreditSuisse());

// Here we define the class, the name of the class is not important
function TestImportCreditSuisse() {
}

// This method will be called at the beginning of the test case
TestImportCreditSuisse.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportCreditSuisse.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportCreditSuisse.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportCreditSuisse.prototype.cleanup = function () {

}

TestImportCreditSuisse.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format1_20111109.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format1_20121115.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format1_20190930.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format2_20170301.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format3_20171103.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format4_20230901.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format4_20230905.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format5_20240108.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format5_20240901.csv");
   fileNameList.push("file:script/../test/testcases/csv_creditsuisse_example_format5_20251003.csv");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent, true);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}