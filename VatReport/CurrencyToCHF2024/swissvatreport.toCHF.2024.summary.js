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
//
// @id = ch.banana.ch.app.swissvatreport.toCHF.2024.summary
// @api = 1.0
// @pubdate = 2024-04-09
// @publisher = Banana.ch SA
// @description = Swiss VAT Report since 2024, Summary currency to CHF (Beta)
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


var param = {};

function loadParam(banDoc, startDate, endDate) {
    param = {
        "reportName" : "Swiss VAT Report "+ Banana.Converter.toDate(startDate).getFullYear() +", Summary currency to CHF (Beta)",
        "bananaVersion" : "Banana Accounting Plus",
        "scriptVersion" : "script v. 2024-04-09",
        "startDate" : startDate,
        "endDate" : endDate,
        "year": Banana.Converter.toDate(startDate).getFullYear(),
        "company" : banDoc.info("AccountingDataBase","Company"),
        "grColumn" : "Gr1",
        "rounding" : 2
    };
}

function loadDescriptions(banDoc) {
    var lan = banDoc.info("Base","Language");

    if (lan === "ita") {
        param.title = "Dichiarazione IVA";
        param.description1 = "Totale delle controprestazioni convenute o ricevute, incluse quelle inerenti a prestazioni optate, a trasferimenti mediante procedura di notifica e a prestazioni all'estero (cifra d'affari mondiale)";
        param.description2 = "Controprestazioni contenute nella cifra 200 conseguite con prestazioni escluse dall'imposta (art. 21) per la cui imposizione si è optato in virtù dell'art. 22";
        param.description3 = "Prestazioni esenti dall’imposta (p. es. esportazioni; art. 23), prestazioni esenti a beneficiari istituzionali e persone beneficiarie (art. 107 cpv. 1 lett. a)";
        param.description4 = "Prestazioni all'estero (luogo della prestazione all'estero)";
        param.description5 = "Trasferimenti mediante procedura di notifica (art. 38; vogliate p.f. inoltrare anche il modulo n. 764)";
        param.description6 = "Prestazioni escluse dall'imposta (art. 21) effettuate in territorio svizzero per la cui imposizione non si è optato in virtù dell’art. 22";
        param.description7 = "Diminuzioni della controprestazione quali sconti, ribassi, ecc.";
        param.description8 = "Diversi (ad.es. valore del terreno, prezzo d'acquisto in caso d'imposizione dei margini)";
        param.description9 = "Totale cifre 220-280";
        param.description10 = "Cifra d'affari imponibile complessiva (cifra 200, dedotta la cifra 289)";
        param.description11 = "Normale";
        param.description12 = "Ridotta";
        param.description13 = "Speciale per l'alloggio";
        param.description14 = "Imposta sull'acquisto";
        param.description15 = "Totale dell'imposta dovuta (cifre 303-383)";
        param.description16 = "Imposta precedente su costi del materiale e prestazioni di servizi";
        param.description17 = "Imposta precedente su investimenti e altri costi d'esercizio";
        param.description18 = "Sgravio fiscale successivo (art. 32; vogliate p.f. allegare una distinta dettagliata)";
        param.description19 = "Correzioni dell'imposta precedente: doppia utilizzazione (art. 30), consumo proprio (art. 31)";
        param.description20 = "Riduzioni della deduzione dell'imposta precedente: non controprestazioni come sussidi, tasse turistiche (art. 33 cpv. 2)";
        param.description21 = "Totale cifre 400-420";
        param.description22 = "Importo da versare";
        param.description23 = "Credito del contribuente";
        param.description24 = "Sussidi, tasse turistiche incassate da uffici turistici, contributi per lo smaltimento dei rifiuti e le aziende fornitrici d’acqua (lett. a-c)";
        param.description25 = "Doni, dividendi, risarcimenti dei danni ecc. (lett. d-l)";
    }
    else if (lan === "fra") {
        param.title = "Déclaration TVA";
        param.description1 = "Total des contre-prestations convenues ou reçues, y c. de prestations imposées par option, de transferts par procédure de déclaration, de prestations à l’étranger (ch. d’affaires mondial)";
        param.description2 = "Contre-prestations déclarées sous ch. 200 qui proviennent de prestations exclues du champ de l’impôt (art. 21) pour lesquelles il a été opté en vertu de l’art. 22";
        param.description3 = "Prestations exonérées (p. ex. exportations, art. 23), prestations exonérées fournies à des institutions et à des personnes bénéficiaires (art. 107, al. 1, let. a)";
        param.description4 = "Prestations fournies à l’étranger (lieu de la prestation à l’étranger)";
        param.description5 = "Transferts avec la procédure de déclaration (art. 38, veuillez, s.v.p., joindre le formulaire n° 764)";
        param.description6 = "Prestations exclues du champ de l’impôt (art. 21) fournies sur le territoire suisse pour lesquelles il n’a pas été opté selon l’art. 22";
        param.description7 = "Diminutions de la contre-prestation telles que rabais, escomptes, etc.";
        param.description8 = "Divers (p.ex. valeur du terrain, prix d’achat en cas d’imposition de la marge)";
        param.description9 = "Total ch. 220 à 280";
        param.description10 = "Total du chiffre d’affaires imposable (ch. 200 moins ch. 289)";
        param.description11 = "Normal";
        param.description12 = "Réduit";
        param.description13 = "Spécial pour l'hébergement";
        param.description14 = "Impôt sur les acquisitions";
        param.description15 = "Total de l'impôt dû (ch. 303 à 383)";
        param.description16 = "Impôt préalable grevant les coûts en matériel et en prestations de services";
        param.description17 = "Impôt préalable grevant les investissements et autres charges d’exploitation";
        param.description18 = "Dégrèvement ultérieur de l’impôt préalable (art. 32, veuillez, s.v.p., joindre un relevé détaillé)";
        param.description19 = "Corrections de l’impôt préalable: double affectation (art. 30), prestations à soi-même (art. 31)";
        param.description20 = "Réductions de la déduction de l’impôt préalable: prestations n’étant pas considérées comme des contre-prestations, telles subventions, taxes touristiques (art. 33, al. 2)";
        param.description21 = "Total ch. 400 à 420";
        param.description22 = "Montant à payer";
        param.description23 = "Solde en faveur de l’assujetti";
        param.description24 = "Subventions, taxes touristiques perçues par les offices du tourisme, contributions aux établissements d'élimination des déchets et d'approvisionnement en eau (let. a à c)";
        param.description25 = "Les dons, les dividendes, les dédommagements, etc. (let. d à l)";
    }
    else { //lan=deu or lan=enu
        param.title = "MWST-Abrechnung";
        param.description1 = "Total der vereinbarten bzw. vereinnahmten Entgelte, inkl. optierte Leistungen, Entgelte aus Übertragungen im Meldeverfahren sowie aus Leistungen im Ausland (weltweiter Umsatz)";
        param.description2 = "In Ziffer 200 enthaltene Entgelte aus von der Steuer ausgenommenen Leistungen (Art. 21), für welche nach Art. 22 optiert wird";
        param.description3 = "Von der Steuer befreite Leistungen (u.a. Exporte, Art. 23), von der Steuer befreite Leistungen an begünstigte Einrichtungen und Personen (Art. 107 Abs. 1 Bst. a)";
        param.description4 = "Leistungen im Ausland (Ort der Leistung im Ausland)";
        param.description5 = "Übertragung im Meldeverfahren (Art. 38, bitte zusätzlich Form. 764 einreichen)";
        param.description6 = "Von der Steuer ausgenommene Inlandleistungen (Art. 21), für die nicht nach Art. 22 optiert wird";
        param.description7 = "Entgeltsminderungen wie Skonti, Rabatte usw.";
        param.description8 = "Diverses (z.B. Wert des Bodens, Ankaufspreise Margenbesteuerung)";
        param.description9 = "Total Ziff. 220 bis 280";
        param.description10 = "Steuerbarer Gesamtumsatz (Ziff. 200 abzüglich Ziff. 289)";
        param.description11 = "Normal";
        param.description12 = "Reduziert";
        param.description13 = "Beherbergung";
        param.description14 = "Bezugsteuer";
        param.description15 = "Total geschuldete Steuer (Ziff. 303 bis 383)";
        param.description16 = "Vorsteuer auf Material- und Dienstleistungsaufwand";
        param.description17 = "Vorsteuer auf Investitionen und übrigem Betriebsaufwand";
        param.description18 = "Einlageentsteuerung (Art. 32, bitte detaillierte Aufstellung beilegen)";
        param.description19 = "Vorsteuerkorrekturen: gemischte Verwendung (Art. 30), Eigenverbrauch (Art. 31)";
        param.description20 = "Vorsteuerkürzungen: Nicht-Entgelte wie Subventionen, Tourismusabgaben (Art. 33 Abs. 2)";
        param.description21 = "Total Ziff. 400 bis 420";
        param.description22 = "Zu bezahlender Betrag";
        param.description23 = "Guthaben der steuerpflichtigen Person";
        param.description24 = "Subventionen, durch Kurvereine eingenommene Tourismusabgaben, Entsorgungs- und Wasserwerkbeiträge (Bst. a-c)";
        param.description25 = "Spenden, Dividenden, Schadenersatz usw. (Bst. d-l)";
    }
}

/* Main function */
function exec() {

    //Check if we are on an opened document
    if (!Banana.document) {
        return;
    }

    //Check the version of Banana (required 10.0.12 and Advanced plan)
    var requiredVersion = "10.0.12";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0 && Banana.application.license && Banana.application.license.licenseType === "advanced") {

        var dateform = null;
        if (options && options.useLastSettings) {
            dateform = getScriptSettings();
        } else {
            dateform = settingsDialog();
        }

        if (!dateform) {
            return;
        }

        //Create the report
        var report = createVatReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate);
            
        //Add styles and print the report
        var stylesheet = createStyleSheet();
        Banana.Report.preview(report, stylesheet);
    
    }
    else {
        Banana.document.addMessage("Banana Accounting Plus with Advanced Plan is required");
        return "@Cancel";
    }
}


/* Function that creates and prints the report */
function createVatReport(banDoc, startDate, endDate) {

    /* 1) Load parameters and texts */
    loadParam(banDoc, startDate, endDate);
    loadDescriptions(banDoc);

    /* 2) Extract data from journal and convert all the needed values from base currency to CHF */
    var transactions = getJournal(banDoc);
    
    /* 3) Create the report */
    var report = Banana.Report.newReport(param.reportName);

    var taxable = "";
    var posted = "";
    var tot289 = "";
    var tot299 = "";
    var tot399posted = "";
    var tot399taxable = "";
    var tot479 = "";
    var tot500 = "";
    var tot510 = "";

    // Create a table
    var table = report.addTable("table");
    tableRow = table.addRow();
    tableRow.addCell("Gr1", "headerStyle", 1);
    tableRow.addCell("Description", "headerStyle", 1);
    tableRow.addCell("vatTaxableCHF", "headerStyle", 1);
    tableRow.addCell("vatPostedCHF", "headerStyle", 1);

    tableRow = table.addRow();
    tableRow.addCell("200", "", 1);
    tableRow.addCell(param.description1, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "200", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot299 = Banana.SDecimal.add(tot299,taxable); //sum for 299 total
    
    tableRow = table.addRow();
    tableRow.addCell("205", "", 1);
    tableRow.addCell(param.description2, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "205", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell("220", "", 1);
    tableRow.addCell(param.description3, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "220", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot289 = Banana.SDecimal.add(tot289, taxable); //sum for 289 total

    tableRow = table.addRow();
    tableRow.addCell("221", "", 1);
    tableRow.addCell(param.description4, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "221", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot289 = Banana.SDecimal.add(tot289,taxable); //sum for 289 total

    tableRow = table.addRow();
    tableRow.addCell("225", "", 1);
    tableRow.addCell(param.description5, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "225", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot289 = Banana.SDecimal.add(tot289, taxable); //sum for 289 total

    tableRow = table.addRow();
    tableRow.addCell("230", "", 1);
    tableRow.addCell(param.description6, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "230", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot289 = Banana.SDecimal.add(tot289,taxable); //sum for 289 total

    tableRow = table.addRow();
    tableRow.addCell("235", "", 1);
    tableRow.addCell(param.description7, "", 1);
    taxable = Banana.SDecimal.abs(getGr1VatBalance(banDoc, transactions, "235", 2, startDate, endDate));
    tableRow.addCell(formatNumber(taxable, true), "right", 1);
    tableRow.addCell("","",1);
    tot289 = Banana.SDecimal.add(tot289, taxable); //sum for 289 total

    tableRow = table.addRow();
    tableRow.addCell("280", "", 1);
    tableRow.addCell(param.description8, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "280", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right ", 1);
    tot289 = Banana.SDecimal.add(tot289,taxable); //sum for 289 total
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell("289", "bold", 1);
    tableRow.addCell(param.description9, "bold", 1);
    tableRow.addCell(formatNumber(tot289, true), "right bold", 1);
    tableRow.addCell("","",1);
    tot299 = Banana.SDecimal.subtract(tot299,tot289); //sum for 299 total

    tableRow = table.addRow();
    tableRow.addCell("299", "bold", 1);
    tableRow.addCell(param.description10, "bold", 1);
    tableRow.addCell(formatNumber(tot299, true), "right bold", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);

    tableRow = table.addRow();
    tableRow.addCell("303", "", 1);
    tableRow.addCell(param.description11, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "303", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right right", 1);
    posted = getGr1VatBalance(banDoc, transactions, "303", 4, startDate, endDate);
    tot399posted = Banana.SDecimal.add(tot399posted, posted);
    tableRow.addCell(formatNumber(posted, true), "right right", 1);

    tableRow = table.addRow();
    tableRow.addCell("313", "", 1);
    tableRow.addCell(param.description12, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "313", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right right", 1);
    posted = getGr1VatBalance(banDoc, transactions, "313", 4, startDate, endDate);
    tot399posted = Banana.SDecimal.add(tot399posted, posted);
    tableRow.addCell(formatNumber(posted, true), "right right", 1);

    tableRow = table.addRow();
    tableRow.addCell("343", "", 1);
    tableRow.addCell(param.description13, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "343", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right right", 1);
    posted = getGr1VatBalance(banDoc, transactions, "343", 4, startDate, endDate);
    tot399posted = Banana.SDecimal.add(tot399posted, posted);
    tableRow.addCell(formatNumber(posted, true), "right right", 1);

    tableRow = table.addRow();
    tableRow.addCell("383", "", 1);
    tableRow.addCell(param.description14, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "383", 2, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right right", 1);
    posted = getGr1VatBalance(banDoc, transactions, "383", 4, startDate, endDate);
    tot399posted = Banana.SDecimal.add(tot399posted, posted);
    tableRow.addCell(formatNumber(posted, true), "right right", 1);

    tableRow = table.addRow();
    tableRow.addCell("399", "bold", 1);
    tableRow.addCell(param.description15, "bold", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(formatNumber(tot399posted, true), "right bold", 1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);

    tableRow = table.addRow();
    tableRow.addCell("400", "", 1);
    tableRow.addCell(param.description16, "", 1);
    tableRow.addCell("","",1);
    posted = getGr1VatBalance(banDoc, transactions, "400", 3, startDate, endDate);
    tableRow.addCell(formatNumber(posted, true), "right", 1);
    tot479 = Banana.SDecimal.add(tot479, posted);

    tableRow = table.addRow();
    tableRow.addCell("405", "", 1);
    tableRow.addCell(param.description17, "", 1);
    tableRow.addCell("","",1);
    posted = getGr1VatBalance(banDoc, transactions, "405", 3, startDate, endDate);
    tableRow.addCell(formatNumber(posted, true), "right", 1);
    tot479 = Banana.SDecimal.add(tot479, posted);

    tableRow = table.addRow();
    tableRow.addCell("410", "", 1);
    tableRow.addCell(param.description18, "", 1);
    tableRow.addCell("","",1);
    posted = getGr1VatBalance(banDoc, transactions, "410", 3, startDate, endDate);
    tableRow.addCell(formatNumber(posted, true), "right", 1);
    tot479 = Banana.SDecimal.add(tot479, posted);

    tableRow = table.addRow();
    tableRow.addCell("415", "", 1);
    tableRow.addCell(param.description19, "", 1);
    tableRow.addCell("","",1);
    posted = getGr1VatBalance(banDoc, transactions, "415", 3, startDate, endDate);
    tableRow.addCell(formatNumber(posted, true), "right", 1);
    tot479 = Banana.SDecimal.subtract(tot479, Banana.SDecimal.abs(posted));

    tableRow = table.addRow();
    tableRow.addCell("420", "", 1);
    tableRow.addCell(param.description20, "", 1);
    tableRow.addCell("","",1);
    posted = getGr1VatBalance(banDoc, transactions, "420", 3, startDate, endDate);
    tableRow.addCell(formatNumber(posted, true), "right", 1);
    tot479 = Banana.SDecimal.subtract(tot479, Banana.SDecimal.abs(posted));

    tableRow = table.addRow();
    tableRow.addCell("479", "bold", 1);
    tableRow.addCell(param.description21, "bold", 1);
    tableRow.addCell("","",1);
    tableRow.addCell(formatNumber(tot479, true),"right bold",1);

    //500 and 510
    var diff_399_479 = Banana.SDecimal.subtract(tot399posted, tot479, {'decimals':2});

    //If the difference is > 0 the amount goes into the 500, else into the 510
    if (Banana.SDecimal.sign(diff_399_479) > 0) {
        tot500 = diff_399_479;
        tot510 = 0;
    } else if (Banana.SDecimal.sign(diff_399_479) < 0) {
        tot500 = 0;
        tot510 = Banana.SDecimal.invert(diff_399_479);
    } else {
        tot500 = 0;
        tot510 = 0;
    }

    tableRow = table.addRow();
    tableRow.addCell("500", "bold", 1);
    tableRow.addCell(param.description22, "bold", 1);
    tableRow.addCell("","", 1);
    tableRow.addCell(formatNumber(tot500, true), "right bold", 1);

    tableRow = table.addRow();
    tableRow.addCell("510", "bold", 1);
    tableRow.addCell(param.description23, "bold", 1);
    tableRow.addCell(formatNumber(tot510, true), "right bold", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    tableRow = table.addRow();
    tableRow.addCell(" ", "", 4);
    

    /**********
        III.
    **********/
    tableRow = table.addRow();
    tableRow.addCell("900", "", 1);
    tableRow.addCell(param.description24, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "900", 6, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right ", 1);
    tableRow.addCell("","",1);

    tableRow = table.addRow();
    tableRow.addCell("910", "", 1);
    tableRow.addCell(param.description25, "", 1);
    taxable = getGr1VatBalance(banDoc, transactions, "910", 1, startDate, endDate);
    tableRow.addCell(formatNumber(taxable, true), "right ", 1);
    tableRow.addCell("","",1);



    //Add Header and footer
    addHeader(report, param);
    addFooter(report, param);

    return report;
}


/* Function that returns the lines from the journal and converts some values from base currency to CHF */
function getJournal(banDoc) {

    var journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NORMAL);
    var len = journal.rowCount;
    var transactions = []; //Array that will contain all the lines of the transactions
    var requiredVersion = "10.0.12";
    
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
            line.doc = tRow.value("Doc");
            line.description = tRow.value("Description");
            line.isvatoperation = tRow.value("JVatIsVatOperation");
            line.transactioncurrency = tRow.value("JTransactionCurrency");
            line.transactioncurrencyconversionrate = tRow.value("JTransactionCurrencyConversionRate");

            //We take only the rows with a VAT code and then we convert values from base currency to CHF
            if (line.isvatoperation) {
                if (line.transactioncurrency === "CHF") {
                    line.exchangerate = Banana.SDecimal.divide(1,line.transactioncurrencyconversionrate);
                }
                else {
                    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
                        //Return Object with properties 'date' and 'exchangeRate'
                        line.exchangerate = banDoc.exchangeRate("CHF", line.date).exchangeRate;
                    } else {
                        //Return value
                        line.exchangerate = banDoc.exchangeRate("CHF", line.date);
                    }
                }

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


/* This function sums the vat amounts for the specified vat code and period retrieved from transactions (converted journal's lines)
   Returns an object containing {vatTaxable, vatPosted, vatTaxableCHF, vatPostedCHF} */
function getVatCodesBalance(transactions, grCodes, startDate, endDate) {

    var sDate = Banana.Converter.toDate(startDate);
    var eDate = Banana.Converter.toDate(endDate);

    var vattaxable = "";
    var vatposted = "";
    var vattaxableCHF = "";
    var vatpostedCHF = "";
    var vatamount = "";
    var vatamountCHF = "";
    var currentBal = {};

    for (var j = 0; j < grCodes.length; j++) {
        for (var i = 0; i < transactions.length; i++) {
            
            var tDate = Banana.Converter.toDate(transactions[i].date);

            if (tDate >= sDate && tDate <= eDate) {

                if (grCodes[j] === transactions[i].vatcode) {

                    vattaxable = Banana.SDecimal.add(vattaxable, transactions[i].vattaxable);
                    vatposted = Banana.SDecimal.add(vatposted, transactions[i].vatposted);
                    vatamount = Banana.SDecimal.add(vatamount, transactions[i].vatamount);
                    vattaxableCHF = Banana.SDecimal.add(vattaxableCHF, transactions[i].vattaxableCHF);
                    vatpostedCHF = Banana.SDecimal.add(vatpostedCHF, transactions[i].vatpostedCHF);
                    vatamountCHF = Banana.SDecimal.add(vatamountCHF, transactions[i].vatamountCHF);

                    currentBal.vatTaxable = vattaxable;
                    currentBal.vatPosted = vatposted;
                    currentBal.vatAmount = vatamount;
                    currentBal.vatTaxableCHF = vattaxableCHF;
                    currentBal.vatPostedCHF = vatpostedCHF;
                    currentBal.vatAmountCHF = vatamountCHF;
                }
            }
        }
    }
    return currentBal;
}


/* The purpose of this function is to calculate all the VAT balances of the accounts belonging to the same group (grText) */
function getGr1VatBalance(banDoc, transactions, grText, vatClass, startDate, endDate) {
    
    var vatCodes = getVatCodeForGr(banDoc, grText, 'Gr1');

    //Sum the vat amounts for the specified vat code and period
    var currentBal = getVatCodesBalance(transactions, vatCodes, startDate, endDate);

    //The "vatClass" decides which value to use
    if (vatClass == "1") {
        return currentBal.vatTaxableCHF;
    }
    else if (vatClass == "2") {
        return Banana.SDecimal.invert(currentBal.vatTaxableCHF);
    }
    else if (vatClass == "3") {
        return currentBal.vatPostedCHF;
    }
    else if (vatClass == "4") {
        return Banana.SDecimal.invert(currentBal.vatPostedCHF);
    }
    else if (vatClass == "5") {
        return Banana.SDecimal.add(currentBal.vatTaxableCHF,currentBal.vatAmountCHF);
    }
    else if (vatClass == "6") {
        return Banana.SDecimal.invert(Banana.SDecimal.add(currentBal.vatTaxableCHF,currentBal.vatAmountCHF));
    }
}


/* The main purpose of this function is to create an array with all the values of a given grColumn of the table belonging to the same group (grText) */
function getVatCodeForGr(banDoc, grText, grColumn) {
    var str = [];
    if (!banDoc || !banDoc.table("VatCodes")) {
        return str;
    }
    var table = banDoc.table("VatCodes");

    if (!grColumn) {
        grColumn = "Gr1";
    }

    //Can have multiple values
    var arrayGrText = grText.split(';');

    //Loop to take the values of each rows of the table
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var grRow = tRow.value(grColumn);

        //If Gr1 column contains other characters (in this case ";") we know there are more values
        //We have to split them and take all values separately
        //If there are only alphanumeric characters in Gr1 column we know there is only one value
        var arrCodeString = tRow.value(grColumn).split(";");
        for (var j = 0; j < arrayGrText.length; j++) {
            if (arrayContains(arrCodeString, arrayGrText[j])) {
                var vatCode = tRow.value('VatCode');
                if (!arrayContains(str, vatCode)) {
                    str.push(vatCode);
                }
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

/* The purpose of this function is to check if an array contains the given value */
function arrayContains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}


/* The purpose of this function is to convert the value to local format */
function formatNumber(amount, convZero) {
    if (!amount) { //if undefined return 0.00
        amount = 0;
    }
    return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
}


function getScriptSettings() {
   var data = Banana.document.getScriptSettings();
   //Check if there are previously saved settings and read them
   if (data.length > 0) {
       try {
           var readSettings = JSON.parse(data);
           //We check if "readSettings" is not null, then we fill the formeters with the values just read
           if (readSettings) {
               return readSettings;
           }
       } catch (e) {
       }
   }

   return {
      "selectionStartDate": "",
      "selectionEndDate": "",
      "selectionChecked": "false"
   }
}


/* The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run
   Every time the user runs of the script he has the possibility to change the date of the accounting period */
function settingsDialog() {
    
    //The formeters of the period that we need
    var scriptform = getScriptSettings();
    
    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod(param.reportName, docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        var value = Banana.document.setScriptSettings(formToString);       
    } else {
        //User clicked cancel
        return null;
    }
    return scriptform;
}


/* This function adds a Footer to the report */
function addFooter(report, param) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footer");
    var textfield = report.getFooter().addText(d);
    if (textfield.excludeFromTest) {
        textfield.excludeFromTest();
    }
}


/* This function adds an Header to the report */
function addHeader(report, param) {
    var pageHeader = report.getHeader();
    pageHeader.addClass("header");
    if (param.company) {
        pageHeader.addParagraph(param.company, "heading");
    }
    pageHeader.addParagraph("VAT Report " + param.year + ", Summary currency to CHF", "heading");
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


