// @id = ch.banana.blink.json.parser
// @api = 1.0
// @pubdate = 2026-04-02
// @publisher = Banana.ch SA
// @description = bLink parser
// @description.en = bLink parser
// @description.de = bLink parser
// @description.fr = bLink parser
// @description.it = bLink parser
// @task = app.command
// @timeout = -1
// @visibility = never
// @includejs = ch.banana.blink.errormessages.js

//Error messages id's for the user
const ID_BANCARTELLA_NOT_VALID = "ID_BANCARTELLA_NOT_VALID";
const ID_IBAN_NOT_FOUND = "ID_IBAN_NOT_FOUND";
const INVALID_ACCOUNTING_TYPE = "INVALID_ACCOUNTING_TYPE";
const NO_ENTRIES_FOUND = "NO_ENTRIES_FOUND";

/**
 * This extension parse the JSON files containing bank transactions provided by bLink and
 * processes the data by converting it into a custom object to be provided to Banana.
 * This parser is compatible with Blink AIS v5.1 and v6 for the transaction response fields currently used by the extension
 * See the following pages for more details: 
 *  - V5: https://docs.blink.six-group.com/api-reference/ais/v5/six/request-account-transactions
 *  - V6: https://docs.blink.six-group.com/api-reference/ais/v6/six/list-account-transactions
 *  or the readme.md file in this extension folder.
 */
function exec(transactionsData) {

    let banDoc = Banana.document;
    if (!banDoc) {
        Banana.application.addMessage(getErrorMessage(null, ID_BANCARTELLA_NOT_VALID));
        return [];
    }

    if (!transactionsData) {
        return [];
    }
    let jsonObj;
    try {
        jsonObj = JSON.parse(transactionsData);
    } catch (e) {
        getErrorLogMessage("JSON parse error: " + e);
        return [];
    }

    // Read Json
    let bLinkJsonParser = new BLinkJsonParser();
    if (bLinkJsonParser.initClassVariables(jsonObj, banDoc)) {
        return bLinkJsonParser.getTransactionsToImport();
    }

    return [];
}

var BLinkJsonParser = class BLinkJsonParser {
    constructor() {
        this.banDoc;
        this.tabMov;
        this.tabAccount;
        this.accountingType;
        this.accountIbanMap;
        this.existingTransactions;
        this.jsonData;
        this.bankIban;
        this.entryType;
    }

    initClassVariables(jsonObj, banDoc) {
        this.banDoc = banDoc;

        this.jsonData = jsonObj;
        if (!this.jsonData) {
            getErrorLogMessage("Data object not valid");
            return false;
        }

        this.tabAccount = this.banDoc.table("Accounts");
        if (!this.tabAccount) {
            getErrorLogMessage("Account table not found");
            return false;
        }

        this.accountingType = this.banDoc.info("Base", "FileTypeGroup");
        if (this.accountingType != "100" && this.accountingType != "110" &&
            this.accountingType != "130") {
            this.banDoc.addMessage(getErrorMessage(this.banDoc, INVALID_ACCOUNTING_TYPE, this.banDoc.info("Base", "FileType")));
            return false;
        }

        this.accountIbanMap = this.getExistingAccountingRowsWithIban();
        this.bankIban = this.jsonData.iban;

        if (!this.bankIban)
            return false;

        if (!this.ibanExists()) {
            this.banDoc.addMessage(getErrorMessage(null, ID_IBAN_NOT_FOUND, this.bankIban));
            return false;
        }

        this.entryType = Object.freeze({
            ONLY_MAIN: "ONLY_MAIN",
            MAIN_WITH_DETAIL: "MAIN_WITH_DETAIL",
            MAIN_WITH_DETAILS_TRANSACTIONS: "MAIN_WITH_DETAILS_TRANSACTIONS"
        });

        return true;
    }

    /**
     * Returns an array of objects containing the existing
     * associations between accounts and Iban in the Accounts table.
     */
    getExistingAccountingRowsWithIban() {

        const accountsMap = new Map(); // Key = Account Value = Iban

        for (var i = 0; i < this.tabAccount.rowCount; i++) {
            var accObj = {};
            var tRow = this.tabAccount.row(i);
            accObj.BankIban = tRow.value("BankIban");
            accObj.Account = tRow.value("Account");
            if (accObj.BankIban && accObj.Account)
                accountsMap.set(accObj.Account, accObj.BankIban);
        }
        return accountsMap;
    }

    /** Process blink json and returns transactions as a custom object to be inserted into BankFeed table.
     * We import all transactions into BankFeed transactions table.
    */
    getTransactionsToImport() {

        let entriesList = this.jsonData.entries;

        if (!entriesList || entriesList.length < 0) {
            this.banDoc.addMessage(getErrorMessage(this.banDoc, NO_ENTRIES_FOUND));
            return [];
        }

        let convJsonData = {};
        this.setMetaData(convJsonData);
        convJsonData.transactions = this.mapEntriesToJson(entriesList);
        return convJsonData;
    }

    setMetaData(convJsonData) {
        convJsonData.meta = {
            version: "1.0",
            createdAt: "2026-01-27"
        }
    }

    /**Returns true if the IBAN has been found in the Accountstable.
     * IBAN is provided without any space, for example: CH0200700110000387896.
    */
    ibanExists() {
        for (const iban of this.accountIbanMap.values()) {
            if (this.normalizeIban(iban) === this.normalizeIban(this.bankIban)) {
                return true;
            }
        }
        return false;
    }

    normalizeIban(iban) {
        return (iban || "").replace(/\s+/g, "").toUpperCase();
    }

    mapEntriesToJson(entriesList) {

        /**
         * Blink provides 3 types of entries:
         * - Type 1: There is only the main entry and no detail transactions.
         * - Type 2:  There is the main entry and a single detail transaction that adds
         *    additional information to the original one (counterparty name,
         *    payment reference, etc.). The amount is the same as the parent entry.
         * - Type 3: There is the main entry and multiple detail transactions (the total
         *    amount of the detail transactions equals the amount of the parent entry).
         *
         * For simplicity, the JSON is pre-processed in order to identify and validate
         * these 3 scenarios, making the check for existing accounting entries cleaner.
         */


        this.prepareEntriesListData(entriesList);

        let transactionsToImport = [];

        for (const entry of entriesList) {
            if (!entry || typeof (entry) != "object")
                return transactionsToImport;

            /* First map the main entry*/
            if (entry.BANTRTYPE == this.entryType.ONLY_MAIN) {
                let mainConvTr = this.mapEntry_getTransactionFromEntryData(entry, false);
                transactionsToImport.push(mainConvTr);
            } else if (entry.BANTRTYPE == this.entryType.MAIN_WITH_DETAIL) {
                let mainConvTr = this.mapEntry_getTransactionFromEntryData(entry, false);
                let detTrObj = entry.transactions[0];
                this.mapEntry_setAdditionalInformation(mainConvTr, detTrObj);
                transactionsToImport.push(mainConvTr);
            } else if (entry.BANTRTYPE == this.entryType.MAIN_WITH_DETAILS_TRANSACTIONS) {
                let mainConvTr = this.mapEntry_getTransactionFromEntryData(entry, true);
                transactionsToImport.push(mainConvTr);
                for (const detTrObj of entry.transactions) {
                    transactionsToImport.push(this.mapEntry_detailTransaction(mainConvTr, detTrObj));
                }
            }
        }

        return transactionsToImport;
    }

    /**
     * Pre-processes the list of entries provided by Blink in order to classify each entry
     * based on the relationship between the main entry and its associated transaction items.
     *
     * Blink may return, for each entry, zero or more transaction items ("transactions"),
     * but the API does NOT explicitly guarantee how to distinguish between:
     *   - a purely descriptive detail (enriching the parent entry), and
     *   - real sub-transactions (split of the original amount).
     *
     * For this reason, the classification is not based solely on the number of transactions,
     * but also on a set of heuristics:
     *
     *   1) ONLY_MAIN
     *      - No transaction items are present.
     *
     *   2) MAIN_WITH_DETAIL
     *      - A single transaction item is present AND it is considered descriptive.
     *      - This is assumed when:
     *          - the transaction amount equals the parent entry amount, OR
     *      - In this case, the transaction is used only to enrich the main entry
     *        (e.g. counterparty name, remittance info).
     *
     *   3) MAIN_WITH_DETAILS_TRANSACTIONS
     *      - Multiple transaction items are present, OR
     *      - A single transaction item is present but it does not match the parent
     *        (different amount and different reference).
     *      - In this case, transaction items are treated as real sub-transactions
     *        (e.g. split entries), and each of them is mapped as a separate transaction.
     *
     * Note:
     * This logic is based on observed Blink data behavior and not on strict API guarantees.
     * It is designed to provide a robust and consistent interpretation for import purposes.
     */
    prepareEntriesListData(entriesList = []) {
        for (const entry of entriesList) {
            if (!entry || typeof entry !== "object") continue;

            const transactions = entry.transactions || [];
            const trCount = transactions.length;

            if (trCount === 0) {
                entry.BANTRTYPE = this.entryType.ONLY_MAIN;
                continue;
            }

            if (trCount === 1) {
                const det = transactions[0];

                const entryAmount = entry.amount?.amount;
                const detAmount = det.amount?.amount;

                const sameAmount = entryAmount === detAmount;

                if (sameAmount) {
                    entry.BANTRTYPE = this.entryType.MAIN_WITH_DETAIL;
                } else {
                    entry.BANTRTYPE = this.entryType.MAIN_WITH_DETAILS_TRANSACTIONS;
                }

                continue;
            }

            // più di uno → sicuramente split
            entry.BANTRTYPE = this.entryType.MAIN_WITH_DETAILS_TRANSACTIONS;
        }
    }

    /**This method return a detail transaction */
    mapEntry_detailTransaction(mainConvTr, detTr) {

        return {
            'bankIban': this.bankIban,
            'transactionParentId': mainConvTr["transactionId"] || "",
            'transactionDate': mainConvTr["transactionDate"] || "",
            'transactionDateValue': mainConvTr["transactionDateValue"],
            'transactionDescription': this.getDetailTransactionDescription(detTr.counterparty?.name,
                detTr.remittanceInformation, detTr.remittanceReference) || "",
            'transactionType': detTr.transactionType || "",
            'transactionAmount': detTr.amount?.amount || "",
            'transactionCurrency': detTr.amount?.currency || "",
            'transactionId': detTr.accountServicerReference || "",
            'transactionIsDetail': "D",
            'transactionDetails': this.getTransactionDetailsObj(detTr),
        };
    }
    /**
     * This method receives the "entryTr" object, which already contains the transaction information
     * retrieved from the main entry, and adds some details taken from the "transactions" array of the entry.
     * This method is called only when the array contains a single object (detTrObj), which includes
     * some detailed information about the entry.
     * We also perform some data checks.
     */
    mapEntry_setAdditionalInformation(mainConvTr, detTrObj) {

        if (!detTrObj || !mainConvTr)
            return;

        /* Check id */
        if ((mainConvTr["transactionId"] || "") !== (detTrObj.accountServicerReference || "")) {
            Banana.console.debug("entry ID and Transaction ID do not match.\n" +
                "Entry id: " + (mainConvTr["transactionId"] || "") + "\n" +
                "Transaction id: " + (detTrObj.accountServicerReference || ""));
        }

        /* Check amounts*/
        let trAmount = detTrObj.amount?.amount || "";
        let entryAmt = mainConvTr["transactionAmount"];
        if (trAmount !== entryAmt) {
            Banana.console.debug("Entry Amount and Transaction Amount do not match.\n" +
                "Entry amount: " + entryAmt + "\n" + "Transaction amount: " + trAmount);
        }

        /* Add detailed description.*/
        let trCounterPartyName = detTrObj.counterparty?.name || "";
        let trRemittanceInformation = detTrObj.remittanceInformation || "";
        let trRemittanceReference = detTrObj.remittanceReference || ""; // obj, structured reference.
        let detailedDescr = this.getDetailTransactionDescription(trCounterPartyName,
            trRemittanceInformation, trRemittanceReference) || "";
        if (detailedDescr) {
            if (mainConvTr["transactionDescription"]) {
                mainConvTr["transactionDescription"] += ", " + detailedDescr;
            } else {
                mainConvTr["transactionDescription"] = detailedDescr;
            }
        }
    }
    mapEntry_getTransactionFromEntryData(entryObj, withDetails) {

        return {
            'bankIban': this.bankIban,
            'transactionParentId': "", // Only used in details transactions.
            'transactionDate': entryObj.bookingDate || "",
            'transactionDateValue': entryObj.valueDate || "",
            'transactionDescription': entryObj.additionalEntryInformation || "",
            'transactionType': entryObj.transactionType || "",
            'transactionAmount': entryObj.amount?.amount || "",
            'transactionCurrency': entryObj.amount?.currency || "",
            'transactionId': entryObj.accountServicerReference || "",
            'transactionIsDetail': withDetails ? "S" : "",
            'transactionDetails': this.getEntryDetailsObj(entryObj),
        };
    }

    /**
     * Returns an object containing the entry details.
     * Details are considered secondary information related to the entry.
     * They are not essential for correctly booking the entry, but provide
     * additional data that we want to store. Doing so, we are able to
     * store all the data contained in a entry object.
     */
    getEntryDetailsObj(entryObj) {
        return {
            'transactionStatus': entryObj.entryStatus || "",
            'transactionBankCodes': entryObj.bankTransactionCode || "",
            'transactionEntryReference': entryObj.entryReference || "",
        }
    }

    /**
     * Returns an object containing the transaction details.
     * Details are considered secondary information related to the entry.
     * They are not essential for correctly booking the entry, but provide
     * additional data that we want to store. Doing so, we are able to
     * store all the data contained in a entry object.
     */
    getTransactionDetailsObj(trObj) {
        return {
            'transactionBankCodes': trObj.bankTransactionCode || "",
            'transactionCounterPartyAccount': trObj.counterparty?.account || "",
            'transactionCounterPartyAgent': trObj.counterparty?.agent || "",
            'transactionCounterPartyName': trObj.counterparty?.name || "",
            'transactionCounterPartyPostalAddress': trObj.counterparty?.postalAddress || "",
            'transactionEndToEndId': trObj.endToEndId || "",
            'transactionRemittanceInformation': trObj.remittanceInformation || "",
            'transactionRemittanceReference': trObj.remittanceReference || "",
        }
    }

    /**
     * Builds the description using the data present in the transactions array.
     * Same description can be used for detail transactions and to complete the main entry
     * description with details.
     * @param {*} counterPartyName 
     * @param {*} remittanceInfo 
     * @param {*} remittanceRef 
     */
    getDetailTransactionDescription(counterPartyName, remittanceInfo, remittanceRef) {
        return [counterPartyName, remittanceInfo, remittanceRef?.reference]
            .filter(value => typeof value === "string" && value.trim() !== "")
            .join(", ");
    }
}