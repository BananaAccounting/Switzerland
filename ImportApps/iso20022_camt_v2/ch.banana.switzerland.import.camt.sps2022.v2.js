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

// @includejs = ch.banana.switzerland.import.camt.sps2021.v2.js

/**
 * Define the reader for Iso 20022 camt messages 
 * new version SPS 2022 (valid from November 2022)
 */
var SPS2022CamtFile = class SPS2022CamtFile extends ISO20022CamtFile {
   constructor() {
      super();
      this.schema = '';
   }

   getStatementNodes() {
      if (!this.document)
         return [];

      var statementNode = null
      var statementNodes = [];
      var docNode = this.document.firstChildElement(); // 'Document'
      this.schema = docNode.attribute('xmlns');
      return super.getStatementNodes();
   }

   readStatementEntryDetailsAddress(detailsNode, isCredit) {
      //old versions call parent class ISO20022CamtFile
      if (!this.schema.endsWith(".08")) {
         return super.readStatementEntryDetailsAddress(detailsNode, isCredit);
      }

      var rltdPtiesNode = detailsNode.firstChildElement('RltdPties'); //Optional
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
         else
            return ''; // No childs found
      } else {
         if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
         else if (rltdPtiesNode.hasChildElements('Cdtr'))
            addressNode = rltdPtiesNode.firstChildElement('Cdtr')
         else if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
            addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
         else if (rltdPtiesNode.hasChildElements('Dbtr'))
            addressNode = rltdPtiesNode.firstChildElement('Dbtr')
         else
            return ''; // No childs found
      }

      // 'Pty' new element not present in the previous version SPS2021
      if (addressNode.hasChildElements('Pty')) {
         addressNode = addressNode.firstChildElement('Pty');
      }

      var addressStrings = [];
      if (addressNode.firstChildElement('Nm'))
         addressStrings.push(addressNode.firstChildElement('Nm').text);
      var pstlAdrNode = addressNode.firstChildElement('PstlAdr');
      if (pstlAdrNode) {
         if (pstlAdrNode.hasChildElements('AdrLine')) {
            var adrLineNode = pstlAdrNode.firstChildElement('AdrLine');
            while (adrLineNode) {
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
}
