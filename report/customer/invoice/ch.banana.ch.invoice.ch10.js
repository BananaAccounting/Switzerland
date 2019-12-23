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
// @pubdate = 2019-12-23
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

  currentParam = {};
  currentParam.name = 'isr_image_background';
  currentParam.parentObject = 'isr';
  currentParam.title = texts.param_isr_image_background;
  currentParam.type = 'bool';
  currentParam.value = userParam.isr_image_background ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_isr_image_background;
  currentParam.readValue = function() {
   userParam.isr_image_background = this.value;
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
  userParam.isr_image_background = false;

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
  if (!userParam.isr_image_background) {
    userParam.isr_image_background = false;
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
        // Default quantity uses 2 decimals. We check if there is a quantity with 4 decimals and in case we use it.
        if (item.mesure_unit) {
          var decimals = 2;
          var res = item.quantity.split(".");
          if (res[1] && res[1].length == 4) {
            decimals = 4;
          }
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
        // Default quantity uses 2 decimals. We check if there is a quantity with 4 decimals and in case we use it.
        if (item.mesure_unit) {
          var decimals = 2;
          var res = item.quantity.split(".");
          if (res[1] && res[1].length == 4) {
            decimals = 4;
          }
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
  print_isrImage(pvrForm, repStyleObj, userParam);
  print_isrBankInfo(jsonInvoice, pvrForm, repStyleObj);
  print_isrSupplierInfo(jsonInvoice, pvrForm, repStyleObj);
  print_isrAccount(jsonInvoice, pvrForm, repStyleObj, userParam);
  print_isrAmount(jsonInvoice, pvrForm, repStyleObj);
  print_isrCustomerInfo(jsonInvoice, pvrForm, repStyleObj, userParam);
  print_isrCode(jsonInvoice, pvrForm, repStyleObj, userParam);
  return pvrForm;
}

function print_isrImage(report, repStyleObj, userParam) {
  /*
    The purpose of this function is to add the background of the ISR.
  */
  if (userParam.isr_image_background) {
    // base64 code string
    var base64Image = "data:image/png;base64,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";
    report.addImage(base64Image,"isrImageStyle");
  }
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

  //isr image
  style = repStyleObj.addStyle(".isrImageStyle");
  style.setAttribute("position", "absolute");
  style.setAttribute("height", "104mm");
}







//====================================================================//
// STYLES
//====================================================================//
function set_variables(variables, userParam) {

  /* 
    Sets all the variables values.
  */

  variables.decimals_quantity = "";
  variables.decimals_unit_price = 2;
  variables.decimals_amounts = 2;


  /* General */
  variables.$text_color = userParam.text_color;
  variables.$background_color_details_header = userParam.background_color_details_header;
  variables.$text_color_details_header = userParam.text_color_details_header;
  variables.$background_color_alternate_lines = userParam.background_color_alternate_lines;
  
  variables.$font_family = userParam.font_family;
  variables.$font_size = userParam.font_size+"pt";
  
  /* Header */
  variables.$margin_top_header = "10mm";
  variables.$margin_right_header = "10mm";
  variables.$margin_left_header = "20mm";
  variables.$text_align_header = "right";

  /* Info invoice */
  variables.$margin_top_info = "45mm";
  variables.$margin_right_info = "10mm";
  variables.$margin_left_info = "20mm";
  variables.$padding_top = "0px";
  variables.$padding_bottom = "0px";

  /* Address invoice */
  variables.$font_size_sender_address = "7pt";
  variables.$text_align_sender_address = "center";
  variables.$border_bottom_sender_address = "1px solid black";
  variables.$margin_top_address = "45mm";
  variables.$margin_right_address = "10mm";
  variables.$margin_left_address = "123mm";

  /* Shipping address */
  variables.$margin_top_shipping_address = "75mm";
  variables.$margin_right_shipping_address = "10mm";
  variables.$margin_left_shipping_address = "20mm";

  /* Text begin */
  variables.$font_size_title = userParam.font_size*1.4 +"pt";
  variables.$margin_top_text_begin = "120mm";
  variables.$margin_right_text_begin = "10mm";
  variables.$margin_left_text_begin = "23mm";

  /* Details invoice */
  variables.$font_size_total = userParam.font_size*1.2 +"pt";
  variables.$margin_top_details_first_page = "140mm";
  variables.$margin_top_details_other_pages = "90mm";
  variables.$margin_right_details = "10mm";
  variables.$margin_left_details = "23mm";
  variables.$padding = "3px";
  variables.$padding_right = "5px";
  variables.$padding_left = "5px";
  variables.$border_bottom_total = "1px double";

  /* Footer */
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
    texts.param_isr_image_background = "Stampa sfondo polizza versamento PVR";
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
    texts.param_tooltip_isr_image_background = "Vista per stampare lo sfondo della polizza di versamento PVR";
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
    texts.param_isr_image_background = "ESR-Hintergrund drucken";
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
    texts.param_tooltip_isr_image_background = "Aktivieren, um ESR-Hintergrund zu drucken";
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
    texts.param_isr_image_background = "Imprimer le fond du bulletin de versement BVR";
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
    texts.param_tooltip_isr_image_background = "Activer pour imprimer le fond du bulletin de versement BVR";
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
    texts.param_isr_image_background = "Print ISR background";
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
    texts.param_tooltip_isr_image_background = "Check to print the ISR payment slip background";
  }
  return texts;
}

