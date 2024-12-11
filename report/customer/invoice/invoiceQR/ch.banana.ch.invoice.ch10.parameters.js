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




/* User parameters update: 2024-12-11 */




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

  if (IS_INTEGRATED_INVOICE) {
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
  }

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

  if (!IS_INTEGRATED_INVOICE) {
    currentParam = {};
    currentParam.name = 'info_custom_fields';
    currentParam.parentObject = 'info_include';
    currentParam.title = texts.param_info_custom_fields;
    currentParam.type = 'bool';
    currentParam.value = userParam.info_custom_fields ? true : false;
    currentParam.defaultvalue = false;
    currentParam.tooltip = texts.param_tooltip_info_custom_fields;
    currentParam.readValue = function() {
      userParam.info_custom_fields = this.value;
    }
    convertedParam.data.push(currentParam);
  } else {
    userParam.info_custom_fields = false;
  }

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


  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.10.21348") >= 0) {
    /**
      Predefined columns.

      Integrated invoices and Estimates-Invoices:
        1. Description;Amount
        2. Description;Quantity;ReferenceUnit;UnitPrice;Amount
        3. Number;Description;Amount
        4. Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount
        5. I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount (ADVANCED)
        6. Description;Quantity;ReferenceUnit;UnitPrice;VatRate;Amount
      Estimates-Invoices only:
        7. Description;Discount;Amount (ADVANCED)
        8. Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
        9. Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
     */
    var predefinedColumns = [];
    predefinedColumns.push(texts.predefined_columns_0);
    predefinedColumns.push(texts.predefined_columns_1);
    predefinedColumns.push(texts.predefined_columns_2);
    predefinedColumns.push(texts.predefined_columns_3);
    predefinedColumns.push(texts.predefined_columns_4);
    predefinedColumns.push(texts.predefined_columns_5);
    predefinedColumns.push(texts.predefined_columns_6);

    var predefinedColumnsEstInv = [];
    predefinedColumnsEstInv.push(texts.predefined_columns_7);
    predefinedColumnsEstInv.push(texts.predefined_columns_8);
    predefinedColumnsEstInv.push(texts.predefined_columns_9);

    var currentParam = {};
    currentParam.name = 'details_columns_predefined';
    currentParam.parentObject = 'details_include';
    currentParam.title = texts.param_details_columns_predefined;
    currentParam.type = 'combobox';
    if (IS_INTEGRATED_INVOICE) {
      currentParam.items = predefinedColumns;
    } else {
      currentParam.items = predefinedColumns.concat(predefinedColumnsEstInv);
    }
    currentParam.value = userParam.details_columns_predefined ? userParam.details_columns_predefined : '';
    currentParam.defaultvalue = texts.predefined_columns_0;
    currentParam.tooltip = texts.param_tooltip_details_columns_predefined;
    currentParam.readValue = function () {
      userParam.details_columns_predefined = this.value;
    }
    convertedParam.data.push(currentParam);
  }


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

    if (IS_INTEGRATED_INVOICE) {
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
    }

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
    * PROFORMA INVOICE PARAMETERS
    ********************************************************************************************/
    var currentParam = {};
    currentParam.name = langCode+'_proforma_invoice';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts.proforma_invoice;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_proforma_invoice';
    currentParam.parentObject = langCode+'_proforma_invoice';
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_proforma_invoice'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_proforma_invoice'] ? userParam[langCode+'_title_proforma_invoice'] : '';
    currentParam.defaultvalue = langTexts.proforma_invoice + " <DocInvoice>";
    currentParam.tooltip = langTexts['param_tooltip_title_proforma_invoice'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_proforma_invoice'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin_proforma_invoice';
    currentParam.parentObject = langCode+'_proforma_invoice';
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin_proforma_invoice'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin_proforma_invoice'] ? userParam[langCode+'_text_begin_proforma_invoice'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin_proforma_invoice'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_begin_proforma_invoice'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final_proforma_invoice';
    currentParam.parentObject = langCode+'_proforma_invoice';
    currentParam.title = langTexts[langCodeTitle+'_param_text_final_proforma_invoice'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final_proforma_invoice'] ? userParam[langCode+'_text_final_proforma_invoice'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final_proforma_invoice'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam[langCode+'_text_final_proforma_invoice'] = this.value;
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


    
    /*******************************************************************************************
    * DELIVERY NOTE PARAMETERS
    ********************************************************************************************/
    var currentParam = {};
    currentParam.name = langCode+'_delivery_note';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts.delivery_note;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_delivery_note_number';
    currentParam.parentObject = langCode+'_delivery_note';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_delivery_note_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_delivery_note_number'] ? userParam[langCode+'_text_info_delivery_note_number'] : '';
    currentParam.defaultvalue = langTexts.number_delivery_note;
    currentParam.tooltip = langTexts['param_tooltip_text_info_delivery_note_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_delivery_note_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_date_delivery_note';
    currentParam.parentObject = langCode+'_delivery_note';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_date_delivery_note'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_date_delivery_note'] ? userParam[langCode+'_text_info_date_delivery_note'] : '';
    currentParam.defaultvalue = langTexts.date_delivery_note;
    currentParam.tooltip = langTexts['param_tooltip_text_info_date_delivery_note'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_date_delivery_note'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_delivery_note';
    currentParam.parentObject = langCode+'_delivery_note';
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_delivery_note'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_delivery_note'] ? userParam[langCode+'_title_delivery_note'] : '';
    currentParam.defaultvalue = langTexts.delivery_note;
    currentParam.tooltip = langTexts['param_tooltip_title_delivery_note'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_delivery_note'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin_delivery_note';
    currentParam.parentObject = langCode+'_delivery_note';
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin_delivery_note'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin_delivery_note'] ? userParam[langCode+'_text_begin_delivery_note'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin_delivery_note'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin_delivery_note'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final_delivery_note';
    currentParam.parentObject = langCode+'_delivery_note';
    currentParam.title = langTexts[langCodeTitle+'_param_text_final_delivery_note'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final_delivery_note'] ? userParam[langCode+'_text_final_delivery_note'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final_delivery_note'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final_delivery_note'] = this.value;
    }
    convertedParam.data.push(currentParam);
 
 
 
    /*******************************************************************************************
    * REMINDERS PARAMETERS
    ********************************************************************************************/
    var currentParam = {};
    currentParam.name = langCode+'_reminder';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts.reminder;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
    userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    if (IS_INTEGRATED_INVOICE) {
      // invoice date, reminder date, reminder due date
      // are available only on integrated invoice
      // on application estimates-invoices, reminders never have these dates

      currentParam = {};
      currentParam.name = langCode+'_text_info_invoice_date_reminder';
      currentParam.parentObject = langCode+'_reminder';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_invoice_date_reminder'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_invoice_date_reminder'] ? userParam[langCode+'_text_info_invoice_date_reminder'] : '';
      currentParam.defaultvalue = langTexts.invoice_date;
      currentParam.tooltip = langTexts['param_tooltip_text_info_invoice_date_reminder'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
        userParam[langCode+'_text_info_invoice_date_reminder'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_info_date_reminder';
      currentParam.parentObject = langCode+'_reminder';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_date_reminder'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_date_reminder'] ? userParam[langCode+'_text_info_date_reminder'] : '';
      currentParam.defaultvalue = langTexts.reminder_date;
      currentParam.tooltip = langTexts['param_tooltip_text_info_date_reminder'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
        userParam[langCode+'_text_info_date_reminder'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_info_due_date_reminder';
      currentParam.parentObject = langCode+'_reminder';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_due_date_reminder'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_due_date_reminder'] ? userParam[langCode+'_text_info_due_date_reminder'] : '';
      currentParam.defaultvalue = langTexts.reminder_due_date;
      currentParam.tooltip = langTexts['param_tooltip_text_info_due_date_reminder'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
        userParam[langCode+'_text_info_due_date_reminder'] = this.value;
      }
      convertedParam.data.push(currentParam);
    }

    currentParam = {};
    currentParam.name = langCode+'_title_reminder';
    currentParam.parentObject = langCode+'_reminder';
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_reminder'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_reminder'] ? userParam[langCode+'_title_reminder'] : '';
    currentParam.defaultvalue = '%1. ' + langTexts.reminder;
    currentParam.tooltip = langTexts['param_tooltip_title_reminder'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_reminder'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin_reminder';
    currentParam.parentObject = langCode+'_reminder';
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin_reminder'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin_reminder'] ? userParam[langCode+'_text_begin_reminder'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin_reminder'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin_reminder'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final_reminder';
    currentParam.parentObject = langCode+'_reminder';
    currentParam.title = langTexts[langCodeTitle+'_param_text_final_reminder'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final_reminder'] ? userParam[langCode+'_text_final_reminder'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final_reminder'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final_reminder'] = this.value;
    }
    convertedParam.data.push(currentParam);



    /*******************************************************************************************
    * ORDER CONFIRMATION
    ********************************************************************************************/
    var currentParam = {};
    currentParam.name = langCode+'_order_confirmation';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts.order_confirmation;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_order_confirmation_number';
    currentParam.parentObject = langCode+'_order_confirmation';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_order_confirmation_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_order_confirmation_number'] ? userParam[langCode+'_text_info_order_confirmation_number'] : '';
    currentParam.defaultvalue = langTexts.number_order_confirmation;
    currentParam.tooltip = langTexts['param_tooltip_text_info_order_confirmation_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_order_confirmation_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_date_order_confirmation';
    currentParam.parentObject = langCode+'_order_confirmation';
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_date_order_confirmation'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_date_order_confirmation'] ? userParam[langCode+'_text_info_date_order_confirmation'] : '';
    currentParam.defaultvalue = langTexts.date_order_confirmation;
    currentParam.tooltip = langTexts['param_tooltip_text_info_date_order_confirmation'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_date_order_confirmation'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_order_confirmation';
    currentParam.parentObject = langCode+'_order_confirmation';
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_order_confirmation'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_order_confirmation'] ? userParam[langCode+'_title_order_confirmation'] : '';
    currentParam.defaultvalue = langTexts.order_confirmation;
    currentParam.tooltip = langTexts['param_tooltip_title_order_confirmation'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_order_confirmation'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin_order_confirmation';
    currentParam.parentObject = langCode+'_order_confirmation';
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin_order_confirmation'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin_order_confirmation'] ? userParam[langCode+'_text_begin_order_confirmation'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_begin_order_confirmation'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin_order_confirmation'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final_order_confirmation';
    currentParam.parentObject = langCode+'_order_confirmation';
    currentParam.title = langTexts[langCodeTitle+'_param_text_final_order_confirmation'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final_order_confirmation'] ? userParam[langCode+'_text_final_order_confirmation'] : '';
    currentParam.defaultvalue = '';
    currentParam.tooltip = langTexts['param_tooltip_text_final_order_confirmation'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final_order_confirmation'] = this.value;
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
  currentParam.type = 'color';
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
  currentParam.type = 'color';
  currentParam.value = userParam.background_color_details_header ? userParam.background_color_details_header : '#FFFFFF';
  currentParam.defaultvalue = '#FFFFFF';
  currentParam.tooltip = texts.param_tooltip_background_color_details_header;
  currentParam.readValue = function() {
   userParam.background_color_details_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_color_details_header';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_text_color_details_header;
  currentParam.type = 'color';
  currentParam.value = userParam.text_color_details_header ? userParam.text_color_details_header : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.tooltip = texts.param_tooltip_text_color_details_header;
  currentParam.readValue = function() {
   userParam.text_color_details_header = this.value;
  }
  convertedParam.data.push(currentParam);
  
  currentParam = {};
  currentParam.name = 'background_color_alternate_lines';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_background_color_alternate_lines;
  currentParam.type = 'color';
  currentParam.value = userParam.background_color_alternate_lines ? userParam.background_color_alternate_lines : '#FFFFFF';
  currentParam.defaultvalue = '#FFFFFF';
  currentParam.tooltip = texts.param_tooltip_background_color_alternate_lines;
  currentParam.readValue = function() {
   userParam.background_color_alternate_lines = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_title_total';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color_title_total;
  currentParam.type = 'color';
  currentParam.value = userParam.color_title_total ? userParam.color_title_total : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.tooltip = texts.param_tooltip_color_title_total;
  currentParam.readValue = function() {
   userParam.color_title_total = this.value;
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


  /*******************************************************************************************
  * DEVELOP
  *******************************************************************************************/
  if (BAN_ADVANCED) {
    currentParam = {};
    currentParam.name = 'develop';
    currentParam.title = texts.param_develop;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
      userParam.develop = this.value;
    }
    convertedParam.data.push(currentParam);

    //JSON of invoice, parameters, preferences and QRCode text
    currentParam = {};
    currentParam.name = 'dev_show_json';
    currentParam.parentObject = 'develop';
    currentParam.title = texts.param_dev_show_json;
    currentParam.type = 'bool';
    currentParam.value = userParam.dev_show_json ? true : false;
    currentParam.defaultvalue = false;
    currentParam.tooltip = texts.param_tooltip_dev_show_json;
    currentParam.readValue = function() {
     userParam.dev_show_json = this.value;
    }
    convertedParam.data.push(currentParam);
  }
  
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
  userParam.info_custom_fields = false;
  userParam.details_columns_predefined = texts.predefined_columns_0;
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

    //Delivery note
    userParam[langCodes[i]+'_text_info_delivery_note_number'] = langTexts.number_delivery_note;
    userParam[langCodes[i]+'_text_info_date_delivery_note'] = langTexts.date_delivery_note;
    userParam[langCodes[i]+'_title_delivery_note'] = langTexts.delivery_note;
    userParam[langCodes[i]+'_text_begin_delivery_note'] = '';
    userParam[langCodes[i]+'_text_final_delivery_note'] = '';

    //Reminder
    userParam[langCodes[i]+'_text_info_invoice_date_reminder'] = langTexts.invoice_date;
    userParam[langCodes[i]+'_text_info_date_reminder'] = langTexts.reminder_date;
    userParam[langCodes[i]+'_text_info_due_date_reminder'] = langTexts.reminder_due_date;
    userParam[langCodes[i]+'_title_reminder'] = '%1. ' + langTexts.reminder;
    userParam[langCodes[i]+'_text_begin_reminder'] = '';
    userParam[langCodes[i]+'_text_final_reminder'] = '';

    //Proforma Invoice
    userParam[langCodes[i]+'_title_proforma_invoice'] = langTexts.proforma_invoice + " <DocInvoice>";
    userParam[langCodes[i]+'_text_begin_proforma_invoice'] = '';
    userParam[langCodes[i]+'_text_final_proforma_invoice'] = '';

    //Order Confirmation
    userParam[langCodes[i]+'_text_info_order_confirmation_number'] = langTexts.number_order_confirmation;
    userParam[langCodes[i]+'_text_info_date_order_confirmation'] = langTexts.date_order_confirmation;
    userParam[langCodes[i]+'_title_order_confirmation'] = langTexts.order_confirmation;
    userParam[langCodes[i]+'_text_begin_order_confirmation'] = '';
    userParam[langCodes[i]+'_text_final_order_confirmation'] = '';
  }

  //Styles
  userParam.text_color = '#000000';
  userParam.background_color_details_header = '#FFFFFF';
  userParam.text_color_details_header = '#000000';
  userParam.background_color_alternate_lines = '#FFFFFF';
  userParam.color_title_total = '#000000';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

  //Embedded JavaScript/css file
  userParam.embedded_javascript_filename = '';
  userParam.embedded_css_filename = '';

  //Invoice JSON
  userParam.dev_show_json = false;

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
  if (!userParam.info_custom_fields) {
    userParam.info_custom_fields = false;
  }
  if (!userParam.details_columns_predefined) {
    userParam.details_columns_predefined = texts.predefined_columns_0;
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

    //Delivery note
    if (!userParam[langCodes[i]+'_text_info_delivery_note_number']) {
      userParam[langCodes[i]+'_text_info_delivery_note_number'] = langTexts.number_delivery_note;
    }
    if (!userParam[langCodes[i]+'_text_info_date_delivery_note']) {
      userParam[langCodes[i]+'_text_info_date_delivery_note'] = langTexts.date_delivery_note;
    }
    if (!userParam[langCodes[i]+'_title_delivery_note']) {
      userParam[langCodes[i]+'_title_delivery_note'] = langTexts.delivery_note;
    }
    if (!userParam[langCodes[i]+'_text_begin_delivery_note']) {
      userParam[langCodes[i]+'_text_begin_delivery_note'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_delivery_note']) {
      userParam[langCodes[i]+'_text_final_delivery_note'] = "";
    }

    //Reminder
    if (!userParam[langCodes[i]+'_text_info_invoice_date_reminder']) {
      userParam[langCodes[i]+'_text_info_invoice_date_reminder'] = langTexts.invoice_date;
    }    
    if (!userParam[langCodes[i]+'_text_info_date_reminder']) {
      userParam[langCodes[i]+'_text_info_date_reminder'] = langTexts.reminder_date;
    }
    if (!userParam[langCodes[i]+'_text_info_due_date_reminder']) {
      userParam[langCodes[i]+'_text_info_due_date_reminder'] = langTexts.reminder_due_date;
    }
    if (!userParam[langCodes[i]+'_title_reminder']) {
      userParam[langCodes[i]+'_title_reminder'] = '%1. ' + langTexts.reminder;
    }
    if (!userParam[langCodes[i]+'_text_begin_reminder']) {
      userParam[langCodes[i]+'_text_begin_reminder'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_reminder']) {
      userParam[langCodes[i]+'_text_final_reminder'] = "";
    }

    //Proforma Invoice
    if (!userParam[langCodes[i]+'_title_proforma_invoice']) {
      userParam[langCodes[i]+'_title_proforma_invoice'] = langTexts.proforma_invoice + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_text_begin_proforma_invoice']) {
      userParam[langCodes[i]+'_text_begin_proforma_invoice'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_proforma_invoice']) {
      userParam[langCodes[i]+'_text_final_proforma_invoice'] = "";
    }

    //Order Confirmation
    if (!userParam[langCodes[i]+'_text_info_order_confirmation_number']) {
      userParam[langCodes[i]+'_text_info_order_confirmation_number'] = langTexts.number_order_confirmation;
    }
    if (!userParam[langCodes[i]+'_text_info_date_order_confirmation']) {
      userParam[langCodes[i]+'_text_info_date_order_confirmation'] = langTexts.date_order_confirmation;
    }
    if (!userParam[langCodes[i]+'_title_order_confirmation']) {
      userParam[langCodes[i]+'_title_order_confirmation'] = langTexts.order_confirmation;
    }
    if (!userParam[langCodes[i]+'_text_begin_order_confirmation']) {
      userParam[langCodes[i]+'_text_begin_order_confirmation'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_order_confirmation']) {
      userParam[langCodes[i]+'_text_final_order_confirmation'] = "";
    }


  }


  // Styles
  if (!userParam.text_color) {
    userParam.text_color = '#000000';
  }
  if (!userParam.background_color_details_header) {
    userParam.background_color_details_header = '#FFFFFF';
  }
  if (!userParam.text_color_details_header) {
    userParam.text_color_details_header = '#000000';
  }
  if (!userParam.background_color_alternate_lines) {
    userParam.background_color_alternate_lines = '#FFFFFF';
  }
  if (!userParam.hasOwnProperty('color_title_total')) {
    // Property doesn't exists: using old version of settings parameters.
    // In this case use the same color as the previous version of settings parameters.
    userParam.color_title_total = userParam.background_color_details_header;
  } else {
    if (!userParam.color_title_total) {
      userParam.color_title_total = '#000000';
    }
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

  //Develop
  if (!userParam.dev_show_json || !BAN_ADVANCED) {
    userParam.dev_show_json = false;
  }

  return userParam;
}



//====================================================================//
// Change parameters for specific events
//====================================================================//
function onCurrentIndexChanged_details_columns_predefined(index, value, userParam) {
  /**
  * function called by combobox 'details_columns_predefined', event currentIndexChanged
  */
  
  // 1. Description;Amount
  // 2. Description;Quantity;ReferenceUnit;UnitPrice;Amount
  // 3. Number;Description;Amount
  // 4. Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount
  // 5. I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount (ADVANCED)
  // 6. Description;Quantity;ReferenceUnit;UnitPrice;VatRate;Amount
  // 7. Description;Discount;Amount (ADVANCED)
  // 8. Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
  // 9. Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)

  var texts = setInvoiceTexts(lang);

  if (parseInt(index) == 1) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_1));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '80%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Montant';
      }
    }
  }
  else if (parseInt(index) == 2) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_2));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '40%;15%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Quantity;Unit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
    }
  }
  else if (parseInt(index) == 3) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_3));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Description;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '20%;60%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Description;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Descrizione;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Beschreibung;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Libellé;Montant';
      }
    }
  }
  else if (parseInt(index) == 4) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_4));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '10%;30%;15%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Description;Quantity;Unit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
    }
  }
  else if (parseInt(index) == 5) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_5).replace(" (ADVANCED)",""));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '12%;10%;23%;10%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;left;right;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;left;right;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Image;Item;Description;Quantity;Unit;Unit Price;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Immagine;Articolo;Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Bild;Artikel;Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Image;Article;Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
    }
  }
  else if (parseInt(index) == 6) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_6));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Quantity;ReferenceUnit;UnitPrice;VatRate;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '40%;10%;10%;20%;10%;10%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;center;right;center;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;center;right;center;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Quantity;Unit;UnitPrice;%VAT;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Quantità;Unità;Prezzo Unità;%IVA;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Menge;Einheit;Preiseinheit;MWST%;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Quantité;Unité;Prix Unitaire;%TVA;Montant';
      }
    }
  }
  else if (parseInt(index) == 7 && !IS_INTEGRATED_INVOICE) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_7).replace(" (ADVANCED)",""));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '60%;20%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Rabais;Montant';
      }
    }
  }
  else if (parseInt(index) == 8 && !IS_INTEGRATED_INVOICE) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_8).replace(" (ADVANCED)",""));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '30%;10%;10%;20%;15%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;center;right;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;center;right;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Quantity;Unit;Unit Price;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Quantità;Unità;Prezzo Unità;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Menge;Einheit;Preiseinheit;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Quantité;Unité;Prix Unitaire;Rabais;Montant';
      }
    }
  }
  else if (parseInt(index) == 9 && !IS_INTEGRATED_INVOICE) {
    var answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_9).replace(" (ADVANCED)",""));
    if (!answer) {
      for (var i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (var i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '8%;12%;20%;10%;8%;20%;10%;12%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;left;right;center;right;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;left;right;center;right;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Date;Description;Quantity;Unit;Unit Price;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Data;Descrizione;Quantità;Unità;Prezzo Unità;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Datum;Beschreibung;Menge;Einheit;Preiseinheit;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Date;Libellé;Quantité;Unité;Prix Unitaire;Rabais;Montant';
      }
    }
  }

  return userParam;
}

