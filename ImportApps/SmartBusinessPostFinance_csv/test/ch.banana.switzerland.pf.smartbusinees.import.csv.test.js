// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.switzerland.pf.smartbusinees.import.csv.test.test
// @api = 1.0
// @pubdate = 2021-09-09
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.pf.smartbusinees.import.csv.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.switzerland.pf.smartbusinees.import.csv.js


/*
  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report
  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();
  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);
  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());
**/

// Register test case to be executed
Test.registerTestCase(new SBImportCsvTest());

// Here we define the class, the name of the class is not important
function SBImportCsvTest() {

}

// This method will be called at the beginning of the test case
SBImportCsvTest.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
    // i file che voglio utilizzare per i test
    this.fileAC2="file:script/../test/testcases/offerte-e-fatture-test.ac2";
    this.csvInvoiceFile="file:script/../test/testcases/offerte-e-fatture-personalized-exported-test.csv";
    this.jsonDoc=this.initJson();
}

// This method will be called at the end of the test case
SBImportCsvTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
SBImportCsvTest.prototype.init = function() {

}

// This method will be called after every test method is executed
SBImportCsvTest.prototype.cleanup = function() {

}
// This method will be called after every test method is executed
SBImportCsvTest.prototype.testJsonInvoiceStructure = function() {

  this.testLogger.addKeyValue("SBImportCsvTest", "testReport");
  this.testLogger.addComment("Test Invoice import");
  

  var parentLogger = this.testLogger;
  this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(this.fileAC2));
  var banDoc = Banana.application.openDocument(this.fileAC2);
  var file = Banana.IO.getLocalFile(this.csvInvoiceFile);
  if (file) {
    fileContent = file.read();
  }else{
    this.testLogger.addFatalError("File not found: " + fileContent);
  }
  if (banDoc) {
    var jsonDocArray={};
    var transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
    var transactions_header=transactions[0];
    transactions.splice(0,1);
    var transactionsObjs=Banana.Converter.arrayToObject(transactions_header,transactions,true);
    var format_invs = new formatInvS(banDoc);
    var format = format_invs.convertInDocChange(transactionsObjs,this.jsonDoc);
    jsonDocArray=format;
    var documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);
    var reportName="FILENAME: " + this.fileAC2;
    this.testLogger.addJson(reportName, JSON.stringify(format));
  }
  else {
      this.testLogger.addFatalError("File not found: " + this.fileAC2);
  }
  this.testLogger.close();
}

//metodo per inizializzare il documento JSON
SBImportCsvTest.prototype.initJson=function(){
  var jsonDoc = {};
  jsonDoc.document = {};
  jsonDoc.document.dataUnits = [];

  jsonDoc.creator = {};
  jsonDoc.creator.executionDate = "";
  jsonDoc.creator.name = "this is a test"
  jsonDoc.creator.version = "1.0";

  return jsonDoc;
}