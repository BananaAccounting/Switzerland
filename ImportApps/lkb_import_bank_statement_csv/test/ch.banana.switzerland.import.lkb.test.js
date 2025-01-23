// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.switzerland.import.lkb.test
// @api = 1.0
// @pubdate = 2023-11-03
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.lkb.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.lkb.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.lkb.sbaa/ch.banana.switzerland.import.lkb.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportLkb());

// Here we define the class, the name of the class is not important
function TestImportLkb() {
}

// This method will be called at the beginning of the test case
TestImportLkb.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportLkb.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportLkb.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportLkb.prototype.cleanup = function () {

}

TestImportLkb.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format1_2010092.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format1_20080718.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format2_20160920.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format3_20161130.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format4_20170428.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format4_20171231.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format4_20190122.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format5_20231102.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format5_20231102_details.csv");
   fileNameList.push("file:script/../test/testcases/csv_lkb_example_format6_20241231.csv");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent, true); //takes the exec from the import script.
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}