// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.switzerland.import.bexio.js
// @api = 1.0
// @pubdate = 2022-12-19
// @publisher = Banana.ch SA
// @description = Bexio - Import transactions (*xlxs)
// @doctype = 100.*
// @encoding = utf-8
// @task = import.file
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/*
 *   SUMMARY
 *
 *   Import transactions form Bexio to Banana with document change.
 * 
 */

/**
 * function called from converter
 */
function setup() {}

/**
 * 
 * @param {*} banDocument the current Banana file
 */
var BexioTransactionsImportFormat1 = class BexioTransactionsImportFormat1 {
    constructor(banDocument) {
        this.version = '1.0';
        this.banDocument = banDocument;
        this.transNr = "";
        this.vatTransactionsList = [];

        //array dei patches
        this.jsonDocArray = [];

        //errors
        this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";

        //columns
        this.trDate = 0;
        this.trReference = 1;
        this.trDebit = 2;
        this.trCredit = 3;
        this.trDescription = 4;
        this.trAmount = 5;
        this.trCurrency = 6;
        this.trExchangeRate = 7;
        this.amountInBaseCurrency = 8;
        this.vatRate = 9;

    }

    /**
     * The createJsonDocument() method takes the original transactions and
     * creates the Json document with the data to insert into the transactions 
     * table.
     * @param {*} transactions original transactions mapped from the excel file.
     */
    createJsonDocument(transactions) {

        var jsonDoc = this.createJsonDocument_Init();

        /*ADD THE ACCOUNTS*/
        this.createJsonDocument_AddAccounts(transactions, jsonDoc);
        /*ADD THE TRANSACTIONS*/
        this.createJsonDocument_AddTransactions(transactions, jsonDoc);
        this.jsonDocArray.push(jsonDoc);

    }

    /**
     * Creates the document change object for the account table.
     * The accounts list is taken from the debit and credit columns, 
     * The list of accounts is created from the information in the debit and credit columns.
     * Accounts that already exist in the chart of accounts are not inserted.
     * @param {*} inData original transactions.
     */
    createJsonDocument_AddAccounts(transactions,jsonDoc) {

        let rows=[];

        /*Loop trough the transactions starting from the first line of data (= 1)*/
        for (var i = 1; i<transactions.length; i++){
            let tRow = transactions[i];

            let row = {};
            row.operation = {};
            row.operation.name = "add";
            row.operation.srcFileName = "" //to define.
            row.fields = {};
            row.fields["ExternalReference"] = tRow[this.trReference];
            row.fields["Debit"] = tRow[this.Debit];
            row.fields["Credit"] = tRow[this.trCredit];
            row.fields["Description"] = tRow[this.trDescription];
            row.fields["AmountCurrency"] = tRow[this.trAmount];
            row.fields["ExchangeCurrency"] = tRow[this.trCurrency];
            row.fields["ExchangeRate"] = tRow[this.trExchangeRate];
            row.fields["Amount"] = tRow[this.amountInBaseCurrency];
            row.fields["VatCode"] =  tRow[this.vatRate];
        }

        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Accounts";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        // Banana.Ui.showText(JSON.stringify(dataUnitFilePorperties));

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    }

    /**
     * Add the row that define the begin of the base section: Balance, Profit and Loss, Customers and suppliers, Cost centers.
     * @param {*} bClass 
     * @param {*} accType 
     * @returns 
     */
    setBaseSectionDelimiterRow(accType){
        //section
        var sectionDelimiterRows = {};
        sectionDelimiterRows.row = {};
        sectionDelimiterRows.row.operation = {};
        sectionDelimiterRows.row.operation.name = "add";
        sectionDelimiterRows.row.fields = {};
        sectionDelimiterRows.row.fields["Section"] = "*";
        sectionDelimiterRows.row.fields["Description"] = this.setBaseSectionDescription(accType);
        sectionDelimiterRows.emptyRow = this.getEmptyRow();

        return sectionDelimiterRows;
    }

    /**
     * Add the row that define the begin of the section
     * Section ref: Assets=1, Liabilities=2, Costs=3, Revenues=4
     * @param {*} bClass 
     * @param {*} accType 
     * @returns the section delemiter row
     */
    setSectionDelimiterRow(bClass,accType){
        //section
        //costumers and suppliers sections are 1 and 2, for the delimiter of section we want to have 01 and 02
        if(accType=="C" || accType=="S"){
            bClass="0"+bClass;
        }
        var sectionDelimiterRows = {};
        sectionDelimiterRows.row = {};
        sectionDelimiterRows.row.operation = {};
        sectionDelimiterRows.row.operation.name = "add";
        sectionDelimiterRows.row.fields = {};
        sectionDelimiterRows.row.fields["Section"] = bClass
        //get the description but take only the word after the space.
        //example TOTAL AKTIVA--> AKTIVA
        let descr=this.setSectionDescription(bClass,accType);
        let startPos=descr.indexOf(" ");
        descr=descr.substr(startPos);
        sectionDelimiterRows.row.fields["Description"] = descr;
        sectionDelimiterRows.emptyRow = this.getEmptyRow();

        return sectionDelimiterRows;
    }

    /**
     * Creates a row for totalize the balance
     * @returns the row object
     */
    setBalanceDiffRow() {
        var balanceRows = {};
        balanceRows.row = {};
        balanceRows.row.operation = {};
        balanceRows.row.operation.name = "add";
        balanceRows.row.fields = {};
        balanceRows.row.fields["Group"] = "00";
        balanceRows.row.fields["Description"] = "Verschil moet = 0 (lege cel) zijn";
        balanceRows.emptyRow = this.getEmptyRow();

        return balanceRows;
    }

    /**
     * Creates a row for the annual result (Profit and loss)
     * @returns the row object
     */
    setTotCeRow() {
        var ceRows = {};
        ceRows.row = {};
        ceRows.row.operation = {};
        ceRows.row.operation.name = "add";
        ceRows.row.fields = {};
        ceRows.row.fields["Group"] = "02";
        ceRows.row.fields["Description"] = "Winst (-) verlies (+) van winst- en verliesrekening";
        ceRows.row.fields["Gr"] = "0511";
        ceRows.emptyRow = this.getEmptyRow();

        return ceRows;
    }

    /* TEMPORARY METHOD, TO BE REVIEWED WHEN WE HAVE A COUPLE OF DIFFERENT AUDIT FILES  
    sets the group in which the annual result, customers and suppliers are to be reported in the balance sheet.
    -if the group is 1E, before the group total I add another group to account for the customers
    -if the group is 2A, before the group total I add another group to account for the annual profit or loss
    -if the group is 2C, before the group total I add another group to account for suppliers.
    */
    setGroupCarriedOver(gr) {
        var grCarriedOver = {};
        switch (gr) {
            case "1E":
                grCarriedOver.gr = "10"
                grCarriedOver.description = "Klanten Register";
                return grCarriedOver;
            case "2A":
                grCarriedOver.gr = "0511"
                grCarriedOver.description = "Winst of verlies lopend jaar";
                return grCarriedOver;
            case "2C":
                grCarriedOver.gr = "20"
                grCarriedOver.description = "Leveranciers register";
                return grCarriedOver;
            default:
                return null;
        }
    }

    /**
     * Creates the row for the carried over groups
     * @param {*} grCarriedOver grCarriedOver object
     * @param {*} grCode
     * @returns 
     */
    setGroupRow_carriedOver(grCarriedOver, grCode) {
        var grRows = {};
        if (grCarriedOver != null) {
            grRows.row = {};
            grRows.row.operation = {};
            grRows.row.operation.name = "add";
            grRows.row.fields = {};
            grRows.row.fields["Group"] = grCarriedOver.gr;
            grRows.row.fields["Description"] = grCarriedOver.description;
            grRows.row.fields["Gr"] = grCode;
        }
        return grRows;
    }

    /**
     * Creates a gr row
     * @param {*} grCode
     * @param {*} bClass 
     * @param {*} accType 
     * @param {*} descr 
     * @returns 
     */
    setGroupRow(grCode,bClass,accType,descr) {
        var grRows = {};
        grRows.row = {};
        grRows.row.operation = {};
        grRows.row.operation.name = "add";
        grRows.row.fields = {};
        grRows.row.fields["Group"] = grCode;
        grRows.row.fields["Description"] = descr;
        grRows.row.fields["Gr"] = this.setGroupTotal(bClass, accType);
        grRows.emptyRow = this.getEmptyRow();

        return grRows;
    }

    /**
     * creates a line for the total of the section
     * @param {*} currentAccType 
     * @param {*} previsousAccType 
     * @param {*} bClass 
     * @returns 
     */
    setSectionRow(currentAccType, previsousAccType,bClass) {
        var secRows = {};
        secRows.row = {};
        secRows.row.operation = {};
        secRows.row.operation.name = "add";
        secRows.row.fields = {};
        secRows.row.fields["Group"] = this.setGroupTotal(bClass, currentAccType);
        secRows.row.fields["Description"] = this.setSectionDescription(bClass, currentAccType);
        secRows.row.fields["Gr"] = this.setSectionGr(previsousAccType);
        //create an empty row to append after the total row
        secRows.emptyRow = this.getEmptyRow();
        return secRows;
    }

    /**
     * Returns the gr of the section total line
     * @param {*} previsousAccType 
     * @returns 
     */
    setSectionGr(previsousAccType) {
        var sectionTotal = "";
        if (previsousAccType == "B") {
            sectionTotal = "00";
            return sectionTotal;
        } else if (previsousAccType == "P") {
            sectionTotal = "02";
            return sectionTotal;
        } else if (previsousAccType == "C") {
            sectionTotal = "10";
            return sectionTotal;
        } else if (previsousAccType == "S") {
            sectionTotal = "20";
            return sectionTotal;
        } else {
            return sectionTotal;
        }
    }

    /**
     * returns the gr of the group total line according zo bclass and account type
     * @param {*} bClass 
     * @param {*} accType 
     * @returns 
     */
    setGroupTotal(bClass, accType) {
        var groupTotal = "";
        if (accType == "B" || accType == "P") {
            switch (bClass) {
                case "1":
                    groupTotal = "1I"
                    return groupTotal;
                case "2":
                    groupTotal = "2E"
                    return groupTotal;
                case "3":
                    groupTotal = "3G"
                    return groupTotal;
                case "4":
                    groupTotal = "4D"
                    return groupTotal;
                default:
                    return groupTotal;
            }
        } else {
            switch (bClass) {
                case "1":
                    groupTotal = "DEB"
                    return groupTotal;
                case "2":
                    groupTotal = "CRE"
                    return groupTotal;
                default:
                    return groupTotal;
            }
        }
    }

    /**
     * returns the section description according to bclass and account type 
     * @param {*} bClass 
     * @param {*} accType 
     * @returns 
     */
    setSectionDescription(bClass, accType) {
        var descr = "";
        //Banana.console.debug(accType);
        if (accType == "B" || accType == "P") {
            switch (bClass) {
                case "1":
                    descr = "TOTALE ACTIVA"
                    return descr;
                case "2":
                    descr = "TOTALE PASSIVA"
                    return descr;
                case "3":
                    descr = "TOTALE LASTEN"
                    return descr;
                case "4":
                    descr = "TOTALE BATEN"
                    return descr;
                default:
                    return descr;
            }
        } else {
            switch (bClass) {
                case "1":
                    descr = "Total Klanten"
                    return descr;
                case "2":
                    descr = "Total Leveranciers"
                    return descr;
                default:
                    return descr;
            }

        }

    }
    /**
     * Returns the description of the basic section, based on the account type 
     * @param {*} accType 
     * @returns 
     */
    setBaseSectionDescription(accType) {
        var descr = "";
            switch (accType) {
                case "B":
                    descr = "BALANCE"
                    return descr;
                case "P":
                    descr = "WINST- EN VERLIESREKENING"
                    return descr;
                case "S":
                case "C":
                    descr = "KLANTEN EN LEVERANCIERS"
                    return descr;
                default:
                    return descr;
            }
    }

    /**
     * Return an empty rows, used as space between the other rows.
     * @returns 
     */
    getEmptyRow() {
        var emptyRow = {};
        emptyRow.operation = {};
        emptyRow.operation.name = "add";
        emptyRow.fields = {};

        return emptyRow;
    }

    /**
     * Get a list of all the customers and suppliers accounts
     * @param {*} customerSupplierNode 
     * @returns 
     */
    getCustomerSuppliers(customerSupplierNode) {
        var customersSuppliersList = [];
        while (customerSupplierNode) { // For each customerSupplierNode
            var accountNumber = customerSupplierNode.firstChildElement('custSupID').text;
            customersSuppliersList.push(accountNumber); //Add the account to the list
            customerSupplierNode = customerSupplierNode.nextSiblingElement('customerSupplier'); // Next customerSupplier
        }
        //Removing duplicates
        for (var i = 0; i < customersSuppliersList.length; i++) {
            for (var x = i + 1; x < customersSuppliersList.length; x++) {
                if (customersSuppliersList[x] === customersSuppliersList[i]) {
                    customersSuppliersList.splice(x, 1);
                    --x;
                }
            }
        }
        return customersSuppliersList;
    }

/**
 * set the group for the customers and suppliers according to class.
 * @param {*} bClass 
 * @returns 
 */
    setCSGrByBclass(bClass) {
        var gr = "";
        switch (bClass) {
            case "1":
                gr = "DEB"
                return gr;
            case "2":
                gr = "CRE"
                return gr;
            default:
                return gr;
        }
    }

    //to define
    setGrByAccount(account) {
        var gr = "";
        switch (account) {
            case "prova":
                return gr;
        }
        //...
    }

    /**
     * Creates the document change object for the transactions table
     * @param {*} jsonDoc 
     * @param {*} srcFileName 
     * @param {*} companyNode 
     */
    createJsonDocument_AddTransactions(jsonDoc, srcFileName, companyNode) {

        var rows = [];

        var transactionsNode = companyNode.firstChildElement('transactions');
        var journalNode = transactionsNode.firstChildElement('journal');

        while (journalNode) {

            var transactionNode = journalNode.firstChildElement('transaction'); // First transaction
            while (transactionNode) {
                var nr = "";
                var desc = "";
                var trDt = "";

                if (transactionNode.hasChildElements('nr')) {
                    nr = transactionNode.firstChildElement('nr').text;
                }
                if (transactionNode.hasChildElements('desc')) {
                    desc = transactionNode.firstChildElement('desc').text;
                }
                if (transactionNode.hasChildElements('trDt')) {
                    trDt = transactionNode.firstChildElement('trDt').text;
                }
                //Banana.console.log("NEW TRANSACTION: " + nr + "; " + desc + "; " + trDt);

                var trLineNode = transactionNode.firstChildElement('trLine');
                while (trLineNode) {

                    var trLineNr = "";
                    var transactionDescription = "";
                    var trLineAccID = "";
                    var trLineDocRef = "";
                    var trLineEffDate = "";
                    var trLineDesc = "";
                    var trLineAmnt = "";
                    var trLineAmntTp = "";
                    var trLineVatId = "";
                    var trLineVatPerc = "";
                    var trLineVatPerc = "";
                    var trLineVatAmt = "";
                    var trLineVatAmtTp = "";

                    if (trLineNode.hasChildElements('nr')) {
                        trLineNr = trLineNode.firstChildElement('nr').text;
                    }
                    if (trLineNode.hasChildElements('accID')) {
                        trLineAccID = trLineNode.firstChildElement('accID').text;
                    }
                    if (trLineNode.hasChildElements('docRef')) {
                        trLineDocRef = trLineNode.firstChildElement('docRef').text;
                    }
                    if (trLineNode.hasChildElements('effDate')) {
                        trLineEffDate = trLineNode.firstChildElement('effDate').text;
                    }
                    if (trLineNode.hasChildElements('desc')) {
                        trLineDesc = trLineNode.firstChildElement('desc').text;
                    }
                    if (trLineNode.hasChildElements('amnt')) {
                        trLineAmnt = trLineNode.firstChildElement('amnt').text;
                    }
                    if (trLineNode.hasChildElements('amntTp')) {
                        trLineAmntTp = trLineNode.firstChildElement('amntTp').text;
                    }

                    //row VAT 
                    if (trLineNode.hasChildElements('vat')) {
                        var trLineVat = trLineNode.firstChildElement('vat');
                        trLineVatId = trLineVat.firstChildElement('vatID').text;
                        trLineVatPerc = trLineVat.firstChildElement('vatPerc').text;
                        trLineVatAmt = trLineVat.firstChildElement('vatAmnt').text;
                        trLineVatAmtTp = trLineVat.firstChildElement('vatAmntTp').text;
                        //save the values i will put in the Vat Codes table.
                        this.vatTransactionsList.push(trLineVatId + "_____" + trLineVatPerc + "_____" + trLineVatAmtTp);
                        if (trLineVatId)
                            trLineVatId = "[" + trLineVatId + "]";
                    }

                    // Description of the transaction
                    if (desc) {
                        transactionDescription = desc + ", " + trLineDesc;
                    } else {
                        transactionDescription = trLineDesc;
                    }

                    // Account and ContraAccount of the transaction
                    if (trLineAmntTp === "D") {
                        var transactionDebitAccount = trLineAccID;
                        var transactionCreditAccount = "";
                    } else if (trLineAmntTp === "C") {
                        var transactionDebitAccount = "";
                        var transactionCreditAccount = trLineAccID;
                    }

                    //add an empty row every new block of transactions
                    if (this.transNr !== nr) {
                        var emptyRow = this.getEmptyRow();
                        rows.push(emptyRow);
                    }

                    var row = {};
                    row.operation = {};
                    row.operation.name = "add";
                    row.operation.srcFileName = srcFileName;
                    row.fields = {};
                    row.fields["Date"] = trLineEffDate;
                    row.fields["Doc"] = nr;
                    row.fields["Description"] = transactionDescription;
                    row.fields["AccountDebit"] = transactionDebitAccount;
                    row.fields["AccountCredit"] = transactionCreditAccount;
                    row.fields["Amount"] = Banana.SDecimal.abs(trLineAmnt);
                    row.fields["VatCode"] = trLineVatId;



                    rows.push(row);

                    this.transNr = nr;

                    trLineNode = trLineNode.nextSiblingElement('trLine'); // Next trLine
                } //trLineNode


                transactionNode = transactionNode.nextSiblingElement('transaction'); // Next transaction
            } // transactionNode

            journalNode = journalNode.nextSiblingElement('journal'); // Next journal

        } //journalNode


        //se non è la versione advanced,limito le registrazioni importate a 100 righe
        if (!this.isAdvanced) {
            rows = rows.slice(0, 100);
        }

        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);
    }

    /**
     * Saves and returns a list with the opening balances
     * @param {*} companyNode 
     * @returns 
     */
    loadOpeningBalances(companyNode) {

        var openingBalanceList = [];
            if (companyNode && companyNode.hasChildElements('openingBalance')) {
                var openingBalanceNode = companyNode.firstChildElement('openingBalance');

                if (openingBalanceNode.hasChildElements('obLine')) {
                    var obLineNode = openingBalanceNode.firstChildElement('obLine');

                    while (obLineNode) { // For each openingBalance

                        if (obLineNode.hasChildElements('accID')) {
                            var accID = obLineNode.firstChildElement('accID').text;
                        }
                        if (obLineNode.hasChildElements('amnt')) {
                            var amnt = obLineNode.firstChildElement('amnt').text;
                        }
                        if (obLineNode.hasChildElements('amntTp')) {
                            var amntTp = obLineNode.firstChildElement('amntTp').text;
                        }

                        openingBalanceList.push(accID + "_____" + amnt + "_____" + amntTp);
                        obLineNode = obLineNode.nextSiblingElement('obLine'); // Next obLine
                    }
                }
        }
        return openingBalanceList;
    }

    /**
     * Set bClass according to account type 
     * @param {*} gr 
     * @param {*} accType 
     * @returns 
     */
    setBclassByAccount(gr, accType) {
        /* from xml file:
        
        Accounts:
            B=balance => BClass 1 or 2
            P=profit/loss => BClass 3 or 4
    
        Customers / Suppliers:
            C=customer
            S=supplier
            B=both customer and supplier
            O=Other, no customer or supplier
        */

        var bClass = "";
        if (accType === "B") {
            if (gr.substr(0, 1) == "1")
                bClass = "1";
            else
                bClass = "2";
        } else if (accType === "P") {
            if (gr.substr(0, 1) == "3")
                bClass = "3";
            else
                bClass = "4";
        } else if (accType === "C") {
                bClass = "1";
        } else if (accType === "S") {
                bClass = "2";
        }
        return bClass;
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
        var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
        var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        //jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
        //jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
        jsonDoc.creator.name = Banana.script.getParamValue('id');
        jsonDoc.creator.version = "1.0";

        return jsonDoc;

    }

    /**
     * Returns information to the accounting file.
     */
    getAccountingInfo() {
        this.accountingInfo = {};
        this.accountingInfo.isDoubleEntry = false;
        this.accountingInfo.isIncomeExpenses = false;
        this.accountingInfo.isCashBook = false;
        this.accountingInfo.multiCurrency = false;
        this.accountingInfo.withVat = false;
        this.accountingInfo.vatAccount = "";
        this.accountingInfo.customersGroup = "";
        this.accountingInfo.suppliersGroup = "";

        if (this.banDocument) {
            var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
            var fileNumber = this.banDocument.info("Base", "FileTypeNumber");
            var fileVersion = this.banDocument.info("Base", "FileTypeVersion");

            if (fileGroup == "100")
                this.accountingInfo.isDoubleEntry = true;
            else if (fileGroup == "110")
                this.accountingInfo.isIncomeExpenses = true;
            else if (fileGroup == "130")
                this.accountingInfo.isCashBook = true;

            if (fileNumber == "110") {
                this.accountingInfo.withVat = true;
            }
            if (fileNumber == "120") {
                this.accountingInfo.multiCurrency = true;
            }
            if (fileNumber == "130") {
                this.accountingInfo.multiCurrency = true;
                this.accountingInfo.withVat = true;
            }

            if (this.banDocument.info("AccountingDataBase", "VatAccount"))
                this.accountingInfo.vatAccount = this.banDocument.info("AccountingDataBase", "VatAccount");

            if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
                this.accountingInfo.customersGroup = this.banDocument.info("AccountingDataBase", "CustomersGroup");
            if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
                this.accountingInfo.suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
        }
    }

    /**
     * returns the error message
     * @param {*} errorId 
     * @param {*} lang 
     * @returns 
     */
    getErrorMessage(errorId, lang) {
        if (!lang)
            lang = 'en';
        switch (errorId) {
            case this.ID_ERR_LICENSE_NOTVALID:
                // Banana.console.debug("advanced message: "+errorId);
                return "This extension requires Banana Accounting+ Advanced, the import of Transactions is limited to 100 Rows";
            case this.ID_ERR_VERSION_NOTSUPPORTED:
                return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
            default:
                return '';
        }
    }

    /**
     * check Banana's licence
     * @returns 
     */
    isBananaAdvanced() {
        // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
        // to check if all application functionalities are permitted
        // the version Advanced returns isWithinMaxRowLimits always false
        // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.9") >= 0) {
            var license = Banana.application.license;
            //Banana.console.debug(license.licenseType);
            //tolgo il license.isWithinMaxFreeLines perchè siccome il file inizialmente e vuoto mi darà sempre true.
            if (license.licenseType === "advanced") {
                return true;
            }
        }
        return false;
    }
}


function exec(inData) {

    if (!Banana.document || inData.length <= 0) {
        return "@Cancel";
    }

    if (!importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

    //Format 1 (fare controllo del match)
    let  bexioTransactionsImportFormat1 = new BexioTransactionsImportFormat1(Banana.document);
    bexioTransactionsImportFormat1.createJsonDocument(transactions);

    var jsonDoc = { "format": "documentChange", "error": "" };
    jsonDoc["data"] = bexioTransactionsImportFormat1.jsonDocArray;

    return jsonDoc;

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

/**
 * The function findSeparator is used to find the field separator.
 */
  function findSeparator(inData) {

	var commaCount=0;
	var semicolonCount=0;
	var tabCount=0;
 
	for(var i = 0; i < 1000 && i < inData.length; i++) {
	   var c = inData[i];
	   if (c === ',')
		  commaCount++;
	   else if (c === ';')
		  semicolonCount++;
	   else if (c === '\t')
		  tabCount++;
	}
 
	if (tabCount > commaCount && tabCount > semicolonCount)
	{
	   return '\t';
	}
	else if (semicolonCount > commaCount)
	{
	   return ';';
	}
 
	return ',';
 }

/**
 * returns the language code
 * @returns 
 */
function  getLang(banDocument) {
    var lang = 'en';
    if (banDocument)
        lang = banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substring(0, 2);
    return lang;
}