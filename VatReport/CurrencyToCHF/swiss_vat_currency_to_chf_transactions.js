// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.addon.swissvatreport.toCHF.transactions
// @api = 1.0
// @pubdate = 2017-01-24
// @publisher = Banana.ch SA
// @description = Swiss VAT Report Transactions currency to CHF
// @task = app.command
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1



/* 
    SUMMARY
    -------
    The script takes the journal and prints in a table all the VAT transactions for the given period. 
    It takes the values in base currency of VatTaxable, VatPosted, VatAmount and amount and converts
    them to CHF currency.
    The table contains the values before and after the conversion.
**/




var form = [];
var param = {};

function loadParam(banDoc, startDate, endDate) {
    param = {
        "reportName" : "Swiss VAT Report Transactions currency to CHF",
        "bananaVersion" : "Banana Accounting 8",
        "scriptVersion" : "script v. 2017-01-24",
        "startDate" : startDate,
        "endDate" : endDate,
        "company" : Banana.document.info("AccountingDataBase","Company"),
        "pageCounterText" : "Page",
    };
}



/* Main function */
function exec() {

    //Check if we are on an opened document
    if (!Banana.document) {
        return;
    }

    //Retrieve the period
    var dateform = getPeriodSettings();

    if (dateform) {

        //Create the report
        var report = createReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate);
        
        //Add styles and print the report
        var stylesheet = createStyleSheet();
        Banana.Report.preview(report, stylesheet);
    } else {
        return;
    }
}



/* Function that creates and prints the report */
function createReport(banDoc, startDate, endDate) {

    /* Load parameters */
    loadParam(banDoc, startDate, endDate);

    //Function call to get the journal and convert all the needed values from base currency to CHF
    var transactions = getJournal();

    // Create the report
    var report = Banana.Report.newReport(param.reportName);
    
    // Create a table
    var table = report.addTable("table");
    var totVatTaxable = "";
    var totVatPosted = "";
    var totVatTaxableCHF = "";
    var totVatPostedCHF = "";

    // Create a table header for the titles of the columns
    var tableHeader = table.getHeader();
    tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "headerStyle", 1);
    tableRow.addCell("Doc", "headerStyle", 1);
    tableRow.addCell("Description", "headerStyle", 1);
    tableRow.addCell("VatCode", "headerStyle", 1);
    tableRow.addCell("VatTaxable", "headerStyle", 1);
    tableRow.addCell("VatPosted", "headerStyle", 1);
    tableRow.addCell("Exchangerate","headerStyle", 1);
    tableRow.addCell("VatTaxableCHF", "headerStyle", 1);
    tableRow.addCell("VatPostedCHF", "headerStyle", 1);
    tableRow.addCell("Tran. Curr.", "headerStyle", 1);

    var tmpRowOrigin = "";
    var rowOrigin = "";

    for (var i = 0; i < transactions.length; i++) {

        rowOrigin = transactions[i].roworigin;

        if (rowOrigin !== tmpRowOrigin) {

            tableRow = table.addRow();
            tableRow.addCell(Banana.Converter.toLocaleDateFormat(transactions[i].date), "", 1);
            tableRow.addCell(transactions[i].doc, "", 1);
            tableRow.addCell(transactions[i].description, "", 1);
            tableRow.addCell(transactions[i].vatcode, "", 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transactions[i].vattaxable), "right", 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transactions[i].vatposted), "right", 1);
            
            var exchangerate = Banana.SDecimal.multiply(transactions[i].exchangerate,1,{'decimals':4}); //multiply to add the {decimals} option
            tableRow.addCell(exchangerate, "right", 1);
            
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transactions[i].vattaxableCHF), "right", 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transactions[i].vatpostedCHF), "right", 1);
            tableRow.addCell(transactions[i].transactioncurrency, "", 1);

            totVatTaxable = Banana.SDecimal.add(totVatTaxable,transactions[i].vattaxable);
            totVatPosted = Banana.SDecimal.add(totVatPosted,transactions[i].vatposted);
            totVatTaxableCHF = Banana.SDecimal.add(totVatTaxableCHF,transactions[i].vattaxableCHF);
            totVatPostedCHF = Banana.SDecimal.add(totVatPostedCHF,transactions[i].vatpostedCHF);

            tmpRowOrigin = rowOrigin;
        }
        
    }

    tableRow = table.addRow();
    tableRow.addCell("TOTAL", "bold center", 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totVatTaxable), "bold right", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totVatPosted), "bold right", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totVatTaxableCHF), "bold right ", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totVatPostedCHF), "bold right", 1);


    //Add Header and footer
    addHeader(report);
    addFooter(report, param);

    return report;
}


/* Function that returns the lines from the journal and converts some values from base currency to CHF */
function getJournal() {

    var journal = Banana.document.journal(Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
    var len = journal.rowCount;
    var transactions = []; //Array that will contain all the lines of the transactions
    
    for (var i = 0; i < len; i++) {

        var line = {};        
        var tRow = journal.row(i);

        if (tRow.value("JDate") >= param.startDate && tRow.value("JDate") <= param.endDate) {

            line.date = tRow.value("JDate");
            line.account = tRow.value("JAccount");
            line.vatcode = tRow.value("JVatCodeWithoutSign");
            line.vattaxable = tRow.value("JVatTaxable");
            line.vatamount = tRow.value("VatAmount");
            line.vatposted = tRow.value("VatPosted");
            line.amount = tRow.value("JAmount");
            line.exchangerate = Banana.document.exchangeRate("CHF", line.date);
            line.doc = tRow.value("Doc");
            line.description = tRow.value("Description");
            line.transactioncurrency = tRow.value("JTransactionCurrency");
            line.isvatoperation = tRow.value("JVatIsVatOperation");
            line.roworigin = tRow.value("JRowOrigin");

            //Converts values from base currency to CHF
            if (line.isvatoperation) { //line.vat && line.amount

                line.vattaxableCHF = convertBaseCurrencyToCHF(line.vattaxable, line.exchangerate);
                line.vatamountCHF = convertBaseCurrencyToCHF(line.vatamount, line.exchangerate);
                line.vatpostedCHF = convertBaseCurrencyToCHF(line.vatposted, line.exchangerate);
                line.amountCHF = convertBaseCurrencyToCHF(line.amount, line.exchangerate);

                transactions.push(line);   
            }
        }
    }
    return transactions;
}


/* Function for Euro to CHF conversion */
function convertBaseCurrencyToCHF(valeToConvert, exchangerate) {
    
    return Banana.SDecimal.divide(valeToConvert,exchangerate, {'decimals':param.rounding});
}


/* The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run
   Every time the user runs of the script he has the possibility to change the date of the accounting period */
function getPeriodSettings() {
    
    //The formeters of the period that we need
    var scriptform = {
       "selectionStartDate": "",
       "selectionEndDate": "",
       "selectionChecked": "false"
    };

    //Read script settings
    var data = Banana.document.scriptReadSettings();
    
    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        try {
            var readSettings = JSON.parse(data);
            
            //We check if "readSettings" is not null, then we fill the formeters with the values just read
            if (readSettings) {
                scriptform = readSettings;
            }
        } catch (e){}
    }
    
    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod("Period", docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        var value = Banana.document.scriptSaveSettings(formToString);       
    } else {
        //User clicked cancel
        return;
    }
    return scriptform;
}


/* This function adds a Footer to the report */
function addFooter(report, param) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footer");
    report.getFooter().addText(d + " - " + param.pageCounterText + " ");
    report.getFooter().addFieldPageNr();
}


/* This function adds an Header to the report */
function addHeader(report) {
    var pageHeader = report.getHeader();
    pageHeader.addClass("header");
    if (param.company) {
        pageHeader.addParagraph(param.company, "heading");
    }
    pageHeader.addParagraph("VAT Report Transactions currency to CHF", "heading");
    pageHeader.addParagraph(Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "");
    pageHeader.addParagraph(" ", "");
    pageHeader.addParagraph(" ", "");
}


/* Function that creates all the styles used to print the report */
function createStyleSheet() {
    var stylesheet = Banana.Report.newStyleSheet();
    
    stylesheet.addStyle("@page", "margin:10mm 5mm 10mm 5mm;") 
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:10pt");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    stylesheet.addStyle(".heading", "font-weight:bold; font-size:16pt; text-align:left");
    stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");

    /* Transactions table */
    var tableStyle = stylesheet.addStyle("table");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table td", "border:thin solid black");

    return stylesheet;
}

