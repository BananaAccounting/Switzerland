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


// @id = ch.banana.ch.app.emptyqr.test
// @api = 1.0
// @pubdate = 2021-09-15
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

  //Test QRR
  // Test.logger.addSubSection("Test 1: QRR");
  // this.add_test_qrr_1(banDoc);
  // //Test QRR, NEGATIVE: QR Reference with IBAN (should be QR-IBAN)
  // Test.logger.addSubSection("Test 2 negative: QRR with IBAN");
  // this.add_test_qrr_2(banDoc);
  // //Test QRR, NEGATIVE: QR-IBAN ok, QR Reference error
  // Test.logger.addSubSection("Test 3 negative: QR-IBAN ok, QR Reference error");
  // this.add_test_qrr_3(banDoc);

  // //Test SCOR
  // Test.logger.addSubSection("Test 4: SCOR");
  // this.add_test_scor_1(banDoc);
  // //Test SCOR, NEGATIVE: Creditor Reference with QR-IBAN (wrong, should be IBAN)
  // Test.logger.addSubSection("Test 5 negative: SCOR, Creditor Reference and QR-IBAN");
  // this.add_test_scor_2(banDoc);
  // //Test SCOR, NEGATIVE: currency not CHF or EUR
  // Test.logger.addSubSection("Test 6 negative: SCOR, currency not CHF or EUR");
  // this.add_test_scor_3(banDoc);

}

ReportEmptyQr.prototype.add_test_non_1 = function(banDoc) {
  
  var userParam = {};
  userParam.print_msg_text = 'The QR payment part without address and amount is at the bottom of the page.';
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  
  var invoiceObj = initJSON(banDoc);
  
  var qrSettings = initQRSettings(userParam);
  qrSettings.qr_code_add = true;
  qrSettings.qr_code_reference_type = 'NON';
  qrSettings.qr_code_debtor_address_type = "K";
  qrSettings.qr_code_qriban = '';
  qrSettings.qr_code_iban = '';
  qrSettings.qr_code_iban_eur = '';
  qrSettings.qr_code_isr_id = '';
  qrSettings.qr_code_payable_to = false;
  qrSettings.qr_code_creditor_name = '';
  qrSettings.qr_code_creditor_address1 = '';
  qrSettings.qr_code_creditor_address2 = '';
  qrSettings.qr_code_creditor_postalcode = '';
  qrSettings.qr_code_creditor_city = '';
  qrSettings.qr_code_creditor_country = '';
  qrSettings.qr_code_additional_information = '';
  qrSettings.qr_code_billing_information = false;
  qrSettings.qr_code_empty_address = true;
  qrSettings.qr_code_empty_amount = true;
  qrSettings.qr_code_add_border_separator = true;
  qrSettings.qr_code_add_symbol_scissors = false;
  qrSettings.qr_code_new_page = false;
  qrSettings.qr_code_position_dX = '0';
  qrSettings.qr_code_position_dY = '0';

  var report = printReport(banDoc, invoiceObj, report, "", userParam, qrSettings);
  Test.logger.addReport("Test 1", report);
  var text = getQRCodeText(banDoc, qrSettings, invoiceObj, "", 'en');
  Test.logger.addText(text);
}

ReportEmptyQr.prototype.add_test_non_2 = function(banDoc) {

  var userParam = {};
  userParam.print_msg_text = 'The QR payment part without address and amount is at the bottom of the page.';
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  
  var invoiceObj = initJSON(banDoc);
  invoiceObj.supplier_info.iban_number = 'CH09 3000 0001 6525 0122 4'; //wrong, it's a QR-IBAN
  
  var qrSettings = initQRSettings(userParam);
  qrSettings.qr_code_add = true;
  qrSettings.qr_code_reference_type = 'NON';
  qrSettings.qr_code_debtor_address_type = "K";
  qrSettings.qr_code_qriban = '';
  qrSettings.qr_code_iban = '';
  qrSettings.qr_code_iban_eur = '';
  qrSettings.qr_code_isr_id = '';
  qrSettings.qr_code_payable_to = false;
  qrSettings.qr_code_creditor_name = '';
  qrSettings.qr_code_creditor_address1 = '';
  qrSettings.qr_code_creditor_address2 = '';
  qrSettings.qr_code_creditor_postalcode = '';
  qrSettings.qr_code_creditor_city = '';
  qrSettings.qr_code_creditor_country = '';
  qrSettings.qr_code_additional_information = '';
  qrSettings.qr_code_billing_information = false;
  qrSettings.qr_code_empty_address = true;
  qrSettings.qr_code_empty_amount = true;
  qrSettings.qr_code_add_border_separator = true;
  qrSettings.qr_code_add_symbol_scissors = false;
  qrSettings.qr_code_new_page = false;
  qrSettings.qr_code_position_dX = '0';
  qrSettings.qr_code_position_dY = '0';

  var report = printReport(banDoc, invoiceObj, report, "", userParam, qrSettings);
  Test.logger.addReport("Test 1", report);
  var text = getQRCodeText(banDoc, qrSettings, invoiceObj, "", 'en');
  Test.logger.addText(text);
}





function getQRCodeText(banDoc, qrSettings, invoiceObj, texts, langCode) {
  var qrBill = new QRBill(banDoc, qrSettings);
  qrBill.defineQrBillType(qrSettings);
  var texts = qrBill.getQrCodeTexts(langCode);
  var qrcodeData = qrBill.getQrCodeData(invoiceObj, qrSettings, texts, langCode);
  var text = qrBill.createTextQrImage(qrcodeData, texts);
  return text;
}

function initQRSettings(userParam) {
  /*
    Initialize the QR settings
  */
  var qrSettings = {};
  
  qrSettings.qr_code_add = true;
  qrSettings.qr_code_reference_type = 'SCOR'
  qrSettings.qr_code_debtor_address_type = "K";
  qrSettings.qr_code_qriban = '';
  qrSettings.qr_code_iban = '';
  qrSettings.qr_code_iban_eur = '';
  qrSettings.qr_code_isr_id = '';
  qrSettings.qr_code_payable_to = false;
  qrSettings.qr_code_creditor_name = '';
  qrSettings.qr_code_creditor_address1 = '';
  qrSettings.qr_code_creditor_address2 = '';
  qrSettings.qr_code_creditor_postalcode = '';
  qrSettings.qr_code_creditor_city = '';
  qrSettings.qr_code_creditor_country = '';
  qrSettings.qr_code_additional_information = '';
  qrSettings.qr_code_billing_information = false;
  qrSettings.qr_code_empty_address = true;
  qrSettings.qr_code_empty_amount = true;
  if (!userParam.print_separating_border) {
    qrSettings.qr_code_add_border_separator = false;
  }
  qrSettings.qr_code_add_symbol_scissors = false;
  if (userParam.print_scissors_symbol) {
    qrSettings.qr_code_add_symbol_scissors = true;
  }
  qrSettings.qr_code_new_page = false;
  qrSettings.qr_code_position_dX = '0';
  qrSettings.qr_code_position_dY = '0';
  
  return qrSettings;
}

function initJSON(banDoc) {

  var invoiceObj = null;
  var jsonInvoice = '{"billing_info":{"payment_term":"","total_amount_vat_exclusive":"","total_amount_vat_exclusive_before_discount":"","total_amount_vat_inclusive":"","total_amount_vat_inclusive_before_discount":"","total_categories":[],"total_discount_percent":"","total_discount_vat_exclusive":"","total_discount_vat_inclusive":"","total_rounding_difference":"","total_to_pay":"","total_vat_amount":"","total_vat_amount_before_discount":"","total_vat_codes":[{"total_amount_vat_exclusive":"","total_amount_vat_inclusive":"","total_vat_amount":"","vat_code":""}],"total_vat_rates":[{"total_amount_vat_exclusive":"","total_amount_vat_inclusive":"","total_vat_amount":"","vat_rate":""}]},"customer_info":{"address1":"","balance":"","balance_base_currency":"","business_name":"","city":"","country_code":"","first_name":"","lang":"","last_name":"","member_fee":"","number":"","origin_row":"","origin_table":"","postal_code":""},"document_info":{"currency":"","date":"","decimals_amounts":"","description":"","doc_type":"","locale":"","number":"","origin_row":"","origin_table":"","printed":"","rounding_total":"","type":""},"items":[],"note":[],"parameters":{},"payment_info":{"date_expected":"","due_date":"","due_days":"","due_period":"","last_reminder":"","last_reminder_date":"","payment_date":""},"shipping_info":{"different_shipping_address":""},"supplier_info":{"address1":"Address1","business_name":"Company","city":"City","country":"Country","country_code":"CH","email":"info@myweb","first_name":"Firstname","last_name":"Lastname","postal_code":"Zip","web":"http://www.myweb"},"template_parameters":{"footer_texts":[]},"transactions":[],"type":"invoice","version":"1.0"}';
  invoiceObj = JSON.parse(jsonInvoice);
  
  invoiceObj.supplier_info.business_name = banDoc.info("AccountingDataBase","Company");
  invoiceObj.supplier_info.courtesy = banDoc.info("AccountingDataBase","Courtesy");
  invoiceObj.supplier_info.first_name = banDoc.info("AccountingDataBase","Name");
  invoiceObj.supplier_info.last_name = banDoc.info("AccountingDataBase","FamilyName");
  invoiceObj.supplier_info.address1 = banDoc.info("AccountingDataBase","Address1");
  invoiceObj.supplier_info.address2 = banDoc.info("AccountingDataBase","Address2");
  invoiceObj.supplier_info.postal_code = banDoc.info("AccountingDataBase","Zip");
  invoiceObj.supplier_info.city = banDoc.info("AccountingDataBase","City");
  invoiceObj.supplier_info.state = banDoc.info("AccountingDataBase","State");
  invoiceObj.supplier_info.country = banDoc.info("AccountingDataBase","Country");
  invoiceObj.supplier_info.country_code = banDoc.info("AccountingDataBase","CountryCode");
  invoiceObj.supplier_info.web = banDoc.info("AccountingDataBase","Web");
  invoiceObj.supplier_info.email = banDoc.info("AccountingDataBase","Email");
  invoiceObj.supplier_info.phone = banDoc.info("AccountingDataBase","Phone");
  invoiceObj.supplier_info.mobile = banDoc.info("AccountingDataBase","Mobile");
  invoiceObj.supplier_info.iban_number = banDoc.info("AccountingDataBase","IBAN");
  invoiceObj.supplier_info.fiscal_number = banDoc.info("AccountingDataBase","FiscalNumber");
  invoiceObj.supplier_info.vat_number = banDoc.info("AccountingDataBase","VatNumber");
  invoiceObj.document_info.currency = banDoc.info("AccountingDataBase","BasicCurrency");
  
  var lang = "en";
  if (banDoc.locale) {
    lang = banDoc.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  invoiceObj.document_info.locale = lang;

  //Banana.console.log(JSON.stringify(invoiceObj, "", " "));

  return invoiceObj;
}
