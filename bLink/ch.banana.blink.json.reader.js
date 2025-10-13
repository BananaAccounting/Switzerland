// @id = ch.banana.blink.json.reader
// @api = 1.0
// @pubdate = 2025-10-10
// @publisher = Banana.ch SA
// @description = bLink Json reader
// @description.en = bLink Json reader
// @doctype = *
// @docproperties =
// @task = app.command
// @inputencoding = utf-8
// @timeout = -1
// @visibility = never


/**
 * Questa estensione legge i json con le transazioni bancarie forniti da bLink e 
 * processa i dati convertendoli in un formato riconosciuto da Banana.
 * L'estensione riceve un Json e ritorna un file tsv (tabulator separated values) attraverso l'API: Banana.Converter.arrayToTsv();
 */
function exec(jsonData) {

    if (!jsonData) {
        return "";
    }
    var jsonObject = JSON.parse(jsonData);

}

var bLinkJsonReader = class bLinkJsonReader {
    constructor(jsonObject) {
        this.jsonObject = jsonObject;
    }

    /** Process blink json and returns transactions as an array of arrays. 
     * Works with bLink API V5.
     * See the following page for more details: https://docs.blink.six-group.com/api-reference/category/ais-from-six/v5
     * or the readme.md file in this extension folder.
     * entryReferenceInternalId--> Permete di identificare il gruppo di pagamenti a cui appartiene la transazione in caso di pagamenti multipli con QR-IBAN
     * transactions->accountServicerReference-> Da usa come identificativo univoco della transazione, è un campo obbligatorio richiesto da Blink.
     * il campo è attribuito dalla banca ed è l'euivalente del campo AcctSvcrRef dell'ISO20022 che attualmente usiamo per il campo "External reference".
     * Ad un livello piu alto ce un altro campo "accountServicerReference" che identifica l'entry (gruppo di transazioni) a cui appartiene la transazione,
     * che può essere utile per registrare il movimento contenente l'importo totale di una transazione.
    */
    getTransactions_From_V5() {
        let transactions = [];

        return transactions;
    }
}