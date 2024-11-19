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
// Add payment data to transactions according to accounts and transactions data
//
// @id = ch.banana.batch.payments
// @api = 1.0
// @pubdate = 2024-07-17
// @doctype = *.*
// @description = Add payment data to suppliers invoices [BETA]
// @task = app.command
// @timeout = -1
// @includejs = ch.banana.switzerland.pain001.js
// @includejs = documentchange.js

/** 
*   Main function
*/
function exec() {
  // Verify Banana version and functionalities
  if (!verifyVersion())
    return "@Cancel";

  // Initialize user parameters
  var userParam = initUserParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam && savedParam.length > 0) {
    userParam = JSON.parse(savedParam);
  }
  userParam = verifyUserParam(userParam);
  if (!options || !options.useLastSettings) {
    userParam = settingsDialog();
  }
  if (!userParam) {
    return "@Cancel";
  }

  //Retrieve the rows to process
  var rowsToProcess = [];
  rowsToProcess = getRowsToProcess(userParam);
  var tabPos = {};
  tabPos.tableName = "Transactions";
  tabPos.columnName = "";

  /*var jsonContent = {
    "paymentdata_json": JSON.stringify({})
  };

  var docChange = {
    "format": "documentChange",
    "error": "",
    "data": [
      {
        "document": {
          "dataUnits": [{
            "nameXml": "Transactions",
            "data": {
              "rowLists": [{
                "rows": [{
                  "fields": {
                    "Date": "20240604",
                    "Description": "New payment data 2",
                    "PaymentData": jsonContent
                  },
                  "operation": {
                    "name": "add"
                  }
                }]
              }]
            }
          }]
        }
      }]
  };*/
  var docChange = new DocumentChange();

  //retrieves suppliers invoices
  var openInvoicesList = getOpenInvoicesList(userParam);

  var rowsProcessed = [];
  if (rowsToProcess.length > 0) {
    for (var i = 0; i < rowsToProcess.length; i++) {
      tabPos.rowNr = rowsToProcess[i] - 1;
      docChange = createPaymentObject(tabPos, docChange, openInvoicesList, rowsProcessed);
    }
  }
  else {
    return "@Cancel";
  }

  Banana.console.info("Processed rows: " + rowsProcessed.join(","));
  return docChange.getDocChange();
}

//
// PARAMETERS
//
function convertParam(userParam) {

  //language
  /*var lang = 'en';
  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }

  var texts = {};
  texts = setTexts(lang);*/

  //parameters
  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];


  var currentParam = {};
  currentParam.name = 'process_table';
  currentParam.title = 'Transactions table';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function () {
    userParam.process_table = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'process_rows';
  currentParam.parentObject = 'process_table';
  currentParam.title = 'Rows to process (* all rows, 1-3 or 1,2,3 range of rows)';
  currentParam.type = 'string';
  currentParam.value = userParam.process_rows ? '*' : '*';
  currentParam.defaultvalue = '*';
  currentParam.readValue = function () {
    userParam.process_rows = this.value.trim();
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'only_open_invoices';
  currentParam.parentObject = 'process_table';
  currentParam.title = 'Only open invoices';
  currentParam.type = 'bool';
  currentParam.value = userParam.only_open_invoices ? userParam.only_open_invoices : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function () {
    userParam.only_open_invoices = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

function createPaymentObject(tabPos, docChange, openInvoicesList, rowProcessed) {
  var jsAction = new JsAction(Banana.document);
  var pain001CH = new Pain001Switzerland(Banana.document);
  if (!pain001CH.verifyBananaVersion())
    return docChange;

  var paymentObj = pain001CH.initPaymObject();

  var row = null;
  var paymentData = "";
  var table = Banana.document.table(tabPos.tableName);
  if (tabPos.rowNr >= 0 && tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
    row = table.row(tabPos.rowNr);
    if (row.value("PaymentData"))
      paymentData = row.value("PaymentData");
  }

  if (row && row.isEmpty === false && paymentData.length <= 0) {
    //only payments with valid account Id
    jsAction._rowGetAccount(paymentObj, row);
    if (paymentObj.creditorAccountId.length <= 0)
      return docChange;

    //only open invoices
    jsAction._rowGetDoc(paymentObj, row);
    var invoiceNo = paymentObj.invoiceNo;
    if (openInvoicesList && invoiceNo.length > 0) {
      if (openInvoicesList.indexOf(invoiceNo) < 0)
        return docChange;
    }

    jsAction._rowGetAmount(paymentObj, row);
    jsAction._rowGetUnstructuredMessage(paymentObj, row);

    if (!paymentObj["transactionDate"] || paymentObj["transactionDate"].length <= 0)
      paymentObj["transactionDate"] = pain001CH.currentDate();
    paymentObj["@uuid"] = row.uuid;

    var changedRowFields = {};
    changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };

    if (tabPos.rowNr == -1)
      docChange.addOperationRowAdd(tabPos.tableName, changedRowFields);
    else
      docChange.addOperationRowModify(tabPos.tableName, tabPos.rowNr, changedRowFields);

    rowProcessed.push(tabPos.rowNr);
  }

  return docChange;
}

function getOpenInvoicesList(userParam) {

  var openInvoicesList = [];
  var journalInvoices = Banana.document.invoicesSuppliers();
  if (!journalInvoices)
    return;

  for (var i = 0; i < journalInvoices.rowCount; i++) {
    var tRow = journalInvoices.row(i);
    if (tRow.value('ObjectType') === 'InvoiceTotal' && tRow.value('CounterpartyId').length > 0) {
      var customerId = tRow.value('CounterpartyId').toString();
      var invoiceId = tRow.value('Invoice').toString();
      var balance = tRow.value('Balance').toString();
      if (!Banana.SDecimal.isZero(balance) || userParam.only_open_invoices === false) {
        openInvoicesList.push(invoiceId);
      }
    }
  }
  return openInvoicesList;

}

function getRowsToProcess(userParam) {

  /**
   * Returns an array with the rows number to print
   * 1. retrieve rows entered in parameters
   * 2. check these rows and exclude rows that cannot be printed (no amount, name starts with *)
   */

  var rows = [];

  //List or rows ("1,2,3")
  if (userParam.process_rows.indexOf(",") > -1) {
    var tmpRows = userParam.process_rows.split(",");
    for (var i = 0; i < tmpRows.length; i++) {
      rows.push(Number(tmpRows[i]));
    }
  }

  //Range from .. to..  ("1-3")
  else if (userParam.process_rows.indexOf("-") > -1) {
    var tmpRows = userParam.process_rows.split("-");
    var from = tmpRows[0];
    var to = tmpRows[1];
    for (var i = from; i <= to; i++) {
      rows.push(Number(i));
    }
  }

  //Single row ("1", "2", "3")
  else if (userParam.process_rows.match(/^[0-9]+$/) !== null) {
    rows.push(Number(userParam.process_rows));
  }

  //All the rows ("*")
  else if (!userParam.process_rows || userParam.process_rows === "*") {
    var table = Banana.document.table('Transactions');
    for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var indexRow = tRow.rowNr + 1; //index rows start from 0
      if (!tRow.isEmpty) {
        rows.push(Number(indexRow));
      }
    }
  }

  return rows;
}

function initUserParam() {
  var userParam = {};
  userParam.process_table = '';
  userParam.process_rows = '*';
  userParam.only_open_invoices = false;

  return userParam;
}

function parametersDialog(userParam) {

  if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
    //language
    var lang = 'en';
    if (Banana.document.locale) {
      lang = Banana.document.locale;
    }
    if (lang.length > 2) {
      lang = lang.substr(0, 2);
    }

    //parameters
    var dialogTitle = 'Add payment data to suppliers invoices';
    /*if (lang === 'it') {
      dialogTitle = 'Impostazioni';
    } else if (lang === 'fr') {
      dialogTitle = 'Paramètres';
    } else if (lang === 'de') {
      dialogTitle = 'Einstellungen';
    } else {
      dialogTitle = 'Settings';
    }*/
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
  scriptform = verifyUserParam(scriptform);
  scriptform = parametersDialog(scriptform); // From propertiess
  if (scriptform) {
    var paramToString = JSON.stringify(scriptform);
    Banana.document.setScriptSettings(paramToString);
  }

  return scriptform;
}

function verifyUserParam(userParam) {
  if (!userParam)
    userParam = initUserParam();

  if (!userParam.process_table)
    userParam.process_table = '';
  if (!userParam.process_rows)
    userParam.process_rows = '*';
  if (!userParam.only_open_invoices)
    userParam.only_open_invoices = false;

  return userParam;
}

function verifyVersion() {
  var table = Banana.document.table("Transactions");
  if (table) {
    var columnPaymentData = table.column("PaymentData", "Base");
    if (columnPaymentData)
      return true;
  }
  Banana.document.addMessage("The payment data functionalities are not installed. Impossible to process the payment data.");
  return false;
}
