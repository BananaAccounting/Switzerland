// @id = ch.banana.switzerland.import.ubs
// @api = 1.0
// @pubdate = 2019-09-06
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
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js
// @timeout = -1

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {
    if (!inData) return "";

    var importUtilities = new ImportUtilities(Banana.document);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    //Add the header if present
    if (convertionParam.header) {
        inData = convertionParam.header + inData;
    }
    let transactions = Banana.Converter.csvToArray(
        inData,
        convertionParam.separator,
        convertionParam.textDelim
    );

    // Format Credit Card
    var formatCc1Ubs = new UBSFormatCc1();
    if (formatCc1Ubs.match(transactions)) {
        transactions = formatCc1Ubs.convert(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    // Format 1
    var format1Ubs = new UBSFormat1();
    if (format1Ubs.match(transactions)) {
        transactions = format1Ubs.convert(transactions);
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
    if (format3Ubs.match(transactions)) {
        transactions = format3Ubs.convert(transactions, convertionParam);
        transactions = format3Ubs.postProcessIntermediaryData(transactions);
        return Banana.Converter.arrayToTsv(transactions);
    }

    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * UBS Format 1
 *
 * Valuation date;Banking relationship;Portfolio;Product;IBAN;Ccy.;Date from;Date to;Description;Trade date;Booking date;Value date;Description 1;Description 2;Description 3;Transaction no.;Exchange rate in the original amount in settlement currency;Individual amount;Debit;Credit;Balance
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

        mappedLine.push(
            Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd")
        );
        mappedLine.push(
            Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd")
        );
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
 * Data dell'operazione;Ora dell'operazione;Data di registrazione;Data di valuta;Moneta;Debit amount;Credit amount;Individual amount;Saldo;N. di transazione;Descrizione1;Descrizione2;Descrizione3;Note a piè di pagina;
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
        //original file columns
        this.colCount = 13;

        this.colDateOperation = 0;
        this.colDateValuta = 3;
        this.colDebitAmt = 5;
        this.colCreditAmt = 6;
        this.colTransNr = 9;
        this.colDescr1 = 10;
        this.colDescr2 = 11;
        this.colDescr3 = 12;

        this.decimalSeparator = ".";

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
                formatMatched = true;
            else formatMatched = false;

            if (
                (formatMatched && transaction[this.colDebitAmt]) ||
                transaction[this.colCreditAmt]
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
        convertionParam.sortColums = [this.newColDate, this.newColDescription]; //0 = "Date" field position, 2 = "Description" field position.
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

        mappedLine.push(
            Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd")
        );
        mappedLine.push(
            Banana.Converter.toInternalDateFormat(dateValueText, "yyyy-mm-dd")
        );
        // wrap descr to bypass TipoFileImporta::IndovinaSeparatore problem
        mappedLine.push(element[this.colDescr1] + " " + element[this.colDescr2]);
        mappedLine.push(element[this.colTransNr]);

        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[this.colDebitAmt],
                this.decimalSeparator
            )
        );
        mappedLine.push(
            Banana.Converter.toInternalNumberFormat(
                element[this.colCreditAmt],
                this.decimalSeparator
            )
        );

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
    var header = String(csvData[0]);
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