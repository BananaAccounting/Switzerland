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
// @pubdate = 2021-09-01
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
    var transactions_header=transactions[0];
    transactions.splice(0,1);
    var transactionsObjs=Banana.Converter.arrayToObject(transactions_header,transactions,true);

   //format 1: prodotti e servizi
   var format_ps = new formatPS();
   if (format_ps.match(transactionsObjs))
   {
      var format = format_ps.convertInDocChange(transactionsObjs,initJsonDoc);
      jsonDocArray=format;
   }
   //Format 2: Contatti
   var format_cnt = new formatCnt();
   if (format_cnt.match(transactionsObjs))
   {
      var format = format_cnt.convertInDocChange(transactionsObjs,initJsonDoc);
      jsonDocArray=format;
   }

   //Format 3: Fatture (dettagliate)
   var format_invs = new formatInvS();
   if (format_invs.match(transactionsObjs))
   {
      format_invs.getInvoiceId(transactionsObjs);
      var format = format_invs.convertInDocChange(transactionsObjs,initJsonDoc);
     // jsonDocArray=format;
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
 * "number";"client_name";"client_number";"client_groups";"date";"period";"due";"period_from";"period_to";"total";"total_exclvat";"total_exclvat_afterdiscount";"total_vat";"currency";"status";"paid_date";"paid_amount";"esr_number";"cash_discount_date";"cash_discount_value";"service_total";"service_exclvat";"service_vat";"service_vat_split";"product_total";"product_exclvat";"product_vat";"product_vat_split";"rounding_difference";"payments"
 * "10002";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"1079.27";"1002.11";"1002.11";"77.16";"CHF";"1° sollecito";"";"0.00";"000000000000000000000001029";"";"";"1077.00";"1000.00";"77.00";"7.70:77.00";"2.27";"2.11";"0.16";"7.70:0.16";"0";""
 * "10001";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"647.93";"601.61";"601.61";"46.32";"CHF";"Inviato";"";"0.00";"000000000000000000000001013";"";"";"646.20";"600.00";"46.20";7."70:46.20";"1.73";"1.61";"0.12";"7.70:0.12";"-0";""
 * "10000";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"431.53";"400.68";"400.68";"30.85";"CHF";"Bozza";"";"0.00";"000000000000000000000001008";"";"";"430.80";"400.00";"30.80";"7.70:30.80";"0.73";"0.68";"0.05";"7.70:0.05";"-0";""
 * struttura file fatture(singola riga)
 */
 var formatInvS =class formatInvS { 

   constructor(){
      this.placeHolder="";
   }
 
   /** Return true if the transactions match this format */
   match(transactions) {
      if ( transactions.length === 0)
         return false;

      for (var row in transactions){
         var transaction=transactions[row];
         //aggiungere un controllo
         var formatMatched = false;
         
         if (transaction["client_number"] && transaction["client_number"].match(/[0-9\.]+/g))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["number"].match(/[0-9\.]+/g)){
            formatMatched = true;
         }
         else
            formatMatched = false;

         if (formatMatched && transaction["date"].match(/[0-9\.]+/g) && transaction["date"].length==10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
 
      return false;
   }

   convertInDocChange(transactionsObjs,initJsonDoc){
      var jsonDoc=[];
      var docInfo=getDocumentInfo();
      var rows=[];

      

      var invoiceObj={};
      invoiceObj=setInvoiceStructure()

      /**
       * per ogni riga creo l'oggetto items e poi lo butto dentro a quello principale (invoiceObj)
       */

      for (var row_ in transactionsObjs){
            var invoiceTransaction=transactionsObjs[row_];

            invoiceObj.items=this.setInvoiceStructure_items(invoiceTransaction);
      }

            // Recalculate invoice
            invoiceObj = JSON.parse(Banana.document.calculateInvoice(JSON.stringify(invoiceObj)));

         let row = {};
         row.operation = {};
         row.operation.name = "add";
         row.fields={};

         row.fields["InvoiceData"]={"invoice_json":invoiceObj};

         rows.push(row);

      var dataUnitTransactions = {};
      dataUnitTransactions.nameXml = "Invoices";
      dataUnitTransactions.data = {};
      dataUnitTransactions.data.rowLists = [];
      dataUnitTransactions.data.rowLists.push({ "rows": rows });

      var jsonDoc=initJsonDoc;

      jsonDoc.document.dataUnits.push(dataUnitTransactions);

      return jsonDoc;
   }



//questo metodo dovrò richiamarlo per ogni riga di fattura presente, gli passo una transazione
   setInvoiceStructure(transaction,docInfo){

         var invoiceObj={};
         var invoiceTransaction=transaction;
         var supInfo=docInfo

         invoiceObj.customer_info=this.setInvoiceStructure_customerInfo(invoiceTransaction);
         invoiceObj.document_info=this.setInvoiceStructure_documentInfo(invoiceTransaction);
         invoiceObj.note={};
         invoiceObj.parameters={};
         invoiceObj.payment_info=this.setInvoiceStructure_paymentInfo(invoiceTransaction);
         invoiceObj.shipping_info=this.setInvoiceStructure_shippingInfo(invoiceTransaction);
         invoiceObj.supplier_info=this.setInvoiceStructure_supplierInfo(supInfo);
         invoiceObj.type="invoice";
         invoiceObj.version="1.0";


         return invoiceObj;
   }

   setInvoiceStructure_customerInfo(invoiceTransaction){
      var invoiceObj_customerInfo={};

         invoiceObj_customerInfo.address1="";
         invoiceObj_customerInfo.address2="";
         invoiceObj_customerInfo.address3="";
         invoiceObj_customerInfo.balance="";
         invoiceObj_customerInfo.balance_base_currency="";
         invoiceObj_customerInfo.business_name="";
         invoiceObj_customerInfo.city="";
         invoiceObj_customerInfo.country="";
         invoiceObj_customerInfo.country_code="";
         invoiceObj_customerInfo.courtesy="";
         invoiceObj_customerInfo.currency="";
         invoiceObj_customerInfo.date_birth="";
         invoiceObj_customerInfo.email="";
         invoiceObj_customerInfo.first_name=invoiceTransaction["client_name"];
         invoiceObj_customerInfo.lang="";
         invoiceObj_customerInfo.last_name="";
         invoiceObj_customerInfo.mobile="";
         invoiceObj_customerInfo.number="";
         invoiceObj_customerInfo.origin_row="";
         invoiceObj_customerInfo.origin_table="";
         invoiceObj_customerInfo.postal_code="";
         invoiceObj_customerInfo.vat_number="";


      return invoiceObj_customerInfo;

   }
   setInvoiceStructure_documentInfo(invoiceTransaction){
      var invoiceObj_documentInfo={};

      invoiceObj_documentInfo.currency=invoiceTransaction["currency"];
      invoiceObj_documentInfo.date=invoiceTransaction["date"];
      invoiceObj_documentInfo.decimals_amounts=2;
      invoiceObj_documentInfo.description="";
      invoiceObj_documentInfo.doc_type="";
      invoiceObj_documentInfo.locale="";
      invoiceObj_documentInfo.number=invoiceTransaction["number"];
      invoiceObj_documentInfo.origin_row="";
      invoiceObj_documentInfo.origin_table="";
      invoiceObj_documentInfo.printed="";
      invoiceObj_documentInfo.rounding_total="";
      invoiceObj_documentInfo.type="";


      return invoiceObj_documentInfo;

   }
   setInvoiceStructure_items(invoiceTransaction){
      var invoiceArr_items=[];
      var invoiceObj_items={};
      var invTransaction=invoiceTransaction;


      invoiceObj_items.account_assignment="3000";
      invoiceObj_items.description="various";
      invoiceObj_items.details="";
      invoiceObj_items.index="0";
      invoiceObj_items.item_type="0";
      invoiceObj_items.mesure_unit="";
      invoiceObj_items.number="";
      invoiceObj_items.quantity="1";
      invoiceObj_items.unit_price=this.setInvoiceStructure_items_unitPrice(invTransaction);
      

      invoiceArr_items.push(invoiceObj_items);


      return invoiceArr_items;
   }

   setInvoiceStructure_items_unitPrice(invoiceTransaction){
      var unitPrice={};

      unitPrice.amount_vat_inclusive=null;
      unitPrice.amount_vat_exclusive=invoiceTransaction[""];
      unitPrice.currency=invoiceTransaction["currency"];
      unitPrice.vat_code="";
      unitPrice.vat_rate=invoiceTransaction[""];


      return unitPrice;

   }

   setInvoiceStructure_paymentInfo(invoiceTransaction){
      var invoiceObj_paymentInfo={};

      invoiceObj_paymentInfo.due_date="";
      invoiceObj_paymentInfo.due_days="";
      invoiceObj_paymentInfo.payment_date=invoiceTransaction["paid_date"];

      return invoiceObj_paymentInfo;

   }

   setInvoiceStructure_shippingInfo(invoiceTransaction){
      var invoiceObj_shippingInfo={};

      invoiceObj_shippingInfo.different_shipping_address=false;

      return invoiceObj_shippingInfo={};
   }

   setInvoiceStructure_supplierInfo(supInfo){
      var invoiceObj_supplierInfo={};


      invoiceObj_supplierInfo.address1=supInfo.address1;
      invoiceObj_supplierInfo.address2=supInfo.address2;
      invoiceObj_supplierInfo.business_name=supInfo.business_name;
      invoiceObj_supplierInfo.city=supInfo.city;
      invoiceObj_supplierInfo.courtesy=supInfo.courtesy;
      invoiceObj_supplierInfo.email=supInfo.email;
      invoiceObj_supplierInfo.fax=supInfo.fax;
      invoiceObj_supplierInfo.first_name=supInfo.first_name;
      invoiceObj_supplierInfo.fiscal_number=supInfo.fiscal_number;
      invoiceObj_supplierInfo.last_name=supInfo.last_name;
      invoiceObj_supplierInfo.phone=supInfo.phone;
      invoiceObj_supplierInfo.postal_code=supInfo.postal_code;
      invoiceObj_supplierInfo.state=supInfo.state;
      invoiceObj_supplierInfo.vat_number=supInfo.vat_number;
      invoiceObj_supplierInfo.web=supInfo.web;

      return invoiceObj_supplierInfo;

   }

}

/**
 * "relations";"type";"gender";"number";"name";"addition";"salutation";"language";"email";"phone";"fax";"website";"vat_id";"groups";"sendpreference";"notes";"address_street_1";"address_street2_1";"address_streetno_1";"address_code_1";"address_city_1";"address_country_1";"person_name_1";"person_surname_1";"person_gender_1";"person_email_1";"person_phone_1";"person_salutation_1";"person_department_1";"person_name_2";"person_surname_2";"person_gender_2";"person_email_2";"person_phone_2";"person_salutation_2";"person_department_2"
 * "CL";"P";"M";"8247";"Pinco Pallino";"";"";"it";"";"";"";"";"";"N. Sportivo";"U";"";"Via Alle Stalle";"";"28";"6593";"Cadenazzo";"CH";"";"";"";"";"";"";"";"";"";"";"";"";"";""
 * "CL";"C";"";"4";"Pinco Pallino SA";"";"";"it";"";"";"";"";"";"";"U";"noleggio autogru,trasporti, piattaforme,";"Via la Stampa";"";"21";"6965";"Cadro";"CH";"Paolo";"VISMARA";"M";"paolo@vismara.ch";"";"";"";"";"";"";"";"";"";""
 */

var formatCnt=class formatCnt{

   /** Return true if the transactions match this format */
   match(transactions) {
      if ( transactions.length === 0)
         return false;
      for (var row in transactions){
         var transaction = transactions[row];
   
         var formatMatched = false;

         if (transaction["number"] && transaction["name"] && transaction["type"])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["number"].match(/[0-9\.]+/g))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }
   
      return false;
   }

   convertInDocChange(transactionsObjs,initJsonDoc){
      var jsonDoc=[];
      //rows
      let rows = [];
      for (var row_ in transactionsObjs){
         var transaction=transactionsObjs[row_];

         let row = {};
         row.operation = {};
         row.operation.name = "add";

         row.fields = {};
         row.fields["RowId"] = transaction["number"];
         row.fields["FirstName"] = transaction["name"];
         row.fields["PhoneMain"] = transaction["phone"];
         row.fields["PhoneHome"] = transaction["person_phone_1"];
         row.fields["PhoneMobile"] = transaction["person_phone_2"];
         row.fields["EmailWork"] = transaction["email"];
         row.fields["EmailHome"] = transaction["person_email_1"];
         row.fields["EmailOther"] = transaction["person_email_2"];
         row.fields["Language"] = transaction["language"];
         row.fields["Notes"] = transaction["notes"];
         row.fields["Street"] = transaction["address_street_1"]+" "+transaction["address_street_no"];
         row.fields["PostalCode"] = transaction["address_code_1"];
         row.fields["Locality"] = transaction["address_city_1"];
         row.fields["Country"] = transaction["address_country_1"];
         //controllare bene i campi da aggiungere (Vedere con Domenico)


         //controllare che la riga non esista già
        /* if(verifyIfNotExist(row.fields,"Contacts","RowId","UnitPrice")){
            
         }*/
         rows.push(row);
 

      }

      var dataUnitTransactions = {};
      dataUnitTransactions.nameXml = "Contacts";
      dataUnitTransactions.data = {};
      dataUnitTransactions.data.rowLists = [];
      dataUnitTransactions.data.rowLists.push({ "rows": rows });

      var jsonDoc=initJsonDoc;

      jsonDoc.document.dataUnits.push(dataUnitTransactions);

      return jsonDoc;
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
 
   /** Return true if the transactions match this format 
    * controllo che tutte le righe siano valide controllando aluni campi
    * 
   */
   match(transactions) {
      if ( transactions.length === 0)
         return false;

      for (var row in transactions){
         var transaction=transactions[row];
         
         var formatMatched = false;

         if (transaction["price"] && transaction["unit"])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["number"].match(/[0-9\.]+/g))
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
      var existingElements=getExistingItemsFromTable("Items","RowId","UnitPrice");
      //rows
      let rows = [];
      for (var row_ in transactions){
         var transaction=transactions[row_];
         let row = {};
         row.operation = {};
         row.operation.name = "add";

         row.fields = {};
         row.fields["RowId"] = transaction["number"];
         row.fields["Description"] = transaction["name"];
         row.fields["UnitPrice"] = transaction["price"];
         row.fields["ReferenceUnit"] = transaction["unit"];
         row.fields["VatImport"] = transaction["vat"];
         row.fields["RowGroup"] = transaction["category"];
         row.fields["IncludeVat"] = transaction["including_vat"];
         row.fields["ValueBegin"] = transaction["default_amount"];
         row.fields["Notes"] = transaction["notes"];
         row.fields["SelfCost"] = transaction["selfcost"];


         //controllare che la riga non esista già
         var rowExist=verifyIfExist(existingElements,row.fields["RowId"],row.fields["UnitPrice"]);
         if(!rowExist){
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

function getExistingItemsFromTable(tableName,ref_field_1,ref_field_2){

     var table = Banana.document.table(tableName);
     var existingElements=[];
     
     if (!table) {
         return "";
     }

     for (var i = 1; i < table.rowCount; i++) {
         var rowObj={};
         var tRow = table.row(i);

         rowObj.field_1= tRow.value(ref_field_1);
         rowObj.field_2= tRow.value(ref_field_2);
 
         existingElements.push(rowObj);
     }

     return existingElements;
}

function verifyIfExist(existingElements,newEelements_field_1,newEelements_field_2){
   var exists=false;

   if (!Banana.document)
      return "";
   for(var row in existingElements){
      /*Banana.console.debug("existing 1: "+existingElements[row].field_1);
      Banana.console.debug("new 1: "+newEelements_field_1);
      Banana.console.debug("existing 2: "+existingElements[row].field_2);
      Banana.console.debug("new 2: "+newEelements_field_2);*/
      if(existingElements[row].field_1==newEelements_field_1 && existingElements[row].field_2==newEelements_field_2){
         exists=true;
      }
   }
    return exists;
}

function getDocumentInfo(){
   var docInfo={};
   if (Banana.document){
      docInfo.address1=Banana.document.info("AccountingDataBase","Address1");
      docInfo.address2=Banana.document.info("AccountingDataBase","Address2");
      docInfo.business_name=Banana.document.info("AccountingDataBase","Company");
      docInfo.city=Banana.document.info("AccountingDataBase","City");
      docInfo.courtesy=Banana.document.info("AccountingDataBase","Courtesy");
      docInfo.email=Banana.document.info("AccountingDataBase","Email");
      docInfo.fax="";
      docInfo.first_name=Banana.document.info("AccountingDataBase","Name");
      docInfo.fiscal_number=Banana.document.info("AccountingDataBase","FiscalNumber");
      docInfo.last_name=Banana.document.info("AccountingDataBase","LastName");
      docInfo.phone=Banana.document.info("AccountingDataBase","Phone");
      docInfo.postal_code=Banana.document.info("AccountingDataBase","Zip");
      docInfo.state=Banana.document.info("AccountingDataBase","State");
      docInfo.vat_number=Banana.document.info("AccountingDataBase","VatNumber");
      docInfo.web=Banana.document.info("AccountingDataBase","Web");
   }

   return docInfo;
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
