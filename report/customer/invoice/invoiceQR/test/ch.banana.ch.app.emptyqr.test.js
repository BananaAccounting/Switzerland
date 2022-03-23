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


// @id = ch.banana.ch.app.emptyqr.test
// @api = 1.0
// @pubdate = 2022-03-18
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.app.emptyqr.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.app.emptyqr.js
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
Test.registerTestCase(new ReportEmptyQr());

// Here we define the class, the name of the class is not important
function ReportEmptyQr() {

}

// This method will be called at the beginning of the test case
ReportEmptyQr.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportEmptyQr.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportEmptyQr.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportEmptyQr.prototype.cleanup = function() {

}

ReportEmptyQr.prototype.testReport = function() {
   
  Test.logger.addComment("Test Empty QR");

  var fileAC2 = "file:script/../test/testcases/app_emptyqr.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }

  Test.logger.addSection("Test file: " + fileAC2);

  //Test NON
  Test.logger.addSubSection("Test 1: NON");
  this.add_test_non_1(banDoc);
  //Test NON, NEGATIVE: Without reference with QR-IBAN (wrong, should be IBAN)
  Test.logger.addSubSection("Test 2 negative: NON with QR-IBAN");
  this.add_test_non_2(banDoc);
  //Test NON, no text at the beginning
  Test.logger.addSubSection("Test 3: NON without beginning text");
  this.add_test_non_3(banDoc);
  //Test NON, IBAN chf from File->Properties
  Test.logger.addSubSection("Test 4: NON, IBAN chf from File->Properties");
  this.add_test_non_4(banDoc);
  //Test NON, IBAN eur from File->Properties
  Test.logger.addSubSection("Test 5: NON, IBAN eur from File->Properties");
  this.add_test_non_5(banDoc);
  //Test NON, IBAN chf from extension settings
  Test.logger.addSubSection("Test 6: NON, IBAN chf from extension settings");
  this.add_test_non_6(banDoc);
  //Test NON, IBAN eur from extension settings
  Test.logger.addSubSection("Test 7: NON, IBAN eur from extension settings");
  this.add_test_non_7(banDoc);
  //Test QR-IBAN chf from extension settings. QR-IBAN is not allowed, returns error "Incorrect IBAN..."
  Test.logger.addSubSection("Test 8: QR-IBAN chf from extension settings");
  this.add_test_non_8(banDoc);
  //Test, Include amount 1234.56
  Test.logger.addSubSection("Test 9: Include amount 1234.56");
  this.add_test_non_9(banDoc);
  //Test, Include amount 1234,56
  Test.logger.addSubSection("Test 10: Include amount 1234,56");
  this.add_test_non_10(banDoc);
  //Test, Include amount 1'234.56
  Test.logger.addSubSection("Test 11: Include amount 1'234.56");
  this.add_test_non_11(banDoc);
  //Test, Include amount 1'234,56
  Test.logger.addSubSection("Test 12: Include amount 1'234,56");
  this.add_test_non_12(banDoc);
  //Test, Include amount 1234
  Test.logger.addSubSection("Test 13: Include amount 1234");
  this.add_test_non_13(banDoc);
  //Test, Include amount 1234.00
  Test.logger.addSubSection("Test 14: Include amount 1234.00");
  this.add_test_non_14(banDoc);
  //Test, Include amount 1234,00
  Test.logger.addSubSection("Test 15: Include amount 1234,00");
  this.add_test_non_15(banDoc);
  //Test, Include amount 0.00
  Test.logger.addSubSection("Test 16: Include amount 0.00");
  this.add_test_non_16(banDoc);
  //Test, Include amount 0,00
  Test.logger.addSubSection("Test 17: Include amount 0,00");
  this.add_test_non_17(banDoc);
  //Test, Include amount 0
  Test.logger.addSubSection("Test 18: Include amount 0");
  this.add_test_non_18(banDoc);
  //Test, Include empty amount
  Test.logger.addSubSection("Test 19: Include empty amount");
  this.add_test_non_19(banDoc);
  //Test, Amount but excluded
  Test.logger.addSubSection("Test 20: Amount but excluded");
  this.add_test_non_20(banDoc);
  //Test, Include amount 1234.56 eur
  Test.logger.addSubSection("Test 21: Include amount 1234.56 eur");
  this.add_test_non_21(banDoc);
  //Test, 'Payable to' address, 'Payable by' address, Include amount 1234.56 chf
  Test.logger.addSubSection("Test 22: 'Payable to' address, 'Payable by' address, Include amount 1234.56 chf");
  this.add_test_non_22(banDoc);
  //Test, 'Payable by' Address, Include amount 1234.56 chf
  Test.logger.addSubSection("Test 23: 'Payable by' Address, Include amount 1234.56 chf");
  this.add_test_non_23(banDoc);
  //Test, 'Payable by' Address, no amount
  Test.logger.addSubSection("Test 24: 'Payable by' Address, no amount");
  this.add_test_non_24(banDoc);

  //Test additional information

  //Test letter, sender address

  //Test letter, customer address

  //Test letter, date

  //Test letter, free text

  //Test letter, total amount

  

}

ReportEmptyQr.prototype.add_test_non_1 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

ReportEmptyQr.prototype.add_test_non_2 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Without text
ReportEmptyQr.prototype.add_test_non_3 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.print_text = false;

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/IBAN chf from File->Properties
ReportEmptyQr.prototype.add_test_non_4 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/IBAN eur from File->Properties
ReportEmptyQr.prototype.add_test_non_5 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.currency = "EUR";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/IBAN chf from extension settings
ReportEmptyQr.prototype.add_test_non_6 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.sender_address_from_accounting = false;
  userParam.sender_address_name = 'Mario Rossi';
  userParam.sender_address_address = 'Via al sole';
  userParam.sender_address_house_number = '8';
  userParam.sender_address_postal_code = '6900';
  userParam.sender_address_locality = 'Lugano';
  userParam.sender_address_country_code = 'CH';
  userParam.sender_address_iban = 'CH5204835012345671000';
  userParam.currency = "CHF";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/IBAN eur from extension settings
ReportEmptyQr.prototype.add_test_non_7 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.sender_address_from_accounting = false;
  userParam.sender_address_name = 'Mario Rossi';
  userParam.sender_address_address = 'Via al sole';
  userParam.sender_address_house_number = '8';
  userParam.sender_address_postal_code = '6900';
  userParam.sender_address_locality = 'Lugano';
  userParam.sender_address_country_code = 'CH';
  userParam.sender_address_iban = 'CH5204835012345671000';
  userParam.currency = "EUR";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/QR-IBAN chf from extension settings
// QR-IBAN is not allowed, returns error "Incorrect IBAN..."
ReportEmptyQr.prototype.add_test_non_8 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.sender_address_from_accounting = false;
  userParam.sender_address_name = 'Mario Rossi';
  userParam.sender_address_address = 'Via al sole';
  userParam.sender_address_house_number = '8';
  userParam.sender_address_postal_code = '6900';
  userParam.sender_address_locality = 'Lugano';
  userParam.sender_address_country_code = 'CH';
  userParam.sender_address_iban = 'CH4431999123000889012';
  userParam.currency = "CHF";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234.56
ReportEmptyQr.prototype.add_test_non_9 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = '1234.56';

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234,56
ReportEmptyQr.prototype.add_test_non_10 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = '1234,56';

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1'234.56
ReportEmptyQr.prototype.add_test_non_11 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "1'234.56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1'234,56
ReportEmptyQr.prototype.add_test_non_12 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "1'234,56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234
ReportEmptyQr.prototype.add_test_non_13 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "1234";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234.00
ReportEmptyQr.prototype.add_test_non_14 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "1234.00";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234,00
ReportEmptyQr.prototype.add_test_non_15 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "1234,00";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 0.00
ReportEmptyQr.prototype.add_test_non_16 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "0.00";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 0,00
ReportEmptyQr.prototype.add_test_non_17 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "0,00";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 0
ReportEmptyQr.prototype.add_test_non_18 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "0";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include empty amount
ReportEmptyQr.prototype.add_test_non_19 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = true;
  userParam.total_amount = "";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Amount but excluded
ReportEmptyQr.prototype.add_test_non_20 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.amount_include = false;
  userParam.total_amount = "1234.56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// Include amount 1234.56 eur
ReportEmptyQr.prototype.add_test_non_21 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.currency = "EUR";
  userParam.amount_include = true;
  userParam.total_amount = "1234.56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable to' Address/IBAN, 'Payable by' Address, Include amount 1234.56 chf
// Everything from extension settings
ReportEmptyQr.prototype.add_test_non_22 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.sender_address_from_accounting = false;
  userParam.sender_address_name = 'Mario Rossi';
  userParam.sender_address_address = 'Via al sole';
  userParam.sender_address_house_number = '8';
  userParam.sender_address_postal_code = '6900';
  userParam.sender_address_locality = 'Lugano';
  userParam.sender_address_country_code = 'CH';
  userParam.sender_address_iban = 'CH5204835012345671000';
  userParam.customer_address_include = true;
  userParam.customer_address_name = 'Giovanni Verdi';
  userParam.customer_address_address = 'Via alla Chiesa';
  userParam.customer_address_house_number = '12';
  userParam.customer_address_postal_code = '6962';
  userParam.customer_address_locality = 'Viganello';
  userParam.customer_address_country_code = 'CH';
  userParam.currency = "CHF";
  userParam.amount_include = true;
  userParam.total_amount = "1234.56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  //var report = Banana.Report.newReport("QR-Bill report");
    var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable by' Address, Include amount 1234.56 chf
ReportEmptyQr.prototype.add_test_non_23 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.customer_address_include = true;
  userParam.customer_address_name = 'Giovanni Verdi';
  userParam.customer_address_address = 'Via alla Chiesa';
  userParam.customer_address_house_number = '12';
  userParam.customer_address_postal_code = '6962';
  userParam.customer_address_locality = 'Viganello';
  userParam.customer_address_country_code = 'CH';
  userParam.amount_include = true;
  userParam.total_amount = "1234.56";

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  //var report = Banana.Report.newReport("QR-Bill report");
    var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}

// 'Payable by' Address, no amount
ReportEmptyQr.prototype.add_test_non_24 = function(banDoc) {

  var texts = setTexts('en');
  var userParam = initUserParam();
  userParam.customer_address_include = true;
  userParam.customer_address_name = 'Giovanni Verdi';
  userParam.customer_address_address = 'Via alla Chiesa';
  userParam.customer_address_house_number = '12';
  userParam.customer_address_postal_code = '6962';
  userParam.customer_address_locality = 'Viganello';
  userParam.customer_address_country_code = 'CH';

  Banana.console.log(userParam.currency);
  //var invoiceObj = initJSON(banDoc, userParam);
  var qrSettings = initQRSettings(userParam);
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddress(userParam, qrSettings);
  setAmount(userParam, qrSettings);
  
  var reportParam = JSON.parse(JSON.stringify(userParam));
  reportParam = Object.assign(reportParam, qrSettings);

  //var report = Banana.Report.newReport("QR-Bill report");
    var report = Banana.Report.newReport("QR-Bill report");
  printReportSingle(banDoc, report, "", texts, reportParam);
  Test.logger.addReport("",report);
  
  var text = getQRCodeText(banDoc, reportParam, "", 'en');
  Test.logger.addText(text);
}




function initUserParam() {
  var userParam = {};
  userParam.print_msg_text = 'The QR payment part without address and amount is at the bottom of the page.';
  userParam.print_text = true;
  userParam.sender_address_from_accounting = true;
  userParam.sender_address_name = '';
  userParam.sender_address_address = '';
  userParam.sender_address_house_number = '';
  userParam.sender_address_postal_code = '';
  userParam.sender_address_locality = '';
  userParam.sender_address_country_code = '';
  userParam.sender_address_iban = '';
  userParam.customer_address_include = false;
  userParam.customer_address_name = '';
  userParam.customer_address_address = '';
  userParam.customer_address_house_number = '';
  userParam.customer_address_postal_code = '';
  userParam.customer_address_locality = '';
  userParam.customer_address_country_code = '';
  userParam.amount_include = false;
  userParam.total_amount = '';
  userParam.currency = "CHF";
  userParam.language = 'EN';
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  return userParam;
}

function getQRCodeText(banDoc, qrSettings, texts, langCode) {
  var qrBill = new QRBill(banDoc, qrSettings);
  qrBill.defineQrBillType(qrSettings);
  var texts = qrBill.getQrCodeTexts(langCode);
  var qrcodeData = qrBill.getQrCodeDataDirect(qrSettings, texts, langCode);
  var text = qrBill.createTextQrImage(qrcodeData, texts);
  return text;
}

