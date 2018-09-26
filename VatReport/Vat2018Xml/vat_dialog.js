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
var blockSignal=false;
function settingsVatDialog(vatCHObject) {
   if (!vatCHObject || !vatCHObject.dialogName)
      return false;
   
   var netTaxRates = true;
   if (typeof (vatCHObject.getTaxRates) === 'undefined') {
      netTaxRates = false;
   }
   
   var dialog = Banana.Ui.createUi(vatCHObject.dialogName);
   
   translateDialog(dialog, netTaxRates);
   
   var periodAllRadioButton = dialog.findChild('periodAllRadioButton');
   var periodAllLabel = dialog.findChild('periodAllLabel');
   var periodSelectedRadioButton = dialog.findChild('periodSelectedRadioButton');
   var startDateLabel = dialog.findChild('startDateLabel');
   var startDateEdit = dialog.findChild('startDateEdit');
   var toDateLabel = dialog.findChild('toDateLabel');
   var toDateEdit = dialog.findChild('toDateEdit');
   var periodComboBox = dialog.findChild('periodComboBox');
   var yearComboBox = dialog.findChild('yearComboBox');
   var taxRate1DoubleSpinBox = dialog.findChild('taxRate1DoubleSpinBox');
   var taxRate2DoubleSpinBox = dialog.findChild('taxRate2DoubleSpinBox');
   var taxRate3DoubleSpinBox = dialog.findChild('taxRate3DoubleSpinBox');
   var taxRate4DoubleSpinBox = dialog.findChild('taxRate4DoubleSpinBox');
   var reportRadioButton = dialog.findChild('reportRadioButton');
   var xmlRadioButton = dialog.findChild('xmlRadioButton');
   var methodTypeComboBox = dialog.findChild('methodTypeComboBox');
   var typeOfSubmissionComboBox = dialog.findChild('typeOfSubmissionComboBox');
   var formOfReportingComboBox = dialog.findChild('formOfReportingComboBox');
   var desVariousDeductionsLineEdit = dialog.findChild('desVariousDeductionsLineEdit');
   var desActivity322LineEdit = dialog.findChild('desActivity322LineEdit');
   var desActivity321LineEdit = dialog.findChild('desActivity321LineEdit');
   var desActivity332LineEdit = dialog.findChild('desActivity332LineEdit');
   var desActivity331LineEdit = dialog.findChild('desActivity331LineEdit');
   var xmlOpenCheckBox = dialog.findChild('xmlOpenCheckBox');
   var adjustRoundingCheckBox = dialog.findChild('adjustRoundingCheckBox');
   var buttonBox = dialog.findChild('buttonBox');

   //Groupbox period
   if (vatCHObject.param.periodAll)
      periodAllRadioButton.checked = true;
   else
      periodSelectedRadioButton.checked = true;
   var accountingData = {};
   vatCHObject.readAccountingData(accountingData);
   periodAllLabel.text = accountingData.openingYear;
   var years = [];
   years.push(accountingData.openingYear);
   if (accountingData.closureYear != accountingData.openingYear) {
      periodAllLabel.text += '/' + accountingData.closureYear;
      years.push(accountingData.closureYear);
   }
   var fromDate = vatCHObject.param.periodStartDate;
   var toDate = vatCHObject.param.periodEndDate;
   if (!fromDate || !toDate) {
      fromDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      toDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
   }
   startDateEdit.setDate(fromDate);
   toDateEdit.setDate(toDate);
   periodComboBox.currentIndex = parseInt(vatCHObject.param.periodSelected);
   yearComboBox.addItems(years);

   //Groupbox tax rate
   var taxRates = {};
   if (netTaxRates) {
      taxRates = vatCHObject.getTaxRates();
      if (taxRates["322"].vatRate) {
         taxRate1DoubleSpinBox.setValue(taxRates["322"].vatRate);
         if (taxRates["322"].calculatedFromBanana)
            taxRate1DoubleSpinBox.setEnabled(false);
      }
      if (taxRates["332"].vatRate) {
         taxRate2DoubleSpinBox.setValue(taxRates["332"].vatRate);
         if (taxRates["332"].calculatedFromBanana)
            taxRate2DoubleSpinBox.setEnabled(false);
      }
      if (taxRates["321"].vatRate) {
         taxRate3DoubleSpinBox.setValue(taxRates["321"].vatRate);
         if (taxRates["321"].calculatedFromBanana)
            taxRate3DoubleSpinBox.setEnabled(false);
      }
      if (taxRates["331"].vatRate) {
         taxRate4DoubleSpinBox.setValue(taxRates["331"].vatRate);
         if (taxRates["331"].calculatedFromBanana)
            taxRate4DoubleSpinBox.setEnabled(false);
      }
   }
   
   //Groupbox output
   if (vatCHObject.param.outputScript == '1')
      xmlRadioButton.checked = true;
   else
      reportRadioButton.checked = true;
      
   //Groupbox xml options
   var currentIndex=parseInt(vatCHObject.param.xml.typeOfSubmission)-1;
   if (currentIndex<0)
      currentIndex = 0;
   typeOfSubmissionComboBox.currentIndex = currentIndex;
   currentIndex=parseInt(vatCHObject.param.xml.formOfReporting)-1;
   if (currentIndex<0)
      currentIndex = 0;
   formOfReportingComboBox.currentIndex = currentIndex;
   desVariousDeductionsLineEdit.text = vatCHObject.param.xml.descriptionVariousDeduction;
   if (netTaxRates) {
      methodTypeComboBox.currentIndex = parseInt(vatCHObject.param.xml.method);
      desActivity322LineEdit.text = vatCHObject.param.xml.activity322;
      desActivity332LineEdit.text = vatCHObject.param.xml.activity332;
      desActivity321LineEdit.text = vatCHObject.param.xml.activity321;
      desActivity331LineEdit.text = vatCHObject.param.xml.activity331;
   }
   if (vatCHObject.param.xml.openXmlFile)
       xmlOpenCheckBox.checked = true;
       
   //Other options
   if (vatCHObject.param.adjustRoundingDifference)
       adjustRoundingCheckBox.checked = true;


   //dialog functions
   dialog.checkdata = function () {
      dialog.accept();
   }
   dialog.enableButtons = function () {
      if (periodAllRadioButton.checked) {
         startDateEdit.enabled = false;
         startDateEdit.update();
         toDateEdit.enabled = false;
         toDateEdit.update();
         periodComboBox.enabled = false;
         periodComboBox.update();
         yearComboBox.enabled = false;
         yearComboBox.update();
      }
      else {
         startDateEdit.enabled = true;
         startDateEdit.update();
         toDateEdit.enabled = true;
         toDateEdit.update();
         periodComboBox.enabled = true;
         periodComboBox.update();
         yearComboBox.enabled = true;
         yearComboBox.update();
      }
      if (reportRadioButton.checked) {
         xmlOpenCheckBox.enabled = false;
         xmlOpenCheckBox.update();
      }
      else {
         xmlOpenCheckBox.enabled = true;
         xmlOpenCheckBox.update();
      }
   }
   dialog.updateDates = function () {
      blockSignal=true;
      var index = parseInt(periodComboBox.currentIndex.toString());
      if (index == 0) {
         return;
      }
      else if (index == 5 || index == 8) {
         periodComboBox.currentIndex = index+1;
         return;
      }
      var year = yearComboBox.currentIndex.toString();
      if (year.length < 4)
         year = accountingData.closureYear;
      var fromDate = year + '-01-01';
      var toDate = year + '-12-31';
      if (index == 1) {
         fromDate = year + '-01-01';
         toDate = year + '-03-31';
      }
      else if (index == 2) {
         fromDate = year + '-04-01';
         toDate = year + '-06-30';
      }
      else if (index == 3) {
         fromDate = year + '-07-01';
         toDate = year + '-09-30';
      }
      else if (index == 4) {
         fromDate = year + '-10-01';
         toDate = year + '-12-31';
      }
      else if (index == 6) {
         fromDate = year + '-01-01';
         toDate = year + '-06-30';
      }
      else if (index == 7) {
         fromDate = year + '-06-30';
         toDate = year + '-12-31';
      }
      else if (index == 9) {
         fromDate = year + '-01-01';
         toDate = year + '-12-31';
      }
      fromDate = Banana.Converter.toInternalDateFormat(fromDate, "yyyy-mm-dd");
      toDate = Banana.Converter.toInternalDateFormat(toDate, "yyyy-mm-dd");
      startDateEdit.setDate(fromDate);
      toDateEdit.setDate(toDate);
      blockSignal=false;
  }
   dialog.updatePeriods = function () {
      if (blockSignal)
         return;
      periodComboBox.currentIndex = 0;         
   }
   dialog.showHelp = function () {
      Banana.Ui.showHelp(vatCHObject.helpId);
   }
   buttonBox.accepted.connect(dialog, dialog.checkdata);
   buttonBox.helpRequested.connect(dialog, dialog.showHelp);
   periodAllRadioButton.clicked.connect(dialog, dialog.enableButtons);
   periodSelectedRadioButton.clicked.connect(dialog, dialog.enableButtons);
   periodComboBox.currentIndexChanged.connect(dialog, dialog.updateDates);
   reportRadioButton.clicked.connect(dialog, dialog.enableButtons);
   xmlRadioButton.clicked.connect(dialog, dialog.enableButtons);
   startDateEdit.dateChanged.connect(dialog, dialog.updatePeriods);
   toDateEdit.dateChanged.connect(dialog, dialog.updatePeriods);

   //show dialog
   Banana.application.progressBar.pause();
   dialog.updateDates();
   dialog.enableButtons();
   var dlgResult = dialog.exec();
   Banana.application.progressBar.resume();
   if (dlgResult !== 1)
      return false;

   //get dialog data
   //Groupbox period
   if (periodAllRadioButton.checked) {
      vatCHObject.param.periodAll = true;
      vatCHObject.param.periodStartDate = accountingData.accountingOpeningDate;
      vatCHObject.param.periodEndDate = accountingData.accountingClosureDate;
   }
   else {
      vatCHObject.param.periodAll = false;
      vatCHObject.param.periodStartDate = startDateEdit.text < 10 ? "0" + startDateEdit.text : startDateEdit.text;
      vatCHObject.param.periodStartDate = Banana.Converter.toInternalDateFormat(vatCHObject.param.periodStartDate, "dd/mm/yyyy");
      vatCHObject.param.periodEndDate = toDateEdit.text < 10 ? "0" + toDateEdit.text : toDateEdit.text;
      vatCHObject.param.periodEndDate = Banana.Converter.toInternalDateFormat(vatCHObject.param.periodEndDate, "dd/mm/yyyy");
      vatCHObject.param.periodSelected = periodComboBox.currentIndex.toString();
   }
   
   //Groupbox tax rates
   if (netTaxRates) {
      if (!taxRates["322"].calculatedFromBanana)
         vatCHObject.param.taxRate322 = taxRate1DoubleSpinBox.value.toString();
      if (!taxRates["332"].calculatedFromBanana)
         vatCHObject.param.taxRate332 = taxRate2DoubleSpinBox.value.toString();
      if (!taxRates["321"].calculatedFromBanana)
         vatCHObject.param.taxRate321 = taxRate3DoubleSpinBox.value.toString();
      if (!taxRates["331"].calculatedFromBanana)
         vatCHObject.param.taxRate331 = taxRate4DoubleSpinBox.value.toString();
   }
   
   //Groupbox output
   if (xmlRadioButton.checked)
      vatCHObject.param.outputScript = 1;
   else
      vatCHObject.param.outputScript = 0;
      
   //Groupbox xml options
   vatCHObject.param.xml.typeOfSubmission = typeOfSubmissionComboBox.currentIndex + 1;
   vatCHObject.param.xml.formOfReporting = formOfReportingComboBox.currentIndex + 1;
   vatCHObject.param.xml.descriptionVariousDeduction = desVariousDeductionsLineEdit.text;
   if (netTaxRates) {
      vatCHObject.param.xml.method = methodTypeComboBox.currentIndex;
      vatCHObject.param.xml.activity322 = desActivity322LineEdit.text;
      vatCHObject.param.xml.activity332 = desActivity332LineEdit.text;
      vatCHObject.param.xml.activity321 = desActivity321LineEdit.text;
      vatCHObject.param.xml.activity331 = desActivity331LineEdit.text;
   }
   if (xmlOpenCheckBox.checked)
      vatCHObject.param.xml.openXmlFile = true;
   else
      vatCHObject.param.xml.openXmlFile = false;
      
   //Other options
   if (adjustRoundingCheckBox.checked)
      vatCHObject.param.adjustRoundingDifference = true;
   else   
      vatCHObject.param.adjustRoundingDifference = false;

   return true;
}


function translateDialog(dialog, netTaxRates) {
   var tabWidget = dialog.findChild('tabWidget');
   var periodGroupBox = dialog.findChild('periodGroupBox');
   var periodAllRadioButton = dialog.findChild('periodAllRadioButton');
   var periodSelectedRadioButton = dialog.findChild('periodSelectedRadioButton');
   var startDateLabel = dialog.findChild('startDateLabel');
   var toDateLabel = dialog.findChild('toDateLabel');
   var periodComboBox = dialog.findChild('periodComboBox');
   var taxRatesGroupBox = dialog.findChild('taxRatesGroupBox');
   var taxRate1Label = dialog.findChild('taxRate1Label');
   var taxRate2Label = dialog.findChild('taxRate2Label');
   var taxRate3Label = dialog.findChild('taxRate3Label');
   var taxRate4Label = dialog.findChild('taxRate4Label');
   var outputGroupBox = dialog.findChild('outputGroupBox');
   var reportRadioButton = dialog.findChild('reportRadioButton');
   var xmlRadioButton = dialog.findChild('xmlRadioButton');
   var xmlOpenCheckBox = dialog.findChild('xmlOpenCheckBox');
   var xmlOptionsGroupBox = dialog.findChild('xmlOptionsGroupBox');
   var methodTypeLabel = dialog.findChild('methodTypeLabel');
   var methodTypeComboBox = dialog.findChild('methodTypeComboBox');
   var typeOfSubmissionLabel = dialog.findChild('typeOfSubmissionLabel');
   var typeOfSubmissionComboBox = dialog.findChild('typeOfSubmissionComboBox');
   var formOfReportingLabel = dialog.findChild('formOfReportingLabel');
   var formOfReportingComboBox = dialog.findChild('formOfReportingComboBox');
   var desVariousDeductionsLabel = dialog.findChild('desVariousDeductionsLabel');
   var desActivity322Label = dialog.findChild('desActivity322Label');
   var desActivity321Label = dialog.findChild('desActivity321Label');
   var desActivity332Label = dialog.findChild('desActivity332Label');
   var desActivity331Label = dialog.findChild('desActivity331Label');
   var adjustRoundingCheckBox = dialog.findChild('adjustRoundingCheckBox');
   
   var dialogTexts = getDialogTexts();
   
   //tabWidget[0].title = dialogTexts.tabWidget1;
   //tabWidget[1].title = dialogTexts.tabWidget2;
   periodGroupBox.title = dialogTexts.periodGroupBox;
   outputGroupBox.title = dialogTexts.outputGroupBox;
   xmlOptionsGroupBox.title = dialogTexts.xmlOptionsGroupBox;
   periodAllRadioButton.text = dialogTexts.periodAllRadioButton;
   periodSelectedRadioButton.text = dialogTexts.periodSelectedRadioButton;
   startDateLabel.text = dialogTexts.startDateLabel;
   toDateLabel.text = dialogTexts.toDateLabel;
   reportRadioButton.text = dialogTexts.reportRadioButton;
   xmlRadioButton.text = dialogTexts.xmlRadioButton;
   xmlOpenCheckBox.text = dialogTexts.xmlOpenCheckBox;
   typeOfSubmissionLabel.text = dialogTexts.typeOfSubmissionLabel;
   formOfReportingLabel.text = dialogTexts.formOfReportingLabel;
   desVariousDeductionsLabel.text = dialogTexts.desVariousDeductionsLabel;
   adjustRoundingCheckBox.text = dialogTexts.adjustRoundingCheckBox;

   if (netTaxRates) {
      methodTypeLabel.text = dialogTexts.methodTypeLabel;
      desActivity322Label.text = dialogTexts.desActivity322Label;
      desActivity321Label.text = dialogTexts.desActivity321Label;
      desActivity332Label.text = dialogTexts.desActivity332Label;
      desActivity331Label.text = dialogTexts.desActivity331Label;
      taxRatesGroupBox.title = dialogTexts.taxRatesGroupBox;
	   taxRate1Label.text = dialogTexts.taxRate1Label;
	   taxRate2Label.text = dialogTexts.taxRate2Label;
	   taxRate3Label.text = dialogTexts.taxRate3Label;
	   taxRate4Label.text = dialogTexts.taxRate4Label;
      dialog.windowTitle=dialogTexts.windowTitleNetTaxRates;
   }
   else {
      dialog.windowTitle=dialogTexts.windowTitleEffectiveMethod;
   }
   
   var periods = [];
   periods.push("");
   periods.push("1. " + dialogTexts.periodComboBoxQuarter);
   periods.push("2. " + dialogTexts.periodComboBoxQuarter);
   periods.push("3. " + dialogTexts.periodComboBoxQuarter);
   periods.push("4. " + dialogTexts.periodComboBoxQuarter);
   periods.push("------");
   periods.push("1. " + dialogTexts.periodComboBoxSemester);
   periods.push("2. " + dialogTexts.periodComboBoxSemester);
   periods.push("------");
   periods.push(dialogTexts.periodComboBoxYear);
   periodComboBox.addItems(periods);

   if (netTaxRates) {
      var methodTypes = [];
      methodTypes.push(dialogTexts.methodTypeComboBox1);
      methodTypes.push(dialogTexts.methodTypeComboBox2);
      methodTypeComboBox.addItems(methodTypes);
   }
   
   var typeOfSubmissions = [];
   //3=Riconciliazione annuale non implementata (typeOfSubmissionComboBox3)
   typeOfSubmissions.push(dialogTexts.typeOfSubmissionComboBox1);
   typeOfSubmissions.push(dialogTexts.typeOfSubmissionComboBox2);
   typeOfSubmissionComboBox.addItems(typeOfSubmissions);

   var formOfReporting = [];
   formOfReporting.push(dialogTexts.formOfReportingComboBox1);
   formOfReporting.push(dialogTexts.formOfReportingComboBox2);
   formOfReportingComboBox.addItems(formOfReporting);

}

function getDialogTexts() {
   var texts = {};

   var lang = Banana.application.locale;
   if (lang && lang.length > 2)
      lang = lang.substr(0, 2);
   else
      lang = "en";
   
   if (lang === "it") {
      texts.adjustRoundingCheckBox  = "Pareggiare differenze d'arrotondamento";
      texts.desVariousDeductionsLabel = "Descrizione deduzioni diverse";
      texts.desActivity322Label = "Descrizione attività 322";
      texts.desActivity332Label = "Descrizione attività 332";
      texts.desActivity321Label = "Descrizione attività 321";
      texts.desActivity331Label = "Descrizione attività 331";
      texts.formOfReportingComboBox1 = "1=Fatturato";
      texts.formOfReportingComboBox2 = "2=Incassato";
      texts.formOfReportingLabel = "Sistema di rendiconto";
      texts.methodTypeComboBox1 = "Aliquote a saldo";
      texts.methodTypeComboBox2 = "Aliquote forfetarie";
      texts.methodTypeLabel = "Metodo";
      texts.outputGroupBox = "Output";
      texts.periodAllRadioButton = "Completo";
      texts.periodComboBoxQuarter = "Trimestre";
      texts.periodComboBoxSemester = "Semestre";
      texts.periodComboBoxYear = "Anno";
      texts.periodGroupBox = "Periodo";
      texts.periodSelectedRadioButton = "Periodo selezionato";
      texts.reportRadioButton = "Anteprima di stampa";
      texts.startDateLabel = "Data inizio (compresa)";
      texts.tabWidget1 = "Base";
      texts.tabWidget2 = "Opzioni";
      texts.taxRatesGroupBox = "Aliquote saldo e forfetarie";
	   texts.taxRate1Label = "1. aliquota IVA (cifra 322)";
	   texts.taxRate2Label = "2. aliquota IVA (cifra 332)";
	   texts.taxRate3Label = "3. aliquota IVA (cifra 321 - fino al 31.12.2017)";
	   texts.taxRate4Label = "4. aliquota IVA (cifra 331 - fino al 31.12.2017)";
      texts.toDateLabel = "Data fine (compresa)";
      texts.typeOfSubmissionComboBox1 = "1=Primo inoltro";
      texts.typeOfSubmissionComboBox2 = "2=Rendiconto di correzione";
      texts.typeOfSubmissionComboBox3 = "3=Riconciliazione annuale";
      texts.typeOfSubmissionLabel = "Tipo di rendiconto";
	   texts.windowTitleEffectiveMethod = "IVA Svizzera: Metodo effettivo";
      texts.windowTitleNetTaxRates = "IVA Svizzera: Metodo aliquote saldo/forfetarie";
      texts.xmlOpenCheckBox = "Visualizza file immediatamente";
      texts.xmlOptionsGroupBox = "Opzioni XML";
      texts.xmlRadioButton = "File XML";

   }
   else if (lang === "fr") {
      texts.adjustRoundingCheckBox  = "Régler différences d'arrondi";
      texts.desVariousDeductionsLabel = "Description différentes déductions";
      texts.desActivity322Label = "Description activité 322";
      texts.desActivity332Label = "Description activité 332";
      texts.desActivity321Label = "Description activité 321";
      texts.desActivity331Label = "Description activité 331";
      texts.formOfReportingComboBox1 = "1=Convenu";
      texts.formOfReportingComboBox2 = "2=Reçu";
      texts.formOfReportingLabel = "Méthode de décompte";
      texts.methodTypeComboBox1 = "Taux de la dette fiscale";
      texts.methodTypeComboBox2 = "Taux forfaitaires";
      texts.methodTypeLabel = "Méthode";
      texts.outputGroupBox = "Output";
      texts.periodAllRadioButton = "Tout";
      texts.periodComboBoxQuarter = "Trimestre";
      texts.periodComboBoxSemester = "Semestre";
      texts.periodComboBoxYear = "Année";
      texts.periodGroupBox = "Période";
      texts.periodSelectedRadioButton = "Période spécifiée";
      texts.reportRadioButton = "Aperçu d'impression";
      texts.startDateLabel = "Date début (incluse)";
      texts.tabWidget1 = "Base";
      texts.tabWidget2 = "Options";
      texts.taxRatesGroupBox = "Taux de la dette fiscale nette/forfaitaires";
	   texts.taxRate1Label = "1. taux TVA (chiffre 322)";
	   texts.taxRate2Label = "2. taux TVA (chiffre 332)";
	   texts.taxRate3Label = "3. taux TVA (chiffre 321 - jusqu'au 31.12.2017)";
	   texts.taxRate4Label = "4. taux TVA (chiffre 331 - jusqu'au 31.12.2017)";
      texts.toDateLabel = "Date fin (incluse)";
      texts.typeOfSubmissionComboBox1 = "1=Premier dépôt";
      texts.typeOfSubmissionComboBox2 = "2=Décompte rectificatif";
      texts.typeOfSubmissionComboBox3 = "3=Concordance annuelle";
      texts.typeOfSubmissionLabel = "Type de décompte";
	   texts.windowTitleEffectiveMethod = "TVA Suisse: Méthode effective";
      texts.windowTitleNetTaxRates = "TVA Suisse: Méthode selon taux de la dette fiscale nette";
      texts.xmlOpenCheckBox = "Afficher fichier immédiatement";
      texts.xmlOptionsGroupBox = "Options XML";
      texts.xmlRadioButton = "Fichier XML";
   }
   else if (lang === "de") {
      texts.adjustRoundingCheckBox  = "Rundungsdifferenzen ausgleichen";
      texts.desVariousDeductionsLabel = "Beschreibung verschiedene Abzüge";
      texts.desActivity322Label = "Beschreibung Tätigkeit 322";
      texts.desActivity332Label = "Beschreibung Tätigkeit 332";
      texts.desActivity321Label = "Beschreibung Tätigkeit 321";
      texts.desActivity331Label = "Beschreibung Tätigkeit 331";
      texts.formOfReportingComboBox1 = "1=Vereinbart";
      texts.formOfReportingComboBox2 = "2=Vereinnahmt";
      texts.formOfReportingLabel = "Abrechnungsart";
      texts.methodTypeComboBox1 = "Saldosteuersatzmethode";
      texts.methodTypeComboBox2 = "Pauschalsteuersatzmethode";
      texts.methodTypeLabel = "Methode";
      texts.outputGroupBox = "Output";
      texts.periodAllRadioButton = "Alles";
      texts.periodComboBoxQuarter = "Quartal";
      texts.periodComboBoxSemester = "Semester";
      texts.periodComboBoxYear = "Jahr";
      texts.periodGroupBox = "Periode";
      texts.periodSelectedRadioButton = "Bestimmte Periode";
      texts.reportRadioButton = "Seitenansicht";
      texts.startDateLabel = "Anfangsdatum (inbegriffen)";
      texts.tabWidget1 = "Basis";
      texts.tabWidget2 = "Optionen";
      texts.taxRatesGroupBox = "Saldo- und Pauschalsteuersätze";
	   texts.taxRate1Label = "1. MwSt-Satz (Ziffer 322)";
	   texts.taxRate2Label = "2. MwSt-Satz (Ziffer 332)";
	   texts.taxRate3Label = "3. MwSt-Satz (Ziffer 321 - bis 31.12.2017)";
	   texts.taxRate4Label = "4. MwSt-Satz (Ziffer 331 - bis 31.12.2017)";
      texts.toDateLabel = "Enddatum (inbegriffen)";
      texts.typeOfSubmissionComboBox1 = "1=Ersteinreichung";
      texts.typeOfSubmissionComboBox2 = "2=Korrekturabrechnung";
      texts.typeOfSubmissionComboBox3 = "3=Jahresabstimmung";
      texts.typeOfSubmissionLabel = "Abrechnungstyp";
	   texts.windowTitleEffectiveMethod = "MwSt/USt Schweiz: Effektive Methode";
      texts.windowTitleNetTaxRates = "MwSt/USt Schweiz: Saldo-/Pauschalsteuersatz Methode";
      texts.xmlOpenCheckBox = "Datei sofort anzeigen";
      texts.xmlOptionsGroupBox = "XML-Optionen";
      texts.xmlRadioButton = "XML-Datei";
   }
   else {
      texts.adjustRoundingCheckBox  = "Balance rounding differences";
      texts.desVariousDeductionsLabel = "Description various deductions";
      texts.desActivity322Label = "Description activity 322";
      texts.desActivity332Label = "Description activity 332";
      texts.desActivity321Label = "Description activity 321";
      texts.desActivity331Label = "Description activity 331";
      texts.formOfReportingComboBox1 = "1=Issued";
      texts.formOfReportingComboBox2 = "2=Cash received";
      texts.formOfReportingLabel = "Form of reporting";
      texts.methodTypeComboBox1 = "Net Tax Rate";
      texts.methodTypeComboBox2 = "Flat Tax Rate";
      texts.methodTypeLabel = "Method";
      texts.outputGroupBox = "Output";
      texts.periodAllRadioButton = "All";
      texts.periodComboBoxQuarter = "Quarter";
      texts.periodComboBoxSemester = "Semester";
      texts.periodComboBoxYear = "Year";
      texts.periodGroupBox = "Period";
      texts.periodSelectedRadioButton = "Period selected";
      texts.reportRadioButton = "Print preview";
      texts.startDateLabel = "Start date (inclusive)";
      texts.tabWidget1 = "Base";
      texts.tabWidget2 = "Options";
      texts.taxRatesGroupBox = "Net/Flat tax rates";
	   texts.taxRate1Label = "1. Net tax rate 322";
	   texts.taxRate2Label = "2. Net tax rate 332";
	   texts.taxRate3Label = "3. Net tax rate 321 (to 31.12.2017)";
	   texts.taxRate4Label = "4. Net tax rate 331 (to 31.12.2017)";
      texts.toDateLabel = "End date (inclusive)";
      texts.typeOfSubmissionComboBox1 = "1=First sending";
      texts.typeOfSubmissionComboBox2 = "2=Correction report";
      texts.typeOfSubmissionComboBox3 = "3=Annual reconciliation";
      texts.typeOfSubmissionLabel = "Type of submission";
	   texts.windowTitleEffectiveMethod = "Swiss VAT return - Effective method";
      texts.windowTitleNetTaxRates = "Swiss VAT return - Net/Flat tax rate method";
      texts.xmlOpenCheckBox = "Display file immediately";
      texts.xmlOptionsGroupBox = "XML Options";
      texts.xmlRadioButton = "XML File";
   }
   return texts;
}
