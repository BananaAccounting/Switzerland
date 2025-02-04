# Changelog

All notable changes to the [[CH10] Layout with Swiss QR Code](https://www.banana.ch/apps/en/node/9338) extension will be documented in this file.  

* 2025-02-04
	* Added the customer email in the invoice address and as free text using the EmailWork column.
* 2024-12-11
	* Added Order Confirmation as print options (Advanced plan required).
* 2024-03-08
	* Integrated invoice: Added reminders date and remiders due date on invoice and QR, when dates are set via the Report > Customers > Print reminders function.
	* Integrated invoice: Added for proforma invoice the possibility to set the title and final notes/greetings using the column DocType of Transactions table.
	* Integrated invoice: The content of the column Quantity is always printed when used.
	* Integrated invoice: The format number of Quantity column in Transactions table can be modified to print decimals on the invoice (0,1,2,3,4 decimals).
	* Estimates and Invoices Application: discount and deposit now appear with negative sings on the invoice.
	* Added new parameters in layout options to view the invoice JSONs (useful for development, Advanced plan required).  
* 2023-09-22
	* Added the QR Slip as print options (Advanced plan required).  
* 2023-03-06
	* Added Proforma Invoice and Estimate as print options (Advanced plan required).  
* 2023-01-09
	* Added Delivery Notes and Reminders as print options (Advanced plan required).
	* Added a new color for 'Title and Total' in parameters settings.  
* 2022-09-28
    * Apply setting variable.decimals_quantity to invoice printed from Estimates and Invoices extension
      for the rounding of item's quantity value
    * Fix the address area is too wide and overflow the envolope window area  
* 2022-08-04
    * Print custom columns of invoice item objects (i.e.: unit_price.calculated_amount_vat_exclusive, ...)  
* 2022-05-30
	* Fix print column Item  
	* Removed 'shipping address' from invoice parameters when using Estimates-Invoices application  
* 2022-04-04
	* Fix left alignment of logo related to item's table.  
* 2022-03-31
	* Print fields OrganisationUnit, OrganisationUnit2, OrganisationUnit3, and OrganisationUnit4  
* 2021-12-20
	* Add a list of predefined columns in layout settings. By selecting a predefined column style, the program automatically inserts XML column names, widths, alignments and column header texts.  
* 2021-11-23
	* Add custom fields parameter (only for Estimates and Invoices Application). This allows to print custom fields in the information section.  
* 2021-10-22
	* QR code image is no longer printed in case of error/missing data.  
* 2021-10-12
	* print order number and order date in the information section. Can be activated/deactivated in the layout parameters. For integrated invoices can be added in Transaction table, column DocType (10:ordd / 10: ordn).
	* print begin text of the invoice on several lines. Text can also be defined in layout parameters, section Texts->Text begin.
	* print begin text of the estimate on several lines. Text can also be defined in Layout parameters, section Texts->Estimate->Text begin estimate.
	* add the subtotal for invoice with gross amounts in case of discount, deposit or rounding.
	* Specific changes for Integrated invoice:
		* print additional descriptions on several lines using custom columns “Description2”, “Description3",… in Transactions table. Can be activated/deactivated in the layout parameters, section Print->Invoice details.   
	* Specific changes for Estimates and Invoices application:
		* print columns “Item”, “Date” and “Discount”. Columns can be added in layout parameters, section Print->Invoice Details->Column names
		* print custom columns of Items table. The syntax is “I.ColumnName”, where ColumnName is the XML name of a column (Advanced plan required).  
* 2021-03-02
	* Add space between the small sender address and receiver address.  
* 2021-02-26
	* Print the discount percentage if the discount is set through a percentage.  
* 2021-02-17
	* QR 'Additional information' text is now printed without newlines and spaces.
	* QR @errors of customer's address are not displayed when printing an invoice without debtor address (empty box).  
* 2021-02-02
	* Descriptions rows that are not invoice items (without amount) are now printed without 0.00 amount (only for integrated invoices).
	* QR @errors of customer's address are shown in the Message panel with the rows of the Accounts/Contacts tables.  
* 2020-12-04
	* Added the Deposit field to the print. Deposit can only be used for the Estimates and Invoices application.  
* 2020-10-26
	* Updated invoice layout to allow the insertion of texts for estimates. Added a separate texts section for estimates within the settings dialog. Only works for [Estimates and Invoices application](https://www.banana.ch/doc/en/node/9752).  
* 2020-09-30
	* Updated the formatItemsValue function. It is possible to define the format and the CSS class to use for each item of the invoice details by using the hook function "hook_formatItemsValue(value, columnName, className, item)".
	* All the advanced customizations like invoice details custom columns, javascript hook functions and CSS styles, require the Advanced plan of Banana Accounting Plus.  
* 2020-09-23
	* The "VatRate" column can be used in the invoice details without using the "T.".  
* 2020-09-21
	* Banana Accounting Plus (10.0.1 or higher) is required.
	* Moved all QR parameters to swissqrcode.js.
	* Added hook function "hook_modify_settings_qr(invoiceObj,qrCodeData)" to define QR settings.  
* 2020-09-02
	* Added structured (S) and combined (K) addresses for the QRCode.  
