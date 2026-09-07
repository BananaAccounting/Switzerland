// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.switzerland.camtxmlvalidator
// @api = 1.0
// @pubdate = 2026-02-16
// @publisher = Banana.ch SA
// @description = CAMT XML Validator with XSD Schema
// @description.en = CAMT XML Validator with XSD Schema
// @description.it = Validatore CAMT XML con schema XSD
// @description.fr = Validateur CAMT XML avec schéma XSD
// @description.de = CAMT XML Validierer mit XSD Schema
// @task = app.command
// @doctype = nodocument
// @docproperties =
// @timeout = -1



/**
 * Main function
 */
function exec(inData) {

    // Set the texts
    let texts = loadTexts();

    // Reads the selected CAMT file
    let xmlData = readFile();
    if (xmlData.length <= 0) {
        return;
    }

    var inj = injectSchemaLocation(xmlData);
    xmlData = inj.xmlData;

    var xmlObject = Banana.Xml.parse(xmlData);
    if (!xmlObject) {
        Banana.Ui.showInformation("XML error", Banana.Xml.errorString);
        return;
    }

    var validDocument = Banana.Xml.validate(xmlObject, inj.schemaFile);
    if (validDocument) {
        Banana.Ui.showInformation(texts.informationTitle, texts.informationResultsValid + " " + inj.schemaFile);
    } else {
        if (inj.schemaFile.length <= 0) {
            Banana.Ui.showInformation(texts.informationTitle,
                texts.errorSchemaMissing );
        }
        else {
            Banana.Ui.showInformation(texts.informationTitle,
                texts.informationResultsNotValid + " " + inj.schemaFile + "\n\n" +
                texts.errorDetails + ":\n" + Banana.Xml.errorString
            );
        }
    }

}

function injectSchemaLocation(xmlData) {

    // Adds the schemaLocation if it is missing in the selected CAMT file
    // Manually appends ".xsd" to the selected schemaFileName because schemalocation expects the complete XSD file name

    // Get schemaLocation from namespace xmlns
    var schemaFile = "";
    var schemaName = "";

    if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.052.001.04") >= 0) {
        schemaName = "camt.052.001.04";
    }
    else if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.052.001.08") >= 0) {
        schemaName = "camt.052.001.08";
    }
    else if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.053.001.04") >= 0) {
        schemaName = "camt.053.001.04";
    }
    else if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.053.001.08") >= 0) {
        schemaName = "camt.053.001.08";
    }
    else if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.054.001.04") >= 0) {
        schemaName = "camt.054.001.04";
    }
    else if (xmlData.indexOf("urn:iso:std:iso:20022:tech:xsd:camt.054.001.08") >= 0) {
        schemaName = "camt.054.001.08";
    }

    var schemaUrn = 'urn:iso:std:iso:20022:tech:xsd:' + schemaName;
    if (schemaName.length > 0) {
        schemaFile = schemaName + '.xsd';
    }

    /*
    <Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08" xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08 camt.053.001.08.xsd" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    */
    // 1) Ensures xmlns:xsi
    if (xmlData.indexOf('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"') < 0) {
        // Insert xmlns:xsi on Document tag (right after "<Document")
        xmlData = xmlData.replace(
            /<Document\b/,
            '<Document xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        );
    }

    // 2) Ensures xsi:schemaLocation
    if (xmlData.indexOf('xsi:schemaLocation=') < 0) {
        // Insert schemaLocation inside the opening tag of Document
        xmlData = xmlData.replace(
            /<Document\b([^>]*)>/,
            '<Document$1 xsi:schemaLocation="' + schemaUrn + ' ' + schemaFile + '">'
        );
    }

    return { xmlData: xmlData, schemaFile: schemaFile };
}


/**
 * Function that lets user select a CAMT XML file and read it
 */
function readFile() {
    let fileName = Banana.IO.getOpenFileName("Select open file", "", "XML file (*.xml);;All files (*)")
    if (fileName.length) {
        let file = Banana.IO.getLocalFile(fileName)
        // file.codecName = "latin1";  // Default is UTF-8
        let fileContent = file.read();
        if (!file.errorString) {
            // Banana.IO.openPath(fileContent);
            return fileContent;
        } else {
            Banana.Ui.showInformation("Read error", file.errorString);
        }
    } else {
        Banana.Ui.showInformation("Info", "no file selected");
    }
    return "";
}

/**
 * Function that loads all the texts
 */
function loadTexts() {
    let texts = {};
    let lang = "en";
    let appLanguage = Banana.application.locale;

    if (appLanguage && appLanguage.length > 2) {
        lang = appLanguage.substr(0, 2);
    }

    if (lang === "de") {
        texts.informationTitle = "Validierungsergebnis";
        texts.informationResultsValid = "Das XML-Dokument ist gültig im Vergleich zu";
        texts.informationResultsNotValid = "Das XML-Dokument ist nicht gültig im Vergleich zu";
        texts.errorDetails = "Fehlerdetails";
        texts.errorSchemaMissing = "Das XML-Schema fehlt oder wird nicht unterstützt.";
    }
    else if (lang === "fr") {
        texts.informationTitle = "Résultat de la validation";
        texts.informationResultsValid = "Le document XML est valide par rapport à";
        texts.informationResultsNotValid = "Le document XML n'est pas valide par rapport à";
        texts.errorDetails = "Détails de l'erreur";
        texts.errorSchemaMissing = "Le schéma XML est manquant ou n’est pas pris en charge.";
    }
    else if (lang === "it") {
        texts.informationTitle = "Risultato della validazione";
        texts.informationResultsValid = "Il documento XML è valido rispetto a";
        texts.informationResultsNotValid = "Il documento XML non è valido rispetto a";
        texts.errorDetails = "Dettagli dell'errore";
        texts.errorSchemaMissing = "Lo schema XML è mancante o non supportato.";
    }
    else {
        texts.informationTitle = "Validation result";
        texts.informationResultsValid = "XML document is valid against";
        texts.informationResultsNotValid = "XML document is not valid against";
        texts.errorDetails = "Error details";
        texts.errorSchemaMissing = "The XML schema is missing or not supported.";
    }
    return texts;
}
