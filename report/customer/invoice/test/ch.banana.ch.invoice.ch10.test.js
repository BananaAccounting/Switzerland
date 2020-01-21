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


// @id = ch.banana.ch.invoice.ch10.test
// @api = 1.0
// @pubdate = 2020-01-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.invoice.ch10.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.invoice.ch10.js
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
Test.registerTestCase(new ReportInvoiceTemplate10());

// Here we define the class, the name of the class is not important
function ReportInvoiceTemplate10() {

}

// This method will be called at the beginning of the test case
ReportInvoiceTemplate10.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceTemplate10.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceTemplate10.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceTemplate10.prototype.cleanup = function() {

}

ReportInvoiceTemplate10.prototype.testReport = function() {
   
  Test.logger.addComment("Test ch.banana.ch.invoice.ch10.js");

  var fileAC2 = "file:script/../test/testcases/invoice_development_file.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  
  if (!banDoc) {
    return;
  }

  Test.logger.addSection("Invoice tests");

  //Invoice 35
  Test.logger.addSubSection("Test Invoice 35");
  addReport(banDoc, "35", "Test Invoice 35");
  
  //Invoice 36
  Test.logger.addSubSection("Test Invoice 36");
  addReport(banDoc, "36", "Test Invoice 36");

  //Invoice 37
  Test.logger.addSubSection("Test Invoice 37");
  addReport(banDoc, "37", "Test Invoice 37");

  //Invoice 47
  Test.logger.addSubSection("Test Invoice 47");
  addReport(banDoc, "47", "Test Invoice 47");
}

//Function used to set all the parameters
function setUserParam(texts) {
  
  var userParam = {};

  //Include
  userParam.header_print = true;
  userParam.header_row_1 = "Banana.ch SA";
  userParam.header_row_2 = "Via alla Santa 7 - 6962 Viganello";
  userParam.header_row_3 = "www.banana.ch - info@banana.ch";
  userParam.header_row_4 = "IVA 123 456 789";
  userParam.header_row_5 = "";
  userParam.logo_print = true;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = 'Banana.ch SA - Via alla Santa 7 - 6962 Viganello';
  userParam.address_left = false;
  userParam.shipping_address = true;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = true;
  userParam.info_customer_fiscal_number = true;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.details_columns = texts.column_description+";"+texts.column_quantity+";"+texts.column_reference_unit+";"+texts.column_unit_price+";"+texts.column_amount;
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_gross_amounts = false;
  userParam.footer_add = true;
  userParam.footer_left = texts.invoice;
  userParam.footer_center = '';
  userParam.footer_right = texts.page+' <'+texts.page+'>';
  userParam.print_isr = true;
  userParam.isr_bank_name = 'Banca XYZ';
  userParam.isr_bank_address = 'Via abc 34';
  userParam.isr_account = '0-00000-0';
  userParam.isr_id = '';
  userParam.isr_position_scaleX = '1.0';
  userParam.isr_position_scaleY = '1.0';
  userParam.isr_position_dX = '0';
  userParam.isr_position_dY = '0';
  userParam.isr_on_new_page = false;

  //Texts
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

  //Styles
  userParam.text_color = '#000000';
  userParam.background_color_details_header = '#337AB7';
  userParam.text_color_details_header = '#FFFFFF';
  userParam.background_color_alternate_lines = '#F0F8FF';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

  //Embedded JavaScript file
  userParam.embedded_javascript_filename = '';

  return userParam;
}

function setVariables(variables) {
  var variables = {};
  variables.decimals_quantity = 4;
  variables.decimals_unit_price = 2;
  variables.decimals_amounts = 2;
  return variables;
}

//Function that creates the report for the test
function addReport(banDoc, invoiceNumber, reportName) {
  var texts = setInvoiceTexts('en');
  var userParam = setUserParam(texts);
  var variables = setVariables(variables);
  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceObj = JSON.parse(jsonInvoice);
  var invoiceReport = printInvoice(banDoc, invoiceReport, texts, userParam, "", invoiceObj, variables);
  Test.logger.addReport(reportName, invoiceReport);
}

function getJsonInvoice(invoiceNumber) {
  var file;
  var parsedfile;
  var jsonInvoice;
  
  if (invoiceNumber === "35") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_35_new.json");
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
