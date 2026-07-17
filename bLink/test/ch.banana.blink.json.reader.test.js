// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
//


// @id = ch.banana.blink.json.parser
// @api = 1.0
// @pubdate = 2025-12-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.blink.json.parser.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.blink.json.parser.sbaa/ch.banana.blink.errormessages.js
// @includejs = ../ch.banana.blink.json.parser.sbaa/ch.banana.blink.json.parser.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestBlinkJsonParser());

// Here we define the class, the name of the class is not important
function TestBlinkJsonParser() {
}

// This method will be called at the beginning of the test case
TestBlinkJsonParser.prototype.initTestCase = function () {
   this.loggerParent = Test.logger;
   this.progressBar = Banana.application.progressBar;
   this.progressBar.start(3);
}

// This method will be called at the end of the test case
TestBlinkJsonParser.prototype.cleanupTestCase = function () {
   this.progressBar.step();
}

// This method will be called before every test method is executed
TestBlinkJsonParser.prototype.init = function () {

}

// This method will be called after every test method is executed
TestBlinkJsonParser.prototype.cleanup = function () {
   this.progressBar.finish();
}

TestBlinkJsonParser.prototype.testJsonConversion = function () {
   const parentLogger = this.loggerParent;
   const filePath = "file:script/../test/testcases/double_entry_blink.ac2";
   const accFile = Banana.IO.getLocalFile(filePath);
   Test.assert(accFile);
   const banDoc = Banana.application.openDocument(filePath);
   Test.assert(banDoc);

   let newLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(filePath));

   bLinkJsonParser = new BLinkJsonParser();
   let jsonObj = getBankAccount2Transactions();
   if (bLinkJsonParser.initClassVariables(jsonObj, banDoc)) {
      let trObj = bLinkJsonParser.getTransactionsToImport();
      newLogger.addJson('TransactionsData', JSON.stringify(trObj));
   }
}

/**
 * Ritorna il JSON contenente le transazioni bancarie del conto banca 2
 * messo a disposizione dal BLink nella suite di test:
 * Bank Account 2 - with bookings for past date • CH0200700110000387896
 * Filtri attivi:2025-12-01 → 2025-12-05• limit: 25
 * Json structure version: V5
 */
function getBankAccount2Transactions() {
   return {
      "iban": "CH0200700110000387896",
      "entries": [
         {
            "entryId": "ENTRY00001648",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "CRDT",
            "amount": {
               "amount": "250.00",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "RCDT",
               "subFamilyCode": "DMCT"
            },
            "accountServicerReference": "33127b1f-0fe1-46b6-aea5-96d98c53458",
            "entryReference": null,
            "additionalEntryInformation": "Credit from 2025-12-02",
            "transactions": []
         },
         {
            "entryId": "ENTRY00001649",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "CRDT",
            "amount": {
               "amount": "1000.00",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "RCDT",
               "subFamilyCode": "DMCT"
            },
            "accountServicerReference": "06205306-e49c-417b-ad9f-77afa28d91e",
            "entryReference": null,
            "additionalEntryInformation": "Credit from 2025-12-02",
            "transactions": [
               {
                  "accountServicerReference": "ac9e1729-140e-444c-9588-f122516a5dc",
                  "amount": {
                     "amount": "1000.00",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-WGQWBJ-00422",
                  "transactionType": "CRDT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "RCDT",
                     "subFamilyCode": "DMCT"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "CH85002582584X1234560",
                        "type": "IBAN"
                     },
                     "agent": {
                        "clearingSystemMemberIdentification": {
                           "code": "CHBCC",
                           "memberId": "99999"
                        }
                     },
                     "name": "Barbara Muster",
                     "postalAddress": {
                        "structured": {
                           "postCode": "8001",
                           "streetName": "Rosenauweg",
                           "townName": "Zuerich",
                           "buildingNumber": "4",
                           "country": "CH"
                        },
                        "unstructured": {
                           "addressLines": [
                              "Rosenauweg 4, 8001 Z\u00fcrich, CH"
                           ]
                        }
                     }
                  },
                  "endToEndId": "endToEndId-01",
                  "remittanceInformation": "RECHNUNG 67890"
               }
            ]
         },
         {
            "entryId": "ENTRY00001650",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "CRDT",
            "amount": {
               "amount": "3.47",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "RCDT",
               "subFamilyCode": "ESCT"
            },
            "accountServicerReference": "11ce95cb-d0ca-4065-a6a7-617c09db4a8",
            "entryReference": null,
            "additionalEntryInformation": "Credit from 2025-12-02",
            "transactions": [
               {
                  "accountServicerReference": "55cf41a9-c4be-40b7-a4fc-a956dda5bdb",
                  "amount": {
                     "amount": "3.47",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-WGQWBJ-00422",
                  "transactionType": "CRDT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "RCDT",
                     "subFamilyCode": "ESCT"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "DE12500105170648489890",
                        "type": "IBAN"
                     },
                     "name": "Peter Haller",
                     "postalAddress": {
                        "structured": {
                           "postCode": "80036",
                           "streetName": "Rosenauweg",
                           "townName": "Muenchen",
                           "buildingNumber": "4",
                           "country": "DE"
                        }
                     }
                  },
                  "endToEndId": "endToEndId-02",
                  "instructedAmount": {
                     "amount": "3",
                     "sourceCurrency": "EUR",
                     "targetCurrency": "CHF",
                     "exchangeIndicator": "MULT",
                     "exchangeRate": "1.15632286"
                  },
                  "remittanceInformation": "RECHNUNG 23456"
               }
            ]
         },
         {
            "entryId": "ENTRY00001651",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "CRDT",
            "amount": {
               "amount": "145.70",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "RCDT",
               "subFamilyCode": "VCOM"
            },
            "accountServicerReference": "2010dc9c-197b-43fd-a87a-2ec67464a86",
            "entryReference": "010026540",
            "additionalEntryInformation": "Credit from 2025-12-02",
            "transactions": [
               {
                  "accountServicerReference": "0d744e1d-8567-422c-8d5d-fbf6cff01f4",
                  "amount": {
                     "amount": "100",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-IYPJNR-00424",
                  "transactionType": "CRDT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "RCDT",
                     "subFamilyCode": "VCOM"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "CH85002582584X1234560",
                        "type": "IBAN"
                     },
                     "name": "Max Muster",
                     "postalAddress": {
                        "unstructured": {
                           "addressLines": [
                              "Bundesplatz 1",
                              "3003 Bern"
                           ],
                           "country": "CH"
                        }
                     }
                  },
                  "endToEndId": "endToEndId-03",
                  "remittanceReference": {
                     "reference": "123456789012345678901234567",
                     "type": "SCOR"
                  }
               },
               {
                  "accountServicerReference": "a0ab9caa-07e5-4c83-bc96-e6841de76b7",
                  "amount": {
                     "amount": "45.70",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-IYWERR-00564",
                  "transactionType": "CRDT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "RCDT",
                     "subFamilyCode": "VCOM"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "CH85002582584X1234560",
                        "type": "IBAN"
                     },
                     "name": "Peter Muster",
                     "postalAddress": {
                        "unstructured": {
                           "addressLines": [
                              "Bundesplatz 1",
                              "3003 Bern"
                           ],
                           "country": "CH"
                        }
                     }
                  },
                  "endToEndId": "endToEndId-04",
                  "remittanceReference": {
                     "reference": "123456789012345678901234567",
                     "type": "QRR"
                  }
               }
            ]
         },
         {
            "entryId": "ENTRY00001652",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "DBIT",
            "amount": {
               "amount": "9.57",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "ICDT",
               "subFamilyCode": "OTHR"
            },
            "accountServicerReference": "ed1a3dd3-a538-495d-9032-771e3a703f6",
            "entryReference": "010026540",
            "additionalEntryInformation": "Debit from 2025-12-02",
            "transactions": [
               {
                  "accountServicerReference": "c92693f1-2cbb-4fd3-ad36-d785dcbe92b",
                  "amount": {
                     "amount": "9.57",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-IYWERR-00897",
                  "transactionType": "DBIT",
                  "additionalTransactionInformation": "string",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "ICDT",
                     "subFamilyCode": "OTHR"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "PL79105015751000002345678901",
                        "type": "IBAN"
                     },
                     "agent": {
                        "bic": "INGBPLPW"
                     },
                     "name": "Jan Kowalski",
                     "postalAddress": {
                        "structured": {
                           "postCode": "50-382",
                           "streetName": "Szczytnicka",
                           "townName": "Wroclaw",
                           "buildingNumber": "9",
                           "country": "PL"
                        }
                     }
                  },
                  "endToEndId": "endToEndId-01",
                  "instructedAmount": {
                     "amount": "10",
                     "sourceCurrency": "USD",
                     "targetCurrency": "CHF",
                     "exchangeIndicator": "MULT",
                     "exchangeRate": "0.957"
                  },
                  "remittanceInformation": "Invoice AB-123-C"
               }
            ]
         },
         {
            "entryId": "ENTRY00011653",
            "bookingDate": "2025-12-02",
            "valueDate": "2025-12-02",
            "entryStatus": "booked",
            "transactionType": "DBIT",
            "amount": {
               "amount": "120",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "ICDT",
               "subFamilyCode": "VCOM"
            },
            "accountServicerReference": "def34a87-1245-4e0f-90c4-8fc6c465a7e",
            "entryReference": "010026540",
            "additionalEntryInformation": "Debit from 2025-12-02",
            "transactions": [
               {
                  "accountServicerReference": "c6e14dbd-6bf8-473b-abda-cb96afb8ef8",
                  "amount": {
                     "amount": "120",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-IYWERR-00998",
                  "transactionType": "DBIT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "ICDT",
                     "subFamilyCode": "VCOM"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "01-39139-1",
                        "type": "OTHER"
                     },
                     "name": "Aero Club der Schweiz",
                     "postalAddress": {
                        "unstructured": {
                           "addressLines": [
                              "Lidostrasse 5",
                              "6006 Luzern"
                           ],
                           "country": "CH"
                        }
                     }
                  },
                  "endToEndId": "endToEndId-01",
                  "instructedAmount": {
                     "amount": "10",
                     "sourceCurrency": "USD",
                     "targetCurrency": "CHF",
                     "exchangeIndicator": "MULT",
                     "exchangeRate": "0.957"
                  },
                  "remittanceReference": {
                     "reference": "047280000701047470007679672",
                     "type": "SCOR"
                  }
               }
            ]
         },
         {
            "entryId": "ENTRY00001647",
            "bookingDate": "2025-12-01",
            "valueDate": "2025-12-01",
            "entryStatus": "booked",
            "transactionType": "CRDT",
            "amount": {
               "amount": "50.00",
               "currency": "CHF"
            },
            "bankTransactionCode": {
               "domainCode": "PMNT",
               "familyCode": "RCDT",
               "subFamilyCode": "VCOM"
            },
            "accountServicerReference": "4a082822-a565-450f-bc2c-bc41aac9b63",
            "entryReference": null,
            "additionalEntryInformation": "Credit from 2025-12-01",
            "transactions": [
               {
                  "accountServicerReference": "e187c380-ba61-4a08-b21f-436a1e16642",
                  "amount": {
                     "amount": "50.00",
                     "currency": "CHF"
                  },
                  "transactionId": "TRX-20230718-IVYCHK-00421",
                  "transactionType": "CRDT",
                  "bankTransactionCode": {
                     "domainCode": "PMNT",
                     "familyCode": "RCDT",
                     "subFamilyCode": "VCOM"
                  },
                  "counterparty": {
                     "account": {
                        "identification": "CH6531999000000000000",
                        "type": "IBAN"
                     },
                     "postalAddress": {
                        "unstructured": {
                           "addressLines": [
                              "Rosenauweg 4, 8001 Z\u00fcrich, CH"
                           ]
                        }
                     }
                  },
                  "remittanceReference": {
                     "reference": "RF18539007547034",
                     "type": "SCOR"
                  }
               }
            ]
         }
      ]
   }
}