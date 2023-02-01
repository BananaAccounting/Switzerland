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

//ID_PAIN_FORMAT_001_001_03 DomBuilder declared in ch.banana.pain.iso.2009.js
//ID_PAIN_FORMAT_001_001_09_CH_03 DomBuilderSPS2022
var DomBuilderSPS2022 = class DomBuilderSPS2022 extends DomBuilder {
	constructor(painFormat, withSchemaLocation) {
		super(painFormat, withSchemaLocation);
        this.root.setAttribute('xmlns', 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09');
        if (withSchemaLocation) {
            this.root.setAttribute('xsi:schemaLocation', 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09 pain.001.001.09.ch.03.xsd');
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
