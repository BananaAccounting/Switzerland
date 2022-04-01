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
// @id = ch.banana.ch.app.letterqrmultiple
// @api = 1.2.0
// @pubdate = 2022-04-01
// @publisher = Banana.ch SA
// @description = QR-Bill with letter
// @description.it = Lettera più destinatari con bollettino QR Svizzera
// @description.de = QR-Rechnung mit Brief
// @description.fr = QR-Facture avec lettre
// @description.en = QR-Bill with letter
// @doctype = *
// @task = app.command
// @timeout = -1
// @includejs = swissqrcode.js
// @includejs = checkfunctions.js



/*
  SUMMARY
  =======
  Extensions that prints multiple letters with the Swiss QR Code.
  Data of the customer and the amount is taken from the table.
  All the text of the letter is entered using the parameters.
*/


// Define the required version of Banana Accounting / Banana Dev Channel
var BAN_VERSION = "10.0.12";
var BAN_EXPM_VERSION = "22089";


function exec(string) {

  if (!Banana.document) {
    return "@Cancel";
  }

  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
  if (isCurrentBananaVersionSupported) {

    // Initialize user parameters
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

    var report = Banana.Report.newReport("QR-Bill report");
    var stylesheet = Banana.Report.newStyleSheet();
    

    /**
     * Print multiple reports from table
     */

    //Retrieve the rows to print
    var rowsToPrint = [];
    rowsToPrint = getRowsToPrint(userParam);

    //Check and exclude the rows without amount and rows with the name that starts with *
    rowsToPrint = checkRowsToPrint(Banana.document, userParam, rowsToPrint);

    if (rowsToPrint.length > 0) {
      
      for (var i = 0; i < rowsToPrint.length; i++) {
        
        var rowObject = {};
        rowObject = getRowObject(Banana.document, rowObject, rowsToPrint[i]);
        
        var reportParam = {};
        reportParam = initReportMultiple(Banana.document, userParam, reportParam, rowObject, rowsToPrint[i]);

        printReport(Banana.document, report, stylesheet, reportParam, rowsToPrint[i]);

        //Banana.console.log(JSON.stringify(reportParam, "", " "));

        // Page break at the end of all the pages (except the last)
        if (i < rowsToPrint.length-1) {
          report.addPageBreak();
        }
      }
    }
    else {
      return "@Cancel";
    }
    
    // Set styles and preview
    setCss(Banana.document, stylesheet, reportParam);
    Banana.Report.preview(report, stylesheet);
  }
}


//
// MULTIPLE REPORT WITH TABLE
// 
function getRowsToPrint(userParam) {

  /**
   * Returns an array with the rows number to print
   * 1. retrieve rows entered in parameters
   * 2. check these rows and exclude rows that cannot be printed (no amount, name starts with *)
   */

  var rows = [];

  //List or rows ("1,2,3")
  if (userParam.print_multiple_rows.indexOf(",") > -1) {
    var tmpRows = userParam.print_multiple_rows.split(",");
    for (var i = 0; i < tmpRows.length; i++) {
      rows.push(Number(tmpRows[i]));
    }
  }

  //Range from .. to..  ("1-3")
  else if (userParam.print_multiple_rows.indexOf("-") > -1) {
    var tmpRows = userParam.print_multiple_rows.split("-");
    var from = tmpRows[0];
    var to = tmpRows[1];
    for (var i = from; i <= to; i++) {
      rows.push(Number(i));
    }
  }

  //Single row ("1", "2", "3")
  else if (userParam.print_multiple_rows.match(/^[0-9]+$/) !== null) {
    rows.push(Number(userParam.print_multiple_rows));
  }

  //All the rows ("*")
  else if (userParam.print_multiple_rows === "*") {
    var table = Banana.document.table('QRCode');
    for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var indexRow = tRow.rowNr+1; //index rows start from 0
      if (!tRow.isEmpty) {
        rows.push(Number(indexRow));
      }
    }
  }

  return rows;
}

function checkRowsToPrint(banDoc, userParam, rows) {

  /**
   * Returns an array with the rows number to print
   * 
   * Check and exclude rows that cannot be printed:
   * - rows with column Name that starts with "*"
   * - rows with all Amount columns that are empty (no amounts)
   */

  var rowsToRemove = [];
  var table = banDoc.table('QRCode');
  var tColumnNames = table.columnNames;

  //
  // 1. Check if the column Name starts with *
  //    If so, exclude the row from the rows to print
  //
  for (var i = 0; i < table.rowCount; i++) {
    var tRow = table.row(i);
    var indexRow = tRow.rowNr+1; //index rows start from 0
    if (!tRow.isEmpty) {
      if (tRow.value("Name").startsWith("*")) {
        rowsToRemove.push(indexRow);
      }
    }
  }

  //
  // 2. Check if all the Amounts columns are empty (no amount)
  //
  //    - Take all the columns names that starts with "Amount" (XML value)
  //    - In the table check that all these columns have a value
  //    - If all the Amount column are empty (no amount) exclude the row from the rows to print
  //
  // Checks only when the "Exclude amount" parameter is false

  if (!userParam.print_multiple_empty_amount) {

    var columnsAmount = [];
    for (var j = 0; j < tColumnNames.length; j++) {
      if (tColumnNames[j].startsWith("Amount")) {
        columnsAmount.push(tColumnNames[j]);
      }
    }

    for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var indexRow = tRow.rowNr+1;

      if (!tRow.isEmpty) {
        var emptyColumnsAmount = [];
        for (var j = 0; j < columnsAmount.length; j++) {
          if (!tRow.value(columnsAmount[j])) {
            emptyColumnsAmount.push(indexRow);
          }
        }
        //Banana.console.log(emptyColumnsAmount);
        if (emptyColumnsAmount.length === columnsAmount.length) {
          rowsToRemove.push(indexRow);
        }
      }
    }

    //Remove duplicates from array rowsToRemove
    for (var i = 0; i < rowsToRemove.length; i++) {
      for (var x = i+1; x < rowsToRemove.length; x++) {
        if (rowsToRemove[x] === rowsToRemove[i]) {
          rowsToRemove.splice(x,1);
          --x;
        }
      }
    }
  
  }


  // Remove the rows that must be excluded from the print
  for (var i = 0; i < rowsToRemove.length; i++) {
    if (rows.indexOf(rowsToRemove[i]) > -1) {
      //Banana.console.log("... to remove.... " + rowsToRemove[i]);
      rows.splice(rows.indexOf(rowsToRemove[i]), 1);
    }
  }

  return rows;
}

function getRowObject(banDoc, reportParam, rows) {

  /**
   * Creates row objects with the data from the table
   */

  var table = banDoc.table('QRCode');
  var tColumnNames = table.columnNames;
  reportParam.table = [];

  // For each row defined in the parameters
  // Take the row from the table and create an object of the row
  if (rows) {

    for (var i = 0; i < table.rowCount; i++) {
      
      var tRow = table.row(i);
      var indexRow = tRow.rowNr+1; //index rows start from 0

      //not empty rows
      if (!tRow.isEmpty && indexRow == rows) {
        var row = {'row':indexRow};
        for (var j = 0; j < tColumnNames.length; j++) {
          row[tColumnNames[j]] = tRow.value(tColumnNames[j]);
        }
        reportParam.table.push(row);          
      }
    }
  }

  //Banana.console.log(JSON.stringify(reportParam, "", " "));

  return reportParam;
}

function initReportMultiple(banDoc, userParam, reportParam, rowObject, rows) {

  /* Initialize QR settings */
  var qrSettings = initQRSettings(userParam);

  // Get QR section data
  setSenderAddress(banDoc, userParam, qrSettings);
  setCustomerAddressMultiple(userParam, qrSettings, rowObject, rows);
  setAmountMultiple(userParam, qrSettings, rowObject, rows);
  setAdditionalInformatioMultiple(userParam, qrSettings, rowObject, rows);
  
  // Clone the object
  reportParam = JSON.parse(JSON.stringify(userParam));

  // Merge the two objects
  reportParam = Object.assign(reportParam, qrSettings);

  // Merge the two objects
  reportParam = Object.assign(reportParam, rowObject);

  // Banana.console.log(JSON.stringify(reportParam, "", " "));

  return reportParam;
}

function setSenderAddress(banDoc, userParam, qrSettings) {

  /**
   * With extension parameter settins we use the 'Structured' address type (S)
   * With address from accounting we use 'Combined' address type (K)
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

function setCustomerAddressMultiple(userParam, qrSettings, rowObject, rows) {

  var tableRows = rowObject.table;
  for (var i = 0; i < tableRows.length; i++) {

    if (tableRows[i].row == rows) {

      //Initialize customer address "Strucured type"
      userParam.customer_address_prefix = tableRows[i].NamePrefix;
      userParam.customer_address_name = tableRows[i].Name;
      userParam.customer_address_address = tableRows[i].Street;
      userParam.customer_address_house_number = tableRows[i].AddressExtra; // .HouseNumber
      userParam.customer_address_postal_code = tableRows[i].PostalCode;
      userParam.customer_address_locality = tableRows[i].Locality;
      userParam.customer_address_country_code = tableRows[i].CountryCode;
      if (!userParam.customer_address_country_code) {
        userParam.customer_address_country_code = "CH";
      }

      qrSettings.qr_code_empty_address = false;

      if (tableRows[i].AddressExtra) {
        qrSettings.qr_code_debtor_address_type = 'S';
      }
    }
  }
}

function setAmountMultiple(userParam, qrSettings, rowObject, rows) {

  var tableRows = rowObject.table;
  for (var i = 0; i < tableRows.length; i++) {

    if (tableRows[i].row == rows) {

      var totalToPay = "";

      // Check if the object has a property name that starts with "Amount" (columns Amount, Amount1, Amount2,...)
      var propertyNames = Object.keys(tableRows[i]).filter(function (propertyName) {
        
        // Property name starts with "Amount" and it's not empty
        if (propertyName.startsWith("Amount") && tableRows[i][propertyName]) {
          //Banana.console.log(propertyName + " : " + tableRows[i][propertyName]);
          totalToPay = Banana.SDecimal.add(totalToPay, tableRows[i][propertyName]);
        }
      });

      //Banana.console.log(totalToPay);

      //Add a property with the total amount of all columns
      tableRows[i].ColumnsAmountTotal = totalToPay;

      userParam.billing_info_total_to_pay = totalToPay; //;tableRows[i].Amount;
      qrSettings.qr_code_empty_amount = false;

      if (userParam.print_multiple_empty_amount) {
        qrSettings.qr_code_empty_amount = true;
      }

      //Currency defined in QRtable, otherwise use CHF
      if (tableRows[i].Currency) {
        userParam.currency = tableRows[i].Currency;
      }
      else {
        userParam.currency = "CHF";
      }
    }
  }
}

function setAdditionalInformatioMultiple(userParam, qrSettings, rowObject, rows) {

  var tableRows = rowObject.table;
  
  for (var i = 0; i < tableRows.length; i++) {
    
    if (tableRows[i].row == rows) {
      
      if (tableRows[i].AdditionalInformation) {
        qrSettings.qr_code_additional_information = tableRows[i].AdditionalInformation;
      }
      else {
        qrSettings.qr_code_additional_information = '';
      }
    }
  }
}

function printReport(banDoc, report, stylesheet, reportParam, row) {

  //Banana.console.log(JSON.stringify(reportParam, "", " "));

  // Set sections of the report
  var sectionSenderAddress = report.addSection("sender-address");
  
  var sectionDate;
  if (!reportParam.print_sender_address && !reportParam.print_customer_address) {
    sectionDate = report.addSection("date-without-addresses");
  }
  else {
    sectionDate = report.addSection("date");
  }

  var sectionCustomerAddress = report.addSection("customer-address");
  
  var sectionLetter;
  if (!reportParam.print_sender_address && !reportParam.print_customer_address && !reportParam.print_date) {
    sectionLetter = report.addSection("letter-without-addresses-and-date");
  }
  else if (!reportParam.print_sender_address && !reportParam.print_customer_address && reportParam.print_date) {
    sectionLetter = report.addSection("letter-without-addresses");
  }
  else {
    sectionLetter = report.addSection("letter");
  }




  //******************************************************************************************

  // // Print logo and sender address
  // if (reportParam.include_logo) {
  //   var headerParagraph = report.getHeader().addSection();
  //   headerParagraph = report.addSection("");
  //   var logoFormat = Banana.Report.logoFormat(reportParam.logo_name); //Logo
  //   if (logoFormat) {
  //     var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
  //     report.getHeader().addChild(logoElement);
  //   }
  //   else {
  //      headerParagraph.addClass("sender-address");
  //   }
  //   if (reportParam.print_sender_address) {
  //     headerParagraph.addParagraph(reportParam.sender_address_name, "");
  //     headerParagraph.addParagraph(reportParam.sender_address_address + " " + reportParam.sender_address_house_number, "");
  //     headerParagraph.addParagraph(reportParam.sender_address_postal_code + " " + reportParam.sender_address_locality, "")
  //   }
  // }
  // else {
    // Print sender address
    if (reportParam.print_sender_address) {
      sectionSenderAddress.addParagraph(reportParam.sender_address_name, "");
      sectionSenderAddress.addParagraph(reportParam.sender_address_address + " " + reportParam.sender_address_house_number, "");
      sectionSenderAddress.addParagraph(reportParam.sender_address_postal_code + " " + reportParam.sender_address_locality, "")
    }
  // }

  // Print date
  if (reportParam.print_date && reportParam.print_date_text) {
    sectionDate.addParagraph(reportParam.print_date_text, "");
  }

  // Print customer address
  if (reportParam.print_customer_address) {

    if (reportParam.customer_address_prefix) {
      sectionCustomerAddress.addParagraph(reportParam.customer_address_prefix, "");
    }

    sectionCustomerAddress.addParagraph(reportParam.customer_address_name, "");
    sectionCustomerAddress.addParagraph(reportParam.customer_address_address + " " + reportParam.customer_address_house_number, "");
    sectionCustomerAddress.addParagraph(reportParam.customer_address_postal_code + " " + reportParam.customer_address_locality, "");
  }

  // Print letter text
  if (reportParam.print_text) {

    // Print title
    if (reportParam.print_title_text) {
      var paragraph = sectionLetter.addParagraph("","");
      var textTitle = convertFields(reportParam.print_title_text, reportParam, row);
      paragraph.addText(textTitle, "title");
      sectionLetter.addParagraph(" ","");
      sectionLetter.addParagraph(" ","");
    }

    // Print begin text
    if (reportParam.print_begin_text) {
      var paragraph = sectionLetter.addParagraph("","");
      var textBegin = convertFields(reportParam.print_begin_text, reportParam, row);
      addMdBoldText(paragraph, textBegin);
      sectionLetter.addParagraph(" ","");
    }

    // Print details
    if (reportParam.print_multiple_details && !reportParam.print_multiple_empty_amount) {
      printReportTableDetails(banDoc, report, sectionLetter, reportParam, row);
    }

    // Print final text
    if (reportParam.print_final_text) {

      //var paragraph = sectionLetter.addParagraph("","");
      //paragraph.addStructuredText(reportParam.print_final_text, "md");
      
      var paragraph = sectionLetter.addParagraph("","");
      var textFinal = convertFields(reportParam.print_final_text, reportParam, row);
      addMdBoldText(paragraph, textFinal);
    }
  }

  sectionLetter.addParagraph(" ","");


  // Print QRCode section
  var qrBill = new QRBill(banDoc, reportParam);
  qrBill.printQRCodeDirect(report, stylesheet, reportParam);
}

function printReportTableDetails(banDoc, report, sectionLetter, reportParam, row) {

  var texts = setTexts(reportParam.language.toLowerCase());

  var paragraph = sectionLetter.addParagraph("","");

  var table = paragraph.addTable("details-table");
  var column1 = table.addColumn("column1");
  var column2 = table.addColumn("column2");

  var tableHeader = table.getHeader();
  tableRow = tableHeader.addRow();  
  tableRow.addCell(texts.description, "details-table-header",1);
  tableRow.addCell(texts.amount, "details-table-header",1);

  var tableRows = reportParam.table;
  for (var i = 0; i < tableRows.length; i++) {

    // Check if the object has a property name that starts with "Amount" (columns Amount, Amount1, Amount2,...)
    var propertyNames = Object.keys(tableRows[i]).filter(function (propertyName) {
      
      // Property name starts with "Amount" and it's not empty
      if (propertyName.startsWith("Amount") && tableRows[i][propertyName]) {

        tableRow = table.addRow();
        tableRow.addCell(replaceXmlNameWithHeaderDescription(banDoc, propertyName),"column1",1);
        tableRow.addCell(tableRows[i][propertyName],"column2",1);
      }
    });

    //Banana.console.log(totalToPay);
    tableRow = table.addRow("details-table-total");
    tableRow.addCell(texts.total + " " + reportParam.currency, "column1", 1);
    tableRow.addCell(tableRows[i].ColumnsAmountTotal, "column2", 1);

  }        

  sectionLetter.addParagraph(" ","");
}


function replaceXmlNameWithHeaderDescription(banDoc, columnName) {

  var tColumn = banDoc.table("QRCode").column(columnName, "Base");
  var header = tColumn.header;
  return header;
  // return columnName;
}

function convertFields(text, reportParam, row) {

  //Banana.console.log(JSON.stringify(reportParam, "", " "));

  if (text.indexOf("<Currency>") > -1) {
    text = text.replace(/<Currency>/g, reportParam.currency);
  }

  if (text.indexOf("<Amount>") > -1) {
    var amount = Banana.Converter.toLocaleNumberFormat(reportParam.billing_info_total_to_pay,2,true);
    text = text.replace(/<Amount>/g, amount);
  }

  if (text.indexOf("<AdditionalInformation>") > -1 && row) { // reportParam.print_multiple_use_table &&
    var tableRows = reportParam.table;
    for (var i = 0; i < tableRows.length; i++) {
      if (tableRows[i].row == row) {
        text = text.replace(/<AdditionalInformation>/g, tableRows[i].AdditionalInformation);
      }
    }
  }

  if (text.indexOf("<VariableText>") > -1 && row) { //reportParam.print_multiple_use_table &&
    var tableRows = reportParam.table;
    for (var i = 0; i < tableRows.length; i++) {
      if (tableRows[i].row == row) {
        text = text.replace(/<VariableText>/g, tableRows[i].VariableText);
      }
    }
  }

  return text;
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

  // currentParam = {};
  // currentParam.name = 'include_logo';
  // currentParam.parentObject = 'include_letter';
  // currentParam.title = texts.include_logo;
  // currentParam.type = 'bool';
  // currentParam.value = userParam.include_logo ? true : false;
  // currentParam.defaultvalue = false;
  // currentParam.readValue = function() {
  //   userParam.include_logo = this.value;
  // }
  // convertedParam.data.push(currentParam);

  // currentParam = {};
  // currentParam.name = 'logo_name';
  // currentParam.parentObject = 'include_letter';
  // currentParam.title = texts.logo_name;
  // currentParam.type = 'string';
  // currentParam.value = userParam.logo_name ? userParam.logo_name : '';
  // currentParam.defaultvalue = "Logo";
  // currentParam.readValue = function() {
  //   userParam.logo_name = this.value;
  // }
  // convertedParam.data.push(currentParam);

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



  /*******************************************************************************************
  * MULTIPLE PRINT FROM TABLE
  *******************************************************************************************/
  // Show the parameter only if the table 'QRCode' exists in the document
  var tableNames = Banana.document.tableNames;
  if (tableNames.indexOf("QRCode") > -1) {

    var currentParam = {};
    currentParam.name = 'print_multiple';
    currentParam.title = texts.print_multiple;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
      userParam.print_multiple = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'print_multiple_rows';
    currentParam.parentObject = 'print_multiple';
    currentParam.title = texts.print_multiple_rows;
    currentParam.type = 'string';
    currentParam.value = userParam.print_multiple_rows ? userParam.print_multiple_rows : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
     userParam.print_multiple_rows = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'print_multiple_details';
    currentParam.parentObject = 'print_multiple';
    currentParam.title = texts.print_multiple_details;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_multiple_details ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
      userParam.print_multiple_details = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'print_multiple_empty_amount';
    currentParam.parentObject = 'print_multiple';
    currentParam.title = texts.print_multiple_empty_amount;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_multiple_empty_amount ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
      userParam.print_multiple_empty_amount = this.value;
    }
    convertedParam.data.push(currentParam);

  }



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
  * FREE TEXT
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'letter';
  currentParam.title = texts.letter;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.letter = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_title_text';
  currentParam.parentObject = 'letter';
  currentParam.title = texts.print_title_text;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.print_title_text ? userParam.print_title_text : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.print_title_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_begin_text';
  currentParam.parentObject = 'letter';
  currentParam.title = texts.print_begin_text;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.print_begin_text ? userParam.print_begin_text : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.print_begin_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_final_text';
  currentParam.parentObject = 'letter';
  currentParam.title = texts.print_final_text;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.print_final_text ? userParam.print_final_text : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.print_final_text = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * LANGUAGE (QR and details table)
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

  //Shows custom CSS field only with an Advanced plan
  currentParam = {};
  currentParam.name = 'css';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.css;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.css ? userParam.css : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function() {
    userParam.css = this.value;
  }
  convertedParam.data.push(currentParam);


  return convertedParam;
}

function initUserParam() {
  var userParam = {};
  // userParam.include_logo = false;
  // userParam.logo_name = 'Logo';
  userParam.print_title_text = '';
  userParam.print_begin_text = '';
  userParam.print_final_text = '';
  userParam.print_text = true;
  userParam.print_date = false;
  userParam.print_date_text = '';
  userParam.print_sender_address = false;
  userParam.print_customer_address = false;
  userParam.sender_address_from_accounting = true;
  userParam.sender_address_name = '';
  userParam.sender_address_address = '';
  userParam.sender_address_house_number = '';
  userParam.sender_address_postal_code = '';
  userParam.sender_address_locality = '';
  userParam.sender_address_country_code = '';
  userParam.sender_address_iban = '';
  userParam.customer_address_name = '';
  userParam.customer_address_address = '';
  userParam.customer_address_house_number = '';
  userParam.customer_address_postal_code = '';
  userParam.customer_address_locality = '';
  userParam.customer_address_country_code = '';
  userParam.currency = "CHF";
  userParam.language = "EN";
  userParam.print_separating_border = true;
  userParam.print_scissors_symbol = false;
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';
  userParam.css = '';
  userParam.print_multiple_rows = '';
  userParam.print_multiple_details = false;
  userParam.print_multiple_empty_amount = false;

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
  qrSettings.qr_code_billing_information = false;
  qrSettings.qr_code_empty_address = false;
  qrSettings.qr_code_empty_amount = false;
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
    texts.include_letter = 'Includi nella lettera';
    texts.print_sender_address = 'Indirizzo mittente';
    texts.print_customer_address = 'Indirizzo cliente';
    texts.print_date = 'Data';
    texts.include_logo = "Logo";
    texts.logo_name = "Composizione per allineamento logo e intestazione";
    texts.letter = 'Testo lettera';
    texts.print_text = 'Testo libero';
    texts.print_title_text = 'Titolo';
    texts.print_begin_text = 'Testo iniziale';
    texts.print_final_text = 'Testo finale';
    texts.qrcode = 'Includi nel codice QR';
    texts.language = 'Lingua';
    texts.print_separating_border = 'Bordo di separazione';
    texts.print_scissors_symbol = 'Simbolo forbici';
    texts.print_single = 'Stampa singola';
    texts.sender_address = 'Indirizzo mittente (Pagabile a)';
    texts.sender_address_from_accounting = 'Usa indrizzo contabilità';
    texts.sender_address_name = 'Nome';
    texts.sender_address_address = 'Via';
    texts.sender_address_house_number = 'Numero civico';
    texts.sender_address_postal_code = 'Codice postale';
    texts.sender_address_locality = 'Località';
    texts.sender_address_country_code = 'Codice nazione';
    texts.sender_address_iban = 'IBAN';
    texts.print_date_text = 'Data';
    texts.styles = 'Stili';
    texts.font_family = 'Tipo carattere';
    texts.font_size = 'Dimensione carattere';
    texts.css = 'CSS';
    texts.print_multiple = 'Dati tabella';
    texts.print_multiple_rows = 'Righe da stampare (* tutte le righe)';
    texts.print_multiple_details = 'Includi dettagli';
    texts.print_multiple_empty_amount = 'Escludi importo';
    texts.description = 'Descrizione';
    texts.amount = 'Importo';
    texts.total = 'Totale';
  }
  else if (language === 'fr') {
    // DA TRADURRE

    texts.include_logo = "Logo";
    texts.logo_name = "Composition pour l'alignement du logo et de l'en-tête";

    texts.text = 'Texte';
    texts.print_text = 'Texte libre';
    texts.letter = 'Texte de la lettre';
    texts.print_title_text = 'Titre';
    texts.print_begin_text = 'Texte initial';
    texts.print_final_text = 'Texte final';
    texts.print_sender_address = 'Imprimer adresse expéditeur';
    texts.print_customer_address = 'Imprimer adresse client';
    texts.print_date = 'Imprimer la date';
    texts.print_date_text = 'Date';
    texts.sender_address = 'Adresse expéditeur (Payable à)';
    texts.sender_address_from_accounting = 'Utiliser adresse comptabilité';
    texts.sender_address_name = 'Nom';
    texts.sender_address_address = 'Rue';
    texts.sender_address_house_number = 'Numéro immeuble';
    texts.sender_address_postal_code = 'Code postal NPA';
    texts.sender_address_locality = 'Localité';
    texts.sender_address_country_code = 'Code du pays';
    texts.sender_address_iban = 'IBAN';
    // texts.customer_address = 'Adresse client (Payable par)';
    // texts.customer_address_include = 'Inclure le client';
    // texts.customer_address_name = 'Nom';
    // texts.customer_address_address = 'Rue';
    // texts.customer_address_house_number = 'Numéro immeuble';
    // texts.customer_address_postal_code = 'Code postal NPA';
    // texts.customer_address_locality = 'Localité';
    // texts.customer_address_country_code = 'Code du pays';
    // texts.amount = 'Devise/Montant';
    // texts.amount_include = 'Inclure le montant';
    // texts.currency = 'Devise';
    // texts.total_amount = 'Montant';
    texts.qrcode = 'QR Code';
    texts.language = 'Langue';
    // texts.additional_information = 'Informations additionnelles';
    texts.print_separating_border = 'Imprimer la bordure de séparation';
    texts.print_scissors_symbol = 'Imprimer le symbole des ciseaux';
    texts.font_family = 'Type de caractère';
    texts.font_size = 'Taille des caractères';
    texts.css = 'CSS';
    texts.include_letter = 'Inclure dans la vartre';
    texts.include_qrcode = 'Inclure dans le code QR';
    texts.styles = 'Styles';
    texts.print_multiple = 'Impression multiple';
    // texts.print_multiple_use_table = 'Utiliser les données du tableau';
    texts.print_multiple_rows = 'Lignes à imprimer (* toutes les lignes) ';
    texts.print_single = 'Impression unique';
    texts.print_multiple_details = 'Inclure les détails';
    texts.print_multiple_empty_amount = 'Exclure le montant';
    texts.description = 'Description';
    texts.amount = 'Montant';
    texts.total = 'Total';
  }
  else if (language === 'de') {
    // DA TRADURRE
    texts.include_logo = "Logo";
    texts.logo_name = "Logo-Name";

    texts.text = 'Text';
    texts.print_text = 'Freier Text';
    texts.letter = 'BriefText';
    texts.print_title_text = 'Titel';
    texts.print_begin_text = 'Anfangstext';
    texts.print_final_text = 'Text am Ende';
    texts.print_begin_text = 'Grussformel';
    texts.print_final_text = 'Anmerkungen am Anfang der Seite';
    texts.print_sender_address = 'Absenderadresse drucken';
    texts.print_customer_address = 'Kundenadresse ausdrucken';
    texts.print_date = 'Datum drucken';
    texts.print_date_text = 'Datum';
    texts.sender_address = 'Absenderadresse (Zahlbar an)';
    texts.sender_address_from_accounting = 'Buchhaltungsadresse verwenden';
    texts.sender_address_name = 'Name';
    texts.sender_address_address = 'Strasse';
    texts.sender_address_house_number = 'Hausnummer';
    texts.sender_address_postal_code = 'PLZ';
    texts.sender_address_locality = 'Ort';
    texts.sender_address_country_code = 'Ländercode';
    texts.sender_address_iban = 'IBAN';
    // texts.customer_address = 'Kundenadresse (Zahlbar durch)';
    // texts.customer_address_include = 'Kunde einbeziehen';
    // texts.customer_address_name = 'Name';
    // texts.customer_address_address = 'Strasse';
    // texts.customer_address_house_number = 'Hausnummer';
    // texts.customer_address_postal_code = 'PLZ';
    // texts.customer_address_locality = 'Ort';
    // texts.customer_address_country_code = 'Ländercode';
    // texts.amount = 'Währung/Betrag';
    // texts.amount_include = 'Betrag einbeziehen';
    // texts.currency = 'Währung';
    // texts.total_amount = 'Betrag';
    texts.qrcode = 'QR-Code';
    texts.language = 'Sprache';
    // texts.additional_information = 'Zusätzliche Informationen';
    texts.print_separating_border = 'Trennlinie drucken';
    texts.print_scissors_symbol = 'Scherensymbol drucken';
    texts.font_family = 'Schriftzeichen';
    texts.font_size = 'Schriftgrösse';
    texts.css = 'CSS';
    texts.include_letter = 'In Brief einfügen';
    texts.include_qrcode = 'In QR-Code einbinden';
    texts.styles = 'Stile';
    texts.print_multiple = 'Mehrfaches Drucken';
    // texts.print_multiple_use_table = 'Daten von der Tabelle verwenden';
    texts.print_multiple_rows = 'Zeilen zum Drucken (* alle Zeilen)';
    texts.print_single = 'Einzeln drucken';
    texts.print_multiple_details = 'Details einbeziehen';
    texts.print_multiple_empty_amount = 'Betrag ausschließen';
    texts.description = 'Beschreibung';
    texts.amount = 'Betrag';
    texts.total = 'Gesamtbetrag';
  }
  else {
    texts.include_letter = 'Include in letter';
    texts.print_sender_address = 'Sender address';
    texts.print_customer_address = 'Customer address';
    texts.print_date = 'Date';
    texts.letter = 'Letter text';
    texts.include_logo = "Logo";
    texts.logo_name = "Composition for logo and header alignment";
    texts.print_title_text = 'Title';
    texts.print_text = 'Free text';
    texts.print_begin_text = 'Greetings';
    texts.qrcode = 'Include in QR code';
    texts.language = 'Language';
    texts.print_separating_border = 'Separating border';
    texts.print_scissors_symbol = 'Scissors symbol';
    texts.print_single = 'Single print';
    texts.sender_address = 'Sender address (Payable to)';
    texts.sender_address_from_accounting = 'Use accounting address';
    texts.sender_address_name = 'Name';
    texts.sender_address_address = 'Street';
    texts.sender_address_house_number = 'House number';
    texts.sender_address_postal_code = 'Postal code';
    texts.sender_address_locality = 'Locality';
    texts.sender_address_country_code = 'Country code';
    texts.sender_address_iban = 'IBAN';
    texts.print_date_text = 'Date';
    texts.print_final_text = 'Free letter text';
    texts.styles = 'Styles';
    texts.font_family = 'Font family';
    texts.font_size = 'Font size';
    texts.css = 'CSS';
    texts.print_multiple = 'Print with table data';
    texts.print_multiple_rows = 'Rows to print (* all rows)';
    texts.print_multiple_details = 'Include details';
    texts.print_multiple_empty_amount = 'Exclude amount';
    texts.description = 'Description';
    texts.amount = 'Amount';
    texts.total = 'Total';
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

function setCss(banDoc, stylesheet, reportParam) {

  // Variable starts with $
  var variables = {};
  setVariables(variables, reportParam);

  var textCSS = "";
  var file = Banana.IO.getLocalFile("file:script/letterqrmultiple.css");
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
  if (reportParam.css) {
    textCSS += reportParam.css;
  }

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

  // Banana version < Banana Plus
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

  // Banana version = Banana Plus
  // Checks license type
  else {
    if (Banana.application.license && Banana.application.license.licenseType === "advanced") {
      return true;
    }
    else {
      Banana.application.showMessages();
      var msg = "";
      switch(language) {
      case "en":
        msg = "This script does not run with this version of Banana Accounting+. Please update to Banana Accounting+ Advanced Plan.";
        break;

      case "it":
        msg = "Lo script non funziona con questa versione di Banana Contabilità+. Aggiornare a Banana Contabilità+ Piano Advanced.";
        break;

      case "fr":
        msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité Plus. Faire la mise à jour à Banana Comptabilité+ Plan Advanced.";
        break;

      case "de":
        msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Version Banana Buchhaltung+ Advanced-Plan aktualisiern.";
        break;

      default:
        msg = "This script does not run with this version of Banana Accounting+. Please update to Banana Accounting+ Advanced Plan.";
      }         
      Banana.document.addMessage(msg);
      return false;          
    }
  }
}

