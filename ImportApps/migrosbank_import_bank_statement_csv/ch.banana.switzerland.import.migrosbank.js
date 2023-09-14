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

// @id = ch.banana.switzerland.import.migrosbank
// @api = 1.0
// @pubdate = 2023-09-14
// @publisher = Banana.ch SA
// @description = Migros Bank - Import account statement .csv (Banana+ Advanced)
// @description.en = Migros Bank - Import account statement .csv (Banana+ Advanced)
// @description.de = Migros Bank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Migros Bank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Migros Bank - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputencoding = latin1
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

   // Format 1
   var format1 = new MBFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Migros Bank Format 1:
 * Kontoauszug bis: 04.09.2023 ;;;
 * ;;;
 * Kontonummer: 543.278.22;;;
 * Bezeichnung: Privat;;;
 * Saldo: CHF 38547.7;;;
 * ;;;
 * Ramer E. & Ramer-Zahner D.;;;
 * In den Steinreben 6C;;;
 * 4153 Reinach BL;;;
 * ;;;
 * ;;;
 * Datum;Buchungstext;Betrag;Valuta
 * 04.09.23;Zahlungseingang;1838.00;04.09.23
 * 04.09.23;Zahlungs;-204.45;04.09.23
 * 
 */
var MBFormat1 = class MBFormat1 {

   constructor() {
      this.colDate = 0;
      this.colDescr = 1;
      this.colAmount = 2;
      this.colDateValuta = 3;

      this.colCount = 4;
      this.decimalSeparator = ".";
   }

   /** Return true if the transactions match this format */
   match(transactions) {

      if (transactions.length === 0)
         return false;

      for (var i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         /* array should have all columns */
         if (transaction.length == this.colCount)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 8)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDateValuta] &&
            transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length === 8)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   convert(rows) {
      var transactionsToImport = [];

      for (var i = 0; i < rows.length; i++) {
         let transaction = rows[i];
         if (transaction.length == this.colCount &&
            transaction[this.colDate].match(/[0-9\.]+/g) &&
            transaction[this.colDate].length === 8) {
            transactionsToImport.push(this.mapTransaction(rows[i]));
         }
      }

      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   mapTransaction(transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction[this.colDate], "dd.mm.yy"));
      mappedLine.push(""); // Doc is empty for now
      mappedLine.push(transaction[this.colDescr]);
      var amount = transaction[this.colAmount];
      if (amount.length > 0) {
         if (amount[0] === "-") {
            amount = amount.replace(/-/g, ''); //remove minus sign
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));

         } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, "."));
            mappedLine.push("");
         }
      }

      return mappedLine;
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
   }
   else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}


