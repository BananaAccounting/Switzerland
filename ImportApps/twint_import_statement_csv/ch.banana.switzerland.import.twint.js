// @id = ch.banana.switzerland.import.twint
// @api = 1.0
// @pubdate = 2024-05-06
// @publisher = Banana.ch SA
// @description = Twint - Import movements .csv (Banana+ Advanced)
// @description.de = Twint - Bewegungen importieren .csv (Banana+ Advanced)
// @description.en = Twint - Import movements .csv (Banana+ Advanced)
// @description.fr = Twint - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Twint - Importa movimenti .csv (Banana+ Advanced)
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
function exec(inData, isTest) {


    var importUtilities = new ImportUtilities(Banana.document);

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    let fieldSeparator = findSeparator(inData);
    var transactions = Banana.Converter.csvToArray(inData, fieldSeparator);

    // Format 1, vedi codice creato per postfinance
    let tFormat1 = new TwintFormat1();
    let transactionsData = tFormat1.getFormattedData(transactions, importUtilities);
    if (tFormat1.match(transactionsData)) {
        let convTransactions = tFormat1.convert(transactionsData);
        return Banana.Converter.arrayToTsv(convTransactions);
    }

    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * Example Twint format 1.
 * Csv files are available only for those who use the Business portal.
 * "Mongrant in:";"2023.11.20";;;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Vitte tae:";"2023.11.01 (00:00)";"Motusa tae:";"";"sit:";"";;;;;;;;;;;;;;
 * "Vitte sit:";"2023.11.26 (23:59)";"Intingunarall:";;;;;;;;;;;;;;;;;
 * "Nam(vi):";"";"Conunium:";;;;;;;;;;;;;;;;;
 * "Funtro:";"";;;;;;;;;;;;;;;;;;
 * "Quaer DIAM:";;"Novenunteratintiuvit:";;;;;;;;;;;;;;;;;
 * ;;"Lätelicinguntangerunducurat:";;;;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Inete Aluviantumnes (CHF):";"Inete Calonenisqua (CHF):";"Inete Motusa Inoventices (CHF):";"Inete Sensec (CHF):";"Inete Paradixilectatessa (CHF):";;;;;;;;;;;;;;;
 * "0.00";"0.00";"345.45";"0.00";"4.55";;;;;;;;;;;;;;;
 * ;;;;;;;;;;;;;;;;;;;
 * "Datum";"Zeit";"Typ";"Status";"Betrag Transaktion (CHF)";"Rabatt (CHF)";"Transaktionskosten (CHF)";"Niederlassung";"TWINT Terminal ID";"TWINT Order ID";"Referenz Transaktion Händler";"Händlertransaktionsreferenz";"Bezeichnung in der Abrechnung";"Vorname";"Nachname";"Strasse & Nr.";"PLZ";"Ort";"E-Mail-Adresse";"Zahlungszweck"
 * "2023.11.01";"11:45";"Syllide";"Timpentitti";"49.35";;"0.65";"GROPE";"g132ldy0-8623-7c7a-2p68-p68j5i7pyq22";"2r0vrh8j-6o52-6063-w56s-6t8j6y7rr51e";"l068";"2r0vrh8j-6o52-6063-w56s-6t8j6y7rr51e";"GROPE";"Centis";"Claminnes";"Monenetumenerrius 143";"3063";"Rietube";"vumiflfypss32@winte.rem";
 * 
*/
function TwintFormat1() {

    this.getFormattedData = function (transactions, importUtilities) {
        let headerLineStart = 12;
        let dataLineStart = 13;
        // We do a copy as the getHeaderData modifies the content and we need to keep the original version clean.
        var transactionsCopy = transactions.map(function (arr) {
            return arr.slice();
        });
        if (transactionsCopy.length < dataLineStart)
            return [];
        let columns = importUtilities.getHeaderData(transactionsCopy, headerLineStart); //array
        let rows = importUtilities.getRowData(transactionsCopy, dataLineStart); //array of array
        let form = [];

        /** We convert the original headers into a custom format to be able to work with the same
         * format regardless of original's headers language or the position of the header column.
         * We need to translate all the .csv fields as the loadForm() method expects the header and
         * the rows to have the same length.
         * */
        let convertedColumns = [];

        // Convert headers from german. 
        convertedColumns = this.convertHeaderDe(columns, convertedColumns);
        if (convertedColumns.length > 0) {
            importUtilities.loadForm(form, convertedColumns, rows);
            return form;
        }

        return [];
    }

    this.convertHeaderDe = function (columns) { // riprendere da qui il 06.05.
        let convertedColumns = [];
        for (var i = 0; i < columns.length; i++) {
            switch (columns[i]) {
                case "Datum":
                    convertedColumns[i] = "Date";
                    break;
                case "Zeit":
                    convertedColumns[i] = "Time";
                    break;
                case "Typ":
                    convertedColumns[i] = "Description";
                    break;
                case "Status":
                    convertedColumns[i] = "Status";
                    break;
                case "Betrag Transaktion (CHF)":
                case "Betrag Transaktion (EUR)":
                case "Betrag Transaktion (USD)":
                    convertedColumns[i] = "Amount";
                    break;
                case "Rabatt":
                    convertedColumns[i] = "Discount";
                    break;
                case "Transaktionskosten (CHF)":
                    convertedColumns[i] = "Transaction Fee";
                    break;
                case "Niederlassung":
                    convertedColumns[i] = "Branch";
                    break;
                case "TWINT Terminal ID":
                    convertedColumns[i] = "Terminal Id";
                    break;
                case "TWINT Order ID":
                    convertedColumns[i] = "Transaction id";
                    break;
                case "Referenz Transaktion Händler":
                    convertedColumns[i] = "Transaction Reference";
                    break;
                case "Händlertransaktionsreferenz":
                    convertedColumns[i] = "Retailer Transaction Reference";
                    break;
                case "Bezeichnung in der Abrechnung":
                    convertedColumns[i] = "Designation in the invoice";
                    break;
                case "Vorname":
                    convertedColumns[i] = "First Name";
                    break;
                case "Nachname":
                    convertedColumns[i] = "Surname";
                    break;
                case "Strasse & Nr.":
                    convertedColumns[i] = "Street";
                    break;
                case "PLZ":
                    convertedColumns[i] = "Code";
                    break;
                case "Ort":
                    convertedColumns[i] = "Place";
                    break;
                case "E-Mail-Adresse":
                    convertedColumns[i] = "Email";
                    break;
                case "Zahlungszweck":
                    convertedColumns[i] = "Payment Purpose";
                    break;
                default:
                    break;
            }
        }

        if (convertedColumns.indexOf("Date") < 0
            || convertedColumns.indexOf("Description") < 0
            || convertedColumns.indexOf("Amount") < 0) {
            return [];
        }
        return convertedColumns;
    }

    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["Date"] && transaction["Date"].length >= 10 &&
                transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (transaction["Time"] && transaction["Time"].length >= 4)
                formatMatched = true;
            else
                formatMatched = false;

            if (transaction["Transaction id"] && transaction["Transaction id"].length >= 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    this.convert = function (transactionsData) {
        var transactionsToImport = [];

        for (var i = 0; i < transactionsData.length; i++) {
            if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
                transactionsData[i]["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
                transactionsToImport.push(this.mapTransaction(transactionsData[i]));
        }

        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "Doc", "ExternalReference", "Description", "Income", "Expenses", "Notes"]];
        return header.concat(transactionsToImport);
    }

    /** Return true if the transaction is a transaction row */
    this.mapTransaction = function (element) {
        var mappedLine = [];
        mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "yyyy.mm.dd"));
        mappedLine.push("");
        mappedLine.push(element["Transaction id"]);
        let description = this.getDescription(element);
        mappedLine.push(Banana.Converter.stringToCamelCase(description));
        let amount = element['Amount'];
        let trFee = element['Transaction Fee'];
        let netIncome = Banana.SDecimal.subtract(amount, trFee);
        if (amount.indexOf('-') > -1) {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(netIncome, this.decimalSeparator));
        } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(netIncome, this.decimalSeparator));
            mappedLine.push("");
        }
        mappedLine.push(trFee);
        return mappedLine;
    }

    this.getDescription = function (element) {
        let description = "";
        let type = element['Description'];
        let status = element['Status'];
        let branch = element['Branch'];

        description = type + ", " + status + ", " + branch;

        return description;
    }
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
