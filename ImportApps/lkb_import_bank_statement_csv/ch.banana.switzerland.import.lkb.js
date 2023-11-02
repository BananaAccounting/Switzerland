// @id = ch.banana.switzerland.import.lkb
// @api = 1.0
// @pubdate = 2023-02-07
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

function exec(string) {

    var fieldSeparator = findSeparator(string);
    var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

    // Format 4
    var format4 = new LKBFormat4();
    if (format4.match(transactions)) {
        transactions = format4.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 3
    var format3 = new LKBFormat3();
    if (format3.match(transactions)) {
        transactions = format3.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 2
    var format2 = new LKBFormat2();
    if (format2.match(transactions)) {
        transactions = format2.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 1
    var format1 = new LKBFormat1();
    if (format1.match(transactions)) {
        transactions = format1.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format is unknow, return an error
    return "@Error: Unknow format";
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

    var commaCount = 0;
    var semicolonCount = 0;
    var tabCount = 0;

    for (var i = 0; i < 1000 && i < string.length; i++) {
        var c = string[i];
        if (c === ',')
            commaCount++;
        else if (c === ';')
            semicolonCount++;
        else if (c === '\t')
            tabCount++;
    }

    if (tabCount > commaCount && tabCount > semicolonCount) {
        return '\t';
    }
    else if (semicolonCount > commaCount) {
        return ';';
    }

    return ',';
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