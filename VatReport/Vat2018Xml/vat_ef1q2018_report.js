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
function VatCHEffReport(banDocument, vatCHEff) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;

   this.vatCHEff = vatCHEff;
   this.scriptVersion = "20180901";

}

/* This function adds a Footer to the report */
VatCHEffReport.prototype.addFooter = function (report) {
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
VatCHEffReport.prototype.addHeader = function (report) {
   var pageHeader = report.getHeader();
   pageHeader.addClass("header");
   pageHeader.addParagraph(this.vatCHEff.texts.title, "heading");
   var version = this.vatCHEff.texts.version + " " + this.scriptVersion + "ef_" + this.getLang();
   pageHeader.addParagraph(version, "");
   pageHeader.addParagraph(" ", "");
}

/* Function that checks all the vat/gr1 codes used in the transactions.
   It returns a warning message (red) if wrong codes are used. */
VatCHEffReport.prototype.checkUsedVatCodes = function (report) {
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
      if (usedGr1Codes[j] !== "200" && usedGr1Codes[j] !== "205" && usedGr1Codes[j] !== "220" && usedGr1Codes[j] !== "221" &&
         usedGr1Codes[j] !== "225" && usedGr1Codes[j] !== "230" && usedGr1Codes[j] !== "235" && usedGr1Codes[j] !== "280" &&
         usedGr1Codes[j] !== "302" && usedGr1Codes[j] !== "301" && usedGr1Codes[j] !== "312" && usedGr1Codes[j] !== "311" &&
         usedGr1Codes[j] !== "342" && usedGr1Codes[j] !== "341" && usedGr1Codes[j] !== "382" && usedGr1Codes[j] !== "381" &&
         usedGr1Codes[j] !== "400" && usedGr1Codes[j] !== "405" && usedGr1Codes[j] !== "410" && usedGr1Codes[j] !== "415" &&
         usedGr1Codes[j] !== "420" && usedGr1Codes[j] !== "900" && usedGr1Codes[j] !== "910" && usedGr1Codes[j] !== "xxx") {
         report.addParagraph(this.vatCHEff.texts.checkVatCode1 + " '" + usedGr1Codes[j] + "' " + this.vatCHEff.texts.checkVatCode2, "red");
      }
   }
}

/* Function that checks for all the used vat codes without Gr1 and prints a warning message */
VatCHEffReport.prototype.checkUsedVatCodesHaveGr1 = function (report) {

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
      report.addParagraph(this.vatCHEff.texts.checkVatCode4 + codesWithoutGr1[i] + this.vatCHEff.texts.checkVatCode5, "red");
   }
}

/* Function that creates all the styles used to print the report */
VatCHEffReport.prototype.createStyleSheet = function () {
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
VatCHEffReport.prototype.createVatReport = function () {

   // Create the report
   var report = Banana.Report.newReport(this.vatCHEff.texts.reportName);

   var headerLeft = this.banDocument.info("Base", "HeaderLeft");
   var vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
   if (headerLeft) {
      if (vatNumber) {
         report.addParagraph(headerLeft + ", " + this.vatCHEff.texts.vatNum + " " + vatNumber, "");
      } else {
         report.addParagraph(headerLeft, "");
      }
   } else {
      if (vatNumber) {
         report.addParagraph(this.vatCHEff.texts.vatNum + " " + vatNumber, "");
      }
   }

   this.checkUsedVatCodes(report);
   this.checkUsedVatCodesHaveGr1(report);

   // Create a section for the red error message on the top of the page
   var checkVatCodeSection = report.addSection("");

   report.addParagraph(" ", "");
   report.addParagraph(this.vatCHEff.texts.period + Banana.Converter.toLocaleDateFormat(this.vatCHEff.param.periodStartDate) + " - " + Banana.Converter.toLocaleDateFormat(this.vatCHEff.param.periodEndDate), "bold");

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
   tableRow.addCell(this.vatCHEff.texts.description01, "bold horizontalLine", 6);
   tableRow.addCell(this.vatCHEff.texts.description02, "bold horizontalLine borderLeft", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell(this.vatCHEff.texts.description03, "bold horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);
   tableRow.addCell(this.vatCHEff.texts.description04, "bold horizontalLine", 1);
   tableRow.addCell("", "horizontalLine", 1);

   //200
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description05, "", 6);
   tableRow.addCell("200", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["200"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);

   //205
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description06, "", 6);
   tableRow.addCell("205", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["205"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.deductions, "bold", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 4);

   //220
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description07, "", 6);
   tableRow.addCell("220", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["220"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //221
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description08, "", 6);
   tableRow.addCell("221", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["221"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //225
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description09, "", 6);
   tableRow.addCell("225", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["225"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //230
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description10, "", 6);
   tableRow.addCell("230", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["230"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //235
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description11, "", 6);
   tableRow.addCell("235", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["235"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description13, "center", 1);
   tableRow.addCell("", "", 1);

   //280
   var desVariousDeductions = this.vatCHEff.texts.description12;
   if (this.vatCHEff.param.xml.descriptionVariousDeduction.length>0) {
      desVariousDeductions = this.vatCHEff.param.xml.descriptionVariousDeduction;
   }
   tableRow = table.addRow();
   tableRow.addCell(desVariousDeductions, "", 6);
   tableRow.addCell("280", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange ", 1);
   tableRow.addCell(this.vatCHEff.dataObject["280"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("=", "orange ", 1);
   tableRow.addCell("-", "orange ", 1);
   tableRow.addCell(this.vatCHEff.dataObject["289"].taxableformatted, "right dataCell", 1);
   tableRow.addCell("289", "center", 1);

   //299
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description14, "bold", 6);
   tableRow.addCell("299", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["299"].taxableformatted, "right dataCell bold", 1);
   tableRow.addCell("", "", 1);

   tableRow = table.addRow();
   tableRow.addCell(" ", "", 13);

   /**********
       II.
   **********/
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description15, "bold horizontalLine", 13);

   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description16, "bold", 1);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell(this.vatCHEff.texts.description17, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description18, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description19, "bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description20, "bold", 1);
   tableRow.addCell("", "", 1);

   //302
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description21, "", 1);
   tableRow.addCell("302", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHEff.dataObject["302"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["302"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("302"))+"%", "", 1);

   //301
   tableRow.addCell("301", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["301"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["301"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("301"))+"%", "center", 1);

   //312
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description22, "", 1);
   tableRow.addCell("312", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHEff.dataObject["312"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["312"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("312"))+"%", "", 1);

   //311
   tableRow.addCell("311", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["311"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["311"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("311"))+"%", "center", 1);

   //342
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description23, "", 1);
   tableRow.addCell("342", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHEff.dataObject["342"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["342"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("342"))+"%", "", 1);

   //341
   tableRow.addCell("341", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["341"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["341"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell(parseFloat(this.vatCHEff.getLegalTaxRate("341"))+"%", "center", 1);

   //382
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description24, "", 1);
   tableRow.addCell("382", "borderLeft underline bold", 1);
   tableRow.addCell(this.vatCHEff.dataObject["382"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["382"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);

   //381
   tableRow.addCell("381", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["381"].taxableformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["381"].postedformatted, "right right dataCell ", 1);
   tableRow.addCell("", "", 1);

   //399
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description25, "bold", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 3);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["399"].postedformatted, "right dataCell bold", 1);
   tableRow.addCell("399", "center", 1);

   tableRow = table.addRow();
   tableRow.addCell("", "", 6);
   tableRow.addCell("", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description26, "center", 1);
   tableRow.addCell("", "", 6);

   //400
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description27, "", 6);
   tableRow.addCell("400", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["400"].postedformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //405
   var remarks = '';
   var roundingDifference = this.getTotalRoundingDifference();
   if (!Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
      remarks = '*** ';
   }
   tableRow = table.addRow();
   tableRow.addCell(remarks+this.vatCHEff.texts.description28, "", 6);
   tableRow.addCell("405", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["405"].postedformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //410
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description29, "", 6);
   tableRow.addCell("410", "borderLeft underline bold", 1);
   tableRow.addCell("+", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["410"].postedformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //415
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description30, "", 6);
   tableRow.addCell("415", "borderLeft underline bold", 1);
   tableRow.addCell("-", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["415"].postedformatted, "right dataCell", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.texts.description32, "center", 1);
   tableRow.addCell("", "", 1);

   //420
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description31, "", 6);
   tableRow.addCell("420", "borderLeft underline bold", 1);
   tableRow.addCell("-", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["420"].postedformatted, "right dataCell", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell("-", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["479"].postedformatted, "right dataCell", 1);
   tableRow.addCell("479", "center", 1);

   //500
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description33, "bold", 6);
   tableRow.addCell("500", "borderLeft", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["500"].postedformatted, "right dataCell bold", 1);
   tableRow.addCell("", "", 1);

   //510
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description34, "bold", 6);
   tableRow.addCell("510", "borderLeft", 1);
   tableRow.addCell("=", "orange", 1);
   tableRow.addCell(this.vatCHEff.dataObject["510"].postedformatted, "right dataCell bold", 1);
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
   tableRow.addCell(this.vatCHEff.texts.description35, "bold horizontalLine", 13);

   //900
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description36, "", 6);
   tableRow.addCell("900", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["900"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   //910
   tableRow = table.addRow();
   tableRow.addCell(this.vatCHEff.texts.description37, "", 6);
   tableRow.addCell("910", "borderLeft underline bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(this.vatCHEff.dataObject["910"].taxableformatted, "right dataCell ", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   report.addParagraph(" ", "");

   /***********************************
       Check results with Banana values
   ***********************************/
   var tot299 = this.vatCHEff.dataObject["299"].taxable;
   var tot399taxable = this.vatCHEff.dataObject["399"].taxable;
   if (tot299 !== tot399taxable) {
      checkVatCodeSection.addParagraph(this.vatCHEff.texts.checkVatCode3, "red");
   }
   var totalFromBanana = this.vatCHEff.getTotalFromBanana();

   //calculate total of the report using 399 and 479 totals previously summed
   var totalFromReport = Banana.SDecimal.subtract(this.vatCHEff.dataObject["399"].posted, this.vatCHEff.dataObject["479"].posted, { 'decimals': 2 });
   var tableII = report.addTable("tableII");

   //Riga 1 "Risultato Banana Totale IVA"
   tableRow = tableII.addRow();
   tableRow.addCell(this.vatCHEff.texts.bananaVatResult, "", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromBanana), "bold right", 1);
   tableRow.addCell("CHF", "", 1);

   //Riga 2 "Importo da pagare all'AFC calcolato nel formulario"
   tableRow = tableII.addRow();
   tableRow.addCell(this.vatCHEff.texts.vatToPay, "", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalFromReport), "bold right", 1);
   tableRow.addCell("CHF", "", 1);

   //Riga 3 "Somma di controllo deve essere uguale a 0"
   //var checkSum = Banana.SDecimal.add(totalFromBanana, totalFromReport);
   var checkSum = Banana.SDecimal.add(totalFromReport, totalFromBanana);
   if (checkSum === "0") {
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHEff.texts.checkSum, "", 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right", 1);
      tableRow.addCell("CHF", "", 1);
   }
   else {
      tableRow = tableII.addRow();
      var cellError = tableRow.addCell("", "red", 1);
      cellError.addParagraph(this.vatCHEff.texts.checkSum, "");
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(checkSum), "bold right red", 1);
      tableRow.addCell("CHF", "red", 1);
      report.addParagraph(this.vatCHEff.texts.textError, "red");
   }
   
   //Rounding differences
   var roundingDifference = this.getTotalRoundingDifference();
   if (!Banana.SDecimal.isZero(Banana.SDecimal.round(roundingDifference, {'decimals':2}))) {
      //Single rounding difference for each group
      /*for (var key in this.vatCHEff.dataObject) {
         var currentBal = this.vatCHEff.dataObject[key];
         if (currentBal.roundingDifference && !Banana.SDecimal.isZero(currentBal.roundingDifference)) {
            tableRow = tableII.addRow();
            tableRow.addCell("Rounding difference by key " + key, "", 1);
            tableRow.addCell(currentBal.roundingDifference, "bold right", 1);
            var paragraph = "from banana " + Banana.Converter.toLocaleNumberFormat(currentBal.postedFromBanana) + " recalculated " + Banana.Converter.toLocaleNumberFormat(currentBal.posted);
            tableRow.addCell("CHF " + paragraph, "", 1);
         }
      }*/
      tableRow = tableII.addRow();
      tableRow.addCell(this.vatCHEff.texts.totalRoundingDifference, "", 1);
      tableRow.addCell(roundingDifference, "bold right", 1);
      tableRow.addCell("CHF", "", 1);
   }

   //Instructions
   report.addParagraph(this.vatCHEff.texts.instructionsTitle, "instructions");
   report.addParagraph(this.vatCHEff.texts.instructions1, "instructions");

   var paragraph1 = report.addParagraph("", "instructions");
   paragraph1.addText("000", "bold underline");
   paragraph1.addText(": " + this.vatCHEff.texts.instructions2, "instructions");

   var paragraph2 = report.addParagraph("", "instructions");
   paragraph2.addText("000", "instructions");
   paragraph2.addText(": " + this.vatCHEff.texts.instructions3, "instructions");

   report.addParagraph(" ", "");
   report.addParagraph(this.vatCHEff.texts.message1, "bold");
   report.addParagraph(this.vatCHEff.texts.message2, "bold");

   //Add Header and footer
   this.addHeader(report);
   this.addFooter(report);

   return report;
}

/* Function that returns an array with all the gr1 codes for the given vat code */
VatCHEffReport.prototype.getGr1Codes = function (vatCode) {
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

VatCHEffReport.prototype.getLang = function () {
   var lang = this.banDocument.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}

VatCHEffReport.prototype.getTotalRoundingDifference = function () {
   var roundingDifference = '';
   if (this.vatCHEff.param.adjustRoundingDifference) {
      for (var key in this.vatCHEff.dataObject) {
         var currentBal = this.vatCHEff.dataObject[key];
         if (currentBal.roundingDifference)
            roundingDifference = Banana.SDecimal.add(currentBal.roundingDifference, roundingDifference);
      }
   }
   return roundingDifference;
}

/* Function that returns all the vat codes used in the transactions table */
VatCHEffReport.prototype.getTransactionsVatCodes = function () {
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
VatCHEffReport.prototype.vatCodeHasGr1 = function (code, codesWithoutGr1) {
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
