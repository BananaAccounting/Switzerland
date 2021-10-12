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
// @id = ch.banana.ch.app.emptyqr
// @api = 1.0
// @pubdate = 2021-09-15
// @publisher = Banana.ch SA
// @description = QR-bill with empty amount and address
// @description.it = QR-bill with empty amount and address
// @description.de = QR-bill with empty amount and address
// @description.fr = QR-bill with empty amount and address
// @description.en = QR-bill with empty amount and address
// @doctype = *
// @task = app.command
// @timeout = -1
// @includejs = swissqrcode.js
// @includejs = checkfunctions.js



/*
  SUMMARY
  =======
  Extensions that prints QR sections Receipt and Payment.
  QR code is without amount and without debtor.
  Only IBAN without reference, NON: no CUSTOMER and INVOICE numbers.
*/


// Define the required version of Banana Accounting / Banana Experimental
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

    /* 2. Initialize QR settings */
    var qrSettings = initQRSettings(userParam);

    /* 3. Initialize JSON */
    var invoiceObj = initJSON(Banana.document);

    /* 4. Print the report */
    var stylesheet = Banana.Report.newStyleSheet();
    var report = printReport(Banana.document, invoiceObj, report, stylesheet, userParam, qrSettings);
    Banana.Report.preview(report, stylesheet);
  }
}

function printReport(banDoc, invoiceObj, report, stylesheet, userParam, qrSettings) {
  var report = Banana.Report.newReport("QR with empty amount and address");

  // Add notes on top of the page
  if (userParam.print_msg_text) {
    report.addParagraph(userParam.print_msg_text, "").setStyleAttributes("margin-top:10mm; margin-left:10mm;");;
  }

  // Add QR section
  var qrBill = new QRBill(banDoc, qrSettings);
  qrBill.printQRCode(invoiceObj, report, stylesheet, qrSettings);

  return report;
}

function initQRSettings(userParam) {
  /*
    Initialize the QR settings
  */
  var qrSettings = {};
  
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

function initJSON(banDoc) {

  var invoiceObj = null;
  var jsonInvoice = '{"billing_info":{"payment_term":"","total_amount_vat_exclusive":"","total_amount_vat_exclusive_before_discount":"","total_amount_vat_inclusive":"","total_amount_vat_inclusive_before_discount":"","total_categories":[],"total_discount_percent":"","total_discount_vat_exclusive":"","total_discount_vat_inclusive":"","total_rounding_difference":"","total_to_pay":"","total_vat_amount":"","total_vat_amount_before_discount":"","total_vat_codes":[{"total_amount_vat_exclusive":"","total_amount_vat_inclusive":"","total_vat_amount":"","vat_code":""}],"total_vat_rates":[{"total_amount_vat_exclusive":"","total_amount_vat_inclusive":"","total_vat_amount":"","vat_rate":""}]},"customer_info":{"address1":"","balance":"","balance_base_currency":"","business_name":"","city":"","country_code":"","first_name":"","lang":"","last_name":"","member_fee":"","number":"","origin_row":"","origin_table":"","postal_code":""},"document_info":{"currency":"","date":"","decimals_amounts":"","description":"","doc_type":"","locale":"","number":"","origin_row":"","origin_table":"","printed":"","rounding_total":"","type":""},"items":[],"note":[],"parameters":{},"payment_info":{"date_expected":"","due_date":"","due_days":"","due_period":"","last_reminder":"","last_reminder_date":"","payment_date":""},"shipping_info":{"different_shipping_address":""},"supplier_info":{"address1":"Address1","business_name":"Company","city":"City","country":"Country","country_code":"CH","email":"info@myweb","first_name":"Firstname","last_name":"Lastname","postal_code":"Zip","web":"http://www.myweb"},"template_parameters":{"footer_texts":[]},"transactions":[],"type":"invoice","version":"1.0"}';
  invoiceObj = JSON.parse(jsonInvoice);
  
  //Payable to
  invoiceObj.supplier_info.iban_number = banDoc.info("AccountingDataBase","IBAN");
  invoiceObj.supplier_info.business_name = banDoc.info("AccountingDataBase","Company");
  invoiceObj.supplier_info.first_name = banDoc.info("AccountingDataBase","Name");
  invoiceObj.supplier_info.last_name = banDoc.info("AccountingDataBase","FamilyName");
  invoiceObj.supplier_info.address1 = banDoc.info("AccountingDataBase","Address1");
  invoiceObj.supplier_info.postal_code = banDoc.info("AccountingDataBase","Zip");
  invoiceObj.supplier_info.city = banDoc.info("AccountingDataBase","City");
  invoiceObj.supplier_info.country_code = banDoc.info("AccountingDataBase","CountryCode");

  // //Not used address data
  // invoiceObj.supplier_info.courtesy = banDoc.info("AccountingDataBase","Courtesy");  
  // invoiceObj.supplier_info.address2 = banDoc.info("AccountingDataBase","Address2");
  // invoiceObj.supplier_info.state = banDoc.info("AccountingDataBase","State");
  // invoiceObj.supplier_info.country = banDoc.info("AccountingDataBase","Country");  
  // invoiceObj.supplier_info.web = banDoc.info("AccountingDataBase","Web");
  // invoiceObj.supplier_info.email = banDoc.info("AccountingDataBase","Email");
  // invoiceObj.supplier_info.phone = banDoc.info("AccountingDataBase","Phone");
  // invoiceObj.supplier_info.mobile = banDoc.info("AccountingDataBase","Mobile");
  // invoiceObj.supplier_info.fiscal_number = banDoc.info("AccountingDataBase","FiscalNumber");
  // invoiceObj.supplier_info.vat_number = banDoc.info("AccountingDataBase","VatNumber");
  
  //currency and amount
  var fileTypeGroup = banDoc.info("Base", "FileTypeGroup");
  var fileTypeNumber = banDoc.info("Base", "FileTypeNumber");
  var currency = banDoc.info("AccountingDataBase","BasicCurrency");
  if (fileTypeGroup === "400" && fileTypeNumber === "400" && !currency) {
    // For application "estimates-invoices" without currency we set as default currency "CHF"
    invoiceObj.document_info.currency = 'CHF';
  } else {
    invoiceObj.document_info.currency = currency;
  }
  invoiceObj.billing_info.total_to_pay = "";

  //Payable by
  invoiceObj.customer_info.business_name = "";
  invoiceObj.customer_info.first_name = "";
  invoiceObj.customer_info.last_name = "";
  invoiceObj.customer_info.address1 = "";
  invoiceObj.customer_info.postal_code = "";
  invoiceObj.customer_info.city = "";
  invoiceObj.customer_info.country_code = "";

  //customer and invoice numbers
  invoiceObj.customer_info.number = "";
  invoiceObj.document_info.number = "";

  //language
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
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana Experimental (" + requiredVersion + ").";
        } else {
          msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        }
        break;

      case "it":
        if (expmVersion) {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare a Banana Experimental (" + requiredVersion + ").";
        } else {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare alla versione " + requiredVersion + " o successiva.";
        }
        break;
      
      case "fr":
        if (expmVersion) {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour vers Banana Experimental (" + requiredVersion + ")";
        } else {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour à " + requiredVersion + " ou plus récente.";
        }
        break;
      
      case "de":
        if (expmVersion) {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Banana Experimental aktualisieren (" + requiredVersion + ").";
        } else {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Version " + requiredVersion + " oder neuer aktualisiern.";
        }
        break;
      
      case "nl":
        if (expmVersion) {
          msg = "Het script werkt niet met deze versie van Banana Accounting. Upgrade naar Banana Experimental (" + requiredVersion + ").";
        } else {
          msg = "Het script werkt niet met deze versie van Banana Accounting. Upgrade naar de versie " + requiredVersion + " of meer recent.";
        }
        break;
      
      case "zh":
        if (expmVersion) {
          msg = "脚本无法在此版本的Banana财务会计软件中运行。请更新至 Banana实验版本 (" + requiredVersion + ").";
        } else {
          msg = "脚本无法在此版本的Banana财务会计软件中运行。请更新至 " + requiredVersion + "版本或之后的版本。";
        }
        break;
      
      case "es":
        if (expmVersion) {
          msg = "Este script no se ejecuta con esta versión de Banana Accounting. Por favor, actualice a Banana Experimental (" + requiredVersion + ").";
        } else {
          msg = "Este script no se ejecuta con esta versión de Banana Contabilidad. Por favor, actualice a la versión " + requiredVersion + " o posterior.";
        }
        break;
      
      case "pt":
        if (expmVersion) {
          msg = "Este script não é executado com esta versão do Banana Accounting. Por favor, atualize para Banana Experimental (" + requiredVersion + ").";
        } else {
          msg = "Este script não é executado com esta versão do Banana Contabilidade. Por favor, atualize para a versão " + requiredVersion + " ou posterior.";
        }
        break;
      
      default:
        if (expmVersion) {
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana Experimental (" + requiredVersion + ").";
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



function convertParam(userParam) {

  //language
  var lang = 'en';
  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }

  //parameters
  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];

  // Notes top page
  var currentParam = {};
  currentParam.name = 'print_msg_text';
  currentParam.title = '';
  if (lang === 'it') {
    currentParam.title = 'Note a inizio pagina';
  } else if (lang === 'fr') {
    currentParam.title = 'Notes en haut de la page';
  } else if (lang === 'de') {
    currentParam.title = 'Anmerkungen am Anfang der Seite';
  } else {
    currentParam.title = 'Notes at the top of the page';
  }
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.print_msg_text ? userParam.print_msg_text : '';
  currentParam.defaultvalue = 'The QR payment part without address and amount is at the bottom of the page.';
  currentParam.readValue = function() {
    userParam.print_msg_text = this.value;
  }
  convertedParam.data.push(currentParam);

  // Print separating border
  currentParam = {};
  currentParam.name = 'print_separating_border';
  currentParam.title = '';
  if (lang === 'it') {
    currentParam.title = 'Stampa bordo di separazione';
  } else if (lang === 'fr') {
    currentParam.title = 'Impression de la bordure de séparation';
  } else if (lang === 'de') {
    currentParam.title = 'Trennlinie drucken';
  } else {
    currentParam.title = 'Print separating border';
  }
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
  currentParam.title = '';
  if (lang === 'it') {
    currentParam.title = 'Stampa simbolo forbici';
  } else if (lang === 'fr') {
    currentParam.title = 'Imprimer le symbole des ciseaux';
  } else if (lang === 'de') {
    currentParam.title = 'Scherensymbol drucken';
  } else {
    currentParam.title = 'Print scissors symbol';
  }
  currentParam.type = 'bool';
  currentParam.value = userParam.print_scissors_symbol ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.print_scissors_symbol = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

function initUserParam() {

  var userParam = {};
  userParam.print_msg_text = 'The QR payment part without address and amount is at the bottom of the page.';
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
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

/* Save the period for the next time the script is run */
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