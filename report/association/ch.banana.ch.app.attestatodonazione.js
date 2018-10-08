// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.ch.app.attestatodonazione.js
// @api = 1.0
// @pubdate = 2018-10-08
// @publisher = Banana.ch SA
// @description = Spendenbescheinigung für Vereine in Schweiz
// @description.de = Spendenbescheinigung für Vereine in Schweiz
// @description.it = Attestato di donazione per Associazioni in Svizzera
// @description.fr = Certificat de don pour Associations en Suisse
// @description.en = Statement of donation for Associations in Switzerland
// @doctype = *
// @task = app.command

/*
*   This BananaApp prints a donation statement for all the selected donators and period.
*   Donators can be:
*   - a single donator (with or without ";") => (i.e. "10001" or  ";10011")
*   - more donators (with or without ";") separated by "," => (i.e. "10001, ;10011,;10012")
*   - all the donators (empty field) => (i.e. "")
*   
*   It works for a single donation or multiple donations during the selected period.
*/

var texts;

function exec(inData, options) {
    
    if (!Banana.document)
        return "@Cancel";

    texts = loadTexts(Banana.document);

	/* 1) Opens the dialog for the period choice */
	var dateform = null;
	if (options && options.useLastSettings) {
	    dateform = getScriptSettings();
	} else {
	    dateform = settingsDialog();
	}
	if (!dateform) {
	    return "@Cancel";
	}

    /* 2) Get user parameters from the dialog */
    var userParam = initUserParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = parametersDialog(savedParam);
    }

    if (!userParam) {
        return "@Cancel";
    }

    /* 3) Get the list of all the donors (CC3) */
    var membershipList = getCC3List(Banana.document);
    var donorsToPrint = [];

    if (userParam.costcenter) {
        var list = userParam.costcenter.split(",");
        for (var i = 0; i < list.length; i++) {
            list[i] = list[i].trim();
            
            //If user insert the Cc3 account without ";" we add it
            if (list[i].substring(0,1) !== ";") {
                list[i] = ";"+list[i];
            }

            if (membershipList.indexOf(list[i]) > -1) { //Cc3 exists
                donorsToPrint.push(list[i]);           
            }
            else { //Cc3 does not exists
                Banana.document.addMessage(texts.warningMessage + ": <" + list[i] + ">");              
            }
        }
        if (donorsToPrint.length < 1) {
            return "@Cancel";
        }
    }
    else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) { //Empty field, so we take all the Cc3
        donorsToPrint = membershipList;
    }

	/* 4) Creates the report */
	var report = createReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate, userParam, donorsToPrint);            
	var stylesheet = createStyleSheet(userParam);
	Banana.Report.preview(report, stylesheet);
}

/* The report is created using the selected period and the data of the dialog */
function createReport(banDoc, startDate, endDate, userParam, donorsToPrint) {

    var report = Banana.Report.newReport(texts.title);
    var lang = getLang(banDoc);

    for (var k = 0; k < donorsToPrint.length; k++) {

        /* Address of the sender (Organization) */
        var company = banDoc.info("AccountingDataBase","Company");
        var name = banDoc.info("AccountingDataBase","Name");
        var familyName = banDoc.info("AccountingDataBase","FamilyName");
        var address1 = banDoc.info("AccountingDataBase","Address1");
        var address2 = banDoc.info("AccountingDataBase","Address2");
        var zip = banDoc.info("AccountingDataBase","Zip");
        var city = banDoc.info("AccountingDataBase","City");
        var country = banDoc.info("AccountingDataBase","Country");
        var phone = banDoc.info("AccountingDataBase","Phone");
        var web = banDoc.info("AccountingDataBase","Web");
        var email = banDoc.info("AccountingDataBase","Email");

        var tableAddress = report.addTable("tableAddress");
        tableAddress.setStyleAttributes("width:100%");
        var col1 = tableAddress.addColumn("col1").setStyleAttributes("width:60%");
        var col2 = tableAddress.addColumn("col2").setStyleAttributes("width:40%");
        
        var row = tableAddress.addRow();
        var addressCell = row.addCell();
        if (company) {
            addressCell.addParagraph(company, "");
        }
        if (name && familyName) {
            addressCell.addParagraph(name + " " + familyName, "");
        } else if (!name && familyName) {
            addressCell.addParagraph(familyName, "");
        } else if (name && !familyName) {
        	addressCell.addParagraph(name, "");
        }

        if (address1) {
            addressCell.addParagraph(address1, "");
        }
        if (address2) {
            addressCell.addParagraph(address2, "");
        }

        if (zip && city) {
            addressCell.addParagraph(zip + " " + city, "");
        }

        if (phone) {
            addressCell.addParagraph("Tel. " + phone);
        } else {
            addressCell.addParagraph(" ", "");
        }

        if (web) {
            addressCell.addParagraph("Web: " + web);
        } else {
            addressCell.addParagraph(" ", "");
        }

        if (email) {
            addressCell.addParagraph("Email: " + email);
        } else {
            addressCell.addParagraph(" ", "");
        }


        /* Address of the membership (donor) */
        var address = getAddress(banDoc, donorsToPrint[k]);
        if (address.nameprefix) {
            var row = tableAddress.addRow();
            row.addCell(" ", "", 1);
            row.addCell(address.nameprefix, "", 1);
        }

        if (address.firstname && address.familyname) {
            var row = tableAddress.addRow();
            row.addCell(" ", "", 1);
            row.addCell(address.firstname + " " + address.familyname, "", 1);
        } else if (!address.firstname && address.familyname) {
            var row = tableAddress.addRow();
            row.addCell(" ", "", 1);
            row.addCell(address.familyname, "", 1);
        }

        if (address.street) {
            var row = tableAddress.addRow();
            row.addCell(" ", "", 1);
            row.addCell(address.street, "", 1);
        }

        if (address.postalcode && address.locality) {
            var row = tableAddress.addRow();
            row.addCell(" ", "", 1);
            row.addCell(address.postalcode + " " + address.locality, "", 1);
        }

        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");


        /* Donor Issuer */
        var transactionsObj = calculateTotalTransactions(banDoc, donorsToPrint[k], startDate, endDate);
        var totalOfDonations = transactionsObj.total;
        var numberOfDonations = transactionsObj.numberOfTransactions;

        var year = Banana.Converter.toDate(startDate);
        year = year.getFullYear();
        report.addParagraph(texts.title + " " + year, "bold");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");

        var paragraph = report.addParagraph();
        paragraph.addText(texts.text01, "");
        paragraph.addText(" ", "");
        paragraph.addText(address.firstname + " " + address.familyname, "bold");
        paragraph.addText(", " , "");
        paragraph.addText(address.street + ", " + address.postalcode + " " + address.locality, "bold");
        paragraph.addText(" ", "");

        if (numberOfDonations < 2) {
            var trDate = getTransactionDate(banDoc, donorsToPrint[k], startDate, endDate);
            paragraph.addText(texts.text02, "");
            paragraph.addText(" ", "");
            paragraph.addText(Banana.Converter.toLocaleDateFormat(trDate), "bold");
        } else {
            paragraph.addText(texts.text03, "");
            paragraph.addText(" ", "");
            
            if (lang !== "en") {
                paragraph.addText(Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate), "bold");
            } else {
                paragraph.addText(Banana.Converter.toLocaleDateFormat(startDate), "bold");
                paragraph.addText(" and ", "");
                paragraph.addText(Banana.Converter.toLocaleDateFormat(endDate), "bold");
            }
        }

        // German text is inverted
        if (lang === "de") {
            paragraph.addText(" ", "");
            paragraph.addText(banDoc.info("AccountingDataBase", "BasicCurrency"), "bold");
            paragraph.addText(" ", "");
            paragraph.addText(Banana.Converter.toLocaleNumberFormat(totalOfDonations), "bold");
            paragraph.addText(" ", "");
            paragraph.addText(texts.text05, "");
            paragraph.addText(" ", "");
            paragraph.addText(texts.text04, "");
        } else {
            paragraph.addText(" ", "");
            paragraph.addText(texts.text04, "");
            paragraph.addText(" ", "");
            paragraph.addText(banDoc.info("AccountingDataBase", "BasicCurrency"), "bold");
            paragraph.addText(" ", "");
            paragraph.addText(Banana.Converter.toLocaleNumberFormat(totalOfDonations), "bold");
            paragraph.addText(" ", "");
            paragraph.addText(texts.text05, "");
        }

        // Print a transactions detail in case there is more than one donation
        if (numberOfDonations > 1) {
            report.addParagraph(" ", "");
            printTransactionTable(banDoc, report, donorsToPrint[k], startDate, endDate);
            report.addParagraph(" ", "");
            report.addParagraph(" ", "");
        }

        
        /* Signature */
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        
        var tableSignature = report.addTable("table04");
        tableSignature.setStyleAttributes("width:100%");
        var col1 = tableSignature.addColumn("col1").setStyleAttributes("width:60%");
        var col2 = tableSignature.addColumn("col2").setStyleAttributes("width:40%");

        tableRow = tableSignature.addRow();
        tableRow.addCell(userParam.localityAndDate, "bold", 1);
        tableRow.addCell(userParam.signature, "bold", 1);
        tableRow = tableSignature.addRow();
        tableRow.addCell();
        tableRow.addCell(company, "");

        if (userParam.printLogo) {
            tableRow = tableSignature.addRow();
            tableRow.addCell();
            tableRow.addCell().addImage("documents:logo", "imgSignature");
        }

        /* Page break at the end of all the pages (except the last) */
        if (k < donorsToPrint.length-1) {
            report.addPageBreak();
        }
    }

    //addFooter(report);

    /* Return the report */
	return report;
}

function getAddress(banDoc, accountNumber) {
    var address = {};
    var table = banDoc.table("Accounts");
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");

        if (accountNumber === account) {

            address.nameprefix = tRow.value("NamePrefix");
            address.firstname = tRow.value("FirstName");
            address.familyname = tRow.value("FamilyName");
            address.street = tRow.value("Street");
            address.postalcode = tRow.value("PostalCode");
            address.locality = tRow.value("Locality");
        }
    }
    return address;
}

function getTransactionDate(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    costcenter = costcenter.substring(1); //remove first character ;
    
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {
            if (costcenter && costcenter === cc3) {
                return date;
            }
        }
    }
}

function calculateTotalTransactions(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    var numberOfTransactions = 0;
    var transactionsObj = {};
    costcenter = costcenter.substring(1); //remove first character ;

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        date = tRow.value("Date");
        transactionsObj.date = date;
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {
                total = Banana.SDecimal.add(total, tRow.value("Amount"));
                numberOfTransactions++;
            }
        }
    }

    transactionsObj.total = total;
    transactionsObj.numberOfTransactions = numberOfTransactions;
    
    return transactionsObj;
}

function printTransactionTable(banDoc, report, costcenter, startDate, endDate) {

    var transTab = banDoc.table("Transactions");
    var total = "";
    costcenter = costcenter.substring(1); //remove first character ";"

    var table = report.addTable("table02");
    if (banDoc.info("AccountingDataBase","Company")) {
        table.setStyleAttributes("width:70%");
    } else {
        table.setStyleAttributes("width:50%");
    }

    var rowCnt = 0;
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        tableRow = table.addRow();

        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {
                rowCnt++;
                tableRow.addCell(rowCnt, "borderBottom", 1); //sequencial numbers
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "borderBottom", 1);
                tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "borderBottom");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value("Amount")), "right borderBottom", 1);
                if (banDoc.info("AccountingDataBase","Company")) {
                    tableRow.addCell(banDoc.info("AccountingDataBase","Company"), "borderBottom right");
                } else {
                    tableRow.addCell();
                }
                total = Banana.SDecimal.add(total, tRow.value("Amount"));
            }
        }
    }

    tableRow = table.addRow();
    tableRow.addCell("", "borderTop borderBottom", 1);
    tableRow.addCell("", "borderTop borderBottom", 1);
    tableRow.addCell(texts.text06, "bold borderTop borderBottom", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
    tableRow.addCell("", "borderTop borderBottom", 1);
}

function getCC3List(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";") {
            membershipList.push(account);
        }
    }
    return membershipList;
}

function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    //Cc3 (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.title = texts.accountNumber;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    // locality and date
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.title = texts.localityAndDate;
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);

    // signature
    var currentParam = {};
    currentParam.name = 'signature';
    currentParam.title = texts.signature;
    currentParam.type = 'string';
    currentParam.value = userParam.signature ? userParam.signature : '';
    currentParam.readValue = function() {
        userParam.signature = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'printLogo';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.signature_image;
    currentParam.type = 'bool';
    currentParam.value = userParam.printLogo ? true : false;
    currentParam.readValue = function() {
     userParam.printLogo = this.value;
    }
    convertedParam.data.push(currentParam);

    // image height
    var currentParam = {};
    currentParam.name = 'imageHeight';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.imageHeight;
    currentParam.type = 'number';
    currentParam.value = userParam.imageHeight ? userParam.imageHeight : '10';
    currentParam.readValue = function() {
     userParam.imageHeight = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function initUserParam() {
    var userParam = {};
    userParam.costcenter = '';
    userParam.localityAndDate = '';
    userParam.signature = '';
    userParam.printLogo = '';
    userParam.imageHeight = '';
    return userParam;
}

function parametersDialog(userParam) {

    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = userParam.xmldialogtitle;
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return;
        }
        
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
    }

    var paramToString = JSON.stringify(userParam);
    var value = Banana.document.setScriptSettings(paramToString);
    
    return userParam;
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

function settingsDialog() {
    
    //The formeters of the period that we need
    var scriptform = getScriptSettings();

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod(texts.title, docStartDate, docEndDate, 
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

function getLang(banDoc) {
   var lang = banDoc.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}

function addFooter(report) {
    report.getFooter().addClass("footer");
    //report.getFooter().addText("", "");
    report.getFooter().addFieldPageNr();
}

function createStyleSheet(userParam) {
    var stylesheet = Banana.Report.newStyleSheet();
    stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;");
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:10pt");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid black");
    stylesheet.addStyle(".borderTop", "border-top:thin solid black");
    stylesheet.addStyle(".borderRight", "border-right:thin solid black");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid black");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".address", "font-size:11pt");
    
    style = stylesheet.addStyle(".imgSignature");
    style.setAttribute("height", userParam.imageHeight + "mm");

    return stylesheet;
}

function loadTexts(banDoc) {

    var texts = {};
    var lang = getLang(banDoc);
    if (!lang) {
        lang = "en";
    }

    if (lang === "de") {
        texts.title = "Spendenbescheinigung";
        texts.warningMessage = "Ungültiges Mitgliedkonto Konto";
        texts.accountNumber = "Mitgliedskonto eingeben (leer = alle ausdrucken)";
        texts.localityAndDate = "Ort und Datum";
        texts.signature = "Unterschrift";
        texts.signature_image = "Unterschrift mit Bild";
        texts.imageHeight = "Bildhöhe (mm)";
        texts.donor = "Name und Anschrift des Zuwendenden";
        texts.memberAccount = "Mitgliedskonto";
        texts.donationDate = "Periode";
        texts.text01 = "Hiermit bestätigen wir, dass";
        texts.text02 = "am";
        texts.text03 = "in der Zeit vom";
        texts.text04 = "gespendet hat.";
        texts.text05 = "unserem Verein";
        texts.text06 = "Summe";
    }
    else if (lang === "fr") {
        texts.title = "Certificat de don";
        texts.warningMessage = "Compte de membre non valide";
        texts.accountNumber = "Entrer le compte du membre (vide = imprimer tout)";
        texts.localityAndDate = "Lieu et date";
        texts.signature = "Signature";
        texts.signature_image = "Signature avec image";
        texts.imageHeight = "Hauteur de l'image (mm)";
        texts.donor = "Nom et adresse du donateur";
        texts.memberAccount = "Compte de membre";
        texts.donationDate = "Période";
        texts.text01 = "Nous déclarons par la présente que";
        texts.text02 = "au";
        texts.text03 = "dans la période";
        texts.text04 = "a fait don de";
        texts.text05 = "à notre Association.";
        texts.text06 = "Total";
    }
    else if (lang === "it") {
        texts.title = "Attestato di donazione";
        texts.warningMessage = "Conto membro non valido";
        texts.accountNumber = "Indicare il conto del membro (vuoto = stampa tutti)";
        texts.localityAndDate = "Località e data";
        texts.signature = "Firma";
        texts.signature_image = "Firma con immagine";
        texts.imageHeight = "Altezza immagine (mm)";
        texts.donor = "Nome e indirizzo del donatore";
        texts.memberAccount = "Conto del membro";
        texts.donationDate = "Periodo";
        texts.text01 = "Con la presente dichiariamo che";
        texts.text02 = "in data";
        texts.text03 = "nel periodo";
        texts.text04 = "ha donato";
        texts.text05 = "alla nostra Associazione.";
        texts.text06 = "Totale";
    }
    else {
        texts.title = "Statement of donation";
        texts.warningMessage = "Invalid member account";
        texts.accountNumber = "Insert account member (empty = print all)";
        texts.localityAndDate = "Locality and date";
        texts.signature = "Signature";
        texts.signature_image = "Signature with image";
        texts.imageHeight = "Image height (mm)";
        texts.donor = "Name and addres of the donor";
        texts.memberAccount = "Member account";
        texts.donationDate = "Period";
        texts.text01 = "We hereby declare that";
        texts.text02 = "on";
        texts.text03 = "between";
        texts.text04 = "donated";
        texts.text05 = "to our Association.";
        texts.text06 = "Total";
    }

    return texts;
}

