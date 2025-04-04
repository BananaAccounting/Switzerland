// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2024-07-30
// @publisher = Banana.ch SA
// @description = Credit Transfer File for Switzerland (pain.001)
// @task = accounting.payment
// @doctype = *
// @includejs = ch.banana.pain.iso.2009.js
// @includejs = ch.banana.pain.sps.2021.js
// @includejs = ch.banana.pain.sps.2022.js
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
        var answer = Banana.Ui.showQuestion("Payments", "Would you like to replace current data with the information from the newly selected account ID?");
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
    var paymentObj = pain001CH.initPaymObject();
    if (parseInt(index) == 1)
        paymentObj.methodId = pain001CH.ID_PAYMENT_SEPA_DESCRIPTION;
    else
        paymentObj.methodId = pain001CH.ID_PAYMENT_QRCODE_DESCRIPTION;
    var newParams = pain001CH.convertPaymData(paymentObj);

    //if something is already written ask before resetting data
    /*let existingData = false;
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
    }*/

    let keepData = true;
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
    this.ID_ERR_DATE_NOTVALID = "ID_ERR_DATE_NOTVALID";
    this.ID_ERR_ELEMENT_EMPTY = "ID_ERR_ELEMENT_EMPTY";
    this.ID_ERR_ELEMENT_EXCEEDED_LENGTH = "ID_ERR_ELEMENT_EXCEEDED_LENGTH";
    this.ID_ERR_ELEMENT_REQUIRED = "ID_ERR_ELEMENT_REQUIRED";
    this.ID_ERR_ELEMENT_COUNTRYCODE_REQUIRED = "ID_ERR_ELEMENT_COUNTRYCODE_REQUIRED";
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

    // PT:3 in ID_PAIN_FORMAT_001_001_03_CH_02
    // PT:D in ID_PAIN_FORMAT_001_001_09_CH_03
    //D - Domestic payments in CHF/EUR (with IBAN, QRIBAN or account)
    this.ID_PAYMENT_QRCODE = "QRCODE";
    this.ID_PAYMENT_QRCODE_DESCRIPTION = "Bank or postal payment (IBAN/QR-IBAN) in CHF & EUR";

    //S - SEPA transfer in EUR (with IBAN)
    this.ID_PAYMENT_SEPA = "SEPA";
    this.ID_PAYMENT_SEPA_DESCRIPTION = "SEPA transfer in EUR";

    //X - Cross-border and domestic payments in foreign currency (with IBAN or account)
    this.ID_PAYMENT_TYPE_X = "X";
    this.ID_PAYMENT_TYPE_X_DESCRIPTION = "Domestic payment in foreign currency (with IBAN or account)";

    // supported payment formats
    this.ID_PAIN_FORMAT_001_001_03_CH_02 = "pain.001.001.03.ch.02";
    this.ID_PAIN_FORMAT_001_001_09_CH_03 = "pain.001.001.09.ch.03";
    this.ID_PAIN_FORMAT_001_001_03 = "pain.001.001.03";
    this.painFormats = [];
    this.painFormats.push({
        "@appId": this.id,
        "@description": "Swiss Payment Standard 2022 (pain.001.001.09.ch.03)",
        "@format": this.ID_PAIN_FORMAT_001_001_09_CH_03,
        "@version": this.version
    });
    this.painFormats.push({
        "@appId": this.id,
        "@description": "Swiss Payment Standard 2021 (pain.001.001.03.ch.02)",
        "@format": this.ID_PAIN_FORMAT_001_001_03_CH_02,
        "@version": this.version
    });
    this.painFormats.push({
        "@appId": this.id,
        "@description": "ISO 20022 Schema (pain.001.001.03)",
        "@format": this.ID_PAIN_FORMAT_001_001_03,
        "@version": this.version
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
    currentParam.name = 'syncTransactionDefault';
    currentParam.title = 'Synchronize payment data with the transaction (Default value)';
    currentParam.type = 'bool';
    currentParam.value = param.syncTransactionDefault ? param.syncTransactionDefault : false;
    currentParam.readValue = function () {
        param.syncTransactionDefault = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'storeMessageInNotesDefault';
    currentParam.title = 'Store Additional Information in the \'Notes\' column (Default value)';
    currentParam.type = 'bool';
    currentParam.value = param.storeMessageInNotesDefault ? param.storeMessageInNotesDefault : false;
    currentParam.readValue = function () {
        param.storeMessageInNotesDefault = this.value;
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
    currentParam.items = Array (this.ID_PAYMENT_QRCODE_DESCRIPTION, this.ID_PAYMENT_SEPA_DESCRIPTION);
    // currentParam.items = Array(this.ID_PAYMENT_QRCODE_DESCRIPTION);
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

    //With Creditor Account ID IBAN no Creditor Agent required.
    /*
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
    convertedParam.data.push(currentParam);*/

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
    if (methodId === this.ID_PAYMENT_QRCODE) {
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
    else {
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
    }

    /*******************************************************************************************
    * ULTIMATE DEBTOR
    *******************************************************************************************/
    if (methodId === this.ID_PAYMENT_QRCODE) {
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
    currentParam.title = "Synchronize payment data with the transaction";
    currentParam.type = 'bool';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.syncTransaction ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        paymentObj.syncTransaction = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'storeMessageInNotes';
    currentParam.title = 'Store Additional Information in the \'Notes\' column';
    currentParam.type = 'bool';
    currentParam.parentObject = 'transaction';
    currentParam.value = paymentObj.storeMessageInNotes ? true : false;
    currentParam.readValue = function () {
        paymentObj.storeMessageInNotes = this.value;
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
    var msgId = this.formatUuid(paymentObj["@uuid"]);

    // Payment Information Identification unique inside msg
    // max length 35, should be unique for at least 3 months
    // example PAYMT-20220329093522
    var pmtInfId = "PAYMT-" + this.currentDateTime();
    /*if (paymentObj["@title"] && paymentObj["@title"].length > 0)
        pmtInfId = paymentObj["@title"];*/

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

    groupHeader.setSoftwareName("Banana Accounting Plus");
    groupHeader.setSoftwareProvider("Banana.ch SA");
    var version = Banana.application.version;
    if (this.isTest && version.lastIndexOf(".") > 0) {
        version = version.substring(0, version.lastIndexOf(".") - 1);
    }
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

            // counter -000, -001, ....
            var id = h * 100 + i;
            id = this.zeroPad(id, 3);

            var currentPmtInfId = pmtInfId;
            if (currentPmtInfId.length > 31)
                currentPmtInfId = currentPmtInfId.substr(0, 31);
            currentPmtInfId += "-" + id.toString();
            currentPmtInfId = _swiftString(currentPmtInfId);

            var payment = new PaymentInformation(
                currentPmtInfId, // Payment Information Identification unique inside msg
                cleanIBAN(paymentObj.debtorIban), // IBAN the money is transferred from
                cleanBIC(paymentObj.debtorBic),  // BIC
                paymentObj.debtorName, // Debtor Name
                // paymentObj.debtorCurrency
            );
            payment.setDueDate(executionDates[i]);
            //Specifies which party/parties will bear the charges of the payment transaction
            //Commented because the user should choose the costs per transaction
            // payment.setChargeBearer("CRED");

            //Collective order -> paymentObj.batchBooking
            //Detailed confirmation -> paymentObj.confirmationDetailed

            //Collective order:         NO      YES     YES     NO
            //Detailed confirmation:    YES     NO      YES     NO
            //------                    ---     ---     ---     ---
            //BtchBookg                 false   true    true    false
            //Prtry                     SIA     CND     CWD     NOA
            if (paymentObj.bookingIndividual){
                //single booking
                payment.setBatchBooking(0);
                if (paymentObj.confirmationDetailed) {
                    payment.setOriginAdvice("SIA");
                }
                else {
                    payment.setOriginAdvice("NOA");
                }
            }
            else {
                //collective order
                payment.setBatchBooking(1);
                if (paymentObj.confirmationDetailed) {
                    payment.setOriginAdvice("CWD");
                }
                else {
                    payment.setOriginAdvice("CND");
                }
            }

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
                    this.formatUuid(transactionInfoObj["@uuid"]), //EndToEndIdentification
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

                if (methodId === this.ID_PAYMENT_QRCODE) {
                    if (transactionInfoObj.creditorBic.length>0)
                        transfer.setBic(cleanBIC(transactionInfoObj.creditorBic));
                    transfer.setCreditorReferenceType(transactionInfoObj.referenceType);
                }
                else if (methodId === this.ID_PAYMENT_SEPA) {
                    transfer.setBic(cleanBIC(transactionInfoObj.creditorBic));
                    transfer.setServiceLevelCode("SEPA");
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
    var domBuilder = null;
    if (painFormat === this.ID_PAIN_FORMAT_001_001_03_CH_02) {
        domBuilder = new DomBuilderSPS2021(painFormat, true);
    }
    else if (painFormat === this.ID_PAIN_FORMAT_001_001_09_CH_03) {
        domBuilder = new DomBuilderSPS2022(painFormat, true);
    }
    else {
        domBuilder = new DomBuilder(painFormat, true);
    }

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

Pain001Switzerland.prototype.currentDateTime = function () {
    var m = new Date();
    var year = m.getUTCFullYear();
    var month = this.zeroPad((m.getUTCMonth() + 1), 2);
    var day = m.getUTCDate();
    var hours = this.zeroPad(m.getUTCHours().toString(), 2);
    var minutes = this.zeroPad(m.getUTCMinutes().toString(), 2);
    var seconds = this.zeroPad(m.getUTCSeconds().toString(), 2);
    var milliseconds = this.zeroPad(m.getUTCMilliseconds().toString(), 3);
    if (this.isTest) {
        year = "2020";
        month = "07";
        day = "01";
        hours = "10";
        minutes = "50";
        seconds = "00";
        milliseconds = "123";
    }
    var dateString = year + month + day + hours + minutes + seconds + milliseconds;
    return dateString;
}

Pain001Switzerland.prototype.formatUuid = function (uuid) {
    //QUuid::createUuid().toString(QUuid::Id128);
    //check length of uuid (max 35 characters)
    if (uuid.length > 35)
        uuid = uuid.replace(/-/g, '');
    if (uuid.length > 35)
        uuid = uuid.substr(0, 35);
    return uuid;
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
        case this.ID_ERR_DATE_NOTVALID:
            return "Invalid date format. Plese enter the date in the format \"dd.mm.yyyy\"";
        case this.ID_ERR_ELEMENT_EMPTY:
            return "%1 is not defined";
        case this.ID_ERR_ELEMENT_EXCEEDED_LENGTH:
            return "Maximum %1 characters";
        case this.ID_ERR_ELEMENT_REQUIRED:
            return "This is a required field";
        case this.ID_ERR_ELEMENT_COUNTRYCODE_REQUIRED:
            return "The Country code is recommended (Alpha-2 code).\nExamples: CH for Switzerland, LI for Liechtenstein";
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
            return "QRIBAN needs a reference number";
        case this.ID_ERR_VERSION_NOTSUPPORTED:
            return "Unsupported version. Please use or install the latest version of Banana Accounting Dev Channel with Advanced Plan. <br>Click the Help button to get the link.";
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

Pain001Switzerland.prototype.initPaymObject = function () {

    // if syncTransaction=true data is synchronized with transaction row
    var syncTransaction = this.param.syncTransactionDefault;
    //if storeMessageInNotes=true unstructured message is stored in Notes field
    var storeMessageInNotes = this.param.storeMessageInNotesDefault;

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
        "storeMessageInNotes": storeMessageInNotes,
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
    //param.fieldAdditionalInfo = "Notes";  //deprecated
    param.syncTransactionDefault=true;
    param.storeMessageInNotesDefault=false;
    param.creditorGroups = "";
    return param;
}

Pain001Switzerland.prototype.infoPaymObject = function (paymentObj, infoObj, row) {
    if (!paymentObj || !infoObj || !row || !this.banDocument)
        return;
    
    var lang = this.getLang();

    if (!paymentObj.creditorIban) {
        var msg = this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        msg = msg.replace("%1", "Creditor IBAN");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }

    var iban = "";
    if (paymentObj.creditorIban)
        iban = cleanIBAN(paymentObj.creditorIban);
    if (!isValidIBAN(iban)) {
        var msg = this.getErrorMessage(this.ID_ERR_IBAN_NOTVALID, lang);
        msg = msg.replace("%1", "creditorIban");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }

    if (!paymentObj.creditorName) {
        var msg = this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        msg = msg.replace("%1", "Creditor Name");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }

    /*if (!paymentObj.creditorStreet1 && paymentObj.methodId == this.ID_PAYMENT_QRCODE) {
        var msg = this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        msg = msg.replace("%1", "Creditor Address");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }*/

    if (!paymentObj.creditorCity) {
        var msg = this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        msg = msg.replace("%1", "Creditor City");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }

    if (!paymentObj.amount) {
        var msg = this.getErrorMessage(this.ID_ERR_ELEMENT_EMPTY, lang);
        msg = msg.replace("%1", "Amount");
        msg = "<span style='color:red'>" + msg + "</span>";
        let infoMsg = {
            'text': msg
        };
        infoObj.push(infoMsg);
    }
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
            let formattedValue = value;
            if (formattedValue && formattedValue.length > 0) {
                formattedValue = this.toLocalDate(value);
            }
            editorData.data[i].value = formattedValue;
        }
        else if (key == 'amount') {
            editorData.data[i].value = this.toAmountLocalFormat(value);
        }
    }

    // Open dialog
    let editor = Banana.Ui.createPropertyEditor(dialogTitle, editorData, pageAnchor);
    let rtnValue = editor.exec();
    if (parseInt(rtnValue) !== 1)
        return null;

    // Read data from dialog
    editorData = editor.getParams();
    let paymentObj = this.initPaymObject();
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
            value = this.toAmountInternalFormat(value);
        }
        if (paymentObj.hasOwnProperty(key)) {
            paymentObj[key] = value;
        }
    }

    return paymentObj;
}

Pain001Switzerland.prototype.saveTransferFile = function (inData, _fileName) {
    if (inData.length <= 0) {
        var msg = this.getErrorMessage(this.ID_ERR_MESSAGE_EMPTY, this.getLang());
        this.banDocument.addMessage(msg, this.ID_ERR_MESSAGE_EMPTY);
        return false;
    }

    //set filename according to PaymentInfo Tag
    var fileName = _fileName;
    if (!fileName)
        fileName = "";

    if (fileName.length <= 0 || !fileName) {
        fileName = "PAIN001_<Date>.xml";
        var date = _formatDate(new Date());
        if (date.indexOf(":") > 0);
        date = date.replace(/:/g, '');
        if (date.indexOf("-") > 0);
        date = date.replace(/-/g, '');
        var time = _formatTime(new Date());
        if (time.indexOf(":") > 0);
        time = time.replace(/:/g, '');
        fileName = fileName.replace("<Date>", date + time);
    }

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
        return fileName;
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

    var paymentObj = this.initPaymObject();

    // Remove 000026 prefix that appears when reading certain QR codes (ECI block)
    if (swissQRCodeData.QRType.startsWith('\\000026')) {
        swissQRCodeData.QRType = swissQRCodeData.QRType.substr(7);
    }

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
            if (!row)
                row = tableAccounts.findRowByValue('Description', name);
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

/* This method converts a local amount to the internal amount format */
Pain001Switzerland.prototype.toAmountInternalFormat = function (value) {
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

/* This method converts an internal formatted amount to the local amount format */
Pain001Switzerland.prototype.toAmountLocalFormat = function (value) {
    if (!value || !this.docInfo)
        return "";
    var decimals = this.docInfo.decimalsAmounts ? this.docInfo.decimalsAmounts : 2;
    var convertedValue = Banana.Converter.toLocaleNumberFormat(value, decimals, true);
    return convertedValue;
}

/* This method converts a local or iso date to the internal date format yyyymmdd */
Pain001Switzerland.prototype.toInternalDate = function (value) {
    //empty strings does nothing
    if (!value)
        return "";

    var internalValue = Banana.Converter.toInternalDateFormat(value);
    internalValue = internalValue.replace(/-/g, '');
    return internalValue;
}

/* This method converts an internal or local date to the ISO date format */
Pain001Switzerland.prototype.toISODate = function (value) {
    //empty strings does nothing
    if (!value || value.length <= 0)
        return "";

    let inputFormat = '';
    if (value.match(/^(\d{8})$/)) {
        //format yyyymmdd
        inputFormat = 'yyyymmdd';
    }
    else if (value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
        //format dd/mm/yyyy
        inputFormat = 'dd/mm/yyyy';
    }
    else if (value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)) {
        //format dd/mm/yy
        inputFormat = 'dd/mm/yy';
    }
    else if (value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)) {
        inputFormat = "dd.mm.yyyy";
    }
    else if (value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/)) {
        inputFormat = "dd.mm.yy";
    }
    else if (value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)) {
        inputFormat = "dd-mm-yyyy";
    }
    else if (value.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/)) {
        inputFormat = "dd-mm-yy";
    }
    else if (value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)) {
        inputFormat = "yyyy-mm-dd";
    }

    if (inputFormat.length <= 0)
        return "";

    let formattedDate = Banana.Converter.toInternalDateFormat(value, inputFormat);

    //check if it's a valid date
    let d = Date.parse(formattedDate);
    if (!d) {
        //moves month at the beginning
        if (value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
            //format mm/dd/yyyy
            inputFormat = 'mm/dd/yyyy';
        }
        else if (value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)) {
            inputFormat = 'mm/dd/yy';
        }
        else if (value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)) {
            inputFormat = "mm.dd.yyyy";
        }
        else if (value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/)) {
            inputFormat = "mm.dd.yy";
        }
        else if (value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)) {
            inputFormat = "mm-dd-yyyy";
        }
        else if (value.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/)) {
            inputFormat = "mm-dd-yy";
        }

        formattedDate = Banana.Converter.toInternalDateFormat(value, inputFormat);
        //recheck if it's a valid date
        d = Date.parse(formattedDate);
        if (!d) {
            formattedDate = '';
        }
    }
    
    return formattedDate;
}

/* This method converts an internal or iso date to the local date format  */
Pain001Switzerland.prototype.toLocalDate = function (value) {
    //empty strings does nothing
    if (!value)
        return "";

    var formattedDate = Banana.Converter.toLocaleDateFormat(value);
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
        if (key === 'dueDate' || key === 'transactionDate') {
            let isoDate = this.toISODate(value);
            if (value && value.length > 0 && isoDate.length <= 0) {
                params.data[i].errorId = this.ID_ERR_DATE_NOTVALID;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_DATE_NOTVALID);
                error = true;
            }
        }
        if (methodId == this.ID_PAYMENT_QRCODE_DESCRIPTION) {
            if (key === 'creditorName' && value.length <= 0) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_REQUIRED);
                error = true;
            }
            else if (key === 'creditorName' && value.length > 70) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_EXCEEDED_LENGTH;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_EXCEEDED_LENGTH);
                params.data[i].errorMsg = params.data[i].errorMsg.replace("%1", "70");
                error = true;
            }
            else if (key === 'creditorCountry' && value.length !== 2) {
                params.data[i].errorId = this.ID_ERR_ELEMENT_COUNTRYCODE_REQUIRED;
                params.data[i].errorMsg = this.getErrorMessage(this.ID_ERR_ELEMENT_COUNTRYCODE_REQUIRED);
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

Pain001Switzerland.prototype.verifyBananaVersion = function (suppressMsg) {
    if (!this.banDocument)
        return false;

    var isExperimental = Banana.application.isExperimental;
    var isInternal = Banana.application.isInternal;
    if (!isExperimental && !isInternal) {
        var msg = this.getErrorMessage(this.ID_ERR_EXPERIMENTAL_REQUIRED, this.getLang());
        if (suppressMsg)
            Banana.console.warn(msg);
        else
            this.banDocument.addMessage(msg, this.ID_ERR_EXPERIMENTAL_REQUIRED);
        return false;
    }

    //example Banana.application.serial 100100-230104
    //example Banana.application.version 10.1.0
    //version Dev-Channel contains build number 10.1.0.23004
    var serial = Banana.application.serial;
    var version = Banana.application.version;

    var supportedVersion = true;
    var requiredVersion = "10.1.14";
    var requiredSerial = "231102";

    if (Banana.compareVersion && Banana.compareVersion(version, requiredVersion) < 0) {
        supportedVersion = false;
    }
//Banana.console.debug("serial number: " + serial.substr(serial.lastIndexOf('-') + 1));
//Banana.console.debug("serial number complete: " + serial);

    if (serial.lastIndexOf('-') > 0) {
        serial = serial.substr(serial.lastIndexOf('-') + 1);
        if (parseInt(serial) < parseInt(requiredSerial)) {
            supportedVersion = false;
        }
    }

    if (!supportedVersion) {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, this.getLang());
        if (suppressMsg)
            Banana.console.warn(msg);
        else
            this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }

    if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
        var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, this.getLang());
        if (suppressMsg)
            Banana.console.warn(msg);
        else
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
    if (!this.param.creditorGroups)
        this.param.creditorGroups = defaultParam.creditorGroups;
    if (typeof (this.param.syncTransactionDefault) === 'undefined')
        this.param.syncTransactionDefault = true;
    if (typeof (this.param.storeMessageInNotesDefault) === 'undefined')
        this.param.storeMessageInNotesDefault = false;
}

/**
* verify and clean payment object data
*/
Pain001Switzerland.prototype.verifyPaymObject = function (paymentObj) {
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
    return paymentObj;
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
        // Banana.console.debug("--------create-------- uuid: " + uuid + " " + JSON.stringify(tabPos));
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var paymentObj = pain001CH.initPaymObject();

        //unlike edit(), which reads the paymentdata object from row, create() inits a new paymentdata object
        var row = null;
        var table = this.banDocument.table(tabPos.tableName);
        if (tabPos.rowNr >=0 && tabPos.rowNr < table.rowCount && tabPos.tableName === "Transactions") {
            row = table.row(tabPos.rowNr);
        }

        //load creditor id and amount if data is syncronized with transaction row
        if (row) {
            this._rowGetAccount(paymentObj, row);
            this._rowGetUnstructuredMessage(paymentObj, row);
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

        // Before adding uuid to the payment object, check if the registration row is valid
        // If row is not valid, the payment is added into a new row and uuid is set later by updateRow()
        if (row && uuid.length > 0)
            paymentObj["@uuid"] = uuid;
        // Banana.console.debug("create, columnName " + tabPos.columnName + " uuid" + paymentObj["@uuid"] );

        //verify all data
        paymentObj = pain001CH.verifyPaymObject(paymentObj);

        var changedRowFields = {};
        changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        //update row content to prevent loss of data, because updateRow() is called immediately after create()
        //updateRow() update row content to payment object
        this._rowSetAccount(paymentObj, changedRowFields);
        this._rowSetAmount(paymentObj, changedRowFields);
        this._rowSetDoc(paymentObj, changedRowFields);
        this._rowSetUnstructuredMessage(paymentObj, changedRowFields);

        // Create docChange which adds the paymentdata to a new row or an existing row in the transaction table
        // the new row is appended to the end of the transaction table
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

        var paymentObj = pain001CH.initPaymObject();

        //unlike create(), which inits a new paymentdata object, edit() reads the paymentdata object from row
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
        paymentObj = pain001CH.verifyPaymObject(paymentObj);

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
    exportTransferFile(xml, fileName) {
        var pain001CH = new Pain001Switzerland(Banana.document);
        if (!pain001CH.verifyBananaVersion())
            return "";

        var pain001CH = new Pain001Switzerland(Banana.document);
        var exportedFileName = pain001CH.saveTransferFile(xml, fileName);
        if (exportedFileName)
            return exportedFileName;
        return "";
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

        var infoObj = [];

        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion(true))
            return infoObj;

        var row = null;
        var paymentObj = null;
        var isPaymentOrder = false;
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
                return infoObj;
            }
        }
        else {
            return infoObj;
        }

        if (!paymentObj)
            return infoObj;

        var infoMsg = {};
        var obj = this._getInfoUnwrap(paymentObj);
        if (isPaymentOrder) {
            let rowCount = paymentObj.transactions.length;
            infoMsg = {
                'text': obj['@type'] + " " + obj['@appId'] + " v." + obj['@version'] + " " + obj['@format'],
                'amount1': obj['debtorName'],
                'amount2': obj['debtorIban'],
                'amount3': qsTr('Total transactions:') + " " + paymentObj.transactions.length
            };
            let transferFile = paymentObj.transferFile;
            if (transferFile) {
                var xml = Banana.Xml.parse(transferFile).firstChildElement('Document').firstChildElement('CstmrCdtTrfInitn');
                infoMsg.amount3 = qsTr('Total transactions:') + " " + xml.firstChildElement('GrpHdr').firstChildElement('NbOfTxs').text;
                infoMsg.amount4 = qsTr(', checksum:') + " " + xml.firstChildElement('GrpHdr').firstChildElement('CtrlSum').text;
                infoMsg.amount2 = obj['@title'];
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
            let paymentObjCheck = pain001CH.initPaymObject();
            this._rowGetAmount(paymentObjCheck, row);
            let warning = "";
            if (paymentObj.syncTransaction && paymentObjCheck.amount != obj['amount'])
                warning = " <span style='color:red;'>(Transaction: " + paymentObjCheck.currency + " " + paymentObjCheck.amount + ")</span>";
            infoMsg = {
                'text': obj['@type'] + " " + obj['@appId'] + " v." + obj['@version'],
                'amount1': obj['creditorName'],
                'amount2': obj['reference'],
                'currency': obj['currency'],
                'amount3': obj['amount'] + warning,
                'amount4': obj['methodId']
            };
            infoObj.push(infoMsg);
            pain001CH.infoPaymObject(paymentObj, infoObj, row);
        }
        return infoObj;
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
     */
    scanCode(tabPos, code) {
        // Banana.console.debug("scanCode, columnName:" + tabPos.columnName + " code " + code);
        var pain001CH = new Pain001Switzerland(this.banDocument);
        if (!pain001CH.verifyBananaVersion())
            return null;

        var table = this.banDocument.table(tabPos.tableName);
        if (!table || tabPos.tableName !== "Transactions") {
            return null;
        }

        // Ensure code is an array as code is either string or string[].
        if (!Array.isArray(code)) {
            let _code = code;
            code = [];
            code.push(_code);
        }

        if (code.length <= 0)
            return null;

        // Convert Qr-Codes into payment objects and save them in a documentchange object 
        var docChange = new DocumentChange();

        for (var i = 0; i < code.length; ++i) {
            if (code[i].length <= 0)
                continue;

            // read QRCode
            var paymentObj = pain001CH.scanCode(code[i]);

            //uuid is set by updateRow() and corresponds to the row uuid
            //load transaction date and description from row
            var row = null;
            if (tabPos.rowNr < table.rowCount) {
                row = table.row(tabPos.rowNr);
                if (row)
                    this._rowGetDoc(paymentObj, row);
            }

            if (!paymentObj["transactionDate"] || paymentObj["transactionDate"].length <= 0)
                paymentObj["transactionDate"] = pain001CH.currentDate();
            if (!paymentObj["description"] || paymentObj["description"].length <= 0)
                paymentObj["description"] = paymentObj["creditorName"];

            // Open dialog for data confirmation
            /*var dialogTitle = 'Payment data';
            var pageAnchor = 'dlgPaymentData';
            var editorData = pain001CH.convertPaymData(paymentObj);
            paymentObj = pain001CH.openEditor(dialogTitle, editorData, pageAnchor);
    
            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);*/

            var changedRowFields = {};
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
            this._rowSetAccount(paymentObj, changedRowFields);
            this._rowSetAmount(paymentObj, changedRowFields);
            this._rowSetDoc(paymentObj, changedRowFields);
            this._rowSetUnstructuredMessage(paymentObj, changedRowFields);

            // Add to docChange
            // Only append rows because qr codes could be more than one and rows must be added to the table
            docChange.addOperationRowAdd(tabPos.tableName, changedRowFields);

        }

        // Move to the last row
        docChange.moveToRow(tabPos.tableName, "Description", -1);
        
        // Banana.Ui.showText(JSON.stringify(docChange.getDocChange(), null, 3));
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
        if (!pain001CH.verifyBananaVersion(true)) {
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

        //returns null if paymentObj is not valid
        var paymentObj = null;
        try {
            var rowObj = JSON.parse(row.value("PaymentData"));
            paymentObj = JSON.parse(rowObj.paymentdata_json);
        }
        catch (e) {
            /*if (rowObj === undefined && tabPos.changeSource === "programm_add")
                paymentObj = pain001CH.initPaymObject();
            else*/
                //Banana.console.debug("invalid paymentobject at row " + tabPos.rowNr);
                return null;
        }
        //Banana.console.debug("paymentobject ok at row: " + tabPos.rowNr);

        var changedRowFields = {};
        if (tabPos.columnName === "Amount" || tabPos.columnName === "AmountCurrency"
            || tabPos.columnName === "Expenses") {

            //update paymentData object with values from transaction
            this._rowGetAmount(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "DocInvoice" || tabPos.columnName === "Date"
            || tabPos.columnName === "DateExpiration" || tabPos.columnName === "Description") {

            //update paymentData object with values from transaction
            this._rowGetDoc(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "Notes") {

            //read unstructured message from transaction
            this._rowGetUnstructuredMessage(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "Account" || tabPos.columnName === "AccountCredit"
            || tabPos.columnName === "AccountDebit" || tabPos.columnName === "Cc1"
            || tabPos.columnName === "Cc2" || tabPos.columnName === "Cc3") {

            //update paymentData object with values from transaction
            this._rowGetAccount(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "PaymentData") {
            //columnName === "PaymentData" by copying row

            this._rowSetAccount(paymentObj, changedRowFields);
            this._rowSetAmount(paymentObj, changedRowFields);
            this._rowSetDoc(paymentObj, changedRowFields);
            this._rowSetUnstructuredMessage(paymentObj, changedRowFields);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            //update Uuid according to row uuid
            paymentObj['@uuid'] = uuid;
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        else if (tabPos.columnName === "_AllRowDataChanged") {
            //columnName === "_AllRowDataChanged" by duplicating row, scanning qrcode or deleting content of a column

            this._rowGetAccount(paymentObj, row);
            this._rowGetAmount(paymentObj, row);
            this._rowGetDoc(paymentObj, row);
            this._rowGetUnstructuredMessage(paymentObj, row);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            //update Uuid according to row uuid
            paymentObj['@uuid'] = uuid;
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }
        /*else if (tabPos.columnName === "_CompleteRowData" && tabPos.changeSource === "programm_add") {
            //banana adds payment data automatically collecting data from transaction
            //errors are displayed on the message window by function getInfo()

            this._rowGetAccount(paymentObj, row);
            this._rowGetUnstructuredMessage(paymentObj, row);
            this._rowGetAmount(paymentObj, row);
            this._rowGetDoc(paymentObj, row);

            //automatically added rows are not synchronized with payment object to avoid changed to transactions
            paymentObj.syncTransaction = false;
            this._rowResetAmount(changedRowFields);

            //verify all data
            paymentObj = pain001CH.verifyPaymObject(paymentObj);

            //update Uuid according to row uuid
            paymentObj['@uuid'] = uuid;
            changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
        }*/
        else if (tabPos.columnName === "_CompleteRowData") {
            //called by create(), edit(), scanCode()

            //Account
            this._rowSetAccount(paymentObj, changedRowFields);

            //Amount
            this._rowSetAmount(paymentObj, changedRowFields);

            //Unstructured message
            this._rowSetUnstructuredMessage(paymentObj, changedRowFields);

            //Doc and dates
            this._rowSetDoc(paymentObj, changedRowFields);

            //Fix uuid if it is empty or different from row uuid
            if (!paymentObj["@uuid"] || paymentObj["@uuid"] != row.uuid) {
                Banana.console.debug("fixing uuid" + paymentObj["@uuid"] + " " + row.uuid);
                paymentObj["@uuid"] = row.uuid;
                changedRowFields["PaymentData"] = { "paymentdata_json": JSON.stringify(paymentObj) };
            }
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

                if (typeof (val) === 'object')
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

        //remove comment
        if (accountId && accountId.startsWith("[") && accountId.endsWith("]"))
            accountId = accountId.substr(1, accountId.length - 2);

        //cost centers
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc3");
            if (accountId && accountId.startsWith("[") && accountId.endsWith("]"))
                accountId = accountId.substr(1, accountId.length - 2);
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = ";" + accountId;
        }
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc2");
            if (accountId && accountId.startsWith("[") && accountId.endsWith("]"))
                accountId = accountId.substr(1, accountId.length - 2);
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = "," + accountId;
        }
        if (!accountId || creditors.indexOf(accountId) < 0) {
            accountId = row.value("Cc1");
            if (accountId && accountId.startsWith("[") && accountId.endsWith("]"))
                accountId = accountId.substr(1, accountId.length - 2);
            if (accountId && accountId.startsWith("-"))
                accountId = accountId.substr(1);
            if (accountId)
                accountId = "." + accountId;
        }
        
        if (!accountId || creditors.indexOf(accountId) < 0)
            accountId = '';

        if (paymentObj.creditorAccountId !== accountId) {
            paymentObj.creditorAccountId = accountId;
            if (accountId.length > 0) {
                //if something is already written doesn't reset address data
                let existingData = false;
                for (var key in paymentObj) {
                    if (key.startsWith('creditor') && key !== 'creditorAccountId') {
                        var value = paymentObj[key];
                        if (value.length > 0) {
                            existingData = true;
                            break;
                        }
                    }
                }
                let creditor = pain001CH.getCreditor(accountId);
                if (!existingData) {
                    paymentObj.creditorName = creditor.name;
                    paymentObj.creditorStreet1 = creditor.street1
                    paymentObj.creditorStreet2 = creditor.street2;
                    paymentObj.creditorPostalCode = creditor.postalCode;
                    paymentObj.creditorCity = creditor.city;
                    paymentObj.creditorCountry = creditor.country;
                    if (paymentObj.creditorBankAccount)
                        paymentObj.creditorBankAccount = creditor.bankAccount;
                    if (paymentObj.creditorBankName)
                        paymentObj.creditorBankName = creditor.bankName;
                    if (paymentObj.creditorBankAddress1)
                        paymentObj.creditorBankAddress1 = creditor.bankAddress1;
                    if (paymentObj.creditorBankAddress2)
                        paymentObj.creditorBankAddress2 = creditor.bankAddress2;
                    paymentObj.creditorBic = creditor.bic;
                    paymentObj.creditorIban = creditor.iban;
                }
            }
        }
    }

    //Read unstructured message from row and write it to paymentObj
    //if param.storeMessageInNotes == false doesn't synchronize data with the Notes field
    _rowGetUnstructuredMessage(paymentObj, row) {
        if (!paymentObj || !paymentObj.storeMessageInNotes || !row)
            return;

        var unstructuredMessage = row.value("Notes");
        paymentObj.unstructuredMessage = unstructuredMessage;
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
        //Write account only if it is not empty to prevent removing existing transaction data
        //This method is called when recalculating accounting
        if (accountId.length <= 0)
            return;

        //check if cost centers' account
        var fieldName = "";
        if (accountId.length <= 0) {
            var creditors = this.pain001CH.loadCreditors(false);
            if (creditors.length>0) {
                if (creditors[0].startsWith("."))
                    fieldName = "Cc1";
                else if (creditors[0].startsWith(","))
                    fieldName = "Cc2";
                else if (creditors[0].startsWith(";"))
                    fieldName = "Cc3";
                }
        }
        else {
            if (accountId.startsWith("."))
                fieldName = "Cc1";
            else if (accountId.startsWith(","))
                fieldName = "Cc2";
            else if (accountId.startsWith(";"))
                fieldName = "Cc3";
        }

        if (fieldName.length > 0) {
            if (accountId.length>0) {
                //remove dot comma or semicolon
                accountId = accountId.substring(1);
                //add minus sign
                accountId = "-" + accountId;
            }
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

    //Read message from paymentObj and write it to the object row
    //if param.storeMessageInNotes == false doesn't synchronize data with the Notes field
    _rowSetUnstructuredMessage(paymentObj, row) {
        if (!paymentObj || !paymentObj.unstructuredMessage || !paymentObj.storeMessageInNotes || !row )
            return;

        var message = paymentObj.unstructuredMessage;
        row["Notes"] = message;
    }

    //Remove amount from object row
    _rowResetAmount(row) {
        if (!row || !this.pain001CH.docInfo)
            return;

        if (this.pain001CH.docInfo.isDoubleEntry) {
            row["Amount"] = "";
            if (this.pain001CH.docInfo.multiCurrency)
                row["AmountCurrency"] = "";
        }
        else if (this.pain001CH.docInfo.isIncomeExpenses) {
            row["Expenses"] = "";
        }
    }

    //Read amount from paymentObj and write it to the object row
    _rowSetAmount(paymentObj, row) {
        if (!paymentObj || !paymentObj.syncTransaction || !row || !this.pain001CH.docInfo)
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
        let internalDate = this.pain001CH.toInternalDate(paymentObj.transactionDate);
        row["Date"] =  internalDate;

        //Due date
        internalDate = this.pain001CH.toInternalDate(paymentObj.dueDate);
        row["DateExpiration"] = internalDate;

        //Description
        row["Description"] = paymentObj.description;
    }
}
