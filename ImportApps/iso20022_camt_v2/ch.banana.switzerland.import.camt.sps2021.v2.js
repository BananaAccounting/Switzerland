// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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

/**
 * Define the reader for Iso 20022 camt messages
 * version SPS 2021 (valid until November 2025)
 */
var ISO20022CamtFile = class ISO20022CamtFile {
    constructor() {
        this.document = null;
        this.lang = 'en';
        this.params = this.defaultParameters();
        if (Banana.document) {
            var savedParam = Banana.document.getScriptSettings();
            if (savedParam.length > 0) {
                try {
                    this.params = JSON.parse(savedParam);
                } catch(err) {
                    Banana.console.log(err.toString());
                }
            }
            else {
                //import params from ch.banana.switzerland.import.camt (old version)
                var importedParams = this.importScriptSettings();
                if (importedParams)
                    this.params = importedParams;
            }
        }
    }

    defaultParameters() {
        var params = {};

        /** If add_counterpart_transaction is set to true, in case of composed transactions a couterpart transaction
     is inserted in the list of the transactions. If set to false only the details transactions are added. */
        params.add_counterpart_transaction = true;

        params.invoice_no = {};
        params.invoice_no.extract = true;
        params.invoice_no.banana_format = true;
        params.invoice_no.start = '0';
        params.invoice_no.count = '-1';
        params.invoice_no.method = '';

        params.customer_no = {};
        params.customer_no.extract = false;
        params.customer_no.banana_format = true;
        params.customer_no.start = '0';
        params.customer_no.count = '-1';
        params.customer_no.use_cc = '';
        params.customer_no.method = '';
        params.customer_no.keep_initial_zeros = false;

        return params;
    }

    importScriptSettings_extract(rowObj,rowNr,table) {
        var key1 = 'PREFERITI';
        var key2 = 'Apps';
        var key3 = 'ch.banana.switzerland.import.camt';
        if (rowObj)
            return rowObj.value('Key1')=== key1 && rowObj.value('Key2')=== key2 && rowObj.value('Key3')=== key3;
        return null;
    }

    importScriptSettings() {
        if (!Banana.document)
            return null;

        var sysKeyTable = Banana.document.table('Syskey');
        if (!sysKeyTable)
            return null;

        var rows = sysKeyTable.findRows(this.importScriptSettings_extract);
        if (!rows || rows.length <=0)
            return null;

        var importedParams = rows[0].value('Value');
        if (importedParams.length<=0)
            return null;

        importedParams = JSON.parse(importedParams);

        if (importedParams) {
            var params = this.defaultParameters();
            for (var key in params) {
                if (params.hasOwnProperty(key) && importedParams.hasOwnProperty(key)) {
                    if (typeof (params[key]) === 'object') {
                        for (var key2 in params[key]) {
                            if (importedParams[key][key2]) {
                                params[key][key2] = importedParams[key][key2];
                            }
                        }
                    }
                    else {
                        params.key = importedParams.key;
                    }
                }
            }
            return params;
        }
        return null;
    }

    setDocument(xml) {
        if (typeof xml === 'string')
        this.document = Banana.Xml.parse(xml);
        else
        this.document = xml;
    }

    setParams(params) {
        this.params = params;
    }

    readTransactions() {
        if (!this.document)
        return [];

        var transactions = [];
        var statementsNode = this.getStatementNodes();
        for (var i = 0; i < statementsNode.length; i++) {
            transactions = transactions.concat(this.readStatementEntries(statementsNode[i]));
        }
        return transactions;
    }

    getAccountsSummary() {
        if (!this.document)
        return [];

        var accountsSummary = {};
        var statementsNode = this.getStatementNodes();
        for (var i = 0; i < statementsNode.length; i++) {
            var statementNode = statementsNode[i];
            var iban = this.getStatementIBAN(statementNode)
            var accountSummary = accountsSummary[iban];
            if (!accountSummary) {
                accountSummary = {
                    'iban' : iban,
                    'currency' : this.getStatementCurrency(statementNode),
                    'owner' : this.getStatementOwner(statementNode)
                };
                accountsSummary[iban] = accountSummary;
            }
            var statementBeginDate = this.getStatementBeginDate(statementNode);
            if (!accountSummary.beginDate || statementBeginDate < accountSummary.beginDate) {
                accountSummary.beginDate = statementBeginDate;
                accountSummary.beginBalance = this.getStatementBeginBalance(statementNode);
            }
            var statementEndDate = this.getStatementEndDate(statementNode);
            if (!accountSummary.endDate || statementEndDate >= accountSummary.endDate) {
                accountSummary.endDate = statementEndDate;
                accountSummary.endBalance = this.getStatementEndBalance(statementNode);
            }
        }

        return accountsSummary;
    }

    getStatementNodes() {
        if (!this.document)
        return [];

        var statementNode = null
        var statementNodes = [];
        var docNode = this.document.firstChildElement(); // 'Document'
        var docNs = docNode.attribute('xmlns');
        if (docNs.indexOf('camt.052') >= 0) {
            statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrAcctRpt', 'Rpt']);
            while (statementNode) {
                statementNodes.push(statementNode)
                statementNode = statementNode.nextSiblingElement('Rpt');
            }
        } else if (docNs.indexOf('camt.053') >= 0) {
            statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrStmt', 'Stmt']);
            while (statementNode) {
                statementNodes.push(statementNode)
                statementNode = statementNode.nextSiblingElement('Stmt');
            }
        } else if (docNs.indexOf('camt.054') >= 0) {
            statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrDbtCdtNtfctn', 'Ntfctn']);
            while (statementNode) {
                statementNodes.push(statementNode)
                statementNode = statementNode.nextSiblingElement('Ntfctn');
            }
        }

        return statementNodes;
    }

    getStatementIBAN(statementNode) {
        var node = this.firstGrandChildElement(statementNode, ['Acct', 'Id', 'IBAN']);
        if (node)
        return node.text;
        return '';
    }

    getStatementOwner(statementNode) {
        var node = this.firstGrandChildElement(statementNode, ['Acct', 'Ownr', 'Nm']);
        if (node)
        return node.text;
        return '';
    }

    getStatementCurrency(statementNode) {
        var node = this.firstGrandChildElement(statementNode, ['Acct', 'Ccy']);
        if (node)
        return node.text;
        return '';
    }

    getStatementBeginDate(statementNode) {
        if (!statementNode)
        return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
                    var dateNode = balNode.firstChildElement('Dt');
                    if (dateNode)
                    return dateNode.text;
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementBeginBalance(statementNode) {
        if (!statementNode)
        return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementEndDate(statementNode) {
        if (!statementNode)
        return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV' )) {
                    var dateNode = balNode.firstChildElement('Dt');
                    if (dateNode)
                    return dateNode.text;
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementEndBalance(statementNode) {
        if (!statementNode)
        return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV' )) {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    readStatementEntries(statementNode) {
        if (!statementNode)
        return;

        var transactions = [];
        var entryNode = statementNode.firstChildElement('Ntry');
        while (entryNode) {
            transactions = transactions.concat(this.readStatementEntry(entryNode));
            entryNode = entryNode.nextSiblingElement('Ntry'); // next account movement
        }
        return transactions;
    }

    readStatementEntry(entryNode) {
        var transaction = null;
        var transactions = [];

        var entryBookingDate = entryNode.hasChildElements('BookgDt') ? entryNode.firstChildElement('BookgDt').text.substr(0, 10) : '';
        var entryValutaDate = entryNode.hasChildElements('ValDt') ? entryNode.firstChildElement('ValDt').text.substr(0, 10) : '';
        var entryIsCredit = entryNode.firstChildElement('CdtDbtInd').text === 'CRDT';
        var entryAmount = entryNode.firstChildElement('Amt').text;
        var entryDescription = entryNode.hasChildElements('AddtlNtryInf') ? entryNode.firstChildElement('AddtlNtryInf').text : '';
        var entryBatchMsgId = '';
        var entryExternalReference = entryNode.hasChildElements('AcctSvcrRef') ? entryNode.firstChildElement('AcctSvcrRef').text : '';

        if (entryNode.hasChildElements('NtryDtls')) {
            var detailsNode = entryNode.firstChildElement('NtryDtls');
            while (detailsNode) {
                // Count text elements
                var txDtlsCount = 0;
                var textDetailsNode = detailsNode.firstChildElement('TxDtls');
                while (textDetailsNode) {
                    txDtlsCount++;
                    textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                }

                var entryDetailsBatchMsgId = this.readStatementEntryDetailsMatchMsgId(detailsNode);

                if (this.params.add_counterpart_transaction && txDtlsCount > 1) {
                    // Insert counterpart transaction
                    transaction = {
                        'Date': entryBookingDate,
                        'DateValue': entryValutaDate,
                        'DocInvoice': '',
                        'Description': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'Income': entryIsCredit ? entryAmount : '',
                        'Expenses': entryIsCredit ? '' : entryAmount,
                        'ExternalReference': entryExternalReference,
                        'IsDetail': 'S'
                    };
                    transactions.push(transaction);
                }

                // Text elements (Details transactions)
                if (detailsNode.hasChildElements('TxDtls')) {
                    textDetailsNode = detailsNode.firstChildElement('TxDtls');
                    while (textDetailsNode) {
                        var cdtDbtIndNode = textDetailsNode.firstChildElement('CdtDbtInd');
                        var deatailsIsCredit = cdtDbtIndNode && cdtDbtIndNode.text === 'CRDT' ? true : entryIsCredit;
                        var deatailAmount = this.readStatementEntryDetailsAmount(textDetailsNode);
                        var acctSvcrRefNode = this.firstGrandChildElement(textDetailsNode, ['Refs','AcctSvcrRef']);
                        var detailExternalReference = acctSvcrRefNode ? acctSvcrRefNode.text : '';
                        var rmtInfRefNode = this.firstGrandChildElement(textDetailsNode, ['RmtInf','Strd','CdtrRefInf','Ref']);
                        var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text : '';
                        var instrIdNode = this.firstGrandChildElement(textDetailsNode, ['Refs','InstrId']);

                        var invoiceNumber = this.params.invoice_no.extract ? this.extractInvoiceNumber(detailEsrReference) : '';

                        // Build description
                        var detailDescription = this.readStatementEntryDetailsDescription(textDetailsNode, deatailsIsCredit);
                        if (detailDescription.length === 0 && instrIdNode)
                        detailDescription = instrIdNode.text;

                        if (txDtlsCount === 1) {
                            deatailAmount = entryAmount;
                            detailExternalReference = entryExternalReference;
                            detailDescription = this.joinNotEmpty([detailDescription, entryDetailsBatchMsgId, entryDescription], ' / ');
                        }

                        transaction = {
                            'Date': entryBookingDate,
                            'DateValue': entryValutaDate,
                            'DocInvoice': invoiceNumber,
                            'Description': detailDescription,
                            'Income': deatailsIsCredit ? deatailAmount : '',
                            'Expenses': deatailsIsCredit ? '' : deatailAmount,
                            'ExternalReference': detailExternalReference,
                            'ContraAccount': '',
                            'Cc1': '',
                            'Cc2': '',
                            'Cc3': '',
                            'IsDetail': this.params.add_counterpart_transaction && txDtlsCount > 1 ? 'D' : ''
                        };

                        if (this.params.customer_no && this.params.customer_no.extract) { // Set customer number
                            var customerNumber = this.extractCustomerNumber(detailEsrReference);
                            var ccPrefix = deatailsIsCredit ? '-' : '';
                            if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC1') {
                                if (customerNumber)
                                transaction.Cc1 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC2') {
                                if (customerNumber)
                                transaction.Cc2 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC3') {
                                if (customerNumber)
                                transaction.Cc3 = ccPrefix + customerNumber;
                            } else {
                                transaction.ContraAccount = customerNumber;
                            }
                        }

                        transactions.push(transaction);
                        txDtlsCount++;

                        textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                    }
                } else { // No entry text details elements
                    transaction = {
                        'Date': entryBookingDate,
                        'DateValue': entryValutaDate,
                        'DocInvoice': '',
                        'Description': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'Income': entryIsCredit ? entryAmount : '',
                        'Expenses': entryIsCredit ? '' : entryAmount,
                        'ExternalReference': entryExternalReference,
                        'ContraAccount': '',
                        'Cc1': '',
                        'Cc2': '',
                        'Cc3': '',
                        'IsDetail': ''
                    };
                    transactions.push(transaction);

                }

                detailsNode = detailsNode.nextSiblingElement('NtryDtls'); // next movement detail
            }

        } else { // No entry details
            transaction = {
                'Date': entryBookingDate,
                'DateValue': entryValutaDate,
                'DocInvoice': '',
                'Description': entryDescription,
                'Income': entryIsCredit ? entryAmount : '',
                'Expenses': entryIsCredit ? '' : entryAmount,
                'ExternalReference': entryExternalReference,
                'ContraAccount': '',
                'Cc1': '',
                'Cc2': '',
                'Cc3': '',
                'IsDetail': ''
            };
            transactions.push(transaction);

        }

        return transactions;
    }

    readStatementEntryDetailsMatchMsgId(detailsNode) {
        var batchMsgIdNode = this.firstGrandChildElement(detailsNode, ['Btch', 'MsgId']);
        return batchMsgIdNode ? batchMsgIdNode.text : '';
    }

    readStatementEntryDetailsAmount(detailsNode) {

        if (!detailsNode)
        return '';

        var amtNode = detailsNode.firstChildElement('Amt');
        if (amtNode)
        return amtNode.text;

        amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'TxAmt', 'Amt'])
        if (amtNode)
        return amtNode.text;

        amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'InstdAmt'])
        if (amtNode)
        return amtNode.text;

        amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'CntrValAmt'])
        if (amtNode)
        return amtNode.text;

        return '';
    }

    readStatementEntryDetailsDescription(detailsNode, isCredit) {

        var detailsDescriptionTexts = [];

        detailsDescriptionTexts.push(this.readStatementEntryDetailsAddress(detailsNode, isCredit));

        if (detailsNode.hasChildElements('RmtInf')) {
            var ustrdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Ustrd');
            while (ustrdNode)
            {
                var ustrdString = ustrdNode.text.trim();
                if (ustrdString === '?REJECT?0') {
                    ustrdString = '';
                }
                if (ustrdString.length === 0)
                break;
                detailsDescriptionTexts.push(ustrdString);
                ustrdNode = ustrdNode.nextSiblingElement('Ustrd');
            }
        } else if (detailsNode.hasChildElements('AddtlTxInf')) {
            var addtlTxInfString = detailsNode.firstChildElement('AddtlTxInf').text.trim();
            if (addtlTxInfString.length > 0)
            detailsDescriptionTexts.push(addtlTxInfString);
        }

        var rmtInfRefNode = this.firstGrandChildElement(detailsNode, ['RmtInf','Strd','CdtrRefInf','Ref']);
        var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text.trim() : '';
        if (detailEsrReference.length > 0)
        detailsDescriptionTexts.push(this.tr('isr', this.lang) + detailEsrReference);

        return this.joinNotEmpty(detailsDescriptionTexts, ' / ');
    }

    readStatementEntryDetailsAddress(detailsNode, isCredit) {
        var rltdPtiesNode = detailsNode.firstChildElement('RltdPties');
        if (!rltdPtiesNode)
        return '';

        var addressNode = null;
        if (isCredit) {
            if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
            addressNode = rltdPtiesNode.firstChildElement('Dbtr')
            else if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
            addressNode = rltdPtiesNode.firstChildElement('Cdtr')
        } else {
            if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
            addressNode = rltdPtiesNode.firstChildElement('Cdtr')
            else if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
            addressNode = rltdPtiesNode.firstChildElement('Dbtr')
        }

        if (!addressNode)
        return '';

        var addressStrings = [];
        if (addressNode.firstChildElement('Nm'))
        addressStrings.push(addressNode.firstChildElement('Nm').text);
        var pstlAdrNode = addressNode.firstChildElement('PstlAdr');
        if (pstlAdrNode) {
            if (pstlAdrNode.hasChildElements('AdrLine')) {
                var adrLineNode = pstlAdrNode.firstChildElement('AdrLine');
                while(adrLineNode) {
                    addressStrings.push(adrLineNode.text);
                    adrLineNode = adrLineNode.nextSiblingElement('AdrLine');
                }
            }
            if (pstlAdrNode.hasChildElements('TwnNm'))
            addressStrings.push(pstlAdrNode.firstChildElement('TwnNm').text);
            if (pstlAdrNode.hasChildElements('Ctry'))
            addressStrings.push(pstlAdrNode.firstChildElement('Ctry').text);
        }

        return addressStrings.join(', ');
    }

    readStatementEntryDetailsReference(detailsNode) {

        if (!detailsNode)
        return '';

        var referenceText = '';

        if (detailsNode.hasChildElements('Refs')) {
            var refsNode = detailsNode.firstChildElement('Refs');
            if (refsNode.hasChildElements('TxId'))
            referenceText = refsNode.firstChildElement('TxId').text;
            if (refsNode.hasChildElements('InstrId'))
            referenceText = refsNode.firstChildElement('InstrId').text;
            if (refsNode.hasChildElements('ChqNb'))
            referenceText = refsNode.firstChildElement('ChqNb').text;
            if (refsNode.hasChildElements('MndtId'))
            referenceText = refsNode.firstChildElement('MndtId').text;
            if (refsNode.hasChildElements('MsgId'))
            referenceText = refsNode.firstChildElement('MsgId').text;
        }

        if (referenceText.length > 0)
        return referenceText;

        if (detailsNode.hasChildElements('RmtInf')) {
            var strdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Strd');
            while (strdNode) {
                if (strdNode.hasChildElements('CdtrRefInf')) {
                    var cdtrRefInfNode = strdNode.firstChildEment('CdtrRefInf');
                    if (cdtrRefInfNode.hasChildElements('Ref')) {
                        var refString = cdtrRefInfNode.firstChildElement('Ref').text;
                        if (refString.length > 0) {
                            return refString;
                        }
                    }
                }
                strdNode = strdNode.nextSiblingElement('Strd');
            }
        }

        return '';
    }

    extractInvoiceNumber(esrNumber) {

        if (!esrNumber || esrNumber.length <= 0)
        return '';

        var invoiceNumber = esrNumber;

        // Use Banana format for PVR and QR
        if (this.params.invoice_no.banana_format) {

            // Extract invoice number from QR reference
            if (invoiceNumber.startsWith("RF")) {

                /*
             - RF
             - 2 control digits
             - customer no. length (min 1, max 7), hexadecimal string
             - customer no.
             - invoice no. length (min 1, max 7), hexadecimal string
             - invoice no.
             When account/invoice numbers doesn't exist we use "0" as value
          */

                ///////////////////////////////////////
                // TEST
                //   reference number = RF02411003101
                //   ref+control digits = RF02
                //   customer length = 4
                //   customer = 1100
                //   invoice length = 3
                //   invoice = 101 */
                //invoiceNumber = "RF02411003101";
                ///////////////////////////////////////
                var invLen = invoiceNumber.substr(4,1);
                var inv = invoiceNumber.substr(5,invLen);
                var invNoBegin = 5+Number(invLen);
                var invNoLen = invoiceNumber.substr(invNoBegin,1);
                var invNo = invoiceNumber.substr(invNoBegin+1,invNoLen);
                invoiceNumber = invNo;
            }
            else {

                // Extract invoice number from PVR reference

                /////////////////////////////////////////////////////////
                // TEST
                //   reference number = 00 00000 00007 65432 11234 56700
                //   customer = 7654321
                //   invoice =  1234567*/
                //invoiceNumber = "00 00000 00007 65432 11234 56700";
                /////////////////////////////////////////////////////////
                var inv = invoiceNumber.substr(18,7);
                invoiceNumber = inv;

                // Remove traling zeros
                invoiceNumber = invoiceNumber.replace(/^0+/, '')
            }
        }
        else {

            // First apply start / length extraction
            if (this.params.invoice_no.start !== "0" || this.params.invoice_no.count !== "-1") {
                if (this.params.invoice_no.count === "-1") {
                    invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start);
                }
                else {
                    invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start, this.params.invoice_no.count);
                }
            }

            // Second apply method if defined
            if (this.params.invoice_no.method.length > 0) {
                var invoiceMethod = eval(this.params.invoice_no.method);
                if (typeof(invoiceMethod) === 'function') {
                    invoiceNumber = invoiceMethod(invoiceNumber);
                }
            }

            // Remove traling zeros
            invoiceNumber = invoiceNumber.replace(/^0+/, '')
        }

        return invoiceNumber;
    }

    extractCustomerNumber(esrNumber) {

        if (!esrNumber || esrNumber.length <= 0)
        return '';

        var customerNumber = esrNumber;


        // Use Banana format for PVR and QR
        if (this.params.customer_no.banana_format) {

            // Extract customer number from QR reference
            if (customerNumber.startsWith("RF")) {

                /*
            - RF
            - 2 control digits
            - customer no. length (min 1, max 7), hexadecimal string
            - customer no.
            - invoice no. length (min 1, max 7), hexadecimal string
            - invoice no.
            When account/invoice numbers doesn't exist we use "0" as value
         */

                ///////////////////////////////////////
                // TEST
                //   reference number = RF02411003101
                //   ref+control digits = RF02
                //   customer length = 4
                //   customer = 1100
                //   invoice length = 3
                //   invoice = 101 */
                //customerNumber = "RF02411003101";
                ///////////////////////////////////////
                var invLen = customerNumber.substr(4,1);
                var cust = customerNumber.substr(5,invLen);
                customerNumber = cust;
            }
            else {
                // Extract customer number from PVR reference

                /////////////////////////////////////////////////////////
                // TEST
                //   reference number = 00 00000 00007 65432 11234 56700
                //   customer = 7654321
                //   invoice =  1234567*/
                //customerNumber = "00 00000 00007 65432 11234 56700";
                /////////////////////////////////////////////////////////
                var cust = customerNumber.substr(11,7);
                customerNumber = cust;

                // Remove traling zeros
                if (!this.params.customer_no.keep_initial_zeros) {
                    customerNumber = customerNumber.replace(/^0+/, '');
                }
            }
        }
        else {
            if (this.params.customer_no) {
                // First apply start / length extraction
                if (this.params.customer_no.start !== "0" || this.params.customer_no.count !== "-1") {
                    if (this.params.customer_no.count === "-1")
                    customerNumber = customerNumber.substr(this.params.customer_no.start);
                    else
                    customerNumber = customerNumber.substr(this.params.customer_no.start, this.params.customer_no.count);
                }

                // Second apply method if defined
                if (this.params.customer_no.method.length > "0") {
                    var customerMethod = eval(this.params.customer_no.method);
                    if (typeof(customerMethod) === 'function') {
                        customerNumber = customerMethod(customerNumber);
                    }
                }

                // Remove traling zeros
                if (!this.params.customer_no.keep_initial_zeros) {
                    customerNumber = customerNumber.replace(/^0+/, '');
                }
            }
        }

        return customerNumber;
    }

    firstGrandChildElement(node, childs) {
        if (!node)
        return null;

        var grandChildNode = node;
        for (var i = 0; i < childs.length; i++) {
            grandChildNode = grandChildNode.firstChildElement(childs[i]);
            if (!grandChildNode)
            break;
        }

        return grandChildNode;
    }

    /**
  * The  method tr(textid, language) return a translation of a text defined by textid in the desired language
  * If a translation in the given language is not defined, the english text is returned.
  * If no text is found for the given textid, the textid is returned ad text.
  */
    tr(textid, language) {
        var texts = {};

        // Default texts (english)
        texts.settings = 'Settings';
        texts.isr = 'Isr: ';

        texts.add_counterpart_transaction = 'Add counterpart transaction';
        texts.invoice_no_extract = 'Extract invoice number from reference';
        texts.invoice_no_start = 'Start position';
        texts.invoice_no_length = 'Number of characters (-1 = all)';
        texts.invoice_no_method = 'Function (optional)';
        texts.invoice_no_method_tooltip = 'Function to extract the invoice number, ex.: "(function(text) {return text.substr(11,7);})"';
        texts.customer_no_extract = 'Extract customer account from reference';
        texts.customer_no_start = 'Start position';
        texts.customer_no_length = 'Number of characters (-1 = all)';
        texts.customer_no_use_cc = 'Cost center for customer accounts (optional)';
        texts.customer_no_use_cc_tooltip = 'Leave empty (default) if balance sheet accounts are used for customer accounts. ' +
        'Insert "Cc1", "Cc2" or "Cc3" if cost centers are used for customer accounts.';
        texts.customer_no_method = 'Function (optional)';
        texts.customer_no_method_tooltip = 'Function to extract the customer account, ex.: "(function(text) {return text.substr(18,7);})"';
        texts.customer_no_keep_initial_zeros = 'Keep initial zeros';
        texts.legacy_add_counterpart_transaction = 'Add counterpart transactions (0 or empty = No; 1 = Yes)';
        texts.legacy_invoice_no_extract = 'Extract invoice number from Isr reference (0 or empty = No; 1 = Yes)';
        texts.legacy_invoice_no_start = 'Extract invoice number from Isr reference: Start position';
        texts.legacy_invoice_no_length = 'Extract invoice number from Isr reference: Number of characters (-1 = all)';
        texts.legacy_invoice_no_method = 'Extract invoice number from Isr reference: Function (optional)';
        texts.invoice_no_banana_format = 'Use Banana format';
        texts.customer_no_banana_format = 'Use Banana format';


        // The translations will overwrite the default texts
        if (language === 'it') {
            texts.settings = 'Impostazioni';
            texts.isr = 'Pvr: ';

            texts.add_counterpart_transaction = 'Aggiungi registrazione di contropartita';
            texts.invoice_no_extract = 'Estrai numero fattura dal numero di riferimento';
            texts.invoice_no_start = 'Posizione di inizio';
            texts.invoice_no_length = 'Numero di caratteri (-1 = tutti)';
            texts.invoice_no_method = 'Funzione (opzionale)';
            texts.invoice_no_method_tooltip = 'Funzione per estrarre il numero di fattura, es.: "(function(text) {return text.substr(11,7);})"';
            texts.customer_no_extract = 'Estrai conto cliente dal numero di riferimento';
            texts.customer_no_start = 'Posizione di inizio';
            texts.customer_no_length = 'Numero di caratteri (-1 = tutti)';
            texts.customer_no_use_cc = 'Centro di costo per i conti cliente (opzionale)';
            texts.customer_no_use_cc_tooltip = 'Lasciare vuoto (predefinito) se si utilizzano conti di bilancio per gli account clienti. ' +
            'Inserisci "Cc1", "Cc2" o "Cc3" se si utilizzano i centri di costo per gli account clienti';
            texts.customer_no_method = 'Funzione (opzionale)';
            texts.customer_no_method_tooltip = 'Funzione per estrarre l\'account del cliente, es .: "(function(text) {return text.substr(18,7);})"';
            texts.customer_no_keep_initial_zeros = 'Mantieni zeri iniziali';
            texts.legacy_add_counterpart_transaction = 'Aggiungi registrazione di contropartita (0 o vuoto = No; 1 = Si)';
            texts.legacy_invoice_no_extract = 'Estrai numero fattura dal numero di riferimento PVR (0 o vuoto = No; 1 = Si)';
            texts.legacy_invoice_no_start = 'Estrai numero fattura dal numero di riferimento PVR: Posizione di inizio';
            texts.legacy_invoice_no_length = 'Estrai numero fattura dal numero di riferimento PVR: Numero di caratteri (-1 = tutti)';
            texts.legacy_invoice_no_method = 'Estrai numero fattura dal numero di riferimento PVR: Funzione (opzionale)';
            texts.invoice_no_banana_format = 'Usa il formato Banana';
            texts.customer_no_banana_format = 'Usa il formato Banana';

        } else if (language === 'de') {
            texts.settings = 'Einstellungen';
            texts.isr = 'ESR: ';

            texts.add_counterpart_transaction = 'Gegenbuchung hinzufügen';
            texts.invoice_no_extract = 'Rechnungsnummer aus Referenznummer extrahieren';
            texts.invoice_no_start = 'Anfangsposition';
            texts.invoice_no_length = 'Anzahl Zeichen (-1 = Alle)';
            texts.invoice_no_method = 'Funktion (optional)';
            texts.invoice_no_method_tooltip = 'Funktion zum Extrahieren der Rechnungsnummer, zB: "(function(text) {return text.substr(11,7);})"';
            texts.customer_no_extract = 'Kundenkonto aus Referenznummer extrahieren';
            texts.customer_no_start = 'Anfangsposition';
            texts.customer_no_length = 'Anzahl Zeichen (-1 = Alle)';
            texts.customer_no_use_cc = 'Kostenstelle für die Kundenkonten (optional)';
            texts.customer_no_use_cc_tooltip = 'Leer lassen (Standard), wenn Bilanzkonten für Kundenkonten verwendet werden.' +
            '"Cc1", "Cc2" o "Cc3" eingeben, wenn Kostenstellen für Kundenkonten verwendet werden.';
            texts.customer_no_method = 'Funktion (optional)';
            texts.customer_no_method_tooltip = 'Funktion zum Extrahieren des Kundenkontos, zB: "(function(text) {return text.substr(18,7);})"';
            texts.customer_no_keep_initial_zeros = 'Die Nullen am Anfang beibehalten';
            texts.legacy_add_counterpart_transaction = 'Gegenbuchung hinzufügen (0 oder leer = Nein; 1 = Ja)';
            texts.legacy_invoice_no_extract = 'Rechnungsnummer aus ESR-Referenznummer extrahieren (0 oder leer = Nein; 1 = Ja)';
            texts.legacy_invoice_no_start = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Anfangsposition';
            texts.legacy_invoice_no_length = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Anzahl Zeichen (-1 = Alle)';
            texts.legacy_invoice_no_method = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Funktion (optional)';
            texts.invoice_no_banana_format = 'Banana-Format verwenden';
            texts.customer_no_banana_format = 'Banana-Format verwenden';


        } else if (language === 'fr') {
            texts.settings = 'Paramètres';
            texts.isr = 'Bvr: ';

            texts.add_counterpart_transaction = 'Ajouter écriture de contrepartie';
            texts.invoice_no_extract = 'Extraire le numéro de facture depuis le numéro de référence';
            texts.invoice_no_start = 'Position de départ';
            texts.invoice_no_length = 'Nombre de caractères (-1 = tous)';
            texts.invoice_no_method = 'Fonction (optionnel)';
            texts.invoice_no_method_tooltip = 'Fonction pour extraire le numéro de facture, ex.: "(function(text) {return text.substr(11,7);})"';
            texts.customer_no_extract = 'Extraire le compte client depuis le numéro de référence';
            texts.customer_no_start = 'Position de départ';
            texts.customer_no_length = 'Nombre de caractères (-1 = tous)';
            texts.customer_no_use_cc = 'Centre de coût pour les comptes clients (optional)';
            texts.customer_no_use_cc_tooltip = 'Laisser vide (par défaut) si les comptes du bilan sont utilisés pour les comptes clients.' +
            'Insérer "Cc1", "Cc2" ou "Cc3" si les centres de coûts sont utilisés pour les comptes clients.';
            texts.customer_no_method = 'Fonction (optionnel)';
            texts.customer_no_method_tooltip = 'Fonction pour extraire le compte client, ex .: "(function(text) {return text.substr(18,7);})"';
            texts.customer_no_keep_initial_zeros = 'Maintenir les zéros initial';
            texts.legacy_add_counterpart_transaction = 'Ajouter écriture de contrepartie (0 ou vide = Non; 1 = Oui)';
            texts.legacy_invoice_no_extract = 'Extraire le numéro de facture depuis le numéro de référence BVR (0 ou vide = Non; 1 = Oui)';
            texts.legacy_invoice_no_start = 'Extraire le numéro de facture depuis le numéro de référence BVR: Position de départ';
            texts.legacy_invoice_no_length = 'Extraire le numéro de facture depuis le numéro de référence BVR: Nombre de caractères (-1 = tous)';
            texts.legacy_invoice_no_method = 'Extraire le numéro de facture depuis le numéro de référence BVR: Fonction (optionnel)';
            texts.invoice_no_banana_format = "Utiliser le format Banana" ;
            texts.customer_no_banana_format = "Utiliser le format Banana" ;

        }

        var text = texts[textid];
        if (typeof(text) === 'string')
        return text;

        // If the textid is not found, just return the id, but never an empty string
        // So we can assure that a text is showed to the user.
        return textid;
    }

    joinNotEmpty(texts, separator) {
        var cleanTexts = texts.filter(function(n){ return n && n.trim().length});
        return cleanTexts.join(separator);
    }
}
