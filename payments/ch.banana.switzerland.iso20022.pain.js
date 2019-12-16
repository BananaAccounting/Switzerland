// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.ch.export.pain001.js
// @api = 1.0
// @pubdate = 2019-12-04
// @publisher = Banana.ch SA
// @description =  Credit transfer files creation for Switzerland (Swiss Payment Standards PAIN.001)
// @task = payment
// @doctype = *

var ID_ERR_ELEMENT_EMPTY = "ID_ERR_ELEMENT_EMPTY";
var ID_ERR_PAYMENTMETHOD_NOTSUPPORTED = "ID_ERR_PAYMENTMETHOD_NOTSUPPORTED";
var ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
var SEPARATOR_CHAR = '\xa0';

function createTransferFile(msgId, executionDate, accountData, paymentData) {

    /*Banana.console.debug("msgId: " + msgId);
    Banana.console.debug("executionDate: " + executionDate);
    Banana.console.debug("accountDataObj: " + JSON.stringify(accountData, null, '   '));
    Banana.console.debug("paymentDataObj: " + JSON.stringify(paymentData, null, '   '));*/

    if (!Banana.document)
        return "@cancel";

    var accountDataObj = null;
    var paymentDataObj = null;
    if (typeof (accountData) === 'object') {
        accountDataObj = accountData;
    } else if (typeof (accountData) === 'string') {
        try {
            accountDataObj = JSON.parse(accountData);
        } catch (e) {
            Banana.document.addMessage(e);
        }
    }
    if (typeof (paymentData) === 'object') {
        paymentDataObj = paymentData;
    } else if (typeof (paymentData) === 'string') {
        try {
            paymentDataObj = JSON.parse(paymentData);
        } catch (e) {
            Banana.document.addMessage(e);
        }
    }
    if (!accountDataObj || !paymentDataObj)
        return "@cancel";

    // Create message's header <GrpHdr>
    var groupHeader = new GroupHeader(msgId);
    if (Banana.document.info) {
        var initiatingPartyName = Banana.document.info("AccountingDataBase", "Company");
        if (initiatingPartyName.length <= 0) {
            initiatingPartyName = Banana.document.info("AccountingDataBase", "FamilyName");
            if (initiatingPartyName.length > 0 && Banana.document.info("AccountingDataBase", "Name").length > 0)
                initiatingPartyName += ' ';
            initiatingPartyName += Banana.document.info("AccountingDataBase", "Name");
        }
        groupHeader.setInitiatingPartyName(initiatingPartyName);
    }
    groupHeader.setSoftwareName("Banana Accounting");
    groupHeader.setSoftwareVersion(Banana.application.version);

    // Create a transfer file which contains all data to transfer
    var transferFile = new CustomerCreditTransferFile(groupHeader);

    // Create a PaymentInformation the Transfer belongs to
    var payment = new PaymentInformation(
        accountDataObj.accountId,	// Payment Information Identification
        accountDataObj.iban, // IBAN the money is transferred from
        accountDataObj.bic,  // BIC
        accountDataObj.name, // Debitor Name
        accountDataObj.currency
    );
    payment.setDueDate(executionDate);

    for (var i = 0; i < paymentDataObj.length; i++) {

        //Get payment method: ISR, QR, IBAN, ...
        var methodId = getPaymentMethodSelected(paymentDataObj[i]);
        if (methodId.length <= 0)
            continue;

        var transfer = new CustomerCreditTransferInformation(
            paymentDataObj[i].uuid, //EndToEndIdentification
            paymentDataObj[i].name, //Name of Creditor
            paymentDataObj[i].amount // Amount
        );

        // Set Instruction Identification for any transfer (unique within B-LEVEL)
        transfer.setInstructionId("INSTRID-" + parseInt(i + 1).toString());
        transfer.setCurrency(paymentDataObj[i].currency); // Set the amount currency
        transfer.setRemittanceInformation(paymentDataObj[i].additionalInformation);	//Additional information
        transfer.setIban(paymentDataObj[i].iban);	//IBAN or account number
        transfer.setCreditorReference(paymentDataObj[i].referenceNumber);	//Creditor Reference Information

        if (methodId == ID_PAYMENT_METHOD_ISR) {
            transfer.setLocalInstrumentProprietary("CH01");
        }
        else if (methodId == ID_PAYMENT_METHOD_IS) {
            transfer.setLocalInstrumentProprietary("CH03");
        }

        // It's possible to add multiple Transfers in one payment
        payment.addTransfer(transfer);
    }

    // It's possible to add multiple payments to one Transfer
    transferFile.addPaymentInformation(payment);

    // Attach a domBuilder to the Transfer to create the XML output
    var domBuilder = new DomBuilder('pain.001.001.03.ch.02', true);
    transferFile.accept(domBuilder);

    // Create the file
    var xmlData = domBuilder.asXml();

    // Validate the file
    //validateTransferFile(xmlData);

    if (domBuilder.save(xmlData))
        return xmlData;
    return "@cancel";
}

function evAccountIdChanged(selectedAccountId, paymentData) {
    var data = {};
    try {
        data = JSON.parse(paymentData);
    } catch (e) {
        Banana.document.addMessage(e);
    }
	
    var posStart=0;
	var accountId = selectedAccountId;
	if (accountId.lastIndexOf(SEPARATOR_CHAR)>0) {
		posStart = accountId.lastIndexOf(SEPARATOR_CHAR);
		accountId = accountId.substr(0, posStart);
	}

    data.accountId = accountId;
    data.iban = "iban";
    data.name = "name";
    return JSON.stringify(data, null, '   ');
}

function getEditorParams(paymentData) {
    var convertedParam = {};

    var methodId = getPaymentMethodSelected(paymentData);
    if (methodId == ID_PAYMENT_METHOD_ISR) {
        convertedParam = getEditorParamsIsr(paymentData);
    }
    else if (methodId == ID_PAYMENT_METHOD_IS || methodId == ID_PAYMENT_METHOD_IBAN) {
        convertedParam = getEditorParamsIban(paymentData);
    }
    else if (methodId == ID_PAYMENT_METHOD_QRCODE) {
        convertedParam = getEditorParamsQrCode(paymentData);
    }

    convertedParam.readValues = function () {
        for (var i = 0; i < convertedParam.data.length; i++) {
            if (typeof (convertedParam.data[i].readValue) !== 'undefined') {
                convertedParam.data[i].readValue();
            }
        }
    }
    return convertedParam;
}

function getEditorParamsIban(paymentData) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    var texts = setTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'creditor';
    currentParam.title = 'Beneficiary';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'accountId';
    currentParam.title = 'Account';
    currentParam.type = 'combobox';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.accountId ? paymentData.accountId : '';
    currentParam.items = loadAccounts();
    currentParam.currentIndexChanged = 'evAccountIdChanged';
    currentParam.readValue = function () {
        paymentData.accountId = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'name';
    currentParam.title = 'Name';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.name ? paymentData.name : '';
    currentParam.readValue = function () {
        paymentData.name = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'address';
    currentParam.title = 'Address';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.address ? paymentData.address : '';
    currentParam.readValue = function () {
        paymentData.address = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'postalCode';
    currentParam.title = 'Postal code';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.postalCode ? paymentData.postalCode : '';
    currentParam.readValue = function () {
        paymentData.postalCode = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'locality';
    currentParam.title = 'Locality';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.locality ? paymentData.locality : '';
    currentParam.readValue = function () {
        paymentData.locality = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'country';
    currentParam.title = 'Country';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.country ? paymentData.country : '';
    currentParam.readValue = function () {
        paymentData.country = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'iban';
    currentParam.title = 'IBAN/Account';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.iban ? paymentData.iban : '';
    currentParam.readValue = function () {
        paymentData.iban = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'bic';
    currentParam.title = 'BIC';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.bic ? paymentData.bic : '';
    currentParam.readValue = function () {
        paymentData.bic = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'additionalInfo';
    currentParam.title = "Additional Information";
    currentParam.type = 'string';
    currentParam.value = paymentData.additionalInfo ? paymentData.additionalInfo : '';
    currentParam.readValue = function () {
        paymentData.additionalInfo = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'amount';
    currentParam.title = "Amount";
    currentParam.type = 'string';
    currentParam.value = paymentData.amount ? paymentData.amount : '';
    currentParam.readValue = function () {
        paymentData.amount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'currency';
    currentParam.title = "Currency";
    currentParam.type = 'string';
    currentParam.value = paymentData.currency ? paymentData.currency : '';
    currentParam.readValue = function () {
        paymentData.currency = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'duedate';
    currentParam.title = "Due date";
    currentParam.type = 'date';
    currentParam.value = paymentData.duedate ? paymentData.duedate : '';
    currentParam.readValue = function () {
        paymentData.duedate = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function getEditorParamsIsr(paymentData) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    var texts = setTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'creditor';
    currentParam.title = 'Beneficiary';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'accountId';
    currentParam.title = 'Account';
    currentParam.type = 'combobox';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.accountId ? paymentData.accountId : '';
    currentParam.items = loadAccounts();
    currentParam.currentIndexChanged = 'evAccountIdChanged';
    currentParam.readValue = function () {
        paymentData.accountId = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'iban';
    currentParam.title = 'ISR Account';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.iban ? paymentData.iban : '';
    currentParam.readValue = function () {
        paymentData.iban = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'referenceNumber';
    currentParam.title = "ISR Reference Number";
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.referenceNumber ? paymentData.referenceNumber : '';
    currentParam.readValue = function () {
        paymentData.referenceNumber = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'amount';
    currentParam.title = "Amount";
    currentParam.type = 'string';
    currentParam.value = paymentData.amount ? paymentData.amount : '';
    currentParam.readValue = function () {
        paymentData.amount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'currency';
    currentParam.title = "Currency";
    currentParam.type = 'string';
    currentParam.value = paymentData.currency ? paymentData.currency : '';
    currentParam.readValue = function () {
        paymentData.currency = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'duedate';
    currentParam.title = "Due date";
    currentParam.type = 'date';
    currentParam.value = paymentData.duedate ? paymentData.duedate : '';
    currentParam.readValue = function () {
        paymentData.duedate = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function getEditorParamsQrCode(paymentData) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    var texts = setTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'creditor';
    currentParam.title = 'Beneficiary';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'accountId';
    currentParam.title = 'Account';
    currentParam.type = 'combobox';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.accountId ? paymentData.accountId : '';
    currentParam.items = loadAccounts();
    currentParam.currentIndexChanged = 'evAccountIdChanged';
    currentParam.readValue = function () {
        paymentData.accountId = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'name';
    currentParam.title = 'Name';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.name ? paymentData.name : '';
    currentParam.readValue = function () {
        paymentData.name = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'address';
    currentParam.title = 'Address';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.address ? paymentData.address : '';
    currentParam.readValue = function () {
        paymentData.address = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'postalCode';
    currentParam.title = 'Postal code';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.postalCode ? paymentData.postalCode : '';
    currentParam.readValue = function () {
        paymentData.postalCode = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'locality';
    currentParam.title = 'Locality';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.locality ? paymentData.locality : '';
    currentParam.readValue = function () {
        paymentData.locality = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'country';
    currentParam.title = 'Country';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.country ? paymentData.country : '';
    currentParam.readValue = function () {
        paymentData.country = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'iban';
    currentParam.title = 'IBAN';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.iban ? paymentData.iban : '';
    currentParam.readValue = function () {
        paymentData.iban = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'referenceNumber';
    currentParam.title = "QR Reference Number";
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.referenceNumber ? paymentData.referenceNumber : '';
    currentParam.readValue = function () {
        paymentData.referenceNumber = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'bic';
    currentParam.title = 'BIC';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.bic ? paymentData.bic : '';
    currentParam.readValue = function () {
        paymentData.bic = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'additionalInfo';
    currentParam.title = "Additional Information";
    currentParam.type = 'string';
    currentParam.value = paymentData.additionalInfo ? paymentData.additionalInfo : '';
    currentParam.readValue = function () {
        paymentData.additionalInfo = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'amount';
    currentParam.title = "Amount";
    currentParam.type = 'string';
    currentParam.value = paymentData.amount ? paymentData.amount : '';
    currentParam.readValue = function () {
        paymentData.amount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'currency';
    currentParam.title = "Currency";
    currentParam.type = 'string';
    currentParam.value = paymentData.currency ? paymentData.currency : '';
    currentParam.readValue = function () {
        paymentData.currency = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'duedate';
    currentParam.title = "Due date";
    currentParam.type = 'date';
    currentParam.value = paymentData.duedate ? paymentData.duedate : '';
    currentParam.readValue = function () {
        paymentData.duedate = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);

    switch (errorId) {
        case ID_ERR_ELEMENT_EMPTY:
            return "Required field";
        case ID_ERR_PAYMENTMETHOD_NOTSUPPORTED:
            return "The payment method %1 is not supported";
        case ID_ERR_VERSION_NOTSUPPORTED:
            if (lang == 'it')
                return "Lo script non funziona con la versione installata di Banana Contabilità. Aggiornare alla versione più recente.";
            else if (lang == 'de')
                return "Das Skript funktionert mit Ihrer Version von Banana Buchhaltung nicht. Auf neuste Version aktualisieren.";
            else
                return "This script does not run with your version of Banana Accounting. Please update to a more recent version.";
    }
    return '';
}

var ID_PAYMENT_METHOD_IBAN = "IBAN";
var ID_PAYMENT_METHOD_IS = "IS";
var ID_PAYMENT_METHOD_ISR = "ISR";
var ID_PAYMENT_METHOD_QRCODE = "QRCODE";

function getPaymentMethods() {
    var lang = 'en';
    if (Banana.document && Banana.document.locale)
        lang = Banana.document.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    //var texts = setTexts(lang);
    //texts.DescriptionIban

    var jsonArray = [];
    jsonArray.push({ "methodId": ID_PAYMENT_METHOD_ISR, "description": "Orange ESR/BVR payment slip (CHF/EUR)" });
    jsonArray.push({ "methodId": ID_PAYMENT_METHOD_IS, "description": "Red payment slip (CHF/EUR)" });
    jsonArray.push({ "methodId": ID_PAYMENT_METHOD_IBAN, "description":  "Domestic bank payment (all currencies)"});
    jsonArray.push({ "methodId": ID_PAYMENT_METHOD_QRCODE, "description": "QR-Code (CHF/EUR)" });

    return JSON.stringify(jsonArray, null, '   ');
}

function getPaymentMethodSelected(paymentData) {
    //Get payment method: ISR, QR, IBAN, ...
    if (paymentData && paymentData.id && paymentData.id.methodId)
        return paymentData.id.methodId;
    return '';
}

function getScriptVersion() {
    var scriptVersion = "19.0.0";
    return scriptVersion;
}

/*Return all assets and liabilities accounts from table Accounts*/
function loadAccounts() {
    var str = [];
    if (!Banana.document) {
        return str;
    }

    var table = Banana.document.table("Accounts");
    if (!table) {
        return str;
    }

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var accountId = tRow.value('Account');
        var bClass = tRow.value('BClass');
        if (accountId.length > 0 && (bClass == "1" || bClass == "2")) {
            var description = tRow.value('Description');
            str.push(accountId + SEPARATOR_CHAR + description);
        }
    }
    return str;
}

function scanCode(code) {
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

    var paymentData = {};
    paymentData.id = {};
    //paymentData.id.appUri = Banana.script.getParamValue('id');
    if (swissQRCodeData.QRType === "SPC") {
        paymentData.id.methodId = "QRCode";
        paymentData.iban = swissQRCodeData.Account;
        paymentData.name = swissQRCodeData.CRName;
        paymentData.street = swissQRCodeData.CRStreet1;
        paymentData.postalCode = swissQRCodeData.CRPostalCode;
        paymentData.locality = swissQRCodeData.CRCity;
        paymentData.country = swissQRCodeData.CRCountry;
        paymentData.referenceNumber = swissQRCodeData.Reference;
        paymentData.additionalInformation = swissQRCodeData.BillingInformation;
        paymentData.amount = swissQRCodeData.Amount;
        paymentData.currency = swissQRCodeData.Currency;
    }
    else {
        paymentData.id.methodId = ID_PAYMENT_METHOD_ISR;
        paymentData.referenceNumber = code;
    }
    return paymentData;
}

function setTexts(language) {
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

function validateParams(paymentData) {
    var methodId = getPaymentMethodSelected(paymentData);
    if (methodId.length <= 0 || !paymentData.data)
        return paymentData;
    for (var i = 0; i < paymentData.data.length; i++) {
        var key = '';
        var value = '';
        if (paymentData.data[i].name)
            key = paymentData.data[i].name;
        if (paymentData.data[i].value && paymentData.data[i].value.length > 0)
            value = paymentData.data[i].value;
        if (value.length <= 0 && paymentData.data[i].placeholder)
            value = paymentData.data[i].placeholder;
        if (key === 'amount' && value.length <= 0) {
            var msg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
            //msg = msg.replace("%1", 'Amount');
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = msg;
        }
        else if (key === 'currency' && value.length <= 0) {
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
        }
        else if (key === 'iban' && value.length <= 0) {
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
        }
		else if (key === 'accountId' && value.lastIndexOf(SEPARATOR_CHAR)>0) {
			var posStart = value.lastIndexOf(SEPARATOR_CHAR);
			paymentData.data[i].value = value.substr(0, posStart);
		}
        if (methodId == 'ISR') {
            if (key === 'referenceNumber' && value.length <= 0) {
                paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
                paymentData.data[i].errorMsg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
            }
        }
    }
    return paymentData;
}

function validateTransferFile(xml) {
    if (xml.length <= 0)
        return false;
    // Validate against schema (schema is passed as a file path relative to the script)
    var schemaFileName = Banana.IO.getOpenFileName("Select schema file to validate", "pain.001.001.03.ch.02.xsd", "XSD schema file (*.xsd);;All files (*)");
    var file = Banana.IO.getLocalFile(schemaFileName)
    if (file.errorString) {
        Banana.Ui.showInformation("Read error", file.errorString);
        return false;
    }
    var fileContent = file.read();
    if (fileContent.length <= 0) {
        return false;
    }

    if (!Banana.Xml.validate(Banana.Xml.parse(xml), schemaFileName)) {
        //Test.logger.addText("Validation result => Xml document is not valid against " + schemaFileName + Banana.Xml.errorString);
        Banana.console.debug("Validation result => Xml document is not valid against " + schemaFileName + Banana.Xml.errorString);
        return false;
    }
    return true;
}

/*
* interface TransferFileInterface
    * function __construct(GroupHeader groupHeader);
    * function addPaymentInformation(PaymentInformation paymentInformation);
    * function getGroupHeader();
    * function validate();
}*/
function CustomerCreditTransferFile(groupHeader) {
    /**
         * @var GroupHeader
         */
    this.groupHeader = groupHeader;

    /**
     * @var array<PaymentInformation>
     */
    this.paymentInformations = [];
}

/**
     * @param DomBuilderInterface domBuilder
     */
CustomerCreditTransferFile.prototype.accept = function (domBuilder) {
    this.validate();
    domBuilder.visitTransferFile(this);
    this.groupHeader.accept(domBuilder);
    /** @var $paymentInformation PaymentInformation */
    for (i = 0; i < this.paymentInformations.length; ++i) {
        this.paymentInformations[i].accept(domBuilder);
    }
}

/**
     * @param PaymentInformation paymentInformation
     */
CustomerCreditTransferFile.prototype.addPaymentInformation = function (paymentInformation) {
    paymentInformation.setValidPaymentMethods(['TRF']);
    paymentInformation.setPaymentMethod('TRF');

    var numberOfTransactions = this.getGroupHeader().getNumberOfTransactions(
    ) + paymentInformation.getNumberOfTransactions();
    var transactionTotal = Banana.SDecimal.add(this.groupHeader.getControlSumCents(), paymentInformation.getControlSumCents());
    this.groupHeader.setNumberOfTransactions(numberOfTransactions);
    this.groupHeader.setControlSumCents(transactionTotal);
    this.paymentInformations.push(paymentInformation);
}

/**
     * @return GroupHeader
     */
CustomerCreditTransferFile.prototype.getGroupHeader = function () {
    return this.groupHeader;
}


/**
    * validate the transferfile
    *
    * @throws InvalidTransferTypeException
    */
CustomerCreditTransferFile.prototype.validate = function () {
    if (this.paymentInformations.length === 0) {
        throw 'No paymentinformations available, add paymentInformation via addPaymentInformation()';
    }
    /** @var payment PaymentInformation */
    for (i = 0; i < this.paymentInformations.length; ++i) {
        var transfers = this.paymentInformations[i].getTransfers();
        if (transfers.length === 0) {
            throw 'PaymentInformation must at least contain one payment';
        }
    }
}

/*
* interface TransferInformationInterface
    * function getCreditorName();
    * function getCreditorReferenceType();
    * function getEndToEndIdentification();
    * function getInstructionId();
    * function getTransferAmount();
}*/
function CustomerCreditTransferInformation(id, name, amount) {

    /**
     * Financial Institution Identifier;
     *
     * @var string
     */
    this.bic = '';

    /**
     * @var string
     */
    this.country = '';

    /**
     * Structured creditor reference type.
     *
     * @var string
     */
    this.creditorReferenceType = '';

    /**
     * Structured creditor reference.
     *
     * @var string
     */
    this.creditorReference = '';

    /**
     * @var string
     */
    this.currency = '';

    /**
     * @var string
     */
    this.EndToEndIdentification = id;

    /**
	  * Account Identifier
      *
      * @var string
      */
    this.iban;

    /**
     * @var string
     */
    this.instructionId = '';

    /**
     * @var string Local service instrument code.
     */
    this.localInstrumentCode = '';

    /**
     * @var string Local service instrument proprietary.
     */
    this.localInstrumentProprietary = '';

    /**
     * @var string
     */
    this.name = name;

    /**
     * @var string|array
     */
    this.postalAddress = '';

    /**
     * Purpose of this transaction
     *
     * @var string
     */
    this.remittanceInformation = '';

    /**
      * Must be between 0.01 and 999999999.99
      *
      * @var string
      */
    this.transferAmount = amount;

}

/**
 * @param DomBuilderInterface $domBuilder
 */
CustomerCreditTransferInformation.prototype.accept = function (domBuilder) {
    domBuilder.visitTransferInformation(this);
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getBic = function () {
    if (!this.bic)
        return '';
    return this.bic;
}

/**
 * @param string bic
 */
CustomerCreditTransferInformation.prototype.setBic = function (bic) {
    this.bic = bic;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getCountry = function () {
    if (!this.country)
        return '';
    return this.country;
}

/**
 * @param string country
 */
CustomerCreditTransferInformation.prototype.setCountry = function (country) {
    this.country = country;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getCreditorName = function () {
    if (!this.name)
        return '';
    return this.name;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getCreditorReference = function () {
    if (!this.creditorReference)
        return '';
    return this.creditorReference;
}

/**
 * @param string creditorReference
 */
CustomerCreditTransferInformation.prototype.setCreditorReference = function (creditorReference) {
    this.creditorReference = creditorReference;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getCreditorReferenceType = function () {
    if (!this.creditorReferenceType)
        return '';
    return this.creditorReferenceType;
}

/**
 * @param string creditorReferenceType
 */
CustomerCreditTransferInformation.prototype.setCreditorReferenceType = function (creditorReferenceType) {
    this.creditorReferenceType = creditorReferenceType;
}

/**
 * @return mixed
 */
CustomerCreditTransferInformation.prototype.getCurrency = function () {
    if (!this.currency)
        return '';
    return this.currency;
}

/**
 * @param mixed currency
 */
CustomerCreditTransferInformation.prototype.setCurrency = function (currency) {
    this.currency = currency;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getEndToEndIdentification = function () {
    if (!this.EndToEndIdentification)
        return '';
    return this.EndToEndIdentification;
}

/**
 * @param string EndToEndIdentification
 */
CustomerCreditTransferInformation.prototype.setEndToEndIdentification = function (EndToEndIdentification) {
    this.EndToEndIdentification = EndToEndIdentification;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getIban = function () {
    if (!this.iban)
        return '';
    return this.iban;
}

/**
 * @param string IBAN
 */
CustomerCreditTransferInformation.prototype.setIban = function (iban) {
    this.iban = iban;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getInstructionId = function () {
    if (!this.instructionId)
        return '';
    return this.instructionId;
}

/**
 * @param string instructionId
 */
CustomerCreditTransferInformation.prototype.setInstructionId = function (instructionId) {
    this.instructionId = instructionId;
}

/**
 * @return string localInstrumentProprietary
 */
CustomerCreditTransferInformation.prototype.getLocalInstrumentProprietary = function () {
    if (!this.localInstrumentProprietary)
        return '';
    return this.localInstrumentProprietary;
}

/**
 * @param string localInstrumentProprietary
 */
CustomerCreditTransferInformation.prototype.setLocalInstrumentProprietary = function (localInstrumentProprietary) {
    localInstrumentProprietary = localInstrumentProprietary.toUpperCase();
    if (!_inArray(localInstrumentProprietary, ['CH01', 'CH02', 'CH03'])) {
        throw new InvalidArgumentException("Invalid Local Instrument Proprietary");
    }
    this.localInstrumentProprietary = localInstrumentProprietary;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getLocalInstrumentCode = function () {
    if (!this.localInstrumentCode)
        return '';
    return this.localInstrumentCode;
}

/**
 * @param string localInstrumentCode
 * @throws InvalidArgumentException
 */
CustomerCreditTransferInformation.prototype.setLocalInstrumentCode = function (localInstrumentCode) {
    localInstrumentCode = localInstrumentCode.toUpperCase();
    if (!_inArray(localInstrumentCode, ['B2B', 'CORE', 'COR1'])) {
        throw new InvalidArgumentException("Invalid Local Instrument Code: localInstrumentCode");
    }
    this.localInstrumentCode = localInstrumentCode;
}

/**
 * @return array|string
 */
CustomerCreditTransferInformation.prototype.getPostalAddress = function () {
    if (!this.postalAddress)
        return '';
    return this.postalAddress;
}

/**
 * @param array|string postalAddress
 */
CustomerCreditTransferInformation.prototype.setPostalAddress = function (postalAddress) {
    this.postalAddress = postalAddress;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getRemittanceInformation = function () {
    if (!this.remittanceInformation)
        return '';
    return this.remittanceInformation;
}

/**
 * @param string remittanceInformation
 */
CustomerCreditTransferInformation.prototype.setRemittanceInformation = function (remittanceInformation) {
    this.remittanceInformation = remittanceInformation;
}

/**
     * @return mixed
     */
CustomerCreditTransferInformation.prototype.getTransferAmount = function () {
    if (!this.transferAmount)
        return '';
    return this.transferAmount;
}

function DomBuilder(painFormat, withSchemaLocation) {

    /**
     * @var \DOMElement
     */
    this.currentTransfer = null;

    /**
     * @var \DOMELement
     */
    this.currentPayment = null;

    /**
     * @var string
     */
    this.painFormat = '';

    /**
     * @var \DOMDocument
     */
    this.painFormat = painFormat;
    this.doc = Banana.Xml.newDocument('');
    this.root = this.doc.addElement('Document');
    this.root.setAttribute('xmlns', 'http://www.six-interbank-clearing.com/de/%1.xsd'.arg(this.painFormat));
    this.root.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    if (withSchemaLocation) {
        this.root.setAttribute('xsi:schemaLocation', 'http://www.six-interbank-clearing.com/de/%1.xsd %2.xsd'.arg(this.painFormat).arg(this.painFormat));
    }
}

/**
 * Appends an address node to the passed dom element containing country and unstructured address lines.
 * Does nothing if no address exists in transactionInformation.
 *
 * @param \DOMElement $creditor
 * @param CustomerCreditTransferInformation $transactionInformation
 */
DomBuilder.prototype.appendAddressToDomElement = function (creditor, transactionInformation) {
    if (transactionInformation.getCountry().length < 0 && transactionInformation.getPostalAddress().length < 0) {
        return; // No address exists, nothing to do.
    }

    var postalAddress = creditor.addElement('PstlAdr');

    // Generate country address node.
    if (transactionInformation.getCountry().length > 0) {
        var node = postalAddress.addElement('Ctry');
        node.addTextElement(transactionInformation.getCountry());
    }

    // Ensure postalAddressData is an array as getPostalAddress() returns either string or string[].
    var postalAddressData = transactionInformation.getPostalAddress();
    if (!Array.isArray(postalAddressData)) {
        postalAddressData = Array.from(postalAddressData);
    }

    // Generate nodes for each address line.
    for (i = 0; i < postalAddressData.length; ++i) {
        var node = postalAddress.addElement('AdrLine');
        node.addTextElement(postalAddressData[i]);
    }
}

/**
     * Append FinInstnId element used in debtorAgent elements.
	 *
     * @param \DOMElement
     * @param string bic
     * @return \DOMElement
     */
DomBuilder.prototype.appendFinancialInstitutionElement = function (debtorAgent, bic) {
    var finInstitution = debtorAgent.addElement('FinInstnId');
    var node = finInstitution.addElement('BIC');
    node.addTextNode(bic);
    return finInstitution;
}

/**
     * Append Id element used in Group header and Debtor elements.
     *
     * @param  \DOMElement $debtor
     * @param  string      $id         Unique and unambiguous identification of a party. Length 1-35
     * @return \DOMElement
     */
DomBuilder.prototype.appendOrganizationIdentificationElement = function (debtor, id) {
    var uId = debtor.addElement('Id');
    var orgId = uId.addElement('OrgId');
    var othr = orgId.addElement('Othr');
    var othrId = othr.addElement('Id');
    othrId.addTextNode(id);

    return uId;
}

/**
     * Append remittance element with un-structured message.
     *
     * @param  \DOMElement node
     * @param string message
     * @return \DOMElement
     */
DomBuilder.prototype.appendRemittanceElement = function (node, message) {
    var remittanceInformation = node.addElement('RmtInf');
    var ustrd = remittanceInformation.addElement('Ustrd');
    ustrd.addTextNode(message);
    return remittanceInformation;
}

/**
     * Append remittance element with structured creditor reference.
     *
     * @param  \DOMElement node
     * @param TransferInformationInterface $transactionInformation
     * @return \DOMElement
     */
DomBuilder.prototype.appendStructuredRemittanceElement = function (node, transactionInformation) {
    var creditorReference = transactionInformation.getCreditorReference();
    var remittanceInformation = node.addElement('RmtInf');

    var structured = remittanceInformation.addElement('Strd');
    var creditorReferenceInformation = structured.addElement('CdtrRefInf');

    /*var tp = creditorReferenceInformation.addElement('Tp');
    if (transactionInformation.getCreditorReferenceType().length > 0) {
        var issuer = tp.addElement('Issr');
        issuer.addTextNode(transactionInformation.getCreditorReferenceType());
    }*/

    var reference = creditorReferenceInformation.addElement('Ref');
    reference.addTextNode(creditorReference);

    return remittanceInformation;
}

DomBuilder.prototype.asXml = function () {
    var indent = true;
    return Banana.Xml.save(this.doc, indent);
}

DomBuilder.prototype.save = function (inData) {
    var fileName = "PAIN001_<Date>.xml";

    //var fileName = "PAIN001_<AccountingName>_<Date>.xml";
    /*if (Banana.document && Banana.document.info) {
        var accountingFileName = Banana.document.info("Base", "FileName");
        if (accountingFileName.length > 0) {
            var posStart=0;
			if (accountingFileName.lastIndexOf("/")>0 && accountingFileName.lastIndexOf("/")<accountingFileName.length)
				posStart = accountingFileName.lastIndexOf("/");
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
            Banana.IO.openUrl(fileName);
        }
        return true;
    }
    return false;
}

/**
 * Add GroupHeader Information to the document
 *
 * @param GroupHeader $groupHeader
 * @return mixed
 */
DomBuilder.prototype.visitGroupHeader = function (groupHeader) {
    var groupHeaderNode = this.currentTransfer.addElement('GrpHdr');
    var node = groupHeaderNode.addElement('MsgId');
    node.addTextNode(groupHeader.getMessageIdentification());
    node = groupHeaderNode.addElement('CreDtTm');
    node.addTextNode(_formatDateTime(groupHeader.getCreationDateTime()));
    node = groupHeaderNode.addElement('NbOfTxs');
    node.addTextNode(groupHeader.getNumberOfTransactions());
    node = groupHeaderNode.addElement('CtrlSum');
    node.addTextNode(_formatCurrency(groupHeader.getControlSumCents()));
    var initiatingParty = groupHeaderNode.addElement('InitgPty');
    node = initiatingParty.addElement('Nm');
    node.addTextNode(groupHeader.getInitiatingPartyName());
    if (groupHeader.getInitiatingPartyId().length > 0) {
        if (this.painFormat === 'pain.001.001.03') {
            this.appendOrganizationIdentificationElement(initiatingParty, groupHeader.getInitiatingPartyId());
        }
        else {
            node = initiatingParty.addElement('Id');
            node.addTextNode(groupHeader.getInitiatingPartyId());
        }
    }
    var contactDetails = initiatingParty.addElement('CtctDtls');
    node = contactDetails.addElement('Nm');
    node.addTextNode(groupHeader.getSoftwareName());
    node = contactDetails.addElement('Othr');
    node.addTextNode(groupHeader.getSoftwareVersion());
}

/**
 * Crawl PaymentInformation containing the Transactions
 *
 * @param PaymentInformation $paymentInformation
 * @return mixed
 */
DomBuilder.prototype.visitPaymentInformation = function (paymentInformation) {
    this.currentPayment = this.currentTransfer.addElement('PmtInf');
    var node = this.currentPayment.addElement('PmtInfId');
    node.addTextNode(paymentInformation.getId());
    node = this.currentPayment.addElement('PmtMtd');
    node.addTextNode(paymentInformation.getPaymentMethod());
    node = this.currentPayment.addElement('BtchBookg');
    if (parseInt(paymentInformation.getBatchBooking()) <= 0)
        node.addTextNode('false');
    else
        node.addTextNode('true');
    node = this.currentPayment.addElement('NbOfTxs');
    node.addTextNode(paymentInformation.getNumberOfTransactions());
    node = this.currentPayment.addElement('CtrlSum');
    node.addTextNode(_formatCurrency(paymentInformation.getControlSumCents()));

    node = this.currentPayment.addElement('ReqdExctnDt');
    node.addTextNode(_formatDate(paymentInformation.getDueDate()));

    var debtor = this.currentPayment.addElement('Dbtr');
    node = debtor.addElement('Nm');
    node.addTextNode(paymentInformation.getOriginName());

    if (paymentInformation.getOriginBankPartyIdentification().length > 0 && this.painFormat === 'pain.001.001.03') {
        this.appendOrganizationIdentificationElement(debtor, paymentInformation.getOriginBankPartyIdentification());
    }

    var debtorAccount = this.currentPayment.addElement('DbtrAcct');
    node = debtorAccount.addElement('Id');
    node = node.addElement('IBAN');
    node.addTextNode(paymentInformation.getOriginAccountIBAN());

    /*if (paymentInformation.getOriginAccountCurrency().length > 0) {
        node = debtorAccount.addElement('Ccy');
        node.addTextNode(paymentInformation.getOriginAccountCurrency());
    }*/

    if (paymentInformation.getOriginAgentBIC().length > 0) {
        var debtorAgent = this.currentPayment.addElement('DbtrAgt');
        this.appendFinancialInstitutionElement(debtorAgent, paymentInformation.getOriginAgentBIC());
    }
}

/**
     * Build the root of the document
     *
     * @param TransferFileInterface $transferFile
     * @return mixed
     */
DomBuilder.prototype.visitTransferFile = function (transferFile) {
    this.currentTransfer = this.root.addElement('CstmrCdtTrfInitn');
}

/**
 * Crawl Transactions
 *
 * @param TransferInformationInterface $transactionInformation
 * @return mixed
 */
DomBuilder.prototype.visitTransferInformation = function (transactionInformation) {

    /** @var $transactionInformation  CustomerCreditTransferInformation */
    var cdtTrfTxInf = this.currentPayment.addElement('CdtTrfTxInf');

    // PmtId
    var pmtId = cdtTrfTxInf.addElement('PmtId');
    if (transactionInformation.getInstructionId().length) {
        var node = pmtId.addElement('InstrId');
        node.addTextNode(transactionInformation.getInstructionId());
    }
    var node = pmtId.addElement('EndToEndId');
    node.addTextNode(transactionInformation.getEndToEndIdentification());

    // Payment Type Information
    var paymentTypeInformation = cdtTrfTxInf.addElement('PmtTpInf');
    if (transactionInformation.getLocalInstrumentCode().length > 0) {
        node = paymentTypeInformation.addElement('LclInstrm');
        node = node.addElement('Cd');
        node.addTextNode(transactionInformation.getLocalInstrumentCode());
    }
    else if (transactionInformation.getLocalInstrumentProprietary().length > 0) {
        node = paymentTypeInformation.addElement('LclInstrm');
        node = node.addElement('Prtry');
        node.addTextNode(transactionInformation.getLocalInstrumentProprietary());
    }

    // Amount
    var amount = cdtTrfTxInf.addElement('Amt');
    var instructedAmount = amount.addElement('InstdAmt');
    instructedAmount.addTextNode(_formatCurrency(transactionInformation.getTransferAmount()));
    instructedAmount.setAttribute('Ccy', transactionInformation.getCurrency());

    //Creditor Agent 2.77
    if (transactionInformation.getBic().length > 0) {
        var creditorAgent = cdtTrfTxInf.addElement('CdtrAgt');
        var financialInstitution = creditorAgent.addElement('FinInstnId');
        var bic = financialInstitution.addElement('BIC');
        bic.addTextNode(transactionInformation.getBic());
    }

    // Creditor 2.79
    var creditor = cdtTrfTxInf.addElement('Cdtr');
    node = creditor.addElement('Nm');
    node.addTextNode(transactionInformation.getCreditorName());

    // Creditor address if needed and supported by schema.
    if (_inArray(this.painFormat, ['pain.001.001.03'])) {
        this.appendAddressToDomElement(creditor, transactionInformation);
    }

    // CreditorAccount 2.80
    var creditorAccount = cdtTrfTxInf.addElement('CdtrAcct');
    var id = creditorAccount.addElement('Id');
    var iban = transactionInformation.getIban();
    var validIban = iban.match(/^[a-zA-Z]{2}.+$/);
    if (validIban) {
        var node = id.addElement('IBAN');
        node.addTextNode(iban);
    }
    else {
        var other = id.addElement('Othr');
        var node = other.addElement('Id');
        node.addTextNode(iban);
    }

    // remittance 2.98 2.99
    if (transactionInformation.getCreditorReference().length > 0) {
        this.appendStructuredRemittanceElement(cdtTrfTxInf, transactionInformation);
    } else if (transactionInformation.getRemittanceInformation().length > 0) {
        this.appendRemittanceElement(cdtTrfTxInf, transactionInformation.getRemittanceInformation());
    }
}


/**
 * @param string messageIdentification Maximum length: 35. Reference Number of the bulk.
 *                                      Part of the duplication check (unique daily reference).
 *                                      The first 8 or 11 characters of <Msgld> must match the BIC of the
 *                                      Instructing Agent. The rest of the field can be freely defined.
 * @param boolean isTest
 */
function GroupHeader(messageIdentification, isTest) {
    /**
     * Whether this is a test Transaction
     * @var boolean
     */
    this.isTest = false;
    if (isTest)
        this.isTest = true;

    /**
     * @var string Unambiguously identify the message.
     */
    this.messageIdentification = messageIdentification;

    /**
     * The initiating Party for this payment
     *
     * @var string
     */
    this.initiatingPartyId = '';

    /**
     * @var int
     */
    this.numberOfTransactions = 0;

    /**
     * @var int
     */
    this.controlSumCents = 0;

    /**
     * @var string
     */
    this.initiatingPartyName = '';

    /**
     * @var string
     */
    this.softwareName = '';

    /**
     * @var string
     */
    this.softwareVersion = '';

    /**
     * @var \DateTime
     */
    this.creationDateTime = new Date();

}

/**
     * @param DomBuilderInterface domBuilder
     */
GroupHeader.prototype.accept = function (domBuilder) {
    domBuilder.visitGroupHeader(this);
}

GroupHeader.prototype.getControlSumCents = function () {
    return this.controlSumCents;
}

GroupHeader.prototype.setControlSumCents = function (controlSumCents) {
    this.controlSumCents = controlSumCents;
}


/**
* @return \DateTime
 */
GroupHeader.prototype.getCreationDateTime = function () {
    return this.creationDateTime;
}

/**
 * @return string
 */
GroupHeader.prototype.getInitiatingPartyId = function () {
    if (!this.initiatingPartyId)
        return '';
    return this.initiatingPartyId;
}

/**
 * @param string initiatingPartyId
 */
GroupHeader.prototype.setInitiatingPartyId = function (initiatingPartyId) {
    this.initiatingPartyId = initiatingPartyId;
}

/**
 * @return string
 */
GroupHeader.prototype.getInitiatingPartyName = function () {
    if (!this.initiatingPartyName)
        return '';
    return this.initiatingPartyName;
}

/**
 * @param string initiatingPartyName
 */
GroupHeader.prototype.setInitiatingPartyName = function (initiatingPartyName) {
    this.initiatingPartyName = initiatingPartyName;
}

/**
 * @return boolean
 */
GroupHeader.prototype.getIsTest = function () {
    return this.isTest;
}

/**
 * @param boolean isTest
 */
GroupHeader.prototype.setIsTest = function (isTest) {
    this.isTest = isTest;
}

/**
 * @return string
 */
GroupHeader.prototype.getMessageIdentification = function () {
    if (!this.messageIdentification)
        this.messageIdentification = '';
    return this.messageIdentification;
}

/**
 * @param string messageIdentification
 */
GroupHeader.prototype.setMessageIdentification = function (messageIdentification) {
    this.messageIdentification = messageIdentification;
}

/**
 * @return int
 */
GroupHeader.prototype.getNumberOfTransactions = function () {
    return this.numberOfTransactions;
}

/**
  * @param int numberOfTransactions
  */
GroupHeader.prototype.setNumberOfTransactions = function (numberOfTransactions) {
    this.numberOfTransactions = numberOfTransactions;
}

/**
 * @return string
 */
GroupHeader.prototype.getSoftwareName = function () {
    if (!this.softwareName)
        return '';
    return this.softwareName;
}

/**
 * @param string softwareName
 */
GroupHeader.prototype.setSoftwareName = function (softwareName) {
    this.softwareName = softwareName;
}

/**
 * @return string
 */
GroupHeader.prototype.getSoftwareVersion = function () {
    if (!this.softwareVersion)
        return '';
    return this.softwareVersion;
}

/**
 * @param string softwareVersion
 */
GroupHeader.prototype.setSoftwareVersion = function (softwareVersion) {
    this.softwareVersion = softwareVersion;
}

/**
  * @param string id
  * @param string originAccountIBAN This is your IBAN
  * @param string originAgentBIC This is your BIC
  * @param string originName This is your Name
  * @param string originAccountCurrency
  */
function PaymentInformation(id, originAccountIBAN, originAgentBIC, originName, originAccountCurrency) {
    /**
      * The first drawn from several recurring debits
      */
    const S_FIRST = 'FRST';

    /**
     * A recurring direct debit in a number of direct debits
     */
    const S_RECURRING = 'RCUR';

    /**
     * A one time non-recurring debit
     */
    const S_ONEOFF = 'OOFF';

    /**
     * The last direct debit in a series of recurring debits
     */
    const S_FINAL = 'FNAL';

    /**
     * @var string Unambiguously identify the payment.
     */
    this.id = id;

    /**
     * @var string Debtor's name.
     */
    this.originName = originName;

    /**
     * Unique identification of an organisation, as assigned by an institution, using an identification scheme.
     * @var string
     */
    this.originBankPartyIdentification = '';

    /**
     * Name of the identification scheme, in a coded form as published in an external list. 1-4 characters.
     * @var string
     */
    this.originBankPartyIdentificationScheme = '';

    /**
     * @var string Debtor's account IBAN.
     */
    this.originAccountIBAN = originAccountIBAN;

    /**
     * @var string Debtor's account bank BIC code.
     */
    this.originAgentBIC = originAgentBIC;

    /**
     * @var string Debtor's account ISO currency code.
     */
    this.originAccountCurrency = originAccountCurrency;

    /**
     * @var string Payment method.
     */
    this.paymentMethod = '';

    /**
     * Date of payment execution
     *
     * @var \DateTime
     */
    this.dueDate = new Date();

    /**
     * @var integer
     */
    this.controlSumCents = 0;

    /**
     * @var integer Number of payment transactions.
     */
    this.numberOfTransactions = 0;

    /**
     * @var array<TransferInformationInterface>
     */
    this.transfers = [];

    /**
     * Valid Payment Methods set by the TransferFile
     *
     * @var
     */
    this.validPaymentMethods;

    /**
     * @var string
     */
    this.creditorId = '';

    /**
     * @var
     */
    this.sequenceType;

    /**
     * Should the bank book multiple transaction as a batch
     *
     * @var int
     */
    this.batchBooking = 0;

    /**
     * @var \DateTime
     */
    this.mandateSignDate = new Date();

}

/**
     * The domBuilder accept this Object
     *
     * @param DomBuilderInterface $domBuilder
     */
PaymentInformation.prototype.accept = function (domBuilder) {
    domBuilder.visitPaymentInformation(this);
    /** @var $transfer TransferInformationInterface */
    for (i = 0; i < this.transfers.length; ++i) {
        this.transfers[i].accept(domBuilder);
    }
}

/**
     * @param TransferInformationInterface transfer
     */
PaymentInformation.prototype.addTransfer = function (transfer) {
    this.transfers.push(transfer);
    this.numberOfTransactions++;
    this.controlSumCents = Banana.SDecimal.add(this.controlSumCents, transfer.getTransferAmount());
}

/**
 * @return array
 */
PaymentInformation.prototype.getTransfers = function () {
    return this.transfers;
}

/**
 * @return int|null
 */
PaymentInformation.prototype.getBatchBooking = function () {
    return this.batchBooking;
}

/**
 * @param boolean batchBooking
 */

PaymentInformation.prototype.setBatchBooking = function (batchBooking) {
    this.batchBooking = batchBooking;
}

/**
 * @return int
 */
PaymentInformation.prototype.getControlSumCents = function () {
    return this.controlSumCents;
}

/**
 * @return string
 */
PaymentInformation.prototype.getCreditorId = function () {
    if (!this.creditorId)
        return '';
    return this.creditorId;
}
/**
 * @param string creditorSchemeId
 */
PaymentInformation.prototype.setCreditorId = function (creditorSchemeId) {
    this.creditorId = creditorSchemeId;
}

/**
 * @return string
 */
PaymentInformation.prototype.getDueDate = function () {
    return this.dueDate;
}

/**
 * @param \DateTime dueDate
 */
PaymentInformation.prototype.setDueDate = function (dueDate) {
    this.dueDate = Banana.Converter.stringToDate(dueDate, "YYYY-MM-DD");
}

/**
 * @return string
 */
PaymentInformation.prototype.getId = function () {
    if (!this.id)
        return '';
    return this.id;
}

/**
 * @param string id
 */
PaymentInformation.prototype.setId = function (id) {
    this.id = id;
}

/**
 * @return \DateTime
 */
PaymentInformation.prototype.getMandateSignDate = function () {
    return this.mandateSignDate;
}

/**
 * @param \DateTime mandateSignDate
 */
PaymentInformation.prototype.setMandateSignDate = function (mandateSignDate) {
    this.mandateSignDate = mandateSignDate;
}

/**
 * @return int
 */
PaymentInformation.prototype.getNumberOfTransactions = function () {
    return this.numberOfTransactions;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginAccountCurrency = function () {
    if (!this.originAccountCurrency)
        return '';
    return this.originAccountCurrency;
}

/**
 * @param string originAccountCurrency
 */
PaymentInformation.prototype.setOriginAccountCurrency = function (originAccountCurrency) {
    this.originAccountCurrency = originAccountCurrency;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginAccountIBAN = function () {
    if (!this.originAccountIBAN)
        return '';
    return this.originAccountIBAN;
}

/**
 * @param string originAccountIBAN
 */
PaymentInformation.prototype.setOriginAccountIBAN = function (originAccountIBAN) {
    this.originAccountIBAN = originAccountIBAN;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginAgentBIC = function () {
    if (!this.originAgentBIC)
        return '';
    return this.originAgentBIC;
}

/**
 * @param string originAgentBIC
 */
PaymentInformation.prototype.setOriginAgentBIC = function (originAgentBIC) {
    this.originAgentBIC = originAgentBIC;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginBankPartyIdentification = function () {
    if (!this.originBankPartyIdentification)
        return '';
    return this.originBankPartyIdentification;
}

/**
 * @param string id
 */
PaymentInformation.prototype.setOriginBankPartyIdentification = function (id) {
    this.originBankPartyIdentification = id;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginBankPartyIdentificationScheme = function () {
    if (!this.originBankPartyIdentificationScheme)
        return '';
    return this.originBankPartyIdentificationScheme;
}

/**
 * @param string id
 */
PaymentInformation.prototype.setOriginBankPartyIdentificationScheme = function (scheme) {
    this.originBankPartyIdentificationScheme = scheme;
}

/**
 * @return string
 */
PaymentInformation.prototype.getOriginName = function () {
    if (!this.originName)
        this.originName = '';
    return this.originName;
}

/**
 * @param string originName
 */
PaymentInformation.prototype.setOriginName = function (originName) {
    this.originName = originName;
}

/**
 * @return string
 */
PaymentInformation.prototype.getPaymentMethod = function () {
    if (!this.paymentMethod)
        return '';
    return this.paymentMethod;
}

/**
 * Set the payment method.
 * @param string method
 * @throws InvalidArgumentException
 */
PaymentInformation.prototype.setPaymentMethod = function (method) {
    method = method.toUpperCase();
    if (!_inArray(method, this.validPaymentMethods)) {
        throw new InvalidArgumentException("Invalid Payment Method: method, must be one of ".implode(
            ',',
            this.validPaymentMethods
        ));
    }
    this.paymentMethod = method;
}

/**
 * @return mixed
 */
PaymentInformation.prototype.getSequenceType = function () {
    if (!this.sequenceType)
        return '';
    return this.sequenceType;
}

/**
 * @param mixed sequenceType
 */
PaymentInformation.prototype.setSequenceType = function (sequenceType) {
    this.sequenceType = sequenceType;
}

/**
 * @param mixed validPaymentMethods
 */
PaymentInformation.prototype.setValidPaymentMethods = function (validPaymentMethods) {
    this.validPaymentMethods = validPaymentMethods;
}

function _arrayCompare(a1, a2) {
    if (a1.length != a2.length) return false;
    var length = a2.length;
    for (var i = 0; i < length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}

/**
     * Format a number as a monetary value.
     */
function _formatCurrency(amount, convZero) {
    if (convZero === undefined)
        convZero = true;

    if (!amount)
        amount = 0;

    amount = Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
    return Banana.Converter.toInternalNumberFormat(amount);
}

/**
     * Format a date to ISO format without milliseconds.
     */
function _formatDate(date) {
    var dateFormatted = date.toISOString();
    if (dateFormatted.indexOf("T") > 0)
        return dateFormatted.split('T')[0];
    return "";
}

/**
     * Format a datetime to ISO format without milliseconds.
     */
function _formatDateTime(date) {
    var dateFormatted = date.toISOString();
    if (dateFormatted.indexOf(".") > 0)
        return dateFormatted.split('.')[0];
    return "";
}

/**
     * Format a time to hh:mm:ss
     */
function _formatTime(time) {
    var timeFormatted = time.toISOString();
    if (timeFormatted.indexOf("T") > 0)
        timeFormatted = timeFormatted.split('T')[1];
    if (timeFormatted.length > 8)
        timeFormatted = timeFormatted.substr(0, 8);
    return timeFormatted;
}

function _inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (typeof haystack[i] == 'object') {
            if (arrayCompare(haystack[i], needle)) return true;
        } else {
            if (haystack[i] == needle) return true;
        }
    }
    return false;
}

//  Checks that string starts with the specific string
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

//  Checks that string ends with the specific string...
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}
