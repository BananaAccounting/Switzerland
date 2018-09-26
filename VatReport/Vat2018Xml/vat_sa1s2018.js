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
// @id = vat_sa1s2018.js
// @api = 1.0
// @pubdate = 2018-09-25
// @publisher = Banana.ch SA
// @description = VAT return since 2018
// @description.it = Rendiconto IVA dal 2018
// @description.de = MWST-Abrechnung ab 2018
// @description.fr = Décompte TVA depuis 2018
// @task = app.command
// @doctype = 100.110;110.110;130.110;100.130
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = vat_dialog.js
// @includejs = vat_sa1s2018_report.js
// @includejs = vat_sa1s2018_xml.js

function exec(inData, options) {
   if (!Banana.document)
      return "@Cancel";

   var vatCHSaldo = new VatCHSaldo(Banana.document);
   if (!vatCHSaldo.verifyBananaVersion()) {
      return "@Cancel";
   }

   var param = {};
   if (inData.length > 0) {
      param = JSON.parse(inData);
   }
   else if (options && options.useLastSettings) {
      var savedParam = Banana.document.getScriptSettings();
      if (savedParam.length > 0)
         param = JSON.parse(savedParam);
   }
   else {
      if (!settingsDialog())
         return "@Cancel";
      var savedParam = Banana.document.getScriptSettings();
      if (savedParam.length > 0)
         param = JSON.parse(savedParam);
   }
   vatCHSaldo.setParam(param);
   vatCHSaldo.loadData();

   if (vatCHSaldo.param.outputScript == 0) {
      //Preview report
      var vatCHSaldoReport = new VatCHSaldoReport(Banana.document, vatCHSaldo);
      var report = vatCHSaldoReport.createVatReport();
      var stylesheet = vatCHSaldoReport.createStyleSheet();
      Banana.Report.preview(report, stylesheet);
   }
   else if (vatCHSaldo.param.outputScript == 1) {
      //XML
      var vatCHSaldoXml = new VatCHSaldoXml(Banana.document, vatCHSaldo);
      var xml = vatCHSaldoXml.createXml();
      vatCHSaldoXml.saveData(xml);
   }
   return;
}

function settingsDialog() {
   var vatCHSaldo = new VatCHSaldo(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      vatCHSaldo.setParam(JSON.parse(savedParam));
   }

   var rtnValue = settingsVatDialog(vatCHSaldo);
   if (!rtnValue)
      return false;

   var paramToString = JSON.stringify(vatCHSaldo.param);
   Banana.document.setScriptSettings(paramToString);
   return true;
}

function VatCHSaldo(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.loadTexts();
   this.initParam();

   this.grColumn = "Gr1";
   this.dialogName = "vat_sa1s2018.dialog.ui";
   this.helpId = "vat_sa1s2018";

   //errors
   this.ID_ERR_TAXRATE_NOTVALID = "ID_ERR_TAXRATE_NOTVALID";
   this.ID_ERR_TAXRATE_TOOMANY = "ID_ERR_TAXRATE_TOOMANY";
   this.ID_ERR_METHOD_NOTSUPPORTED = "ID_ERR_METHOD_NOTSUPPORTED";
   this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
 
   this.dataObject = {};
}

/* Calculate the amount with the vat rate defined in the dialog */
VatCHSaldo.prototype.calculateRoundingDifference = function (vatBalances, grText) {
   
   //rounding difference is calculated for cifra from 300 to 390 (suppliesPerTaxRate 0..100) and 38x (acquisitionTax 0.100)
   var nKey = parseInt(grText);
   if (nKey < 300 || nKey >=390)
      return;

   //for cifra 300-379 vat amount is calculated on gross amount
   var useGrossAmount=false; 
   if (nKey>=300 && nKey <= 379)
      useGrossAmount=true;
   
   var totalRoundingDifference = '';
   var totalVatAmount = '';
   var totalVatPosted = '';
   var totalVatTaxable = '';
   var totalVatTaxableFromBanana = '';

   for (var key in vatBalances) {
      var object = vatBalances[key];
      var difference = '';
      var type = object.type;
      if (type == 'rate' && object.vatGr == grText) {
         var taxable = object.vatTaxable;
         var amount = object.vatAmount;
         var result = '';
         if (useGrossAmount) {
            var grossAmount = Banana.SDecimal.add(taxable, amount);
            result = Banana.SDecimal.multiply(grossAmount, object.vatRate);
         }
         else {
            result = Banana.SDecimal.multiply(taxable, object.vatRate);
         }
         result = Banana.SDecimal.divide(result, 100, { 'decimals': 2 });
         difference = Banana.SDecimal.subtract(result, amount);
         if (!Banana.SDecimal.isZero(difference) && !Banana.SDecimal.isZero(object.vatRate)) {
            taxable = Banana.SDecimal.multiply(amount, 100);
            taxable = Banana.SDecimal.divide(taxable, object.vatRate, { 'decimals': 2 });
            if (useGrossAmount)
               taxable = Banana.SDecimal.subtract(taxable, amount);
            object.vatTaxableFromBanana = object.vatTaxable;
            object.vatTaxable = taxable;
            difference = Banana.SDecimal.subtract(object.vatTaxableFromBanana, taxable);
            object.roundingDifference = difference;
         }
         totalRoundingDifference  = Banana.SDecimal.add(totalRoundingDifference, difference);
         totalVatAmount  = Banana.SDecimal.add(totalVatAmount, object.vatAmount);
         totalVatPosted  = Banana.SDecimal.add(totalVatPosted, object.vatPosted);
         totalVatTaxable  = Banana.SDecimal.add(totalVatTaxable, object.vatTaxable);
         if (object.vatTaxableFromBanana)
            totalVatTaxableFromBanana  = Banana.SDecimal.add(totalVatTaxableFromBanana, object.vatTaxableFromBanana);
         else
            totalVatTaxableFromBanana  = Banana.SDecimal.add(totalVatTaxableFromBanana, object.vatTaxable);
      }
   }
   
   vatBalances[grText].roundingDifference = totalRoundingDifference;
   vatBalances[grText].vatAmount = totalVatAmount;
   vatBalances[grText].vatPosted = totalVatPosted;
   vatBalances[grText].vatTaxable = totalVatTaxable;
   vatBalances[grText].vatTaxableFromBanana = totalVatTaxableFromBanana;

}

/* Calculate the amount with the vat rate defined in the dialog */
VatCHSaldo.prototype.calculateVatAmount = function (value, aliquota) {
   var res = Banana.SDecimal.multiply(value, aliquota);
   res = Banana.SDecimal.divide(res, 100);
   return res;
}

VatCHSaldo.prototype.checkTaxRates = function (vatBalances, grText) {
   var elementName = this.getElementName(grText);
   if (elementName != 'suppliesPerTaxRate')
      return;

   //var legalTaxRates = this.getLegalTaxRates(grText);
   var usedTaxRates = [];
   for (var key in vatBalances) {
      var object = vatBalances[key];
      //Banana.console.debug(grText + " checkTaxRates() " + JSON.stringify(object));
      if (object.type == 'code' && object.vatGr == grText && object.vatRate.length) {
         /*if (legalTaxRates.indexOf(parseFloat(object.vatRate)) < 0) {
            var msg = this.getErrorMessage(this.ID_ERR_TAXRATE_NOTVALID, this.getLang());
	         msg = msg.replace("%1", object.vatGr);
            msg = msg.replace("%2", object.vatRate);
            msg = msg.replace("%3", object.vatCode);
            this.banDocument.addMessage(msg, this.ID_ERR_TAXRATE_NOTVALID);
         }*/
         if (usedTaxRates.length<=0)
            usedTaxRates.push(object.vatRate);
         if (usedTaxRates.indexOf(object.vatRate)<0) {
            var msg = this.getErrorMessage(this.ID_ERR_TAXRATE_TOOMANY, this.getLang());
	         msg = msg.replace("%1", object.vatGr);
            this.banDocument.addMessage(msg, this.ID_ERR_TAXRATE_TOOMANY);
         }
      }
   }

}

/* The purpose of this function is to convert the value to local format */
VatCHSaldo.prototype.formatNumber = function (amount, convZero) {
   if (!amount) { //if undefined return 0.00
      amount = 0;
   }
   return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
}

VatCHSaldo.prototype.getElementName = function (grText) {
   var nKey = parseInt(grText);
   if (nKey < 200 || nKey > 910)
      return "";
      
   if (nKey == 200)
      return "totalConsideration";
   else if (nKey == 205)
      return "opted";
   else if (nKey == 220)
      return "suppliesToForeignCountries";
   else if (nKey == 221)
      return "suppliesAbroad";
   else if (nKey == 225)
      return "transferNotificationProcedure";
   else if (nKey == 230)
      return "suppliesExemptFromTax";
   else if (nKey == 235)
      return "reductionOfConsideration";
   else if (nKey == 280)
      return "variousDeduction";
   else if (nKey >= 300 && nKey <= 379)
      return "suppliesPerTaxRate";
   else if (nKey >= 380 && nKey <= 389)
      return "acquisitionTax";
   else if (nKey == 400)
      return "inputTaxMaterialAndServices";
   else if (nKey == 405)
      return "inputTaxInvestments";
   else if (nKey == 410)
      return "subsequentInputTaxDeduction";
   else if (nKey == 415)
      return "inputTaxCorrection";
   else if (nKey == 420)
      return "inputTaxReductions";
   else if (nKey == 900)
      return "subsidies";
   else if (nKey == 910)
      return "donations";
   return;
}

VatCHSaldo.prototype.getErrorMessage = function (errorId, lang) {
   if (!lang)
      lang = 'en';
   switch (errorId) {
      case this.ID_ERR_TAXRATE_NOTVALID:
         if (lang == 'it')
            return "Alla cifra %1 l'aliquota %2 non è permessa. Controllare il codice IVA %3";
         else if (lang == 'de')
            return "In der Ziffer %1 ist der Satz %2 nicht erlaubt. Den MwSt-Code %3 überprüfen";
         else
            return "At group %1 the tax rate %2 is not permitted. Please check the vat code %3";   
      case this.ID_ERR_TAXRATE_TOOMANY:
         if (lang == 'it')
            return "Alla cifra %1 è permessa un'unica aliquota. Controllare le aliquote dei codici IVA collegati";
         if (lang == 'de')
            return "In der Ziffer %1 ist ein einziger Satz erlaubt. Ueberprüfen Sie die Steuer-Sätze mit den verbundenen MwSt-Codes";
         else
            return "At group %1 only one tax rate is allowed. Please check the tax rates related to this group";   
      case this.ID_ERR_METHOD_NOTSUPPORTED:
         if (lang == 'it')
            return "Metodo %1 non supportato. Aggiornare Banana alla versione più recente";
         else if (lang == 'de')
            return "Methode %1 nicht unterstützt. Auf neuste Version von Banana Buchhaltung aktualisieren";
         else
            return "Method %1 not supported. Please update to a more recent version of Banana Accounting";
      case this.ID_ERR_VERSION_NOTSUPPORTED:
         if (lang == 'it')
            return "Lo script non funziona con la vostra versione di Banana Contabilità. Aggiornare alla versione più recente";
         else if (lang == 'de')
            return "Das Skript funktionert mit Ihrer Version von Banana Buchhaltung nicht. Bitte auf neuste Version aktualisieren";
         else
            return "This script does not run with your version of Banana Accounting. Please update to the latest version";
	}
   return '';
}

/* Function that returns the lines from the journal */
VatCHSaldo.prototype.getJournal = function () {

   var startDate = this.param.periodStartDate;
   var endDate = this.param.periodEndDate;
   var journal = this.banDocument.journal(this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NORMAL);
   var len = journal.rowCount;
   var transactions = []; //Array that will contain all the lines of the transactions

   for (var i = 0; i < len; i++) {

      var line = {};
      var tRow = journal.row(i);

      if (tRow.value("JDate") >= startDate && tRow.value("JDate") <= endDate) {

         line.date = tRow.value("JDate");
         line.account = tRow.value("JAccount");
         line.vatcode = tRow.value("JVatCodeWithoutSign");
         line.exchangerate = this.banDocument.exchangeRate("CHF", line.date);
         line.doc = tRow.value("Doc");
         line.description = tRow.value("Description");
         line.isvatoperation = tRow.value("JVatIsVatOperation");

         //We take only the rows with a VAT code and then we convert values from base currency to CHF
         if (line.isvatoperation) {

            line.vattaxable = tRow.value("JVatTaxable");
            line.vatamount = tRow.value("VatAmount");
            line.vatposted = tRow.value("VatPosted");
            line.vatrate = Banana.SDecimal.abs(tRow.value("VatRate"));
            line.amount = tRow.value("JAmount");

            transactions.push(line);
         }
      }
   }
   return transactions;
}

VatCHSaldo.prototype.getLang = function () {
   var lang = this.banDocument.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}

VatCHSaldo.prototype.getLegalTaxRates = function () {
   var legalTaxRates = [];
   legalTaxRates.push(0.1);
   legalTaxRates.push(0.6);
   legalTaxRates.push(1.2);
   legalTaxRates.push(1.3);
   legalTaxRates.push(2.0);
   legalTaxRates.push(2.1);
   legalTaxRates.push(2.8);
   legalTaxRates.push(2.9);
   legalTaxRates.push(3.5);
   legalTaxRates.push(3.7);
   legalTaxRates.push(4.3);
   legalTaxRates.push(4.4);
   legalTaxRates.push(5.1);
   legalTaxRates.push(5.2);
   legalTaxRates.push(5.9);
   legalTaxRates.push(6.1);
   legalTaxRates.push(6.5);
   legalTaxRates.push(6.7);
   return legalTaxRates;

}

VatCHSaldo.prototype.getTaxRate = function (grText) {
   var vatCode = {};
   vatCode.vatRate = "";
   vatCode.calculatedFromBanana = false;

   var tableVatCodes = this.banDocument.table("VatCodes");
   if (grText.length <= 0 || !tableVatCodes)
      return vatCode;
   for (var i = 0; i < tableVatCodes.rowCount; i++) {
      var tRow = tableVatCodes.row(i);
      if (tRow.value(this.grColumn) === grText) {
         if (tRow.value("VatRate").length > 0) {
            if (vatCode.vatRate.length > 0 && vatCode.vatRate != tRow.value("VatRate")) {
               //message another vatRate found
            }
            vatCode.vatRate = tRow.value("VatRate");
            vatCode.calculatedFromBanana = true;
         }
      }
   }
   return vatCode;
}

VatCHSaldo.prototype.getTaxRates = function () {
   var taxRates = {};
   taxRates["321"] = this.getTaxRate("200;321");
   taxRates["331"] = this.getTaxRate("200;331");
   taxRates["322"] = this.getTaxRate("200;322");
   taxRates["332"] = this.getTaxRate("200;332");

   //if not found in table vatcodes looks in params
   if (taxRates["321"].vatRate.length <= 0)
      taxRates["321"].vatRate = this.param.taxRate321;
   if (taxRates["331"].vatRate.length <= 0)
      taxRates["331"].vatRate = this.param.taxRate331;
   if (taxRates["322"].vatRate.length <= 0)
      taxRates["322"].vatRate = this.param.taxRate322;
   if (taxRates["332"].vatRate.length <= 0)
      taxRates["332"].vatRate = this.param.taxRate332;

   return taxRates;
}

/* Function that retrieves the total vat from Banana */
VatCHSaldo.prototype.getTotalFromBanana = function () {
   var vatReportTable = this.banDocument.vatReport(this.param.periodStartDate, this.param.periodEndDate);
   if (!vatReportTable)
      return;
   var vatBalance = '';
   for (var i = 0; i < vatReportTable.rowCount; i++) {
      var tRow = vatReportTable.row(i);
      var group = tRow.value("Group");

      //The balance is summed in group named "_tot_"
      if (group === "_tot_") {
         vatBalance = tRow.value("VatBalance"); //VatAmount VatBalance
      }
   }
   return vatBalance;
}

/* The purpose of this function is to calculate all the VAT balances of the accounts belonging to the same reference/group (grText) */
VatCHSaldo.prototype.getVatBalances = function (transactions, grText) {

   //Aliquote
   var taxRates = this.getTaxRates();

   var vatBalances = {}
   vatBalances[grText] = {};
   vatBalances[grText].vatGr = grText;
   vatBalances[grText].vatTaxable = '';
   vatBalances[grText].vatPosted = '';
   vatBalances[grText].vatAmount = '';
   vatBalances[grText].type = 'ref';
   if (taxRates[grText])
      vatBalances[grText].calculatedFromBanana = taxRates[grText].calculatedFromBanana;
   
   var groupByCode = false;
   var elementName = this.getElementName(grText);
   if (elementName == 'suppliesPerTaxRate' || elementName == 'acquisitionTax') {
      groupByCode = true;
   }
   var sDate = Banana.Converter.toDate(this.param.periodStartDate);
   var eDate = Banana.Converter.toDate(this.param.periodEndDate);
   var vatCodes = this.getVatCodes(transactions, grText);

   for (var i = 0; i < transactions.length; i++) {
      var tDate = Banana.Converter.toDate(transactions[i].date);
      var vatcode = transactions[i].vatcode;
      if (tDate >= sDate && tDate <= eDate && vatcode.length>0) {
         if (vatCodes.indexOf(vatcode)>=0) {
            var vatamount = transactions[i].vatamount;
            var vatposted = transactions[i].vatposted;
            var vatrate = transactions[i].vatrate;
            var vattaxable = transactions[i].vattaxable;
            if (elementName == 'suppliesPerTaxRate' && !vatBalances[grText].calculatedFromBanana) {
               vatposted = this.calculateVatAmount(vattaxable, taxRates[grText].vatRate);
               vattaxable = Banana.SDecimal.subtract(vattaxable, vatposted);
               vatamount = vatposted;
               vatrate = taxRates[grText].vatRate;
            } 
            vatBalances[grText].vatTaxable = Banana.SDecimal.add(vatBalances[grText].vatTaxable, vattaxable);
            vatBalances[grText].vatPosted = Banana.SDecimal.add(vatBalances[grText].vatPosted, vatposted);
            vatBalances[grText].vatAmount = Banana.SDecimal.add(vatBalances[grText].vatAmount, vatamount);
            if (grText > 300 && grText <380) {
               vatBalances[grText].vatRate = vatrate;
            }
            if (groupByCode) {
               if (!vatBalances[vatcode]) {
                  vatBalances[vatcode] = {};
                  vatBalances[vatcode].vatCode = vatcode;
                  vatBalances[vatcode].vatGr = grText;
                  vatBalances[vatcode].vatRate = vatrate;
                  vatBalances[vatcode].type = 'code';
               }
               vatBalances[vatcode].vatTaxable = Banana.SDecimal.add(vatBalances[vatcode].vatTaxable, vattaxable);
               vatBalances[vatcode].vatPosted = Banana.SDecimal.add(vatBalances[vatcode].vatPosted, vatposted);
               vatBalances[vatcode].vatAmount = Banana.SDecimal.add(vatBalances[vatcode].vatAmount, vatamount);
               if (!vatBalances[vatrate]) {
                  vatBalances[vatrate] = {};
                  vatBalances[vatrate].vatGr = grText;
                  vatBalances[vatrate].vatRate = vatrate;
                  vatBalances[vatrate].type = 'rate';
               }
               vatBalances[vatrate].vatTaxable = Banana.SDecimal.add(vatBalances[vatrate].vatTaxable, vattaxable);
               vatBalances[vatrate].vatPosted = Banana.SDecimal.add(vatBalances[vatrate].vatPosted, vatposted);
               vatBalances[vatrate].vatAmount = Banana.SDecimal.add(vatBalances[vatrate].vatAmount, vatamount);
            }
         }
      }
   }

   this.checkTaxRates(vatBalances, grText);

   if (this.param.adjustRoundingDifference)
      this.calculateRoundingDifference(vatBalances, grText);

   return vatBalances;     
}

/* The main purpose of this function is to create an array with all the values of a given grColumn of the table belonging to the same group (grText) */
VatCHSaldo.prototype.getVatCodes = function (transactions, grText) {
   var str = [];
   var table = this.banDocument.table("VatCodes");
   if (!table) {
      return str;
   }

   var usedVatCodes = [];
   var sDate = Banana.Converter.toDate(this.param.periodStartDate);
   var eDate = Banana.Converter.toDate(this.param.periodEndDate);
   for (var i = 0; i < transactions.length; i++) {
      var tDate = Banana.Converter.toDate(transactions[i].date);
      if (tDate >= sDate && tDate <= eDate) {
         if (transactions[i].vatcode.length>0 && usedVatCodes.indexOf(transactions[i].vatcode)<0)
            usedVatCodes.push(transactions[i].vatcode);
      }
   }

   //Keeps only vat codes which belog to the gr1
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var grRow = tRow.value(this.grColumn);
      if (grRow.indexOf(grText)>=0) {
         var vatCode = tRow.value('VatCode');
         if (vatCode.length>0 && usedVatCodes.indexOf(vatCode)>=0 && str.indexOf(vatCode)<0) {
            str.push(vatCode);
         }
      }
   }

   //Return the array
   return str;
}

VatCHSaldo.prototype.initParam = function () {
   this.param = {};
   /* 0=create print preview report, 1=create file xml */
   this.param.outputScript = 0;
   /* periodSelected 0=none, 1=1.Q, 2=2.Q, 3=3Q, 4=4Q, 10=1.S, 12=2.S, 30=Year */
   this.param.periodAll = false;
   this.param.periodSelected = 1;
   this.param.periodStartDate = '';
   this.param.periodEndDate = '';
   this.param.taxRate322 = '';
   this.param.taxRate332 = '';
   this.param.taxRate321 = '';
   this.param.taxRate331 = '';
   /*if there is a difference between calculated vat amount and banana vat amount
   this difference is written to the cifra 280*/
   this.param.adjustRoundingDifference = true;

   /*xmlParam*/
   this.param.xml = {};
   /*method 0 = netTaxRateMethod (default), method 1 = flatTaxRateMethod*/
   this.param.xml.method = '0';
   this.param.xml.typeOfSubmission = '1';
   this.param.xml.formOfReporting = '1';
   var variousDeduction = '';
   if  (this.texts.variousDeduction)
      variousDeduction = this.texts.variousDeduction;
   this.param.xml.descriptionVariousDeduction = variousDeduction;
   this.param.xml.activity322 = this.texts.textactivity322;
   this.param.xml.activity332 = this.texts.textactivity332;
   this.param.xml.activity321 = this.texts.textactivity321;
   this.param.xml.activity331 = this.texts.textactivity331;
   this.param.xml.openXmlFile = false;

}

VatCHSaldo.prototype.loadData = function () {

   var transactions = this.getJournal(); //Extract data from journal
   var taxable = "";
   var posted = "";
   var tot289 = "";
   var tot299 = "";
   var tot399posted = "";
   var tot399taxable = "";
   var tot479 = "";
   var tot500 = "";
   var tot510 = "";
   var aliquoteDaRegistrare = "";
   var roundingDifference = "";

   //322, 321, 332, 331
   var suppliesPerTaxRate = [];
   suppliesPerTaxRate.push("322");
   suppliesPerTaxRate.push("321");
   suppliesPerTaxRate.push("332");
   suppliesPerTaxRate.push("331");
   for (var i = 0; i<suppliesPerTaxRate.length; i++) {
      var ref = suppliesPerTaxRate[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      if (currentBal[ref].roundingDifference) {
         this.dataObject[ref].taxableFromBanana = Banana.SDecimal.invert(Banana.SDecimal.add(currentBal[ref].vatTaxableFromBanana,currentBal[ref].vatAmount));
         this.dataObject[ref].roundingDifference = currentBal[ref].roundingDifference;
         roundingDifference = Banana.SDecimal.add(currentBal[ref].roundingDifference, roundingDifference);
      }
      taxable = Banana.SDecimal.invert(Banana.SDecimal.add(currentBal[ref].vatTaxable,currentBal[ref].vatAmount));
      posted = Banana.SDecimal.invert(currentBal[ref].vatPosted);
      this.dataObject[ref].taxable = taxable;
      this.dataObject[ref].taxableformatted = this.formatNumber(taxable, true);
      this.dataObject[ref].posted = posted;
      this.dataObject[ref].postedformatted = this.formatNumber( posted, true);
      this.dataObject[ref].vatrate = currentBal[ref].vatRate;
      if (!currentBal[ref].calculatedFromBanana)
         aliquoteDaRegistrare = Banana.SDecimal.add(aliquoteDaRegistrare, currentBal[ref].vatPosted); //sum for aliquoteDaRegistrare total
      tot399taxable = Banana.SDecimal.add(tot399taxable, this.dataObject[ref].taxable);
      tot399posted = Banana.SDecimal.add(tot399posted, this.dataObject[ref].posted);
   }

   //aliquotedaregistrare totale
   this.dataObject["aliquotedaregistrare"] = {};
   this.dataObject["aliquotedaregistrare"].posted = aliquoteDaRegistrare;
   this.dataObject["aliquotedaregistrare"].postedformatted = this.formatNumber(aliquoteDaRegistrare, true);

   //381, 382
   var acquisitionTax = [];
   acquisitionTax.push("381");
   acquisitionTax.push("382");
   for (var i = 0; i<acquisitionTax.length; i++) {
      var ref = acquisitionTax[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      if (currentBal[ref].roundingDifference) {
         this.dataObject[ref].taxableFromBanana = Banana.SDecimal.invert(currentBal[ref].vatTaxableFromBanana);
         this.dataObject[ref].roundingDifference = currentBal[ref].roundingDifference;
         //roundingDifference = Banana.SDecimal.add(currentBal[ref].roundingDifference, roundingDifference);
      }
      this.dataObject[ref].taxable = Banana.SDecimal.invert(currentBal[ref].vatTaxable);
      this.dataObject[ref].taxableformatted = this.formatNumber(this.dataObject[ref].taxable, true);
      this.dataObject[ref].posted = Banana.SDecimal.invert(currentBal[ref].vatPosted);
      this.dataObject[ref].postedformatted = this.formatNumber(this.dataObject[ref].posted, true);
      this.dataObject[ref].vatrate = currentBal[ref].vatrate;
      //tot399taxable = Banana.SDecimal.add(tot399taxable, this.dataObject[ref].taxable);
      tot399posted = Banana.SDecimal.add(tot399posted, this.dataObject[ref].posted);

      for (var key in currentBal) {
        var object = currentBal[key];
        if (object.type == 'rate') {
           if (!this.dataObject[ref].taxrates)
              this.dataObject[ref].taxrates = {};
           this.dataObject[ref].taxrates[key] = {};
           this.dataObject[ref].taxrates[key].vatrate = object.vatRate;
           this.dataObject[ref].taxrates[key].taxable = Banana.SDecimal.invert(object.vatTaxable);
           this.dataObject[ref].taxrates[key].taxableformatted = this.formatNumber(this.dataObject[ref].taxrates[key].taxable, true);
           this.dataObject[ref].taxrates[key].posted = Banana.SDecimal.invert(object.vatPosted);
           this.dataObject[ref].taxrates[key].postedformatted = this.formatNumber(this.dataObject[ref].taxrates[key].posted, true);
        }
      }
   }

   //200
   this.dataObject["200"] = {};
   var currentBal = this.getVatBalances(transactions, "200");
   taxable = Banana.SDecimal.invert(Banana.SDecimal.add(currentBal["200"].vatTaxable,currentBal["200"].vatAmount));
   this.dataObject["200"].taxable = taxable;
   this.dataObject["200"].taxableformatted = this.formatNumber(taxable, true);
   tot299 = Banana.SDecimal.add(tot299, taxable); //sum for 299 total

   //220, 221, 225, 230, 235, 280
   var gr1Groups = [];
   gr1Groups.push("220");
   gr1Groups.push("221");
   gr1Groups.push("225");
   gr1Groups.push("230");
   gr1Groups.push("235");
   gr1Groups.push("280");
   for (var i = 0; i<gr1Groups.length; i++) {
      var ref = gr1Groups[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      if (ref == "235")
         taxable = Banana.SDecimal.add(currentBal[ref].vatTaxable,currentBal[ref].vatAmount)
      else
         taxable = Banana.SDecimal.invert(currentBal[ref].vatTaxable);
      if (ref == "280" && !Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
	     roundingDifference = Banana.SDecimal.invert(roundingDifference);
         taxable = Banana.SDecimal.add(roundingDifference, taxable, {'decimals':2});
      }   
      this.dataObject[ref].taxable = taxable;
  	   this.dataObject[ref].taxableformatted = this.formatNumber(taxable, true);
      tot289 = Banana.SDecimal.add(tot289, taxable); //sum for 289 total
   }
   
   //289 total
   this.dataObject["289"] = {};
   this.dataObject["289"].taxable = tot289;
   this.dataObject["289"].taxableformatted = this.formatNumber(tot289, true);
   tot299 = Banana.SDecimal.subtract(tot299, tot289); //sum for 299 total

   //299 total
   this.dataObject["299"] = {};
   this.dataObject["299"].taxable = tot299;
   this.dataObject["299"].taxableformatted = this.formatNumber(tot299, true);


   //399
   this.dataObject["399"] = {};
   this.dataObject["399"].taxable = tot399taxable;
   this.dataObject["399"].taxableformatted = this.formatNumber(tot399taxable, true);
   this.dataObject["399"].posted = tot399posted;
   this.dataObject["399"].postedformatted = this.formatNumber(tot399posted, true);

   //470
   this.dataObject["470"] = {};
   currentBal = this.getVatBalances(transactions, "470");
   posted = currentBal["470"].vatPosted;
   this.dataObject["470"].posted = posted;
   this.dataObject["470"].postedformatted = this.formatNumber(posted, true);
   tot479 = Banana.SDecimal.add(tot479, posted); //sum for 479 total

   //471
   this.dataObject["471"] = {};
   currentBal = this.getVatBalances(transactions, "471");
   posted = currentBal["471"].vatPosted;
   this.dataObject["471"].posted = posted;
   this.dataObject["471"].postedformatted = this.formatNumber(posted, true);
   tot479 = Banana.SDecimal.add(tot479, posted); //sum for 479 total

   //479 total
   this.dataObject["479"] = {};
   this.dataObject["479"].posted = tot479;
   this.dataObject["479"].postedformatted = this.formatNumber(tot479, true);

   //500 and 510
   var diff_399_479 = Banana.SDecimal.subtract(tot399posted, tot479, { 'decimals': 2 });

   //If the difference is > 0 the amount goes into the 500, else into the 510
   if (Banana.SDecimal.sign(diff_399_479) > 0) {
      tot500 = diff_399_479;
      tot510 = 0;
   } else if (Banana.SDecimal.sign(diff_399_479) < 0) {
      tot500 = 0;
      tot510 = Banana.SDecimal.invert(diff_399_479);
   } else {
      tot500 = 0;
      tot510 = 0;
   }

   //500
   this.dataObject["500"] = {};
   this.dataObject["500"].posted = tot500;
   this.dataObject["500"].postedformatted = this.formatNumber(tot500, true);

   //510
   this.dataObject["510"] = {};
   this.dataObject["510"].posted = tot510;
   this.dataObject["510"].postedformatted = this.formatNumber(tot510, true);

   //900
   this.dataObject["900"] = {};
   var currentBal = this.getVatBalances(transactions, "900");
   taxable = Banana.SDecimal.invert(Banana.SDecimal.add(currentBal["900"].vatTaxable, currentBal["900"].vatAmount));
   this.dataObject["900"].taxable = taxable;
   this.dataObject["900"].taxableformatted = this.formatNumber(taxable, true);

   //910
   this.dataObject["910"] = {};
   currentBal = this.getVatBalances(transactions, "910");
   taxable = currentBal["910"].vatTaxable;
   this.dataObject["910"].taxable = taxable;
   this.dataObject["910"].taxableformatted = this.formatNumber(taxable, true);

}

VatCHSaldo.prototype.loadTexts = function () {
   this.texts = {};
   var lang = this.getLang();

   if (lang === "it") {
      this.texts.reportName = "Formulario IVA Svizzera - metodo dell'aliquota saldo/aliquote forfetarie"
      this.texts.title = "Dichiarazione IVA (metodo dell'aliquota saldo/aliquote forfetarie)";
      this.texts.version = "Versione";
      this.texts.period = "Periodo di rendiconto: ";
      this.texts.vatNum = "N.IVA:";
      this.texts.deductions = "Deduzioni:";
      this.texts.bananaVatResult = "Risultato Banana Totale IVA";
      this.texts.vatToPay = "Importo da pagare all'AFC calcolato nel formulario"
      this.texts.checkSum = "Somma di controllo deve essere uguale a 0";
      this.texts.amountToRegister = "Importo aliquote IVA da registrare in contabilità";
      this.texts.amountCalculatedInBanana = "Importo IVA calcolato in automatico in Banana";
      this.texts.textError = "ATTENZIONE: Le linee marcate in rosso indicano delle divergenze di calcolo dovute ad un inserimento non corretto delle cifre iva di riferimento nella tabella Codici Iva.";
      this.texts.instructionsTitle = "Istruzioni d'uso:";
      this.texts.instructions1 = "Nella colonna 'Gr1' della tabella 'Codici IVA', indicare per ogni codice IVA una o più cifre di riferimento del formulario. Per ogni codice è possibile inserire più cifre, separate da un punto e virgola ';'.";
      this.texts.instructions2 = "Le cifre in grassetto sono da inserire nella colonna Gr1 della tabella Codici IVA. I valori vengono ripresi dalla contabilità.";
      this.texts.instructions3 = "Cifre da non inserire nella tabella Codici IVA. I valori vengono calcolati in automatico.";
      this.texts.checkVatCode1 = "Codice IVA";
      this.texts.checkVatCode2 = "non utilizzabile con la dichiarazione IVA a saldo";
      this.texts.checkVatCode3 = "La cifra 299 non corrisponde al totale delle prestazioni imponibili (cifre 322-331)";
      this.texts.checkVatCode4 = "Tabella IVA, codice IVA '";
      this.texts.checkVatCode5 = "': manca la cifra di riferimento";
      this.texts.message1 = "Questa stampa non può essere inviata all'Amministrazione Federale delle Contribuzioni.";
      this.texts.message2 = "Ricopiare i dati sul modulo ufficiale o sul portale online www.estv.admin.ch.";
      this.texts.description01 = "I. CIFRA D'AFFARI (i citati articoli si riferiscono alla legge federale del 12 giugno 2009 sull'IVA)";
      this.texts.description02 = "Cifra";
      this.texts.description03 = "Cifra d'affari CHF";
      this.texts.description04 = "Cifra d'affari CHF";
      this.texts.description05 = "Totale delle controprestazioni convenute o ricevute, incluse quelle inerenti a trasferimenti mediante procedura di notifica e a prestazioni all'estero (cifra d'affari mondiale)";
      this.texts.description06 = "Prestazioni esenti dall'imposta (p. es. esportazioni; art. 23), prestazioni esenti a beneficiari istituzionali e persone beneficiarie (art. 107 cpv. 1 lett. a)";
      this.texts.description07 = "Prestazioni all'estero (luogo della prestazione all'estero)";
      this.texts.description08 = "Trasferimenti mediante procedura di notifica (art. 38; vogliate p.f. inoltrare anche il modulo n. 764)";
      this.texts.description09 = "Prestazioni escluse dall'imposta (art. 21) effettuate in territorio svizzero per la cui imposizione non si è optato in virtù dell'art. 22";
      this.texts.description10 = "Diminuzioni della controprestazione quali sconti, ribassi, ecc.";
      this.texts.description11 = "Diversi (ad.es. valore del terreno) ...........................................";
      this.texts.description12 = "Totale cifre 220-280";
      this.texts.description13 = "Cifra d'affari imponibile complessiva (cifra 200, dedotta la cifra 289)";
      this.texts.description14 = "II. CALCOLO DELL'IMPOSTA";
      this.texts.description15 = "Aliquota";
      this.texts.description16 = "Prestazioni CHF dal 01.01.2018";
      this.texts.description17 = "Imposta CHF/cts. dal 01.01.2018";
      this.texts.description18 = "Prestazioni CHF fino al 31.12.2017";
      this.texts.description19 = "Imposta CHF/cts. fino al 31.12.2017";
      this.texts.description20 = "1a aliquota";
      this.texts.description21 = "2a aliquota";
      this.texts.description22 = "Imposta sull'acquisto";
      this.texts.description32 = "Totale dell'imposta dovuta (cifre 321-382)";
      this.texts.description33 = "Imposta CHF/cts.";
      this.texts.description34 = "Computo dell'imposta secondo il modulo n. 1050";
      this.texts.description35 = "Computo dell'imposta secondo il modulo n. 1055, 1056";
      this.texts.description36 = "Totale cifre 470-471";
      this.texts.description37 = "Importo da versare";
      this.texts.description38 = "Credito del contribuente";
      this.texts.description39 = "III. ALTRI FLUSSI DI MEZZI FINANZIARI (art. 18 cpv. 2)";
      this.texts.description40 = "Sussidi, tasse turistiche incassate da uffici turistici, contributi per lo smaltimento dei rifiuti e le aziende fornitrici d’acqua (lett. a-c)";
      this.texts.description41 = "Doni, dividendi, risarcimenti dei danni ecc. (lett. d-l)";
      this.texts.xmldialogtitle = "Formulario IVA Svizzera";
      this.texts.typeOfSubmission = "Tipo invio dichiarazione (1=Primo deposito; 2=Dichiarazione rettificativa; 3=Concordanza annuale)";
      this.texts.formOfReporting = "Tipo dichiarazione (1=convenuto; 2=ricevuto)";
      this.texts.textactivity322 = "Descrizione attività 322";
      this.texts.textactivity332 = "Descrizione attività 332";
      this.texts.textactivity321 = "Descrizione attività 321";
      this.texts.textactivity331 = "Descrizione attività 331";
      this.texts.stringToLong = "Valore inserito troppo lungo";
      this.texts.stringToShort = "Valore inserito troppo corto";
      this.texts.method = "Metodo IVA (0=Metodo aliquote saldo; 1=Metodo aliquote forfetarie)";
      this.texts.netTaxRateMethod = "Metodo aliquote saldo";
      this.texts.flatTaxRateMethod = "Metodo aliquote forfetarie";
      this.texts.xml = "Rendiconto IVA dal 2018 (XML)";
      this.texts.vatToPayXml = "Importo da pagare all'AFC calcolato nel file XML";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Deduzioni diverse";
   }
   else if (lang === "fr") {
      this.texts.reportName = "Formulaire TVA pour la Suisse - selon taux de la dette fiscale nette/taux forfaitaires"
      this.texts.title = "Déclaration TVA (selon taux de la dette fiscale nette/taux forfaitaires)";
      this.texts.version = "Version";
      this.texts.period = "Période de décompte: ";
      this.texts.vatNum = "N° TVA:";
      this.texts.deductions = "Déductions:";
      this.texts.bananaVatResult = "Résultat total TVA calculé par le programme Banana";
      this.texts.vatToPay = "Montant à payer calculé per ce formulaire"
      this.texts.checkSum = "Pour contrôle la somme doit donner 0";
      this.texts.amountToRegister = "Montant taux TVA à enregistrer en comptabilité";
      this.texts.amountCalculatedInBanana = "Montant TVA calculé automatiquement en Banana";
      paramError = "ATTENTION: les lignes marquées en rouge indiques des différences dues à une insertion fausse des chiffres TVA dans la table IVA.";
      this.texts.instructionsTitle = "Mode d'emplois:";
      this.texts.instructions1 = "Dans la colonne 'Gr1' du tableau 'Codes TVA', indiquer pour chaque code TVA un ou plusieurs chiffres de référence du formulaire. Pour chaque code, il est possible d'insérer plusieurs chiffres séparés par un point-virgule ';'.";
      this.texts.instructions2 = "Les chiffres en caractères gras doivent être insérés dans la colonne Gr1 du tableau Codes TVA. Les valeurs sont reprises de la comptabilité.";
      this.texts.instructions3 = "Chiffres à ne pas insérer dans le tableau Codes TVA. Les valeurs sont calculées automatiquement.";
      this.texts.checkVatCode1 = "Le code TVA";
      this.texts.checkVatCode2 = "ne peut pas être utilisé dans le décompte taux de la dette fiscale nette/taux forfaitaires";
      this.texts.checkVatCode3 = "La chiffre 299 ne correspond pas au total des prestations imposable (chiffre 322-331)";
      this.texts.checkVatCode4 = "Table TVA, code TVA '";
      this.texts.checkVatCode5 = "': manque la chiffre TVA correspondante";
      this.texts.message1 = "Cette impression ne peut pas être envoyée à l'Administration Fédérale des Contributions.";
      this.texts.message2 = "Copier les données sur le formulaire officiel ou dans le portail en ligne www.estv.admin.ch.";
      this.texts.description01 = "I. CHIFFRE D'AFFAIRES (les articles cités se réfèrent à la loi sur la TVA du 12.06.2009)";
      this.texts.description02 = "Chiffre";
      this.texts.description03 = "Chiffre d'affaires CHF";
      this.texts.description04 = "Chiffre d'affaires CHF";
      this.texts.description05 = "Total des contre-prestations convenues ou reçues (art. 39), y c. celles provenant de transferts avec la procédure de déclaration et de prestations fournies à l'étranger";
      this.texts.description06 = "Prestations exonérées (p. ex. exportations, art. 23), prestations exonérées fournies à des institutions et à des personnes bénéficiaires (art. 107, al. 1, let. a)";
      this.texts.description07 = "Prestations fournies à l’étranger";
      this.texts.description08 = "Transferts avec la procédure de déclaration (art. 38, veuillez, s.v.p., joindre le formulaire n° 764)";
      this.texts.description09 = "Prestations exclues du champ de l’impôt (art. 21) pour lesquelles il n’a pas été opté selon l’art. 22";
      this.texts.description10 = "Diminutions de la contre-prestation";
      this.texts.description11 = "Divers (p.ex. valeur du terrain) ...........................................";
      this.texts.description12 = "Total ch. 220 à 280";
      this.texts.description13 = "Total du chiffre d’affaires imposable (ch. 200 moins ch. 289)";
      this.texts.description14 = "II. CALCUL DE L’IMPÔT";
      this.texts.description15 = "Taux";
      this.texts.description16 = "Prestations CHF dès le 01.01.2018";
      this.texts.description17 = "Impôt CHF/ct. dès le 01.01.2018";
      this.texts.description18 = "Prestations CHF jusqu’au 31.12.2017";
      this.texts.description19 = "Impôt CHF/ct. jusqu’au 31.12.2017";
      this.texts.description20 = "1er taux";
      this.texts.description21 = "2e taux";
      this.texts.description22 = "Impôt sur les acquisitions";
      this.texts.description32 = "Total de l’impôt dû (ch. 321 à 382)";
      this.texts.description33 = "Impôt CHF/ct.";
      this.texts.description34 = "Mise en compte de l’impôt selon le formulaire n° 1050";
      this.texts.description35 = "Mise en compte de l’impôt selon le formulaire n° 1055";
      this.texts.description36 = "Total ch. 470 à 471";
      this.texts.description37 = "Montant à payer à l'Administration fédérale des contributions";
      this.texts.description38 = "Solde en faveur de l’assujetti";
      this.texts.description39 = "III. AUTRES MOUVEMENTS DE FONDS (art. 18, al. 2)";
      this.texts.description40 = "Subventions, taxes touristiques encaissées par les offices du tourisme, contributions versées aux établissements chargés de l'élimination des déchets et de l'approvisionnement en eau (let. a à c)";
      this.texts.description41 = "Les dons, les dividendes, les dédommagements, etc. (let. d à l)";
      this.texts.xmldialogtitle = "Formulaire TVA pour la Suisse";
      this.texts.typeOfSubmission = "Type de décompte d'envoi (1=Premier dépôt; 2=Décompte rectificatif; 3=Concordance annuelle)";
      this.texts.formOfReporting = "Type de décompte (1=convenu; 2=reçu)";
      this.texts.textactivity322 = "Description de l'activité 322";
      this.texts.textactivity332 = "Description de l'activité 332";
      this.texts.textactivity321 = "Description de l'activité 321";
      this.texts.textactivity331 = "Description de l'activité 331";
      this.texts.stringToLong = "Valeur entrée trop longue";
      this.texts.stringToShort = "Valeur entrée trop courte";
      this.texts.method = "Méthode TVA (0=Méthode des taux de la dette fiscale; 1=Méthode des taux forfaitaires)";
      this.texts.netTaxRateMethod = "Méthode des taux de la dette fiscale";
      this.texts.flatTaxRateMethod = "Méthode des taux forfaitaires";
      this.texts.xml = "Décompte TVA depuis 2018 (XML)";
      this.texts.vatToPayXml = "Montant à payer calculé per ce fichier XML";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Différentes déductions";
   }
   else { //lan=deu or lan=enu
      this.texts.reportName = "MwSt-Abrechnung für die Schweiz - Saldosteuersatz/Pauschalsteuersatz"
      this.texts.title = "MWST-Abrechnung (Saldosteuersatz/Pauschalsteuersatz)";
      this.texts.version = "Version";
      this.texts.period = "Abrechnungsperiode: ";
      this.texts.vatNum = "MWST-Nr:";
      this.texts.deductions = "Abzüge:";
      this.texts.bananaVatResult = "Resultat Banana MwSt.-Totalsumme";
      this.texts.vatToPay = "Betrag, welcher dem ESTV zu bezhalen ist, im Formular berechnet"
      this.texts.checkSum = "Zur Kontrolle muss die Summe gleich Null sein";
      this.texts.amountToRegister = "Betrag der MWST-Sätze, welcher zu buchen ist";
      this.texts.amountCalculatedInBanana = "MWST-Betrag automatisch in Banana berechnet";
      paramError = "ACHTUNG: Die roten Zeilen zeigen Differenzen, die von einer falschen Eingabe der MwSt/USt-Ziffern in der MwSt/USt-Codes-Tabelle verursacht werden.";
      this.texts.instructionsTitle = "Bedienungsanleitung:";
      this.texts.instructions1 = "In der Spalte 'Gr1' der Tabelle 'MwSt/USt-Codes' ist für jeden MwSt-Code eine oder mehrere Referenzziffern des Formulars anzugeben. Für jeden Code können mehrere Ziffern eingegeben werden, die durch einen Strichpunkt ';' zu trennen sind.";
      this.texts.instructions2 = "Die in Fett gedruckten Ziffern sind in die Spalte 'Gr1' der Tabelle 'MwSt/USt-Codes' einzutragen. Die Werte werden aus der Buchhaltung übernommen.";
      this.texts.instructions3 = "Die nicht in Fett gedruckten Ziffern sind nicht in der Tabelle 'MwSt/USt-Codes' zu erfassen. Deren Werte werden automatisch berechnet.";
      this.texts.checkVatCode1 = "Der MwSt/USt Code";
      this.texts.checkVatCode2 = "in der Abrechnung Saldosteuersatz/Pauschalsatz ist nicht gültig";
      this.texts.checkVatCode3 = "Die Ziffer 299 entspricht nicht der Totalsumme der steuerpflichtigen Leistungen (Ziffern 322-331)";
      this.texts.checkVatCode4 = "Tabelle MwSt/USt, MwSt/USt Code '";
      this.texts.checkVatCode5 = "': MwSt/USt Ziffer fehlt";
      this.texts.message1 = "Dieser Ausdruck kann nicht an die Eidgenössische Steuerverwaltung übermittelt werden.";
      this.texts.message2 = "Die Werte müssen von Hand auf das offizielle Formular übertragen werden oder direkt im Online-Portal www.estv.admin.ch erfasst werden.";
      this.texts.description01 = "I. UMSATZ (zitierte Artikel beziehen sich auf das Mehrwertsteuergesetz vom 12.06.2009)";
      this.texts.description02 = "Ziffer";
      this.texts.description03 = "Umsatz CHF";
      this.texts.description04 = "Umsatz CHF";
      this.texts.description05 = "Total der vereinbarten bzw. vereinnahmten Entgelte (Art. 39), inkl. Entgelte aus Übertragungen im Meldeverfahren sowie aus Leistungen im Ausland";
      this.texts.description06 = "Von der Steuer befreite Leistungen (u.a. Exporte, Art. 23), von der Steuer befreite Leistungen an begünstigte Einrichtungen und Personen (Art. 107 Abs. 1 Bst. a)";
      this.texts.description07 = "Leistungen im Ausland";
      this.texts.description08 = "Übertragung im Meldeverfahren (Art. 38, bitte zusätzlich Form. 764 einreichen)";
      this.texts.description09 = "Nicht steuerbare Leistungen (Art. 21), für die nicht nach Art. 22 optiert wird";
      this.texts.description10 = "Entgeltsminderungen";
      this.texts.description11 = "Diverses (z.B. Wert des Bodens) ...........................................";
      this.texts.description12 = "Total Ziff. 220 bis 280";
      this.texts.description13 = "Steuerbarer Gesamtumsatz (Ziff. 200 abzüglich Ziff. 289)";
      this.texts.description14 = "II. STEUERBERECHNUNG";
      this.texts.description15 = "Satz";
      this.texts.description16 = "Leistungen CHF ab 01.01.2018";
      this.texts.description17 = "Steuer CHF/Rp. ab 01.01.2018";
      this.texts.description18 = "Leistungen CHF bis 31.12.2017";
      this.texts.description19 = "Steuer CHF/Rp. bis 31.12.2017";
      this.texts.description20 = "1. Satz";
      this.texts.description21 = "2. Satz";
      this.texts.description22 = "Bezugsteuer";
      this.texts.description32 = "Total geschuldete Steuer (Ziff. 321 bis 382)";
      this.texts.description33 = "Steuer CHF/Rp.";
      this.texts.description34 = "Steueranrechnung gemäss Formular Nr. 1050";
      this.texts.description35 = "Steueranrechnung gemäss Formular Nr. 1055";
      this.texts.description36 = "Total Ziff. 470 bis 471";
      this.texts.description37 = "An die Eidg. Steuerverwaltung zu bezahlender Betrag";
      this.texts.description38 = "Guthaben der steuerpflichtigen Person";
      this.texts.description39 = "III. ANDERE MITTELFLÜSSE (Art. 18 Abs. 2)";
      this.texts.description40 = "Subventionen, durch Kurvereine eingenommene Tourismusabgaben, Entsorgungs- und Wasserwerkbeiträge (Bst. a-c)";
      this.texts.description41 = "Spenden, Dividenden, Schadenersatz usw. (Bst. d-l)";
      this.texts.xmldialogtitle = "MwSt-Abrechnung für die Schweiz";
      this.texts.typeOfSubmission = "Abrechnungstyp (1=Ersteinreichung; 2=Korrekturabrechnung; 3=Jahresabstimmung)";
      this.texts.formOfReporting = "Abrechnungsart (1=vereinbart; 2=vereinnahmt)";
      this.texts.textactivity322 = "Beschreibung der Tätigkeit 322";
      this.texts.textactivity332 = "Beschreibung der Tätigkeit 332";
      this.texts.textactivity321 = "Beschreibung der Tätigkeit 321";
      this.texts.textactivity331 = "Beschreibung der Tätigkeit 331";
      this.texts.stringToLong = "Eingegebener Wert ist zu lang";
      this.texts.stringToShort = "Eingegebener Wert ist zu kurz";
      this.texts.method = "MWST-Methode (0=Saldosteuersatz Methode; 1=Pauschalsteuersatz Methode)";
      this.texts.netTaxRateMethod = "Saldosteuersatz Methode";
      this.texts.flatTaxRateMethod = "Pauschalsteuersatz Methode";
      this.texts.xml = "MWST-Abrechnung ab 2018 (XML)";
      this.texts.vatToPayXml = "Betrag, welcher dem ESTV zu bezhalen ist, im XML-Datei berechnet";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Verschiedene Abzüge";
   }
}


VatCHSaldo.prototype.readAccountingData = function (param) {
   if (!param || !this.banDocument)
      return;
   //Table FileInfo
   param.fileInfo = {};
   param.fileInfo["BasicCurrency"] = "";
   param.fileInfo["OpeningDate"] = "";
   param.fileInfo["ClosureDate"] = "";
   param.fileInfo["CustomersGroup"] = "";
   param.fileInfo["SuppliersGroup"] = "";
   param.fileInfo["Address"] = {};
   param.fileInfo["Address"]["Company"] = "";
   param.fileInfo["Address"]["Courtesy"] = "";
   param.fileInfo["Address"]["Name"] = "";
   param.fileInfo["Address"]["FamilyName"] = "";
   param.fileInfo["Address"]["Address1"] = "";
   param.fileInfo["Address"]["Address2"] = "";
   param.fileInfo["Address"]["Zip"] = "";
   param.fileInfo["Address"]["City"] = "";
   param.fileInfo["Address"]["State"] = "";
   param.fileInfo["Address"]["Country"] = "";
   param.fileInfo["Address"]["Web"] = "";
   param.fileInfo["Address"]["Email"] = "";
   param.fileInfo["Address"]["Phone"] = "";
   param.fileInfo["Address"]["Mobile"] = "";
   param.fileInfo["Address"]["Fax"] = "";
   param.fileInfo["Address"]["FiscalNumber"] = "";
   param.fileInfo["Address"]["VatNumber"] = "";

   if (this.banDocument.info) {
      param.fileInfo["BasicCurrency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency");
      param.fileInfo["OpeningDate"] = this.banDocument.info("AccountingDataBase", "OpeningDate");
      param.fileInfo["ClosureDate"] = this.banDocument.info("AccountingDataBase", "ClosureDate");
      if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
         param.fileInfo["CustomersGroup"] = this.banDocument.info("AccountingDataBase", "CustomersGroup");
      if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
         param.fileInfo["SuppliersGroup"] = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
      param.fileInfo["Address"]["Company"] = this.banDocument.info("AccountingDataBase", "Company");
      param.fileInfo["Address"]["Courtesy"] = this.banDocument.info("AccountingDataBase", "Courtesy");
      param.fileInfo["Address"]["Name"] = this.banDocument.info("AccountingDataBase", "Name");
      param.fileInfo["Address"]["FamilyName"] = this.banDocument.info("AccountingDataBase", "FamilyName");
      param.fileInfo["Address"]["Address1"] = this.banDocument.info("AccountingDataBase", "Address1");
      param.fileInfo["Address"]["Address2"] = this.banDocument.info("AccountingDataBase", "Address2");
      param.fileInfo["Address"]["Zip"] = this.banDocument.info("AccountingDataBase", "Zip");
      param.fileInfo["Address"]["City"] = this.banDocument.info("AccountingDataBase", "City");
      param.fileInfo["Address"]["State"] = this.banDocument.info("AccountingDataBase", "State");
      param.fileInfo["Address"]["Country"] = this.banDocument.info("AccountingDataBase", "Country");
      param.fileInfo["Address"]["Web"] = this.banDocument.info("AccountingDataBase", "Web");
      param.fileInfo["Address"]["Email"] = this.banDocument.info("AccountingDataBase", "Email");
      param.fileInfo["Address"]["Phone"] = this.banDocument.info("AccountingDataBase", "Phone");
      param.fileInfo["Address"]["Mobile"] = this.banDocument.info("AccountingDataBase", "Mobile");
      param.fileInfo["Address"]["Fax"] = this.banDocument.info("AccountingDataBase", "Fax");
      param.fileInfo["Address"]["FiscalNumber"] = this.banDocument.info("AccountingDataBase", "FiscalNumber");
      param.fileInfo["Address"]["VatNumber"] = this.banDocument.info("AccountingDataBase", "VatNumber");
   }

   param.accountingOpeningDate = '';
   param.accountingClosureDate = '';
   if (param.fileInfo["OpeningDate"])
      param.accountingOpeningDate = param.fileInfo["OpeningDate"];
   if (param.fileInfo["ClosureDate"])
      param.accountingClosureDate = param.fileInfo["ClosureDate"];

   param.openingYear = '';
   param.closureYear = '';
   if (param.accountingOpeningDate.length >= 10)
      param.openingYear = param.accountingOpeningDate.substring(0, 4);
   if (param.accountingClosureDate.length >= 10)
      param.closureYear = param.accountingClosureDate.substring(0, 4);

   return param;
}

VatCHSaldo.prototype.setParam = function (param) {
   this.param = param;
   this.verifyParam();
}

VatCHSaldo.prototype.verifyBananaVersion = function () {
   if (!this.banDocument)
      return false;

   var lang = this.getLang();

   //From Experimental 06/09/2018
   var requiredVersion = "9.0.3.180906";
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
      var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
      this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
      return false;
   }

   return true;
}

VatCHSaldo.prototype.verifyParam = function () {
   if (!this.param)
      this.param = {};
   if (!this.param.outputScript)
      this.param.outputScript = 0;
   if (!this.param.periodAll)
      this.param.periodAll = false;
   if (!this.param.periodSelected)
      this.param.periodSelected = 1;
   if (!this.param.periodStartDate)
      this.param.periodStartDate = '';
   if (!this.param.periodEndDate)
      this.param.periodEndDate = '';
   if (!this.param.taxRate322)
      this.param.taxRate322 = '';
   if (!this.param.taxRate332)
      this.param.taxRate332 = '';
   if (!this.param.taxRate321)
      this.param.taxRate321 = '';
   if (!this.param.taxRate331)
      this.param.taxRate331 = '';
   if (!this.param.adjustRoundingDifference)
      this.param.adjustRoundingDifference = false;

   if (!this.param.xml)
      this.param.xml = {};
   if (!this.param.xml.method)
      this.param.xml.method = '0';
   if (!this.param.xml.typeOfSubmission)
      this.param.xml.typeOfSubmission = '1';
   if (!this.param.xml.formOfReporting)
      this.param.xml.formOfReporting = '1';
   var variousDeduction = '';
   if (this.texts.description11)
      variousDeduction = this.texts.description11;
   if (!this.param.xml.descriptionVariousDeduction || this.param.xml.descriptionVariousDeduction.length<=0)
      this.param.xml.descriptionVariousDeduction = variousDeduction;
   if (!this.param.xml.activity322)
      this.param.xml.activity322 = 'Activity 322...';
   if (!this.param.xml.activity332)
      this.param.xml.activity332 = 'Activity 332...';
   if (!this.param.xml.activity321)
      this.param.xml.activity321 = 'Activity 321...';
   if (!this.param.xml.activity331)
      this.param.xml.activity331 = 'Activity 331...';
   if (!this.param.xml.openXmlFile)
      this.param.xml.openXmlFile = false;

}

