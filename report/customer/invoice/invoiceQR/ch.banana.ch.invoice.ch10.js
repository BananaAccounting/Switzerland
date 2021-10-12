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
// @id = ch.banana.ch.invoice.ch10
// @api = 1.0
// @pubdate = 2021-10-12
// @publisher = Banana.ch SA
// @description = [CH10] Layout with Swiss QR Code
// @description.it = [CH10] Layout with Swiss QR Code
// @description.de = [CH10] Layout with Swiss QR Code
// @description.fr = [CH10] Layout with Swiss QR Code
// @description.en = [CH10] Layout with Swiss QR Code
// @doctype = *
// @task = report.customer.invoice
// @includejs = swissqrcode.js
// @includejs = checkfunctions.js



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
// SETTINGS DIALOG FUNCTIONS USED TO SET, INITIALIZE AND VERIFY ALL
// THE PARAMETERS OF THE SETTINGS DIALOG
//====================================================================//
function settingsDialog() {

  /*
    Update script's parameters
  */

  // Verify the banana version when user clicks on settings buttons
  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
  if (isCurrentBananaVersionSupported) {

    isIntegratedInvoice();

    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
    }
    userParam = verifyParam(userParam);
    if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
      var dialogTitle = 'Settings';
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
        return;
      }
      for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        if (!convertedParam.data[i].language) {
          convertedParam.data[i].readValue();
        }
        else {
          // For param with property "language" pass this language as parameter
          convertedParam.data[i].readValueLang(convertedParam.data[i].language);
        }
      }
    }
    var paramToString = JSON.stringify(userParam);
    var value = Banana.document.setScriptSettings(paramToString);
  }
}

function convertParam(userParam) {

  /*
    Create the parameters of the settings dialog
  */

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setInvoiceTexts(lang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  /* array of script's parameters */
  convertedParam.data = [];

  var lengthDetailsColumns = "";
  var lengthDetailsTexts = "";

  /*******************************************************************************************
  * INCLUDE
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'include';
  currentParam.title = texts.param_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_header_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.header_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_print';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_print;
  currentParam.type = 'bool';
  currentParam.value = userParam.header_print ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_header_print;
  currentParam.readValue = function() {
    userParam.header_print = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_1';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_row_1;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_1 ? userParam.header_row_1 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_1;
  currentParam.readValue = function() {
    userParam.header_row_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_2';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_row_2;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_2 ? userParam.header_row_2 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_2;
  currentParam.readValue = function() {
    userParam.header_row_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_3';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_row_3;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_3 ? userParam.header_row_3 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_3;
  currentParam.readValue = function() {
    userParam.header_row_3 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_4';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_row_4;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_4 ? userParam.header_row_4 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_4;
  currentParam.readValue = function() {
    userParam.header_row_4 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_5';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_header_row_5;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_5 ? userParam.header_row_5 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_5;
  currentParam.readValue = function() {
    userParam.header_row_5 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_print';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_logo_print;
  currentParam.type = 'bool';
  currentParam.value = userParam.logo_print ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_logo_print;
  currentParam.readValue = function() {
    userParam.logo_print = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_name';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.param_logo_name;
  currentParam.type = 'string';
  currentParam.value = userParam.logo_name ? userParam.logo_name : '';
  currentParam.defaultvalue = "Logo";
  currentParam.tooltip = texts.param_tooltip_logo_name;
  currentParam.readValue = function() {
    userParam.logo_name = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_address_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.address_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_small_line';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_address_small_line;
  currentParam.type = 'string';
  currentParam.value = userParam.address_small_line ? userParam.address_small_line : '';
  currentParam.defaultvalue = '<none>';
  currentParam.tooltip = texts.param_tooltip_address_small_line;
  currentParam.readValue = function() {
   userParam.address_small_line = this.value;
  }
  convertedParam.data.push(currentParam);
  
  currentParam = {};
  currentParam.name = 'address_composition';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_address_composition;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.address_composition ? userParam.address_composition : '';
  currentParam.defaultvalue = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  currentParam.tooltip = texts.param_tooltip_address_composition;
  currentParam.readValue = function() {
    userParam.address_composition = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_left';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_address_left;
  currentParam.type = 'bool';
  currentParam.value = userParam.address_left ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_address_left;
  currentParam.readValue = function() {
   userParam.address_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_position_dX';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_address_position_dX;
  currentParam.type = 'number';
  currentParam.value = userParam.address_position_dX ? userParam.address_position_dX : '0';
  currentParam.defaultvalue = '0';
  currentParam.readValue = function() {
    userParam.address_position_dX = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_position_dY';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_address_position_dY;
  currentParam.type = 'number';
  currentParam.value = userParam.address_position_dY ? userParam.address_position_dY : '0';
  currentParam.defaultvalue = '0';
  currentParam.readValue = function() {
    userParam.address_position_dY = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'shipping_address';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.param_shipping_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.shipping_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_shipping_address;
  currentParam.readValue = function() {
    userParam.shipping_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_info_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.info_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_invoice_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_invoice_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_invoice_number ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_invoice_number;
  currentParam.readValue = function() {
    userParam.info_invoice_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_date;
  currentParam.readValue = function() {
    userParam.info_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_order_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_order_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_order_number ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_order_number;
  currentParam.readValue = function() {
    userParam.info_order_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_order_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_order_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_order_date ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_order_date;
  currentParam.readValue = function() {
    userParam.info_order_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_customer;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_customer;
  currentParam.readValue = function() {
    userParam.info_customer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_vat_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_customer_vat_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_vat_number ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_customer_vat_number;
  currentParam.readValue = function() {
    userParam.info_customer_vat_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_fiscal_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_customer_fiscal_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_fiscal_number ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_customer_fiscal_number;
  currentParam.readValue = function() {
    userParam.info_customer_fiscal_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_due_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_due_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_due_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_due_date;
  currentParam.readValue = function() {
    userParam.info_due_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_page';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.param_info_page;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_page ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_page;
  currentParam.readValue = function() {
    userParam.info_page = this.value;
  }
  convertedParam.data.push(currentParam);


  currentParam = {};
  currentParam.name = 'details_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_details_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.details_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.param_details_columns;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns ? userParam.details_columns : '';
  currentParam.defaultvalue = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  currentParam.tooltip = texts.param_tooltip_details_columns;
  //take the number of columns
  lengthDetailsColumns = userParam.details_columns.split(";").length;
  currentParam.readValue = function() {
    userParam.details_columns = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_widths';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.param_details_columns_widths;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_widths ? userParam.details_columns_widths : '';
  currentParam.defaultvalue = '45%;10%;10%;20%;15%';
  currentParam.tooltip = texts.param_tooltip_details_columns_widths;
  currentParam.readValue = function() {
    userParam.details_columns_widths = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_titles_alignment';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.param_details_columns_titles_alignment;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_titles_alignment ? userParam.details_columns_titles_alignment : '';
  currentParam.defaultvalue = 'left;center;center;right;right';
  currentParam.tooltip = texts.param_tooltip_details_columns_titles_alignment;
  currentParam.readValue = function() {
    userParam.details_columns_titles_alignment = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_alignment';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.param_details_columns_alignment;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_alignment ? userParam.details_columns_alignment : '';
  currentParam.defaultvalue = 'left;right;center;right;right';
  currentParam.tooltip = texts.param_tooltip_details_columns_alignment;
  currentParam.readValue = function() {
    userParam.details_columns_alignment = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_gross_amounts';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.param_details_gross_amounts;
  currentParam.type = 'bool';
  currentParam.value = userParam.details_gross_amounts ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_details_gross_amounts;
  currentParam.readValue = function() {
   userParam.details_gross_amounts = this.value;
  }
  convertedParam.data.push(currentParam);

  if (IS_INTEGRATED_INVOICE) {
    currentParam = {};
    currentParam.name = 'details_additional_descriptions';
    currentParam.parentObject = 'details_include';
    currentParam.title = texts.param_details_additional_descriptions;
    currentParam.type = 'bool';
    currentParam.value = userParam.details_additional_descriptions ? true : false;
    currentParam.defaultvalue = false;
    currentParam.tooltip = texts.param_tooltip_details_additional_descriptions;
    currentParam.readValue = function() {
     userParam.details_additional_descriptions = this.value;
    }
    convertedParam.data.push(currentParam);
  } else {
    userParam.details_additional_descriptions = false;
  }

  currentParam = {};
  currentParam.name = 'footer_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_footer_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.footer_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_add';
  currentParam.parentObject = 'footer_include';
  currentParam.title = texts.param_footer_add;
  currentParam.type = 'bool';
  currentParam.value = userParam.footer_add ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_footer_add;
  currentParam.readValue = function() {
   userParam.footer_add = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_horizontal_line';
  currentParam.parentObject = 'footer_include';
  currentParam.title = texts.param_footer_horizontal_line;
  currentParam.type = 'bool';
  currentParam.value = userParam.footer_horizontal_line ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_footer_horizontal_line;
  currentParam.readValue = function() {
   userParam.footer_horizontal_line = this.value;
  }
  convertedParam.data.push(currentParam);


  /*******************************************************************************************
  * QR Code
  ********************************************************************************************/
  var qrBill = new QRBill();
  qrBill.convertParamQR(convertedParam, userParam, texts);
  

  /*******************************************************************************************
  * TEXTS
  ********************************************************************************************/
  
  currentParam = {};
  currentParam.name = 'texts';
  currentParam.title = texts.param_texts;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.texts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'languages';
  currentParam.parentObject = 'texts';
  currentParam.title = texts.param_languages;
  currentParam.type = 'string';
  currentParam.value = userParam.languages ? userParam.languages : '';
  currentParam.defaultvalue = 'de;en;fr;it';
  currentParam.tooltip = texts.param_tooltip_languages;
  currentParam.readValue = function() {

    this.value = this.value.replace(/^\;|\;$/g,''); //removes ";" at the beginning/end of the string (i.e. ";de;en;it;" => "de;en;it")    
    var before = userParam.languages; //languages before remove
    userParam.languages = this.value;
    var after = userParam.languages; //languages after remove
    if (before.length > after.length) { //one or more languages has been removed, ask to user to confirm
      var res = arrayDifferences(before,after);
      var answer = Banana.Ui.showQuestion("", texts.languages_remove.replace(/<removedLanguages>/g,res));
      if (!answer) {
        userParam.languages = before;
      }
    }
  }
  convertedParam.data.push(currentParam);


  // Parameters for each language
  langCodes = userParam.languages.toString().split(";");

  // removes the current lang from the position it is in, and then readds in front
  // the current document language is always on top
  if (langCodes.includes(lang)) {
    langCodes.splice(langCodes.indexOf(lang),1);
    langCodes.unshift(lang);
  } else { // the language of the document is not included in languages parameter, so english is used
    lang = 'en';
    langCodes.splice(langCodes.indexOf('en'),1);
    langCodes.unshift('en');
  }

  for (var i = 0; i < langCodes.length; i++) {
    var langCode = langCodes[i];
    if (langCode === "it" || langCode === "fr" || langCode === "de" || langCode === "en") {
      var langCodeTitle = langCode;
      var langTexts = setInvoiceTexts(langCode);
    }
    else {
      var langCodeTitle = 'en';
      var langTexts = setInvoiceTexts('en');
    }

    currentParam = {};
    currentParam.name = langCode;
    currentParam.parentObject = 'texts';
    currentParam.title = langCode;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    //Collapse when the language is not the same of the document language
    if (langCode === lang) {
      currentParam.collapse = false;
    } else {
      currentParam.collapse = true;
    }
    currentParam.readValue = function() {
      userParam['text_language_code'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_invoice_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_invoice_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_invoice_number'] ? userParam[langCode+'_text_info_invoice_number'] : '';
    currentParam.defaultvalue = langTexts.invoice;
    currentParam.tooltip = langTexts['param_tooltip_text_info_invoice_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_invoice_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_date'] ? userParam[langCode+'_text_info_date'] : '';
    currentParam.defaultvalue = langTexts.date;
    currentParam.tooltip = langTexts['param_tooltip_text_info_date'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_date'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_order_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_order_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_order_number'] ? userParam[langCode+'_text_info_order_number'] : '';
    currentParam.defaultvalue = langTexts.order_number;
    currentParam.tooltip = langTexts['param_tooltip_text_info_order_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_order_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_order_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_order_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_order_date'] ? userParam[langCode+'_text_info_order_date'] : '';
    currentParam.defaultvalue = langTexts.order_date;
    currentParam.tooltip = langTexts['param_tooltip_text_info_order_date'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_order_date'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_customer';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer'] ? userParam[langCode+'_text_info_customer'] : '';
    currentParam.defaultvalue = langTexts.customer;
    currentParam.tooltip = langTexts['param_tooltip_text_info_customer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_customer_vat_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer_vat_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer_vat_number'] ? userParam[langCode+'_text_info_customer_vat_number'] : '';
    currentParam.defaultvalue = langTexts.vat_number;
    currentParam.tooltip = langTexts['param_tooltip_text_info_customer_vat_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer_vat_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_customer_fiscal_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer_fiscal_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer_fiscal_number'] ? userParam[langCode+'_text_info_customer_fiscal_number'] : '';
    currentParam.defaultvalue = langTexts.fiscal_number;
    currentParam.tooltip = langTexts['param_tooltip_text_info_customer_fiscal_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer_fiscal_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_due_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_due_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_due_date'] ? userParam[langCode+'_text_info_due_date'] : '';
    currentParam.defaultvalue = langTexts.payment_terms_label;
    currentParam.tooltip = langTexts['param_tooltip_text_payment_terms_label'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_due_date'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_page';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_page'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_page'] ? userParam[langCode+'_text_info_page'] : '';
    currentParam.defaultvalue = langTexts.page;
    currentParam.tooltip = langTexts['param_tooltip_text_info_page'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_page'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_shipping_address';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_shipping_address'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_shipping_address'] ? userParam[langCode+'_text_shipping_address'] : '';
    currentParam.defaultvalue = langTexts.shipping_address;
    currentParam.tooltip = langTexts['param_tooltip_text_shipping_address'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_shipping_address'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_doctype_10';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_10'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_doctype_10'] ? userParam[langCode+'_title_doctype_10'] : '';
    currentParam.defaultvalue = langTexts.invoice + " <DocInvoice>";
    currentParam.tooltip = langTexts['param_tooltip_title_doctype_10'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_doctype_10'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_doctype_12';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_12'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_doctype_12'] ? userParam[langCode+'_title_doctype_12'] : '';
    currentParam.defaultvalue = langTexts.credit_note  + " <DocInvoice>";
    currentParam.tooltip = langTexts['param_tooltip_title_doctype_12'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_doctype_12'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin'] ? userParam[langCode+'_text_begin'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_details_columns';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_details_columns'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_details_columns'] ? userParam[langCode+'_text_details_columns'] : '';
    currentParam.defaultvalue = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    currentParam.tooltip = langTexts['param_tooltip_text_details_columns'];
    currentParam.language = langCode;    
    //take the number of titles
    lengthDetailsTexts = userParam[langCode+'_text_details_columns'].split(";").length;
    if (lengthDetailsColumns != lengthDetailsTexts) {
      currentParam.errorMsg = "@error "+langTexts[langCodeTitle+'_error1_msg'];
    }

    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_details_columns'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_total';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_total'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_total'] ? userParam[langCode+'_text_total'] : '';
    currentParam.defaultvalue = langTexts.total;
    currentParam.tooltip = langTexts['param_tooltip_text_total'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_total'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_final'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final'] ? userParam[langCode+'_text_final'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_footer_left';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_left'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_left'] ? userParam[langCode+'_footer_left'] : '';
    currentParam.defaultvalue = langTexts.invoice;
    currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_left'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_footer_center';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_center'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_center'] ? userParam[langCode+'_footer_center'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_center'] = this.value;
    }
    convertedParam.data.push(currentParam); 

    currentParam = {};
    currentParam.name = langCode+'_footer_right';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_right'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_right'] ? userParam[langCode+'_footer_right'] : '';
    currentParam.defaultvalue = langTexts.page+' <'+langTexts.page+'>'
    currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_right'] = this.value;
    }
    convertedParam.data.push(currentParam);
  

    /*******************************************************************************************
    * ESTIMATE PARAMETERS
    ********************************************************************************************/
    var currentParam = {};
    currentParam.name = langCode+'_offer';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts.offer;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_offer_number';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_offer_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_offer_number'] ? userParam[langCode+'_text_info_offer_number'] : '';
    currentParam.defaultvalue = langTexts.offer;
    currentParam.tooltip = langTexts['param_tooltip_text_info_offer_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_info_offer_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_date_offer';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_date_offer'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_date_offer'] ? userParam[langCode+'_text_info_date_offer'] : '';
    currentParam.defaultvalue = langTexts.date;
    currentParam.tooltip = langTexts['param_tooltip_text_info_date_offer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_info_date_offer'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_validity_date_offer';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_validity_date_offer'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_validity_date_offer'] ? userParam[langCode+'_text_info_validity_date_offer'] : '';
    currentParam.defaultvalue = langTexts.validity_terms_label;
    currentParam.tooltip = langTexts['param_tooltip_text_info_validity_date_offer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_info_validity_date_offer'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_doctype_17';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_17'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_doctype_17'] ? userParam[langCode+'_title_doctype_17'] : '';
    currentParam.defaultvalue = langTexts.offer  + " <DocInvoice>";
    currentParam.tooltip = langTexts['param_tooltip_title_doctype_17'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_title_doctype_17'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin_offer';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin_offer'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin_offer'] ? userParam[langCode+'_text_begin_offer'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin_offer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_begin_offer'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final_offer';
    currentParam.parentObject = langCode+'_offer';
    currentParam.title = langTexts[langCodeTitle+'_param_text_final_offer'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final_offer'] ? userParam[langCode+'_text_final_offer'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final_offer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_final_offer'] = this.value;
    }
    convertedParam.data.push(currentParam);

  }


  /*******************************************************************************************
  * STYLES
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'styles';
  currentParam.title = texts.param_styles;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.param_styles = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_family;
  currentParam.type = 'string';
  currentParam.value = userParam.font_family ? userParam.font_family : 'Helvetica';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.tooltip = texts.param_tooltip_font_family;
  currentParam.readValue = function() {
   userParam.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_size';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_size;
  currentParam.type = 'string';
  currentParam.value = userParam.font_size ? userParam.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.tooltip = texts.param_tooltip_font_size;
  currentParam.readValue = function() {
   userParam.font_size = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_color';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_text_color;
  currentParam.type = 'string';
  currentParam.value = userParam.text_color ? userParam.text_color : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.tooltip = texts.param_tooltip_text_color;
  currentParam.readValue = function() {
   userParam.text_color = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'background_color_details_header';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_background_color_details_header;
  currentParam.type = 'string';
  currentParam.value = userParam.background_color_details_header ? userParam.background_color_details_header : '#337AB7';
  currentParam.defaultvalue = '#337ab7';
  currentParam.tooltip = texts.param_tooltip_background_color_details_header;
  currentParam.readValue = function() {
   userParam.background_color_details_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_color_details_header';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_text_color_details_header;
  currentParam.type = 'string';
  currentParam.value = userParam.text_color_details_header ? userParam.text_color_details_header : '#FFFFFF';
  currentParam.defaultvalue = '#FFFFFF';
  currentParam.tooltip = texts.param_tooltip_text_color_details_header;
  currentParam.readValue = function() {
   userParam.text_color_details_header = this.value;
  }
  convertedParam.data.push(currentParam);

  /// rimuovere 
  currentParam = {};
  currentParam.name = 'background_color_alternate_lines';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_background_color_alternate_lines;
  currentParam.type = 'string';
  currentParam.value = userParam.background_color_alternate_lines ? userParam.background_color_alternate_lines : '#F0F8FF';
  currentParam.defaultvalue = '#F0F8FF';
  currentParam.tooltip = texts.param_tooltip_background_color_alternate_lines;
  currentParam.readValue = function() {
   userParam.background_color_alternate_lines = this.value;
  }
  convertedParam.data.push(currentParam);


  /*******************************************************************************************
  * EMBEDDED JAVASCRIPT FILEE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'embedded_javascript';
  currentParam.title = texts.param_embedded_javascript;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.embedded_javascript = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'embedded_javascript_filename';
  currentParam.parentObject = 'embedded_javascript';
  currentParam.title = texts.param_embedded_javascript_filename;
  currentParam.type = 'string';
  currentParam.value = userParam.embedded_javascript_filename ? userParam.embedded_javascript_filename : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_javascript_filename;
  currentParam.readValue = function() {
   userParam.embedded_javascript_filename = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'embedded_css_filename';
  currentParam.parentObject = 'embedded_javascript';
  currentParam.title = texts.param_embedded_css_filename;
  currentParam.type = 'string';
  currentParam.value = userParam.embedded_css_filename ? userParam.embedded_css_filename : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_javascript_filename;
  currentParam.readValue = function() {
   userParam.embedded_css_filename = this.value;
  }
  convertedParam.data.push(currentParam);


  return convertedParam;
}

function initParam() {

  /*
    Initialize the user parameters of the settings dialog
  */

  var userParam = {};

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setInvoiceTexts(lang);

  //Include
  userParam.header_print = true;
  userParam.header_row_1 = "";
  userParam.header_row_2 = "";
  userParam.header_row_3 = "";
  userParam.header_row_4 = "";
  userParam.header_row_5 = "";
  userParam.logo_print = false;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = '<none>';
  userParam.address_left = false;
  userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  userParam.address_position_dX = '0';
  userParam.address_position_dY = '0';
  userParam.shipping_address = false;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '45%;10%;10%;20%;15%';
  userParam.details_columns_titles_alignment = 'left;right;center;right;right';
  userParam.details_columns_alignment = 'left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.footer_add = false;
  userParam.footer_horizontal_line = true;


  //QR Code
  var qrBill = new QRBill();
  qrBill.initParamQR(userParam);


  //Texts
  userParam.languages = 'de;en;fr;it';
  var langCodes = userParam.languages.toString().split(";");

  // Initialize the parameter for each language
  for (var i = 0; i < langCodes.length; i++) {

    // Use texts translations
    if (langCodes[i] === "it" || langCodes[i] === "fr" || langCodes[i] === "de" || langCodes[i] === "en") {
      var langTexts = setInvoiceTexts(langCodes[i]);
    }
    else {
      var langTexts = setInvoiceTexts('en');
    }
    userParam[langCodes[i]+'_text_info_invoice_number'] = langTexts.invoice;
    userParam[langCodes[i]+'_text_info_date'] = langTexts.date;
    userParam[langCodes[i]+'_text_info_order_number'] = langTexts.order_number;
    userParam[langCodes[i]+'_text_info_order_date'] = langTexts.order_date;
    userParam[langCodes[i]+'_text_info_customer'] = langTexts.customer;
    userParam[langCodes[i]+'_text_info_customer_vat_number'] = langTexts.vat_number;
    userParam[langCodes[i]+'_text_info_customer_fiscal_number'] = langTexts.fiscal_number;
    userParam[langCodes[i]+'_text_info_due_date'] = langTexts.payment_terms_label;
    userParam[langCodes[i]+'_text_info_page'] = langTexts.page;
    userParam[langCodes[i]+'_text_shipping_address'] = langTexts.shipping_address;
    userParam[langCodes[i]+'_title_doctype_10'] = langTexts.invoice + " <DocInvoice>";
    userParam[langCodes[i]+'_title_doctype_12'] = langTexts.credit_note + " <DocInvoice>";
    userParam[langCodes[i]+'_text_begin'] = '';
    userParam[langCodes[i]+'_text_details_columns'] = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    userParam[langCodes[i]+'_text_total'] = langTexts.total;
    userParam[langCodes[i]+'_text_final'] = '';
    userParam[langCodes[i]+'_footer_left'] = langTexts.invoice;
    userParam[langCodes[i]+'_footer_center'] = '';
    userParam[langCodes[i]+'_footer_right'] = langTexts.page+' <'+langTexts.page+'>';

    //Estimate parameters
    userParam[langCodes[i]+'_text_info_offer_number'] = langTexts.offer;
    userParam[langCodes[i]+'_text_info_date_offer'] = langTexts.date;
    userParam[langCodes[i]+'_text_info_validity_date_offer'] = langTexts.validity_terms_label;
    userParam[langCodes[i]+'_title_doctype_17'] = langTexts.offer + " <DocInvoice>";
    userParam[langCodes[i]+'_text_begin_offer'] = '';
    userParam[langCodes[i]+'_text_final_offer'] = '';

  }

  //Styles
  userParam.text_color = '#000000';
  userParam.background_color_details_header = '#337AB7';
  userParam.text_color_details_header = '#FFFFFF';
  userParam.background_color_alternate_lines = '#F0F8FF';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

  //Embedded JavaScript/css file
  userParam.embedded_javascript_filename = '';
  userParam.embedded_css_filename = '';

  return userParam;
}

function verifyParam(userParam) {

  /*
    Verify the user parameters of the settings dialog
  */

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setInvoiceTexts(lang);

  //Include
  if (!userParam.header_print) {
    userParam.header_print = false;
  }
  if(!userParam.header_row_1) {
    userParam.header_row_1 = '';
  }
  if(!userParam.header_row_2) {
    userParam.header_row_2 = '';
  }
  if(!userParam.header_row_3) {
    userParam.header_row_3 = '';
  }
  if(!userParam.header_row_4) {
    userParam.header_row_4 = '';
  }
  if(!userParam.header_row_5) {
    userParam.header_row_5 = '';
  }
  if (!userParam.logo_print) {
    userParam.logo_print = false;
  }
  if (!userParam.logo_name) {
    userParam.logo_name = 'Logo';
  }
  if (!userParam.address_small_line) {
    userParam.address_small_line = '';
  }
  if (!userParam.address_left) {
    userParam.address_left = false;
  }
  if (!userParam.address_composition) {
    userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  }
  if (!userParam.address_position_dX) {
    userParam.address_position_dX = '0';
  }
  if (!userParam.address_position_dY) {
    userParam.address_position_dY = '0';
  }
  if (!userParam.shipping_address) {
    userParam.shipping_address = false;
  }
  if (!userParam.info_invoice_number) {
    userParam.info_invoice_number = false;
  }
  if (!userParam.info_date) {
    userParam.info_date = false;
  }
  if (!userParam.info_order_number) {
    userParam.info_order_number = false;
  }
  if (!userParam.info_order_date) {
    userParam.info_order_date = false;
  }
  if (!userParam.info_customer) {
    userParam.info_customer = false;
  }
  if (!userParam.info_customer_vat_number) {
    userParam.info_customer_vat_number = false;
  }
  if (!userParam.info_customer_fiscal_number) {
    userParam.info_customer_fiscal_number = false;
  }
  if (!userParam.info_due_date) {
    userParam.info_due_date = false;
  }
  if (!userParam.info_page) {
    userParam.info_page = false;
  }
  if (!userParam.details_columns) {
    userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  }
  if (!userParam.details_columns_widths) {
    userParam.details_columns_widths = '45%;10%;10%;20%;15%';
  }
  if (!userParam.details_columns_titles_alignment) {
    userParam.details_columns_titles_alignment = 'left;right;center;right;right';
  }
  if (!userParam.details_columns_alignment) {
    userParam.details_columns_alignment = 'left;right;center;right;right';
  }
  if (!userParam.details_gross_amounts) {
    userParam.details_gross_amounts = false;
  }
  if (!userParam.details_additional_descriptions) {
    userParam.details_additional_descriptions = false;
  }
  if (!userParam.footer_add) {
    userParam.footer_add = false;
  }
  if (!userParam.footer_horizontal_line) {
    userParam.footer_horizontal_line = false;
  }


  //QR Code
  var qrBill = new QRBill();
  qrBill.verifyParamQR(userParam);



  //Texts
  if (!userParam.languages) {
    userParam.languages = 'de;en;fr;it';
  }

  // Verify the parameter for each language
  var langCodes = userParam.languages.toString().split(";");
  for (var i = 0; i < langCodes.length; i++) {
    var langTexts = setInvoiceTexts(langCodes[i]);
        
    if (!userParam[langCodes[i]+'_text_info_invoice_number']) {
      userParam[langCodes[i]+'_text_info_invoice_number'] = langTexts.invoice;
    }
    if (!userParam[langCodes[i]+'_text_info_date']) {
      userParam[langCodes[i]+'_text_info_date'] = langTexts.date;
    }
    if (!userParam[langCodes[i]+'_text_info_order_number']) {
      userParam[langCodes[i]+'_text_info_order_number'] = langTexts.order_number;
    }
    if (!userParam[langCodes[i]+'_text_info_order_date']) {
      userParam[langCodes[i]+'_text_info_order_date'] = langTexts.order_date;
    }
    if (!userParam[langCodes[i]+'_text_info_customer']) {
      userParam[langCodes[i]+'_text_info_customer'] = langTexts.customer;
    }
    if (!userParam[langCodes[i]+'_text_info_customer_vat_number']) {
      userParam[langCodes[i]+'_text_info_customer_vat_number'] = langTexts.vat_number;
    }
    if (!userParam[langCodes[i]+'_text_info_customer_fiscal_number']) {
      userParam[langCodes[i]+'_text_info_customer_fiscal_number'] = langTexts.fiscal_number;
    }
    if (!userParam[langCodes[i]+'_text_info_due_date']) {
      userParam[langCodes[i]+'_text_info_due_date'] = langTexts.payment_terms_label;
    }
    if (!userParam[langCodes[i]+'_text_info_page']) {
      userParam[langCodes[i]+'_text_info_page'] = langTexts.page;
    }
    if (!userParam[langCodes[i]+'_text_shipping_address']) {
      userParam[langCodes[i]+'_text_shipping_address'] = langTexts.shipping_address;
    }
    if (!userParam[langCodes[i]+'_title_doctype_10']) {
      userParam[langCodes[i]+'_title_doctype_10'] = langTexts.invoice + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_title_doctype_12']) {
      userParam[langCodes[i]+'_title_doctype_12'] = langTexts.credit_note + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_text_begin']) {
      userParam[langCodes[i]+'_text_begin'] = "";
    }
    if (!userParam[langCodes[i]+'_text_details_columns']) {
      userParam[langCodes[i]+'_text_details_columns'] = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    }
    if (!userParam[langCodes[i]+'_text_total']) {
      userParam[langCodes[i]+'_text_total'] = langTexts.total;
    }
    if (!userParam[langCodes[i]+'_text_final']) {
      userParam[langCodes[i]+'_text_final'] = "";
    }
    if (!userParam[langCodes[i]+'_footer_left']) {
      userParam[langCodes[i]+'_footer_left'] = langTexts.invoice;
    }
    if (!userParam[langCodes[i]+'_footer_center']) {
      userParam[langCodes[i]+'_footer_center'] = '';
    }
    if (!userParam[langCodes[i]+'_footer_right']) {
      userParam[langCodes[i]+'_footer_right'] = langTexts.page+' <'+langTexts.page+'>';
    }

    //Estimate parameters
    if (!userParam[langCodes[i]+'_text_info_offer_number']) {
      userParam[langCodes[i]+'_text_info_offer_number'] = langTexts.offer;
    }
    if (!userParam[langCodes[i]+'_text_info_date_offer']) {
      userParam[langCodes[i]+'_text_info_date_offer'] = langTexts.date;
    }
    if (!userParam[langCodes[i]+'_text_info_validity_date_offer']) {
      userParam[langCodes[i]+'_text_info_validity_date_offer'] = langTexts.validity_terms_label;
    }
    if (!userParam[langCodes[i]+'_title_doctype_17']) {
      userParam[langCodes[i]+'_title_doctype_17'] = langTexts.offer + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_text_begin_offer']) {
      userParam[langCodes[i]+'_text_begin_offer'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_offer']) {
      userParam[langCodes[i]+'_text_final_offer'] = "";
    }
  }


  // Styles
  if (!userParam.text_color) {
    userParam.text_color = '#000000';
  }
  if (!userParam.background_color_details_header) {
    userParam.background_color_details_header = '#337AB7';
  }
  if (!userParam.text_color_details_header) {
    userParam.text_color_details_header = '#FFFFFF';
  }
  if (!userParam.background_color_alternate_lines) {
    userParam.background_color_alternate_lines = '#F0F8FF';
  }
  if (!userParam.font_family) {
    userParam.font_family = 'Helvetica';
  }
  if (!userParam.font_size) {
    userParam.font_size = '10';
  }

  //Embedded JavaScript files
  if (!userParam.embedded_javascript_filename) {
    userParam.embedded_javascript_filename = '';
  }
  if (!userParam.embedded_css_filename) {
    userParam.embedded_css_filename = '';
  }

  return userParam;
}



//====================================================================//
// MAIN FUNCTIONS THAT PRINT THE INVOICE
//====================================================================//
function printDocument(jsonInvoice, repDocObj, repStyleObj) {

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
    repDocObj = printInvoice(Banana.document, repDocObj, texts, userParam, repStyleObj, invoiceObj, variables);
    
    // Load the predefined invoice.css styles and the embedded css file entered by the user
    set_css_style(Banana.document, repStyleObj, variables, userParam);

  }
}

function printInvoice(banDoc, repDocObj, texts, userParam, repStyleObj, invoiceObj, variables) {

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


  /* PRINT HEADER */
  if (BAN_ADVANCED && typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj, userParam, repStyleObj, invoiceObj, texts);
  } else {
    print_header(repDocObj, userParam, repStyleObj, invoiceObj, texts);
  }

  /* PRINT INVOICE INFO FIRST PAGE */
  if (BAN_ADVANCED && typeof(hook_print_info_first_page) === typeof(Function)) {
    hook_print_info_first_page(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_info_first_page(repDocObj, invoiceObj, texts, userParam);
  }

  /* PRINT INVOICE INFO PAGES 2+ */
  if (BAN_ADVANCED && typeof(hook_print_info_other_pages) === typeof(Function)) {
    hook_print_info_other_pages(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_info_other_pages(repDocObj, invoiceObj, texts, userParam);
  }

  /* PRINT CUSTOMER ADDRESS */
  if (BAN_ADVANCED && typeof(hook_print_customer_address) === typeof(Function)) {
    hook_print_customer_address(repDocObj, invoiceObj, userParam);
  } else {
    print_customer_address(repDocObj, invoiceObj, userParam);
  }

  /* PRINT SHIPPING ADDRESS */
  if (userParam.shipping_address) {
    if (BAN_ADVANCED && typeof(hook_print_shipping_address) === typeof(Function)) {
      hook_print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* PRINT BEGIN TEXT (BEFORE INVOICE DETAILS) */
  var sectionClassBegin = repDocObj.addSection("section_class_begin");
  if (BAN_ADVANCED && typeof(hook_print_text_begin) === typeof(Function)) {
    hook_print_text_begin(sectionClassBegin, invoiceObj, texts, userParam);
  } else {
    print_text_begin(sectionClassBegin, invoiceObj, texts, userParam);
  }

  /* PRINT INVOICE DETAILS */
  var sectionClassDetails = repDocObj.addSection("section_class_details");
  var detailsTable = sectionClassDetails.addTable("doc_table");
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

  /* PRINT FINAL TEXTS (AFTER INVOICE DETAILS) */
  var sectionClassFinalTexts = repDocObj.addSection("section_class_final_texts");
  if (BAN_ADVANCED && typeof(hook_print_final_texts) === typeof(Function)) {
    hook_print_final_texts(sectionClassFinalTexts, invoiceObj, userParam);
  } else {
    print_final_texts(sectionClassFinalTexts, invoiceObj, userParam);
  }

  /* PRINT QR CODE */
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
    cell.addText(name + " - " + address + " - " + locality, "small_address");
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
  if (textBeginSettings) {
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

  var decimals = getQuantityDecimals(invoiceObj);
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
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoid to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        if (item.mesure_unit) {
          if (variables.decimals_quantity) {
            decimals = variables.decimals_quantity;
          }
          var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
          tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
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

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", columnsNumber);

  //DISCOUNT
  //used only for the "Application Invoice"
  //on normal invoices discounts are entered as items in transactions
  if (invoiceObj.billing_info.total_discount_vat_exclusive) {
    tableRow = repTableObj.addRow();
    let discountText = invoiceObj.billing_info.discount.description ?
      invoiceObj.billing_info.discount.description : texts.discount;
    if (invoiceObj.billing_info.discount.percent)
      discountText += " " + invoiceObj.billing_info.discount.percent + "%";
    tableRow.addCell(discountText, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_discount_vat_exclusive, variables.decimals_amounts, true), "right padding-left padding-right", 1);
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
  //Only used for the Application Invoice
  if (invoiceObj.billing_info.total_advance_payment) {
    tableRow = repTableObj.addRow();
    if (invoiceObj.billing_info.total_advance_payment_description) {
      tableRow.addCell(invoiceObj.billing_info.total_advance_payment_description, "padding-left padding-right", columnsNumber-1);
    } else {
      tableRow.addCell(texts.deposit, "padding-left padding-right", columnsNumber-1);
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(invoiceObj.billing_info.total_advance_payment), variables.decimals_amounts, true), "right padding-left padding-right", 1);
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
  
  // tableRow = repTableObj.addRow();
  // tableRow.addCell("", "", columnsNumber);
}

function print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Prints the invoice details using gross Amounts (VAT included)
  */
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

  var decimals = getQuantityDecimals(invoiceObj);
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
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoit to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        if (item.mesure_unit) {
          if (variables.decimals_quantity) {
            decimals = variables.decimals_quantity;
          }
          var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
          tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
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
  // Show message when using custom column with a non advanced version of Banana+
  if (customColumnMsg.length > 0) {
    banDoc.addMessage(customColumnMsg);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", columnsNumber);

  //SUBTOTAL
  //used only for the "Application Invoice"
  //Print subtotal if there is discount or rounding or deposit
  if (invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference 
    || invoiceObj.billing_info.total_advance_payment)
  ) {
    
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.subtotal, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_amount_vat_inclusive_before_discount, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DISCOUNT
  //used only for the "Application Invoice"
  //on normal invoices discounts are entered as items in transactions
  if (invoiceObj.billing_info.total_discount_vat_inclusive) {
    tableRow = repTableObj.addRow();
    let discountText = invoiceObj.billing_info.discount.description ?
      invoiceObj.billing_info.discount.description : texts.discount;
    if (invoiceObj.billing_info.discount.percent)
      discountText += " " + invoiceObj.billing_info.discount.percent + "%";
    tableRow.addCell(discountText, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_discount_vat_inclusive, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_rounding_difference, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DEPOSIT
  //Only used for the Application Invoice
  if (invoiceObj.billing_info.total_advance_payment) {
    tableRow = repTableObj.addRow();
    if (invoiceObj.billing_info.total_advance_payment_description) {
      tableRow.addCell(invoiceObj.billing_info.total_advance_payment_description, "padding-left padding-right", columnsNumber-1);
    } else {
      tableRow.addCell(texts.deposit, "padding-left padding-right", columnsNumber-1);
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(invoiceObj.billing_info.total_advance_payment), variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  tableRow = repTableObj.addRow();
  if (invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference 
    || invoiceObj.billing_info.total_advance_payment)
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
    var vatInfo = texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%";
    vatInfo += " = " + Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency;
    cellVatInfo.addParagraph(vatInfo);
  }
  
  // tableRow = repTableObj.addRow();
  // tableRow.addCell("", "", columnsNumber);
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
    }
    itemFormatted.value = Banana.Converter.toLocaleNumberFormat(value,decimal);
    itemFormatted.className = className;
  }
  else if (columnName === "unitprice" || columnName === "unit_price") {
    var decimal = variables.decimals_unit_price;
    if (!IS_INTEGRATED_INVOICE) {
      decimal = Math.max(2,getDecimalsCount(value));
    }
    itemFormatted.value = Banana.Converter.toLocaleNumberFormat(value, decimal, true);
    itemFormatted.className = className;
  }
  else if (columnName === "referenceunit" || columnName === "mesure_unit") {
    itemFormatted.value = value;
    itemFormatted.className = className;
  }
  else if (columnName === "amount" || columnName === "total_amount_vat_exclusive" || columnName === "total_amount_vat_inclusive") {
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
    itemFormatted.value = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(value));
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

  if (userParam.details_additional_descriptions) {

    if (IS_INTEGRATED_INVOICE) {

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
}

function columnNamesToValues(invoiceObj, text) {
  /*
    Function that replaces the xml column names of the customer address
    with the respective data
  */
  var docInvoice = invoiceObj.document_info.number;
  var courtesy = invoiceObj.customer_info.courtesy;
  var businessName = invoiceObj.customer_info.business_name;
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

function getQuantityDecimals(invoiceObj) {
  /*
    For the given invoice check the decimal used for the quantity.
    Decimals can be 2 or 4.
    Returns the greater value.
  */
  var arr = [];
  var decimals = "";
  for (var i = 0; i < invoiceObj.items.length; i++) { //check the qty of each item of the invoice
    var item = invoiceObj.items[i];
    var qty = item.quantity;
    var res = qty.split(".");
    if (res[1] && res[1].length == 4 && res[1] !== "0000" && res[1].substring(1,4) !== "000" && res[1].substring(2,4) !== "00") {
      decimals = 4;
    } else {
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

  // Integrated invoice, table Transactions, column name in settings dialog must start with "T."
  if (column.startsWith("T.") && IS_INTEGRATED_INVOICE) {
    var table = banDoc.table('Transactions');
    for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      if (tRow.rowNr.toString() === originRow.toString()) {      
        return tRow.value(column.substring(2)); //without "T."
      }
    }
  }
  // Estimates & Invoices application, table Items, column name in settings dialog must start with "I."
  else if (column.startsWith("I.") && !IS_INTEGRATED_INVOICE) {
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

function getInvoiceAddress(invoiceAddress, userParam) {
  // Invoice object values
  var courtesy = invoiceAddress.courtesy;
  var businessName = invoiceAddress.business_name;
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
  } else {
    address = address.replace(/<NamePrefix>/g,"<>");
  }

  if (address.indexOf("<OrganisationName>") > -1 && businessName) {
    address = address.replace(/<OrganisationName>/g, businessName.trim());
  } else {
    address = address.replace(/<OrganisationName>/g,"<>");
  }
  
  if (address.indexOf("<FirstName>") > -1 && firstName) {
    address = address.replace(/<FirstName>/g, firstName.trim());
  } else {
    address = address.replace(/<FirstName>/g,"<>");
  }
  
  if (address.indexOf("<FamilyName>") > -1 && lastName) {
    address = address.replace(/<FamilyName>/g, lastName.trim());
  } else {
    address = address.replace(/<FamilyName>/g,"<>");
  }
  
  if (address.indexOf("<Street>") > -1 && address1) {
    address = address.replace(/<Street>/g, address1.trim());
  } else {
    address = address.replace(/<Street>/g,"<>");
  }
  
  if (address.indexOf("<AddressExtra>") > -1 && address2) {
    address = address.replace(/<AddressExtra>/g, address2.trim());
  } else {
    address = address.replace(/<AddressExtra>/g,"<>");
  }
  
  if (address.indexOf("<POBox>") > -1 && address3) {
    address = address.replace(/<POBox>/g, address3.trim());
  } else {
    address = address.replace(/<POBox>/g,"<>");
  }
  
  if (address.indexOf("<PostalCode>") > -1 && postalCode) {
    address = address.replace(/<PostalCode>/g, postalCode.trim());
  } else {
    address = address.replace(/<PostalCode>/g,"<>");
  }
  
  if (address.indexOf("<Locality>") > -1 && city) {
    address = address.replace(/<Locality>/g, city.trim());
  } else {
    address = address.replace(/<Locality>/g,"<>");
  }
  
  if (address.indexOf("<Region>") > -1 && state) {
    address = address.replace(/<Region>/g, state.trim());
  } else {
    address = address.replace(/<Region>/g,"<>");
  }
  
  if (address.indexOf("<Country>") > -1 && country) {
    address = address.replace(/<Country>/g, country.trim());
  } else {
    address = address.replace(/<Country>/g,"<>");
  }
  
  if (address.indexOf("<CountryCode>") > -1 && countryCode) {
    address = address.replace(/<CountryCode>/g, countryCode.trim());
  } else {
    address = address.replace(/<CountryCode>/g,"<>");
  }

  address = address.replace(/ \n/g,"");
  address = address.replace(/<> /g,"");
  address = address.replace(/ <>/g,"");
  address = address.replace(/<>\n/g,"");
  address = address.replace(/<>/g,"");

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
// TEXTS
//====================================================================//
function setInvoiceTexts(language) {

  /*
    Defines all the texts translations for all the different languages.
  */

  var texts = {};

  //Set QRCode texts for the invoice settings parameters
  var qrBill = new QRBill();
  qrBill.setQrSettingsTexts(language, texts);
  
  if (language === 'it') {
    //IT
    texts.phone = "Tel";
    texts.shipping_address = "Indirizzo spedizione";
    texts.invoice = "Fattura";
    texts.date = "Data";
    texts.order_number = "No ordine";
    texts.order_date = "Data ordine";
    texts.customer = "No cliente";
    texts.vat_number = "No IVA";
    texts.fiscal_number = "No fiscale";
    texts.payment_due_date_label = "Scadenza";
    texts.payment_terms_label = "Scadenza";
    texts.page = "Pagina";
    texts.credit_note = "Nota di credito";
    texts.description = "Descrizione";
    texts.quantity = "Quantità";
    texts.reference_unit = "Unità";
    texts.unit_price = "Prezzo Unità";
    texts.amount = "Importo";
    texts.discount = "Sconto";
    texts.deposit = "Acconto";
    texts.totalnet = "Totale netto";
    texts.subtotal = "Sottototale";
    texts.vat = "IVA";
    texts.rounding = "Arrotondamento";
    texts.total = "TOTALE";
    texts.param_include = "Stampa";
    texts.param_header_include = "Intestazione";
    texts.param_header_print = "Intestazione pagina";
    texts.param_header_row_1 = "Testo riga 1";
    texts.param_header_row_2 = "Testo riga 2";
    texts.param_header_row_3 = "Testo riga 3";
    texts.param_header_row_4 = "Testo riga 4";
    texts.param_header_row_5 = "Testo riga 5";
    texts.param_logo_print = "Logo";
    texts.param_logo_name = "Composizione per allineamento logo e intestazione";
    texts.param_address_include = "Indirizzo cliente";
    texts.param_address_small_line = "Testo indirizzo mittente";
    texts.param_address_left = "Allinea a sinistra";
    texts.param_address_composition = "Composizione indirizzo";
    texts.param_address_position_dX = 'Sposta orizzontalmente +/- (in cm, default 0)';
    texts.param_address_position_dY = 'Sposta verticalmente +/- (in cm, default 0)';
    texts.param_shipping_address = "Indirizzo spedizione";
    texts.param_info_include = "Informazioni";
    texts.param_info_invoice_number = "Numero fattura";
    texts.param_info_date = "Data fattura";
    texts.param_info_order_number = "Numero ordine";
    texts.param_info_order_date = "Data ordine";
    texts.param_info_customer = "Numero cliente";
    texts.param_info_customer_vat_number = "Numero IVA cliente";
    texts.param_info_customer_fiscal_number = "Numero fiscale cliente";
    texts.param_info_due_date = "Scadenza fattura";
    texts.param_info_page = "Numero pagina";
    texts.param_details_include = "Dettagli fattura";
    texts.param_details_columns = "Nomi colonne";
    texts.param_details_columns_widths = "Larghezza colonne";
    texts.param_details_columns_titles_alignment = "Allineamento titoli";
    texts.param_details_columns_alignment = "Allineamento testi";
    texts.param_details_gross_amounts = "Importi lordi (IVA inclusa)";
    texts.param_details_additional_descriptions = "Stampa descrizioni supplementari";
    texts.param_footer_include = "Piè di pagina";
    texts.param_footer_add = "Stampa piè di pagina";
    texts.param_footer_horizontal_line = "Stampa bordo di separazione"
    texts.param_texts = "Testi (vuoto = valori predefiniti)";
    texts.param_languages = "Lingue";
    texts.languages_remove = "Desideri rimuovere '<removedLanguages>' dalla lista delle lingue?";
    texts.it_param_text_info_invoice_number = "Numero fattura";
    texts.it_param_text_info_date = "Data fattura";
    texts.it_param_text_info_order_number = "Numero ordine";
    texts.it_param_text_info_order_date = "Data ordine";
    texts.it_param_text_info_customer = "Numero cliente";
    texts.it_param_text_info_customer_vat_number = "Numero IVA cliente";
    texts.it_param_text_info_customer_fiscal_number = "Numero fiscale cliente";
    texts.it_param_text_info_due_date = "Scadenza fattura";
    texts.it_param_text_info_page = "Numero pagina";
    texts.it_param_text_shipping_address = "Indirizzo spedizione";
    texts.it_param_text_title_doctype_10 = "Titolo fattura";
    texts.it_param_text_title_doctype_12 = "Titolo nota di credito";
    texts.it_param_text_begin = "Testo iniziale";
    texts.it_param_text_details_columns = "Nomi colonne dettagli fattura";
    texts.it_param_text_total = "Totale fattura";
    texts.it_param_text_final = "Testo finale";
    texts.it_param_footer_left = "Piè di pagina testo sinistra";
    texts.it_param_footer_center = "Piè di pagina testo centro";
    texts.it_param_footer_right = "Piè di pagina testo destra";
    texts.param_styles = "Stili";
    texts.param_text_color = "Colore testo";
    texts.param_background_color_details_header = "Colore sfondo intestazione dettagli";
    texts.param_text_color_details_header = "Colore testo intestazione dettagli";
    texts.param_background_color_alternate_lines = "Colore sfondo per righe alternate";
    texts.param_font_family = "Tipo carattere";
    texts.param_font_size = "Dimensione carattere";
    texts.embedded_javascript_file_not_found = "File JavaScript non trovato o non valido";
    texts.param_embedded_javascript = "JavaScript / CSS";
    texts.param_embedded_javascript_filename = "Nome file JS (colonna 'ID' tabella Documenti)";
    texts.param_embedded_css_filename = "Nome file CSS (colonna 'ID' tabella Documenti)";
    texts.param_tooltip_header_print = "Vista per includere l'intestazione della pagina";
    texts.param_tooltip_logo_print = "Vista per includere il logo";
    texts.param_tooltip_logo_name = "Inserisci il nome del logo";
    texts.param_tooltip_info_invoice_number = "Vista per includere il numero della fattura";
    texts.param_tooltip_info_date = "Vista per includere la data della fattura";
    texts.param_tooltip_info_order_number = "Vista per includere il numero d'ordine";
    texts.param_tooltip_info_order_date = "Vista per includere la data dell'ordine";
    texts.param_tooltip_info_customer = "Vista per includere il numero del cliente";
    texts.param_tooltip_info_customer_vat_number = "Vista per includere il numero IVA del cliente";
    texts.param_tooltip_info_customer_fiscal_number = "Vista per includere il numero fiscale del cliente";
    texts.param_tooltip_info_due_date = "Vista per includere la data di scadenza della fattura";
    texts.param_tooltip_info_page = "Vista per includere il numero di pagina";
    texts.param_tooltip_languages = "Aggiungi o rimuovi una o più lingue";
    texts.param_tooltip_text_info_invoice_number = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_date = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_order_number = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_order_date = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_customer = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_customer_vat_number = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_customer_fiscal_number = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_payment_terms_label = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_page = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_shipping_address = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_title_doctype_10 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_title_doctype_12 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_total = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_details_columns = "Inserisci i nomi delle colonne dei dettagli della fattura";
    texts.param_tooltip_details_columns = "Inserisci i nomi XML delle colonne nell'ordine che preferisci";
    texts.param_tooltip_details_columns_widths = "Inserisci le larghezze delle colonne in % (la somma deve essere 100%)";
    texts.param_tooltip_details_columns_titles_alignment = "Allineamento titoli colonne";
    texts.param_tooltip_details_columns_alignment = "Allineamento testo colonne";
    texts.param_tooltip_header_row_1 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_2 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_3 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_4 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_5 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_address_small_line = "Inserisci l'indirizzo del mittente subito sopra all'indirizzo del cliente";
    texts.param_tooltip_address_composition = "Inserisci i nomi XML delle colonne nell'ordine che preferisci";
    texts.param_tooltip_shipping_address = "Vista per stampare l'indirizzo di spedizione";
    texts.param_tooltip_address_left = "Vista per allineare l'indirizzo del cliente a sinistra";
    texts.param_tooltip_text_begin = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_details_gross_amounts = "Vista per stampare i dettagli della fattura con gli importi al lordo e IVA inclusa";
    texts.param_tooltip_details_additional_descriptions = "Vista per stampare descrizioni supplementari";
    texts.param_tooltip_text_final = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_footer_add = "Vista stampare il piè di pagina";
    texts.param_tooltip_footer = "Inserisci il testo piè di pagina";
    texts.param_tooltip_footer_horizontal_line = "Stampa bordo di separazione";
    texts.param_tooltip_font_family = "Inserisci il tipo di carattere (ad es. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Inserisci la dimensione del carattere (ad es. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Inserisci il colore per il testo (ad es. '#000000' oppure 'Black')";
    texts.param_tooltip_background_color_details_header = "Inserisci il colore per lo sfondo dell'intestazione dei dettagli (ad es. '#337ab7' oppure 'Blue')";
    texts.param_tooltip_text_color_details_header = "Inserisci il colore per il testo dell'intestazione dei dettagli (ad es. '#ffffff' oppure 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Inserisci il colore per lo sfondo delle rige alternate (ad es. '#F0F8FF' oppure 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Inserisci il nome del file JavaScript (.js) della colonna 'ID' tabella Documenti (ad es. File.js)";
    texts.error1 = "I nomi delle colonne non corrispondono ai testi da stampare. Verificare impostazioni fattura.";
    texts.it_error1_msg = "Nomi testi e colonne non corrispondono";
    texts.offer = "Offerta";
    texts.it_param_text_info_offer_number = "Numero offerta";
    texts.param_tooltip_text_info_offer_number = "Inserisci un testo per sostituire quello predefinito";
    texts.it_param_text_info_date_offer = "Data offerta";
    texts.param_tooltip_text_info_date_offer = "Inserisci un testo per sostituire quello predefinito";
    texts.it_param_text_info_validity_date_offer = "Validità offerta";
    texts.validity_terms_label = "Validità";
    texts.param_tooltip_text_info_validity_date_offer = "Inserisci un testo per sostituire quello predefinito";
    texts.it_param_text_title_doctype_17 = "Titolo offerta";
    texts.param_tooltip_title_doctype_17 = "Inserisci un testo per sostituire quello predefinito";
    texts.it_param_text_begin_offer = "Testo iniziale offerta";
    texts.param_tooltip_text_begin_offer = "Inserisci un testo per sostituire quello predefinito";
    texts.it_param_text_final_offer = "Testo finale offerta";
    texts.param_tooltip_text_final_offer = "Inserisci un testo per sostituire quello predefinito";
  }
  else if (language === 'de') {
    // DE
    texts.phone = "Tel.";
    texts.shipping_address = "Lieferadresse";
    texts.invoice = "Rechnung";
    texts.date = "Datum";
    texts.order_number = "Bestellnummer";
    texts.order_date = "Bestelldatum";
    texts.customer = "Kundennummer";
    texts.vat_number = "MwSt/USt-Nummer";
    texts.fiscal_number = "Steuernummer";
    texts.payment_due_date_label = "Fälligkeitsdatum";
    texts.payment_terms_label = "Fälligkeitsdatum";
    texts.page = "Seite";
    texts.credit_note = "Gutschrift";
    texts.description = "Beschreibung";
    texts.quantity = "Menge";
    texts.reference_unit = "Einheit";
    texts.unit_price = "Preiseinheit";
    texts.amount = "Betrag";
    texts.discount = "Rabatt";
    texts.deposit = "Anzahlung";
    texts.totalnet = "Netto-Betrag";
    texts.subtotal = "Zwischentotal";
    texts.vat = "MwSt";
    texts.rounding = "Rundung";
    texts.total = "Gesamtbetrag";
    texts.param_include = "Drucken";
    texts.param_header_include = "Kopfzeile";
    texts.param_header_print = "Seitenkopf drucken";
    texts.param_header_row_1 = "Kopfzeilentext 1";
    texts.param_header_row_2 = "Kopfzeilentext 2";
    texts.param_header_row_3 = "Kopfzeilentext 3";
    texts.param_header_row_4 = "Kopfzeilentext 4";
    texts.param_header_row_5 = "Kopfzeilentext 5";
    texts.param_logo_print = "Logo";
    texts.param_logo_name = "Logo-Name";
    texts.param_address_include = "Kundenadresse";
    texts.param_address_small_line = "Absenderadresse";
    texts.param_address_left = "Adresse linksbündig";
    texts.param_address_composition = "Zusammensetzung der Adresse";
    texts.param_address_position_dX = 'Horizontal verschieben +/- (in cm, Voreinstellung 0)';
    texts.param_address_position_dY = 'Vertikal verschieben +/- (in cm, Voreinstellung 0)';
    texts.param_shipping_address = "Lieferadresse";
    texts.param_info_include = "Info";
    texts.param_info_invoice_number = "Rechnungsnummer";
    texts.param_info_date = "Rechnungsdatum";
    texts.param_info_order_number = "Bestellnummer";
    texts.param_info_order_date = "Bestelldatum";
    texts.param_info_customer = "Kundennummer";
    texts.param_info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
    texts.param_info_customer_fiscal_number = "Kunden-Steuernummer";
    texts.param_info_due_date = "Fälligkeitsdatum";
    texts.param_info_page = "Seitenzahlen";
    texts.param_details_include = "Rechnungsdetails einschliessen";
    texts.param_details_columns = "Spaltennamen";
    texts.param_details_columns_widths = "Spaltenbreite";
    texts.param_details_columns_titles_alignment = "Titelausrichtung";
    texts.param_details_columns_alignment = "Textausrichtung";
    texts.param_details_gross_amounts = "Bruttobeträge (inklusive MwSt/USt)";
    texts.param_details_additional_descriptions = "Zusätzliche Beschreibungen drucken";
    texts.param_footer_include = "Fusszeile";
    texts.param_footer_add = "Fusszeile drucken";
    texts.param_footer_horizontal_line = "Trennlinie drucken";
    texts.param_texts = "Texte (leer = Standardwerte)";
    texts.param_languages = "Sprachen";
    texts.languages_remove = "Möchten Sie '<removedLanguages>' aus der Liste der Sprachen streichen?";
    texts.de_param_text_info_invoice_number = "Rechnungsnummer";
    texts.de_param_text_info_date = "Rechnungsdatum";
    texts.de_param_text_info_order_number = "Bestellnummer";
    texts.de_param_text_info_order_date = "Bestelldatum";
    texts.de_param_text_info_customer = "Kundennummer";
    texts.de_param_text_info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
    texts.de_param_text_info_customer_fiscal_number = "Kunden-Steuernummer";
    texts.de_param_text_info_due_date = "Fälligkeitsdatum";
    texts.de_param_text_info_page = "Seitennummer";
    texts.de_param_text_shipping_address = "Lieferadresse";
    texts.de_param_text_title_doctype_10 = "Rechnungstitel (Schriftgrösse=10)";
    texts.de_param_text_title_doctype_12 = "Gutschriftstitel (Schriftgrösse=12)";
    texts.de_param_text_begin = "Anfangstext";
    texts.de_param_text_details_columns = "Spaltennamen Rechnungsdetails";
    texts.de_param_text_total = "Rechnungsbetrag";
    texts.de_param_text_final = "Text am Ende";
    texts.de_param_footer_left = "Fusszeilentext links";
    texts.de_param_footer_center = "Fusszeilentext zentriert";
    texts.de_param_footer_right = "Fusszeilentext rechts";
    texts.param_styles = "Schriftarten";
    texts.param_text_color = "Textfarbe";
    texts.param_background_color_details_header = "Hintergrundfarbe Details-Kopfzeilen";
    texts.param_text_color_details_header = "Farbtext Details-Kopfzeilen";
    texts.param_background_color_alternate_lines = "Hintergrundfarbe alternativer Zeilen";
    texts.param_font_family = "Schriftzeichen";
    texts.param_font_size = "Schriftgrösse";
    texts.embedded_javascript_file_not_found = "Benutzerdefinierte Javascript-Datei nicht gefunden oder nicht gültig";
    texts.param_embedded_javascript = "JavaScript / CSS";
    texts.param_embedded_javascript_filename = "JS Dateiname ('ID-Spalte Dokumente-Tabelle)";
    texts.param_embedded_css_filename = "CSS Dateiname ('ID-Spalte Dokumente-Tabelle)";
    texts.param_tooltip_header_print = "Aktivieren, um Seitenkopf einzuschliessen";
    texts.param_tooltip_logo_print = "Aktivieren, um Logo einzuschliessen";
    texts.param_tooltip_logo_name = "Logo-Name eingeben";
    texts.param_tooltip_info_invoice_number = "Aktivieren, um Rechnungsnummer einzuschliessen";
    texts.param_tooltip_info_date = "Aktivieren, um Rechnungsdatum einzuschliessen";
    texts.param_tooltip_info_order_number = "Aktivieren, um Bestellnummer einzuschliessen";
    texts.param_tooltip_info_order_date = "Aktivieren, um Bestelldatum einzuschliessen";
    texts.param_tooltip_info_customer = "Aktivieren, um Kundennummer einzuschliessen";
    texts.param_tooltip_info_customer_vat_number = "Aktivieren, um Kunden-MwSt/USt-Nummer einzuschliessen";
    texts.param_tooltip_info_customer_fiscal_number = "Aktivieren, um Kunden-Steuernummer einzuschliessen";
    texts.param_tooltip_info_due_date = "Aktivieren, um Fälligkeitsdatum der Rechnung einzuschliessen";
    texts.param_tooltip_info_page = "Aktivieren, um Seitennummer einzuschliessen";
    texts.param_tooltip_languages = "Sprachen hinzufügen oder entfernen";
    texts.param_tooltip_text_info_invoice_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_date = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_order_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_order_date = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_customer = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_customer_vat_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_customer_fiscal_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_payment_terms_label = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_page = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_shipping_address = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_title_doctype_10 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_title_doctype_12 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_total = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_details_columns = "Spaltennamen Rechnungsdetails eingeben";
    texts.param_tooltip_details_columns = "XML-Spaltennamen in gewünschter Reihenfolge eingeben";
    texts.param_tooltip_details_columns_widths = "Spaltenbreite in % (Summe = 100%) eingeben";
    texts.param_tooltip_details_columns_titles_alignment = "Titelausrichtung";
    texts.param_tooltip_details_columns_alignment = "Textausrichtung";
    texts.param_tooltip_header_row_1 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_2 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_3 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_4 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_5 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_address_small_line = "Lieferanten-Adresszeile direkt über Kundenadresse eingeben";
    texts.param_tooltip_address_composition = "XML-Spaltennamen in gewünschter Reihenfolge eingeben";
    texts.param_tooltip_shipping_address = "Aktivieren, um Lieferadresse zu drucken";
    texts.param_tooltip_address_left = "Aktivieren, um Kundenadresse auf der linken Seite zu drucken";
    texts.param_tooltip_text_begin = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_details_gross_amounts = "Aktivieren, um Rechnungsdetails mit Bruttobeträgen und enthaltener MwSt/USt zu drucken";
    texts.param_tooltip_details_additional_descriptions = "Aktivieren, um Zusätzliche Beschreibungen zu drucken";
    texts.param_tooltip_text_final = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_footer_add = "Aktivieren, um Fusszeile unten auf der Seite zu drucken";
    texts.param_tooltip_footer = "Fusszeilentext eingeben";
    texts.param_tooltip_footer_horizontal_line = "Trennlinie drucken";
    texts.param_tooltip_font_family = "Schriftart eingeben (z.B. Arial, Helvetica, Times New Roman, usw.)";
    texts.param_tooltip_font_size = "Schriftgrösse eingeben (z.B. 10, 11, 12, usw.)";
    texts.param_tooltip_text_color = "Farbe eingeben (z.B. '#000000' oder 'Black')";
    texts.param_tooltip_background_color_details_header = "Farbe eingeben (z.B. '#337ab7' oder 'Blue')";
    texts.param_tooltip_text_color_details_header = "Textfarbe eingeben (z.B. '#ffffff' oder 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Farbe Zeilenhintergrund der Details eingeben (z.B. '#F0F8FF' oder 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Javaskript-Dateiname der 'ID'-Spalte Dokumente-Tabelle eingeben (z.B. Filejs)";
    texts.error1 = "Die Spaltennamen stimmen nicht mit den zu druckenden Texten überein. Prüfen Sie die Rechnungseinstellungen.";
    texts.de_error1_msg = "Die Namen von Text und Spalten stimmen nicht überein.";
    texts.offer = "Offerte";
    texts.de_param_text_info_offer_number = "Offerte Nr.";
    texts.param_tooltip_text_info_offer_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.de_param_text_info_date_offer = "Datum Offerte";
    texts.param_tooltip_text_info_date_offer = "Text eingeben, um Standardtext zu ersetzen";
    texts.de_param_text_info_validity_date_offer = "Gültigkeit Offerte";
    texts.validity_terms_label = "Gültigkeit";
    texts.param_tooltip_text_info_validity_date_offer = "Text eingeben, um Standardtext zu ersetzen";
    texts.de_param_text_title_doctype_17 = "Titel Offerte";
    texts.param_tooltip_title_doctype_17 = "Text eingeben, um Standardtext zu ersetzen";
    texts.de_param_text_begin_offer = "Anfangstext Offerte";
    texts.param_tooltip_text_begin_offer = "Text eingeben, um Standardtext zu ersetzen";
    texts.de_param_text_final_offer = "Schlusstext Offerte";
    texts.param_tooltip_text_final_offer = "Text eingeben, um Standardtext zu ersetzen";
  }
  else if (language === 'fr') {
    //FR
    texts.phone = "Tél.";
    texts.shipping_address = "Adresse de livraison";
    texts.invoice = "Facture";
    texts.date = "Date";
    texts.order_number = "Numéro de commande";
    texts.order_date = "Date de commande";
    texts.customer = "Numéro Client";
    texts.vat_number = "Numéro de TVA";
    texts.fiscal_number = "Numéro fiscal";
    texts.payment_due_date_label = "Échéance";
    texts.payment_terms_label = "Échéance";
    texts.page = "Page";
    texts.credit_note = "Note de crédit";
    texts.description = "Description";
    texts.quantity = "Quantité";
    texts.reference_unit = "Unité";
    texts.unit_price = "Prix Unitaire";
    texts.amount = "Montant";
    texts.discount = "Rabais";
    texts.deposit = "Acompte";
    texts.totalnet = "Total net";
    texts.subtotal = "Sous-total";
    texts.vat = "TVA";
    texts.rounding = "Arrondi";
    texts.total = "TOTAL";
    texts.param_include = "Imprimer";
    texts.param_header_include = "En-tête";
    texts.param_header_print = "En-tête de page";
    texts.param_header_row_1 = "Texte ligne 1";
    texts.param_header_row_2 = "Texte ligne 2";
    texts.param_header_row_3 = "Texte ligne 3";
    texts.param_header_row_4 = "Texte ligne 4";
    texts.param_header_row_5 = "Texte ligne 5";
    texts.param_logo_print = "Logo";
    texts.param_logo_name = "Composition pour l'alignement du logo et de l'en-tête";
    texts.param_address_include = "Adresse client";
    texts.param_address_small_line = "Texte adresse de l'expéditeur";
    texts.param_address_left = "Aligner à gauche";
    texts.param_address_composition = "Composition de l'adresse";
    texts.param_address_position_dX = 'Déplacer horizontalement +/- (en cm, défaut 0)';
    texts.param_address_position_dY = 'Déplacer verticalement +/- (en cm, défaut 0)';
    texts.param_shipping_address = "Adresse de livraison";
    texts.param_info_include = "Informations";
    texts.param_info_invoice_number = "Numéro de facture";
    texts.param_info_date = "Date facture";
    texts.param_info_order_number = "Numéro de commande";
    texts.param_info_order_date = "Date de commande";
    texts.param_info_customer = "Numéro Client";
    texts.param_info_customer_vat_number = "Numéro de TVA client";
    texts.param_info_customer_fiscal_number = "Numéro fiscal client";
    texts.param_info_due_date = "Échéance facture";
    texts.param_info_page = "Numéro de page";
    texts.param_details_include = "Détails de la facture";
    texts.param_details_columns = "Noms des colonnes";
    texts.param_details_columns_widths = "Largeur des colonnes";
    texts.param_details_columns_titles_alignment = "Alignement des titres";
    texts.param_details_columns_alignment = "Alignement des textes";
    texts.param_details_gross_amounts = "Montants bruts (TVA incluse)";
    texts.param_details_additional_descriptions = "Imprimer des descriptions supplémentaires";
    texts.param_footer_include = "Pied de page";
    texts.param_footer_add = "Imprimer pied de page";
    texts.param_footer_horizontal_line = "Imprimer la bordure de séparation";
    texts.param_texts = "Textes (vide = valeurs par défaut)";
    texts.param_languages = "Langue";
    texts.languages_remove = "Souhaitez-vous supprimer '<removedLanguages>' de la liste des langues?";
    texts.fr_param_text_info_invoice_number = "Numéro de facture";
    texts.fr_param_text_info_date = "Date facture";
    texts.fr_param_text_info_order_number = "Numéro de commande";
    texts.fr_param_text_info_order_date = "Date de commande";
    texts.fr_param_text_info_customer = "Numéro Client";
    texts.fr_param_text_info_customer_vat_number = "Numéro de TVA client";
    texts.fr_param_text_info_customer_fiscal_number = "Numéro fiscal client";
    texts.fr_param_text_info_due_date = "Échéance facture";
    texts.fr_param_text_info_page = "Numéro de page";
    texts.fr_param_text_shipping_address = "Adresse de livraison";
    texts.fr_param_text_title_doctype_10 = "Titre de la facture";
    texts.fr_param_text_title_doctype_12 = "Titre note de crédit";
    texts.fr_param_text_begin = "Texte de début";
    texts.fr_param_text_details_columns = "Noms des colonnes des détails de la facture";
    texts.fr_param_text_total = "Total facture";
    texts.fr_param_text_final = "Texte final";
    texts.fr_param_footer_left = "Pied de page gauche";
    texts.fr_param_footer_center = "Pied de page centre";
    texts.fr_param_footer_right = "Pied de page droit";
    texts.param_styles = "Styles";
    texts.param_text_color = "Couleur de texte";
    texts.param_background_color_details_header = "Couleur de fond pour l'en-tête des détails";
    texts.param_text_color_details_header = "Couleur de texte pour l'en-tête des détails";
    texts.param_background_color_alternate_lines = "Couleur de fond pour les lignes alternées";
    texts.param_font_family = "Type de caractère";
    texts.param_font_size = "Taille des caractères";
    texts.embedded_javascript_file_not_found = "Fichier JavaScript non trouvé ou invalide";
    texts.param_embedded_javascript = "JavaScript / CSS";
    texts.param_embedded_javascript_filename = "Nom fichier JS (colonne 'ID' du tableau Documents)";
    texts.param_embedded_css_filename = "Nom fichier CSS (colonne 'ID' du tableau Documents)";
    texts.param_tooltip_header_print = "Activer pour inclure l'en-tête de la page";
    texts.param_tooltip_logo_print = "Activer pour inclure le logo";
    texts.param_tooltip_logo_name = "Insérer le nom du logo";
    texts.param_tooltip_info_invoice_number = "Activer pour inclure le numéro de la facture";
    texts.param_tooltip_info_date = "Activer pour inclure la date de la facture";
    texts.param_tooltip_info_order_number = "Activer pour inclure le numéro de commande";
    texts.param_tooltip_info_order_date = "Activer pour inclure la date de commande";
    texts.param_tooltip_info_customer = "Activer pour inclure le numéro client";
    texts.param_tooltip_info_customer_vat_number = "Activer pour inclure le numéro de TVA du client";
    texts.param_tooltip_info_customer_fiscal_number = "Activer pour inclure le numéro fiscal du client";
    texts.param_tooltip_info_due_date = "Activer pour inclure la date d'échéance de la facture";
    texts.param_tooltip_info_page = "Activer pour inclure le numéro de page";
    texts.param_tooltip_languages = "Ajouter ou supprimer une ou plusieurs langues";
    texts.param_tooltip_text_info_invoice_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_date = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_order_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_order_date = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_customer = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_customer_vat_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_customer_fiscal_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_payment_terms_label = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_page = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_shipping_address = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_title_doctype_10 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_title_doctype_12 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_total = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_details_columns = "Insérer les noms des colonnes des détails de la facture";
    texts.param_tooltip_details_columns = "Insérer les noms XML des colonnes dans l'ordre de votre choix";
    texts.param_tooltip_details_columns_widths = "Insérer les largeurs des colonnes en % (la somme doit être de 100%)";
    texts.param_tooltip_details_columns_titles_alignment = "Alignement des titres";
    texts.param_tooltip_details_columns_alignment = "Alignement des textes";
    texts.param_tooltip_header_row_1 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_2 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_3 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_4 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_5 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_address_small_line = "Insérer l'adresse de l'expéditeur juste au-dessus de l'adresse du client";
    texts.param_tooltip_address_composition = "Insérer les noms XML des colonnes dans l'ordre de votre choix";
    texts.param_tooltip_shipping_address = "Activer pour imprimer l'adresse de livraison";
    texts.param_tooltip_address_left = "Activer pour aligner l'adresse du client à gauche";
    texts.param_tooltip_text_begin = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_details_gross_amounts = "Activer pour imprimer les détails de la facture avec les montants bruts et la TVA incluse";
    texts.param_tooltip_details_additional_descriptions = "Activer pour imprimer des descriptions supplémentaires";
    texts.param_tooltip_text_final = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_footer_add = "Activer pour imprimer le pied de page";
    texts.param_tooltip_footer = "Insérer le texte pour la pied de page";
    texts.param_tooltip_footer_horizontal_line = "Imprimer la bordure de séparation";
    texts.param_tooltip_font_family = "Insérer le type de caractère (p. ex. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Insérer la taille du caractère (p. ex. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Insérer la couleur pour le texte (p. ex '#000000' ou 'Black')";
    texts.param_tooltip_background_color_details_header = "Insérer la couleur de fond de l'en-tête des détails (p. ex. '#337ab7' ou 'Blue')";
    texts.param_tooltip_text_color_details_header = "Insérer la couleur de texte de l'en-tête des détails (p. ex. '#ffffff' ou 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Insérer la couleur de fond pour les lignes alternées (p. ex. '#F0F8FF' ou 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Insérer le nom du fichier JavaScript (.js) de la colonne 'ID' du tableau Documents (p. ex. File.js)";    
    texts.error1 = "Les noms des colonnes ne correspondent pas aux textes à imprimer. Vérifiez les paramètres de la facture.";
    texts.fr_error1_msg = "Le texte et les noms des colonnes ne correspondent pas";
    texts.offer = "Offre";
    texts.fr_param_text_info_offer_number = "Numéro offre";
    texts.param_tooltip_text_info_offer_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.fr_param_text_info_date_offer = "Date offre";
    texts.param_tooltip_text_info_date_offer = "Insérez un texte pour remplacer le texte par défaut";
    texts.fr_param_text_info_validity_date_offer = "Validité de l'offre";
    texts.validity_terms_label = "Validité";
    texts.param_tooltip_text_info_validity_date_offer = "Insérez un texte pour remplacer le texte par défaut";
    texts.fr_param_text_title_doctype_17 = "Titre offre";
    texts.param_tooltip_title_doctype_17 = "Insérez un texte pour remplacer le texte par défaut";     
    texts.fr_param_text_begin_offer = "Texte de début offre";
    texts.param_tooltip_text_begin_offer = "Insérez un texte pour remplacer le texte par défaut";
    texts.fr_param_text_final_offer = "Texte final offre";
    texts.param_tooltip_text_final_offer = "Insérez un texte pour remplacer le texte par défaut"; 
  }
  else {
    //EN
    texts.phone = "Tel";
    texts.shipping_address = "Shipping address";
    texts.invoice = "Invoice";
    texts.date = "Date";
    texts.order_number = "Order No";
    texts.order_date = "Order date";
    texts.customer = "Customer No";
    texts.vat_number = "VAT No";
    texts.fiscal_number = "Fiscal No";
    texts.payment_due_date_label = "Due date";
    texts.payment_terms_label = "Due date";
    texts.page = "Page";
    texts.credit_note = "Credit note";
    texts.description = "Description";
    texts.quantity = "Quantity";
    texts.reference_unit = "Unit";
    texts.unit_price = "Unit Price";
    texts.amount = "Amount";
    texts.discount = "Discount";
    texts.deposit = "Deposit";
    texts.totalnet = "Total net";
    texts.subtotal = "Subtotal";
    texts.vat = "VAT";
    texts.rounding = "Rounding";
    texts.total = "TOTAL";
    texts.param_include = "Print";
    texts.param_header_include = "Header";
    texts.param_header_print = "Page header";
    texts.param_header_row_1 = "Line 1 text";
    texts.param_header_row_2 = "Line 2 text";
    texts.param_header_row_3 = "Line 3 text";
    texts.param_header_row_4 = "Line 4 text";
    texts.param_header_row_5 = "Line 5 text";
    texts.param_logo_print = "Logo";
    texts.param_logo_name = "Composition for logo and header alignment";
    texts.param_address_include = "Customer address";
    texts.param_address_small_line = "Sender address text";
    texts.param_address_left = "Align left";
    texts.param_address_composition = "Address composition";
    texts.param_address_position_dX = 'Move horizontally +/- (in cm, default 0)';
    texts.param_address_position_dY = 'Move vertically +/- (in cm, default 0)';
    texts.param_shipping_address = "Shipping address";
    texts.param_info_include = "Information";
    texts.param_info_invoice_number = "Invoice number";
    texts.param_info_date = "Invoice date";
    texts.param_info_order_number = "Order number";
    texts.param_info_order_date = "Order date";
    texts.param_info_customer = "Customer number";
    texts.param_info_customer_vat_number = "Customer VAT number";
    texts.param_info_customer_fiscal_number = "Customer fiscal number";
    texts.param_info_due_date = "Invoice due date";
    texts.param_info_page = "Page number";
    texts.param_details_include = "Invoice details";
    texts.param_details_columns = "Column names";
    texts.param_details_columns_widths = "Column width";
    texts.param_details_columns_titles_alignment = "Titles alignment";
    texts.param_details_columns_alignment = "Texts alignment";
    texts.param_details_gross_amounts = "Gross amounts (VAT included)";
    texts.param_details_additional_descriptions = "Print additional descriptions";
    texts.param_footer_include = "Footer";
    texts.param_footer_add = "Print footer";
    texts.param_footer_horizontal_line = "Print separating border";
    texts.param_texts = "Texts (empty = default values)";
    texts.param_languages = "Languages";
    texts.languages_remove = "Do you want to remove '<removedLanguages>' from the language list?";
    texts.en_param_text_info_invoice_number = "Invoice number";
    texts.en_param_text_info_date = "Invoice date";
    texts.en_param_text_info_order_number = "Order number";
    texts.en_param_text_info_order_date = "Order date";
    texts.en_param_text_info_customer = "Customer number";
    texts.en_param_text_info_customer_vat_number = "Customer VAT number";
    texts.en_param_text_info_customer_fiscal_number = "Customer fiscal number";
    texts.en_param_text_info_due_date = "Invoice due date";
    texts.en_param_text_info_page = "Page number";
    texts.en_param_text_shipping_address = "Shipping address";
    texts.en_param_text_title_doctype_10 = "Invoice title";
    texts.en_param_text_title_doctype_12 = "Credit note title";
    texts.en_param_text_begin = "Begin text";
    texts.en_param_text_details_columns = "Column names invoice details";
    texts.en_param_text_total = "Invoice total";
    texts.en_param_text_final = "Final text";
    texts.en_param_footer_left = "Footer left text";
    texts.en_param_footer_center = "Footer center text";
    texts.en_param_footer_right = "Footer right text";
    texts.param_styles = "Styles";
    texts.param_text_color = "Text color";
    texts.param_background_color_details_header = "Background color of details header";
    texts.param_text_color_details_header = "Text color of details header";
    texts.param_background_color_alternate_lines = "Background color for alternate lines";
    texts.param_font_family = "Font family";
    texts.param_font_size = "Font size";
    texts.embedded_javascript_file_not_found = "JavaScript file not found or invalid";
    texts.param_embedded_javascript = "JavaScript / CSS";
    texts.param_embedded_javascript_filename = "JS file name (column 'ID' of table Documents)";
    texts.param_embedded_css_filename = "CSS file name (column 'ID' of table Documents)";
    texts.param_tooltip_header_print = "Check to include page header";
    texts.param_tooltip_logo_print = "Check to include logo";
    texts.param_tooltip_logo_name = "Enter the logo name";
    texts.param_tooltip_info_invoice_number = "Check to include the invoice number";
    texts.param_tooltip_info_date = "Check to include invoice date";
    texts.param_tooltip_info_order_number = "Check to include order number";
    texts.param_tooltip_info_order_date = "Check to include order date";
    texts.param_tooltip_info_customer = "Check to include customer number";
    texts.param_tooltip_info_customer_vat_number = "Check to include customer's VAT number";
    texts.param_tooltip_info_customer_fiscal_number = "Check to include customer's fiscal number";
    texts.param_tooltip_info_due_date = "Check to include the due date of the invoice";
    texts.param_tooltip_info_page = "Check to include the page number";
    texts.param_tooltip_languages = "Add or remove one or more languages";
    texts.param_tooltip_text_info_invoice_number = "Enter text to replace the default one";
    texts.param_tooltip_text_info_date = "Enter text to replace the default";
    texts.param_tooltip_text_info_order_number = "Enter text to replace the default";
    texts.param_tooltip_text_info_order_date = "Enter text to replace the default";
    texts.param_tooltip_text_info_customer = "Enter text to replace the default";
    texts.param_tooltip_text_info_customer_vat_number = "Enter text to replace the default";
    texts.param_tooltip_text_info_customer_fiscal_number = "Enter text to replace the default";
    texts.param_tooltip_text_payment_terms_label = "Enter text to replace the default";
    texts.param_tooltip_text_info_page = "Enter text to replace the default";
    texts.param_tooltip_text_shipping_address = "Enter text to replace the default";
    texts.param_tooltip_title_doctype_10 = "Enter text to replace the default";
    texts.param_tooltip_title_doctype_12 = "Enter text to replace the default";
    texts.param_tooltip_text_total = "Enter text to replace the default";
    texts.param_tooltip_text_details_columns = "Insert column names of invoice details";
    texts.param_tooltip_details_columns = "Enter the XML names of the columns in the order you prefer";
    texts.param_tooltip_details_columns_widths = "Enter column widths in % (sum must be 100%)";
    texts.param_tooltip_details_columns_titles_alignment = "Titles alignment";
    texts.param_tooltip_details_columns_alignment = "Texts alignment";
    texts.param_tooltip_header_row_1 = "Insert text to replace default";
    texts.param_tooltip_header_row_2 = "Enter text to replace the default";
    texts.param_tooltip_header_row_3 = "Enter text to replace the default";
    texts.param_tooltip_header_row_4 = "Enter text to replace the default";
    texts.param_tooltip_header_row_5 = "Enter text to replace the default";
    texts.param_tooltip_address_small_line = "Enter the sender's address just above the customer's address";
    texts.param_tooltip_address_composition = "Enter the XML names of the columns in the order you prefer";
    texts.param_tooltip_shipping_address = "Check to print the shipping address";
    texts.param_tooltip_address_left = "Check to align customer address on the left";
    texts.param_tooltip_text_begin = "Enter text to replace the default";
    texts.param_tooltip_details_gross_amounts = "Check to print invoice details with gross amounts and VAT included";
    texts.param_tooltip_details_additional_descriptions = "Check to print additional descriptions";
    texts.param_tooltip_text_final = "Enter text to replace the default";
    texts.param_tooltip_footer_add = "Check to print the footer";
    texts.param_tooltip_footer = "Enter footer text";
    texts.param_tooltip_footer_horizontal_line = "Print separating border";
    texts.param_tooltip_font_family = "Enter font type (e.g. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Enter font size (e.g. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Enter color for the text (e.g. '#000000' or 'Black')";
    texts.param_tooltip_background_color_details_header = "Enter color for the background of header details (e.g. '#337ab7' or 'Blue')";
    texts.param_tooltip_text_color_details_header = "Enter color for the text of header details (e.g. '#ffffff' or 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Enter color for the background of alternate lines (e.g. '#F0F8FF' or 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Enter name of the javascript file taken from the 'ID' column of the table 'Documents' (i.e. file.js)";  
    texts.error1 = "Column names do not match with the text to print. Check invoice settings.";
    texts.en_error1_msg = "Text names and columns do not match";
    texts.offer = "Estimate";
    texts.en_param_text_info_offer_number = "Estimate number";
    texts.param_tooltip_text_info_offer_number = "Enter text to replace the default";
    texts.en_param_text_info_date_offer = "Estimate date";
    texts.param_tooltip_text_info_date_offer = "Enter text to replace the default";
    texts.en_param_text_info_validity_date_offer = "Estimate validity";
    texts.validity_terms_label = "Validity";
    texts.param_tooltip_text_info_validity_date_offer = "Enter text to replace the default";
    texts.en_param_text_title_doctype_17 = "Estimate title";
    texts.param_tooltip_title_doctype_17 = "Enter text to replace the default";
    texts.en_param_text_begin_offer = "Begin text estimate";
    texts.param_tooltip_text_begin_offer = "Enter text to replace the default";
    texts.en_param_text_final_offer = "Final text estimate";
    texts.param_tooltip_text_final_offer = "Enter text to replace the default";
  }

  return texts;
}


//====================================================================//
// OTHER
//====================================================================//
function bananaRequiredVersion(requiredVersion, expmVersion) {
  /**
   * Check Banana version and license type
   */

  BAN_ADVANCED = isBananaAdvanced(requiredVersion, expmVersion);

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

function isBananaAdvanced(requiredVersion, expmVersion) {
  /*
   * Check version and license type for advanced features.
   *
   * Case 1: Banana >= 10, advanced, return TRUE
   * Case 2: Banana >= 10, professional, file type 'Invoices', rows <= 20, return TRUE
   * Case 3: Banana >= 10, professional, file type 'Invoices', rows > 20, return FALSE
   * Case 4: Banana >= 10, professional, file type 'Double,...', number of invoices <= 20, return TRUE
   * Case 5: Banana >= 10, professional, file type 'Double,...', number of invoices > 20, return FALSE
   * Case 6: Banana < 10, return FALSE
   */
  
  if (expmVersion) {
    requiredVersion = requiredVersion + "." + expmVersion;
  }
  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
    if (Banana.application.license) {
      if (Banana.application.license.licenseType === "advanced") { //Case 1
        return true;
      }
      else {
        var fileTypeGroup = Banana.document.info("Base", "FileTypeGroup");
        var fileTypeNumber = Banana.document.info("Base", "FileTypeNumber");
        if (fileTypeGroup === "400" && fileTypeNumber === "400") {
          if (Banana.document.table('Invoices').rowCount <= 20) { //Case 2
            return true;
          }
          else { //Case 3
            return false;
          }
        }
        else {
          var invoicesList = new Set();
          for (var i = 0; i < Banana.document.table('Transactions').rowCount; i++) {
            var tRow = Banana.document.table('Transactions').row(i);
            var docInvoice = tRow.value("DocInvoice");
            if (docInvoice) {
              invoicesList.add(docInvoice);
            }
          }
          var numInvoices = invoicesList.size;
          if (numInvoices <= 20) { //Case 4
            return true;
          }
          else { //Case 5
            return false;
          }
        }
      }
    }
  }
  else { //Case 6
    return false;
  }
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

