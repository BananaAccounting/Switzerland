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


/* Script update: 2020-03-10 */


/*
 * Returns TRUE if is a valid QR-IBAN
 * Returns FALSE if not.
 * QR-IBAN are recognized by a special identification of the institution (QR-IID) within the QR-IBAN
 * A QR-IID exclusively contains values in the range 30000–31999
 */
function isQRIBAN(input) {
	input = input.replace(/ /g, "");
	var qriid = input.substring(4,9);
	if (qriid >= 30000 && qriid <= 31999) {
		return true;
	} else {
		return false;
	}
}

/*
 * Returns 1 if the IBAN is valid 
 * Returns FALSE if the IBAN's length is not as should be (for CH the IBAN Should be 21 chars long starting with CH )
 * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
 */
function isValidIBAN(input) {
    var CODE_LENGTHS = {
        AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
        CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
        FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
        HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
        LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
        MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
        RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
    };
    var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
            code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
            digits;
    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
        return false;
    }
    // rearrange country code and check digits, and convert chars to ints
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
        return letter.charCodeAt(0) - 55;
    });
    // final check
    return mod97(digits);
}

function mod97(string) {
    var checksum = string.slice(0, 2), fragment;
    for (var offset = 2; offset < string.length; offset += 7) {
        fragment = String(checksum) + string.substring(offset, offset + 7);
        checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
}

/*
 * Country code ISO 3166-1 
 * Return true if correct
 * 
 * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements
 */
function isValidCountryCode(input) {
    var countryCodes = [
        "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR",
        "AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE",
        "BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ",
        "BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD",
        "CF","CG","CH","CI","CK","CL","CM","CN","CO","CR",
        "CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM",
        "DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI",
        "FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF",
        "GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS",
        "GT","GU","GW","GY","HK","HM","HN","HR","HT","HU",
        "ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
        "JE","JM","JO","JP","KE","KG","KH","KI","KM","KN",
        "KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK",
        "LR","LS","LT","LU","LV","LY","MA","MC","MD","ME",
        "MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ",
        "MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA",
        "NC","NE","NF","NG","NI","NL","NO","NP","NR","NU",
        "NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM",
        "PN","PR","PS","PT","PW","PY","QA","RE","RO","RS",
        "RU","RW","SA","SB","SC","SD","SE","SG","SH","SI",
        "SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV",
        "SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK",
        "TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA",
        "UG","UM","US","UY","UZ","VA","VC","VE","VG","VI",
        "VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"
    ];

    if (countryCodes.indexOf(input.toUpperCase()) > -1) {
        return true;
    }
}

function isSwissCountry(input) {
    if (input.toLowerCase()==="svizzera" || input.toLowerCase()==="suisse" || input.toLowerCase()==="schweiz" || input.toLowerCase()==="switzerland") {
        return true;
    }
}




