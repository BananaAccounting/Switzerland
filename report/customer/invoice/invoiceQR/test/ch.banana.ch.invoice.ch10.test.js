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


// @id = ch.banana.ch.invoice.ch10.test
// @api = 1.0
// @pubdate = 2021-07-16
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.invoice.ch10.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.invoice.ch10.js
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




var BAN_ADVANCED;



// Register test case to be executed
Test.registerTestCase(new ReportInvoiceQrCode());

// Here we define the class, the name of the class is not important
function ReportInvoiceQrCode() {

}

// This method will be called at the beginning of the test case
ReportInvoiceQrCode.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceQrCode.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceQrCode.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceQrCode.prototype.cleanup = function() {

}

ReportInvoiceQrCode.prototype.testReport = function() {
   
  Test.logger.addComment("Test [CH10] Layout 10 Programmable Invoice with Swiss QR Code");

  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }

  //Tests executed with banana advanced license type
  BAN_ADVANCED = true;
  IS_INTEGRATED_INVOICE = true;

  Test.logger.addSection("Invoice tests - file: " + fileAC2);

  //Test QRR
  Test.logger.addSubSection("Test1: QRR");
  this.add_test_qrr_1(banDoc, "35", "Invoice 35");
  this.add_test_qrr_1(banDoc, "36", "Invoice 36");
  this.add_test_qrr_1(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_1(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_1(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_1(banDoc, "36-2020", "Invoice 36-2020");

  //Test QRR, without address and without amount (settings parameters)
  Test.logger.addSubSection("Test2: QRR, no address, no amount");
  this.add_test_qrr_2(banDoc, "35", "Invoice 35");
  this.add_test_qrr_2(banDoc, "36", "Invoice 36");
  this.add_test_qrr_2(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_2(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_2(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_2(banDoc, "36-2020", "Invoice 36-2020");

  //Test QRR, NEGATIVE: QR Reference with IBAN (should be QR-IBAN)
  Test.logger.addSubSection("Test3 negative: QRR with IBAN");
  this.add_test_qrr_3(banDoc, "35", "Invoice 35");
  this.add_test_qrr_3(banDoc, "36", "Invoice 36");
  this.add_test_qrr_3(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_3(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_3(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_3(banDoc, "36-2020", "Invoice 36-2020");

  //Test QRR, NEGATIVE: QR-IBAN ok, QR Reference error
  Test.logger.addSubSection("Test4 negative: QR-IBAN ok, QR Reference error");
  this.add_test_qrr_4(banDoc, "F001-20", "Invoice F001-20");

  //Test SCOR
  Test.logger.addSubSection("Test5: SCOR");
  this.add_test_scor_1(banDoc, "35", "Invoice 35");
  this.add_test_scor_1(banDoc, "36", "Invoice 36");
  this.add_test_scor_1(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_1(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_1(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_1(banDoc, "36-2020", "Invoice 36-2020");
  this.add_test_scor_1(banDoc, "F001-20", "Invoice F001-20");

  //Test SCOR, without amount (settings)
  Test.logger.addSubSection("Test6: SCOR, no amount");
  this.add_test_scor_2(banDoc, "35", "Invoice 35");
  this.add_test_scor_2(banDoc, "36", "Invoice 36");
  this.add_test_scor_2(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_2(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_2(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_2(banDoc, "36-2020", "Invoice 36-2020");
  this.add_test_scor_2(banDoc, "F001-20", "Invoice F001-20");
  
  //Test SCOR, NEGATIVE: Creditor Reference with QR-IBAN (wrong, should be IBAN)
  Test.logger.addSubSection("Test7 negative: SCOR, Creditor Reference and QR-IBAN");
  this.add_test_scor_3(banDoc, "35", "Invoice 35");
  this.add_test_scor_3(banDoc, "36", "Invoice 36");
  this.add_test_scor_3(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_3(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_3(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_3(banDoc, "36-2020", "Invoice 36-2020");
  this.add_test_scor_3(banDoc, "F001-20", "Invoice F001-20");

  //Test SCOR, with 140 chars of unstructured message
  //The message is cut with "..." at the end
  Test.logger.addSubSection("Test8: SCOR, 140 chars of unstructured message");
  this.add_test_scor_4(banDoc, "364", "Invoice 364");

  //Test NON
  Test.logger.addSubSection("Test9: NON");
  this.add_test_non_1(banDoc, "35", "Invoice 35");
  this.add_test_non_1(banDoc, "36", "Invoice 36");
  this.add_test_non_1(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_non_1(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_non_1(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_non_1(banDoc, "36-2020", "Invoice 36-2020");

  //Test NON, NEGATIVE: Without reference with QR-IBAN (wrong, should be IBAN)
  Test.logger.addSubSection("Test10 negative: NON with QR-IBAN");
  this.add_test_non_2(banDoc, "35", "Invoice 35");
  this.add_test_non_2(banDoc, "36", "Invoice 36");
  this.add_test_non_2(banDoc, "361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_non_2(banDoc, "362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_non_2(banDoc, "363", "Invoice 363"); //without customer address, with amount
  this.add_test_non_2(banDoc, "36-2020", "Invoice 36-2020");

  //Test SCOR, NEGATIVE: IBAN EUR but invoice currency CHF
  Test.logger.addSubSection("Test11: SCOR with IBAN EUR");
  this.add_test_scor_5(banDoc, "F001-20", "Invoice F001-20");

  //Test Invoice on 4 pages: details table 3 pages, long final texts, QRCode on new page
  Test.logger.addSubSection("Test12: Invoice on 4 pages: details table 3 pages, long final texts, QRCode on new page");
  this.add_test_scor_6(banDoc, "47", "Invoice 47");

  //Test SCOR: use IBAN defined in File->Properties->Address
  //In the file it's defined the Banana IBAN: it's considered invalid and an error is displayed
  Test.logger.addSubSection("Test13: use IBAN defined in File->Properties->Address");
  this.add_test_scor_7(banDoc, "47", "Invoice 47");

  //Test INVOICE, custom column 'DateWork'
  Test.logger.addSubSection("Test14: custom invoice DateWork");
  this.add_test_invoice_1(banDoc, "60", "Invoice 60");

  //Test INVOICE, details with headers and subtotals
  Test.logger.addSubSection("Test15: details with headers and subtotals");
  this.add_test_invoice_2(banDoc, "64", "Invoice 64");

  //Test INVOICE, discount used for the Application Estimates & Invoices
  Test.logger.addSubSection("Test16: discount, VAT exclusive (net amounts)");
  this.add_test_invoice_3(banDoc, "401", "Invoice 401");
  this.add_test_invoice_3(banDoc, "402", "Invoice 402");
  this.add_test_invoice_3(banDoc, "403", "Invoice 403");

  //Test INVOICE, discount used for the Application Estimates & Invoices
  Test.logger.addSubSection("Test17: discount, VAT inclusive (gross amounts)");
  this.add_test_invoice_4(banDoc, "401", "Invoice 401");
  this.add_test_invoice_4(banDoc, "402", "Invoice 402");
  this.add_test_invoice_4(banDoc, "403", "Invoice 403");

  //Test INVOICES, deposit only used for the Application Estimates & Invoices
  //invoice_deposit_test.ac2
  Test.logger.addSubSection("Test18: cases with/without deposit, discount and VAT");
  this.add_test_invoice_5(banDoc, "5", "Invoice 5");
  this.add_test_invoice_6(banDoc, "6", "Invoice 6");
  this.add_test_invoice_7(banDoc, "7", "Invoice 7");
  this.add_test_invoice_8(banDoc, "8", "Invoice 8");
  this.add_test_invoice_9(banDoc, "9", "Invoice 9");
  this.add_test_invoice_10(banDoc, "10", "Invoice 10");
  this.add_test_invoice_11(banDoc, "11", "Invoice 11");
  this.add_test_invoice_12(banDoc, "12", "Invoice 12");

}




ReportInvoiceQrCode.prototype.add_test_qrr_1 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4';
  userParam.qr_code_iban = '';
  userParam.qr_code_isr_id = '113456';
  userParam.qr_code_reference_type = 'QRR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest1 = printInvoice(banDoc, reportTest1, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest1);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_qrr_2 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4';
  userParam.qr_code_iban = '';
  userParam.qr_code_isr_id = '113456';
  userParam.qr_code_reference_type = 'QRR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  userParam.qr_code_empty_address = true;
  userParam.qr_code_empty_amount = true;
  //Report invoice
  var reportTest4 = printInvoice(banDoc, reportTest4, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest4);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_qrr_3 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = 'CH58 0900 0000 6525 0122 4'; // WRONG! not a QR-IBAN!
  userParam.qr_code_iban = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'QRR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest1a = printInvoice(banDoc, reportTest1a, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest1a);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_qrr_4 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4'; // QR-IBAN is OK
  userParam.qr_code_iban = '';
  userParam.qr_code_isr_id = ''; //No isr, use only WRONG invoice nr. "F001-20" (only numbers allowed)
  userParam.qr_code_reference_type = 'QRR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_1 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_2 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  userParam.qr_code_empty_amount = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_3 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH09 3000 0001 6525 0122 4'; // WRONG! This is a QR-IBAN
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_4 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_5 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = '';
  userParam.qr_code_iban_eur = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_6 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.Des2;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '30%;20%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;left;right;center;right;right';
  userParam.details_columns_alignment = 'left;left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.en_text_details_columns = 'DES;DES2;QTY;UNIT;UNIT P.;AMOUNT';
  userParam.en_text_final = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_scor_7 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.Des2;Amount';
  userParam.details_columns_widths = '50%;20%;30%';
  userParam.details_columns_titles_alignment = 'left;left;right';
  userParam.details_columns_alignment = 'left;left;right';
  userParam.details_gross_amounts = false;
  userParam.en_text_details_columns = 'Description;Des2;Amount';
  userParam.en_text_final = '';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = ''; // No IBAN, we take the one defined on File->properties->Address (we use banana iban, so it is not valid)
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_non_1 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'NON'
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest3 = printInvoice(banDoc, reportTest3, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest3);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_non_2 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH09 3000 0001 6525 0122 4'; // WRONG! This is a QR-IBAN!
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'NON' // NON with QR-IBAN not allowed
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest3 = printInvoice(banDoc, reportTest3, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest3);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_1 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.DateWork;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '30%;20%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;center;center;center;center;right';
  userParam.details_columns_alignment = 'left;center;center;center;center;right';
  userParam.details_gross_amounts = true;
  userParam.en_text_details_columns = 'Description;Date Work;Quantity;Unit;Unit Price;Amount';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest2 = printInvoice(banDoc, reportTest2, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest2);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_2 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_3 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = false;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_4 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_5 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_6 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_7 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_8 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_9 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_10 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_11 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_12 = function(banDoc, invoiceNumber, reportName) {
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

function getQRCodeText(banDoc, userParam, invoiceObj, texts, langCode) {
  var qrBill = new QRBill(banDoc, userParam);
  qrBill.defineQrBillType(userParam);
  var qrcodeData = qrBill.getQrCodeData(invoiceObj, userParam, texts, langCode);
  var text = qrBill.createTextQrImage(qrcodeData, texts);
  return text;
}

function setUserParam(texts) {
  var userParam = {};
  userParam.header_print = true;
  userParam.header_row_1 = "";
  userParam.header_row_2 = "";
  userParam.header_row_3 = "";
  userParam.header_row_4 = "";
  userParam.header_row_5 = "";
  userParam.logo_print = true;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = 'Banana.ch SA - Via alla Santa 7 - 6962 Viganello';
  userParam.address_left = false;
  userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street>\n<AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  userParam.shipping_address = true;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = true;
  userParam.info_customer_fiscal_number = true;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'center;center;center;center;center';
  userParam.details_columns_alignment = 'left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.footer_add = true;
  userParam.footer_left = texts.invoice;
  userParam.footer_center = '';
  userParam.footer_right = texts.page+' <'+texts.page+'>';
  userParam.languages = 'en;it;de';
  userParam.en_text_info_invoice_number = texts.invoice;
  userParam.en_text_info_date = texts.date;
  userParam.en_text_info_customer = texts.customer;
  userParam.en_text_info_customer_vat_number = texts.vat_number;
  userParam.en_text_info_customer_fiscal_number = texts.fiscal_number;
  userParam.en_text_info_due_date = texts.payment_terms_label;
  userParam.en_text_info_page = texts.page;
  userParam.en_text_shipping_address = texts.shipping_address;
  userParam.en_title_doctype_10 = texts.invoice + " <DocInvoice>";
  userParam.en_title_doctype_12 = texts.credit_note + " <DocInvoice>";
  userParam.en_text_details_columns = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  userParam.en_text_total = texts.total;
  userParam.en_text_final = '';
  userParam.en_footer_left = texts.invoice;
  userParam.en_footer_center = '';
  userParam.en_footer_right = texts.page+' <'+texts.page+'>';
  userParam.footer_horizontal_line = true;
  userParam.text_color = '#000000';
  userParam.background_color_details_header = '#337AB7';
  userParam.text_color_details_header = '#FFFFFF';
  userParam.background_color_alternate_lines = '#F0F8FF';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';
  userParam.embedded_javascript_filename = '';

  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = '';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR';
  userParam.qr_code_debtor_address_type = "K";
  userParam.qr_code_additional_information = 'Notes';
  userParam.qr_code_billing_information = false;
  userParam.qr_code_empty_address = false;
  userParam.qr_code_empty_amount = false;
  userParam.qr_code_add_border_separator = true;
  userParam.qr_code_add_symbol_scissors = true;
  userParam.qr_code_new_page = false;
  userParam.qr_code_payable_to = false;
  userParam.qr_code_creditor_name = "";
  userParam.qr_code_creditor_address1 = "";
  userParam.qr_code_creditor_postalcode = "";
  userParam.qr_code_creditor_city = "";
  userParam.qr_code_creditor_country = "";
  userParam.qr_code_position_dX = '0';
  userParam.qr_code_position_dY = '0';

  return userParam;
}

function setVariables(variables) {
  var variables = {};
  variables.decimals_quantity = 4;
  variables.decimals_unit_price = 2;
  variables.decimals_amounts = 2;
  return variables;
}

function getJsonInvoice(invoiceNumber) {
  var file;
  var parsedfile;
  var jsonInvoice;
  
  if (invoiceNumber === "35") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_35.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "36") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "361") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_361.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "362") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_362.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "363") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_363.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "364") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_364.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "36-2020") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36-2020.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "F001-20") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_F001-20.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "47") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_47.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "60") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_60.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "64") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_64.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "401") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_401.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "402") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_402.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "403") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_403.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "5") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_5.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "6") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_6.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "7") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_7.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "8") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_8.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "9") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_9.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "10") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_10.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "11") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_11.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "12") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_12.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  return jsonInvoice;
}
