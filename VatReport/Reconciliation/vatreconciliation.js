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
// @id = ch.banana.ch.swissvatreconciliation
// @api = 1.0
// @pubdate = 2025-06-16
// @publisher = Banana.ch SA
// @description = Swiss VAT Reconciliation
// @description.it = Riconciliazione IVA Svizzera
// @description.de = MWST-Abstimmung Schweiz
// @description.fr = Rapprochement TVA Suisse
// @description.en = Swiss VAT Reconciliation
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

    // Get saved param, or set default ones
    var savedParam = Banana.document.getScriptSettings();
    var param = (savedParam && savedParam.length > 0) ? JSON.parse(savedParam) : vatReconciliation.initParam();
    vatReconciliation.setParam(param);

    // Shows the settings dialog to the user
    param = vatReconciliation.settingsDialog();

    if (!param) {
        return "@Cancel";
    }

    vatReconciliation.loadData();

    var texts = vatReconciliation.setTexts();

    var report = Banana.Report.newReport(texts.document);
    var stylesheet = Banana.Report.newStyleSheet();
    vatReconciliation.printData(report, stylesheet, texts);
    Banana.Report.preview(report, stylesheet);
}

var VatReconciliation = class VatReconciliation {

    constructor(banDocument) {
        this.banDocument = banDocument;
        if (this.banDocument === undefined) {
            this.banDocument = Banana.document;
        }
        this.initData();

        //errors
        this.ID_ERR_VERSION = "ID_ERR_VERSION";
        this.ID_ERR_LICENSE = "ID_ERR_LICENSE";
    }

    initData() {
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
            if (this.accountingDataBase.openingDate.length >= 10) {
                this.accountingDataBase.openingYear = this.accountingDataBase.openingDate.substring(0, 4);
            }
            if (this.accountingDataBase.closureDate.length >= 10) {
                this.accountingDataBase.closureYear = this.accountingDataBase.closureDate.substring(0, 4);
            }
        }
    }

    initParam() {
        var param = {};
        param.startDate = this.accountingDataBase.openingDate;
        param.endDate = this.accountingDataBase.closureDate;
        param.subdivision = "Q";

        // gruppo cifra d'affari
        param.groupRevenues = "3";
        // gruppo imponibile nel formulario
        param.groupVatTaxable = "200";
        // gruppo raggruppamento codici IVA da includere per registrazioni senza conto
        param.groupVatCodes = "1.1";

        return param;
    }

    loadData() {
        if (!this.banDocument) {
            return;
        }

        var startDate = this.param.startDate;
        var endDate = this.param.endDate;

        if (this.accountingDataBase.openingDate === startDate && this.accountingDataBase.closureDate === endDate) {
            this.loadDataPeriod(startDate, endDate, "Y");
            if (this.param.subdivision === "Q") {
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

    loadDataAccounts(grText) {
        var str = [];
        if (!this.banDocument) {
            return str;
        }
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

    loadDataPeriod(startDate, endDate, periodName) {

        if (!startDate || !endDate || !periodName) {
            return;
        }
        
        this.data[periodName] = {};
        this.data[periodName].startDate = startDate;
        this.data[periodName].endDate = endDate;
        this.data[periodName].periodName = periodName;
        this.data[periodName].accounts = [];
        //registrazioni ricavi
        this.data[periodName].table1 = {};
        //iva dichiarata nel formulario
        this.data[periodName].table2 = {};
        //registrazioni iva senza conto
        this.data[periodName].vatTransactionsWithoutAccount = [];

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
        var vatCodesAllowed = this.loadDataVatCodes(journal, this.param.groupVatTaxable);
        //riprende tutti i conti che appartengono al gruppo 3 ricavi
        var accountsAllowed = this.loadDataAccounts(this.param.groupRevenues);

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
                line.vattwinaccount = tRow.value("VatTwinAccount");
                line.roworigin = tRow.value("JRowOrigin");
                line.vatamounttype = tRow.value("VatAmountType");

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
                        if (account.length > 0 && this.data[periodName].accounts.indexOf(account) < 0) {
                            this.data[periodName].accounts.push(account);
                        }
                    }
                }

                //table2
                //iva dichiarata nel formulario
                if (line.isvatoperation === "1") {
                    if (vatCodesAllowed.indexOf(line.vatcode) >= 0) {
                        var vatcode = line.vatcode;
                        var twinaccount = Banana.SDecimal.abs(line.vattwinaccount);
                        if (!this.data[periodName].table2[vatcode]) {
                            this.data[periodName].table2[vatcode] = {};
                        }
                        if (!this.data[periodName].table2[vatcode][twinaccount]) {
                            this.data[periodName].table2[vatcode][twinaccount] = {};
                            this.data[periodName].table2[vatcode][twinaccount].rows = [];
                        }
                        this.data[periodName].table2[vatcode][twinaccount].rows.push(line);
                        if (twinaccount.length > 0 && this.data[periodName].accounts.indexOf(twinaccount) < 0) {
                            this.data[periodName].accounts.push(twinaccount);
                        }
                    }
                }

                //dettagli differenze
                //registrazioni iva senza conto
                if (line.vatcode && line.isvatoperation === "1" && line.vattwinaccount.length <= 0) {
                    var vatCodeGr = this.banDocument.table('VatCodes').findRowByValue('VatCode', line.vatcode).value("Gr");
                    if (vatCodeGr === this.param.groupVatCodes) {
                        //Banana.console.log("loaddataperiod => this.param.groupVatCodes: " + this.param.groupVatCodes);
                        this.data[periodName].vatTransactionsWithoutAccount.push(line);
                        //Banana.console.log(JSON.stringify(tRow.toJSON(), null, 3));
                    }
                }
            }
        }
        this.loadDataTotals(this.data[periodName]);
    }

    loadDataTotals(data) {

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
                    if (!data.totalRevenuesBookedWithoutVatCode[account]) {
                        data.totalRevenuesBookedWithoutVatCode[account] = 0;
                    }
                    data.totalRevenuesBookedWithoutVatCode[account] = Banana.SDecimal.add(totalAmountAccount, data.totalRevenuesBookedWithoutVatCode[account]);
                }
                else {
                    if (!data.totalRevenuesBookedWithVatCode[account]) {
                        data.totalRevenuesBookedWithVatCode[account] = 0;
                    }
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
                if (!data.totalRevenuesDeclared[account]) {
                    data.totalRevenuesDeclared[account] = 0;
                }
                data.totalRevenuesDeclared[account] = Banana.SDecimal.add(totalTaxableAmountAccount, data.totalRevenuesDeclared[account]);
            }
            //Total vatcode
            data.totalVatCodesDeclared[vatcode] = Banana.SDecimal.add(totalTaxableAmount, data.totalVatCodesDeclared[vatcode]);
        }
    }

    loadDataVatCodes(transactions, gr1Text) {
        //Riprende i codici iva gr1 200
        var str = [];
        if (!this.banDocument) {
            return str;
        }
        var table = this.banDocument.table("VatCodes");
        if (!table) {
            return str;
        }

        var usedVatCodes = [];
        var startDate = this.param.startDate;
        var endDate = this.param.endDate;

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

    printData(report, stylesheet, texts) {

        if (!report || !stylesheet) {
            return;
        }

        // Style
        stylesheet.addStyle("@page", "margin:15mm 10mm 10mm 20mm;")
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
        stylesheet.addStyle(".transactions", "font-family: Courier New; font-size: 5pt; color: black; background-color: #ffffff; border: thin solid black;");

        // Report title
        var year = this.accountingDataBase.closureYear;
        var text = texts.title_main + " " + year;
        report.addParagraph(text, "h1");

        this.printDataTableDifferences(report, stylesheet, this.data["1Q"], texts);
        this.printDataTableDifferences(report, stylesheet, this.data["2Q"], texts);
        this.printDataTableDifferences(report, stylesheet, this.data["3Q"], texts);
        this.printDataTableDifferences(report, stylesheet, this.data["4Q"], texts);
        this.printDataTableDifferences(report, stylesheet, this.data["Y"], texts);

        report.addPageBreak();
        // tabella 1 registrazioni ricavi
        this.printDataTable1(report, stylesheet, texts);
        report.addPageBreak();
        // tabella 2 iva dichiarata nel formulario
        this.printDataTable2(report, stylesheet, texts);

        // scheda conto per ogni conto con differenze
        // this.printDataTransactions(report, stylesheet, this.data["1Q"], texts);
        // this.printDataTransactions(report, stylesheet, this.data["2Q"], texts);
        // this.printDataTransactions(report, stylesheet, this.data["3Q"], texts);
        // this.printDataTransactions(report, stylesheet, this.data["4Q"], texts);
        this.printDataTransactions(report, stylesheet, this.data["Y"], texts);

        // numero pagina nel footer
        report.getFooter().addClass("footer");
        report.getFooter().addText("-", "");
        report.getFooter().addFieldPageNr();
        report.getFooter().addText("-", "");
    }

    printDataTableDifferences(report, stylesheet, data, texts) {

        report.addParagraph(" ", "h2");
        report.addParagraph(texts.period + ": " + data.periodName + " " + Banana.Converter.toLocaleDateFormat(data.startDate) + " - " + Banana.Converter.toLocaleDateFormat(data.endDate), "h2");
        report.addParagraph(" ", "h2");

        // Crea elenco ordinato dei conti
        var accountsList = this.loadDataAccounts(this.param.groupRevenues);
        for (var i = 0; i < data.accounts.length; i++) {
            if (accountsList.indexOf(data.accounts[i]) < 0) {
                accountsList.push(data.accounts[i]);
            }
        }

        var myTable = report.addTable("");
        var tableHeader = myTable.addRow("header");
        tableHeader.addCell(texts.account, "left");
        var tableCell = tableHeader.addCell(texts.turnover, "right");
        tableCell.addParagraph(texts.with_vat_code);
        var tableCell = tableHeader.addCell(texts.turnover, "right");
        tableCell.addParagraph(texts.without_vat_code);
        var tableCell = tableHeader.addCell(texts.turnover, "right");
        tableCell.addParagraph(texts.overall);
        tableHeader.addCell(texts.net_declared, "right");
        tableHeader.addCell(texts.difference, "right");
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
            if (data.totalRevenuesBookedWithVatCode[account]) {
                total1 = Banana.SDecimal.invert(data.totalRevenuesBookedWithVatCode[account]);
            }
            if (data.totalRevenuesBookedWithoutVatCode[account]) {
                total2 = Banana.SDecimal.invert(data.totalRevenuesBookedWithoutVatCode[account]);
            }
            total3 = Banana.SDecimal.add(total1, total2);
            if (data.totalRevenuesDeclared[account]) {
                total4 = Banana.SDecimal.invert(data.totalRevenuesDeclared[account]);
            }
            var diff = Banana.SDecimal.subtract(total3, total4);

            globalTotal1 = Banana.SDecimal.add(total1, globalTotal1);
            globalTotal2 = Banana.SDecimal.add(total2, globalTotal2);
            globalTotal3 = Banana.SDecimal.add(total3, globalTotal3);
            globalTotal4 = Banana.SDecimal.add(total4, globalTotal4);
            globalDiff = Banana.SDecimal.add(diff, globalDiff);

            var printRow = false;
            if (!Banana.SDecimal.isZero(total1)) {
                printRow = true;
            }
            if (!Banana.SDecimal.isZero(total2)) {
                printRow = true;
            }
            if (!Banana.SDecimal.isZero(total3)) {
                printRow = true;
            }
            if (!Banana.SDecimal.isZero(total4)) {
                printRow = true;
            }
            if (!Banana.SDecimal.isZero(totalDiff)) {
                printRow = true;
            }

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
        tableRow.addCell(texts.total);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal1), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal2), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal3), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalTotal4), "right");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(globalDiff), "right");
    }

    printDataTable1(report, stylesheet, texts) {
        report.addParagraph(texts.turnover + " (Gr=" + this.param.groupRevenues +")", "h2");
        report.addParagraph(texts.period + ": " + this.data["Y"].periodName + " " + Banana.Converter.toLocaleDateFormat(this.data["Y"].startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.data["Y"].endDate), "h3");

        var myTable = report.addTable("");

        //header
        var tableHeader = myTable.addRow("header");
        tableHeader.addCell("");
        tableHeader.addCell("");
        tableHeader.addCell(texts.description, "left");
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
            if (vatcode === "_void_") {
                vatcodedescription = texts.without_vat_code;
            }
            var totalAmountVatCode = {};
            for (var account in data.table1[vatcode]) {

                var tableHeader = myTable.addRow("subtotal");
                tableHeader.addCell("");
                tableHeader.addCell("");
                tableHeader.addCell(texts.total + " " + vatcodedescription + " " + texts.account.toLowerCase() + " " + account);

                for (var period in this.data) {
                    var totalAmountAccount = 0;
                    if (!totalAmountVatCode[period]) {
                        totalAmountVatCode[period] = 0;
                    }
                    var dataPeriod = this.data[period];
                    if (dataPeriod.table1[vatcode] && dataPeriod.table1[vatcode][account]) {
                        for (var j = 0; j < dataPeriod.table1[vatcode][account].rows.length; j++) {
                            var row = dataPeriod.table1[vatcode][account].rows[j];
                            var amount = Banana.SDecimal.invert(row.amount);
                            totalAmountAccount = Banana.SDecimal.add(amount, totalAmountAccount);
                            totalAmountVatCode[period] = Banana.SDecimal.add(amount, totalAmountVatCode[period]);
                        }
                    }
                    tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountAccount), "right");
                }
            }
            //Total vatcode
            var tableHeader = myTable.addRow("total");
            tableHeader.addCell("");
            tableHeader.addCell("");
            tableHeader.addCell(texts.total_transactions + " " + vatcodedescription, "bold");
            for (var period in totalAmountVatCode) {
                tableHeader.addCell(Banana.Converter.toLocaleNumberFormat(totalAmountVatCode[period]), "right bold");
            }
        }
    }

    printDataTable2(report, stylesheet, texts) {

        report.addParagraph("IVA imponibile dichiarata nel formulario (Gr1=" + this.param.groupVatTaxable +")", "h2");
        report.addParagraph(texts.period + ": " + this.data["Y"].periodName + " " + Banana.Converter.toLocaleDateFormat(this.data["Y"].startDate) + " - " + Banana.Converter.toLocaleDateFormat(this.data["Y"].endDate), "h3");

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
                    if (!totalTaxableAmount[period]) {
                        totalTaxableAmount[period] = 0;
                    }
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

    printDataTransactions(report, stylesheet, data, texts) {

        report.addPageBreak();
        report.addParagraph("Registrazioni dei conti con differenze", "h2");
        report.addParagraph(texts.period + ": " + data.periodName + " " + Banana.Converter.toLocaleDateFormat(data.startDate) + " - " + Banana.Converter.toLocaleDateFormat(data.endDate), "h3");

        // Crea elenco ordinato dei conti
        var accountsList = this.loadDataAccounts(this.param.groupRevenues);
        for (var i = 0; i < data.accounts.length; i++) {
            if (accountsList.indexOf(data.accounts[i]) < 0) {
                accountsList.push(data.accounts[i]);
            }
        }

        var myTable = report.addTable("");

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
            if (data.totalRevenuesBookedWithVatCode[account]) {
                total1 = Banana.SDecimal.invert(data.totalRevenuesBookedWithVatCode[account]);
            }
            if (data.totalRevenuesBookedWithoutVatCode[account]) {
                total2 = Banana.SDecimal.invert(data.totalRevenuesBookedWithoutVatCode[account]);
            }
            total3 = Banana.SDecimal.add(total1, total2);
            if (data.totalRevenuesDeclared[account]) {
                total4 = Banana.SDecimal.invert(data.totalRevenuesDeclared[account]);
            }
            var diff = Banana.SDecimal.subtract(total3, total4);

            globalTotal1 = Banana.SDecimal.add(total1, globalTotal1);
            globalTotal2 = Banana.SDecimal.add(total2, globalTotal2);
            globalTotal3 = Banana.SDecimal.add(total3, globalTotal3);
            globalTotal4 = Banana.SDecimal.add(total4, globalTotal4);
            globalDiff = Banana.SDecimal.add(diff, globalDiff);

            var printRow = false;
            if (!Banana.SDecimal.isZero(diff)) {
                printRow = true;
            }

            if (printRow) {

                var accountRow = this.banDocument.table('Accounts').findRowByValue('Account',account);
                var accountDescription = "";
                if (accountRow) {
                    accountDescription = accountRow.value("Description");
                }

                var tableRow = myTable.addRow();
                tableRow.addCell("","",13);
                var tableRow = myTable.addRow();
                tableRow.addCell("Conto: " + account + " " + accountDescription + " - Differenza: " + Banana.Converter.toLocaleNumberFormat(diff), "bold", 13);

                var tableRow = myTable.addRow();
                tableRow.addCell("Riga","transactions bold");
                tableRow.addCell("Data","transactions bold");
                tableRow.addCell("Doc","transactions bold");
                tableRow.addCell("Descrizione","transactions bold");
                tableRow.addCell("Conto","transactions bold");
                tableRow.addCell("Ctrp.","transactions bold");
                tableRow.addCell("Dare","transactions bold");
                tableRow.addCell("Avere","transactions bold");
                tableRow.addCell("Cod.IVA","transactions bold");
                tableRow.addCell("Tipo Imp.","transactions bold");
                tableRow.addCell("IVA imponibile","transactions bold");
                tableRow.addCell("Importo IVA","transactions bold");
                tableRow.addCell("IVA contabile","transactions bold");

                var totalDebit = 0;
                var totalCredit = 0;
                var invertSign = false;

                if (account !== "0") {
                    var transTab = this.banDocument.currentCard(account, data.startDate, data.endDate);
                    
                    for (var j = 0; j < transTab.rowCount-1; j++) { //-1 without total row
                        var tRow = transTab.row(j);

                        var roworigin = tRow.value("JRowOrigin");
                        var date = tRow.value("JDate");
                        var doc = tRow.value("Doc");
                        var description = tRow.value("Description");
                        description = description ? (description.length > 20 ? description.slice(0, 20).replace(/\s+$/, "") + "..." : description) : "";
                        var account = tRow.value("JAccount");
                        var contraaccount = tRow.value("JContraAccount");
                        var debitamount = tRow.value("JDebitAmount");
                        var creditamount = tRow.value("JCreditAmount");
                        var vatcode = tRow.value("JVatCodeWithoutSign");
                        var vattaxable = tRow.value("JVatTaxable");
                        var vatamount = tRow.value("VatAmount");
                        var vatposted = tRow.value("VatPosted");
                        var vatamounttype = tRow.value("VatAmountType");


                        var printTransactionRow = false;
                        if (diff && diff === total3) {
                            // caso 1
                            // la differenza è uguale al totale cifra affari complessiva =>> Es. 3810
                            // prende tutte le registrazioni
                            printTransactionRow = true;
                        }
                        else if (diff && diff === total2 && !vatcode) {
                            // caso 2
                            // la differenza è uguale al totale cifra affari senza IVA =>> Es. 3000
                            // prende registrazioni senza IVA
                            printTransactionRow = true;
                        }
                        else if (diff && diff === total1 && vatcode) {
                            // caso 3
                            // la differenza è uguale alla cifra affari con IVA
                            // prende registrazioni con IVA
                            printTransactionRow = true;
                        }
                        else if (diff && Banana.SDecimal.isZero(total3) && vatcode) {
                            // caso 4
                            // la differenza è diversa da 0, cifra affari complessiva uguale a 0
                            // prende registrazioni con IVA conto vendite che hanno GR come impostato da parametri
                            var vatCodeGr = this.banDocument.table('VatCodes').findRowByValue('VatCode', vatcode).value("Gr");
                            if (vatCodeGr === this.param.groupVatCodes) {
                                printTransactionRow = true;
                                invertSign = true;
                            }
                        }

                        if (printTransactionRow) {

                            var tableRow = myTable.addRow();
                            tableRow.addCell(parseInt(roworigin)+1,"transactions");
                            tableRow.addCell(Banana.Converter.toLocaleDateFormat(date),"transactions");
                            tableRow.addCell(doc,"transactions");
                            tableRow.addCell(description,"transactions");
                            tableRow.addCell(account,"transactions");
                            tableRow.addCell(contraaccount,"transactions");
                            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(debitamount),"transactions right");
                            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(creditamount),"transactions right");
                            tableRow.addCell(vatcode,"transactions");
                            tableRow.addCell(vatamounttype,"transactions");
                            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vattaxable),"transactions right");
                            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vatamount),"transactions right");
                            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vatposted),"transactions right");

                            totalDebit = Banana.SDecimal.add(totalDebit, debitamount);
                            totalCredit = Banana.SDecimal.add(totalCredit, creditamount);
                        }
                    }
                }
                else {
                    // caso 5
                    // registrazione iva senza conto
                    // prende le registrazioni dal giornale
                    var transactions = data.vatTransactionsWithoutAccount;
                    //Banana.console.log(JSON.stringify(transactions, null, 3));

                    for (var k in transactions) {

                        roworigin = transactions[k].roworigin;
                        date = transactions[k].date;
                        doc = transactions[k].doc;
                        description = transactions[k].description;
                        description = description ? (description.length > 20 ? description.slice(0, 20).replace(/\s+$/, "") + "..." : description) : "";
                        account = transactions[k].account;
                        contraaccount = transactions[k].vattwinaccount;
                        debitamount = transactions[k].debitamount;
                        creditamount = transactions[k].creditamount;
                        vatcode = transactions[k].vatcode;
                        vattaxable = transactions[k].vattaxable;
                        vatamount = transactions[k].vatamount;
                        vatposted = transactions[k].vatposted;
                        vatamounttype = transactions[k].vatamounttype;
                    
                        var tableRow = myTable.addRow();
                        tableRow.addCell(parseInt(roworigin)+1,"transactions");
                        tableRow.addCell(Banana.Converter.toLocaleDateFormat(date),"transactions");
                        tableRow.addCell(doc,"transactions");
                        tableRow.addCell(description,"transactions");
                        tableRow.addCell(account,"transactions");
                        tableRow.addCell(contraaccount,"transactions");
                        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(debitamount),"transactions right");
                        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(creditamount),"transactions right");
                        tableRow.addCell(vatcode,"transactions");
                        tableRow.addCell(vatamounttype,"transactions");
                        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vattaxable),"transactions right");
                        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vatamount),"transactions right");
                        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(vatposted),"transactions right");

                        totalDebit = Banana.SDecimal.add(totalDebit, debitamount);
                        totalCredit = Banana.SDecimal.add(totalCredit, creditamount);
                    }
                }

                var tableRow = myTable.addRow();
                tableRow.addCell("Totale", "transactions bold", 5);
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalDebit), "transactions bold right");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalCredit), "transactions bold right");
                var diffTotalTransactions = Banana.SDecimal.subtract(totalCredit,totalDebit);
                if (invertSign) {
                    diffTotalTransactions = Banana.SDecimal.subtract(totalDebit,totalCredit);
                }
                tableRow.addCell("Differenza da registrazioni: " + Banana.Converter.toLocaleNumberFormat(diffTotalTransactions),"transactions bold", 6);
            }
        }
    }

    convertParam(param) {

        var texts = this.setTexts();

        var convertedParam = {};
        convertedParam.version = '1.0';
        convertedParam.data = []; /* array dei parametri dello script */

        var currentParam = {};
        currentParam.name = 'groupRevenues';
        currentParam.title = texts.param_group_revenues;
        currentParam.type = 'string';
        currentParam.value = param.groupRevenues ? param.groupRevenues : '';
        currentParam.defaultvalue = '3';
        currentParam.readValue = function() {
            param.groupRevenues = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'groupVatTaxable';
        currentParam.title = texts.param_group_vat_taxable;
        currentParam.type = 'string';
        currentParam.value = param.groupVatTaxable ? param.groupVatTaxable : '';
        currentParam.defaultvalue = '200';
        currentParam.readValue = function() {
            param.groupVatTaxable = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'groupVatCodes';
        currentParam.title = texts.param_group_vat_codes;
        currentParam.type = 'string';
        currentParam.value = param.groupVatCodes ? param.groupVatCodes : '';
        currentParam.defaultvalue = '1.1';
        currentParam.readValue = function() {
            param.groupVatCodes = this.value;
        }
        convertedParam.data.push(currentParam);

        return convertedParam;
    }

    settingsDialog() {
        var param = this.initParam();
        var savedParam = this.banDocument.getScriptSettings();
        if (savedParam.length > 0) {
            param = JSON.parse(savedParam);
        }

        this.setParam(param); // set this.param

        if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
            var dialogTitle = 'Settings';
            var convertedParam = this.convertParam(this.param); // use this.param
            var pageAnchor = 'dlgSettings';
            if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
                return;
            }
            for (var i = 0; i < convertedParam.data.length; i++) {
                if (!convertedParam.data[i].language) {
                    convertedParam.data[i].readValue();
                }
            }
        }

        var paramToString = JSON.stringify(this.param);
        this.banDocument.setScriptSettings(paramToString);

        return this.param; // for exec
    }

    setParam(param) {
        this.param = param;
        this.verifyParam(param);
        //Banana.console.log("setparam => this.param.groupVatCodes: " + this.param.groupVatCodes);
    }

    verifyParam(param) {
        if (!param.groupRevenues) {
            param.groupRevenues = '3';
        }
        if (!param.groupVatTaxable) {
            param.groupVatTaxable = '200';
        }
        if (!param.groupVatCodes) {
            param.groupVatCodes = '1.1';
        }

        //Banana.console.log("verifyparam => this.param.groupVatCodes: " + this.param.groupVatCodes);
    }

    verifyBananaVersion() {
        
        // Version
        if (!Banana.compareVersion || Banana.compareVersion(Banana.application.version, "10.0.1") < 0) {
            Banana.application.showMessages();
            this.banDocument.addMessage(this.getErrorMessage(this.ID_ERR_VERSION));
            return false;
        }

        // License
        var license = Banana.application.license;
        if (!license || license.licenseType !== "advanced") {
            Banana.application.showMessages();
            this.banDocument.addMessage(this.getErrorMessage(this.ID_ERR_LICENSE));
            return false;
        }

        return true;
    }

    getErrorMessage(errorId) {

        var lang = "en";
        if (this.banDocument.locale) {
            lang = this.banDocument.locale;
        }
        if (lang.length > 2) {
            lang = lang.substr(0, 2);
        }

        switch (errorId) {
            case this.ID_ERR_VERSION:
                if (lang === 'it') {
                    return "L'estensione richiede Banana Contabilità Plus 10";
                } else if (lang === 'de') {
                    return "Die Erweiterung erfordert Banana Buchhaltung Plus 10";
                } else if (lang === 'fr') {
                    return "L'extension nécessite Banana Comptabilité Plus 10";
                } else {
                    return "The extension requires Banana Accounting Plus 10";
                }
            case this.ID_ERR_LICENSE:
                if (lang === 'it') {
                    return "L'estensione richiede il piano Advanced";
                } else if (lang === 'de') {
                    return "Die Erweiterung erfordert den Advanced-Plan";
                } else if (lang === 'fr') {
                    return "L'extension nécessite le plan Advanced";
                } else {
                    return "The extension requires the Advanced plan";
                }
        }
        return "";
    }

    setTexts() {

        var lang = "en";
        if (this.banDocument.locale) {
            lang = this.banDocument.locale;
        }
        if (lang.length > 2) {
            lang = lang.substr(0, 2);
        }

        var texts = {};
        if (lang === 'it') {
            texts.document = "Riconciliazione IVA Svizzera";
            texts.title_main = "Riconciliazione IVA esercizio";
            texts.period = "Periodo";
            texts.turnover = "Cifra d'affari";
            texts.account = "Conto";
            texts.with_vat_code = "con cod.IVA";
            texts.without_vat_code = "senza cod.IVA";
            texts.overall = "complessiva";
            texts.net_declared = "Netto dichiarato";
            texts.difference = "Differenza";
            texts.total = "Totale";
            texts.total_transactions = "Totale registrazioni";
            texts.description = "Descrizione";
            texts.param_group_revenues = 'Gruppo conti entrate';
            texts.param_group_vat_taxable = 'Gruppo imponibile nel formulario';
            texts.param_group_vat_codes = 'Gruppo raggruppamento codici IVA per vendite';
        }
        else if (lang === 'de') {
            texts.document = "MWST-Abstimmung Schweiz";
            texts.title_main = "MWST-Abstimmung Geschäftsjahr";
            texts.period = "Zeitraum";
            texts.turnover = "Umsatz";
            texts.account = "Konto";
            texts.with_vat_code = "mit MWST-Code";
            texts.without_vat_code = "ohne MWST-Code";
            texts.overall = "gesamt";
            texts.net_declared = "Netto deklariert";
            texts.difference = "Differenz";
            texts.total = "Gesamt";
            texts.total_transactions = "Gesamtbuchungen";
            texts.description = "Beschreibung";
            texts.param_group_revenues = "Ertragskontengruppe";
            texts.param_group_vat_taxable = "Gruppe steuerpflichtiger Umsätze im Formular";
            texts.param_group_vat_codes = "Gruppe der MWST-Codes für Verkäufe";
        }
        else if (lang === 'fr') {
            texts.document = "Rapprochement TVA Suisse";
            texts.title_main = "Rapprochement TVA exercice";
            texts.period = "Période";
            texts.turnover = "Chiffre d'affaires";
            texts.account = "Compte";
            texts.with_vat_code = "avec code TVA";
            texts.without_vat_code = "sans code TVA";
            texts.overall = "global";
            texts.net_declared = "Net déclaré";
            texts.difference = "Différence";
            texts.total = "Total";
            texts.total_transactions = "Total écritures";
            texts.description = "Description";
            texts.param_group_revenues = "Groupe de comptes de revenus";
            texts.param_group_vat_taxable = "Groupe taxable dans le formulaire";
            texts.param_group_vat_codes = "Groupe de codes TVA pour les ventes";
        }
        else {
            texts.document = "Swiss VAT Reconciliation";
            texts.title_main = "VAT Reconciliation – Fiscal Year";
            texts.period = "Period";
            texts.turnover = "Turnover";
            texts.account = "Account";
            texts.with_vat_code = "with VAT code";
            texts.without_vat_code = "without VAT code";
            texts.overall = "Overall";
            texts.net_declared = "Net Declared";
            texts.difference = "Difference";
            texts.total = "Total";
            texts.total_transactions = "Total Transactions";
            texts.description = "Description";
            texts.param_group_revenues = "Revenue Accounts Group";
            texts.param_group_vat_taxable = "Taxable Amount Group in Form";
            texts.param_group_vat_codes = "VAT Code Grouping for Sales";
        }
        return texts;
    }
}

