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


// @id = ch.banana.ch.invoice.ch06.test
// @api = 1.0
// @pubdate = 2018-01-17
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.invoice.ch06.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.invoice.ch06.js
// @timeout = -1


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
Test.registerTestCase(new ReportInvoiceTemplate6());

// Here we define the class, the name of the class is not important
function ReportInvoiceTemplate6() {

}

// This method will be called at the beginning of the test case
ReportInvoiceTemplate6.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceTemplate6.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceTemplate6.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceTemplate6.prototype.cleanup = function() {

}

// All methods starting wiht 'test' will be executed
ReportInvoiceTemplate6.prototype.test1 = function() {
   //Test.logger.addKeyValue("key1", "test1");
}

ReportInvoiceTemplate6.prototype.test2 = function() {
   //Test.logger.addKeyValue("key1", "test2");
}

ReportInvoiceTemplate6.prototype.testReport = function() {
   
  Test.logger.addComment("Test ch.banana.ch.invoice.ch06.js");

  var fileAC2 = "file:script/../test/testcases/invoices_switzerland.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  
  //Banana.console.log("bandoc : " + banDoc);
  if (!banDoc) {return;}

  Test.logger.addSection("Invoice tests");

  //Invoice 35
  Test.logger.addSubSection("Test Invoice 35");
  aggiungiReport("35", "Test Invoice 35");
  
  //Invoice 36
  Test.logger.addSubSection("Test Invoice 36");
  aggiungiReport("36", "Test Invoice 36");

  //Invoice 37
  Test.logger.addSubSection("Test Invoice 37");
  aggiungiReport("37", "Test Invoice 37");

  //Invoice 47
  Test.logger.addSubSection("Test Invoice 47");
  aggiungiReport("47", "Test Invoice 47");
}

//Function that creates the report for the test
function aggiungiReport(invoiceNumber, reportName) {
  
  //Set params (normally are taken from settings)
  var param = {};
  param.print_header = true;
  param.print_isr = true;
  param.isr_bank_name = 'Aaa';
  param.isr_bank_address = 'Bbb, 6900 Lugano';
  param.isr_account = '01-103055-5';
  param.isr_id = '12345678';
  param.isr_position_scaleX = '1.0';
  param.isr_position_scaleY = '1.0';
  param.isr_position_dX = '0';
  param.isr_position_dY = '0';
  param.isr_on_new_page = false;
  param.font_family = '';
  param.color_1 = '';
  param.color_2 = '';
  param.color_3 = '';

  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceReport = printInvoice(jsonInvoice, invoiceReport, param);

  Test.logger.addReport(reportName, invoiceReport);
}


function getJsonInvoice(invoiceNumber) {
  var file;
  var parsedfile;
  var jsonInvoice;
  
  if (invoiceNumber === "35") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_35.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "36") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "37") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_37.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "47") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_47.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }

  return jsonInvoice;
}
