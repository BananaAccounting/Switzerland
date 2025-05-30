﻿// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.switzerland.import.bekb
// @api = 1.0
// @pubdate = 2023-09-08
// @publisher = Banana.ch SA
// @description = Berner Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.en = Berner Kantonalbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Berner Kantonalbank - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Berner Kantonalbank - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Berner Kantonalbank - Importa movimenti .csv (Banana+ Advanced)
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
   var format1 = new BEKBFormat1();
   if (format1.match(transactions)) {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * BEKB Format 1
 * Gutschrift / Belastung;Datum;Valuta;Buchungstext;Zusatzinfos Buchung;Name Auftraggeber / Beg�nstigter;Adresse Auftraggeber / Beg�nstigter;Konto / Bank;Mitteilung / Referenz;Zusatzinfos Transaktion;Betrag;Saldo
 * Gutschrift per {date};27.06.2022;27.06.2022;Zahlungseingang;;Company SA;Via Delle scuole 24 Lugano;CH1234;TR1234567890 -123;;629.74;11176.55
 * Gutschrift per {date};24.06.2022;24.06.2022;Zahlungseingang;;Company SA;Via Delle scuole 24 Lugano;CH1234;TR9472983819 -123;;202.41;10546.81
 * Belastung per {date};24.06.2022;23.06.2022;Verkaufspunkt/Debitkarte;;SAG Schweiz AG;Salita Viarno 10b;;;;-53.30;10344.40
 * 
 */
var BEKBFormat1 = class BEKBFormat1 {

   constructor() {
      this.colMovType = 0;
      this.colDate = 1;
      this.colDateValuta = 2;
      this.colDescr = 3;
      this.colDescr2 = 4;//Additional information Booking: Zusatzinfos Buchung.
      this.colDescr3 = 8; //Transactions reference Nr: Mitteilung / Referenz.
      this.colAmount = 10;

      this.colCount = 12;
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
         if (transaction.length >= this.colCount)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate] &&
            transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDateValuta] &&
            transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length === 10)
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

      for (var i = 1; i < rows.length; i++)
         transactionsToImport.push(this.mapTransaction(rows[i]));

      // Sort rows by date
      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "Doc", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   /** Return the transaction converted in the import format */
   mapTransaction(transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction[this.colDate], "dd.mm.yyyy"));
      mappedLine.push(""); // Doc is empty for now
      let description = this.getDescription(transaction);
      mappedLine.push(description);
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

   getDescription(transaction) {

      let descr1 = transaction[this.colDescr];
      let descr2 = transaction[this.colDescr2];
      let descr3 = transaction[this.colDescr3];

      descr2 == "" ? descr2 = descr2 : descr2 = ", " + descr2;
      descr3 == "" ? descr3 = descr3 : descr3 = ", " + descr3;

      let description = descr1 + descr2 + descr3;

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
   }
   else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}


