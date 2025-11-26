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
// @id = ch.banana.switzerland.import.infoniqa
// @api = 1.0
// @pubdate = 2025-05-07
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.infoniqa>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.infoniqa.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.infoniqa.sbaa/ch.banana.switzerland.import.infoniqa.js
// @timeout = -1

/**Test is executed using the file in *.csv format */


// Register test case to be executed
Test.registerTestCase(new TestImportInfoniqaTrans());

// Here we define the class, the name of the class is not important
function TestImportInfoniqaTrans() {

}

// This method will be called at the beginning of the test case
TestImportInfoniqaTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportInfoniqaTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportInfoniqaTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportInfoniqaTrans.prototype.cleanup = function () {

}
// This method will be called after every test method is executed
TestImportInfoniqaTrans.prototype.testJsonInvoiceStructure = function () {

   this.testLogger.addKeyValue("ImportFormInfoniqa", "testReport");

   let fileNameList = [];
   fileNameList.push("file:script/../test/testcases/csv_infoniqa_example_format1_2025.csv");
   fileNameList.push("file:script/../test/testcases/csv_infoniqa_example_format1_2024.csv");

   let fileAc2 = "file:script/../test/testcases/infoniqa_doubleentry_multi_withvat.ac2"; //type 100.130
   let banDoc = Banana.application.openDocument(fileAc2);
   if (!banDoc)
      this.testLogger.addFatalError("ac2 file not valid: " + fileAc2);

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   if (banDoc) {
      for (let i = 0; i < fileNameList.length; i++) {
         let fileName = fileNameList[i];
         if (fileName) {
            this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
            let file = Banana.IO.getLocalFile(fileName);
            Test.assert(file);
            let fileContent = file.read();
            Test.assert(fileContent);
            let docChangeObj = exec(fileContent, banDoc, true); //takes the exec from the import script.
            this.testLogger.addJson('', JSON.stringify(docChangeObj));
         } else {
            this.testLogger.addFatalError("File not found: " + fileName);
         }
         if (!this.progressBar.step())
            break;
      }
   } else {
      this.testLogger.addFatalError("File not found: " + fileAc2);
   }
   this.progressBar.finish();
   this.testLogger.close();
}