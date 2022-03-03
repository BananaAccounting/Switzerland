// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.switzerland.pain001
// @api = 1.0
// @pubdate = 2022-03-03
// @publisher = Banana.ch SA
// @description = Credit Transfer File for Switzerland (pain.001)
// @task = accounting.payment
// @doctype = *
// @includejs = ch.banana.pain001.js
// @includejs = checkfunctions.js
// @includejs = documentchange.js

/** 
*   Main function
*/
function exec(inData, options) {
    //this script uses the JsAction class to edit/add paymentdata to an accounting data file
    return false;
}

/**
* function called by combobox accountId, event currentIndexChanged
*/
function onCurrentIndexChanged_creditorAccountId(index, value, params) {
    var pain001CH = new Pain001Switzerland(Banana.document);

    //if something is already written ask before resetting data
    let existingData = false;
    for (var i = 0; i < params.data.length; i++) {
        var paramsKey = params.data[i].name;
        var paramsValue = params.data[i].value;
        if (paramsKey.startsWith('creditor') && paramsKey !== 'creditorAccountId') {
            if (paramsValue && paramsValue.length > 0) {
                existingData = true;
                break;
            }
        }
    }

    let keepData = false;
    if (existingData) {
        var answer = Banana.Ui.showQuestion("Payments", "Clear existing data?");
        if (!answer)
            keepData = true;
    }

    if (keepData)
        return params;

    var creditor = pain001CH.getCreditor(value);

    for (var i = 0; i < params.data.length; i++) {
        if (params.data[i].name === 'creditorAccountId') {
            params.data[i].value = creditor.accountId;
        }
        else if (params.data[i].name === 'creditorName') {
            params.data[i].value = creditor.name;
        }
        else if (params.data[i].name === 'creditorStreet1') {
            params.data[i].value = creditor.street1;
        }
        else if (params.data[i].name === 'creditorStreet2') {
            params.data[i].value = creditor.street2;
        }
        else if (params.data[i].name === 'creditorPostalCode') {
            params.data[i].value = creditor.postalCode;
        }
        else if (params.data[i].name === 'creditorCity') {
            params.data[i].value = creditor.city;
        }
        else if (params.data[i].name === 'creditorCountry') {
            params.data[i].value = creditor.country;
        }
        else if (params.data[i].name === 'creditorBankAccount') {
            params.data[i].value = creditor.bankAccount;
        }
        else if (params.data[i].name === 'creditorBankName') {
            params.data[i].value = creditor.bankName;
        }
        else if (params.data[i].name === 'creditorBankAddress1') {
            params.data[i].value = creditor.bankAddress1;
        }
        else if (params.data[i].name === 'creditorBankAddress2') {
            params.data[i].value = creditor.bankAddress2;
        }
        else if (params.data[i].name === 'creditorBic') {
            params.data[i].value = creditor.bic;
        }
        else if (params.data[i].name === 'creditorIban') {
            params.data[i].value = creditor.iban;
        }
    }
    return params;
}

function onCurrentIndexChanged_methodId(index, value, params) {
    // Banana.console.debug("onCurrentIndexChanged_methodId index:" + index + " value: " + value)

    //create a new object
    var pain001CH = new Pain001Switzerland(Banana.document);
    var paymentObj = pain001CH.initPaymData();
    if (parseInt(index) == 1)
        paymentObj.methodId = pain001CH.ID_PAYMENT_SEPA_DESCRIPTION;
    else
        paymentObj.methodId = pain001CH.ID_PAYMENT_QRCODE_DESCRIPTION;
    var newParams = pain001CH.convertPaymData(paymentObj);

    //if something is already written ask before resetting data
    let existingData = false;
    for (var i = 0; i < params.data.length; i++) {
        var key = params.data[i].name;
        if (key !== "methodId" && params.data[i].value.length > 0) {
            for (var j = 0; j < newParams.data.length; j++) {
                if (newParams.data[j].name === params.data[i].name &&
                    newParams.data[j].value !== params.data[i].value) {
                    existingData = true;
                    break;
                }
            }
        }
    }

    let keepData = false;
    if (existingData) {
        var answer = Banana.Ui.showQuestion("Payments", "Clear existing data?");
        if (!answer)
            keepData = true;
    }

    for (var i = 0; i < newParams.data.length; i++) {
        var key = newParams.data[i].name;
        if (key !== 'methodId' && keepData) {
            for (var j = 0; j < params.data.length; j++) {
                if (params.data[j].name === newParams.data[i].name) {
                    newParams.data[i].value = params.data[j].value;
                }
            }
        }
    }

    return newParams;
}

/** 
* Update script's parameters
*/
function settingsDialog() {
    var pain001CH = new Pain001Switzerland(Banana.document);
    if (!pain001CH.verifyBananaVersion())
        return;

    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        pain001CH.setParam(JSON.parse(savedParam));
    }

    var dialogTitle = 'Settings';
    var pageAnchor = 'dlgSettings';
    var convertedParam = pain001CH.convertParam(pain001CH.param);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        convertedParam.data[i].readValue();
    }
    var paramToString = JSON.stringify(pain001CH.param);
    Banana.document.setScriptSettings(paramToString);
}

function validateParams(params) {
    var pain001CH = new Pain001Switzerland(Banana.document);
    return pain001CH.validatePaymData(params);
}

/*
* class Pain001Switzerland
*/
function Pain001Switzerland(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;

    this.id = "ch.banana.switzerland.pain001";
    this.version = "1.0";
    this.param = this.initParam();
    this.docInfo = this.getDocumentInfo();

    // errors id
    this.ID_ERR_ELEMENT_EMPTY = "ID_ERR_ELEMENT_EMPTY";
    this.ID_ERR_ELEMENT_REQUIRED = "ID_ERR_ELEMENT_REQUIRED";
    this.ID_ERR_EXPERIMENTAL_REQUIRED = "ID_ERR_EXPERIMENTAL_REQUIRED";
    this.ID_ERR_IBAN_NOTVALID = "ID_ERR_IBAN_NOTVALID";
    this.ID_ERR_IBAN_REFERENCE_NOTVALID = "ID_ERR_IBAN_REFERENCE_NOTVALID";
    this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
    this.ID_ERR_MESSAGE_EMPTY = "ID_ERR_MESSAGE_EMPTY";
    this.ID_ERR_MESSAGE_NOTVALID = "ID_ERR_MESSAGE_NOTVALID";
    this.ID_ERR_PAYMENTMETHOD_NOTSUPPORTED = "ID_ERR_PAYMENTMETHOD_NOTSUPPORTED";
    this.ID_ERR_PAYMENTOBJECT_EMPTY = "ID_ERR_PAYMENTOBJECT_EMPTY";
    this.ID_ERR_QRIBAN_NOTVALID = "ID_ERR_QRIBAN_NOTVALID";
    this.ID_ERR_QRIBAN_REFERENCE_NOTVALID = "ID_ERR_QRIBAN_REFERENCE_NOTVALID";
    this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";

    // payment methods
    this.ID_PAYMENT_QRCODE = "QRCODE";
    this.ID_PAYMENT_QRCODE_DESCRIPTION = "Bank or postal payment (IBAN/QR-IBAN) in CHF & EUR";

    this.ID_PAYMENT_SEPA = "SEPA";
    this.ID_PAYMENT_SEPA_DESCRIPTION = "SEPA transfer (all currencies)";

    // supported payment formats
    this.ID_PAIN_FORMAT_001_001_03_CH_02 = "pain.001.001.03.ch.02";
    this.ID_PAIN_FORMAT_001_001_03 = "pain.001.001.03";
    this.painFormats = [];
    this.painFormats.push({
        "@appId": this.id,
        "@description": "Swiss Payment Standard 2021 (pain.001.001.03.ch.02)",
        "@version": this.version,
        "@uuid": this.ID_PAIN_FORMAT_001_001_03_CH_02
    });
    this.painFormats.push({
        "@appId": this.id,
        "@description": "ISO 20022 Schema (pain.001.001.03)",
        "@version": this.version,
        "@uuid": this.ID_PAIN_FORMAT_001_001_03
    });

    this.SEPARATOR_CHAR = '\xa0';
    this.isTest = false;

    //load settings
    try {
        var savedParam = this.banDocument.getScriptSettings();
        if (savedParam.length > 0) {
            this.setParam(JSON.parse(savedParam));
        }
    } catch (e) {
    }
}

Pain001Switzerland.prototype.convertParam = function (param) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'messageSenderName';
    currentParam.title = 'Message Sender Name';
    currentParam.type = 'string';
    currentParam.value = param.messageSenderName ? param.messageSenderName : '';
    currentParam.readValue = function () {
        param.messageSenderName = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'fieldAdditionalInfo';
    currentParam.title = 'Field for additional infos (XML name)';
    currentParam.type = 'string';
    currentParam.value = param.fieldAdditionalInfo ? param.fieldAdditionalInfo : '';
    currentParam.readValue = function () {
        param.fieldAdditionalInfo = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorGroups';
    currentParam.title = 'Groups of creditors (separate groups with a semicolon)';
    currentParam.type = 'string';
    currentParam.value = param.creditorGroups ? param.creditorGroups : '';
    currentParam.readValue = function () {
        param.creditorGroups = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/**
 * This method converts the paymentObj object to a json structure,
 * which is compatible with SettingsDialog (Banana.Ui.openPropertyEditor)
 */
Pain001Switzerland.prototype.convertPaymData = function (paymentObj) {
    var lang = this.getLang();
    var texts = this.getTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    if (!paymentObj)
        return convertedParam;

    var currentParam = {};
    currentParam.name = 'methodId';
    currentParam.title = 'Payment Method';
    currentParam.type = 'combobox';
    currentParam.value = paymentObj.methodId ? paymentObj.methodId : '';
    currentParam.defaultvalue = '';
    // currentParam.items = Array (this.ID_PAYMENT_QRCODE_DESCRIPTION, this.ID_PAYMENT_SEPA_DESCRIPTION);
    currentParam.items = Array(this.ID_PAYMENT_QRCODE_DESCRIPTION);
    currentParam.readValue = function () {
        paymentObj.methodId = this.value;
    }
    convertedParam.data.push(currentParam);

    /*******************************************************************************************
    * CREDITOR
    *******************************************************************************************/
    currentParam = {};
    currentParam.name = 'creditor';
    currentParam.title = 'Creditor';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorAccountId';
    currentParam.title = 'Account ID';
    currentParam.type = 'combobox';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorAccountId ? paymentObj.creditorAccountId : '';
    currentParam.defaultvalue = '';
    currentParam.items = this.loadCreditors(true);
    currentParam.readValue = function () {
        paymentObj.creditorAccountId = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorName';
    currentParam.title = 'Name';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorName ? paymentObj.creditorName : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorName = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorStreet1';
    currentParam.title = 'Street 1';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorStreet1 ? paymentObj.creditorStreet1 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorStreet1 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorStreet2';
    currentParam.title = 'Street 2';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorStreet2 ? paymentObj.creditorStreet2 : '';
    currentParam.readValue = function () {
        paymentObj.creditorStreet2 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorCity';
    currentParam.title = 'City';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorCity ? paymentObj.creditorCity : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorCity = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorPostalCode';
    currentParam.title = 'Postal code';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorPostalCode ? paymentObj.creditorPostalCode : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorPostalCode = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorCountry';
    currentParam.title = 'Country code';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorCountry ? paymentObj.creditorCountry : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorCountry = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorBankName';
    currentParam.title = 'Bank name';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorBankName ? paymentObj.creditorBankName : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorBankName = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorBankAddress1';
    currentParam.title = 'Bank address 1';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorBankAddress1 ? paymentObj.creditorBankAddress1 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorBankAddress1 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorBankAddress2';
    currentParam.title = 'Bank address 2';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorBankAddress2 ? paymentObj.creditorBankAddress2 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorBankAddress2 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorBankAccount';
    currentParam.title = 'Bank account';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorBankAccount ? paymentObj.creditorBankAccount : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorBankAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorIban';
    currentParam.title = 'IBAN/QR-IBAN';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorIban ? paymentObj.creditorIban : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorIban = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'creditorBic';
    currentParam.title = 'BIC';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentObj.creditorBic ? paymentObj.creditorBic : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.creditorBic = this.value;
    }
    convertedParam.data.push(currentParam);

    /*******************************************************************************************
    * ALL PAYMENTS
    *******************************************************************************************/
    currentParam = {};
    currentParam.name = 'amount';
    currentParam.title = "Amount";
    currentParam.type = 'string';
    currentParam.value = paymentObj.amount ? paymentObj.amount : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.amount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'currency';
    currentParam.title = "Currency";
    currentParam.type = 'string';
    currentParam.value = paymentObj.currency ? paymentObj.currency : 'CHF';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.currency = this.value;
    }
    convertedParam.data.push(currentParam);

    /*******************************************************************************************
    * QR PAYMENT
    *******************************************************************************************/
    // paymentObj.methodId contains the description of the payment type
    var methodId = this.ID_PAYMENT_QRCODE;
    if (paymentObj.methodId.indexOf("SEPA") >= 0)
        methodId = this.ID_PAYMENT_SEPA;
     if (methodId == this.ID_PAYMENT_QRCODE) {
        /*var refTypes = [];
        refTypes.push("QRR");
        refTypes.push("SCOR");
        refTypes.push("NON");
        refTypes.push("");

        currentParam = {};
        currentParam.name = 'referenceType';
        currentParam.title = "QR Reference Type";
        currentParam.type = 'combobox';
        currentParam.items = refTypes;
        currentParam.value = paymentObj.referenceType ? paymentObj.referenceType : '';
        currentParam.defaultvalue = 'QRR';
        currentParam.readValue = function () {
            paymentObj.referenceType = this.value;
        }
        convertedParam.data.push(currentParam);*/

        currentParam = {};
        currentParam.name = 'reference';
        currentParam.title = "Reference number";
        currentParam.type = 'string';
        currentParam.value = paymentObj.reference ? paymentObj.reference : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.reference = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'unstructuredMessage';
        currentParam.title = "Additional Information";
        currentParam.type = 'string';
        currentParam.value = paymentObj.unstructuredMessage ? paymentObj.unstructuredMessage : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.unstructuredMessage = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'billingInfo';
        currentParam.title = "Billing Information";
        currentParam.type = 'string';
        currentParam.value = paymentObj.billingInfo ? paymentObj.billingInfo : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.billingInfo = this.value;
        }
        convertedParam.data.push(currentParam);

        var categoryPurposeTypes = [];
        categoryPurposeTypes.push("");
        categoryPurposeTypes.push("SALA=SalaryPayment");
        categoryPurposeTypes.push("PENS=PensionPayment");

        currentParam = {};
        currentParam.name = 'categoryPurpose';
        currentParam.title = "Category Purpose";
        currentParam.type = 'combobox';
        currentParam.items = categoryPurposeTypes;
        currentParam.value = paymentObj.categoryPurpose ? paymentObj.categoryPurpose : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.categoryPurpose = this.value;
        }
        convertedParam.data.push(currentParam);

    }

    /*******************************************************************************************
    * ULTIMATE DEBTOR
    *******************************************************************************************/
    if (methodId == this.ID_PAYMENT_QRCODE) {
        currentParam = {};
        currentParam.name = 'ultimateDebtor';
        currentParam.title = 'Ultimate Debtor';
        currentParam.editable = false;
        currentParam.collapse = true;
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorName';
        currentParam.title = 'Name';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorName ? paymentObj.ultimateDebtorName : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorName = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorStreet1';
        currentParam.title = 'Street 1';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorStreet1 ? paymentObj.ultimateDebtorStreet1 : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorStreet1 = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorStreet2';
        currentParam.title = 'Street 2';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorStreet2 ? paymentObj.ultimateDebtorStreet2 : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorStreet2 = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorCity';
        currentParam.title = 'City';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorCity ? paymentObj.ultimateDebtorCity : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorCity = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorPostalCode';
        currentParam.title = 'Postal code';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorPostalCode ? paymentObj.ultimateDebtorPostalCode : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorPostalCode = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'ultimateDebtorCountry';
        currentParam.title = 'Country code';
        currentParam.type = 'string';
        currentParam.parentObject = 'ultimateDebtor';
        currentParam.value = paymentObj.ultimateDebtorCountry ? paymentObj.ultimateDebtorCountry : '';
        currentParam.defaultvalue = '';
        currentParam.readValue = function () {
            paymentObj.ultimateDebtorCountry = this.value;
        }
        convertedParam.data.push(currentParam);
    }

    /*******************************************************************************************
       * TRANSACTION
       *******************************************************************************************/
    currentParam = {};
    currentParam.name = 'transaction';
    currentParam.title = 'Transaction';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'transactionDate';
    currentParam.title = "Date";
    currentParam.tooltip = "Transaction Date format: yyyy-mm-dd";
    currentParam.type = 'string';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.transactionDate ? paymentObj.transactionDate : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.transactionDate = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'dueDate';
    currentParam.title = "Due Date";
    currentParam.tooltip = "Due Date format: yyyy-mm-dd";
    currentParam.type = 'string';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.dueDate ? paymentObj.dueDate : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.dueDate = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'invoiceNo';
    currentParam.title = "Invoice No";
    currentParam.type = 'string';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.invoiceNo ? paymentObj.invoiceNo : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.invoiceNo = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'description';
    currentParam.title = "Description";
    currentParam.type = 'string';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.description ? paymentObj.description : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function () {
        paymentObj.description = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'syncTransaction';
    currentParam.title = "Auto-synchronize";
    currentParam.type = 'bool';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.syncTransaction ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        paymentObj.syncTransaction = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

Pain001Switzerland.prototype.createTransferFile = function (paymentObj) {
    if (!this.banDocument)
        return null;

    if (typeof (paymentObj) === 'string') {
        try {
            if (paymentObj.length > 0)
                paymentObj = JSON.parse(paymentObj);
        } catch (e) {
            this.banDocument.addMessage(e);
        }
    }

    if (!paymentObj || paymentObj === 'undefined') {
        var lang = this.getLang();
        var msg = this.getErrorMessage(this.ID_ERR_PAYMENTOBJECT_EMPTY, lang);
        this.banDocument.addMessage(msg, this.ID_ERR_PAYMENTOBJECT_EMPTY);
        return "";
    }

    var painFormat = paymentObj["@format"];
    var msgId = paymentObj["@uuid"];

    // Payment Information Identification unique inside msg
    var msgInfId = "PmtInfId";
    if (paymentObj["@title"].length > 0) {
        msgInfId = paymentObj["@title"];
        if (msgInfId.indexOf(" ") > 0)
            msgInfId = msgInfId.replace(/ /g, '');
        if (msgInfId.length > 31)
            msgInfId.substring(0, 31);
    }

    // Create message's header <GrpHdr>
    var groupHeader = new GroupHeader(msgId);

    // Message sender name
    var initiatingPartyName = this.param.messageSenderName;
    if (!initiatingPartyName)
        initiatingPartyName = "";
    if (initiatingPartyName.length <= 0) {
        initiatingPartyName = this.docInfo.company;
        if (initiatingPartyName.length <= 0) {
            initiatingPartyName = this.docInfo.familyName;
            if (initiatingPartyName.length > 0 && this.docInfo.name.length > 0)
                initiatingPartyName += ' ';
            initiatingPartyName += this.docInfo.name;
        }
    }
    if (initiatingPartyName.length <= 0) {
        initiatingPartyName = 'message sender name missing';
    }
    groupHeader.setInitiatingPartyName(initiatingPartyName);

    groupHeader.setSoftwareName("Banana Accounting+/Banana.ch SA");
    var version = Banana.application.version;
    // if (version.indexOf(".") > 0)
    //     version = version.substring(0, version.indexOf("."));
    groupHeader.setSoftwareVersion(version);

    // Create a transfer file which contains all data to transfer
    var transferFile = new CustomerCreditTransferFile(groupHeader);

    // Create PaymentInformations the Transfer belongs to

    // Executions dates
    // if applyUniqueDate is true all due dates are not considered, all payments are done with the same date
    var executionDates = [];
    var applyUniqueDate = paymentObj.requestExecutionDateApplyAll;
    // Currencies
    // If more than one currency, payments are separated
    var currencies = [];
    for (var i = 0; paymentObj.transactions && i < paymentObj.transactions.length; i++) {
        var dueDate = paymentObj.transactions[i].dueDate;
        if (!dueDate || dueDate.length <= 0 || applyUniqueDate) {
            paymentObj.transactions[i].dueDate = paymentObj.requestExecutionDate;
            dueDate = paymentObj.requestExecutionDate;
        }
        dueDate = this.toISODate(dueDate);
        if (executionDates.indexOf(dueDate) < 0)
            executionDates.push(dueDate);

        var currency = paymentObj.transactions[i].currency;
        if (currency && currencies.indexOf(currency) < 0)
            currencies.push(currency);
    }

    for (var h = 0; h < currencies.length; h++) {

        for (var i = 0; i < executionDates.length; i++) {

            // msgInfId max length 35
            var id = h * 100 + i;
            var zero = 3 - id.toString().length + 1;
            var counter = Array(+(zero > 0 && zero)).join("0") + id;
            var currentMsgInfId = msgInfId + "-" + counter;

            var payment = new PaymentInformation(
                currentMsgInfId, // Payment Information Identification unique inside msg
                cleanIBAN(paymentObj.debtorIban), // IBAN the money is transferred from
                paymentObj.debtorBic,  // BIC
                paymentObj.debtorName, // Debtor Name
                // paymentObj.debtorCurrency
            );
            payment.setDueDate(executionDates[i]);
            payment.setChargeBearer("CRED"); //Specifies which party/parties will bear the charges of the payment transaction
            //Execution confirmation:   NO      YES     NO      YES
            //Detailed confirmation:    NO      YES     YES     NO
            //------                    ---     ---     ---     ---
            //BtchBookg                 true    true            true
            //Prtry                     NOA     CWD             CND
            if (!paymentObj.confirmationExecution && !paymentObj.confirmationDetailed)
                payment.setOriginAdvice("NOA");
            else if (paymentObj.confirmationExecution && paymentObj.confirmationDetailed)
                payment.setOriginAdvice("CWD");
            else if (paymentObj.confirmationExecution && !paymentObj.confirmationDetailed)
                payment.setOriginAdvice("CND");

            for (var j = 0; paymentObj.transactions && j < paymentObj.transactions.length; j++) {
                if (this.toISODate(paymentObj.transactions[j].dueDate) !== executionDates[i])
                    continue;
                if (!paymentObj.transactions[j].currency || paymentObj.transactions[j].currency !== currencies[h])
                    continue;
                var transactionInfoObj = paymentObj.transactions[j];
                //Get payment method: IBAN/QR-IBAN, SEPA, ...
                var methodId = transactionInfoObj.methodId;
                if (!methodId || methodId.length <= 0)
                    continue;

                var transfer = new CustomerCreditTransferInformation(
                    transactionInfoObj["@uuid"], //EndToEndIdentification
                    transactionInfoObj.creditorName, //Name of Creditor
                    transactionInfoObj.amount // Amount
                );

                // Set Instruction Identification for any transfer (unique within B-LEVEL)
                transfer.setInstructionId("INSTRID-" + parseInt(j + 1).toString());
                transfer.setCurrency(transactionInfoObj.currency); // Set the amount currency
                transfer.setRemittanceInformation(transactionInfoObj.unstructuredMessage); //Additional information
                transfer.setIban(transactionInfoObj.creditorIban); //IBAN or account number
                transfer.setCreditorReference(transactionInfoObj.reference); //Creditor Reference Information
                transfer.setUltimateDebtorName(transactionInfoObj.ultimateDebtorName); //Ultimate Debtor Name
                transfer.setCountry(transactionInfoObj.creditorCountry);
                var postalAddress = [];
                var postalLine = "";
                if (transactionInfoObj.creditorStreet1.length > 0)
                    postalLine = transactionInfoObj.creditorStreet1;
                if (transactionInfoObj.creditorStreet2.length > 0) {
                    if (postalLine.length > 0)
                        postalLine += " ";
                    postalLine += transactionInfoObj.creditorStreet2;
                }
                postalAddress.push(postalLine);
                if (transactionInfoObj.creditorPostalCode.length > 0 || transactionInfoObj.creditorCity.length > 0)
                    postalAddress.push(transactionInfoObj.creditorPostalCode + " " + transactionInfoObj.creditorCity);
                transfer.setPostalAddress(postalAddress);

                // Set Instruction for confidential data like salaries
                if (transactionInfoObj.categoryPurpose) {
                    let categoryPurpose = transactionInfoObj.categoryPurpose;
                    let pos = categoryPurpose.indexOf("=");
                    if (pos > 0)
                        categoryPurpose = categoryPurpose.substr(0, pos);
                    transfer.setCategoryPurpose(categoryPurpose);
                }

                if (methodId == this.ID_PAYMENT_QRCODE) {
                    transfer.setCreditorReferenceType(transactionInfoObj.referenceType);
                }
                else if (methodId == this.ID_PAYMENT_SEPA) {
                    transfer.setBic(transactionInfoObj.creditorBic);
                }

                // It's possible to add multiple Transfers in one payment
                payment.addTransfer(transfer);
            }
            // It's possible to add multiple payments to one Transfer, in Banana at the 
            if (payment.transfers.length > 0)
                transferFile.addPaymentInformation(payment);

            //end execution dates
        }
        // end currencies
    }

    // Attach a domBuilder to the Transfer to create the XML output
    var domBuilder = new DomBuilder(painFormat, true);
    transferFile.accept(domBuilder);

    // Create the file
    var xmlData = domBuilder.asXml();
    xmlData = xmlData.replace("encoding=\"utf-8\"", "encoding=\"UTF-8\"");
    return xmlData;
}

Pain001Switzerland.prototype.currentDate = function () {
    var d = new Date();
    var datestring = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    if (this.isTest)
        datestring = "2020-07-01";
    return datestring;
}

Pain001Switzerland.prototype.getCreditor = function (accountId) {

    var creditor = {};
    creditor.accountId = "";
    creditor.name = "";
    creditor.street1 = "";
    creditor.street2 = "";
    creditor.postalCode = "";
    creditor.city = "";
    creditor.country = "";
    creditor.bankAccount = "";
    creditor.bankName = "";
    creditor.bic = "";
    creditor.iban = "";

    if (!this.banDocument || !accountId || accountId.length <= 0)
        return creditor;

    creditor.accountId = accountId;
    if (accountId.indexOf(this.SEPARATOR_CHAR) > 0) {
        creditor.accountId = accountId.substr(0, accountId.indexOf(this.SEPARATOR_CHAR));
    }

    if (this.banDocument.table('Accounts')) {
        var row = this.banDocument.table('Accounts').findRowByValue('Account', creditor.accountId);
        if (row) {
            if (row.value("OrganisationName") && row.value("OrganisationName").length > 0) {
                creditor.name = row.value("OrganisationName");
            }
            else {
                if (row.value("FirstName"))
                    creditor.name = row.value("FirstName");
                if (creditor.name.length > 0 && row.value("FamilyName"))
                    creditor.name += " ";
                if (row.value("FamilyName"))
                    creditor.name += row.value("FamilyName");
            }
            if (row.value("BankAccount")) {
                creditor.bankAccount = row.value("BankAccount");
            }
            if (row.value("BankName")) {
                creditor.bankName = row.value("BankName");
            }
            if (row.value("BankClearing")) {
                creditor.bic = row.value("BankClearing");
            }
            if (row.value("BankIban")) {
                creditor.iban = row.value("BankIban");
            }
            if (row.value("Street")) {
                creditor.street1 = row.value("Street");
            }
            if (row.value("AddressExtra")) {
                creditor.street2 = row.value("AddressExtra");
            }
            if (row.value("PostalCode")) {
                creditor.postalCode = row.value("PostalCode");
            }
            if (row.value("Locality")) {
                creditor.city = row.value("Locality");
            }
            if (row.value("CountryCode")) {
                creditor.country = row.value("CountryCode");
            }
        }
    }

    return creditor;
}

Pain001Switzerland.prototype.getDocumentInfo = function () {
    var documentInfo = {};
    documentInfo.isDoubleEntry = false;
    documentInfo.isIncomeExpenses = false;
    documentInfo.isCashBook = false;
    documentInfo.decimalsAmounts = 2;
    documentInfo.multiCurrency = false;
    documentInfo.withVat = false;
    documentInfo.vatAccount = "";
    documentInfo.customersGroup = "";
    documentInfo.suppliersGroup = "";
    documentInfo.basicCurrency = "";
    documentInfo.company = "";
    documentInfo.name = "";
    documentInfo.familyName = "";

    if (this.banDocument) {
        var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
        var fileNumber = this.banDocument.info("Base", "FileTypeNumber");
        var fileVersion = this.banDocument.info("Base", "FileTypeVersion");

        if (fileGroup == "100")
            documentInfo.isDoubleEntry = true;
        else if (fileGroup == "110")
            documentInfo.isIncomeExpenses = true;
        else if (fileGroup == "130")
            documentInfo.isCashBook = true;

        if (fileNumber == "110") {
            documentInfo.withVat = true;
        }
        if (fileNumber == "120") {
            documentInfo.multiCurrency = true;
        }
        if (fileNumber == "130") {
            documentInfo.multiCurrency = true;
            documentInfo.withVat = true;
        }

        if (this.banDocument.info("AccountingDataBase", "VatAccount"))
            documentInfo.vatAccount = this.banDocument.info("AccountingDataBase", "VatAccount");

        if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
            documentInfo.customersGroup = this.banDocument.info("AccountingDataBase", "CustomersGroup");
        if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
            documentInfo.suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");

        if (this.banDocument.info("AccountingDataBase", "BasicCurrency"))
            documentInfo.basicCurrency = this.banDocument.info("AccountingDataBase", "BasicCurrency");

        if (this.banDocument.info("AccountingDataBase", "Company"))
            documentInfo.company = this.banDocument.info("AccountingDataBase", "Company");
        if (this.banDocument.info("AccountingDataBase", "Name"))
            documentInfo.name = this.banDocument.info("AccountingDataBase", "Name");
        if (this.banDocument.info("AccountingDataBase", "FamilyName"))
            documentInfo.familyName = this.banDocument.info("AccountingDataBase", "FamilyName");

        if (this.banDocument.info("Base", "DecimalsAmounts"))
            documentInfo.decimalsAmounts = this.banDocument.info("Base", "DecimalsAmounts");

    }
    return documentInfo;
}

/**
* return the text error message according to error id
*/
Pain001Switzerland.prototype.getErrorMessage = function (errorId) {

    var lang = this.getLang();

    switch (errorId) {
        case this.ID_ERR_ELEMENT_EMPTY:
            return "%1 is missing or empty";
        case this.ID_ERR_ELEMENT_REQUIRED:
            return "This is a required field";
        case this.ID_ERR_MESSAGE_EMPTY = "ID_ERR_MESSAGE_EMPTY":
            return "The pain message is empty, impossible to validate or save the message";
        case this.ID_ERR_MESSAGE_NOTVALID = "ID_ERR_MESSAGE_NOTVALID":
            return "The pain message is not valid: %1";
        case this.ID_ERR_EXPERIMENTAL_REQUIRED:
            return "The Experimental version is required";
        case this.ID_ERR_IBAN_NOTVALID:
            return "IBAN number is not valid";
        case this.ID_ERR_IBAN_REFERENCE_NOTVALID:
            return "QRIBAN is not valid";
        case this.ID_ERR_LICENSE_NOTVALID:
            return "This extension requires Banana Accounting+ Advanced";
        case this.ID_ERR_PAYMENTMETHOD_NOTSUPPORTED:
            return "The payment method %1 is not supported";
        case this.ID_ERR_PAYMENTOBJECT_EMPTY = "ID_ERR_PAYMENTOBJECT_EMPTY":
            return "The payment object is undefined or invalid. Impossible to create the pain message";
        case this.ID_ERR_QRIBAN_NOTVALID:
            return "QRIBAN number is not valid";
        case this.ID_ERR_QRIBAN_REFERENCE_NOTVALID:
            return "IBAN is not valid";
        case this.ID_ERR_VERSION_NOTSUPPORTED:
            return "This extension does not run with your current version of Banana Accounting %1.\nPlease update to the latest version available.\nTo update or for more information click on Help";
    }
    return "";
}

Pain001Switzerland.prototype.getLang = function () {

    var lang = 'en';
    if (this.banDocument)
        lang = this.banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

Pain001Switzerland.prototype.getTexts = function (language) {

    var texts = {};
    if (language == 'it') {
        texts.DescriptionIban = 'IBAN (pagamento nazionale o internazionale)';
    } else if (language == 'de') {
        texts.DescriptionIban = 'IBAN payment (domestic or international)';
    } else if (language == 'fr') {
        texts.DescriptionIban = 'IBAN payment (domestic or international)';
    } else if (language == 'nl') {
        texts.DescriptionIban = 'IBAN payment (domestic or international)';
    } else {
        texts.DescriptionIban = 'IBAN payment (domestic or international)';
    }
    return texts;
}

Pain001Switzerland.prototype.initPaymData = function () {

    // if syncTransaction=true data is synchronized with transaction row
    var syncTransaction = true;

    var paymentObj = {
        "methodId": this.ID_PAYMENT_QRCODE,
        "creditorAccountId": "",
        "creditorName": "",
        "creditorStreet1": "",
        "creditorStreet2": "",
        "creditorCity": "",
        "creditorPostalCode": "",
        "creditorCountry": "",
        "creditorBankName": "",
        "creditorBankAddress1": "",
        "creditorBankAddress2": "",
        "creditorBankAccount": "",
        "creditorIban": "",
        "creditorBic": "",
        "ultimateDebtorName": "",
        "ultimateDebtorStreet1": "",
        "ultimateDebtorStreet2": "",
        "ultimateDebtorCity": "",
        "ultimateDebtorPostalCode": "",
        "ultimateDebtorCountry": "",
        "amount": "",
        "currency": "",
        "referenceType": "",
        "reference": "",
        "unstructuredMessage": "",
        "billingInfo": "",
        "categoryPurpose": "",
        "invoiceNo": "",
        "transactionDate": "",
        "dueDate": "",
        "description": "",
        "syncTransaction": syncTransaction,
        "@appId": this.id,
        "@type": "payment/data",
        "@version": this.version,
        "@uuid": ""
    }

    return paymentObj;
}

Pain001Switzerland.prototype.initParam = function () {
    var param = {};
    param.messageSenderName = "";
    param.fieldAdditionalInfo = "Notes";
    param.creditorGroups = "";
    return param;
}

/*Returns all suppliers accounts from table Accounts according to params*/
Pain001Switzerland.prototype.loadCreditors = function (includeDescription) {
    var accountsList = [];
    //empty value
    accountsList.push("");

    if (!this.banDocument || !this.banDocument.table("Accounts")) {
        return accountsList;
    }

    //gets supplier groups from param, if empty loads supplier group id from accounting data
    var creditorGroupsList = [];
    if (this.param.creditorGroups.length > 0)
        creditorGroupsList = this.param.creditorGroups.split(";");
    if (creditorGroupsList.length <= 0) {
        var suppliersGroup = "";
        if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
            suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
        if (suppliersGroup.length > 0)
            creditorGroupsList.push(suppliersGroup);
    }

    var table = this.banDocument.table("Accounts");
    if (!table)
        return accountsList;

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var gr = tRow.value('Gr');
        if (gr.length > 0 && creditorGroupsList.indexOf(gr) < 0)
            continue;

        var accountId = tRow.value('Account');
        var groupId = tRow.value('Group');
        var bClass = tRow.value('BClass');
        if (accountId.length > 0 && bClass !== "3" && bClass !== "4") {
            var description = tRow.value('Description');
            if (includeDescription)
                accountsList.push(accountId + this.SEPARATOR_CHAR + description);
            else
                accountsList.push(accountId);
        }
    }
    return accountsList;
}

Pain001Switzerland.prototype.openEditor = function (dialogTitle, editorData, pageAnchor) {

    // Formats some data before opening dialog
    for (var i = 0; i < editorData.data.length; i++) {
        let key = editorData.data[i].name;
        let value = editorData.data[i].value;
        if (key == 'methodId' && value == this.ID_PAYMENT_QRCODE) {
            editorData.data[i].value = this.ID_PAYMENT_QRCODE_DESCRIPTION;
        }
        else if (key == 'methodId' && value == this.ID_PAYMENT_SEPA) {
            editorData.data[i].value = this.ID_PAYMENT_SEPA_DESCRIPTION;
        }
        else if (key == 'transactionDate' || key == 'dueDate') {
            editorData.data[i].value = this.toISODate(value);
        }
        else if (key == 'amount') {
            editorData.data[i].value = this.toAmountLocaleFormat(value);
        }
    }

    // Open dialog
    let editor = Banana.Ui.createPropertyEditor(dialogTitle, editorData, pageAnchor);
    let rtnValue = editor.exec();
    if (parseInt(rtnValue) !== 1)
        return null;

    // Read data from dialog
    editorData = editor.getParams();
    let paymentObj = this.initPaymData();
    for (var i = 0; i < editorData.data.length; i++) {
        let key = editorData.data[i].name;
        let value = editorData.data[i].value;
        if (key == 'creditorAccountId' && value.indexOf('\xa0') > 0) {
            value = value.substr(0, value.indexOf('\xa0'));
        }
        else if (key == 'methodId' && value == this.ID_PAYMENT_QRCODE_DESCRIPTION) {
            value = this.ID_PAYMENT_QRCODE;
        }
        else if (key == 'methodId' && value == this.ID_PAYMENT_SEPA_DESCRIPTION) {
            value = this.ID_PAYMENT_SEPA;
        }
        else if (key == 'transactionDate' || key == 'dueDate') {
            value = this.toISODate(value);
        }
        else if (key == 'amount') {
            //remove spaces
            value = value.replace(/ /g, "");
            value = this.toAmountFormatInternal(value);
        }
        if (paymentObj.hasOwnProperty(key)) {
            paymentObj[key] = value;
        }
    }

    return paymentObj;
}

Pain001Switzerland.prototype.saveTransferFile = function (inData) {
    var lang = this.getLang();

    if (inData.length <= 0) {
        var msg = this.getErrorMessage(this.ID_ERR_MESSAGE_EMPTY, lang);
        this.banDocument.addMessage(msg, this.ID_ERR_MESSAGE_EMPTY);
        return false;
    }

    var fileName = "PAIN001_<Date>.xml";

    //var fileName = "PAIN001_<AccountingName>_<Date>.xml";
    /*if (this.banDocument && this.banDocument.info) {
        var accountingFileName = this.banDocument.info("Base", "FileName");
        if (accountingFileName.length > 0) {
            var posStart=0;
            if (accountingFileName.indexOf("/")>0 && accountingFileName.indexOf("/")<accountingFileName.length)
                posStart = accountingFileName.indexOf("/");
            accountingFileName = accountingFileName.substr(posStart+1);
            if (accountingFileName.indexOf(".ac2")>0);
                accountingFileName = accountingFileName.replace(".ac2","");
            if (accountingFileName.indexOf(".")>0);
                accountingFileName = accountingFileName.replace('.','');
            fileName = fileName.replace("<AccountingName>", accountingFileName);
        }
        else {
            fileName = fileName.replace("_<AccountingName>", "");
        }
    }*/

    var date = _formatDate(new Date());
    if (date.indexOf(":") > 0);
    date = date.replace(/:/g, '');
    if (date.indexOf("-") > 0);
    date = date.replace(/-/g, '');
    var time = _formatTime(new Date());
    if (time.indexOf(":") > 0);
    time = time.replace(/:/g, '');
    fileName = fileName.replace("<Date>", date + time);
    fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)");
    if (fileName.length) {
        var file = Banana.IO.getLocalFile(fileName);
        file.codecName = "UTF-8";
        file.write(inData);
        if (file.errorString) {
            Banana.Ui.showInformation("Write error", file.errorString);
            return false;
        }
        else {
            // Banana.IO.openUrl(fileName);
        }
        return true;
    }
    return false;
}

Pain001Switzerland.prototype.scanCode = function (code) {
    var parsedCode = code.split(/\r?\n/);
    var swissQRCodeData = {};
    swissQRCodeData.QRType = parsedCode[0] ? parsedCode[0] : '';;
    swissQRCodeData.Version = parsedCode[1] ? parsedCode[1] : '';;
    swissQRCodeData.CodingType = parsedCode[2] ? parsedCode[2] : '';;
    swissQRCodeData.Account = parsedCode[3] ? parsedCode[3] : '';;
    swissQRCodeData.CRAddressTyp = parsedCode[4] ? parsedCode[4] : '';;
    swissQRCodeData.CRName = parsedCode[5] ? parsedCode[5] : '';;
    swissQRCodeData.CRStreet1 = parsedCode[6] ? parsedCode[6] : '';;
    swissQRCodeData.CRStreet2 = parsedCode[7] ? parsedCode[7] : '';;
    swissQRCodeData.CRPostalCode = parsedCode[8] ? parsedCode[8] : '';;
    swissQRCodeData.CRCity = parsedCode[9] ? parsedCode[9] : '';;
    swissQRCodeData.CRCountry = parsedCode[10] ? parsedCode[10] : '';;
    swissQRCodeData.UCRAddressTyp = parsedCode[11] ? parsedCode[11] : '';;
    swissQRCodeData.UCRName = parsedCode[12] ? parsedCode[12] : '';;
    swissQRCodeData.UCRStreet1 = parsedCode[13] ? parsedCode[13] : '';;
    swissQRCodeData.UCRStreet2 = parsedCode[14] ? parsedCode[14] : '';;
    swissQRCodeData.UCRPostalCode = parsedCode[15] ? parsedCode[15] : '';;
    swissQRCodeData.UCRCity = parsedCode[16] ? parsedCode[16] : '';;
    swissQRCodeData.UCRCountry = parsedCode[17] ? parsedCode[17] : '';;
    swissQRCodeData.Amount = parsedCode[18] ? parsedCode[18] : '';;
    swissQRCodeData.Currency = parsedCode[19] ? parsedCode[19] : '';;
    swissQRCodeData.UDAddressTyp = parsedCode[20] ? parsedCode[20] : '';;
    swissQRCodeData.UDName = parsedCode[21] ? parsedCode[21] : '';;
    swissQRCodeData.UDStreet1 = parsedCode[22] ? parsedCode[22] : '';;
    swissQRCodeData.UDStreet2 = parsedCode[23] ? parsedCode[23] : '';;
    swissQRCodeData.UDPostalCode = parsedCode[24] ? parsedCode[24] : '';;
    swissQRCodeData.UDCity = parsedCode[25] ? parsedCode[25] : '';;
    swissQRCodeData.UDCountry = parsedCode[26] ? parsedCode[26] : '';;
    swissQRCodeData.ReferenceType = parsedCode[27] ? parsedCode[27] : '';;
    swissQRCodeData.Reference = parsedCode[28] ? parsedCode[28] : '';;
    swissQRCodeData.UnstructuredMessage = parsedCode[29] ? parsedCode[29] : '';;
    swissQRCodeData.Trailer = parsedCode[30] ? parsedCode[30] : '';;
    swissQRCodeData.BillingInformation = parsedCode[31] ? parsedCode[31] : '';;
    swissQRCodeData.AV1Parameters = parsedCode[32] ? parsedCode[32] : '';;
    swissQRCodeData.AV2Parameters = parsedCode[33] ? parsedCode[33] : '';;

    var paymentObj = this.initPaymData();

    if (swissQRCodeData.QRType === "SPC" && swissQRCodeData.Version === "0200") {
        paymentObj.methodId = this.ID_PAYMENT_QRCODE;
        paymentObj.creditorIban = swissQRCodeData.Account;
        paymentObj.creditorName = swissQRCodeData.CRName;
        if (swissQRCodeData.CRAddressTyp == 'S') {
            paymentObj.creditorStreet1 = swissQRCodeData.CRStreet1;
            paymentObj.creditorStreet2 = swissQRCodeData.CRStreet2;
            paymentObj.creditorPostalCode = swissQRCodeData.CRPostalCode;
            paymentObj.creditorCity = swissQRCodeData.CRCity;
            paymentObj.creditorCountry = swissQRCodeData.CRCountry;
        }
        else if (swissQRCodeData.CRAddressTyp == 'K') {
            paymentObj.creditorStreet1 = swissQRCodeData.CRStreet1;
            var address = swissQRCodeData.CRStreet2.split(" ");
            if (address.length > 1) {
                paymentObj.creditorPostalCode = address[0];
                paymentObj.creditorCity = address[1];
            }
            else {
                paymentObj.creditorCity = swissQRCodeData.CRStreet2;
            }
            paymentObj.creditorCountry = swissQRCodeData.CRCountry;
        }
        paymentObj = this.setCreditorByName(paymentObj);

        paymentObj.ultimateDebtorName = swissQRCodeData.UDName;
        if (swissQRCodeData.UDAddressTyp == 'S') {
            paymentObj.ultimateDebtorStreet1 = swissQRCodeData.UDStreet1;
            paymentObj.ultimateDebtorStreet2 = swissQRCodeData.UDStreet2;
            paymentObj.ultimateDebtorPostalCode = swissQRCodeData.UDPostalCode;
            paymentObj.ultimateDebtorCity = swissQRCodeData.UDCity;
            paymentObj.ultimateDebtorCountry = swissQRCodeData.UDCountry;
        }
        else {
            paymentObj.ultimateDebtorStreet1 = swissQRCodeData.UDStreet1;
            var address = swissQRCodeData.UDStreet2.split(" ");
            if (address.length > 1) {
                paymentObj.ultimateDebtorPostalCode = address[0];
                paymentObj.ultimateDebtorCity = address[1];
            }
            else {
                paymentObj.ultimateDebtorCity = swissQRCodeData.UDStreet2;
            }
            paymentObj.ultimateDebtorCountry = swissQRCodeData.UDCountry;
        }
        paymentObj.amount = swissQRCodeData.Amount;
        paymentObj.currency = swissQRCodeData.Currency;
        paymentObj.referenceType = swissQRCodeData.ReferenceType;
        paymentObj.reference = swissQRCodeData.Reference;
        paymentObj.unstructuredMessage = swissQRCodeData.UnstructuredMessage;
        paymentObj.billingInfo = swissQRCodeData.BillingInformation;
    }
    else {
        paymentObj.methodId = this.ID_PAYMENT_SEPA;
        paymentObj.reference = code;
    }
    return paymentObj;
}

/* set creditor id from address written in paymentData*/
Pain001Switzerland.prototype.setCreditorByName = function (paymentObj) {
    if (!paymentObj && !paymentObj.creditorName)
        return paymentObj;

    var name = paymentObj.creditorName;

    //Look for name in different columns
    if (this.banDocument) {
        var tableAccounts = this.banDocument.table('Accounts');
        if (name.length > 0 && tableAccounts) {
            var row = tableAccounts.findRowByValue('OrganisationName', name);
            if (!row)
                row = tableAccounts.findRowByValue('FamilyName', name);
            if (!row)
                row = tableAccounts.findRowByValue('FirstName', name);
            if (row) {
                if (row.value("Account")) {
                    paymentObj.creditorAccountId = row.value("Account");
                }
            }
        }
    }
    return paymentObj;
}

Pain001Switzerland.prototype.setParam = function (param) {
    this.param = param;
    this.verifyParam();
}

Pain001Switzerland.prototype.setTest = function (bool) {
    this.isTest = bool;
}

/* This method convert a local amount to the internal amount format */
Pain001Switzerland.prototype.toAmountFormatInternal = function (value) {
    if (!value || !this.docInfo)
        return "";
    var decimals = this.docInfo.decimalsAmounts ? this.docInfo.decimalsAmounts : 2;
    var separator = '.';
    if (Banana.Converter.toLocaleNumberFormat('100.00', decimals).indexOf(',') > 0)
        separator = ',';
    var convertedValue = Banana.Converter.toInternalNumberFormat(value, separator);
    convertedValue = Banana.SDecimal.round(convertedValue, { 'decimals': decimals });
    return convertedValue;
}

/* This method convert an internal formatted amount to the local amount format */
Pain001Switzerland.prototype.toAmountLocaleFormat = function (value) {
    if (!value || !this.docInfo)
        return "";
    var decimals = this.docInfo.decimalsAmounts ? this.docInfo.decimalsAmounts : 2;
    var convertedValue = Banana.Converter.toLocaleNumberFormat(value, decimals, true);
    return convertedValue;
}

/* This method convert a date to the internal date format */
Pain001Switzerland.prototype.toDateFormatInternal = function (value) {
    if (!value)
        return "";
    var internalValue = Banana.Converter.toInternalDateFormat(value);
    internalValue = internalValue.replace(/-/g, '');
    return internalValue;
}

/* This method convert an internal date to the ISO date format */
Pain001Switzerland.prototype.toISODate = function (value) {
    //empty strings does nothing
    if (!value)
        return "";

    //internal format yyyymmdd transforms to ISO date
    let formattedDate = value;
    if (value.length == 8) {
        let year = value.substr(0, 4);
        let month = value.substr(4, 2);
        let day = value.substr(6, 2);
        formattedDate = year + "-" + month + "-" + day;
    }
    //checks if is a valid date
    var timestamp = Date.parse(formattedDate);
    if (!timestamp) {
        formattedDate = this.currentDate();
    }

    return formattedDate;
}

Pain001Switzerland.prototype.validatePaymData = function (params) {
    if (typeof (params) === 'string') {
        try {
            if (params.length > 0)
                params = JSON.parse(params);
        } catch (e) {
            this.banDocument.addMessage(e);
        }
    }
    if (!params || !params.data) {
        return false;
    }

    var error = false;
    var methodId = '';
    var reference = '';
    for (var i = 0; i < params.data.length; i++) {
        if (params.data[i].name == 'methodId') {
            methodId = params.data[i].value;
            if (params.data[i].value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
        }
        else if (params.data[i].name === "reference") {
            reference = params.data[i].value;
        }
    }

    for (var i = 0; i < params.data.length; i++) {
        var key = '';
        var value = '';
        if (params.data[i].name)
            key = params.data[i].name;
        if (params.data[i].value && params.data[i].value.length > 0)
            value = params.data[i].value;
        if (value.length <= 0 && params.data[i].placeholder)
            value = params.data[i].placeholder;
        if (key === 'creditorAccountId' && value.indexOf(this.SEPARATOR_CHAR) > 0) {
            var posStart = value.indexOf(this.SEPARATOR_CHAR);
            params.data[i].value = value.substr(0, posStart);
        }
        if (value.length <= 0 && (key === 'amount' || key === 'currency')) {
            params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
            params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
            error = true;
        }
        if (methodId == this.ID_PAYMENT_QRCODE_DESCRIPTION) {
            if (key === 'creditorName' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorStreet1' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorCity' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorIban' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorIban' &&  !isValidIBAN(value)) {
                params.data[i].errorId = this.ID_ERR_IBAN_NOTVALID;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_IBAN_NOTVALID);
                error = true;
            }
            else if (key === 'creditorIban' && (!reference || reference.length < 0 || reference.startsWith("RF")) && isQRIBAN(value)) {
                //QRIban needs reference
                params.data[i].errorId = this.ID_ERR_QRIBAN_REFERENCE_NOTVALID;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_QRIBAN_REFERENCE_NOTVALID);
                error = true;
            }
            else if (key === 'creditorIban' && reference.length > 0 && !reference.startsWith("RF")  && !isQRIBAN(value)) {
                //Iban only with RF reference (SCOR) or without reference (NON)
                params.data[i].errorId = this.ID_ERR_IBAN_REFERENCE_NOTVALID;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_IBAN_REFERENCE_NOTVALID);
                error = true;
            }
        }
        else if (methodId == this.ID_PAYMENT_SEPA) {
            if (key === 'creditorIban' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorIban' && !isValidIBAN(value)) {
                params.data[i].errorId = this.ID_ERR_IBAN_NOTVALID;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_IBAN_NOTVALID);
                error = true;
            }
        }
    }
    if (error)
        return false;
    return true;
}

Pain001Switzerland.prototype.validatePaymObject = function (paymentObj, tabPos, displayMsg) {
    if (!paymentObj || !paymentObj.methodId || paymentObj.methodId !== this.ID_PAYMENT_QRCODE)
        return paymentObj;

    var iban = "";
    if (paymentObj.creditorIban)
        iban = cleanIBAN(paymentObj.creditorIban);
    
    // Update reference type
    paymentObj.referenceType = "";
    if (isValidIBAN(iban)) {
        if (isQRIBAN(iban)) {
            if (paymentObj.reference && paymentObj.reference.length > 0 && !paymentObj.reference.startsWith("RF"))
                paymentObj.referenceType = "QRR";
        }
        else {
            if (paymentObj.reference && paymentObj.reference.startsWith("RF")) {
                paymentObj.referenceType = "SCOR";
            }
            else if (!paymentObj.reference || paymentObj.reference.length <= 0) {
                paymentObj.referenceType = "NON";
            }
        }
    }

    if (displayMsg && tabPos && this.banDocument) {
        var lang = this.getLang();
        var msg = "[" + tabPos.tableName + ":" + "Row " + (tabPos.rowNr + 1).toString() + ", Column PaymentData] ";
        msg += this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        if (!paymentObj.creditorIban || !isValidIBAN(iban)) {
            this.banDocument.addMessage(msg.replace("%1", "creditorIban"), this.ID_ERR_ELEMENT_EMPTY);
        }
        if (!paymentObj.creditorName || paymentObj.creditorName.length <= 0) {
            this.banDocument.addMessage(msg.replace("%1", "creditorName"), this.ID_ERR_ELEMENT_EMPTY);
        }
        if (!paymentObj.creditorStreet1 || paymentObj.creditorStreet1.length <= 0) {
            this.banDocument.addMessage(msg.replace("%1", "creditorStreet1"), this.ID_ERR_ELEMENT_EMPTY);
        }
        if (!paymentObj.creditorCity || paymentObj.creditorCity.length <= 0) {
            this.banDocument.addMessage(msg.replace("%1", "creditorCity"), this.ID_ERR_ELEMENT_EMPTY);
        }
    }

    return paymentObj;
}

Pain001Switzerland.prototype.validateTransferFile = function (xml, painFormat) {
    var lang = this.getLang();

    if (xml.length <= 0) {
        var msg = this.getErrorMessage(this.ID_ERR_MESSAGE_EMPTY, lang);
        this.banDocument.addMessage(msg, this.ID_ERR_MESSAGE_EMPTY);
        return msg;
    }

    // Validate against schema (schema is passed as a file path relative to the script)
    /*var schemaFileName = Banana.IO.getOpenFileName("Select schema file to validate", "pain.001.001.03.ch.02.xsd", "XSD schema file (*.xsd);;All files (*)");*/

    var schemaFileName = painFormat + ".xsd";

    /*var file = Banana.IO.getLocalFile(schemaFileName)
    if (file.errorString) {
        return file.errorString;
    }
    var fileContent = file.read();
    if (fileContent.length <= 0) {
        return false;
    }*/

    if (!Banana.Xml.validate(Banana.Xml.parse(xml), schemaFileName)) {
        //Test.logger.addText("Validation result => Xml document is not valid against " + schemaFileName + Banana.Xml.errorString);
        var msg = this.getErrorMessage(this.ID_ERR_MESSAGE_NOTVALID, lang);
        msg = msg.replace("%1", Banana.Xml.errorString);
        this.banDocument.addMessage(msg, this.ID_ERR_MESSAGE_NOTVALID);
        return msg;
    }
    return true;
}

Pain001Switzerland.prototype.verifyBananaVersion = function () {
    if (!this.banDocument)
        return false;

    var lang = this.getLang();

    var isExperimental = Banana.application.isExperimental;
    if (!isExperimental) {
        var msg = this.getErrorMessage(this.ID_ERR_EXPERIMENTAL_REQUIRED, lang);
        this.banDocument.addMessage(msg, this.ID_ERR_EXPERIMENTAL_REQUIRED);
        return false;
    }

    var supportedVersion = true;
    var requiredVersion = "10.0.12";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        supportedVersion = false;
    }
    else if (typeof (this.banDocument.journalPayments) === 'undefined'
        || typeof (Banana.Ui.createPropertyEditor) === 'undefined') {
        supportedVersion = false;
    }
    if (!supportedVersion) {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
        msg = msg.replace("%1", Banana.application.version);
        this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }
    if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
        var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
        this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
        return false;
    }

    return true;
}

Pain001Switzerland.prototype.verifyParam = function () {
    if (!this.param)
        this.param = {};

    var defaultParam = this.initParam();

    if (!this.param.messageSenderName)
        this.param.messageSenderName = defaultParam.messageSenderName;
    if (!this.param.fieldAdditionalInfo)
        this.param.fieldAdditionalInfo = defaultParam.fieldAdditionalInfo;
    if (!this.param.creditorGroups)
        this.param.creditorGroups = defaultParam.creditorGroups;
    /*if (!this.param.syncTransactionLast)
        this.param.syncTransactionLast = false;*/
}

/**
* output integers with leading zeros
*/
Pain001Switzerland.prototype.zeroPad = function (num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

/**
*
* New API JsAction
*
*/

var JsAction = class JsAction {

    constructor(banDocument) {
        this.banDocument = Banana.document;
        if (banDocument) {
            this.banDocument = banDocument;
        }
        this.version = '1.0';
        /*load accounting info*/
        this.pain001CH = new Pain001Switzerland(this.banDocument);
    }

    /**
     * Creates the payment data object
     * Returns a json patch document to be applied or null if the user discard the changes.
     * @tabPos: Table name and position row
     * @uuid: unique id to identify the payment/data object generated by c++
     */
    create(tabPos, uuid) {
        // Banana.console.debug("--------create-------- " + uuid + " " + JSON.stringify(tabPos));
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var paymentObj = pain001CH.initPaymData();

        var row = null;
        var table = this.banDocument.table(tabPos.tableName);
        if (tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
            row = table.row(tabPos.rowNr);
        }

        //load creditor id and amount if data is syncronized with transaction row
        if (row) {
            this._rowGetAccount(paymentObj, row);
            this._rowGetAmount(paymentObj, row);
            this._rowGetDoc(paymentObj, row);
            if (!paymentObj["transactionDate"] || paymentObj["transactionDate"].length <= 0)
                paymentObj["transactionDate"] = pain001CH.currentDate();
        }

        var dialogTitle = 'Payment data';
        var pageAnchor = 'dlgPaymentData';
        var editorData = pain001CH.convertPaymData(paymentObj);
        // Open dialog
        paymentObj = pain001CH.openEditor(dialogTitle, editorData, pageAnchor);
        if (!paymentObj)
            return null;

        paymentObj["@uuid"] = uuid;
        // Banana.console.debug("create, columnName " + tabPos.columnName + " uuid" + paymentObj["@uuid"] );

        //verify all data
        paymentObj = pain001CH.validatePaymObject(paymentObj);

        var changedRowFields = {};
        changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };

        // Create docChange
        var docChange = new DocumentChange();
        if (tabPos.rowNr == -1)
            docChange.addOperationRowAdd(tabPos.tableName, changedRowFields);
        else
            docChange.addOperationRowModify(tabPos.tableName, tabPos.rowNr, changedRowFields);
        return docChange.getDocChange();
    }

    /**
    * Create a payment file (pain.001 A-level)
    * @param paymentFile contains a json object of type payment/file
    */
    createTransferFile(paymentFile) {
        var pain001CH = new Pain001Switzerland(Banana.document);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var xmlPainMessage = pain001CH.createTransferFile(paymentFile);
        return xmlPainMessage;
    }

    /**
     * Edits the payment data object
     * Returns a json patch document to be applied or null if the user discard the changes.
     * @tabPos: Table name and position row
     * @isModified: 
     */
    edit(tabPos, isModified) {
        // Banana.console.debug("--------edit-------- " + isModified + " " + JSON.stringify(tabPos));
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var paymentObj = pain001CH.initPaymData();

        var row = null;
        var table = this.banDocument.table(tabPos.tableName);
        if (tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
            row = table.row(tabPos.rowNr);
            try {
                var rowObj = JSON.parse(row.value("PaymentData"));
                paymentObj = JSON.parse(rowObj.paymentdata_json);
                //Banana.console.debug(JSON.stringify(rowObj));
            }
            catch (e) {
            }
        }
        else {
            return null;
        }

        var dialogTitle = 'Payment data';
        var pageAnchor = 'dlgPaymentData';
        var uuid = paymentObj["@uuid"];
        var editorData = pain001CH.convertPaymData(paymentObj);

        // INIZIO TEST
        // carica i pagamenti già effettuati da visualizzare nel dialogo
        /*var journalPayments = this.banDocument.journalPayments();
        if (journalPayments) {
            var rows = journalPayments.findRows(function (rowObj, rowNr, table) {
                if (rowObj.value("PaymentDataUuid") === uuid &&
                    (rowObj.value("PaymentStatus") == "sent" 
                    || rowObj.value("PaymentStatus") == "processing"
                    || rowObj.value("PaymentStatus") == "failed"))
                    return true;
                else
                    return false;
            });
            if (rows && rows.length > 0) {
                var currentParam = {};
                currentParam.name = 'paymentOrders';
                currentParam.title = 'Payment Orders';
                currentParam.editable = false;
                editorData.data.push(currentParam);
                for (var i = 0; i < rows.length; i++) {
                    var status = rows[i].value("PaymentStatus");
                    var rowIndex = rows[i].value("PaymentFileOriginRow");
                    currentParam = {};
                    currentParam.name = 'paymentOrder' + i.toString();
                    currentParam.title = rows[i].value("ExecutionDate");
                    currentParam.value = rows[i].value("PaymentFileTitle") + " " + rows[i].value("Currency") + " " + rows[i].value("Amount") + " (transaction row " + rowIndex.toString() + ")";
                    currentParam.parentObject = 'paymentOrders';
                    currentParam.editable = false;
                    editorData.data.push(currentParam);
                }
            }
        }*/
        // FINE TEST 

        // Open dialog
        paymentObj = pain001CH.openEditor(dialogTitle, editorData, pageAnchor);
        if (!paymentObj)
            return null;

        paymentObj["@uuid"] = uuid;
        // Banana.console.debug("edit, columnName:" + tabPos.columnName + " isModified " + isModified + " uuid" + paymentObj["@uuid"]);

        //verify all data
        paymentObj = pain001CH.validatePaymObject(paymentObj);

        var changedRowFields = {};
        changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };

        // Create docChange
        var docChange = new DocumentChange();
        if (tabPos.rowNr == -1)
            docChange.addOperationRowAdd(tabPos.tableName, changedRowFields);
        else
            docChange.addOperationRowModify(tabPos.tableName, tabPos.rowNr, changedRowFields);
        return docChange.getDocChange();
    }

    /*
    * Save the xml pain file to the selected destination folder
    */
    exportTransferFile(xml) {
        var pain001CH = new Pain001Switzerland(Banana.document);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var pain001CH = new Pain001Switzerland(Banana.document);
        if (pain001CH.saveTransferFile(xml))
            return true;
        return false;
    }

    /**
     * Return the info to show in the info panel as object (see class InfoMessage):
     *
     * {
     *   level = 'info'|'warning'|'error';
     *   dataType = 'amount'|''; // see enum TipoValoreCampo
     *   value;
     *   text;
     *   msgId;
     *   amount1;
     *   amount2;
     *   currency;
     *   amount3;
     *   amount4;
     * }
     */
    getInfo(tabPos) {
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var paymentObj = pain001CH.initPaymData();
        var isPaymentOrder = false;

        var row = null;
        var table = this.banDocument.table(tabPos.tableName);
        if (tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
            row = table.row(tabPos.rowNr);
            try {
                var rowObj = JSON.parse(row.value("PaymentData"));
                if (rowObj.hasOwnProperty('paymentfile_json')) {
                    paymentObj = JSON.parse(rowObj.paymentfile_json);
                    isPaymentOrder = true;
                }
                else {
                    paymentObj = JSON.parse(rowObj.paymentdata_json);
                }
            }
            catch (e) {
                return null;
            }
        }
        else {
            return null;
        }

        var infoObj = [];

        var infoMsg = {};
        var obj = this._getInfoUnwrap(paymentObj);
        if (isPaymentOrder) {
            let rowCount = paymentObj.transactions.length;
            infoMsg = {
                'text': obj['@type'],
                'amount1': obj['debtorName'],
                'amount2': obj['debtorIban'],
                'amount3': qsTr('Total transactions:') + " " + paymentObj.transactions.length
            };
            let transferFile = paymentObj.transferFile;
            if (transferFile){
                var xml = Banana.Xml.parse(transferFile).firstChildElement('Document').firstChildElement('CstmrCdtTrfInitn');
                infoMsg.amount3= qsTr('Total transactions:') + " " + xml.firstChildElement('GrpHdr').firstChildElement('NbOfTxs').text;
                infoMsg.amount4= qsTr(', checksum:') + " " +  xml.firstChildElement('GrpHdr').firstChildElement('CtrlSum').text;
            }
            infoObj.push(infoMsg);
            /*for (var key in obj) {
                var value = obj[key];
                if (value.length > 0) {
                    var infoMsg = {
                        'text': qsTr(key),
                        'amount1': value
                    };
                    infoObj.push(infoMsg);
                }
            }*/
        }
        else {
            let paymentObjCheck = pain001CH.initPaymData();
            this._rowGetAmount(paymentObjCheck, row);
            let warning = "";
            if (paymentObjCheck.amount != obj['amount'])
                warning = " <span style='color:red;'>(Transaction: " + paymentObjCheck.currency + " " + paymentObjCheck.amount + ")</span>";
            infoMsg = {
                'text': obj['@type'],
                'amount1': obj['creditorName'],
                'amount2': obj['reference'],
                'currency': obj['currency'],
                'amount3': obj['amount'] + warning,
                'amount4': obj['methodId']
            };
            infoObj.push(infoMsg);
        }
        return infoObj;
    }

    /**
     * Returns the columns to display in Banana application
     */
    listColumns() {
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var columns = [];

        columns.push({
            "name": "creditorAccountId",
            "title": "Creditor",
            "type": "string"
        });

        columns.push({
            "name": "creditorName",
            "title": "Name",
            "type": "string"
        });

        columns.push({
            "name": "currency",
            "title": "Currency",
            "type": "string"
        });

        columns.push({
            "name": "amount",
            "title": "Amount",
            "type": "amount"
        });

        columns.push({
            "name": "transactionDate",
            "title": "Transaction Date",
            "type": "date"
        });

        columns.push({
            "name": "dueDate",
            "title": "Due Date",
            "type": "date"
        });

        columns.push({
            "name": "reference",
            "title": "Reference",
            "type": "string"
        });

        columns.push({
            "name": "referenceType",
            "title": "Reference Type",
            "type": "string"
        });

        columns.push({
            "name": "unstructuredMessage",
            "title": "Message",
            "type": "string"
        });

        columns.push({
            "name": "creditorStreet1",
            "title": "Street 1",
            "type": "string"
        });

        columns.push({
            "name": "creditorStreet2",
            "title": "Street 2",
            "type": "string"
        });

        columns.push({
            "name": "creditorCity",
            "title": "City",
            "type": "string"
        });

        columns.push({
            "name": "creditorPostalCode",
            "title": "Postal Code",
            "type": "string"
        });

        columns.push({
            "name": "creditorCountry",
            "title": "Country Code",
            "type": "string"
        });

        columns.push({
            "name": "creditorBankName",
            "title": "Bank name",
            "type": "string"
        });

        columns.push({
            "name": "creditorBankAddress1",
            "title": "Bank address1",
            "type": "string"
        });

        columns.push({
            "name": "creditorBankAddress2",
            "title": "Bank address2",
            "type": "string"
        });

        columns.push({
            "name": "creditorBankAccount",
            "title": "Bank account",
            "type": "string"
        });

        columns.push({
            "name": "creditorBic",
            "title": "BIC",
            "type": "string"
        });

        columns.push({
            "name": "creditorIban",
            "title": "IBAN",
            "type": "string"
        });

        columns.push({
            "name": "billingInfo",
            "title": "Billing Info",
            "type": "string"
        });

        columns.push({
            "name": "categoryPurpose",
            "title": "Category Purpose",
            "type": "string"
        });

        return JSON.stringify(columns, null, '   ');
    }

    /**
     * Returns the supported pain formats
     */
    listPainFormats() {
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        return JSON.stringify(pain001CH.painFormats, null, '   ');
    }

    /**
     * Scans an invoice QRCode and creates the related transaction
     * Returns a json patch document to be applied, null if no changes, or an Error object.
     * @tabPos: Table name and position row
     * @code: QR-Code text
     * @uuid: unique id to identify the payment/data object generated by c++
     */
    scanCode(tabPos, code, uuid) {
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var table = this.banDocument.table(tabPos.tableName);
        if (tabPos.tableName !== "Transactions") {
            return null;
        }

        var paymentObj = pain001CH.scanCode(code);
        paymentObj["@uuid"] = uuid;
        paymentObj["transactionDate"] = pain001CH.currentDate();
        // Banana.console.debug("scanCode, columnName:" + tabPos.columnName + " uuid " + paymentObj["@uuid"]);

        var dialogTitle = 'Payment data';
        var pageAnchor = 'dlgPaymentData';
        var editorData = pain001CH.convertPaymData(paymentObj);

        // Open dialog
        paymentObj = pain001CH.openEditor(dialogTitle, editorData, pageAnchor);
        if (!paymentObj)
            return null;

        //verify all data
        paymentObj = pain001CH.validatePaymObject(paymentObj);

        var changedRowFields = {};
        changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        this._rowSetAmount(paymentObj, changedRowFields);

        // Create docChange
        var docChange = new DocumentChange();
        if (tabPos.rowNr == -1)
            docChange.addOperationRowAdd(tabPos.tableName, changedRowFields);
        else
            docChange.addOperationRowModify(tabPos.tableName, tabPos.rowNr, changedRowFields);
        return docChange.getDocChange();

    }

    /**
     * This method updates the transaction row according to the payment object.
     * It returns a json patch document, null if no changes, or an Error object.
     * Uuid is used only for new rows (copied or duplicated rows)
     */
    updateRow(tabPos, uuid) {
        // Banana.console.debug("--------updateRow-------- " + uuid + " " + JSON.stringify(tabPos));
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion()) {
            return null;
        }

        var row = null;
        var table = this.banDocument.table(tabPos.tableName);
        if (table && tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
            row = table.row(tabPos.rowNr);
        }

        if (!row) {
            return null;
        }

        var paymentObj = null;
        try {
            var rowObj = JSON.parse(row.value("PaymentData"));
            paymentObj = JSON.parse(rowObj.paymentdata_json);
        }
        catch (e) {
            if (rowObj !== undefined) {
                return null;
            }
            paymentObj = pain001CH.initPaymData();
        }

        //Banana.console.debug("updateRow, columnName " + tabPos.columnName + " uuid:" + uuid);

        var changedRowFields = {};
        if (tabPos.columnName === "Amount" || tabPos.columnName === "AmountCurrency"
            || tabPos.columnName === "Expenses") {

            //update paymentData object with values from transaction
            this._rowGetAmount(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.validatePaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "DocInvoice" || tabPos.columnName === "Date"
            || tabPos.columnName === "DateExpiration" || tabPos.columnName === "Description") {

            //update paymentData object with values from transaction
            this._rowGetDoc(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.validatePaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "Account" || tabPos.columnName === "AccountCredit"
            || tabPos.columnName === "AccountDebit" || tabPos.columnName === "Cc1"
            || tabPos.columnName === "Cc2" || tabPos.columnName === "Cc3") {

            //update paymentData object with values from transaction
            this._rowGetAccount(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.validatePaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "_CompleteRowData" && tabPos.changeSource === "programm_add") {

            //banana adds payment data automatically collecting data from transaction
            this._rowGetAccount(paymentObj, row);
            this._rowGetAmount(paymentObj, row);
            this._rowGetDoc(paymentObj, row);

            //verify all data
            var displayMsg = true;
            paymentObj = pain001CH.validatePaymObject(paymentObj, tabPos, displayMsg);

            //Uuid is set to a new value by copying or duplicating row
            paymentObj['@uuid'] = uuid;
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "PaymentData" || tabPos.columnName === "_AllRowDataChanged") {
            //columnName === "PaymentData" by copying row
            //columnName === "_AllRowDataChanged" by duplicating row

            //Account
            this._rowSetAccount(paymentObj, changedRowFields);

            //Amount
            this._rowSetAmount(paymentObj, changedRowFields);

            //Date
            this._rowSetDoc(paymentObj, changedRowFields);

            //if data is deleted from row, the payment object is updated
            if (tabPos.changeSource === "edit_delete") {
                this._rowGetAccount(paymentObj, row);
                this._rowGetAmount(paymentObj, row);
                this._rowGetDoc(paymentObj, row);
            }

            //verify all data
            paymentObj = pain001CH.validatePaymObject(paymentObj);

            //Uuid is set to a new value by copying or duplicating row
            paymentObj['@uuid'] = uuid;
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "_CompleteRowData") {
            //called by create(), edit() or scanCode()

            //Account
            this._rowSetAccount(paymentObj, changedRowFields);

            //Amount
            this._rowSetAmount(paymentObj, changedRowFields);

            //Doc and dates
            this._rowSetDoc(paymentObj, changedRowFields);

        }

        // Create docChange
        var docChange = new DocumentChange();
        if (Object.keys(changedRowFields).length > 0) {
            docChange.addOperationRowModify(tabPos.tableName, tabPos.rowNr, changedRowFields);
            docChange.setDocumentForCurrentRow();
        }
        return docChange.getDocChange();
    }

    /**
        * Validate xml pain file against schema available in package
        */
    validateTransferFile(xml, painFormat) {
        var pain001CH = new Pain001Switzerland(Banana.document);
        if (!pain001CH.verifyBananaVersion())
            return null;

        return pain001CH.validateTransferFile(xml, painFormat);
    }

    //Called from getInfo()
    _getInfoUnwrap(obj, prefix) {

        var res = {};

        if (obj) {
            for (var k of Object.keys(obj)) {
                var val = obj[k],
                    key = prefix ? prefix + '.' + k : k;

                if (typeof val === 'object')
                    Object.assign(res, this._getInfoUnwrap(val, key)); // <-- recursion
                else
                    res[key] = val;
            }
        }

        return res;
    }

    //Read account from row and write it to paymentObj
    _rowGetAccount(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row || !this.pain001CH.docInfo)
            return;
        var accountId = '';
        var pain001CH = new Pain001Switzerland(this.banDocument);
        var creditors = pain001CH.loadCreditors(false);

        if (this.pain001CH.docInfo.isDoubleEntry) {
            accountId = row.value("AccountCredit");
            if (!accountId || !creditors.indexOf(accountId) < 0)
                accountId = row.value("AccountDebit");
        }
        else if (this.pain001CH.docInfo.isIncomeExpenses) {
            accountId = row.value("Account");
        }

        //cost centers
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc3");
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = ";" + accountId;
        }
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc2");
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = "," + accountId;
        }
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc1");
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = "." + accountId;
        }
        
        if (!accountId || creditors.indexOf(accountId) < 0)
            accountId = '';

        if (accountId.length > 0 && paymentObj.creditorAccountId !== accountId) {
            let creditor = pain001CH.getCreditor(accountId);
            paymentObj.creditorAccountId = accountId;
            paymentObj.creditorName = creditor.name;
            paymentObj.creditorStreet1 = creditor.street1
            paymentObj.creditorStreet2 = creditor.street2;
            paymentObj.creditorPostalCode = creditor.postalCode;
            paymentObj.creditorCity = creditor.city;
            paymentObj.creditorCountry = creditor.country;
            paymentObj.creditorBankAccount = creditor.bankAccount;
            paymentObj.creditorBankName = creditor.bankName;
            paymentObj.creditorBankAddress1 = creditor.bankAddress1;
            paymentObj.creditorBankAddress2 = creditor.bankAddress2;
            paymentObj.creditorBic = creditor.bic;
            paymentObj.creditorIban = creditor.iban;
        }
    }

    //Read amount from row and write it to paymentObj
    _rowGetAmount(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row || !this.pain001CH.docInfo)
            return;

        var amount = 0;
        if (this.pain001CH.docInfo.isDoubleEntry) {
            if (this.pain001CH.docInfo.multiCurrency)
                amount = row.value("AmountCurrency");
            else
                amount = row.value("Amount");
        }
        else if (this.pain001CH.docInfo.isIncomeExpenses) {
            amount = row.value("Expenses");
        }
        paymentObj.amount = amount;

        //Currency
        var currency = this.pain001CH.docInfo.basicCurrency;
        if (this.pain001CH.docInfo.multiCurrency) {
            currency = row.value("ExchangeCurrency");
        }
        paymentObj.currency = currency;
    }

    //Read document information from row and write it to paymentObj
    _rowGetDoc(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row || !this.pain001CH.docInfo)
            return;

        //Invoice no
        var invoiceNo = row.value("DocInvoice");
        paymentObj.invoiceNo = invoiceNo;

        //Transaction date
        var transactionDate = row.value("Date");
        paymentObj.transactionDate = transactionDate;

        //Due date
        var dueDate = row.value("DateExpiration");
        paymentObj.dueDate = dueDate;

        //Description
        var description = row.value("Description");
        paymentObj.description = description;
    }

    //Read account from paymentObj and write it to the object row
    _rowSetAccount(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row || !this.pain001CH.docInfo)
            return;
        var accountId = "";
        if (paymentObj.creditorAccountId)
            accountId = paymentObj.creditorAccountId;
        if (accountId.length <= 0)
            return;
        var fieldName = "";
        if (accountId.startsWith("."))
            fieldName = "Cc1";
        else if (accountId.startsWith(","))
            fieldName = "Cc2";
        else if (accountId.startsWith(";"))
            fieldName = "Cc3";
        if (fieldName.length > 0) {
            accountId = accountId.substring(1);
            row[fieldName] = accountId;
        }
        else {
            if (this.pain001CH.docInfo.isDoubleEntry) {
                row["AccountCredit"] = accountId;
            }
            else if (this.pain001CH.docInfo.isIncomeExpenses) {
                row["Account"] = accountId;
            }
        }
    }

    //Read amount from paymentObj and write it to the object row
    _rowSetAmount(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !paymentObj.amount || !row || !this.pain001CH.docInfo)
            return;

        if (this.pain001CH.docInfo.isDoubleEntry) {
            if (this.pain001CH.docInfo.multiCurrency)
                row["AmountCurrency"] = paymentObj.amount;
            else
                row["Amount"] = paymentObj.amount;
        }
        else if (this.pain001CH.docInfo.isIncomeExpenses) {
            row["Expenses"] = paymentObj.amount;
        }

        //Currency
        var currency = paymentObj.currency;
        if (currency && this.pain001CH.docInfo.multiCurrency) {
            row["ExchangeCurrency"] = currency;
        }
    }

    //Read document information from paymentObj and write it to the object row
    _rowSetDoc(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row)
            return;

        //Invoice no
        var invoiceNo = paymentObj.invoiceNo;
        row["DocInvoice"] = invoiceNo;

        //Transaction date
        let internalDate = this.pain001CH.toDateFormatInternal(paymentObj.transactionDate);
        row["Date"] =  internalDate;

        //Due date
        internalDate = this.pain001CH.toDateFormatInternal(paymentObj.dueDate);
        row["DateExpiration"] = internalDate;

        //Description
        row["Description"] = paymentObj.description;
    }
}
