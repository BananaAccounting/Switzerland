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


// @id = ch.banana.switzerland.import.ubs.test
// @api = 1.0
// @pubdate = 2025-10-11
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.switzerland.import.ubs.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.switzerland.import.ubs.sbaa/import.utilities.js
// @includejs = ../ch.banana.switzerland.import.ubs.sbaa/ch.banana.switzerland.import.ubs.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportUbsTrans());

// Here we define the class, the name of the class is not important
function TestImportUbsTrans() { }

// This method will be called at the beginning of the test case
TestImportUbsTrans.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportUbsTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportUbsTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportUbsTrans.prototype.cleanup = function () {

}

TestImportUbsTrans.prototype.testImport = function () {
    var fileNameList = [];

    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20120629.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20160908.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20161111.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20173006.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20180831.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20230313_01.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20230313_02.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format1_20230905_03.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format2_de_20220928.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format2_en_20220928.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format2_fr_20220928.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format2_it_20220928.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_formatCc1_20171027.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_en_20221108.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_de_20221108.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_de_20241115.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_fr_20221108.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_fr_20241205.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_fr_20251022.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_it_20221108.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_it_20221129.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_it_triplequotes_20240621.csv");
    fileNameList.push("file:script/../test/testcases/csv_ubs_example_format3_it_wdetails_20241111.csv");

    var parentLogger = this.testLogger;
    this.progressBar.start(fileNameList.length);

    for (var i = 0; i < fileNameList.length; i++) {
        var fileName = fileNameList[i];
        this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

        var file = Banana.IO.getLocalFile(fileName);
        Test.assert(file);
        var fileContent = file.read();
        Test.assert(fileContent);
        var transactions = exec(fileContent, true); //takes the exec from the import script.
        this.testLogger.addCsv('', transactions);

        if (!this.progressBar.step())
            break;
    }

    this.progressBar.finish();
}