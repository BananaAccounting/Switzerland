// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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

var ID_PAIN_FORMAT_001_001_03 = "pain.001.001.03";
var ID_PAIN_FORMAT_001_001_03_CH_02 = "pain.001.001.03.ch.02";

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
    for (var i = 0; i < this.paymentInformations.length; ++i) {
        this.paymentInformations[i].accept(domBuilder);
    }
}

/**
     * @param PaymentInformation paymentInformation
     */
CustomerCreditTransferFile.prototype.addPaymentInformation = function (paymentInformation) {
    paymentInformation.setValidPaymentMethods(['TRF']);
    paymentInformation.setPaymentMethod('TRF');
    var numberOfTransactions = this.getGroupHeader().getNumberOfTransactions() + paymentInformation.getNumberOfTransactions();
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
    for (var i = 0; i < this.paymentInformations.length; ++i) {
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
    * function getUltimateDebtorName();
}*/
function CustomerCreditTransferInformation(id, name, amount) {

    /**
     * @var string
     */
    this.bankAccount = '';

    /**
     * @var string
     */
    this.bankName = '';

    /**
     * @var string|array
     */
     this.bankAddress = '';

     /**
     * Financial Institution Identifier;
     *
     * @var string
     */
    this.bic = '';

    /**
     * @var string
     */
     this.categoryPurpose = '';

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

    /**
     * @var string
     */
     this.ultimateDebtorName = '';    
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
CustomerCreditTransferInformation.prototype.getBankAccount = function () {
    if (!this.bankAccount)
        return '';
    return this.bankAccount;
}

/**
 * @param string
 */
CustomerCreditTransferInformation.prototype.setBankAccount = function (bankAccount) {
    this.bankAccount = bankAccount;
}

/**
 * @return array|string
 */
 CustomerCreditTransferInformation.prototype.getBankAddress = function () {
    if (!this.bankAddress)
        return '';
    return this.bankAddress;
}

/**
 * @param array|string bankAddress
 */
CustomerCreditTransferInformation.prototype.setBankAddress = function (bankAddress) {
    this.bankAddress = bankAddress;
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getBankName = function () {
    if (!this.bankName)
        return '';
    return this.bankName;
}

/**
 * @param string
 */
CustomerCreditTransferInformation.prototype.setBankName = function (bankName) {
    this.bankName = bankName;
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
 CustomerCreditTransferInformation.prototype.getCategoryPurpose = function () {
    if (!this.categoryPurpose)
        return '';
    return this.categoryPurpose;
}

/**
 * @param string categoryPurpose
 * @throws InvalidArgumentException
 */
CustomerCreditTransferInformation.prototype.setCategoryPurpose = function (categoryPurpose) {
    categoryPurpose = categoryPurpose.toUpperCase();
    if (!_inArray(categoryPurpose, ['SALA', 'PENS'])) {
        throw 'Invalid Category purpose: ' + categoryPurpose;
    }
    this.categoryPurpose = categoryPurpose;
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
	if (this.creditorReference === 'undefined')
		return '';
    return this.creditorReference;
}

/**
 * @param string creditorReference
 */
CustomerCreditTransferInformation.prototype.setCreditorReference = function (creditorReference) {
    this.creditorReference = creditorReference;
	if (this.creditorReference)
		this.creditorReference = this.creditorReference.replace(/ /g, '');
}

/**
 * @return string
 */
CustomerCreditTransferInformation.prototype.getCreditorReferenceType = function () {
    if (!this.creditorReferenceType)
        return '';
	if (this.creditorReferenceType === 'undefined')
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
    return this.currency.toUpperCase();
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
	if (this.iban)
		this.iban = this.iban.replace(/ /g, '');
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
        throw 'Invalid Local Instrument Proprietary: ' + localInstrumentProprietary;
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
        throw 'Invalid Local Instrument Code: ' + localInstrumentCode;
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

/**
     * @return ultimateDebtorName
     */
 CustomerCreditTransferInformation.prototype.getUltimateDebtorName = function () {
    if (!this.ultimateDebtorName)
        return '';
    return this.ultimateDebtorName;
}

/**
 * @param string ultimateDebtorName
 */
 CustomerCreditTransferInformation.prototype.setUltimateDebtorName = function (ultimateDebtorName) {
    this.ultimateDebtorName = ultimateDebtorName;
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
    this.root.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    if (this.painFormat.indexOf(".ch.") > 0) {
        this.root.setAttribute('xmlns', 'http://www.six-interbank-clearing.com/de/%1.xsd'.arg(this.painFormat));
        if (withSchemaLocation) {
            this.root.setAttribute('xsi:schemaLocation', 'http://www.six-interbank-clearing.com/de/%1.xsd %2.xsd'.arg(this.painFormat).arg(this.painFormat));
        }
    }
    else {
        this.root.setAttribute('xmlns', 'urn:iso:std:iso:20022:tech:xsd:%1'.arg(this.painFormat));
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
        node.addTextNode(transactionInformation.getCountry());
    }

    // Ensure postalAddressData is an array as getPostalAddress() returns either string or string[].
    var postalAddressData = transactionInformation.getPostalAddress();
    if (!Array.isArray(postalAddressData)) {
        postalAddressData = Array.from(postalAddressData);
    }
    // Generate nodes for each address line.
    for (var i = 0; i < postalAddressData.length; ++i) {
        var node = postalAddress.addElement('AdrLine');
        node.addTextNode(postalAddressData[i]);
    }
}

DomBuilder.prototype.appendBankAddressToDomElement = function (creditor, transactionInformation) {
    if (transactionInformation.getBankAddress().length < 0) {
        return; // No address exists, nothing to do.
    }

    var bankAddress = creditor.addElement('PstlAdr');

    // Ensure bankAddressData is an array as getBankAddress() returns either string or string[].
    var bankAddressData = transactionInformation.getBankAddress();
    if (!Array.isArray(bankAddressData)) {
        bankAddressData = Array.from(bankAddressData);
    }
    // Generate nodes for each address line.
    for (var i = 0; i < bankAddressData.length; ++i) {
        var node = bankAddress.addElement('AdrLine');
        node.addTextNode(bankAddressData[i]);
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

    if (transactionInformation.getCreditorReferenceType() == "SCOR") {
		var tp = creditorReferenceInformation.addElement('Tp');
        var issuer = tp.addElement('CdOrPrtry');
        var code = issuer.addElement('Cd');
        code.addTextNode(transactionInformation.getCreditorReferenceType());
    }
    else if (transactionInformation.getCreditorReferenceType() == "QRR") {
		var tp = creditorReferenceInformation.addElement('Tp');
        var issuer = tp.addElement('CdOrPrtry');
        var proprietary = issuer.addElement('Prtry');
        proprietary.addTextNode(transactionInformation.getCreditorReferenceType());
    }

    var reference = creditorReferenceInformation.addElement('Ref');
    reference.addTextNode(creditorReference);

    return remittanceInformation;
}

DomBuilder.prototype.asXml = function () {
    var indent = true;
    return Banana.Xml.save(this.doc, indent);
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
        if (this.painFormat === ID_PAIN_FORMAT_001_001_03) {
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

    if (paymentInformation.getOriginBankPartyIdentification().length > 0 && this.painFormat === ID_PAIN_FORMAT_001_001_03) {
        this.appendOrganizationIdentificationElement(debtor, paymentInformation.getOriginBankPartyIdentification());
    }

    var debtorAccount = this.currentPayment.addElement('DbtrAcct');
    node = debtorAccount.addElement('Id');
    node = node.addElement('IBAN');
    node.addTextNode(paymentInformation.getOriginAccountIBAN());

    //Debit advice
    if (paymentInformation.getOriginAdvice().length > 0) {
        node = debtorAccount.addElement('Tp');
        node = node.addElement('Prtry');
        node.addTextNode(paymentInformation.getOriginAdvice());
    }

    /*if (paymentInformation.getOriginAccountCurrency().length > 0) {
        node = debtorAccount.addElement('Ccy');
        node.addTextNode(paymentInformation.getOriginAccountCurrency());
    }*/

    if (paymentInformation.getOriginAgentBIC().length > 0) {
        var debtorAgent = this.currentPayment.addElement('DbtrAgt');
        this.appendFinancialInstitutionElement(debtorAgent, paymentInformation.getOriginAgentBIC());
    }

    // Charge Bearer
    if (paymentInformation.getChargeBearer().length > 0) {
        var chargeBearer = this.currentPayment.addElement('ChrgBr');
        chargeBearer.addTextNode(paymentInformation.getChargeBearer());
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
    if (transactionInformation.getCategoryPurpose().length > 0) {
        node = paymentTypeInformation.addElement('CtgyPurp');
        node = node.addElement('Cd');
        node.addTextNode(transactionInformation.getCategoryPurpose());
    }

    // Amount
    var amount = cdtTrfTxInf.addElement('Amt');
    var instructedAmount = amount.addElement('InstdAmt');
    instructedAmount.addTextNode(_formatCurrency(transactionInformation.getTransferAmount()));
    instructedAmount.setAttribute('Ccy', transactionInformation.getCurrency());

    // Ultimate Debtor
    if (transactionInformation.getUltimateDebtorName().length > 0) {
        var ultimateDebtor = cdtTrfTxInf.addElement('UltmtDbtr');
        var ultimateDebtorName = ultimateDebtor.addElement('Nm');
        ultimateDebtorName.addTextNode(transactionInformation.getUltimateDebtorName());
    }

    //Creditor Agent 2.77
    if (transactionInformation.getBic().length > 0) {
        var creditorAgent = cdtTrfTxInf.addElement('CdtrAgt');
        var financialInstitution = creditorAgent.addElement('FinInstnId');
        var bic = financialInstitution.addElement('BIC');
        bic.addTextNode(transactionInformation.getBic());
    }
	else if (transactionInformation.getBankAccount().length > 0) {
        var creditorAgent = cdtTrfTxInf.addElement('CdtrAgt');
        var financialInstitution = creditorAgent.addElement('FinInstnId');
        var name = financialInstitution.addElement('Nm');
		name.addTextNode(transactionInformation.getBankName());
        // Bank address if needed and supported by schema.
        if (_inArray(this.painFormat, [ID_PAIN_FORMAT_001_001_03, ID_PAIN_FORMAT_001_001_03_CH_02])) {
            this.appendBankAddressToDomElement(financialInstitution, transactionInformation);
        }
        var other = financialInstitution.addElement('Othr');
        var node = other.addElement('Id');
        node.addTextNode(transactionInformation.getBankAccount());
	}

    // Creditor 2.79
    var creditor = cdtTrfTxInf.addElement('Cdtr');
    node = creditor.addElement('Nm');
    node.addTextNode(transactionInformation.getCreditorName());

    // Creditor address if needed and supported by schema.
    if (_inArray(this.painFormat, [ID_PAIN_FORMAT_001_001_03, ID_PAIN_FORMAT_001_001_03_CH_02])) {
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
     * @var string Nature or use of the Debtor's account. Can be used to control the debit advice. 
     * The following options are available:
     * NOA No Advice
     * SIA Single Advice
     * CND Collective Advice No Details
     * CWD Collective Advice With Details
     */
     this.originAdvice = '';

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
    this.batchBooking = 1;

    /**
     * @string
     */
     this.chargeBearer;

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
    for (var i = 0; i < this.transfers.length; ++i) {
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
     * @return chargeBearer
     */
 PaymentInformation.prototype.getChargeBearer = function () {
    if (!this.chargeBearer)
        return '';
    return this.chargeBearer;
}

/**
 * @param string chargeBearer
 */
 PaymentInformation.prototype.setChargeBearer = function (chargeBearer) {
    this.chargeBearer = chargeBearer;
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
 PaymentInformation.prototype.getOriginAdvice = function () {
    if (!this.originAdvice)
        return '';
    return this.originAdvice;
}

/**
 * @param string originAdvice
 */
PaymentInformation.prototype.setOriginAdvice = function (originAdvice) {
    originAdvice = originAdvice.toUpperCase();
    if (!_inArray(originAdvice, ['NOA', 'SIA', 'CND', 'CWD'])) {
        throw 'Invalid Debitor Advice: ' + originAdvice;
    }
    this.originAdvice = originAdvice;
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
        throw "Invalid Payment Method: method, must be one of ".implode(',', this.validPaymentMethods);
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
	//remove timezone GMT otherwise move time
	var offset = date.getTimezoneOffset() * 60000;
	var dateFormatted = new Date(date - offset);
    dateFormatted = dateFormatted.toISOString();
    if (dateFormatted.indexOf("T") > 0)
        dateFormatted = dateFormatted.split('T')[0];
    return dateFormatted;
}

/**
     * Format a datetime to ISO format without milliseconds.
     */
function _formatDateTime(date) {
	//remove timezone GMT otherwise move time
	var offset = date.getTimezoneOffset() * 60000;
	var dateFormatted = new Date(date - offset);
    dateFormatted = dateFormatted.toISOString();
    if (dateFormatted.indexOf(".") > 0)
        dateFormatted = dateFormatted.split('.')[0];
    return dateFormatted;
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
