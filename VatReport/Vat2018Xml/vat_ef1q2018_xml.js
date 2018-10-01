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

function VatCHEffXml(banDocument, vatCHEff) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;

   this.vatCHEff = vatCHEff;
   this.scriptVersion = "20180901";

   this.ERROR_STRING_MIN_LENGTH = false;
   this.ERROR_STRING_MAX_LENGTH = false;
   this.ERROR_MISSING_VALUE = false;
   this.ERROR_NOT_ALLOWED_VALUE = false;
}

VatCHEffXml.prototype.addEffectiveReportingMethod = function (xml) {

   var grossOrNet = '1'; // 1=net; 2=gross => Nel nostro caso calcoliamo sul netto
   var opted = ''; // cifra 205
   var taxRate302 = '', turnover302 = ''; // cifra 302
   var taxRate301 = '', turnover301 = ''; // cifra 301
   var taxRate312 = '', turnover312 = ''; // cifra 312
   var taxRate311 = '', turnover311 = ''; // cifra 311
   var taxRate342 = '', turnover342 = ''; // cifra 342
   var taxRate341 = '', turnover341 = ''; // cifra 341
   var taxRate382 = [], turnover382 = []; // cifra 382
   var taxRate381 = [], turnover381 = []; // cifra 381
   var inputTaxMaterialAndServices = ''; // cifra 400
   var inputTaxInvestments = ''; // cifra 405
   var subsequentInputTaxDeduction = ''; // cifra 410
   var inputTaxCorrections = ''; // cifra 415
   var inputTaxReductions = ''; // cifra 420

   //cifra 205
   opted = this.formatAmount(this.vatCHEff.dataObject["205"].taxable);

   //302 - 301
   turnover302 = this.formatAmount(this.vatCHEff.dataObject["302"].taxable);
   taxRate302 = this.vatCHEff.getLegalTaxRate("302");
   turnover301 = this.formatAmount(this.vatCHEff.dataObject["301"].taxable);
   taxRate301 = this.vatCHEff.getLegalTaxRate("301");

   //312 - 311
   turnover312 = this.formatAmount(this.vatCHEff.dataObject["312"].taxable);
   taxRate312 = this.vatCHEff.getLegalTaxRate("312");
   turnover311 = this.formatAmount(this.vatCHEff.dataObject["311"].taxable);
   taxRate311 = this.vatCHEff.getLegalTaxRate("311");

   //342 - 341
   turnover342 = this.formatAmount(this.vatCHEff.dataObject["342"].taxable);
   taxRate342 = this.vatCHEff.getLegalTaxRate("342");
   turnover341 = this.formatAmount(this.vatCHEff.dataObject["341"].taxable);
   taxRate341 = this.vatCHEff.getLegalTaxRate("341");

   //cifra 382
   for (var key in this.vatCHEff.dataObject["382"].taxrates) {
      var object = this.vatCHEff.dataObject["382"].taxrates[key];
      turnover382.push(this.formatAmount(object.taxable));
      taxRate382.push(this.formatAmount(object.vatrate));
   }

   //cifra 381
   for (var key in this.vatCHEff.dataObject["381"].taxrates) {
      var object = this.vatCHEff.dataObject["381"].taxrates[key];
      turnover381.push(this.formatAmount(object.taxable));
      taxRate381.push(this.formatAmount(object.vatrate));
   }

   //cifra 400
   inputTaxMaterialAndServices = this.formatAmount(this.vatCHEff.dataObject["400"].posted);

   //cifra 405
   inputTaxInvestments = this.formatAmount(this.vatCHEff.dataObject["405"].posted);

   //cifra 410
   subsequentInputTaxDeduction = this.formatAmount(this.vatCHEff.dataObject["410"].posted);

   //cifra 415
   inputTaxCorrections = this.formatAmount(this.vatCHEff.dataObject["415"].posted);

   //cifra 420
   inputTaxReductions = this.formatAmount(this.vatCHEff.dataObject["420"].posted);

   var effectiveReportingMethodNode = xml.addElement('eCH-0217:effectiveReportingMethod');

   var grossOrNetNode = effectiveReportingMethodNode.addElement('eCH-0217:grossOrNet').addTextNode(grossOrNet);
   var optedNode = effectiveReportingMethodNode.addElement('eCH-0217:opted').addTextNode(opted);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate302);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover302);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate301);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover301);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate312);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover312);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate311);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover311);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate342);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover342);

   var suppliesPerTaxRateNode = effectiveReportingMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRateNode = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate341);
   var turnoverNode = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover341);

   for (var index=0; index < turnover382.length; index++) {
      var acquisitionTaxNode = effectiveReportingMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate382[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover382[index]);
   }
   
   for (var index=0; index < turnover381.length; index++) {
      var acquisitionTaxNode = effectiveReportingMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate381[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover381[index]);
   }

   var inputTaxMaterialAndServicesNode = effectiveReportingMethodNode.addElement('eCH-0217:inputTaxMaterialAndServices').addTextNode(inputTaxMaterialAndServices);
   var inputTaxInvestmentsNode = effectiveReportingMethodNode.addElement('eCH-0217:inputTaxInvestments').addTextNode(inputTaxInvestments);
   var subsequentInputTaxDeductionNode = effectiveReportingMethodNode.addElement('eCH-0217:subsequentInputTaxDeduction').addTextNode(subsequentInputTaxDeduction);
   var inputTaxCorrectionsNode = effectiveReportingMethodNode.addElement('eCH-0217:inputTaxCorrections').addTextNode(inputTaxCorrections);
   var inputTaxReductionsNode = effectiveReportingMethodNode.addElement('eCH-0217:inputTaxReductions').addTextNode(inputTaxReductions);

   return effectiveReportingMethodNode;
}

VatCHEffXml.prototype.addGeneralInformation = function (xml) {

   var uidOrganisationIdCategorie = 'CHE';
   var uidOrganisationId = '';
   var vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
   var company = this.banDocument.info("AccountingDataBase", "Company");

   if (vatNumber && vatNumber.match(/\d/g)) {
      uidOrganisationId = vatNumber.match(/\d/g).join(""); //numero IVA a 9 cifre, solo cifre (es. 111222333)
   }
   if (uidOrganisationId.length != 9) {
      var msg = this.vatCHEff.getErrorMessage(this.vatCHEff.ID_ERR_ORGANISATIONID, this.vatCHEff.getLang());
      this.banDocument.addMessage(msg, this.vatCHEff.helpId + "::" + this.vatCHEff.ID_ERR_ORGANISATIONID);
   }
   
   var organisationName = '';
   if (company) {
      organisationName = company; //Ragione sociale registrata nel sistema
   }
   var generationTime = new Date().toISOString().split('.')[0] + "Z"; //ISO 8601 format YYYY-MM-DDTHH:mm:ss.sssZ without milliseconds
   var reportingPeriodFrom = this.vatCHEff.param.periodStartDate; //format YYYY-MM-DD
   var reportingPeriodTill = this.vatCHEff.param.periodEndDate; //format YYYY-MM-DD
   var businessReferenceId = this.createFileName();
   var manufacturer = 'Banana.ch SA';
   var product = 'Banana Accounting';
   var programVersion = this.banDocument.info("Base", "ProgramVersion");
   var productVersion = '';
   if (programVersion.length >= 5)
      var productVersion = programVersion.substring(0, 5);

   var typeOfSubmission = this.vatCHEff.param.xml.typeOfSubmission;
   var formOfReporting = this.vatCHEff.param.xml.formOfReporting;
   businessReferenceId += "_" + typeOfSubmission; // es. "ef1q2018_20180101_20181231_1"

   var generalInformationNode = xml.addElement("eCH-0217:generalInformation");
   var uidNode = generalInformationNode.addElement("eCH-0217:uid");
   var uidOrganisationIdCategorieNode = uidNode.addElement("eCH-0097:uidOrganisationIdCategorie").addTextNode(uidOrganisationIdCategorie);
   var uidOrganisationIdNode = uidNode.addElement("eCH-0097:uidOrganisationId").addTextNode(uidOrganisationId);
   var organisationNameNode = generalInformationNode.addElement("eCH-0217:organisationName").addTextNode(organisationName);
   var generationTimeNode = generalInformationNode.addElement("eCH-0217:generationTime").addTextNode(generationTime);
   var reportingPeriodFromNode = generalInformationNode.addElement("eCH-0217:reportingPeriodFrom").addTextNode(reportingPeriodFrom);
   var reportingPeriodTillNode = generalInformationNode.addElement("eCH-0217:reportingPeriodTill").addTextNode(reportingPeriodTill);
   var typeOfSubmissionNode = generalInformationNode.addElement("eCH-0217:typeOfSubmission").addTextNode(typeOfSubmission);
   var formOfReportingNode = generalInformationNode.addElement("eCH-0217:formOfReporting").addTextNode(formOfReporting);
   var businessReferenceIdNode = generalInformationNode.addElement("eCH-0217:businessReferenceId").addTextNode(businessReferenceId);
   var sendingApplicationNode = generalInformationNode.addElement("eCH-0217:sendingApplication");
   var manufacturerNode = sendingApplicationNode.addElement("eCH-0058:manufacturer").addTextNode(manufacturer);
   var productNode = sendingApplicationNode.addElement("eCH-0058:product").addTextNode(product);
   var productVersionNode = sendingApplicationNode.addElement("eCH-0058:productVersion").addTextNode(productVersion);

   return generalInformationNode;
}

VatCHEffXml.prototype.addOtherFlowsOfFunds = function (xml) {

   var subsidies = ''; //cifra 900
   var donations = ''; //cifra 910

   //cifra 900
   subsidies = this.formatAmount(this.vatCHEff.dataObject["900"].taxable);

   //cifra 910
   donations = this.formatAmount(this.vatCHEff.dataObject["910"].taxable);

   var otherFlowsOfFundsNode = xml.addElement('eCH-0217:otherFlowsOfFunds');
   var subsidiesNode = otherFlowsOfFundsNode.addElement('eCH-0217:subsidies').addTextNode(subsidies);
   var donationsNode = otherFlowsOfFundsNode.addElement('eCH-0217:donations').addTextNode(donations);

   return otherFlowsOfFundsNode;
}

VatCHEffXml.prototype.addPayableTax = function (xml) {

   var payableTax = ''; //cifra 500-510
   var tot500 = this.vatCHEff.dataObject["500"].posted;
   var tot510 = this.vatCHEff.dataObject["510"].posted;

   if (tot500 != 0 && tot510 == 0) {
      payableTax = tot500;
   }
   else if (tot500 == 0 && tot510 != 0) {
      payableTax = Banana.SDecimal.invert(tot510); //needs to be negative if 510
   }
   else {
      payableTax = '0.00';
   }

   var payableTaxNode = xml.addElement('eCH-0217:payableTax').addTextNode(payableTax);

   return payableTaxNode;
}

VatCHEffXml.prototype.addSchemaAndNamespaces = function (xmlDocument) {

   var VATDeclarationNode = xmlDocument.addElement("eCH-0217:VATDeclaration");
   this.initSchemarefs();
   this.initNamespaces();

   var attrsSchemaLocation = '';
   for (var i in this.schemaRefs) {
      var schema = this.schemaRefs[i];
      if (schema.length > 0) {
         attrsSchemaLocation += schema;
      }
   }
   if (attrsSchemaLocation.length > 0) {
      VATDeclarationNode.setAttribute("xsi:schemaLocation", attrsSchemaLocation);
   }

   for (var i in this.namespaces) {
      var prefix = this.namespaces[i]['prefix'];
      var namespace = this.namespaces[i]['namespace'];
      VATDeclarationNode.setAttribute(prefix, namespace);
   }
   return VATDeclarationNode;
}

VatCHEffXml.prototype.addTurnoverComputation = function (xml) {

   var totalConsideration = ''; 			// cifra 200
   var suppliesToForeignCountries = ''; 	// cifra 220
   var suppliesAbroad = ''; 				// cifra 221
   var transferNotificationProcedure = ''; // cifra 225
   var suppliesExemptFromTax = ''; 		// cifra 230
   var reductionOfConsideration = ''; 		// cifra 235
   var amountVariousDeduction = '';		// cifra 280
   var descriptionVariousDeduction = '';   // cifra 280 descrizione

   descriptionVariousDeduction = this.vatCHEff.param.xml.descriptionVariousDeduction;

   //cifra 200
   totalConsideration = this.formatAmount(this.vatCHEff.dataObject["200"].taxable);

   //cifra 220
   suppliesToForeignCountries = this.formatAmount(this.vatCHEff.dataObject["220"].taxable);

   //cifra 221
   suppliesAbroad = this.formatAmount(this.vatCHEff.dataObject["221"].taxable);

   //cifra 225
   transferNotificationProcedure = this.formatAmount(this.vatCHEff.dataObject["225"].taxable);

   //cifra 230
   suppliesExemptFromTax = this.formatAmount(this.vatCHEff.dataObject["230"].taxable);

   //cifra 235
   reductionOfConsideration = this.formatAmount(this.vatCHEff.dataObject["235"].taxable);

   //cifra 280
   amountVariousDeduction = this.formatAmount(this.vatCHEff.dataObject["280"].taxable);

   var turnoverComputationNode = xml.addElement('eCH-0217:turnoverComputation');
   var totalConsiderationNode = turnoverComputationNode.addElement('eCH-0217:totalConsideration').addTextNode(totalConsideration);
   var suppliesToForeignCountriesNode = turnoverComputationNode.addElement('eCH-0217:suppliesToForeignCountries').addTextNode(suppliesToForeignCountries);
   var suppliesAbroadNode = turnoverComputationNode.addElement('eCH-0217:suppliesAbroad').addTextNode(suppliesAbroad);
   var transferNotificationProcedureNode = turnoverComputationNode.addElement('eCH-0217:transferNotificationProcedure').addTextNode(transferNotificationProcedure);
   var suppliesExemptFromTaxNode = turnoverComputationNode.addElement('eCH-0217:suppliesExemptFromTax').addTextNode(suppliesExemptFromTax);
   var reductionOfConsiderationNode = turnoverComputationNode.addElement('eCH-0217:reductionOfConsideration').addTextNode(reductionOfConsideration);
   var variousDeductionNode = turnoverComputationNode.addElement('eCH-0217:variousDeduction');
   var amountVariousDeductionNode = variousDeductionNode.addElement('eCH-0217:amountVariousDeduction').addTextNode(amountVariousDeduction);
   var descriptionVariousDeductionNode = variousDeductionNode.addElement('eCH-0217:descriptionVariousDeduction').addTextNode(descriptionVariousDeduction);

   return turnoverComputationNode;
}

/* Check results with Banana values */
VatCHEffXml.prototype.checkResults = function () {

   Banana.application.showMessages(true);

   //Totale prestazioni imponibili
   if (this.vatCHEff.dataObject["299"].taxable !== this.vatCHEff.dataObject["399"].taxable) {
      this.banDocument.addMessage('> ' + this.vatCHEff.texts.checkVatCode3);
   }

   var totalFromBanana = this.vatCHEff.getTotalFromBanana();
   var totalFromReport = Banana.SDecimal.subtract(this.vatCHEff.dataObject["399"].posted, this.vatCHEff.dataObject["479"].posted, { 'decimals': 2 });
   var checkSum = Banana.SDecimal.add(totalFromReport, totalFromBanana);

   //Riga 1 "Risultato Banana Totale IVA"
   //Riga 2 "Importo da pagare all'AFC calcolato"
   //Riga 3 "Somma di controllo"
   if (checkSum < -0.01 && 0.01 < checkSum) {
      this.banDocument.addMessage(
         this.vatCHEff.texts.xml + "\n" +
         ">" + this.vatCHEff.texts.bananaVatResult + ": " + Banana.Converter.toLocaleNumberFormat(totalFromBanana) + " CHF\n" +
         ">" + this.vatCHEff.texts.vatToPayXml + ": " + Banana.Converter.toLocaleNumberFormat(totalFromReport) + " CHF\n" +
         ">" + this.vatCHEff.texts.checkSum + ": " + Banana.Converter.toLocaleNumberFormat(checkSum) + " CHF\n"
      );
   }
   
   
   //Rounding differences
   var roundingDifference = '';
   for (var key in this.vatCHEff.dataObject) {
      var currentBal = this.vatCHEff.dataObject[key];
      roundingDifference = Banana.SDecimal.add(currentBal.roundingDifference, roundingDifference);
   }
   var msg = '';
   if (!Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
      /*for (var key in this.vatCHEff.dataObject) {
         var currentBal = this.vatCHEff.dataObject[key];
         if (currentBal.roundingDifference && !Banana.SDecimal.isZero(currentBal.roundingDifference)) {
            msg += "Rounding difference by key " + key + " " + currentBal.roundingDifference + 
               " from banana " + Banana.Converter.toLocaleNumberFormat(currentBal.postedFromBanana) + " recalculated " + Banana.Converter.toLocaleNumberFormat(currentBal.posted) + '\n';
         }
      }*/
      msg += "Total rounding difference " + roundingDifference + " CHF";
      this.banDocument.addMessage(msg);
   }

}

/* Create the name of the xml file */
VatCHEffXml.prototype.createFileName = function () {

   var fileName = "ef1q2018_";
   var currentDateString = "";
   var startDate = "";
   var yearStartDate = "";
   var monthStartDate = "";
   var dayStartDate = "";
   var endDate = "";
   var yearEndDate = "";
   var monthEndDate = "";
   var dayEndDate = "";

   //Start date string
   startDate = Banana.Converter.toDate(this.vatCHEff.param.periodStartDate.match(/\d/g).join(""));
   yearStartDate = startDate.getFullYear().toString();
   monthStartDate = (startDate.getMonth() + 1).toString();
   if (monthStartDate.length < 2) {
      monthStartDate = "0" + monthStartDate;
   }
   dayStartDate = startDate.getDate().toString();
   if (dayStartDate.length < 2) {
      dayStartDate = "0" + dayStartDate;
   }

   //End date string
   endDate = Banana.Converter.toDate(this.vatCHEff.param.periodEndDate.match(/\d/g).join(""));
   yearEndDate = endDate.getFullYear().toString();
   monthEndDate = (endDate.getMonth() + 1).toString();
   if (monthEndDate.length < 2) {
      monthEndDate = "0" + monthEndDate;
   }
   dayEndDate = endDate.getDate().toString();
   if (dayEndDate.length < 2) {
      dayEndDate = "0" + dayEndDate;
   }

   //Final date string
   currentDateString = yearStartDate + monthStartDate + dayStartDate + "_" + yearEndDate + monthEndDate + dayEndDate;

   //Return the xml file name
   fileName += currentDateString;
   return fileName;
}

/* Creates the XML document */
VatCHEffXml.prototype.createXml = function () {

   /* Create XML */
   var xmlDocument = Banana.Xml.newDocument("root");

   var VATDeclarationNode = this.addSchemaAndNamespaces(xmlDocument);
   var generalInformationNode = this.addGeneralInformation(VATDeclarationNode);
   var turnoverComputationNode = this.addTurnoverComputation(VATDeclarationNode);
   var effectiveReportingMethodNode = this.addEffectiveReportingMethod(VATDeclarationNode);
   var payableTaxNode = this.addPayableTax(VATDeclarationNode);
   var otherFlowsOfFundsNode = this.addOtherFlowsOfFunds(VATDeclarationNode);

   var output = Banana.Xml.save(xmlDocument);
   //Banana.document.addMessage(output);

   //Check errors
   if (this.ERROR_STRING_MIN_LENGTH || this.ERROR_STRING_MAX_LENGTH || this.ERROR_MISSING_VALUE || this.ERROR_NOT_ALLOWED_VALUE) {
      //return;
   }


   this.checkResults();

   return output;
}

VatCHEffXml.prototype.formatAmount = function (amount) {
   if (amount == 0 || !amount || amount == null) {
      amount = "0.00";
   }
   // return Banana.Converter.toInternalNumberFormat(amount);
   return amount;
}

VatCHEffXml.prototype.initNamespaces = function () {
   this.namespaces = [
      {
         'namespace': 'http://www.ech.ch/xmlns/eCH-0058/5',
         'prefix': 'xmlns:eCH-0058'
      },
      {
         'namespace': 'http://www.ech.ch/xmlns/eCH-0097/3',
         'prefix': 'xmlns:eCH-0097'
      },
      {
         'namespace': 'http://www.ech.ch/xmlns/eCH-0217/1',
         'prefix': 'xmlns:eCH-0217'
      },
      {
         'namespace': 'http://www.w3.org/2001/XMLSchema-instance',
         'prefix': 'xmlns:xsi'
      },
   ];
}

VatCHEffXml.prototype.initSchemarefs = function () {
   this.schemaRefs = [
      'http://www.ech.ch/xmlns/eCH-0217/1 eCH-0217-1-0.xsd'
   ];
}

/* Save the xml file */
VatCHEffXml.prototype.saveData = function (output) {

   var fileName = this.createFileName();
   fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)");

   if (fileName.length) {
      var file = Banana.IO.getLocalFile(fileName);
      file.codecName = "UTF-8";
      file.write(output);
      if (file.errorString) {
         Banana.Ui.showInformation("Write error", file.errorString);
      }
      else {
         if (this.vatCHEff.param.xml.openXmlFile) {
            Banana.IO.openUrl(fileName);
         }
      }
   }
}

