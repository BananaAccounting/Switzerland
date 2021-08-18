// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
//
// @id = ch.banana.switzerland.pf.smartbusinees.import.csv.js
// @api = 1.0
// @pubdate = 2021-08-10
// @publisher = Banana.ch SA
// @description = Import Postfinance Smart business data (*.csv)
// @doctype = *
// @encoding = utf-8
// @task = import.rows
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputencoding = utf-8
// @inputfilefilter = CSV files (*.csv);;All files (*.*)

/*
 *   SUMMARY
 *
 *   Import the data from csv files created with smart business.
 * 
 *   The data are the following:
 *   -products
 *   -services
 *   -customers
 *   -invoices
 *   - ...
 * 
 * 
 * 
 */

function exec(string) {

    if (!Banana.document || string.length <= 0)
        return "@Cancel";

    var jsonDocArray={};
    var initJsonDoc=initDocument();
    var fieldSeparator = findSeparator(string);
    var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');

   //format 1: prodotti e servizi
   var format_ps = new formatPS();
   if (format_ps.match(transactions))
   {
      var format = format_ps.convertInDocChange(transactions,initJsonDoc);
      jsonDocArray=format;
   }
   //Format 2: Contatti
   var format_cnt = new formatCnt();
   if (format_cnt.match(transactions))
   {
      //var format = format_ps.convertInDocChange(transactions,initJsonDoc);
      //jsonDocArray=format;
   }


   var documentChange = { "format": "documentChange", "error": "","data":[]};
   documentChange["data"].push(jsonDocArray); 

   return documentChange;

}

function initDocument() {

   var jsonDoc = {};
   jsonDoc.document = {};
   jsonDoc.document.dataUnits = [];

   jsonDoc.creator = {};
   jsonDoc.creator.executionDate = getCurrentDate();
   jsonDoc.creator.name = Banana.script.getParamValue('id');
   jsonDoc.creator.version = "1.0";

   return jsonDoc;

}
function getCurrentDate() {
   var d = new Date();
   var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
   return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
}

/**
 * "relations";"type";"gender";"number";"name";"addition";"salutation";"language";"email";"phone";"fax";"website";"vat_id";"groups";"sendpreference";"notes";"address_street_1";"address_street2_1";"address_streetno_1";"address_code_1";"address_city_1";"address_country_1";"person_name_1";"person_surname_1";"person_gender_1";"person_email_1";"person_phone_1";"person_salutation_1";"person_department_1";"person_name_2";"person_surname_2";"person_gender_2";"person_email_2";"person_phone_2";"person_salutation_2";"person_department_2"
 * "CL";"P";"M";"8247";"Pinco Pallino";"";"";"it";"";"";"";"";"";"N. Sportivo";"U";"";"Via Alle Stalle";"";"28";"6593";"Cadenazzo";"CH";"";"";"";"";"";"";"";"";"";"";"";"";"";""
 * "CL";"C";"";"4";"Pinco Pallino SA";"";"";"it";"";"";"";"";"";"";"U";"noleggio autogru,trasporti, piattaforme,";"Via la Stampa";"";"21";"6965";"Cadro";"CH";"Paolo";"VISMARA";"M";"paolo@vismara.ch";"";"";"";"";"";"";"";"";"";""
 */

var formatCnt=class formatCnt{
   constructor(){
      this.relations=0;
      this.type=1;
      this.gender=2;
      this.number=3;
      this.name=4;
      this.addition=5;
      this.salutation=6;
      this.language=7;
      this.email=8;
      this.phone=9;
      this.fax=10;
      this.website=11;
      this.vat_id=12;
      this.groups=13;
      this.sendpreference=14;
      this.notes=15;
      this.address_street_1=16;
      this.address_street_2=17;
      this.address_streetno_1=18;
      this.address_code_1=19;
      this.address_city_1=20;
      this.address_country_1=21;
      this.person_name_1=22;
      this.person_surname_1=23;
      this.person_gender_1=24;
      this.person_email_1=25;
      this.person_phone_1=26;
      this.person_salutation_1=27;
      this.department_1=28;
      this.person_name_2=29;
      this.person_surname_2=30;
      this.person_gender_2=31;
      this.person_email_2=32;
      this.person_phone_2=33;
      this.person_salutation_2=34;
      this.department_2=35;

   }

   /** Return true if the transactions match this format */
   match(transactions) {
      if ( transactions.length === 0)
         return false;
      for (var i=0;i<transactions.length;i++){
         var transaction = transactions[i];
   
         var formatMatched = false;
   //controllo che la lunghezza dell array sia effettivamente quella controllando la prima riga
         if (transaction.length  === (this.department_2+1))
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.number].match(/[0-9\.]+/g))
            formatMatched = true;
         else
            formatMatched = false;
         if ( formatMatched && transaction[this.name])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
   
      return false;
   }
}

/**Esempio struttura file prodotti e servizi
 * i servizi non hanno selfcost.
 * "number";"name";"description";"price";"unit";"vat";"category";"including_vat";"default_amount";"notes";"selfcost"
 * "100";"Schrauben 8x30mm";"";"0.18";"Pezzi";"7.70";"";"N";"1.00";"";""
 * "102";"Schrauben 10x50mm";"";"0.25";"Pezzi";"7.70";"";"N";"1.00";"";""
 * "103";"AC/DC Umwandler 200Watt";"";"260.00";"Pezzi";"7.70";"";"N";"1.00";"";""
 * "104";"Kabel RJ45";"";"10.00";"ml";"7.70";"";"N";"1.00";"";""
 * "105";"Kabel RJ11";"";"6.50";"ml";"7.70";"";"N";"1.00";"";""
 */

var formatPS =class formatPS {
   constructor() {
      this.number=0;
      this.name=1;
      this.description=2;
      this.price=3;
      this.unit=4;
      this.vat=5;
      this.category=6;
      this.including_vat=7;
      this.default_amount=8;
      this.notes=9;
      this.selfcost=10;
   
      this.decimalSeparator = ".";
   }
 
 
   /** Return true if the transactions match this format */
   match(transactions) {
      if ( transactions.length === 0)
         return false;

      for (var i=0;i<transactions.length;i++){
         var transaction = transactions[i];
 
         var formatMatched = false;
 //controllo che la lunghezza dell array sia effettivamente quella controllando la prima riga
         if (transaction.length  === (this.selfcost+1) || transaction.length == (this.notes+1))
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.number].match(/[0-9\.]+/g))
            formatMatched = true;
         else
            formatMatched = false;
         if ( formatMatched && transaction[this.price].match(/[0-9\.]+/g))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
 
      return false;
   }

/**
 * inserisco i dati in banana usando il DocChange
 */
   convertInDocChange(transactions,initJsonDoc){
      var jsonDoc=[];
      //rows
      let rows = [];

      for (var i=1;i<transactions.length;i++){
         var transaction = transactions[i];
         let row = {};
         row.operation = {};
         row.operation.name = "add";

         row.fields = {};
         row.fields["RowId"] = transaction[this.number];
         row.fields["Description"] = transaction[this.name];
         row.fields["UnitPrice"] = transaction[this.price];
         row.fields["ReferenceUnit"] = transaction[this.unit];
         row.fields["VatImport"] = transaction[this.vat];
         row.fields["RowGroup"] = transaction[this.category];
         row.fields["IncludeVat"] = transaction[this.including_vat];
         row.fields["ValueBegin"] = transaction[this.default_amount];
         row.fields["Notes"] = transaction[this.notes];
         row.fields["SelfCost"] = transaction[this.selfcost];


         //controllare che la riga non esista già
         if(verifyIfNotExist(row.fields,"Items","RowId","UnitPrice")){
            rows.push(row);
         }
 

      }

      var dataUnitTransactions = {};
      dataUnitTransactions.nameXml = "Items";
      dataUnitTransactions.data = {};
      dataUnitTransactions.data.rowLists = [];
      dataUnitTransactions.data.rowLists.push({ "rows": rows });

      var jsonDoc=initJsonDoc;

      jsonDoc.document.dataUnits.push(dataUnitTransactions);

      return jsonDoc;
   }
}


function verifyIfNotExist(rows,ref_table,ref_field_1,ref_field_2){

   var NotExist=false;
   var existingElements=[];

   if (!Banana.document) {
      return "";
  }
     //carico le righe esistenti dalla tabella corretta
  var table = Banana.document.table(ref_table);
    if (!table) {
        return "";
    }

    for (var i = 1; i < table.rowCount; i++) {
        let existingRows = {};
        var tRow = table.row(i);

        existingRows.field_1= tRow.value(ref_field_1)
        existingRows.field_2= tRow.value(ref_field_2)

        existingElements.push(existingRows);
    }

    for(var row in existingElements){
       if(rows[ref_field_1]!==existingElements[row].field_1 && Banana.Converter.toLocaleNumberFormat(rows[ref_field_2],2])!==existingElements[row].field_2){
         Banana.console.debug(NotExist);
         NotExist=true;
       }
    }
    return NotExist;

}


/**
 * The function findSeparator is used to find the field separator.
 */
 function findSeparator(string) {

    var commaCount=0;
    var semicolonCount=0;
    var tabCount=0;
 
    for(var i = 0; i < 1000 && i < string.length; i++) {
       var c = string[i];
       if (c === ',')
          commaCount++;
       else if (c === ';')
          semicolonCount++;
       else if (c === '\t')
          tabCount++;
    }
 
    if (tabCount > commaCount && tabCount > semicolonCount)
    {
       return '\t';
    }
    else if (semicolonCount > commaCount)
    {
       return ';';
    }
 
    return ',';
 }
