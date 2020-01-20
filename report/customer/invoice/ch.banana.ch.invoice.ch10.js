// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2020-01-20
// @publisher = Banana.ch SA
// @description = [CH10] Layout 10 (BETA)
// @description.it = [CH10] Layout 10 (BETA)
// @description.de = [CH10] Layout 10 (BETA)
// @description.fr = [CH10] Layout 10 (BETA)
// @description.en = [CH10] Layout 10 (BETA)
// @doctype = *
// @task = report.customer.invoice




/*
  SUMMARY
  =======
  New invoice layout.
  This layout of invoice allows to set a lot of settings in order to 
  Invoice zones:
  - header
  - info
  - address
  - shipping address
  - begin text (title and begin text)
  - details
  - final texts
  - footer
*/



// Define the required version of Banana Accounting / Banana Experimental
var BAN_VERSION = "9.0.5";
var BAN_EXPM_VERSION = "";

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
  currentParam.defaultvalue = texts.column_description+";"+texts.column_quantity+";"+texts.column_reference_unit+";"+texts.column_unit_price+";"+texts.column_amount;
  currentParam.tooltip = texts.param_tooltip_details_columns;
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
  currentParam.defaultvalue = '50%;10%;10%;15%;15%';
  currentParam.tooltip = texts.param_tooltip_details_columns_widths;
  currentParam.readValue = function() {
    userParam.details_columns_widths = this.value;
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




  /*
    Orange swiss ISR impayment slip
  */
  currentParam = {};
  currentParam.name = 'isr';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_isr;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.isr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_isr';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_print_isr;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_isr ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_print_isr;
  currentParam.readValue = function() {
   userParam.print_isr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_bank_name';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_bank_name;
  currentParam.type = 'string';
  currentParam.value = userParam.isr_bank_name ? userParam.isr_bank_name : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_isr_bank_name;
  currentParam.readValue = function() {
   userParam.isr_bank_name = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_bank_address';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_bank_address;
  currentParam.type = 'string';
  currentParam.value = userParam.isr_bank_address ? userParam.isr_bank_address : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_isr_bank_address;
  currentParam.readValue = function() {
   userParam.isr_bank_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_account';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_account;
  currentParam.type = 'string';
  currentParam.value = userParam.isr_account ? userParam.isr_account : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_isr_account;
  currentParam.readValue = function() {
   userParam.isr_account = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_id';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_id;
  currentParam.type = 'string';
  currentParam.value = userParam.isr_id ? userParam.isr_id : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_isr_id;
  currentParam.readValue = function() {
   userParam.isr_id = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_position_scaleX';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_position_scaleX;
  currentParam.type = 'number';
  currentParam.value = userParam.isr_position_scaleX ? userParam.isr_position_scaleX : '1.0';
  currentParam.defaultvalue = '1.0';
  currentParam.tooltip = texts.param_tooltip_isr_position_scaleX;
  currentParam.readValue = function() {
   userParam.isr_position_scaleX = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_position_scaleY';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_position_scaleY;
  currentParam.type = 'number';
  currentParam.value = userParam.isr_position_scaleY ? userParam.isr_position_scaleY : '1.0';
  currentParam.defaultvalue = '1.0';
  currentParam.tooltip = texts.param_tooltip_isr_position_scaleY;
  currentParam.readValue = function() {
   userParam.isr_position_scaleY = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_position_dX';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_position_dX;
  currentParam.type = 'number';
  currentParam.value = userParam.isr_position_dX ? userParam.isr_position_dX : '1.0';
  currentParam.defaultvalue = '0';
  currentParam.tooltip = texts.param_tooltip_isr_position_dX;
  currentParam.readValue = function() {
   userParam.isr_position_dX = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_position_dY';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_position_dY;
  currentParam.type = 'number';
  currentParam.value = userParam.isr_position_dY ? userParam.isr_position_dY : '1.0';
  currentParam.defaultvalue = '0';
  currentParam.tooltip = texts.param_tooltip_isr_position_dY;
  currentParam.readValue = function() {
   userParam.isr_position_dY = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'isr_on_new_page';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_on_new_page;
  currentParam.type = 'bool';
  currentParam.value = userParam.isr_on_new_page ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_isr_on_new_page;
  currentParam.readValue = function() {
   userParam.isr_on_new_page = this.value;
  }
  convertedParam.data.push(currentParam);


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
  }

  for (var i = 0; i < langCodes.length; i++) {
    var langCode = langCodes[i];
    if (langCode === "it" || langCode === "fr" || langCode === "de" || langCode === "en" || langCode === "nl" || langCode === "zh" || langCode === "pt" || langCode === "es") {
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
    currentParam.name = langCode+'_text_details_columns';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_details_columns'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_details_columns'] ? userParam[langCode+'_text_details_columns'] : '';
    currentParam.defaultvalue = langTexts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
    currentParam.tooltip = langTexts['param_tooltip_text_details_columns'];
    currentParam.language = langCode;
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
    currentParam.type = 'string';
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
    currentParam.type = 'string';
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
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_footer_right'] ? userParam[langCode+'_footer_right'] : '';
    currentParam.defaultvalue = langTexts.page+' <'+langTexts.page+'>'
    currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_right'] = this.value;
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
  userParam.logo_print = true;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = '<none>';
  userParam.address_left = false;
  userParam.shipping_address = false;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.details_columns = texts.column_description+";"+texts.column_quantity+";"+texts.column_reference_unit+";"+texts.column_unit_price+";"+texts.column_amount;
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_gross_amounts = false;
  userParam.footer_add = false;
  userParam.print_isr = true;
  userParam.isr_bank_name = '';
  userParam.isr_bank_address = '';
  userParam.isr_account = '';
  userParam.isr_id = '';
  userParam.isr_position_scaleX = '1.0';
  userParam.isr_position_scaleY = '1.0';
  userParam.isr_position_dX = '0';
  userParam.isr_position_dY = '0';
  userParam.isr_on_new_page = false;

  //Texts
  userParam.languages = 'de;en;fr;it';
  var langCodes = userParam.languages.toString().split(";");

  // Initialize the parameter for each language
  for (var i = 0; i < langCodes.length; i++) {

    // Use texts translations
    if (langCodes[i] === "it" || langCodes[i] === "fr" || langCodes[i] === "de" || langCodes[i] === "en" || langCodes[i] === "nl" || langCodes[i] === "zh" || langCodes[i] === "pt" || langCodes[i] === "es") {
      var langTexts = setInvoiceTexts(langCodes[i]);
    }
    else {
      var langTexts = setInvoiceTexts('en');
    }
    userParam[langCodes[i]+'_text_info_invoice_number'] = langTexts.invoice;
    userParam[langCodes[i]+'_text_info_date'] = langTexts.date;
    userParam[langCodes[i]+'_text_info_customer'] = langTexts.customer;
    userParam[langCodes[i]+'_text_info_customer_vat_number'] = langTexts.vat_number;
    userParam[langCodes[i]+'_text_info_customer_fiscal_number'] = langTexts.fiscal_number;
    userParam[langCodes[i]+'_text_info_due_date'] = langTexts.payment_terms_label;
    userParam[langCodes[i]+'_text_info_page'] = langTexts.page;
    userParam[langCodes[i]+'_text_shipping_address'] = langTexts.shipping_address;
    userParam[langCodes[i]+'_title_doctype_10'] = langTexts.invoice + " <DocInvoice>";
    userParam[langCodes[i]+'_title_doctype_12'] = langTexts.credit_note + " <DocInvoice>";
    userParam[langCodes[i]+'_text_details_columns'] = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    userParam[langCodes[i]+'_text_total'] = langTexts.total;
    userParam[langCodes[i]+'_text_final'] = '';
    userParam[langCodes[i]+'_footer_left'] = langTexts.invoice;
    userParam[langCodes[i]+'_footer_center'] = '';
    userParam[langCodes[i]+'_footer_right'] = langTexts.page+' <'+langTexts.page+'>';
  }

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
  if (!userParam.shipping_address) {
    userParam.shipping_address = false;
  }
  if (!userParam.info_invoice_number) {
    userParam.info_invoice_number = false;
  }
  if (!userParam.info_date) {
    userParam.info_date = false;
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
    userParam.details_columns = texts.column_description+";"+texts.column_quantity+";"+texts.column_reference_unit+";"+texts.column_unit_price+";"+texts.column_amount;
  }
  if (!userParam.details_columns_widths) {
    userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  }
  if (!userParam.details_gross_amounts) {
    userParam.details_gross_amounts = false;
  }
  if (!userParam.footer_add) {
    userParam.footer_add = false;
  }
  if (!userParam.print_isr) {
    userParam.print_isr = false;
  }
  if (!userParam.isr_bank_name) {
    userParam.isr_bank_name = '';
  }
  if (!userParam.isr_bank_address) {
    userParam.isr_bank_address = '';
  }
  if (!userParam.isr_account) {
    userParam.isr_account = '';
  }
  if (!userParam.isr_id) {
    userParam.isr_id = '';
  }
  if (!userParam.isr_position_scaleX) {
    userParam.isr_position_scaleX = '1.0';
  }
  if (!userParam.isr_position_scaleY) {
    userParam.isr_position_scaleY = '1.0';
  }
  if (!userParam.isr_position_dX) {
    userParam.isr_position_dX = '0';
  }
  if (!userParam.isr_position_dY) {
    userParam.isr_position_dY = '0';
  }
  if (!userParam.isr_on_new_page) {
    userParam.isr_on_new_page = false;
  }

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

  return userParam;
}



//====================================================================//
// MAIN FUNCTIONS THAT PRINT THE INVOICE
//====================================================================//
function printDocument(jsonInvoice, repDocObj, repStyleObj) {

  // Verify the banana version when user clicks ok to print the invoice
  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
  if (isCurrentBananaVersionSupported) {

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
      lang = invoiceObj.customer_info.lang;
    }
    if (lang.length <= 0) {
      lang = invoiceObj.document_info.locale;
    }
    var texts = setInvoiceTexts(lang);
    
    // Include the embedded javascript file entered by the user
    includeEmbeddedJavascriptFile(texts, userParam);
    
    // Variable starts with $
    var variables = {};
    set_variables(variables, userParam);
    
    // Function call to print the invoice document
    repDocObj = printInvoice(Banana.document, repDocObj, texts, userParam, repStyleObj, invoiceObj, variables);
    set_invoice_style(repDocObj, repStyleObj, variables, userParam);
    set_isr_style(repDocObj, repStyleObj, userParam);
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
    - footer

    By default are used standard functions, but if 'hook' functions are defined by the user, these functions are used instead.
  */

  
  // Invoice document
  var reportObj = Banana.Report;
  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts, userParam) + " " + invoiceObj.document_info.number);
  } 
  // else {
  //   var pageBreak = repDocObj.addPageBreak();
  //   pageBreak.addClass("pageReset");
  // }


  /* PRINT HEADER */
  if (typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj);
  } else {
    print_header(repDocObj, userParam, repStyleObj, invoiceObj);
  }

  /* PRINT INVOICE INFO */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_info(repDocObj, invoiceObj, texts, userParam);
  }

  /* PRINT CUSTOMER ADDRESS */
  if (typeof(hook_print_customer_address) === typeof(Function)) {
    hook_print_customer_address(repDocObj, invoiceObj, userParam);
  } else {
    print_customer_address(repDocObj, invoiceObj, userParam);
  }

  /* PRINT SHIPPING ADDRESS */
  if (userParam.shipping_address) {
    if (typeof(hook_print_shipping_address) === typeof(Function)) {
      hook_print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* PRINT BEGIN TEXT (BEFORE INVOICE DETAILS) */
  if (typeof(hook_print_text_begin) === typeof(Function)) {
    hook_print_text_begin(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_text_begin(repDocObj, invoiceObj, texts, userParam);
  }

  /* PRINT INVOICE INFO FOR PAGES 2+ */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj.getHeader(), invoiceObj, texts, userParam, "info_table_row0");
  } else {
    print_info(repDocObj.getHeader(), invoiceObj, texts, userParam, "info_table_row0");
  }

  /* PRINT INVOICE DETAILS */
  var detailsTable = repDocObj.addTable("doc_table");
  if (userParam.details_gross_amounts) {
    if (typeof(hook_print_details_gross_amounts) === typeof(Function)) {
      hook_print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    } else {
      print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    }
  }
  else {
    if (typeof(hook_print_details_net_amounts) === typeof(Function)) {
      hook_print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    } else {
      print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables);
    }
  }

  /* PRINT FINAL TEXTS (AFTER INVOICE DETAILS) */
  if (typeof(hook_print_final_texts) === typeof(Function)) {
    hook_print_final_texts(repDocObj, invoiceObj, detailsTable, userParam);
  } else {
    print_final_texts(repDocObj, invoiceObj, detailsTable, userParam);
  }


  /* PRINT SWISS ISR IMPAYMENT SLIP */
  print_isr_slip(repDocObj, invoiceObj, userParam, repStyleObj);



  /* PRINT FOOTER */
  if (typeof(hook_print_footer) === typeof(Function)) {
    hook_print_footer(repDocObj, texts, userParam);
  } else {
    print_footer(repDocObj, texts, userParam);
  }

  return repDocObj;
}



//====================================================================//
// FUNCTIONS THAT PRINT ALL THE DIFFERENT PARTS OF THE INVOICE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED USING EMBEDDED 
// JAVASCRIPT FILES ON DOCUMENTS TABLE
//====================================================================//
function print_header(repDocObj, userParam, repStyleObj, invoiceObj) {
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
       headerParagraph.addClass("header_right_text");
    }
  } else {
     headerParagraph.addClass("header_right_text");
  }

  if (userParam.header_print) {

    if (userParam.header_row_1) {
      if (userParam.header_row_1.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_1, "").setStyleAttributes("font-weight:bold; font-size:16pt; color:" + userParam.background_color_details_header);
      }
      if (userParam.header_row_2.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_2, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_3.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_3, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_4.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_4, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_5.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_5, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
    }
    else {
      var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierNameLines.length; i++) {
        headerParagraph.addParagraph(supplierNameLines[i], "").setStyleAttributes("font-weight:bold; font-size:16pt; color:" + userParam.background_color_details_header);
      }
      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
        headerParagraph.addParagraph(supplierLines[i], "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }      
    }
  }
}

function print_info(repDocObj, invoiceObj, texts, userParam, tableStyleRow0) {
  /*
    Prints the invoice information
  */
  var infoTable = "";

  // info table that starts at row 0, for pages 2+
  if (tableStyleRow0) {
    infoTable = repDocObj.addTable(tableStyleRow0);
  }
  else {
    if (userParam.address_left) {
      infoTable = repDocObj.addTable("info_table_right");
    } else {
      infoTable = repDocObj.addTable("info_table_left");
    }
  }

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_invoice_number'] + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam[lang+'_text_info_date'] + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
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
    tableRow.addCell(userParam[lang+'_text_info_due_date'] + ":","",1);
    tableRow.addCell(payment_terms,"",1);    
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
  if (userParam.address_left) {
    customerAddressTable = repDocObj.addTable("address_table_left");
  } else {
    customerAddressTable = repDocObj.addTable("address_table_right");
  }
  //Small line of the supplier address
  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);
  if (userParam.address_small_line) {
    if (userParam.address_small_line === "<none>") {
      cell.addText("","");
    } else {
      cell.addText(userParam.address_small_line, "small_address");
    }
  }
  else {
    var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
    cell.addText(supplierNameLines[0], "small_address");
    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    cell.addText(" - " + supplierLines[0] + " - " + supplierLines[1], "small_address");
  }
  
  // Invoice address / shipping address
  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);

  // Customer address
  var customerAddress = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i = 0; i < customerAddress.length; i++) {
    cell.addParagraph(customerAddress[i]);
  }
}

function print_shipping_address(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the shipping address
  */
  var billingAndShippingAddress = repDocObj.addTable("shipping_address");
  var tableRow;

  tableRow = billingAndShippingAddress.addRow();
  var shippingCell = tableRow.addCell("","",1);

  // Shipping address
  if (invoiceObj.shipping_info.different_shipping_address) {
    if (userParam[lang+'_text_shipping_address']) {
      shippingCell.addParagraph(userParam[lang+'_text_shipping_address'],"").setStyleAttributes("font-weight:bold;color:"+userParam.background_color_details_header+";");
    } else {
      shippingCell.addParagraph(texts.shipping_address, "").setStyleAttributes("font-weight:bold;color:"+userParam.background_color_details_header+";");
    }
    var shippingAddress = getInvoiceAddress(invoiceObj.shipping_info).split('\n');
    for (var i = 0; i < shippingAddress.length; i++) {
      shippingCell.addParagraph(shippingAddress[i]);
    }
  }
}

function print_text_begin(repDocObj, invoiceObj, texts, userParam) {
  /*
    Prints the text before the invoice details
  */
  var docTypeTitle = getTitle(invoiceObj, texts, userParam);
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;

  if (docTypeTitle) {
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(docTypeTitle.replace(/<DocInvoice>/g,invoiceObj.document_info.number), "title_text");
    titleCell.addParagraph("", "");
    titleCell.addParagraph("", "");
  }
  if (invoiceObj.document_info.text_begin) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    addMdBoldText(textCell, invoiceObj.document_info.text_begin);
    textCell.addParagraph(" ", "");
    textCell.addParagraph(" ", "");  
  }
}

function print_details_net_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Print the invoice details using net Amounts (VAT excluded) 
  */
  var columnsDimension = userParam.details_columns_widths.split(";");
  var repTableObj = detailsTable;
  var repTableCol1 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[0]);
  var repTableCol2 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[1]);
  var repTableCol3 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[2]);
  var repTableCol4 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[3]);
  var repTableCol5 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[4]);
  var repTableCol6 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[5]);
  var repTableCol7 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[6]);
  var repTableCol8 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[7]);
  var repTableCol9 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[8]);
  var repTableCol10 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[9]);

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsSelected = userParam.details_columns.split(";");
  var columnsNames = userParam[lang+'_text_details_columns'].split(";");

  // remove all empty values ("", null, undefined): 
  columnsSelected = columnsSelected.filter(function(e){return e});
  columnsNames = columnsNames.filter(function(e){return e});

  if (userParam[lang+'_text_details_columns']) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      if (columnsNames[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsNames[i], "doc_table_header center", 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsSelected.length; i++) {
      columnsSelected[i] = columnsSelected[i].trim();
      header.addCell(columnsSelected[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj);

  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell";
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell";
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell";
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoit to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        if (item.mesure_unit) {
          if (variables.decimals_quantity) {
            decimals = variables.decimals_quantity;
          }
          tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity,decimals), classNameEvenRow + " right padding-left padding-right " + className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " right padding-left padding-right " + className, 1);
        }
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive, variables.decimals_unit_price, true), classNameEvenRow + " right padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_exclusive") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.total_amount_vat_exclusive, variables.decimals_amounts, true), classNameEvenRow + " right padding-left padding-right " + className, 1);
      }
      else {
        var userColumnValue = "";
        userColumnValue = getUserColumnValue(banDoc, invoiceObj.document_info.number, item.origin_row, columnsSelected[j]);
        tableRow.addCell(userColumnValue, classNameEvenRow + " padding-left padding-right " + className, 1);
      }
    }
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", columnsNumber);

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
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", columnsNumber);

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam[lang+'_text_total'] + " " + invoiceObj.document_info.currency, "total_cell", columnsNumber-1);
  tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_to_pay, variables.decimals_amounts, true), "total_cell right", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", columnsNumber);
}

function print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Prints the invoice details using gross Amounts (VAT included)
  */
  var columnsDimension = userParam.details_columns_widths.split(";");
  var repTableObj = detailsTable;
  var repTableCol1 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[0]);
  var repTableCol2 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[1]);
  var repTableCol3 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[2]);
  var repTableCol4 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[3]);
  var repTableCol5 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[4]);
  var repTableCol6 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[5]);
  var repTableCol7 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[6]);
  var repTableCol8 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[7]);
  var repTableCol9 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[8]);
  var repTableCol10 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[9]);

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsSelected = userParam.details_columns.split(";");
  var columnsNames = userParam[lang+'_text_details_columns'].split(";");

  // remove all empty values ("", null, undefined): 
  columnsSelected = columnsSelected.filter(function(e){return e});
  columnsNames = columnsNames.filter(function(e){return e});

  if (userParam[lang+'_text_details_columns']) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      if (columnsNames[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsNames[i], "doc_table_header center", 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsSelected.length; i++) {
      columnsSelected[i] = columnsSelected[i].trim();
      header.addCell(columnsSelected[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj);

  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell";
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell";
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell";
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoit to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        if (item.mesure_unit) {
          if (variables.decimals_quantity) {
            decimals = variables.decimals_quantity;
          }
          tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity,decimals), classNameEvenRow + " right padding-left padding-right " + className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " right padding-left padding-right " + className, 1);
        }
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_inclusive, variables.decimals_unit_price, true), classNameEvenRow + " right padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_inclusive") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.total_amount_vat_inclusive, variables.decimals_amounts, true), classNameEvenRow + " right padding-left padding-right " + className, 1);
      }
      else {
        var userColumnValue = "";
        userColumnValue = getUserColumnValue(banDoc, invoiceObj.document_info.number, item.origin_row, columnsSelected[j]);
        tableRow.addCell(userColumnValue, classNameEvenRow + " padding-left padding-right " + className, 1);
      }
    }
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", columnsNumber);

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_rounding_difference, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", columnsNumber);

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
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", columnsNumber);
}

function print_final_texts(repDocObj, invoiceObj, detailsTable, userParam) {
  /*
    Prints all the texts (final texts, notes and greetings) after the invoice details:
    - Default text is taken from the Print invoices -> Template options.
    - If user let empty the parameter on Settings dialog -> Final text, it is used the default
    - If user enter a text as parameter on Settings dialog -> Final text, it is used this instead.
    - If user enter "<none>" as paramenter on Settings dialog -> Final text, no final text is printed.
  */
  tableRow = detailsTable.addRow();
  tableRow.addCell(" ", "", columnsNumber);

  //Text taken from the Settings dialog's parameter "Final text"
  if (userParam[lang+'_text_final'] && userParam[lang+'_text_final'] !== "<none>") {
    var text = userParam[lang+'_text_final'];
    text = text.split('\n');
    for (var i = 0; i < text.length; i++) {
      repDocObj.addParagraph(" ", "");
      tableRow = detailsTable.addRow();
      var cellText = tableRow.addCell("","",columnsNumber);
      addMdBoldText(cellText, text[i]);
    }
  }

  // Template params, default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  else if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts && !userParam[lang+'_text_final']) {
    repDocObj.addParagraph(" ", "");
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
    for (var i = 0; i < text.length; i++) {
      tableRow = detailsTable.addRow();
      var cellText = tableRow.addCell("","",columnsNumber);
      addMdBoldText(cellText, text[i]);
    }
  }

  // Notes
  repDocObj.addParagraph(" ","");
  for (var i = 0; i < invoiceObj.note.length; i++) {
    if (invoiceObj.note[i].description) {
      tableRow = detailsTable.addRow();
      var cellText = tableRow.addCell("","", columnsNumber);
      addMdBoldText(cellText, invoiceObj.note[i].description);
    }
  }

  // Greetings
  repDocObj.addParagraph(" ", "");
  if (invoiceObj.document_info.greetings) {
    tableRow = detailsTable.addRow();
    var cellText = tableRow.addCell("","",columnsNumber);
    addMdBoldText(cellText, invoiceObj.document_info.greetings);
  }
}

function print_isr_slip(repDocObj, invoiceObj, userParam, repStyleObj) {
  if (userParam.print_isr && invoiceObj.document_info.currency == "CHF") {
    var bank = userParam.isr_bank_name;
    if (bank.length > 0 && userParam.isr_bank_address.length > 0) {
      bank += ",";
    }
    bank += userParam.isr_bank_address;
    invoiceObj["billing_info"]["bank_name"] = bank;
    invoiceObj["billing_info"]["iban_number"] = "";

    //pvr on new page: add a page break
    if (userParam.isr_on_new_page) {
      repDocObj.addPageBreak();
    }

    //Inserts an "invisible" rectangle to avoid the ISR form overwrite the text at the bottom of the page
    repDocObj.addParagraph("", "rectangle");

    //pvr if possible not on new page
    var repStyleObj = print_isr(invoiceObj, repDocObj, repStyleObj, userParam);
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
  if (userParam.footer_add) {
    var paragraph = repDocObj.getFooter().addParagraph("","footer_line");
    var tabFooter = repDocObj.getFooter().addTable("footer_table");
    var col1 = tabFooter.addColumn().setStyleAttributes("width:33%");
    var col2 = tabFooter.addColumn().setStyleAttributes("width:33%");
    var col3 = tabFooter.addColumn().setStyleAttributes("width:33%");

    var tableRow = tabFooter.addRow();
    var cell1 = tableRow.addCell("","",1);
    var cell2 = tableRow.addCell("","",1);
    var cell3 = tableRow.addCell("","",1);

    // footer left
    if (userParam[lang+'_footer_left'] && userParam[lang+'_footer_left'].length > 0) {
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
    if (userParam[lang+'_footer_center'] && userParam[lang+'_footer_center'].length > 0) {
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
    if (userParam[lang+'_footer_right'] && userParam[lang+'_footer_right'].length > 0) {
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



//====================================================================//
// OTHER UTILITIES FUNCTIONS
//====================================================================//
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
    if (res[1] && res[1] !== "0000" && res[1].substring(1,4) !== "000" && res[1].substring(2,4) !== "00") {
      decimals = 4;
      //Banana.console.log(res[1] + " => " + decimals);
    } else {
      decimals = 2;
      //Banana.console.log(res[1] + " => " + decimals);
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

function includeEmbeddedJavascriptFile(texts, userParam) {

  /*
    Include the javascript file (.js) entered by the user.
    User can define an embedded javascript file in the table Documents
    and use it to write his own 'hook' functions that overwrite the
    default functions.
  */


  // User entered a javascript file name
  // Take from the table documents all the javascript file names
  if (userParam.embedded_javascript_filename) {
    
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
          Banana.document.addMessage(texts.embedded_javascript_file_not_found);
        }
      }
    }
  }
}

function getUserColumnValue(banDoc, docInvoice, originRow, column) {

  /*
    Take the value from a custom user column of the table Transactions.
    User can add new custom columns on the Transactions table and include
    them into the invoice details table.
  */

  var table = banDoc.table('Transactions');
  var values = [];
  for (var i = 0; i < table.rowCount; i++) {
    var tRow = table.row(i);
    if (tRow.value('DocInvoice') === docInvoice && tRow.value(column)) {
      var rowNr = tRow.rowNr;
      if (rowNr.toString() === originRow.toString()) {
        values.push(tRow.value(column));
      }
    }
  }
  return values;
}

function getInvoiceAddress(invoiceAddress) {
  var address = "";
  if (invoiceAddress.courtesy) {
      address = invoiceAddress.courtesy + "\n";
  }
  if (invoiceAddress.business_name) {
    address = address + invoiceAddress.business_name + "\n";
  }
  if (invoiceAddress.first_name || invoiceAddress.last_name) {
    if (invoiceAddress.first_name) {
      address = address + invoiceAddress.first_name + " ";
    }
    if (invoiceAddress.last_name) {
      address = address + invoiceAddress.last_name;
    }
    address = address + "\n";
  }
  if (invoiceAddress.address1) {
    address = address + invoiceAddress.address1 + "\n";
  }
  if (invoiceAddress.address2) {
    address = address + invoiceAddress.address2 + "\n";
  }
  if (invoiceAddress.address3) {
    address = address + invoiceAddress.address3 + "\n";
  }
  if (invoiceAddress.postal_code) {
    address = address + invoiceAddress.postal_code + " ";
  }
  if (invoiceAddress.city) {
    address = address + invoiceAddress.city + "\n";
  }
  if (invoiceAddress.country) {
    address = address + invoiceAddress.country;
  }
  return address;
}

function getInvoiceSupplierName(invoiceSupplier) {
  var supplierName = "";
  if (invoiceSupplier.business_name) {
    supplierName = invoiceSupplier.business_name + "\n";
  }
  if (supplierName.length <= 0) {
    if (invoiceSupplier.first_name) {
      supplierName = invoiceSupplier.first_name + " ";
    }
    if (invoiceSupplier.last_name) {
      supplierName = supplierName + invoiceSupplier.last_name + "\n";
    }
  }
  return supplierName;
}

function getInvoiceSupplier(invoiceSupplier) {
  var supplierAddress = "";
  if (invoiceSupplier.address1) {
    supplierAddress = supplierAddress + invoiceSupplier.address1 + "\n";
  }
  if (invoiceSupplier.address2) {
    supplierAddress = supplierAddress + invoiceSupplier.address2 + "\n";
  }
  if (invoiceSupplier.postal_code) {
    supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
  }
  if (invoiceSupplier.city) {
    supplierAddress = supplierAddress + invoiceSupplier.city + "\n";
  }
  if (invoiceSupplier.phone) {
    supplierAddress = supplierAddress + "Tel: " + invoiceSupplier.phone + "\n";
  }
  if (invoiceSupplier.fax) {
    supplierAddress = supplierAddress + "Fax: " + invoiceSupplier.fax + "\n";
  }
  if (invoiceSupplier.email) {
    supplierAddress = supplierAddress + invoiceSupplier.email + "\n";
  }
  if (invoiceSupplier.web) {
    supplierAddress = supplierAddress + invoiceSupplier.web + "\n";
  }
  if (invoiceSupplier.vat_number) {
    supplierAddress = supplierAddress + invoiceSupplier.vat_number;
  }
  return supplierAddress;
}

function getAddressLines(jsonAddress, fullAddress) {

  /*
    This function returns a complete address taken from the JSON
  */

  var address = [];
  address.push(jsonAddress["business_name"]);

  var addressName = [jsonAddress["first_name"], jsonAddress["last_name"]];
  addressName = addressName.filter(function(n){return n}); // remove empty items
  address.push(addressName.join(" "));

  address.push(jsonAddress["address1"]);
  if (fullAddress) {
    address.push(jsonAddress["address2"]);
    address.push(jsonAddress["address3"]);
  }

  var addressCity = [jsonAddress["postal_code"], jsonAddress["city"]].join(" ");
  if (jsonAddress["country_code"] && jsonAddress["country_code"] !== "CH")
    addressCity = [jsonAddress["country_code"], addressCity].join(" - ");
  address.push(addressCity);

  address = address.filter(function(n){return n}); // remove empty items

  return address;
}

function getTitle(invoiceObj, texts, userParam) {

  /*
    Returns the title based on the DocType value (10=Invoice, 12=Credit note)
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
        if (!(varName in variables)) {
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
    if (!(varName in variables)) {
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
// ISR FUNCTIONS
//====================================================================//
function pvrInvoiceNumber(jsonInvoice) {
  /*
    Return the invoice number without the prefix
  */
  var prefixLength = jsonInvoice["document_info"]["number"].indexOf('-');
  if (prefixLength >= 0) {
    return jsonInvoice["document_info"]["number"].substr(prefixLength + 1);
  }
  return jsonInvoice["document_info"]["number"];
}

function print_isr(jsonInvoice, report, repStyleObj, userParam) {
  /*
    Prints the isr with all his parts
  */
  var pvrForm = report.addSection("pvr_Form");
  print_isrBankInfo(jsonInvoice, pvrForm, repStyleObj);
  print_isrSupplierInfo(jsonInvoice, pvrForm, repStyleObj);
  print_isrAccount(jsonInvoice, pvrForm, repStyleObj, userParam);
  print_isrAmount(jsonInvoice, pvrForm, repStyleObj);
  print_isrCustomerInfo(jsonInvoice, pvrForm, repStyleObj, userParam);
  print_isrCode(jsonInvoice, pvrForm, repStyleObj, userParam);
  return pvrForm;
}

function print_isrBankInfo(jsonInvoice, report, repStyleObj) {
  /*
    The purpose of this function is to print the billing info informations in the correct position
  */
  var str = jsonInvoice["billing_info"]["bank_name"].split(',');

  //Receipt
  var billingInfo_REC =  report.addSection("billingInfo_REC");

  for (var i = 0; i < str.length; i++) {
    billingInfo_REC.addParagraph(str[i].trim());
  }

  //Payment
  var billingInfo_PAY =  report.addSection("billingInfo_PAY");
  for (var i = 0; i < str.length; i++) {
    billingInfo_PAY.addParagraph(str[i].trim());
  }
}

function print_isrSupplierInfo(jsonInvoice, report, repStyleObj) {
  /*
    The purpose of this function is to print the supplier informations in the correct position
  */

  //Receipt
  var supplierInfo_REC = report.addSection("supplierInfo_REC");
  supplierInfo_REC.addParagraph(jsonInvoice["billing_info"]["iban_number"]);
  supplierInfo_REC.addParagraph(jsonInvoice["supplier_info"]["business_name"]);
  supplierInfo_REC.addParagraph(jsonInvoice["supplier_info"]["address1"]);
  supplierInfo_REC.addParagraph(jsonInvoice["supplier_info"]["postal_code"] + " " + jsonInvoice["supplier_info"]["city"]);

  //Payment
  var supplierInfo_PAY = report.addSection("supplierInfo_PAY");
  supplierInfo_PAY.addParagraph(jsonInvoice["billing_info"]["iban_number"]);
  supplierInfo_PAY.addParagraph(jsonInvoice["supplier_info"]["business_name"]);
  supplierInfo_PAY.addParagraph(jsonInvoice["supplier_info"]["address1"]);
  supplierInfo_PAY.addParagraph(jsonInvoice["supplier_info"]["postal_code"] + " " + jsonInvoice["supplier_info"]["city"]);
}

function print_isrAccount(jsonInvoice, report, repStyleObj, userParam) {
  /*
    The purpose of this function is to print the account number in the correct position
  */
  //Receipt
  var accountNumber_REC = report.addSection("accountNumber_REC");
  accountNumber_REC.addParagraph(userParam.isr_account);

  //Payment
  var accountNumber_PAY = report.addSection("accountNumber_PAY");
  accountNumber_PAY.addParagraph(userParam.isr_account);
}

function print_isrAmount(jsonInvoice, report, repStyleObj) {
  /*
    The purpose of this function is to print the total amount of the invoice in the correct position
  */
  var str = jsonInvoice["billing_info"]["total_to_pay"];
  var res = str.split('.');

  //Receipt
  var totalInvoiceFr_REC = report.addSection("totalInvoiceFr_REC");
  var totalInvoiceCts_REC = report.addSection("totalInvoiceCts_REC");
  //Payment
  var totalInvoiceFr_PAY = report.addSection("totalInvoiceFr_PAY");
  var totalInvoiceCts_PAY = report.addSection("totalInvoiceCts_PAY");

  if (Banana.SDecimal.sign(str) > 0) {
    //Receipt
    totalInvoiceFr_REC.addParagraph(res[0]);
    totalInvoiceCts_REC.addParagraph(res[1]);
    //Payment
    totalInvoiceFr_PAY.addParagraph(res[0]);
    totalInvoiceCts_PAY.addParagraph(res[1]);
  }
  else {
    //Receipt
    totalInvoiceFr_REC.addParagraph("***");
    totalInvoiceCts_REC.addParagraph("**");
    //Payment
    totalInvoiceFr_PAY.addParagraph("***");
    totalInvoiceCts_PAY.addParagraph("**");
  }
}

function print_isrCustomerInfo(jsonInvoice, report, repStyleObj, userParam) {
  /*
    The purpose of this function is to print the customer address in the correct position
  */
  var addressLines = getAddressLines(jsonInvoice["customer_info"], false);
  var pvrReference = pvrReferenceString(userParam.isr_id, jsonInvoice["customer_info"]["number"], pvrInvoiceNumber(jsonInvoice));
  pvrReference = pvrReference.substr(0,2) + " " +
  pvrReference.substr(2,5) + " " +
  pvrReference.substr(7,5) + " " +
  pvrReference.substr(12,5) + " " +
  pvrReference.substr(17,5) + " " +
  pvrReference.substr(22,5) + " " +
  pvrReference.substr(27,5);

  //Receipt
  var customerAddress_REC = report.addSection("customerAddress_REC");
  customerAddress_REC.addParagraph(pvrReference, "pvr_reference");
  for (var i = 0; i < addressLines.length; i++) {
    customerAddress_REC.addParagraph(addressLines[i]);
  }

  //Payment
  var customerAddress_PAY = report.addSection("customerAddress_PAY");
  for (var i = 0; i < addressLines.length; i++) {
    customerAddress_PAY.addParagraph(addressLines[i]);
  }

  //Reference number
  var referenceNumber_PAY = report.addSection("referenceNumber_PAY");
  referenceNumber_PAY.addParagraph(pvrReference);
}

function print_isrCode(jsonInvoice, report, repStyleObj, userParam) {
  /*
    The purpose of this function is to print the full PVR code in the correct position
  */
  var amount = jsonInvoice["billing_info"]["total_to_pay"];

  var pvrReference = pvrReferenceString(userParam.isr_id, jsonInvoice["customer_info"]["number"],
                                       pvrInvoiceNumber(jsonInvoice) );
  if (pvrReference.indexOf("@error")>=0) {
    Banana.document.addMessage( pvrReference, "error");
  }

  if (amount == '')
   amount = '0.00';

  var pvrFullCode = pvrCodeString(amount, pvrReference, userParam.isr_account);
  if (pvrFullCode.indexOf("@error")>=0) {
    Banana.document.addMessage( pvrFullCode, "error");
  }

  var pvrFullCode_PAY = report.addSection("pvrFullCode_PAY");
  if (Banana.SDecimal.sign(amount) >= 0) {
    pvrFullCode_PAY.addParagraph(pvrFullCode);
  }
}

function pvrCodeString(amount, pvrReference, ccpAccount) {
  /**
   * The function pvrCodeString build the code on the pvr,
   * as described under the document "Postinance, Descrizione dei record,
   * Servizi elettronici".
   * @userParam amount The amount of the pvr, have to contains 2 decimals (ex.: 1039.75).
   * @userParam pvrReference The refecence code of the pvr, have to be 27 digit length.
   * @userParam ccpAccount The CCP account number, the syntax have to be XX-YYYYY-ZZ.
   */
   
  // The amout have to be 10 digit lenght, prepend with zeros
  // Example: '18.79' => '00001879'
  if (amount.lastIndexOf('.') !== amount.length - 3) {
    return "@error Invalid amount, have to contain 2 decimals.";
  }

  var pvrAmount = amount.replace('.','').replace(' ', '');
  while (pvrAmount.length < 10) {
    pvrAmount = '0' + pvrAmount;
  }

  // The ccp account have to be 8 digit lenght, prepend the second part with zeros
  var cppAccountParts = ccpAccount.split('-');
  if (cppAccountParts.length < 3) {
    return "@error Invalid CCP account, syntax have to be 'XX-YYYYY-ZZ'. Your CCP account " + ccpAccount;
  }

  while (cppAccountParts[0].length + cppAccountParts[1].length < 8) {
    cppAccountParts[1] = '0' + cppAccountParts[1];
  }

  // Verify control digit of ccp account
  if (cppAccountParts[2] !== modulo10(cppAccountParts[0] + cppAccountParts[1])) {
    return "@error Invalid CCP, wrong control digit.";
  }

  var pvrAccount = cppAccountParts[0] + cppAccountParts[1] + cppAccountParts[2];

  // Verify control digit of CCP reference
  pvrReference = pvrReference.replace(/\s+/g, ''); //remove "white" spaces
  if (pvrReference.length !== 27) {
    return "@error Invalid PVR reference code, has to be 27 digit length.";
  }

  if (pvrReference[pvrReference.length-1] !== modulo10(pvrReference.substr(0,pvrReference.length-1))) {
    return "@error Invalid PVR reference, wrong control digit.";
  }

  var pvrType = "01";
  var pvrAmountControlDigit = modulo10(pvrType + pvrAmount);
  var pvrFullCode = pvrType + pvrAmount + pvrAmountControlDigit + '>' + pvrReference + "+ " + pvrAccount + ">";

  return pvrFullCode;
}

function pvrReferenceString(pvrId, customerNo, invoiceNo) {
  /**
   * The function pvrReferenceString build the pvr reference,
   * containg the pvr identification, the customer and the invoice number.
   * @userParam pvrId The pvr idetification number (given by the bank). Max 8 chars.
   * @userParam customerNo The customer number. Max 7 chars.
   * @userParam invoiceNo The invoice/oder number. Max 7 chars.
   */
  if (pvrId.length > 8)
    return "@error pvrId too long, max 8 chars. Your pvrId " + pvrId;
  else if (!pvrId.match(/^[0-9]*$/))
    return "@error pvrId invalid, only digits are permitted. Your pvrId " + pvrId ;
  else if (customerNo.length > 7)
    return "@error customerNo too long, max 7 digits. Your customerNo " + customerNo;
  else if (!customerNo.match(/^[0-9]*$/))
    return "@error customerNo invalid, only digits are permitted. Your customerNo " + customerNo;
  else if (invoiceNo.length > 7)
    return "@error invoiceNo too long, max 7 digits. Your invoiceNo " + invoiceNo;
  else if (!invoiceNo.match(/^[0-9]*$/))
    return "@error invoiceNo invalid, only digits are permitted. Your invoiceNo " + invoiceNo;

  var pvrReference = pvrId;
  while (pvrReference.length + customerNo.length < 18)
    pvrReference += "0";
  pvrReference += customerNo;
  while (pvrReference.length + invoiceNo.length < 25)
    pvrReference += "0";
  pvrReference += invoiceNo;
  pvrReference += "0";
  pvrReference += modulo10(pvrReference);

  return pvrReference;
}

function modulo10(string) {
  /**
  * The function modulo10 calculate the modulo 10 of a string,
  * as described under the document "Postinance, Descrizione dei record,
  * Servizi elettronici".
  */

  // Description of algorithm on
  // Postinance, Descrizione dei record, Servizi elettronici
  var modulo10Table = [
    [0, 9, 4, 6, 8, 2, 7, 1, 3, 5, "0"],
    [9, 4, 6, 8, 2, 7, 1, 3, 5, 0, "9"],
    [4, 6, 8, 2, 7, 1, 3, 5, 0, 9, "8"],
    [6, 8, 2, 7, 1, 3, 5, 0, 9, 4, "7"],
    [8, 2, 7, 1, 3, 5, 0, 9, 4, 6, "6"],
    [2, 7, 1, 3, 5, 0, 9, 4, 6, 8, "5"],
    [7, 1, 3, 5, 0, 9, 4, 6, 8, 2, "4"],
    [1, 3, 5, 0, 9, 4, 6, 8, 2, 7, "3"],
    [3, 5, 0, 9, 4, 6, 8, 2, 7, 1, "2"],
    [5, 0, 9, 4, 6, 8, 2, 7, 1, 3, "1"],
  ];

  var module10Report = 0;

  if (string) {
    for (var i = 0; i < string.length; i++) {
       switch (string[i]) {
       case "0":
          module10Report = modulo10Table[module10Report][0];
          break;
       case "1":
          module10Report = modulo10Table[module10Report][1];
          break;
       case "2":
          module10Report = modulo10Table[module10Report][2];
          break;
       case "3":
          module10Report = modulo10Table[module10Report][3];
          break;
       case "4":
          module10Report = modulo10Table[module10Report][4];
          break;
       case "5":
          module10Report = modulo10Table[module10Report][5];
          break;
       case "6":
          module10Report = modulo10Table[module10Report][6];
          break;
       case "7":
          module10Report = modulo10Table[module10Report][7];
          break;
       case "8":
          module10Report = modulo10Table[module10Report][8];
          break;
       case "9":
          module10Report = modulo10Table[module10Report][9];
          break;
       }
    }
  }

  return modulo10Table[module10Report][10];
}

function set_isr_style(reportObj, repStyleObj, userParam) {
  /*
    Set the styles of the isr slip
  */
  if (!repStyleObj)
  repStyleObj = reportObj.newStyleSheet();

  //Overwrite default page margin of 20mm
  var style = repStyleObj.addStyle("@page");
  style.setAttribute("margin", "0mm");
  //isr text position style.setAttribute('transform', 'matrix(1.0, 0.0, 0.0, 1.0, -5mm, -9mm)');
  style.setAttribute("transform", "matrix(" + userParam.isr_position_scaleX + ", 0.0, 0.0, " + userParam.isr_position_scaleY + "," + userParam.isr_position_dX + "," + userParam.isr_position_dY + ")");

  var rectangleStyle = repStyleObj.addStyle(".rectangle");
  rectangleStyle.setAttribute("width","50px");
  rectangleStyle.setAttribute("height","100mm");
  rectangleStyle.setAttribute("background-color","white");

  //PVR form position
  style = repStyleObj.addStyle(".pvr_Form");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "0mm");
  style.setAttribute("top", "190mm");
  style.setAttribute("color", "black");
  style.setAttribute("font-size", "10px");

  //printPvrBankInfo
  style = repStyleObj.addStyle(".billingInfo_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "4mm");
  style.setAttribute("top", "9mm");

  style = repStyleObj.addStyle(".billingInfo_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "64mm");
  style.setAttribute("top", "9mm");

  //printPvrSupplierInfo
  style = repStyleObj.addStyle(".supplierInfo_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "4mm");
  style.setAttribute("top", "22mm");

  style = repStyleObj.addStyle(".supplierInfo_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "64mm");
  style.setAttribute("top", "22mm");

  //printPvrAccount
  style = repStyleObj.addStyle(".accountNumber_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "30mm");
  style.setAttribute("top", "42mm");

  style = repStyleObj.addStyle(".accountNumber_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "90mm");
  style.setAttribute("top", "42mm");

  //printPvrAmount 
  style = repStyleObj.addStyle(".totalInvoiceFr_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "4mm");
  style.setAttribute("top", "51mm");
  style.setAttribute("width", "37mm");
  style.setAttribute("font-size", "11px");
  style.setAttribute("text-align", "right");

  style = repStyleObj.addStyle(".totalInvoiceCts_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "50mm");
  style.setAttribute("top", "51mm");
  style.setAttribute("font-size", "11px");

  style = repStyleObj.addStyle(".totalInvoiceFr_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "65mm");
  style.setAttribute("top", "51mm");
  style.setAttribute("width", "37mm");
  style.setAttribute("font-size", "11px");
  style.setAttribute("text-align", "right");

  style = repStyleObj.addStyle(".totalInvoiceCts_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "111mm");
  style.setAttribute("top", "51mm");
  style.setAttribute("font-size", "11px");

  //printPvrCustomerInfo
  style = repStyleObj.addStyle(".customerAddress_REC");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "4mm");
  style.setAttribute("top", "62mm");
  style.setAttribute("font-size", "10px");

  style = repStyleObj.addStyle(".customerAddress_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("left", "125mm");
  style.setAttribute("top", "50mm");
  style.setAttribute("font-size", "10px");

  //printPvrReference
  style = repStyleObj.addStyle(".referenceNumber_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("text-align", "center");
  style.setAttribute("left", "122mm");
  style.setAttribute("top", "34mm");
  style.setAttribute("width", "83mm");
  style.setAttribute("line-break-inside", "avoid");
  style.setAttribute("font-size", "10pt");
  style.setAttribute("font-family", "OCRB");

  //printPvrCode
  style = repStyleObj.addStyle(".pvrFullCode_PAY");
  style.setAttribute("position", "absolute");
  style.setAttribute("right", "6mm");
  style.setAttribute("text-align", "right");
  style.setAttribute("top", "85mm");
  style.setAttribute("font-size", "10pt");
  style.setAttribute("font-family", "OCRB");

  //receiptPvrReference
  style = repStyleObj.addStyle(".pvr_reference");
  style.setAttribute("font-size", "8px");
}







//====================================================================//
// STYLES
//====================================================================//
function set_variables(variables, userParam) {

  /* 
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
  
  /* Variables that set margins and text alignment of the Invoice Header */
  variables.$margin_top_header = "10mm";
  variables.$margin_right_header = "10mm";
  variables.$margin_left_header = "20mm";
  variables.$text_align_header = "right";

  /* Variables that set the margins and paddings of the Invoice Information */
  variables.$margin_top_info = "45mm";
  variables.$margin_right_info = "10mm";
  variables.$margin_left_info = "20mm";
  variables.$padding_top = "0px";
  variables.$padding_bottom = "0px";

  /* Variables that set font size, text alignment, borders and margins of the Invoice Address */ 
  variables.$font_size_sender_address = "7pt";
  variables.$text_align_sender_address = "center";
  variables.$border_bottom_sender_address = "1px solid black";
  variables.$margin_top_address = "45mm";
  variables.$margin_right_address = "10mm";
  variables.$margin_left_address = "123mm";

  /* Variables that set margins of the Invoice Shipping Address */
  variables.$margin_top_shipping_address = "75mm";
  variables.$margin_right_shipping_address = "10mm";
  variables.$margin_left_shipping_address = "20mm";

  /* Variables that set the font size and margins of the Invoice Begin Text */
  variables.$font_size_title = userParam.font_size*1.4 +"pt";
  variables.$margin_top_text_begin = "120mm";
  variables.$margin_right_text_begin = "10mm";
  variables.$margin_left_text_begin = "23mm";

  /* Variables that set font size, margins, padding and borders of the Invoice Details */
  variables.$font_size_total = userParam.font_size*1.2 +"pt";
  variables.$margin_top_details_first_page = "140mm";
  variables.$margin_top_details_other_pages = "90mm";
  variables.$margin_right_details = "10mm";
  variables.$margin_left_details = "23mm";
  variables.$padding = "3px";
  variables.$padding_right = "5px";
  variables.$padding_left = "5px";
  variables.$border_bottom_total = "1px double";

  /* Variables that set the font size, margins and borders of the Invoice Footer */
  variables.$font_size_footer = "8pt";
  variables.$margin_right_footer = "10mm";
  variables.$margin_bottom_footer = "20mm";
  variables.$margin_left_footer = "20mm";
  variables.$border_top_footer = "thin solid";


  /* If exists use the function defined by the user */
  if (typeof(hook_set_variables) === typeof(Function)) {
    hook_set_variables(variables, userParam);
  }
}

function set_invoice_style(reportObj, repStyleObj, variables, userParam) {

  /*
    Sets the invice style using the css variables.
  */

  // Set the stylesheet
  if (!repStyleObj) {
    repStyleObj = reportObj.newStyleSheet();
  }

  var style = "";

  // style = "counter-reset: page";
  // style = replaceVariables(style, variables);
  // repStyleObj.addStyle(".pageReset", style);

  style = "font-size:$font_size; font-family:$font_family; color:$text_color";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle("body", style);

  style = "text-align:right";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".right", style);

  style = "text-align:center";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".center", style);

  style = "font-weight:bold";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".bold", style);

  style = "font-weight:bold; color:$background_color_details_header; border-bottom:$border_bottom_total $background_color_details_header; font-size:$font_size_total";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".total_cell", style);

  style = "font-weight:bold; background-color:$background_color_details_header; color:$text_color_details_header;";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".subtotal_cell",style);

  style = "font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".vat_info", style);

  style = "background-color:$background_color_alternate_lines";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".even_rows_background_color", style);

  style = "border-bottom:2px solid $background_color_details_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".border-bottom", style);

  style = "border-top:thin solid $background_color_details_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".thin-border-top", style);

  style = "padding-right:$padding_right";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".padding-right", style);

  style = "padding-left:$padding_left";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".padding-left", style);

  style = "position:absolute; margin-top:$margin_top_header; margin-left:$margin_left_header; margin-right:$margin_right_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".header_left_text", style);

  style = "position:absolute; margin-top:$margin_top_header; margin-left:$margin_left_header; margin-right:$margin_right_header; text-align:$text_align_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".header_right_text", style);

  style = "position:absolute; margin-top:$margin_top_header; margin-left:$margin_left_header; margin-right:$margin_right_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".logo", style);

  style = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_info; margin-right:$margin_right_info; font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".info_table_left", style);

  style = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle("table.info_table_left td", style);

  style = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_address; margin-right:$margin_right_info; font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".info_table_right", style);

  style = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle("table.info_table_right td", style);

  style = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_info; margin-right:$margin_right_info; font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".info_table_row0", style);

  style = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle("table.info_table_row0 td", style);

  style = "display:none";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle("@page:first-view table.info_table_row0", style);

  style = "position:absolute; margin-top:$margin_top_address; margin-left:$margin_left_address; margin-right:$margin_right_address; font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".address_table_right", style);

  style = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_info; margin-right:$margin_right_info";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".address_table_left", style);

  style = "text-align:$text_align_sender_address; font-size:$font_size_sender_address; border-bottom:$border_bottom_sender_address"; 
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".small_address", style);

  style = "position:absolute; margin-top:$margin_top_shipping_address; margin-left:$margin_left_shipping_address; margin-right:$margin_right_shipping_address; font-size:$font_size";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".shipping_address", style);

  style = "font-size:$font_size_title; font-weight:bold; color:$background_color_details_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".title_text", style);

  style = "position:absolute; margin-top:$margin_top_text_begin; margin-left:$margin_left_text_begin; margin-right:$margin_right_text_begin; width:100%;";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".begin_text_table", style);

  style = "font-size:$font_size"; 
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".begin_text", style);

  style = "margin-top:$margin_top_details_first_page;";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".doc_table:first-view", style);

  style = "margin-top:$margin_top_details_other_pages; margin-left:$margin_left_details; margin-right:$margin_right_details; font-size:$font_size; width:100%";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".doc_table", style);

  style = "font-weight:bold; background-color:$background_color_details_header; color:$text_color_details_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".doc_table_header", style);

  style = "padding:$padding";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".doc_table_header td", style);

  style = "margin-left:$margin_left_footer; margin-right:$margin_right_footer; border-top:$border_top_footer $background_color_details_header";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".footer_line", style);

  style = "margin-bottom:$margin_bottom_footer; margin-left:$margin_left_footer; margin-right:$margin_right_footer; width:100%; font-size:$font_size_footer";
  style = replaceVariables(style, variables);
  repStyleObj.addStyle(".footer_table", style);




  /* 
    // Uncomment to show the borders of the tables
    
    repStyleObj.addStyle("table.info_table_left td", "border: thin solid black;");
    repStyleObj.addStyle("table.info_table_right td", "border: thin solid black");
    repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");
    repStyleObj.addStyle("table.address_table_right td", "border: thin solid black");
    repStyleObj.addStyle("table.address_table_left td", "border: thin solid black");
    repStyleObj.addStyle("table.shipping_address td", "border: thin solid black;");
    repStyleObj.addStyle("table.begin_text_table td", "border: thin solid black;");
    repStyleObj.addStyle("table.doc_table td", "border: thin solid black;");
    repStyleObj.addStyle("table.footer_table td", "border: thin solid black");
  */


  /* If exists use the function defined by the user */
  if (typeof(hook_set_invoice_style) === typeof(Function)) {
    hook_set_invoice_style(repStyleObj, variables, userParam);
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
  
  if (language === 'it') {
    //IT
    texts.shipping_address = "Indirizzo spedizione";
    texts.invoice = "Fattura";
    texts.date = "Data";
    texts.customer = "No cliente";
    texts.vat_number = "No IVA";
    texts.fiscal_number = "No fiscale";
    texts.payment_due_date_label = "Scadenza";
    texts.payment_terms_label = "Pagamento";
    texts.page = "Pagina";
    texts.credit_note = "Nota di credito";
    texts.column_description = "Description";
    texts.column_quantity = "Quantity";
    texts.column_reference_unit = "ReferenceUnit";
    texts.column_unit_price = "UnitPrice";
    texts.column_amount = "Amount";
    texts.description = "Descrizione";
    texts.quantity = "Quantità";
    texts.reference_unit = "Unità";
    texts.unit_price = "Prezzo Unità";
    texts.amount = "Importo";
    texts.totalnet = "Totale netto";
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
    texts.param_logo_name = "Nome logo (composizione formati logo)";
    texts.param_address_include = "Indirizzo cliente";
    texts.param_address_small_line = "Testo indirizzo mittente";
    texts.param_address_left = "Allinea a sinistra";
    texts.param_shipping_address = "Indirizzo spedizione";
    texts.param_info_include = "Informazioni";
    texts.param_info_invoice_number = "Numero fattura";
    texts.param_info_date = "Data fattura";
    texts.param_info_customer = "Numero cliente";
    texts.param_info_customer_vat_number = "Numero IVA cliente";
    texts.param_info_customer_fiscal_number = "Numero fiscale cliente";
    texts.param_info_due_date = "Scadenza fattura";
    texts.param_info_page = "Numero pagina";
    texts.param_details_include = "Dettagli fattura";
    texts.param_details_columns = "Nomi colonne";
    texts.param_details_columns_widths = "Larghezza colonne";
    texts.param_details_gross_amounts = "Importi lordi (IVA inclusa)";
    texts.param_footer_include = "Piè di pagina";
    texts.param_footer_add = "Stampa piè di pagina";
    texts.param_texts = "Testi (vuoto = valori predefiniti)";
    texts.param_languages = "Lingue";
    texts.languages_remove = "Desideri rimuovere '<removedLanguages>' dalla lista delle lingue?";
    texts.it_param_text_info_invoice_number = "Numero fattura";
    texts.it_param_text_info_date = "Data fattura";
    texts.it_param_text_info_customer = "Numero cliente";
    texts.it_param_text_info_customer_vat_number = "Numero IVA cliente";
    texts.it_param_text_info_customer_fiscal_number = "Numero fiscale cliente";
    texts.it_param_text_info_due_date = "Scadenza fattura";
    texts.it_param_text_info_page = "Numero pagina";
    texts.it_param_text_shipping_address = "Indirizzo spedizione";
    texts.it_param_text_title_doctype_10 = "Titolo fattura";
    texts.it_param_text_title_doctype_12 = "Titolo nota di credito";
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
    texts.param_embedded_javascript = "File JavaScript";
    texts.param_embedded_javascript_filename = "Nome file (colonna 'ID' tabella Documenti)";
    texts.param_tooltip_header_print = "Vista per includere l'intestazione della pagina";
    texts.param_tooltip_logo_print = "Vista per includere il logo";
    texts.param_tooltip_logo_name = "Inserisci il nome del logo";
    texts.param_tooltip_info_invoice_number = "Vista per includere il numero della fattura";
    texts.param_tooltip_info_date = "Vista per includere la data della fattura";
    texts.param_tooltip_info_customer = "Vista per includere il numero del cliente";
    texts.param_tooltip_info_customer_vat_number = "Vista per includere il numero IVA del cliente";
    texts.param_tooltip_info_customer_fiscal_number = "Vista per includere il numero fiscale del cliente";
    texts.param_tooltip_info_due_date = "Vista per includere la data di scadenza della fattura";
    texts.param_tooltip_info_page = "Vista per includere il numero di pagina";
    texts.param_tooltip_languages = "Aggiungi o rimuovi una o più lingue";
    texts.param_tooltip_text_info_invoice_number = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_text_info_date = "Inserisci un testo per sostituire quello predefinito";
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
    texts.param_tooltip_header_row_1 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_2 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_3 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_4 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_header_row_5 = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_address_small_line = "Inserisci l'indirizzo del mittente subito sopra all'indirizzo del cliente";
    texts.param_tooltip_shipping_address = "Vista per stampare l'indirizzo di spedizione";
    texts.param_tooltip_address_left = "Vista per allineare l'indirizzo del cliente a sinistra";
    texts.param_tooltip_details_gross_amounts = "Vista per stampare i dettagli della fattura con gli importi al lordo e IVA inclusa";
    texts.param_tooltip_text_final = "Inserisci un testo per sostituire quello predefinito";
    texts.param_tooltip_footer_add = "Vista stampare il piè di pagina";
    texts.param_tooltip_footer = "Inserisci il testo piè di pagina";
    texts.param_tooltip_font_family = "Inserisci il tipo di carattere (ad es. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Inserisci la dimensione del carattere (ad es. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Inserisci il colore per il testo (ad es. '#000000' oppure 'Black')";
    texts.param_tooltip_background_color_details_header = "Inserisci il colore per lo sfondo dell'intestazione dei dettagli (ad es. '#337ab7' oppure 'Blue')";
    texts.param_tooltip_text_color_details_header = "Inserisci il colore per il testo dell'intestazione dei dettagli (ad es. '#ffffff' oppure 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Inserisci il colore per lo sfondo delle rige alternate (ad es. '#F0F8FF' oppure 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Inserisci il nome del file JavaScript (.js) della colonna 'ID' tabella Documenti (ad es. File.js)";
    texts.param_isr = "PVR";
    texts.param_print_isr = 'Stampa PVR';
    texts.param_isr_bank_name = 'Nome banca (solo con conto bancario, con conto postale lasciare vuoto)';
    texts.param_isr_bank_address = 'Indirizzo banca (solo con conto bancario, con conto postale lasciare vuoto)';
    texts.param_isr_account = 'Conto PVR (numero di cliente PVR)';
    texts.param_isr_id = 'Numero di adesione PVR (solo con conto bancario, con conto postale lasciare vuoto)';
    texts.param_isr_position_scaleX = 'Scala orizzontale caratteri (default 1.0)';
    texts.param_isr_position_scaleY = 'Scala verticale caratteri (default 1.0)';
    texts.param_isr_position_dX = 'PVR X-Position mm (default 0)';
    texts.param_isr_position_dY = 'PVR Y-Position mm (default 0)';
    texts.param_isr_on_new_page = 'Stampa polizza di versamento su pagina separata';
    texts.param_tooltip_print_isr = "Vista per stampare la polizza di versamento PVR";
    texts.param_tooltip_isr_bank_name = "Inserisci il nome della banca nel PVR";
    texts.param_tooltip_isr_bank_address = "Inserisci l'indirizzo della banca nel PVR";
    texts.param_tooltip_isr_account = "Inserisci il numero di conto del PVR";
    texts.param_tooltip_isr_id = "Inserisci il numero di adesione del PVR";
    texts.param_tooltip_isr_position_scaleX = "Inserisci un valore per sostituire quello predefinito";
    texts.param_tooltip_isr_position_scaleY = "Inserisci un valore per sostituire quello predefinito";
    texts.param_tooltip_isr_position_dX = "Inserisci un valore per sostituire quello predefinito";
    texts.param_tooltip_isr_position_dY = "Inserisci un valore per sostituire quello predefinito";
    texts.param_tooltip_isr_on_new_page = "Vista per stampare la polizza di versamento su una pagina separata";
  }
  else if (language === 'de') {
    //DE
    texts.shipping_address = "Lieferadresse";
    texts.invoice = "Rechnung";
    texts.date = "Datum";
    texts.customer = "Kundennummer";
    texts.vat_number = "MwSt/USt-Nummer";
    texts.fiscal_number = "Steuernummer";
    texts.payment_due_date_label = "Fälligkeitsdatum";
    texts.payment_terms_label = "Bezahlung";
    texts.page = "Seite";
    texts.credit_note = "Gutschrift";
    texts.column_description = "Beschreibung";
    texts.column_quantity = "Menge";
    texts.column_reference_unit = "Referenzeinheit";
    texts.column_unit_price = "Preiseinheit";
    texts.column_amount = "Betrag";
    texts.description = "Beschreibung";
    texts.quantity = "Menge";
    texts.reference_unit = "Einheit";
    texts.unit_price = "Preiseinheit";
    texts.amount = "Betrag";
    texts.totalnet = "Netto-Betrag";
    texts.vat = "MwSt/USt-Nummer";
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
    texts.param_shipping_address = "Lieferadresse";
    texts.param_info_include = "Info";
    texts.param_info_invoice_number = "Rechnungsnummer";
    texts.param_info_date = "Rechnungsdatum";
    texts.param_info_customer = "Kundennummer";
    texts.param_info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
    texts.param_info_customer_fiscal_number = "Kunden-Steuernummer";
    texts.param_info_due_date = "Fälligkeitsdatum";
    texts.param_info_page = "Seitenzahlen";
    texts.param_details_include = "Rechnungsdetails einschliessen";
    texts.param_details_columns = "Spaltennamen";
    texts.param_details_columns_widths = "Spaltenbreite";
    texts.param_details_gross_amounts = "Bruttobeträgen (inklusive MwSt/USt)";
    texts.param_footer_include = "Fusszeile";
    texts.param_footer_add = "Fusszeile drucken";
    texts.param_texts = "Texte (leer = Standardwerte)";
    texts.param_languages = "Sprachen";
    texts.languages_remove = "Möchten Sie '<removedLanguages>' aus der Liste der Sprachen streichen?";
    texts.de_param_text_info_invoice_number = "Rechnungsnummer";
    texts.de_param_text_info_date = "Rechnungsdatum";
    texts.de_param_text_info_customer = "Kundennummer";
    texts.de_param_text_info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
    texts.de_param_text_info_customer_fiscal_number = "Kunden-Steuernummer";
    texts.de_param_text_info_due_date = "Fälligkeitsdatum";
    texts.de_param_text_info_page = "Seitennummer";
    texts.de_param_text_shipping_address = "Lieferadresse";
    texts.de_param_text_title_doctype_10 = "Rechnungstitel (Schriftgrösse=10)";
    texts.de_param_text_title_doctype_12 = "Gutschriftstitel (Schriftgrösse=12)";
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
    texts.param_embedded_javascript = "Benutzerdefinierte JavaScript-Datei";
    texts.param_embedded_javascript_filename = "Dateiname ('ID-Spalte Dokumente-Tabelle)";
    texts.param_tooltip_header_print = "Aktivieren, um Seitenkopf einzuschliessen";
    texts.param_tooltip_logo_print = "Aktivieren, um Logo einzuschliessen";
    texts.param_tooltip_logo_name = "Logo-Name eingeben";
    texts.param_tooltip_info_invoice_number = "Aktivieren, um Rechnungsnummer einzuschliessen";
    texts.param_tooltip_info_date = "Aktivieren, um Rechnungsdatum einzuschliessen";
    texts.param_tooltip_info_customer = "Aktivieren, um Kundennummer einzuschliessen";
    texts.param_tooltip_info_customer_vat_number = "Aktivieren, um Kunden-MwSt/USt-Nummer einzuschliessen";
    texts.param_tooltip_info_customer_fiscal_number = "Aktivieren, um Kunden-Steuernummer einzuschliessen";
    texts.param_tooltip_info_due_date = "Aktivieren, um Fälligkeitsdatum der Rechnung einzuschliessen";
    texts.param_tooltip_info_page = "Aktivieren, um Seitennummer einzuschliessen";
    texts.param_tooltip_languages = "Sprachen hinzufügen oder entfernen";
    texts.param_tooltip_text_info_invoice_number = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_text_info_date = "Text eingeben, um Standardtext zu ersetzen";
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
    texts.param_tooltip_header_row_1 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_2 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_3 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_4 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_header_row_5 = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_address_small_line = "Lieferanten-Adresszeile direkt über Kundenadresse eingeben";
    texts.param_tooltip_shipping_address = "Aktivieren, um Lieferadresse zu drucken";
    texts.param_tooltip_address_left = "Aktivieren, um Kundenadresse auf der linken Seite zu drucken";
    texts.param_tooltip_details_gross_amounts = "Aktivieren, um Rechnungsdetails mit Bruttobeträgen und enthaltener MwSt/USt zu drucken";
    texts.param_tooltip_text_final = "Text eingeben, um Standardtext zu ersetzen";
    texts.param_tooltip_footer_add = "Aktivieren, um Fusszeile unten auf der Seite zu drucken";
    texts.param_tooltip_footer = "Fusszeilentext eingeben";
    texts.param_tooltip_font_family = "Schriftart eingeben (z.B. Arial, Helvetica, Times New Roman, usw.)";
    texts.param_tooltip_font_size = "Schriftgrösse eingeben (z.B. 10, 11, 12, usw.)";
    texts.param_tooltip_text_color = "Farbe eingeben (z.B. '#000000' oder 'Black')";
    texts.param_tooltip_background_color_details_header = "Farbe eingeben (z.B. '#337ab7' oder 'Blau')";
    texts.param_tooltip_text_color_details_header = "Textfarbe eingeben (z.B. '#ffffff' oder 'Weiss')";
    texts.param_tooltip_background_color_alternate_lines = "Farbe Zeilenhintergrund der Details eingeben (z.B. '#F0F8FF' oder 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Javaskript-Dateiname der 'ID'-Spalte Dokumente-Tabelle eingeben (z.B. Filejs)";
    texts.param_isr = 'ESR';
    texts.param_print_isr = 'ESR ausdrucken';
    texts.param_isr_bank_name = 'Name der Bank (nur Bankkonto, mit Postkonto leer lassen)';
    texts.param_isr_bank_address = 'Bankadresse (nur Bankkonto, mit Postkonto leer lassen)';
    texts.param_isr_account = 'ESR-Konto (ESR-Kundennummer)';
    texts.param_isr_id = 'ESR-Teilnehmernummer (nur Bankkonto, mit Postkonto leer lassen)';
    texts.param_isr_position_scaleX = 'Horizontale Zeichenskalierung (default 1.0)';
    texts.param_isr_position_scaleY = 'Vertikale Zeichenskalierung (default 1.0)';
    texts.param_isr_position_dX = 'ESR X-Position mm (default 0)';
    texts.param_isr_position_dY = 'ESR Y-Position mm (default 0)';
    texts.param_isr_on_new_page = 'ESR auf ein separates Blatt drucken';
    texts.param_tooltip_print_isr = "Aktivieren, um Einzahlungsschein (ESR) zu drucken";
    texts.param_tooltip_isr_bank_name = "Namen der Bank im ESR eingeben";
    texts.param_tooltip_isr_bank_address = "Bankadresse im ESR eingeben";
    texts.param_tooltip_isr_account = "ESR-Konto eingeben";
    texts.param_tooltip_isr_id = "ESR-Teilnehmer-Nr. eingeben";
    texts.param_tooltip_isr_position_scaleX = "Wert eingeben, um Standardwert zu ersetzen";
    texts.param_tooltip_isr_position_scaleY = "Wert eingeben, um Standardwert zu ersetzen";
    texts.param_tooltip_isr_position_dX = "Wert eingeben, um Standardwert zu ersetzen";
    texts.param_tooltip_isr_position_dY = "Wert eingeben, um Standardwert zu ersetzen";
    texts.param_tooltip_isr_on_new_page = "Aktivieren, um Einzahlungsschein auf separater Seite zu drucken";
  }
  else if (language === 'fr') {
    //FR
    texts.shipping_address = "Adresse de livraison";
    texts.invoice = "Facture";
    texts.date = "Date";
    texts.customer = "Numéro Client";
    texts.vat_number = "Numéro de TVA";
    texts.fiscal_number = "Numéro fiscal";
    texts.payment_due_date_label = "Échéance";
    texts.payment_terms_label = "Paiement";
    texts.page = "Page";
    texts.credit_note = "Note de crédit";
    texts.column_description = "Description";
    texts.column_quantity = "Quantité";
    texts.column_reference_unit = "RéférenceUnité";
    texts.column_unit_price = "PrixUnitaire";
    texts.column_amount = "Montant";
    texts.description = "Description";
    texts.quantity = "Quantité";
    texts.reference_unit = "Unité";
    texts.unit_price = "Prix Unitaire";
    texts.amount = "Montant";
    texts.totalnet = "Total net";
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
    texts.param_logo_name = "Nom du logo (composition formats de logo)";
    texts.param_address_include = "Adresse client";
    texts.param_address_small_line = "Texte adresse de l'expéditeur";
    texts.param_address_left = "Aligner à gauche";
    texts.param_shipping_address = "Adresse de livraison";
    texts.param_info_include = "Informations";
    texts.param_info_invoice_number = "Numéro de facture";
    texts.param_info_date = "Date facture";
    texts.param_info_customer = "Numéro Client";
    texts.param_info_customer_vat_number = "Numéro de TVA client";
    texts.param_info_customer_fiscal_number = "Numéro fiscal client";
    texts.param_info_due_date = "Échéance facture";
    texts.param_info_page = "Numéro de page";
    texts.param_details_include = "Détails de la facture";
    texts.param_details_columns = "Noms des colonnes";
    texts.param_details_columns_widths = "Largeur des colonnes";
    texts.param_details_gross_amounts = "Montants bruts (TVA incluse)";
    texts.param_footer_include = "Pied de page";
    texts.param_footer_add = "Imprimer pied de page";
    texts.param_texts = "Textes (vide = valeurs par défaut)";
    texts.param_languages = "Langue";
    texts.languages_remove = "Souhaitez-vous supprimer '<removedLanguages>' de la liste des langues?";
    texts.fr_param_text_info_invoice_number = "Numéro de facture";
    texts.fr_param_text_info_date = "Date facture";
    texts.fr_param_text_info_customer = "Numéro Client";
    texts.fr_param_text_info_customer_vat_number = "Numéro de TVA client";
    texts.fr_param_text_info_customer_fiscal_number = "Numéro fiscal client";
    texts.fr_param_text_info_due_date = "Échéance facture";
    texts.fr_param_text_info_page = "Numéro de page";
    texts.fr_param_text_shipping_address = "Adresse de livraison";
    texts.fr_param_text_title_doctype_10 = "Titre de la facture";
    texts.fr_param_text_title_doctype_12 = "Titre note de crédit ";
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
    texts.param_embedded_javascript = "Fichier JavaScript ";
    texts.param_embedded_javascript_filename = "Nom fichier (colonne 'ID' du tableau Documents)";
    texts.param_tooltip_header_print = "Activer pour inclure l'en-tête de la page";
    texts.param_tooltip_logo_print = "Activer pour inclure le logo";
    texts.param_tooltip_logo_name = "Insérer le nom du logo";
    texts.param_tooltip_info_invoice_number = "Activer pour inclure le numéro de la facture";
    texts.param_tooltip_info_date = "Activer pour inclure la date de la facture";
    texts.param_tooltip_info_customer = "Activer pour inclure le numéro client";
    texts.param_tooltip_info_customer_vat_number = "Activer pour inclure le numéro de TVA du client";
    texts.param_tooltip_info_customer_fiscal_number = "Activer pour inclure le numéro fiscal du client";
    texts.param_tooltip_info_due_date = "Activer pour inclure la date d'échéance de la facture";
    texts.param_tooltip_info_page = "Activer pour inclure le numéro de page";
    texts.param_tooltip_languages = "Ajouter ou supprimer une ou plusieurs langues";
    texts.param_tooltip_text_info_invoice_number = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_text_info_date = "Insérez un texte pour remplacer le texte par défaut";
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
    texts.param_tooltip_header_row_1 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_2 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_3 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_4 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_header_row_5 = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_address_small_line = "Insérer l'adresse de l'expéditeur juste au-dessus de l'adresse du client";
    texts.param_tooltip_shipping_address = "Activer pour imprimer l'adresse de livraison";
    texts.param_tooltip_address_left = "Activer pour aligner l'adresse du client à gauche";
    texts.param_tooltip_details_gross_amounts = "Activer pour imprimer les détails de la facture avec les montants bruts et la TVA incluse";
    texts.param_tooltip_text_final = "Insérez un texte pour remplacer le texte par défaut";
    texts.param_tooltip_footer_add = "Activer pour imprimer le pied de page";
    texts.param_tooltip_footer = "Insérer le texte pour la pied de page";
    texts.param_tooltip_font_family = "Insérer le type de caractère (p. ex. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Insérer la taille du caractère (p. ex. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Insérer la couleur pour le texte (p. ex '#000000' ou 'Black')";
    texts.param_tooltip_background_color_details_header = "Insérer la couleur de fond de l'en-tête des détails (p. ex. '#337ab7' ou 'Blue')";
    texts.param_tooltip_text_color_details_header = "Insérer la couleur de texte de l'en-tête des détails (p. ex. '#ffffff' ou 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Insérer la couleur de fond pour les lignes alternées (p. ex. '#F0F8FF' ou 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Insérer le nom du fichier JavaScript (.js) de la colonne 'ID' du tableau Documents (p. ex. File.js)";
    texts.param_isr = 'BVR';
    texts.param_print_isr = 'Imprimer BVR';
    texts.param_isr_bank_name = 'Compte bancaire (seulement avec compte bancaire, avec compte postal laisser vide)';
    texts.param_isr_bank_address = 'Adresse de la banque (seulement avec compte bancaire, avec compte postal laisser vide)';
    texts.param_isr_account = 'Compte BVR (numéro de client BVR)';
    texts.param_isr_id = 'Numéro d’adhérent BVR (seulement avec compte bancaire, avec compte postal laisser vide)';
    texts.param_isr_position_scaleX = 'Décalage horizontal caractère (default 1.0)';
    texts.param_isr_position_scaleY = 'Décalage vertical caractère (default 1.0)';
    texts.param_isr_position_dX = 'BVR X-Position mm (default 0)';
    texts.param_isr_position_dY = 'BVR Y-Position mm (default 0)';
    texts.param_isr_on_new_page = 'Imprimer le bulletin sur une page séparée';
    texts.param_tooltip_print_isr = "Activer pour imprimer le bulletin de versement BVR";
    texts.param_tooltip_isr_bank_name = "Insérer le nom de la banque dans le BVR";
    texts.param_tooltip_isr_bank_address = "Insérer l'adresse de la banque dans le BVR";
    texts.param_tooltip_isr_account = "Insérer le numéro de compte du BVR";
    texts.param_tooltip_isr_id = "Insérer le numéro d'adhésion du BVR";
    texts.param_tooltip_isr_position_scaleX = "Insérez une valeur pour remplacer la valeur par défaut";
    texts.param_tooltip_isr_position_scaleY = "Insérez une valeur pour remplacer la valeur par défaut";
    texts.param_tooltip_isr_position_dX = "Insérez une valeur pour remplacer la valeur par défaut";
    texts.param_tooltip_isr_position_dY = "Insérez une valeur pour remplacer la valeur par défaut";
    texts.param_tooltip_isr_on_new_page = "Activer pour imprimer le bulletin de versement sur une nouvelle page";
  }
  else {
    //EN
    texts.shipping_address = "Shipping address";
    texts.invoice = "Invoice";
    texts.date = "Date";
    texts.customer = "Customer No";
    texts.vat_number = "VAT No";
    texts.fiscal_number = "Fiscal No";
    texts.payment_due_date_label = "Due date";
    texts.payment_terms_label = "Payment";
    texts.page = "Page";
    texts.credit_note = "Credit note";
    texts.column_description = "Description";
    texts.column_quantity = "Quantity";
    texts.column_reference_unit = "ReferenceUnit";
    texts.column_unit_price = "UnitPrice";
    texts.column_amount = "Amount";
    texts.description = "Description";
    texts.quantity = "Quantity";
    texts.reference_unit = "Unit";
    texts.unit_price = "Unit Price";
    texts.amount = "Amount";
    texts.totalnet = "Total net";
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
    texts.param_logo_name = "Logo name (composition of logo formats)";
    texts.param_address_include = "Customer address";
    texts.param_address_small_line = "Sender address text";
    texts.param_address_left = "Align left";
    texts.param_shipping_address = "Shipping address";
    texts.param_info_include = "Information";
    texts.param_info_invoice_number = "Invoice number";
    texts.param_info_date = "Invoice date";
    texts.param_info_customer = "Customer number";
    texts.param_info_customer_vat_number = "Customer VAT number";
    texts.param_info_customer_fiscal_number = "Customer fiscal number";
    texts.param_info_due_date = "Invoice due date";
    texts.param_info_page = "Page number";
    texts.param_details_include = "Invoice details";
    texts.param_details_columns = "Column names";
    texts.param_details_columns_widths = "Column width";
    texts.param_details_gross_amounts = "Gross amounts (VAT included)";
    texts.param_footer_include = "Footer";
    texts.param_footer_add = "Print footer";
    texts.param_texts = "Texts (empty = default values)";
    texts.param_languages = "Languages";
    texts.languages_remove = "Do you want to remove '<removedLanguages>' from the language list?";
    texts.en_param_text_info_invoice_number = "Invoice number";
    texts.en_param_text_info_date = "Invoice date";
    texts.en_param_text_info_customer = "Customer number";
    texts.en_param_text_info_customer_vat_number = "Customer VAT number";
    texts.en_param_text_info_customer_fiscal_number = "Customer fiscal number";
    texts.en_param_text_info_due_date = "Invoice due date";
    texts.en_param_text_info_page = "Page number";
    texts.en_param_text_shipping_address = "Shipping address";
    texts.en_param_text_title_doctype_10 = "Invoice title";
    texts.en_param_text_title_doctype_12 = "Credit note title";
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
    texts.param_font_family = "Font type";
    texts.param_font_size = "Font size";
    texts.embedded_javascript_file_not_found = "JavaScript file not found or invalid";
    texts.param_embedded_javascript = "JavaScript file";
    texts.param_embedded_javascript_filename = "File name (column 'ID' of table Documents)";
    texts.param_tooltip_header_print = "Check to include page header";
    texts.param_tooltip_logo_print = "Check to include logo";
    texts.param_tooltip_logo_name = "Enter the logo name";
    texts.param_tooltip_info_invoice_number = "Check to include the invoice number";
    texts.param_tooltip_info_date = "Check to include invoice date";
    texts.param_tooltip_info_customer = "Check to include customer number";
    texts.param_tooltip_info_customer_vat_number = "Check to include customer's VAT number";
    texts.param_tooltip_info_customer_fiscal_number = "Check to include customer's fiscal number";
    texts.param_tooltip_info_due_date = "Check to include the due date of the invoice";
    texts.param_tooltip_info_page = "Check to include the page number";
    texts.param_tooltip_languages = "Add or remove one or more languages";
    texts.param_tooltip_text_info_invoice_number = "Enter text to replace the default one";
    texts.param_tooltip_text_info_date = "Enter text to replace the default";
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
    texts.param_tooltip_header_row_1 = "Insert text to replace default";
    texts.param_tooltip_header_row_2 = "Enter text to replace the default";
    texts.param_tooltip_header_row_3 = "Enter text to replace the default";
    texts.param_tooltip_header_row_4 = "Enter text to replace the default";
    texts.param_tooltip_header_row_5 = "Enter text to replace the default";
    texts.param_tooltip_address_small_line = "Enter the sender's address just above the customer's address";
    texts.param_tooltip_shipping_address = "Check to print the shipping address";
    texts.param_tooltip_address_left = "Check to align customer address on the left";
    texts.param_tooltip_details_gross_amounts = "Check to print invoice details with gross amounts and VAT included";
    texts.param_tooltip_text_final = "Enter text to replace the default"; 
    texts.param_tooltip_footer_add = "Check to print the footer";
    texts.param_tooltip_footer = "Enter footer text";
    texts.param_tooltip_font_family = "Enter font type (e.g. Arial, Helvetica, Times New Roman, ...)";
    texts.param_tooltip_font_size = "Enter font size (e.g. 10, 11, 12, ...)";
    texts.param_tooltip_text_color = "Enter color for the text (e.g. '#000000' or 'Black')";
    texts.param_tooltip_background_color_details_header = "Enter color for the background of header details (e.g. '#337ab7' or 'Blue')";
    texts.param_tooltip_text_color_details_header = "Enter color for the text of header details (e.g. '#ffffff' or 'White')";
    texts.param_tooltip_background_color_alternate_lines = "Enter color for the background of alternate lines (e.g. '#F0F8FF' or 'LightSkyBlue')";
    texts.param_tooltip_javascript_filename = "Enter name of the javascript file taken from the 'ID' column of the table 'Documents' (i.e. file.js)";
    texts.param_isr = "ISR";
    texts.param_print_isr = "Print ISR";
    texts.param_isr_bank_name = "Bank name (only with bank account, with postal account leave blank)";
    texts.param_isr_bank_address = "Bank address (only with bank account, with postal account leave blank)";
    texts.param_isr_account = "ISR Account (ISR customer number)";
    texts.param_isr_id = "ISR subscriber number (only with bank account, with postal account leave blank)";
    texts.param_isr_position_scaleX = "Character Horizontal Scaling (default 1.0)";
    texts.param_isr_position_scaleY = "Character Vertical Scaling (default 1.0)";
    texts.param_isr_position_dX = "ISR X-Position mm (default 0)";
    texts.param_isr_position_dY = "ISR Y-Position mm (default 0)";
    texts.param_isr_on_new_page = "Print ISR on a new page";
    texts.param_tooltip_print_isr = "Check to print the ISR payment slip";
    texts.param_tooltip_isr_bank_name = "Insert the bank name on the ISR";
    texts.param_tooltip_isr_bank_address = "Insert the bank address on the ISR";
    texts.param_tooltip_isr_account = "Insert the ISR account number";
    texts.param_tooltip_isr_id = "Insert the ISR subscriber number";
    texts.param_tooltip_isr_position_scaleX = "Enter a value to replace the default";
    texts.param_tooltip_isr_position_scaleY = "Enter a value to replace the default";
    texts.param_tooltip_isr_position_dX = "Enter a value to replace the default";
    texts.param_tooltip_isr_position_dY = "Enter a value to replace the default";
    texts.param_tooltip_isr_on_new_page = "Check to print the ISR on a new page";
  }
  return texts;
}

