# Changelog

All notable changes to the [[CH10] Layout with Swiss QR Code](https://www.banana.ch/apps/en/node/9338) extension will be documented in this file.

* 2020-09-02
	* Added structured (S) and combined (K) addresses for the QRCode.
* 2020-09-21
	* Banana Accounting Plus (10.0.1 or higher) is required.
	* Moved all QR parameters to swissqrcode.js.
	* Added hook function "hook_modify_settings_qr(invoiceObj,qrCodeData)" to define QR settings.
* 2020-09-23
	* The "VatRate" column can be used in the invoice details without using the "T.".
* 2020-09-30
	* Updated the formatItemsValue function. It is possible to define the format and the CSS class to use for each item of the invoice details by using the hook function "hook_formatItemsValue(value, columnName, className, item)".
	* All the advanced customizations like invoice details custom columns, javascript hook functions and CSS styles, require the Advanced plan of Banana Accounting Plus.
* 2020-10-26
	* Updated invoice layout to allow the insertion of texts for estimates. Added a separate texts section for estimates within the settings dialog. Only works for [Estimates and Invoices application](https://www.banana.ch/doc/en/node/9752).
* 2020-12-04
	* Added the Deposit field to the print. Deposit can only be used for the Estimates and Invoices application.
* 2021-02-02
	* Descriptions rows that are not invoice items (without amount) are now printed without 0.00 amount (only for integrated invoices).
	* QR @errors of customer's address are shown in the Message panel with the rows of the Accounts/Contacts tables.
* 2021-02-17
	* QR 'Additional information' text is now printed without newlines and spaces.
	* QR @errors of customer's address are not displayed when printing an invoice without debtor address (empty box).
* 2021-02-26
	* Print the discount percentage if the discount is set through a percentage.
* 2021-03-02
	* Add space between the small sender address and receiver address.