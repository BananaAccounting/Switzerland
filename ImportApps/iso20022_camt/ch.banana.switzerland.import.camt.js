// @id = ch.banana.switzerland.import.camt
// @api = 1.0
// @pubdate = 2018-04-26
// @publisher = Banana.ch SA
// @description = Bank statement Camt ISO 20022 (Switzerland)
// @description.de = Bankauszug Camt ISO 20022 (Schweiz)
// @description.fr = Extrait de compte Camt ISO 20022 (Suisse)
// @description.it = Estratto bancario Camt ISO 20022 (Svizzera)
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

/**
 * Parse the iso20022 camt message and return the data to be imported as a tab separated file.
 */
function exec(string) {

   var camtFile = new ISO20022CamtFile();
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
   var headersProperties = ['Date', 'DateValue', 'DocInvoice', 'ExternalReference', 'Description', 'Income', 'Expenses', 'IsDetail'];
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
   var isoCamtReader = new ISO20022CamtFile();

   var lang = getApplicationLanguage();

   var params = isoCamtReader.defaultParameters();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      try {
         params = JSON.parse(savedParam);
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
      currentParam.value = params.add_counterpart_transaction ? true : false;
      currentParam.readValue = function() {
         params.add_counterpart_transaction = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'invoice_no_extract';
      currentParam.title = isoCamtReader.tr('invoice_no_extract', lang);
      currentParam.type = 'bool';
      currentParam.value = params.invoice_no.extract ? true : false;
      currentParam.readValue = function() {
         params.invoice_no.extract = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'invoice_no_start';
      currentParam.parentObject = 'invoice_no_extract';
      currentParam.title = isoCamtReader.tr('invoice_no_start', lang);
      currentParam.type = 'string';
      currentParam.value = params.invoice_no.start ? params.invoice_no.start.toString() : '0';
      currentParam.readValue = function() {
         params.invoice_no.start = this.value.trim();
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'invoice_no_length';
      currentParam.parentObject = 'invoice_no_extract';
      currentParam.title = isoCamtReader.tr('invoice_no_length', lang);
      currentParam.type = 'string';
      currentParam.value = params.invoice_no.count ? params.invoice_no.count.toString() : '-1';
      currentParam.readValue = function() {
         params.invoice_no.count = this.value.trim();
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'invoice_no_method';
      currentParam.parentObject = 'invoice_no_extract';
      currentParam.title = isoCamtReader.tr('invoice_no_method', lang);
      currentParam.type = 'string';
      currentParam.value = params.invoice_no.method ? params.invoice_no.method : '';
      currentParam.readValue = function() {
         params.invoice_no.method = this.value.trim();
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
         value = params.invoice_no.start ? params.invoice_no.start : 0;
         value = Banana.Ui.getInt(dialogTitle, isoCamtReader.tr('legacy_invoice_no_start', lang), value, 0, 256);
         if (typeof(value) === 'undefined')
            return;
         params.invoice_no.start = value ;

         value = params.invoice_no.count ? params.invoice_no.count : -1;
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

/**
 * Define the reader for Iso 20022 camt messages
 */

function ISO20022CamtFile() {
   this.document = null;
   this.lang = 'en';
   this.params = this.defaultParameters();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      try {
         this.params = JSON.parse(savedParam);
      } catch(err) {
         Banana.console.log(err.toString());
      }
   }
}

ISO20022CamtFile.prototype.defaultParameters = function() {
   var params = {};

   /** If add_counterpart_transaction is set to true, in case of composed transactions a couterpart transaction
     is inserted in the list of the transactions. If set to false only the details transactions are added. */
   params.add_counterpart_transaction = true;

   params.invoice_no = {};
   params.invoice_no.extract = false;
   params.invoice_no.start = 0;
   params.invoice_no.count = -1;
   params.invoice_no.method = '';

   return params;
}

ISO20022CamtFile.prototype.setDocument = function(xml) {
   if (typeof xml === 'string')
      this.document = Banana.Xml.parse(xml);
   else
      this.document = xml;
}

ISO20022CamtFile.prototype.readTransactions = function() {
   if (!this.document)
      return [];

   var transactions = [];
   var statementsNode = this.getStatementNodes();
   for (var i = 0; i < statementsNode.length; i++) {
      transactions = transactions.concat(this.readStatementEntries(statementsNode[i]));
   }
   return transactions;
}

ISO20022CamtFile.prototype.getAccountsSummary = function() {
   if (!this.document)
      return [];

   var accountsSummary = {};
   var statementsNode = this.getStatementNodes();
   for (var i = 0; i < statementsNode.length; i++) {
      var statementNode = statementsNode[i];
      var iban = this.getStatementIBAN(statementNode)
      var accountSummary = accountsSummary[iban];
      if (!accountSummary) {
         accountSummary = {
            'iban' : iban,
            'currency' : this.getStatementCurrency(statementNode),
            'owner' : this.getStatementOwner(statementNode)
         };
         accountsSummary[iban] = accountSummary;
      }
      var statementBeginDate = this.getStatementBeginDate(statementNode);
      if (!accountSummary.beginDate || statementBeginDate < accountSummary.beginDate) {
         accountSummary.beginDate = statementBeginDate;
         accountSummary.beginBalance = this.getStatementBeginBalance(statementNode);
      }
      var statementEndDate = this.getStatementEndDate(statementNode);
      if (!accountSummary.endDate || statementEndDate >= accountSummary.endDate) {
         accountSummary.endDate = statementEndDate;
         accountSummary.endBalance = this.getStatementEndBalance(statementNode);
      }
   }

   return accountsSummary;
}

ISO20022CamtFile.prototype.getStatementNodes = function() {
   if (!this.document)
      return [];

   var statementNode = null
   var statementNodes = [];
   var docNode = this.document.firstChildElement(); // 'Document'
   var docNs = docNode.attribute('xmlns');
   if (docNs.indexOf('camt.052') >= 0) {
      statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrAcctRpt', 'Rpt']);
      while (statementNode) {
         statementNodes.push(statementNode)
         statementNode = statementNode.nextSiblingElement('Rpt');
      }
   } else if (docNs.indexOf('camt.053') >= 0) {
      statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrStmt', 'Stmt']);
      while (statementNode) {
         statementNodes.push(statementNode)
         statementNode = statementNode.nextSiblingElement('Stmt');
      }
   } else if (docNs.indexOf('camt.054') >= 0) {
      statementNode = this.firstGrandChildElement(docNode, ['BkToCstmrDbtCdtNtfctn', 'Ntfctn']);
      while (statementNode) {
         statementNodes.push(statementNode)
         statementNode = statementNode.nextSiblingElement('Ntfctn');
      }
   }

   return statementNodes;
}

ISO20022CamtFile.prototype.getStatementIBAN = function(statementNode) {
   var node = this.firstGrandChildElement(statementNode, ['Acct', 'Id', 'IBAN']);
   if (node)
      return node.text;
   return '';
}

ISO20022CamtFile.prototype.getStatementOwner = function(statementNode) {
   var node = this.firstGrandChildElement(statementNode, ['Acct', 'Ownr', 'Nm']);
   if (node)
      return node.text;
   return '';
}

ISO20022CamtFile.prototype.getStatementCurrency = function(statementNode) {
   var node = this.firstGrandChildElement(statementNode, ['Acct', 'Ccy']);
   if (node)
      return node.text;
   return '';
}

ISO20022CamtFile.prototype.getStatementBeginDate = function(statementNode) {
   if (!statementNode)
      return '';

   var balNode = statementNode.firstChildElement('Bal');
   while (balNode) {
      var tpNode = balNode.firstChildElement('Tp');
      if (tpNode) {
         var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
         if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
            var dateNode = balNode.firstChildElement('Dt');
            if (dateNode)
               return dateNode.text;
         }
      }
      balNode = balNode.nextSiblingElement();
   }
   return '';
}

ISO20022CamtFile.prototype.getStatementBeginBalance = function(statementNode) {
   if (!statementNode)
      return '';

   var balNode = statementNode.firstChildElement('Bal');
   while (balNode) {
      var tpNode = balNode.firstChildElement('Tp');
      if (tpNode) {
         var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
         if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
            var amtNode = balNode.firstChildElement('Amt');
            if (amtNode) {
               var amount = amtNode.text;
               if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                  amount = Banana.SDecimal.invert(amount);
               }
               return amount;
            }
         }
      }
      balNode = balNode.nextSiblingElement();
   }
   return '';
}

ISO20022CamtFile.prototype.getStatementEndDate = function(statementNode) {
   if (!statementNode)
      return '';

   var balNode = statementNode.firstChildElement('Bal');
   while (balNode) {
      var tpNode = balNode.firstChildElement('Tp');
      if (tpNode) {
         var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
         if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV' )) {
            var dateNode = balNode.firstChildElement('Dt');
            if (dateNode)
               return dateNode.text;
         }
      }
      balNode = balNode.nextSiblingElement();
   }
   return '';
}

ISO20022CamtFile.prototype.getStatementEndBalance = function(statementNode) {
   if (!statementNode)
      return '';

   var balNode = statementNode.firstChildElement('Bal');
   while (balNode) {
      var tpNode = balNode.firstChildElement('Tp');
      if (tpNode) {
         var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
         if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV' )) {
            var amtNode = balNode.firstChildElement('Amt');
            if (amtNode) {
               var amount = amtNode.text;
               if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                  amount = Banana.SDecimal.invert(amount);
               }
               return amount;
            }
         }
      }
      balNode = balNode.nextSiblingElement();
   }
   return '';
}

ISO20022CamtFile.prototype.readStatementEntries = function(statementNode) {
   if (!statementNode)
      return;

   var transactions = [];
   var entryNode = statementNode.firstChildElement('Ntry');
   while (entryNode) {
      transactions = transactions.concat(this.readStatementEntry(entryNode));
      entryNode = entryNode.nextSiblingElement('Ntry'); // next account movement
   }
   return transactions;
}

ISO20022CamtFile.prototype.readStatementEntry = function(entryNode) {
   var transaction = null;
   var transactions = [];

   var entryBookingDate = entryNode.hasChildElements('BookgDt') ? entryNode.firstChildElement('BookgDt').text.substr(0, 10) : '';
   var entryValutaDate = entryNode.hasChildElements('ValDt') ? entryNode.firstChildElement('ValDt').text.substr(0, 10) : '';
   var entryIsCredit = entryNode.firstChildElement('CdtDbtInd').text === 'CRDT';
   var entryAmount = entryNode.firstChildElement('Amt').text;
   var entryDescription = entryNode.hasChildElements('AddtlNtryInf') ? entryNode.firstChildElement('AddtlNtryInf').text : '';
   var entryBatchMsgId = '';
   var entryExternalReference = entryNode.hasChildElements('AcctSvcrRef') ? entryNode.firstChildElement('AcctSvcrRef').text : '';

   if (entryNode.hasChildElements('NtryDtls')) {
      var detailsNode = entryNode.firstChildElement('NtryDtls');
      while (detailsNode) {
         // Count text elements
         var txDtlsCount = 0;
         var textDetailsNode = detailsNode.firstChildElement('TxDtls');
         while (textDetailsNode) {
            txDtlsCount++;
            textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
         }

         var entryDetailsBatchMsgId = this.readStatementEntryDetailsMatchMsgId(detailsNode);

         if (this.params.add_counterpart_transaction && txDtlsCount > 1) {
            // Insert counterpart transaction
            transaction = {
               'Date': entryBookingDate,
               'DateValue': entryValutaDate,
               'DocInvoice': '',
               'Description': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
               'Income': entryIsCredit ? entryAmount : '',
               'Expenses': entryIsCredit ? '' : entryAmount,
               'ExternalReference': entryExternalReference,
               'IsDetail': 'S'
            };
            transactions.push(transaction);
         }

         // Text elements (Details transactions)
         if (detailsNode.hasChildElements('TxDtls')) {
            textDetailsNode = detailsNode.firstChildElement('TxDtls');
            while (textDetailsNode) {
               var cdtDbtIndNode = textDetailsNode.firstChildElement('CdtDbtInd');
               var deatailsIsCredit = cdtDbtIndNode && cdtDbtIndNode.text === 'CRDT' ? true : entryIsCredit;
               var deatailAmount = this.readStatementEntryDetailsAmount(textDetailsNode);
               var acctSvcrRefNode = this.firstGrandChildElement(textDetailsNode, ['Refs','AcctSvcrRef']);
               var detailExternalReference = acctSvcrRefNode ? acctSvcrRefNode.text : '';
               var rmtInfRefNode = this.firstGrandChildElement(textDetailsNode, ['RmtInf','Strd','CdtrRefInf','Ref']);
               var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text : '';
               var instrIdNode = this.firstGrandChildElement(textDetailsNode, ['Refs','InstrId']);

               var invoiceNumber = this.params.invoice_no.extract ? this.extractInvoiceNumber(detailEsrReference) : '';

               // Build description
               var detailDescription = this.readStatementEntryDetailsDescription(textDetailsNode, deatailsIsCredit);
               if (detailDescription.length === 0 && instrIdNode)
                  detailDescription = instrIdNode.text;

               if (txDtlsCount === 1) {
                  deatailAmount = entryAmount;
                  detailExternalReference = entryExternalReference;
                  detailDescription = this.joinNotEmpty([entryDescription, detailDescription, entryDetailsBatchMsgId], ' / ');
               }

               transaction = {
                  'Date': entryBookingDate,
                  'DateValue': entryValutaDate,
                  'DocInvoice': invoiceNumber,
                  'Description': detailDescription,
                  'Income': deatailsIsCredit ? deatailAmount : '',
                  'Expenses': deatailsIsCredit ? '' : deatailAmount,
                  'ExternalReference': detailExternalReference,
                  'IsDetail': this.params.add_counterpart_transaction && txDtlsCount > 1 ? 'D' : ''
               };
               transactions.push(transaction);
               txDtlsCount++;

               textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
            }
         } else { // No entry text details elements
            transaction = {
               'Date': entryBookingDate,
               'DateValue': entryValutaDate,
               'DocInvoice': '',
               'Description': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
               'Income': entryIsCredit ? entryAmount : '',
               'Expenses': entryIsCredit ? '' : entryAmount,
               'ExternalReference': entryExternalReference,
               'IsDetail': ''
            };
            transactions.push(transaction);

         }

         detailsNode = detailsNode.nextSiblingElement('NtryDtls'); // next movement detail
      }

   } else { // No entry details
      transaction = {
         'Date': entryBookingDate,
         'DateValue': entryValutaDate,
         'DocInvoice': '',
         'Description': entryDescription,
         'Income': entryIsCredit ? entryAmount : '',
         'Expenses': entryIsCredit ? '' : entryAmount,
         'ExternalReference': entryExternalReference,
         'IsDetail': ''
      };
      transactions.push(transaction);

   }

   return transactions;
}

ISO20022CamtFile.prototype.readStatementEntryDetailsMatchMsgId = function(detailsNode) {
   var batchMsgIdNode = this.firstGrandChildElement(detailsNode, ['Btch', 'MsgId']);
   return batchMsgIdNode ? batchMsgIdNode.text : '';
}

ISO20022CamtFile.prototype.readStatementEntryDetailsAmount = function(detailsNode) {

   if (!detailsNode)
      return '';

   var amtNode = detailsNode.firstChildElement('Amt');
   if (amtNode)
      return amtNode.text;

   amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'TxAmt', 'Amt'])
   if (amtNode)
      return amtNode.text;

   amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'InstdAmt'])
   if (amtNode)
      return amtNode.text;

   amtNode = this.firstGrandChildElement(detailsNode, ['AmtDtls', 'CntrValAmt'])
   if (amtNode)
      return amtNode.text;

   return '';
}

ISO20022CamtFile.prototype.readStatementEntryDetailsDescription = function(detailsNode, isCredit) {

   var detailsDescriptionTexts = [];

   detailsDescriptionTexts.push(this.readStatementEntryDetailsAddress(detailsNode, isCredit));

   if (detailsNode.hasChildElements('RmtInf')) {
      var ustrdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Ustrd');
      while (ustrdNode)
      {
         var ustrdString = ustrdNode.text.trim();
         if (ustrdString === '?REJECT?0') {
            ustrdString = '';
         }
         if (ustrdString.length === 0)
            break;
         detailsDescriptionTexts.push(ustrdString);
         ustrdNode = ustrdNode.nextSiblingElement('Ustrd');
      }
   }

   var rmtInfRefNode = this.firstGrandChildElement(detailsNode, ['RmtInf','Strd','CdtrRefInf','Ref']);
   var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text.trim() : '';
   if (detailEsrReference.length > 0)
      detailsDescriptionTexts.push(this.tr('isr', this.lang) + detailEsrReference);

   return this.joinNotEmpty(detailsDescriptionTexts, ' / ');
}

ISO20022CamtFile.prototype.readStatementEntryDetailsAddress = function(detailsNode, isCredit) {
   var rltdPtiesNode = detailsNode.firstChildElement('RltdPties');
   if (!rltdPtiesNode)
      return '';

   var addressNode = null;
   if (isCredit) {
      if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
         addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
      else if (rltdPtiesNode.hasChildElements('Dbtr'))
         addressNode = rltdPtiesNode.firstChildElement('Dbtr')
      else if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
         addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
      else if (rltdPtiesNode.hasChildElements('Cdtr'))
         addressNode = rltdPtiesNode.firstChildElement('Cdtr')
   } else {
      if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
         addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
      else if (rltdPtiesNode.hasChildElements('Cdtr'))
         addressNode = rltdPtiesNode.firstChildElement('Cdtr')
      else if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
         addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
      else if (rltdPtiesNode.hasChildElements('Dbtr'))
         addressNode = rltdPtiesNode.firstChildElement('Dbtr')
   }

   if (!addressNode)
      return '';

   var addressStrings = [];
   addressStrings.push(addressNode.firstChildElement('Nm').text);
   var pstlAdrNode = addressNode.firstChildElement('PstlAdr');
   if (pstlAdrNode) {
      if (pstlAdrNode.hasChildElements('TwnNm'))
         addressStrings.push(pstlAdrNode.firstChildElement('TwnNm').text);
      if (pstlAdrNode.hasChildElements('Ctry'))
         addressStrings.push(pstlAdrNode.firstChildElement('Ctry').text);
   }

   return addressStrings.join(', ');
}

ISO20022CamtFile.prototype.readStatementEntryDetailsReference = function(detailsNode) {

   if (!detailsNode)
      return '';

   var referenceText = '';

   if (detailsNode.hasChildElements('Refs')) {
      var refsNode = detailsNode.firstChildElement('Refs');
      if (refsNode.hasChildElements('TxId'))
         referenceText = refsNode.firstChildElement('TxId').text;
      if (refsNode.hasChildElements('InstrId'))
         referenceText = refsNode.firstChildElement('InstrId').text;
      if (refsNode.hasChildElements('ChqNb'))
         referenceText = refsNode.firstChildElement('ChqNb').text;
      if (refsNode.hasChildElements('MndtId'))
         referenceText = refsNode.firstChildElement('MndtId').text;
      if (refsNode.hasChildElements('MsgId'))
         referenceText = refsNode.firstChildElement('MsgId').text;
   }

   if (referenceText.length > 0)
      return referenceText;

   if (detailsNode.hasChildElements('RmtInf')) {
      var strdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Strd');
      while (strdNode) {
         if (strdNode.hasChildElements('CdtrRefInf')) {
            var cdtrRefInfNode = strdNode.firstChildEment('CdtrRefInf');
            if (cdtrRefInfNode.hasChildElements('Ref')) {
               var refString = cdtrRefInfNode.firstChildElement('Ref').text;
               if (refString.length > 0) {
                  return refString;
               }
            }
         }
         strdNode = strdNode.nextSiblingElement('Strd');
      }
   }

   return '';
}

ISO20022CamtFile.prototype.extractInvoiceNumber = function(esrNumber) {

   if (!esrNumber || esrNumber.length <= 0)
      return '';

   var invoiceNumber = esrNumber;

   // First apply start / length extraction
   if (this.params.invoice_no.start !== 0 || this.params.invoice_no.count !== -1) {
      if (this.params.invoice_no.count === -1)
         invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start);
      else
         invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start, this.params.invoice_no.count);
   }

   // Second apply method if defined
   if (this.params.invoice_no.method.length > 0) {
      var invoiceMethod = eval(this.params.invoice_no.method);
      if (typeof(invoiceMethod) === 'function') {
         invoiceNumber = invoiceMethod(invoiceNumber);
      }
   }

   return invoiceNumber;
}

ISO20022CamtFile.prototype.firstGrandChildElement = function(node, childs) {
   if (!node)
      return null;

   var grandChildNode = node;
   for (var i = 0; i < childs.length; i++) {
      grandChildNode = grandChildNode.firstChildElement(childs[i]);
      if (!grandChildNode)
         break;
   }

   return grandChildNode;
}

/**
  * The  method tr(textid, language) return a translation of a text defined by textid in the desired language
  * If a translation in the given language is not defined, the english text is returned.
  * If no text is found for the given textid, the textid is returned ad text.
  */
ISO20022CamtFile.prototype.tr = function(textid, language) {
   var texts = {};

   // Default texts (english)
   texts.settings = 'Settings';
   texts.isr = 'Isr: ';

   texts.add_counterpart_transaction = 'Add counterpart transaction';
   texts.invoice_no_extract = 'Extract invoice number from Isr reference';
   texts.invoice_no_start = 'Start position';
   texts.invoice_no_length = 'Number of characters (-1 = all)';
   texts.invoice_no_method = 'Function (optional)';

   texts.legacy_add_counterpart_transaction = 'Add counterpart transactions (0 or empty = No; 1 = Yes)';
   texts.legacy_invoice_no_extract = 'Extract invoice number from Isr reference (0 or empty = No; 1 = Yes)';
   texts.legacy_invoice_no_start = 'Extract invoice number from Isr reference: Start position';
   texts.legacy_invoice_no_length = 'Extract invoice number from Isr reference: Number of characters (-1 = all)';
   texts.legacy_invoice_no_method = 'Extract invoice number from Isr reference: Function (optional)';

   // The translations will overwrite the default texts
   if (language === 'it') {
      texts.settings = 'Impostazioni';
      texts.isr = 'Pvr: ';

      texts.add_counterpart_transaction = 'Aggiungi registrazione di contropartita';
      texts.invoice_no_extract = 'Estrai numero fattura dal numero di riferimento PVR';
      texts.invoice_no_start = 'Posizione di inizio';
      texts.invoice_no_length = 'Numero di carateri (-1 = tutti)';
      texts.invoice_no_method = 'Funzione (opzionale)';

      texts.legacy_add_counterpart_transaction = 'Aggiungi registrazione di contropartita (0 o vuoto = No; 1 = Si)';
      texts.legacy_invoice_no_extract = 'Estrai numero fattura dal numero di riferimento PVR (0 o vuoto = No; 1 = Si)';
      texts.legacy_invoice_no_start = 'Estrai numero fattura dal numero di riferimento PVR: Posizione di inizio';
      texts.legacy_invoice_no_length = 'Estrai numero fattura dal numero di riferimento PVR: Numero di caratteri (-1 = tutti)';
      texts.legacy_invoice_no_method = 'Estrai numero fattura dal numero di riferimento PVR: Funzione (opzionale)';

   } else if (language === 'de') {
      texts.settings = 'Einstellungen';
      texts.isr = 'ESR: ';

      texts.add_counterpart_transaction = 'Gegenbuchung hinzufügen';
      texts.invoice_no_extract = 'Rechnungsnummer aus ESR-Referenznummer extrahieren';
      texts.invoice_no_start = 'Anfangsposition';
      texts.invoice_no_length = 'Anzahl Zeichen (-1 = Alle)';
      texts.invoice_no_method = 'Funktion (optional)';

      texts.legacy_add_counterpart_transaction = 'Gegenbuchung hinzufügen (0 oder leer = Nein; 1 = Ja)';
      texts.legacy_invoice_no_extract = 'Rechnungsnummer aus ESR-Referenznummer extrahieren (0 oder leer = Nein; 1 = Ja)';
      texts.legacy_invoice_no_start = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Anfangsposition';
      texts.legacy_invoice_no_length = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Anzahl Zeichen (-1 = Alle)';
      texts.legacy_invoice_no_method = 'Rechnungsnummer aus ESR-Referenznummer extrahieren: Funktion (optional)';

   } else if (language === 'fr') {
      texts.settings = 'Paramètres';
      texts.isr = 'Bvr: ';

      texts.add_counterpart_transaction = 'Ajouter écriture de contrepartie';
      texts.invoice_no_extract = 'Extraire le numéro de facture depuis le numéro de référence BVR';
      texts.invoice_no_start = 'Position de départ';
      texts.invoice_no_length = 'Nombre de caractères (-1 = tous)';
      texts.invoice_no_method = 'Fonction (optionnel)';

      texts.legacy_add_counterpart_transaction = 'Ajouter écriture de contrepartie (0 ou vide = Non; 1 = Oui)';
      texts.legacy_invoice_no_extract = 'Extraire le numéro de facture depuis le numéro de référence BVR (0 ou vide = Non; 1 = Oui)';
      texts.legacy_invoice_no_start = 'Extraire le numéro de facture depuis le numéro de référence BVR: Position de départ';
      texts.legacy_invoice_no_length = 'Extraire le numéro de facture depuis le numéro de référence BVR: Nombre de caractères (-1 = tous)';
      texts.legacy_invoice_no_method = 'Extraire le numéro de facture depuis le numéro de référence BVR: Fonction (optionnel)';

   }

   var text = texts[textid];
   if (typeof(text) === 'string')
      return text;

   // If the textid is not found, just return the id, but never an empty string
   // So we can assure that a text is showed to the user.
   return textid;
}

ISO20022CamtFile.prototype.joinNotEmpty = function(texts, separator) {
   var cleanTexts = texts.filter(function(n){ return n && n.trim().length});
   return cleanTexts.join(separator);
}
