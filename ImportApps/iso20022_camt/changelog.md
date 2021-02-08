# Changelog

2020-12-09; 
 * [Bug] Fix import of files where the property address["Nm"] is missing
 * [Enahncement] Add to transaction's description the text from properties address["PstlAdr"]["AdrLine"]

2021-02-08;
 * [Enahncement] Add customer/invoice number extraction from QR reference.
 * [Enahncement] Add "Use Banana format" parameter that allows to extract customer and invoice numbers from the QR/PVR reference created by Banana.
 * [Bug] Fix parameters for custom extraction (converted from numbers to strings).
