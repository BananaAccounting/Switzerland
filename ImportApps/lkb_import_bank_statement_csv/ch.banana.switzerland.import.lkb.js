// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.switzerland.import.lkb
// @api = 1.0
// @pubdate = 2023-11-03
// @publisher = Banana.ch SA
// @description = Luzerner Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Luzerner Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Luzerner Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.fr = Luzerner Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Luzerner Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

const applicationSupportIsDetail = Banana.compareVersion &&
    (Banana.compareVersion(Banana.application.version, "10.0.12") >= 0);

function exec(inData, isTest) {

    var importUtilities = new ImportUtilities(Banana.document);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    let convertionParam = defineConversionParam(inData);

    var transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, '"');
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

    // Format 6, this format has detailed rows.
    var format6 = new LKBFormat6();
    let transactionsDataF6 = format6.getFormattedData(transactions, importUtilities);
    if (format6.match(transactionsDataF6)) {
        Banana.console.log("format 6");
        transactions = format6.convert(transactionsDataF6);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 5, this format works with the header names.
    var format5 = new LKBFormat5();
    if (format5.match(transactionsData)) {
        Banana.console.log("format 5");
        transactions = format5.convert(transactionsData);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 4
    var format4 = new LKBFormat4();
    if (format4.match(transactions)) {
        Banana.console.debug("format 4");
        transactions = format4.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 3
    var format3 = new LKBFormat3();
    if (format3.match(transactions)) {
        Banana.console.debug("format 3");
        transactions = format3.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 2
    var format2 = new LKBFormat2();
    if (format2.match(transactions)) {
        Banana.console.debug("format 2");
        transactions = format2.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 1
    var format1 = new LKBFormat1();
    if (format1.match(transactions)) {
        Banana.console.debug("format 1");
        transactions = format1.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * LKB Format 6
 *
 * Buchung;Valuta;Buchungstext;Detail;Gutschrift;Belastung;Saldo (CHF)
 * 31.12.2024;31.12.2024;Warenbezug/Dienstleistung / 1556695048 Bezugsort: Description; ; ;228.55;140574.1
 * 31.12.2024;31.12.2024;Warenbezug/Dienstleistung / 1556701551 Bezugsort: Description; ;5827.8; ;140802.65
 *  ; ;Warenbezug/Dienstleistung / 1556701551 Bezugsort: Description;72; ; ; 
 *  ; ;Warenbezug/Dienstleistung / 1556701551 Bezugsort: Description;293.7; ; ; 
*/
function LKBFormat6() {
    // Index of columns in *.csv file

    this.getFormattedData = function(transactions, importUtilities) {
        let transactionsCopy = JSON.parse(JSON.stringify(transactions)); //To not modifiy the original array we make a deep copy of the array.
        var columns = importUtilities.getHeaderData(transactionsCopy, 0); //array
        var rows = importUtilities.getRowData(transactionsCopy, 1); //array of array
        let form = [];
        let convertedColumns = [];

        convertedColumns = this.convertHeaderDe(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        return [];
    }

    this.convertHeaderDe = function(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Buchung":
                    convertedColumns[i] = "Date";
                    break;
                case "Valuta":
                    convertedColumns[i] = "DateValue";
                    break;
                case "Buchungstext":
                    convertedColumns[i] = "Description";
                    break;
                case "Detail":
                    convertedColumns[i] = "DetailAmount";
                    break;
                case "Belastung":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Gutschrift":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Saldo (CHF)":
                    convertedColumns[i] = "Balance";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("Date") < 0
            || convertedColumns.indexOf("DateValue") < 0) {
            return [];
        }

        return convertedColumns;
    }
    

    /** Return true if the transactions match this format */
    this.match = function(transactionsData) {
        if (transactionsData.length === 0)
            return false;

        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["Date"] && transaction["Date"].match(/^\d{2}.\d{2}.\d{4}$/)
                && "DetailAmount" in transaction)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["DateValue"] &&
                transaction["DateValue"].match(/^\d{2}.\d{2}.\d{4}$/) && "DetailAmount" in transaction)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["DebitAmount"] || transaction["CreditAmount"])
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

        return false;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function(transactionsData) {
        var transactionsToImport = [];

        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;
        var lastCompleteTransactionPrinted = false;

        // Filter and map rows
        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            if (transaction["Description"]) { //Valid transaction (complete & detail).
                if (!this.isDetailRow(transaction)) { // Normal row.
                    lastCompleteTransactionPrinted = false;
                    if (isPreviousCompleteTransaction) {
                        transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                    }
                    lastCompleteTransaction = transaction;
                    isPreviousCompleteTransaction = true;
                } else { // Detail row.
                    if (transaction['DetailAmount'] && transaction['DetailAmount'].length > 1) {
                        if (applicationSupportIsDetail && !lastCompleteTransactionPrinted) {
                            lastCompleteTransaction['IsDetail'] = 'S';
                            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                            lastCompleteTransactionPrinted = true;
                        }
                        this.fillDetailRow(transaction, lastCompleteTransaction);
                        if (applicationSupportIsDetail) {
                            transaction['IsDetail'] = 'D';
                        }
                        transactionsToImport.push(this.mapTransaction(transaction));
                        isPreviousCompleteTransaction = false;
                    } else {
                        this.fillDetailRow(transaction, lastCompleteTransaction);
                        transactionsToImport.push(this.mapTransaction(transaction));
                        isPreviousCompleteTransaction = false;
                    }
                }
            }
        }

        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [
            ["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses", "IsDetail"],
        ];
        return header.concat(transactionsToImport);
    }

    this.fillDetailRow = function(detailRow, totalRow) {
        // Copy dates
        detailRow["Date"] = totalRow["Date"];
        detailRow["DateValue"] = totalRow["DateValue"];
        if (detailRow["DetailAmount"] && detailRow["DetailAmount"].length > 1) {
            if (totalRow["DebitAmount"].length > 1) {
                detailRow["DebitAmount"] = detailRow["DetailAmount"];
            } else if (totalRow["CreditAmount"].length > 1) {
                detailRow["CreditAmount"] = detailRow["DetailAmount"];
            }
        } else {
            detailRow["DebitAmount"] = totalRow["DebitAmount"];
            detailRow["CreditAmount"] = totalRow["CreditAmount"];
        }
    }

    this.isDetailRow = function(transaction) {
        if (transaction["Date"].length === 1
            && transaction["DateValue"].length === 1)
            return true;
        return false;
    }

    this.mapTransaction = function(transaction) {
        var mappedLine = [];

        let dateText = "";
        let dateValueText = "";

        dateText = transaction["Date"].substring(0, 10);
        dateValueText = transaction["DateValue"].substring(0, 10);

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push("");
        mappedLine.push(transaction["Description"]);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["DebitAmount"], '.'));
        mappedLine.push(transaction["IsDetail"]);

        return mappedLine;
    }
}

/**
 * LKB Format 5
 *
 * Example A: lkb.#20231102.csv
 * Buchung;Valuta;Buchungstext;Belastung;Gutschrift;Saldo (CHF)
 * 02.11.2023;31.10.2023;"Warenbezug/Dienstleistung / 1556885576 Bezugsort: Description ";23.90;;
 * 02.11.2023;31.10.2023;"Warenbezug/Dienstleistung / 1556695048 Bezugsort: Description ";22.80;;
 * 02.11.2023;31.10.2023;"Warenbezug/Dienstleistung / 1556701551 Bezugsort: Description ";142.56;;
*/
function LKBFormat5() {

    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
        if (transactionsData.length === 0)
            return false;

        // Banana.console.log("transactionsData: " + JSON.stringify(transactionsData));
        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = true;

            if (formatMatched && transaction["Buchung"] && transaction["Buchung"].length >= 10 &&
                transaction["Buchung"].match(/^\d{2}.\d{2}.\d{4}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Valuta"] && transaction["Valuta"].length >= 10 &&
                transaction["Valuta"].match(/^\d{2}.\d{2}.\d{4}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

        return false;
    }

    this.convert = function (transactionsData) {
        var transactionsToImport = [];

        for (var i = 0; i < transactionsData.length; i++) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    this.mapTransaction = function (transaction) {
        let mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Buchung"], "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Valuta"], "dd.mm.yyyy"));
        mappedLine.push(""); // Doc is empty for now
        let externalReference = transaction["Buchungstext"].replace(/.*\/ (\d+) .*/, '$1');
        mappedLine.push(externalReference);
        mappedLine.push(transaction["Buchungstext"]);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Gutschrift"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Belastung"], '.'));

        return mappedLine;
    }
}

/**
 * LKB Format 4
 *
 * Example A: lkb.#20161130.csv
 * Buchungsdatum;Valuta;Buchungstext;Details;Betrag Detail;Belastung;Gutschrift;Saldo CHF
 * Umsatztotal;;;;;24418.72;9382.8;
 * 03.04.2017;03.04.2017;Gutschrift / 781474079;"XYZ AG
 * 1111 Bbbbbb /Othr/Id/0123-456789/
 * SchmeNm/Cd/CUST/Issr/CH/RRR
 * - - Info - -
 * MIETE JIKUHZ";;;1000.00;
 * 03.04.2017;03.04.2017;Gutschrift / 781479574;"Kantonalbank
 * Hauptsitz
 * Stansstaderstrasse 54 6370 Stans CH
 * - - Info - -
 * 16.03.2017 RG-NR. JW2017.033";;;313.20;
*/
function LKBFormat4() {
    this.colDate = 0;
    this.colDateValuta = 1;
    this.colDescr = 2;
    this.colDescrDetail = 3;
    this.colDetail = 4;
    this.colDebit = 6;
    this.colCredit = 5;
    this.colBalance = 7;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length <= 1)
            return false;
        if (transactions[0].length !== (this.colBalance + 1))
            return false;
        if (!transactions[1][this.colDate].match(/[a-zA-Z]+/) && !transactions[transactions.length - 1][this.colDate].match(/[a-zA-Z]+/))
            return false;
        if (!transactions[2][this.colDateValuta].match(/[0-9]{2,2}\.[0-9]{2,2}\.[0-9]{2,4}/) &&
            !transactions[3][this.colDateValuta].match(/[0-9]{2,2}\.[0-9]{2,2}\.[0-9]{2,4}/))
            return false;
        return true;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        // Complete, filter and map rows
        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;

        for (i = 1; i < transactions.length; i++) // First row contains the header
        {
            var transaction = transactions[i];

            if (transaction.length === 0) {
                // Righe vuote
                continue;
            } else if (!transaction[this.colDate].match(/^[0-9]{2,2}\.[0-9]{2,2}\.[0-9]{2,4}$/)) {
                // Riga totali
                continue;
            } else if (!this.isDetailRow(transaction)) {
                if (isPreviousCompleteTransaction === true)
                    transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                lastCompleteTransaction = transaction;
                isPreviousCompleteTransaction = true;
            } else {
                this.fillDetailRow(transaction, lastCompleteTransaction);
                transactionsToImport.push(this.mapTransaction(transaction));
                isPreviousCompleteTransaction = false;
            }
        }
        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Sort rows by date
        transactionsToImport = this.sort(transactionsToImport);

        // Add header and return
        var header = [["Date", "DateValue", "ExternalReference", "Doc", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    /** Return true if the transaction is a transaction row */
    this.isDetailRow = function (transaction) {
        if (transaction[this.colDate].length === 0) // Date (first field) is empty
            return true;
        return false;
    }

    /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
    this.fillDetailRow = function (detailRow, totalRow) {
        // Copy dates
        detailRow[this.colDate] = totalRow[this.colDate];
        detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

        // Copy amount from complete row to detail row
        if (detailRow[this.colDetail].length > 0) {
            if (totalRow[this.colDebit].length > 0) {
                detailRow[this.colDebit] = detailRow[this.colDetail];
            } else if (totalRow[this.colCredit].length > 0) {
                detailRow[this.colCredit] = detailRow[this.colDetail];
            }
        } else {
            detailRow[this.colDebit] = totalRow[this.colDebit];
            detailRow[this.colCredit] = totalRow[this.colCredit];
        }
    }

    /** Sort transactions by date */
    this.sort = function (transactions) {
        if (transactions.length <= 0)
            return transactions;
        var i = 0;
        var previousDate = transactions[0][this.colDate];
        while (i < transactions.length) {
            var date = transactions[i][this.colDate];
            if (previousDate.length > 0 && previousDate > date)
                return transactions.reverse();
            else if (previousDate.length > 0 && previousDate < date)
                return transactions;
            i++;
        }
        return transactions;
    }

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        var externalReference = element[this.colDescr].replace(/.+\/ *([^ ]+) */, '$1'); //remove white spaces
        mappedLine.push(externalReference);
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescrDetail].replace(/ {2,}/g, ' '); //remove white spaces
        mappedLine.push(tidyDescr);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));

        return mappedLine;
    }
}

/**
 * LKB Format 3
 *
 * Example A: lkb.#20161130.csv
 * Buchungsdatum;Valuta;Buchungstext;Details;Betrag Detail;Gutschrift;Belastung;Saldo 
 * 30.11.2016;30.11.2016;Vergütung;"Sunrise Communications AG Postfach 8322 8050 Zurich";;;102;45452.26
 * 28.11.2016;28.11.2016;Vergütung / 742279478;"STEUERAMT WEGGIS 6353 WEGGIS";;;3218.3;45554.26
 * 28.11.2016;28.11.2016;Vergütung / 742279240;"HELVETIA VERSICHERUNGEN 9001 ST.GALLEN";;;2071.1;48772.56
 * 28.11.2016;28.11.2016;Vergütung / 742279158;"AMAG AUTOMOBIL- UND MOTOREN AG RETAIL 8022 ZÜRICH";;;108.6;50843.66
*/
function LKBFormat3() {
    this.colDate = 0;
    this.colDateValuta = 1;
    this.colDescr = 2;
    this.colDescrDetail = 3;
    this.colDetail = 4;
    this.colDebit = 5;
    this.colCredit = 6;
    this.colBalance = 7;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length <= 1)
            return false;
        if (transactions[0].length !== (this.colBalance + 1))
            return false;
        if (!transactions[1][this.colDateValuta].match(/[0-9]{2,2}\.[0-9]{2,2}\.[0-9]{2,4}/))
            return false;
        return true;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        // Complete, filter and map rows
        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;

        for (i = 1; i < transactions.length; i++) // First row contains the header
        {
            var transaction = transactions[i];

            if (transaction.length === 0) {
                // Righe vuote
                continue;
            } else if (!this.isDetailRow(transaction)) {
                if (isPreviousCompleteTransaction === true)
                    transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                lastCompleteTransaction = transaction;
                isPreviousCompleteTransaction = true;
            } else {
                this.fillDetailRow(transaction, lastCompleteTransaction);
                transactionsToImport.push(this.mapTransaction(transaction));
                isPreviousCompleteTransaction = false;
            }
        }
        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Sort rows by date
        transactionsToImport = this.sort(transactionsToImport);

        // Add header and return
        var header = [["Date", "DateValue", "ExternalReference", "Doc", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    /** Return true if the transaction is a transaction row */
    this.isDetailRow = function (transaction) {
        if (transaction[this.colDate].length === 0) // Date (first field) is empty
            return true;
        return false;
    }

    /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
    this.fillDetailRow = function (detailRow, totalRow) {
        // Copy dates
        detailRow[this.colDate] = totalRow[this.colDate];
        detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

        // Copy amount from complete row to detail row
        if (detailRow[this.colDetail].length > 0) {
            if (totalRow[this.colDebit].length > 0) {
                detailRow[this.colDebit] = detailRow[this.colDetail];
            } else if (totalRow[this.colCredit].length > 0) {
                detailRow[this.colCredit] = detailRow[this.colDetail];
            }
        } else {
            detailRow[this.colDebit] = totalRow[this.colDebit];
            detailRow[this.colCredit] = totalRow[this.colCredit];
        }
    }

    /** Sort transactions by date */
    this.sort = function (transactions) {
        if (transactions.length <= 0)
            return transactions;
        var i = 0;
        var previousDate = transactions[0][this.colDate];
        while (i < transactions.length) {
            var date = transactions[i][this.colDate];
            if (previousDate.length > 0 && previousDate > date)
                return transactions.reverse();
            else if (previousDate.length > 0 && previousDate < date)
                return transactions;
            i++;
        }
        return transactions;
    }

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        var externalReference = element[this.colDescr].replace(/.+\/ *([^ ]+) */, '$1'); //remove white spaces         
        mappedLine.push(externalReference);
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescrDetail].replace(/ {2,}/g, ' '); //remove white spaces
        mappedLine.push(tidyDescr);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));

        return mappedLine;
    }
}

/**
 * LKB Format 2
 *
 * Example A: lkb.#20080718.csv
 * Buchungsdatum;Valuta;Buchungstext;Betrag Detail;Gutschrift;Belastung;Saldo
 * 31.08.2016;31.08.2016;Gebühr Bez. Maestro Intern. / 719929491;;;1.5;52614.2
 * 26.08.2016;24.08.2016;Warenbez./Dienstleist. Ausl. / 717227792;;;475.4;52615.7
 * 26.08.2016;24.08.2016;Warenbezug/Dienstleistung / 717343557;;;14.9;53091.1
 * 25.08.2016;25.08.2016;Sammelbelastung / 717398776;;;152.8;53106
*/
function LKBFormat2() {
    this.colDate = 0;
    this.colDateValuta = 1;
    this.colDescr = 2;
    this.colDetail = 3;
    this.colDebit = 4;
    this.colCredit = 5;
    this.colBalance = 6;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length <= 1)
            return false;
        if (transactions[0].length != (this.colBalance + 1))
            return false;
        if (!transactions[1][this.colDateValuta].match(/[0-9]{2,2}\.[0-9]{2,2}\.[0-9]{2,4}/))
            return false;
        return true;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        // Complete, filter and map rows
        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;

        for (i = 1; i < transactions.length; i++) // First row contains the header
        {
            var transaction = transactions[i];

            if (transaction.length === 0) {
                // Righe vuote
                continue;
            } else if (!this.isDetailRow(transaction)) {
                if (isPreviousCompleteTransaction === true)
                    transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                lastCompleteTransaction = transaction;
                isPreviousCompleteTransaction = true;
            } else {
                this.fillDetailRow(transaction, lastCompleteTransaction);
                transactionsToImport.push(this.mapTransaction(transaction));
                isPreviousCompleteTransaction = false;
            }
        }
        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Sort rows by date
        transactionsToImport = this.sort(transactionsToImport);

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    /** Return true if the transaction is a transaction row */
    this.isDetailRow = function (transaction) {
        if (transaction[this.colDate].length === 0) // Date (first field) is empty
            return true;
        return false;
    }

    /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
    this.fillDetailRow = function (detailRow, totalRow) {
        // Copy dates
        detailRow[this.colDate] = totalRow[this.colDate];
        detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

        // Copy amount from complete row to detail row
        if (detailRow[this.colDetail].length > 0) {
            if (totalRow[this.colDebit].length > 0) {
                detailRow[this.colDebit] = detailRow[this.colDetail];
            } else if (totalRow[this.colCredit].length > 0) {
                detailRow[this.colCredit] = detailRow[this.colDetail];
            }
        } else {
            detailRow[this.colDebit] = totalRow[this.colDebit];
            detailRow[this.colCredit] = totalRow[this.colCredit];
        }
    }

    /** Sort transactions by date */
    this.sort = function (transactions) {
        if (transactions.length <= 0)
            return transactions;
        var i = 0;
        var previousDate = transactions[0][this.colDate];
        while (i < transactions.length) {
            var date = transactions[i][this.colDate];
            if (previousDate.length > 0 && previousDate > date)
                return transactions.reverse();
            else if (previousDate.length > 0 && previousDate < date)
                return transactions;
            i++;
        }
        return transactions;
    }

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
        mappedLine.push(tidyDescr);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit]));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit]));

        return mappedLine;
    }
}

/**
 * LKB Format 1
 *
 * Example A: lkb.#20080718.csv
 * Datum,Buchungstext,Betrag Detail,Belastung,Gutschrift,Valuta,Saldo
 * 18.07.2008,"BESR-Gutschriftsanzeige, Ohne Details / Ref.-Nr. XXX",,,10.00,18.07.2008,2'660.83
 * 17.07.2008,"BESR-Gutschriftsanzeige, (Anzahl Buchungen: 1 / Ref.-Nr. XXX)",,,1.00,17.07.2008,2'650.83
 * ,Zahlungseingang ESR / Ref.-Nr. XXX ,,,,,
 *
 * Example B: lkb.#20100927.csv
 * Datum;Buchungstext;Betrag Detail;Belastung;Gutschrift;Valuta;Saldo
 * 03.09.2012;Vergütung Inland / XXX.;;1'500.00;;03.09.2012;9'602.74
 * ;Vergütung Inland / XXX. XXX  ;;;;;
 * 07.09.2012;Gutschrift / XXX.;;;700.00;07.09.2012;10'302.74
 * ;Gutschrift / XXX. XXX ;;;;;

*/
function LKBFormat1() {
    this.colDate = 0;
    this.colDescr = 1;
    this.colDetail = 2;
    this.colDebit = 3;
    this.colCredit = 4;
    this.colDateValuta = 5;
    this.colBalance = 6;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length === 0)
            return false;
        if (transactions[0].length === (this.colBalance + 1))
            return true;
        return false;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        // Complete, filter and map rows
        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;

        for (i = 1; i < transactions.length; i++) // First row contains the header
        {
            var transaction = transactions[i];

            if (transaction.length === 0) {
                // Righe vuote
                continue;
            } else if (!this.isDetailRow(transaction)) {
                if (isPreviousCompleteTransaction === true)
                    transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                lastCompleteTransaction = transaction;
                isPreviousCompleteTransaction = true;
            } else {
                this.fillDetailRow(transaction, lastCompleteTransaction);
                transactionsToImport.push(this.mapTransaction(transaction));
                isPreviousCompleteTransaction = false;
            }
        }
        if (isPreviousCompleteTransaction === true) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Sort rows by date
        transactionsToImport = this.sort(transactionsToImport);

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    /** Return true if the transaction is a transaction row */
    this.isDetailRow = function (transaction) {
        if (transaction[this.colDate].length === 0) // Date (first field) is empty
            return true;
        return false;
    }

    /** Fill the detail rows with the missing values. The value are copied from the preceding total row */
    this.fillDetailRow = function (detailRow, totalRow) {
        // Copy dates
        detailRow[this.colDate] = totalRow[this.colDate];
        detailRow[this.colDateValuta] = totalRow[this.colDateValuta];

        // Copy amount from complete row to detail row
        if (detailRow[this.colDetail].length > 0) {
            if (totalRow[this.colDebit].length > 0) {
                detailRow[this.colDebit] = detailRow[this.colDetail];
            } else if (totalRow[this.colCredit].length > 0) {
                detailRow[this.colCredit] = detailRow[this.colDetail];
            }
        } else {
            detailRow[this.colDebit] = totalRow[this.colDebit];
            detailRow[this.colCredit] = totalRow[this.colCredit];
        }
    }

    /** Sort transactions by date */
    this.sort = function (transactions) {
        if (transactions.length <= 0)
            return transactions;
        var i = 0;
        var previousDate = transactions[0][this.colDate];
        while (i < transactions.length) {
            var date = transactions[i][this.colDate];
            if (previousDate.length > 0 && previousDate > date)
                return transactions.reverse();
            else if (previousDate.length > 0 && previousDate < date)
                return transactions;
            i++;
        }
        return transactions;
    }

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
        mappedLine.push(tidyDescr);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], '.'));

        return mappedLine;
    }
}

function defineConversionParam(inData) {

    var inData = Banana.Converter.csvToArray(inData);
    var header = String(inData[0]);
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '';
    // get separator
    if (header.indexOf(';') >= 0) {
        convertionParam.separator = ';';
    } else {
        convertionParam.separator = ',';
    }

    /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
    We suppose the data will always begin right away after the header line */
    convertionParam.headerLineStart = 0;
    convertionParam.dataLineStart = 1;

    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "Doc"];
    convertionParam.sortDescending = false;

    return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];
    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);
    return form;
}
