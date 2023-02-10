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


// @id = ch.banana.switzerland.import.akb.test
// @api = 1.0
// @pubdate = 2023-02-07
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.akb.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.akb.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.akb.sbaa/ch.banana.switzerland.import.akb.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportAkb());

// Here we define the class, the name of the class is not important
function TestImportAkb() {
}

// This method will be called at the beginning of the test case
TestImportAkb.prototype.initTestCase = function() {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportAkb.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestImportAkb.prototype.init = function() {

}

// This method will be called after every test method is executed
TestImportAkb.prototype.cleanup = function() {

}

TestImportAkb.prototype.testImport = function() {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_akb_example_format1_20220630.csv");
   fileNameList.push("file:script/../test/testcases/csv_akb_example_format1_20221231.csv");
   fileNameList.push("file:script/../test/testcases/csv_akb_example_format1_20151026.csv");
   fileNameList.push("file:script/../test/testcases/csv_akb_example_format1_20150713.csv");
   
   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent,true); //takes the exec from the import script.
      this.testLogger.addCsv('', transactions);
      
      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}