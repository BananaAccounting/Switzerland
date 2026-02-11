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
// @id = ch.banana.switzerland.camtxmlvalidator
// @api = 1.0
// @pubdate = 2025-12-05
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

    // List of swiss CAMT schemas (04=old schemas, 08=new schemas)
    let schemaFileNames = [
        "camt.052.001.04",
        "camt.052.001.08",
        "camt.053.001.04",
        "camt.053.001.08",
        "camt.054.001.04",
        "camt.054.001.08"
    ];

    // Displays a combo box dialog prompting the user to select a CAMT XSD schema from a list
    let schemaFileName = Banana.Ui.getItem(texts.dialogTitle, texts.dialogText, schemaFileNames, 3, false);
    if (!schemaFileName) {
        return "@Cancel"; 
    }
    
    // Reads the selected CAMT file
    let xmlData = readFile();

    // Adds the schemaLocation if it is missing in the selected CAMT file
    // Manually appends ".xsd" to the selected schemaFileName because schemalocation expects the complete XSD file name
    if (xmlData.indexOf("xsi:schemaLocation") < 0) {
        xmlData = xmlData.replace('<Document', '<Document xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:'+ schemaFileName + " " + schemaFileName + '.xsd" ');
    }

    // Parses XML data and returns a Banana.Xml.XmlElement object representing the parsed XML
    let xmlObject = Banana.Xml.parse(xmlData);

    // Manually appends ".xsd" to the selected schemaFileName because Banana.Xml.validate expects the complete XSD file name
    schemaFileName = schemaFileName + ".xsd";

    // Checks the validation of the CAMT XML file against the XSD schema
    let validDocument = Banana.Xml.validate(xmlObject, schemaFileName);
    if (validDocument) {
        Banana.Ui.showInformation(texts.informationTitle, texts.informationResultsValid + " " + schemaFileName);
    } else {
        Banana.Ui.showInformation(texts.informationTitle, texts.informationResultsNotValid + " " + schemaFileName + "\n\n" + texts.errorDetails + ":\n" + Banana.Xml.errorString);
    }
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
        texts.dialogTitle = "CAMT Validierer";
        texts.dialogText = "Wählen Sie ein Schema";
        texts.informationTitle = "Validierungsergebnis";
        texts.informationResultsValid = "Das XML-Dokument ist gültig im Vergleich zu";
        texts.informationResultsNotValid = "Das XML-Dokument ist nicht gültig im Vergleich zu";
        texts.errorDetails = "Fehlerdetails";
    }
    else if (lang === "fr") {
        texts.dialogTitle = "Validateur CAMT";
        texts.dialogText = "Choisissez un schéma";
        texts.informationTitle = "Résultat de la validation";
        texts.informationResultsValid = "Le document XML est valide par rapport à";
        texts.informationResultsNotValid = "Le document XML n'est pas valide par rapport à";
        texts.errorDetails = "Détails de l'erreur";
    }
    else if (lang === "it") {
        texts.dialogTitle = "Validatore CAMT";
        texts.dialogText = "Scegli uno schema";
        texts.informationTitle = "Risultato della validazione";
        texts.informationResultsValid = "Il documento XML è valido rispetto a";
        texts.informationResultsNotValid = "Il documento XML non è valido rispetto a";
        texts.errorDetails = "Dettagli dell'errore";
    }
    else {
        texts.dialogTitle = "CAMT Validator";
        texts.dialogText = "Choose a schema";
        texts.informationTitle = "Validation result";
        texts.informationResultsValid = "XML document is valid against";
        texts.informationResultsNotValid = "XML document is not valid againts";
        texts.errorDetails = "Error details";
    }
    return texts;
}
