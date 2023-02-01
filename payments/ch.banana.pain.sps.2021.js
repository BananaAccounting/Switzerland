// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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

//ID_PAIN_FORMAT_001_001_03 DomBuilder declared in ch.banana.pain.iso.2009.js
//ID_PAIN_FORMAT_001_001_03_CH_02 DomBuilderSPS2021
var DomBuilderSPS2021 = class DomBuilderSPS2021 extends DomBuilder {
    constructor(painFormat, withSchemaLocation) {
        super(painFormat, withSchemaLocation);
        this.root.setAttribute('xmlns', 'http://www.six-interbank-clearing.com/de/%1.xsd'.arg(this.painFormat));
        if (withSchemaLocation) {
            this.root.setAttribute('xsi:schemaLocation', 'http://www.six-interbank-clearing.com/de/%1.xsd %2.xsd'.arg(this.painFormat).arg(this.painFormat));
        }
    }
}
