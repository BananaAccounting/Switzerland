# Changelog

* 2020-09-02
	* Added structured (S) and combined (K) addresses for the QRCode
* 2020-09-21
	* Updated minimum version required: Banana Accounting Plus (10.0.1)
	* Moved all QR parameters to swissqrcode.js
	* Added possibility to define QR settings with hook function "hook_modify_settings_qr(invoiceObj,qrCodeData)".
* 2020-09-23
	* Added the VatRate column to the invoice details, which can be used as the default column (without the "T.").
* 2020-09-30
	* Updated the formatItemsValue function. It is now possible define the format and the CSS class to use for each value by using the hook function "hook_formatItemsValue(value, columnName, className, item)".
	* All the advanced customizations (details column with "T.", javascript hook functions and CSS) work only with the Advanced plan of Banana Accounting Plus.
* 2020-10-26
	* Updated invoice layout to allow the insertion of texts for estimates with the settings dialog.
