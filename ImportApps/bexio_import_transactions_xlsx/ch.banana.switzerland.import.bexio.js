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
// @task = import.transactions
// @inputdatasource = openfiledialog
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

        /**
         * ADD THE ACCOUNTS
         * Actually the accounts are added at the end of the accounts table, 
         * the user must then arrange them themselves within the table,
        */
        this.createJsonDocument_AddAccounts(transactions, jsonDoc);
        /*ADD THE TRANSACTIONS*/
        this.createJsonDocument_AddTransactions(transactions, jsonDoc);

        this.jsonDocArray.push(jsonDoc);

    }

    /**
     * Creates the document change object for the account table.
     * The new accounts list is taken from the debit and credit columns, those
     * columns contains the description and the number of the accounts used in the transactions.
     * Accounts that already exists in the chart of accounts are not inserted.
     * @param {*} inData original transactions.
     */
    createJsonDocument_AddAccounts(transactions,jsonDoc) {

        let rows=[];
        let newAccountsData = {}; //will contain new accounts data.
        let accountsList = [];
        let existingAccounts;

        accountsList = this.getAccountsList(transactions);
        /**Set the object with the new accounts data*/
        this.setNewAccountsData(accountsList,newAccountsData);
        /* Get the list of existing accounts*/
        existingAccounts = this.getExistingAccounts();
        /* Filter the account by removing the existing ones */
        this.filterAccountsData(newAccountsData,existingAccounts);

        //add new accounts to the doc change json.
        if(newAccountsData && newAccountsData.data.length>=0){
            for(var key in newAccountsData.data){
                let account = newAccountsData.data[key].account;
                let description = newAccountsData.data[key].description;
                
                //new rows
                let row = {};
                row.operation = {};
                row.operation.name = "add";
                row.operation.srcFileName = "" //to define.
                row.fields = {};
                row.fields["Account"] = account;
                row.fields["Description"] = description;

                rows.push(row);
            }
        }


        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Accounts";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    }

    /**
     * Loop trough the transactions starting from the first line of data (= 1)
     * and get the list of accounts using a set to avoid duplicates
     * @param {*} transactions
     */
    getAccountsList(transactions){
        const accounts = new Set();
        for (var i = 1; i<transactions.length; i++){
            let tRow = transactions[i];
            let debitCol = tRow[this.Debit];
            let creditCol = tRow[this.trCredit];
            //add elements
            accounts.add(debitCol);
            accounts.add(creditCol);
        }
        //convert the set into an array, as it is more easy to manage.
        let accountsArr = Array.from(accounts);
        return accountsArr;

    }

    /**
     * Filter accounts data that already exists in the account table
     * by removing them from the "newAccountsData" object.
     */
    filterAccountsData(newAccountsData,existingAccounts){
        let newArray = [];
        if(newAccountsData){
            for(var key in newAccountsData.data){
                const elementObj = newAccountsData.data[key];
                if(elementObj && elementObj.account){
                    // check if the account number already exists
                    if(!existingAccounts.includes(elementObj.account)){
                        newArray.push(elementObj);
                    }
                }
            }
        }
        //overvrite the old array with the new one (filtered one).
        newAccountsData.data = newArray;
    }

    setNewAccountsData(accountsList,newAccountsData){
        let accountsData = [];
        if(accountsList.length>=0){
            for (var i = 0; i<accountsList.length; i++){
                let element = accountsList[i];
                let accDescription = "";
                let accountNr = "";
                let accData = {};

                if(element){
                    accDescription = element.substring(element.length-1,element.indexOf('-')+1);
                    accountNr = element.substring(0,element.indexOf('-')-1);

                    accData.account = accountNr.trim();
                    accData.description = accDescription.trim();
    
                    accountsData.push(accData);
                }
            }
        }
        newAccountsData.data = accountsData;
    }

    /**
     * Returns the list of the existing accounts
     * in the account table.
     */
    getExistingAccounts(){
        let accounts = [];
        let accountTable = this.banDocument.table("Accounts");
        if(accountTable){
            let tRows = accountTable.rows;
            for(var key in tRows){
                let row = tRows[key];
                let account = row.value("Account");
                if(account){
                    accounts.push(account);
                };
            }
        }
        return accounts;
    }

    /**
     * Finds and returns the account number contained in the debit and credit fields.
     * Each description follow this format:
     *  - "1020 - Post"
     *  - "1000 - Bank"
     * @param {*} rowField 
     */
    getAccountFromTextField(rowField){
        let account;
        if(rowField){
            account = rowField.substring(0,rowField.indexOf(' '));
            account.trim();
        }

        return account;
    }

    /**
     * Creates the document change object for the transactions table
     * @param {*} jsonDoc 
     * @param {*} srcFileName 
     * @param {*} companyNode 
     */
    createJsonDocument_AddTransactions(transactions, jsonDoc) {

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
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);
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
}


function exec(inData) {

    if (!Banana.document || inData.length <= 0) {
        return "@Cancel";
    }

    var importUtilities = new ImportUtilities(Banana.document);

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