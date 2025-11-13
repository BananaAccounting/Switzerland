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

//ID_PAIN_FORMAT_001_001_09_CH_03 DomBuilderSPS2025
//ID_BUSINESS_RULES_SPS2025 SPS2025
var DomBuilderSPS2025 = class DomBuilderSPS2025 extends DomBuilder {
	constructor(painFormat, withSchemaLocation) {
		super(painFormat, withSchemaLocation);
        this.root.setAttribute('xmlns', 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09');
        if (withSchemaLocation) {
            this.root.setAttribute('xsi:schemaLocation', 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09 pain.001.001.09.ch.03.xsd');
        }
	}

    /**
     * Appends an address node to the given DOM element, including country and address lines.
     * Uses the hybrid address format.
     * If no address is available in transactionInformation, the method does nothing.
     *
     * @param \DOMElement $creditor
     * @param CustomerCreditTransferInformation $transactionInformation
     */
    appendCreditorAddressToDomElement(creditor, transactionInformation) {
        if (transactionInformation.getCreditorCountry().length < 0 && transactionInformation.getCreditorTown().length < 0) {
            return; // No address exists, nothing to do.
        }

        var postalAddress = creditor.addElement('PstlAdr');

        // Generate postalcode node.
        if (transactionInformation.getCreditorPostalCode().length > 0) {
            var node = postalAddress.addElement('PstCd');
            node.addTextNode(transactionInformation.getCreditorPostalCode());
        }

        // Generate town node.
        if (transactionInformation.getCreditorTown().length > 0) {
            var node = postalAddress.addElement('TwnNm');
            node.addTextNode(transactionInformation.getCreditorTown());
        }

        // Generate country node.
        if (transactionInformation.getCreditorCountry().length > 0) {
            var node = postalAddress.addElement('Ctry');
            node.addTextNode(transactionInformation.getCreditorCountry());
        }

        // Generate addressline 1. (max length?)
        if (transactionInformation.getCreditorStreet1().length > 0) {
            var node = postalAddress.addElement('AdrLine');
            node.addTextNode(transactionInformation.getCreditorStreet1());
        }

        // Generate addressline 2. (max length?)
        if (transactionInformation.getCreditorStreet2().length > 0) {
            var node = postalAddress.addElement('AdrLine');
            node.addTextNode(transactionInformation.getCreditorStreet2());
        }
    }

    /**
     * Appends an address node to the given DOM element, including country and address lines.
     * Uses the hybrid address format.
     * If no address is available in transactionInformation, the method does nothing.
     *
     * @param \DOMElement $ultimateDebtor
     * @param CustomerCreditTransferInformation $transactionInformation
     */
    appendUltimateDebtorAddressToDomElement(ultimateDebtor, transactionInformation) {
        if (transactionInformation.getUltimateDebtorCountry().length < 0 && transactionInformation.getUltimateDebtorTown().length < 0) {
            return; // No address exists, nothing to do.
        }

        var postalAddress = ultimateDebtor.addElement('PstlAdr');

        // Generate postalcode node.
        if (transactionInformation.getUltimateDebtorPostalCode().length > 0) {
            var node = postalAddress.addElement('PstCd');
            node.addTextNode(transactionInformation.getUltimateDebtorPostalCode());
        }

        // Generate town node.
        if (transactionInformation.getUltimateDebtorTown().length > 0) {
            var node = postalAddress.addElement('TwnNm');
            node.addTextNode(transactionInformation.getUltimateDebtorTown());
        }

        // Generate country node.
        if (transactionInformation.getUltimateDebtorCountry().length > 0) {
            var node = postalAddress.addElement('Ctry');
            node.addTextNode(transactionInformation.getUltimateDebtorCountry());
        }

        // Generate addressline 1. (max length?)
        if (transactionInformation.getUltimateDebtorStreet1().length > 0) {
            var node = postalAddress.addElement('AdrLine');
            node.addTextNode(transactionInformation.getUltimateDebtorStreet1());
        }

        // Generate addressline 2. (max length?)
        if (transactionInformation.getUltimateDebtorStreet2().length > 0) {
            var node = postalAddress.addElement('AdrLine');
            node.addTextNode(transactionInformation.getUltimateDebtorStreet2());
        }
    }

    appendFinancialInstitutionElement(debtorAgent, bic) {
        var finInstitution = super.appendFinancialInstitutionElement(debtorAgent, bic);
        var nodeToReplace = finInstitution.firstChildElement('BIC');
        if (nodeToReplace) {
            var node = finInstitution.createElement('BICFI');
            node.addTextNode(nodeToReplace.text);
            finInstitution.replaceChild(node, nodeToReplace);
        }

        return finInstitution;
    }

    visitGroupHeader(groupHeader) {
        var groupHeaderNode = super.visitGroupHeader(groupHeader);
        if (!groupHeaderNode)
            return;

        var initiatingParty = groupHeaderNode.firstChildElement('InitgPty');
        if (!initiatingParty)
            return;

        var contactDetails = initiatingParty.firstChildElement('CtctDtls');
        if (!contactDetails)
            return;

        contactDetails.removeChild(contactDetails.firstChildElement('Nm'));
        contactDetails.removeChild(contactDetails.firstChildElement('Othr'));

        var othr = contactDetails.addElement('Othr');
        var node = othr.addElement('ChanlTp');
        node.addTextNode('NAME');
        node = othr.addElement('Id');
        node.addTextNode(groupHeader.getSoftwareName());
        othr = contactDetails.addElement('Othr');
        node = othr.addElement('ChanlTp');
        node.addTextNode('VRSN');
        node = othr.addElement('Id');
        node.addTextNode(groupHeader.getSoftwareVersion());
        othr = contactDetails.addElement('Othr');
        node = othr.addElement('ChanlTp');
        node.addTextNode('PRVD');
        node = othr.addElement('Id');
        node.addTextNode(groupHeader.getSoftwareProvider());
    }

    visitPaymentInformation(paymentInformation) {
        super.visitPaymentInformation(paymentInformation);

        var nodeToReplace = this.currentPayment.firstChildElement('ReqdExctnDt');

        if (nodeToReplace) {
            var node = this.currentPayment.createElement('ReqdExctnDt');
            var childNode = node.addElement('Dt');
            childNode.addTextNode(_formatDate(paymentInformation.getDueDate()));
            this.currentPayment.replaceChild(node, nodeToReplace);
        }
    }

    visitTransferInformation(transactionInformation) {
        var cdtTrfTxInf = super.visitTransferInformation(transactionInformation);
        if (!cdtTrfTxInf)
            return;
        
        var creditorAgent = cdtTrfTxInf.firstChildElement('CdtrAgt');
        if (!creditorAgent)
            return;

        var financialInstitution = creditorAgent.firstChildElement('FinInstnId');
        if (!financialInstitution)
            return;

        var nodeToReplace = financialInstitution.firstChildElement('BIC');
        if (nodeToReplace) {
            var node = financialInstitution.createElement('BICFI');
            node.addTextNode(nodeToReplace.text);
            financialInstitution.replaceChild(node, nodeToReplace);
        }

        return financialInstitution;

    }

}
