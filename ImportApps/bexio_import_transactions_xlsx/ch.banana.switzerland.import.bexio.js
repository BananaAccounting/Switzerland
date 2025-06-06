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
// @id = ch.banana.switzerland.import.bexio
// @api = 1.0
// @pubdate = 2025-04-09
// @publisher = Banana.ch SA
// @description = Bexio - Import movements .xlsx (Banana+ Advanced)
// @description.it = Bexio - Importa movimenti .xlsx (Banana+ Advanced)
// @description.en = Bexio - Import movements .xlsx (Banana+ Advanced)
// @description.de = Bexio - Bewegungen importieren .xlsx (Banana+ Advanced)
// @description.fr = Bexio - Importer mouvements .xlsx (Banana+ Advanced)
// @doctype = 100.130
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
 * Import transactions form Bexio to Banana using document change.
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

    if (!inData)
        return "";

    if (isTest && !banDocument)
        return "";
    else if (isTest && banDocument)
        banDoc = banDocument;
    else
        banDoc = Banana.document;

    var importUtilities = new ImportUtilities(banDoc);

    if (!isTest && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

    // Format 2, Now Bexio allows to export directly the csv file.
    let bexioTransactionsImportFormat2 = new BexioTransactionsImportFormat2(banDoc);
    if (bexioTransactionsImportFormat2.match(transactionsData)) {
        bexioTransactionsImportFormat2.createJsonDocument(transactionsData);
        var jsonDoc = { "format": "documentChange", "error": "" };
        jsonDoc["data"] = bexioTransactionsImportFormat2.jsonDocArray;
        progressBar.finish();
        return jsonDoc;
    }

    //Format 1 (do match check in case there are more versions in the future)
    let bexioTransactionsImportFormat1 = new BexioTransactionsImportFormat1(banDoc);
    if (bexioTransactionsImportFormat1.match(transactionsData)) {
        bexioTransactionsImportFormat1.createJsonDocument(transactionsData);
        var jsonDoc = { "format": "documentChange", "error": "" };
        jsonDoc["data"] = bexioTransactionsImportFormat1.jsonDocArray;
        progressBar.finish();
        return jsonDoc;
    }

    importUtilities.getUnknownFormatError();

    progressBar.finish();

    return "";

}

/**
 * Utilities.
 * Expression to filter the data by removing all the transactions using the vat accounts as are not necessary
 * bc the vat is already inserted in the normal transactions inside the vat columns.
 *  - First !accountdebit:xml!=2200|2201|1171|1172|1170|2202|1175 !vatcode:xml!<>
 *  - Second !accountcredit:xml!=2200|2201|1171|1172|1170|2202|1175 !vatcode:xml!<>
 * The ideal solution would be to have: !vatcode:xml!<> (!accountdebit:xml!=2200|2201|1171|1172|1170|2202|1175 | !accountcredit:xml!=2200|2201|1171|1172|1170|2202|1175)
 * but for some reason it doesn't work.
 * The accounts are examples, it depends on the chart of accounts used.
 */

var BexioTransactionsImportFormat2 = class BexioTransactionsImportFormat2 {
    constructor(banDocument) {
        this.version = '1.0';
        this.banDocument = banDocument;
        //array dei patches
        this.jsonDocArray = [];

    }

    /** Return true if the transactions match this format */
    match(transactions) {
        if (transactions.length === 0)
            return false;

        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            if ((transaction["Kontonummer"] && transaction["Kontonummer"].length >= 0) ||
                (transaction["Kontakt"] && transaction["Kontakt"].length >= 0))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Datum"] &&
                transaction["Datum"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
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
        /*ADD THE TRANSACTIONS*/
        let transactionsJsonDoc = this.createJsonDocument_AddTransactions(transactions);
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
        jsonDoc.creator.name = Banana.script.getParamValue('id');
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

        accountsList = this.getAccountsList(transactions);
        /**Create an object with the new accounts data*/
        this.setNewAccountsDataObj(accountsList, newAccountsData);
        /* Get the list of existing accounts*/
        existingAccounts = this.getExistingData("Accounts", "Account");
        /* Filter the account by removing the existing ones */
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
                row.operation.srcFileName = "" //to define.
                row.fields = {};
                row.fields["Account"] = account;
                row.fields["Description"] = description;
                row.fields["BClass"] = bClass;
                row.fields["Currency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency"); //actually set the base currency to all.

                rows.push(row);
            }
        }


        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Accounts";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;

    }

    /**
     * Filter accounts data that already exists in the account table
     * by removing them from the "newAccountsData" object.
     */
    filterAccountsData(newAccountsData, existingAccounts) {
        let newArray = [];
        if (newAccountsData) {
            for (var key in newAccountsData.data) {
                const elementObj = newAccountsData.data[key];
                if (elementObj && elementObj.account) {
                    // check if the account number already exists
                    if (!existingAccounts.includes(elementObj.account)) {
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
            let accountNr = ""
            let accountBclass = "";
            let accData = {};

            if (key && value) {
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
                row.operation.srcFileName = "" //to define.
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
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

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
                    if (!existingVatCodes.includes(elementObj.code) &&
                        !mappedVatCodes.has(elementObj.code)) {
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

        /** Accounts are listed in the "GK" column, their description is in the "GK Beschreibung" column.
         * Accounts are also present in the "KontoNummer" column but without the description.
         * First we save the accounts found in the GK columns, then we check if the Kontonummer column contains
         * some accounts that are not saved yet, in that case we save them (without description)
        */
        let accountsWithoutDescr = new Set(); // KontoNummer column
        for (const tr of transactions) {
            let accountNumber = tr["GK"]; // as key
            let accountDescription = tr["GK Beschreibung"]; // as value.
            let kNumber = tr["KontoNummer"];
            if (accountNumber && accountDescription)
                accountsList.set(accountNumber, accountDescription);
            accountsWithoutDescr.add(kNumber);
        }

        for (const acc of accountsWithoutDescr) {
            if (acc && !accountsList.has(acc))
                accountsList.set(acc, "");
        }
        return accountsList;
    }

    /** Loops the content of the file records and saves
     * the list of vat codes used*/
    getVatCodesList(transactions) {
        let vatCodesList = new Map();

        for (const tr of transactions) {
            let vatCode = tr["Code"]; // as key
            let vatPercentage = tr["Prozentsatz"]; // as value.
            if (vatCode && vatPercentage)
                vatCodesList.set(vatCode, vatPercentage);
        }

        return vatCodesList;
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
                };
            }
        }
        return accounts;
    }

    /**
     * Creates the document change object for the transactions table.
     */
    createJsonDocument_AddTransactions(transactions) {

        let jsonDoc = this.createJsonDocument_Init();
        let rows = [];
        let transactionsKeys = new Set();

        for (const tr of transactions) {
            let vatCode = this.getBananaVatCode(tr["Code"]);
            let amountType = "1";

            if (!vatCode) {
                vatCode = tr["Code"];
                amountType = "";
            }

            let row = {};
            row.operation = {};
            row.operation.name = "add";
            row.operation.srcFileName = "" //to define.
            row.fields = {};
            row.fields["Date"] = Banana.Converter.toInternalDateFormat(tr["Datum"], "dd.mm.yyyy");
            row.fields["ExternalReference"] = tr["Referenz"];
            row.fields["AccountDebit"] = this.getAccountDebit(tr);
            row.fields["AccountCredit"] = this.getAccountCredit(tr);
            row.fields["Description"] = this.getDescription(tr);
            row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getAmountCurrency(tr), '.');
            row.fields["ExchangeCurrency"] = this.getExchangeCurrency(tr);
            row.fields["ExchangeRate"] = tr["Kurs"];
            row.fields["VatCode"] = vatCode;
            row.fields["VatAmountType"] = amountType;

            let rowContent = JSON.stringify(row.fields);

            if (!transactionsKeys.has(rowContent)) { // We wants to avoid duplicates as we work with a journal.
                transactionsKeys.add(rowContent);
                rows.push(row);
            }
        }

        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;
    }

    getExchangeCurrency(transaction) {
        let excCurrency = "";
        if (transaction["Fremdwährung"]) {
            excCurrency = transaction["Fremdwährung"];
        } else
            excCurrency = transaction["Währung"];

        return excCurrency;
    }

    getAmountCurrency(transaction) {
        let amtCurrency = "";
        if (transaction["Fremdwährung"] && transaction["FW-Betrag"]) // We use the original (foreign) currency amount
            amtCurrency = transaction["FW-Betrag"];
        else { // We just use the base currency amount, checking if is in debit or credit.
            if (transaction["Soll"])
                amtCurrency = transaction["Soll"];
            else
                amtCurrency = transaction["Haben"];
        }
        return amtCurrency;
    }

    getAccountDebit(transaction) {
        let accountDebit = "";
        if (transaction["Soll"])
            accountDebit = transaction["Kontonummer"].trim();
        else
            accountDebit = transaction["GK"].trim();
        return accountDebit;
    }

    getAccountCredit(transaction) {
        let accountCredit = "";
        if (transaction["Haben"])
            accountCredit = transaction["Kontonummer"].trim();
        else
            accountCredit = transaction["GK"].trim()

        return accountCredit;
    }

    getDescription(transaction) {
        let description = "";
        if (transaction["Beschreibung"] && transaction["Kontakt"])
            description = transaction["Beschreibung"] + ", " + transaction["Kontakt"];
        else
            description = transaction["Beschreibung"];

        return description;
    }

    /**
     * Given the vatCode from Bexio, returns the corrispondent code from Banana (if present), 
     * otherwise empty.
     */
    getBananaVatCode(bxVatCode) {
        if (bxVatCode) {
            let mpdVatCodes = this.getMappedVatCodes();
            let banVatCode;

            /*Get the Banana vat code */
            banVatCode = mpdVatCodes.get(bxVatCode);

            if (banVatCode) {
                return banVatCode;
            }
        }

        return "";
    }

    /** Returns the bclass for the account entered starting
     * assuming it is an account plan 
     * Swiss for PMI, otherwise returns blank.
     * */
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

    /** Returns the structure containing the vat codes mapped by Bexio
     * this structure contains the standard codes, it does not work in 
     * case the user has customized the vat codes table.
     * We use codes for managing net amounts, since Bexio
     * handles them this way.
     * */
    getMappedVatCodes() {
        /**
         * Map structure:
         * key = Bexio vat code
         * value = Banana vat code
         */
        const vatCodes = new Map()

        //set codes
        vatCodes.set("UN77", "V77");
        vatCodes.set("UR25", "V25-N");
        vatCodes.set("VB77", "I77-1");
        vatCodes.set("VB25", "I25");
        vatCodes.set("VB81", "I81-1");
        vatCodes.set("VM77", "M77-1");
        vatCodes.set("VM26", "M26");
        vatCodes.set("UN81", "V81");
        vatCodes.set("VM81", "M81-1");
        // Bexio uses VSF for more operations, in Banana we have more appliable codes, we choose I0 as its general.
        vatCodes.set("VSF", "I0");
        vatCodes.set("VIM", "M0");

        return vatCodes;
    }
}

/**
 * 
 * @param {*} banDocument the current Banana file
 */
var BexioTransactionsImportFormat1 = class BexioTransactionsImportFormat1 {
    constructor(banDocument) {
        this.version = '1.0';
        this.banDocument = banDocument;
        //array dei patches
        this.jsonDocArray = [];

    }

    /** Return true if the transactions match this format */
    match(transactions) {
        if (transactions.length === 0)
            return false;

        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            if ((transaction["Referenz"] && transaction["Referenz"].length >= 0) &&
                (transaction["Umrechnungsfaktor"] && transaction["Umrechnungsfaktor"].length >= 0))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Datum"] &&
                transaction["Datum"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
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
         * so sequential changes work perfectly.
        */
        /*ADD THE ACCOUNTS*/
        if (this.createJsonDocument_AddAccounts(transactions)) {
            this.jsonDocArray.push(this.createJsonDocument_AddAccounts(transactions));
        }
        /*ADD VAT CODES */
        if (this.createJsonDocument_AddVatCodes(transactions)) {
            this.jsonDocArray.push(this.createJsonDocument_AddVatCodes(transactions));
        }
        /*ADD THE TRANSACTIONS*/
        if (this.createJsonDocument_AddTransactions(transactions)) {
            this.jsonDocArray.push(this.createJsonDocument_AddTransactions(transactions));
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
        jsonDoc.creator.name = Banana.script.getParamValue('id');
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
        let newAccountsData = {}; //will contain new accounts data.
        let accountsList = [];
        let columnsIndxList = [];
        let existingAccounts;
        const debitCol = "Soll";
        const creditCol = "Haben";

        columnsIndxList.push(debitCol);
        columnsIndxList.push(creditCol);

        accountsList = this.getDataFromFile(transactions, columnsIndxList);
        /**Create an object with the new accounts data*/
        this.setNewAccountsDataObj(accountsList, newAccountsData);
        /* Get the list of existing accounts*/
        existingAccounts = this.getExistingData("Accounts", "Account");
        /* Filter the account by removing the existing ones */
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
                row.operation.srcFileName = "" //to define.
                row.fields = {};
                row.fields["Account"] = account;
                row.fields["Description"] = description;
                row.fields["BClass"] = bClass;
                row.fields["Currency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency"); //actually set the base currency to all.

                rows.push(row);
            }
        }


        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Accounts";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;

    }

    /**
     * Filter accounts data that already exists in the account table
     * by removing them from the "newAccountsData" object.
     */
    filterAccountsData(newAccountsData, existingAccounts) {
        let newArray = [];
        if (newAccountsData) {
            for (var key in newAccountsData.data) {
                const elementObj = newAccountsData.data[key];
                if (elementObj && elementObj.account) {
                    // check if the account number already exists
                    if (!existingAccounts.includes(elementObj.account)) {
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
        if (accountsList.length >= 0) {
            for (var i = 0; i < accountsList.length; i++) {
                let element = accountsList[i];
                let accDescription = "";
                let accountNr = ""
                let accountBclass = "";
                let accData = {};

                if (element) {
                    accDescription = element.substring(element.length - 1, element.indexOf('-') + 1);
                    accountNr = this.getAccountFromTextField(element);
                    accountBclass = this.setAccountBclass(element);

                    accData.account = accountNr.trim();
                    accData.description = accDescription.trim();
                    accData.bclass = accountBclass;

                    accountsData.push(accData);
                }
            }
        }
        newAccountsData.data = accountsData;
    }

    /**
     * Finds and returns the account number contained in the debit or credit fields (Bexio file).
     * Each description follow this format:
     *  - "1020 - Post"
     *  - "1000 - Bank"
     * @param {*} rowField 
     */
    getAccountFromTextField(rowField) {
        let account;
        if (rowField) {
            account = rowField.substring(0, rowField.indexOf(' '));
            account.trim();
        }

        return account;
    }

    /**
     * Creates the document change object fot vat table
     */
    createJsonDocument_AddVatCodes(transactions) {

        let jsonDoc = this.createJsonDocument_Init();


        //get the vat code list from the transactions
        let vatCodesList = [];
        let columnsNames = [];
        const vatCodeCl = "MWST";
        let newVatCodesData = {};
        let existingVatCodes = [];
        let rows = [];

        columnsNames.push(vatCodeCl);

        vatCodesList = this.getDataFromFile(transactions, columnsNames);
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
                row.operation.srcFileName = "" //to define.
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
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

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
                    if (!existingVatCodes.includes(elementObj.code) &&
                        !mappedVatCodes.has(elementObj.code)) {
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
        if (vatCodesList.length >= 0) {
            for (var i = 0; i < vatCodesList.length; i++) {
                let element = vatCodesList[i];
                let vatCode = "";
                let vatRate = "";
                let vatData = {};

                if (element) {
                    vatCode = this.getCodeFromVatField(element);
                    vatRate = element.substring(element.indexOf('(') + 1, element.indexOf('%'));

                    vatData.code = vatCode.trim();
                    vatData.rate = vatRate.trim();

                    vatCodesData.push(vatData);
                }
            }
        }
        newVatCodesData.data = vatCodesData;
    }

    /**
     * Loops the excel file records and returns a list (set) of data
     * with the information contained in the "columnName" column.
     * @param {*} transactions
     */
    getDataFromFile(transactions, columnnNames) {
        const elements = new Set();
        transactions.forEach((item) => {
            columnnNames.forEach((property) => {
                if (item[property] && item.hasOwnProperty(property)) {
                    elements.add(item[property]);
                }
            });
        });
        //convert the set into an array, as it is more easy to manage.
        let newArray = Array.from(elements);
        return newArray;
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
                };
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
            code = rowField.substring(0, rowField.indexOf(' '));
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

        /*Loop trough the transactions starting from the first line of data (= 1)*/
        for (var i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];
            let vatCode = this.getBananaVatCode(this.getCodeFromVatField(transaction["MWST"]));

            let row = {};
            row.operation = {};
            row.operation.name = "add";
            row.operation.srcFileName = "" //to define.
            row.fields = {};
            row.fields["Date"] = Banana.Converter.toInternalDateFormat(transaction["Datum"], "dd-mm-yyyy");
            row.fields["ExternalReference"] = this.getExternalReference(transaction);
            row.fields["AccountDebit"] = this.getAccountFromTextField(transaction["Soll"]);
            row.fields["AccountCredit"] = this.getAccountFromTextField(transaction["Haben"]);
            row.fields["Description"] = this.getDescription(transaction);
            row.fields["AmountCurrency"] = transaction["Betrag"];
            row.fields["ExchangeCurrency"] = transaction["Buchungswährung"];
            row.fields["ExchangeRate"] = transaction["Umrechnungsfaktor"];
            row.fields["Amount"] = transaction["Betrag in Basiswährung"];
            if (vatCode)
                row.fields["VatCode"] = vatCode;
            else {
                /**the vat code is not bwtween the mapped ones
                 * so we inserted it int the vat codes table.
                 */
                row.fields["VatCode"] = this.getCodeFromVatField(transaction["MWST"]);
            }

            rows.push(row);
        }

        rows = rows.reverse(); // revere the rows in order.
        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;
    }

    getDescription(transaction) {
        let description = "";
        if (transaction["Beschreibung"] && transaction["Beschreibung"].length >= 0)
            description = transaction["Beschreibung"] + ", " + transaction["Referenz"];
        else
            description = transaction["Referenz"];

        return description;
    }

    /** The newer version have the "id" field, the older versions have the "Referenz" field.
     * It is more correct to use the "id" field when it is present.
     */
    getExternalReference(transaction) {
        if (transaction["Id"] && transaction["Id"].length >= 0) {
            return transaction["Id"];
        } else {
            return transaction["Referenz"];
        }
    }

    /**
     * Dato un coidce iva Bexio ritorna il codice corrispondente in Banana.
     */
    getBananaVatCode(bxVatCode) {
        if (bxVatCode) {
            let mpdVatCodes = this.getMappedVatCodes();
            let banVatCode;

            /**get the Banana vat code */
            banVatCode = mpdVatCodes.get(bxVatCode);

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
    setAccountBclass(account) {
        let bClass = "";
        let firstDigit = account.substring(0, 1);
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
        const vatCodes = new Map()

        //set codes
        vatCodes.set("UN77", "V77");
        vatCodes.set("UR25", "V25-N"); // Nuovi codici iva.

        return vatCodes;
    }
}

function defineConversionParam(inData) {
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '\"';
    // get separator
    convertionParam.separator = findSeparator(inData);

    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "Description"];
    convertionParam.sortDescending = false;

    return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];
    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);
    return form;
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
        if (c === ',')
            commaCount++;
        else if (c === ';')
            semicolonCount++;
        else if (c === '\t')
            tabCount++;
    }

    if (tabCount > commaCount && tabCount > semicolonCount) {
        return '\t';
    }
    else if (semicolonCount > commaCount) {
        return ';';
    }

    return ',';
}