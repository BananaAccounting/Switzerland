## Useful resources
- bLink V5 API transactions request doc: https://docs.blink.six-group.com/api-reference/ais/v5/six/request-account-transactions

## API versions examples

### API V5

- The extension receives a simplified version of the original JSON object provided by bLink, containing only an object with the list of transactions.

```json
{
  "iban": "CH5481230000001998736",
  "entries": [ // Account transaction entry object
    {
      "accountServicerReference": "12345ABC6789", // Unique reference for the entry, assigned by the bank (ntry ⇾ AcctSvcrRef in SPS/ISO-20022)
      "additionalEntryInformation": "Online Shopping Visa Debit Card Nr. xxxx 1234",
      "amount": { // Specifies the entry amount according to the account currency.
        "amount": "10.25", 
        "currency": "CHF"
      },
      "bankTransactionCode": {
        "domainCode": "PMNT",
        "familyCode": "RCDT",
        "subFamilyCode": "DMCT"
      },
      "bookingDate": "2018-04-13",
      "entryId": "ENTRY123456789", // !!! Do not use, with V6 this element will be removed !!!.
      "entryStatus": "booked",
      "transactionType": "CRDT",
      "valueDate": "2018-04-13",
      "entryReference": "10001628", // Contains the ISR participant number or QR-IBAN of the account owner, is mandatory (NtryRef in SPS/ISO-20022)
      "entryReferenceInternalId": "123456", // Additional grouping criteria for business cases ISR and QR-IBAN, contains the BISR-ID or first 6 characters of the QR reference
      "instructedAmount": { // Info sulla moneta originale dell'operazione ed il cambio.
        "amount": "10.25",
        "sourceCurrency": "CHF",
        "targetCurrency": "CHF",
        "exchangeIndicator": "MULT",
        "exchangeRate": "0.957"
      },
      "reversalIndicator": true,
      "totalChargesAmount": {
        "amount": "10.25",
        "currency": "CHF",
        "chargeRecords": [
          {
            "amount": "10.25",
            "chargesIncludedIndicator": true,
            "currency": "CHF",
            "type": "Some type of charge"
          }
        ]
      },
      "transactions": [
        {
          "accountServicerReference": "12345ABC6789", // Unique booking (transaction) reference assigned by the bank. TxDtls ⇾ Refs ⇾ AcctSvcrRef in SPS/ISO-20022
          "amount": {
            "amount": "10.25",
            "currency": "CHF"
          },
          "transactionId": "TX12345A987", // !!! Do not use, with V6 this element will be removed !!!.
          "transactionType": "CRDT",
          "additionalTransactionInformation": "Online Shopping Visa Debit Card Nr. xxxx 1234",
          "bankTransactionCode": {
            "domainCode": "PMNT",
            "familyCode": "RCDT",
            "subFamilyCode": "DMCT"
          },
          "counterparty": {
            "account": {
              "identification": "CH9300762011623852957",
              "type": "IBAN"
            },
            "agent": {
              "bic": "DEUTDE5M101",
              "clearingSystemMemberIdentification": {
                "code": "CHBCC",
                "memberId": "00230"
              }
            },
            "name": "Hans Muster",
            "postalAddress": {
              "structured": {
                "postCode": "2501",
                "streetName": "Rue de la gare",
                "townName": "Biel",
                "buildingNumber": "24",
                "country": "CH"
              },
              "unstructured": {
                "addressLines": [
                  "Robert Schneider SA",
                  "Rue de la gare 24"
                ],
                "country": "CH"
              }
            }
          },
          "endToEndId": "ENDTOENDID-01",
          "instructedAmount": {
            "amount": "10.25",
            "sourceCurrency": "CHF",
            "targetCurrency": "CHF",
            "exchangeIndicator": "MULT",
            "exchangeRate": "0.957"
          },
          "instructionId": "12345ABC6789",
          "remittanceInformation": "Rechnung Nr. 408",
          "remittanceReference": {
            "reference": "210000000003139471430009017",
            "type": "SCOR"
          },
          "totalChargesAmount": {
            "amount": "10.25",
            "currency": "CHF",
            "chargeRecords": [
              {
                "amount": "10.25",
                "chargesIncludedIndicator": true,
                "currency": "CHF",
                "type": "Some type of charge"
              }
            ]
          },
          "uetr": "fdc01a3e-4567-4abc-8def-1234567890ab"
        }
      ]
    }
  ]
}
```