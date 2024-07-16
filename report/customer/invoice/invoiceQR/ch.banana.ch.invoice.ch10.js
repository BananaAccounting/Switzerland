// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.ch.invoice.ch10
// @api = 1.0
// @pubdate = 2024-07-16
// @publisher = Banana.ch SA
// @description = [CH10] Invoice layout with Swiss QR Code (Banana+)
// @description.it = [CH10] Layout con codice QR svizzero (Banana+)
// @description.de = [CH10] Layout mit Schweizer QR-Code (Banana+)
// @description.fr = [CH10] Layout avec QR Code suisse (Banana+)
// @description.en = [CH10] Invoice layout with Swiss QR Code (Banana+)
// @doctype = *
// @task = report.customer.invoice
// @includejs = swissqrcode.js
// @includejs = checkfunctions.js
// @includejs = ch.banana.ch.invoice.ch10.parameters.js
// @includejs = ch.banana.ch.invoice.ch10.texts.js
// @includejs = ch.banana.ch.invoice.ch10.printpreferences.js



/*
  SUMMARY
  =======
  New invoice layout.
  This layout of invoice allows to set a lot of settings in order to customize the printout.
  Invoice elements:
  - header (text and logo)
  - info
  - address
  - shipping address
  - begin text (title and begin text)
  - invoice details
  - final texts
  - footer/Swiss QR Code
*/



// Define the required version of Banana Accounting / Banana Experimental
var BAN_VERSION = "10.0.1";
var BAN_EXPM_VERSION = "";
var BAN_ADVANCED;
var IS_INTEGRATED_INVOICE;

// Counter for the columns of the Details table
var columnsNumber = 0;

// Default language document
var lang = "en";



//====================================================================//
// MAIN FUNCTIONS THAT PRINT THE INVOICE
//====================================================================//
function printDocument(jsonInvoice, repDocObj, repStyleObj, jsonPreferences) {

  // Verify the banana version when user clicks ok to print the invoice
  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
  if (isCurrentBananaVersionSupported) {

    isIntegratedInvoice();

    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
      userParam = verifyParam(userParam);
    }

    // jsonInvoice can be a json string or a js object
    var invoiceObj = null;
    if (typeof(jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
    } else if (typeof(jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
    }

    //json for print preferences
    if (jsonPreferences) {
      var preferencesObj = null;
      if (typeof(jsonPreferences) === 'object') {
        preferencesObj = jsonPreferences;
      } else if (typeof(jsonPreferences) === 'string') {
        preferencesObj = JSON.parse(jsonPreferences)
      }
    }

    // Invoice texts which need translation
    if (invoiceObj.customer_info.lang) {
      lang = invoiceObj.customer_info.lang.toLowerCase(); //in case user insert uppercase language
    } else if (invoiceObj.document_info.locale) {
      lang = invoiceObj.document_info.locale;
    }
    //Check that lan is in parameter languages
    if (userParam.languages.indexOf(lang) < 0) {
      lang = 'en';
    }
    var texts = setInvoiceTexts(lang);

    // Include the embedded javascript file entered by the user
    includeEmbeddedJavascriptFile(Banana.document, texts, userParam);
    
    // Variable starts with $
    var variables = {};
    set_variables(variables, userParam);

    // Function call to print the invoice document
    repDocObj = printInvoice(Banana.document, repDocObj, texts, userParam, repStyleObj, invoiceObj, variables, preferencesObj);
    
    // Load the predefined invoice.css styles and the embedded css file entered by the user
    set_css_style(Banana.document, repStyleObj, variables, userParam);

  }
}

function printInvoice(banDoc, repDocObj, texts, userParam, repStyleObj, invoiceObj, variables, preferencesObj) {

  /*
    Build the invoice document:
    - header
    - info
    - address
    - shipping address
    - begin text
    - details
    - final texts
    - footer/QRCode

    By default are used standard functions, but if 'hook' functions are defined by the user, these functions are used instead.
  */

  // Invoice document
  var reportObj = Banana.Report;
  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts, userParam) + " " + invoiceObj.document_info.number);
  }

  // Get the print format that is used to print the document.
  let printFormat = getPrintFormat(preferencesObj);

  // Set the document type
  if (printFormat === "invoice" || printFormat === "proforma_invoice") {
    invoiceObj.document_info.doc_type = "10"; // 10=invoice
  }
  if (printFormat === "estimate") {
    invoiceObj.document_info.doc_type = "17"; // 17=estimate
  }

  /* PRINT QR SLIP ONLY */
  if (printFormat === "qrcode_slip") {
    userParam.qr_code_add = true;
    var qrBill = new QRBill(banDoc, userParam);
    qrBill.printQRCode(invoiceObj, repDocObj, repStyleObj, userParam);
    return repDocObj;
  }


  /* PRINT HEADER */
  if (BAN_ADVANCED && typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj, userParam, repStyleObj, invoiceObj, texts);
  } else {
    print_header(repDocObj, userParam, repStyleObj, invoiceObj, texts);
  }

  /* PRINT INVOICE INFO FIRST PAGE */
  if (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_info_first_page_delivery_note) === typeof(Function)) {
      hook_print_info_first_page_delivery_note(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_first_page_delivery_note(repDocObj, invoiceObj, texts, userParam);
    }
  }
  else if (invoiceObj.payment_info && invoiceObj.payment_info.last_reminder_date && invoiceObj.payment_info.last_reminder_due_date && (printFormat === "reminder_1" || printFormat === "reminder_2" || printFormat === "reminder_3")) {
    if (BAN_ADVANCED && typeof(hook_print_info_first_page_reminder) === typeof(Function)) {
      hook_print_info_first_page_reminder(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_first_page_reminder(repDocObj, invoiceObj, texts, userParam);
    }
  }
  else {
    if (BAN_ADVANCED && typeof(hook_print_info_first_page) === typeof(Function)) {
      hook_print_info_first_page(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_first_page(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* PRINT INVOICE INFO PAGES 2+ */
  if (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_info_other_pages_delivery_note) === typeof(Function)) {
      hook_print_info_other_pages_delivery_note(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_other_pages_delivery_note(repDocObj, invoiceObj, texts, userParam);
    }
  }
  else if (invoiceObj.payment_info && invoiceObj.payment_info.last_reminder_date && invoiceObj.payment_info.last_reminder_due_date && (printFormat === "reminder_1" || printFormat === "reminder_2" || printFormat === "reminder_3")) {
    if (BAN_ADVANCED && typeof(hook_print_info_other_pages_reminder) === typeof(Function)) {
      hook_print_info_other_pages_reminder(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_other_pages_reminder(repDocObj, invoiceObj, texts, userParam);
    }
  }
  else {
    if (BAN_ADVANCED && typeof(hook_print_info_other_pages) === typeof(Function)) {
      hook_print_info_other_pages(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_info_other_pages(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* PRINT CUSTOMER ADDRESS */
  if (invoiceObj.shipping_info && invoiceObj.shipping_info.different_shipping_address && (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts")) { //for delivery note use shipping address when available
    if (BAN_ADVANCED && typeof(hook_print_customer_address) === typeof(Function)) {
      hook_print_address_delivery_note(repDocObj, invoiceObj, userParam);
    } else {
      print_address_delivery_note(repDocObj, invoiceObj, userParam);
    }
  }
  else {
    if (BAN_ADVANCED && typeof(hook_print_customer_address) === typeof(Function)) {
      hook_print_customer_address(repDocObj, invoiceObj, userParam);
    } else {
      print_customer_address(repDocObj, invoiceObj, userParam);
    }
  }

  /* PRINT SHIPPING ADDRESS */
  if (invoiceObj.shipping_info && userParam.shipping_address && printFormat !== "delivery_note" && printFormat !== "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_shipping_address) === typeof(Function)) {
      hook_print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* PRINT BEGIN TEXT (BEFORE INVOICE DETAILS) */
  var sectionClassBegin = repDocObj.addSection("section_class_begin");
  if (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_text_begin_delivery_note) === typeof(Function)) {
      hook_print_text_begin_delivery_note(sectionClassBegin, invoiceObj, texts, userParam);
    } else {
      print_text_begin_delivery_note(sectionClassBegin, invoiceObj, texts, userParam);
    }
  }
  else if (printFormat === "reminder_1" || printFormat === "reminder_2" || printFormat === "reminder_3") {
    if (BAN_ADVANCED && typeof(hook_print_text_begin_reminder) === typeof(Function)) {
      hook_print_text_begin_reminder(sectionClassBegin, invoiceObj, texts, userParam, printFormat);
    } else {
      print_text_begin_reminder(sectionClassBegin, invoiceObj, texts, userParam, printFormat);
    }
  }
  else if (printFormat === "proforma_invoice") {
    if (BAN_ADVANCED && typeof(hook_print_text_begin_proforma_invoice) === typeof(Function)) {
      hook_print_text_begin_proforma_invoice(sectionClassBegin, invoiceObj, texts, userParam);
    } else {
      print_text_begin_proforma_invoice(sectionClassBegin, invoiceObj, texts, userParam);
    }
  }
  else {
    if (BAN_ADVANCED && typeof(hook_print_text_begin) === typeof(Function)) {
      hook_print_text_begin(sectionClassBegin, invoiceObj, texts, userParam);
    } else {
      print_text_begin(sectionClassBegin, invoiceObj, texts, userParam);
    }
  }

  /* PRINT INVOICE DETAILS */
  var sectionClassDetails = repDocObj.addSection("section_class_details");
  var detailsTable = sectionClassDetails.addTable("doc_table");

  if (printFormat === "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_details_delivery_note_without_amounts) === typeof(Function)) {
      hook_print_details_delivery_note_without_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    } else {
      print_details_delivery_note_without_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    }
  }
  else {
    // invoice, offers, reminders
    if (userParam.details_gross_amounts) {
      if (BAN_ADVANCED && typeof(hook_print_details_gross_amounts) === typeof(Function)) {
        hook_print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
      } else {
        print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
      }
    }
    else {
      if (BAN_ADVANCED && typeof(hook_print_details_net_amounts) === typeof(Function)) {
        hook_print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
      } else {
        print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
      }
    }
  }

  /* PRINT FINAL TEXTS (AFTER INVOICE DETAILS) */
  var sectionClassFinalTexts = repDocObj.addSection("section_class_final_texts");
  if (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts") {
    if (BAN_ADVANCED && typeof(hook_print_final_texts_delivery_note) === typeof(Function)) {
      hook_print_final_texts_delivery_note(sectionClassFinalTexts, invoiceObj, userParam);
    } else {
      print_final_texts_delivery_note(sectionClassFinalTexts, invoiceObj, userParam);
    }
  }
  else if (printFormat === "reminder_1" || printFormat === "reminder_2" || printFormat === "reminder_3") {
    if (BAN_ADVANCED && typeof(hook_print_final_texts_reminder) === typeof(Function)) {
      hook_print_final_texts_reminder(sectionClassFinalTexts, invoiceObj, userParam);
    } else {
      print_final_texts_reminder(sectionClassFinalTexts, invoiceObj, userParam);
    }
  }
  else if (printFormat === "proforma_invoice") {
    if (BAN_ADVANCED && typeof(hook_print_final_texts_proforma_invoice) === typeof(Function)) {
      hook_print_final_texts_proforma_invoice(sectionClassFinalTexts, invoiceObj, userParam);
    } else {
      print_final_texts_proforma_invoice(sectionClassFinalTexts, invoiceObj, userParam);
    }
  }
  else {
    if (BAN_ADVANCED && typeof(hook_print_final_texts) === typeof(Function)) {
      hook_print_final_texts(sectionClassFinalTexts, invoiceObj, userParam);
    } else {
      print_final_texts(sectionClassFinalTexts, invoiceObj, userParam);
    }
  }

  /* PRINT QR CODE */
  if (printFormat === "delivery_note" || printFormat === "delivery_note_without_amounts" || printFormat === "proforma_invoice") {
    userParam.qr_code_add = false; //delivery notes printed without QRCode
  }

  if (invoiceObj.payment_info && invoiceObj.payment_info.last_reminder_date && invoiceObj.payment_info.last_reminder_due_date && (printFormat === "reminder_1" || printFormat === "reminder_2" || printFormat === "reminder_3")) {
    // When printing Reminders with reminder date and reminder due date (which are different of the invoice date and invoice due date),
    // we upade the QR structured additional information using the reminder date and due date.
    // We do this because the QR now is based on the reminders dates and not on invoice dates anymore.

    // Set the invoice date as the last reminder date.
    invoiceObj.document_info.date = invoiceObj.payment_info.last_reminder_date;

    // Set the invoice due date as the last reminder due date.
    invoiceObj.payment_info.due_date = invoiceObj.payment_info.last_reminder_due_date;
  }

  if (userParam.qr_code_add && invoiceObj.document_info.doc_type !== "17") { // 17=offerta 
    var qrBill = new QRBill(banDoc, userParam);
    qrBill.printQRCode(invoiceObj, repDocObj, repStyleObj, userParam);
  }

  /* PRINT FOOTER */
  if (!userParam.qr_code_add) { //only if QRCode is not printed
    if (BAN_ADVANCED && typeof(hook_print_footer) === typeof(Function)) {
      hook_print_footer(repDocObj, texts, userParam);
    } else {
      print_footer(repDocObj, texts, userParam);
    }
  }

  /* DEVELOP */
  if (BAN_ADVANCED && userParam.dev_show_json) {
    showInvoiceJsons(banDoc, invoiceObj, preferencesObj, qrBill, userParam, texts);
  }

  return repDocObj;
}



//====================================================================//
// FUNCTIONS THAT PRINT ALL THE DIFFERENT PARTS OF THE INVOICE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED USING EMBEDDED 
// JAVASCRIPT FILES ON DOCUMENTS TABLE
//====================================================================//
function print_header(repDocObj, userParam, repStyleObj, invoiceObj, texts) {
  /*
    Prints the header: logo and text
  */
  var headerParagraph = repDocObj.getHeader().addSection();
  if (userParam.logo_print) {
    headerParagraph = repDocObj.addSection("");
    var logoFormat = Banana.Report.logoFormat(userParam.logo_name); //Logo
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(headerParagraph, repStyleObj, "logo");
      repDocObj.getHeader().addChild(logoElement);
    } else {
       headerParagraph.addClass("header_text");
    }
  } else {
     headerParagraph.addClass("header_text");
  }

  if (userParam.header_print) {

    if (userParam.header_row_1 || userParam.header_row_2 || userParam.header_row_3 || userParam.header_row_4 || userParam.header_row_5) {
      if (userParam.header_row_1.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_1, "header_row_1");
      }
      if (userParam.header_row_2.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_2, "header_row_2_to_5");
      } else {
        headerParagraph.addParagraph(" ", "header_row_2_to_5");
      }
      if (userParam.header_row_3.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_3, "header_row_2_to_5");
      } else {
        headerParagraph.addParagraph(" ", "header_row_2_to_5");
      }
      if (userParam.header_row_4.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_4, "header_row_2_to_5");
      } else {
        headerParagraph.addParagraph(" ", "header_row_2_to_5");
      }
      if (userParam.header_row_5.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_5, "header_row_2_to_5");
      }
    }
    else {
      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info, userParam, texts).split('\n');
      headerParagraph.addParagraph(supplierLines[0], "header_row_1");
      for (var i = 1; i < supplierLines.length; i++) {
        headerParagraph.addParagraph(supplierLines[i], "header_row_2_to_5");
      }      
    }
  }
}

function print_info_first_page(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the invoice information
  */
  var infoTable = "";
  var rows = 0;

  if (userParam.address_left) {
    infoTable = repDocObj.addTable("info_table_right");
  } else {
    infoTable = repDocObj.addTable("info_table_left");
  }

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
      tableRow.addCell(userParam[lang+'_text_info_invoice_number'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_offer_number'] + ":","",1);
    }
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  } else {
    rows++;
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
      tableRow.addCell(userParam[lang+'_text_info_date'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_date_offer'] + ":","",1);
    }
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  } else {
    rows++;
  }
  if (userParam.info_order_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.order_number,"",1);
  }
  if (userParam.info_order_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_date'] + ":","",1);
    if (invoiceObj.document_info.order_date && invoiceObj.document_info.order_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.order_date),"",1);
    } else {
      tableRow.addCell(invoiceObj.document_info.order_date,"",1);
    }
  }
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  } else {
    rows++;
  }
  if (userParam.info_customer_vat_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_vat_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.vat_number);
  } else {
    rows++;
  }
  if (userParam.info_customer_fiscal_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_fiscal_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.fiscal_number);
  } else {
    rows++;
  }
  if (userParam.info_due_date) {
    //Payment Terms
    var payment_terms_label = texts.payment_terms_label;
    var payment_terms = '';
    if (invoiceObj.billing_info.payment_term) { //10:ter
      payment_terms = invoiceObj.billing_info.payment_term;
    }
    else if (invoiceObj.payment_info.due_date) { //automatic
      payment_terms_label = texts.payment_due_date_label
      payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
    }

    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
      tableRow.addCell(userParam[lang+'_text_info_due_date'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_validity_date_offer'] + ":","",1);
    }
    if (invoiceObj.billing_info.payment_term) { //bold markdown when 10:ter
      var paymentCell = tableRow.addCell("","",1);
      addMdBoldText(paymentCell, payment_terms);
    } else {
      tableRow.addCell(payment_terms,"",1);
    }
  } else {
    rows++;
  }
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  } else {
    rows++;
  }

  //Adds custom fields
  //Works only with the estimates and invoices application
  //userParam.info_custom_fields is always set to false for integrated invoices, is never used
  if (userParam.info_custom_fields) {
    if (invoiceObj.document_info.custom_fields && invoiceObj.document_info.custom_fields.length > 0) {
      for (var i = 0; i < invoiceObj.document_info.custom_fields.length; i++) {
        var customField = invoiceObj.document_info.custom_fields[i];
        tableRow = infoTable.addRow();
        tableRow.addCell(customField.title + ":","",1);
        tableRow.addCell(customField.value,"",1);
      }
    }
  }

  //Empty rows for each non-used info
  for (var i = 0; i < rows; i++) {
    tableRow = infoTable.addRow();
    tableRow.addCell(" ", "", 2);
  }
}

function print_info_other_pages(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the invoice information
  */
  var infoTable = "";

  // Info table that starts at row 0, for pages 2+ :
  // Since we don't know when we are on a new page, we add Info as Header
  // and we do not display it the first time (first time is always on first page)
  repDocObj = repDocObj.getHeader();
  infoTable = repDocObj.addTable("info_table_row0");

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
      tableRow.addCell(userParam[lang+'_text_info_invoice_number'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_offer_number'] + ":","",1);
    }
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
      tableRow.addCell(userParam[lang+'_text_info_date'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_date_offer'] + ":","",1);
    }
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  }
  if (userParam.info_order_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.order_number,"",1);
  }
  if (userParam.info_order_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_date'] + ":","",1);
    if (invoiceObj.document_info.order_date && invoiceObj.document_info.order_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.order_date),"",1);
    } else {
      tableRow.addCell(invoiceObj.document_info.order_date,"",1);
    }
  }
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  }
  if (userParam.info_customer_vat_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_vat_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.vat_number);
  }
  if (userParam.info_customer_fiscal_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_fiscal_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.fiscal_number);
  }
  if (userParam.info_due_date) {
    //Payment Terms
    var payment_terms_label = texts.payment_terms_label;
    var payment_terms = '';
    if (invoiceObj.billing_info.payment_term) {
      payment_terms = invoiceObj.billing_info.payment_term;
    }
    else if (invoiceObj.payment_info.due_date) {
      payment_terms_label = texts.payment_due_date_label
      payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
    }

    tableRow = infoTable.addRow();
    if (invoiceObj.document_info.doc_type !== "17") {
      tableRow.addCell(userParam[lang+'_text_info_due_date'] + ":","",1);
    } else {
      tableRow.addCell(userParam[lang+'_text_info_validity_date_offer'] + ":","",1);
    }
    if (invoiceObj.billing_info.payment_term) { //bold markdown when 10:ter
      var paymentCell = tableRow.addCell("","",1);
      addMdBoldText(paymentCell, payment_terms);
    } else {
      tableRow.addCell(payment_terms,"",1);
    }    
  }
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  }
  //Adds custom fields
  //Works only with the estimates and invoices application
  //userParam.info_custom_fields is always set to false for integrated invoices, is never used
  if (userParam.info_custom_fields) {
    if (invoiceObj.document_info.custom_fields && invoiceObj.document_info.custom_fields.length > 0) {
      for (var i = 0; i < invoiceObj.document_info.custom_fields.length; i++) {
        var customField = invoiceObj.document_info.custom_fields[i];
        tableRow = infoTable.addRow();
        tableRow.addCell(customField.title + ":","",1);
        tableRow.addCell(customField.value,"",1);
      }
    }
  }
}

function print_customer_address(repDocObj, invoiceObj, userParam) {
  /*
    Print the customer address
  */
  var customerAddressTable = "";
  if (userParam.address_position_dX != 0 || userParam.address_position_dY != 0) {
    if (userParam.address_left) {
      customerAddressTable = repDocObj.addTable("custom_address_table_left");
    } else {
      customerAddressTable = repDocObj.addTable("custom_address_table_right");
    }
  }
  else {
    if (userParam.address_left) {
      customerAddressTable = repDocObj.addTable("address_table_left");
    } else {
      customerAddressTable = repDocObj.addTable("address_table_right");
    }
  }

  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);

  //Small line of the supplier address
  if (userParam.address_small_line) {
    if (userParam.address_small_line === "<none>") {
      cell.addText("","");
    } else {
      cell.addText(userParam.address_small_line, "small_address");
    }
  }
  else {
    var name = "";
    var address = "";
    var locality = "";
    if (invoiceObj.supplier_info.business_name) {
      name += invoiceObj.supplier_info.business_name;
    } 
    else {
      if (invoiceObj.supplier_info.first_name) {
        name += invoiceObj.supplier_info.first_name;
      }
      if (invoiceObj.supplier_info.last_name) {
        if (invoiceObj.supplier_info.first_name) {
          name += " ";
        }
        name += invoiceObj.supplier_info.last_name;
      }
    }
    if (invoiceObj.supplier_info.address1) {
      address += invoiceObj.supplier_info.address1;
    }
    if (invoiceObj.supplier_info.postal_code) {
      locality += invoiceObj.supplier_info.postal_code;
    }
    if (invoiceObj.supplier_info.city) {
      if (invoiceObj.supplier_info.postal_code) {
        locality += " "; 
      }
      locality += invoiceObj.supplier_info.city;
    }

    var supplierAddressLine = "";
    if (name) {
      supplierAddressLine += name;
    }
    if (address) {
      if (name) {
        supplierAddressLine += " - ";
      }
      supplierAddressLine += address;
    }
    if (locality) {
      if (address || name) {
        supplierAddressLine += " - ";
      }
      supplierAddressLine += locality;
    }
    if (supplierAddressLine) {
      cell.addText(supplierAddressLine, "small_address");
    }
  }
  
  // Customer address
  var customerAddress = getInvoiceAddress(invoiceObj.customer_info,userParam).split('\n');
  for (var i = 0; i < customerAddress.length; i++) {
    cell.addParagraph(customerAddress[i]);
  }
}

function print_shipping_address(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the shipping address
  */
  if (invoiceObj.shipping_info.different_shipping_address) {

    var billingAndShippingAddress = repDocObj.addTable("shipping_address");
    var tableRow = billingAndShippingAddress.addRow();
    var shippingCell = tableRow.addCell("","",1);

    if (userParam[lang+'_text_shipping_address']) {
      shippingCell.addParagraph(userParam[lang+'_text_shipping_address'],"title_shipping_address");
    } else {
      shippingCell.addParagraph(texts.shipping_address, "title_shipping_address");
    }
    var shippingAddress = getInvoiceAddress(invoiceObj.shipping_info,userParam).split('\n');
    for (var i = 0; i < shippingAddress.length; i++) {
      shippingCell.addParagraph(shippingAddress[i]);
    }
  }
}

function print_text_begin(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the text before the invoice details
  */
  var textTitle = getTitle(invoiceObj, texts, userParam);
  var textBegin = invoiceObj.document_info.text_begin;
  var textBeginSettings = userParam[lang+'_text_begin'];
  var textBeginOffer = userParam[lang+'_text_begin_offer'];
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;
  
  // print the title
  if (textTitle) {
    textTitle = textTitle.replace(/<DocInvoice>/g, invoiceObj.document_info.number.trim());
    textTitle = columnNamesToValues(invoiceObj, textTitle);
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(textTitle, "title_text");
  }

  if (textBegin) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBegin.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
  else if (!textBegin && textBeginOffer && invoiceObj.document_info.doc_type === "17") {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBeginOffer.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
  else if (!textBegin && textBeginSettings) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBeginSettings.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
}

function print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Print the invoice details using net Amounts (VAT excluded) 
  */
  
  removeDiscountColumn(invoiceObj, userParam);

  var columnsDimension = userParam.details_columns_widths.split(";");
  var repTableObj = detailsTable;
  for (var i = 0; i < columnsDimension.length; i++) {
    repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[i]);
  }

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsNames = userParam.details_columns.split(";");
  var columnsHeaders = userParam[lang+'_text_details_columns'].split(";");
  var titlesAlignment = userParam.details_columns_titles_alignment.split(";");

  // remove all empty values ("", null, undefined): 
  columnsNames = columnsNames.filter(function(e){return e});
  columnsHeaders = columnsHeaders.filter(function(e){return e});

  if (columnsNames.length == columnsHeaders.length) {
    for (var i = 0; i < columnsHeaders.length; i++) {
      var alignment = titlesAlignment[i];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "center";
      }
      columnsHeaders[i] = columnsHeaders[i].trim();
      if (columnsHeaders[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsHeaders[i], "doc_table_header "+ alignment, 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim().toLowerCase();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj, banDoc);
  var columnsAlignment = userParam.details_columns_alignment.split(";");

  //ITEMS
  var customColumnMsg = "";
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell"; // row with amount
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell"; // row with DocType 10:tot
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell"; // row without amount
    }
    if (item.item_type && item.item_type.indexOf("header") === 0) {
      className = "header_cell"; // row with DocType 10:hdr
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsNames.length; j++) {
      var alignment = columnsAlignment[j];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "left";
      }

      if (columnsNames[j].trim().toLowerCase() === "description") {
        //When 10:hdr with empty description, let empty line
        if (item.item_type && item.item_type.indexOf("header") === 0 && !item.description) {
          tableRow.addCell(" ", classNameEvenRow, 1);
        }
        else {
          // Note: currently itemValue2 does not exist, this will add an empty line
          // We don't remove this code because it will change how the invoice is printed and what the customer expect
          var itemValue = formatItemsValue(item.description, variables, columnsNames[j], className, item);
          var itemValue2 = formatItemsValue(item.description2, variables, columnsNames[j], className, item);
          var descriptionCell = tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          addMdBoldText(descriptionCell, itemValue.value);
          descriptionCell.addParagraph(itemValue2.value, "");
          addMultipleLinesDescriptions(banDoc, descriptionCell, item.origin_row, userParam);
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "quantity") {
        if (IS_INTEGRATED_INVOICE) {
          // Always print quantity if entered in the Quantity column, even if "quantity,unit,unitprice" are not all entered.
          // Transactions without quantity, in JSON are saved without decimals ("item.quantity":"1")
          // Transactins with quantity, in JSON are saved with four decimals ("item.quantity":"1.0000")
          if (item.quantity && item.quantity !== "1") {
            if (variables.decimals_quantity !== "") {
              decimals = variables.decimals_quantity;
            }
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          } else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
        else {
          if (item.quantity) {
            decimals = variables.decimals_quantity
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          }
          else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "referenceunit" || columnsNames[j] === "mesure_unit") {
        var itemValue = formatItemsValue(item.mesure_unit, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "unitprice" || columnsNames[j] === "unit_price") {
        var itemValue = formatItemsValue(item.unit_price.calculated_amount_vat_exclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "amount" || columnsNames[j] === "total_amount_vat_exclusive") {
        var itemValue = formatItemsValue(item.total_amount_vat_exclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "vatrate" || columnsNames[j] === "vat_rate") {
        var itemValue = formatItemsValue(item.unit_price.vat_rate, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "discount") {
        var itemValue = "";
        if (item.discount && item.discount.percent) {
          itemValue = formatItemsValue(item.discount.percent, variables, columnsNames[j], className, item);
          itemValue.value += "%";
        }
        else if (item.discount && item.discount.amount) {
          itemValue = formatItemsValue(item.discount.amount, variables, columnsNames[j], className, item);
        }
        else {
          itemValue = formatItemsValue("", variables, columnsNames[j], className, item);
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "number") {
        var itemValue = formatItemsValue(item.number, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else {
        var userColumnValue = "";
        var columnsName = columnsNames[j];
        var itemValue = "";
        //User defined columns only available with advanced version
        //In settings dialog, must start with "T." for integrated ivoices or "I." for estimates invoices
        //This prevent conflicts with JSON fields.
        if (BAN_ADVANCED) {
          //JSON contains a property with the name of the column (Item, Date)
          //In JSON all names are lower case
          if (objectHasProperty(item, columnsName)) {
            itemValue = formatItemsValue(objectGetProperty(item, columnsName), variables, columnsName, className, item);
          }
          else {
            userColumnValue = getUserColumnValue(banDoc, item.origin_row, item.number, columnsName);
            columnsName = columnsName.substring(2);
            itemValue = formatItemsValue(userColumnValue, variables, columnsName, className, item);            
          }
        }
        else {
          customColumnMsg = "The customization with custom columns requires Banana Accounting+ Advanced";
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
    }
  }
  // Show message when using "T.Column" with a non advanced version of Banana+
  if (customColumnMsg.length > 0) {
    banDoc.addMessage(customColumnMsg);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", columnsNumber);

  //DISCOUNT
  //Only used for the Application Estimates-Invoices
  //On Integrated Invoice, discounts are entered as items in transactions
  if (invoiceObj.billing_info.total_discount_vat_exclusive) {
    tableRow = repTableObj.addRow();
    let discountText = invoiceObj.billing_info.discount.description ? invoiceObj.billing_info.discount.description : texts.discount;
    if (invoiceObj.billing_info.discount.percent) {
      discountText += " " + invoiceObj.billing_info.discount.percent + "%";
    }
    tableRow.addCell(discountText, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(invoiceObj.billing_info.total_discount_vat_exclusive), variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //PRINT 0% VAT RATE
  //only when a VatCode with 0% VAT is used (i.e. V0)
  //when VAT is 0 but no VatCode is used (without VAT), the VAT rate is not printed
  if (invoiceObj.billing_info.total_vat_rate_zero) {
    invoiceObj.billing_info.total_vat_rate_zero.vat_rate = Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rate_zero.total_vat_amount,variables.decimals_amounts,true); //"0.00";
    invoiceObj.billing_info.total_vat_rates.unshift(invoiceObj.billing_info.total_vat_rate_zero);
  }

  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.totalnet, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_amount_vat_exclusive, variables.decimals_amounts, true), "right padding-left padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "% (" + Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive, variables.decimals_amounts, true) + ")", "padding-left padding-right", columnsNumber-1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, variables.decimals_amounts, true), "right padding-left padding-right", 1);
    }
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_rounding_difference, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DEPOSIT
  //Only used for the Application Estimates-Invoices
  if (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_advance_payment) {
    tableRow = repTableObj.addRow();
    if (invoiceObj.billing_info.total_advance_payment_description) {
      tableRow.addCell(invoiceObj.billing_info.total_advance_payment_description, "padding-left padding-right", columnsNumber-1);
    } else {
      tableRow.addCell(texts.deposit, "padding-left padding-right", columnsNumber-1);
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_advance_payment, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  tableRow = repTableObj.addRow();
  if (invoiceObj.billing_info.total_vat_rates.length > 0 || invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow.addCell("", "border-top", columnsNumber);
  } else {
    tableRow.addCell("", "", columnsNumber);
  }

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam[lang+'_text_total'] + " " + invoiceObj.document_info.currency, "total_cell", columnsNumber-1);
  tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_to_pay, variables.decimals_amounts, true), "total_cell right", 1);
}

function print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Prints the invoice details using gross Amounts (VAT included)
  */

  removeDiscountColumn(invoiceObj, userParam);

  var columnsDimension = userParam.details_columns_widths.split(";");
  var repTableObj = detailsTable;
  for (var i = 0; i < columnsDimension.length; i++) {
    repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[i]);
  }

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsNames = userParam.details_columns.split(";");
  var columnsHeaders = userParam[lang+'_text_details_columns'].split(";");
  var titlesAlignment = userParam.details_columns_titles_alignment.split(";");

  // remove all empty values ("", null, undefined): 
  columnsNames = columnsNames.filter(function(e){return e});
  columnsHeaders = columnsHeaders.filter(function(e){return e});

  if (columnsNames.length == columnsHeaders.length) {
    for (var i = 0; i < columnsHeaders.length; i++) {
      var alignment = titlesAlignment[i];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "center";
      }
      columnsHeaders[i] = columnsHeaders[i].trim();
      if (columnsHeaders[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsHeaders[i], "doc_table_header "+ alignment, 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj, banDoc);
  var columnsAlignment = userParam.details_columns_alignment.split(";");

  //ITEMS
  var customColumnMsg = "";
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell"; // row with amount
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell"; // row with DocType 10:tot
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell"; // row without amount
    }
    if (item.item_type && item.item_type.indexOf("header") === 0) {
      className = "header_cell"; // row with DocType 10:hdr
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsNames.length; j++) {
      var alignment = columnsAlignment[j];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "left";
      }

      if (columnsNames[j].trim().toLowerCase() === "description") {
        //When 10:hdr with empty description, let empty line
        if (item.item_type && item.item_type.indexOf("header") === 0 && !item.description) {
          tableRow.addCell(" ", classNameEvenRow, 1);
        }
        else {
          // Note: currently itemValue2 does not exist, this will add an empty line
          // We don't remove this code because it will change how the invoice is printed and what the customer expect
          var itemValue = formatItemsValue(item.description, variables, columnsNames[j], className, item);
          var itemValue2 = formatItemsValue(item.description2, variables, columnsNames[j], className, item);
          var descriptionCell = tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          addMdBoldText(descriptionCell, itemValue.value);
          descriptionCell.addParagraph(itemValue2.value, "");
          addMultipleLinesDescriptions(banDoc, descriptionCell, item.origin_row, userParam);
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "quantity") {
        if (IS_INTEGRATED_INVOICE) {
          // Always print quantity if entered in the Quantity column, even if "quantity,unit,unitprice" are not all entered.
          // Transactions without quantity, in JSON are saved without decimals ("item.quantity":"1")
          // Transactins with quantity, in JSON are saved with four decimals ("item.quantity":"1.0000")
          if (item.quantity && item.quantity !== "1") {
            if (variables.decimals_quantity !== "") {
              decimals = variables.decimals_quantity;
            }
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          } else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
        else {
          if (item.quantity) {
            decimals = variables.decimals_quantity;
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          }
          else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "referenceunit" || columnsNames[j] === "mesure_unit") {
        var itemValue = formatItemsValue(item.mesure_unit, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "unitprice" || columnsNames[j] === "unit_price") {
        var itemValue = formatItemsValue(item.unit_price.calculated_amount_vat_inclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "amount" || columnsNames[j] === "total_amount_vat_inclusive") {
        var itemValue = formatItemsValue(item.total_amount_vat_inclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "vatrate" || columnsNames[j] === "vat_rate") {
        var itemValue = formatItemsValue(item.unit_price.vat_rate, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "discount") {
        var itemValue = "";
        if (item.discount && item.discount.percent) {
          itemValue = formatItemsValue(item.discount.percent, variables, columnsNames[j], className, item);
          itemValue.value += "%";
        }
        else if (item.discount && item.discount.amount) {
          itemValue = formatItemsValue(item.discount.amount, variables, columnsNames[j], className, item);
        }
        else {
          itemValue = formatItemsValue("", variables, columnsNames[j], className, item);
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "number") {
        var itemValue = formatItemsValue(item.number, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else {
        var userColumnValue = "";
        var columnsName = columnsNames[j];
        var itemValue = "";
        //User defined columns only available with advanced version
        //In settings dialog, must start with "T." for integrated ivoices or "I." for estimates invoices
        //This prevent conflicts with JSON fields.
        if (BAN_ADVANCED) {
          //JSON contains a property with the name of the column (Item, Date)
          //In JSON all names are lower case
          if (objectHasProperty(item, columnsName)) {
            itemValue = formatItemsValue(objectGetProperty(item, columnsName), variables, columnsName, className, item);
          }
          else {
            userColumnValue = getUserColumnValue(banDoc, item.origin_row, item.number, columnsName);
            columnsName = columnsName.substring(2);
            itemValue = formatItemsValue(userColumnValue, variables, columnsName, className, item);            
          }
        }
        else {
          customColumnMsg = "The customization with custom columns requires Banana Accounting+ Advanced";
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
    }
  }
  // Show message when using custom column with a non advanced version of Banana+
  if (customColumnMsg.length > 0) {
    banDoc.addMessage(customColumnMsg);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", columnsNumber);

  //SUBTOTAL
  //Only used for the Application Estimates-Invoices
  //Print subtotal if there is discount, deposit or rounding
  if (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference
    || invoiceObj.billing_info.total_advance_payment)
  ) {
    
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.subtotal, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_amount_vat_inclusive_before_discount, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DISCOUNT
  //Only used for the Application Estimates-Invoices
  //On Integrated Invoice, discounts are entered as items in transactions
  if (invoiceObj.billing_info.total_discount_vat_inclusive) {
    tableRow = repTableObj.addRow();
    let discountText = invoiceObj.billing_info.discount.description ? invoiceObj.billing_info.discount.description : texts.discount;
    if (invoiceObj.billing_info.discount.percent) {
      discountText += " " + invoiceObj.billing_info.discount.percent + "%";
    }
    tableRow.addCell(discountText, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(invoiceObj.billing_info.total_discount_vat_inclusive), variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_rounding_difference, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DEPOSIT
  //Only used for the Application Estimates-Invoices
  if (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_advance_payment) {
    tableRow = repTableObj.addRow();
    if (invoiceObj.billing_info.total_advance_payment_description) {
      tableRow.addCell(invoiceObj.billing_info.total_advance_payment_description, "padding-left padding-right", columnsNumber-1);
    } else {
      tableRow.addCell(texts.deposit, "padding-left padding-right", columnsNumber-1);
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_advance_payment, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  tableRow = repTableObj.addRow();
  if (invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference
    || (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_advance_payment) )
  ) {
    tableRow.addCell("", "border-top", columnsNumber);
  } else {
    tableRow.addCell("", "", columnsNumber);
  }

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam[lang+'_text_total'] + " " + invoiceObj.document_info.currency, "total_cell", columnsNumber-1);
  tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_to_pay, variables.decimals_amounts, true), "total_cell right", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", columnsNumber);

  //VAT INFO
  tableRow = repTableObj.addRow();
  var cellVatInfo = tableRow.addCell("", "padding-right right vat_info", columnsNumber);
  for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
    var vatInfo = "";
    vatInfo += Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_inclusive, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency + " (" + texts.gross + ") // ";
    vatInfo += Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency + " (" + texts.net + ")";
    vatInfo += " " + texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%";
    vatInfo += " = " + Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency;
    cellVatInfo.addParagraph(vatInfo);
  }
}

function print_final_texts(repDocObj, invoiceObj, userParam) {
  /*
    Prints all the texts (notes, greetings and final texts) after the invoice details:
    - Default text is taken from the Print invoices -> Template options.
    - If user let empty the parameter on Settings dialog -> Final text, it is used the default
    - If user enter a text as parameter on Settings dialog -> Final text, it is used this instead.
    - If user enter "<none>" as paramenter on Settings dialog -> Final text, no final text is printed.
  */

  // Notes (multiple lines)
  if (invoiceObj.note.length > 0) {
    for (var i = 0; i < invoiceObj.note.length; i++) {
      if (invoiceObj.note[i].description) {
        var textNote = invoiceObj.note[i].description;
        textNote = columnNamesToValues(invoiceObj, textNote);
        var paragraph = repDocObj.addParagraph("","final_texts");
        addMdBoldText(paragraph, textNote);
      }
    }    
  }

  // Greetings (one line only)
  if (invoiceObj.document_info.greetings) {
    if (invoiceObj.note.length > 0) {
      repDocObj.addParagraph(" ", "");
    }
    var textGreetings = invoiceObj.document_info.greetings;
    textGreetings = columnNamesToValues(invoiceObj, textGreetings);
    var paragraph = repDocObj.addParagraph("","final_texts");
    addMdBoldText(paragraph, textGreetings);
  }

  //Text taken from the Settings dialog's parameter "Final text"
  if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
    if (userParam[lang+'_text_final'] && userParam[lang+'_text_final'] !== "<none>") {
      var text = userParam[lang+'_text_final'];
      text = text.split('\n');
      if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
        repDocObj.addParagraph(" ", "");
      }
      for (var i = 0; i < text.length; i++) {
        var paragraph = repDocObj.addParagraph("","final_texts");
        if (text[i]) {
          text[i] = columnNamesToValues(invoiceObj, text[i]);
          addMdBoldText(paragraph, text[i]);
        } else {
          addMdBoldText(paragraph, " "); //empty lines
        }
      }
    }

    // Template params, default text starts with "(" and ends with ")" (default), (Vorderfiniert)
    else if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts && !userParam[lang+'_text_final']) {
      var textDefault = [];
      var text = [];
      for (var i = 0; i < invoiceObj.template_parameters.footer_texts.length; i++) {
        var textLang = invoiceObj.template_parameters.footer_texts[i].lang;
        if (textLang.indexOf('(') === 0 && textLang.indexOf(')') === textLang.length-1) {
          textDefault = invoiceObj.template_parameters.footer_texts[i].text;
        }
        else if (textLang == lang) {
          text = invoiceObj.template_parameters.footer_texts[i].text;
        }
      }
      if (text.join().length <= 0) {
        text = textDefault;
      }
      if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
        repDocObj.addParagraph(" ", "");
      }
      for (var i = 0; i < text.length; i++) {
        var paragraph = repDocObj.addParagraph("","final_texts");
        if (text[i]) {
          text[i] = columnNamesToValues(invoiceObj, text[i]);
          addMdBoldText(paragraph, text[i]);
        } else {
          addMdBoldText(paragraph, " "); //empty lines
        }
      }
    }
  }
  else { //estimates
    if (userParam[lang+'_text_final_offer'] && userParam[lang+'_text_final_offer'] !== "<none>") {
      var text = userParam[lang+'_text_final_offer'];
      text = text.split('\n');
      if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
        repDocObj.addParagraph(" ", "");
      }
      for (var i = 0; i < text.length; i++) {
        var paragraph = repDocObj.addParagraph("","final_texts");
        if (text[i]) {
          text[i] = columnNamesToValues(invoiceObj, text[i]);
          addMdBoldText(paragraph, text[i]);
        } else {
          addMdBoldText(paragraph, " "); //empty lines
        }
      }
    }

  }
}

function print_footer(repDocObj, texts, userParam) {
  /*
    Prints the footer at the bottom of the page.
    Values "<Page>", "<Pagina>", "<Seite>",.. are replaced with the page number.
    It is possible to add only one value in a row.
    It is possible to add more values on multiple rows.
    For empty value insert <none>.
  */
  var footerLeft = false;
  var footerCenter = false;
  var footerRight = false;
  if (userParam[lang+'_footer_left'] && userParam[lang+'_footer_left'].length > 0 && userParam[lang+'_footer_left'] !== '<none>') {
    footerLeft = true;
  }
  if (userParam[lang+'_footer_center'] && userParam[lang+'_footer_center'].length > 0 && userParam[lang+'_footer_center'] !== '<none>') {
    footerCenter = true;
  }
  if (userParam[lang+'_footer_right'] && userParam[lang+'_footer_right'].length > 0 && userParam[lang+'_footer_right'] !== '<none>') {
    footerRight = true;
  }

  if (userParam.footer_add) {
    var footerLine = "";
    if (userParam.footer_horizontal_line) {
      footerLine = "footer_line";
    }
    var paragraph = repDocObj.getFooter().addParagraph("",footerLine);
    var tabFooter = repDocObj.getFooter().addTable("footer_table");

    if (footerLeft && !footerCenter && !footerRight) { //only footer left
      var col1 = tabFooter.addColumn().setStyleAttributes("width:100%");
      var tableRow = tabFooter.addRow();
      var cell1 = tableRow.addCell("","",1);
    }
    else if (!footerLeft && footerCenter && !footerRight) { //only footer center
      var col2 = tabFooter.addColumn().setStyleAttributes("width:100%");
      var tableRow = tabFooter.addRow();
      var cell2 = tableRow.addCell("","",1);
    }
    else if (!footerLeft && !footerCenter && footerRight) { //only footer right
      var col3 = tabFooter.addColumn().setStyleAttributes("width:100%"); 
      var tableRow = tabFooter.addRow();
      var cell3 = tableRow.addCell("","",1);
    }
    else if (footerLeft && !footerCenter && footerRight) { //footer left and right
      var col1 = tabFooter.addColumn().setStyleAttributes("width:50%");
      var col3 = tabFooter.addColumn().setStyleAttributes("width:50%");
      var tableRow = tabFooter.addRow();
      var cell1 = tableRow.addCell("","",1);
      var cell3 = tableRow.addCell("","",1);   
    }
    else { // footer left, center and right
      var col1 = tabFooter.addColumn().setStyleAttributes("width:33%");
      var col2 = tabFooter.addColumn().setStyleAttributes("width:33%");
      var col3 = tabFooter.addColumn().setStyleAttributes("width:33%");
      var tableRow = tabFooter.addRow();
      var cell1 = tableRow.addCell("","",1);
      var cell2 = tableRow.addCell("","",1);
      var cell3 = tableRow.addCell("","",1);
    }

    // footer left
    if (footerLeft) {
      var lines = userParam[lang+'_footer_left'].split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("<"+texts.page+">") > -1) {
          cell1.addParagraph(lines[i].replace("<"+texts.page+">",""), "").addFieldPageNr();
        }
        else if (lines[i].indexOf("<"+texts.date+">") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell1.addParagraph(lines[i].replace("<"+texts.date+">",date), "");
        }
        else {
          cell1.addParagraph(lines[i], "");
        }
      }
    }
    // footer center
    if (footerCenter) {
      var lines = userParam[lang+'_footer_center'].split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("<"+texts.page+">") > -1) {
          cell2.addParagraph(lines[i].replace("<"+texts.page+">",""), "center").addFieldPageNr();
        }
        else if (lines[i].indexOf("<"+texts.date+">") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell2.addParagraph(lines[i].replace("<"+texts.date+">",date), "center");
        }
        else {
          cell2.addParagraph(lines[i], "center");
        }
      }
    }
    // footer right
    if (footerRight) {
      var lines = userParam[lang+'_footer_right'].split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("<"+texts.page+">") > -1) {
          cell3.addParagraph(lines[i].replace("<"+texts.page+">",""), "right").addFieldPageNr();
        }
        else if (lines[i].indexOf("<"+texts.date+">") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell3.addParagraph(lines[i].replace("<"+texts.date+">",date), "right");
        }
        else {
          cell3.addParagraph(lines[i], "right");
        }
      }
    }
  }
  else {
    var tabFooter = repDocObj.getFooter().addTable("footer_table");
    var tableRow = tabFooter.addRow();
    tableRow.addCell("","",1);
  }
}

function formatItemsValue(value, variables, columnName, className, item) {
  /**
   * Formats the value and classname of the item. 
   */
  columnName = columnName.trim().toLowerCase();

  if (typeof(hook_formatItemsValue) === typeof(Function)) {
    var newItemFormatted = {};
    newItemFormatted = hook_formatItemsValue(value, columnName, className, item);
    if (newItemFormatted.value || newItemFormatted.className) {
      return newItemFormatted;
    }
  }

  var itemFormatted = {};
  itemFormatted.value = "";
  itemFormatted.className = "";

  if (columnName === "description") {
    itemFormatted.value = value;
    itemFormatted.className = className;
  }
  else if (columnName === "quantity") {
    var decimal = variables;
    if (!IS_INTEGRATED_INVOICE) {
      decimal = getDecimalsCount(value);
      if (variables) {
          decimal = Math.max(decimal, variables);
      }
    }
    itemFormatted.value = Banana.Converter.toLocaleNumberFormat(value,decimal);
    itemFormatted.className = className;
  }
  else if (columnName === "unitprice" || columnName === "unit_price") {
    var decimal = variables.decimals_unit_price;
    if (!IS_INTEGRATED_INVOICE) {
      decimal = Math.max(2, getDecimalsCount(value));
    }
    itemFormatted.value = Banana.Converter.toLocaleNumberFormat(value, decimal, true);
    itemFormatted.className = className;
  }
  else if (columnName === "referenceunit" || columnName === "mesure_unit") {
    itemFormatted.value = value;
    itemFormatted.className = className;
  }
  else if (columnName === "amount" || columnName.indexOf("amount") >= 0) {
    if (className === "header_cell" || className === "note_cell") { //do not print 0.00 amount for header rows and notes (rows without amounts)
      itemFormatted.value = "";
    } else {
      itemFormatted.value = Banana.Converter.toLocaleNumberFormat(value, variables.decimals_amounts, true);
    }
    itemFormatted.className = className;
  }
  else if (columnName.startsWith("date")) {
    itemFormatted.value = Banana.Converter.toLocaleDateFormat(value);
    itemFormatted.className = className;
  }
  else if (columnName.startsWith("time")) {
    itemFormatted.value = Banana.Converter.toLocaleTimeFormat(value);
    itemFormatted.className = className;
  }
  else if (columnName === "vatrate" || columnName === "vat_rate") {
    if (className === "item_cell") { //print vat rate only for items rows
      itemFormatted.value = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(value));
    } else {
      itemFormatted.value = "";
    }
    itemFormatted.className = className;
  }
  else if (columnName) {
    itemFormatted.value = value;
    itemFormatted.className = className;
  }

  return itemFormatted;
}


//====================================================================//
// OTHER UTILITIES FUNCTIONS
//====================================================================//
function addMultipleLinesDescriptions(banDoc, descriptionCell, originRow, userParam) {
  /**
   * Check for "Description2", "Description3", "DescriptionX",..(where X is a number) columns in table Transactions. 
   * The content of the columns can be printed on multiple lines (each column in a new line) after the main
   * description (column "Description").
   * Works only for integrated invoices.
   */

  if (IS_INTEGRATED_INVOICE && userParam.details_additional_descriptions) {

    //Return all xml column names
    let table = banDoc.table('Transactions');
    let tColumnNames = table.columnNames;
    let descriptionsColumns = [];

    //Get only "DescriptionXX" columns
    for (let i = 0; i < tColumnNames.length; i++) {
      if (tColumnNames[i].match(/^Description\d+$/)) {
        descriptionsColumns.push(tColumnNames[i]);
      }
    }

    //Sort the array
    descriptionsColumns.sort();

    //Add each additional description as new paragraph in the description cell of the invoice details table
    if (descriptionsColumns.length > 0) {
      for (let i = 0; i < table.rowCount; i++) {
        let tRow = table.row(i);
        if (tRow.rowNr.toString() === originRow.toString()) {
          for (let j = 0; j < descriptionsColumns.length; j++) {
            let desc = tRow.value(descriptionsColumns[j]);
            if (desc) {
              addMdBoldText(descriptionCell, desc);
            }
          }
        }
      }
    }
  }
}

function columnNamesToValues(invoiceObj, text) {
  /*
    Function that replaces the xml column names of the customer address
    with the respective data
  */
  var docInvoice = invoiceObj.document_info.number;
  var courtesy = invoiceObj.customer_info.courtesy;
  var businessName = invoiceObj.customer_info.business_name;
  var businessUnit = invoiceObj.customer_info.business_unit;
  var businessUnit2 = invoiceObj.customer_info.business_unit2;
  var businessUnit3 = invoiceObj.customer_info.business_unit3;
  var businessUnit4 = invoiceObj.customer_info.business_unit4;
  var firstName = invoiceObj.customer_info.first_name;
  var lastName = invoiceObj.customer_info.last_name;
  var address1 = invoiceObj.customer_info.address1;
  var address2 = invoiceObj.customer_info.address2;
  var address3 = invoiceObj.customer_info.address3;
  var postalCode = invoiceObj.customer_info.postal_code;
  var city = invoiceObj.customer_info.city;
  var state = invoiceObj.customer_info.state;
  var country = invoiceObj.customer_info.country;
  var countryCode = invoiceObj.customer_info.country_code;

  // Replaces column names with values (only with the advanced license)
  if (BAN_ADVANCED) {
    if (docInvoice && text.indexOf("<DocInvoice>") > -1) {
      text = text.replace(/<DocInvoice>/g, docInvoice.trim());
    } else {
      text = text.replace(/<DocInvoice>/g, "<>");
    }
    if (courtesy && text.indexOf("<NamePrefix>") > -1) {
      text = text.replace(/<NamePrefix>/g, courtesy.trim());
    } else {
      text = text.replace(/<NamePrefix>/g, "<>");
    }
    if (businessName && text.indexOf("<OrganisationName>") > -1) {
      text = text.replace(/<OrganisationName>/g, businessName.trim());
    } else {
      text = text.replace(/<OrganisationName>/g, "<>");
    }
    if (businessUnit && text.indexOf("<OrganisationUnit>") > -1) {
      text = text.replace(/<OrganisationUnit>/g, businessUnit.trim());
    } else {
      text = text.replace(/<OrganisationUnit>/g, "<>");
    }
    if (businessUnit2 && text.indexOf("<OrganisationUnit2>") > -1) {
      text = text.replace(/<OrganisationUnit2>/g, businessUnit2.trim());
    } else {
      text = text.replace(/<OrganisationUnit2>/g, "<>");
    }
    if (businessUnit3 && text.indexOf("<OrganisationUnit3>") > -1) {
      text = text.replace(/<OrganisationUnit3>/g, businessUnit3.trim());
    } else {
      text = text.replace(/<OrganisationUnit3>/g, "<>");
    }
    if (businessUnit4 && text.indexOf("<OrganisationUnit4>") > -1) {
      text = text.replace(/<OrganisationUnit4>/g, businessUnit4.trim());
    } else {
      text = text.replace(/<OrganisationUnit4>/g, "<>");
    }
    if (firstName && text.indexOf("<FirstName>") > -1) {
      text = text.replace(/<FirstName>/g, firstName.trim());
    } else {
      text = text.replace(/<FirstName>/g, "<>");
    }
    if (lastName && text.indexOf("<FamilyName>") > -1) {
      text = text.replace(/<FamilyName>/g, lastName.trim());
    } else {
      text = text.replace(/<FamilyName>/g, "<>");
    }
    if (address1 && text.indexOf("<Street>") > -1) {
      text = text.replace(/<Street>/g, address1.trim());
    } else {
      text = text.replace(/<Street>/g, "<>");
    }
    if (address2 && text.indexOf("<AddressExtra>") > -1) {
      text = text.replace(/<AddressExtra>/g, address2.trim());
    } else {
      text = text.replace(/<AddressExtra>/g, "<>");
    }
    if (address3 && text.indexOf("<POBox>") > -1) {
      text = text.replace(/<POBox>/g, address3.trim());
    } else {
      text = text.replace(/<POBox>/g, "<>");
    }
    if (postalCode && text.indexOf("<PostalCode>") > -1) {
      text = text.replace(/<PostalCode>/g, postalCode.trim());
    } else {
      text = text.replace(/<PostalCode>/g, "<>");
    }
    if (city && text.indexOf("<Locality>") > -1) {
      text = text.replace(/<Locality>/g, city.trim());
    } else {
      text = text.replace(/<Locality>/g, "<>");
    }
    if (state && text.indexOf("<Region>") > -1) {
      text = text.replace(/<Region>/g, state.trim());
    } else {
      text = text.replace(/<Region>/g, "<>");
    }
    if (country && text.indexOf("<Country>") > -1) {
      text = text.replace(/<Country>/g, country.trim());
    } else {
      text = text.replace(/<Country>/g, "<>");
    }
    if (countryCode && text.indexOf("<CountryCode>") > -1) {
      text = text.replace(/<CountryCode>/g, countryCode.trim());
    } else {
      text = text.replace(/<CountryCode>/g, "<>");
    }
    text = text.replace(/ \n/g,"");
    text = text.replace(/<> /g,"");
    text = text.replace(/ <>/g,"");
    text = text.replace(/<>\n/g,"");
    text = text.replace(/<>/g,"");
  }

  return text;
}

function getQuantityDecimals(invoiceObj, banDoc) {
  /*
    For the given invoice check the decimal used for the quantity.
    Decimals can be 2 or 4.
    Returns the greater value.

    For integrated invoices checks the format of Quantity column of Transactions table.
    When the format is without decimals ("0.") the quantity decimals is set to 0.
    When the format is with 1 decimal ("0.0") the quantity decimals is set to 1.
    When the format is with 3 decimals ("0.000") the quantity decimals is set to 3.
    When the format is with 4 decimals ("0.0000") the quantity decimals is set to 4.
    Otherwise is set to 2 or 4.
  */
  var format = "";
  format = getColumnQuantityFormat(banDoc);
  if (format && format === "0.") {
    return 0;
  }
  else if (format && format === "0.0") {
    return 1;
  }
  else if (format && format === "0.000") {
    return 3;
  }
  else if (format && format === "0.0000") {
    return 4;
  }
  else {
      var arr = [];
      var decimals = "";
      for (var i = 0; i < invoiceObj.items.length; i++) { //check the qty of each item of the invoice
        var item = invoiceObj.items[i];
        if (item.quantity) {
          var qty = item.quantity;
          var res = qty.split(".");
          if (res[1] && res[1].length == 4 && res[1] !== "0000" && res[1].substring(1,4) !== "000" && res[1].substring(2,4) !== "00") {
            decimals = 4;
          } else {
            decimals = 2;
          }
        }
        else {
          decimals = 2;
        }
        arr.push(decimals);
      }
      //Remove duplicates
      for (var i = 0; i < arr.length; i++) {
        for (var x = i+1; x < arr.length; x++) {
          if (arr[x] === arr[i]) {
            arr.splice(x,1);
            --x;
          }
        }
      }
      arr.sort();
      arr.reverse();
      return arr[0]; //first element is the bigger
  }
}

function getDecimalsCount(value) {
  if (value) {
    var separatorPos = value.indexOf('.')
    if (separatorPos > -1) {
      return value.length - separatorPos - 1;
    }
  }
  return 0
}

function includeEmbeddedJavascriptFile(banDoc, texts, userParam) {

  /*
    Include the javascript file (.js) entered by the user.
    User can define an embedded javascript file in the table Documents
    and use it to write his own 'hook' functions that overwrite the
    default functions.
  */


  // User entered a javascript file name
  // Take from the table documents all the javascript file names
  if (userParam.embedded_javascript_filename) {

    if (BAN_ADVANCED) {
    
      var jsFiles = [];
      
      // If Documents table exists, take all the ".js" file names
      var documentsTable = Banana.document.table("Documents");
      if (documentsTable) {
        for (var i = 0; i < documentsTable.rowCount; i++) {
          var tRow = documentsTable.row(i);
          var id = tRow.value("RowId");
          if (id.indexOf(".js") > -1) {
            jsFiles.push(id);
          }
        }
      }

      // Table documents contains javascript files
      if (jsFiles.length > 0) {

        // The javascript file name entered by user exists on documents table: include this file
        if (jsFiles.indexOf(userParam.embedded_javascript_filename) > -1) {
          try {
            Banana.include("documents:" + userParam.embedded_javascript_filename);
          }
          catch(error) {
            banDoc.addMessage(texts.embedded_javascript_file_not_found);
          }
        }
      }
    }
    else {
      banDoc.addMessage("The customization with Javascript requires Banana Accounting+ Advanced");
    }
  }
}

function getUserColumnValue(banDoc, originRow, itemNumber, column) {

  /*
    Take the value from a custom column of the table Transactions/Items.
    User can add new custom columns on the Transactions/Items tables and include
    them into the invoice details table.
  */

  // Integrated invoice
  // - table Transactions, column name in settings dialog must start with "T."
  // - table Items, column name in settings dialog must start with "I."
  if (IS_INTEGRATED_INVOICE) {
    if (column.startsWith("T.")) {
      var table = banDoc.table('Transactions');
      for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        if (tRow.rowNr.toString() === originRow.toString()) {      
          return tRow.value(column.substring(2)); //without "T."
        }
      }
    }
    else if (column.startsWith("I.")) {
      var table = banDoc.table('Items');
      for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var id = tRow.value("ItemsId");
        if (id === itemNumber) {      
          return tRow.value(column.substring(2)); //without "I."
        }
      }
    }
  }
  else {
    // Estimates & Invoices application
    // - table Items, column name in settings dialog must start with "I."
    if (column.startsWith("I.")) {
      var table = banDoc.table('Items');
      for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var id = tRow.value("RowId");
        if (id === itemNumber) {      
          return tRow.value(column.substring(2)); //without "I."
        }
      }
    }
  }
}

function getInvoiceAddress(invoiceAddress, userParam) {
  // Invoice object values
  var courtesy = invoiceAddress.courtesy;
  var businessName = invoiceAddress.business_name;
  var businessUnit = invoiceAddress.business_unit;
  var businessUnit2 = invoiceAddress.business_unit2;
  var businessUnit3 = invoiceAddress.business_unit3;
  var businessUnit4 = invoiceAddress.business_unit4;
  var firstName = invoiceAddress.first_name;
  var lastName = invoiceAddress.last_name;
  var address1 = invoiceAddress.address1;
  var address2 = invoiceAddress.address2;
  var address3 = invoiceAddress.address3;
  var postalCode = invoiceAddress.postal_code;
  var city = invoiceAddress.city;
  var state = invoiceAddress.state;
  var country = invoiceAddress.country;
  var countryCode = invoiceAddress.country_code;

  var address = "";

  // User parameter values
  address = userParam.address_composition;

  if (address.indexOf("<NamePrefix>") > -1 && courtesy) {
    address = address.replace(/<NamePrefix>/g, courtesy.trim());
  }

  if (address.indexOf("<OrganisationName>") > -1 && businessName) {
    address = address.replace(/<OrganisationName>/g, businessName.trim());
  }
  
  if (address.indexOf("<OrganisationUnit>") > -1 && businessUnit) {
    address = address.replace(/<OrganisationUnit>/g, businessUnit.trim());
  }

  if (address.indexOf("<OrganisationUnit2>") > -1 && businessUnit2) {
    address = address.replace(/<OrganisationUnit2>/g, businessUnit2.trim());
  }

  if (address.indexOf("<OrganisationUnit3>") > -1 && businessUnit3) {
    address = address.replace(/<OrganisationUnit3>/g, businessUnit3.trim());
  }

  if (address.indexOf("<OrganisationUnit4>") > -1 && businessUnit4) {
    address = address.replace(/<OrganisationUnit4>/g, businessUnit4.trim());
  }

  if (address.indexOf("<FirstName>") > -1 && firstName) {
    address = address.replace(/<FirstName>/g, firstName.trim());
  }
  
  if (address.indexOf("<FamilyName>") > -1 && lastName) {
    address = address.replace(/<FamilyName>/g, lastName.trim());
  }
  
  if (address.indexOf("<Street>") > -1 && address1) {
    address = address.replace(/<Street>/g, address1.trim());
  }
  
  if (address.indexOf("<AddressExtra>") > -1 && address2) {
    address = address.replace(/<AddressExtra>/g, address2.trim());
  }
  
  if (address.indexOf("<POBox>") > -1 && address3) {
    address = address.replace(/<POBox>/g, address3.trim());
  }
  
  if (address.indexOf("<PostalCode>") > -1 && postalCode) {
    address = address.replace(/<PostalCode>/g, postalCode.trim());
  }
  
  if (address.indexOf("<Locality>") > -1 && city) {
    address = address.replace(/<Locality>/g, city.trim());
  }
  
  if (address.indexOf("<Region>") > -1 && state) {
    address = address.replace(/<Region>/g, state.trim());
  }
  
  if (address.indexOf("<Country>") > -1 && country) {
    address = address.replace(/<Country>/g, country.trim());
  }
  
  if (address.indexOf("<CountryCode>") > -1 && countryCode) {
    address = address.replace(/<CountryCode>/g, countryCode.trim());
  }

  //replace all tags not replaced ("<text>") with an empty string
  address = address.replace(/<\w+>/g,"");

  //create an array and remove the empty elements (rows/tags not used)
  var rows = address.split("\n");
  for (var i = rows.length - 1; i >= 0; i--) {
    rows[i] = rows[i].trim();
    if (rows[i] === "") {
      rows.splice(i, 1);
    }
  }

  //create the final address string with '\n' as separator
  //the string now does not have any space or empty row
  address = rows.join("\n");

  return address;
}

function getInvoiceSupplier(invoiceSupplier, userParam, texts) {
  var supplierAddress = "";

  if (invoiceSupplier.business_name) {
    supplierAddress += invoiceSupplier.business_name + "\n";
  }
  if (invoiceSupplier.first_name) {
    supplierAddress += invoiceSupplier.first_name;
  }
  if (invoiceSupplier.last_name) {
    if (invoiceSupplier.first_name) {
      supplierAddress += " ";
    }
    supplierAddress += invoiceSupplier.last_name;
  }
  supplierAddress += "\n";

  if (invoiceSupplier.address1) {
    supplierAddress += invoiceSupplier.address1;
  }
  if (invoiceSupplier.address2) {
    if (invoiceSupplier.address1) {
      supplierAddress += ", ";
    }
    supplierAddress += invoiceSupplier.address2;
  }

  if (invoiceSupplier.postal_code) {
    if (invoiceSupplier.address1 || invoiceSupplier.address2) {
      supplierAddress += ", ";
    }
    supplierAddress += invoiceSupplier.postal_code;
  }
  if (invoiceSupplier.city) {
    if (invoiceSupplier.postal_code) {
      supplierAddress += " ";
    }
    supplierAddress += invoiceSupplier.city;
  }
  supplierAddress += "\n";

  if (invoiceSupplier.phone) {
    supplierAddress += texts.phone + ": " + invoiceSupplier.phone;
  }
  if (invoiceSupplier.fax) {
    if (invoiceSupplier.phone) {
      supplierAddress += ", ";
    }
    supplierAddress += "Fax: " + invoiceSupplier.fax;
  }
  supplierAddress += "\n";

  if (invoiceSupplier.email) {
    supplierAddress += invoiceSupplier.email;
  }
  if (invoiceSupplier.web) {
    if (invoiceSupplier.email) {
      supplierAddress += ", ";
    }
    supplierAddress += invoiceSupplier.web;
  }
  if (invoiceSupplier.vat_number) {
    supplierAddress += "\n" + invoiceSupplier.vat_number;
  }

  return supplierAddress;
}

function getTitle(invoiceObj, texts, userParam) {

  /*
    Returns the title based on the DocType value (10=Invoice, 12=Credit note, 17=Offer)
    By default are used these values.
    User can enter a different text in parameters settings ("<none>" to not print any title).
    User can define a title in Transactions table by using the command "10:tit" (this has priority over all)
  */

  var documentTitle = "";
  if (invoiceObj.document_info.title) {
    documentTitle = invoiceObj.document_info.title;
  }
  else {
    if (invoiceObj.document_info.doc_type && invoiceObj.document_info.doc_type === "10") {
      documentTitle = texts.invoice;
      if (userParam[lang+'_title_doctype_10'] && userParam[lang+'_title_doctype_10'] !== "<none>") {
        documentTitle = userParam[lang+'_title_doctype_10'];
      } else {
        documentTitle = "";
      }
    }
    if (invoiceObj.document_info.doc_type && invoiceObj.document_info.doc_type === "12") {
      documentTitle = texts.credit_note;
      if (userParam[lang+'_title_doctype_12'] && userParam[lang+'_title_doctype_12'] !== "<none>") {
        documentTitle = userParam[lang+'_title_doctype_12'];
      } else {
        documentTitle = "";
      }
    }
    if (invoiceObj.document_info.doc_type && invoiceObj.document_info.doc_type === "17") {
      documentTitle = texts.offer;
      if (userParam[lang+'_title_doctype_17'] && userParam[lang+'_title_doctype_17'] !== "<none>") {
        documentTitle = userParam[lang+'_title_doctype_17'];
      } else {
        documentTitle = "";
      }
    }
  }
  return documentTitle;
}

function addMdBoldText(reportElement, text) {

  // Applies the bold style to a text.
  // It is used the Markdown syntax.
  //
  // Use '**' characters where the bold starts and ends.
  // - set bold all the paragraph => **This is bold paragraph
  //                              => **This is bold paragraph**
  //
  // - set bold single/multiple words => This is **bold** text
  //                                  => This **is bold** text
  //                                  => **This** is **bold** text
  //

  var p = reportElement.addParagraph();
  var printBold = false;
  var startPosition = 0;
  var endPosition = -1;

  do {
      endPosition = text.indexOf("**", startPosition);
      var charCount = endPosition === -1 ? text.length - startPosition : endPosition - startPosition;
      if (charCount > 0) {
          var span = p.addText(text.substr(startPosition, charCount), "");
          if (printBold)
              span.setStyleAttribute("font-weight", "bold");
      }
      printBold = !printBold;
      startPosition = endPosition >= 0 ? endPosition + 2 : text.length;
  } while (startPosition < text.length && endPosition >= 0);
}

function arrayDifferences(arr1, arr2) {
  /*
    Find the difference between two arrays.
    Used to find the removed languages from the parameters settings
  */
  var arr = [];
  arr1 = arr1.toString().split(';').map(String);
  arr2 = arr2.toString().split(';').map(String);
  // for array1
  for (var i in arr1) {
    if(arr2.indexOf(arr1[i]) === -1) {
      arr.push(arr1[i]);
    }
  }
  // for array2
  for(i in arr2) {
    if(arr1.indexOf(arr2[i]) === -1) {
      arr.push(arr2[i]);
    }
  }
  return arr;
}

function objectHasProperty(obj, name) {
  /**
   * The method objectHasProperty verifiy if an object contains the requested property.
   * Name can contains a dot '.', in this case the method verify that the given property tree exists.
  */
  if (!obj || !name) {
      return false;
  } else if (name.startsWith("T.") || name.startsWith("I.")) {
      return false;
  }
  return (objectGetProperty(obj, name) !== null);
}

function objectGetProperty(obj, name) {
  /**
   * The method objectHasPoperty verifiy if an object contains the requested property or tree.
   * Name can contains a dot '.', in this case the method verify that the given property tree exists.
  */
  if (!obj || !name) {
      return null;
  } else if (name.startsWith("T.") || name.startsWith("I.")) {
      return null;
  }
  let curObj = obj;
  let paths = name.trim().toLowerCase().split('.');
  for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      if (path in curObj) {
          curObj = curObj[path];
      } else {
          return null;
      }
  }
  return curObj;
}

function removeDiscountColumn(invoiceObj, userParam) {
  /**
   * Print the item discount column only when it is used.
   */
  let printDiscountColumn = false;
  for (let i = 0; i < invoiceObj.items.length; i++) {
    let item = invoiceObj.items[i];
    if ( (item.discount && item.discount.percent) || (item.discount && item.discount.amount) ) {
      printDiscountColumn = true;
      break;
    }
  }

  if (!printDiscountColumn) {
    
    let columnsNames = userParam.details_columns.split(";");
    let columnsHeaders = userParam[lang+'_text_details_columns'].split(";");
    let titlesAlignment = userParam.details_columns_titles_alignment.split(";");
    let columnsAlignment = userParam.details_columns_alignment.split(";");
    let columnsDimension = userParam.details_columns_widths.split(";");

    // remove all empty values ("", null, undefined): 
    columnsNames = columnsNames.filter(function(e){return e});
    columnsHeaders = columnsHeaders.filter(function(e){return e});
  
    // remove the Discount column
    if (columnsNames.indexOf("Discount") > -1) {

      let index = columnsNames.indexOf("Discount");

      // remove from arrays all the discount data
      columnsNames.splice(index, 1);
      columnsHeaders.splice(index, 1);
      titlesAlignment.splice(index, 1);
      columnsAlignment.splice(index, 1);
      columnsDimension.splice(index, 1);

      // replace the userParam with the new columns
      userParam.details_columns = columnsNames.toString().replace(/,/g, ";");
      userParam[lang+'_text_details_columns'] = columnsHeaders.toString().replace(/,/g, ";");
      userParam.details_columns_titles_alignment = titlesAlignment.toString().replace(/,/g, ";");
      userParam.details_columns_alignment = columnsAlignment.toString().replace(/,/g, ";");
      userParam.details_columns_widths = columnsDimension.toString().replace(/,/g, ";");
    }
  }
  // Banana.console.log(JSON.stringify(userParam.details_columns, "", " "));
  // Banana.console.log(JSON.stringify(userParam[lang+'_text_details_columns'], "", " "));
  // Banana.console.log(JSON.stringify(userParam.details_columns_titles_alignment, "", " "));
  // Banana.console.log(JSON.stringify(userParam.details_columns_alignment, "", " "));
  // Banana.console.log(JSON.stringify(userParam.details_columns_widths, "", " "));
}

function replaceVariables(cssText, variables) {

  /* 
    Function that replaces all the css variables inside of the given cssText with their values.
    All the css variables start with "$" (i.e. $font_size, $margin_top)
  */

  var result = "";
  var varName = "";
  var insideVariable = false;
  var variablesNotFound = [];

  for (var i = 0; i < cssText.length; i++) {
    var currentChar = cssText[i];
    if (currentChar === "$") {
      insideVariable = true;
      varName = currentChar;
    }
    else if (insideVariable) {
      if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
        // still a variable name
        varName += currentChar;
      } 
      else {
        // end variable, any other charcter
        if (!(varName in variables)) {
          variablesNotFound.push(varName);
          result += varName;
        }
        else {
          result += variables[varName];
        }
        result += currentChar;
        insideVariable = false;
        varName = "";
      }
    }
    else {
      result += currentChar;
    }
  }

  if (insideVariable) {
    // end of text, end of variable
    if (!(varName in variables)) {
      variablesNotFound.push(varName);
      result += varName;
    }
    else {
      result += variables[varName];
    }
    insideVariable = false;
  }

  if (variablesNotFound.length > 0) {
    //Banana.console.log(">>Variables not found: " + variablesNotFound);
  }
  return result;
}

function showInvoiceJsons(banDoc, invoiceObj, preferencesObj, qrBill, userParam, texts) {

  var string = "";

  // JSON invoice
  var jsonString = JSON.stringify(invoiceObj, null, 3);
  string += "****************************************************************************** " + texts.json_invoice + " ******************************************************************************\n";
  string += jsonString + "\n";

  // JSON layout parameters
  var paramString = JSON.stringify(userParam, null, 3);
  string += "\n****************************************************************************** " + texts.json_layoutparameters + " ******************************************************************************\n";
  string += paramString + "\n";

  // JSON layout preferences
  var preferencesString = JSON.stringify(preferencesObj, null, 3);
  string += "\n****************************************************************************** " + texts.json_layoutpreferences + " ******************************************************************************\n";
  string += preferencesString + "\n";

  // QRCode image text
  if (userParam.qr_code_add && invoiceObj.document_info.doc_type !== "17") {
    var qrcodeData = qrBill.getQrCodeData(invoiceObj, userParam, texts, lang);
    var qrcodeText = qrBill.createTextQrImage(qrcodeData, texts);
    string += "\n****************************************************************************** " + texts.text_qrcode + " ******************************************************************************\n";
    string += qrcodeText;
  }

  var dlgTitle = texts.json_invoice + " " + invoiceObj.document_info.number;
  Banana.Ui.showText(dlgTitle, string);
}

function getColumnQuantityFormat(banDoc) {
  /**
  * Get the number format of the Quantity column from the Transactions table.
  * It is used to overwrite the quantity decimals of invoice items when the format is with 0,1,3 or 4 decimals.
  * Integrated invoice only.
  */
  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.1.7.23164") >= 0) {
    if (IS_INTEGRATED_INVOICE) {
      var transactionsTable = banDoc.table("Transactions");
      if (transactionsTable) {
        var tColumn = banDoc.table("Transactions").column("Quantity");
        if (tColumn) {
          return tColumn.format; // return "0.", "0.00", "0.000", ...
        }
      }
    }
  }
  return;
}


//====================================================================//
// STYLES
//====================================================================//
function set_css_style(banDoc, repStyleObj, variables, userParam) {

  var textCSS = "";

  /**
    Default CSS file
  */
  var file = Banana.IO.getLocalFile("file:script/invoice.css");
  var fileContent = file.read();
  if (!file.errorString) {
    Banana.IO.openPath(fileContent);
    //Banana.console.log(fileContent);
    textCSS = fileContent;
  } else {
    Banana.console.log(file.errorString);
  }

  /**
    User defined CSS
    Checks if the *.css file defined settings parameters exists in Documents table, then use it.

    Only available with Banana ADVANCED.
  */
  if (userParam.embedded_css_filename) {
    if (BAN_ADVANCED) {
      var cssFiles = [];
      var documentsTable = banDoc.table("Documents");
      if (documentsTable) {
        for (var i = 0; i < documentsTable.rowCount; i++) {
          var tRow = documentsTable.row(i);
          var id = tRow.value("RowId");
          if (id === userParam.embedded_css_filename) {
            // The CSS file name entered by user exists on documents table: use it as CSS
            textCSS += banDoc.table("Documents").findRowByValue("RowId",userParam.embedded_css_filename).value("Attachments");       
          }
        }
      }
    }
    else {
      banDoc.addMessage("The customization with CSS requires Banana Accounting+ Advanced");
    }
  }

  // Replace all the "$xxx" variables with the real value
  textCSS = replaceVariables(textCSS, variables);

  // Parse the CSS text
  repStyleObj.parse(textCSS);
}

function set_variables(variables, userParam) {

  /** 
    Sets all the variables values.
  */

  /* Variable that sets the decimals of the Quantity column */
  variables.decimals_quantity = "";
  /* Variable that sets the decimals of the Unit Price column */
  variables.decimals_unit_price = 2;
  /* Variable that sets the decimals of the Amount column */
  variables.decimals_amounts = 2;
  /* Variables that set the colors */
  variables.$text_color = userParam.text_color;
  variables.$background_color_details_header = userParam.background_color_details_header;
  variables.$text_color_details_header = userParam.text_color_details_header;
  variables.$background_color_alternate_lines = userParam.background_color_alternate_lines;
  variables.$color_title_total = userParam.color_title_total;
  /* Variables that set the font */
  variables.$font_family = userParam.font_family;
  variables.$font_size = userParam.font_size+"pt";
  /* Variables that set the font size and margins of the Invoice Begin Text */
  variables.$font_size_title = userParam.font_size*1.4 +"pt";
  /* Variables that set font size, margins, padding and borders of the Invoice Details */
  variables.$font_size_header = userParam.font_size*1.2 +"pt";
  variables.$font_size_total = userParam.font_size*1.2 +"pt";
  /* Variables that set the position of the invoice address
   * Default margins when the address on right: 12.3cm margin left, 4.5cm margin top
   * Default margins when the address on left: 2.2cm margin left, 5.5cm margin top
   * Sum userParam dX and dY adjustments to default values */
  variables.$right_address_margin_left = parseFloat(12.3) + parseFloat(userParam.address_position_dX)+"cm";
  variables.$right_address_margin_top = parseFloat(4.5) + parseFloat(userParam.address_position_dY)+"cm";
  variables.$left_address_margin_left = parseFloat(2.2) + parseFloat(userParam.address_position_dX)+"cm";
  variables.$left_address_margin_top = parseFloat(5.5) + parseFloat(userParam.address_position_dY)+"cm";  
  /* If exists use the function defined by the user */
  if (typeof(hook_set_variables) === typeof(Function)) {
    hook_set_variables(variables, userParam);
  }
}



//====================================================================//
// OTHER
//====================================================================//
function bananaRequiredVersion(requiredVersion, expmVersion) {
  /**
   * Check Banana version and license type
   */

  BAN_ADVANCED = isBananaAdvanced();

  var language = "en";
  if (Banana.document.locale) {
    language = Banana.document.locale;
  }
  if (language.length > 2) {
    language = language.substr(0, 2);
  }
  if (expmVersion) {
    requiredVersion = requiredVersion + "." + expmVersion;
  }
  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
    var msg = "";
    switch(language) {
      
      case "en":
        msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        break;

      case "it":
        msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare alla versione " + requiredVersion + " o successiva.";
        break;
      
      case "fr":
        msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour à " + requiredVersion + " ou plus récente.";
        break;
      
      case "de":
        msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Version " + requiredVersion + " oder neuer aktualisiern.";
        break;
      
      case "nl":
        msg = "Het script werkt niet met deze versie van Banana Accounting. Upgrade naar de versie " + requiredVersion + " of meer recent.";
        break;
      
      case "zh":
        msg = "脚本无法在此版本的Banana财务会计软件中运行。请更新至 " + requiredVersion + "版本或之后的版本。";
        break;
      
      case "es":
        msg = "Este script no se ejecuta con esta versión de Banana Contabilidad. Por favor, actualice a la versión " + requiredVersion + " o posterior.";
        break;
      
      case "pt":
        msg = "Este script não é executado com esta versão do Banana Contabilidade. Por favor, atualize para a versão " + requiredVersion + " ou posterior.";
        break;
      
      default:
        msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        break;
    }

    Banana.application.showMessages();
    Banana.document.addMessage(msg);

    return false;
  }
  return true;
}

function isBananaAdvanced() {
  /**
   * Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
   * to check if all application functionalities are permitted
   * the version Advanced returns isWithinMaxRowLimits always false
   * other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached
   */
  var license = Banana.application.license;
  if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
    return true;
  }
  return false;
}

function isIntegratedInvoice() {
  if (Banana.document) {
    let fileTypeGroup = Banana.document.info("Base", "FileTypeGroup");
    let fileTypeNumber = Banana.document.info("Base", "FileTypeNumber");
    if (fileTypeGroup !== "400" && fileTypeNumber !== "400") {
      // Integrate invoice
      IS_INTEGRATED_INVOICE = true;
    }
    else {
      // App. Estimates and Invoices
      IS_INTEGRATED_INVOICE = false;
    }
  }
}




//====================================================================//
// FUNCTIONS THAT PRINT THE DELIVERY NOTE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED USING EMBEDDED 
// JAVASCRIPT FILES ON DOCUMENTS TABLE
//====================================================================//
function print_info_first_page_delivery_note(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the delivery note information

    Invoice due date is never printed on delivery note
  */
  var infoTable = "";
  var rows = 1; //start from 1 because due date is not printed, we count it.

  if (userParam.address_left) {
    infoTable = repDocObj.addTable("info_table_right");
  } else {
    infoTable = repDocObj.addTable("info_table_left");
  }

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_delivery_note_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  } else {
    rows++;
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_date_delivery_note'] + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);
  } else {
    rows++;
  }
  if (userParam.info_order_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.order_number,"",1);
  }
  if (userParam.info_order_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_date'] + ":","",1);
    if (invoiceObj.document_info.order_date && invoiceObj.document_info.order_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.order_date),"",1);
    } else {
      tableRow.addCell(invoiceObj.document_info.order_date,"",1);
    }
  }
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);
  } else {
    rows++;
  }
  if (userParam.info_customer_vat_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_vat_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.vat_number);
  } else {
    rows++;
  }
  if (userParam.info_customer_fiscal_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_fiscal_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.fiscal_number);
  } else {
    rows++;
  }
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();
  } else {
    rows++;
  }

  //Adds custom fields
  //Works only with the estimates and invoices application
  //userParam.info_custom_fields is always set to false for integrated invoices, is never used
  if (userParam.info_custom_fields) {
    if (invoiceObj.document_info.custom_fields && invoiceObj.document_info.custom_fields.length > 0) {
      for (var i = 0; i < invoiceObj.document_info.custom_fields.length; i++) {
        var customField = invoiceObj.document_info.custom_fields[i];
        tableRow = infoTable.addRow();
        tableRow.addCell(customField.title + ":","",1);
        tableRow.addCell(customField.value,"",1);
      }
    }
  }

  //Empty rows for each non-used info
  for (var i = 0; i < rows; i++) {
    tableRow = infoTable.addRow();
    tableRow.addCell(" ", "", 2);
  }
}

function print_info_other_pages_delivery_note(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the delivery note information

    Invoice due date is never printed on delivery note
  */
  var infoTable = "";

  // Info table that starts at row 0, for pages 2+ :
  // Since we don't know when we are on a new page, we add Info as Header
  // and we do not display it the first time (first time is always on first page)
  repDocObj = repDocObj.getHeader();
  infoTable = repDocObj.addTable("info_table_row0");

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_delivery_note_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_date_delivery_note'] + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);
  }
  if (userParam.info_order_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.order_number,"",1);
  }
  if (userParam.info_order_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_order_date'] + ":","",1);
    if (invoiceObj.document_info.order_date && invoiceObj.document_info.order_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.order_date),"",1);
    } else {
      tableRow.addCell(invoiceObj.document_info.order_date,"",1);
    }
  }
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);
  }
  if (userParam.info_customer_vat_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_vat_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.vat_number);
  }
  if (userParam.info_customer_fiscal_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer_fiscal_number'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.fiscal_number);
  }
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();
  }
  //Adds custom fields
  //Works only with the estimates and invoices application
  //userParam.info_custom_fields is always set to false for integrated invoices, is never used
  if (userParam.info_custom_fields) {
    if (invoiceObj.document_info.custom_fields && invoiceObj.document_info.custom_fields.length > 0) {
      for (var i = 0; i < invoiceObj.document_info.custom_fields.length; i++) {
        var customField = invoiceObj.document_info.custom_fields[i];
        tableRow = infoTable.addRow();
        tableRow.addCell(customField.title + ":","",1);
        tableRow.addCell(customField.value,"",1);
      }
    }
  }
}

function print_address_delivery_note(repDocObj, invoiceObj, userParam) {
  /*
    Print the delivery note address
    Only for integrated invoices. The address is defined using the 10:sadr type commands.
  */
  var deliveryAddressTable = "";
  if (userParam.address_position_dX != 0 || userParam.address_position_dY != 0) {
    if (userParam.address_left) {
      deliveryAddressTable = repDocObj.addTable("custom_address_table_left");
    } else {
      deliveryAddressTable = repDocObj.addTable("custom_address_table_right");
    }
  }
  else {
    if (userParam.address_left) {
      deliveryAddressTable = repDocObj.addTable("address_table_left");
    } else {
      deliveryAddressTable = repDocObj.addTable("address_table_right");
    }
  }

  tableRow = deliveryAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);

  //Small line of the supplier address
  if (userParam.address_small_line) {
    if (userParam.address_small_line === "<none>") {
      cell.addText("","");
    } else {
      cell.addText(userParam.address_small_line, "small_address");
    }
  }
  else {
    var name = "";
    var address = "";
    var locality = "";
    if (invoiceObj.supplier_info.business_name) {
      name += invoiceObj.supplier_info.business_name;
    } 
    else {
      if (invoiceObj.supplier_info.first_name) {
        name += invoiceObj.supplier_info.first_name;
      }
      if (invoiceObj.supplier_info.last_name) {
        if (invoiceObj.supplier_info.first_name) {
          name += " ";
        }
        name += invoiceObj.supplier_info.last_name;
      }
    }
    if (invoiceObj.supplier_info.address1) {
      address += invoiceObj.supplier_info.address1;
    }
    if (invoiceObj.supplier_info.postal_code) {
      locality += invoiceObj.supplier_info.postal_code;
    }
    if (invoiceObj.supplier_info.city) {
      if (invoiceObj.supplier_info.postal_code) {
        locality += " "; 
      }
      locality += invoiceObj.supplier_info.city;
    }

    var supplierAddressLine = "";
    if (name) {
      supplierAddressLine += name;
    }
    if (address) {
      if (name) {
        supplierAddressLine += " - ";
      }
      supplierAddressLine += address;
    }
    if (locality) {
      if (address || name) {
        supplierAddressLine += " - ";
      }
      supplierAddressLine += locality;
    }
    if (supplierAddressLine) {
      cell.addText(supplierAddressLine, "small_address");
    }
  }
  
  // Delivery address
  var deliveryAddress = getInvoiceAddress(invoiceObj.shipping_info,userParam).split('\n');
  for (var i = 0; i < deliveryAddress.length; i++) {
    cell.addParagraph(deliveryAddress[i]);
  }
}

function print_text_begin_delivery_note(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the text before the delivery note details
  */
  var textTitle = "";
  var textBeginDeliveryNote = userParam[lang+'_text_begin_delivery_note'];
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;

  // print the title
  textTitle = texts.delivery_note;
  if (userParam[lang+'_title_delivery_note'] && userParam[lang+'_title_delivery_note'] !== "<none>") {
    textTitle = userParam[lang+'_title_delivery_note'];
  } else {
    textTitle = "";
  }
  
  if (textTitle) {
    textTitle = textTitle.replace(/<DocInvoice>/g, invoiceObj.document_info.number.trim());
    textTitle = columnNamesToValues(invoiceObj, textTitle);
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(textTitle, "title_text");
  }

  // print the begin text
  if (textBeginDeliveryNote) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBeginDeliveryNote.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
}

function print_details_delivery_note_without_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Print details delivery note without amounts.
    Takes all the XML columns names and columns titles defined in parameters.
    Columns with amounts, vat rates, discounts are removed ("Description;Quantity;ReferenceUnit;UnitPrice;Amount" => "Description;Quantity;ReferenceUnit")
    Columns created by user are not removed.

    Also all the total items rows are removed.
  */
  var columnsNames = userParam.details_columns.split(";");
  var columnsHeaders = userParam[lang+'_text_details_columns'].split(";");
  var titlesAlignment = userParam.details_columns_titles_alignment.split(";");
  var columnsAlignment = userParam.details_columns_alignment.split(";");
  var columnsDimension = userParam.details_columns_widths.split(";");

  // remove all empty values ("", null, undefined): 
  columnsNames = columnsNames.filter(function(e){return e});
  columnsHeaders = columnsHeaders.filter(function(e){return e});

  //Remove all default columns with amounts and vatrate and discounts
  if (columnsNames.indexOf("UnitPrice") > -1) {
    // remove the UnitPrice column
    columnsNames.splice(columnsNames.indexOf("UnitPrice"), 1); // from columnsNames
    columnsHeaders.splice(columnsNames.indexOf("UnitPrice"), 1); // from columnsHeaders
    titlesAlignment.splice(columnsNames.indexOf("UnitPrice"), 1); // from titlesAlignment
    columnsAlignment.splice(columnsNames.indexOf("UnitPrice"), 1); // from columnsAlignment
    columnsDimension.splice(columnsNames.indexOf("UnitPrice"), 1); // from columnsDimension
  }
  if (columnsNames.indexOf("VatRate") > -1) {
    // remove the VatRate column
    columnsNames.splice(columnsNames.indexOf("VatRate"), 1);
    columnsHeaders.splice(columnsNames.indexOf("VatRate"), 1);
    titlesAlignment.splice(columnsNames.indexOf("VatRate"), 1);
    columnsAlignment.splice(columnsNames.indexOf("VatRate"), 1);
    columnsDimension.splice(columnsNames.indexOf("VatRate"), 1);
  }
  if (columnsNames.indexOf("Discount") > -1) {
    // remove the Discount column
    columnsNames.splice(columnsNames.indexOf("Discount"), 1);
    columnsHeaders.splice(columnsNames.indexOf("Discount"), 1);
    titlesAlignment.splice(columnsNames.indexOf("Discount"), 1);
    columnsAlignment.splice(columnsNames.indexOf("Discount"), 1);
    columnsDimension.splice(columnsNames.indexOf("Discount"), 1);
  }
  if (columnsNames.indexOf("Amount") > -1) {
    // remove the Amount column
    columnsNames.splice(columnsNames.indexOf("Amount"), 1);
    columnsHeaders.splice(columnsNames.indexOf("Amount"), 1);
    titlesAlignment.splice(columnsNames.indexOf("Amount"), 1);
    columnsAlignment.splice(columnsNames.indexOf("Amount"), 1);
    columnsDimension.splice(columnsNames.indexOf("Amount"), 1);
  }
  
  var repTableObj = detailsTable;
  var header = repTableObj.getHeader().addRow();

  for (var i = 0; i < columnsDimension.length; i++) {
    repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[i]);
  }

  if (columnsNames.length == columnsHeaders.length) {
    for (var i = 0; i < columnsHeaders.length; i++) {
      var alignment = titlesAlignment[i];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "center";
      }
      columnsHeaders[i] = columnsHeaders[i].trim();
      if (columnsHeaders[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsHeaders[i], "doc_table_header "+ alignment, 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim().toLowerCase();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj, banDoc);

  
  //Remove all total items rows from the items array of the json invoiceObj
  for (var i = invoiceObj.items.length - 1; i >= 0; i--) {
    var item = invoiceObj.items[i];
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      invoiceObj.items.splice(i, 1);
    }
  }

  //ITEMS
  var customColumnMsg = "";
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell"; // row with amount
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell"; // row without amount
    }
    if (item.item_type && item.item_type.indexOf("header") === 0) {
      className = "header_cell"; // row with DocType 10:hdr
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsNames.length; j++) {
      var alignment = columnsAlignment[j];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "left";
      }

      if (columnsNames[j].trim().toLowerCase() === "description") {
        //When 10:hdr with empty description, let empty line
        if (item.item_type && item.item_type.indexOf("header") === 0 && !item.description) {
          tableRow.addCell(" ", classNameEvenRow, 1);
        }
        else {
          var itemValue = formatItemsValue(item.description, variables, columnsNames[j], className, item);
          var descriptionCell = tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          addMdBoldText(descriptionCell, itemValue.value);
          addMultipleLinesDescriptions(banDoc, descriptionCell, item.origin_row, userParam);
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "quantity") {
        if (IS_INTEGRATED_INVOICE) {
          // Always print quantity if entered in the Quantity column, even if "quantity,unit,unitprice" are not all entered.
          // Transactions without quantity, in JSON are saved without decimals ("item.quantity":"1")
          // Transactins with quantity, in JSON are saved with four decimals ("item.quantity":"1.0000")
          if (item.quantity && item.quantity !== "1") {
            if (variables.decimals_quantity !== "") {
              decimals = variables.decimals_quantity;
            }
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          } else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
        else {
          if (item.quantity) {
            decimals = variables.decimals_quantity
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          }
          else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "referenceunit") {
        var itemValue = formatItemsValue(item.mesure_unit, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "number") {
        var itemValue = formatItemsValue(item.number, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else {
        var userColumnValue = "";
        var columnsName = columnsNames[j];
        var itemValue = "";
        //User defined columns only available with advanced version
        //In settings dialog, must start with "T." for integrated ivoices or "I." for estimates invoices
        //This prevent conflicts with JSON fields.
        if (BAN_ADVANCED) {
          //JSON contains a property with the name of the column (Item, Date)
          //In JSON all names are lower case
          if (columnsName.trim().toLowerCase() in item) {
            itemValue = formatItemsValue(item[columnsName.trim().toLowerCase()], variables, columnsName, className, item);
          }
          else {
            userColumnValue = getUserColumnValue(banDoc, item.origin_row, item.number, columnsName);
            columnsName = columnsName.substring(2);
            itemValue = formatItemsValue(userColumnValue, variables, columnsName, className, item);            
          }
        }
        else {
          customColumnMsg = "The customization with custom columns requires Banana Accounting+ Advanced";
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
    }
  }
  // Show message when using "T.Column" with a non advanced version of Banana+
  if (customColumnMsg.length > 0) {
    banDoc.addMessage(customColumnMsg);
  }
}

function print_final_texts_delivery_note(repDocObj, invoiceObj, userParam) {
  /*
    Prints final texts for the delivery note after the details table.
    Texts are defined in parameter settings.
  */
  if (userParam[lang+'_text_final_delivery_note'] && userParam[lang+'_text_final_delivery_note'] !== "<none>") {
    var text = userParam[lang+'_text_final_delivery_note'];
    text = text.split('\n');
    // if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
    //   repDocObj.addParagraph(" ", "");
    // }
    for (var i = 0; i < text.length; i++) {
      var paragraph = repDocObj.addParagraph("","final_texts");
      if (text[i]) {
        text[i] = columnNamesToValues(invoiceObj, text[i]);
        addMdBoldText(paragraph, text[i]);
      } else {
        addMdBoldText(paragraph, " "); //empty lines
      }
    }
  }
}




//====================================================================//
// FUNCTIONS THAT PRINT THE REMINDERS.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED USING EMBEDDED 
// JAVASCRIPT FILES ON DOCUMENTS TABLE
//====================================================================//
function print_info_first_page_reminder(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the reminder information on first page:
    - Invoice number
    - Invoice date
    - Customer number
    - Reminder date
    - Reminder due date
    - Page
    Other info are not printed.
    Date and Due date of reminder are always printed.
  */
  var infoTable = "";
  var rows = 0;

  if (userParam.address_left) {
    infoTable = repDocObj.addTable("info_table_right");
  } else {
    infoTable = repDocObj.addTable("info_table_left");
  }

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  // Invoice number (optional)
  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_invoice_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  } else {
    rows++;
  }

  //Invoice date (optional)
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_invoice_date_reminder'] + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  } else {
    rows++;
  }

  // Customer number (optional)
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  } else {
    rows++;
  }

  // Reminder date. Use the last reminder date
  tableRow = infoTable.addRow();
  tableRow.addCell(userParam[lang+'_text_info_date_reminder'] + ":","",1);
  tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.last_reminder_date),"",1);

  // Reminder due date. Use the last reminder due date
  tableRow = infoTable.addRow();
  tableRow.addCell(userParam[lang+'_text_info_due_date_reminder'] + ":","",1);
  tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.last_reminder_due_date),"",1);

  // Page number (optional)
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  } else {
    rows++;
  }

  // Add an empty row to keep the same space as the invoice between the info section and the title
  rows++;

  //Empty rows for each non-used info
  for (var i = 0; i < rows; i++) {
    tableRow = infoTable.addRow();
    tableRow.addCell(" ", "", 2);
  }
}

function print_info_other_pages_reminder(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the reminder information on pages 2+:
    - Invoice number
    - Invoice date
    - Customer number
    - Reminder date
    - Reminder due date
    - Page
    Other info are not printed.
    Date and Due date of reminder are always printed.
  */
  var infoTable = "";

  // Info table that starts at row 0, for pages 2+ :
  // Since we don't know when we are on a new page, we add Info as Header
  // and we do not display it the first time (first time is always on first page)
  repDocObj = repDocObj.getHeader();
  infoTable = repDocObj.addTable("info_table_row0");

  var infoFirstColumn = infoTable.addColumn("info_table_first_column");
  var infoSecondColumn = infoTable.addColumn("info_table_second_column");

  // Invoice number (optional)
  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_invoice_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }

  // Invoice date (optional)
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_invoice_date_reminder'] + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  }

  // Customer number (optional)
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_customer'] + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  }

  // Remindrer date. Use the last reminder date
  tableRow = infoTable.addRow();
  tableRow.addCell(userParam[lang+'_text_info_date_reminder'] + ":","",1);
  tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.last_reminder_date),"",1);

  // Reminder due date. Use the last reminder due date
  tableRow = infoTable.addRow();
  tableRow.addCell(userParam[lang+'_text_info_due_date_reminder'] + ":","",1);
  tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.last_reminder_due_date),"",1);

  // Page number (optional)
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_page'] + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  }
}

function print_text_begin_reminder(repDocObj, invoiceObj, texts, userParam, printFormat) {
  /*
    Prints the text before the reminder details
  */
  var textTitle = "";
  var textBeginReminder = userParam[lang+'_text_begin_reminder'];
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;
  
  // print the title
  textTitle = '%1. ' + texts.reminder;
  if (userParam[lang+'_title_reminder'] && userParam[lang+'_title_reminder'] !== "<none>") {
    textTitle = userParam[lang+'_title_reminder'];
  } else {
    textTitle = "";
  }

  if (textTitle && printFormat === "reminder_1") {
    textTitle = textTitle.replace(/%1/g, '1');
  }
  else if (textTitle && printFormat === "reminder_2") {
    textTitle = textTitle.replace(/%1/g, '2');
  }
  else if (textTitle && printFormat === "reminder_3") {
    textTitle = textTitle.replace(/%1/g, '3');
  }

  if (textTitle) {
    textTitle = textTitle.replace(/<DocInvoice>/g, invoiceObj.document_info.number.trim());
    textTitle = columnNamesToValues(invoiceObj, textTitle);
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(textTitle, "title_text");
  }

  // print the begin text
  if (textBeginReminder) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBeginReminder.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
}

function print_final_texts_reminder(repDocObj, invoiceObj, userParam) {
  /*
    Prints final texts for the reminder after the details table.
    Texts are defined in parameter settings.
  */
  if (userParam[lang+'_text_final_reminder'] && userParam[lang+'_text_final_reminder'] !== "<none>") {
    var text = userParam[lang+'_text_final_reminder'];
    text = text.split('\n');
    // if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
    //   repDocObj.addParagraph(" ", "");
    // }
    for (var i = 0; i < text.length; i++) {
      var paragraph = repDocObj.addParagraph("","final_texts");
      if (text[i]) {
        text[i] = columnNamesToValues(invoiceObj, text[i]);
        addMdBoldText(paragraph, text[i]);
      } else {
        addMdBoldText(paragraph, " "); //empty lines
      }
    }
  }
}



//====================================================================//
// FUNCTIONS THAT PRINT THE PROFORMA INVOICE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED USING EMBEDDED 
// JAVASCRIPT FILES ON DOCUMENTS TABLE
//====================================================================//
function print_text_begin_proforma_invoice(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the text before the proforma invoice details
  */
  var textTitle = "";
  var textBegin = invoiceObj.document_info.text_begin;
  var textBeginSettings = userParam[lang+'_text_begin_proforma_invoice'];
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;
  
  // print the title
  if (invoiceObj.document_info.title) { //10:tit has priority
    textTitle = invoiceObj.document_info.title;
  }
  else {
    textTitle = texts.proforma_invoice;
    if (userParam[lang+'_title_proforma_invoice'] && userParam[lang+'_title_proforma_invoice'] !== "<none>") {
      textTitle = userParam[lang+'_title_proforma_invoice'];
    } else {
      textTitle = "";
    }
  }

  if (textTitle) {
    textTitle = textTitle.replace(/<DocInvoice>/g, invoiceObj.document_info.number.trim());
    textTitle = columnNamesToValues(invoiceObj, textTitle);
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(textTitle, "title_text");
  }

  if (textBegin) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBegin.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
  else if (!textBegin && textBeginSettings) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    var textBeginLines = textBeginSettings.split('\n');
    for (var i = 0; i < textBeginLines.length; i++) {
      if (textBeginLines[i]) {
        textBeginLines[i] = columnNamesToValues(invoiceObj, textBeginLines[i]);
        addMdBoldText(textCell, textBeginLines[i]);
      }
      else {
        addMdBoldText(textCell, " "); //empty lines
      }
    }
  }
}

function print_final_texts_proforma_invoice(repDocObj, invoiceObj, userParam) {
  /*
    Prints final texts for the proforma invoice after the details table.
    - Default text is taken from the Print invoices -> Template options.
    - If user let empty the parameter on Settings dialog -> Final text, it is used the default
    - If user enter a text as parameter on Settings dialog -> Final text, it is used this instead.
  */

  // Notes (multiple lines)
  if (invoiceObj.note.length > 0) {
    for (var i = 0; i < invoiceObj.note.length; i++) {
      if (invoiceObj.note[i].description) {
        var textNote = invoiceObj.note[i].description;
        textNote = columnNamesToValues(invoiceObj, textNote);
        var paragraph = repDocObj.addParagraph("","final_texts");
        addMdBoldText(paragraph, textNote);
      }
    }    
  }

  // Greetings (one line only)
  if (invoiceObj.document_info.greetings) {
    if (invoiceObj.note.length > 0) {
      repDocObj.addParagraph(" ", "");
    }
    var textGreetings = invoiceObj.document_info.greetings;
    textGreetings = columnNamesToValues(invoiceObj, textGreetings);
    var paragraph = repDocObj.addParagraph("","final_texts");
    addMdBoldText(paragraph, textGreetings);
  }

  //Text taken from the Settings dialog's parameter "Final text"
  if (invoiceObj.document_info.doc_type !== "17") { //invoices and credit notes
    if (userParam[lang+'_text_final_proforma_invoice'] && userParam[lang+'_text_final_proforma_invoice'] !== "<none>") {
      var text = userParam[lang+'_text_final_proforma_invoice'];
      text = text.split('\n');
      if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
        repDocObj.addParagraph(" ", "");
      }
      for (var i = 0; i < text.length; i++) {
        var paragraph = repDocObj.addParagraph("","final_texts");
        if (text[i]) {
          text[i] = columnNamesToValues(invoiceObj, text[i]);
          addMdBoldText(paragraph, text[i]);
        } else {
          addMdBoldText(paragraph, " "); //empty lines
        }
      }
    }

    // Template params, default text starts with "(" and ends with ")" (default), (Vorderfiniert)
    else if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts && !userParam[lang+'_text_final_proforma_invoice']) {
      var textDefault = [];
      var text = [];
      for (var i = 0; i < invoiceObj.template_parameters.footer_texts.length; i++) {
        var textLang = invoiceObj.template_parameters.footer_texts[i].lang;
        if (textLang.indexOf('(') === 0 && textLang.indexOf(')') === textLang.length-1) {
          textDefault = invoiceObj.template_parameters.footer_texts[i].text;
        }
        else if (textLang == lang) {
          text = invoiceObj.template_parameters.footer_texts[i].text;
        }
      }
      if (text.join().length <= 0) {
        text = textDefault;
      }
      if (invoiceObj.note.length > 0 || invoiceObj.document_info.greetings) {
        repDocObj.addParagraph(" ", "");
      }
      for (var i = 0; i < text.length; i++) {
        var paragraph = repDocObj.addParagraph("","final_texts");
        if (text[i]) {
          text[i] = columnNamesToValues(invoiceObj, text[i]);
          addMdBoldText(paragraph, text[i]);
        } else {
          addMdBoldText(paragraph, " "); //empty lines
        }
      }
    }
  }
}

