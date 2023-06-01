$(function () {
    $('body').append(dbSelectDialogHtml());
    $('body').append(fileImportDialogHtml());
    $('#notices').append(errtipsHtml());
    $('#errtips').css({ display: "none" });
    $('#resultTable').append(resultTableHtml());

    // tag : input  label:.. id:... placeholder:... options:... 
    let bodyObj = [
        { tag: 'text', label: "类型", placeholder: "请双击", id: "codetypeQuery", options: "", },
        { tag: 'text', label: "科目", placeholder: "请双击", id: "codecodeQuery", options: "", },
        { tag: 'textMenoy', label: "金额", placeholder: "请输入", id: "moneyQuery", options: "", },
        { tag: 'text', label: "开始时间", placeholder: "请输入", id: "start-date", options: "", },
        { tag: 'text', label: "结束时间", placeholder: "请输入", id: "end-date", options: "", },
        {
            tag: 'select', label: "状态", placeholder: "", id: "validindQuery",
            options: [
                { key: "1", value: "有效", },
                { key: "0", value: "无效", },
                { key: "*", value: "*-所有", selected: "selected" },],
        },
    ];
    let footerObj = [{ tag: 'button', id: "query", desc: "查询" }, { tag: 'button', id: "reset", desc: "重置" }, { tag: 'button', id: "add", desc: "新增" },
    { tag: 'button', id: "dataImport", desc: "账单导入" }];

    // tag : input  label:.. id:... placeholder:... options:... 
    let dialogbodyObj = [
        { tag: 'text', label: "类型", placeholder: "", id: "codecodes__codetype", readonly: true, display: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "科目", placeholder: "请双击", id: "codecodes", require: true, readonly: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'textMenoy', label: "金额", placeholder: "请输入", id: "money", require: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "时间", placeholder: "请输入", id: "inoutdate", require: true, options: "", labelcol: 3, tagcol: 9 },
        {
            tag: 'select', label: "状态", placeholder: "", id: "validind",
            options: [
                { key: "1", value: "有效", selected: "selected" },
                { key: "0", value: "无效", },
            ],
            labelcol: 3, tagcol: 9,
        },
        { tag: 'textarea', label: "备注", placeholder: "请输入", id: "remark", options: "", col: 6, labelcol: 2, tagcol: 10 },
        { tag: 'text', label: "id", placeholder: "", id: "id", pk: true, readonly: true, display: true, options: "", labelcol: 3, tagcol: 9 },
    ];

    initQueryToolbar($('#querytoolbar'), "查询条件", bodyObj, footerObj, 5, dialogbodyObj);
    initpopoveModalDialog($('#propve'), "新增", dialogbodyObj, 4, "http://127.0.0.1:8000/DailyInout/DailyinoutChange/");

    let dateFormat = "yy-mm-dd";

    $("#inoutdate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: dateFormat,
        showSecond: true,
        timeFormat: 'hh:mm:ss',
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
    });

    $("#validdate").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: dateFormat,
        showSecond: true,
        timeFormat: 'hh:mm:ss',
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
        onSelect: function (selectedDate) {
            $("#invaliddate").datepicker("option", "minDate", selectedDate);
        }
    });

    $("#invaliddate").datepicker({
        changeYear: true,
        changeMonth: true,
        showSecond: true,
        timeFormat: 'hh:mm:ss',
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
        dateFormat: dateFormat,
        onSelect: function (selectedDate) {
            $("#validdate").datepicker("option", "maxDate", selectedDate);
        }
    });

    // 时间 开始时间不能在结束时间之后
    let from = $("#start-date").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: dateFormat,
        onSelect: function (selectedDate) {
            $("#end-date").datepicker("option", "minDate", selectedDate);
        }
    });

    let to = $("#end-date").datepicker({
        changeYear: true,
        changeMonth: true,
        dateFormat: dateFormat,
        onSelect: function (selectedDate) {
            $("#start-date").datepicker("option", "maxDate", selectedDate);
        }
    });

    $('#vaildiddateQuery').datepicker({ "dateFormat": "yy-mm-dd" });

    var queryUrl = 'http://127.0.0.1:8000/DailyInout/DailyinoutAll/';
    var deleteUrl = 'http://127.0.0.1:8000/DailyInout/DailyinoutDelete/';

    function queryParamsFun(params) {
        //这里的键的名字和控制器的变量名必须一致，这边改动，控制器也需要改成一样的
        var temp = {
            codetypeQuery: $('#codetypeQuery').val(),
            codecodeQuery: $('#codecodeQuery').val(),
            moneyQuery: $('#moneyQuery').val(),
            startdateQuery: $('#start-date').val(),
            enddateQuery: $('#end-date').val(),
            validindQuery: $('#validindQuery').val(),
        };
        return temp;
    };

    function onLoadSuccessFun() {

    }

    function onLoadErrorFun() {
        notices("notice! load data from server not successed!");
    }

    var columns = [{
        checkbox: true,
        visible: true,                 //是否显示复选框
        width: '5',
    },
    {
        field: 'id',
        title: '序号',
        sortable: true,
        order: "asc",
        width: '10',
    }, {
        field: 'codecodes__codetype',
        title: '收支类型',
        sortable: true,
        order: "asc",
        // formatter: linkFormatter,
    },
    {
        field: 'codecodes',
        title: '科目',
        sortable: true,
        order: "asc",
        // formatter: linkFormatter,
    }, {
        field: 'money',
        title: '金额',
        sortable: true,
        order: "asc",
        formatter: linkFormatter,
    }, {
        field: 'inoutdate',
        title: '日期',
        sortable: true,
        order: "asc",
        // formatter: linkFormatter,
    }, {
        field: 'createtime',
        title: '创建时间',
        sortable: true,
        order: "asc",
    }, {
        field: 'updatetime',
        title: '更新时间',
        sortable: true,
        order: "asc",
    }, {
        field: 'validind',
        title: '是否有效',
        sortable: true,
        order: "asc",
        // formatter: emailFormatter
    },
        // {
        //     field: 'ID',
        //     title: '操作',
        //     width: 100,
        //     align: 'center',
        //     valign: 'middle',
        //     formatter: actionFormatter
        // },
    ];

    initResultTable(queryUrl, deleteUrl, "POST", columns, 'id', dialogbodyObj, queryParamsFun, onLoadSuccessFun, onLoadErrorFun);


    // about query

    $("#close").click(function () {
        $('#title').text("");
        $('#sure').css("visibility", "visible");
        $('#cancel').css("visibility", "visible");
    });

    $('#cancel').click(function () {
        $('#title').text("");
        $('#sure').css("visibility", "visible");
        $('#cancel').css("visibility", "visible");
    });

    $('#add').click(function () {
        $('#title').text("新增配置");
        for (let i = 0; i < dialogbodyObj.length; i++) {
            $('#' + dialogbodyObj[i].id).removeAttr("disabled");

            if (dialogbodyObj[i].readonly) {
                $('#' + dialogbodyObj[i].id).attr("readonly", 'true');
            }
            if (dialogbodyObj[i].display) {
                $($('#' + dialogbodyObj[i].id).parent().parent().parent()).css({ display: "none" });
            }
        };
        $('#popoveModal').css({ display: "block" });
        $('#fade').css({ display: "block" });
    });

    $('#reset').click(function () {
        for (let i = 0; i < bodyObj.length; i++) {
            $('#' + bodyObj[i].id).val("");
        }
    });

    $('#codetypeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($(this).val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeTypeQuery/", $(this));
    });


    $('#codecodeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($(this).val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeQuery/", $(this));
    });

    $('#codecodes').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($(this).val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeQuery/", $(this));
    });

    $('#dataImport').click(function () {
        $("#fileImportmodalDialog").draggable();//为模态对话框添加拖拽
        $("#fileImportmodal").css("overflow", "hidden");//禁止模态对话框的半透明背景滚动

        $('#fileImportModal').css({ display: "block" });
        $('#fileImportFade').css({ display: "block" });
    });

    $('#wechatImport').change(function (e) {
        $('#fileImportTable').bootstrapTable("destroy");
        readFile(e, "wechat", '微信昵称', '微信支付账单明细列表', "");
    });

    $('#ailplayImport').change(function (e) {
        $('#fileImportTable').bootstrapTable("destroy");
        readFile(e, "ailplay", '姓名', '电子客户回单', "");
    });


    function readFile(e, type, nickNameLabel, billLabel, billEndLabel) {
        if(!e.target.files[0]){
            $('#fileImportPoptips').text("未选择要导入的文件!");
            return;
        }
        let fileName = e.target.files[0].name;
        let content = new Array();
        let fileType = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
        var rABS = typeof FileReader !== 'undefined' && typeof FileReader.prototype !== 'undefined' && typeof FileReader.prototype.readAsBinaryString !== 'undefined';
        var reader = new FileReader();
        if (rABS) {
            reader.readAsBinaryString(e.target.files[0]);//发起异步请求
        } else {
            reader.readAsArrayBuffer(e.target.files[0]);//发起异步请求
        }
        reader.onerror = function (e) {
            notices(e);
        }
        // 文件读取成功完成时触发
        reader.onloadend = function (e) {
            readerLoadend(e.target.result,type, fileType, rABS, nickNameLabel, billLabel, billEndLabel);
        }
    }

    function readerLoadend(data, type, fileType, rABS, nickNameLabel, billLabel, billEndLabel) {
        if (fileType == 'txt' || fileType == 'csv') {       //txt或csv文件直接读取
            var str = null;
            var viewBuf = null;
            if (rABS) {
                str = data;   //此时data为binarystring，需要把binarystring转换为Uint8Array
                var newArray = [];
                for (let index = 0; index < data.length; index++) {
                    newArray.push(data.charCodeAt(index));
                }
                viewBuf = new Uint8Array(newArray);
            } else {
                viewBuf = new Uint8Array(data);   //此时data为ArrayBuffer
                for (var index in viewBuf) {
                    str += String.fromCharCode(viewBuf[index]);
                    if (index >= 100) {     //考虑到效率，只取前1000个用于判断字符集
                        break;
                    }
                }
            }

            var codepage = jschardet.detect(str.substring(0, 1000)).encoding;

            if (codepage == 'GB2312' || codepage == 'GB18030') {
                codepage = 'GB18030';
            } else if (codepage == 'ascii' || codepage == 'UTF-8' || codepage == 'UTF-16BE' || codepage == 'UTF-16LE') {

            } else {
                notices('不支持的编码格式:' + codepage + ';你只能使用UTF-8或GB18030(GB2320,GBK)编码格式文件');
                // resetInpuFile();
                return;
            }
            content = new TextDecoder(codepage).decode(viewBuf);
            dataImportFormat(type, content, nickNameLabel, billLabel, billEndLabel);
        }
    }

    function dataImportFormat(type, content, nickNameLabel, billLabel, billEndLabel) {
        if (content.length == 0) {
            return;
        }
        content = content.split('\n');

        let nickName;
        function BillIndex(element) {
            return element.indexOf(billLabel) != -1;
        }

        let index = content.findIndex(BillIndex);

        function BillEndIndex(element) {
            return element.indexOf(billEndLabel) != -1;
        }

        let billEndIndex = content.length;
        if (billEndLabel.length != 0) {
            billEndIndex = content.findIndex(BillEndIndex);
        }

        for (let i = 0; i < index; i++) {
            if (content[i].indexOf(nickNameLabel) != -1) {
                nickName = content[i];
                break;
            }
            // else if(content[i].indexOf('起始时间') != -1 && (content[i].indexOf('终止时间') != -1)){
            //     console.log(content[i]);
            // }
        }
        let re = new RegExp("[\r" + nickNameLabel + "：,]", "gi")
        let re1 = /["¥/"\r\t]/gi;
        let re2 = /[\[\]]/gi;

        // col name 
        let colName = content[index + 1];
        let colNames = colName.split(',').filter(item => item != '');
        let count = colName.split(',').length - colNames.length;

        let infrastructureCode = [];

        $.ajax({
            url: "http://127.0.0.1:8000/infrastruct/vaildCodeQuery/", async: false,
            success: function (result) {
                result = JSON.parse(result);
                for (i = 0; i < result.length; i++) {
                    let typeName = {
                        value: result[i]["pk"],
                        text: result[i]["fields"].codename
                    };
                    infrastructureCode.push(typeName);
                }
            }
        });

        let columns = [
            {
                field: 'Id',
                title: 'ID',
                align: 'left',
                formatter: function (value, row, index) {
                    return index;
                },
            },
        ];

        for (i = 0; i < colNames.length; i++) {
            if ('备注'.localeCompare(colNames[i].replace(re1, '')) == 0) {
                columns.push(
                    {
                        field: i,
                        title: colNames[i].replace(re1, ''),
                        align: 'left',
                        width: 200,
                        editable: {
                            type: "text",
                            emptytext: '--',
                            placeholder: "请输入",
                            validate: function (value) {
                                if (!$.trim(value)) {
                                    return '不能为空!请选择';
                                } else {
                                    $(this).attr('data-value', value);
                                }
                            },
                        },
                    }
                );
            } else {
                columns.push(
                    {
                        field: i,
                        title: colNames[i].replace(re1, ''),
                        align: 'left',
                        formatter: ellipsisFormater,
                    }
                );
            }
        }
        columns.push({ field: i, title: "昵称", align: 'left' });
        columns.push(
            {
                field: i + 1,
                title: "科目",
                align: 'left',
                editable: {
                    type: 'select',
                    title: '科目',
                    emptytext: '--',
                    loadingError: 'Error when loading options',
                    validate: function (value) {
                        if (!$.trim(value)) {
                            return '不能为空!请选择';
                        } else {
                            $(this).attr('data-value', value);
                        }
                    },
                    source: function () {
                        return infrastructureCode;
                    },
                },
            }
        );
        columns.push(
            {
                field: i + 2,
                title: "操作",
                align: 'left',
                valign: 'middle',
                formatter: deleteFormatter,
            }
        );

        let billDatas = [];

        for (let j = index + 2, ID = 0; j < billEndIndex; j++, ID++) {
            let billdata = { Id: ID };
            if (content[j].length > 0) {
                bills = content[j].split(',');
                for (i = 0; i < bills.length - count; ++i) {
                    billdata[i] = bills[i].replace(re1, "");
                };
                billdata[i] = (nickName.replace(re, '')).replace(re2, "");
                billdata[i + 1] = "";
                billDatas.push(billdata);
            }
        }
        //操作栏的格式化
        function deleteFormatter(value, row, index) {
            return "<a href='javascript:;' class='btn btn-xs red' \
            onclick=\'FileImportDeleteByIds(this)\' \
            title='删除'><span class='glyphicon glyphicon-remove'></span></a>";
        };
        initFileImportTable(type, columns, billDatas);
    }

});