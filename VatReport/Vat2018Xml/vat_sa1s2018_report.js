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

function VatCHSaldoReport(banDocument, vatCHSaldo) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;

   this.vatCHSaldo = vatCHSaldo;
   this.scriptVersion = "20180901";

}

/* This function adds a Footer to the report */
VatCHSaldoReport.prototype.addFooter = function (report) {
   var date = new Date();
   var d = Banana.Converter.toLocaleDateFormat(date);
   report.getFooter().addClass("footer");
   var textfield = report.getFooter().addText(d + " - ");
   if (textfield.excludeFromTest) {
      textfield.excludeFromTest();
   }
   report.getFooter().addFieldPageNr();
}

/* This function adds an Header to the report */
VatCHSaldoReport.prototype.addHeader = function (report) {
   var pageHeader = report.getHeader();
   pageHeader.addClass("header");
   pageHeader.addParagraph(this.vatCHSaldo.texts.title, "heading");
   var version = this.vatCHSaldo.texts.version + " " + this.scriptVersion + "sa_" + this.getLang();
   pageHeader.addParagraph(version, "");
   pageHeader.addParagraph(" ", "");
}

/* Function that checks all the vat/gr1 codes used in the transactions.
   It returns a warning message (red) if wrong codes are used. */
VatCHSaldoReport.prototype.checkUsedVatCodes = function (report) {
   var usedGr1Codes = [];
   var vatCodes = this.getTransactionsVatCodes();
   for (var i = 0; i < vatCodes.length; i++) {
      var gr1Codes = this.getGr1Codes(vatCodes[i]);
      for (var j = 0; j < gr1Codes.length; j++) {
         usedGr1Codes.push(gr1Codes[j]);
      }
   }

   //Removing duplicates
   for (var i = 0; i < usedGr1Codes.length; i++) {
      for (var x = i + 1; x < usedGr1Codes.length; x++) {
         if (usedGr1Codes[x] === usedGr1Codes[i]) {
            usedGr1Codes.splice(x, 1);
            --x;
         }
      }
   }

   for (var j = 0; j < usedGr1Codes.length; j++) {
      if (usedGr1Codes[j] !== "200" && usedGr1Codes[j] !== "220" && usedGr1Codes[j] !== "221" && usedGr1Codes[j] !== "225" &&
         usedGr1Codes[j] !== "230" && usedGr1Codes[j] !== "235" && usedGr1Codes[j] !== "280" && usedGr1Codes[j] !== "321" &&
         usedGr1Codes[j] !== "322" && usedGr1Codes[j] !== "331" && usedGr1Codes[j] !== "332" && usedGr1Codes[j] !== "381" &&
         usedGr1Codes[j] !== "382" && usedGr1Codes[j] !== "470" && usedGr1Codes[j] !== "471" && usedGr1Codes[j] !== "900" &&
         usedGr1Codes[j] !== "910" && usedGr1Codes[j] !== "xxx" && usedGr1Codes[j]) {
         report.addParagraph(this.vatCHSaldo.texts.checkVatCode1 + " '" + usedGr1Codes[j] + "' " + this.vatCHSaldo.texts.checkVatCode2, "red");
      }
   }
}

/* Function that checks for all the used vat codes without Gr1 and prints a warning message */
VatCHSaldoReport.prototype.checkUsedVatCodesHaveGr1 = function (report) {

   // Get all the vat codes used on the Transactions table
   var usedVatCodes = this.getTransactionsVatCodes();

   // For each code checks if on the VatCodes table there is a Gr1
   // Shows a warning message in red for all the vat codes without the Gr1
   var codesWithoutGr1 = [];
   var len = usedVatCodes.length;

   // Save all the vat codes without Gr1 into an array
   for (var i = 0; i < len; i++) {
      this.vatCodeHasGr1(usedVatCodes[i], codesWithoutGr1);
   }

   // Print all the warning messages
   for (var i = 0; i < codesWithoutGr1.length; i++) {
      report.addParagraph(this.vatCHSaldo.texts.checkVatCode4 + codesWithoutGr1[i] + this.vatCHSaldo.texts.checkVatCode5, "red");
   }
}

/* Function that creates all the styles used to print the report */
VatCHSaldoReport.prototype.createStyleSheet = function () {
   var stylesheet = Banana.Report.newStyleSheet();

   stylesheet.addStyle("@page", "margin:10mm 10mm 10mm 10mm;")
   stylesheet.addStyle("body", "font-family:Helvetica; font-size:8pt");
   stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
   stylesheet.addStyle(".bold", "font-weight:bold;");
   stylesheet.addStyle(".right", "text-align:right;");
   stylesheet.addStyle(".center", "text-align:center;");
   stylesheet.addStyle(".heading", "font-weight:bold; font-size:16pt; text-align:left");
   stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");
   stylesheet.addStyle(".horizontalLine", "border-top:1px solid orange");
   stylesheet.addStyle(".borderLeft", "border-left:thin solid orange");
   stylesheet.addStyle(".borderTop", "border-top:thin solid orange");
   stylesheet.addStyle(".borderRight", "border-right:thin solid orange");
   stylesheet.addStyle(".borderBottom", "border-bottom:thin solid orange");
   stylesheet.addStyle(".dataCell", "background-color:#FFEFDB");
   stylesheet.addStyle(".orange", "color:orange;");
   stylesheet.addStyle(".red", "color:red;");
   stylesheet.addStyle(".underline", "text-decoration:underline;");
   stylesheet.addStyle(".instructions", "background-color:#eeeeee");
   stylesheet.addStyle(".italic", "font-style:italic;");

   /* TableI */
   var tableStyle = stylesheet.addStyle("tableI");
   tableStyle.setAttribute("width", "100%");
   stylesheet.addStyle("table.tableI td", "padding-bottom: 2px; padding-top: 3px");
   //stylesheet.addStyle("table.tableI td", "border:thin solid black");
   stylesheet.addStyle(".col1", ""); //width:10%
   stylesheet.addStyle(".col2", "");
   stylesheet.addStyle(".col3", ""); //width:12%
   stylesheet.addStyle(".col4", "");
   stylesheet.addStyle(".col5", ""); //width:12%
   stylesheet.addStyle(".col6", "");
   stylesheet.addStyle(".col7", "");
   stylesheet.addStyle(".col8", "");
   stylesheet.addStyle(".col9", ""); //width:12%
   stylesheet.addStyle(".col10", "");
   stylesheet.addStyle(".col11", "");
   stylesheet.addStyle(".col12", ""); //width:12%
   stylesheet.addStyle(".col13", "");

   /* TableII */
   var tableStyle = stylesheet.addStyle("tableII");
   tableStyle.setAttribute("width", "100%");

   return stylesheet;
}

/* Function that creates and prints the report */
VatCHSaldoReport.prototype.createVatReport = function () {

   //Tax rates
   var taxRates = this.vatCHSaldo.getTaxRates();

   // Create the report
   var report = Banana.Report.newReport(this.vatCHSaldo.texts.reportName);

   var headerLeft = this.banDocument.info("Base", "HeaderLeft");
   var vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
   if (headerLeft) {
      if (vatNumber) {
         report.addParagraph(headerLeft + ", " + this.vatCHSaldo.texts.vatNum + " " + vatNumber, "");
      } else {
         report.addParagraph(headerLeft, "");
      }
   } else {
      if (vatNumber) {
         report.addParagraph(this.vatCHSaldo.texts.vatNum + " " + vatNumber, "");
      }
   }

   this.checkUsedVatCodes(report);
   this.checkUsedVatCodesHaveGr1(report);

   // Create a section for the red error message on the top of the page
   var checkVatCodeSection = report.addSection("");

   report.addParagraph(" ", "");
   report.addParagraph(this.vatCHSaldo.texts.period + Banana.Converter.toLocaleDateFormat(this.vatCHSaldo.param.periodStartDate) + " - " + Banana.Converter.toLocaleDateFormat(this.vatCHSaldo.param.periodEndDate), "bold");

   var table = report.addTable("tableI");
   var col1 = table.addColumn("col1");
   var col2 = table.addColumn("col2");
   var col3 = table.addColumn("col3");
   var col4 = table.addColumn("col4");
   var col5 = table.addColumn("col5");
   var col6 = table.addColumn("col6");
   var col7 = table.addColumn("col7");
   var col8 = table.addColumn("col8");
   var col9 = table.addColumn("col9");
   var col10 = table.addColumn("col10");
   var col11 = table.addColumn("col11");
   var col12 = table.addColumn("col12");
   var col13 = table.addColumn("col13");

   /**********
       I.
   **********/
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description01, "bold horizontalLine", 6);
   tableRow.addCell(this.vatCHSaldo.texts.description02, "bold horizontalLine borderLeft", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description03, "bold horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description04, "bold horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);

   //200
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description05, "", 6);
   tableRow.addCell("200", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["200"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);

   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.deductions, "bold", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 4);

   //220
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description06, "", 6);
   tableRow.addCell("220", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["220"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //221
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description07, "", 6);
   tableRow.addCell("221", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["221"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //225
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description08, "", 6);
   tableRow.addCell("225", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["225"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //230
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description09, "", 6);
   tableRow.addCell("230", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["230"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //235
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description10, "", 6);
   tableRow.addCell("235", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["235"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description12, "center", 1);
   tableRow.addCell("", "", 1);

   //280
   var desVariousDeductions = this.vatCHSaldo.texts.description11;
   if (this.vatCHSaldo.param.xml.descriptionVariousDeduction.length>0) {
      desVariousDeductions = this.vatCHSaldo.param.xml.descriptionVariousDeduction;
   }
   var remarks = '';
   var roundingDifference = this.getTotalRoundingDifference();
   if (!Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
      remarks = '*** ';
   }
   tableRow = table.addRow();
   tableRow.addCell(remarks+desVariousDeductions, "", 6);
   tableRow.addCell("280", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange ", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["280"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("=", "orange ", 1);
   tableRow.addCell("-", "orange ", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["289"].taxableformatted, "right dataCell", 1); //use the total 289 previously summed
   tableRow.addCell("289", "center", 1);

   //299
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description13, "bold", 6);
   tableRow.addCell("299", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["299"].taxableformatted, "right dataCell bold", 1); //use the total 299 previously summed
   tableRow.addCell("", "", 1);

   tableRow = table.addRow();
   tableRow.addCell(" ", "", 13);

   /**********
       II.
   **********/
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description14, "bold horizontalLine", 13);

   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description15, "bold", 1);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description16, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description17, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description18, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description19, "bold", 1);
   tableRow.addCell("", "", 1);

   //322
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description20, "", 1);
   tableRow.addCell("322", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["322"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["322"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(taxRates["322"].vatRate) + "%", "", 1);

   //321
   tableRow.addCell("321", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["321"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["321"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(taxRates["321"].vatRate) + "%", "center", 1);

   //332
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description21, "", 1);
   tableRow.addCell("332", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["332"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["332"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(taxRates["332"].vatRate) + "%", "", 1);

   //331
   tableRow.addCell("331", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["331"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["331"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(taxRates["331"].vatRate) + "%", "center", 1);

   //382
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description22, "", 1);
   tableRow.addCell("382", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["382"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["382"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(" ", "", 1);

   //381
   tableRow.addCell("381", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["381"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["381"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(" ", "", 1);

   //399
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description32, "bold", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 3);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["399"].postedformatted, "right dataCell bold", 1);
   tableRow.addCell("399", "center", 1);

   tableRow = table.addRow();
   tableRow.addCell("", "", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description33, "center", 1);
   tableRow.addCell("", "", 6);

   //470
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description34, "", 6);
   tableRow.addCell("470", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["470"].postedformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.texts.description36, "center", 1);
   tableRow.addCell("", "", 1);

   //471
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description35, "", 6);
   tableRow.addCell("471", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["471"].postedformatted, "right dataCell", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell("-", "orange", 1);

   //479 total
   tableRow.addCell(this.vatCHSaldo.dataObject["479"].postedformatted, "right dataCell", 1); //use the 479 total previously summed
   tableRow.addCell("479", "center", 1);

   //500
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description37, "bold", 6);
   tableRow.addCell("500", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["500"].postedformatted, "right dataCell bold", 1);
   tableRow.addCell("", "", 1);

   //510
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description38, "bold", 6);
   tableRow.addCell("510", "borderLeft", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["510"].postedformatted, "right dataCell bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /**********
       III.
   **********/
   tableRow = table.addRow();
   tableRow.addCell("", "", 13);

   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description39, "bold horizontalLine", 13);

   //900
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description40, "", 6);
   tableRow.addCell("900", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["900"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //910
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHSaldo.texts.description41, "", 6);
   tableRow.addCell("910", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHSaldo.dataObject["910"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   report.addParagraph(" ", "");

   /***********************************
       Check results with Banana values
   ***********************************/

   /* Check if 299 and the sum of 301-342 give the same result */
   var tot299 = this.vatCHSaldo.dataObject["299"].taxable;
   var tot399taxable = this.vatCHSaldo.dataObject["399"].taxable;
   var difference = Banana.SDecimal.subtract(tot299, tot399taxable);
   if (!Banana.SDecimal.isZero(difference)) {
      checkVatCodeSection.addParagraph(this.vatCHSaldo.texts.checkVatCode3, "red");
   }
   var totalFromBanana = this.vatCHSaldo.getTotalFromBanana();

   //calculate total of the report using 399 and 479 totals previously summed
   var totalFromReport = Banana.SDecimal.subtract(this.vatCHSaldo.dataObject["399"].posted, this.vatCHSaldo.dataObject["479"].posted, { 'decimals': 2 });
   var tableII = report.addTable("tableII");

   if (!Banana.SDecimal.isZero(this.vatCHSaldo.dataObject["aliquotedaregistrare"].posted)) {
      //Riga 1 "Importo aliquote IVA da registrare in contabilità"
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.amountToRegister, "", 1);
      tableRow.addCell(this.vatCHSaldo.dataObject["aliquotedaregistrare"].postedformatted, "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 2 "Importo IVA calcolato in automatico in Banana"
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.amountCalculatedInBanana, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromBanana), "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 3 "Risultato Banana Totale IVA"
      var risBananaTotIva = Banana.SDecimal.add(this.vatCHSaldo.dataObject["aliquotedaregistrare"].posted, totalFromBanana);
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.bananaVatResult, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(risBananaTotIva), "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 4 "Importo da pagare all'AFC calcolato nel formulario"
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.vatToPay, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromReport), "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 5 "Somma di controllo deve essere ugule a 0"
      var checkSum = Banana.SDecimal.add(totalFromReport, risBananaTotIva);
      if (checkSum > -0.01 && 0.01 > checkSum) { //If the difference is > or < 0.01 cts, it calls an error (red)
         tableRow = tableII.addRow();
         tableRow.addCell(this.vatCHSaldo.texts.checkSum, "", 1);
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right", 1);
         tableRow.addCell("CHF", "", 1);
      }
      else {
         tableRow = tableII.addRow();
         var cellError = tableRow.addCell("", "red", 1);
         cellError.addParagraph(this.vatCHSaldo.texts.checkSum, "");
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right red", 1);
         tableRow.addCell("CHF", "red", 1);
         report.addParagraph(this.vatCHSaldo.texts.textError, "red");
      }
   }
   else {
      //Riga 1 "Risultato Banana Totale IVA"
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.bananaVatResult, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromBanana), "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 2 "Importo da pagare all'AFC calcolato nel formulario"
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.vatToPay, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromReport), "bold right", 1);
      tableRow.addCell("CHF", "", 1);

      //Riga 3 "Somma di controllo deve essere ugule a 0"
      var checkSum = Banana.SDecimal.add(totalFromReport, totalFromBanana);
      if (checkSum > -0.01 && 0.01 > checkSum) { //If the difference is > or < 0.01 cts, it calls an error (red)
         tableRow = tableII.addRow();
         tableRow.addCell(this.vatCHSaldo.texts.checkSum, "", 1);
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right", 1);
         tableRow.addCell("CHF", "", 1);
      } else {
         tableRow = tableII.addRow();
         var cellError = tableRow.addCell("", "red", 1);
         cellError.addParagraph(this.vatCHSaldo.texts.checkSum, "");
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right red", 1);
         tableRow.addCell("CHF", "red", 1);
         report.addParagraph(this.vatCHSaldo.texts.textError, "red");
      }
   }

   //Rounding differences
   var roundingDifference = this.getTotalRoundingDifference();
   if (!Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHSaldo.texts.totalRoundingDifference, "", 1);
      tableRow.addCell(roundingDifference, "bold right", 1);
      tableRow.addCell("CHF", "", 1);
   }
   
   /***********************************
       Instructions
   ***********************************/
   report.addParagraph(this.vatCHSaldo.texts.instructionsTitle, "instructions");
   report.addParagraph(this.vatCHSaldo.texts.instructions1, "instructions");

   var paragraph1 = report.addParagraph("", "instructions");
   paragraph1.addText("000", "bold underline");
   paragraph1.addText(": " + this.vatCHSaldo.texts.instructions2, "instructions");

   var paragraph2 = report.addParagraph("", "instructions");
   paragraph2.addText("000", "instructions");
   paragraph2.addText(": " + this.vatCHSaldo.texts.instructions3, "instructions");

   report.addParagraph(" ", "");
   report.addParagraph(this.vatCHSaldo.texts.message1, "bold");
   report.addParagraph(this.vatCHSaldo.texts.message2, "bold");

   //Add Header and footer
   this.addHeader(report);
   this.addFooter(report);

   return report;
}

/* Function that returns an array with all the gr1 codes for the given vat code */
VatCHSaldoReport.prototype.getGr1Codes = function (vatCode) {
   var str = [];
   var table = this.banDocument.table("VatCodes");
   if (table === undefined || !table) {
      return str;
   }
   //Loop to take the values of each rows of the table
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var gr1 = tRow.value("Gr1");
      var vatcode = tRow.value("VatCode");

      if (gr1 && vatcode === vatCode) {
         var code = gr1.split(";");
         for (var j = 0; j < code.length; j++) {
            if (code[j]) {
               str.push(code[j]);
            }
         }
      }
   }
   return str;
}

VatCHSaldoReport.prototype.getLang = function () {
   var lang = this.banDocument.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}


VatCHSaldoReport.prototype.getTotalRoundingDifference = function () {
   var roundingDifference = '';
   if (this.vatCHSaldo.param.adjustRoundingDifference) {
      for (var key in this.vatCHSaldo.dataObject) {
         var currentBal = this.vatCHSaldo.dataObject[key];
         if (currentBal.roundingDifference)
            roundingDifference = Banana.SDecimal.add(currentBal.roundingDifference, roundingDifference);
      }
   }
   return roundingDifference;
}

/* Function that returns all the vat codes used in the transactions table */
VatCHSaldoReport.prototype.getTransactionsVatCodes = function () {
   var str = [];
   var table = this.banDocument.table("Transactions");
   if (table === undefined || !table) {
      return str;
   }
   //Loop to take the values of each rows of the table
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var vatRow = tRow.value("VatCode");

      if (vatRow) {
         var code = vatRow.split(";");
         for (var j = 0; j < code.length; j++) {
            if (code[j]) {
               str.push(code[j]);
            }
         }
      }
   }
   //Removing duplicates
   for (var i = 0; i < str.length; i++) {
      for (var x = i + 1; x < str.length; x++) {
         if (str[x] === str[i]) {
            str.splice(x, 1);
            --x;
         }
      }
   }
   //Return the array
   return str;
}

/* Function that checks if a VatCode has the Gr1.
   If not, it is saved into an array */
VatCHSaldoReport.prototype.vatCodeHasGr1 = function (code, codesWithoutGr1) {
   var table = this.banDocument.table("VatCodes");
   if (table === undefined || !table) {
      return str;
   }
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var vatcode = tRow.value("VatCode");
      var gr1 = tRow.value("Gr1");

      if (code === vatcode) {
         if (!gr1) {
            codesWithoutGr1.push(code);
         }
      }
   }
}
