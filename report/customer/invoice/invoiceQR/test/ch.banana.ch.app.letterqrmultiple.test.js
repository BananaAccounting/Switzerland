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


// @id = ch.banana.ch.app.letterqrmultiple.test
// @api = 1.0
// @pubdate = 2022-04-15
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.app.letterqrmultiple.test.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.app.letterqrmultiple.js
// @includejs = ../swissqrcode.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report
**/





// Register test case to be executed
Test.registerTestCase(new ReportLetterQrMultiple());

// Here we define the class, the name of the class is not important
function ReportLetterQrMultiple() {

}

// This method will be called at the beginning of the test case
ReportLetterQrMultiple.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportLetterQrMultiple.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportLetterQrMultiple.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportLetterQrMultiple.prototype.cleanup = function() {

}

ReportLetterQrMultiple.prototype.testReport = function() {
  
  //Test 1a
  this.add_test_1a();

  //Test 1b
  this.add_test_1b();

}

//Test 1a: structured customer addresses
ReportLetterQrMultiple.prototype.add_test_1a = function() {

  BAN_ADVANCED = true;

  var fileAC2 = "file:script/../test/testcases/qrtable_structured.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  Test.logger.addSection("Test file: " + fileAC2);

  var userParam = initUserParam();
  userParam.print_title_text = 'Titolo test 1a';
  userParam.print_begin_text = 'Testo iniziale test 1a';
  userParam.print_final_text = 'Testo finale test 1a';
  userParam.print_text = true;
  userParam.print_date = true;
  userParam.print_date_text = 'Testo data test 1a';
  userParam.print_sender_address = true;
  userParam.print_customer_address = true;
  userParam.language = "IT";
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';
  userParam.css = '';
  userParam.print_multiple_rows = '1-8';
  userParam.print_multiple_details = true;
  userParam.print_multiple_empty_amount = true; //include amount

  var rowsToPrint = getRowsToPrint(userParam);
  rowsToPrint = checkRowsToPrint(banDoc, userParam, rowsToPrint);
  if (rowsToPrint.length > 0) {
    for (var i = 0; i < rowsToPrint.length; i++) {
      var rowObject = {};
      rowObject = getRowObject(banDoc, rowObject, rowsToPrint[i]);
      var reportParam = {};
      reportParam = initReportMultiple(banDoc, userParam, reportParam, rowObject, rowsToPrint[i]);
      var report = Banana.Report.newReport("QR-Bill report");
      printReport(banDoc, report, "", reportParam, rowsToPrint[i]);
      Test.logger.addReport("",report);
      var text = getQRCodeText(banDoc, reportParam, "", 'it');
      Test.logger.addText(text);
    }
  }
}

//Test 1b: combined customer addresses
ReportLetterQrMultiple.prototype.add_test_1b = function() {

  BAN_ADVANCED = true;

  var fileAC2 = "file:script/../test/testcases/qrtable_combined.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  Test.logger.addSection("Test file: " + fileAC2);

  var userParam = initUserParam();
  userParam.print_title_text = 'Titolo test 1b';
  userParam.print_begin_text = 'Testo iniziale test 1b';
  userParam.print_final_text = 'Testo finale test 1b';
  userParam.print_text = true;
  userParam.print_date = true;
  userParam.print_date_text = 'Testo data test 1b';
  userParam.print_sender_address = true;
  userParam.print_customer_address = true;
  userParam.language = "IT";
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';
  userParam.css = '';
  userParam.print_multiple_rows = '1-8';
  userParam.print_multiple_details = true;
  userParam.print_multiple_empty_amount = true; //include amount

  var rowsToPrint = getRowsToPrint(userParam);
  rowsToPrint = checkRowsToPrint(banDoc, userParam, rowsToPrint);
  if (rowsToPrint.length > 0) {
    for (var i = 0; i < rowsToPrint.length; i++) {
      var rowObject = {};
      rowObject = getRowObject(banDoc, rowObject, rowsToPrint[i]);
      var reportParam = {};
      reportParam = initReportMultiple(banDoc, userParam, reportParam, rowObject, rowsToPrint[i]);
      var report = Banana.Report.newReport("QR-Bill report");
      printReport(banDoc, report, "", reportParam, rowsToPrint[i]);
      Test.logger.addReport("",report);
      var text = getQRCodeText(banDoc, reportParam, "", 'it');
      Test.logger.addText(text);
    }
  }
}


function getQRCodeText(banDoc, qrSettings, texts, langCode) {
  var qrBill = new QRBill(banDoc, qrSettings);
  qrBill.defineQrBillType(qrSettings);
  var texts = qrBill.getQrCodeTexts(langCode);
  var qrcodeData = qrBill.getQrCodeDataDirect(qrSettings, texts, langCode);
  var text = qrBill.createTextQrImage(qrcodeData, texts);
  return text;
}

