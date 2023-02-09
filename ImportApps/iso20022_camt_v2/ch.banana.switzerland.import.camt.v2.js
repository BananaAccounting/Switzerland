// @id = ch.banana.switzerland.import.camt.v2
// @api = 1.0
// @pubdate = 2023-02-09
// @publisher = Banana.ch SA
// @description = Bank statement Camt ISO 20022 Switzerland (Banana+)
// @description.de = Bankauszug Camt ISO 20022 Schweiz (Banana+)
// @description.fr = Extrait de compte Camt ISO 20022 Suisse (Banana+)
// @description.it = Estratto bancario Camt ISO 20022 Svizzera (Banana+)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Bank statement Camt ISO 20022 (*.xml);;All files (*.*)
// @inputfilefilter.de = Bankauszug Camt ISO 20022 (*.xml);;All files (*.*)
// @inputfilefilter.fr = Extrait de compte Camt ISO 20022 (*.xml);;All files (*.*)
// @inputfilefilter.it = Estratto bancario Camt ISO 20022 (*.xml);;All files (*.*)
// @includejs = ch.banana.switzerland.import.camt.sps2021.v2.js
// @includejs = ch.banana.switzerland.import.camt.sps2022.v2.js
// @includejs = import.utilities.js

/**
 * Parse the iso20022 camt message and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

    if (!string)
        return "@Cancel";

    // The extensions runs only with advanced Version of Banana Accounting
    var importUtilities = new ImportUtilities(Banana.document);
    if (!isTest && !importUtilities.verifyBananaPLusVersion())
        return "@Cancel";

    var camtFile = new SPS2022CamtFile();
    camtFile.lang = getDocumentLanguage();
    camtFile.setDocument(string);

    // Debug info for testing
    if (Banana.application.isInternal) {
        var accountsSummary = camtFile.getAccountsSummary();
        for (var accountIban in accountsSummary) {
            if (accountsSummary.hasOwnProperty(accountIban)) {
                var accountSummary = accountsSummary[accountIban];
                Banana.console.log('IBAN:          ' + accountSummary.iban);
                Banana.console.log('Owner:         ' + accountSummary.owner);
                Banana.console.log('Currency:      ' + accountSummary.currency);
                Banana.console.log('Begin date:    ' + Banana.Converter.toLocaleDateFormat(accountSummary.beginDate.substr(0,10)));
                Banana.console.log('End date:      ' + Banana.Converter.toLocaleDateFormat(accountSummary.endDate.substr(0,10)));
                Banana.console.log('Begin balance: ' + (accountSummary.beginBalance ? Banana.Converter.toLocaleNumberFormat(accountSummary.beginBalance) : ''));
                Banana.console.log('End balance:   ' + (accountSummary.endBalance ? Banana.Converter.toLocaleNumberFormat(accountSummary.endBalance) : ''));
                var totalAmount = accountSummary.beginBalance && accountSummary.endBalance ? Banana.SDecimal.subtract(accountSummary.endBalance, accountSummary.beginBalance) : '';
                Banana.console.log('Total amount:  ' + (totalAmount ? Banana.Converter.toLocaleNumberFormat(totalAmount) : ''));
            }
        }
    }

    // Read transactions
    var transactions = camtFile.readTransactions();
    var headersProperties = ['Date', 'DateValue', 'DocInvoice', 'ExternalReference', 'Description', 'Income', 'Expenses', 'ContraAccount', 'Cc1', 'Cc2', 'Cc3', 'IsDetail'];
    var csv = Banana.Converter.objectArrayToCsv(headersProperties, transactions, '\t');

    return csv;
}

function getDocumentLanguage() {
    var lang = 'en';
    if (Banana.document.locale)
        lang = Banana.document.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function getApplicationLanguage() {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function settingsDialog() {
    var isoCamtReader = new SPS2022CamtFile();

    var lang = getApplicationLanguage();

    var params = isoCamtReader.defaultParameters();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        try {
            params = JSON.parse(savedParam);
            if (!params.customer_no)
                params.customer_no = {};
        } catch(err) {
            Banana.console.log(err.toString());
        }
    }

    var dialogTitle = Banana.script.getParamLocaleValue('description');
    if (!dialogTitle)
        dialogTitle = isoCamtReader.tr('settings', lang);

    if (!params.invoice_no)
        params.invoice_no = {};

    if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
        // New Property dialog

        var convertedParam = {};
        convertedParam.version = '1.0';
        /*array dei parametri dello script*/
        convertedParam.data = [];

        var currentParam = {};
        currentParam.name = 'add_counterpart_transaction';
        currentParam.title = isoCamtReader.tr('add_counterpart_transaction', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = true;
        currentParam.value = params.add_counterpart_transaction ? true : false;
        currentParam.readValue = function() {
            params.add_counterpart_transaction = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'invoice_no_extract';
        currentParam.title = isoCamtReader.tr('invoice_no_extract', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = true;
        currentParam.value = params.invoice_no.extract ? true : false;
        currentParam.readValue = function() {
            params.invoice_no.extract = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'invoice_no_banana_format';
        currentParam.parentObject = 'invoice_no_extract';
        currentParam.title = isoCamtReader.tr('invoice_no_banana_format', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = true;
        currentParam.value = params.invoice_no.banana_format ? true : false;
        currentParam.readValue = function() {
            params.invoice_no.banana_format = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'invoice_no_start';
        currentParam.parentObject = 'invoice_no_extract';
        currentParam.title = isoCamtReader.tr('invoice_no_start', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '0';
        currentParam.value = params.invoice_no.start ? params.invoice_no.start.toString() : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.invoice_no.start = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'invoice_no_length';
        currentParam.parentObject = 'invoice_no_extract';
        currentParam.title = isoCamtReader.tr('invoice_no_length', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '-1';
        currentParam.value = params.invoice_no.count ? params.invoice_no.count.toString() : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.invoice_no.count = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'invoice_no_method';
        currentParam.parentObject = 'invoice_no_extract';
        currentParam.title = isoCamtReader.tr('invoice_no_method', lang);
        currentParam.tooltip = isoCamtReader.tr('invoice_no_method_tooltip', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '';
        currentParam.value = params.invoice_no.method ? params.invoice_no.method : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.invoice_no.method = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_extract', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = false;
        currentParam.value = params.customer_no.extract ? true : false;
        currentParam.readValue = function() {
            params.customer_no.extract = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_banana_format';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_banana_format', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = true;
        currentParam.value = params.customer_no.banana_format ? true : false;
        currentParam.readValue = function() {
            params.customer_no.banana_format = this.value;
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_start';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_start', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '0';
        currentParam.value = params.customer_no.start ? params.customer_no.start.toString() : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.customer_no.start = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_length';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_length', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '-1';
        currentParam.value = params.customer_no.count ? params.customer_no.count.toString() : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.customer_no.count = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_use_cc';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_use_cc', lang);
        currentParam.tooltip = isoCamtReader.tr('customer_no_use_cc_tooltip', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '';
        currentParam.value = params.customer_no.use_cc ? params.customer_no.use_cc : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.customer_no.use_cc = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_method';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_method', lang);
        currentParam.tooltip = isoCamtReader.tr('customer_no_method_tooltip', lang);
        currentParam.type = 'string';
        currentParam.defaultvalue = '';
        currentParam.value = params.customer_no.method ? params.customer_no.method : currentParam.defaultvalue;
        currentParam.readValue = function() {
            params.customer_no.method = this.value.trim();
        }
        convertedParam.data.push(currentParam);

        currentParam = {};
        currentParam.name = 'customer_no_keep_initial_zeros';
        currentParam.parentObject = 'customer_no_extract';
        currentParam.title = isoCamtReader.tr('customer_no_keep_initial_zeros', lang);
        currentParam.type = 'bool';
        currentParam.defaultvalue = true;
        currentParam.value = params.customer_no.keep_initial_zeros ? true : false;
        currentParam.readValue = function() {
            params.customer_no.keep_initial_zeros = this.value;
        }
        convertedParam.data.push(currentParam);


        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam))
            return;

        var convertedParamLength = convertedParam.data.length;
        for (var i = 0; i < convertedParamLength; i++) {
            // Read values to params (through the readValue function)
            convertedParam.data[i].readValue();
        }

        Banana.document.setScriptSettings(JSON.stringify(params));

    } else {
        // Legacy dialog (before Banana.Ui.openPropertyEditor)

        var value = params.add_counterpart_transaction ? '1' : '0';
        value = Banana.Ui.getText(dialogTitle, isoCamtReader.tr('legacy_add_counterpart_transaction', lang), value);
        if (typeof(value) === 'undefined')
            return;
        params.add_counterpart_transaction = value === '1' ? true : false;

        value = params.invoice_no.extract ? '1' : '0';
        value = Banana.Ui.getText(dialogTitle, isoCamtReader.tr('legacy_invoice_no_extract', lang), value);
        if (typeof(value) === 'undefined')
            return;
        params.invoice_no.extract = value === '1' ? true : false;

        if (params.invoice_no.extract) {
            value = params.invoice_no.start ? params.invoice_no.start : '0';
            value = Banana.Ui.getInt(dialogTitle, isoCamtReader.tr('legacy_invoice_no_start', lang), value, 0, 256);
            if (typeof(value) === 'undefined')
                return;
            params.invoice_no.start = value ;

            value = params.invoice_no.count ? params.invoice_no.count : '-1';
            value = Banana.Ui.getInt(dialogTitle, isoCamtReader.tr('legacy_invoice_no_length', lang), value, -1, 256);
            if (typeof(value) === 'undefined')
                return;
            params.invoice_no.count = value;

            value = params.invoice_no.method ? params.invoice_no.method : '';
            value = Banana.Ui.getText(dialogTitle, isoCamtReader.tr('legacy_invoice_no_method', lang), value);
            if (typeof(value) === 'undefined')
                return;
            params.invoice_no.method = value.trim();
        }

        Banana.document.setScriptSettings(JSON.stringify(params));
    }
}

