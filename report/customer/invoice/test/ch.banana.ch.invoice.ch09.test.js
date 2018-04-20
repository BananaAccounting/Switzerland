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


// @id = ch.banana.ch.invoice.ch09.test
// @api = 1.0
// @pubdate = 2018-04-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.ch.invoice.ch09.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.ch.invoice.ch09.js
// @timeout = -1


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the results

**/

// Register test case to be executed
Test.registerTestCase(new ReportInvoiceTemplate9());

// Here we define the class, the name of the class is not important
function ReportInvoiceTemplate9() {

}

// This method will be called at the beginning of the test case
ReportInvoiceTemplate9.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceTemplate9.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceTemplate9.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceTemplate9.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportInvoiceTemplate9.prototype.testBananaApp = function() {

  //Open the banana document
  var banDoc = Banana.application.openDocument("file:script/../test/testcases/invoices_switzerland.ac2");
  Test.assert(banDoc);

  this.report_test("35", "Test Invoice 35");
  this.report_test("36", "Test Invoice 36");
  this.report_test("37", "Test Invoice 37");
  this.report_test("47", "Test Invoice 47");
  this.json_test("35");
  this.json_test("36");
  this.json_test("37");
  this.json_test("47");
}

//Function that creates the report for the test
ReportInvoiceTemplate9.prototype.report_test = function(invoiceNumber, reportName) {
  
	var param = {};
	param.print_header = true;
	param.print_isr = true;
	param.einzahlungFur_row1 = 'Aaa';
	param.einzahlungFur_row2 = 'Bbb';
	param.zugunstenVon_IBAN = 'CH3181239000001245689';
	param.post_account = '00-00000-0';
	param.isr_id = '1234567890123456789012345678901234567';
	param.isr_zahlungszweck = 'Invoice payment...';   
	param.isr_position_scaleX = '1.0';
	param.isr_position_scaleY = '1.0';
	param.isr_position_dX = '0';
	param.isr_position_dY = '0';
	param.isr_on_new_page = false;
	param.color_1 = '';
	param.color_2 = '';
	param.image_height = '20';

	var jsonInvoice = this.get_json_invoice(invoiceNumber);
	var invoiceReport = printInvoice(jsonInvoice, invoiceReport, param);

	Test.logger.addReport(reportName, invoiceReport);
}


ReportInvoiceTemplate9.prototype.get_json_invoice = function(invoiceNumber) {

	var file;
	var parsedfile;
	var jsonInvoice;

	if (invoiceNumber === "35") {
		file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_35.json");
		parsedfile = JSON.stringify(file.read(), "", "");
		jsonInvoice = JSON.parse(parsedfile);
	}
	else if (invoiceNumber === "36") {
		file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36.json");
		parsedfile = JSON.stringify(file.read(), "", "");
		jsonInvoice = JSON.parse(parsedfile);
	}
	else if (invoiceNumber === "37") {
		file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_37.json");
		parsedfile = JSON.stringify(file.read(), "", "");
		jsonInvoice = JSON.parse(parsedfile);
	}
	else if (invoiceNumber === "47") {
		file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_47.json");
		parsedfile = JSON.stringify(file.read(), "", "");
		jsonInvoice = JSON.parse(parsedfile);
	}

	return jsonInvoice;
}

// This add a json value
ReportInvoiceTemplate9.prototype.json_test = function(invoiceNumber) {
	var obj = this.get_json_invoice(invoiceNumber);
	Test.logger.addJson("JSON of invoice " + invoiceNumber, JSON.stringify(obj));
}
