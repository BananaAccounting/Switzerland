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
// @id = vat_ef1q2018.js
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
// @includejs = vat_ef1q2018_report.js
// @includejs = vat_ef1q2018_xml.js

function exec(inData, options) {
   if (!Banana.document)
      return "@Cancel";

   var vatCHEff = new VatCHEff(Banana.document);
   if (!vatCHEff.verifyBananaVersion()) {
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
   vatCHEff.setParam(param);
   vatCHEff.loadData();

   if (vatCHEff.param.outputScript == 0) {
      //Preview report
      var vatCHEffReport = new VatCHEffReport(Banana.document, vatCHEff);
      var report = vatCHEffReport.createVatReport();
      var stylesheet = vatCHEffReport.createStyleSheet();
      Banana.Report.preview(report, stylesheet);
   }
   else if (vatCHEff.param.outputScript == 1) {
      //XML
      var vatCHEffXml = new VatCHEffXml(Banana.document, vatCHEff);
      var xml = vatCHEffXml.createXml();
      vatCHEffXml.saveData(xml);
   }
   return;
}

function settingsDialog() {
   var vatCHEff = new VatCHEff(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      vatCHEff.setParam(JSON.parse(savedParam));
   }
   var rtnValue = settingsVatDialog(vatCHEff);
   if (!rtnValue)
      return false;

   var paramToString = JSON.stringify(vatCHEff.param);
   Banana.document.setScriptSettings(paramToString);
   return true;
}

function VatCHEff(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.loadTexts();
   this.initParam();

   this.grColumn = "Gr1";
   this.dialogName = "vat_ef1q2018.dialog.ui";
   this.helpId = "vat_ef1q2018";

   //errors
   this.ID_ERR_TAXRATE_NOTVALID = "ID_ERR_TAXRATE_NOTVALID";
   this.ID_ERR_METHOD_NOTSUPPORTED = "ID_ERR_METHOD_NOTSUPPORTED";
   this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
   
   this.dataObject = {};
   //from 200 to 299 and from 400 to 910 no tax rate definition
   //from 300 to 379 only one tax rate is permitted, from 380 to 389 many tax rates are permitted
   //this.dataObject["200"] = { "taxable": "", "taxableformatted": "", "posted": "", "postedformatted": "" };
   //this.dataObject["302"] = [{"vatrate": "", "taxable": "", "taxableformatted": "", "posted": "", "postedformatted": ""},{"vatrate": "", "taxable": "", "taxableformatted": "", "posted": "", "postedformatted": ""},...];

}

/* Calculate the amount with the vat rate defined in the dialog */
VatCHEff.prototype.calculateRoundingDifference = function (vatBalances, grText) {
   
   //rounding difference is calculated for cifra from 300 to 390 (suppliesPerTaxRate 0..100) and 38x (acquisitionTax 0.100)
   var nKey = parseInt(grText);
   if (nKey < 300 || nKey >=390)
      return;

   var totalRoundingDifference = '';
   var totalVatAmount = '';
   var totalVatPosted = '';
   var totalVatPostedFromBanana = '';
   var totalVatTaxable = '';

   for (var key in vatBalances) {
      var object = vatBalances[key];
      var difference = '';
      var type = object.type;
      if (type == 'rate' && object.vatGr == grText) {
         var taxable = object.vatTaxable;
         var posted = object.vatPosted;
         var result = Banana.SDecimal.multiply(taxable, object.vatRate);
         result = Banana.SDecimal.divide(result, 100, { 'decimals': 2 });
         difference = Banana.SDecimal.subtract(result, posted);
         if (!Banana.SDecimal.isZero(difference)) {
            object.vatPosted = result;
            object.vatPostedFromBanana = posted;
            object.roundingDifference = difference;
         }
         totalRoundingDifference  = Banana.SDecimal.add(totalRoundingDifference, difference);
         totalVatAmount  = Banana.SDecimal.add(totalVatAmount, object.vatAmount);
         totalVatPosted  = Banana.SDecimal.add(totalVatPosted, object.vatPosted);
         if (object.vatPostedFromBanana)
            totalVatPostedFromBanana  = Banana.SDecimal.add(totalVatPostedFromBanana, object.vatPostedFromBanana);
         else
            totalVatPostedFromBanana  = Banana.SDecimal.add(totalVatPostedFromBanana, object.vatPosted);
         totalVatTaxable  = Banana.SDecimal.add(totalVatTaxable, object.vatTaxable);
      }
   }
   
   vatBalances[grText].roundingDifference = totalRoundingDifference;
   vatBalances[grText].vatAmount = totalVatAmount;
   vatBalances[grText].vatPosted = totalVatPosted;
   vatBalances[grText].vatPostedFromBanana = totalVatPostedFromBanana;
   vatBalances[grText].vatTaxable = totalVatTaxable;
}


VatCHEff.prototype.checkTaxRates = function (vatBalances, grText) {
   //Banana.console.debug(grText + " checkTaxRates() " + JSON.stringify(vatBalances));
   var legalTaxRate = this.getLegalTaxRate(grText);
   if (Banana.SDecimal.isZero(legalTaxRate))
      return;
   for (var key in vatBalances) {
      var object = vatBalances[key];
      if (object.type == 'code' && object.vatGr == grText && object.vatRate.length) {
         var diff = Banana.SDecimal.subtract(object.vatRate, legalTaxRate);
         if (!Banana.SDecimal.isZero(diff)) {
            var msg = this.getErrorMessage(this.ID_ERR_TAXRATE_NOTVALID, this.getLang());
	         msg = msg.replace("%1", object.vatGr);
            msg = msg.replace("%2", object.vatRate);
            msg = msg.replace("%3", object.vatCode);
            this.banDocument.addMessage(msg, this.ID_ERR_TAXRATE_NOTVALID);
         }
      }
   }
}

/* The purpose of this function is to convert the value to local format */
VatCHEff.prototype.formatNumber = function (amount, convZero) {
   if (!amount) { //if undefined return 0.00
      amount = 0;
   }
   return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
}

VatCHEff.prototype.getElementName = function (grText) {
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

VatCHEff.prototype.getErrorMessage = function (errorId, lang) {
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
VatCHEff.prototype.getJournal = function () {

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

VatCHEff.prototype.getLang = function () {
   var lang = this.banDocument.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}

VatCHEff.prototype.getLegalTaxRate = function (grText) {
   if (grText == "301")
      return "8.00";
   else if (grText == "311")
      return "2.50";
   else if (grText == "341")
      return "3.80";
   else if (grText == "302")
      return "7.70";
   else if (grText == "312")
      return "2.50";
   else if (grText == "342")
      return "3.70";
   return 0;

}

/* Function that retrieves the total vat from Banana */
VatCHEff.prototype.getTotalFromBanana = function () {
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
VatCHEff.prototype.getVatBalances = function (transactions, grText) {

   var vatBalances = {}
   vatBalances[grText] = {};
   vatBalances[grText].vatGr = grText;
   vatBalances[grText].vatTaxable = '';
   vatBalances[grText].vatPosted = '';
   vatBalances[grText].vatAmount = '';
   vatBalances[grText].type = 'ref';
   
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
            var vattaxable = transactions[i].vattaxable;
            var vatposted = transactions[i].vatposted;
            var vatamount = transactions[i].vatamount;
            var vatrate = transactions[i].vatrate;
            vatBalances[grText].vatTaxable = Banana.SDecimal.add(vatBalances[grText].vatTaxable, vattaxable);
            vatBalances[grText].vatPosted = Banana.SDecimal.add(vatBalances[grText].vatPosted, vatposted);
            vatBalances[grText].vatAmount = Banana.SDecimal.add(vatBalances[grText].vatAmount, vatamount);
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
            if (grText > 300 && grText <380) {
               vatBalances[grText].vatRate = vatrate;
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
VatCHEff.prototype.getVatCodes = function (transactions, grText) {
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

VatCHEff.prototype.initParam = function () {
   this.param = {};
   /* 0=create print preview report, 1=create file xml */
   this.param.outputScript = 0;
   /* periodSelected 0=none, 1=1.Q, 2=2.Q, 3=3Q, 4=4Q, 10=1.S, 12=2.S, 30=Year */
   this.param.periodAll = false;
   this.param.periodSelected = 1;
   this.param.periodStartDate = '';
   this.param.periodEndDate = '';
   /*if there is a difference between calculated vat amount and banana vat amount
   this difference is written to the cifra 405 for effective method*/
   this.param.adjustRoundingDifference = true;

   /*xmlParam*/
   this.param.xml = {};
   this.param.xml.typeOfSubmission = '1';
   this.param.xml.formOfReporting = '1';
   var variousDeduction = '';
   if  (this.texts.variousDeduction)
      variousDeduction = this.texts.variousDeduction;
   this.param.xml.descriptionVariousDeduction = variousDeduction;
   this.param.xml.openXmlFile = false;


}

VatCHEff.prototype.loadData = function () {

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
   var roundingDifference = "";

   //200
   this.dataObject["200"] = {};
   var currentBal = this.getVatBalances(transactions, "200");
   taxable = Banana.SDecimal.invert(currentBal["200"].vatTaxable);
   this.dataObject["200"].taxable = taxable;
   this.dataObject["200"].taxableformatted = this.formatNumber(taxable, true);
   tot299 = Banana.SDecimal.add(tot299, taxable); //sum for 299 total
   
   //205
   this.dataObject["205"] = {};
   var currentBal = this.getVatBalances(transactions, "205");
   taxable = Banana.SDecimal.invert(currentBal["205"].vatTaxable);
   this.dataObject["205"].taxable = taxable;
   this.dataObject["205"].taxableformatted = this.formatNumber(taxable, true);
   
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
         taxable = currentBal[ref].vatTaxable;
      else
         taxable = Banana.SDecimal.invert(currentBal[ref].vatTaxable);
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

   //302, 301, 312, 311, 342, 341
   var suppliesPerTaxRate = [];
   suppliesPerTaxRate.push("302");
   suppliesPerTaxRate.push("301");
   suppliesPerTaxRate.push("312");
   suppliesPerTaxRate.push("311");
   suppliesPerTaxRate.push("342");
   suppliesPerTaxRate.push("341");
   for (var i = 0; i<suppliesPerTaxRate.length; i++) {
      var ref = suppliesPerTaxRate[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      if (currentBal[ref].roundingDifference) {
         this.dataObject[ref].postedFromBanana = Banana.SDecimal.invert(currentBal[ref].vatPostedFromBanana);
         this.dataObject[ref].roundingDifference = currentBal[ref].roundingDifference;
         roundingDifference = Banana.SDecimal.add(roundingDifference, currentBal[ref].roundingDifference);
      }
      taxable = Banana.SDecimal.invert(currentBal[ref].vatTaxable);
      posted = Banana.SDecimal.invert(currentBal[ref].vatPosted);
      this.dataObject[ref].taxable = taxable;
      this.dataObject[ref].taxableformatted = this.formatNumber(taxable, true);
      this.dataObject[ref].posted = posted;
      this.dataObject[ref].postedformatted = this.formatNumber( posted, true);
      this.dataObject[ref].vatrate = currentBal[ref].vatRate;
      tot399taxable = Banana.SDecimal.add(tot399taxable, this.dataObject[ref].taxable);
      tot399posted = Banana.SDecimal.add(tot399posted, this.dataObject[ref].posted);
   }

   //381, 382
   var acquisitionTax = [];
   acquisitionTax.push("381");
   acquisitionTax.push("382");
   for (var i = 0; i<acquisitionTax.length; i++) {
      var ref = acquisitionTax[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      if (currentBal[ref].roundingDifference) {
         this.dataObject[ref].postedFromBanana = Banana.SDecimal.invert(currentBal[ref].vatPostedFromBanana);
         this.dataObject[ref].roundingDifference = currentBal[ref].roundingDifference;
         roundingDifference = Banana.SDecimal.add(roundingDifference, currentBal[ref].roundingDifference);
      }
      this.dataObject[ref].taxable = Banana.SDecimal.invert(currentBal[ref].vatTaxable);
      this.dataObject[ref].taxableformatted = this.formatNumber(this.dataObject[ref].taxable, true);
      this.dataObject[ref].posted = Banana.SDecimal.invert(currentBal[ref].vatPosted);
      this.dataObject[ref].postedformatted = this.formatNumber(this.dataObject[ref].posted, true);
      this.dataObject[ref].vatrate = currentBal[ref].vatRate;
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

   //399
   this.dataObject["399"] = {};
   this.dataObject["399"].taxable = tot399taxable;
   this.dataObject["399"].taxableformatted = this.formatNumber(tot399taxable, true);
   this.dataObject["399"].posted = tot399posted;
   this.dataObject["399"].postedformatted = this.formatNumber(tot399posted, true);

   //400, 405, 410
   var inputTax = [];
   inputTax.push("400");
   inputTax.push("405");
   inputTax.push("410");
   for (var i = 0; i<inputTax.length; i++) {
      var ref = inputTax[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      var posted =  currentBal[ref].vatPosted;
      if (ref == "405" && !Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
         posted = Banana.SDecimal.subtract(posted, roundingDifference, {'decimals':2});
      }
      this.dataObject[ref].posted = posted;
      this.dataObject[ref].postedformatted = this.formatNumber(posted, true);
      tot479 = Banana.SDecimal.add(tot479, posted);
   }
   
   //415, 420
   var inputTax = [];
   inputTax.push("415");
   inputTax.push("420");
   for (var i = 0; i<inputTax.length; i++) {
      var ref = inputTax[i];
      this.dataObject[ref] = {};
      var currentBal = this.getVatBalances(transactions, ref);
      var posted =  Banana.SDecimal.invert(currentBal[ref].vatPosted);
      this.dataObject[ref].posted = posted;
      this.dataObject[ref].postedformatted = this.formatNumber(posted, true);
      tot479 = Banana.SDecimal.subtract(tot479, posted);
   }

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

VatCHEff.prototype.loadTexts = function () {
   this.texts = {};
   var lang = this.getLang();

   if (lang === "it") {
      this.texts.reportName = "Formulario IVA Svizzera - metodo sull'effettivo"
      this.texts.title = "Dichiarazione IVA (metodo sull'effettivo)";
      this.texts.version = "Versione";
      this.texts.period = "Periodo di rendiconto: ";
      this.texts.vatNum = "N.IVA:";
      this.texts.deductions = "Deduzioni:";
      this.texts.bananaVatResult = "Risultato Banana Totale IVA";
      this.texts.vatToPay = "Importo da pagare all'AFC calcolato nel formulario"
      this.texts.checkSum = "Somma di controllo deve essere uguale a 0";
      this.texts.textError = "ATTENZIONE: Le linee marcate in rosso indicano delle divergenze di calcolo dovute ad un inserimento non corretto delle cifre iva di riferimento nella tabella Codici Iva.";
      this.texts.instructionsTitle = "Istruzioni d'uso:";
      this.texts.instructions1 = "Nella colonna 'Gr1' della tabella 'Codici IVA', indicare per ogni codice IVA una o più cifre di riferimento del formulario. Per ogni codice è possibile inserire più cifre, separate da un punto e virgola ';'.";
      this.texts.instructions2 = "Le cifre in grassetto sono da inserire nella colonna Gr1 della tabella Codici IVA. I valori vengono ripresi dalla contabilità.";
      this.texts.instructions3 = "Cifre da non inserire nella tabella Codici IVA. I valori vengono calcolati in automatico.";
      this.texts.checkVatCode1 = "Codice IVA";
      this.texts.checkVatCode2 = "non utilizzabile con la dichiarazione IVA sull'effettivo";
      this.texts.checkVatCode3 = "La cifra 299 non corrisponde al totale delle prestazioni imponibili (cifre 301-342)";
      this.texts.checkVatCode4 = "Tabella IVA, codice IVA '";
      this.texts.checkVatCode5 = "': manca la cifra di riferimento";
      this.texts.message1 = "Questa stampa non può essere inviata all'Amministrazione Federale delle Contribuzioni.";
      this.texts.message2 = "Ricopiare i dati sul modulo ufficiale o sul portale online www.estv.admin.ch.";
      this.texts.description01 = "I. CIFRA D'AFFARI (i citati articoli si riferiscono alla legge federale del 12 giugno 2009 sull’IVA)";
      this.texts.description02 = "Cifra";
      this.texts.description03 = "Cifra d'affari CHF";
      this.texts.description04 = "Cifra d'affari CHF";
      this.texts.description05 = "Totale delle controprestazioni convenute o ricevute, incluse quelle inerenti a prestazioni optate, a trasferimenti mediante procedura di notifica e a prestazioni all'estero (cifra d'affari mondiale)";
      this.texts.description06 = "Controprestazioni contenute nella cifra 200 conseguite con prestazioni escluse dall'imposta (art. 21) per la cui imposizione si è optato in virtù dell'art. 22";
      this.texts.description07 = "Prestazioni esenti dall’imposta (p. es. esportazioni; art. 23), prestazioni esenti a beneficiari istituzionali e persone beneficiarie (art. 107 cpv. 1 lett. a)";
      this.texts.description08 = "Prestazioni all'estero (luogo della prestazione all'estero)";
      this.texts.description09 = "Trasferimenti mediante procedura di notifica (art. 38; vogliate p.f. inoltrare anche il modulo n. 764)";
      this.texts.description10 = "Prestazioni escluse dall'imposta (art. 21) effettuate in territorio svizzero per la cui imposizione non si è optato in virtù dell’art. 22";
      this.texts.description11 = "Diminuzioni della controprestazione quali sconti, ribassi, ecc.";
      this.texts.description12 = "Diversi (ad.es. valore del terreno, prezzo d'acquisto in caso d'imposizione dei margini) ............";
      this.texts.description13 = "Totale cifre 220-280";
      this.texts.description14 = "Cifra d'affari imponibile complessiva (cifra 200, dedotta la cifra 289)";
      this.texts.description15 = "II. CALCOLO DELL'IMPOSTA";
      this.texts.description16 = "Aliquota";
      this.texts.description17 = "Prestazioni CHF dal 01.01.2018";
      this.texts.description18 = "Imposta CHF/cts. dal 01.01.2018";
      this.texts.description19 = "Prestazioni CHF fino al 31.12.2017";
      this.texts.description20 = "Imposta CHF/cts. fino al 31.12.2017";
      this.texts.description21 = "normale";
      this.texts.description22 = "ridotta";
      this.texts.description23 = "speciale per l'alloggio";
      this.texts.description24 = "Imposta sull'acquisto";
      this.texts.description25 = "Totale dell'imposta dovuta (cifre 301-382)";
      this.texts.description26 = "Imposta CHF/cts.";
      this.texts.description27 = "Imposta precedente su costi del materiale e prestazioni di servizi";
      this.texts.description28 = "Imposta precedente su investimenti e altri costi d'esercizio";
      this.texts.description29 = "Sgravio fiscale successivo (art. 32; vogliate p.f. allegare una distinta dettagliata)";
      this.texts.description30 = "Correzioni dell'imposta precedente: doppia utilizzazione (art. 30), consumo proprio (art. 31)";
      this.texts.description31 = "Riduzioni della deduzione dell'imposta precedente: non controprestazioni come sussidi, tasse turistiche (art. 33 cpv. 2)";
      this.texts.description32 = "Totale cifre 400-420";
      this.texts.description33 = "Importo da versare";
      this.texts.description34 = "Credito del contribuente";
      this.texts.description35 = "III. ALTRI FLUSSI DI MEZZI FINANZIARI (art. 18 cpv. 2)";
      this.texts.description36 = "Sussidi, tasse turistiche incassate da uffici turistici, contributi per lo smaltimento dei rifiuti e le aziende fornitrici d’acqua (lett. a-c)";
      this.texts.description37 = "Doni, dividendi, risarcimenti dei danni ecc. (lett. d-l)";
      this.texts.xmldialogtitle = "Formulario IVA Svizzera";
      this.texts.typeOfSubmission = "Tipo invio dichiarazione (1=Primo deposito; 2=Dichiarazione rettificativa; 3=Concordanza annuale)";
      this.texts.formOfReporting = "Tipo dichiarazione (1=convenuto; 2=ricevuto)";
      this.texts.stringToLong = "Valore inserito troppo lungo";
      this.texts.stringToShort = "Valore inserito troppo corto";
      this.texts.xml = "Rendiconto IVA dal 2018 (XML)";
      this.texts.vatToPayXml = "Importo da pagare all'AFC calcolato nel file XML";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Deduzioni diverse";
   }
   else if (lang === "fr") {
      this.texts.reportName = "Formulaire TVA pour la Suisse - méthode effective"
      this.texts.title = "Déclaration TVA (méthode effective)";
      this.texts.version = "Version";
      this.texts.period = "Période de décompte: ";
      this.texts.vatNum = "N° TVA:";
      this.texts.deductions = "Déductions:";
      this.texts.bananaVatResult = "Résultat total TVA calculé par le programme Banana";
      this.texts.vatToPay = "Montant à payer calculé per ce formulaire"
      this.texts.checkSum = "Pour contrôle la somme doit donner 0";
      this.texts.textError = "ATTENTION: les lignes marquées en rouge indiques des différences dues à une insertion fausse des chiffres TVA dans la table IVA.";
      this.texts.instructionsTitle = "Mode d'emplois:";
      this.texts.instructions1 = "Dans la colonne 'Gr1' du tableau 'Codes TVA', indiquer pour chaque code TVA un ou plusieurs chiffres de référence du formulaire. Pour chaque code, il est possible d'insérer plusieurs chiffres séparés par un point-virgule ';'.";
      this.texts.instructions2 = "Les chiffres en caractères gras doivent être insérés dans la colonne Gr1 du tableau Codes TVA. Les valeurs sont reprises de la comptabilité.";
      this.texts.instructions3 = "Chiffres à ne pas insérer dans le tableau Codes TVA. Les valeurs sont calculées automatiquement.";
      this.texts.checkVatCode1 = "Le code TVA";
      this.texts.checkVatCode2 = "ne peut pas être utilisé dans le décompte effectif";
      this.texts.checkVatCode3 = "La chiffre 299 ne correspond pas au total des prestations imposable (chiffre 301-342)";
      this.texts.checkVatCode4 = "Table TVA, code TVA '";
      this.texts.checkVatCode5 = "': manque la chiffre TVA correspondante";
      this.texts.message1 = "Cette impression ne peut pas être envoyée à l'Administration Fédérale des Contributions.";
      this.texts.message2 = "Copier les données sur le formulaire officiel ou dans le portail en ligne www.estv.admin.ch.";
      this.texts.description01 = "I. CHIFFRE D'AFFAIRES (les articles cités se réfèrent à la loi sur la TVA du 12.06.2009)";
      this.texts.description02 = "Chiffre";
      this.texts.description03 = "Chiffre d'affaires CHF";
      this.texts.description04 = "Chiffre d'affaires CHF";
      this.texts.description05 = "Total des contre-prestations convenues ou reçues, y c. de prestations imposées par option, de transferts par procédure de déclaration, de prestations à l’étranger (ch. d’affaires mondial)";
      this.texts.description06 = "Contre-prestations déclarées sous ch. 200 qui proviennent de prestations exclues du champ de l’impôt (art. 21) pour lesquelles il a été opté en vertu de l’art. 22";
      this.texts.description07 = "Prestations exonérées (p. ex. exportations, art. 23), prestations exonérées fournies à des institutions et à des personnes bénéficiaires (art. 107, al. 1, let. a)";
      this.texts.description08 = "Prestations fournies à l’étranger (lieu de la prestation à l’étranger)";
      this.texts.description09 = "Transferts avec la procédure de déclaration (art. 38, veuillez, s.v.p., joindre le formulaire n° 764)";
      this.texts.description10 = "Prestations exclues du champ de l’impôt (art. 21) fournies sur le territoire suisse pour lesquelles il n’a pas été opté selon l’art. 22";
      this.texts.description11 = "Diminutions de la contre-prestation telles que rabais, escomptes, etc.";
      this.texts.description12 = "Divers (p.ex. valeur du terrain, prix d’achat en cas d’imposition de la marge) ............";
      this.texts.description13 = "Total ch. 220 à 280";
      this.texts.description14 = "Total du chiffre d’affaires imposable (ch. 200 moins ch. 289)";
      this.texts.description15 = "II. CALCUL DE L’IMPÔT";
      this.texts.description16 = "Taux";
      this.texts.description17 = "Prestations CHF dés le 01.01.2018";
      this.texts.description18 = "Impôt CHF/ct. dés le 01.01.2018";
      this.texts.description19 = "Prestations CHF jusqu’au 31.12.2017";
      this.texts.description20 = "Impôt CHF/ct. jusqu’au 31.12.2017";
      this.texts.description21 = "Normal";
      this.texts.description22 = "Réduit";
      this.texts.description23 = "Spécial pour l’hébergement ";
      this.texts.description24 = "Impôt sur les acquisitions ";
      this.texts.description25 = "Total de l’impôt dû (ch. 301 à 382)";
      this.texts.description26 = "Impôt CHF/ct.";
      this.texts.description27 = "Impôt préalable grevant les coûts en matériel et en prestations de services";
      this.texts.description28 = "Impôt préalable grevant les investissements et autres charges d’exploitation";
      this.texts.description29 = "Dégrèvement ultérieur de l’impôt préalable (art. 32, veuillez, s.v.p., joindre un relevé détaillé)";
      this.texts.description30 = "Corrections de l’impôt préalable: double affectation (art. 30), prestations à soi-même (art. 31)";
      this.texts.description31 = "Réductions de la déduction de l’impôt préalable: prestations n’étant pas considérées comme des contre-prestations, telles subventions, taxes touristiques (art. 33, al. 2)";
      this.texts.description32 = "Total ch. 400 à 420";
      this.texts.description33 = "Montant à payer";
      this.texts.description34 = "Solde en faveur de l’assujetti";
      this.texts.description35 = "III. AUTRES MOUVEMENTS DE FONDS (art. 18, al. 2)";
      this.texts.description36 = "Subventions, taxes touristiques perçues par les offices du tourisme, contributions aux établissements d'élimination des déchets et d'approvisionnement en eau (let. a à c)";
      this.texts.description37 = "Les dons, les dividendes, les dédommagements, etc. (let. d à l)";
      this.texts.xmldialogtitle = "Formulaire TVA pour la Suisse";
      this.texts.typeOfSubmission = "Type de décompte d'envoi (1=Premier dépôt; 2=Décompte rectificatif; 3=Concordance annuelle)";
      this.texts.formOfReporting = "Type de décompte (1=convenu; 2=reçu)";
      this.texts.stringToLong = "Valeur entrée trop longue";
      this.texts.stringToShort = "Valeur entrée trop courte";
      this.texts.xml = "Décompte TVA depuis 2018 (XML)";
      this.texts.vatToPayXml = "Montant à payer calculé per ce fichier XML";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Différentes déductions";
   }
   else { //lang=deu or lang=enu
      this.texts.reportName = "MwSt-Abrechnung für die Schweiz - effektive Methode"
      this.texts.title = "MWST-Abrechnung (effektive Methode)";
      this.texts.version = "Version";
      this.texts.period = "Abrechnungsperiode: ";
      this.texts.vatNum = "MWST-Nr:";
      this.texts.deductions = "Abzüge:";
      this.texts.bananaVatResult = "Resultat Banana MwSt.-Totalsumme";
      this.texts.vatToPay = "Betrag, welcher dem ESTV zu bezhalen ist, im Formular berechnet"
      this.texts.checkSum = "Zur Kontrolle muss die Summe gleich Null sein";
      this.texts.textError = "ACHTUNG: Die roten Zeilen zeigen Differenzen, die von einer falschen Eingabe der MwSt/USt-Ziffern in der MwSt/USt-Codes-Tabelle verursacht werden.";
      this.texts.instructionsTitle = "Bedienungsanleitung:";
      this.texts.instructions1 = "In der Spalte 'Gr1' der Tabelle 'MwSt/USt-Codes' ist für jeden MwSt-Code eine oder mehrere Referenzziffern des Formulars anzugeben. Für jeden Code können mehrere Ziffern eingegeben werden, die durch einen Strichpunkt ';' zu trennen sind.";
      this.texts.instructions2 = "Die in Fett gedruckten Ziffern sind in die Spalte 'Gr1' der Tabelle 'MwSt/USt-Codes' einzutragen. Die Werte werden aus der Buchhaltung übernommen.";
      this.texts.instructions3 = "Die nicht in Fett gedruckten Ziffern sind nicht in der Tabelle 'MwSt/USt-Codes' zu erfassen. Deren Werte werden automatisch berechnet.";
      this.texts.checkVatCode1 = "Der MwSt/USt Code";
      this.texts.checkVatCode2 = "in der effektiven Abrechnung ist nicht gültig";
      this.texts.checkVatCode3 = "Die Ziffer 299 entspricht nicht der Totalsumme der steuerpflichtigen Leistungen (Ziffern 301-342)";
      this.texts.checkVatCode4 = "Tabelle MwSt/USt, MwSt/USt Code '";
      this.texts.checkVatCode5 = "': MwSt/USt Ziffer fehlt";
      this.texts.message1 = "Dieser Ausdruck kann nicht an die Eidgenössische Steuerverwaltung übermittelt werden.";
      this.texts.message2 = "Die Werte müssen von Hand auf das offizielle Formular übertragen werden oder direkt im Online-Portal www.estv.admin.ch erfasst werden.";
      this.texts.description01 = "I. UMSATZ (zitierte Artikel beziehen sich auf das Mehrwertsteuergesetz vom 12.06.2009)";
      this.texts.description02 = "Ziffer";
      this.texts.description03 = "Umsatz CHF";
      this.texts.description04 = "Umsatz CHF";
      this.texts.description05 = "Total der vereinbarten bzw. vereinnahmten Entgelte, inkl. optierte Leistungen, Entgelte aus Übertragungen im Meldeverfahren sowie aus Leistungen im Ausland (weltweiter Umsatz)";
      this.texts.description06 = "In Ziffer 200 enthaltene Entgelte aus von der Steuer ausgenommenen Leistungen (Art. 21), für welche nach Art. 22 optiert wird";
      this.texts.description07 = "Von der Steuer befreite Leistungen (u.a. Exporte, Art. 23), von der Steuer befreite Leistungen an begünstigte Einrichtungen und Personen (Art. 107 Abs. 1 Bst. a)";
      this.texts.description08 = "Leistungen im Ausland (Ort der Leistung im Ausland)";
      this.texts.description09 = "Übertragung im Meldeverfahren (Art. 38, bitte zusätzlich Form. 764 einreichen)";
      this.texts.description10 = "Von der Steuer ausgenommene Inlandleistungen (Art. 21), für die nicht nach Art. 22 optiert wird";
      this.texts.description11 = "Entgeltsminderungen wie Skonti, Rabatte usw.";
      this.texts.description12 = "Diverses (z.B. Wert des Bodens, Ankaufspreise Margenbesteuerung) ........................................";
      this.texts.description13 = "Total Ziff. 220 bis 280";
      this.texts.description14 = "Steuerbarer Gesamtumsatz (Ziff. 200 abzüglich Ziff. 289)";
      this.texts.description15 = "II. STEUERBERECHNUNG";
      this.texts.description16 = "Satz";
      this.texts.description17 = "Leistungen CHF ab 01.01.2018";
      this.texts.description18 = "Steuer CHF/Rp. ab 01.01.2018";
      this.texts.description19 = "Leistungen CHF bis 31.12.2017";
      this.texts.description20 = "Steuer CHF/Rp. bis 31.12.2017";
      this.texts.description21 = "Normal";
      this.texts.description22 = "Reduziert";
      this.texts.description23 = "Beherbergung";
      this.texts.description24 = "Bezugsteuer";
      this.texts.description25 = "Total geschuldete Steuer (Ziff. 301 bis 382)";
      this.texts.description26 = "Steuer CHF/Rp.";
      this.texts.description27 = "Vorsteuer auf Material- und Dienstleistungsaufwand";
      this.texts.description28 = "Vorsteuer auf Investitionen und übrigem Betriebsaufwand";
      this.texts.description29 = "Einlageentsteuerung (Art. 32, bitte detaillierte Aufstellung beilegen)";
      this.texts.description30 = "Vorsteuerkorrekturen: gemischte Verwendung (Art. 30), Eigenverbrauch (Art. 31)";
      this.texts.description31 = "Vorsteuerkürzungen: Nicht-Entgelte wie Subventionen, Tourismusabgaben (Art. 33 Abs. 2)";
      this.texts.description32 = "Total Ziff. 400 bis 420";
      this.texts.description33 = "Zu bezahlender Betrag";
      this.texts.description34 = "Guthaben der steuerpflichtigen Person";
      this.texts.description35 = "III. ANDERE MITTELFLÜSSE (Art. 18 Abs. 2)";
      this.texts.description36 = "Subventionen, durch Kurvereine eingenommene Tourismusabgaben, Entsorgungs- und Wasserwerkbeiträge (Bst. a-c)";
      this.texts.description37 = "Spenden, Dividenden, Schadenersatz usw. (Bst. d-l)";
      this.texts.xmldialogtitle = "MwSt-Abrechnung für die Schweiz";
      this.texts.typeOfSubmission = "Abrechnungstyp (1=Ersteinreichung; 2=Korrekturabrechnung; 3=Jahresabstimmung)";
      this.texts.formOfReporting = "Abrechnungsart (1=vereinbart; 2=vereinnahmt)";
      this.texts.stringToLong = "Eingegebener Wert ist zu lang";
      this.texts.stringToShort = "Eingegebener Wert ist zu kurz";
      this.texts.xml = "MWST-Abrechnung ab 2018 (XML)";
      this.texts.vatToPayXml = "Betrag, welcher dem ESTV zu bezhalen ist, im XML-Datei berechnet";
      this.texts.totalRoundingDifference = "*** Total rounding difference";
      this.texts.variousDeduction = "Verschiedene Abzüge";
   }
}

VatCHEff.prototype.readAccountingData = function (param) {
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

VatCHEff.prototype.setParam = function (param) {
   this.param = param;
   this.verifyParam();
}

VatCHEff.prototype.verifyBananaVersion = function () {
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

VatCHEff.prototype.verifyParam = function () {
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
   if (!this.param.adjustRoundingDifference)
      this.param.adjustRoundingDifference = false;

   if (!this.param.xml)
      this.param.xml = {};
   if (!this.param.xml.typeOfSubmission)
      this.param.xml.typeOfSubmission = '1';
   if (!this.param.xml.formOfReporting)
      this.param.xml.formOfReporting = '1';
   var variousDeduction = '';
   if (this.texts.description12)
      variousDeduction = this.texts.description12;
   if (!this.param.xml.descriptionVariousDeduction || this.param.xml.descriptionVariousDeduction.length<=0)
      this.param.xml.descriptionVariousDeduction = variousDeduction;
   if (!this.param.xml.openXmlFile)
      this.param.xml.openXmlFile = false;

}

