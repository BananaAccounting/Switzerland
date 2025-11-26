// @id = ch.banana.switzerland.import.ubs
// @api = 1.0
// @pubdate = 2025-10-22
// @publisher = Banana.ch SA
// @description = UBS - Import account statement .csv (Banana+ Advanced)
// @description.en = UBS - Import account statement .csv (Banana+ Advanced)
// @description.de = UBS - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = UBS - Importer mouvements .csv (Banana+ Advanced)
// @description.it = UBS - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf-8
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js
// @timeout = -1

const applicationSupportIsDetail = Banana.compareVersion &&
    (Banana.compareVersion(Banana.application.version, "10.0.12") >= 0);

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {
    if (!inData) return "";

    const cleanedData = cleanData(inData);

    var importUtilities = new ImportUtilities(Banana.document);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(cleanedData);
    //Add the header if present
    if (convertionParam.header) {
        cleanedData = convertionParam.header + cleanedData;
    }

    let transactions = Banana.Converter.csvToArray(cleanedData, convertionParam.separator, convertionParam.textDelim);


    // Format Credit Card
    var formatCc1Ubs = new UBSFormatCc1();
    if (formatCc1Ubs.match(transactions)) {
        transactions = formatCc1Ubs.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    let transactionsData = {};

    var format1Ubs = new UBSFormat1New(Banana.document);
    transactionsData = format1Ubs.getFormattedData(transactions, importUtilities);
    if (format1Ubs.match(transactionsData)) {
        transactions = format1Ubs.convert(transactionsData);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 2
    var format2Ubs = new UBSFormat2();
    if (format2Ubs.match(transactions)) {
        transactions = format2Ubs.convert(transactions, convertionParam);
        transactions = format2Ubs.postProcessIntermediaryData(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 3
    var format3Ubs = new UBSFormat3();
    transactionsData = format3Ubs.getFormattedData(transactions, importUtilities);
    if (format3Ubs.match(transactionsData)) {
        transactions = format3Ubs.convert(transactionsData);
        return Banana.Converter.arrayToTsv(transactions);
    }

    importUtilities.getUnknownFormatError();

    return "";
}

function cleanData(inData) {
    /** in the new version of format 3 (June 2024) we could have the situation where descriptions have
    * trhee pairs of quotes: """description text""". This situation cause problems
    * when the API Banana.Converter.csvToArray() read the content, the text is ignored. This happen
    * when the text description contains a semicolon ';'.
    * For the time being, we 'clean' the text of these quotes pairs by replacing them with normal quotes pairs.
    *  */
    if (inData.indexOf('"""') >= 0) {
        inData = inData.replace(/"""/g, '"');
    }

    /** Clean data: replace all " ; " with " " 
    * This happen when the description contains a semicolon and is not properly quoted*/
    if (inData.indexOf(" ; ") >= 0) {
        inData = inData.replace(/ ; /g, " ");
    }

    return inData;
}

/**
 * UBS Format 1
 *
 * Valuation date;Banking relationship;Portfolio;Product;IBAN;Ccy.;Date from;Date to;Description;TradeDate;BookingDate;ValueDate;Description 1;Description 2;Description 3;TransactionNr;Exchange rate in the original amount in settlement currency;IndividualAmount;Debit;Credit;Balance
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;e-banking Order;BWS - CHENEVAL, BWS GERMANLINGUA,  DE DE DE 80331     MUECHEN,  INVOICE : M25252,  STD: ALICE CHENEVAL;;ZD81181TI0690091;;;3'416.82;;206'149.34
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;Amount paid;;;ZD81181TI0690091;1.113334;3069;;;
 */
var UBSFormat1New = class UBSFormat1New extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);
        this.decimalSeparator = ".";
    }

    convertHeaderEn(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Valuation date":
                    convertedColumns[i] = "ValuationDate";
                    break;
                case "Date from":
                    convertedColumns[i] = "DateFrom";
                    break;
                case "Date to":
                    convertedColumns[i] = "DateTo";
                    break;
                case "Trade date":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Booking date":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Value date":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Ccy.":
                    convertedColumns[i] = "Currency";
                    break;
                case "Debit":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Credit":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Individual amount":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Balance":
                    convertedColumns[i] = "Balance";
                    break;
                case "Transaction no.":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Description":
                    convertedColumns[i] = "Description";
                    break;
                case "Description 1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Description 2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Description 3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Exchange rate in the original amount in settlement currency":
                    convertedColumns[i] = "ExchangeRate";
                    break;
                default:
                    break;
            }
        }

        // all fields must be present (even if empty)
        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }
    convertHeaderDe(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Bewertungsdatum":
                    convertedColumns[i] = "ValuationDate";
                    break;
                case "Datum von":
                    convertedColumns[i] = "DateFrom";
                    break;
                case "Datum bis":
                    convertedColumns[i] = "DateTo";
                    break;
                case "Abschlussdatum":
                case "Abschluss":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Buchungsdatum":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Valuta":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Währung":
                case "Whrg.":
                    convertedColumns[i] = "Currency";
                    break;
                case "Belastung":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Gutschrift":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Einzelbetrag":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Saldo":
                    convertedColumns[i] = "Balance";
                    break;
                case "Transaktions-Nr.":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Beschreibung":
                    convertedColumns[i] = "Description";
                    break;
                case "Beschreibung 1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Beschreibung 2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Beschreibung 3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Devisenkurs zum Originalbetrag in Abrechnungswährung":
                    convertedColumns[i] = "ExchangeRate";
                    break;
                default:
                    break;
            }
        }

        // all fields must be present (even if empty)
        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }

    convertHeaderIt(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Data di valutazione":
                    convertedColumns[i] = "ValuationDate";
                    break;
                case "Data dal":
                    convertedColumns[i] = "DateFrom";
                    break;
                case "Data al":
                    convertedColumns[i] = "DateTo";
                    break;
                case "Data di chiusura":
                case "Data dell'operazione":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Data di registrazione":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Valuta":
                case "Data di valuta":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Mon.":
                    convertedColumns[i] = "Currency";
                    break;
                case "Addebito":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Accredito":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Importo singolo":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Saldo":
                    convertedColumns[i] = "Balance";
                    break;
                case "N. di transazione":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Descrizione":
                    convertedColumns[i] = "Description";
                    break;
                case "Descrizione 1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Descrizione 2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Descrizione 3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Corso delle divise relativo all'importo originale nella moneta di conteggio":
                    convertedColumns[i] = "ExchangeRate";
                    break;
                default:
                    break;
            }
        }

        // all fields must be present (even if empty)
        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }
    convertHeaderFr(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Date d'évaluation":
                    convertedColumns[i] = "ValuationDate";
                    break;
                case "Date du":
                    convertedColumns[i] = "DateFrom";
                    break;
                case "Date au":
                    convertedColumns[i] = "DateTo";
                    break;
                case "Date de conclusion":
                case "Date de transaction":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Date de comptabilisation":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Date de valeur":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Monn.":
                    convertedColumns[i] = "Currency";
                    break;
                case "Débit":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Crédit":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Sous-montant":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Solde":
                    convertedColumns[i] = "Balance";
                    break;
                case "N° de transaction":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Description":
                    convertedColumns[i] = "Description";
                    break;
                case "Description 1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Description 2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Description 3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Cours des devises du montant initial en montant du décompte":
                    convertedColumns[i] = "ExchangeRate";
                    break;
                default:
                    break;
            }
        }

        // all fields must be present (even if empty)
        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }

    /** Return true if the transactions match this format */
    match(transactionsData) {
        if (transactionsData.length === 0)
            return false;

        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["BookingDate"] &&
                transaction["BookingDate"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (
                formatMatched &&
                transaction["ValueDate"] &&
                transaction["ValueDate"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)
            )
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["DebitAmount"] || transaction["CreditAmount"])
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched) return true;
        }

        return false;
    }

    /** Convert the trnsaction to the format to be imported */
    convert(transactionsData) {
        var transactionsToImport = [];

        /** Complete, filter and map rows */
        var lastCompleteTransaction = null;

        for (let i = 0; i < transactionsData.length; i++) {
            var mappedTransaction = [];
            var transaction = transactionsData[i];

            //BookingDate may be empty
            var length = Object.keys(transaction).length;
            if (length <= 10 ||
                (transaction["BookingDate"] === '' && transaction["TradeDate"] === ''))
                continue;

            if (length >= 10 &&
                (transaction["DebitAmount"] && (transaction["DebitAmount"].length > 0) ||
                    (transaction["CreditAmount"] && transaction["CreditAmount"].length > 0) ||
                    (transaction["Balance"] && transaction["Balance"].length > 0))) {
                // Is a complete row
                if (lastCompleteTransaction) {
                    mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                    mappedTransaction.push("");
                    transactionsToImport.push(mappedTransaction);
                    lastCompleteTransaction = null;
                }
                lastCompleteTransaction = transaction;
            } else if (length >= 17 &&
                transaction["IndividualAmount"] &&
                transaction["IndividualAmount"].length > 0) {
                // Is a detail row
                if (transaction["ExchangeRate"] && transaction["ExchangeRate"].match(/[0-9]+\.[0-9]+/g)) {
                    // Is a multicurrency detail row
                    if (lastCompleteTransaction) {
                        mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                        mappedTransaction.push("");
                        transactionsToImport.push(mappedTransaction);
                        lastCompleteTransaction = null;
                    }
                } else {
                    // Is a normal detail row
                    if (transaction["Description1"] === "Cashpayment charges deducted by post" &&
                        lastCompleteTransaction && lastCompleteTransaction["Description1"] === "Incomings UBS BESR Quick") {
                        // Post charges are contabilised at the end of the period, skip this row
                        if (lastCompleteTransaction !== null) {
                            mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                            mappedTransaction.push("");
                            transactionsToImport.push(mappedTransaction);
                            lastCompleteTransaction = null;
                        }
                    } else {
                        if (lastCompleteTransaction !== null) {
                            mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                            mappedTransaction.push("S");
                            transactionsToImport.push(mappedTransaction);
                            lastCompleteTransaction = null;
                        }
                        mappedTransaction = this.mapDetailTransaction(transaction);
                        mappedTransaction.push("D");
                        transactionsToImport.push(mappedTransaction);
                    }
                }

            }
        }

        if (lastCompleteTransaction !== null) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        // Only reverse if first date is later than last date
        if (transactionsToImport.length > 1) {
            let firstDate = transactionsToImport[0][0]; // Date column
            let lastDate = transactionsToImport[transactionsToImport.length - 1][0]; // Date column

            if (firstDate > lastDate) {
                transactionsToImport = transactionsToImport.reverse();
            }
        }

        var header = [
            [
                "Date",
                "DateValue",
                "Doc",
                "ExternalReference",
                "Description",
                "Income",
                "Expenses",
                "IsDetail",
            ],
        ];
        return header.concat(transactionsToImport);

    }

    mapTransaction(transaction) {
        var mappedLine = [];

        //BookingDate may be empty
        let bookingDate = transaction["BookingDate"];
        if (!bookingDate)
            bookingDate = transaction["TradeDate"];
        mappedLine.push(Banana.Converter.toInternalDateFormat(bookingDate, "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["ValueDate"], "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push(transaction["TransactionNr"]); //transaction number.
        mappedLine.push(this.getDescription(transaction));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], "."));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["DebitAmount"], "."));

        return mappedLine;
    }

    mapDetailTransaction(transaction) {

        var mappedLine = [];
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["BookingDate"], "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["ValueDate"], "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push(transaction["TransactionNr"]);
        mappedLine.push(this.getDescription(transaction));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["IndividualAmount"].replace(",", ""), "."));
        mappedLine.push("");

        return mappedLine;
    }

    getDescription(line) {
        var description = line["Description1"];
        if (line["Description2"] && line["Description2"].length) description += ", " + line["Description2"];
        if (line["Description3"] && line["Description3"].length) description += ", " + line["Description3"];

        description = Banana.Converter.stringToCamelCase(description);
        description = description.replace(/"/g, '\\"');
        return '"' + description + '"';
    };

    getFormattedData(transactions, importUtilities) {

        let transactionsCopy = JSON.parse(JSON.stringify(transactions)); //To not modifiy the original array we make a deep copy of the array.

        var columns = importUtilities.getHeaderData(transactionsCopy, 0); //array
        var rows = importUtilities.getRowData(transactionsCopy, 1); //array of array
        let form = [];
        let convertedColumns = [];

        convertedColumns = this.convertHeaderEn(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderDe(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderIt(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderFr(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        return [];
    }
};

/**
 * UBS Format 1
 *
 * Valuation date;Banking relationship;Portfolio;Product;IBAN;Ccy.;Date from;Date to;Description;TradeDate;BookingDate;ValueDate;Description 1;Description 2;Description 3;TransactionNr;Exchange rate in the original amount in settlement currency;IndividualAmount;Debit;Credit;Balance
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;e-banking Order;BWS - CHENEVAL, BWS GERMANLINGUA,  DE DE DE 80331     MUECHEN,  INVOICE : M25252,  STD: ALICE CHENEVAL;;ZD81181TI0690091;;;3'416.82;;206'149.34
 * 07.07.17;0240 00254061;;0240 00254061.01C;CH62 0024 4240 2340 6101 C;CHF;01.02.17;30.06.17;UBS Business Current Account;30.06.17;30.06.17;30.06.17;Amount paid;;;ZD81181TI0690091;1.113334;3069;;;
 */
function UBSFormat1() {
    // Index of columns in csv file
    this.colCount = 21;

    this.colCurrency = 5;
    this.colDate = 10;
    this.colDateValuta = 11;
    this.colDescr1 = 12;
    this.colDescr2 = 13;
    this.colDescr3 = 14;
    this.colDescr4 = 15;
    this.colExchRate = -5;
    this.colDetails = -4;
    this.colDebit = -3;
    this.colCredit = -2;
    this.colBalance = -1;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length === 0) return false;

        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length >= this.colCount) formatMatched = true;
            else formatMatched = false;

            if (formatMatched &&
                transaction[this.colDate] &&
                transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else formatMatched = false;

            if (
                formatMatched &&
                transaction[this.colDateValuta] &&
                transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)
            )
                formatMatched = true;
            else formatMatched = false;

            if (formatMatched) return true;
        }

        return false;
    };

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        this.colCount =
            transactions.length > 1 ? transactions[0].length : this.colCount;

        transactions = this.convertTransactions(transactions);

        if (transactions.length > 1) {
            //Sort by date
            if (transactions[0][0] > transactions[transactions.length - 1][0]) {
                //Sort transactions
                transactions = transactions.reverse();
            }
        }

        var header = [
            [
                "Date",
                "DateValue",
                "Doc",
                "ExternalReference",
                "Description",
                "Income",
                "Expenses",
                "IsDetail",
            ],
        ];
        return header.concat(transactions);
    };

    /** Convert the transaction to the format to be imported */
    this.convertTransactions = function (transactions) {
        var transactionsToImport = [];

        /** Complete, filter and map rows */
        var lastCompleteTransaction = null;

        for (var i = 0; i < transactions.length; i++) {
            var mappedTransaction = [];
            var transaction = transactions[i];

            if (transaction.length <= this.colDate ||
                !transaction[this.colDate].match(/[0-9\.]+/g))
                continue;

            if (transaction.length >= this.colCount + this.colBalance &&
                (transaction[this.colCount + this.colDebit] && (transaction[this.colCount + this.colDebit].length > 0) ||
                    (transaction[this.colCount + this.colCredit] && transaction[this.colCount + this.colCredit].length > 0) ||
                    (transaction[this.colCount + this.colBalance] && transaction[this.colCount + this.colBalance].length > 0))) {
                // Is a complete row
                if (lastCompleteTransaction) {
                    mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                    mappedTransaction.push("");
                    transactionsToImport.push(mappedTransaction);
                    lastCompleteTransaction = null;
                }
                lastCompleteTransaction = transaction;
            } else if (transaction.length >= this.colCount + this.colDetails &&
                transaction[this.colCount + this.colDetails].length > 0) {
                // Is a detail row
                if (transaction[this.colCount + this.colExchRate].match(/[0-9]+\.[0-9]+/g)) {
                    // Is a multicurrency detail row
                    if (lastCompleteTransaction) {
                        mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                        mappedTransaction.push("");
                        transactionsToImport.push(mappedTransaction);
                        lastCompleteTransaction = null;
                    }
                } else {
                    // Is a normal detail row
                    if (transaction[this.colDescr1] === "Cashpayment charges deducted by post" &&
                        lastCompleteTransaction && lastCompleteTransaction[this.colDescr1] === "Incomings UBS BESR Quick") {
                        // Post charges are contabilised at the end of the period, skip this row
                        if (lastCompleteTransaction !== null) {
                            mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                            mappedTransaction.push("");
                            transactionsToImport.push(mappedTransaction);
                            lastCompleteTransaction = null;
                        }
                    } else {
                        if (lastCompleteTransaction !== null) {
                            mappedTransaction = this.mapTransaction(lastCompleteTransaction);
                            mappedTransaction.push("S");
                            transactionsToImport.push(mappedTransaction);
                            lastCompleteTransaction = null;
                        }
                        mappedTransaction = this.mapDetailTransaction(transaction);
                        mappedTransaction.push("D");
                        transactionsToImport.push(mappedTransaction);
                    }
                }
            }
        }

        if (lastCompleteTransaction !== null) {
            transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
        }

        return transactionsToImport;
    };

    this.mapTransaction = function (element) {
        var mappedLine = [];

        if (
            element[this.colDate] === null ||
            element[this.colDescr1] === null ||
            element[this.colDescr2] === null ||
            element[this.colDescr3] === null ||
            element[this.colDescr4] === null ||
            element[element.length + this.colCredit] === null ||
            element[element.length + this.colDebit] === null
        ) {
            mappedLine.push("");
            mappedLine.push("");
            mappedLine.push("Error importing data");
            mappedLine.push("");
            mappedLine.push("");
            return mappedLine;
        }

        mappedLine.push(
            Banana.Converter.toInternalDateFormat(element[this.colDate], "dd.mm.yyyy")
        );
        mappedLine.push(
            Banana.Converter.toInternalDateFormat(
                element[this.colDateValuta],
                "dd.mm.yyyy"
            )
        );
        mappedLine.push("");
        mappedLine.push(element[this.colDescr4]); //transaction number.
        mappedLine.push(this.mapDescription(element));
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[element.length + this.colCredit],
                "."
            )
        );
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[element.length + this.colDebit],
                "."
            )
        );

        return mappedLine;
    };

    this.mapDetailTransaction = function (element) {
        var mappedLine = [];

        if (
            element[this.colDate] === null ||
            element[this.colDescr1] === null ||
            element[this.colDescr2] === null ||
            element[this.colDescr3] === null ||
            element[this.colDescr4] === null ||
            element[element.length + this.colCredit] === null ||
            element[element.length + this.colDebit] === null
        ) {
            mappedLine.push("");
            mappedLine.push("");
            mappedLine.push("");
            mappedLine.push("Error importing data");
            mappedLine.push("");
            mappedLine.push("");
            return mappedLine;
        }

        mappedLine.push(
            Banana.Converter.toInternalDateFormat(element[this.colDate], "dd.mm.yyyy")
        );
        mappedLine.push(
            Banana.Converter.toInternalDateFormat(
                element[this.colDateValuta],
                "dd.mm.yyyy"
            )
        );
        mappedLine.push("");
        mappedLine.push(element[this.colDescr4]);
        mappedLine.push(this.mapDescription(element));
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[this.colCount + this.colDetails].replace(",", ""),
                "."
            )
        );
        mappedLine.push("");

        return mappedLine;
    };

    /**
     * Return the descrition for the requested line.
     */
    this.mapDescription = function (line) {
        var descr = line[this.colDescr1];
        if (line[this.colDescr2].length) descr += ", " + line[this.colDescr2];
        if (line[this.colDescr3].length) descr += ", " + line[this.colDescr3];

        descr = Banana.Converter.stringToCamelCase(descr);
        descr = descr.replace(/"/g, '\\"');
        return '"' + descr + '"';
    };
}

/**
 * UBS Format 2
 *
 * This new format (09.2022) use the import utilities class.
 * This format has no detail rows.
 *
 * Numero di conto:;0234 00103914.40;
 * IBAN:;CH29 0023 4234 1039 1440 G;
 * Dal:;2022-09-15;
 * Al:;2022-09-19;
 * Saldo iniziale:;1719.34;
 * Saldo finale:;631.07;
 * Valutazione in:;CHF;
 * Numero di transazioni in questo periodo:;13;
 *
 * Data dell'operazione;Ora dell'operazione;Data di registrazione;Data di valuta;Moneta;Importo della transazione;Addebito/Accredito;Saldo;N. di transazione;Descrizione1;Descrizione2;Descrizione3;Note a piè di pagina;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-150.00;Addebito;600;123456TI1234567;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-92.00;Addebito;692;2345678TI2345678;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-10.00;Addebito;702;3456789TI3456789;"Versamento";"Ordine di pagamento via e-banking";;;
 * 2022-09-19;;2022-09-19;2022-09-19;CHF;-40.00;Addebito;742;4567890TI4567890;"Versamento";"Ordine di pagamento via e-banking";;;
 *
 */
var UBSFormat2 = class UBSFormat2 extends ImportUtilities {
    // Index of columns in csv file

    constructor(banDocument) {
        super(banDocument);
        this.colCount = 12;

        this.colDateOperation = 0;
        this.colDateValuta = 3;
        this.colAmount = 5;
        this.colOpType = 6;
        this.colTransNr = 8;
        this.colDescr1 = 9;
        this.colDescr2 = 10;
        this.colDescr3 = 11;

        //Index of columns in import format.
        this.newColDate = 0;
        this.newColDescription = 2;
        this.newColExpenses = 4;
    }

    /** Return true if the transactions match this format */
    match(transactions) {
        if (transactions.length === 0) return false;

        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length >= this.colCount) formatMatched = true;
            else formatMatched = false;

            if (
                formatMatched &&
                transaction[this.colDateOperation] &&
                transaction[this.colDateOperation].match(/^[0-9]+\-[0-9]+\-[0-9]+$/)
            )
                formatMatched = true;
            else formatMatched = false;

            if (
                formatMatched &&
                transaction[this.colDateValuta] &&
                transaction[this.colDateValuta].match(/^[0-9]+\-[0-9]+\-[0-9]+$/)
            )
                if (
                    formatMatched &&
                    transaction[this.colOpType] &&
                    transaction[this.colOpType].match(/[a-zA-Z]/)
                )
                    formatMatched = true;
                else formatMatched = false;

            if (formatMatched) return true;
        }

        return false;
    }

    /** Convert the transaction to the format to be imported */
    convert(transactions, convertionParam) {
        var transactionsToImport = [];

        // Filter and map rows
        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            if (transaction.length < this.colCount + 1) continue;
            if (
                transaction[this.colDateOperation].match(/[0-9\.]+/g) &&
                transaction[this.colDateOperation].length === 10
            )
                transactionsToImport.push(this.mapTransaction(transaction));
        }

        /**
         * Sort rows by date
         * SPECIFY THE COLUMN TO USE FOR SORTING
         * If sortColums is empty the data are not sorted
         * */
        convertionParam.sortColums = [0, 2]; //0 = "Date" field position, 2 = "Description" field position.
        convertionParam.sortDescending = false;
        transactionsToImport = sort(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            [
                "Date",
                "DateValue",
                "Description",
                "ExternalReference",
                "Expenses",
                "Income",
            ],
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        let dateText = "";
        let dateValueText = "";

        dateText = element[this.colDateOperation].substring(0, 10);
        dateValueText = element[this.colDateValuta].substring(0, 10);

        if (dateText.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "dd.mm.yyyy"));
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateValueText, "dd.mm.yyyy"));
        }
        else {
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd"));
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd"));
        }

        // wrap descr to bypass TipoFileImporta::IndovinaSeparatore problem
        mappedLine.push(
            element[this.colDescr1] +
            " " +
            element[this.colDescr2] +
            " " +
            element[this.colDescr3]
        );
        mappedLine.push(element[this.colTransNr]);

        if (element[this.colAmount].indexOf("-") == -1) {
            mappedLine.push("");
            mappedLine.push(
                Banana.Converter.toInternalNumberFormat(
                    element[this.colAmount],
                    this.decimalSeparator
                )
            );
        } else {
            mappedLine.push(
                Banana.Converter.toInternalNumberFormat(
                    element[this.colAmount],
                    this.decimalSeparator
                )
            );
            mappedLine.push("");
        }
        return mappedLine;
    }

    //The purpose of this function is to let the user specify how to convert the categories
    postProcessIntermediaryData(transactions) {
        let processesData = [];

        if (transactions.length < 1) return processesData;

        processesData = transactions;
        /** INSERT HERE THE LIST OF ACCOUNTS NAME AND THE CONVERSION NUMBER
         *   If the content of "Account" is the same of the text
         *   it will be replaced by the account number given */
        //Accounts conversion
        var accounts = {
            //...
        };

        /** INSERT HERE THE LIST OF CATEGORIES NAME AND THE CONVERSION NUMBER
         *   If the content of "ContraAccount" is the same of the text
         *   it will be replaced by the account number given */

        //Categories conversion
        var categories = {
            //...
        };

        //Apply the conversions
        for (var i = 1; i < processesData.length; i++) {
            var convertedData = processesData[i];
            //Invert values
            if (convertedData[this.newColExpenses]) {
                convertedData[this.newColExpenses] = Banana.SDecimal.invert(
                    convertedData[this.newColExpenses]
                );
            }
        }

        return processesData;
    }
};

/**
 * UBS Format 3
 *
 * This new format (08.11.2022) use the import utilities class.
 * This format has no detail rows.
 *
 * Numero di conto:;0234 00103914.40;
 * IBAN:;CH29 0023 4234 1039 1440 G;
 * Dal:;2022-09-15;
 * Al:;2022-09-19;
 * Saldo iniziale:;1719.34;
 * Saldo finale:;631.07;
 * Valutazione in:;CHF;
 * Numero di transazioni in questo periodo:;13;
 *
 * Data dell'operazione;Ora dell'operazione;Data di registrazione;Data di valuta;Moneta;DebitAmount;CreditAmount;IndividualAmount;Saldo;N. di transazione;Descrizione1;Descrizione2;Descrizione3;Note a piè di pagina;
 * 2022-11-07;;2022-11-07;2022-11-07;TEM;-99.80;;;2215.89;1770311TO2672955;"Meniunis (Suractae) VI,Maxi Habyssidedertis 6, 3542 Aerna";"Cepate in consolest tam g-possica";"Decilausa vi. NUS: 35 47463 30382 81016 85544 75378, Experi in consolest: 2213 / Osit: 37.57.84 - 62.57.84 / Mendimus audio at: 75.64.4848, Sologit vi. CAPH: JA18 6457 3522 2051 7571 2, Suisi: B-Possica TEM Suractae, Offereganga vi. 6068584LN1841647";;
 * 2022-11-07;;2022-11-07;2022-11-07;TEM;-52.10;;;2315.69;1670311TO2672937;"Meniunis (Suractae) VI,Maxi Habyssidedertis 6, 3542 Aerna";"Cepate in consolest tam g-possica";"Decilausa vi. NUS: 35 47463 30382 27465 62135 38521, Experi in consolest: 2213 / Osit: 37.80.84 - 16.80.84 / Mendimus audio at: 81.57.4848, Sologit vi. CAPH: JA18 6457 3522 2051 7571 2, Suisi: B-Possica TEM Suractae, Offereganga vi. 7510665VI0356053";;
 * 2022-11-07;17:10:46;;2022-11-07;TEM;-4.35;;;2367.79;9999311BN1710030;"CERA SEPTEMPTO,SEPTEMPTO";"18264075-0 07/24, Pagamento carta di debito";"Offereganga vi. 7740420TJ8353344";;
 * 2022-11-07;07:55:57;;2022-11-07;TEM;-2.70;;;2372.14;9999311BN0755924;"CERA SEPTEMPTO,SEPTEMPTO";"18264075-0 07/24, Pagamento carta di debito";"Offereganga vi. 3275420YO4320201";;
 * 2022-11-07;17:21:52;;2022-11-07;TEM;-2.30;;;2374.84;9999311BN1721198;"POR SALL. SED. MANTUMN PARATE,PARATE";"18264075-0 07/24, Pagamento carta di debito";"Offereganga vi. 7518748DV2785407";;
 * 2022-11-06;15:31:05;2022-11-07;2022-11-06;TEM;-6.80;;;2377.14;9930811BN5353554;"Parescro Tratiantro VI,6010 Recto";"18264075-0 07/24, Pagamento carta di debito";"Offereganga vi. 8740610YF3026752";;
 *
 */
var UBSFormat3 = class UBSFormat3 extends ImportUtilities {
    // Index of columns in *.csv file
    constructor(banDocument) {
        super(banDocument);
        this.decimalSeparator = ".";
    }

    getFormattedData(transactions, importUtilities) {
        let transactionsCopy = JSON.parse(JSON.stringify(transactions)); //To not modifiy the original array we make a deep copy of the array.
        var columns = importUtilities.getHeaderData(transactionsCopy, 9); //array
        var rows = importUtilities.getRowData(transactionsCopy, 10); //array of array
        let form = [];
        let convertedColumns = [];

        convertedColumns = this.convertHeaderEn(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderDe(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderIt(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        convertedColumns = this.convertHeaderFr(columns);
        //Load the form with data taken from the array. Create objects
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        return [];
    }

    convertHeaderEn(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Trade date":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Trade time":
                    convertedColumns[i] = "TradeTime";
                    break;
                case "Booking date":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Value date":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Currency":
                    convertedColumns[i] = "Currency";
                    break;
                case "Debit amount":
                case "Debit":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Credit amount":
                case "Credit":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "Individual amount":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Balance":
                    convertedColumns[i] = "Balance";
                    break;
                case "Transaction no.":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Description1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Description2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Description3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Footnotes":
                    convertedColumns[i] = "Footnotes";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("TradeTime") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }
    convertHeaderDe(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Abschlussdatum":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Abschlusszeit":
                    convertedColumns[i] = "TradeTime";
                    break;
                case "Buchungsdatum":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Valutadatum":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Währung":
                    convertedColumns[i] = "Currency";
                    break;
                case "Debit amount":
                case "Belastung":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Credit amount":
                case "Gutschrift":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "IndividualAmount":
                case "Einzelbetrag":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Saldo":
                    convertedColumns[i] = "Balance";
                    break;
                case "Transaktions-Nr.":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Beschreibung1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Beschreibung2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Beschreibung3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Fussnoten":
                    convertedColumns[i] = "Footnotes";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("TradeTime") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }
    convertHeaderIt(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Data dell'operazione":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Ora dell'operazione":
                    convertedColumns[i] = "TradeTime";
                    break;
                case "Data di registrazione":
                case "Data di contabilizzazione":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Data di valuta":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Moneta":
                    convertedColumns[i] = "Currency";
                    break;
                case "Debit amount":
                case "Addebito":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Credit amount":
                case "Accredito":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "IndividualAmount":
                case "Importo singolo":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Saldo":
                    convertedColumns[i] = "Balance";
                    break;
                case "N. di transazione":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Descrizione1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Descrizione2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Descrizione3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Note a piè di pagina":
                    convertedColumns[i] = "Footnotes";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("TradeTime") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }
    convertHeaderFr(columns) {
        let convertedColumns = [];

        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Date de transaction":
                    convertedColumns[i] = "TradeDate";
                    break;
                case "Heure de transaction":
                    convertedColumns[i] = "TradeTime";
                    break;
                case "Date de comptabilisation":
                    convertedColumns[i] = "BookingDate";
                    break;
                case "Date de valeur":
                    convertedColumns[i] = "ValueDate";
                    break;
                case "Monnaie":
                    convertedColumns[i] = "Currency";
                    break;
                case "Debit amount":
                case "Débit":
                    convertedColumns[i] = "DebitAmount";
                    break;
                case "Credit amount":
                case "Crédit":
                    convertedColumns[i] = "CreditAmount";
                    break;
                case "IndividualAmount":
                case "Sous-montant":
                    convertedColumns[i] = "IndividualAmount";
                    break;
                case "Solde":
                    convertedColumns[i] = "Balance";
                    break;
                case "N° de transaction":
                case "No de transaction":
                    convertedColumns[i] = "TransactionNr";
                    break;
                case "Description1":
                    convertedColumns[i] = "Description1";
                    break;
                case "Description2":
                    convertedColumns[i] = "Description2";
                    break;
                case "Description3":
                    convertedColumns[i] = "Description3";
                    break;
                case "Notes de bas de page":
                    convertedColumns[i] = "Footnotes";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("TradeDate") < 0
            || convertedColumns.indexOf("TradeTime") < 0
            || convertedColumns.indexOf("BookingDate") < 0
            || convertedColumns.indexOf("ValueDate") < 0) {
            return [];
        }

        return convertedColumns;
    }

    /** Return true if the transactions match this format */
    match(transactionsData) {
        if (transactionsData.length === 0)
            return false;

        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["TradeDate"] && transaction["TradeDate"].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["ValueDate"] &&
                transaction["ValueDate"].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
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
    convert(transactionsData) {
        var transactionsToImport = [];

        var lastCompleteTransaction = null;
        var isPreviousCompleteTransaction = false;
        var lastCompleteTransactionPrinted = false;

        // Filter and map rows
        for (i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            if (transaction["Currency"] && transaction["TransactionNr"] && transaction["Description1"]) { //Valid transaction (complete & detail).
                if (!this.isDetailRow(transaction)) { // Normal row.
                    lastCompleteTransactionPrinted = false;
                    if (isPreviousCompleteTransaction) {
                        transactionsToImport.push(this.mapTransaction(lastCompleteTransaction));
                    }
                    lastCompleteTransaction = transaction;
                    isPreviousCompleteTransaction = true;
                } else { // Detail row.
                    if (transaction['IndividualAmount'] && transaction['IndividualAmount'].length > 0) {
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
            [
                "Date",
                "DateValue",
                "Description",
                "ExternalReference",
                "Expenses",
                "Income",
                "IsDetail",
            ],
        ];
        return header.concat(transactionsToImport);
    }

    fillDetailRow(detailRow, totalRow) {
        // Copy dates
        detailRow["TradeDate"] = totalRow["TradeDate"];
        detailRow["ValueDate"] = totalRow["ValueDate"];

        if (detailRow["IndividualAmount"] && detailRow["IndividualAmount"].length > 0) {
            if (totalRow["DebitAmount"].length > 0) {
                detailRow["DebitAmount"] = detailRow["IndividualAmount"];
            } else if (totalRow["CreditAmount"].length > 0) {
                detailRow["CreditAmount"] = detailRow["IndividualAmount"];
            }
        } else {
            detailRow["DebitAmount"] = totalRow["DebitAmount"];
            detailRow["CreditAmount"] = totalRow["CreditAmount"];
        }
    }

    isDetailRow(transaction) {
        if (transaction["TradeDate"].length === 0
            && transaction["TradeTime"].length === 0
            && transaction["BookingDate"].length === 0
            && transaction["ValueDate"].length === 0)
            return true;
        return false;
    }

    mapTransaction(transaction) {
        var mappedLine = [];

        let dateText = "";
        let dateValueText = "";

        dateText = transaction["TradeDate"].substring(0, 10);
        dateValueText = transaction["ValueDate"].substring(0, 10);

        if (dateText.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "dd.mm.yyyy"));
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateValueText, "dd.mm.yyyy"));
        }
        else {
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd"));
            mappedLine.push(Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd"));
        }
        // wrap descr to bypass TipoFileImporta::IndovinaSeparatore problem
        mappedLine.push(transaction["Description1"] + " " + transaction["Description3"]);
        mappedLine.push(transaction["TransactionNr"]);

        let debitAmt = transaction["DebitAmount"].replace(/-/g, ''); //remove minus sign
        mappedLine.push(Banana.Converter.toInternalNumberFormat(debitAmt, this.decimalSeparator));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["CreditAmount"], this.decimalSeparator));
        mappedLine.push(transaction["IsDetail"]);

        return mappedLine;
    }
};

/**
 * UBS Credit Card Format 1
 *
 * sep=;
 * Numéro de compte;Numéro de carte;Titulaire de compte/carte;Date d'achat;Texte comptable;Secteur;Montant;Monnaie originale;Cours;Monnaie;Débit;Crédit;Ecriture
 * ZZZZ ZZZZ ZZZZ;;SIMON JEAN;19.10.2017;Report de solde;;;;;CHF;;0.00;
 * ZZZZ ZZZZ ZZZZ;XXXX XXXX XXXX XXXX;JEAN SIMON;16.11.2017;Cafe de Paris Geneve CHE;Restaurants, Bar;119.40;CHF;;;;;
 * ZZZZ ZZZZ ZZZZ;XXXX XXXX XXXX XXXX;JEAN SIMON;13.11.2017;www.banana.ch            LUGANO       CHE;Magasin d ordinateurs;189.00;CHF;;CHF;189.00;;15.11.2017
 */
function UBSFormatCc1() {
    // Index of columns in csv file
    this.colCount = 13;

    this.colCardNo = 2;
    this.colDateDoc = 3;
    this.colDescr = 4;
    this.colCurrency = -4;
    this.colDebit = -3;
    this.colCredit = -2;
    this.colDate = -1;

    /** Return true if the transactions match this format */
    this.match = function (transactions) {
        if (transactions.length === 0) return false;

        for (i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;
            /* array should have all columns */
            if (transaction.length >= this.colCount) formatMatched = true;
            else formatMatched = false;

            if (
                formatMatched &&
                transaction[this.colCount + this.colDate] &&
                transaction[this.colCount + this.colDate].match(
                    /^[0-9]+\.[0-9]+\.[0-9]+$/
                )
            )
                formatMatched = true;
            else formatMatched = false;

            if (formatMatched) return true;
        }

        return false;
    };

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactions) {
        this.colCount =
            transactions.length > 1 ? transactions[0].length : this.colCount;

        transactions = this.convertTransactions(transactions);

        if (transactions.length > 1) {
            //Sort by date
            if (transactions[0][0] > transactions[transactions.length - 1][0]) {
                //Sort transactions
                transactions = transactions.reverse();
            }
        }

        var header = [
            ["Date", "DateDocument", "Doc", "Description", "Income", "Expenses"],
        ];
        return header.concat(transactions);
    };

    /** Convert the transaction to the format to be imported */
    this.convertTransactions = function (transactions) {
        var transactionsToImport = [];

        /** Complete, filter and map rows */
        var lastCompleteTransaction = null;

        for (
            var i = 0; i < transactions.length; i++ // First row contains the header
        ) {
            var transaction = transactions[i];
            if (
                transaction.length <= this.colCount + this.colDate ||
                !transaction[transaction.length + this.colDate].match(
                    /^[0-9]+\.[0-9]+\.[0-9]+$/
                )
            )
                continue;
            var mappedTransaction = this.mapTransaction(transaction);
            transactionsToImport.push(mappedTransaction);
        }

        return transactionsToImport;
    };

    this.mapTransaction = function (element) {
        var mappedLine = [];

        if (
            element[element.length + this.colDate] === null ||
            element[this.colDescr] === null ||
            element[element.length + this.colCredit] === null ||
            element[element.length + this.colDebit] === null
        ) {
            mappedLine.push("");
            mappedLine.push("");
            mappedLine.push("Error importing data");
            mappedLine.push("");
            mappedLine.push("");
            return mappedLine;
        }

        var descr;

        mappedLine.push(
            Banana.Converter.toInternalDateFormat(
                element[element.length + this.colDate],
                "dd.mm.yyyy"
            )
        );
        mappedLine.push("");
        mappedLine.push("");
        mappedLine.push(this.convertDescription(element[this.colDescr]));
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[element.length + this.colCredit],
                "."
            )
        );
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[element.length + this.colDebit],
                "."
            )
        );

        return mappedLine;
    };

    this.convertDescription = function (text) {
        var convertedDescr = text.replace(/  +/g, " ");
        convertedDescr = convertedDescr.replace(/"/g, '\\"');
        return '"' + convertedDescr + '"'; // Banana.Converter.stringToCamelCase(convertedDescr);
    };
}



function defineConversionParam(inData) {
    var csvData = Banana.Converter.csvToArray(inData);
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '"';
    // get separator
    convertionParam.separator = findSeparator(inData);

    return convertionParam;
}

/** Sort transactions by date and description */
function sort(transactions, convertionParam) {
    if (
        transactions.length <= 0 ||
        !convertionParam.sortColums ||
        convertionParam.sortColums.length <= 0
    )
        return transactions;

    transactions.sort(function (row1, row2) {
        for (var i = 0; i < convertionParam.sortColums.length; i++) {
            var columnIndex = convertionParam.sortColums[i];
            if (row1[columnIndex] > row2[columnIndex]) return 1;
            else if (row1[columnIndex] < row2[columnIndex]) return -1;
        }
        return 0;
    });

    if (convertionParam.sortDescending) transactions.reverse();

    return transactions;
}

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