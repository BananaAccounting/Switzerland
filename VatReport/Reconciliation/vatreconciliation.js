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
//
// @id = ch.banana.vatreconciliation
// @api = 1.0
// @pubdate = 2025-05-26
// @publisher = Banana.ch SA
// @description = Swiss VAT Reconciliation
// @task = app.command
// @doctype = 100.110;110.110;130.110;100.130
// @docproperties =
// @timeout = -1

/** 
*   Main function
*/
function exec(inData) {

    if (!Banana.document)
        return "@Cancel";

    var param = {};
    param.period = {};
    param.period.startDate = "";
    param.period.endDate = "";
    if (Banana.document) {
        param.period.startDate = Banana.document.info("AccountingDataBase", "OpeningDate");
        param.period.endDate = Banana.document.info("AccountingDataBase", "ClosureDate");
    }
    var period = Banana.Ui.getPeriod("Select Period", param.period.startDate, param.period.endDate);
    if (period) {
        param.period.startDate = period.startDate;
        param.period.endDate = period.endDate;
    }
    else {
        return false;
    }

    var vatReconciliation = new VatReconciliation(Banana.document);
    if (!vatReconciliation.verifyBananaVersion()) {
        return "@Cancel";
    }

    vatReconciliation.setParam(param);
    vatReconciliation.loadData();

    var report = Banana.Report.newReport("");
    var stylesheet = Banana.Report.newStyleSheet();
    vatReconciliation.printData(report, stylesheet);
    Banana.Report.preview(report, stylesheet);
}


function VatReconciliation(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;
    this.initData();
}

VatReconciliation.prototype.initData = function () {
    this.data = {};
    //elenco conti utilizzati
    this.data.accounts = [];
    //registrazioni ricavi con codici iva
    this.data.table1 = {};
    //registrazioni ricavi senza codici iva
    this.data.table2 = {};
    //iva dichiarata nel formulario
    this.data.table3 = {};
    //totali da stampare
    this.data.totalRevenuesBookedWithVatCode = {};
    this.data.totalRevenuesBookedWithoutVatCode = {};
    this.data.totalRevenuesDeclared = {};
    //opzioni
    this.options = {};
    this.options.printTransactions = false;
    // gruppo imponibile nel formulario
    this.options.groupVatTaxable = "200";
}

VatReconciliation.prototype.loadData = function () {
    if (!this.banDocument)
        return;

    if (!this.param.period.startDate || !this.param.period.endDate) {
        this.param.period.startDate = this.banDocument.info("AccountingDataBase", "OpeningDate");
        this.param.period.endDate = this.banDocument.info("AccountingDataBase", "ClosureDate");
    }

    var startDate = this.param.period.startDate;
    var endDate = this.param.period.endDate;
    var journal = this.banDocument.journal(this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NORMAL);

    //riprende tutti i codici iva che appartengono al gr1 200
    var vatCodesAllowed = this.loadDataVatCodes(journal, this.options.groupVatTaxable);

    for (var i = 0; i < journal.rowCount; i++) {

        var line = {};
        var tRow = journal.row(i);

        if (tRow.value("JDate") >= startDate && tRow.value("JDate") <= endDate) {

            line.date = tRow.value("JDate");
            line.doc = tRow.value("Doc");
            line.description = tRow.value("Description");
            line.account = tRow.value("JAccount");
            line.accountclass = tRow.value("JAccountClass");
            line.debitamount = tRow.value("JDebitAmount");
            line.creditamount = tRow.value("JCreditAmount");
            line.amount = tRow.value("JAmount");
            line.isvatoperation = tRow.value("JVatIsVatOperation");
            line.vatcode = tRow.value("JVatCodeWithoutSign");
            line.vattaxable = tRow.value("JVatTaxable");
            line.vatamount = tRow.value("VatAmount");
            line.vatposted = tRow.value("VatPosted");
            line.vatrate = Banana.SDecimal.abs(tRow.value("VatRate"));
            line.vattwinaccount = Banana.SDecimal.abs(tRow.value("VatTwinAccount"));

            //table1
            //ricavi con codice iva
            if (line.accountclass === "4" && line.vatcode.length>0) {
                var vatcode = line.vatcode;
                var account = line.account;
                if (!this.data.table1[vatcode]) {
                    this.data.table1[vatcode] = {};
                }
                if (!this.data.table1[vatcode][account]) {
                    this.data.table1[vatcode][account] = {};
                    this.data.table1[vatcode][account].rows = [];
                }
                this.data.table1[vatcode][account].rows.push(line);
                if (account.length > 0 && this.data.accounts.indexOf(account) < 0)
                    this.data.accounts.push(account);
            }

            //table2 
            //ricavi senza codice iva
            if (line.accountclass === "4" && line.vatcode.length<=0) {
                var vatcode = "_void_";
                var account = line.account;
                if (!this.data.table2[vatcode]) {
                    this.data.table2[vatcode] = {};
                }
                if (!this.data.table2[vatcode][account]) {
                    this.data.table2[vatcode][account] = {};
                    this.data.table2[vatcode][account].rows = [];
                }
                this.data.table2[vatcode][account].rows.push(line);
                if (account.length > 0 && this.data.accounts.indexOf(account) < 0)
                    this.data.accounts.push(account);
            }

            //table3
            //iva dichiarata nel formulario
            if (line.isvatoperation === "1") {
                if (vatCodesAllowed.indexOf(line.vatcode) >= 0) {
                    var vatcode = line.vatcode;
                    var twinaccount = line.vattwinaccount;
                    if (!this.data.table3[vatcode]) {
                        this.data.table3[vatcode] = {};
                    }
                    if (!this.data.table3[vatcode][twinaccount]) {
                        this.data.table3[vatcode][twinaccount] = {};
                        this.data.table3[vatcode][twinaccount].rows = [];
                    }
                    this.data.table3[vatcode][twinaccount].rows.push(line);
                    if (twinaccount.length > 0 && this.data.accounts.indexOf(twinaccount) < 0)
                        this.data.accounts.push(twinaccount);
                }
            }
        }
    }
}

VatReconciliation.prototype.loadDataAccounts = function () {
    if (!this.banDocument)
        return;

    var table = this.banDocument.table("Accounts");
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");
        var bClass = tRow.value("BClass");
        if (bClass == "4" && this.data.accounts.indexOf(account) < 0) {
            this.data.accounts.push(account);
        }
    }
}

VatReconciliation.prototype.loadDataVatCodes = function (transactions, gr1Text) {
    //Riprende i codici iva gr1 200
    var str = [];
    var table = this.banDocument.table("VatCodes");
    if (!table) {
        return str;
    }

    var usedVatCodes = [];
    var startDate = this.param.period.startDate;
    var endDate = this.param.period.endDate;

    for (var i = 0; i < transactions.rowCount; i++) {
        var tRow = transactions.row(i);
        if (tRow.value("JDate") >= startDate && tRow.value("JDate") <= endDate) {
            var vatcode = tRow.value("JVatCodeWithoutSign");
            if (vatcode.length > 0 && usedVatCodes.indexOf(vatcode) < 0) {
                usedVatCodes.push(vatcode);
            }
        }
    }

    //Keeps only vat codes which belong to the gr1
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var grRow = tRow.value("Gr1");
        if (grRow.indexOf(gr1Text) >= 0) {
            var vatCode = tRow.value('VatCode');
            if (vatCode.length > 0 && usedVatCodes.indexOf(vatCode) >= 0 && str.indexOf(vatCode) < 0) {
                str.push(vatCode);
            }
        }
    }

    //Return the array
    return str;
}

VatReconciliation.prototype.printData = function (report, stylesheet) {

    if (!report || !stylesheet)
        return;

    // Style
    stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;")
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:8pt");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".bold2", "font-weight:bold;font-size:10px;padding-bottom:5px;padding-top:5px;");
    stylesheet.addStyle(".left", "text-align:left;");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    stylesheet.addStyle(".h1", "font-weight:bold; font-size:16pt; text-align:left;padding-bottom:10px;");
    stylesheet.addStyle(".h2", "font-weight:bold; font-size:12pt; text-align:left;padding-bottom:5px;padding-top:5px;");
    stylesheet.addStyle(".h3", "font-size:10pt; text-align:left; padding-bottom:10px;");
    stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");
    stylesheet.addStyle(".horizontalLine", "border-top:1px solid orange");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid orange");
    stylesheet.addStyle(".borderTop", "border-top:thin solid orange");
    stylesheet.addStyle(".borderRight", "border-right:thin solid orange");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid orange");
    stylesheet.addStyle(".dataCell", "background-color:#FFEFDB");
    stylesheet.addStyle(".orange", "color:orange;");
    stylesheet.addStyle(".warning", "color:red;font-size:12pt; ");
    stylesheet.addStyle(".underline", "text-decoration:underline;");
    stylesheet.addStyle(".instructions", "background-color:#eeeeee");
    stylesheet.addStyle(".italic", "font-style:italic;");
    stylesheet.addStyle("tr.header", "font-weight:bold;padding-bottom:5px;text-align:center;");
    stylesheet.addStyle("tr.total", "font-weight:bold; border-top:0.5px solid black;padding-bottom:5px;");
    stylesheet.addStyle("table", "width:100%;");

    // Titolo report
    var text = "Stampa di riconciliazione IVA";
    report.addParagraph(text, "h1");

    // tabella 1 registrazioni ricavi con codice iva
    this.printDataTable1(report, stylesheet);
    report.addPageBreak();

    // tabella 2 registrazioni ricavi senza codice iva
    this.printDataTable2(report, stylesheet);
    report.addPageBreak();

    // tabella 3 iva dichiarata nel formulario
    this.printDataTable3(report, stylesheet);
    report.addPageBreak();

    // tabella differenze
    this.printDataTableDifferences(report, stylesheet);
    //Righe vuote
    /*for (var i = 0; i < 3; i++) {
        report.addParagraph(" ");
    }*/
}

VatReconciliation.prototype.printDataTableDifferences = function (report, stylesheet) {

    // Tabella 4
    // Differenze
    report.addParagraph("4) Confronto totali", "h2");
    report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(this.param.period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.param.period.endDate), "h3");

    // print difference
    var myTable = report.addTable("");
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("Conto");
    tableHeader.addCell("Totale ricavi");
    tableHeader.addCell("Ricavi senza cod.IVA");
    tableHeader.addCell("Ricavi con cod.IVA");
    tableHeader.addCell("IVA imponibile nel formulario");
    tableHeader.addCell("Differenza");
    var globalTotal1 = 0;
    var globalTotal2 = 0;
    var globalTotal3 = 0;
    var globalTotal4 = 0;
    var globalDiff = 0;
    for (var i = 0; i < this.data.accounts.length; i++) {
        var account = this.data.accounts[i];
        var total1 = 0;
        var total2 = 0;
        var total3 = 0;
        var total4 = 0;
        var totalDiff = 0;
        if (this.data.totalRevenuesBookedWithVatCode[account])
            total1 = this.data.totalRevenuesBookedWithVatCode[account];
        if (this.data.totalRevenuesBookedWithoutVatCode[account])
            total2 = this.data.totalRevenuesBookedWithoutVatCode[account];
        total3 = Banana.SDecimal.add(total1, total2);
        if (this.data.totalRevenuesDeclared[account])
            total4 = this.data.totalRevenuesDeclared[account];
        var diff = Banana.SDecimal.subtract(total1, total4);

        globalTotal3 = Banana.SDecimal.add(total3, globalTotal3);
        globalTotal2 = Banana.SDecimal.add(total2, globalTotal2);
        globalTotal1 = Banana.SDecimal.add(total1, globalTotal1);
        globalTotal4 = Banana.SDecimal.add(total4, globalTotal4);
        globalDiff = Banana.SDecimal.add(diff, globalDiff);

        var tableRow = myTable.addRow();
        tableRow.addCell(account);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total3), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total2), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total1), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total4), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diff), "right");
    }
    //totale
    var tableRow = myTable.addRow("total");
    tableRow.addCell("Totale");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal3), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal2), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal1), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal4), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalDiff), "right");
}

VatReconciliation.prototype.printDataTable1 = function (report, stylesheet) {
    // Registrazioni - classe 4 Ricavi
    report.addParagraph("1) Registrazioni ricavi con codice IVA (BClasse=4)", "h2");
    report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(this.param.period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.param.period.endDate), "h3");
    this.printDataTable(report, stylesheet, this.data.table1);
}

VatReconciliation.prototype.printDataTable2 = function (report, stylesheet) {
    // Registrazioni - classe 4 Ricavi
    report.addParagraph("2) Registrazioni ricavi senza codice IVA (BClasse=4)", "h2");
    report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(this.param.period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.param.period.endDate), "h3");
    this.printDataTable(report, stylesheet, this.data.table2);
}

VatReconciliation.prototype.printDataTable = function (report, stylesheet, data) {

    // Tabella 1
    var myTable = report.addTable("");

    //header
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("");
    tableHeader.addCell("");
    tableHeader.addCell("Descrizione", "left");
    tableHeader.addCell("");
    tableHeader.addCell("Dare", "right");
    tableHeader.addCell("Avere", "right");
    tableHeader.addCell("Saldo", "right");

    var globalDebitAmount = 0;
    var globalCreditAmount = 0;
    var globalAmount = 0;
    var globalAccountList = {};
    for (var vatcode in data) {
        var vatcodedescription = vatcode;
        if (vatcode === "_void_")
            vatcodedescription = "senza codice IVA";
        var totalDebitAmountVatCode = 0;
        var totalCreditAmountVatCode = 0;
        var totalAmountVatCode = 0;
        for (var account in data[vatcode]) {
            var totalDebitAmountAccount = 0;
            var totalCreditAmountAccount = 0;
            var totalAmountAccount = 0;
            for (var i = 0; i < data[vatcode][account].rows.length; i++) {
                var row = data[vatcode][account].rows[i];
                totalDebitAmountVatCode = Banana.SDecimal.add(row.debitamount, totalDebitAmountVatCode);
                totalCreditAmountVatCode = Banana.SDecimal.add(row.creditamount, totalCreditAmountVatCode);
                totalAmountVatCode = Banana.SDecimal.add(row.amount, totalAmountVatCode);
                totalDebitAmountAccount = Banana.SDecimal.add(row.debitamount, totalDebitAmountAccount);
                totalCreditAmountAccount = Banana.SDecimal.add(row.creditamount, totalCreditAmountAccount);
                totalAmountAccount = Banana.SDecimal.add(row.amount, totalAmountAccount);

                if (this.options.printTransactions) {
                    var tableRow = myTable.addRow();
                    tableRow.addCell(account);
                    tableRow.addCell(Banana.Converter.toLocaleDateFormat(row.date));
                    tableRow.addCell(row.description);
                    tableRow.addCell(row.vatcode);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(row.debitamount), "right");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(row.creditamount), "right");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(row.amount), "right");
                }
            }
            //Total account
            var tableHeader = myTable.addRow("subtotal");
            tableHeader.addCell("");
            tableHeader.addCell("");
            tableHeader.addCell("Totale " + vatcodedescription + " conto " + account);
            tableHeader.addCell("");
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalDebitAmountAccount), "right");
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalCreditAmountAccount), "right");
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountAccount), "right");

            if (!globalAccountList[account]) {
                globalAccountList[account] = {};
                globalAccountList[account].debit = 0;
                globalAccountList[account].credit = 0;
                globalAccountList[account].balance = 0;
            }
            globalAccountList[account].debit = Banana.SDecimal.add(totalDebitAmountAccount, globalAccountList[account].debit);
            globalAccountList[account].credit = Banana.SDecimal.add(totalCreditAmountAccount, globalAccountList[account].credit);
            globalAccountList[account].balance  = Banana.SDecimal.add(totalAmountAccount, globalAccountList[account].balance);
            if (vatcode === "_void_") {
                if (!this.data.totalRevenuesBookedWithoutVatCode[account])
                    this.data.totalRevenuesBookedWithoutVatCode[account] = 0;
                this.data.totalRevenuesBookedWithoutVatCode[account] = Banana.SDecimal.add(totalAmountAccount, this.data.totalRevenuesBookedWithoutVatCode[account]);
            }
            else {
                if (!this.data.totalRevenuesBookedWithVatCode[account])
                    this.data.totalRevenuesBookedWithVatCode[account] = 0;
                this.data.totalRevenuesBookedWithVatCode[account] = Banana.SDecimal.add(totalAmountAccount, this.data.totalRevenuesBookedWithVatCode[account]);
            }
        }
        //Total vatcode
        var tableHeader = myTable.addRow("total");
        tableHeader.addCell("");
        tableHeader.addCell("");
        tableHeader.addCell("Totale registrazioni " + vatcodedescription, "bold");
        tableHeader.addCell("");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalDebitAmountVatCode), "right bold");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalCreditAmountVatCode), "right bold");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountVatCode), "right bold");
        globalDebitAmount = Banana.SDecimal.add(totalDebitAmountVatCode, globalDebitAmount);
        globalCreditAmount = Banana.SDecimal.add(totalCreditAmountVatCode, globalCreditAmount);
        globalAmount = Banana.SDecimal.add(totalAmountVatCode, globalAmount);
    }

    //Global amount
    var tableHeader = myTable.addRow("total2");
    tableHeader.addCell("");
    tableHeader.addCell("");
    tableHeader.addCell("Totale cifra d'affari registrata", "bold2");
    tableHeader.addCell("");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalDebitAmount), "right bold2");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalCreditAmount), "right bold2");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAmount), "right bold2");

    //Righe vuote
    for (var i = 0; i < 2; i++) {
        var emptyRow = myTable.addRow("");
        emptyRow.addCell("", 7);
    }

    //Suddivisione per conto
    var tableHeader = myTable.addRow("");
    tableHeader.addCell("");
    tableHeader.addCell("");
    tableHeader.addCell("Suddivisione per conto", "bold2");
    tableHeader.addCell("", 4);
    var totalDebitAmount = 0;
    var totalCreditAmount = 0;
    var totalAmount = 0;
    for (var account in globalAccountList) {
        var tableHeader = myTable.addRow("");
        tableHeader.addCell("");
        tableHeader.addCell("");
        tableHeader.addCell("Totale conto " + account, "");
        tableHeader.addCell("");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAccountList[account].debit), "right ");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAccountList[account].credit), "right ");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAccountList[account].balance), "right ");
        totalDebitAmount = Banana.SDecimal.add(globalAccountList[account].debit, totalDebitAmount);
        totalCreditAmount = Banana.SDecimal.add(globalAccountList[account].credit, totalCreditAmount);
        totalAmount = Banana.SDecimal.add(globalAccountList[account].balance, totalAmount);
    }
    var tableHeader = myTable.addRow("total");
    tableHeader.addCell("");
    tableHeader.addCell("");
    tableHeader.addCell("Totale conti", "bold");
    tableHeader.addCell("");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalDebitAmount), "right bold");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalCreditAmount), "right bold");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmount), "right bold");
}

VatReconciliation.prototype.printDataTable3 = function (report, stylesheet) {

    // Tabella 2
    // Riassunto IVA - classe 4 Ricavi
    report.addParagraph("3) IVA imponibile dichiarata nel formulario (Gr1=" + this.options.groupVatTaxable +")", "h2");
    report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(this.param.period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.param.period.endDate), "h3");

    var myTable = report.addTable("");

    //header
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("");
    tableHeader.addCell("Descrizione", "left");
    tableHeader.addCell("");
    tableHeader.addCell("Importo IVA", "right");
    tableHeader.addCell("Imponibile", "right");

    var globalTaxableAmount = 0;
    var globalVatAmount = 0;
    var globalAccountList = {};
    for (var vatcode in this.data.table3) {
        var totalVatAmount = 0;
        var totalTaxableAmount = 0;
        for (var account in this.data.table3[vatcode]) {
            var totalVatAmountAccount = 0;
            var totalTaxableAmountAccount = 0;
            for (var i = 0; i < this.data.table3[vatcode][account].rows.length; i++) {
                var row = this.data.table3[vatcode][account].rows[i];
                totalVatAmount = Banana.SDecimal.add(row.vatposted, totalVatAmount);
                totalTaxableAmount = Banana.SDecimal.add(row.vattaxable, totalTaxableAmount);
                totalVatAmountAccount = Banana.SDecimal.add(row.vatposted, totalVatAmountAccount);
                totalTaxableAmountAccount = Banana.SDecimal.add(row.vattaxable, totalTaxableAmountAccount);

                if (this.options.printTransactions) {
                    var tableRow = myTable.addRow();
                    tableRow.addCell(vatcode);
                    tableRow.addCell(row.description);
                    tableRow.addCell(row.vattwinaccount);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(row.vatposted), "right");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(row.vattaxable), "right");
                }
            }
             //Total account
            var tableHeader = myTable.addRow("subtotal");
            tableHeader.addCell("");
            tableHeader.addCell("Totale " + vatcode + " conto " + account);
            tableHeader.addCell("");
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalVatAmountAccount), "right");
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalTaxableAmountAccount), "right");

            if (!globalAccountList[account]) {
                globalAccountList[account] = {};
                globalAccountList[account].vatposted = 0;
                globalAccountList[account].vattaxable = 0;
            }
            globalAccountList[account].vatposted = Banana.SDecimal.add(totalVatAmountAccount, globalAccountList[account].vatposted);
            globalAccountList[account].vattaxable = Banana.SDecimal.add(totalTaxableAmountAccount, globalAccountList[account].vattaxable);
            if (!this.data.totalRevenuesDeclared[account])
                this.data.totalRevenuesDeclared[account] = 0;
            this.data.totalRevenuesDeclared[account] = Banana.SDecimal.add(totalTaxableAmountAccount, this.data.totalRevenuesDeclared[account]);
        }
        //Total vatcode
        var tableHeader = myTable.addRow("total");
        tableHeader.addCell("");
        tableHeader.addCell("Totale " + vatcode, "bold");
        tableHeader.addCell("");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalVatAmount), "right bold");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalTaxableAmount), "right bold");
        globalVatAmount = Banana.SDecimal.add(totalVatAmount, globalVatAmount);
        globalTaxableAmount = Banana.SDecimal.add(totalTaxableAmount, globalTaxableAmount);
    }
    //Global amount
    var tableHeader = myTable.addRow("total2");
    tableHeader.addCell("");
    tableHeader.addCell("Totale cifra d'affari dichiarata", "bold2");
    tableHeader.addCell("");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalVatAmount), "right bold2");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalTaxableAmount), "right bold2");

    //Suddivisione per conto
    var tableHeader = myTable.addRow("");
    tableHeader.addCell("");
    tableHeader.addCell("Suddivisione per conto", "bold2");
    tableHeader.addCell("", 3);
    var totalVatPosted = 0;
    var totalVatTaxable = 0;
    for (var account in globalAccountList) {
        var tableHeader = myTable.addRow("");
        tableHeader.addCell("");
        tableHeader.addCell("Totale conto " + account, "");
        tableHeader.addCell("");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAccountList[account].vatposted), "right ");
        tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(globalAccountList[account].vattaxable), "right ");
        totalVatPosted = Banana.SDecimal.add(globalAccountList[account].vatposted, totalVatPosted);
        totalVatTaxable = Banana.SDecimal.add(globalAccountList[account].vattaxable, totalVatTaxable);
    }
    var tableHeader = myTable.addRow("total");
    tableHeader.addCell("");
    tableHeader.addCell("Totale conti", "bold");
    tableHeader.addCell("");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalVatPosted), "right bold");
    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalVatTaxable), "right bold");
}

VatReconciliation.prototype.setParam = function (param) {
    this.param = param;
    this.verifyParam();
}

VatReconciliation.prototype.verifyParam = function (param) {
}

VatReconciliation.prototype.verifyBananaVersion = function () {
    return true;
}
