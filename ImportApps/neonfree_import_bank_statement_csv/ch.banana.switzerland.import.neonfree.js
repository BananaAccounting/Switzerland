// @id = ch.banana.switzerland.import.neonfree
// @api = 1.0
// @pubdate = 2023-10-18
// @publisher = Banana.ch SA
// @description = Neon Switzerland AG - Import transactions .csv
// @description.it = Neon Switzerland AG - Importa movimenti .csv
// @description.de = Neon Switzerland AG - Bewegungen importieren .csv
// @description.fr = Neon Swtizerland AG - Importer mouvements .csv
// @description.en = Neon Switzerland AG - Import transactions .csv
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

  var bananatransaction = {};
  bananatransaction['Date'] = csvObj['Date'];
  bananatransaction['Description'] = `${csvObj['Description']} ${csvObj['Subject']}`;

    if (Number(csvObj['Amount']) > 0) {
      bananatransaction['Income'] = Math.abs(csvObj['Amount']);
      bananatransaction['Expenses'] = '';
    } else {
      bananatransaction['Income'] = '';
      bananatransaction['Expenses'] = Math.abs(csvObj['Amount']);
    }

  return bananatransaction;
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
    ], bananaObjects, '\t');

  // Return the converted tsv file
  return tsvFile;

}
