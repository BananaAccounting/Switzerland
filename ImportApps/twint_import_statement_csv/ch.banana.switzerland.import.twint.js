// @id = ch.banana.switzerland.import.twint
// @api = 1.0
// @pubdate = 2024-05-06
// @publisher = Banana.ch SA
// @description = Twint - Import movements .csv (Banana+ Advanced)
// @description.de = Twint - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Twint - Import movements .csv (Banana+ Advanced)
// @description.fr = Twint - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Twint - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js
// @timeout = -1

//Accounting type.
const DOUBLE_ENTRY_TYPE = "100";
const INCOME_EXPENSES_TYPE = "110";
// AccountsNames
const TWINT_ACCOUNT = "twintaccount"
const TWINT_IN = "twintIn"
const TWINT_FEE = "twintfee"
// Tables
const ACCOUNTS_TABLE = "Accounts"
const CATEGORIES_TABLE = "Categories"
//Columns
const CATEGORY_COLUMN = "Category"
const ACCOUNT_COLUMN = "Account"
//Others
const CONTRA_ACCOUNT = "[CA]"

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

    let banDoc = Banana.document;
    var importUtilities = new ImportUtilities(banDoc);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    let fieldSeparator = findSeparator(inData);
    var transactions = Banana.Converter.csvToArray(inData, fieldSeparator);

    // Format 1, vedi codice creato per postfinance
    let tFormat1 = new TwintFormat1();
    let transactionsData = tFormat1.getFormattedData(transactions, importUtilities);
    if (tFormat1.match(transactionsData)) {
        userParam = settingsDialog();
        if (!userParam) {
            return "";
        }
        return tFormat1.processTransactions(transactionsData, userParam, banDoc);
    }

    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * Example Twint format 1. [BETA]
 * Csv files are available only for those who use the Merchant portal (https://portal.twint.ch/partner/gui/?login)
 * "Mongrant in:";"2023.11.20";;;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Vitte tae:";"2023.11.01 (00:00)";"Motusa tae:";"";"sit:";"";;;;;;;;;;;;;;
 * "Vitte sit:";"2023.11.26 (23:59)";"Intingunarall:";;;;;;;;;;;;;;;;;
 * "Nam(vi):";"";"Conunium:";;;;;;;;;;;;;;;;;
 * "Funtro:";"";;;;;;;;;;;;;;;;;;
 * "Quaer DIAM:";;"Novenunteratintiuvit:";;;;;;;;;;;;;;;;;
 * ;;"Lätelicinguntangerunducurat:";;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Inete Aluviantumnes (CHF):";"Inete Calonenisqua (CHF):";"Inete Motusa Inoventices (CHF):";"Inete Sensec (CHF):";"Inete Paradixilectatessa (CHF):";;;;;;;;;;;;;;;
 * "0.00";"0.00";"345.45";"0.00";"4.55";;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Datum";"Zeit";"Typ";"Status";"Betrag Transaktion (CHF)";"Rabatt (CHF)";"Transaktionskosten (CHF)";"Niederlassung";"TWINT Terminal ID";"TWINT Order ID";"Referenz Transaktion Händler";"Händlertransaktionsreferenz";"Bezeichnung in der Abrechnung";"Vorname";"Nachname";"Strasse & Nr.";"PLZ";"Ort";"E-Mail-Adresse";"Zahlungszweck"
 * "2023.11.01";"11:45";"Syllide";"Timpentitti";"49.35";;"0.65";"GROPE";"g132ldy0-8623-7c7a-2p68-p68j5i7pyq22";"2r0vrh8j-6o52-6063-w56s-6t8j6y7rr51e";"l068";"2r0vrh8j-6o52-6063-w56s-6t8j6y7rr51e";"GROPE";"Centis";"Claminnes";"Monenetumenerrius 143";"3063";"Rietube";"vumiflfypss32@winte.rem";
 * 
 * 
 * We divide each Twint transaction into 3 rows as shown in the example below:
 * Donation TWINT Müller             3100        100.00 (gross income)
 * Donation TWINT Müller             1032        98.40 (amount cashed)
 * Donation TWINT Müller             6941        1.60 (fee)
 * 
 * Currently, with the test cases and examples we have, we have no way of knowing whether there are any cases where the amount is negative (any adjustments or outgoing payments).
 * The extension is currently a BETA version, further improvements will be implemented as soon as we have the opportunity to work with files providing specific cases.
 * */
function TwintFormat1() {

    this.getFormattedData = function (transactions, importUtilities) {
        let headerLineStart = 12;
        let dataLineStart = 13;
        // We do a copy as the getHeaderData modifies the content and we need to keep the original version clean.
        var transactionsCopy = transactions.map(function (arr) {
            return arr.slice();
        });
        if (transactionsCopy.length < dataLineStart)
            return [];
        let columns = importUtilities.getHeaderData(transactionsCopy, headerLineStart); //array
        let rows = importUtilities.getRowData(transactionsCopy, dataLineStart); //array of array
        let form = [];

        /** We convert the original headers into a custom format to be able to work with the same
         * format regardless of original's headers language or the position of the header column.
         * We need to translate all the .csv fields as the loadForm() method expects the header and
         * the rows to have the same length.
         * */
        let convertedColumns = [];

        // Convert headers from german. 
        convertedColumns = this.convertHeaderDe(columns, convertedColumns);
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        return [];
    }

    this.convertHeaderDe = function (columns) { // riprendere da qui il 06.05.
        let convertedColumns = [];
        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Datum":
                    convertedColumns[i] = "Date";
                    break;
                case "Zeit":
                    convertedColumns[i] = "Time";
                    break;
                case "Typ":
                    convertedColumns[i] = "Description";
                    break;
                case "Status":
                    convertedColumns[i] = "Status";
                    break;
                case "Betrag Transaktion (CHF)":
                case "Betrag Transaktion (EUR)":
                case "Betrag Transaktion (USD)":
                    convertedColumns[i] = "Amount";
                    break;
                case "Rabatt":
                    convertedColumns[i] = "Discount";
                    break;
                case "Transaktionskosten (CHF)":
                    convertedColumns[i] = "Transaction Fee";
                    break;
                case "Niederlassung":
                    convertedColumns[i] = "Branch";
                    break;
                case "TWINT Terminal ID":
                    convertedColumns[i] = "Terminal Id";
                    break;
                case "TWINT Order ID":
                    convertedColumns[i] = "Transaction id";
                    break;
                case "Referenz Transaktion Händler":
                    convertedColumns[i] = "Transaction Reference";
                    break;
                case "Händlertransaktionsreferenz":
                    convertedColumns[i] = "Retailer Transaction Reference";
                    break;
                case "Bezeichnung in der Abrechnung":
                    convertedColumns[i] = "Designation in the invoice";
                    break;
                case "Vorname":
                    convertedColumns[i] = "First Name";
                    break;
                case "Nachname":
                    convertedColumns[i] = "Surname";
                    break;
                case "Strasse & Nr.":
                    convertedColumns[i] = "Street";
                    break;
                case "PLZ":
                    convertedColumns[i] = "Code";
                    break;
                case "Ort":
                    convertedColumns[i] = "Place";
                    break;
                case "E-Mail-Adresse":
                    convertedColumns[i] = "Email";
                    break;
                case "Zahlungszweck":
                    convertedColumns[i] = "Payment Purpose";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("Date") < 0
            || convertedColumns.indexOf("Description") < 0
            || convertedColumns.indexOf("Amount") < 0) {
            return [];
        }
        return convertedColumns;
    }

    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["Date"] && transaction["Date"].length >= 10 &&
                transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (transaction["Time"] && transaction["Time"].length >= 4)
                formatMatched = true;
            else
                formatMatched = false;

            if (transaction["Transaction id"] && transaction["Transaction id"].length >= 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    this.processTransactions = function (transactionsData, userParam, banDoc) {
        let accoutingType = banDoc.info("Base", "FileTypeGroup");
        let headers = [];
        let objectArrayToCsv = [];
        let processedTrans = {};

        if (accoutingType == INCOME_EXPENSES_TYPE) {
            processedTrans = this.processTransactions_IncomeExpenses(transactionsData, userParam);
            headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category", "Notes"];
        } else if (accoutingType == DOUBLE_ENTRY_TYPE) {
            processedTrans = this.processTransactions_DoubleEntry(transactionsData, userParam);
            headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "Notes"];
        }

        objectArrayToCsv = Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");

        return objectArrayToCsv;
    }

    this.processTransactions_DoubleEntry = function (transactionsData, userParam) {
        let transactionsObjs = [];
        for (let i = 0; i < transactionsData.length; i++) {
            let trObj = {};
            let transaction = transactionsData[i];
            trObj = this.processTransactions_DoubleEntry_grossIncome(transaction, userParam);
            transactionsObjs.push(trObj);
            trObj = this.processTransactions_DoubleEntry_netCashed(transaction, userParam);
            transactionsObjs.push(trObj);
            trObj = this.processTransactions_DoubleEntry_fee(transaction, userParam);
            transactionsObjs.push(trObj);

        }
        return transactionsObjs;
    }

    this.processTransactions_DoubleEntry_grossIncome = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_DoubleEntry();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let amount = transaction['Amount'];
        let trFee = transaction['Transaction Fee'];
        let grossIncome = Banana.SDecimal.add(amount, trFee);
        trRowbaseObj.AccountDebit = "";
        trRowbaseObj.AccountCredit = userParam.twintIn;
        trRowbaseObj.Amount = grossIncome;
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }

    this.processTransactions_DoubleEntry_netCashed = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_DoubleEntry();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let amount = transaction['Amount'];
        trRowbaseObj.AccountDebit = userParam.twintAccount;
        trRowbaseObj.AccountCredit = "";
        trRowbaseObj.Amount = amount;
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }

    this.processTransactions_DoubleEntry_fee = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_DoubleEntry();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let trFee = transaction['Transaction Fee'];
        trRowbaseObj.AccountDebit = userParam.twintFee;
        trRowbaseObj.AccountCredit = "";
        trRowbaseObj.Amount = trFee;
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }

    this.processTransactions_IncomeExpenses = function (transactionsData, userParam) {
        let transactionsObjs = [];
        for (let i = 0; i < transactionsData.length; i++) {
            let trObj = {};
            let transaction = transactionsData[i];
            trObj = this.processTransactions_IncomeExpenses_grossIncome(transaction, userParam);
            transactionsObjs.push(trObj);
            trObj = this.processTransactions_IncomeExpenses_netCashed(transaction, userParam);
            transactionsObjs.push(trObj);
            trObj = this.processTransactions_IncomeExpenses_fee(transaction, userParam);
            transactionsObjs.push(trObj);

        }

        return transactionsObjs;
    }

    this.processTransactions_IncomeExpenses_grossIncome = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_IncomeExpenses();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let amount = transaction['Amount'];
        let trFee = transaction['Transaction Fee'];
        let grossIncome = Banana.SDecimal.add(amount, trFee);

        if (amount.indexOf('-') > -1) {
            trRowbaseObj.Income = "";
            trRowbaseObj.Expenses = Banana.Converter.toInternalNumberFormat(grossIncome, this.decimalSeparator);
        } else {
            trRowbaseObj.Income = Banana.Converter.toInternalNumberFormat(grossIncome, this.decimalSeparator);
            trRowbaseObj.Expenses = "";
        }
        trRowbaseObj.Account = "";
        trRowbaseObj.Category = userParam.twintIn;
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }

    this.processTransactions_IncomeExpenses_netCashed = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_IncomeExpenses();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let amount = transaction['Amount'];

        if (amount.indexOf('-') > -1) {
            trRowbaseObj.Income = "";
            trRowbaseObj.Expenses = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        } else {
            trRowbaseObj.Income = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
            trRowbaseObj.Expenses = "";
        }
        trRowbaseObj.Account = userParam.twintAccount;
        trRowbaseObj.Category = "";
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }
    this.processTransactions_IncomeExpenses_fee = function (transaction, userParam) {
        let trRowbaseObj = initTrRowObjectStructure_IncomeExpenses();

        trRowbaseObj.Date = Banana.Converter.toInternalDateFormat(transaction['Date'], userParam.dateFormat);
        trRowbaseObj.ExternalReference = transaction["Transaction id"];
        trRowbaseObj.Description = this.getDescription(transaction);

        let trFee = transaction['Transaction Fee'];
        trRowbaseObj.Income = "";
        trRowbaseObj.Expenses = Banana.Converter.toInternalNumberFormat(trFee, this.decimalSeparator);
        trRowbaseObj.Account = "";
        trRowbaseObj.Category = userParam.twintFee;
        trRowbaseObj.Notes = "";

        return trRowbaseObj;
    }

    this.getDescription = function (transaction) {
        let description = "";
        let type = transaction['Description'];
        let branch = transaction['Branch'];
        let firstName = transaction['First Name'];
        let lastName = transaction['Surname'];

        description = type + " " + " " + branch + " " + firstName + " " + lastName;

        return description;
    }
}

function settingsDialog() {

    let dialogParam = {};
    let savedDlgParam = Banana.document.getScriptSettings("TwintImportDlgParams");
    if (savedDlgParam.length > 0) {
        let parsedParam = JSON.parse(savedDlgParam);
        if (parsedParam) {
            dialogParam = parsedParam;
        }
    }

    //Verify Params.
    verifyParam(dialogParam);
    //Settings dialog
    var dialogTitle = 'Settings';
    var pageAnchor = 'twintImportDlgParams';
    var convertedParam = {};

    convertedParam = convertParam(dialogParam);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }
    //set the parameters
    let paramToString = JSON.stringify(dialogParam);
    Banana.document.setScriptSettings("TwintImportDlgParams", paramToString);
    return dialogParam;
}

function initParam() {
    var params = {};

    params.dateFormat = "yyyy.mm.dd";
    params.twintAccount = ""; // Bank account
    params.twintIn = ""; // Revenues account.
    params.twintFee = ""; // Costs account.

    return params;

}

function convertParam(userParam) {
    var paramList = {};
    let texts = getTexts(Banana.document);
    var defaultParam = initParam();
    paramList.version = '1.0';
    paramList.data = [];

    var param = {};
    param.name = 'dateformat';
    param.title = texts.dateFormat;
    param.type = 'string';
    param.value = userParam.dateFormat ? userParam.dateFormat : '';
    param.defaultvalue = defaultParam.dateFormat;
    param.readValue = function () {
        userParam.dateFormat = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = TWINT_ACCOUNT;
    param.title = texts.twintAccount;
    param.type = 'string';
    param.value = userParam.twintAccount ? userParam.twintAccount : '';
    param.defaultvalue = defaultParam.twintAccount;
    param.readValue = function () {
        userParam.twintAccount = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = TWINT_IN;
    param.title = texts.twintIn;
    param.type = 'string';
    param.value = userParam.twintIn ? userParam.twintIn : '';
    param.defaultvalue = defaultParam.twintIn;
    param.readValue = function () {
        userParam.twintIn = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = TWINT_FEE;
    param.title = texts.twintFee;
    param.type = 'string';
    param.value = userParam.twintFee ? userParam.twintFee : '';
    param.defaultvalue = defaultParam.twintFee;
    param.readValue = function () {
        userParam.twintFee = this.value;
    }
    paramList.data.push(param);

    return paramList;
}

function verifyParam(dialogParam) {

    let defaultParam = initParam();

    if (!dialogParam.dateFormat) {
        dialogParam.dateFormat = defaultParam.dateFormat;
    }
    if (!dialogParam.twintAccount) {
        dialogParam.twintAccount = defaultParam.twintAccount;
    }
    if (!dialogParam.twintIn) {
        dialogParam.twintIn = defaultParam.twintIn;
    }
    if (!dialogParam.twintFee) {
        dialogParam.twintFee = defaultParam.twintFee;
    }
}

function getTexts(banDocument) {

    let lang = getLang(banDocument);

    if (lang == "")
        return lang;

    switch (lang) {
        case 'de':
            return getTextsDe();
        case 'it':
            return getTextsIt();
        case 'fr':
            return getTextsFr();
        case 'en':
        default:
            return getTextsEn();
    }
}

function getLang(banDocument) {
    let lang = 'en';
    if (banDocument)
        lang = banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function getTextsDe() {
    let texts = {};

    texts.dateFormat = "Datum Format";
    texts.twintAccount = "Twint Account";
    texts.twintIn = "Twint In";
    texts.twintFee = "Twint Fee";
    texts.accountMissing = "Fehlendes Konto";
    texts.accountErrorMsg = "Dieses Konto existiert nicht in Ihrem Kontenplan";

    return texts;
}

function getTextsIt() {
    let texts = {};

    texts.dateFormat = "Formato Data";
    texts.twintAccount = "Twint Account";
    texts.twintIn = "Twint In";
    texts.twintFee = "Twint Fee";
    texts.accountMissing = "Conto mancante";
    texts.accountErrorMsg = "Questo conto non esiste nel piano dei conti";

    return texts;
}

function getTextsFr() {
    let texts = {};

    texts.dateFormat = "Format de date";
    texts.twintAccount = "Twint Account";
    texts.twintIn = "Twint In";
    texts.twintFee = "Twint Fee";
    texts.accountMissing = "Compte manquant";
    texts.accountErrorMsg = "Ce compte n'existe pas dans le plan comptable";


    return texts;
}

function getTextsEn() {
    let texts = {};

    texts.dateFormat = "Date Format";
    texts.twintAccount = "Twint Account";
    texts.twintIn = "Twint In";
    texts.twintFee = "Twint Fee";
    texts.accountMissing = "Missing account";
    texts.accountErrorMsg = "This account does not exists in your chart of accounts";

    return texts;
}

function initTrRowObjectStructure_DoubleEntry() {
    let trRow = {};

    trRow.Date = "";
    trRow.ExternalReference = "";
    trRow.Description = "";
    trRow.AccountDebit = "";
    trRow.AccountCredit = "";
    trRow.Amount = "";
    trRow.Notes = "";

    return trRow;
}

function initTrRowObjectStructure_IncomeExpenses() {
    let trRow = {};

    trRow.Date = "";
    trRow.ExternalReference = "";
    trRow.Description = "";
    trRow.Income = "";
    trRow.Expenses = "";
    trRow.Account = "";
    trRow.Category = "";
    trRow.Notes = "";

    return trRow;
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

    var commaCount = 0;
    var semicolonCount = 0;
    var tabCount = 0;

    for (var i = 0; i < 1000 && i < string.length; i++) {
        var c = string[i];
        if (c === ',')
            commaCount++;
        else if (c === ';')
            semicolonCount++;
        else if (c === '\t')
            tabCount++;
    }

    if (tabCount > commaCount && tabCount > semicolonCount) {
        return '\t';
    } else if (semicolonCount > commaCount) {
        return ';';
    }

    return ',';
}

function validateParams(params) {
    const accountNames = [TWINT_ACCOUNT, TWINT_IN, TWINT_FEE];
    const accountsList = [];
    let texts = getTexts();
    params.data.forEach(item => {
        if (accountNames.includes(item.name)) {
            accountsList.push({ name: item.name, value: item.value });
        }
    });
    if (accountsList.length > 0) {
        for (var i = 0; i < params.data.length; i++) {
            let account = params.data[i].value;
            const isValueInArray = accountsList.some(obj => obj.value === account);
            if (isValueInArray) {
                if (account == "") {
                    params.data[i].errorMsg = texts.accountMissing;
                    return false;
                } else if (!AccountExists(account)) {
                    params.data[i].errorMsg = texts.accountErrorMsg;
                    return false;
                }
            }
        }
    }

    return true;
}

function AccountExists(account) {
    let banDoc = Banana.document;
    let accoutingType = banDoc.info("Base", "FileTypeGroup");

    if (banDoc && account) {
        let accountsTable = banDoc.table(ACCOUNTS_TABLE);
        if (!accountsTable)
            return false;
        //check in the chart of accounts.
        for (var i = 0; i < accountsTable.rowCount; i++) {
            var tRow = accountsTable.row(i);
            // Check if the account is present in the chart of accounts.
            if (account == tRow.value(ACCOUNT_COLUMN)) {
                Banana.console.debug(account + " / " + tRow.value(ACCOUNT_COLUMN));
                return true;
            }
        }
        //check also in the category table
        if (accoutingType == INCOME_EXPENSES_TYPE) {
            let categoriesTable = banDoc.table(CATEGORIES_TABLE);
            for (var i = 0; i < categoriesTable.rowCount; i++) {
                var tRow = categoriesTable.row(i);
                // Check if the account is present in the chart of accounts.
                if (account == tRow.value(CATEGORY_COLUMN)) {
                    Banana.console.debug("prova2");
                    return true;
                }
            }
        }
    }
    return false;

}
