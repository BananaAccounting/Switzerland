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
// @id = ch.banana.ch.app.emptyqr
// @api = 1.0
// @pubdate = 2022-03-18
// @publisher = Banana.ch SA
// @description = QR-bill with empty amount and address
// @description.it = QR-Fattura senza importo e indirizzo
// @description.de = QR-Rechnung ohne Betrag und ohne Adresse
// @description.fr = QR-Facture sans montant et adresse
// @description.en = QR-bill with empty amount and address
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
    var stylesheet = createStyleSheet(userParam);
    
    var report = Banana.Report.newReport("QR-Bill report");



    // Clone the object
    var reportParam = JSON.parse(JSON.stringify(userParam));

    // Merge the two objects
    reportParam = Object.assign(reportParam, qrSettings);

    //Banana.console.log(JSON.stringify(reportParam, "", " "));



    //faccio un clone dei parametri "reportParam"
    //quì dentro vado a impostare/cambiare con tutti i valori presi da userParam, invoiceObj e qrSettings
    //=>in modo che poi posso usare solo quello per stampare la fattura (non ho più bisogno di userParam, invoiceObj e qrSettings)
    //faccio due funzioni: una per stampare singolarmente, e una per stampare piu righe dalla tabella


    

    
    /*
    if (stampa dati tabella) // piu righe 

      for (passo tutti i dati della tabella) {

          inizializzo reportParam con i dati della tabella

          reportParam.table = {};
          reportParam.table.name = '';
          reportParam.table.street = '';
          ...

          reportParam.table[nomeColonna] = '';


          //riempire l'oggetto reportParam le colonne della tabella, anche quelle personalizzate
          //API javascript, usare la funzione che mi restituisce tutte le colonne della tabella


          reportParam.total_amount = valore nella tabella
          reportParam.additional_information = valore nella tabella
          //.. anche gli altri, da sostituire con i valori delle colonne tabella

          //Stampa report solo se cè un importo
          //se nella tabella ci sono importi nulli non stampare
          if (!reportParam.print_amount || (reportParam.print_amount && reportParam.total_amount > 0) ) {
            printReport(Banana.document, report, stylesheet, qrSettings, invoiceObj, reportParam); //stampa piu righe
          }


          

    }
    else {
      //stampa singolo
      printReportSingle(Banana.document, report, stylesheet, qrSettings, invoiceObj, reportParam); //stampa singolo
    }
    */





    printReportSingle(Banana.document, report, stylesheet, texts, reportParam);



    Banana.Report.preview(report, stylesheet);
  }
}

function printReportSingle(banDoc, report, stylesheet, texts, reportParam) {
  //================
  // 1. Print letter
  //================
  if (reportParam.print_text && reportParam.print_msg_text) {

    // Print sender address
    if (reportParam.print_sender_address) {

      var tableSenderAddress = report.addTable("tableSenderAddress");

      if (reportParam.sender_address_from_accounting) {
        if (reportParam.supplier_info_business_name) {
          tableRow = tableSenderAddress.addRow();
          tableRow.addCell(reportParam.supplier_info_business_name, "", 1);
        }
        if (reportParam.supplier_info_first_name && reportParam.supplier_info_last_name) {
          tableRow = tableSenderAddress.addRow();
          tableRow.addCell(reportParam.supplier_info_first_name + " " + reportParam.supplier_info_last_name, "", 1);
        }
        if (reportParam.supplier_info_address1) {
          tableRow = tableSenderAddress.addRow();
          tableRow.addCell(reportParam.supplier_info_address1, "", 1);
        }
        if (reportParam.supplier_info_postal_code && reportParam.supplier_info_city) {
          tableRow = tableSenderAddress.addRow();
          tableRow.addCell(reportParam.supplier_info_postal_code + " " + reportParam.supplier_info_city, "", 1);
        }
      }
      else {
        tableRow = tableSenderAddress.addRow();
        tableRow.addCell(reportParam.sender_address_name, "", 1);
        tableRow = tableSenderAddress.addRow();
        tableRow.addCell(reportParam.sender_address_address + " " + reportParam.sender_address_house_number, "", 1);
        tableRow = tableSenderAddress.addRow();
        tableRow.addCell(reportParam.sender_address_postal_code + " " + reportParam.sender_address_locality, "", 1);
      }
    }

    // Print customer address
    if (reportParam.print_customer_address && reportParam.customer_address_include) {
      var tableCustomerAddress = report.addTable("tableCustomerAddress");
      tableRow = tableCustomerAddress.addRow();
      tableRow.addCell(reportParam.customer_address_name, "", 1);
      tableRow = tableCustomerAddress.addRow();
      tableRow.addCell(reportParam.customer_address_address + " " + reportParam.customer_address_house_number, "", 1);
      tableRow = tableCustomerAddress.addRow();
      tableRow.addCell(reportParam.customer_address_postal_code + " " + reportParam.customer_address_locality, "", 1);
    }

    // Print letter text
    var letterSection = report.addSection("letter");
    //letterSection.addParagraph(reportParam.print_msg_text, "");

    var paragraph = letterSection.addParagraph("","");
    addMdBoldText(paragraph, reportParam.print_msg_text);


    if (reportParam.print_amount && reportParam.amount_include && reportParam.total_amount) {
      letterSection.addParagraph(texts.print_amount_text + " " + reportParam.currency + " " + Banana.Converter.toLocaleNumberFormat(reportParam.total_amount,2,true));
    }
  }

  //========================
  // 2. Print QRCode section
  //========================
  var qrBill = new QRBill(banDoc, reportParam);
  qrBill.printQRCodeDirect(report, stylesheet, reportParam);
}

function setSenderAddress(banDoc, userParam, qrSettings) {

  /**
   * With extension parameter settins we use the 'Structured' address type (S)
   * With address from accounting we use 'Combined' address type (K)
   */

  if (userParam.sender_address_from_accounting) { //from File->Properties

    //add all the information in the userParam object
    userParam.supplier_info_iban_number = banDoc.info("AccountingDataBase","IBAN");
    userParam.supplier_info_business_name = banDoc.info("AccountingDataBase","Company");
    userParam.supplier_info_first_name = banDoc.info("AccountingDataBase","Name");
    userParam.supplier_info_last_name = banDoc.info("AccountingDataBase","FamilyName");
    userParam.supplier_info_address1 = banDoc.info("AccountingDataBase","Address1");
    userParam.supplier_info_address2 = banDoc.info("AccountingDataBase","Address2");
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
   * With the address defined in extension parameter we use the 'Structured' address type (S)
   * 
   * All the address data are already on userParam object
   */

  if (userParam.customer_address_include) {
    qrSettings.qr_code_empty_address = false;
    qrSettings.qr_code_debtor_address_type = 'S';
  }
}

function setAmount(userParam, qrSettings) {

  if (userParam.amount_include) {
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
    
    //invoiceObj.billing_info.total_to_pay = amount;
    qrSettings.qr_code_empty_amount = false;

    //add all the information in the userParam object
    userParam.billing_info_total_to_pay = amount;
  }
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
  if (userParam.additional_information) {
    qrSettings.qr_code_additional_information = "*"+userParam.additional_information; //we add * because its not a table column name
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

  currentParam = {};
  currentParam.name = 'print_text';
  currentParam.parentObject = 'text';
  currentParam.title = texts.print_text;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_text ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.print_text = this.value;
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

  currentParam = {};
  currentParam.name = 'print_sender_address';
  currentParam.parentObject = 'text';
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
  currentParam.parentObject = 'text';
  currentParam.title = texts.print_customer_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_customer_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_customer_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_amount';
  currentParam.parentObject = 'text';
  currentParam.title = texts.print_amount;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_amount ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_amount = this.value;
  }
  convertedParam.data.push(currentParam);

  // Font family
  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'text';
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
  currentParam.parentObject = 'text';
  currentParam.title = texts.font_size;
  currentParam.type = 'string';
  currentParam.value = userParam.font_size ? userParam.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.readValue = function() {
   userParam.font_size = this.value;
  }
  convertedParam.data.push(currentParam);


  /*******************************************************************************************
  * SENDER ADDRESS
  *******************************************************************************************/

  //Sender address
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

  // Customer address
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

  // Include amount
  currentParam = {};
  currentParam.name = 'amount_include';
  currentParam.parentObject = 'amount';
  currentParam.title = texts.amount_include;
  currentParam.type = 'bool';
  currentParam.value = userParam.amount_include ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.amount_include = this.value;
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
  * QR-CODE
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

  //Language
  currentParam = {};
  currentParam.name = 'language';
  currentParam.parentObject = 'qrcode';
  currentParam.title = texts.language;
  currentParam.type = 'combobox';
  currentParam.items = ["DE","EN","FR","IT"];
  currentParam.value = userParam.language ? userParam.language : 'EN';
  currentParam.defaultvalue = "EN";
  currentParam.readValue = function() {
    userParam.language = this.value;
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


  // // Use QRCode table
  // // Show the parameter only if the table exists in the document
  // var tableNames = Banana.document.tableNames;
  // if (tableNames.indexOf("QRCode") > -1) {
  //   currentParam = {};
  //   currentParam.name = 'use_qrcode_table';
  //   currentParam.parentObject = '';
  //   currentParam.title = texts.use_qrcode_table;
  //   currentParam.type = 'bool';
  //   currentParam.value = userParam.use_qrcode_table ? true : false;
  //   currentParam.defaultvalue = false;
  //   currentParam.readValue = function() {
  //     userParam.use_qrcode_table = this.value;
  //   }
  //   convertedParam.data.push(currentParam);
  // }



  return convertedParam;
}

function initUserParam() {
  var userParam = {};
  userParam.print_msg_text = 'The QR payment part without address and amount is at the bottom of the page.';
  userParam.print_text = true;
  userParam.print_sender_address = false;
  userParam.print_customer_address = false;
  userParam.print_amount = false;
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
  userParam.language = "EN";
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  userParam.additional_information = '';
  // userParam.use_qrcode_table = false;
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

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


//
// TEXTS
//
function setTexts(language) {
  
  var texts = {};

  if (language === 'it') {
    texts.text = 'Testo lettera';
    texts.print_text = 'Stampa testo';
    texts.print_msg_text = 'Testo libero';
    texts.print_sender_address = 'Stampa indirizzo mittente';
    texts.print_customer_address = 'Stampa indirizzo cliente';
    texts.print_amount = 'Stampa importo';
    texts.print_amount_text = 'Importo totale';
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
    texts.amount_include = 'Includi importo';
    texts.currency = 'Moneta';
    texts.total_amount = 'Importo';
    texts.qrcode = 'Codice QR';
    texts.language = 'Lingua';
    texts.additional_information = 'Informazioni aggiuntive';
    texts.print_separating_border = 'Stampa bordo di separazione';
    texts.print_scissors_symbol = 'Stampa simbolo forbici';
    //texts.use_qrcode_table = 'Utilizza tabella QRCode';
    // texts.styles = 'Stili';
    texts.font_family = 'Tipo carattere';
    texts.font_size = 'Dimensione carattere';

  }
  else if (language === 'fr') {
    texts.text = 'Texte';
    texts.print_text = 'Imprimer le texte';
    texts.print_msg_text = 'Notes en haut de la page';
    texts.print_sender_address = 'Imprimer adresse expéditeur';
    texts.print_customer_address = 'Imprimer adresse client';
    texts.print_amount = 'Imprimer montant';
    texts.print_amount_text = 'Total montant';
    texts.sender_address = 'Adresse expéditeur (Payable à)';
    texts.sender_address_from_accounting = 'Utiliser adresse comptabilité';
    texts.sender_address_name = 'Nom';
    texts.sender_address_address = 'Rue';
    texts.sender_address_house_number = 'Numéro immeuble';
    texts.sender_address_postal_code = 'Code postal NPA';
    texts.sender_address_locality = 'Localité';
    texts.sender_address_country_code = 'Code du pays';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Adresse client (Payable par)';
    texts.customer_address_include = 'Inclure le client';
    texts.customer_address_name = 'Nom';
    texts.customer_address_address = 'Rue';
    texts.customer_address_house_number = 'Numéro immeuble';
    texts.customer_address_postal_code = 'Code postal NPA';
    texts.customer_address_locality = 'Localité';
    texts.customer_address_country_code = 'Code du pays';
    texts.amount = 'Devise/Montant';
    texts.amount_include = 'Inclure le montant';
    texts.currency = 'Devise';
    texts.total_amount = 'Montant';
    texts.qrcode = 'QR Code';
    texts.language = 'Langue';
    texts.additional_information = 'Informations additionnelles';
    texts.print_separating_border = 'Imprimer la bordure de séparation';
    texts.print_scissors_symbol = 'Imprimer le symbole des ciseaux';
    //texts.use_qrcode_table = 'Use QRCode table (da tradurre!!!!!)';
    // texts.styles = 'Styles';
    texts.font_family = 'Type de caractère';
    texts.font_size = 'Taille des caractères';
  }
  else if (language === 'de') {
    texts.text = 'Text';
    texts.print_text = 'Text drucken';
    texts.print_msg_text = 'Anmerkungen am Anfang der Seite';
    texts.print_sender_address = 'Absenderadresse drucken';
    texts.print_customer_address = 'Kundenadresse ausdrucken';
    texts.print_amount = 'Betrag ausdrucken';
    texts.print_amount_text = 'Totalbetrag';
    texts.sender_address = 'Absenderadresse (Zahlbar an)';
    texts.sender_address_from_accounting = 'Buchhaltungsadresse verwenden';
    texts.sender_address_name = 'Name';
    texts.sender_address_address = 'Strasse';
    texts.sender_address_house_number = 'Hausnummer';
    texts.sender_address_postal_code = 'PLZ';
    texts.sender_address_locality = 'Ort';
    texts.sender_address_country_code = 'Ländercode';
    texts.sender_address_iban = 'IBAN';
    texts.customer_address = 'Kundenadresse (Zahlbar durch)';
    texts.customer_address_include = 'Kunde einbeziehen';
    texts.customer_address_name = 'Name';
    texts.customer_address_address = 'Strasse';
    texts.customer_address_house_number = 'Hausnummer';
    texts.customer_address_postal_code = 'PLZ';
    texts.customer_address_locality = 'Ort';
    texts.customer_address_country_code = 'Ländercode';
    texts.amount = 'Währung/Betrag';
    texts.amount_include = 'Betrag einbeziehen';
    texts.currency = 'Währung';
    texts.total_amount = 'Betrag';
    texts.qrcode = 'QR-Code';
    texts.language = 'Sprache';
    texts.additional_information = 'Zusätzliche Informationen';
    texts.print_separating_border = 'Trennlinie drucken';
    texts.print_scissors_symbol = 'Scherensymbol drucken';
    //texts.use_qrcode_table = 'Use QRCode table (da tradurre!!!!!)';
    // texts.styles = 'Schriftarten';
    texts.font_family = 'Schriftzeichen';
    texts.font_size = 'Schriftgrösse';
  }
  else {
    texts.text = 'Text';
    texts.print_text = 'Print text';
    texts.print_msg_text = 'Notes at the top of the page';
    texts.print_sender_address = 'Print sender address';
    texts.print_customer_address = 'Print customer address';
    texts.print_amount = 'Print amount';
    texts.print_amount_text = 'Total amount';
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
    texts.amount_include = 'Include amount';
    texts.currency = 'Currency';
    texts.total_amount = 'Amount';
    texts.qrcode = 'QR Code';
    texts.language = 'Language';
    texts.additional_information = 'Additional information';
    texts.print_separating_border = 'Print separating border';
    texts.print_scissors_symbol = 'Print scissors symbol';
    //texts.use_qrcode_table = 'Use QRCode table';
    // texts.styles = 'Styles';
    texts.font_family = 'Font family';
    texts.font_size = 'Font size';
  }

  return texts;
}


//
// STYLES
//
function createStyleSheet(userParam) {

  var stylesheet = Banana.Report.newStyleSheet();

  stylesheet.addStyle("@page", "margin:0mm 0mm 0mm 0mm;");
  stylesheet.addStyle("body", "font-family:" + userParam.font_family+ "; font-size:" + userParam.font_size + ";");

  if (userParam.print_sender_address || userParam.print_customer_address) {
    stylesheet.addStyle(".letter", "margin-top:8cm; margin-left:2cm; margin-right:1.5cm; position:absolute;");
  }
  else {
    stylesheet.addStyle(".letter", "margin-top:2cm; margin-left:2cm; margin-right:1.5cm; position:absolute;");
  }
  
  stylesheet.addStyle(".tableSenderAddress", "font-size:" + userParam.font_size + "; margin-top:2cm; margin-left:2cm; position:absolute;");
  //stylesheet.addStyle("table.tableSenderAddress td", "border: thin solid black;");

  stylesheet.addStyle(".tableCustomerAddress", "font-size:" + userParam.font_size + "; margin-top:4.5cm; margin-left:12.3cm; position:absolute;");
  //stylesheet.addStyle("table.tableCustomerAddress td", "border: thin solid black;");

  return stylesheet;
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

