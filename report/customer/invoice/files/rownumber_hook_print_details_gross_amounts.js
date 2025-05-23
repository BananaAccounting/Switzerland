function hook_print_details_gross_amounts(banDoc, repDocObj, invoiceObj, texts, userParam, detailsTable, variables) {
  /* 
    Prints the invoice details using gross Amounts (VAT included)
  */

  removeDiscountColumn(invoiceObj, userParam);

  var columnsDimension = userParam.details_columns_widths.split(";");
  var repTableObj = detailsTable;
  for (var i = 0; i < columnsDimension.length; i++) {
    repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[i]);
  }

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsNames = userParam.details_columns.split(";");
  var columnsHeaders = userParam[lang+'_text_details_columns'].split(";");
  var titlesAlignment = userParam.details_columns_titles_alignment.split(";");

  // remove all empty values ("", null, undefined): 
  columnsNames = columnsNames.filter(function(e){return e});
  columnsHeaders = columnsHeaders.filter(function(e){return e});

  if (columnsNames.length == columnsHeaders.length) {
    for (var i = 0; i < columnsHeaders.length; i++) {
      var alignment = titlesAlignment[i];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "center";
      }
      columnsHeaders[i] = columnsHeaders[i].trim();
      if (columnsHeaders[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsHeaders[i], "doc_table_header "+ alignment, 1);
      }
      columnsNumber ++;
    }
  }
  else {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      columnsNumber ++;
    }
  }

  var decimals = getQuantityDecimals(invoiceObj, banDoc);
  var columnsAlignment = userParam.details_columns_alignment.split(";");

  //ITEMS
  var customColumnMsg = "";
  for (var i = 0; i < invoiceObj.items.length; i++) {

    var item = invoiceObj.items[i];
    var className = "item_cell"; // row with amount
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell"; // row with DocType 10:tot
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell"; // row without amount
    }
    if (item.item_type && item.item_type.indexOf("header") === 0) {
      className = "header_cell"; // row with DocType 10:hdr
    }

    var classNameEvenRow = "";
    if (i % 2 == 0) {
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsNames.length; j++) {
      var alignment = columnsAlignment[j];
      if (alignment !== "left" && alignment !== "center" && alignment !== "right") {
        alignment = "left";
      }

      if (columnsNames[j].trim().toLowerCase() === "description") {
        //When 10:hdr with empty description, let empty line
        if (item.item_type && item.item_type.indexOf("header") === 0 && !item.description) {
          tableRow.addCell(" ", classNameEvenRow, 1);
        }
        else {
          // Note: currently itemValue2 does not exist, this will add an empty line
          // We don't remove this code because it will change how the invoice is printed and what the customer expect
          var itemValue = formatItemsValue(item.description, variables, columnsNames[j], className, item);
          var itemValue2 = formatItemsValue(item.description2, variables, columnsNames[j], className, item);
          var descriptionCell = tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          addMdBoldText(descriptionCell, itemValue.value);
          descriptionCell.addParagraph(itemValue2.value, "");
          addMultipleLinesDescriptions(banDoc, descriptionCell, item.origin_row, userParam);
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "quantity") {
        if (IS_INTEGRATED_INVOICE) {
          // Always print quantity if entered in the Quantity column, even if "quantity,unit,unitprice" are not all entered.
          // Transactions without quantity, in JSON are saved without decimals ("item.quantity":"1")
          // Transactins with quantity, in JSON are saved with four decimals ("item.quantity":"1.0000")
          if (item.quantity && item.quantity !== "1") {
            if (variables.decimals_quantity !== "") {
              decimals = variables.decimals_quantity;
            }
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          } else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
        else {
          if (item.quantity) {
            decimals = variables.decimals_quantity;
            var itemValue = formatItemsValue(item.quantity, decimals, columnsNames[j], className, item);
            tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
          }
          else {
            tableRow.addCell("", classNameEvenRow + " " + alignment + " padding-left padding-right " + className, 1);
          }
        }
      }
      else if (columnsNames[j].trim().toLowerCase() === "referenceunit" || columnsNames[j] === "mesure_unit") {
        var itemValue = formatItemsValue(item.mesure_unit, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "unitprice" || columnsNames[j] === "unit_price") {
        var itemValue = formatItemsValue(item.unit_price.calculated_amount_vat_inclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "amount" || columnsNames[j] === "total_amount_vat_inclusive") {
        var itemValue = formatItemsValue(item.total_amount_vat_inclusive, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "vatrate" || columnsNames[j] === "vat_rate") {
        var itemValue = formatItemsValue(item.unit_price.vat_rate, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "discount") {
        var itemValue = "";
        if (item.discount && item.discount.percent) {
          itemValue = formatItemsValue(item.discount.percent, variables, columnsNames[j], className, item);
          itemValue.value += "%";
        }
        else if (item.discount && item.discount.amount) {
          itemValue = formatItemsValue(item.discount.amount, variables, columnsNames[j], className, item);
        }
        else {
          itemValue = formatItemsValue("", variables, columnsNames[j], className, item);
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "number") {
        var itemValue = formatItemsValue(item.number, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else if (columnsNames[j].trim().toLowerCase() === "rownumber") {
        var rowNumber = i+1; // i is the item position in JSON
        var itemValue = formatItemsValue(rowNumber, variables, columnsNames[j], className, item);
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
      else {
        var userColumnValue = "";
        var columnsName = columnsNames[j];
        var itemValue = "";
        //User defined columns only available with advanced version
        //In settings dialog, must start with "T." for integrated ivoices or "I." for estimates invoices
        //This prevent conflicts with JSON fields.
        if (BAN_ADVANCED) {
          //JSON contains a property with the name of the column (Item, Date)
          //In JSON all names are lower case
          if (objectHasProperty(item, columnsName)) {
            itemValue = formatItemsValue(objectGetProperty(item, columnsName), variables, columnsName, className, item);
          }
          else {
            userColumnValue = getUserColumnValue(banDoc, item.origin_row, item.number, columnsName);
            columnsName = columnsName.substring(2);
            itemValue = formatItemsValue(userColumnValue, variables, columnsName, className, item);            
          }
        }
        else {
          customColumnMsg = "The customization with custom columns requires Banana Accounting+ Advanced";
        }
        tableRow.addCell(itemValue.value, classNameEvenRow + " " + alignment + " padding-left padding-right " + itemValue.className, 1);
      }
    }
  }
  // Show message when using custom column with a non advanced version of Banana+
  if (customColumnMsg.length > 0) {
    banDoc.addMessage(customColumnMsg);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", columnsNumber);

  //SUBTOTAL
  //Only used for the Application Estimates-Invoices
  //Print subtotal if there is discount, deposit or rounding
  if (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference
    || invoiceObj.billing_info.total_advance_payment)
  ) {
    
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.subtotal, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_amount_vat_inclusive_before_discount, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DISCOUNT
  //Only used for the Application Estimates-Invoices
  //On Integrated Invoice, discounts are entered as items in transactions
  if (invoiceObj.billing_info.total_discount_vat_inclusive) {
    tableRow = repTableObj.addRow();
    let discountText = invoiceObj.billing_info.discount.description ? invoiceObj.billing_info.discount.description : texts.discount;
    if (invoiceObj.billing_info.discount.percent) {
      discountText += " " + invoiceObj.billing_info.discount.percent + "%";
    }
    tableRow.addCell(discountText, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(invoiceObj.billing_info.total_discount_vat_inclusive), variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", columnsNumber-1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_rounding_difference, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  //DEPOSIT
  //Only used for the Application Estimates-Invoices
  if (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_advance_payment) {
    tableRow = repTableObj.addRow();
    if (invoiceObj.billing_info.total_advance_payment_description) {
      tableRow.addCell(invoiceObj.billing_info.total_advance_payment_description, "padding-left padding-right", columnsNumber-1);
    } else {
      tableRow.addCell(texts.deposit, "padding-left padding-right", columnsNumber-1);
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_advance_payment, variables.decimals_amounts, true), "right padding-left padding-right", 1);
  }

  tableRow = repTableObj.addRow();
  if (invoiceObj.billing_info.total_amount_vat_inclusive_before_discount
    && (invoiceObj.billing_info.total_discount_vat_inclusive 
    || invoiceObj.billing_info.total_rounding_difference
    || (!IS_INTEGRATED_INVOICE && invoiceObj.billing_info.total_advance_payment) )
  ) {
    tableRow.addCell("", "border-top", columnsNumber);
  } else {
    tableRow.addCell("", "", columnsNumber);
  }

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam[lang+'_text_total'] + " " + invoiceObj.document_info.currency, "total_cell", columnsNumber-1);
  tableRow.addCell(Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_to_pay, variables.decimals_amounts, true), "total_cell right", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", columnsNumber);

  //VAT INFO
  tableRow = repTableObj.addRow();
  var cellVatInfo = tableRow.addCell("", "padding-right right vat_info", columnsNumber);
  for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
    var vatInfo = "";
    vatInfo += Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_inclusive, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency + " (" + texts.gross + ") // ";
    vatInfo += Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency + " (" + texts.net + ")";
    vatInfo += " " + texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%";
    vatInfo += " = " + Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, variables.decimals_amounts, true) + " " + invoiceObj.document_info.currency;
    cellVatInfo.addParagraph(vatInfo);
  }
}