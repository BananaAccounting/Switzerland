## Useful resources
- bLink V5 API transactions request doc: https://docs.blink.six-group.com/api-reference/ais/v5/six/request-account-transactions.

## API versions examples

### API V5

```json
"data": {
        "designation": "Bank Account 6 - valid iban",
        "iban": "CH5604835012345678009",
        "_links": {
            "self": "\/accounts\/6\/transactions",
            "account": "\/accounts\/6",
            "balance": "\/accounts\/6\/balance"
        },
        "entries": [
            {
                "entryId": "ENTRY00001659", --> Will be removed in V6
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "CRDT",
                "amount": {
                    "amount": "2999.90",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "RCDT",
                    "subFamilyCode": "PMDD"
                },
                "accountServicerReference": "99b8997c-f69d-475e-aef5-d6ff4e3c606c",
                "entryReference": null,
                "additionalEntryInformation": "Credit from 2025-10-10",
                "transactions": []
            },
            {
                "entryId": "ENTRY00001660",
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "CRDT",
                "amount": {
                    "amount": "33.50",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "RCDT",
                    "subFamilyCode": "VCOM"
                },
                "accountServicerReference": "e37ecf02-f64d-4dde-a8a7-cdfb189b3cdb",
                "entryReference": null,
                "additionalEntryInformation": "Credit from 2025-10-10",
                "transactions": []
            },
            {
                "entryId": "ENTRY00001661",
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "CRDT",
                "amount": {
                    "amount": "84.00",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "RCDT",
                    "subFamilyCode": "DMCT"
                },
                "accountServicerReference": "3e92ace5-7acf-42c5-8223-0df5c54b2b29",
                "entryReference": null,
                "additionalEntryInformation": "Credit from 2025-10-10",
                "transactions": []
            },
            {
                "entryId": "ENTRY00001662",
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "CRDT",
                "amount": {
                    "amount": "167.00",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "RCDT",
                    "subFamilyCode": "VCOM"
                },
                "accountServicerReference": "b45c50b8-b446-4be7-bcae-2c05a8794518",
                "entryReference": null,
                "additionalEntryInformation": "Credit from 2025-10-10",
                "transactions": []
            },
            {
                "entryId": "ENTRY00001663",
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "CRDT",
                "amount": {
                    "amount": "315.60",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "RCDT",
                    "subFamilyCode": "DMCT"
                },
                "accountServicerReference": "cbee7949-e3b3-470d-91f9-6e2e000e09ed",
                "entryReference": null,
                "additionalEntryInformation": "Credit from 2025-10-10",
                "transactions": []
            },
            {
                "entryId": "ENTRY00001664",
                "bookingDate": "2025-10-10",
                "valueDate": "2025-10-10",
                "entryStatus": "booked",
                "transactionType": "DBIT",
                "amount": {
                    "amount": "162.30",
                    "currency": "CHF"
                },
                "bankTransactionCode": {
                    "domainCode": "PMNT",
                    "familyCode": "ICDT",
                    "subFamilyCode": "XBCT"
                },
                "accountServicerReference": "5d6036fe-a20a-4088-9d96-fa89fea625b1",
                "entryReference": null,
                "additionalEntryInformation": "Debit from 2025-10-10",
                "transactions": []
            }
        ]
    },
    "meta": {
        "current_cursor": "",
        "next_cursor": ""
    }
```