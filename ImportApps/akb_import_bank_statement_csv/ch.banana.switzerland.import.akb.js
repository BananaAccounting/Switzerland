// @id = ch.banana.switzerland.import.akb
// @api = 1.0
// @pubdate = 2023-02-07
// @publisher = Banana.ch SA
// @description = Aargauische Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Aargauische Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Aargauische Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.fr = Aargauische Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Aargauische Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
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

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {


    var importUtilities = new ImportUtilities(Banana.document);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    var fieldSeparator = findSeparator(string);
    var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

    // Format 2
    var format2 = new AKBFormat2();
    if (format2.match(transactions)) {
        transactions = format2.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 1
    var format1 = new AKBFormat1();
    if (format1.match(transactions)) {
        transactions = format1.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }


    importUtilities.getUnknownFormatError();

    return "";
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
    } else if (semicolonCount > commaCount) {
        return ';';
    }

    return ',';
}

/**
* Example
* Buchung;Valuta;Buchungstext;Belastung;Gutschrift;Saldo CHF;
* 26.10.2015;26.10.2015;Zahlungseingang / Ref.-Nr. 512024845 CONCARDIS GMBH;;631.98;799.32;
* 23.10.2015;23.10.2015;Zahlungseingang / Ref.-Nr. 511545235 CONCARDIS GMBH;;52.51;167.34;
* 23.10.2015;23.10.2015;Belastung e-banking / Ref.-Nr. 511414344 STOP SHOP MELLINGEN GMBH;16'000.00;;114.83;
*/
function AKBFormat2() {
    this.colDate = 0;
    this.colDateValuta = 1;
    this.colDescr = 2;
    this.colDebit = 3;
    this.colCredit = 4;
    this.colBalance = 5;

    this.colCount = 6;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {

        var formatMatched = false;

        if (transactions.length === 0)
            return false;

        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length === this.colCount ||
                (transaction.length === this.colCount + 1 && transaction[this.colCount].length === 0))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDate] &&
                transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDateValuta] &&
                transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        /** Complete, filter and map rows */
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

        // Sort rows by date (just invert)
        transactionsToImport = transactionsToImport.reverse();

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

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
        mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], "."));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], "."));

        return mappedLine;
    }
}

/**
* Example
* Buchung,Valuta,Buchungstext,Betrag Detail,Belastung,Gutschrift,Saldo
* 31.01.2014,31.01.2014,BESR-Gutschriftsanzeige ESR Liste (Anzahl Buchungen: 2 / Ref.-Nr. 397933031),,,705.00,-8'801.90
* ,,Zahlungseingang ESR / Ref.-Nr. 397788119 711610669529900000000003931 ,520.00,,,
* ,,Zahlungseingang ESR / Ref.-Nr. 397807460 711610669529900000000004042 ,185.00,,,
* 31.01.2014,30.01.2014,Warenbezug und Dienstleistungen 3733 COOP TS GRANICH,,30.00,,-9'506.90
* ,,Kartennummer 92032796 30.01.2014 13:33 CHF 30 ,30.00,,,
*/
function AKBFormat1() {
    this.colDate = 0;
    this.colDateValuta = 1;
    this.colDescr = 2;
    this.colDetail = 3;
    this.colDebit = 4;
    this.colCredit = 5;
    this.colBalance = 6;

    this.colCount = 7;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        var formatMatched = false;

        if (transactions.length === 0)
            return false;

        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length >= this.colCount)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDate] &&
                transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDateValuta] &&
                transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        var transactionsToImport = [];

        /** Complete, filter and map rows */
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

        // Sort rows by date (just invert)
        transactionsToImport = transactionsToImport.reverse();

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

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate]));
        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
        mappedLine.push(""); // Doc is empty for now
        var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
        mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colCredit], "."));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colDebit], "."));

        return mappedLine;
    }
}
