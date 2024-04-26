// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.ch.app.emptyqr
// @api = 1.0
// @pubdate = 2023-05-19
// @publisher = Banana.ch SA
// @description = Letter-Invoice with Swiss QR
// @description.it = Lettera-Fattura con QR Svizzera
// @description.de = Brief-Rechnung mit Schweizer QR
// @description.fr = Lettre-facture avec QR suisse
// @description.en = Letter-Invoice with Swiss QR
// @doctype = *
// @task = app.command
// @timeout = -1
// @includejs = swissqrcode.js
// @includejs = checkfunctions.js



/*
  SUMMARY
  =======
  Extensions that prints the Swiss QR.

  - Without customer and invoice numbers.
    => IBAN without reference (NON) allowed.
    => IBAN with reference (SCOR) or QR-IBAN with reference (QRR) not allowed. 
  
  - Supplier address/IBAN (Payable to)
    => defined in accounting properties (combined "K" type address).
    => or in extension parameters (structured "S" type address).

  - Customer address (Payable by)
    => without customer address (empty box).
    => with customer address defined in extension parameters (structured "S" type address).

  - Currency
    => defined in extension parameters, CHF or EUR.

  - Amount
    => without amount (empty box).
    => with amount defined in extension parameters.
*/


// Define the required version of Banana Accounting / Banana Dev Channel
var BAN_VERSION = "10.0.1";
var BAN_EXPM_VERSION = "";


function exec(string) {

  if (!Banana.document) {
    return "@Cancel";
  }

  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
  if (isCurrentBananaVersionSupported) {

    /* 1. Initialize user parameters */
    var userParam = initUserParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    if (!options || !options.useLastSettings) {
        userParam = settingsDialog();
    }
    if (!userParam) {
        return "@Cancel";
    }

    /* Set language */
    var texts = {};
    texts = setTexts(userParam.language.toLowerCase());

    /* Initialize QR settings */
    var qrSettings = initQRSettings(userParam);

    // Get QR section data
    setSenderAddress(Banana.document, userParam, qrSettings);
    setCustomerAddress(userParam, qrSettings);
    setAmount(userParam, qrSettings);

    /* Print the report */ 
    var report = Banana.Report.newReport("QR-Bill report");
    var stylesheet = Banana.Report.newStyleSheet();

    // Clone the object
    var reportParam = JSON.parse(JSON.stringify(userParam));

    // Merge the two objects
    reportParam = Object.assign(reportParam, qrSettings);

    //Banana.console.log(JSON.stringify(reportParam, "", " "));
    
    printReportSingle(Banana.document, report, stylesheet, texts, reportParam);

    setCss(stylesheet, reportParam);
    Banana.Report.preview(report, stylesheet);
  }
}

function printReportSingle(banDoc, report, stylesheet, texts, reportParam) {

  // Set sections of the report
  if (reportParam.print_header_logo) {
    var sectionSenderAddress = report.getHeader().addSection();
  } else {
    var sectionSenderAddress = report.addSection("sender-address");
  }
  
  var sectionDate;
  if (reportParam.print_header_logo) {
    if (!reportParam.print_sender_address && !reportParam.print_customer_address) {
      sectionDate = report.addSection("date-with-logo-without-addresses");
    }
    else {
      sectionDate = report.addSection("date");
    }
  }
  else {
    if (!reportParam.print_sender_address && !reportParam.print_customer_address) {
      sectionDate = report.addSection("date-without-addresses");
    }
    else {
      sectionDate = report.addSection("date");
    }
  }

  var sectionCustomerAddress = report.addSection("customer-address");
  
  var sectionLetter;
  if (reportParam.print_header_logo) {
    if (!reportParam.print_customer_address && !reportParam.print_date) {
      sectionLetter = report.addSection("letter-with-logo-without-addresses-and-date");
    }
    else if (!reportParam.print_customer_address && reportParam.print_date) {
      sectionLetter = report.addSection("letter-with-logo-without-addresses");
    }
    else {
      sectionLetter = report.addSection("letter");
    }
  }
  else {
    if (!reportParam.print_sender_address && !reportParam.print_customer_address && !reportParam.print_date) {
      sectionLetter = report.addSection("letter-without-addresses-and-date");
    }
    else if (!reportParam.print_sender_address && !reportParam.print_customer_address && reportParam.print_date) {
      sectionLetter = report.addSection("letter-without-addresses");
    }
    else {
      sectionLetter = report.addSection("letter");
    }
  }



  //******************************************************************************************

  // Print logo
  if (reportParam.print_header_logo) {
    sectionSenderAddress = report.addSection();
    var logoFormat = Banana.Report.logoFormat(reportParam.header_logo_name); //Logo
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(sectionSenderAddress, stylesheet, "logo");
      report.getHeader().addChild(logoElement);
    } else {
      sectionSenderAddress.addClass("sender-address");
    }
  }

  // Print sender address
  if (reportParam.print_sender_address) {
    sectionSenderAddress.addParagraph(reportParam.sender_address_name, "");
    sectionSenderAddress.addParagraph(reportParam.sender_address_address + " " + reportParam.sender_address_house_number, "");
    sectionSenderAddress.addParagraph(reportParam.sender_address_postal_code + " " + reportParam.sender_address_locality, "")
  }

  // Print date
  if (reportParam.print_date && reportParam.print_date_text) {
    sectionDate.addParagraph(reportParam.print_date_text, "");
  }

  // Print customer address
  if (reportParam.print_customer_address && reportParam.customer_address_include) {

    if (reportParam.customer_address_prefix) {
      sectionCustomerAddress.addParagraph(reportParam.customer_address_prefix, "");
    }

    sectionCustomerAddress.addParagraph(reportParam.customer_address_name, "");
    sectionCustomerAddress.addParagraph(reportParam.customer_address_address + " " + reportParam.customer_address_house_number, "");
    sectionCustomerAddress.addParagraph(reportParam.customer_address_postal_code + " " + reportParam.customer_address_locality, "");
  }

  // Print letter text
  if (reportParam.print_text) {
    var paragraph = sectionLetter.addParagraph("","");
    var textFinal = convertFields(reportParam.print_msg_text, reportParam);
    addMdBoldText(paragraph, textFinal);
  }
  
  sectionLetter.addParagraph(" ","");

  // Print QRCode section
  var qrBill = new QRBill(banDoc, reportParam);
  qrBill.printQRCodeDirect(report, stylesheet, reportParam);
}

function convertFields(text, reportParam) {

  if (text.indexOf("<Currency>") > -1) {
    text = text.replace(/<Currency>/g, reportParam.currency);
  }

  if (text.indexOf("<Amount>") > -1) {
    var amount = Banana.Converter.toLocaleNumberFormat(reportParam.billing_info_total_to_pay,2,true);
    text = text.replace(/<Amount>/g, amount);
  }

  if (text.indexOf("<AdditionalInformation>") > -1 ) {
    text = text.replace(/<AdditionalInformation>/g, reportParam.additional_information);
  }
  
  return text;
}




function setSenderAddress(banDoc, userParam, qrSettings) {

  /**
   * We always use the 'Structured' address type (S)
   */

  if (userParam.sender_address_from_accounting) { //from File->Properties

    userParam.sender_address_name = banDoc.info("AccountingDataBase","Name") + " " + banDoc.info("AccountingDataBase","FamilyName");
    if (banDoc.info("AccountingDataBase","Company")) {
      userParam.sender_address_name = banDoc.info("AccountingDataBase","Company");
    }
    userParam.sender_address_address = banDoc.info("AccountingDataBase","Address1");
    userParam.sender_address_house_number = '';
    userParam.sender_address_postal_code = banDoc.info("AccountingDataBase","Zip");
    userParam.sender_address_locality = banDoc.info("AccountingDataBase","City");
    userParam.sender_address_country_code = banDoc.info("AccountingDataBase","CountryCode");
    userParam.sender_address_iban = banDoc.info("AccountingDataBase","IBAN");
    qrSettings.qr_code_iban_eur = banDoc.info("AccountingDataBase","IBAN");

    //add all the information in the userParam object
    userParam.supplier_info_iban_number = banDoc.info("AccountingDataBase","IBAN");
    userParam.supplier_info_business_name = banDoc.info("AccountingDataBase","Company");
    userParam.supplier_info_first_name = banDoc.info("AccountingDataBase","Name");
    userParam.supplier_info_last_name = banDoc.info("AccountingDataBase","FamilyName");
    userParam.supplier_info_address1 = banDoc.info("AccountingDataBase","Address1");
    userParam.supplier_info_address2 = ''; //banDoc.info("AccountingDataBase","Address2");
    userParam.supplier_info_postal_code = banDoc.info("AccountingDataBase","Zip");
    userParam.supplier_info_city = banDoc.info("AccountingDataBase","City");
    userParam.supplier_info_country_code = banDoc.info("AccountingDataBase","CountryCode");
    qrSettings.qr_code_iban_eur = banDoc.info("AccountingDataBase","IBAN");
  }
  else {
    qrSettings.qr_code_payable_to = true;
    qrSettings.qr_code_creditor_name = userParam.sender_address_name;
    qrSettings.qr_code_creditor_address1 = userParam.sender_address_address;
    qrSettings.qr_code_creditor_address2 = userParam.sender_address_house_number;
    qrSettings.qr_code_creditor_postalcode = userParam.sender_address_postal_code;
    qrSettings.qr_code_creditor_city = userParam.sender_address_locality;
    qrSettings.qr_code_creditor_country = userParam.sender_address_country_code;
    qrSettings.qr_code_iban = userParam.sender_address_iban;
    qrSettings.qr_code_iban_eur = userParam.sender_address_iban;
  }
}

function setCustomerAddress(userParam, qrSettings) {

  /**
   * With the address defined in extension parameter we always use the 'Structured' address type (S)
   * 
   * All the address data are already on userParam object
   */

  if (userParam.customer_address_include) {
    qrSettings.qr_code_empty_address = false;
    qrSettings.qr_code_debtor_address_type = 'S';
  }
}

function setAmount(userParam, qrSettings) {

  var amount = userParam.total_amount;

  //replace decimals separator , with .
  if (amount.indexOf(',')) {
    amount = amount.replace(',','.');
  }
  //remove thousand separator '
  if (amount.indexOf("'")) {
    amount = amount.replace("'","");
  }
  //convert to add decimals separator in case it doesn't exist (. or , depending on OS settings)
  amount = Banana.Converter.toLocaleNumberFormat(amount,2,true);
  //convert to internal format number with . as decimal separator
  amount = Banana.Converter.toInternalNumberFormat(amount);

  //add all the information in the userParam object
  userParam.billing_info_total_to_pay = amount;

  if (userParam.amount_include) {
    qrSettings.qr_code_empty_amount = false;
  }
}




//
// PARAMETERS
//
function convertParam(userParam) {

  //language
  var lang = 'en';
  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }

  var texts = {};
  texts = setTexts(lang);

  //parameters
  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];


  /*******************************************************************************************
  * INCLUDE IN letter
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'include_letter';
  currentParam.title = texts.include_letter;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_letter = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_header_logo';
  currentParam.parentObject = 'include_letter';
  currentParam.title = texts.print_header_logo;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_header_logo ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_header_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_logo_name';
  currentParam.parentObject = 'include_letter'
  currentParam.title = texts.header_logo_name;
  currentParam.type = 'string';
  currentParam.value = userParam.header_logo_name ? userParam.header_logo_name : 'Logo';
  currentParam.defaultvalue = 'Logo';
  currentParam.readValue = function() {
      userParam.header_logo_name = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_sender_address';
  currentParam.parentObject = 'include_letter';
  currentParam.title = texts.print_sender_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_sender_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_sender_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_customer_address';
  currentParam.parentObject = 'include_letter';
  currentParam.title = texts.print_customer_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_customer_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_customer_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_date';
  currentParam.parentObject = 'include_letter';
  currentParam.title = texts.print_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_date ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_text';
  currentParam.parentObject = 'include_letter';
  currentParam.title = texts.print_text;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_text ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.print_text = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * INCLUDE IN QR-CODE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'qrcode';
  currentParam.title = texts.qrcode;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.text = this.value;
  }
  convertedParam.data.push(currentParam);

  // Print separating border
  currentParam = {};
  currentParam.name = 'print_separating_border';
  currentParam.parentObject = 'qrcode';
  currentParam.title = texts.print_separating_border;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_separating_border ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.print_separating_border = this.value;
  }
  convertedParam.data.push(currentParam);

  // Print scissors symbol
  currentParam = {};
  currentParam.name = 'print_scissors_symbol';
  currentParam.parentObject = 'qrcode';
  currentParam.title = texts.print_scissors_symbol;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_scissors_symbol ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_scissors_symbol = this.value;
  }
  convertedParam.data.push(currentParam);

  // Include amount
  currentParam = {};
  currentParam.name = 'amount_include';
  currentParam.parentObject = 'qrcode';
  currentParam.title = texts.amount_include;
  currentParam.type = 'bool';
  currentParam.value = userParam.amount_include ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.amount_include = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * CURRENCY and AMOUNT
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'amount';
  currentParam.title = texts.amount;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.amount = this.value;
  }
  convertedParam.data.push(currentParam);

  //Currency
  currentParam = {};
  currentParam.name = 'currency';
  currentParam.parentObject = 'amount';
  currentParam.title = texts.currency;
  currentParam.type = 'combobox';
  currentParam.items = ["CHF","EUR"];
  currentParam.value = userParam.currency ? userParam.currency : 'CHF';
  currentParam.defaultvalue = "CHF";
  currentParam.readValue = function() {
    userParam.currency = this.value;
  }
  convertedParam.data.push(currentParam);

  // Amount
  currentParam = {};
  currentParam.name = 'total_amount';
  currentParam.parentObject = 'amount';
  currentParam.title = texts.total_amount;
  currentParam.type = 'string';
  currentParam.value = userParam.total_amount ? userParam.total_amount : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.total_amount = this.value;
  }
  convertedParam.data.push(currentParam);

  //Additional information
  currentParam = {};
  currentParam.name = 'additional_information';
  currentParam.parentObject = 'amount';
  currentParam.title = texts.additional_information;
  currentParam.type = 'string';
  currentParam.value = userParam.additional_information ? userParam.additional_information : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.additional_information = this.value;
  }
  convertedParam.data.push(currentParam);




  /*******************************************************************************************
  * SENDER ADDRESS
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'sender_address';
  currentParam.title = texts.sender_address;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.sender_address = this.value;
  }
  convertedParam.data.push(currentParam);

  // Use accounting address
  currentParam = {};
  currentParam.name = 'sender_address_from_accounting';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_from_accounting;
  currentParam.type = 'bool';
  currentParam.value = userParam.sender_address_from_accounting ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.sender_address_from_accounting = this.value;
  }
  convertedParam.data.push(currentParam);

  // Name
  currentParam = {};
  currentParam.name = 'sender_address_name';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_name;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_name ? userParam.sender_address_name : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_name = this.value;
  }
  convertedParam.data.push(currentParam);

  // Address
  currentParam = {};
  currentParam.name = 'sender_address_address';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_address;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_address ? userParam.sender_address_address : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_address = this.value;
  }
  convertedParam.data.push(currentParam);

  // House number
  currentParam = {};
  currentParam.name = 'sender_address_house_number';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_house_number;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_house_number ? userParam.sender_address_house_number : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_house_number = this.value;
  }
  convertedParam.data.push(currentParam);

  // Postal code
  currentParam = {};
  currentParam.name = 'sender_address_postal_code';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_postal_code;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_postal_code ? userParam.sender_address_postal_code : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_postal_code = this.value;
  }
  convertedParam.data.push(currentParam);

  // Locality
  currentParam = {};
  currentParam.name = 'sender_address_locality';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_locality;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_locality ? userParam.sender_address_locality : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_locality = this.value;
  }
  convertedParam.data.push(currentParam);

  // Country code
  currentParam = {};
  currentParam.name = 'sender_address_country_code';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_country_code;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_country_code ? userParam.sender_address_country_code : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_country_code = this.value;
  }
  convertedParam.data.push(currentParam);

  // IBAN
  currentParam = {};
  currentParam.name = 'sender_address_iban';
  currentParam.parentObject = 'sender_address';
  currentParam.title = texts.sender_address_iban;
  currentParam.type = 'string';
  currentParam.value = userParam.sender_address_iban ? userParam.sender_address_iban : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.sender_address_iban = this.value;
  }
  convertedParam.data.push(currentParam);




  /*******************************************************************************************
  * CUSTOMER ADDRESS
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'customer_address';
  currentParam.title = texts.customer_address;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.customer_address = this.value;
  }
  convertedParam.data.push(currentParam);

  // Include customer address
  currentParam = {};
  currentParam.name = 'customer_address_include';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_include;
  currentParam.type = 'bool';
  currentParam.value = userParam.customer_address_include ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.customer_address_include = this.value;
  }
  convertedParam.data.push(currentParam);

  // Name
  currentParam = {};
  currentParam.name = 'customer_address_name';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_name;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_name ? userParam.customer_address_name : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_name = this.value;
  }
  convertedParam.data.push(currentParam);

  // Address
  currentParam = {};
  currentParam.name = 'customer_address_address';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_address;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_address ? userParam.customer_address_address : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_address = this.value;
  }
  convertedParam.data.push(currentParam);

  // House number
  currentParam = {};
  currentParam.name = 'customer_address_house_number';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_house_number;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_house_number ? userParam.customer_address_house_number : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_house_number = this.value;
  }
  convertedParam.data.push(currentParam);

  // Postal code
  currentParam = {};
  currentParam.name = 'customer_address_postal_code';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_postal_code;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_postal_code ? userParam.customer_address_postal_code : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_postal_code = this.value;
  }
  convertedParam.data.push(currentParam);

  // Locality
  currentParam = {};
  currentParam.name = 'customer_address_locality';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_locality;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_locality ? userParam.customer_address_locality : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_locality = this.value;
  }
  convertedParam.data.push(currentParam);

  // Country code
  currentParam = {};
  currentParam.name = 'customer_address_country_code';
  currentParam.parentObject = 'customer_address';
  currentParam.title = texts.customer_address_country_code;
  currentParam.type = 'string';
  currentParam.value = userParam.customer_address_country_code ? userParam.customer_address_country_code : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.customer_address_country_code = this.value;
  }
  convertedParam.data.push(currentParam);




  /*******************************************************************************************
  * DATE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'print_date_text';
  currentParam.parentObject = '';
  currentParam.title = texts.print_date_text;
  currentParam.type = 'string';
  currentParam.value = userParam.print_date_text ? userParam.print_date_text : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.print_date_text = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * TEXT
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'text';
  currentParam.title = texts.text;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.text = this.value;
  }
  convertedParam.data.push(currentParam);

  // Notes top page
  currentParam = {};
  currentParam.name = 'print_msg_text';
  currentParam.parentObject = 'text';
  currentParam.title = texts.print_msg_text;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.print_msg_text ? userParam.print_msg_text : '';
  currentParam.defaultvalue = 'The QR payment part without address and amount is at the bottom of the page.';
  currentParam.readValue = function() {
    userParam.print_msg_text = this.value;
  }
  convertedParam.data.push(currentParam);




  /*******************************************************************************************
  * LANGUAGE QR CODE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'language';
  currentParam.parentObject = '';
  currentParam.title = texts.language;
  currentParam.type = 'combobox';
  currentParam.items = ["DE","EN","FR","IT"];
  currentParam.value = userParam.language ? userParam.language : 'EN';
  currentParam.defaultvalue = "EN";
  currentParam.readValue = function() {
    userParam.language = this.value;
  }
  convertedParam.data.push(currentParam);




  /*******************************************************************************************
  * STYLES
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'styles';
  currentParam.title = texts.styles;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.styles = this.value;
  }
  convertedParam.data.push(currentParam);

  // Font family
  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.font_family;
  currentParam.type = 'string';
  currentParam.value = userParam.font_family ? userParam.font_family : 'Helvetica';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.readValue = function() {
   userParam.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  // Font size
  currentParam = {};
  currentParam.name = 'font_size';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.font_size;
  currentParam.type = 'string';
  currentParam.value = userParam.font_size ? userParam.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.readValue = function() {
   userParam.font_size = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

function initUserParam() {
  
  var userParam = {};

  //
  userParam.print_header_logo = false;
  userParam.header_logo_name = 'Logo';
  userParam.print_sender_address = false;
  userParam.print_customer_address = false;
  userParam.print_date = false;
  userParam.print_text = true;
  //
  userParam.language = "EN";
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  //
  userParam.amount_include = false;
  userParam.currency = "CHF";
  userParam.total_amount = "";
  userParam.additional_information = "";
  //
  userParam.sender_address_from_accounting = true;
  userParam.sender_address_name = "";
  userParam.sender_address_address = "";
  userParam.sender_address_house_number = "";
  userParam.sender_address_postal_code = "";
  userParam.sender_address_locality = "";
  userParam.sender_address_country_code = "";
  userParam.sender_address_iban = "";
  //
  userParam.customer_address_include = false;
  userParam.customer_address_name = "";
  userParam.customer_address_address = "";
  userParam.customer_address_house_number = "";
  userParam.customer_address_postal_code = "";
  userParam.customer_address_locality = "";
  userParam.customer_address_country_code = "";
  //
  userParam.print_date_text = "";
  //
  userParam.print_msg_text = "The QR payment part without address and amount is at the bottom of the page.";
  //
  userParam.font_family = "Helvetica";
  userParam.font_size = "10";

  return userParam;
}

function parametersDialog(userParam) {

  if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
      //language
      var lang = 'en';
      if (Banana.document.locale) {
        lang = Banana.document.locale;
      }
      if (lang.length > 2) {
        lang = lang.substr(0, 2);
      }

      //parameters
      var dialogTitle = '';
      if (lang === 'it') {
        dialogTitle = 'Impostazioni';
      } else if (lang === 'fr') {
        dialogTitle = 'Paramètres';
      } else if (lang === 'de') {
        dialogTitle = 'Einstellungen';
      } else {
        dialogTitle = 'Settings';
      }
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
          return null;
      }
      
      for (var i = 0; i < convertedParam.data.length; i++) {
          // Read values to userParam (through the readValue function)
          convertedParam.data[i].readValue();
      }
  }
  
  return userParam;
}

function settingsDialog() {
  
  var scriptform = initUserParam();

  // Retrieve saved param
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam && savedParam.length > 0) {
      scriptform = JSON.parse(savedParam);
  }

  scriptform = parametersDialog(scriptform); // From propertiess
  if (scriptform) {
      var paramToString = JSON.stringify(scriptform);
      Banana.document.setScriptSettings(paramToString);
  }
  
  return scriptform;
}

function initQRSettings(userParam) {
  /*
    Initialize the QR settings
  */
  var qrSettings = {};
  
  // Default settings
  qrSettings.qr_code_add = true;
  qrSettings.qr_code_reference_type = 'NON'
  qrSettings.qr_code_qriban = '';
  qrSettings.qr_code_iban = '';
  qrSettings.qr_code_iban_eur = '';
  qrSettings.qr_code_isr_id = '';
  qrSettings.qr_code_payable_to = false;
  qrSettings.qr_code_creditor_name = "";
  qrSettings.qr_code_creditor_address1 = "";
  qrSettings.qr_code_creditor_postalcode = "";
  qrSettings.qr_code_creditor_city = "";
  qrSettings.qr_code_creditor_country = "";
  
  qrSettings.qr_code_additional_information = '';
  if (userParam.customer_address_include || userParam.amount_include) {
    if (userParam.additional_information) {
      qrSettings.qr_code_additional_information = userParam.additional_information.trim();
    } 
  }

  qrSettings.qr_code_billing_information = false;
  qrSettings.qr_code_empty_address = true;
  qrSettings.qr_code_empty_amount = true;
  qrSettings.qr_code_add_border_separator = true;
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



//
// TEXTS
//
function setTexts(language) {
  
  var texts = {};

  if (language === 'it') {
    texts.print_header_logo = "Logo";
    texts.header_logo_name = "Nome logo";
    texts.text = 'Testo lettera';
    texts.print_text = 'Testo libero';
    texts.print_msg_text = 'Testo libero';
    texts.print_sender_address = 'Indirizzo mittente';
    texts.print_customer_address = 'Indirizzo cliente';
    texts.sender_address = 'Indirizzo mittente (Pagabile a)';
    texts.sender_address_from_accounting = 'Usa indrizzo contabilità';
    texts.sender_address_name = 'Nome';
    texts.sender_address_address = 'Via';
    texts.sender_address_house_number = 'Numero civico';
    texts.sender_address_postal_code = 'Codice postale';
    texts.sender_address_locality = 'Località';
    texts.sender_address_country_code = 'Codice nazione';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Indirizzo cliente (Pagabile da)';
    texts.customer_address_include = 'Includi cliente';
    texts.customer_address_name = 'Nome';
    texts.customer_address_address = 'Via';
    texts.customer_address_house_number = 'Numero civico';
    texts.customer_address_postal_code = 'Codice postale';
    texts.customer_address_locality = 'Località';
    texts.customer_address_country_code = 'Codice nazione';
    texts.amount = 'Moneta/Importo';
    texts.amount_include = 'Importo';
    texts.currency = 'Moneta';
    texts.total_amount = 'Importo';
    texts.qrcode = 'Includi nel codice QR';
    texts.language = 'Lingua';
    texts.additional_information = 'Informazioni aggiuntive';
    texts.print_separating_border = 'Bordo di separazione';
    texts.print_scissors_symbol = 'Simbolo forbici';
    texts.font_family = 'Tipo carattere';
    texts.font_size = 'Dimensione carattere';
    texts.letter = 'Testo lettera';
    texts.print_date = 'Data';
    texts.print_date_text = 'Data';
    texts.styles = 'Stili';
    texts.include_letter = 'Includi nella lettera';
  }
  else if (language === 'fr') {
    texts.print_header_logo = "Logo";
    texts.header_logo_name = "Logo nom";
    texts.text = 'Texte';
    texts.print_text = 'Texte libre';
    texts.print_msg_text = 'Texte libre';
    texts.print_sender_address = "Adresse expéditeur";
    texts.print_customer_address = 'Adresse client';
    texts.sender_address = 'Adresse expéditeur (Payable à)';
    texts.sender_address_from_accounting = 'Utiliser adresse comptabilité';
    texts.sender_address_name = 'Nom';
    texts.sender_address_address = 'Rue';
    texts.sender_address_house_number = 'Numéro immeuble';
    texts.sender_address_postal_code = 'Code postal';
    texts.sender_address_locality = 'Localité';
    texts.sender_address_country_code = 'Code du pays';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Adresse client (Payable par)';
    texts.customer_address_include = 'Inclure le client';
    texts.customer_address_name = 'Nom';
    texts.customer_address_address = 'Rue';
    texts.customer_address_house_number = 'Numéro immeuble';
    texts.customer_address_postal_code = 'Code postal';
    texts.customer_address_locality = 'Localité';
    texts.customer_address_country_code = 'Code du pays';
    texts.amount = 'Devise/Montant';
    texts.amount_include = 'Montant';
    texts.currency = 'Devise';
    texts.total_amount = 'Montant';
    texts.qrcode = 'Inclure dans le code QR';
    texts.language = 'Langue';
    texts.additional_information = 'Informations additionnelles';
    texts.print_separating_border = 'Bordure de séparation';
    texts.print_scissors_symbol = 'Symbole des ciseaux';
    texts.font_family = 'Type de caractère';
    texts.font_size = 'Taille des caractères';
    texts.letter = 'Texte de la lettre';
    texts.print_date = 'Date';
    texts.print_date_text = 'Date';
    texts.styles = 'Styles';
    texts.include_letter = 'Inclure dans la lettre';
  }
  else if (language === 'de') {
    texts.print_header_logo = "Logo";
    texts.header_logo_name = "Logo-Name";
    texts.text = 'Text';
    texts.print_text = 'Freier Text';
    texts.print_msg_text = 'Freier Text';
    texts.print_sender_address = 'Adresse des Absenders';
    texts.print_customer_address = 'Adresse des Kunden';
    texts.sender_address = 'Adresse des Absenders (Zahlbar an)';
    texts.sender_address_from_accounting = 'Absenderadresse aus Buchhaltung verwenden';
    texts.sender_address_name = 'Name';
    texts.sender_address_address = 'Strasse';
    texts.sender_address_house_number = 'Hausnummer';
    texts.sender_address_postal_code = 'Postleitzahl';
    texts.sender_address_locality = 'Ort';
    texts.sender_address_country_code = 'Ländercode';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Adresse des Kunden (Zahlbar durch)';
    texts.customer_address_include = 'Kunde einbeziehen';
    texts.customer_address_name = 'Name';
    texts.customer_address_address = 'Strasse';
    texts.customer_address_house_number = 'Hausnummer';
    texts.customer_address_postal_code = 'Postleitzahl';
    texts.customer_address_locality = 'Ort';
    texts.customer_address_country_code = 'Ländercode';
    texts.amount = 'Währung/Betrag';
    texts.amount_include = 'Betrag';
    texts.currency = 'Währung';
    texts.total_amount = 'Betrag';
    texts.qrcode = 'In QR-Code einbinden';
    texts.language = 'Sprache';
    texts.additional_information = 'Zusätzliche Informationen';
    texts.print_separating_border = 'Trennlinie';
    texts.print_scissors_symbol = 'Scherensymbol';
    texts.font_family = 'Schriftzeichen';
    texts.font_size = 'Schriftgrösse';
    texts.letter = 'Text des Briefes';
    texts.print_date = 'Datum';
    texts.print_date_text = 'Datum';
    texts.styles = 'Stilarten';
    texts.include_letter = 'In den Brief einfügen';
  }
  else {
    texts.print_header_logo = "Logo";
    texts.header_logo_name = "Logo name";
    texts.text = 'Text';
    texts.print_text = 'Free text';
    texts.print_msg_text = 'Free text';
    texts.print_sender_address = 'Sender address';
    texts.print_customer_address = 'Customer address';
    texts.sender_address = 'Sender address (Payable to)';
    texts.sender_address_from_accounting = 'Use accounting address';
    texts.sender_address_name = 'Name';
    texts.sender_address_address = 'Street';
    texts.sender_address_house_number = 'House number';
    texts.sender_address_postal_code = 'Postal code';
    texts.sender_address_locality = 'Locality';
    texts.sender_address_country_code = 'Country code';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Customer address (Payable by)';
    texts.customer_address_include = 'Include customer';
    texts.customer_address_name = 'Name';
    texts.customer_address_address = 'Street';
    texts.customer_address_house_number = 'House number';
    texts.customer_address_postal_code = 'Postal code';
    texts.customer_address_locality = 'Locality';
    texts.customer_address_country_code = 'Country code';
    texts.amount = 'Currency/Amount';
    texts.amount_include = 'Amount';
    texts.currency = 'Currency';
    texts.total_amount = 'Amount';
    texts.qrcode = 'Include in QR code';
    texts.language = 'Language';
    texts.additional_information = 'Additional information';
    texts.print_separating_border = 'Separating border';
    texts.print_scissors_symbol = 'Scissors symbol';
    texts.font_family = 'Font family';
    texts.font_size = 'Font size';
    texts.letter = 'Letter text';
    texts.print_date = 'Date';
    texts.print_date_text = 'Date';
    texts.styles = 'Styles';
    texts.include_letter = 'Include in letter';
  }

  return texts;
}


//
// STYLES
//
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

function setVariables(variables, reportParam) {
  /** 
    Sets all the variables values.
  */
  variables.$font_family = reportParam.font_family;
  variables.$font_size = reportParam.font_size+"pt";
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

function setCss(stylesheet, reportParam) {

  // Variable starts with $
  var variables = {};
  setVariables(variables, reportParam);

  var textCSS = "";
  var file = Banana.IO.getLocalFile("file:script/emptyqr.css");
  var fileContent = file.read();
  
  if (!file.errorString) {
    Banana.IO.openPath(fileContent);
    //Banana.console.log(fileContent);
    textCSS = fileContent;
  }
  else {
    Banana.console.log(file.errorString);
  }

  /**
    User defined CSS
    Only available with Banana Accountin Plus Advanced plan.
  */
  // if (reportParam.css) {
  //   textCSS += reportParam.css;
  // }

  // Replace all varibles
  textCSS = replaceVariables(textCSS, variables);

  // Parse the CSS text
  stylesheet.parse(textCSS);
}




//
// OTHER
//
function bananaRequiredVersion(requiredVersion, expmVersion) {

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
        if (expmVersion) {
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        }
        break;

      case "it":
        if (expmVersion) {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare a Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare alla versione " + requiredVersion + " o successiva.";
        }
        break;
      
      case "fr":
        if (expmVersion) {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour vers Banana+ Dev Channel (" + requiredVersion + ")";
        } else {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour à " + requiredVersion + " ou plus récente.";
        }
        break;
      
      case "de":
        if (expmVersion) {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Banana+ Dev Channel aktualisieren (" + requiredVersion + ").";
        } else {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Version " + requiredVersion + " oder neuer aktualisiern.";
        }
        break;
      
      default:
        if (expmVersion) {
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        }
    }

    Banana.application.showMessages();
    Banana.document.addMessage(msg);

    return false;
  }
  return true;
}

