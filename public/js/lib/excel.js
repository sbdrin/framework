(function ($) {
    var opts =
    {
        rowsid: null,
        styleid: null,
        customTitle: null,
        dataset: null,
        fields: null,
        eturnData: false,
        enCode: true,
        serverURL: "/Credit/Common/ExportGridData",
        filename: "OptionsTradeRuns",
        worksheetName: "My Worksheet"
    };

    function format(s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p]
        })
    }

    function createHiddenInput(value, name, form) {
        var input = document.createElement('input');
        input.name = name;
        input.value = value;
        input.type = 'hidden';
        form.appendChild(input);
        return input;
    }
    function createHiddenTextArea(value, name, form) {
        var textArea = document.createElement('textarea');
        textArea.name = name;
        textArea.value = value;
        form.appendChild(textArea);
        return textArea;
    }

    function createForm(filename, format, content, serverURL) {
        var form = document.createElement('form');
        createHiddenInput(filename, 'filename', form);
        opts.enCode && createHiddenInput("Base64", 'enCodeType', form);
        createHiddenInput(format, 'format', form);
        createHiddenTextArea(content, 'content', form);

        form.action = serverURL;
        form.method = 'post';
        document.body.appendChild(form);
        return form;
    }

    function Initialize() {
        excelData = Export(ConvertDataStructureToRow($('#' + opts.rowsid).html().replace("<!--[CDATA[", "").replace("-->", "")), $('#' + opts.styleid).html().replace("<!--[CDATA[", "").replace("-->", ""));
        if (opts.returnData) {
            return opts.enCode ? Base64.encode(excelData) : excelData;
        }
        if (opts.serverURL) {
            var form = createForm(opts.filename, "xls", opts.enCode ? Base64.encode(excelData) : excelData, opts.serverURL);
            form.submit();
            document.body.removeChild(form);
        }
        else {
            var uri = "data:application/vnd.ms-excel;base64,";
            window.open(uri + Base64.encode(excelData));
        }
    }
    function ConvertDataStructureToRow(titles, styles) {
        var result = "";
        var rows = [];
        var cellArr = [];
        var tempSheel = "";
        var cell = '<Cell ss:StyleID="{style}"><Data ss:Type="{type}">{value}</Data></Cell>';
        var cellReplace = "";
        if (opts.customTitle) {
            cellArr = [];
            $.each(opts.customTitle, function () {
                cellReplace =
                {
                    style: "title",
                    type: "String",
                    value: this
                };
                cellArr.push(format(cell, cellReplace));
            });
            titles = "<Row>" + cellArr.join("") + "</Row>";
        }
        var sheels = '<Worksheet ss:Name="{sheet}"><Table ss:ExpandedColumnCount="30" ss:ExpandedRowCount="8000" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15"><Column ss:Width="80" ss:Span="' + 9 + '"/>';
        sheels += titles + '{rows}</Table></Worksheet>';

        $.each(opts.dataset, function (key, source) {
            if (!source.length)
                return;
            var ctx =
            {
                sheet: key,
                AskUpFront: source.ASKUPFRONT.toFixed(2) || "",
                rows: ""
            };
            var alt = "";
            $(source).each(function (key, row) {
                cellArr = [];
                alt = key % 2 ? "Alt" : "";
                if (opts.fields) {
                    $.each(opts.fields, function (i, val) {
                        cellReplace =
                        {
                            style: "defaultStr" + alt,
                            type: "String",
                            value: row[val] || ""
                        };
                        if (row[val] == parseFloat(row[val])) {
                            cellReplace.style = "defaultNum" + alt;
                            cellReplace.type = "Number";
                        }
                        cellArr.push(format(cell, cellReplace));
                    });
                }

                else {
                    $.each(row, function (i, value) {
                        cellReplace =
                        {
                            style: "defaultStr" + alt,
                            type: "String",
                            value: value || ""
                        };
                        if (value == parseFloat(value)) {
                            cellReplace.style = "defaultNum" + alt;
                            cellReplace.type = "Number";
                        }
                        cellArr.push(format(cell, cellReplace));
                    });
                }
                ctx.rows += "<Row>" + cellArr.join("") + "</Row>";
            });
            result += format(sheels, ctx);
        });
        return result;
    }
    function Export(rows, styles) {
        var excelFile = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook  xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Styles>';
        excelFile += '<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Borders/><Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/><Interior/><NumberFormat/><Protection/></Style>'
        excelFile += '<Style ss:ID="title" ss:Name="title"><Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/></Borders><Font ss:FontName="Arial" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#2b4f8e" ss:Pattern="Solid"/></Style>'
        excelFile += '<Style ss:ID="defaultStr" ss:Name="xls-style-99"><Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/></Borders><Font ss:FontName="Arial" ss:Color="#000000"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>'
        excelFile += '<Style ss:ID="defaultNum" ss:Name="xls-style-98"><Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/></Borders><Font ss:FontName="Arial" ss:Color="#000000"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/><NumberFormat ss:Format="#,##0.00_);[Red]\(#,##0.00\)"/></Style>'
        excelFile += '<Style ss:ID="defaultStrAlt" ss:Name="xls-style-97"><Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/></Borders><Font ss:FontName="Arial" ss:Color="#000000"/><Interior ss:Color="#DBE5F1" ss:Pattern="Solid"/></Style>'
        excelFile += '<Style ss:ID="defaultNumAlt" ss:Name="xls-style-96"><Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#AAAAAA"/></Borders><Font ss:FontName="Arial" ss:Color="#000000"/><Interior ss:Color="#DBE5F1" ss:Pattern="Solid"/><NumberFormat ss:Format="#,##0.00_);[Red]\(#,##0.00\)"/></Style>'
        excelFile += styles || "";
        excelFile += "</Styles>";
        excelFile += rows || "";
        excelFile += "</Workbook>";
        return excelFile;
    }

    $.exportExcel = function (options) {
        opts = $.extend({}, opts, options);
        var gridData = [];
        var excelData;
        return Initialize();
    };
})(jQuery);


