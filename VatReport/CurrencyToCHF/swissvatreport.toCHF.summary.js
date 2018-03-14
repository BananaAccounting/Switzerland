// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.addon.swissvatreport.toCHF.summary
// @api = 1.0
// @pubdate = 2018-03-09
// @publisher = Banana.ch SA
// @description = Swiss VAT Report Summary currency to CHF (Beta)
// @task = app.command
// @doctype = 100.130.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1



/* 
    SUMMARY
    -------
    The scripts takes the journal of all the VAT transactions, converts the values in base currency of VatTaxable,
    VatPosted, VatAmount and amount to CHF currency and creates the summary for the "swiss vat report => effective method".
    We use the form to store all the data (descriptions depends of the basic language of banana).
**/



var form = [];
var param = {};

function loadParam(banDoc, startDate, endDate) {
    param = {
        "reportName" : "Swiss VAT Report Summary currency to CHF (Beta)",
        "bananaVersion" : "Banana Accounting 8",
        "scriptVersion" : "script v. 2018-03-09",
        "startDate" : startDate,
        "endDate" : endDate,
        "company" : Banana.document.info("AccountingDataBase","Company"),
        "pageCounterText" : "Page",
        "grColumn" : "Gr1",
        "rounding" : 2
    };
}

function loadForm() {

    // I.
    form.push({"id":"200", "gr":"200", "vatClass":"2", "description":""});
    form.push({"id":"205", "gr":"205", "vatClass":"2", "description":""}); 
    form.push({"id":"220", "gr":"220", "vatClass":"2", "description":""}); 
    form.push({"id":"221", "gr":"221", "vatClass":"2", "description":""}); 
    form.push({"id":"225", "gr":"225", "vatClass":"2", "description":""}); 
    form.push({"id":"230", "gr":"230", "vatClass":"2", "description":""}); 
    form.push({"id":"235", "gr":"235", "vatClass":"2", "description":""}); 
    form.push({"id":"280", "gr":"280", "vatClass":"2", "description":""}); 
    form.push({"id":"289", "description":"", "sum":"220;221;225;230;235;280"});
    form.push({"id":"299", "description":"", "sum":"200;-289"}); 
    
    // II.
    form.push({"id":"301.1", "gr":"301", "vatClass":"2", "description":""}); 
    form.push({"id":"301.2", "gr":"301", "vatClass":"4", "description":""}); 
    form.push({"id":"311.1", "gr":"311", "vatClass":"2", "description":""}); 
    form.push({"id":"311.2", "gr":"311", "vatClass":"4", "description":""});
    form.push({"id":"341.1", "gr":"341", "vatClass":"2", "description":""});
    form.push({"id":"341.2", "gr":"341", "vatClass":"4", "description":""});
    form.push({"id":"381.1", "gr":"381", "vatClass":"2", "description":""});
    form.push({"id":"381.2", "gr":"381", "vatClass":"4", "description":""});
    form.push({"id":"399", "description":"", "sum":"301.2;311.2;341.2;381.2"});

    form.push({"id":"400", "gr":"400", "vatClass":"3", "description":""}); 
    form.push({"id":"405", "gr":"405", "vatClass":"3", "description":""}); 
    form.push({"id":"410", "gr":"410", "vatClass":"3", "description":""}); 
    form.push({"id":"415", "gr":"415", "vatClass":"3", "description":""}); 
    form.push({"id":"420", "gr":"420", "vatClass":"3", "description":""}); 
    form.push({"id":"479", "description":"", "sum":"400;405;410;415;420"});
    
    form.push({"id":"500", "description":"", "sum":""});
    form.push({"id":"510", "description":"", "sum":""});
    
    // III.
    form.push({"id":"900", "gr":"900", "vatClass":"4", "description":""}); 
    form.push({"id":"910", "gr":"910", "vatClass":"4", "description":""});
}


function loadDescriptions() {
    var lan = Banana.document.info("Base","Language");

    if (lan === "ita") {
        param.title = "Dichiarazione IVA";
        getFormObjectById(form,"200").description = "Totale delle controprestazioni convenute o ricevute (art. 39), incluse quelle inerenti a trasferimenti mediante procedura di notifica e a prestazioni all'estero";
        getFormObjectById(form,"205").description = "Controprestazioni contenute nella cifra 200 conseguite con prestazioni non imponibili (art. 21) per la cui imposizione si è optato in virtù dell'art. 22";
        getFormObjectById(form,"220").description = "Prestazioni esenti dall'imposta (p. es. esportazioni; art. 23), prestazioni esenti a beneficiari istituzionali e persone beneficiarie (art. 107 cpv. 1 lett. a)";
        getFormObjectById(form,"221").description = "Prestazioni all'estero";
        getFormObjectById(form,"225").description = "Trasferimenti mediante procedura di notifica (art. 38; vogliate p.f. inoltrare anche il modulo n. 764)";
        getFormObjectById(form,"230").description = "Prestazioni non imponibili (art. 21) per la cui imposizione non si è optato in virtù dell'art. 22";
        getFormObjectById(form,"235").description = "Diminuzioni della controprestazione";
        getFormObjectById(form,"280").description = "Diversi .................................................";
        getFormObjectById(form,"289").description = "Totale cifre 220-280";
        getFormObjectById(form,"299").description = "Cifra d'affari imponibile complessiva (cifra 200, dedotta la cifra 289)";
        getFormObjectById(form,"301.1").description = "Normale";
        getFormObjectById(form,"301.2").description = "Normale";
        getFormObjectById(form,"311.1").description = "Ridotta";
        getFormObjectById(form,"311.2").description = "Ridotta";
        getFormObjectById(form,"341.1").description = "Speciale per l'alloggio";
        getFormObjectById(form,"341.2").description = "Speciale per l'alloggio";
        getFormObjectById(form,"381.1").description = "Imposta sull'acquisto";
        getFormObjectById(form,"381.2").description = "Imposta sull'acquisto";
        getFormObjectById(form,"399").description = "Totale dell'imposta dovuta (cifre 301-381)";
        getFormObjectById(form,"400").description = "Imposta precedente su costi del materiale e prestazioni di servizi";
        getFormObjectById(form,"405").description = "Imposta precedente su investimenti e altri costi d'esercizio";
        getFormObjectById(form,"410").description = "Sgravio fiscale successivo (art. 32; vogliate p.f. allegare una distinta dettagliata)";
        getFormObjectById(form,"415").description = "Correzioni dell'imposta precedente: doppia utilizzazione (art. 30), consumo proprio (art. 31)";
        getFormObjectById(form,"420").description = "Riduzioni della deduzione dell'imposta precedente: non controprestazioni come sussidi, tasse di soggiorno ecc. (art. 33 cpv. 2)";
        getFormObjectById(form,"479").description = "Totale cifra 400-420";
        getFormObjectById(form,"500").description = "Importo da versare all'Amministrazione federale delle contribuzioni";
        getFormObjectById(form,"510").description = "Credito del contribuente";
        getFormObjectById(form,"900").description = "Sussidi, tasse di soggiorno e simili, contributi per lo smaltimento dei rifiuti e le aziende fornitrici d'acqua (lett. a-c)";
        getFormObjectById(form,"910").description = "Doni, dividendi, risarcimenti dei danni ecc. (lett. d-l)";
    }
    else if (lan === "fra") {
        param.title = "Déclaration TVA";
        getFormObjectById(form,"200").description = "Total des contre-prestations convenues ou reçues (art. 39), y c. celles provenant de transferts avec la procédure de déclaration et de prestations fournies à l'étranger";
        getFormObjectById(form,"205").description = "Contre-prestations contenues au ch. 200 provenant de prestations non imposables (art. 21) pour lesquelles il a été opté en vertu de l'art. 22";
        getFormObjectById(form,"220").description = "Prestations exonérées (p. ex. exportations, art. 23), prestations exonérées fournies à des institutions et à des personnes bénéficiaires (art. 107)";
        getFormObjectById(form,"221").description = "Prestations fournies à l'étranger";
        getFormObjectById(form,"225").description = "Transferts avec la procédure de déclaration (art. 38, veuillez, s.v.p., joindre le formulaire N° 764)";
        getFormObjectById(form,"230").description = "Prestations non imposables (art. 21) pour lesquelles il n'a pas été opté selon l'art. 22";
        getFormObjectById(form,"235").description = "Diminutions de la contre-prestation";
        getFormObjectById(form,"280").description = "Divers .................................................";
        getFormObjectById(form,"289").description = "Total ch. 220 à 280";
        getFormObjectById(form,"299").description = "Total du chiffre d'affaires imposable (ch. 200 moins ch. 289)";
        getFormObjectById(form,"301.1").description = "Normal";
        getFormObjectById(form,"301.2").description = "Normal";
        getFormObjectById(form,"311.1").description = "Réduit";
        getFormObjectById(form,"311.2").description = "Réduit";
        getFormObjectById(form,"341.1").description = "Spécial pour l'hébergement";
        getFormObjectById(form,"341.2").description = "Spécial pour l'hébergement";
        getFormObjectById(form,"381.1").description = "Impôt sur les acquisitions";
        getFormObjectById(form,"381.2").description = "Impôt sur les acquisitions";
        getFormObjectById(form,"399").description = "Total de l'impôt dû (ch. 300 à 381)";
        getFormObjectById(form,"400").description = "Impôt préalable grevant les coûts en matériel et en prestations de services";
        getFormObjectById(form,"405").description = "Impôt préalable grevant les investissements et autres charges d'exploitation";
        getFormObjectById(form,"410").description = "Dégrèvement ultérieur de l'impôt préalable (art. 32, veuillez, s.v.p., joindre un relevé détaillé)";
        getFormObjectById(form,"415").description = "Corrections de l'impôt préalable: double affectation (art. 30), prestations à soi-même (art. 31)";
        getFormObjectById(form,"420").description = "Réductions de la déduction de l'impôt préalable: prestations n'étant pas considérées comme des contre-prestations, comme subventions, taxes de séjour, etc. (art. 33, al. 2)";
        getFormObjectById(form,"479").description = "Total ch. 400 à 420";
        getFormObjectById(form,"500").description = "Montant à payer à l'Administration fédérale des contributions";
        getFormObjectById(form,"510").description = "Solde en faveur de l'assujetti";
        getFormObjectById(form,"900").description = "Subventions, taxes de séjour et similaires, contributions versées aux établissements chargés de l'élimination des déchets et de l'approvisionnement en eau (let. a à c)";
        getFormObjectById(form,"910").description = "Les dons, les dividendes, les dédommagements, etc. (let. d à l)";
    }
    else { //lan=deu or lan=enu
        param.title = "MWST-Abrechnung";
        getFormObjectById(form,"200").description = "Total der vereinbarten bzw. vereinnahmten Entgelte (Art. 39), inkl. Entgelte aus Übertragungen im Meldeverfahren sowie aus Leistungen im Ausland";
        getFormObjectById(form,"205").description = "In Ziffer 200 enthaltene Entgelte aus nicht steuerbaren Leistungen (Art. 21), für welche nach Art. 22 optiert wird";
        getFormObjectById(form,"220").description = "Von der Steuer befreite Leistungen (u.a. Exporte, Art. 23), von der Steuer befreite Leistungen an begünstigte Einrichtungen und Personen (Art. 107)";
        getFormObjectById(form,"221").description = "Leistungen im Ausland";
        getFormObjectById(form,"225").description = "Übertragung im Meldeverfahren (Art. 38, bitte zusätzlich Form. 764 einreichen)";
        getFormObjectById(form,"230").description = "Nicht steuerbare Leistungen (Art. 21), für die nicht nach Art. 22 optiert wird";
        getFormObjectById(form,"235").description = "Entgeltsminderungen";
        getFormObjectById(form,"280").description = "Diverses .................................................";
        getFormObjectById(form,"289").description = "Total Ziff. 220 bis 280";
        getFormObjectById(form,"299").description = "Steuerbarer Gesamtumsatz (Ziff. 200 abzüglich Ziff. 289)";
        getFormObjectById(form,"301.1").description = "Normal";
        getFormObjectById(form,"301.2").description = "Normal";
        getFormObjectById(form,"311.1").description = "Reduziert";
        getFormObjectById(form,"311.2").description = "Reduziert";
        getFormObjectById(form,"341.1").description = "Beherbergung";
        getFormObjectById(form,"341.2").description = "Beherbergung";
        getFormObjectById(form,"381.1").description = "Bezugsteuer";
        getFormObjectById(form,"381.2").description = "Bezugsteuer";
        getFormObjectById(form,"399").description = "Total geschuldete Steuer (Ziff. 300 bis 381)";
        getFormObjectById(form,"400").description = "Vorsteuer auf Material- und Dienstleistungsaufwand";
        getFormObjectById(form,"405").description = "Vorsteuer auf Investitionen und übrigem Betriebsaufwand";
        getFormObjectById(form,"410").description = "Einlageentsteuerung (Art. 32, bitte detaillierte Aufstellung beilegen)";
        getFormObjectById(form,"415").description = "Vorsteuerkorrekturen: gemischte Verwendung (Art. 30), Eigenverbrauch (Art. 31)";
        getFormObjectById(form,"420").description = "Vorsteuerkürzungen: Nicht-Entgelte wie Subventionen, Kurtaxen usw. (Art. 33 Abs. 2)";
        getFormObjectById(form,"479").description = "Total Ziff. 400 bis 420";
        getFormObjectById(form,"500").description = "An die Eidg. Steuerverwaltung zu bezahlender Betrag";
        getFormObjectById(form,"510").description = "Guthaben der steuerpflichtigen Person";
        getFormObjectById(form,"900").description = "Subventionen, Kurtaxen u.Ä., Entsorgungs- und Wasserwerkbeiträge (Bst. a-c)";
        getFormObjectById(form,"910").description = "Spenden, Dividenden, Schadenersatz usw. (Bst. d-l)";
    }
}



/* Main function */
function exec() {

    //Check if we are on an opened document
    if (!Banana.document) {
        return;
    }

    //Retrieve the period
    var dateform = getPeriodSettings();

    if (dateform) {

        //Create the report
        var report = createVatReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate);
        
        //Add styles and print the report
        var stylesheet = createStyleSheet();
        Banana.Report.preview(report, stylesheet);
    } else {
        return;
    }
}




function postProcess(banDoc) {
    /* Eventually some operations that has to be done before formatting the values */

    var tot399 = getFormValueById(form, "399", "amount");
    var tot479 = getFormValueById(form, "479", "amount");
    var totDiff = Banana.SDecimal.subtract(tot399, tot479);

    if (Banana.SDecimal.sign(totDiff) > 0) {
        getFormObjectById(form,"500").amount = totDiff;
        getFormObjectById(form,"510").amount = 0;
    } else if (Banana.SDecimal.sign(totDiff) < 0) {
        getFormObjectById(form,"500").amount = 0;
        getFormObjectById(form,"510").amount = Banana.SDecimal.invert(totDiff);
    }
}



/* Function that creates and prints the report */
function createVatReport(banDoc, startDate, endDate) {

    /* 1) Load parameters and form */
    loadParam(banDoc, startDate, endDate);
    loadForm();
    loadDescriptions();

    //Function call to get the journal and convert all the needed values from base currency to CHF
    var transactions = getJournal();

    /* 2) Extract data from journal and calculate balances */
    loadBalances(transactions);
    
    /* 3) Calculate totals */
    calcFormTotals(["amount"]);
    
    /* 4) Do some operations before converting values */
    postProcess(banDoc);
    
    /* 5) Convert all specified values */
    formatValues(["amount"]);


    //--------------------------------------------------------------------------------------------------------------//
    //  6) Print the report
    //--------------------------------------------------------------------------------------------------------------//

    // Create the report
    var report = Banana.Report.newReport(param.reportName);

    // Create a table
    var table = report.addTable("table");
    
    tableRow = table.addRow();
    tableRow.addCell("Gr1", "headerStyle", 1);
    tableRow.addCell("Description", "headerStyle", 1);
    tableRow.addCell("vatTaxableCHF", "headerStyle", 1);
    tableRow.addCell("vatPostedCHF", "headerStyle", 1);


    /********** 
        I.
    **********/
    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "200", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "200", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "200", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);
    
    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "205", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "205", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "205", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "220", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "220", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "220", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "221", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "221", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "221", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "225", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "225", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "225", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "230", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "230", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "230", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "235", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "235", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "235", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "280", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "280", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "280", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "289", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "289", "description"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "289", "amount_formatted"), "right bold", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "299", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "299", "description"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "299", "amount_formatted"), "right bold", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);


    /**********
        II.
    **********/
    tableRow = table.addRow();
    tableRow.addCell("301", "", 1);
    tableRow.addCell(getFormValueById(form, "301.1", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "301.1", "amount_formatted"), "right", 1);
    tableRow.addCell(getFormValueById(form, "301.2", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell("311", "", 1);
    tableRow.addCell(getFormValueById(form, "311.1", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "311.1", "amount_formatted"), "right", 1);
    tableRow.addCell(getFormValueById(form, "311.2", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell("341", "", 1);
    tableRow.addCell(getFormValueById(form, "341.1", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "341.1", "amount_formatted"), "right", 1);
    tableRow.addCell(getFormValueById(form, "341.2", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell("381", "", 1);
    tableRow.addCell(getFormValueById(form, "381.1", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "381.1", "amount_formatted"), "right", 1);
    tableRow.addCell(getFormValueById(form, "381.2", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "399", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "399", "description"), "bold", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "399", "amount_formatted"), "right bold", 1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "400", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "400", "description"), "", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "400", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "405", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "405", "description"), "", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "405", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "410", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "410", "description"), "", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "410", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "415", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "415", "description"), "", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "415", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "420", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "420", "description"), "", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "420", "amount_formatted"), "right", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "479", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "479", "description"), "bold", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(getFormValueById(form, "479", "amount_formatted"), "right bold", 1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "500", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "500", "description"), "bold", 1);
    tableRow.addCell("","", 1);
    tableRow.addCell(getFormValueById(form, "500", "amount_formatted"),"right bold",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "510", "id"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "510", "description"), "bold", 1);
    tableRow.addCell(getFormValueById(form, "510", "amount_formatted"), "right bold", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    

    /**********
        III.
    **********/
    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "900", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "900", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "900", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(getFormValueById(form, "910", "id"), "", 1);
    tableRow.addCell(getFormValueById(form, "910", "description"), "", 1);
    tableRow.addCell(getFormValueById(form, "910", "amount_formatted"), "right", 1);
    tableRow.addCell("","",1);



    //Add Header and footer
    addHeader(report);
    addFooter(report, param);

    return report;
}


/* Function that returns the lines from the journal and converts some values from base currency to CHF */
function getJournal() {

    var journal = Banana.document.journal(Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
    var len = journal.rowCount;
    var transactions = []; //Array that will contain all the lines of the transactions
    var requiredVersion = "9.0.0";
    
    for (var i = 0; i < len; i++) {

        var line = {};        
        var tRow = journal.row(i);

        if (tRow.value("JDate") >= param.startDate && tRow.value("JDate") <= param.endDate) {

            line.date = tRow.value("JDate");
            line.account = tRow.value("JAccount");
            line.vatcode = tRow.value("JVatCodeWithoutSign");
            line.vattaxable = tRow.value("JVatTaxable");
            line.vatamount = tRow.value("VatAmount");
            line.vatposted = tRow.value("VatPosted");
            line.amount = tRow.value("JAmount");

            if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
                //Return Object with properties 'date' and 'exchangeRate'
                line.exchangerate = Banana.document.exchangeRate("CHF", line.date).exchangeRate;
            } else {
                //Return value
                line.exchangerate = Banana.document.exchangeRate("CHF", line.date);
            }
        
            line.doc = tRow.value("Doc");
            line.description = tRow.value("Description");
            line.isvatoperation = tRow.value("JVatIsVatOperation");

            //We take only the rows with a VAT code and then we convert values from base currency to CHF
            if (line.isvatoperation) {

                line.vattaxableCHF = convertBaseCurrencyToCHF(line.vattaxable, line.exchangerate);
                line.vatamountCHF = convertBaseCurrencyToCHF(line.vatamount, line.exchangerate);
                line.vatpostedCHF = convertBaseCurrencyToCHF(line.vatposted, line.exchangerate);
                line.amountCHF = convertBaseCurrencyToCHF(line.amount, line.exchangerate);

                transactions.push(line);
            }
        }
    }
    return transactions;
}


/* Function for Euro to CHF conversion */
function convertBaseCurrencyToCHF(valeToConvert, exchangerate) {

    return Banana.SDecimal.divide(valeToConvert,exchangerate, {'decimals':param.rounding});
}


/* The purpose of this function is to load all the balances and save the values into the form */
function loadBalances(transactions) {

    for (var i in form) {

        if (form[i].id) {
            form[i].id = form[i].id.trim();
        }
        if (form[i].gr) {
            form[i].gr = form[i].gr.trim();
        }

        //Load VAT balances
        if (form[i]["vatClass"]) {
            form[i]["vatClass"] = form[i]["vatClass"].trim();
            if (form[i]["gr"]) {
                form[i]["amount"] = getGrBalances_Vat(transactions, form[i]["gr"], form[i]["vatClass"], param["grColumn"], param["startDate"], param["endDate"]);
            }
        }
    }
}


/* This function sums the vat amounts for the specified vat code and period retrieved from transactions (converted journal's lines)
   Returns an object containing {vatTaxable, vatPosted, vatTaxableCHF, vatPostedCHF} */
function vatCurrentBalance(transactions, grCodes, startDate, endDate) {

    var sDate = Banana.Converter.toDate(startDate);
    var eDate = Banana.Converter.toDate(endDate);

    var vattaxable = "";
    var vatposted = "";
    var vattaxableCHF = "";
    var vatpostedCHF = "";
    var currentBal = {};

    for (var j = 0; j < grCodes.length; j++) {
        for (var i = 0; i < transactions.length; i++) {
            
            var tDate = Banana.Converter.toDate(transactions[i].date);

            if (tDate >= sDate && tDate <= eDate) {

                if (grCodes[j] === transactions[i].vatcode) {

                    vattaxable = Banana.SDecimal.add(vattaxable, transactions[i].vattaxable);
                    vatposted = Banana.SDecimal.add(vatposted, transactions[i].vatposted);
                    vattaxableCHF = Banana.SDecimal.add(vattaxableCHF, transactions[i].vattaxableCHF);
                    vatpostedCHF = Banana.SDecimal.add(vatpostedCHF, transactions[i].vatpostedCHF);

                    currentBal.vatTaxable = vattaxable;
                    currentBal.vatPosted = vatposted;
                    currentBal.vatTaxableCHF = vattaxableCHF;
                    currentBal.vatPostedCHF = vatpostedCHF;
                }
            }
        }
    }
    return currentBal;
}


/* The purpose of this function is to calculate all the VAT balances of the accounts belonging to the same group (grText) */
function getGrBalances_Vat(transactions, grText, vatClass, grColumn, startDate, endDate) {
    
    var grCodes = getColumnListForGr(Banana.document.table("VatCodes"), grText, "VatCode", grColumn);
    //grCodes = grCodes.join("|");

    //Sum the vat amounts for the specified vat code and period
    var currentBal = vatCurrentBalance(transactions, grCodes, startDate, endDate);

    //The "vatClass" decides which value to use
    if (vatClass == "1") {
        return Banana.Converter.toInternalNumberFormat(currentBal.vatTaxableCHF);
    }
    else if (vatClass == "2") {
        return Banana.SDecimal.invert(currentBal.vatTaxableCHF);
    }
    else if (vatClass == "3") {
        return Banana.Converter.toInternalNumberFormat(currentBal.vatPostedCHF);
    }
    else if (vatClass == "4") {
        return Banana.SDecimal.invert(currentBal.vatPostedCHF);
    }
}


/* The main purpose of this function is to create an array with all the values of a given column of the table (codeColumn) belonging to the same group (grText) */
function getColumnListForGr(table, grText, codeColumn, grColumn) {

    if (table === undefined || !table) {
        return str;
    }

    if (!grColumn) {
        grColumn = "Gr1";
    }

    var str = [];

    //Loop to take the values of each rows of the table
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var grRow = tRow.value(grColumn);

        //If Gr1 column contains other characters (in this case ";") we know there are more values
        //We have to split them and take all values separately
        //If there are only alphanumeric characters in Gr1 column we know there is only one value
        var codeString = grRow;
        var arrCodeString = codeString.split(";");
        for (var j = 0; j < arrCodeString.length; j++) {
            var codeString1 = arrCodeString[j];
            if (codeString1 === grText) {
                str.push(tRow.value(codeColumn));
            }
        }
    }

    //Removing duplicates
    for (var i = 0; i < str.length; i++) {
        for (var x = i+1; x < str.length; x++) {
            if (str[x] === str[i]) {
                str.splice(x,1);
                --x;
            }
        }
    }

    //Return the array
    return str;
}


/* The purpose of this function is to convert all the values from the given list to local format */
function formatValues(fields) {
    for (i = 0; i < form.length; i++) {
        for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];  
            form[i][fieldName + "_formatted"] = Banana.Converter.toLocaleNumberFormat(form[i][fieldName]);
        }
    }
}


/* Calculate all totals of the form */
function calcFormTotals(fields) {
    for (var i = 0; i < form.length; i++) {
        calcTotal(form[i].id, fields);
    }
}


/* Calculate a total of the form */
function calcTotal(id, fields) {
    
    var valueObj = getFormObjectById(form, id);
    
    if (valueObj[fields[0]]) { //first field is present
        return; //calc already done, return
    }
    
    if (valueObj.sum) {
        var sumElements = valueObj.sum.split(";");  
        
        for (var k = 0; k < sumElements.length; k++) {
            var entry = sumElements[k].trim();
            if (entry.length <= 0) {
                return true;
            }
            
            var isNegative = false;
            if (entry.indexOf("-") >= 0) {
                isNegative = true;
                entry = entry.substring(1);
            }
            
            //Calulate recursively
            calcTotal(entry, fields);  
            
            for (var j = 0; j < fields.length; j++) {
                var fieldName = fields[j];
                var fieldValue = getFormValueById(form, entry, fieldName);
                if (fieldValue) {
                    if (isNegative) {
                        //Invert sign
                        fieldValue = Banana.SDecimal.invert(fieldValue);
                    }
                    valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue, {'decimals':param.rounding});
                }
            }
        }
    } else if (valueObj.gr) {
        //Already calculated in loadFormBalances()
    }
}


/* The purpose of this function is to return a specific field value from the object.
   When calling this function, it's necessary to speficy the form (the structure), the object ID, and the field (parameter) needed */
function getFormValueById(form, id, field) {
    var searchId = id.trim();
    for (var i = 0; i < form.length; i++) {
        if (form[i].id === searchId) {
            return form[i][field];
        }
    }
    Banana.document.addMessage("Couldn't find object with id:" + id);
}


/* This function is very similar to the getFormValueById() function.
   Instead of returning a specific field from an object, this function return the whole object */
function getFormObjectById(form, id) {
    for (var i = 0; i < form.length; i++) {
        if (form[i]["id"] === id) {
            return form[i];
        }
    }
    Banana.document.addMessage("Couldn't find object with id: " + id);
}


/* The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run
   Every time the user runs of the script he has the possibility to change the date of the accounting period */
function getPeriodSettings() {

    //Banana required version
    var requiredVersion = "9.0.0";

    //The formeters of the period that we need
    var scriptform = {
       "selectionStartDate": "",
       "selectionEndDate": "",
       "selectionChecked": "false"
    };

    //Read script settings
    var data = "";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        data = Banana.document.getScriptSettings();
    } else {
        data = Banana.document.scriptReadSettings();
    }
    
    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        try {
            var readSettings = JSON.parse(data);
            
            //We check if "readSettings" is not null, then we fill the formeters with the values just read
            if (readSettings) {
                scriptform = readSettings;
            }
        } catch (e){}
    }
    
    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod("Period", docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        var value = "";
        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
            value = Banana.document.setScriptSettings(formToString);
        } else {
            value = Banana.document.scriptSaveSettings(formToString);
        }
    } else {
        //User clicked cancel
        return;
    }
    return scriptform;
}


/* This function adds a Footer to the report */
function addFooter(report, param) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footer");
    report.getFooter().addText(d + " - " + param.pageCounterText + " ");
    report.getFooter().addFieldPageNr();
}


/* This function adds an Header to the report */
function addHeader(report) {
    var pageHeader = report.getHeader();
    pageHeader.addClass("header");
    if (param.company) {
        pageHeader.addParagraph(param.company, "heading");
    }
    pageHeader.addParagraph("VAT Report Summary currency to CHF", "heading");
    pageHeader.addParagraph(Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "");
    pageHeader.addParagraph(" ", "");
    pageHeader.addParagraph(" ", "");
}


/* Function that creates all the styles used to print the report */
function createStyleSheet() {
    var stylesheet = Banana.Report.newStyleSheet();
    
    stylesheet.addStyle("@page", "margin:10mm 5mm 10mm 5mm;") 
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:10pt");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".heading", "font-weight:bold; font-size:16pt; text-align:left");
    stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");

    /* VAT table */
    var tableStyle = stylesheet.addStyle("table");
    tableStyle.setAttribute("width", "100%");
    //stylesheet.addStyle("table.table td", "border:thin solid black");

    return stylesheet;
}


