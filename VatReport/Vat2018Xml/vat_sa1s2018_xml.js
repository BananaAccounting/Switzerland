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
//TODO controllare checkStringLength

function VatCHSaldoXml(banDocument, vatCHSaldo) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;

   this.vatCHSaldo = vatCHSaldo;
   this.scriptVersion = "20180901";

   this.ERROR_STRING_MIN_LENGTH = false;
   this.ERROR_STRING_MAX_LENGTH = false;
   this.ERROR_MISSING_VALUE = false;
   this.ERROR_NOT_ALLOWED_VALUE = false;
}

VatCHSaldoXml.prototype.addFlatTaxRateMethod = function (xml) {

   //var grossOrNet = '1'; // 1=net; 2=gross => Nel nostro caso calcoliamo sul netto
   //var opted = ''; // cifra 205
   var taxRate322 = '', turnover322 = '', activity322 = ''; // cifra 322
   var taxRate332 = '', turnover332 = '', activity332 = ''; // cifra 332
   var taxRate321 = '', turnover321 = '', activity321 = ''; // cifra 321
   var taxRate331 = '', turnover331 = '', activity331 = ''; // cifra 331
   var taxRate382 = [], turnover382 = []; // cifra 382
   var taxRate381 = [], turnover381 = []; // cifra 381
   var taxRate470 = '', turnover470 = ''; // cifra 470
   var taxRate471 = '', turnover471 = ''; // cifra 471

   activity322 = this.vatCHSaldo.param.xml.activity322;
   activity332 = this.vatCHSaldo.param.xml.activity332;
   activity321 = this.vatCHSaldo.param.xml.activity321;
   activity331 = this.vatCHSaldo.param.xml.activity331;
   
   var taxRates = this.vatCHSaldo.getTaxRates();

   //322
   turnover322 = this.formatAmount(this.vatCHSaldo.dataObject["322"].taxable);
   taxRate322 = Banana.SDecimal.round(taxRates["322"].vatRate, { 'decimals': 2 });

   //332
   turnover332 = this.formatAmount(this.vatCHSaldo.dataObject["332"].taxable);
   taxRate332 = Banana.SDecimal.round(taxRates["332"].vatRate, { 'decimals': 2 });

   //321
   turnover321 = this.formatAmount(this.vatCHSaldo.dataObject["321"].taxable);
   taxRate321 = Banana.SDecimal.round(taxRates["321"].vatRate, { 'decimals': 2 });

   //331
   turnover331 = this.formatAmount(this.vatCHSaldo.dataObject["331"].taxable);
   taxRate331 = Banana.SDecimal.round(taxRates["331"].vatRate, { 'decimals': 2 });

   //cifra 382
   for (var key in this.vatCHSaldo.dataObject["382"].taxrates) {
      var object = this.vatCHSaldo.dataObject["382"].taxrates[key];
      turnover382.push(this.formatAmount(object.taxable));
      taxRate382.push(this.formatAmount(object.vatrate));
   }

   //cifra 381
   for (var key in this.vatCHSaldo.dataObject["381"].taxrates) {
      var object = this.vatCHSaldo.dataObject["381"].taxrates[key];
      turnover381.push(this.formatAmount(object.taxable));
      taxRate381.push(this.formatAmount(object.vatrate));
   }

   //cifra 470
   turnover470 = this.formatAmount(this.vatCHSaldo.dataObject["470"].posted);

   //cifra 471
   turnover471 = this.formatAmount(this.vatCHSaldo.dataObject["471"].posted);

   var flatTaxRateMethodNode = xml.addElement('eCH-0217:flatTaxRateMethod');

   var suppliesPerTaxRateNode = flatTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var activity322Node = suppliesPerTaxRateNode.addElement('eCH-0217:activity').addTextNode(activity322);
   var taxRate322Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate322);
   var turnover322Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover322);

   var suppliesPerTaxRateNode = flatTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var activity332Node = suppliesPerTaxRateNode.addElement('eCH-0217:activity').addTextNode(activity332);
   var taxRate332Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate332);
   var turnover332Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover332);

   var suppliesPerTaxRateNode = flatTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var activity321Node = suppliesPerTaxRateNode.addElement('eCH-0217:activity').addTextNode(activity321);
   var taxRate321Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate321);
   var turnover321Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover321);

   var suppliesPerTaxRateNode = flatTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var activity331Node = suppliesPerTaxRateNode.addElement('eCH-0217:activity').addTextNode(activity331);
   var taxRate331Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate331);
   var turnover331Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover331);

   for (var index=0; index < turnover382.length; index++) {
      var acquisitionTaxNode = flatTaxRateMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate382[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover382[index]);
   }
   
   for (var index=0; index < turnover381.length; index++) {
      var acquisitionTaxNode = flatTaxRateMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate381[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover381[index]);
   }

   var compensationExportNode = flatTaxRateMethodNode.addElement('eCH-0217:compensationExport').addTextNode(turnover470);
   var deemedInputTaxDeductionNode = flatTaxRateMethodNode.addElement('eCH-0217:deemedInputTaxDeduction').addTextNode(turnover471);
   //var marginTaxationNode = flatTaxRateMethodNode('eCH-0217:marginTaxation').addTextNode('0.00');

   return flatTaxRateMethodNode;
}

VatCHSaldoXml.prototype.addGeneralInformation = function (xml) {

   var uidOrganisationIdCategorie = 'CHE';
   var uidOrganisationId = '';
   var vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
   var company = this.banDocument.info("AccountingDataBase", "Company");
   if (vatNumber && vatNumber.match(/\d/g)) {
      uidOrganisationId = vatNumber.match(/\d/g).join(""); //numero IVA a 9 cifre, solo cifre (es. 111222333)
   }
   var organisationName = '';
   if (company) {
      organisationName = company; //Ragione sociale registrata nel sistema
   } var generationTime = new Date().toISOString().split('.')[0] + "Z"; //ISO 8601 format YYYY-MM-DDTHH:mm:ss.sssZ without milliseconds
   var reportingPeriodFrom = this.vatCHSaldo.param.periodStartDate; //format YYYY-MM-DD
   var reportingPeriodTill = this.vatCHSaldo.param.periodEndDate; //format YYYY-MM-DD
   var businessReferenceId = this.createFileName();
   var manufacturer = 'Banana.ch SA';
   var product = 'Banana Accounting';
   var programVersion = this.banDocument.info("Base", "ProgramVersion");
   var productVersion = '';
   if (programVersion.length >= 5)
      var productVersion = programVersion.substring(0, 5);

   //Check the vat number length
   //checkStringLength("uidOrganisationId", uidOrganisationId.toString(), 9, 9);

   var typeOfSubmission = this.vatCHSaldo.param.xml.typeOfSubmission;
   var formOfReporting = this.vatCHSaldo.param.xml.formOfReporting;
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

VatCHSaldoXml.prototype.addNetTaxRateMethod = function (xml) {

   //var opted = ''; // cifra 205
   var taxRate322 = '', turnover322 = ''; // cifra 322
   var taxRate332 = '', turnover332 = ''; // cifra 332
   var taxRate321 = '', turnover321 = ''; // cifra 321
   var taxRate331 = '', turnover331 = ''; // cifra 331
   var taxRate382 = [], turnover382 = []; // cifra 382
   var taxRate381 = [], turnover381 = []; // cifra 381
   var taxRate470 = '', turnover470 = ''; // cifra 470
   var taxRate471 = '', turnover471 = ''; // cifra 471

   var taxRates = this.vatCHSaldo.getTaxRates();

   //322
   turnover322 = this.formatAmount(this.vatCHSaldo.dataObject["322"].taxable);
   taxRate322 = Banana.SDecimal.round(taxRates["322"].vatRate, { 'decimals': 2 });

   //332
   turnover332 = this.formatAmount(this.vatCHSaldo.dataObject["332"].taxable);
   taxRate332 = Banana.SDecimal.round(taxRates["332"].vatRate, { 'decimals': 2 });

   //321
   turnover321 = this.formatAmount(this.vatCHSaldo.dataObject["321"].taxable);
   taxRate321 = Banana.SDecimal.round(taxRates["321"].vatRate, { 'decimals': 2 });

   //331
   turnover331 = this.formatAmount(this.vatCHSaldo.dataObject["331"].taxable);
   taxRate331 = Banana.SDecimal.round(taxRates["331"].vatRate, { 'decimals': 2 });

   //cifra 382
   for (var key in this.vatCHSaldo.dataObject["382"].taxrates) {
      var object = this.vatCHSaldo.dataObject["382"].taxrates[key];
      turnover382.push(this.formatAmount(object.taxable));
      taxRate382.push(this.formatAmount(object.vatrate));
   }

   //cifra 381
   for (var key in this.vatCHSaldo.dataObject["381"].taxrates) {
      var object = this.vatCHSaldo.dataObject["381"].taxrates[key];
      turnover381.push(this.formatAmount(object.taxable));
      taxRate381.push(this.formatAmount(object.vatrate));
   }

   //cifra 470
   turnover470 = this.formatAmount(this.vatCHSaldo.dataObject["470"].posted);

   //cifra 471
   turnover471 = this.formatAmount(this.vatCHSaldo.dataObject["471"].posted);

   var netTaxRateMethodNode = xml.addElement('eCH-0217:netTaxRateMethod');

   var suppliesPerTaxRateNode = netTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRate322Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate322);
   var turnover322Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover322);

   var suppliesPerTaxRateNode = netTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRate332Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate332);
   var turnover332Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover332);

   var suppliesPerTaxRateNode = netTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRate321Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate321);
   var turnover321Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover321);

   var suppliesPerTaxRateNode = netTaxRateMethodNode.addElement('eCH-0217:suppliesPerTaxRate');
   var taxRate331Node = suppliesPerTaxRateNode.addElement('eCH-0217:taxRate').addTextNode(taxRate331);
   var turnover331Node = suppliesPerTaxRateNode.addElement('eCH-0217:turnover').addTextNode(turnover331);

   for (var index=0; index < turnover382.length; index++) {
      var acquisitionTaxNode = netTaxRateMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate382[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover382[index]);
   }
   
   for (var index=0; index < turnover381.length; index++) {
      var acquisitionTaxNode = netTaxRateMethodNode.addElement('eCH-0217:acquisitionTax');
      var taxRateNode = acquisitionTaxNode.addElement('eCH-0217:taxRate').addTextNode(taxRate381[index]);
      var turnoverNode = acquisitionTaxNode.addElement('eCH-0217:turnover').addTextNode(turnover381[index]);
   }

   var compensationExportNode = netTaxRateMethodNode.addElement('eCH-0217:compensationExport').addTextNode(turnover470);
   var deemedInputTaxDeductionNode = netTaxRateMethodNode.addElement('eCH-0217:deemedInputTaxDeduction').addTextNode(turnover471);
   //var marginTaxationNode = netTaxRateMethodNode('eCH-0217:marginTaxation').addTextNode('0.00');

   return netTaxRateMethodNode;
}

VatCHSaldoXml.prototype.addOtherFlowsOfFunds = function (xml) {

   var subsidies = ''; //cifra 900
   var donations = ''; //cifra 910

   //cifra 900
   subsidies = this.formatAmount(this.vatCHSaldo.dataObject["900"].taxable);

   //cifra 910
   donations = this.formatAmount(this.vatCHSaldo.dataObject["910"].taxable);

   var otherFlowsOfFundsNode = xml.addElement('eCH-0217:otherFlowsOfFunds');
   var subsidiesNode = otherFlowsOfFundsNode.addElement('eCH-0217:subsidies').addTextNode(subsidies);
   var donationsNode = otherFlowsOfFundsNode.addElement('eCH-0217:donations').addTextNode(donations);

   return otherFlowsOfFundsNode;
}

VatCHSaldoXml.prototype.addPayableTax = function (xml) {

   var payableTax = ''; //cifra 500-510
   var tot500 = this.vatCHSaldo.dataObject["500"].posted;
   var tot510 = this.vatCHSaldo.dataObject["510"].posted;

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

VatCHSaldoXml.prototype.addSchemaAndNamespaces = function (xmlDocument) {

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

VatCHSaldoXml.prototype.addTurnoverComputation = function (xml) {

   var totalConsideration = '';            // cifra 200
   var suppliesToForeignCountries = '';    // cifra 220
   var suppliesAbroad = '';                // cifra 221
   var transferNotificationProcedure = ''; // cifra 225
   var suppliesExemptFromTax = '';         // cifra 230
   var reductionOfConsideration = '';      // cifra 235
   var amountVariousDeduction = '';        // cifra 280
   var descriptionVariousDeduction = '';   // cifra 280 descrizione

   descriptionVariousDeduction = this.vatCHSaldo.param.xml.descriptionVariousDeduction;

   //cifra 200
   totalConsideration = this.formatAmount(this.vatCHSaldo.dataObject["200"].taxable);

   //cifra 220
   suppliesToForeignCountries = this.formatAmount(this.vatCHSaldo.dataObject["220"].taxable);

   //cifra 221
   suppliesAbroad = this.formatAmount(this.vatCHSaldo.dataObject["221"].taxable);

   //cifra 225
   transferNotificationProcedure = this.formatAmount(this.vatCHSaldo.dataObject["225"].taxable);

   //cifra 230
   suppliesExemptFromTax = this.formatAmount(this.vatCHSaldo.dataObject["230"].taxable);

   //cifra 235
   reductionOfConsideration = this.formatAmount(this.vatCHSaldo.dataObject["235"].taxable);

   //cifra 280
   amountVariousDeduction = this.formatAmount(this.vatCHSaldo.dataObject["280"].taxable);

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
VatCHSaldoXml.prototype.checkResults = function () {

   Banana.application.showMessages(true);

   //banDoc.addMessage(this.param.xml);

   //Totale prestazioni imponibili
   if (this.vatCHSaldo.dataObject["299"].taxable !== this.vatCHSaldo.dataObject["399"].taxable) {
      //TODO vedere dove riprendere il msg
      this.banDocument.addMessage('> ' + this.vatCHSaldo.texts.checkVatCode3);
   }

   var totalFromBanana = this.vatCHSaldo.getTotalFromBanana();
   var totalFromReport = Banana.SDecimal.subtract(this.vatCHSaldo.dataObject["399"].posted, this.vatCHSaldo.dataObject["479"].posted, { 'decimals': 2 });

   //Quando le aliquote vengono inserite manualmente tramite il dialogo
   var trovatePercentualiAliquote = false;
   var taxRates = this.vatCHSaldo.getTaxRates();
   for (var key in taxRates) {
      if (taxRates[key].fromTableVatCode) {
         trovatePercentualiAliquote = true;
         break;
      }
   }

   if (!trovatePercentualiAliquote) {
      //Riga 1 "Importo aliquote IVA da registrare in contabilità"
      //Riga 2 "Importo IVA calcolato in automatico in Banana"
      //Riga 3 "Risultato Banana Totale IVA"
      //Riga 4 "Importo da pagare all'AFC calcolato nel formulario"
      //Riga 5 "Somma di controllo

      var risBananaTotIva = Banana.SDecimal.add(this.vatCHSaldo.dataObject["aliquotedaregistrare"].posted, Banana.SDecimal.invert(totalFromBanana));
      var checkSum = Banana.SDecimal.subtract(totalFromReport, risBananaTotIva);
      //If the difference is > or < 0.01 cts, it calls an error
	  Banana.console.debug(checkSum + " " + totalFromReport + " " + risBananaTotIva);
      if (checkSum < -0.01 && 0.01 < checkSum) {
         this.banDocument.addMessage(
            this.vatCHSaldo.texts.xml + "\n" +
            ">" + this.vatCHSaldo.texts.amountToRegister + ": " + this.vatCHSaldo.dataObject["aliquotedaregistrare"].postedformatted + " CHF\n" +
            ">" + this.vatCHSaldo.texts.amountCalculatedInBanana + ": " + Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totalFromBanana)) + " CHF\n" +
            ">" + this.vatCHSaldo.texts.bananaVatResult + ": " + Banana.Converter.toLocaleNumberFormat(risBananaTotIva) + " CHF\n" +
            ">" + this.vatCHSaldo.texts.vatToPayXml + ": " + Banana.Converter.toLocaleNumberFormat(totalFromReport) + " CHF\n" +
            ">" + this.vatCHSaldo.texts.checkSum + ": " + Banana.Converter.toLocaleNumberFormat(checkSum) + " CHF\n"
         );
      }
   }
   //Quando le aliquote vengono prese dalla tabella codici iva in Banana
   else {
      //Riga 1 "Risultato Banana Totale IVA"
      //Riga 2 "Importo da pagare all'AFC calcolato nel formulario"
      //Riga 3 "Somma di controllo deve essere ugule a 0"

      var checkSum = Banana.SDecimal.add(totalFromReport, totalFromBanana);

      //If the difference is > or < 0.01 cts, it calls an error
      if (checkSum < -0.01 && 0.01 < checkSum) {
         this.banDocument.addMessage(
            this.vatCHSaldo.texts.xml + "\n" +
            ">" + this.vatCHSaldo.texts.bananaVatResult + ": " + Banana.Converter.toLocaleNumberFormat(totalFromBanana) + " CHF\n" +
            ">" + this.vatCHSaldo.texts.vatToPayXml + ": " + Banana.Converter.toLocaleNumberFormat(totalFromReport) + " CHF\n" +
            ">" + this.vatCHSaldo.texts.checkSum + ": " + Banana.Converter.toLocaleNumberFormat(checkSum) + " CHF\n"
         );
      }
   }
}

/* Create the name of the xml file */
VatCHSaldoXml.prototype.createFileName = function () {

   var fileName = "sa1s2018_";
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
   startDate = Banana.Converter.toDate(this.vatCHSaldo.param.periodStartDate.match(/\d/g).join(""));
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
   endDate = Banana.Converter.toDate(this.vatCHSaldo.param.periodEndDate.match(/\d/g).join(""));
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
VatCHSaldoXml.prototype.createXml = function () {

   /*
   //Check if used tax rates are approved by the FTA SuisseTax
   //When a used tax rate is not approved show a message
   var checkTaxRate322 = checkTaxRate(Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra322));
   var checkTaxRate332 = checkTaxRate(Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra332));
   var checkTaxRate321 = checkTaxRate(Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra321));
   var checkTaxRate331 = checkTaxRate(Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra331));
   if (!isTest) {

       if (checkTaxRate322) {
           Banana.document.addMessage(param.description15  + " '" + Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra322) + "' " + param.checkVatCode2 + " XML");
       }
       
       if (checkTaxRate332) {
           Banana.document.addMessage(param.description15  + " '" + Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra332) + "' " + param.checkVatCode2 + " XML");
       }
       
       if (checkTaxRate321) {
           Banana.document.addMessage(param.description15  + " '" + Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra321) + "' " + param.checkVatCode2 + " XML");
       }
       
       if (checkTaxRate331) {
           Banana.document.addMessage(param.description15  + " '" + Banana.Converter.toLocaleNumberFormat(dialogParam.aliquotaCifra331) + "' " + param.checkVatCode2 + " XML");
       }
   }

   //When a used tax rate is not approved stop script execution before the xml is created
   if (checkTaxRate322 || checkTaxRate332 || checkTaxRate321 || checkTaxRate331) {
       return;
   }
   */

   /* Create XML */
   var xmlDocument = Banana.Xml.newDocument("root");

   var VATDeclarationNode = this.addSchemaAndNamespaces(xmlDocument);
   var generalInformationNode = this.addGeneralInformation(VATDeclarationNode);
   var turnoverComputationNode = this.addTurnoverComputation(VATDeclarationNode);

   //Choose between netTaxRateMethod (default) and flatTaxRateMethod
   if (this.vatCHSaldo.param.xml.method == "1") {
      var flatTaxRateMethodNode = this.addFlatTaxRateMethod(VATDeclarationNode);
   } else { //default
      var netTaxRateMethodNode = this.addNetTaxRateMethod(VATDeclarationNode);
   }

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

VatCHSaldoXml.prototype.formatAmount = function (amount) {
   if (amount == 0 || !amount || amount == null) {
      amount = "0.00";
   }
   return Banana.SDecimal.round(amount, {'decimals':2});
}

VatCHSaldoXml.prototype.initNamespaces = function () {
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

VatCHSaldoXml.prototype.initSchemarefs = function () {
   this.schemaRefs = [
      'http://www.ech.ch/xmlns/eCH-0217/1 eCH-0217-1-0.xsd'
   ];
}

/* Save the xml file */
VatCHSaldoXml.prototype.saveData = function (output) {

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
         if (this.vatCHSaldo.param.xml.openXmlFile) {
            Banana.IO.openUrl(fileName);
         }
      }
   }
}

/*
// Only the tax rates listed may be transmitted.
// For returns using the net or flat tax rate method, only the net or flat tax rates approved by the FTA may be used.
// If other rates are transmitted, FTA SuisseTax will not transfer the XML elements to the online form during the import 
function checkTaxRate(taxRate) {
    Number(taxRate = Banana.Converter.toInternalNumberFormat(taxRate)); //convert to Number (ex. 0.6000 = 0.6)
    var validTaxRates = ['0.10','0.60','1.20','2.00','2.80','3.50','4.30','5.10','5.90','6.50'];
    var isValid = arrayContains(validTaxRates, taxRate);
    if (!isValid) {
        //Banana.document.addMessage(param.description15  + " '" + taxRate + "' " + param.checkVatCode2 + " XML");
        return true;
    }
    else {
        return false;
    }
}
*/

/**/



/*function checkStringLength(xmlelement, string, minLength, maxLength) {

   if (string.length < minLength) {
      ERROR_STRING_MIN_LENGTH = true;
      Banana.document.addMessage("<" + xmlelement + ">: " + param.stringToShort);
   }

   if (string.length > maxLength) {
      ERROR_STRING_MAX_LENGTH = true;
      Banana.document.addMessage("<" + xmlelement + ">: " + param.stringToLong);
   }
}*/

