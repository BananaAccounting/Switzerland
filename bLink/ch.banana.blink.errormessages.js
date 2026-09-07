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

/**********************************************************
 * 
 * ERROR MESSAGES HANDLER
 * 
 *********************************************************/

/**
 * 
 * Returns error to display to the user.
 */
function getErrorMessage(banDoc, errorId, txtParam) {
    let lang = getLang(banDoc);
    let texts = getErrorTexts(lang, txtParam);
    switch (errorId) {
        case "ID_BANCARTELLA_NOT_VALID":
            return texts.errBanCartella;
        case "ID_IBAN_NOT_FOUND":
            return texts.ibanNotFound;
        case "INVALID_ACCOUNTING_TYPE":
            return texts.invalidAccountingType;
        case "NO_ENTRIES_FOUND":
            return texts.noEntriesFound;
    }
    return '';
}

/**Returns error log messages useful to debug eventual errors. */
function getErrorLogMessage(msgTxt) {
    Banana.console.debug("blink extension error:" + msgTxt);
}

function getErrorTexts(lang, txtParam) {
    switch (lang) {
        case "it":
            return getErrorTexts_it(txtParam);
        case "de":
            return getErrorTexts_de(txtParam);
        case "fr":
            return getErrorTexts_fr(txtParam);
        default:
            return getErrorTexts_en(txtParam);
    }
}


function getErrorTexts_it(txtParam) {
    let texts = {};
    texts.errBanCartella = "File .ac2 non valido";
    texts.ibanNotFound = "IBAN: " + txtParam + ", non trovato nella tabella dei conti";
    texts.invalidAccountingType = "Impossibile usare questa funzionalità con questa tipologia di file: " + txtParam;
    texts.noEntriesFound = "Non è stato trovato nessun movimento da importare";


    return texts;
}

function getErrorTexts_de(txtParam) {
    let texts = {};
    texts.errBanCartella = "Ungültige .ac2-Datei";
    texts.ibanNotFound = "IBAN: " + txtParam + ", nicht in der Kontentabelle gefunden";
    texts.invalidAccountingType = "Diese Funktion kann mit diesem Dateityp nicht verwendet werden: " + txtParam;
    texts.noEntriesFound = "Es wurden keine Buchungen zum Importieren gefunden";



    return texts;
}

function getErrorTexts_fr(txtParam) {
    let texts = {};
    texts.errBanCartella = "Fichier .ac2 non valide";
    texts.ibanNotFound = "IBAN: " + txtParam + ", introuvable dans la table des comptes";
    texts.invalidAccountingType = "Il n’est pas possible d’utiliser cette fonctionnalité avec ce type de fichier : " + txtParam;
    texts.noEntriesFound = "Aucun mouvement à importer n’a été trouvé";



    return texts;
}

function getErrorTexts_en(txtParam) {
    let texts = {};
    texts.errBanCartella = "Invalid .ac2 file";
    texts.ibanNotFound = "IBAN: " + txtParam + ", not found in the Accounts table";
    texts.invalidAccountingType = "It is not possible to use this feature with this type of file: " + txtParam;
    texts.noEntriesFound = "No entries were found to import";


    return texts;
}

function getLang(banDoc) {
    if (!banDoc) {
        // Uses application language
        let appLangCode = Banana.application.locale;
        return appLangCode.split("_")[0];
    } else {
        return banDoc.locale;
    }
}