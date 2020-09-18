// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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


/* Script update: 2020-09-18 */



/*
	Summary
	=======

	Extension that prints the Swiss QR-bill following technical implementation on https://www.paymentstandards.ch/dam/downloads/ig-qr-bill-en.pdf

	There are 3 types of QR-bill:
		1. QR-bill with QR-IBAN and QR Reference (QRR) => replace the orange ISR/ISR bank (es. "21 00000 00003 13947 14300 09017")
		2. QR-bill with IBAN and Creditor Reference (SCOR) => new reference number (es. "RF18 5390 0754 7034")
		3. QR-bill with IBAN without reference => replace the red IS

	Other:
		a) With (any amount and 0.00) or without amount (e.g for donation)
		b) With or without debtor
		c) With or without additional information (unstructured message)
		d) With or without billing information (structured message)
*/

var QRBill = class QRBill {

	constructor(banDoc, userParam)
	{
		this.version = '1.0';
		this.banDoc = banDoc;
		this.userParam = userParam;

		//flags to determine the type of qr-bill
		this.ID_QRBILL_WITH_QRIBAN_AND_QRR = false;
		this.ID_QRBILL_WITH_IBAN_AND_SCOR = false;
		this.ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE = false;
		this.ID_QRBILL_WITHOUT_AMOUNT = false;
		this.ID_QRBILL_WITHOUT_DEBTOR = false;

		//errors
		this.ID_ERR_CURRENCY = "ID_ERR_CURRENCY";
		this.ID_ERR_QRCODE = "ID_ERR_QRCODE";
		this.ID_ERR_QRIBAN = "ID_ERR_QRIBAN";
		this.ID_ERR_QRIBAN_WRONG = "ID_ERR_QRIBAN_WRONG";
		this.ID_ERR_IBAN = "ID_ERR_IBAN";
		this.ID_ERR_IBAN_WRONG = "ID_ERR_IBAN_WRONG";
		this.ID_ERR_CREDITORREFERENCE = "ID_ERR_CREDITORREFERENCE";
		this.ID_ERR_CREDITORREFERENCE_LENGHT = "ID_ERR_CREDITORREFERENCE_LENGHT";
		this.ID_ERR_DEBTOR_NAME = "ID_ERR_DEBTOR_NAME";
		//this.ID_ERR_DEBTOR_ADDRESS1 = "ID_ERR_DEBTOR_ADDRESS1";
		this.ID_ERR_DEBTOR_POSTALCODE = "ID_ERR_DEBTOR_POSTALCODE";
		this.ID_ERR_DEBTOR_CITY = "ID_ERR_DEBTOR_CITY";
		this.ID_ERR_DEBTOR_COUNTRY = "ID_ERR_DEBTOR_COUNTRY";
		this.ID_ERR_DEBTOR_COUNTRY_WRONG = "ID_ERR_DEBTOR_COUNTRY_WRONG";
		this.ID_ERR_CREDITOR_NAME = "ID_ERR_CREDITOR_NAME";
		//this.ID_ERR_CREDITOR_ADDRESS1 = "ID_ERR_CREDITOR_ADDRESS1";
		this.ID_ERR_CREDITOR_POSTALCODE = "ID_ERR_CREDITOR_POSTALCODE";
		this.ID_ERR_CREDITORR_CITY = "ID_ERR_CREDITORR_CITY";
		this.ID_ERR_CREDITOR_COUNTRY = "ID_ERR_CREDITOR_COUNTRY";
		this.ID_ERR_CREDITOR_COUNTRY_WRONG = "ID_ERR_CREDITOR_COUNTRY_WRONG";

		//swiss cross image
		this.swiss_cross = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOS44IDE5LjgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE5LjggMTkuODsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQoJLnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjEuNDM1NztzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cjwvc3R5bGU+Cjxwb2x5Z29uIHBvaW50cz0iMTguMywwLjcgMS42LDAuNyAwLjcsMC43IDAuNywxLjYgMC43LDE4LjMgMC43LDE5LjEgMS42LDE5LjEgMTguMywxOS4xIDE5LjEsMTkuMSAxOS4xLDE4LjMgMTkuMSwxLjYgMTkuMSwwLjcgIi8+CjxyZWN0IHg9IjguMyIgeT0iNCIgY2xhc3M9InN0MCIgd2lkdGg9IjMuMyIgaGVpZ2h0PSIxMSIvPgo8cmVjdCB4PSI0LjQiIHk9IjcuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjExIiBoZWlnaHQ9IjMuMyIvPgo8cG9seWdvbiBjbGFzcz0ic3QxIiBwb2ludHM9IjAuNywxLjYgMC43LDE4LjMgMC43LDE5LjEgMS42LDE5LjEgMTguMywxOS4xIDE5LjEsMTkuMSAxOS4xLDE4LjMgMTkuMSwxLjYgMTkuMSwwLjcgMTguMywwLjcgCgkxLjYsMC43IDAuNywwLjcgIi8+Cjwvc3ZnPgo=";

		//corner marks images
		this.corner_marks_receipt_payable_by_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNDguMiA1Ny41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNDguMiA1Ny41OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxtZXRhZGF0YT48P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MyA3OS4xNjEzNTYsIDIwMTcvMDkvMDctMDE6MTE6MjIgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiLz4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+PC9tZXRhZGF0YT4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc1O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KPC9zdHlsZT4KPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iOC41LDU3LjEgOC4zLDU3LjEgMC40LDU3LjEgMC40LDQ3LjggIi8+Cjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjE0Ny44LDQ3LjggMTQ3LjgsNTcuMSAxMzguOSw1Ny4xICIvPgo8cG9seWxpbmUgY2xhc3M9InN0MCIgcG9pbnRzPSIxMzguOSwwLjQgMTQ3LjgsMC40IDE0Ny44LDggMTQ3LjgsOC4xICIvPgo8cG9seWxpbmUgY2xhc3M9InN0MCIgcG9pbnRzPSIwLjQsOC4xIDAuNCw3LjkgMC40LDAuNCA4LjQsMC40IDguNSwwLjQgIi8+Cjwvc3ZnPgo=";
		this.corner_marks_receipt_amount_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA4NS44IDI5IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA4NS44IDI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxtZXRhZGF0YT48P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MyA3OS4xNjEzNTYsIDIwMTcvMDkvMDctMDE6MTE6MjIgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiLz4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+PC9tZXRhZGF0YT4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc1O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KPC9zdHlsZT4KPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iOC45LDI4LjcgOC43LDI4LjcgMC40LDI4LjcgMC40LDIwLjIgIi8+Cjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9Ijg1LjQsMjAuMiA4NS40LDI4LjcgNzYuOSwyOC43ICIvPgo8cG9seWxpbmUgY2xhc3M9InN0MCIgcG9pbnRzPSI3Ni45LDAuNCA4NS40LDAuNCA4NS40LDguNSA4NS40LDguOSAiLz4KPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iMC40LDguOSAwLjQsOC43IDAuNCwwLjQgOC43LDAuNCA4LjksMC40ICIvPgo8L3N2Zz4K";
		this.corner_marks_payment_payable_by_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxODQuMyA3MC45IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxODQuMyA3MC45OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHJlY3Qgd2lkdGg9IjguNSIgaGVpZ2h0PSIwLjgiLz4KCTxyZWN0IHg9Ii0zLjkiIHk9IjMuOSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEuODM2OTcwZS0xNiAxIC0xIC0xLjgzNjk3MGUtMTYgNC42MjcgMy44NzcpIiB3aWR0aD0iOC41IiBoZWlnaHQ9IjAuOCIvPgo8L2c+CjxnPgoJPHJlY3QgeD0iLTMuOSIgeT0iNjYuMiIgdHJhbnNmb3JtPSJtYXRyaXgoNi4xMjMyMzRlLTE3IC0xIDEgNi4xMjMyMzRlLTE3IC02Ni4yMzkyIDY2Ljk4OTIpIiB3aWR0aD0iOC41IiBoZWlnaHQ9IjAuOCIvPgoJPHJlY3QgeT0iNzAuMSIgd2lkdGg9IjguNSIgaGVpZ2h0PSIwLjgiLz4KPC9nPgo8Zz4KCTxyZWN0IHg9IjE3NS43IiB5PSI3MC4xIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAtMS4yMjQ2NDdlLTE2IDEuMjI0NjQ3ZS0xNiAtMSAzNjAgMTQwLjk4MjMpIiB3aWR0aD0iOC41IiBoZWlnaHQ9IjAuOCIvPgoJPHJlY3QgeD0iMTc5LjYiIHk9IjY2LjIiIHRyYW5zZm9ybT0ibWF0cml4KDYuMTIzMjM0ZS0xNyAtMSAxIDYuMTIzMjM0ZS0xNyAxMTcuMjYyOCAyNTAuNDkxMSkiIHdpZHRoPSI4LjUiIGhlaWdodD0iMC44Ii8+CjwvZz4KPGc+Cgk8cmVjdCB4PSIxNzkuNiIgeT0iMy45IiB0cmFuc2Zvcm09Im1hdHJpeCgtMS44MzY5NzBlLTE2IDEgLTEgLTEuODM2OTcwZS0xNiAxODguMTI4OSAtMTc5LjYyNSkiIHdpZHRoPSI4LjUiIGhlaWdodD0iMC44Ii8+Cgk8cmVjdCB4PSIxNzUuNyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgLTEuMjI0NjQ3ZS0xNiAxLjIyNDY0N2UtMTYgLTEgMzYwIDAuNzUpIiB3aWR0aD0iOC41IiBoZWlnaHQ9IjAuOCIvPgo8L2c+Cjwvc3ZnPgo=";
		this.corner_marks_payment_amount_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMTMuNCA0Mi41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMTMuNCA0Mi41OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHJlY3QgeD0iMCIgd2lkdGg9IjguNSIgaGVpZ2h0PSIwLjgiLz4KCTwvZz4KCTxnPgoJCTxyZWN0IHdpZHRoPSIwLjgiIGhlaWdodD0iOC41Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cmVjdCB4PSIwIiB5PSI0MS44IiB3aWR0aD0iOC41IiBoZWlnaHQ9IjAuOCIvPgoJPC9nPgoJPGc+CgkJPHJlY3QgeT0iMzQiIHdpZHRoPSIwLjgiIGhlaWdodD0iOC41Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cmVjdCB4PSIxMDQuOSIgd2lkdGg9IjguNSIgaGVpZ2h0PSIwLjgiLz4KCTwvZz4KCTxnPgoJCTxyZWN0IHg9IjExMi42IiB5PSIwIiB3aWR0aD0iMC44IiBoZWlnaHQ9IjguNSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHJlY3QgeD0iMTA0LjkiIHk9IjQxLjgiIHdpZHRoPSI4LjUiIGhlaWdodD0iMC44Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSIxMTIuNiIgeT0iMzQiIHdpZHRoPSIwLjgiIGhlaWdodD0iOC41Ii8+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==";
		
		//scissors image
		this.scissors_svg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA1MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwKSI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSIyOS45OCIgZmlsbD0id2hpdGUiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxKSI+CjxwYXRoIGQ9Ik01LjkwODE0IDAuODMwMDc4QzMuNTAwOTIgMS4wNTQ2OSAxLjQyMDg0IDIuNzU4NzkgMC45NDcyMDQgNC44OTc0NkMwLjgyMDI1MSA1LjQ1ODk4IDAuODMwMDE3IDYuNjk0MzQgMC45NjY3MzYgNy4yNDEyMUMxLjQ3NDU1IDkuMjgyMjMgMy4xMDA1MiAxMC45MzI2IDUuMDc4MDYgMTEuNDE2QzUuOTk2MDMgMTEuNjQwNiA2Ljc0Nzk5IDExLjY2OTkgOS45MzY0NiAxMS42MDE2QzEyLjA3MDMgMTEuNTU3NiAxMi41NjgzIDExLjU4MiAxMy41NjkzIDExLjc3MjVDMTUuNDE1IDEyLjEyODkgMTYuODU1NCAxMy4wNTE4IDE3Ljg0NjYgMTQuNTE2NkMxOC4xODM1IDE1LjAxOTUgMTguMTg4NCAxNC45ODA1IDE3Ljc0NDEgMTUuNjU0M0MxNy4zOTI1IDE2LjE4NjUgMTYuNDc0NSAxNy4xMjQgMTUuOTgxNCAxNy40NDYzQzE1LjIxOTcgMTcuOTQ5MiAxNC4zNDA4IDE4LjMwMDggMTMuMzQ5NSAxOC41MDFDMTIuNDE2OSAxOC42OTE0IDExLjg5OTQgMTguNzE1OCA5LjgzODgxIDE4LjY4MTZDOC42MDM0NSAxOC42NjIxIDcuNjgwNiAxOC42NzE5IDcuMzI0MTYgMTguNzA2MUM0LjU5NDY3IDE4Ljk1NTEgMi41MTk0NyAyMC4xNTE0IDEuNjE2MTUgMjEuOTk3MUMxLjAwMDkyIDIzLjI1MiAwLjkwODE0MiAyNC43MTY4IDEuMzY3MTMgMjYuMDg0QzEuNjQ1NDUgMjYuOTA5MiAyLjAxMTY2IDI3LjUxOTUgMi41NzMxOCAyOC4wOTA4QzMuMTM5NTkgMjguNjY3IDMuNzQwMTcgMjkuMDEzNyA0LjY2MzAyIDI5LjI5NjlDNS4zNzEwMyAyOS41MTE3IDUuODgzNzMgMjkuNTg5OCA2LjYzNTY4IDI5LjU4OThDOS4wMTM2MSAyOS41ODk4IDEwLjk5MTEgMjguNDk2MSAxMS44ODk2IDI2LjY4NDZDMTIuMjgwMiAyNS44OTg0IDEyLjM3MyAyNS40OTMyIDEyLjM3MyAyNC41NjA1QzEyLjM3NzkgMjMuNjcxOSAxMi4zMTQ0IDIzLjM4ODcgMTEuODg5NiAyMi4zMjkxQzExLjU1NzYgMjEuNDk5IDExLjQ5NDEgMjEuMjM1NCAxMS41NjczIDIwLjk2MTlDMTEuNjc5NiAyMC41NDIgMTEuOTc3NSAyMC40MTk5IDEzLjY0MjUgMjAuMTEyM0MxNi42MTEzIDE5LjU3MDMgMTguNjU3MiAxOC45NjQ4IDIxLjI0NTEgMTcuODU2NEwyMS43NTc3IDE3LjYzNjdMMzEuNjg0NSAyMS4wOTg2QzQyLjI4NTEgMjQuNzk5OCA0Mi4wOCAyNC43MzE0IDQzLjM4MzcgMjQuODU4NEM0NS4wNjgzIDI1LjAyNDQgNDYuNzg3IDI0LjYzMzggNDcuOTg4MiAyMy44MTg0QzQ4LjQ3MTYgMjMuNDkxMiA0OS4zMTYzIDIyLjczOTMgNDkuMjYyNiAyMi42ODU1QzQ5LjI1MjkgMjIuNjcwOSA0NC43MTY3IDIwLjk3MTcgMzkuMTg0NSAxOC45MDE0QzMzLjY1MjMgMTYuODMxMSAyOS4wNjczIDE1LjEwNzQgMjguOTk0MSAxNS4wNzMyQzI4Ljg3MiAxNS4wMTk1IDI5LjQ3MjYgMTQuNzc1NCAzOC4wMjczIDExLjQyNThDNDkuNzYwNyA2LjgzMTA1IDQ5LjAyMzQgNy4xMjQwMiA0OS4wMjM0IDcuMDcwMzFDNDkuMDIzNCA2Ljk3NzU0IDQ4LjI2NjUgNi4yODkwNiA0Ny44ODA4IDYuMDMwMjdDNDYuOTUzMSA1LjQxNTA0IDQ1LjkwMzMgNS4wODMwMSA0NC41ODQ5IDQuOTgwNDdDNDMuNDY2NyA0Ljg5NzQ2IDQyLjAzMTIgNS4wNjgzNiA0MC44OTM1IDUuNDI0OEM0MC42MjQ5IDUuNTA3ODEgMzYuMjc0MyA3LjEzODY3IDMxLjIyNTUgOS4wNDI5N0MyNi4xNzY3IDEwLjk1MjEgMjIuMDA2OCAxMi41MjQ0IDIxLjk2MjggMTIuNTM5MUMyMS45MTQgMTIuNTQ4OCAyMS42MDE1IDEyLjQyNjggMjEuMjc0NCAxMi4yNjU2QzIwLjE2MTEgMTEuNzE4OCAxOC45NjQ4IDExLjI3OTMgMTcuNjUxMyAxMC45Mzc1QzE2LjU2NzMgMTAuNjU0MyAxNi4xNjIgMTAuNTcxMyAxNC40MzM1IDEwLjI3ODNDMTIuMjA3IDkuODk3NDYgMTEuNzI4NSA5Ljc2MDc0IDExLjQ3OTQgOS40NDMzNkMxMS4yODQxIDkuMTk0MzQgMTEuMzMyOSA4Ljk0NTMxIDExLjcxODcgOC4xNzg3MUMxMS45Nzc1IDcuNjY2MDIgMTIuMDggNy40MDIzNCAxMi4xMzM3IDcuMTE0MjZDMTIuMjIxNiA2LjY2MDE2IDEyLjIzMTQgNS4zODA4NiAxMi4xNTMzIDQuOTUxMTdDMTEuODA2NiAyLjk4ODI4IDEwLjA5MjcgMS4zNzIwNyA3Ljg2MTI3IDAuOTAzMzJDNy40MDcxNiAwLjgwNTY2NCA2LjUxODQ5IDAuNzc2MzY3IDUuOTA4MTQgMC44MzAwNzhaTTcuMzI0MTYgMi42NDY0OEM5LjMzNTg4IDMuMDI3MzQgMTAuNzQyMSA1LjE3MDkgMTAuMzIyMiA3LjIxNjhDMTAuMDU4NSA4LjUxNTYyIDkuMjY3NTIgOS4zNzUgNy45NTg5MiA5Ljc5MDA0QzUuODM0OSAxMC40NTkgMy4yMjc0OCA4Ljk1MDIgMi43Mjk0MyA2Ljc2MjdDMi41NzgwNiA2LjA5Mzc1IDIuNzI0NTUgNS4xMjY5NSAzLjA4NTg4IDQuNDI4NzFDMy43ODQxMiAzLjA4MTA1IDUuNTkwNzYgMi4zMTkzNCA3LjMyNDE2IDIuNjQ2NDhaTTcuODc1OTEgMjAuNTU2NkM4LjA4NTg4IDIwLjYwNTUgOC40NjE4NSAyMC43NTIgOC43MTU3NiAyMC44NzRDOS45NjA4OCAyMS40Njk3IDEwLjYwNTQgMjIuNjM2NyAxMC41MzIyIDI0LjE2NUMxMC40Njg3IDI1LjU3NjIgOS43OTQ4NiAyNi43NjI3IDguNzQwMTcgMjcuMzE0NUM4LjMyNTEzIDI3LjUzNDIgNy40ODUyOSAyNy43Njg2IDYuOTY3NzEgMjcuODEyNUM2LjE5MTM0IDI3Ljg3NiA1LjExNzEzIDI3LjYzMTggNC40NjI4MyAyNy4yNDEyQzQuMDk2NjIgMjcuMDIxNSAzLjYxMzIyIDI2LjU3MjMgMy4zOTM0OSAyNi4yNDUxQzIuNjg1NDkgMjUuMTc1OCAyLjc1ODczIDIzLjYyNzkgMy41NzQxNiAyMi40MDcyQzQuNTU1NiAyMC45MzI2IDYuMzQ3NTkgMjAuMTY2IDcuODc1OTEgMjAuNTU2NloiIGZpbGw9ImJsYWNrIi8+CjwvZz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMCI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSIyOS45OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMSI+CjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSIyOS45ODA1IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";
	}

	/**
	 * Defines errors messages on different languages.
	 */
	getErrorMessage(errorId, lang, value)
	{
		if (!lang) {
			lang = 'en';
		}
		switch (errorId) {
			case this.ID_ERR_CURRENCY:
				if (lang === 'it') {
					return "La stampa del QrCode è disponibile solamente per fatture in CHF o EUR";
				} else if (lang === 'fr') {
					return "L'impression du QrCode n'est disponible que pour les factures en CHF ou EUR";
				} else if (lang === 'de') {
					return "QR-Code-Druck ist nur für Rechnungen in CHF oder EUR verfügbar";
				} else {
					return "QrCode printing is only available for invoices in CHF or EUR";
				}
			case this.ID_ERR_QRCODE:
				if (lang === 'it') {
					return "Errore nella creazione del QrCode: %1";
				} else if (lang === 'fr') {
					return "Erreur lors de la création du QrCode : %1";
				} else if (lang === 'de') {
					return "Fehler beim Erstellen des QR-Codes: %1";
				} else {
					return "Error creating QrCode: %1";
				}
			case this.ID_ERR_QRIBAN:
				if (lang === 'it') {
					return "QR-IBAN mancante";
				} else if (lang === 'fr') {
					return "QR-IBAN est manquant";
				} else if (lang === 'de') {
					return "QR-IBAN fehlt";
				} else {
					return "Missing QR-IBAN";
				}
			case this.ID_ERR_QRIBAN_WRONG:
				if (lang === 'it') {
					return "QR-IBAN non corretto: "+ value;
				} else if (lang === 'fr') {
					return "QR-IBAN est incorrect: "+ value;
				} else if (lang === 'de') {
					return "Falscher QR-IBAN: "+ value;
				} else {
					return "Incorrect QR-IBAN: "+ value;
				}
			case this.ID_ERR_IBAN:
				if (lang === 'it') {
					return "IBAN mancante";
				} else if (lang === 'fr') {
					return "IBAN est manquant";
				} else if (lang === 'de') {
					return "IBAN fehlt";
				} else {
					return "Missing IBAN";
				}
			case this.ID_ERR_IBAN_WRONG:
				if (lang === 'it') {
					return "IBAN non corretto: "+ value;
				} else if (lang === 'fr') {
					return "IBAN est incorrect: "+ value;
				} else if (lang === 'de') {
					return "Falscher IBAN: "+ value;
				} else {
					return "Incorrect IBAN: "+ value;
				}
			case this.ID_ERR_CREDITORREFERENCE:
				if (lang === 'it') {
					return "Numero di riferimento creditore non valido";
				} else if (lang === 'fr') {
					return "Numéro de référence du créancier non valide";
				} else if (lang === 'de') {
					return "Referenznummer Begünstigter ungültig";
				} else {
					return "Creditor reference number not valid";
				}
			case this.ID_ERR_CREDITORREFERENCE_LENGHT:
				if (lang === 'it') {
					return "Numero cliente + numero fattura troppo lungo, max 21 cifre: " + value;
				} else if (lang === 'fr') {
					return "Numéro client + numéro facture trop long, 21 chiffres maximum: " + value;
				} else if (lang === 'de') {
					return "Kundennummer + Rechnungsnummer zu lang, max. 21 Ziffern: " + value;
				} else {
					return "Customer number + invoice number too long, max 21 digits: " + value;
				}
			case this.ID_ERR_DEBTOR_NAME:
				if (lang === 'it') {
					return "Indirizzo: nome/società mancante";
				} else if (lang === 'fr') {
					return "Adresse: nom/société est manquant";
				} else if (lang === 'de') {
					return "Adresse: Name/Firma fehlt";
				} else {
					return "Address: missing name/business";
				}
			// case this.ID_ERR_DEBTOR_ADDRESS1:
			// 	if (lang === 'it') {
			// 		return "Indirizzo: indirizzo mancante";
			// 	} else if (lang === 'fr') {
			// 		return "Adresse: adresse est manquante";
			// 	} else if (lang === 'de') {
			// 		return "Adresse: Adresse fehlt";
			// 	} else {
			// 		return "Address: missing address";
			// 	}
			case this.ID_ERR_DEBTOR_POSTALCODE:
				if (lang === 'it') {
					return "Indirizzo: CAP mancante";
				} else if (lang === 'fr') {
					return "Adresse: code postal NPA est manquant";
				} else if (lang === 'de') {
					return "Adresse: PLZ fehlt";
				} else {
					return "Address: missing ZIP code";
				}
			case this.ID_ERR_DEBTOR_CITY:
				if (lang === 'it') {
					return "Indirizzo: località mancante";
				} else if (lang === 'fr') {
					return "Adresse: localité est manquante";
				} else if (lang === 'de') {
					return "Adresse: Ort fehlt";
				} else {
					return "Address: missing locality";
				}
			case this.ID_ERR_DEBTOR_COUNTRY:
				if (lang === 'it') {
					return "Indirizzo: codice nazione mancante";
				} else if (lang === 'fr') {
					return "Adresse: code du pays est manquant";
				} else if (lang === 'de') {
					return "Adresse: Ländercode fehlt";
				} else {
					return "Address: missing country code";
				}
			case this.ID_ERR_DEBTOR_COUNTRY_WRONG:
				if (lang === 'it') {
					return "Indirizzo: codice nazione non corretto";
				} else if (lang === 'fr') {
					return "Adresse: code du pays est incorrect";
				} else if (lang === 'de') {
					return "Adresse: Falscher Ländercode";
				} else {
					return "Address: Incorrect country code";
				}
			case this.ID_ERR_CREDITOR_NAME:
				if (lang === 'it') {
					return "Indirizzo: nome/società mancante";
				} else if (lang === 'fr') {
					return "Adresse: nom/société est manquant";
				} else if (lang === 'de') {
					return "Adresse: Name/Firma fehlt";
				} else {
					return "Address: missing name/business";
				}
			// case this.ID_ERR_CREDITOR_ADDRESS1:
			// 	if (lang === 'it') {
			// 		return "Indirizzo: indirizzo mancante";
			// 	} else if (lang === 'fr') {
			// 		return "Adresse: adresse est manquante";
			// 	} else if (lang === 'de') {
			// 		return "Adresse: Adresse fehlt";
			// 	} else {
			// 		return "Address: missing address";
			// 	}
			case this.ID_ERR_CREDITOR_POSTALCODE:
				if (lang === 'it') {
					return "Indirizzo: CAP mancante";
				} else if (lang === 'fr') {
					return "Adresse: code postal NPA est manquant";
				} else if (lang === 'de') {
					return "Adresse: PLZ fehlt";
				} else {
					return "Address: missing ZIP code";
				}
			case this.ID_ERR_CREDITOR_CITY:
				if (lang === 'it') {
					return "Indirizzo: località mancante";
				} else if (lang === 'fr') {
					return "Adresse: localité est manquante";
				} else if (lang === 'de') {
					return "Adresse: Ort fehlt";
				} else {
					return "Address: missing locality";
				}
			case this.ID_ERR_CREDITOR_COUNTRY:
				if (lang === 'it') {
					return "Indirizzo: codice nazione mancante";
				} else if (lang === 'fr') {
					return "Adresse: code du pays est manquant";
				} else if (lang === 'de') {
					return "Adresse: Ländercode fehlt";
				} else {
					return "Address: missing country code";
				}
			case this.ID_ERR_CREDITOR_COUNTRY_WRONG:
				if (lang === 'it') {
					return "Indirizzo: codice nazione non corretto";
				} else if (lang === 'fr') {
					return "Adresse: code du pays est incorrect";
				} else if (lang === 'de') {
					return "Adresse: Falscher Ländercode";
				} else {
					return "Address: Incorrect country code";
				}
		}
		return "";
	}


	/**
	 * Defines the QR parameters of the invoice settings
	 */
	convertParamQR(convertedParam, userParam, texts) 
	{
		var currentParam = {};
		currentParam.name = 'qr_code';
		currentParam.parentObject = '';
		currentParam.title = texts.param_qr_code;
		currentParam.type = 'string';
		currentParam.value = '';
		currentParam.editable = false;
		currentParam.readValue = function() {
			userParam.qr_code = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_add';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_add;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_add ? true : false;
		currentParam.defaultvalue = true;
		currentParam.tooltip = texts.param_tooltip_qr_code_add;
		currentParam.readValue = function() {
		userParam.qr_code_add = this.value;
			if (userParam.qr_code_add) { //remove footer when qr code is added
				userParam.footer_add = false;
			}
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_reference_type';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_reference_type;
		currentParam.type = 'combobox';
		currentParam.items = ["SCOR","NON","QRR"];
		currentParam.value = userParam.qr_code_reference_type ? userParam.qr_code_reference_type : '';
		currentParam.defaultvalue = "SCOR";
		currentParam.tooltip = texts.param_tooltip_qr_code_reference_type;
		currentParam.readValue = function () {
			userParam.qr_code_reference_type = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_scor_non';
		currentParam.parentObject = 'qr_code';
		currentParam.title = "SCOR / NON";
		currentParam.type = 'string';
		currentParam.value = '';
		currentParam.editable = false;
		currentParam.readValue = function() {
			userParam.qr_code_scor_non = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_iban';
		currentParam.parentObject = 'qr_code_scor_non';
		currentParam.title = texts.param_qr_code_iban;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_iban ? userParam.qr_code_iban : '';
		currentParam.defaultvalue = '';
		currentParam.tooltip = texts.param_tooltip_qr_code_iban;
		currentParam.readValue = function() {
			userParam.qr_code_iban = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_iban_eur';
		currentParam.parentObject = 'qr_code_scor_non';
		currentParam.title = texts.param_qr_code_iban_eur;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_iban_eur ? userParam.qr_code_iban_eur : '';
		currentParam.defaultvalue = '';
		currentParam.tooltip = texts.param_tooltip_qr_code_iban_eur;
		currentParam.readValue = function() {
			userParam.qr_code_iban_eur = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_qrr';
		currentParam.parentObject = 'qr_code';
		currentParam.title = "QRR";
		currentParam.type = 'string';
		currentParam.value = '';
		currentParam.editable = false;
		currentParam.readValue = function() {
			userParam.qr_code_qrr = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_qriban';
		currentParam.parentObject = 'qr_code_qrr';
		currentParam.title = texts.param_qr_code_qriban;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_qriban ? userParam.qr_code_qriban : '';
		currentParam.defaultvalue = '';
		currentParam.tooltip = texts.param_tooltip_qr_code_qriban;
		currentParam.readValue = function() {
			userParam.qr_code_qriban = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_isr_id';
		currentParam.parentObject = 'qr_code_qrr';
		currentParam.title = texts.param_qr_code_isr_id;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_isr_id ? userParam.qr_code_isr_id : '';
		currentParam.defaultvalue = '';
		currentParam.tooltip = texts.param_tooltip_qr_code_isr_id;
		currentParam.readValue = function() {
			userParam.qr_code_isr_id = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_payable_to';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_payable_to;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_payable_to ? true : false;
		currentParam.defaultvalue = false;
		currentParam.readValue = function() {
			userParam.qr_code_payable_to = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_name';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_name;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_name ? userParam.qr_code_creditor_name : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_name;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_name = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_address1';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_address1;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_address1 ? userParam.qr_code_creditor_address1 : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_address1;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_address1 = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_address2';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_address2;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_address2 ? userParam.qr_code_creditor_address2 : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_address2;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_address2 = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_postalcode';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_postalcode;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_postalcode ? userParam.qr_code_creditor_postalcode : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_postalcode;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_postalcode = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_city';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_city;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_city ? userParam.qr_code_creditor_city : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_city;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_city = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_creditor_country';
		currentParam.parentObject = 'qr_code_payable_to';
		currentParam.title = texts.param_qr_code_creditor_country;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_creditor_country ? userParam.qr_code_creditor_country : '';
		currentParam.defaultvalue = "";
		currentParam.tooltip = texts.param_tooltip_qr_code_creditor_country;
		currentParam.readValue = function() {
			userParam.qr_code_creditor_country = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_debtor_address_type';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_debtor_address_type;
		currentParam.type = 'combobox';
		currentParam.items = ["K","S"];
		currentParam.value = userParam.qr_code_debtor_address_type ? userParam.qr_code_debtor_address_type : '';
		currentParam.defaultvalue = "K";
		currentParam.tooltip = texts.param_tooltip_qr_code_debtor_address_type;
		currentParam.readValue = function () {
			userParam.qr_code_debtor_address_type = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_additional_information';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_additional_information;
		currentParam.type = 'string';
		currentParam.value = userParam.qr_code_additional_information ? userParam.qr_code_additional_information : '';
		currentParam.defaultvalue = 'Notes';
		currentParam.tooltip = texts.param_tooltip_qr_code_additional_information;
		currentParam.readValue = function() {
			userParam.qr_code_additional_information = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_billing_information';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_billing_information;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_billing_information ? true : false;
		currentParam.defaultvalue = false;
		currentParam.tooltip = texts.param_tooltip_qr_code_billing_information;
		currentParam.readValue = function() {
			userParam.qr_code_billing_information = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_empty_address';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_empty_address;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_empty_address ? true : false;
		currentParam.defaultvalue = false;
		currentParam.tooltip = texts.param_tooltip_qr_code_empty_address;
		currentParam.readValue = function() {
			userParam.qr_code_empty_address = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_empty_amount';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_empty_amount;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_empty_amount ? true : false;
		currentParam.defaultvalue = false;
		currentParam.tooltip = texts.param_tooltip_qr_code_empty_amount;
		currentParam.readValue = function() {
			userParam.qr_code_empty_amount = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_add_border_separator';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_add_border_separator;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_add_border_separator ? true : false;
		currentParam.defaultvalue = true;
		currentParam.tooltip = texts.param_tooltip_qr_code_add_border_separator;
		currentParam.readValue = function() {
			userParam.qr_code_add_border_separator = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_add_symbol_scissors';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_add_symbol_scissors;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_add_symbol_scissors ? true : false;
		currentParam.defaultvalue = true;
		currentParam.tooltip = texts.param_tooltip_qr_code_add_symbol_scissors;
		currentParam.readValue = function() {
			userParam.qr_code_add_symbol_scissors = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_new_page';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_new_page;
		currentParam.type = 'bool';
		currentParam.value = userParam.qr_code_new_page ? true : false;
		currentParam.defaultvalue = false;
		currentParam.tooltip = texts.qr_code_new_page;
		currentParam.readValue = function() {
			userParam.qr_code_new_page = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_position_dX';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_position_dX;
		currentParam.type = 'number';
		currentParam.value = userParam.qr_code_position_dX ? userParam.qr_code_position_dX : '0';
		currentParam.defaultvalue = '0';
		currentParam.readValue = function() {
			userParam.qr_code_position_dX = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = 'qr_code_position_dY';
		currentParam.parentObject = 'qr_code';
		currentParam.title = texts.param_qr_code_position_dY;
		currentParam.type = 'number';
		currentParam.value = userParam.qr_code_position_dY ? userParam.qr_code_position_dY : '0';
		currentParam.defaultvalue = '0';
		currentParam.readValue = function() {
			userParam.qr_code_position_dY = this.value;
		}
		convertedParam.data.push(currentParam);
	}
	

	/**
	 * Initializes the QR parameters of the invoice settings
	 */
	initParamQR(userParam)
	{
		userParam.qr_code_add = true;
		userParam.qr_code_reference_type = 'SCOR';
		userParam.qr_code_qriban = '';
		userParam.qr_code_iban = '';
		userParam.qr_code_iban_eur = '';
		userParam.qr_code_isr_id = '';
		userParam.qr_code_payable_to = false;
		userParam.qr_code_creditor_name = "";
		userParam.qr_code_creditor_address1 = "";
		userParam.qr_code_creditor_address2 = "";
		userParam.qr_code_creditor_postalcode = "";
		userParam.qr_code_creditor_city = "";
		userParam.qr_code_creditor_country = "";
		userParam.qr_code_debtor_address_type = 'K';
		userParam.qr_code_additional_information = 'Notes';
		userParam.qr_code_billing_information = false;
		userParam.qr_code_empty_address = false;
		userParam.qr_code_empty_amount = false;
		userParam.qr_code_add_border_separator = true;
		userParam.qr_code_add_symbol_scissors = false;
		userParam.qr_code_new_page = false;
		userParam.qr_code_position_dX = '0';
		userParam.qr_code_position_dY = '0';
	}


	/**
	 * Verifies the QR parameters of the settings dialog
	 */
	verifyParamQR(userParam)
	{
		if (!userParam.qr_code_add) {
			userParam.qr_code_add = false;
		}
		if (!userParam.qr_code_reference_type) {
			userParam.qr_code_reference_type = 'SCOR';
		}
		if (!userParam.qr_code_qriban) {
			userParam.qr_code_qriban = '';
		}
		if (!userParam.qr_code_iban) {
			userParam.qr_code_iban = '';
		}
		if (!userParam.qr_code_iban_eur) {
			userParam.qr_code_iban_eur = '';
		}
		if (!userParam.qr_code_isr_id) {
			userParam.qr_code_isr_id = '';
		}
		if (!userParam.qr_code_payable_to) {
			userParam.qr_code_payable_to = false;
		}
		if (!userParam.qr_code_creditor_name) {
			userParam.qr_code_creditor_name = '';
		}
		if (!userParam.qr_code_creditor_address1) {
			userParam.qr_code_creditor_address1 = '';
		}
		if (!userParam.qr_code_creditor_address2) {
			userParam.qr_code_creditor_address2 = '';
		}
		if (!userParam.qr_code_creditor_postalcode) {
			userParam.qr_code_creditor_postalcode = '';
		}
		if (!userParam.qr_code_creditor_city) {
			userParam.qr_code_creditor_city = '';
		}
		if (!userParam.qr_code_creditor_country) {
			userParam.qr_code_creditor_country = '';
		}
		if (!userParam.qr_code_debtor_address_type) {
			userParam.qr_code_debtor_address_type = 'K';
		}
		if (!userParam.qr_code_additional_information) {
			userParam.qr_code_additional_information = '';
		}
		if (!userParam.qr_code_billing_information) {
			userParam.qr_code_billing_information = '';
		}
		if (!userParam.qr_code_empty_address) {
			userParam.qr_code_empty_address = false;
		}
		if (!userParam.qr_code_empty_amount) {
			userParam.qr_code_empty_amount = false;
		}
		if (!userParam.qr_code_add_border_separator) {
			userParam.qr_code_add_border_separator = false;
		}
		if (!userParam.qr_code_add_symbol_scissors) {
			userParam.qr_code_add_symbol_scissors = false;
		}
		if (!userParam.qr_code_new_page) {
			userParam.qr_code_new_page = false;
		}
		if (!userParam.qr_code_position_dX) {
			userParam.qr_code_position_dX = '0';
		}
		if (!userParam.qr_code_position_dY) {
			userParam.qr_code_position_dY = '0';
		}
	}


	/**
	 * Defines translations texts for the QRCode section of the invoice settings parmaters.
	 */
	setQrSettingsTexts(lang, texts)
	{
		if (lang === 'it') {
			texts.param_qr_code = "Codice QR";
			texts.param_qr_code_add = "Stampa codice QR";
			texts.param_qr_code_reference_type = "Tipo riferimento QR";
			texts.param_qr_code_qriban = "QR-IBAN";
			texts.param_qr_code_iban = "IBAN";
			texts.param_qr_code_iban_eur = "IBAN EUR";
			texts.param_qr_code_isr_id = "Numero adesione (solo con conto bancario, con conto postale lasciare vuoto)";
			texts.param_qr_code_payable_to = "Pagabile a";
			texts.param_qr_code_creditor_name = "Nome";
			texts.param_qr_code_creditor_address1 = "Indirizzo";
			texts.param_qr_code_creditor_address2 = "Numero civico";
			texts.param_qr_code_creditor_postalcode = "Codice postale";
			texts.param_qr_code_creditor_city = "Località";
			texts.param_qr_code_creditor_country = "Codice nazione";
			texts.param_qr_code_add_border_separator = "Stampa bordo di separazione";
			texts.param_qr_code_add_symbol_scissors = "Stampa simbolo forbici";
			texts.param_qr_code_debtor_address_type = "Tipo indirizzo cliente (S=strutturato, K=combinato)";
			texts.param_qr_code_additional_information = "Includi informazioni aggiuntive (nome colonna XML)";
			texts.param_qr_code_billing_information = "Includi informazioni di fatturazione";
			texts.param_qr_code_empty_address = "Escludi indirizzo fattura";
			texts.param_qr_code_empty_amount = "Escludi importo fattura";
			texts.param_qr_code_new_page = "QR su pagina separata";
			texts.param_qr_code_position_dX = 'Sposta orizzontalmente +/- (in mm, default 0)';
			texts.param_qr_code_position_dY = 'Sposta verticalmente +/- (in mm, default 0)';
			texts.param_tooltip_qr_code_add = "Vista per stampare il codice QR";
			texts.param_tooltip_qr_code_reference_type = "Seleziona il tipo di riferimento QR da utilizzare";
			texts.param_tooltip_qr_code_qriban = "Inserisci il codice QR-IBAN";
			texts.param_tooltip_qr_code_iban = "Inserisci il codice IBAN";
			texts.param_tooltip_qr_code_iban_eur = "Inserisci il codice IBAN";
			texts.param_tooltip_qr_code_isr_id = "Inserisci il numero di adesione";
			texts.param_tooltip_qr_code_creditor_name = "Nome";
			texts.param_tooltip_qr_code_creditor_address1 = "Indirizzo";
			texts.param_tooltip_qr_code_creditor_address2 = "Inserisci il numero civico";
			texts.param_tooltip_qr_code_creditor_postalcode = "Codice postale";
			texts.param_tooltip_qr_code_creditor_city = "Località";
			texts.param_tooltip_qr_code_creditor_country = "Codice nazione";
			texts.param_tooltip_qr_code_debtor_address_type = "Seleziona il tipo di indirizzo da utilizzare (S=Indirizzo strutturato, K=Indirizzo combinato)";
			texts.param_tooltip_qr_code_additional_information = "Inserisci il nome XML della colonna che contiene le informazioni aggiuntive";
			texts.param_tooltip_qr_code_empty_address = "Vista per escludere l'indirizzo di fatturazione";
			texts.param_tooltip_qr_code_empty_amount = "Vista per escludere l'importo della fattura";
			texts.param_tooltip_qr_code_add_border_separator = "Vista per stampare il bordo di separazione";
			texts.param_tooltip_qr_code_add_symbol_scissors = "Vista per stampare il simbolo forbici";
			texts.param_tooltip_qr_code_new_page = "Vista per stampare il QR su una pagina separata";
		}
		else if (lang === 'de') {
			texts.param_qr_code = "QR-Code";
			texts.param_qr_code_add = "QR-Code drucken";
			texts.param_qr_code_reference_type = "QR-Referenztyp";
			texts.param_qr_code_qriban = "QR-IBAN";
			texts.param_qr_code_iban = "IBAN";
			texts.param_qr_code_iban_eur = "IBAN EUR";
			texts.param_qr_code_isr_id = "Teilnehmernummer (nur Bankkonto, mit Postkonto leer lassen)";
			texts.param_qr_code_payable_to = "Zahlbar an";
			texts.param_qr_code_creditor_name = "Name";
			texts.param_qr_code_creditor_address1 = "Adresse";
			texts.param_qr_code_creditor_address2 = "Hausnummer";
			texts.param_qr_code_creditor_postalcode = "PLZ";
			texts.param_qr_code_creditor_city = "Ort";
			texts.param_qr_code_creditor_country = "Ländercode";
			texts.param_qr_code_add_border_separator = "Trennlinie drucken";
			texts.param_qr_code_add_symbol_scissors = "Scherensymbol drucken";
			texts.param_qr_code_debtor_address_type = "Kunden-Address-Typ (S=Strukturierte Adresse, K=Kombinierte Adresse)";
			texts.param_qr_code_additional_information = "XML-Namen der Spalte mit zusätzlichen Informationen angeben";
			texts.param_qr_code_billing_information = "Rechnungsinformationen einschliessen";
			texts.param_qr_code_empty_address = "Rechnungsadresse ausschliessen";
			texts.param_qr_code_empty_amount = "Rechnungsbetrag ausschliessen";
			texts.param_qr_code_new_page = "QR-Code auf neuer Seite drucken";
			texts.param_qr_code_position_dX = 'Horizontal verschieben +/- (in mm, Voreinstellung 0)';
			texts.param_qr_code_position_dY = 'Vertikal verschieben +/- (in mm, Voreinstellung 0)';
			texts.param_tooltip_qr_code_add = "Anklicken zum Drucken des QR-Codes";
			texts.param_tooltip_qr_code_reference_type = "QR-Referenztyp auswählen";
			texts.param_tooltip_qr_code_qriban = "QR-IBAN-Code eingeben";
			texts.param_tooltip_qr_code_iban = "IBAN-Code eingeben";
			texts.param_tooltip_qr_code_iban_eur = "IBAN-Code eingeben";
			texts.param_tooltip_qr_code_isr_id = "Teilnehmernummer eingeben";
			texts.param_tooltip_qr_code_creditor_name = "Name";
			texts.param_tooltip_qr_code_creditor_address1 = "Adresse";
			texts.param_tooltip_qr_code_creditor_address2 = "Hausnummer";
			texts.param_tooltip_qr_code_creditor_postalcode = "PLZ";
			texts.param_tooltip_qr_code_creditor_city = "Ort";
			texts.param_tooltip_qr_code_creditor_country = "Ländercode";
			texts.param_tooltip_qr_code_debtor_address_type = "Address-Typ auswählen (S=Strukturierte Adresse, K=Kombinierte Adresse)";
			texts.param_tooltip_qr_code_additional_information = "XML-Spaltennamen eingeben, der die zusätzlichen Informationen enthält";
			texts.param_tooltip_qr_code_empty_address = "Option anklicken, zum Ausschliessen der Rechnungsadresse";
			texts.param_tooltip_qr_code_empty_amount = "Option anklicken, zum Ausschliessen des Rechnungsbetrags";
			texts.param_tooltip_qr_code_add_border_separator = "Option anklicken, zum Drucken der Trennlinie";
			texts.param_tooltip_qr_code_add_symbol_scissors = "Option anklicken, zum Drucken des Scherensymbols";
			texts.param_tooltip_qr_code_new_page = "Option anklicken, zum Drucken des QR-Codes auf separater Seite";
		}
		else if (lang === 'fr') {
			texts.param_qr_code = "QR Code";
			texts.param_qr_code_add = "Imprimer QR Code";
			texts.param_qr_code_reference_type = "Type de référence QR";
			texts.param_qr_code_qriban = "QR-IBAN";
			texts.param_qr_code_iban = "IBAN";
			texts.param_qr_code_iban_eur = "IBAN EUR";
			texts.param_qr_code_isr_id = "Numéro d'adhésion (seulement avec compte bancaire, avec compte postal laisser vide)";
			texts.param_qr_code_payable_to = "Payable à";
			texts.param_qr_code_creditor_name = "Nom";
			texts.param_qr_code_creditor_address1 = "Adresse";
			texts.param_qr_code_creditor_address2 = "Numéro d’immeuble";
			texts.param_qr_code_creditor_postalcode = "Code postal NPA";
			texts.param_qr_code_creditor_city = "Localité";
			texts.param_qr_code_creditor_country = "Code du pays";
			texts.param_qr_code_add_border_separator = "Impression de la bordure de séparation";
			texts.param_qr_code_add_symbol_scissors = "Imprimer le symbole des ciseaux";
			texts.param_qr_code_debtor_address_type = "Type d'adresse du client (S=structurée K=combinée)";
			texts.param_qr_code_additional_information = "Inclure des informations supplémentaires (nom colonne XML)";
			texts.param_qr_code_billing_information = "Inclure les informations de facturation";
			texts.param_qr_code_empty_address = "Exclure l'adresse de facturation";
			texts.param_qr_code_empty_amount = "Exclure le montant de facturation";
			texts.param_qr_code_new_page = "Imprimer le code QR sur une nouvelle page";
			texts.param_qr_code_position_dX = 'Déplacer horizontalement +/- (en mm, défaut 0)';
			texts.param_qr_code_position_dY = 'Déplacer verticalement +/- (en mm, défaut 0)';
			texts.param_tooltip_qr_code_add = "Cocher pour imprimer le bulletin de versement du QR Code";
			texts.param_tooltip_qr_code_reference_type = "Sélectionner le type de référence QR à utiliser";
			texts.param_tooltip_qr_code_qriban = "Saisir le code QR-IBAN";
			texts.param_tooltip_qr_code_iban = "Saisir le code IBAN";
			texts.param_tooltip_qr_code_iban_eur = "Saisir le code IBAN";
			texts.param_tooltip_qr_code_isr_id = "Saisir le numéro d'adhésion";
			texts.param_tooltip_qr_code_creditor_name = "Nom";
			texts.param_tooltip_qr_code_creditor_address1 = "Adresse";
			texts.param_tooltip_qr_code_creditor_address2 = "Numéro d’immeuble";
			texts.param_tooltip_qr_code_creditor_postalcode = "Code postal NPA";
			texts.param_tooltip_qr_code_creditor_city = "Localité";
			texts.param_tooltip_qr_code_creditor_country = "Code du pays";
			texts.param_tooltip_qr_code_debtor_address_type = "Sélectionner le type d'adresse à utiliser (S=Adresse structurée K=Adresse combinée)";
			texts.param_tooltip_qr_code_additional_information = "Saisir le nom de la colonne XML qui contient les informations complémentaires";
			texts.param_tooltip_qr_code_empty_address = "Cocher pour exclure l'adresse de la facture";
			texts.param_tooltip_qr_code_empty_amount = "Cocher pour exclure le montant de la facture";
			texts.param_tooltip_qr_code_add_border_separator = "Cocher pour imprimer la bordure de séparation";
			texts.param_tooltip_qr_code_add_symbol_scissors = "Cocher pour imprimer le symbole des ciseaux au-dessus de la bordure de séparation";
			texts.param_tooltip_qr_code_new_page = "Cocher pour imprimer le bulletin de versement QR Code sur une nouvelle page";
		}
		else {
			texts.param_qr_code = "QR Code";
			texts.param_qr_code_add = "Print QR Code";
			texts.param_qr_code_reference_type = "QR reference type";
			texts.param_qr_code_qriban = "QR-IBAN";
			texts.param_qr_code_iban = "IBAN";
			texts.param_qr_code_iban_eur = "IBAN EUR";
			texts.param_qr_code_isr_id = "ISR subscriber number (only with bank account, with postal account leave blank)";
			texts.param_qr_code_payable_to = "Payable to";
			texts.param_qr_code_creditor_name = "Name";
			texts.param_qr_code_creditor_address1 = "Address";
			texts.param_qr_code_creditor_address2 = "House number";
			texts.param_qr_code_creditor_postalcode = "Postal code";
			texts.param_qr_code_creditor_city = "Locality";
			texts.param_qr_code_creditor_country = "Country code";    
			texts.param_qr_code_add_border_separator = "Print separating border";
			texts.param_qr_code_add_symbol_scissors = "Print scissors symbol";
			texts.param_qr_code_debtor_address_type = "Customer address type (S=Structured Address, K=Combined Address)";
			texts.param_qr_code_additional_information = "Include additional information (XML column name)";
			texts.param_qr_code_billing_information = "Include billing information";
			texts.param_qr_code_empty_address = "Exclude invoice address";
			texts.param_qr_code_empty_amount = "Exclude invoice amount";
			texts.param_qr_code_new_page = "Print QR Code on a new page";
			texts.param_qr_code_position_dX = 'Move horizontally +/- (in mm, default 0)';
			texts.param_qr_code_position_dY = 'Move vertically +/- (in mm, default 0)';
			texts.param_tooltip_qr_code_add = "Check to print the QR Code payment slip";
			texts.param_tooltip_qr_code_reference_type = "Select the QR reference type to use";
			texts.param_tooltip_qr_code_qriban = "Enter the QR-IBAN code";
			texts.param_tooltip_qr_code_iban = "Enter the IBAN code";
			texts.param_tooltip_qr_code_iban_eur = "Enter the IBAN code";
			texts.param_tooltip_qr_code_isr_id = "Insert the ISR subscriber number";
			texts.param_tooltip_qr_code_creditor_name = "Name";
			texts.param_tooltip_qr_code_creditor_address1 = "Address";
			texts.param_tooltip_qr_code_creditor_address2 = "House number";
			texts.param_tooltip_qr_code_creditor_postalcode = "Postal code";
			texts.param_tooltip_qr_code_creditor_city = "Locality";
			texts.param_tooltip_qr_code_creditor_country = "Country code";
			texts.param_tooltip_qr_code_debtor_address_type = "Select the address type to use (S=Structured Address, K=Combined Address)";
			texts.param_tooltip_qr_code_additional_information = "Enter the XML column name which contains the additional information";
			texts.param_tooltip_qr_code_empty_address = "Check to exclude the address of the invoice";
			texts.param_tooltip_qr_code_empty_amount = "Check to exclude the amount of the invoice";
			texts.param_tooltip_qr_code_add_border_separator = "Check to print the separating border";
			texts.param_tooltip_qr_code_add_symbol_scissors = "Check to print the scissors symbol over the separating border";
			texts.param_tooltip_qr_code_new_page = "Check to print the QR Code payment slip on a new page";
		}
	}


	/**
	 * Defines translations texts for the QRCode section of the invoice.
	 */
	getQrCodeTexts(lang)
	{
		var text = {}
		switch(lang)
		{
			case 'en':
			{
				text.receiptTitle = "Receipt";
				text.paymentTitle = "Payment part";
				text.payableTo = "Account / Payable to";
				text.payableBy = "Payable by";
				text.payableByBlank = "Payable by (name/address)";
				text.referenceNumber = "Reference";
				text.additionalInformation = "Additional information";
				text.currency = "Currency";
				text.amount = "Amount";
				text.acceptancePoint = "Acceptance point";
				text.nameAV1 = "Name AV1";
				text.nameAV2 = "Name AV2";
				text.separateBeforePaying = "Separate before paying in";
				text.inFavourOf = "In favour of";
				text.notUseForPayment = "DO NOT USE FOR PAYMENT";
				break;
			}
			case 'it':
			{
				text.receiptTitle = "Ricevuta";
				text.paymentTitle = "Sezione pagamento";
				text.payableTo = "Conto / Pagabile a";
				text.payableBy = "Pagabile da";
				text.payableByBlank = "Pagabile da (nome/indirizzo)";
				text.referenceNumber = "Riferimento";
				text.additionalInformation = "Informazioni aggiuntive";
				text.currency = "Valuta";
				text.amount = "Importo";
				text.acceptancePoint = "Punto di accettazione";
				text.nameAV1 = "Nome AV1";
				text.nameAV2 = "Nome AV2";
				text.separateBeforePaying = "Da staccare prima del versamento";
				text.inFavourOf = "A favore di";
				text.notUseForPayment = "NON UTILIZZARE PER IL PAGAMENTO";
				break;
			}
			case 'fr':
			{
				text.receiptTitle = "Récépissé";
				text.paymentTitle = "Section paiement";
				text.payableTo = "Compte / Payable à";
				text.payableBy = "Payable par";
				text.payableByBlank = "Payable par (nom/adresse)";
				text.referenceNumber = "Référence";
				text.additionalInformation = "Informations additionnelles";
				text.currency = "Monnaie";
				text.amount = "Montant";
				text.acceptancePoint = "Point de dépôt";
				text.nameAV1 = "Nom AV1";
				text.nameAV2 = "Nom AV2";
				text.separateBeforePaying = "A détacher avant le versement";
				text.inFavourOf = "En faveur de";
				text.notUseForPayment = "NE PAS UTILISER POUR LE PAIEMENT";
				break;
			}
			case 'de':
			{
				text.receiptTitle = "Empfangsschein";
				text.paymentTitle = "Zahlteil";
				text.payableTo = "Konto / Zahlbar an";
				text.payableBy = "Zahlbar durch";
				text.payableByBlank = "Zahlbar durch (Name/Adresse)";
				text.referenceNumber = "Referenz";
				text.additionalInformation = "Zusätzliche Informationen";
				text.currency = "Währung";
				text.amount = "Betrag";
				text.acceptancePoint = "Annahmestelle";
				text.nameAV1 = "Name AV1";
				text.nameAV2 = "Name AV2";
				text.separateBeforePaying = "Vor der Einzahlung abzutrennen";
				text.inFavourOf = "Zugunsten";
				text.notUseForPayment = "NICHT ZUR ZAHLUNG VERWENDEN";
				break;
			}
			default:
			{
				text.receiptTitle = "Receipt";
				text.paymentTitle = "Payment part";
				text.payableTo = "Account / Payable to";
				text.payableBy = "Payable by";
				text.payableByBlank = "Payable by (name/address)";
				text.referenceNumber = "Reference";
				text.additionalInformation = "Additional information";
				text.currency = "Currency";
				text.amount = "Amount";
				text.acceptancePoint = "Acceptance point";
				text.nameAV1 = "Name AV1";
				text.nameAV2 = "Name AV2";
				text.separateBeforePaying = "Separate before paying in";
				text.inFavourOf = "In favour of";
				text.notUseForPayment = "DO NOT USE FOR PAYMENT";
				break;
			}
		}
		return text;
	}


	/**
	 *	Define the QR-bill case (QRIBAN+QRR or IBAN+SCOR or IBAN without reference).
	 */
	defineQrBillType(userParam)
	{
		if (userParam.qr_code_reference_type === "QRR") {
			this.ID_QRBILL_WITH_QRIBAN_AND_QRR = true;
		}
		else if (userParam.qr_code_reference_type === "SCOR") {
			this.ID_QRBILL_WITH_IBAN_AND_SCOR = true;
		}
		else if (userParam.qr_code_reference_type === "NON") {
			this.ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE = true;
		}


		/**
		*	Define when the QR-bill is with/without debtor and amount
		*/

		//user selected empty address
		if (userParam.qr_code_empty_address) {
			this.ID_QRBILL_WITHOUT_DEBTOR = true;
		}

		//user selected empty amount
		if (userParam.qr_code_empty_amount) {
			this.ID_QRBILL_WITHOUT_AMOUNT = true;
		}
		

		//Banana.console.log("ID_QRBILL_WITH_QRIBAN_AND_QRR = " + this.ID_QRBILL_WITH_QRIBAN_AND_QRR);
		//Banana.console.log("ID_QRBILL_WITH_IBAN_AND_SCOR = " + this.ID_QRBILL_WITH_IBAN_AND_SCOR);
		//Banana.console.log("ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE = " + this.ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE);
		//Banana.console.log("ID_QRBILL_WITHOUT_AMOUNT = " + this.ID_QRBILL_WITHOUT_AMOUNT);
		//Banana.console.log("ID_QRBILL_WITHOUT_DEBTOR = " + this.ID_QRBILL_WITHOUT_DEBTOR);
	}


	/**
	 *	Set all the QRCode data that are used to create the qr image and receipt/payment slip.
	 */
	getQrCodeData(invoiceObj, userParam, texts, langDoc)
	{
		//Check if an IBAN exists on address property.
		//If no IBAN is defined in settings dialog, and an IBAN is defined on Address property, we use it.
		//If an IBAN is defined in settings dialog, we always use it.
		if (!userParam.qr_code_iban && invoiceObj.supplier_info.iban_number) {
			userParam.qr_code_iban = invoiceObj.supplier_info.iban_number;
		}

		var qrcodeData = {};
		qrcodeData.supplierIbanNumber = "";
		qrcodeData.reference = "";

		if (this.ID_QRBILL_WITH_QRIBAN_AND_QRR) 
		{
			if (userParam.qr_code_qriban) {
				qrcodeData.supplierIbanNumber = this.formatIban(userParam.qr_code_qriban);
				
				if (isValidIBAN(userParam.qr_code_qriban) !== 1 || !isQRIBAN(userParam.qr_code_qriban)) {
					qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_QRIBAN_WRONG, langDoc, userParam.qr_code_qriban);
				}

			} else {
				qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_QRIBAN, langDoc);
				//var msg = this.getErrorMessage(this.ID_ERR_QRIBAN, langDoc);
				//this.banDoc.addMessage(msg, this.ID_ERR_QRIBAN);
			}

			qrcodeData.reference = this.qrReferenceString(userParam.qr_code_isr_id, invoiceObj.customer_info.number, invoiceObj.document_info.number.replace(/[^0-9a-zA-Z]+/g, ""));
		}
		else if (this.ID_QRBILL_WITH_IBAN_AND_SCOR || this.ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE) 
		{	
			//currency CHF => we use userParam.qr_code_iban
			if (invoiceObj.document_info.currency === "CHF" || invoiceObj.document_info.currency === "chf") {
				if (userParam.qr_code_iban) {
					qrcodeData.supplierIbanNumber = this.formatIban(userParam.qr_code_iban);
					if (isValidIBAN(userParam.qr_code_iban) !== 1 || isQRIBAN(userParam.qr_code_iban)) { //|| invoiceObj.document_info.currency !== "CHF" && invoiceObj.document_info.currency !== "chf") {
						qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_IBAN_WRONG, langDoc, userParam.qr_code_iban);
					}
				}
				else {
					qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_IBAN, langDoc, userParam.qr_code_iban);
					//var msg = this.getErrorMessage(this.ID_ERR_IBAN, langDoc);
					//this.banDoc.addMessage(msg, this.ID_ERR_IBAN);	
				}
			}

			//currency EUR => we use userParam.qr_code_iban_eur
			if (invoiceObj.document_info.currency === "EUR" || invoiceObj.document_info.currency === "eur") {
				if (userParam.qr_code_iban_eur) {
					qrcodeData.supplierIbanNumber = this.formatIban(userParam.qr_code_iban_eur);
					if (isValidIBAN(userParam.qr_code_iban_eur) !== 1 || isQRIBAN(userParam.qr_code_iban_eur)) { // || invoiceObj.document_info.currency !== "EUR" && invoiceObj.document_info.currency !== "eur") {
						qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_IBAN_WRONG, langDoc, qr_code_iban_eur);
					}
				}
				else {
					qrcodeData.supplierIbanNumber = "@error " + this.getErrorMessage(this.ID_ERR_IBAN, langDoc, userParam.qr_code_iban_eur);
					//var msg = this.getErrorMessage(this.ID_ERR_IBAN, langDoc);
					//this.banDoc.addMessage(msg, this.ID_ERR_IBAN);			
				}
			}

			if (userParam.qr_code_reference_type === "SCOR") {

				var customerNumber = this.convertRfNumbers(invoiceObj.customer_info.number);
				var invoiceNumber = this.convertRfNumbers(invoiceObj.document_info.number);

				// Max length allowed Customer+Invoice numbers is 21
				if (customerNumber.length + invoiceNumber.length > 21) {
					qrcodeData.reference = "@error " + this.getErrorMessage(this.ID_ERR_CREDITORREFERENCE_LENGHT, langDoc, customerNumber+" + "+invoiceNumber);
				}
				else {
					qrcodeData.reference = this.qrCreditorReference(customerNumber, invoiceNumber);
				}
				
				// reference is false => it's not valid
				if (!qrcodeData.reference) {
					qrcodeData.reference = "@error " + this.getErrorMessage(this.ID_ERR_CREDITORREFERENCE, langDoc);
					//var msg = this.getErrorMessage(this.ID_ERR_CREDITORREFERENCE, langDoc);
					//this.banDoc.addMessage(msg, this.ID_ERR_CREDITORREFERENCE);
				}
			}
		}

		/* Currency and amount */
		qrcodeData.currency = invoiceObj.document_info.currency.toUpperCase();
		qrcodeData.amount = invoiceObj.billing_info.total_to_pay;
		if (!qrcodeData.amount || Banana.SDecimal.sign(qrcodeData.amount) < 0) {
			qrcodeData.amount = "0.00";
		}


		/* Creditor (Payable to) */
		qrcodeData.creditorAddressType = "K";
		qrcodeData.creditorName = "";
		qrcodeData.creditorAddress1 = "";
		qrcodeData.creditorAddress2 = "";
		qrcodeData.creditorPostalcode = "";
		qrcodeData.creditorCity = "";
		qrcodeData.creditorCountry = "";

		if (invoiceObj.supplier_info.business_name) {
			qrcodeData.creditorName += invoiceObj.supplier_info.business_name;
		} else {
			if (invoiceObj.supplier_info.first_name) {
				qrcodeData.creditorName += invoiceObj.supplier_info.first_name;
			}
			if (invoiceObj.supplier_info.last_name) {
				qrcodeData.creditorName += " " + invoiceObj.supplier_info.last_name;
			}		
		}
		if (invoiceObj.supplier_info.address1) {
			qrcodeData.creditorAddress1 = invoiceObj.supplier_info.address1;
		}
		if (invoiceObj.supplier_info.address2) {
			qrcodeData.creditorAddress2 = invoiceObj.supplier_info.address2;
		}
		if (invoiceObj.supplier_info.postal_code) {
			qrcodeData.creditorPostalcode = invoiceObj.supplier_info.postal_code;
		}
		if (invoiceObj.supplier_info.city) {
			qrcodeData.creditorCity = invoiceObj.supplier_info.city;
		}
		if (invoiceObj.supplier_info.country_code) {
			qrcodeData.creditorCountry = invoiceObj.supplier_info.country_code.toUpperCase().trim();
		}
		else {
			if (invoiceObj.supplier_info.country) {
				if (isSwissCountry(invoiceObj.supplier_info.country)) {
					qrcodeData.creditorCountry = "CH";
				} else {
					qrcodeData.creditorCountry = invoiceObj.supplier_info.country.toUpperCase().trim();
				}
			}
		}

		//Replace the default values using the "Payable to" address parameters
		//If "Payable to" address is selected we use structured type address, otherwise combined address.
		if (userParam.qr_code_payable_to) {

			qrcodeData.creditorAddressType = "S";

			if (userParam.qr_code_creditor_name) {
				qrcodeData.creditorName = userParam.qr_code_creditor_name;
			}
			if (userParam.qr_code_creditor_address1) {
				qrcodeData.creditorAddress1 = userParam.qr_code_creditor_address1;
			}
			if (userParam.qr_code_creditor_address2) {
				qrcodeData.creditorAddress2 = userParam.qr_code_creditor_address2;
			}
			if (userParam.qr_code_creditor_postalcode) {
				qrcodeData.creditorPostalcode = userParam.qr_code_creditor_postalcode;
			}
			if (userParam.qr_code_creditor_city) {
				qrcodeData.creditorCity = userParam.qr_code_creditor_city;
			}
			if (userParam.qr_code_creditor_country) {
				qrcodeData.creditorCountry = userParam.qr_code_creditor_country.toUpperCase();
			}
		}
		

		if (!qrcodeData.creditorName) {
			qrcodeData.creditorName = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_NAME, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_NAME, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_NAME);	
		}
		if (!qrcodeData.creditorAddress1) {
			//creditorAddress1 can ben empty
			//qrcodeData.creditorAddress1 = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_ADDRESS1, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_ADDRESS1, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_ADDRESS1);	
		}
		if (!qrcodeData.creditorPostalcode) {
			qrcodeData.creditorPostalcode = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_POSTALCODE, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_POSTALCODE, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_POSTALCODE);	
		}
		if (!qrcodeData.creditorCity) {
			qrcodeData.creditorCity = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_CITY, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_CITY, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_CITY);	
		}
		if (!qrcodeData.creditorCountry) {
			qrcodeData.creditorCountry = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_COUNTRY, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_COUNTRY, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_COUNTRY);
		}
		else if (!isValidCountryCode(qrcodeData.creditorCountry)) {
			qrcodeData.creditorCountry = "@error " + this.getErrorMessage(this.ID_ERR_CREDITOR_COUNTRY_WRONG, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_CREDITOR_COUNTRY_WRONG, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_CREDITOR_COUNTRY_WRONG);
		}


		/* 
			Additional information => unstructured message (es. Order of 15 June 2020) 
			Billing information => structured message (es. //S1/10/10201409/11/200701/20/140.000-53/30/102673831/31/200615/32/7.7/33/7.7:139.40/40/0:30)
		*/
		if (qrcodeData.amount === "0.00") { //when amount is 0, add only additional info with text "NOT TO PAY.."
			qrcodeData.additionalInformation = "";
			if(!userParam.qr_code_empty_amount) { //only if "Empty amount" option is false
				qrcodeData.additionalInformation = texts.notUseForPayment;
			}
			qrcodeData.billingInformation = "";
		} 
		else if (this.ID_QRBILL_WITHOUT_DEBTOR) { //when no debtor, add only billing information
			qrcodeData.additionalInformation = "";
			if (userParam.qr_code_billing_information) {
				qrcodeData.billingInformation = this.qrBillingInformation(invoiceObj);
			} else {
				qrcodeData.billingInformation = "";
			}
		}
		else { //add both additional and billing information
			qrcodeData.additionalInformation = this.qrAdditionalInformation(invoiceObj, userParam.qr_code_additional_information);
			if (userParam.qr_code_billing_information) {
				qrcodeData.billingInformation = this.qrBillingInformation(invoiceObj);
			} else {
				qrcodeData.billingInformation = "";
			}
		}
		
		// Additional and billing inforomation must be together max 140 characters.
		// We cut the unstructured Additional information with "..." at the end
		var str = qrcodeData.additionalInformation + qrcodeData.billingInformation;
		if (str.length > 140) {
			str = str.split("//");
			var addInfo = str[0];
			var billInfo = "//"+str[1];
			qrcodeData.additionalInformation = addInfo.substring(0, (137-(billInfo.length)))+ "...";
		}

		/* Debtor (Payable by) */
		qrcodeData.debtorAddressType = "K";
		qrcodeData.debtorName = "";
		qrcodeData.debtorAddress1 = "";
		qrcodeData.debtorAddress2 = "";
		qrcodeData.debtorPostalcode = "";
		qrcodeData.debtorCity = "";
		qrcodeData.debtorCountry = "";

		if (userParam.qr_code_debtor_address_type) {
			qrcodeData.debtorAddressType = userParam.qr_code_debtor_address_type;
		}

		if (invoiceObj.customer_info.business_name) {
			qrcodeData.debtorName += invoiceObj.customer_info.business_name;
		} else {
			if (invoiceObj.customer_info.first_name || invoiceObj.customer_info.last_name) {
				if (invoiceObj.customer_info.first_name) {
					qrcodeData.debtorName += invoiceObj.customer_info.first_name;
				}
				if (invoiceObj.customer_info.last_name) {
					if (invoiceObj.customer_info.first_name) {
						qrcodeData.debtorName += " ";
					}
					qrcodeData.debtorName += invoiceObj.customer_info.last_name;
				}
			}		
		}
		if (invoiceObj.customer_info.address1) {
			qrcodeData.debtorAddress1 = invoiceObj.customer_info.address1;
		}
		if (invoiceObj.customer_info.address2) {
			qrcodeData.debtorAddress2 = invoiceObj.customer_info.address2;
		}
		if (invoiceObj.customer_info.postal_code) {
			qrcodeData.debtorPostalcode = invoiceObj.customer_info.postal_code;
		}
		if (invoiceObj.customer_info.city) {
			qrcodeData.debtorCity = invoiceObj.customer_info.city;
		}

		// Country code "10:adr:cco" of Transactions table will be available with the new Experimental.
		// At the moment we use the country "10:adr:cou"
		if (invoiceObj.customer_info.country_code) {
			qrcodeData.debtorCountry = invoiceObj.customer_info.country_code.toUpperCase().trim(); 
		} 
		else if (!invoiceObj.customer_info.country_code && invoiceObj.customer_info.country) {
			qrcodeData.debtorCountry = invoiceObj.customer_info.country.toUpperCase().trim();
		}

		if (!qrcodeData.debtorName) {
			qrcodeData.debtorName = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_NAME, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_NAME, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_NAME);	
		}
		if (!qrcodeData.debtorAddress1) {
			//debtorAddress1 can ben empty
			//qrcodeData.debtorAddress1 = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_ADDRESS1, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_ADDRESS1, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_ADDRESS1);	
		}
		if (!qrcodeData.debtorPostalcode) {
			qrcodeData.debtorPostalcode = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_POSTALCODE, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_POSTALCODE, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_POSTALCODE);	
		}
		if (!qrcodeData.debtorCity) {
			qrcodeData.debtorCity = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_CITY, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_CITY, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_CITY);	
		}
		if (!qrcodeData.debtorCountry) {
			qrcodeData.debtorCountry = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_COUNTRY, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_COUNTRY, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_COUNTRY);
		}
		else if (!isValidCountryCode(qrcodeData.debtorCountry)) {
			qrcodeData.debtorCountry = "@error " + this.getErrorMessage(this.ID_ERR_DEBTOR_COUNTRY_WRONG, langDoc);
			//var msg = this.getErrorMessage(this.ID_ERR_DEBTOR_COUNTRY_WRONG, langDoc);
			//this.banDoc.addMessage(msg, this.ID_ERR_DEBTOR_COUNTRY_WRONG);
		}

		/* Further information */
		qrcodeData.furtherInformation1 = "";//"UV;UltraPay005;12345";
		qrcodeData.furtherInformation2 = "";//"XY;XYService;54321";

		
		//////////////////////////////////////////////////////
		/* User can define qr settings with a hook function */
		//////////////////////////////////////////////////////
		if (typeof(hook_modify_settings_qr) === typeof(Function)) {
			hook_modify_settings_qr(invoiceObj, qrcodeData);
		
			qrcodeData.supplierIbanNumber = this.formatIban(qrcodeData.supplierIbanNumber);
			if (isValidIBAN(qrcodeData.supplierIbanNumber) !== 1) {
				qrcodeData.supplierIbanNumber = "@error Incorrect IBAN: "+ qrcodeData.supplierIbanNumber;
			}
		}

		return qrcodeData;
	}


	/**
	 *	Create the texts that are used for the QrImage.
	 */
	createTextQrImage(qrcodeData, texts)
	{
		var qrImageText = {};
		qrImageText.qrtype = "";
		qrImageText.version = "";
		qrImageText.codingtype = "";
		qrImageText.account = "";
		qrImageText.craddresstype = "";
		qrImageText.crname = "";
		qrImageText.craddress1 = "";
		qrImageText.craddress2 = "";
		qrImageText.crpostalcode = "";
		qrImageText.crcity = "";
		qrImageText.crcountry = "";
		qrImageText.ucraddresstype = "";
		qrImageText.ucrname = "";
		qrImageText.ucraddress1 = "";
		qrImageText.ucraddress2 = "";
		qrImageText.ucrpostalcode = "";
		qrImageText.ucrcity = "";
		qrImageText.ucrcountry = "";
		qrImageText.amount = "";
		qrImageText.currency = "";
		qrImageText.udaddresstype = "";
		qrImageText.udname = "";
		qrImageText.udaddress1 = "";
		qrImageText.udaddress2 = "";
		qrImageText.udpostalcode = "";
		qrImageText.udcity = "";
		qrImageText.udcountry = "";
		qrImageText.referencetype = "";
		qrImageText.reference = "";
		qrImageText.unstructuredmessage = "";
		qrImageText.trailer = "";
		qrImageText.billinginformation = "";
		qrImageText.av1parameters = "";
		qrImageText.av2parameters = "";



		//initialize qr text
		qrImageText.qrtype = "SPC"; //Swiss Payments Code
		qrImageText.version = "0200"; //Version 2.0 (02=version; 00=subversion)
		qrImageText.codingtype = "1"; //Fixed value 1 (indicates UTF-8 restricted to the Latin character set)
		if (qrcodeData.supplierIbanNumber) {
			qrImageText.account = qrcodeData.supplierIbanNumber.replace(/ /g, ""); //Fixed length: 21 alphanumeric characters, only IBANs with CH or LI country code permitted
		}
		qrImageText.craddresstype = qrcodeData.creditorAddressType;
		if (qrImageText.craddresstype === "S") { //S=structured address
			qrImageText.crname = qrcodeData.creditorName;
			qrImageText.craddress1 = qrcodeData.creditorAddress1;
			qrImageText.craddress2 = qrcodeData.creditorAddress2;
			qrImageText.crpostalcode = qrcodeData.creditorPostalcode;
			qrImageText.crcity = qrcodeData.creditorCity;	
		}
		else { //K=combined address
			qrImageText.crname = qrcodeData.creditorName;
			qrImageText.craddress1 = qrcodeData.creditorAddress1;
			qrImageText.craddress2 = qrcodeData.creditorPostalcode + " " + qrcodeData.creditorCity;
			qrImageText.crpostalcode = "";
			qrImageText.crcity = "";
		}
		qrImageText.crcountry = qrcodeData.creditorCountry; //Two-digit country code according to ISO 3166-1
		qrImageText.trailer = "EPD";
		
		if (!this.ID_QRBILL_WITHOUT_AMOUNT) {
			qrImageText.amount = qrcodeData.amount;
		}
		
		qrImageText.currency = qrcodeData.currency; //Only CHF and EUR are permitted


		// QRR and SCOR with the reference number, NON without reference number
		if (this.ID_QRBILL_WITH_QRIBAN_AND_QRR) {
			qrImageText.referencetype = "QRR"
			qrImageText.reference = qrcodeData.reference.replace(/ /g, "");
		} 
		else if (this.ID_QRBILL_WITH_IBAN_AND_SCOR) {
			qrImageText.referencetype = "SCOR";
			qrImageText.reference = qrcodeData.reference.replace(/ /g, "");
		} 
		else if (this.ID_QRBILL_WITH_IBAN_WITHOUT_REFERENCE) {
			qrImageText.referencetype = "NON";
		}


		// Debtor address if exists
		if (!this.ID_QRBILL_WITHOUT_DEBTOR) {
			qrImageText.udaddresstype = qrcodeData.debtorAddressType;
			if (qrImageText.udaddresstype === "S") { //S=structured address
				qrImageText.udname = qrcodeData.debtorName;
				qrImageText.udaddress1 = qrcodeData.debtorAddress1;
				qrImageText.udaddress2 = qrcodeData.debtorAddress2;
				qrImageText.udpostalcode = qrcodeData.debtorPostalcode;
				qrImageText.udcity = qrcodeData.debtorCity;
			}
			else if (qrImageText.udaddresstype === "K") { //K=combined address
				qrImageText.udname = qrcodeData.debtorName;
				qrImageText.udaddress1 = qrcodeData.debtorAddress1;
				qrImageText.udaddress2 = qrcodeData.debtorPostalcode + " " + qrcodeData.debtorCity;
				qrImageText.udpostalcode = "";
				qrImageText.udcity = "";
			}
			qrImageText.udcountry = qrcodeData.debtorCountry;
		}

		if (qrcodeData.additionalInformation) {
			qrImageText.unstructuredmessage = qrcodeData.additionalInformation;
		}
		if (qrcodeData.billingInformation) {
			qrImageText.billinginformation = qrcodeData.billingInformation;
		}

		if (qrcodeData.amount !== "0.00" && qrcodeData.furtherInformation1) {
			qrImageText.av1parameters = texts.nameAV1+": "+qrcodeData.furtherInformation1;
		}
		if (qrcodeData.amount !== "0.00" && qrcodeData.furtherInformation2) {
			qrImageText.av2parameters = texts.nameAV2+": "+qrcodeData.furtherInformation2;	
		}



		// Create the text for the QR image
		var text = "";
		text += qrImageText.qrtype + "\n";
		text += qrImageText.version + "\n";
		text += qrImageText.codingtype + "\n";
		text += qrImageText.account + "\n";
		text += qrImageText.craddresstype + "\n";
		text += qrImageText.crname + "\n";
		text += qrImageText.craddress1 + "\n";
		text += qrImageText.craddress2 + "\n";
		text += qrImageText.crpostalcode + "\n";
		text += qrImageText.crcity + "\n";
		text += qrImageText.crcountry + "\n";
		text += qrImageText.ucraddresstype + "\n";
		text += qrImageText.ucrname + "\n";
		text += qrImageText.ucraddress1 + "\n";
		text += qrImageText.ucraddress2 + "\n";
		text += qrImageText.ucrpostalcode + "\n";
		text += qrImageText.ucrcity + "\n";
		text += qrImageText.ucrcountry + "\n";
		text += qrImageText.amount + "\n";
		text += qrImageText.currency + "\n";
		text += qrImageText.udaddresstype + "\n";
		text += qrImageText.udname + "\n";
		text += qrImageText.udaddress1 + "\n";
		text += qrImageText.udaddress2 + "\n";
		text += qrImageText.udpostalcode + "\n";
		text += qrImageText.udcity + "\n";
		text += qrImageText.udcountry + "\n";
		text += qrImageText.referencetype + "\n";
		text += qrImageText.reference + "\n";
		text += qrImageText.unstructuredmessage + "\n";
		
		//L’ultimo elemento dati non può essere terminato con la combinazione dei tasti CR + LF, rispettivamente LF.

		text += qrImageText.trailer; // potrebbe essere l'ultimo elemento, nessun CR + LF, rispettivamente LF
		
		if (qrImageText.billinginformation) {
			text += "\n" + qrImageText.billinginformation;
		}

		if (qrImageText.av1parameters) {
			text += "\n" + qrImageText.av1parameters;
			if (qrImageText.av2parameters) {
				text += "\n" + qrImageText.av2parameters;
			}
		}

		// Banana.console.log("\n------------ QR CODE IMAGE BEGIN ------------");
		// Banana.console.log(text);
		// Banana.console.log("------------ QR CODE IMAGE END ------------");

		return text;
	}


	/**
	 * Creates the QRCode image using the texts.
	 */
	createQrImage(qrcodeText, langDoc)
	{
		var qrCodeParam = {};
		qrCodeParam.errorCorrectionLevel = 'M';
		qrCodeParam.binaryCodingVersion = 25;
		qrCodeParam.border = 0;

		var qrCodeSvgImage = Banana.Report.qrCodeImage(qrcodeText, qrCodeParam);
		if (qrCodeParam.errorMsg && qrCodeParam.errorMsg.length > 0) {
			var msg = this.getErrorMessage(this.ID_ERR_QRCODE, langDoc);
			msg = msg.replace("%1", qrCodeParam.errorMsg);
			if (this.banDoc) {
				this.banDoc.addMessage(msg, this.ID_ERR_QRCODE);
			} else {
				throw new Error(msg + " (" + this.ID_ERR_QRCODE + ")");
			}
		}

		return qrCodeSvgImage;
	}


	/**
	 * Creates the form of the QR section at the bottom of the page. 
	 */
	createQrForm(repDocObj, qrcodeData, qrCodeSvgImage, userParam, texts)
	{
		if (userParam.qr_code_new_page) {
			repDocObj.addPageBreak();
		}
		repDocObj.addParagraph("", "qrcode_rectangle"); //rettangolo trasparente per non sovrascrivere il testo con il QRCode

		// QRCode Receipt/Payment sections
		var qrcodeReceiptForm = repDocObj.addSection("qrcode_receipt_Form");
		var qrcodeReceiptCurrencyForm = repDocObj.addSection("qrcode_receipt_currency_Form");
		var qrcodeReceiptAmountForm = repDocObj.addSection("qrcode_receipt_amount_Form");
		var qrcodeReceiptAcceptancePointForm = repDocObj.addSection("qrcode_receipt_acceptancepoint_Form");
		var qrcodePaymentForm = repDocObj.addSection("qrcode_payment_Form");
		var qrcodePymentImageForm = repDocObj.addSection("qrcode_payment_image_Form");
		var qrcodePaymentCurrencyForm = repDocObj.addSection("qrcode_payment_currency_Form");
		var qrcodePaymentAmountForm = repDocObj.addSection("qrcode_payment_amount_Form");
		var qrcodePaymentTextForm = repDocObj.addSection("qrcode_payment_text_Form");
		var qrcodePaymentFurtherInfoForm = repDocObj.addSection("qrcode_payment_further_info_Form");

		// Scissors symbol on line separator
		if (userParam.qr_code_add_symbol_scissors) {
			repDocObj.addImage(this.scissors_svg,"qrcode_scissors");
		}


		/**
		*	RECEIPT TEXT
		*/
		qrcodeReceiptForm.addParagraph(texts.receiptTitle, "qrcode_title qrcode_paddingTop");
		qrcodeReceiptForm.addParagraph(" ", " qrcode_lineSpacing9");
		qrcodeReceiptForm.addParagraph(texts.payableTo, "qrcode_heading_receipt qrcode_lineSpacing9");

		if (qrcodeData.supplierIbanNumber.indexOf("@error") > -1) {
			qrcodeReceiptForm.addParagraph(qrcodeData.supplierIbanNumber, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		} else {
			qrcodeReceiptForm.addParagraph(qrcodeData.supplierIbanNumber, "qrcode_value_receipt qrcode_lineSpacing9");
		}

		if (qrcodeData.creditorName.indexOf("@error") > -1) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorName, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		} else {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorName, "qrcode_value_receipt qrcode_lineSpacing9");
		}
		
		var receiptCreditorAddressParagraph = qrcodeReceiptForm.addParagraph();
		var rCreAddText = "";
		if (qrcodeData.creditorAddressType === "K") {
			if (qrcodeData.creditorAddress1) {
				rCreAddText += qrcodeData.creditorAddress1;
			}
		}
		else if (qrcodeData.creditorAddressType === "S") {
			if (qrcodeData.creditorAddress1) {
				rCreAddText += qrcodeData.creditorAddress1;
			}
			if (qrcodeData.creditorAddress2) {
				if (qrcodeData.creditorAddress1) {
					rCreAddText += " ";
				}
				rCreAddText += qrcodeData.creditorAddress2;
			}
		}
		receiptCreditorAddressParagraph.addText(rCreAddText, "qrcode_value_receipt qrcode_lineSpacing9");

		// if (qrcodeData.creditorAddress2.indexOf("@error") > -1) {
		// 	qrcodeReceiptForm.addParagraph(qrcodeData.creditorAddress2, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		// } else {
		// 	qrcodeReceiptForm.addParagraph(qrcodeData.creditorAddress2, "qrcode_value_receipt qrcode_lineSpacing9");
		// }

		if (qrcodeData.creditorPostalcode.indexOf("@error") < 0 && qrcodeData.creditorCity.indexOf("@error") < 0) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorPostalcode + " " + qrcodeData.creditorCity, "qrcode_value_receipt qrcode_lineSpacing9");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") < 0 && qrcodeData.creditorCity.indexOf("@error") > -1) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_receipt qrcode_lineSpacing9");
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") > -1 && qrcodeData.creditorCity.indexOf("@error") < 0) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_receipt qrcode_lineSpacing9");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") > -1 && qrcodeData.creditorCity.indexOf("@error") > -1) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		}

		if (qrcodeData.creditorCountry.indexOf("@error") > -1) {
			qrcodeReceiptForm.addParagraph(qrcodeData.creditorCountry, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
		}

		qrcodeReceiptForm.addParagraph(" ","");

		if (qrcodeData.reference) {
			qrcodeReceiptForm.addParagraph(texts.referenceNumber,"qrcode_heading_receipt qrcode_lineSpacing9");
			if (qrcodeData.reference.indexOf("@error") > -1) { //print the reference in red
				qrcodeReceiptForm.addParagraph(qrcodeData.reference,"qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			} else {
				qrcodeReceiptForm.addParagraph(qrcodeData.reference,"qrcode_value_receipt qrcode_lineSpacing9");
			}
			qrcodeReceiptForm.addParagraph(" ","qrcode_lineSpacing9");
		}

		if (this.ID_QRBILL_WITHOUT_DEBTOR) {
			qrcodeReceiptForm.addParagraph(texts.payableByBlank,"qrcode_heading_receipt qrcode_lineSpacing9");
			qrcodeReceiptForm.addImage(this.corner_marks_receipt_payable_by_svg, "qrcode_corner_marks_receipt_payable_by");
		}
		else {
			qrcodeReceiptForm.addParagraph(texts.payableBy,"qrcode_heading_receipt qrcode_lineSpacing9");
			
			if (qrcodeData.debtorName.indexOf("@error") > -1) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorName, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			} else {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorName, "qrcode_value_receipt qrcode_lineSpacing9");
			}
			
			var receiptDebtorAddressParagraph = qrcodeReceiptForm.addParagraph();
			var rDebAddText = "";
			if (qrcodeData.debtorAddressType === "K") {
				if (qrcodeData.debtorAddress1) {
					rDebAddText += qrcodeData.debtorAddress1;
				}
			}
			else if (qrcodeData.debtorAddressType === "S") {
				if (qrcodeData.debtorAddress1) {
					rDebAddText += qrcodeData.debtorAddress1;
				}
				if (qrcodeData.debtorAddress2) {
					if (qrcodeData.debtorAddress1) {
						rDebAddText += " ";
					}
					rDebAddText += qrcodeData.debtorAddress2;
				}
			}
			receiptDebtorAddressParagraph.addText(rDebAddText, "qrcode_value_receipt qrcode_lineSpacing9");

			// if (qrcodeData.debtorAddress2.indexOf("@error") > -1) {
			// 	qrcodeReceiptForm.addParagraph(qrcodeData.debtorAddress2, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			// } else {
			// 	qrcodeReceiptForm.addParagraph(qrcodeData.debtorAddress2, "qrcode_value_receipt qrcode_lineSpacing9");
			// }

			if (qrcodeData.debtorPostalcode.indexOf("@error") < 0 && qrcodeData.debtorCity.indexOf("@error") < 0) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorPostalcode + " " + qrcodeData.debtorCity, "qrcode_value_receipt qrcode_lineSpacing9");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") < 0 && qrcodeData.debtorCity.indexOf("@error") > -1) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_receipt qrcode_lineSpacing9");
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") > -1 && qrcodeData.debtorCity.indexOf("@error") < 0) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_receipt qrcode_lineSpacing9");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") > -1 && qrcodeData.debtorCity.indexOf("@error") > -1) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			}

			if (qrcodeData.debtorCountry.indexOf("@error") > -1) {
				qrcodeReceiptForm.addParagraph(qrcodeData.debtorCountry, "qrcode_value_receipt qrcode_error qrcode_lineSpacing9");
			}
		}
		

		/**
		*	RECEIPT CURRENCY AND AMOUNT
		*/
		qrcodeReceiptCurrencyForm.addParagraph(texts.currency, "qrcode_heading_receipt");
		qrcodeReceiptCurrencyForm.addParagraph(qrcodeData.currency, "qrcode_amount_receipt");
		qrcodeReceiptAmountForm.addParagraph(texts.amount, "qrcode_heading_receipt");
		if (this.ID_QRBILL_WITHOUT_AMOUNT) {
			qrcodeReceiptAmountForm.addImage(this.corner_marks_receipt_amount_svg, "qrcode_corner_marks_receipt_amount");
		} else {
			qrcodeReceiptAmountForm.addParagraph(qrcodeData.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),"qrcode_amount_receipt"); //thousands separator blank
		}


		/**
		*	RECEIPT ACCEPTANCE POINT
		*/
		qrcodeReceiptAcceptancePointForm.addParagraph(texts.acceptancePoint, "qrcode_acceptance_point qrcode_alignRight qrcode_paddingRight");


		/**
		*	PAYMENT QRCODE
		*/
		qrcodePaymentForm.addParagraph(texts.paymentTitle, "qrcode_title qrcode_paddingTop qrcode_paddingLeft");
		qrcodePymentImageForm.addImage(qrCodeSvgImage, 'qrcode_image');
		qrcodePymentImageForm.addImage(this.swiss_cross, "qrcode_cross");


		/**
		*	PAYMENT CURRENCY AND AMOUNT
		*/
		qrcodePaymentCurrencyForm.addParagraph(texts.currency, "qrcode_heading_payment");
		qrcodePaymentCurrencyForm.addParagraph(qrcodeData.currency, "qrcode_amount_payment");
		qrcodePaymentAmountForm.addParagraph(texts.amount, "qrcode_heading_payment");
		if (this.ID_QRBILL_WITHOUT_AMOUNT) {
			qrcodePaymentAmountForm.addImage(this.corner_marks_payment_amount_svg, "qrcode_corner_marks_payment_amount");
		} else {
			qrcodePaymentAmountForm.addParagraph(qrcodeData.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),"qrcode_amount_payment"); //thousands separator blank
		}


		/**
		*	PAYMENT TEXT
		*/
		qrcodePaymentTextForm.addParagraph(texts.payableTo, "qrcode_heading_payment qrcode_paddingTop");

		if (qrcodeData.supplierIbanNumber.indexOf("@error") > -1) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.supplierIbanNumber, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		} else {
			qrcodePaymentTextForm.addParagraph(qrcodeData.supplierIbanNumber, "qrcode_value_payment qrcode_lineSpacing11");
		}

		if (qrcodeData.creditorName.indexOf("@error") > -1) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorName, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		} else {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorName, "qrcode_value_payment qrcode_lineSpacing11");
		}
		
		var paymentCreditorAddressParagraph = qrcodePaymentTextForm.addParagraph();
		var pCreAddText = "";
		if (qrcodeData.creditorAddressType === "K") {
			if (qrcodeData.creditorAddress1) {
				pCreAddText += qrcodeData.creditorAddress1;
			}
		}
		else if (qrcodeData.creditorAddressType === "S") {
			if (qrcodeData.creditorAddress1) {
				pCreAddText += qrcodeData.creditorAddress1;
			}
			if (qrcodeData.creditorAddress2) {
				if (qrcodeData.creditorAddress1) {
					pCreAddText += " ";
				}
				pCreAddText += qrcodeData.creditorAddress2;
			}
		}
		paymentCreditorAddressParagraph.addText(pCreAddText, "qrcode_value_payment qrcode_lineSpacing11");

		// if (qrcodeData.creditorAddress2.indexOf("@error") > -1) {
		// 	qrcodePaymentTextForm.addParagraph(qrcodeData.creditorAddress2, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		// } else {
		// 	qrcodePaymentTextForm.addParagraph(qrcodeData.creditorAddress2, "qrcode_value_payment qrcode_lineSpacing11");
		// }

		if (qrcodeData.creditorPostalcode.indexOf("@error") < 0 && qrcodeData.creditorCity.indexOf("@error") < 0) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorPostalcode + " " + qrcodeData.creditorCity, "qrcode_value_payment qrcode_lineSpacing11");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") < 0 && qrcodeData.creditorCity.indexOf("@error") > -1) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_payment qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") > -1 && qrcodeData.creditorCity.indexOf("@error") < 0) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_payment qrcode_lineSpacing11");
		} else if (qrcodeData.creditorPostalcode.indexOf("@error") > -1 && qrcodeData.creditorCity.indexOf("@error") > -1) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorPostalcode, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorCity, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		}

		if (qrcodeData.creditorCountry.indexOf("@error") > -1) {
			qrcodePaymentTextForm.addParagraph(qrcodeData.creditorCountry, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
		}

		if (qrcodeData.reference) {
			qrcodePaymentTextForm.addParagraph(" ","qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(texts.referenceNumber,"qrcode_heading_payment qrcode_lineSpacing11");
			if (qrcodeData.reference.indexOf("@error") > -1) { //prints the reference in red
				qrcodePaymentTextForm.addParagraph(qrcodeData.reference,"qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			} else {
				qrcodePaymentTextForm.addParagraph(qrcodeData.reference,"qrcode_value_payment qrcode_lineSpacing11");
			}
		}
		
		if (qrcodeData.additionalInformation || qrcodeData.billingInformation) {
			qrcodePaymentTextForm.addParagraph(" ","qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(texts.additionalInformation,"qrcode_heading_payment qrcode_lineSpacing11");
			if (qrcodeData.additionalInformation) {
				var textInfo = qrcodeData.additionalInformation.split("\n");
				for (var i = 0; i < textInfo.length; i++) {
					qrcodePaymentTextForm.addParagraph(textInfo[i],"qrcode_value_payment qrcode_lineSpacing11");
				}
			}
			if (qrcodeData.billingInformation) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.billingInformation,"qrcode_value_payment qrcode_lineSpacing11");
			}
		}


		if (this.ID_QRBILL_WITHOUT_DEBTOR) {
			qrcodePaymentTextForm.addParagraph(" ","qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(texts.payableByBlank,"qrcode_heading_payment qrcode_lineSpacing11");
			qrcodePaymentTextForm.addImage(this.corner_marks_payment_payable_by_svg, "qrcode_corner_marks_payment_payable_by");
		}
		else {
			qrcodePaymentTextForm.addParagraph(" ","qrcode_lineSpacing11");
			qrcodePaymentTextForm.addParagraph(texts.payableBy,"qrcode_heading_payment qrcode_lineSpacing11");
			
			if (qrcodeData.debtorName.indexOf("@error") > -1) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorName, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			} else {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorName, "qrcode_value_payment qrcode_lineSpacing11");
			}
			
			var paymentDebtorAddressParagraph = qrcodePaymentTextForm.addParagraph();
			var pDebAddText = "";
			if (qrcodeData.debtorAddressType === "K") {
				if (qrcodeData.debtorAddress1) {
					pDebAddText += qrcodeData.debtorAddress1;
				}
			}
			else if (qrcodeData.debtorAddressType === "S") {
				if (qrcodeData.debtorAddress1) {
					pDebAddText += qrcodeData.debtorAddress1;
				}
				if (qrcodeData.debtorAddress2) {
					if (qrcodeData.debtorAddress1) {
						pDebAddText += " ";
					}
					pDebAddText += qrcodeData.debtorAddress2;
				}
			}
			paymentDebtorAddressParagraph.addText(pDebAddText, "qrcode_value_payment qrcode_lineSpacing11");

			// if (qrcodeData.debtorAddress2.indexOf("@error") > -1) {
			// 	qrcodePaymentTextForm.addParagraph(qrcodeData.debtorAddress2, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			// } else {
			// 	qrcodePaymentTextForm.addParagraph(qrcodeData.debtorAddress2, "qrcode_value_payment qrcode_lineSpacing11");
			// }

			if (qrcodeData.debtorPostalcode.indexOf("@error") < 0 && qrcodeData.debtorCity.indexOf("@error") < 0) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorPostalcode + " " + qrcodeData.debtorCity, "qrcode_value_payment qrcode_lineSpacing11");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") < 0 && qrcodeData.debtorCity.indexOf("@error") > -1) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_payment qrcode_lineSpacing11");
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") > -1 && qrcodeData.debtorCity.indexOf("@error") < 0) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_payment qrcode_lineSpacing11");
			} else if (qrcodeData.debtorPostalcode.indexOf("@error") > -1 && qrcodeData.debtorCity.indexOf("@error") > -1) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorPostalcode, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorCity, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			}

			if (qrcodeData.debtorCountry.indexOf("@error") > -1) {
				qrcodePaymentTextForm.addParagraph(qrcodeData.debtorCountry, "qrcode_value_payment qrcode_error qrcode_lineSpacing11");
			}
		}
		

		/**
		*	PAYMENT FURTHER INFO
		*/
		if (qrcodeData.amount !== "0.00" && qrcodeData.furtherInformation1) {
			var p1 = qrcodePaymentFurtherInfoForm.addParagraph();
			p1.addText(texts.nameAV1 + ": ", "qrcode_further_info_payment bold qrcode_lineSpacing8");
			p1.addText(qrcodeData.furtherInformation1, "qrcode_further_info_payment qrcode_lineSpacing8");
		}
		if (qrcodeData.amount !== "0.00" && qrcodeData.furtherInformation2) {
			var p2 = qrcodePaymentFurtherInfoForm.addParagraph();
			p2.addText(texts.nameAV2 + ": ", "qrcode_further_info_payment bold qrcode_lineSpacing8");
			p2.addText(qrcodeData.furtherInformation2, "qrcode_further_info_payment qrcode_lineSpacing8");
		}
	}


	/**
	 * Prints the QR section of the invoice. 
	 */
	printQRCode(invoiceObj, repDocObj, repStyleObj, userParam)
	{
		if (!invoiceObj || !repDocObj) {
			return;
		}

		var langDoc = '';
		if (invoiceObj.customer_info.lang) {
			langDoc = invoiceObj.customer_info.lang.toLowerCase(); //in case user insert uppercase language
		}
		if (langDoc.length <= 0) {
			langDoc = invoiceObj.document_info.locale;
		}
		
		// QR Code only for CHF and EUR
		if (invoiceObj.document_info.currency === "CHF" || invoiceObj.document_info.currency === "EUR" ||
			invoiceObj.document_info.currency === "chf" || invoiceObj.document_info.currency === "eur")
		{
			// 1. Get the QR Code texts for different languages
			var texts = this.getQrCodeTexts(langDoc);

			// 2. Define the QR-Bill type, based on user settings choices
			this.defineQrBillType(userParam);

			// 3. Get the QR Code data that will be used to create the image and the receipt/payment slip
			var qrcodeData = this.getQrCodeData(invoiceObj, userParam, texts, langDoc);

			// 4. Create the QR Code image
			var qrcodeText = this.createTextQrImage(qrcodeData, texts);
			var qrCodeSvgImage = this.createQrImage(qrcodeText, langDoc);

			// 5. Create the QR Code form report
			if (qrCodeSvgImage) {
				this.createQrForm(repDocObj, qrcodeData, qrCodeSvgImage, userParam, texts);
			}

			// 6. Apply QR Code styles to the report
			this.applyQRCodeStyle(repStyleObj, userParam);
		}
		else 
		{
			var msg = this.getErrorMessage(this.ID_ERR_CURRENCY, langDoc);
			if (this.banDoc) {
				this.banDoc.addMessage(msg, this.ID_ERR_CURRENCY);
			} else {
				throw new Error(msg + " (" + this.ID_ERR_QRCODE + ")");
			}

			return;
		}
	}


	/**
	 * Get the QR additional information defined in the given column.
	 */
	qrAdditionalInformation(invoiceObj, column)
	{
		var textNotes = "";
		var infoSet = new Set();
		if (this.banDoc) {
			var invoiceNumber = invoiceObj.document_info.number;
			var transTable = this.banDoc.table("Transactions");
			if (transTable) {
				for (var i = 0; i < transTable.rowCount; i++) {
					var tRow = transTable.row(i);
					var docInvoice = tRow.value("DocInvoice");
					if (invoiceNumber === docInvoice) {
						var info = tRow.value(column);
						if (info) {
							infoSet.add(info);
						}
					}
				}
			}
		}
		// add all elementes with ", " as separator
		for (var i of infoSet) {
			textNotes += i + ", ";
		}
		//remove last 2 chars ", "
		return textNotes.slice(0, -2);
	}


	/**
	 * Creates the QR billing informations structured string. 
	 */
	qrBillingInformation(invoiceObj)
	{
		var structuredMessage = "";
		structuredMessage += "//S1";

		//Invoice number
		structuredMessage += "/10/"+invoiceObj.document_info.number.replace(/[^0-9a-zA-Z]+/g, "");
		
		//Invoice date
		var d = invoiceObj.document_info.date.substring(0,10).toString().split("-");
		var yy = d[0].substring(2, 4);
		var mm = d[1];
		var dd = d[2];
		structuredMessage += "/11/"+yy+mm+dd;

		//Customer reference
		var custRef = invoiceObj.customer_info.number;
		structuredMessage += "/20/" + custRef;

		//VAT number CHE-123.456.790 => 123456789
		var vatNumber = "";
		if (invoiceObj.supplier_info.vat_number) {
			vatNumber = invoiceObj.supplier_info.vat_number;	
			vatNumber = vatNumber.replace(/\D+/g,''); //replace all non-number characters	
			structuredMessage += "/30/" + vatNumber;
		}

		//VAT date
		var vatDate = yy+mm+dd;
		structuredMessage += "/31/" + vatDate;

		/*	
			VAT details
			=> *1 to remove zeros (8.00=>8; 3.70=>3.7)

			/32/7.7						=> viene utilizzata una sola aliquota d'imposta sull'importo totale
			/32/8:1000;2.5:51.8;7.7:250 => diverse aliquote: 8% su 1000.00, 2.5% su 51.80, 7.7% su 250.00
		*/
		if (invoiceObj.billing_info.total_vat_rates.length > 0) {
			structuredMessage += "/32/";
			if (invoiceObj.billing_info.total_vat_rates.length == 1) {
				structuredMessage += invoiceObj.billing_info.total_vat_rates[0].vat_rate*1;
			}
			else {
				for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
					if (invoiceObj.billing_info.total_vat_rates[i+1]) {
						structuredMessage += invoiceObj.billing_info.total_vat_rates[i].vat_rate*1 +":"+ invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive*1+";"; 
					}
					else {
						structuredMessage += invoiceObj.billing_info.total_vat_rates[i].vat_rate*1 +":"+ invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive*1;
					}
				}
			}
		}

		//VAT import tax (iva sulle importazioni)
		// => *1 to remove zeros (8.00=>8; 3.70=>3.7)
		// if (invoiceObj.billing_info.total_vat_rates.length > 0) {
		// 	structuredMessage += "/33/";
		// 	for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
		// 		if (invoiceObj.billing_info.total_vat_rates[i+1]) {
		// 			structuredMessage += invoiceObj.billing_info.total_vat_rates[i].vat_rate*1 +":"+ invoiceObj.billing_info.total_vat_rates[i].total_vat_amount*1+";"; 
		// 		}
		// 		else {
		// 			structuredMessage += invoiceObj.billing_info.total_vat_rates[i].vat_rate*1 +":"+ invoiceObj.billing_info.total_vat_rates[i].total_vat_amount*1;
		// 		}
		// 	}
		// }

		//Conditions
		var billingDate = invoiceObj.document_info.date;
		var termDate = "";
		
		if (!invoiceObj.billing_info.payment_term) { //termine pagamento inserico con 10:ter

			if (invoiceObj.payment_info && invoiceObj.payment_info.due_date) {
				termDate = invoiceObj.payment_info.due_date;
			}

			if (billingDate && termDate) {
				
				//Differnce in days between two dates
				var date1 = new Date(billingDate);
				var date2 = new Date(termDate);
				var diffTime = Math.abs(date2 - date1);
				var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

				var conditions = "0:" + diffDays;
				structuredMessage += "/40/" + conditions;
			}
		}

		
		return structuredMessage;
	}


	/**
	 * Creditor reference number creation.
	 * The reference part is free, so we can use the customer number and the invoice number (only numbers and characters).
	 * We create a string with these information and use it to generate the creditor reference number.
	 */
	qrCreditorReference(customerNumber, invoiceNumber)
	{
		var referenceString = customerNumber + invoiceNumber;
		var creditorReference = this.generateRfReference(referenceString);

		return creditorReference;
	}


	/**
	 * Check and convert the customer and invoice numbers to the format:
	 * - First character is the length of the account/invoice number (hexadecimal string).
	 * - Following characters is the account/invoice number.
	 * - All non ASCII numbers/letters are removed.
	 * - In case the account/invoice numbers doesn't exist we user "0" as value.
	 */
	convertRfNumbers(string)
	{
		var str = string.replace(/[^0-9a-zA-Z]/gi, ''); //remove all non-alphanumeric characters
		var strFinal = "";

		if (str.length < 1) { //string doesn't exists, we use '0'
			strFinal = "0";
		}
		else if (str.length >= 1) { //first character converted to hexadecimal string
			var hexString = str.length.toString(16);
			strFinal = hexString+str;
		}
		return strFinal;
	}


	/** 
	 * Replaces chars of the creditor reference with numbers.
	 */
	replaceRfChars(string)
	{
		string = string.replace(/A/g, 10);
		string = string.replace(/B/g, 11);
		string = string.replace(/C/g, 12);
		string = string.replace(/D/g, 13);
		string = string.replace(/E/g, 14);
		string = string.replace(/F/g, 15);
		string = string.replace(/G/g, 16);
		string = string.replace(/H/g, 17);
		string = string.replace(/I/g, 18);
		string = string.replace(/J/g, 19);
		string = string.replace(/K/g, 20);
		string = string.replace(/L/g, 21);
		string = string.replace(/M/g, 22);
		string = string.replace(/N/g, 23);
		string = string.replace(/O/g, 24);
		string = string.replace(/P/g, 25);
		string = string.replace(/Q/g, 26);
		string = string.replace(/R/g, 27);
		string = string.replace(/S/g, 28);
		string = string.replace(/T/g, 29);
		string = string.replace(/U/g, 30);
		string = string.replace(/V/g, 31);
		string = string.replace(/W/g, 32);
		string = string.replace(/X/g, 33);
		string = string.replace(/Y/g, 34);
		string = string.replace(/Z/g, 35);
		return string;
	}


	/**
	 * Calculates the modulo 97.
	 */
	calculateRfModulo97(divident)
	{
		var divisor = 97;
		var cDivident = '';
		var cRest = '';
		for (var i in divident) {
			var cChar = divident[i];
			var cOperator = cRest + '' + cDivident + '' + cChar;
			if (cOperator < parseInt(divisor)) {
				cDivident += '' + cChar;
			} else {
				cRest = cOperator % divisor;
				if (cRest == 0) {
					cRest = '';
				}
				cDivident = '';
			}
		}
		cRest += '' + cDivident;
		if (cRest == '') {
			cRest = 0;
		}
		return cRest;
	}


	/**
	 * Calculates the check digits of the creditor reference.
	 */
	calculateRfCheckdigits(ref)
	{
		var preResult = ref+"RF00"; // add 'RF00' to the end of ref
		preResult = this.replaceRfChars(preResult); // Replace to numeric
		var checkdigits = (98 - this.calculateRfModulo97(preResult)); // Calculate checkdigits
		if (checkdigits > 0 && checkdigits <= 9) { //set 2 digits if under 10
			checkdigits = "0"+checkdigits;
		}
		else if (checkdigits == 0) {
			checkdigits = "00"+checkdigits;
		}
		return checkdigits;
	}


	/**
	 * Validates the creditor reference.
	 */
	validateRfReference(ref)
	{
		var pre = ref.replace(/ /g,"").toUpperCase(); // Remove whitespace, uppercase
		ref = pre.substring(4) + pre.substring(0,4); // Move first 4 chars to the end of ref

		//Banana.console.log("validate step 1 (move first 4 chars to end): " + ref);

		var num = this.replaceRfChars(ref); // Replace to numeric

		//Banana.console.log("validate step 2 (replace chars to numeric): " + num);

		var mod = this.calculateRfModulo97(num);
		//Banana.console.log("validate step 3 (modulo97 of step2 string must be 1): " + mod);

		// Valid if up to 25 characters long and remainder is 1
		if (pre.length <= 25 && mod == 1) {
			return true;
		} else {
			return false;
		}
	}


	/**
	 * Generates the creditor reference.
	 * Creditor Reference is printed in blocks of 4 characters, last block can be less than 4 characters.
	 * Example: "RF48 1234 5678 9" => max 25 characters
	 * RF = identifier
	 * 48 = check digits
	 * 12345789 = reference
	 */
	generateRfReference(input)
	{
		var normalizedRef = input.replace(/ /g,"").toUpperCase(); // Remove whitespace, uppercase
		var checkdigits = this.calculateRfCheckdigits(normalizedRef); // Generate checkdigits
		var rfReference = "RF"+checkdigits+normalizedRef; // Join to required format
		
		//Banana.console.log("free reference string: " + input);
		//Banana.console.log("calc checkdigits: " + checkdigits);
		//Banana.console.log("calc rfReference: " + rfReference);
		
		if(this.validateRfReference(rfReference)) { // Check if validates
			//Banana.console.log("=> rfReference is valid: " + rfReference);
			rfReference = rfReference.replace(/[^a-zA-Z0-9]+/gi, '').replace(/(.{4})/g, '$1 '); //create blocks of 4
			return rfReference;
		}
		else {
			//Banana.console.log("=> rfReference not valid: " + rfReference);
			return false;
		}
	}


	/**
	 * The function qrReferenceString build the pvr reference,
	 * containg the pvr identification, the customer and the invoice number.
	 * @userParam isrId The pvr idetification number (given by the bank). Max 8 chars.
	 * @userParam customerNo The customer number. Max 7 chars.
	 * @userParam invoiceNo The invoice/oder number. Max 7 chars.
	 */
	qrReferenceString(isrId, customerNo, invoiceNo)
	{
		isrId = isrId.replace(/-/g,"");

		if (isrId.length > 8)
			return "@error isrId too long, max 8 chars. Your isrId " + isrId;
		else if (!isrId.match(/^[0-9]*$/))
			return "@error isrId invalid, only digits are permitted. Your isrId " + isrId ;
		else if (customerNo.length > 7)
			return "@error customerNo too long, max 7 digits. Your customerNo " + customerNo;
		else if (!customerNo.match(/^[0-9]*$/))
			return "@error customerNo invalid, only digits are permitted. Your customerNo " + customerNo;
		else if (invoiceNo.length > 7)
			return "@error invoiceNo too long, max 7 digits. Your invoiceNo " + invoiceNo;
		else if (!invoiceNo.match(/^[0-9]*$/))
			return "@error invoiceNo invalid, only digits are permitted. Your invoiceNo " + invoiceNo;

		var qrReference = isrId;
		while (qrReference.length + customerNo.length < 18)
			qrReference += "0";
		qrReference += customerNo;
		while (qrReference.length + invoiceNo.length < 25)
			qrReference += "0";
		qrReference += invoiceNo;
		qrReference += "0";
		qrReference += this.modulo10(qrReference);

		qrReference = qrReference.substr(0,2)+" "+
		qrReference.substr(2,5)+" "+qrReference.substr(7,5)+" "+qrReference.substr(12,5)+" "+qrReference.substr(17,5)+" "+qrReference.substr(22,5)+" "+qrReference.substr(27,5);

		return qrReference;
	}


	/**
	 * The function modulo10 calculate the modulo 10 of a string,
	 * as described under the document "Postinance, Descrizione dei record,
	 * Servizi elettronici".
	 */
	modulo10(string)
	{
		// Description of algorithm on
		// Postinance, Descrizione dei record, Servizi elettronici
		var modulo10Table = [
			[0, 9, 4, 6, 8, 2, 7, 1, 3, 5, "0"],
			[9, 4, 6, 8, 2, 7, 1, 3, 5, 0, "9"],
			[4, 6, 8, 2, 7, 1, 3, 5, 0, 9, "8"],
			[6, 8, 2, 7, 1, 3, 5, 0, 9, 4, "7"],
			[8, 2, 7, 1, 3, 5, 0, 9, 4, 6, "6"],
			[2, 7, 1, 3, 5, 0, 9, 4, 6, 8, "5"],
			[7, 1, 3, 5, 0, 9, 4, 6, 8, 2, "4"],
			[1, 3, 5, 0, 9, 4, 6, 8, 2, 7, "3"],
			[3, 5, 0, 9, 4, 6, 8, 2, 7, 1, "2"],
			[5, 0, 9, 4, 6, 8, 2, 7, 1, 3, "1"],
		];

		var module10Report = 0;

		if (string) {
			for (var i = 0; i < string.length; i++) {
				switch (string[i]) {
					case "0":
						module10Report = modulo10Table[module10Report][0];
						break;
					case "1":
						module10Report = modulo10Table[module10Report][1];
						break;
					case "2":
						module10Report = modulo10Table[module10Report][2];
						break;
					case "3":
						module10Report = modulo10Table[module10Report][3];
						break;
					case "4":
						module10Report = modulo10Table[module10Report][4];
						break;
					case "5":
						module10Report = modulo10Table[module10Report][5];
						break;
					case "6":
						module10Report = modulo10Table[module10Report][6];
						break;
					case "7":
						module10Report = modulo10Table[module10Report][7];
						break;
					case "8":
						module10Report = modulo10Table[module10Report][8];
						break;
					case "9":
						module10Report = modulo10Table[module10Report][9];
						break;
				}
			}
		}

		return modulo10Table[module10Report][10];
	}


	/**
	 * Format the IBAN code number in blocks of 4 digits.
	 */
	formatIban(string)
	{
		var formattedString = "";
		formattedString = string.replace(/ /g, "");
		formattedString = formattedString.substr(0,4) + " " + 
		formattedString.substr(4,4) + " " + 
		formattedString.substr(8,4) + " " + 
		formattedString.substr(12,4)+ " " +
		formattedString.substr(16,4)+ " " +
		formattedString.substr(20,1);
		return formattedString;
	}


	/**
	 * Defines and apply all the styles for the QR section of the invoice.
	 */
	applyQRCodeStyle(repStyleObj, userParam)
	{
		if (repStyleObj) 
		{
			/*********************
				GENERAL
			*********************/
			var fontFamily = "Arial"; // only permitted: Arial, Helvetica, Frutiger, Liberation Sans
			var fontSizeReceipt = "9pt";
			var fontSizePayment = "11pt";

			//Overwrite default page margin of 20mm
			var style = repStyleObj.addStyle("@page");
			style.setAttribute("margin", "0mm");
			
			//QR text position
			style.setAttribute("transform", "matrix(1.0, 0.0, 0.0, 1.0," + userParam.qr_code_position_dX + "," + userParam.qr_code_position_dY + ")");

			repStyleObj.addStyle(".qrcode_alignRight","text-align:right");
			repStyleObj.addStyle(".qrcode_paddingTop","padding-top:5mm");
			repStyleObj.addStyle(".qrcode_paddingRight","padding-right:5mm");
			repStyleObj.addStyle(".qrcode_paddingBottom","padding-bottom:5mm");
			repStyleObj.addStyle(".qrcode_paddingLeft","padding-left:5mm");
			repStyleObj.addStyle(".qrcode_error","color:red");
			repStyleObj.addStyle(".qrcode_lineSpacing9", "margin-top:-0.45mm");
			repStyleObj.addStyle(".qrcode_lineSpacing11", "margin-top:-0.35mm");
			repStyleObj.addStyle(".qrcode_lineSpacing8", "margin-top:-0.3");

			var rectangleStyle = repStyleObj.addStyle(".qrcode_rectangle");
			rectangleStyle.setAttribute("width","10px");
			rectangleStyle.setAttribute("height","100mm");
			rectangleStyle.setAttribute("background-color","white");

			var title = repStyleObj.addStyle(".qrcode_title");
			title.setAttribute("font-size","11pt");
			title.setAttribute("font-weight","bold");



			/*********************
				RECEIPT
			*********************/
			var headingReceipt = repStyleObj.addStyle(".qrcode_heading_receipt");
			headingReceipt.setAttribute("font-size","6pt");
			headingReceipt.setAttribute("font-weight","bold");

			var valueReceipt = repStyleObj.addStyle(".qrcode_value_receipt");
			valueReceipt.setAttribute("font-size","8pt");

			var amountReceipt = repStyleObj.addStyle(".qrcode_amount_receipt");
			amountReceipt.setAttribute("font-size","8pt");

			var acceptancePoint = repStyleObj.addStyle(".qrcode_acceptance_point");
			acceptancePoint.setAttribute("font-size","6pt");
			acceptancePoint.setAttribute("font-weight","bold");

			/* Receipt form */
			style = repStyleObj.addStyle(".qrcode_receipt_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "5mm");
			style.setAttribute("top", "192mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizeReceipt);
			style.setAttribute("width","57mm"); //62mm-5mm
			style.setAttribute("height","105mm");
			if (userParam.qr_code_add_border_separator) {
				style.setAttribute("border-top","thin dashed black");
				style.setAttribute("border-right","thin dashed black");
			}

			/* Currency receipt form */
			style = repStyleObj.addStyle(".qrcode_receipt_currency_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "5mm");
			style.setAttribute("top", "260mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizeReceipt);
			style.setAttribute("width","20mm");
			style.setAttribute("height","14mm");
			//style.setAttribute("border","thin solid red");

			/* Amount receipt form */
			style = repStyleObj.addStyle(".qrcode_receipt_amount_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "18mm");
			style.setAttribute("top", "260mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizeReceipt);
			style.setAttribute("width","37mm");
			style.setAttribute("height","14mm");
			//style.setAttribute("border","thin solid red");

			/* Acceptance point receipt form */
			style = repStyleObj.addStyle(".qrcode_receipt_acceptancepoint_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "0mm");
			style.setAttribute("top", "274mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizeReceipt);
			style.setAttribute("width","62mm");
			style.setAttribute("height","18mm");



			/*********************
				PAYMENT
			*********************/
			var headingPayment = repStyleObj.addStyle(".qrcode_heading_payment");
			headingPayment.setAttribute("font-size","8pt");
			headingPayment.setAttribute("font-weight","bold");

			var valuePayment = repStyleObj.addStyle(".qrcode_value_payment");
			valuePayment.setAttribute("font-size","10pt");

			var amountPayment = repStyleObj.addStyle(".qrcode_amount_payment");
			amountPayment.setAttribute("font-size","10pt");

			var furtherInfoPayment = repStyleObj.addStyle(".qrcode_further_info_payment");
			furtherInfoPayment.setAttribute("font-size","7pt");

			/* Payment form */
			style = repStyleObj.addStyle(".qrcode_payment_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "62mm");
			style.setAttribute("top", "192mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizePayment);
			style.setAttribute("width","55mm");
			if (userParam.qr_code_add_border_separator) {
				style.setAttribute("border-top","thin dashed black");
			}
			//style.setAttribute("border","thin solid red");

			/* QRCode image form */
			style = repStyleObj.addStyle(".qrcode_payment_image_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "66mm"); //67
			style.setAttribute("top", "208mm"); //209
			style.setAttribute("width","46mm");
			style.setAttribute("text-align", "center");
			//style.setAttribute("border","thin solid red");

			/* Currency form */
			style = repStyleObj.addStyle(".qrcode_payment_currency_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "67mm");
			style.setAttribute("top", "260mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizePayment);
			style.setAttribute("width","20mm");
			style.setAttribute("height","14mm");
			//style.setAttribute("border","thin solid red");

			/* Amount form */
			style = repStyleObj.addStyle(".qrcode_payment_amount_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "82mm");
			style.setAttribute("top", "260mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizePayment);
			style.setAttribute("width","31mm");
			style.setAttribute("height","14mm");
			//style.setAttribute("border","thin solid red");

			/* Texts details form */
			style = repStyleObj.addStyle(".qrcode_payment_text_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "118mm");
			style.setAttribute("top", "192mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizePayment);
			style.setAttribute("width","87mm");
			style.setAttribute("height","88mm");
			//style.setAttribute("border","thin solid red");
			if (userParam.qr_code_add_border_separator) {
				style.setAttribute("border-top","thin dashed black");
			}

			/* Further info form */
			style = repStyleObj.addStyle(".qrcode_payment_further_info_Form");
			style.setAttribute("position", "absolute");
			style.setAttribute("left", "67mm");
			style.setAttribute("top", "280mm");
			style.setAttribute("color", "black");
			style.setAttribute("font-family", fontFamily);
			style.setAttribute("font-size", fontSizePayment);
			style.setAttribute("width","137mm");
			style.setAttribute("height","10mm");
			//style.setAttribute("border","thin solid red");




			/*********************
				IMAGES
			*********************/

			/* Scissors symbol */
			var scissors = repStyleObj.addStyle(".qrcode_scissors");
			scissors.setAttribute("position", "absolute");
			scissors.setAttribute("width","5mm");
			scissors.setAttribute("margin-left", "10mm");
			scissors.setAttribute("margin-top", "190.4mm");

			/* QR Code */
			var qrCodeImage = repStyleObj.addStyle(".qrcode_image");
			qrCodeImage.setAttribute("width", "46mm");

			/* Swiss cross */
			var qrCodeCross = repStyleObj.addStyle(".qrcode_cross");
			qrCodeCross.setAttribute("position", "absolute");
			qrCodeCross.setAttribute("margin-left", "19.5mm");
			qrCodeCross.setAttribute("margin-top", "19.5mm");
			qrCodeCross.setAttribute("width", "7mm");

			/* Corner marks */
			var rectangleReceiptAddress = repStyleObj.addStyle(".qrcode_corner_marks_receipt_payable_by");
			rectangleReceiptAddress.setAttribute("padding-left", "0mm");
			rectangleReceiptAddress.setAttribute("padding-top", "1mm");

			var rectangleReceiptAmount = repStyleObj.addStyle(".qrcode_corner_marks_receipt_amount");
			rectangleReceiptAmount.setAttribute("position", "absolute");
			rectangleReceiptAmount.setAttribute("left", "8.8mm");
			rectangleReceiptAmount.setAttribute("top", "0mm");
			rectangleReceiptAmount.setAttribute("padding-right", "5mm");

			var rectanglePaymentAddress = repStyleObj.addStyle(".qrcode_corner_marks_payment_payable_by");
			rectanglePaymentAddress.setAttribute("padding-left", "0mm");
			rectanglePaymentAddress.setAttribute("padding-top", "1mm");
			
			var rectanglePaymentAmount = repStyleObj.addStyle(".qrcode_corner_marks_payment_amount");
			rectanglePaymentAmount.setAttribute("position", "absolute");
			rectanglePaymentAmount.setAttribute("left", "-5mm");
			rectanglePaymentAmount.setAttribute("top", "4mm");
			rectanglePaymentAmount.setAttribute("padding-right", "5mm");
		}
	}

}