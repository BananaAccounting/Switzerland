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

    var vatReconciliation = new VatReconciliation(Banana.document);
    if (!vatReconciliation.verifyBananaVersion()) {
        return "@Cancel";
    }

    var param = vatReconciliation.initParam();
    /*
    var period = Banana.Ui.getPeriod("Select Period", param.period.startDate, param.period.endDate);
    if (period) {
        param.period.startDate = period.startDate;
        param.period.endDate = period.endDate;
    }
    else {
        return false;
    }*/
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

    this.accountingDataBase = {};
    this.accountingDataBase.basicCurrency = "";
    this.accountingDataBase.openingDate = "";
    this.accountingDataBase.closureDate = "";
    this.accountingDataBase.openingYear = "";
    this.accountingDataBase.closureYear = "";

    if (this.banDocument) {
        this.accountingDataBase.basicCurrency = this.banDocument.info("AccountingDataBase", "BasicCurrency");
        this.accountingDataBase.openingDate = this.banDocument.info("AccountingDataBase", "OpeningDate");
        this.accountingDataBase.closureDate = this.banDocument.info("AccountingDataBase", "ClosureDate");
        if (this.accountingDataBase.openingDate.length >= 10)
            this.accountingDataBase.openingYear = this.accountingDataBase.openingDate.substring(0, 4);
        if (this.accountingDataBase.closureDate.length >= 10)
            this.accountingDataBase.closureYear = this.accountingDataBase.closureDate.substring(0, 4);
    }
}

VatReconciliation.prototype.initParam = function () {
    var param = {};
    param.period = {};
    param.period.startDate = this.accountingDataBase.openingDate;
    param.period.endDate = this.accountingDataBase.closureDate;
    param.period.subdivision = "Q";

    // gruppo cifra d'affari
    param.options = {};
    param.options.groupRevenues = "3";
    // gruppo imponibile nel formulario
    param.options.groupVatTaxable = "200";

    return param;
}

VatReconciliation.prototype.loadData = function () {
    if (!this.banDocument)
        return;

    var startDate = this.param.period.startDate;
    var endDate = this.param.period.endDate;

    if (this.accountingDataBase.openingDate === startDate && this.accountingDataBase.closureDate === endDate) {
        this.loadDataPeriod(startDate, endDate, "Y");
        if (this.param.period.subdivision === "Q") {
            startDate = this.accountingDataBase.closureYear + "-01-01";
            endDate = this.accountingDataBase.closureYear + "-03-31";
            this.loadDataPeriod(startDate, endDate, "1Q");
            startDate = this.accountingDataBase.closureYear + "-04-01";
            endDate = this.accountingDataBase.closureYear + "-06-30";
            this.loadDataPeriod(startDate, endDate, "2Q");
            startDate = this.accountingDataBase.closureYear + "-07-01";
            endDate = this.accountingDataBase.closureYear + "-09-30";
            this.loadDataPeriod(startDate, endDate, "3Q");
            startDate = this.accountingDataBase.closureYear + "-10-01";
            endDate = this.accountingDataBase.closureYear + "-12-31";
            this.loadDataPeriod(startDate, endDate, "4Q");
        }
    }
}

VatReconciliation.prototype.loadDataAccounts = function (grText) {
    var str = [];
    if (!this.banDocument)
        return str;
    var table = this.banDocument.table("Accounts");
    if (!table) {
        return str;
    }

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");
        var bClass = tRow.value("BClass");
        var gr = tRow.value("Gr");
        if (bClass == "4" && gr == grText) {
            str.push(account);
        }
    }

    //Return the array
    return str;
}

VatReconciliation.prototype.loadDataPeriod = function (startDate, endDate, periodName) {

    if (!startDate || !endDate || !periodName)
        return;
    
    this.data[periodName] = {};
    this.data[periodName].startDate = startDate;
    this.data[periodName].endDate = endDate;
    this.data[periodName].periodName = periodName;
    this.data[periodName].accounts = [];
    //registrazioni ricavi
    this.data[periodName].table1 = {};
    //iva dichiarata nel formulario
    this.data[periodName].table2 = {};

    //totale ricavi suddivisi per conto
    this.data[periodName].totalRevenuesBookedWithVatCode = {};
    this.data[periodName].totalRevenuesBookedWithoutVatCode = {};
    //totale ricavi suddivisi per codice iva
    this.data[periodName].totalRevenuesBooked = {};
    //totali dichiarati suddivisi per conto
    this.data[periodName].totalRevenuesDeclared = {};
    //totali dichiarati suddivisi per codice iva
    this.data[periodName].totalVatCodesDeclared = {};

    var journal = this.banDocument.journal(this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NORMAL);

    //riprende tutti i codici iva che appartengono al gr1 200
    var vatCodesAllowed = this.loadDataVatCodes(journal, this.param.options.groupVatTaxable);
    //riprende tutti i conti che appartengono al gruppo 3 ricavi
    var accountsAllowed = this.loadDataAccounts(this.param.options.groupRevenues);

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
            //cifra d'affari
            if (line.accountclass === "4") {
                if (accountsAllowed.indexOf(line.account) >= 0) {
                    var vatcode = line.vatcode;
                    if (vatcode.length <= 0) {
                        vatcode = "_void_";
                    }
                    var account = line.account;
                    if (!this.data[periodName].table1[vatcode]) {
                        this.data[periodName].table1[vatcode] = {};
                    }
                    if (!this.data[periodName].table1[vatcode][account]) {
                        this.data[periodName].table1[vatcode][account] = {};
                        this.data[periodName].table1[vatcode][account].rows = [];
                    }
                    this.data[periodName].table1[vatcode][account].rows.push(line);
                    if (account.length > 0 && this.data[periodName].accounts.indexOf(account) < 0)
                        this.data[periodName].accounts.push(account);
                }
            }

            //table2
            //iva dichiarata nel formulario
            if (line.isvatoperation === "1") {
                if (vatCodesAllowed.indexOf(line.vatcode) >= 0) {
                    var vatcode = line.vatcode;
                    var twinaccount = line.vattwinaccount;
                    if (!this.data[periodName].table2[vatcode]) {
                        this.data[periodName].table2[vatcode] = {};
                    }
                    if (!this.data[periodName].table2[vatcode][twinaccount]) {
                        this.data[periodName].table2[vatcode][twinaccount] = {};
                        this.data[periodName].table2[vatcode][twinaccount].rows = [];
                    }
                    this.data[periodName].table2[vatcode][twinaccount].rows.push(line);
                    if (twinaccount.length > 0 && this.data[periodName].accounts.indexOf(twinaccount) < 0)
                        this.data[periodName].accounts.push(twinaccount);
                }
            }
        }
    }
    this.loadDataTotals(this.data[periodName]);
}

VatReconciliation.prototype.loadDataTotals = function (data) {

    for (var vatcode in data.table1) {
        var totalAmountVatCode = 0;
        for (var account in data.table1[vatcode]) {
            var totalAmountAccount = 0;
            for (var i = 0; i < data.table1[vatcode][account].rows.length; i++) {
                var row = data.table1[vatcode][account].rows[i];
                totalAmountVatCode = Banana.SDecimal.add(row.amount, totalAmountVatCode);
                totalAmountAccount = Banana.SDecimal.add(row.amount, totalAmountAccount);
            }
            //Total accounts by vatcode
            if (vatcode === "_void_") {
                if (!data.totalRevenuesBookedWithoutVatCode[account])
                    data.totalRevenuesBookedWithoutVatCode[account] = 0;
                data.totalRevenuesBookedWithoutVatCode[account] = Banana.SDecimal.add(totalAmountAccount, data.totalRevenuesBookedWithoutVatCode[account]);
            }
            else {
                if (!data.totalRevenuesBookedWithVatCode[account])
                    data.totalRevenuesBookedWithVatCode[account] = 0;
                data.totalRevenuesBookedWithVatCode[account] = Banana.SDecimal.add(totalAmountAccount, data.totalRevenuesBookedWithVatCode[account]);
            }
        }
        //Total vatcode
        data.totalRevenuesBooked[vatcode] = totalAmountVatCode;
    }

    for (var vatcode in data.table2) {
        var totalTaxableAmount = 0;
        for (var account in data.table2[vatcode]) {
            var totalTaxableAmountAccount = 0;
            for (var i = 0; i < data.table2[vatcode][account].rows.length; i++) {
                var row = data.table2[vatcode][account].rows[i];
                totalTaxableAmount = Banana.SDecimal.add(row.vattaxable, totalTaxableAmount);
                totalTaxableAmountAccount = Banana.SDecimal.add(row.vattaxable, totalTaxableAmountAccount);
            }
            //Total account
            if (!data.totalRevenuesDeclared[account])
                data.totalRevenuesDeclared[account] = 0;
            data.totalRevenuesDeclared[account] = Banana.SDecimal.add(totalTaxableAmountAccount, data.totalRevenuesDeclared[account]);
        }
        //Total vatcode
        data.totalVatCodesDeclared[vatcode] = Banana.SDecimal.add(totalTaxableAmount, data.totalVatCodesDeclared[vatcode]);
    }
}

VatReconciliation.prototype.loadDataVatCodes = function (transactions, gr1Text) {
    //Riprende i codici iva gr1 200
    var str = [];
    if (!this.banDocument)
        return str;
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
    stylesheet.addStyle(".h3", "font-size:10pt; text-align:left;");
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
    var year = this.accountingDataBase.closureYear;
    var text = "Riconciliazione IVA esercizio " + year;
    report.addParagraph(text, "h1");

    this.printDataTableDifferences(report, stylesheet, this.data["1Q"]);
    this.printDataTableDifferences(report, stylesheet, this.data["2Q"]);
    this.printDataTableDifferences(report, stylesheet, this.data["3Q"]);
    this.printDataTableDifferences(report, stylesheet, this.data["4Q"]);
    this.printDataTableDifferences(report, stylesheet, this.data["Y"]);

    report.addPageBreak();
    // tabella 1 registrazioni ricavi
    this.printDataTable1(report, stylesheet);
    report.addPageBreak();
    // tabella 2 iva dichiarata nel formulario
    this.printDataTable2(report, stylesheet);
}

VatReconciliation.prototype.printDataTableDifferences = function (report, stylesheet, data) {

    report.addParagraph(" ", "h2");
    report.addParagraph("Periodo: " + data.periodName + " " + Banana.Converter.toLocaleDateFormat(data.startDate) + " - " + Banana.Converter.toLocaleDateFormat(data.endDate), "h2");
    report.addParagraph(" ", "h2");

    // Crea elenco ordinato dei conti
    var accountsList = this.loadDataAccounts(this.param.options.groupRevenues);
    for (var i = 0; i < data.accounts.length; i++) {
        if (accountsList.indexOf(data.accounts[i]) < 0)
            accountsList.push(data.accounts[i]);
    }

    var myTable = report.addTable("");
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("Conto", "left");
    var tableCell = tableHeader.addCell("Cifra d'affari", "right");
    tableCell.addParagraph("con cod.IVA");
    var tableCell = tableHeader.addCell("Cifra d'affari", "right");
    tableCell.addParagraph("senza cod.IVA");
    var tableCell = tableHeader.addCell("Cifra d'affari", "right");
    tableCell.addParagraph("complessiva");
    tableHeader.addCell("Netto dichiarato", "right");
    tableHeader.addCell("Differenza", "right");
    var globalTotal1 = 0;
    var globalTotal2 = 0;
    var globalTotal3 = 0;
    var globalTotal4 = 0;
    var globalDiff = 0;
    for (var i = 0; i < accountsList.length; i++) {
        var account = accountsList[i];
        var total1 = 0;
        var total2 = 0;
        var total3 = 0;
        var total4 = 0;
        var totalDiff = 0;
        if (data.totalRevenuesBookedWithVatCode[account])
            total1 = Banana.SDecimal.invert(data.totalRevenuesBookedWithVatCode[account]);
        if (data.totalRevenuesBookedWithoutVatCode[account])
            total2 = Banana.SDecimal.invert(data.totalRevenuesBookedWithoutVatCode[account]);
        total3 = Banana.SDecimal.add(total1, total2);
        if (data.totalRevenuesDeclared[account])
            total4 = Banana.SDecimal.invert(data.totalRevenuesDeclared[account]);
        var diff = Banana.SDecimal.subtract(total3, total4);

        globalTotal1 = Banana.SDecimal.add(total1, globalTotal1);
        globalTotal2 = Banana.SDecimal.add(total2, globalTotal2);
        globalTotal3 = Banana.SDecimal.add(total3, globalTotal3);
        globalTotal4 = Banana.SDecimal.add(total4, globalTotal4);
        globalDiff = Banana.SDecimal.add(diff, globalDiff);

        var printRow = false;
        if (!Banana.SDecimal.isZero(total1))
            printRow = true;
        if (!Banana.SDecimal.isZero(total2))
            printRow = true;
        if (!Banana.SDecimal.isZero(total3))
            printRow = true;
        if (!Banana.SDecimal.isZero(total4))
            printRow = true;
        if (!Banana.SDecimal.isZero(totalDiff))
            printRow = true;

        if (printRow) {
            var tableRow = myTable.addRow();
            tableRow.addCell(account);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total1), "right");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total2), "right");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total3), "right");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total4), "right");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diff), "right");
        }
    }
    //totale
    var tableRow = myTable.addRow("total");
    tableRow.addCell("Totale");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal1), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal2), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal3), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal4), "right");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalDiff), "right");
}

VatReconciliation.prototype.printDataTable1 = function (report, stylesheet) {
    report.addParagraph("Cifra d'affari (Gr=" + this.param.options.groupRevenues +")", "h2");
    report.addParagraph("Periodo: " + this.data["Y"].periodName + " " + Banana.Converter.toLocaleDateFormat(this.data["Y"].startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.data["Y"].endDate), "h3");

    var myTable = report.addTable("");

    //header
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("");
    tableHeader.addCell("");
    tableHeader.addCell("Descrizione", "left");
    for (var period in this.data) {
        var tableCell = tableHeader.addCell(Banana.Converter.toLocaleDateFormat(this.data[period].endDate), "right");
        tableCell.addParagraph(this.data[period].periodName);
        tableCell.addParagraph(this.accountingDataBase.basicCurrency);
    }

    // Crea elenco ordinato dei codici iva
    var data = this.data["Y"];
    var vatcodesList = [];
    for (var vatcode in data.table1) {
        vatcodesList.push(vatcode);
    }
    vatcodesList.sort(); // Ordina alfabeticamente*/

    //rows
    for (var i = 0; i < vatcodesList.length; i++) {
        var vatcode = vatcodesList[i];
        var vatcodedescription = vatcode;
        if (vatcode === "_void_")
            vatcodedescription = "senza codice IVA";
        var totalAmountVatCode = {};
        for (var account in data.table1[vatcode]) {

            var tableHeader = myTable.addRow("subtotal");
            tableHeader.addCell("");
            tableHeader.addCell("");
            tableHeader.addCell("Totale " + vatcodedescription + " conto " + account);

            for (var period in this.data) {
                var totalAmountPeriod = 0;
                if (!totalAmountVatCode[period])
                    totalAmountVatCode[period] = 0;
                var dataPeriod = this.data[period];
                if (dataPeriod.table1[vatcode] && dataPeriod.table1[vatcode][account]) {
                    for (var j = 0; j < dataPeriod.table1[vatcode][account].rows.length; j++) {
                        var row = dataPeriod.table1[vatcode][account].rows[j];
                        totalAmountPeriod = Banana.SDecimal.add(row.amount, totalAmountPeriod);
                        totalAmountVatCode[period] = Banana.SDecimal.add(row.amount, totalAmountVatCode[period]);
                    }
                }
                tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountPeriod), "right");
            }
        }
        //Total vatcode
        var tableHeader = myTable.addRow("total");
        tableHeader.addCell("");
        tableHeader.addCell("");
        tableHeader.addCell("Totale registrazioni " + vatcodedescription, "bold");
        for (var period in totalAmountVatCode) {
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountVatCode[period]), "right bold");
        }
    }
}

VatReconciliation.prototype.printDataTable2 = function (report, stylesheet) {

    report.addParagraph("IVA imponibile dichiarata nel formulario (Gr1=" + this.param.options.groupVatTaxable +")", "h2");
    report.addParagraph("Periodo: " + this.data["Y"].periodName + " " + Banana.Converter.toLocaleDateFormat(this.data["Y"].startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.data["Y"].endDate), "h3");

    var myTable = report.addTable("");

    //header
    var tableHeader = myTable.addRow("header");
    tableHeader.addCell("");
    tableHeader.addCell("Descrizione", "left");
    tableHeader.addCell("");
    for (var period in this.data) {
        var tableCell = tableHeader.addCell("Imponibile", "right");
        tableCell.addParagraph(this.data[period].periodName);
        tableCell.addParagraph(this.accountingDataBase.basicCurrency);
    }

    // Crea elenco ordinato dei codici iva
    var data = this.data["Y"];
    var vatcodesList = [];
    for (var vatcode in data.table2) {
        vatcodesList.push(vatcode);
    }
    vatcodesList.sort(); // Ordina alfabeticamente*/

    //rows
    for (var i = 0; i < vatcodesList.length; i++) {
        var vatcode = vatcodesList[i];
        var totalTaxableAmount = {};
        for (var account in data.table2[vatcode]) {

            var tableHeader = myTable.addRow("subtotal");
            tableHeader.addCell("");
            tableHeader.addCell("Totale " + vatcode + " conto " + account);
            tableHeader.addCell("");

            for (var period in this.data) {
                var totalTaxableAmountPeriod = 0;
                if (!totalTaxableAmount[period])
                    totalTaxableAmount[period] = 0;
                var dataPeriod = this.data[period];
                if (dataPeriod.table2[vatcode] && dataPeriod.table2[vatcode][account]) {
                    for (var j = 0; j < dataPeriod.table2[vatcode][account].rows.length; j++) {
                        var row = dataPeriod.table2[vatcode][account].rows[j];
                        totalTaxableAmountPeriod = Banana.SDecimal.add(row.vattaxable, totalTaxableAmountPeriod);
                        totalTaxableAmount[period] = Banana.SDecimal.add(row.vattaxable, totalTaxableAmount[period]);
                    }
                }
                tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalTaxableAmountPeriod), "right");
            }
        }
        //Total vatcode
        var tableHeader = myTable.addRow("total");
        tableHeader.addCell("");
        tableHeader.addCell("Totale " + vatcode, "bold");
        tableHeader.addCell("");
        for (var period in totalTaxableAmount) {
            tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalTaxableAmount[period]), "right bold");
        }
    }
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
