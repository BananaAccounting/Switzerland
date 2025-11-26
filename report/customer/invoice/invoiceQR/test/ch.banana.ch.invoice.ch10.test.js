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


// @id = ch.banana.ch.invoice.ch10.test
// @api = 1.0
// @pubdate = 2025-11-18
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.invoice.ch10.js>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.invoice.ch10.js
// @includejs = ../swissqrcode.js
// @includejs = ../ch.banana.ch.invoice.ch10.parameters.js
// @includejs = ../ch.banana.ch.invoice.ch10.texts.js
// @includejs = ../ch.banana.ch.invoice.ch10.printpreferences.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report
**/



//Tests executed with banana advanced license type
var BAN_ADVANCED = true;


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

  //Test QRR
  //Integrated invoice
  Test.logger.addSubSection("Test1: QRR");
  this.add_test_qrr_1("35", "Invoice 35");
  this.add_test_qrr_1("36", "Invoice 36");
  this.add_test_qrr_1("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_1("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_1("363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_1("36-2020", "Invoice 36-2020");

  //Test QRR, without address and without amount (settings parameters)
  //Integrated invoice
  Test.logger.addSubSection("Test2: QRR, no address, no amount");
  this.add_test_qrr_2("35", "Invoice 35");
  this.add_test_qrr_2("36", "Invoice 36");
  this.add_test_qrr_2("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_2("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_2("363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_2("36-2020", "Invoice 36-2020");

  //Test QRR, NEGATIVE: QR Reference with IBAN (should be QR-IBAN)
  //Integrated invoice
  Test.logger.addSubSection("Test3 negative: QRR with IBAN");
  this.add_test_qrr_3("35", "Invoice 35");
  this.add_test_qrr_3("36", "Invoice 36");
  this.add_test_qrr_3("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_qrr_3("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_qrr_3("363", "Invoice 363"); //without customer address, with amount
  this.add_test_qrr_3("36-2020", "Invoice 36-2020");

  //Test QRR, NEGATIVE: QR-IBAN ok, QR Reference error
  //Integrated invoice
  Test.logger.addSubSection("Test4 negative: QR-IBAN ok, QR Reference error");
  this.add_test_qrr_4("F001-20", "Invoice F001-20");

  //Test SCOR
  //Integrated invoice
  Test.logger.addSubSection("Test5: SCOR");
  this.add_test_scor_1("35", "Invoice 35");
  this.add_test_scor_1("36", "Invoice 36");
  this.add_test_scor_1("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_1("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_1("363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_1("36-2020", "Invoice 36-2020");
  this.add_test_scor_1("F001-20", "Invoice F001-20");

  //Test SCOR, without amount (settings)
  //Integrated invoice
  Test.logger.addSubSection("Test6: SCOR, no amount");
  this.add_test_scor_2("35", "Invoice 35");
  this.add_test_scor_2("36", "Invoice 36");
  this.add_test_scor_2("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_2("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_2("363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_2("36-2020", "Invoice 36-2020");
  this.add_test_scor_2("F001-20", "Invoice F001-20");

  //Test SCOR, NEGATIVE: Creditor Reference with QR-IBAN (wrong, should be IBAN)
  //Integrated invoice
  Test.logger.addSubSection("Test7 negative: SCOR, Creditor Reference and QR-IBAN");
  this.add_test_scor_3("35", "Invoice 35");
  this.add_test_scor_3("36", "Invoice 36");
  this.add_test_scor_3("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_scor_3("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_scor_3("363", "Invoice 363"); //without customer address, with amount
  this.add_test_scor_3("36-2020", "Invoice 36-2020");
  this.add_test_scor_3("F001-20", "Invoice F001-20");

  //Test SCOR, with 140 chars of unstructured message
  //The message is cut with "..." at the end
  //Integrated invoice
  Test.logger.addSubSection("Test8: SCOR, 140 chars of unstructured message");
  this.add_test_scor_4("364", "Invoice 364");

  //Test NON
  //Integrated invoice
  Test.logger.addSubSection("Test9: NON");
  this.add_test_non_1("35", "Invoice 35");
  this.add_test_non_1("36", "Invoice 36");
  this.add_test_non_1("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_non_1("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_non_1("363", "Invoice 363"); //without customer address, with amount
  this.add_test_non_1("36-2020", "Invoice 36-2020");

  //Test NON, NEGATIVE: Without reference with QR-IBAN (wrong, should be IBAN)
  //Integrated invoice
  Test.logger.addSubSection("Test10 negative: NON with QR-IBAN");
  this.add_test_non_2("35", "Invoice 35");
  this.add_test_non_2("36", "Invoice 36");
  this.add_test_non_2("361", "Invoice 361"); //without customer address and amount 0.00
  this.add_test_non_2("362", "Invoice 362"); //with customer address and amount 0.00
  this.add_test_non_2("363", "Invoice 363"); //without customer address, with amount
  this.add_test_non_2("36-2020", "Invoice 36-2020");

  //Test SCOR, NEGATIVE: IBAN EUR but invoice currency CHF
  //Integrated invoice
  Test.logger.addSubSection("Test11: SCOR with IBAN EUR");
  this.add_test_scor_5("F001-20", "Invoice F001-20");

  //Test Invoice on 4 pages: details table 3 pages, long final texts, QRCode on new page
  //Integrated invoice
  Test.logger.addSubSection("Test12: Invoice on 4 pages: details table 3 pages, long final texts, QRCode on new page");
  this.add_test_scor_6("47", "Invoice 47");

  //Test SCOR: use IBAN defined in File->Properties->Address
  //In the file it's defined the Banana IBAN: it's considered invalid and an error is displayed
  //Integrated invoice
  Test.logger.addSubSection("Test13: use IBAN defined in File->Properties->Address");
  this.add_test_scor_7("47", "Invoice 47");

  //Test INVOICE, custom column 'DateWork'
  //Integrated invoice
  Test.logger.addSubSection("Test14: custom invoice DateWork");
  this.add_test_invoice_1("60", "Invoice 60");

  //Test INVOICE, details with headers and subtotals
  //Integrated invoice
  Test.logger.addSubSection("Test15: details with headers and subtotals");
  this.add_test_invoice_2("64", "Invoice 64");

  //Test INVOICE, discount
  //Application Estimates & Invoices
  Test.logger.addSubSection("Test16: discount, VAT exclusive (net amounts)");
  this.add_test_invoice_3("401", "Invoice 401");
  this.add_test_invoice_3("402", "Invoice 402");
  this.add_test_invoice_3("403", "Invoice 403");

  //Test INVOICE, discount
  //Application Estimates & Invoices
  Test.logger.addSubSection("Test17: discount, VAT inclusive (gross amounts)");
  this.add_test_invoice_4("401", "Invoice 401");
  this.add_test_invoice_4("402", "Invoice 402");
  this.add_test_invoice_4("403", "Invoice 403");

  //Test INVOICES, deposit only
  //invoice_deposit_test.ac2
  //Application Estimates & Invoices
  Test.logger.addSubSection("Test18: cases with/without deposit, discount and VAT");
  this.add_test_invoice_5("5", "Invoice 5");
  this.add_test_invoice_6("6", "Invoice 6");
  this.add_test_invoice_7("7", "Invoice 7");
  this.add_test_invoice_8("8", "Invoice 8");
  this.add_test_invoice_9("9", "Invoice 9");
  this.add_test_invoice_10("10", "Invoice 10");
  this.add_test_invoice_11("11", "Invoice 11");
  this.add_test_invoice_12("12", "Invoice 12");

  //Test INVOICE, missing customer address data
  //userParam QR "Print Empty Address" (settings) is FALSE => retrieve error, QR code is not printed
  //"@error" messages showed on QR
  //Integrated invoice
  Test.logger.addSubSection("Test19: Missing customer address; userParam 'QR - Print Empty Address' set to FALSE; QR code is not printed");
  this.add_test_invoice_13("363", "Invoice 363"); //without customer address, with amount

  //Test INVOICE, missing customer address data
  //userParam QR "Print Empty Address" (settings) is TRUE => no errors retrieved, QR code is printed
  //Integrated invoice
  Test.logger.addSubSection("Test20: Missing customer address; userParam 'QR - Print Empty Address' set to TRUE; QR code printed");
  this.add_test_invoice_14("363", "Invoice 363"); //without customer address, with amount

  //Test INVOICE, order number/date, Items/Date/Discount columns, begin/final texts on multiple lines, subtotal
  //invoice_estimates_test.ac2
  //Application Estimates & Invoices
  Test.logger.addSubSection("Test21: order number/date, Items/Date/Discount columns, begin/final texts on multiple lines, subtotal");
  this.add_test_invoice_15("3", "Invoice 3");

  //Test INVOICE, order number/date, Items/Image columns, additional descriptions
  //Integrated invoice
  Test.logger.addSubSection("Test22: order number/date, Items/Image columns, additional descriptions");
  this.add_test_invoice_16("2", "Invoice 2");

  //Test INVOICE, 0% VAT rate
  //Integrated invoice
  Test.logger.addSubSection("Test23: 0% VAT rate");
  this.add_test_invoice_17("13", "Invoice 13"); //prints all vat rates, including vat 0.00% (V0)
  this.add_test_invoice_17("14", "Invoice 14"); //prints all vat rates, excluding no vat (empty)
  this.add_test_invoice_17("15", "Invoice 15"); //no vat rates printed

  //Test INVOICE, 0% VAT rate
  //Application Estimates & Invoices
  Test.logger.addSubSection("Test24: 0% VAT rate");
  this.add_test_invoice_18("16", "Invoice 16"); //prints all vat rates, including vat 0.00% (V0)
  this.add_test_invoice_18("17", "Invoice 17"); //prints all vat rates, excluding no vat (empty)
  this.add_test_invoice_18("18", "Invoice 18"); //no vat rates printed

  //Test DELIVERY NOTE (selected as print preference)
  Test.logger.addSubSection("Test25: delivery note");
  this.add_test_invoice_19("501", "Delivery Note 501", "delivery_note"); //integrated invoice, with amounts, with footer
  this.add_test_invoice_20("502", "Delivery Note 502", "delivery_note_without_amounts"); //integrated invoice, without amounts, without footer
  this.add_test_invoice_20("503", "Delivery Note 503", "delivery_note_without_amounts"); //integrated invoice, without amounts, without items subtotals, without footer
  this.add_test_invoice_20("504", "Delivery Note 504", "delivery_note_without_amounts"); //integrated invoice, without amounts, use shipping address as delivery note address (no customer address used), without footer

  //Test REMINDER (selected as print preference)
  Test.logger.addSubSection("Test26: reminder");
  this.add_test_invoice_20("501", "1. Reminder, invoice 501", "reminder_1"); //integrated invoice, 1st reminder
  this.add_test_invoice_20("502", "2. Reminder, invoice 502", "reminder_2"); //integrated invoice, 2nd reminder
  this.add_test_invoice_20("503", "3. Reminder, invoice 503", "reminder_3"); //integrated invoice, 3rd reminder

  //Test AUTOMATIC (invoice) - (selected as print preference)
  this.add_test_invoice_20("501", "Invoice 501", "automatic"); //integrated invoice
  this.add_test_invoice_20("502", "Invoice 502", "automatic"); //integrated invoice

  //Test Invoice (selected as print preference)
  this.add_test_invoice_20("501", "Invoice 501", "invoice"); //integrated invoice
  this.add_test_invoice_20("502", "Invoice 502", "invoice"); //integrated invoice

  //Test Proforma Invoice (selected as print preference)
  this.add_test_invoice_20("501", "Invoice 501", "proforma_invoice"); //integrated invoice
  this.add_test_invoice_20("502", "Invoice 502", "proforma_invoice"); //integrated invoice

  //Test Estimate (selected as print preference)
  this.add_test_invoice_20("501", "Invoice 501", "estimate"); //integrated invoice
  this.add_test_invoice_20("502", "Invoice 502", "estimate"); //integrated invoice
  
  //Test invoice with partial payment transactions
  //Integrated invoice
  this.add_test_invoice_21("505", "Invoice 505", ""); //payments excluded, just a normal invoice

  //Test Order Confirmation (selected as print preference)
  this.add_test_invoice_20("501", "Invoice 501", "order_confirmation"); //integrated invoice
  this.add_test_invoice_20("502", "Invoice 502", "order_confirmation"); //integrated invoice

  //Test structured addresses
  //Integrated invoice
  this.add_test_invoice_22("110", "Invoice 110", "invoice"); //integrated invoice
  this.add_test_invoice_22("111", "Invoice 111", "invoice"); //integrated invoice
  this.add_test_invoice_22("112", "Invoice 112", "invoice"); //integrated invoice
  this.add_test_invoice_22("113", "Invoice 113", "invoice"); //integrated invoice

}




ReportInvoiceQrCode.prototype.add_test_qrr_1 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_qrr_2 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_qrr_3 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_qrr_4 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_1 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_2 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_3 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_4 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_5 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_6 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_scor_7 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_non_1 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_non_2 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_invoice_1 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_invoice_2 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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

ReportInvoiceQrCode.prototype.add_test_invoice_3 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_4 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_5 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_6 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_7 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_8 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_9 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_10 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_11 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_12 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
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

ReportInvoiceQrCode.prototype.add_test_invoice_13 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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
  userParam.qr_code_empty_address = false; // false = print customer address on QR
  userParam.qr_code_empty_amount = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_14 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
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
  userParam.qr_code_empty_address = true; // true = print empty box instead of address on QR
  userParam.qr_code_empty_amount = false;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_15 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_estimates_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = true;
  userParam.info_order_date = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
  userParam.details_columns_widths = '10%;10%;25%;10%;10%;10%;10%;15%';
  userParam.details_columns_titles_alignment = 'left;left;left;right;center;right;right;right';
  userParam.details_columns_alignment = 'left;left;left;right;center;right;right;right';
  userParam.details_gross_amounts = true;
  userParam.en_text_details_columns = 'Item;Date;Description;Quantity;Unit;Unit Price;Discount;Amount';
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

ReportInvoiceQrCode.prototype.add_test_invoice_16 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_items_images.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = true;
  userParam.info_order_date = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '12%;10%;28%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;left;left;right;center;right;right';
  userParam.details_columns_alignment = 'left;left;left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = true;
  userParam.en_text_details_columns = 'Image;Item;Description;Quantity;Unit;Unit Price;Amount';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  userParam.embedded_javascript_filename = "itemsImages.js";
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_17 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/v0_integrated_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'eft;center;center;right;right';
  userParam.details_columns_alignment = 'eft;center;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.en_text_details_columns = 'Description;Quantity;Unit;Unit Price;Amount';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_18 = function(invoiceNumber, reportName) {
  var fileAC2 = "file:script/../test/testcases/v0_estimates_invoices_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = false;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'eft;center;center;right;right';
  userParam.details_columns_alignment = 'eft;center;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.en_text_details_columns = 'Description;Quantity;Unit;Unit Price;Amount';
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;
  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_19 = function(invoiceNumber, reportName, printformat) {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_deliverynote_reminder.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');

  var userParam = setUserParam(texts);
  userParam.en_text_info_delivery_note_number = texts.number_delivery_note;
  userParam.en_text_info_date_delivery_note = texts.date_delivery_note;
  userParam.en_title_delivery_note = texts.delivery_note;
  userParam.en_text_begin_delivery_note = 'This is the begin text of the delivery note.';
  userParam.en_text_final_delivery_note = 'This is the final text of the delivery note.\nIt can be on multiple lines.\nThank you very much.';

  userParam.footer_add = true;
  userParam.en_footer_left = 'Footer text left';
  userParam.en_footer_center = 'Footer text center';
  userParam.en_footer_right = 'Footer text right';

  userParam.qr_code_add = true;
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_billing_information = true;

  // Print preferences, set the print format
  var preferencesObj =
  {
    "version":"1.0",
    "id":"invoice_available_layout_preferences",
    "print_choices": {
      "print_as":printformat
    }
  }
  Test.logger.addJson("JSON preferences", JSON.stringify(preferencesObj));
  var printFormat = getPrintFormat(preferencesObj);
  Test.logger.addSubSection("Get print format from json: " + printFormat);

  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables, preferencesObj);
  Test.logger.addReport(reportName, reportTest);
}

ReportInvoiceQrCode.prototype.add_test_invoice_20 = function(invoiceNumber, reportName, printformat) {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_deliverynote_reminder.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');

  var userParam = setUserParam(texts);

  //Delivery notes params
  userParam.en_text_info_delivery_note_number = texts.number_delivery_note;
  userParam.en_text_info_date_delivery_note = texts.date_delivery_note;
  userParam.en_title_delivery_note = texts.delivery_note;
  userParam.en_text_begin_delivery_note = 'This is the begin text of the delivery note.';
  userParam.en_text_final_delivery_note = 'This is the final text of the delivery note.\nIt can be on multiple lines.\nThank you very much.';

  //Order confirmation params
  userParam.en_text_info_order_confirmation_number = texts.number_order_confirmation;
  userParam.en_text_info_date_order_confirmation = texts.date_order_confirmation;
  userParam.en_title_order_confirmation = texts.order_confirmation;
  userParam.en_text_begin_order_confirmation = 'This is the begin text of the order confirmation.';
  userParam.en_text_final_order_confirmation = 'This is the final text of the order confirmation.\nIt can be on multiple lines.\nThank you very much.';

  //Reminders params
  userParam.en_title_reminder = '%1. ' + texts.reminder;
  userParam.en_text_begin_reminder = 'This is the begin text of the reminder.';
  userParam.en_text_final_reminder = 'This is the final text of the reminder.\nIt can be on multiple lines.';

  //Proforma invoice params
  userParam.en_title_proforma_invoice = texts.proforma_invoice + " <DocInvoice>";
  userParam.en_text_begin_proforma_invoice = 'This is the begin text of the proforma invoice.';
  userParam.en_text_final_proforma_invoice = 'This is the final text of the proforma invoice.\nIt can be on multiple lines.';
  
  //Estimate params
  userParam.en_text_info_offer_number = texts.offer;
  userParam.en_text_info_date_offer = texts.date;
  userParam.en_text_info_validity_date_offer = texts.validity_terms_label;
  userParam.en_title_doctype_17 = texts.offer + " <DocInvoice>";
  userParam.en_text_begin_offer = 'This is the begin text of the estimate.';
  userParam.en_text_final_offer = 'This is the final text of the estimate.\nIt can be on multiple lines.';

  //Footer params
  userParam.footer_add = false;
  userParam.en_footer_left = 'Footer text left';
  userParam.en_footer_center = 'Footer text center';
  userParam.en_footer_right = 'Footer text right';

  //QR params
  userParam.qr_code_add = true;
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_billing_information = true;

  // Print preferences, set the print format
  var preferencesObj =
  {
    "version":"1.0",
    "id":"invoice_available_layout_preferences",
    "print_choices": {
      "print_as":printformat
    }
  }
  Test.logger.addJson("JSON preferences", JSON.stringify(preferencesObj));
  var printFormat = getPrintFormat(preferencesObj);
  Test.logger.addSubSection("Get print format from json: " + printFormat);

  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables, preferencesObj);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  if (!printFormat.startsWith("delivery_note") && printformat !== "proforma_invoice" && printformat !== "estimate" && printformat !== "order_confirmation") { //do not test QRCode text (for deliverynote, proformainvoice, estimates, order_confirmation), it's never printed
    var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
    Test.logger.addText(text);
  }
}

ReportInvoiceQrCode.prototype.add_test_invoice_21 = function(invoiceNumber, reportName, printformat) {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_payments.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_gross_amounts = true;
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_iban_eur = '';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;

  // Print preferences, set the print format
  var preferencesObj =
  {
    "version":"1.0",
    "id":"invoice_available_layout_preferences",
    "print_choices": {
      "print_as":printformat
    }
  }
  Test.logger.addJson("JSON preferences", JSON.stringify(preferencesObj));
  var printFormat = getPrintFormat(preferencesObj);
  Test.logger.addSubSection("Get print format from json: " + printFormat);

  //Report invoice
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, reportTest);
  //QRCode text
  var text = getQRCodeText(banDoc, userParam, invoiceObj, texts, 'en');
  Test.logger.addText(text);
}

ReportInvoiceQrCode.prototype.add_test_invoice_22 = function(invoiceNumber, reportName, printformat) {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_structured_address.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables(variables);
  variables.decimals_quantity = '';
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_gross_amounts = false;
  userParam.address_small_line = '<none>';
  userParam.qr_code_add = true;
  userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = true;

  // Print preferences, set the print format
  var preferencesObj =
  {
    "version":"1.0",
    "id":"invoice_available_layout_preferences",
    "print_choices": {
      "print_as":printformat
    }
  }
  Test.logger.addJson("JSON preferences", JSON.stringify(preferencesObj));
  var printFormat = getPrintFormat(preferencesObj);
  Test.logger.addSubSection("Get print format from json: " + printFormat);

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
  userParam.info_order_number = false;
  userParam.info_order_date = false;
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
  userParam.en_text_info_order_number = texts.order_number;
  userParam.en_text_info_order_date = texts.order_date;
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

  if (invoiceNumber === "2") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_2.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "3") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_3.json");
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
  else if (invoiceNumber === "13") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_13.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "14") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_14.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "15") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_15.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "16") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_16.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "17") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_17.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "18") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_18.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "35") {
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
  else if (invoiceNumber === "36-2020") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36-2020.json");
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
  else if (invoiceNumber === "110") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_110.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "111") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_111.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "112") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_112.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "113") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_113.json");
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
  else if (invoiceNumber === "501") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_501.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "502") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_502.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "503") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_503.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "504") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_504.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "505") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_505.json");
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

  return jsonInvoice;
}
