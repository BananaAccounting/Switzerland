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


// @id = ch.banana.ch.swissvatreconciliation.test
// @api = 1.0
// @pubdate = 2025-06-17
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.swissvatreconciliation.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../vatreconciliation.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new VatReconciliationTest());

// Here we define the class, the name of the class is not important
function VatReconciliationTest() {

}

// This method will be called at the beginning of the test case
VatReconciliationTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
VatReconciliationTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
VatReconciliationTest.prototype.init = function() {

}

// This method will be called after every test method is executed
VatReconciliationTest.prototype.cleanup = function() {

}

// Generate the expected (correct) file
VatReconciliationTest.prototype.test_1 = function() {
  var file = "file:script/../test/testcases/testvatreconciliation.ac2";
  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);
  var vatReconciliation = new VatReconciliation(banDoc);
  var param = vatReconciliation.initParam();

  /*
  Default param:
  {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "subdivision": "Q",
    "groupRevenues": "3",
    "groupVatTaxable": "200",
    "groupVatCodes": "1.1"
  }
  */
  
  vatReconciliation.setParam(param);
  vatReconciliation.loadData();
  var report = Banana.Report.newReport("testreport");
  var stylesheet = Banana.Report.newStyleSheet();
  vatReconciliation.printData(report, stylesheet);
  Test.logger.addReport("Test#1", report);
}

