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
// @id = ch.banana.switzerland.import.bexio
// @api = 1.0
// @pubdate = 2022-12-19
// @publisher = Banana.ch SA
// @description = Bexio - Import transactions (*xlsx).
// @doctype = 100.130
// @encoding = utf-8
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

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
function exec(inData,banDocument,isTest) {

    let banDoc;

    if (!inData)
        return "";

    if(isTest && !banDocument)
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

    //Format 1 (do match check in case there are more versions in the future)
    let  bexioTransactionsImportFormat1 = new BexioTransactionsImportFormat1(banDoc);
    if(bexioTransactionsImportFormat1.match(transactions)){
        bexioTransactionsImportFormat1.createJsonDocument(transactions);
        var jsonDoc = { "format": "documentChange", "error": "" };
        jsonDoc["data"] = bexioTransactionsImportFormat1.jsonDocArray;
        return jsonDoc;
    }

    importUtilities.getUnknownFormatError();

    return "";

}

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
        this.colCount = 11;

        //array dei patches
        this.jsonDocArray = [];

        //columns
        this.trDate = 0;
        this.trReference = 1;
        this.trDebit = 2;
        this.trCredit = 3;
        this.trDescription = 4;
        this.trAmount = 5;
        this.trCurrency = 6;
        this.trExchangeRate = 7;
        this.trAmountInBaseCurrency = 8;
        this.trBaseCurrency = 9;
        this.trVatRate = 10;

    }

    /** Return true if the transactions match this format */
    match(transactions){
        if (transactions.length === 0) 
            return false;

        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length >= this.colCount) 
                formatMatched = true;
            else 
                formatMatched = false;

            if (formatMatched && transaction[this.trDate] &&
                transaction[this.trDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else 
                formatMatched = false;

            if (formatMatched && transaction[this.trCurrency] &&
                transaction[this.trCurrency].match(/[A-Z]/)) //currencies are always uppecase.
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
        if(this.createJsonDocument_AddAccounts(transactions)){
            this.jsonDocArray.push(this.createJsonDocument_AddAccounts(transactions));
        }
        /*ADD VAT CODES */
        if(this.createJsonDocument_AddVatCodes(transactions)){
            this.jsonDocArray.push(this.createJsonDocument_AddVatCodes(transactions));
        }
        /*ADD THE TRANSACTIONS*/
        if(this.createJsonDocument_AddTransactions(transactions)){
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
        var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
        var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
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

        let rows=[];
        let newAccountsData = {}; //will contain new accounts data.
        let accountsList = [];
        let columnsIndxList = [];
        let existingAccounts;
        let debitCol = this.trDebit;
        let creditCol = this.trCredit;

        columnsIndxList.push(debitCol);
        columnsIndxList.push(creditCol);

        accountsList = this.getDataFromFile(transactions,columnsIndxList);
        /**Create an object with the new accounts data*/
        this.setNewAccountsDataObj(accountsList,newAccountsData);
        /* Get the list of existing accounts*/
        existingAccounts = this.getExistingData("Accounts","Account");
        /* Filter the account by removing the existing ones */
        this.filterAccountsData(newAccountsData,existingAccounts);

        //add new accounts to the doc change json.
        if(newAccountsData && newAccountsData.data.length>=0){
            for(var key in newAccountsData.data){
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
                row.fields["Currency"] = this.banDocument.info("AccountingDataBase","BasicCurrency"); //actually set the base currency to all.

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

    /**
     * Given a list of accounts creates an object containing for each account
     * the account number and the account description.
     */
    setNewAccountsDataObj(accountsList,newAccountsData){
        let accountsData = [];
        if(accountsList.length>=0){
            for (var i = 0; i<accountsList.length; i++){
                let element = accountsList[i];
                let accDescription = "";
                let accountNr = ""
                let accountBclass ="";
                let accData = {};

                if(element){
                    accDescription = element.substring(element.length-1,element.indexOf('-')+1);
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
    getAccountFromTextField(rowField){
        let account;
        if(rowField){
            account = rowField.substring(0,rowField.indexOf(' '));
            account.trim();
        }

        return account;
    }

    /**
     * Creates the document change object fot vat table
     */
    createJsonDocument_AddVatCodes(transactions){

        let jsonDoc = this.createJsonDocument_Init();


        //get the vat code list from the transactions
        let vatCodesList = [];
        let newVatCodesData = {};
        let columnsIndxList = [];
        let existingVatCodes = [];
        let rows =[];
        
        columnsIndxList.push(this.trVatRate);

        vatCodesList = this.getDataFromFile(transactions,columnsIndxList);
        /**Create an object with the new accounts data*/
        this.setNewVatCodesDataObj(vatCodesList,newVatCodesData);
        existingVatCodes = this.getExistingData("VatCodes","VatCode");
        this.filterVatCodesData(newVatCodesData,existingVatCodes);

        //add new vat codes to the doc change json.
        if(newVatCodesData && newVatCodesData.data.length>=0){
            for(var key in newVatCodesData.data){
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
    filterVatCodesData(newVatCodesData,existingVatCodes){
        let newArray = [];
        let mappedVatCodes = this.getMappedVatCodes();
        if(newVatCodesData){
            for(var key in newVatCodesData.data){
                const elementObj = newVatCodesData.data[key];
                if(elementObj && elementObj.code){
                    /**Check if the account number already exists
                     * in the vat table or if it's already between mapped elements*/
                    if(!existingVatCodes.includes(elementObj.code) &&
                        !mappedVatCodes.has(elementObj.code)){
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
    setNewVatCodesDataObj(vatCodesList,newVatCodesData){
        let vatCodesData = [];
        if(vatCodesList.length>=0){
            for (var i = 0; i<vatCodesList.length; i++){
                let element = vatCodesList[i];
                let vatCode = "";
                let vatRate = "";
                let vatData = {};

                if(element){
                    vatCode = this.getCodeFromVatField(element);
                    vatRate = element.substring(element.indexOf('(')+1, element.indexOf('%'));

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
     * with the information contained at the "columnsIndxList" columns.
     * @param {*} transactions
     */
    getDataFromFile(transactions,columnsIndxList){
        const accounts = new Set();
        for (var i = 1; i<transactions.length; i++){
            let tRow = transactions[i];
            if(columnsIndxList.length>=0){
                for(var j = 0; j<columnsIndxList.length; j++){
                    let columnData = tRow[columnsIndxList[j]];
                    if(columnData){
                        accounts.add(columnData);
                    }
                }
            }
        }
        //convert the set into an array, as it is more easy to manage.
        let newArray = Array.from(accounts);
        return newArray;
    }

    /**
     * Returns a list with the data contained in the table "tableName"
     * to the column "columnName".
     */
    getExistingData(tableName,columnName){
        let accounts = [];
        let accountTable = this.banDocument.table(tableName);
        if(accountTable){
            let tRows = accountTable.rows;
            for(var key in tRows){
                let row = tRows[key];
                let account = row.value(columnName);
                if(account){
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
    getCodeFromVatField(rowField){
        let code = "";
        if(rowField){
            code = rowField.substring(0,rowField.indexOf(' '));
            code.trim();
        }

        return code;
    }

    /**
     * Creates the document change object for the transactions table.
     */
    createJsonDocument_AddTransactions(transactions) {

        let jsonDoc = this.createJsonDocument_Init();
        let rows=[];

        /*Loop trough the transactions starting from the first line of data (= 1)*/
        for (var i = 1; i<transactions.length; i++){
            let tRow = transactions[i];
            let vatCode = this.getBananaVatCode(this.getCodeFromVatField(tRow[this.trVatRate]));

            let row = {};
            row.operation = {};
            row.operation.name = "add";
            row.operation.srcFileName = "" //to define.
            row.fields = {};
            row.fields["Date"] = Banana.Converter.toInternalDateFormat(tRow[this.trDate],"dd-mm-yyyy");
            row.fields["ExternalReference"] = tRow[this.trReference];
            row.fields["AccountDebit"] = this.getAccountFromTextField(tRow[this.trDebit]);
            row.fields["AccountCredit"] = this.getAccountFromTextField(tRow[this.trCredit]);
            row.fields["Description"] = tRow[this.trDescription];
            row.fields["AmountCurrency"] = tRow[this.trAmount];
            row.fields["ExchangeCurrency"] = tRow[this.trCurrency];
            row.fields["ExchangeRate"] = tRow[this.trExchangeRate];
            row.fields["Amount"] = tRow[this.trAmountInBaseCurrency];
            if(vatCode)
                row.fields["VatCode"] = vatCode;
            else{
                /**the vat code is not bwtween the mapped ones
                 * so we inserted it int the vat codes table.
                 */
                row.fields["VatCode"] = this.getCodeFromVatField(tRow[this.trVatRate]);
            }

            rows.push(row);
        }

        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;
    }

    /**
     * Dato un coidce iva Bexio ritorna il codice corrispondente in Banana.
     */
    getBananaVatCode(bxVatCode){
        if(bxVatCode){
            let mpdVatCodes = this.getMappedVatCodes();
            let banVatCode;

            /**get the Banana vat code */
            banVatCode = mpdVatCodes.get(bxVatCode);

            if(banVatCode){
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
    setAccountBclass(account){
        let bClass = "";
        let firstDigit = account.substring(0,1);
        switch(firstDigit){
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
            case "4":
            case "5":
            case "6": //some cases is 4.
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
    getMappedVatCodes(){
        /**
         * Map structure:
         * key = Bexio vat code
         * value = Banana vat code
         */
        const vatCodes = new Map ()

        //set codes
        vatCodes.set("UN77","V77");
        vatCodes.set("UR25","V25");

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