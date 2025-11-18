/**
 * The class DocumentChange define some methods to simplify the construction
 * of a DocumentChange document.
 */
var DocumentChange = class DocumentChange {

    constructor(height, width) {
        this.jsonDoc = {};
        this.jsonDoc.data = [];
        this.jsonDoc.creator = {};
        this.jsonDoc.creator.executionDate = this.getCurrentDate();
        this.jsonDoc.creator.executionTime = this.getCurrentTime();
        this.jsonDoc.creator.name = Banana.script.getParamValue('id');
        this.jsonDoc.creator.version = "1.0";
        this.jsonDoc.format = "documentchange";
        this.addDocument();
    }

    addDocument() {
        var doc = {};
        doc.document = {};
        doc.document.fileVersion = "1.0.0";
        doc.document.dataUnits = [];
        this.jsonDoc.data.push(doc);
    }

    addOperationRowModify(tableName, rowNr, fieldChanges) {
        var row = {};
        row.operation = {};
        row.operation.name = "modify";
        row.operation.sequence = rowNr.toString();
        row.fields = fieldChanges;

        //rows
        var rows = [];
        rows.push(row);

        //table
        var dataUnitTransactions = {};
        dataUnitTransactions.nameXml = tableName;
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({"rows":rows});

        //document
        var currentDoc = this.jsonDoc.data[this.jsonDoc.data.length-1].document;
        currentDoc.dataUnits.push(dataUnitTransactions);
    }

    addOperationRowAdd(tableName, fieldChanges) {
        var row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = fieldChanges;

        //rows
        var rows = [];
        rows.push(row);

        //table
        var dataUnitTransactions = {};
        dataUnitTransactions.nameXml = tableName;
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({"rows":rows});

        //document
        var currentDoc = this.jsonDoc.data[this.jsonDoc.data.length-1].document;
        currentDoc.dataUnits.push(dataUnitTransactions);
    }

    addOperationRowInsert(tableName, rowNr, fieldChanges) {
        var row = {};
        row.operation = {};
        row.operation.name = "add";
        if (rowNr && parseInt(rowNr) >= 0) {
            row.operation.sequence = rowNr.toString();
        }
        row.fields = fieldChanges;

        //rows
        var rows = [];
        rows.push(row);

        //table
        var dataUnitTransactions = {};
        dataUnitTransactions.nameXml = tableName;
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({"rows":rows});

        //document
        var currentDoc = this.jsonDoc.data[this.jsonDoc.data.length-1].document;
        currentDoc.dataUnits.push(dataUnitTransactions);
    }

    getDocChange() {
        return this.jsonDoc;
    }

    isEmpty() {
        for (var i = 0; i < this.jsonDoc.data.length; ++i) {
            if (this.jsonDoc.data[i].document.dataUnits.length > 0) {
                return false;
            }
        }
        return true;
    }

    moveToRow(tableName, columnName, rowNr) {
        var cursorPosition = {};
        cursorPosition.operation = "move";
        cursorPosition.tableName = tableName;
        cursorPosition.columnName = columnName;
        cursorPosition.rowNr = rowNr;

        //document
        var currentDoc = this.jsonDoc.data[this.jsonDoc.data.length-1].document;
        currentDoc.cursorPosition = cursorPosition;
    }

    /**
     * Set this DocumentChange for the currentRow (necesssary for ChangeNotifyAfter)
     */
    setDocumentForCurrentRow() {
        var currentDoc = this.jsonDoc.data[this.jsonDoc.data.length-1].document;
        currentDoc.id = "currentRow";
    }

    /**
     * Internal method getCurrentDate
     */
    getCurrentDate() {
        var d = new Date();
        var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
        return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    }

    /**
     * Internal method getCurrentTime
     */
    getCurrentTime() {
        var d = new Date();
        var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        return Banana.Converter.toInternalTimeFormat(timestring);
    }

}
