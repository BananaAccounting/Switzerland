// @id = ch.banana.app.import_neon_csv
// @api = 1.0
// @pubdate = 2023-08-30
// @publisher = bobobo1618
// @description = Import Neon CSV
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)

/* CSV file example:
"Date";"Amount";"Original amount";"Original currency";"Exchange rate";"Description";"Subject";"Category";"Tags";"Wise";"Spaces"
"2022-12-30";"-5.00";"";"";"";"App";;"shopping";"";"no";"no"
"2022-03-03";"2000.00";"";"";"";"Other Account";;"income";"";"no";"no"
"2022-02-26";"-538.28";"-579.33";"USD";"1.07626";"American Stuff";;"shopping";"";"no";"no"
*/

function csvToBanana(csvObj) {
   var banana = {};
   banana['Date'] = csvObj['Date'];
   banana['Description'] = `${csvObj['Description']} ${csvObj['Subject']}`;

   var amount = csvObj['Original amount'] ? csvObj['Original amount'] : csvObj['Amount'];
   
   if (Number(amount) > 0) {
     banana['Income'] = amount;
     banana['Expenses'] = '';
   } else {
     banana['Income'] = '';
     banana['Expenses'] = amount;
   }

   banana['Amount'] = csvObj['Amount'];
   
   banana['AmountCurrency'] = csvObj['Original amount'];
   banana['ExchangeCurrency'] = csvObj['Original currency'] || 'CHF';
   banana['ExchangeRate'] = csvObj['Exchange rate'];

   return banana;
}

// Parse the data and return the data to be imported as a tab separated file.
function exec(inText) {

   // Convert a csv file to an array of array.
   // Parameters are: text to convert, values separator, delimiter for text values
   var csvFile = Banana.Converter.csvToArray(inText, ';', '"');
   var headers = csvFile[0];
   csvFile.splice(0, 1);
   Banana.console.log(`Found headers: ${headers}`);

   var arrayOfObjects = Banana.Converter.arrayToObject(headers, csvFile, true);
   var bananaObjects = arrayOfObjects.map(csvToBanana);

   var tsvFile = Banana.Converter.objectArrayToCsv([
    'Date', 
    'Description', 
    'Income', 
    'Expenses',
    'Amount',
    'AmountCurrency',
    'ExchangeCurrency',
    'ExchangeRate',
    ], bananaObjects, '\t');
   
   // Return the converted tsv file
   return tsvFile;

}
