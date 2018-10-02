// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.ch.app.attestatodonazione.test
// @api = 1.0
// @pubdate = 2018-10-02
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.app.attestatodonazione.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.app.attestatodonazione.js
// @timeout = -1


var texts;

// Register test case to be executed
Test.registerTestCase(new ReportTest());

// Here we define the class, the name of the class is not important
function ReportTest() {

}

// This method will be called at the beginning of the test case
ReportTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportTest.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportTest.prototype.testBananaApp = function() {

  //Test file 1
  var file = "file:script/../test/testcases/test001.ac2";
  var donorsList = [";10001",";10002",";10003",";10004"];
  
  var userParam = {};
  userParam.costcenter = donorsList;
  userParam.account = '';
  userParam.localityAndDate = 'Lugano, 2 ottobre 2018';
  userParam.signature = 'Pinco Pallino';
  userParam.printLogo = 0;

  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, donorsList, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, donorsList, "First semester report");
  this.report_test(banDoc, "2018-07-01", "2018-12-31", userParam, donorsList, "Second semester report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, donorsList, "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", userParam, donorsList, "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", userParam, donorsList, "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", userParam, donorsList, "Fourth quarter report");

}

//Function that create the report for the test
ReportTest.prototype.report_test = function(banDoc, startDate, endDate, userParam, donorsList, reportName) {
  texts = loadTexts(banDoc);
  var report = createReport(banDoc, startDate, endDate, userParam, donorsList, texts);
  Test.logger.addReport(reportName, report);
}

