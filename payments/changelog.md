# Changelog

All notable changes to the [Payment orders PAIN.001 for Switzerland](https://www.banana.ch/apps/en/node/9327) extension are documented in this file.  

* 2025-11-26
	* Published Beta Release - New SPS 2025 pain format with structured/hydrid addresses
		* Added new PAIN format 'Swiss Payment Standard 2025 (pain.001.001.09.ch.03)' which supports structured and hybrid addresses
		* Removed old PAIN format 'ISO 20022 Schema (pain.001.001.03)'
		* Added insertion of QR codes (scan QR code) at the current cursor position instead of at the end of the transactions table
		* Set default currency to EUR for SEPA payments
		* Fixed an issue with undo/redo operations involving payment data in the transactions table
		* Fixed the removal of the supplier account in the transaction table when it is deleted from the Payment Data dialog
		* Replaced deprecated JavaScript function substr() with substring()


