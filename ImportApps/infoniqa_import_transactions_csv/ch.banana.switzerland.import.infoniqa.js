// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
//
// @id = ch.banana.switzerland.import.infoniqa
// @api = 1.0
// @pubdate = 2025-02-28
// @publisher = Banana.ch SA
// @description = Infoniqa - Import movements .csv (Banana+ Advanced)
// @description.it = Infoniqa - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Infoniqa - Import movements .csv (Banana+ Advanced)
// @description.de = Infoniqa - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Infoniqa - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *.*
// @inputencoding = latin1
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv *.xlsx);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv *.xlsx);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv *.xlsx);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv *.xlsx);;Tutti i files (*.*)
// @includejs = import.utilities.js
// @timeout = -1

/*
 * SUMMARY
 *
 * Import transactions form Infoniqa to Banana using document change.
 *
 */

/**
 *
 * @param {*} inData transactionsData
 * @param {*} banDocument accounting file, is present only in tests
 * @param {*} isTest define if it is a test or not.
 */
function exec(inData, banDocument, isTest) {
  var progressBar = Banana.application.progressBar;
  progressBar.start("Elaborating rows", 1);
  progressBar.step();

  let banDoc;

  if (!inData) return "";

  if (isTest && !banDocument) return "";
  else if (isTest && banDocument) banDoc = banDocument;
  else banDoc = Banana.document;

  var importUtilities = new ImportUtilities(banDoc);

  if (!isTest && !importUtilities.verifyBananaAdvancedVersion()) return "";

  convertionParam = defineConversionParam(inData);
  let transactions = Banana.Converter.csvToArray(
    inData,
    convertionParam.separator,
    convertionParam.textDelim
  );
  let transactionsData = getFormattedData(
    transactions,
    convertionParam,
    importUtilities
  );

  // Format 1
  let infoniqaTransactionsImportFormat1 = new InfoniqaTransactionsImportFormat1(
    banDoc
  );
  if (infoniqaTransactionsImportFormat1.match(transactionsData)) {
    Banana.console.log("Format 1 matched");
    infoniqaTransactionsImportFormat1.createJsonDocument(transactionsData);
    var jsonDoc = { format: "documentChange", error: "" };
    jsonDoc["data"] = infoniqaTransactionsImportFormat1.jsonDocArray;
    progressBar.finish();
    return jsonDoc;
  }

  importUtilities.getUnknownFormatError();

  progressBar.finish();

  return "";
}

var InfoniqaTransactionsImportFormat1 = class InfoniqaTransactionsImportFormat1 {
  constructor(banDocument) {
    this.version = "1.0";
    this.banDocument = banDocument;
    //array dei patches
    this.jsonDocArray = [];
  }

  /** Return true if the transactions match this format */
  match(transactions) {
    if (transactions.length === 0) return false;

    for (let i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;

      if (transaction["Blg"] && transaction["Blg"].length >= 0)
        // (transaction["Kontakt"] && transaction["Kontakt"].length >= 0))
        formatMatched = true;
      else formatMatched = false;

      if (
        formatMatched &&
        transaction["Datum"] &&
        transaction["Datum"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      )
        formatMatched = true;
      else formatMatched = false;

      if (formatMatched) return true;
    }

    return false;
  }

  /**
   * The createJsonDocument() method takes the transactions in the excel file and
   * creates the Json document with the data to insert into Banana.
   */
  createJsonDocument(transactions) {
    /**
     * Create a document for each change.
     * After each document the banana recalculates the accounting,
     * so sequential changes works perfectly.
     */

    /*ADD THE ACCOUNTS*/
    let accountsJsonDoc = this.createJsonDocument_AddAccounts(transactions);
    if (accountsJsonDoc) {
      this.jsonDocArray.push(accountsJsonDoc);
    }
    /*ADD VAT CODES */
    let vatCodesJsonDoc = this.createJsonDocument_AddVatCodes(transactions);
    if (vatCodesJsonDoc) {
      this.jsonDocArray.push(vatCodesJsonDoc);
    }
    // /*ADD THE TRANSACTIONS*/
    let transactionsJsonDoc =
      this.createJsonDocument_AddTransactions(transactions);
    if (transactionsJsonDoc) {
      this.jsonDocArray.push(transactionsJsonDoc);
    }
  }

  /**
   * initialises the structure for document change.
   * @returns
   */
  createJsonDocument_Init() {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    var d = new Date();
    //jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    //jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
    jsonDoc.creator.name = Banana.script.getParamValue("id");
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
  }

  /**
   * Creates the document change object for the account table.
   * The new accounts list is taken from the debit and credit columns, those
   * columns contains the description and the number of the accounts used in the transactions.
   * Accounts that already exists in the chart of accounts are not inserted.
   * @param {*} inData original transactions.
   */
  createJsonDocument_AddAccounts(transactions) {
    let jsonDoc = this.createJsonDocument_Init();

    let rows = [];
    let newAccountsData = {};
    let accountsList = [];
    let existingAccounts;

    accountsList = Array.from(this.getAccountsList(transactions));
    /**Create an object with the new accounts data*/
    this.setNewAccountsDataObj(accountsList, newAccountsData);
    // /* Get the list of existing accounts*/
    existingAccounts = this.getExistingData("Accounts", "Account");
    // /* Filter the account by removing the existing ones */
    this.filterAccountsData(newAccountsData, existingAccounts);
    //add new accounts to the doc change json.
    if (newAccountsData && newAccountsData.data.length >= 0) {
      for (var key in newAccountsData.data) {
        let account = newAccountsData.data[key].account;
        let description = newAccountsData.data[key].description;
        let bClass = newAccountsData.data[key].bclass;

        //new rows
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = ""; //to define.
        row.fields = {};
        row.fields["Account"] = account;
        row.fields["Description"] = description;
        row.fields["BClass"] = bClass;
        // row.fields["Currency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency"); //actually set the base currency to all.

        rows.push(row);
      }
    }

    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Accounts";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ rows: rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
  }

  /**
   * Filter accounts data that already exists in the account table
   * by removing them from the "newAccountsData" object.
   */
  filterAccountsData(newAccountsData, existingAccounts) {
    let newArray = [];
    let mappedVatCodes = this.getMappedVatCodes();
    if (newAccountsData) {
      for (var key in newAccountsData.data) {
        const elementObj = newAccountsData.data[key];
        if (elementObj && elementObj.account) {
          // check if the account number already exists
          if (
            !existingAccounts.includes(elementObj.account) &&
            !mappedVatCodes.has(elementObj.code)
          ) {
            newArray.push(elementObj);
          }
        }
      }
    }
    //overvrite the old array with the new one (filtered one).
    newAccountsData.data = newArray;
  }

  /**
   * Given a list of accounts creates an object containing for each account
   * the account number and the account description.
   */
  setNewAccountsDataObj(accountsList, newAccountsData) {
    let accountsData = [];
    for (const [key, value] of accountsList) {
      let accDescription = "";
      let accountNr = "";
      let accountBclass = "";
      let accData = {};

      if (key) {
        accountNr = key.trim(); // Account number
        accDescription = value.trim(); // Account description
        accountBclass = this.setAccountBclass(key);

        accData.account = accountNr;
        accData.description = accDescription;
        accData.bclass = accountBclass;

        accountsData.push(accData);
      }
    }

    newAccountsData.data = accountsData;
  }

  /**
   * Creates the document change object fot vat table
   */
  createJsonDocument_AddVatCodes(transactions) {
    let jsonDoc = this.createJsonDocument_Init();

    //get the vat code list from the transactions
    let vatCodesList = [];
    let newVatCodesData = {};
    let existingVatCodes = [];
    let rows = [];

    vatCodesList = this.getVatCodesList(transactions);
    /**Create an object with the new accounts data*/
    this.setNewVatCodesDataObj(vatCodesList, newVatCodesData);

    existingVatCodes = this.getExistingData("VatCodes", "VatCode");
    this.filterVatCodesData(newVatCodesData, existingVatCodes);

    //add new vat codes to the doc change json.
    if (newVatCodesData && newVatCodesData.data.length >= 0) {
      for (var key in newVatCodesData.data) {
        let code = newVatCodesData.data[key].code;
        let rate = newVatCodesData.data[key].rate;

        //new rows
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = ""; //to define.
        row.fields = {};
        row.fields["VatCode"] = code;
        row.fields["VatRate"] = rate;

        rows.push(row);
      }
    }

    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "VatCodes";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ rows: rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
  }

  /**
   * Filter vat codes data that already exists in the vat table
   * by removing them from the "newVatCodesDataObj" object.
   */
  filterVatCodesData(newVatCodesData, existingVatCodes) {
    let newArray = [];
    let mappedVatCodes = this.getMappedVatCodes();
    if (newVatCodesData) {
      for (var key in newVatCodesData.data) {
        const elementObj = newVatCodesData.data[key];
        if (elementObj && elementObj.code) {
          /**Check if the account number already exists
           * in the vat table or if it's already between mapped elements*/
          if (
            !existingVatCodes.includes(elementObj.code) &&
            !mappedVatCodes.has(elementObj.code)
          ) {
            newArray.push(elementObj);
          }
        }
      }
    }
    //overvrite the old array with the new one (filtered one).
    newVatCodesData.data = newArray;
  }

  /**
   * Given a list of accounts creates an object containing for each vat code
   * the code and the vat rate.
   */
  setNewVatCodesDataObj(vatCodesList, newVatCodesData) {
    let vatCodesData = [];
    for (const [key, value] of vatCodesList) {
      let vatCode = "";
      let vatRate = "";
      let vatData = {};

      if (key && value) {
        vatCode = key.trim();
        vatRate = value.trim();

        vatData.code = vatCode;
        vatData.rate = vatRate;

        vatCodesData.push(vatData);
      }
    }
    newVatCodesData.data = vatCodesData;
  }

  /**
   * Loops the content of the file records and saves
   * the list of accounts and their description (if present)
   * @param {*} transactions
   */
  getAccountsList(transactions) {
    let accountsList = new Map();
    let accounts = [];

    /** Accounts are listed in the "GK" column, their description is in the "GK Beschreibung" column.
     * Accounts are also present in the "KontoNummer" column but without the description.
     * First we save the accounts found in the GK columns, then we check if the Kontonummer column contains
     * some accounts that are not saved yet, in that case we save them (without description)
     */
    let accountsWithoutDescr = new Set(); // KontoNummer column
    for (const tr of transactions) {
      let accountNumber = tr["Kto"]; // as key
      // let accountDescription = tr["GK Beschreibung"]; // as value.
      // let kNumber = tr["Kto"];
      // if (accountNumber && accountDescription)
      //     accountsList.set(accountNumber, accountDescription);
      accountsWithoutDescr.add(accountNumber);
    }

    for (const acc of accountsWithoutDescr) {
      if (acc && !accountsList.has(acc)) {
        accountsList.set(acc, "");
      }
    }

    return accountsList;
  }

  /** Loops the content of the file records and saves
   * the list of vat codes used*/
  getVatCodesList(transactions) {
    let vatCodesList = new Map();
    let count = 0;
    for (const tr of transactions) {
      let vatCode = tr["SId"]; // as key
      let vatPercentage = this.getVatPercentage(vatCode); // as value.
      if (vatCode && vatPercentage) vatCodesList.set(vatCode, vatPercentage);
    }
    vatCodesList = Array.from(vatCodesList);
    return vatCodesList;
  }

  getVatPercentage(code) {
    let codeDouble = 0.0;
    const match = code.match(/(\d{2})$/);
    if (match) {
      const digits = match[1];
      codeDouble = parseFloat(digits[0] + "." + digits[1]);
    }

    return codeDouble.toString();
  }

  /**
   * Returns a list with the data contained in the table "tableName"
   * to the column "columnName".
   */
  getExistingData(tableName, columnName) {
    let accounts = [];
    let accountTable = this.banDocument.table(tableName);
    if (accountTable) {
      let tRows = accountTable.rows;
      for (var key in tRows) {
        let row = tRows[key];
        let account = row.value(columnName);
        if (account) {
          accounts.push(account);
        }
      }
    }
    return accounts;
  }

  /**
   * Finds and returns the vat code contained in the MWST field (Bexio file).
   * field format:
   *  - "UN77 (7.70%)"
   *  - "UR25 (2.50%)"
   */
  getCodeFromVatField(rowField) {
    let code = "";
    if (rowField) {
      code = rowField.substring(0, rowField.indexOf(" "));
      code.trim();
    }

    return code;
  }

  /**
   * Creates the document change object for the transactions table.
   */
  createJsonDocument_AddTransactions(transactions) {
    let jsonDoc = this.createJsonDocument_Init();
    let rows = [];

    // Process transactions in pairs
    for (let i = 0; i < transactions.length; i++) {
      const tr = transactions[i];
      let groupTrs = [tr];
      let j = i + 1;
      while (j < transactions.length && transactions[j]["Blg"] === tr["Blg"]) {
        groupTrs.push(transactions[j]);
        j++;
      }

      // Skip processed rows in next iterations
      let skipCount = groupTrs.length - 1;

      if (groupTrs.length === 2) {
        // Handle pairs as before
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = "";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(
          tr["Datum"],
          "dd.mm.yyyy"
        );
        row.fields["ExternalReference"] = tr["Blg"];

        if (tr["S/H"] === "S") {
          row.fields["AccountDebit"] = this.getAccountDebit(tr);
          row.fields["AccountCredit"] = this.getAccountCredit(tr);
          row.fields["VatCode"] = this.getBananaVatCode(tr["SId"]) || tr["SId"];
        } else {
          row.fields["AccountDebit"] = this.getAccountDebit(groupTrs[1]);
          row.fields["AccountCredit"] = this.getAccountCredit(groupTrs[1]);
          row.fields["VatCode"] =
            this.getBananaVatCode(groupTrs[1]["SId"]) || groupTrs[1]["SId"];
        }

        row.fields["Description"] = this.getDescription(tr);
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(
          tr["Netto"],
          "."
        );

        rows.push(row);
      } else if (groupTrs.length === 3) {
        // For triplets, only import the row with SId, Netto and Steuer
        let vatRow = groupTrs.find(
          (t) => t["SId"] && t["Netto"] && t["Steuer"]
        );
        if (vatRow) {
          let row = {};
          row.operation = {};
          row.operation.name = "add";
          row.operation.srcFileName = "";
          row.fields = {};
          row.fields["Date"] = Banana.Converter.toInternalDateFormat(
            vatRow["Datum"],
            "dd.mm.yyyy"
          );
          row.fields["ExternalReference"] = vatRow["Blg"];
          row.fields["AccountDebit"] = this.getAccountDebit(vatRow);
          row.fields["AccountCredit"] = this.getAccountCredit(vatRow);
          row.fields["Description"] = this.getDescription(vatRow);
          row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(
            vatRow["Netto"],
            "."
          );
          row.fields["VatCode"] =
            this.getBananaVatCode(vatRow["SId"]) || vatRow["SId"];

          rows.push(row);
        }
      } else if (groupTrs.length > 3) {
        // For groups larger than 3, import all rows as separate transactions
        for (let groupTr of groupTrs) {
          let row = {};
          row.operation = {};
          row.operation.name = "add";
          row.operation.srcFileName = "";
          row.fields = {};
          row.fields["Date"] = Banana.Converter.toInternalDateFormat(
            groupTr["Datum"],
            "dd.mm.yyyy"
          );
          row.fields["ExternalReference"] = groupTr["Blg"];
          row.fields["AccountDebit"] = this.getAccountDebit(groupTr);
          row.fields["AccountCredit"] = this.getAccountCredit(groupTr);
          row.fields["Description"] = this.getDescription(groupTr);
          row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(
            groupTr["Netto"],
            "."
          );
          row.fields["VatCode"] =
            this.getBananaVatCode(groupTr["SId"]) || groupTr["SId"];

          rows.push(row);
        }
      } else {
        // Handle single transactions
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = "";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(
          tr["Datum"],
          "dd.mm.yyyy"
        );
        row.fields["ExternalReference"] = tr["Blg"];
        row.fields["AccountDebit"] = this.getAccountDebit(tr);
        row.fields["AccountCredit"] = this.getAccountCredit(tr);
        row.fields["Description"] = this.getDescription(tr);
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(
          tr["Netto"],
          "."
        );
        row.fields["VatCode"] = this.getBananaVatCode(tr["SId"]) || tr["SId"];

        rows.push(row);
      }

      i += skipCount;
    }

    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ rows: rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
  }

  getExchangeCurrency(transaction) {
    let excCurrency = "";
    if (transaction["Fremdwährung"]) {
      excCurrency = transaction["Fremdwährung"];
    } else excCurrency = transaction["Währung"];

    return excCurrency;
  }

  getAmountCurrency(transaction) {
    let amtCurrency = "";
    // if (transaction["FW-Betrag"]) // We use the original (foreign) currency amount
    // amtCurrency = transaction["FW-Betrag"];
    // We just use the base currency amount, checking if is in debit or credit.
    if (transaction["S/H"] === "S" || transaction["S/H"] === "H")
      amtCurrency = transaction["Netto"];

    return amtCurrency;
  }

  getAccountDebit(transaction) {
    let accountDebit = "";
    if (transaction["S/H"] === "S") {
      accountDebit = transaction["Kto"].trim();
    } else if (transaction["S/H"] === "H") {
      accountDebit = transaction["GKto"].trim();
    }
    return accountDebit;
  }

  getAccountCredit(transaction) {
    let accountCredit = "";
    if (transaction["S/H"] === "S") {
      accountCredit = transaction["GKto"].trim();
    } else if (transaction["S/H"] === "H") {
      accountCredit = transaction["Kto"].trim();
    }
    return accountCredit;
  }

  getDescription(transaction) {
    let description = "";
    if (transaction["Tx1"] && transaction["Tx2"])
      description = transaction["Tx1"] + ", " + transaction["Tx2"];
    else description = transaction["Tx1"];

    return description;
  }

  /**
   * Dato un coidce iva Bexio ritorna il codice corrispondente in Banana.
   */
  getBananaVatCode(infoniqaVatCode) {
    if (infoniqaVatCode) {
      let mpdVatCodes = this.getMappedVatCodes();
      let banVatCode;

      /**get the Banana vat code */
      banVatCode = mpdVatCodes.get(infoniqaVatCode);

      if (banVatCode) {
        return banVatCode;
      }
    }

    return "";
  }

  /**
   * Ritorna la bclasse per l'account inserito partendo
   * dal presupposto che si tratti di un piano dei conti
   * svizzero per PMI, altrimenti torna vuoto.
   */
  setAccountBclass(accountNr) {
    let bClass = "";
    let firstDigit = accountNr.substring(0, 1);
    switch (firstDigit) {
      case "1":
        bClass = "1";
        return bClass;
      case "2":
        bClass = "2";
        return bClass;
      case "4":
        bClass = "3";
        return bClass;
      case "4":
        bClass = "3";
        return bClass;
      case "3":
      case "5":
      case "6": //some cases is 4.
      case "7":
      case "8":
      case "9":
        bClass = "3";
        return bClass;
      default:
        return bClass;
    }
  }

  /**
   * Ritorna la struttura contenente i codici iva mappati da Bexio
   * questa struttura contiene i codici standard, non funziona in
   * caso in cui l'utente abbia personalizzato la tabella codici iva.
   */
  getMappedVatCodes() {
    /**
     * Map structure:
     * key = Bexio vat code
     * value = Banana vat code
     */
    const vatCodes = new Map();

    //set codes
    vatCodes.set("UN77", "V77");
    vatCodes.set("UR25", "V25-N");
    vatCodes.set("VB77", "V77-B");
    vatCodes.set("VM77", "M77");
    vatCodes.set("USN81", "V81");
    vatCodes.set("VSM81", "M81-1");
    vatCodes.set("VDL81", "I81-1");
    vatCodes.set("VSB81", "V81");

    return vatCodes;
  }
};

function defineConversionParam(inData) {
  var convertionParam = {};
  /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
  convertionParam.format = "csv"; // available formats are "csv", "html"
  //get text delimiter
  convertionParam.textDelim = '"';
  // get separator
  convertionParam.separator = findSeparator(inData);

  /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
  convertionParam.sortColums = ["Date", "Description"];
  convertionParam.sortDescending = false;

  return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
  var columns = importUtilities.getHeaderData(
    inData,
    convertionParam.headerLineStart
  ); //array
  var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
  let form = [];

  let convertedColumns = [];

  convertedColumns = convertHeaderDe(columns);
  //Load the form with data taken from the array. Create objects
  if (convertedColumns.length > 0) {
    importUtilities.loadForm(form, columns, rows);
    return form;
  }
  return [];
}

function convertHeaderDe(columns) {
  let convertedColumns = [];

  for (var i = 0; i < columns.length; i++) {
    switch (columns[i]) {
      case "Blg":
        convertedColumns[i] = "Doc";
        break;
      case "Datum":
        convertedColumns[i] = "Date";
        break;
      case "Kto":
        convertedColumns[i] = "Account";
        break;
      case "S/H":
        convertedColumns[i] = "Debit/Credit";
        break;
      case "Grp":
        convertedColumns[i] = "Group";
        break;
      case "GKto":
        convertedColumns[i] = "Control Account";
        break;
      case "Netto":
        convertedColumns[i] = "Amount";
        break;
      case "Steuer":
        convertedColumns[i] = "VAT Amount";
        break;
      case "FW-Betrag":
        convertedColumns[i] = "Foreign Currency Amount";
        break;
      case "Tx1":
        convertedColumns[i] = "Description 1";
        break;
      case "Tx2":
        convertedColumns[i] = "Description 2";
        break;
      case "OpId":
        convertedColumns[i] = "Operation Id";
        break;
      default:
        break;
    }
  }

  if (convertedColumns.indexOf("Date") < 0) {
    return [];
  }

  return convertedColumns;
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(inData) {
  var commaCount = 0;
  var semicolonCount = 0;
  var tabCount = 0;

  for (var i = 0; i < 1000 && i < inData.length; i++) {
    var c = inData[i];
    if (c === ",") commaCount++;
    else if (c === ";") semicolonCount++;
    else if (c === "\t") tabCount++;
  }

  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  } else if (semicolonCount > commaCount) {
    return ";";
  }

  return ",";
}
