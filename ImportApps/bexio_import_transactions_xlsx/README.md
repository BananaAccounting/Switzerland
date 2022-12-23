# BEXIO FILTER

The extension is a Beta version. After the import, the user has to the user must take care of arranging the data correctly.

## Accounts Table

After the new accounts are imported the user has to:

- Reposition the accounts within the table
- Complete the accounts data:
  * Set the account correct currency.
  * Set the account group and Bclass.

## Vat Table

In the records is already set the vat code present in Banana that corresponds to the one provided by Bexio in the exported records. Unmapped accounts are added to the bottom of the vat codes table.

After importing the accounts the user must:

- Complete the data for the new vat code, or alternatively, see if a code already exists in the table  that corresponds to that rate, in which case the user can delete the imported code.
Next, however, he must change all references within the transactions table.

## General Notes

- Test are performed using *.csv version of the file.
- Doc page: https://www.banana.ch/apps/it/node/9654.

