// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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




/* Print preferences update: 2024-12-11 */





//====================================================================//
// FUNCTIONS USED TO CREATE THE DIALOG PRINT PREFERENCES
//====================================================================//
function getPrintPreferences() {
  /**
   * Function that returns a list of available print modes for the layout.
   * Banana calls this function when the layout is selected in the dialog "Print invoice".
   * In the "Print Invoice" dialog under the layout selection, these print modes are displayed and can be selected.
   * Then the script use the appropriate functions to print the report.
   * 
   * https://www.banana.ch/doc/en/node/9980
   */

  //get program language (system language) and return the object for the language.
  let lang = Banana.application.locale;
  lang = lang.substr(0,2);
  let printPreferences;

  switch(lang){
    case "en":
      printPreferences = getPrintPreferences_en();
      break;
    case "it":
      printPreferences = getPrintPreferences_it();
      break;
    case "fr":
      printPreferences = getPrintPreferences_fr();
      break;
    case "de":
      printPreferences = getPrintPreferences_de();
      break;
    default:
      printPreferences = getPrintPreferences_en();
      break;
  }
  // Banana.console.log(JSON.stringify(printPreferences,"", " "));
  return printPreferences
}

function getPrintPreferences_en() {
  let printOptions_en =
  {
    "version" : "1.0",
    "id": "invoice_available_layout_preferences",
    "text":"Layout preferences",
    "base_options" : [
      {
        "id": "invoice_available_print_as",
        "text": "Print as",
        "print_as": [
          {
            "id":"automatic",
            "text":"Automatic"
          },
          {
            "id":"invoice",
            "text": "Invoice"
          },
          {
            "id":"delivery_note" ,
            "text": "Delivery Note with amounts"
          },
          {
            "id":"delivery_note_without_amounts",
            "text":"Delivery Note without amounts"
          },
          {
            "id":"reminder_1",
            "text": "1st reminder"
          },
          {
            "id":"reminder_2",
            "text":"2nd reminder"
          },
          {
            "id":"reminder_3",
            "text": "3rd reminder"
          },
          {
            "id":"estimate",
            "text": "Estimate"
          },
          {
            "id":"proforma_invoice",
            "text": "Proforma Invoice"
          },
          {
            "id":"qrcode_slip",
            "text": "QR slip"
          },
          {
            "id":"order_confirmation",
            "text": "Order Confirmation"
          }
        ],
        "default": "automatic"
      }
    ]
  }
  return printOptions_en;
}

function getPrintPreferences_it() {
  let printOptions_it =
  {
    "version" : "1.0",
    "id": "invoice_available_layout_preferences",
    "text":"Preferenze del layout",
    "base_options" : [
      {
        "id": "invoice_available_print_as",
        "text": "Stampa come",
        "print_as": [
          {
            "id":"automatic",
            "text":"Automatico"
          },
          {
            "id":"invoice",
            "text": "Fattura"
          },
          {
            "id":"delivery_note" ,
            "text": "Bollettino di consegna con importi"
          },
          {
            "id":"delivery_note_without_amounts",
            "text":"Bollettino di consegna senza importi"
          },
          {
            "id":"reminder_1",
            "text": "1. richiamo"
          },
          {
            "id":"reminder_2",
            "text":"2. richiamo"
          },
          {
            "id":"reminder_3",
            "text": "3. richiamo"
          },
          {
            "id":"estimate",
            "text": "Offerta"
          },
          {
            "id":"proforma_invoice",
            "text": "Fattura Proforma"
          },
          {
            "id":"qrcode_slip",
            "text": "Bollettino QR"
          },
          {
            "id":"order_confirmation",
            "text": "Conferma d'ordine"
          }
        ],
        "default": "automatic"
      }
    ]
  }
  return printOptions_it;
}

function getPrintPreferences_fr() {
  let printOptions_fr =
  {
    "version" : "1.0",
    "id": "invoice_available_layout_preferences",
    "text":"Préférences de mise en page",
    "base_options" : [
      {
        "id": "invoice_available_print_as",
        "text": "Imprimer comme",
        "print_as": [
          {
            "id":"automatic",
            "text":"Automatique"
          },
          {
            "id":"invoice",
            "text": "Facture"
          },
          {
            "id":"delivery_note" ,
            "text": "Bon de livraison avec montants"
          },
          {
            "id":"delivery_note_without_amounts",
            "text":"Bon de livraison sans montants"
          },
          {
            "id":"reminder_1",
            "text": "1er rappel"
          },
          {
            "id":"reminder_2",
            "text":"2e rappel"
          },
          {
            "id":"reminder_3",
            "text": "3e rappel"
          },
          {
            "id":"estimate",
            "text": "Offre"
          },
          {
            "id":"proforma_invoice",
            "text": "Facture Proforma"
          },
          {
            "id":"qrcode_slip",
            "text": "Bulletin QR"
          },
          {
            "id":"order_confirmation",
            "text": "Confirmation de commande"
          }
        ],
        "default": "automatic"
      }
    ]
  }
  return printOptions_fr;
}

function getPrintPreferences_de() {
  let printOptions_de =
  {
    "version" : "1.0",
    "id": "invoice_available_layout_preferences",
    "text":"Layout-Präferenzen",
    "base_options" : [
      {
        "id": "invoice_available_print_as",
        "text": "Drucken als",
        "print_as": [
          {
            "id":"automatic",
            "text":"Automatisch"
          },
          {
            "id":"invoice",
            "text": "Rechnung"
          },
          {
            "id":"delivery_note" ,
            "text": "Lieferschein mit Beträge"
          },
          {
            "id":"delivery_note_without_amounts",
            "text":"Lieferschein ohne Beträge"
          },
          {
            "id":"reminder_1",
            "text": "1. Mahnung"
          },
          {
            "id":"reminder_2",
            "text":"2. Mahnung"
          },
          {
            "id":"reminder_3",
            "text": "3. Mahnung"
          },
          {
            "id":"estimate",
            "text": "Offerte"
          },
          {
            "id":"proforma_invoice",
            "text": "Proforma-Rechnung"
          },
          {
            "id":"qrcode_slip",
            "text": "QR-Einzahlungsschein"
          },
          {
            "id":"order_confirmation",
            "text": "Bestellbestätigung"
          }
        ],
        "default": "automatic"
      }
    ]
  }
  return printOptions_de;
}



//====================================================================//
// FUNCTION USED TO TAKE DATA RETURNED FROM THE DIALOG PRINT PREFERENCES
//====================================================================//
function getPrintFormat(preferencesObj) {
  /**
   * Function that returns the print format.
   * The print format is selected from the dialog "Print invoice".
   * It's returned along with other information in the preferencesObj.
   * 
   * https://www.banana.ch/doc/en/node/9980#returned_json_structure_example
   * 
   */
  let printformat = "";
  if (preferencesObj && preferencesObj.print_choices.print_as) {
    printformat = preferencesObj.print_choices.print_as;
  }
  // Banana.console.log(JSON.stringify(preferencesObj, "", " "));
  // Banana.console.log(printformat);

  return printformat;
}

