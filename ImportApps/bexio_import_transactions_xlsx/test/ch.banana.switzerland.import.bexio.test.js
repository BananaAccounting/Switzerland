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
//
// @id = ch.banana.switzerland.import.bexio
// @api = 1.0
// @pubdate = 2022-12-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.bexio>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.bexio.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.bexio.sbaa/ch.banana.switzerland.import.bexio.js
// @timeout = -1

/**Test is executed using the file in *.csv format */


// Register test case to be executed
Test.registerTestCase(new TestImportBexioTrans());

// Here we define the class, the name of the class is not important
function TestImportBexioTrans() {

}

// This method will be called at the beginning of the test case
TestImportBexioTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportBexioTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportBexioTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportBexioTrans.prototype.cleanup = function () {

}
// This method will be called after every test method is executed
TestImportBexioTrans.prototype.testJsonInvoiceStructure = function () {

   this.testLogger.addKeyValue("ImportFormBexio", "testReport");

   let fileNameList = [];
   fileNameList.push("file:script/../test/testcases/csv_bexio_example_format1_20221223.csv");
   fileNameList.push("file:script/../test/testcases/csv_bexio_example_format1_20231108.csv");

   let fileAc2 = "file:script/../test/testcases/Double_entry_with_foreign_currencies_and_VAT_Sales_tax_1.ac2"; //type 100.130
   let banDoc = Banana.application.openDocument(fileAc2);

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