$(function () {
    $('body').append(dbSelectDialogHtml());
    $('#notices').append(errtipsHtml());
    $('#errtips').css({ display: "none" });
    $('#resultTable').append(resultTableHtml());

    // tag : input  label:.. id:... placeholder:... options:... 
    let bodyObj = [
        { tag: 'text', label: "类型", placeholder: "请双击", id: "codetypeQuery", options: "", },
        { tag: 'text', label: "科目", placeholder: "请双击", id: "codecodeQuery", options: "", },
        { tag: 'text', label: "开始时间", placeholder: "请输入", id: "start-date", options: "", },
        { tag: 'text', label: "结束时间", placeholder: "请输入", id: "end-date", options: "", },
        {
            tag: 'select', label: "状态", placeholder: "", id: "validindQuery",
            options: [
                { key: "1", value: "有效", selected: "" },
                { key: "0", value: "无效", selected: "" },
                { key: "*", value: "*-所有", selected: "selected" },],
        },
    ];
    let footerObj = [{ tag: 'button', id: "query", desc: "查询" }, { tag: 'button', id: "reset", desc: "重置" }, { tag: 'button', id: "add", desc: "新增" }];

    // tag : input  label:.. id:... placeholder:... options:... 
    let dialogbodyObj = [
        { tag: 'text', label: "类型", placeholder: "请双击", id: "codetype_id", require: true, readonly: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "科目", placeholder: "请输入", id: "codecode", require: true, pk: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "名称", placeholder: "请输入", id: "codename", require: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "生效时间", placeholder: "请输入", id: "validdate", require: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "失效时间", placeholder: "请输入", id: "invaliddate", require: true, options: "", labelcol: 3, tagcol: 9 },
        {
            tag: 'select', label: "状态", placeholder: "", id: "validind", require: true, options: [
                { key: "1", value: "有效", selected: "selected" },
                { key: "0", value: "无效", selected: "" },],
            labelcol: 3, tagcol: 9,
        },
        { tag: 'textarea', label: "备注", placeholder: "请输入", id: "remark", options: "", col: 6, labelcol: 2, tagcol: 10 },
    ];
    initQueryToolbar($('#querytoolbar'), "查询条件", bodyObj, footerObj, 5, dialogbodyObj);
    initpopoveModalDialog($('#propve'), "新增", dialogbodyObj, 4, "http://127.0.0.1:8000/infrastruct/CodeChange/");

    let dateFormat = "yy-mm-dd";

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
        dateFormat: dateFormat,
        showSecond: true,
        timeFormat: 'hh:mm:ss',
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
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

    var queryUrl = 'http://127.0.0.1:8000/infrastruct/CodeAll/';
    var deleteUrl = 'http://127.0.0.1:8000/infrastruct/CodeDelete/';


    $('#date').datepicker({ "dateFormat": "yy-mm-dd", });
    $('#vaildiddate').datepicker({ "dateFormat": "yy-mm-dd", });

    function queryParamsFun(params) {
        //这里的键的名字和控制器的变量名必须一致，这边改动，控制器也需要改成一样的
        var temp = {
            codetypeQuery: $('#codetypeQuery').val(),
            codecodeQuery: $('#codecodeQuery').val(),
            enddateQuery: $('#end-date').val(),
            startdateQuery: $('#start-date').val(),
            validindQuery: $('#validindQuery').val(),
        };
        return temp;
    };

    function onLoadSuccessFun() {

    }

    function onLoadErrorFun() {
        notices("notice! load data from server failed!");
    }

    var columns = [{
        checkbox: true,
        visible: true,                 //是否显示复选框
        width: '5',
    },
    {
        field: 'Id',
        title: '序号',
        sortable: true,
        order: "asc",
        width: '10',
        formatter: function (value, row, index) {
            return index + 1;
        },
    }, {
        field: 'codetype_id',
        title: '类型',
        sortable: true,
        order: "asc",
    },
    {
        field: 'codecode',
        title: '科目',
        sortable: true,
        order: "asc",
        formatter: linkFormatter,
    }, {
        field: 'codename',
        title: '描述',
        sortable: true,
        order: "asc",
    }, {
        field: 'creatorcode_id',
        title: '创建者',
        sortable: true,
        order: "asc",
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
        field: 'validdate',
        title: '生效时间',
        sortable: true,
        order: "asc",
    }, {
        field: 'invaliddate',
        title: '失效时间',
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

    initResultTable(queryUrl, deleteUrl, "POST", columns, 'codecode', dialogbodyObj, queryParamsFun, onLoadSuccessFun, onLoadErrorFun);


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
        $('#popoveModal').css({ display: "block" });
        $('#fade').css({ display: "block" });

        $('#title').text("新增配置");
        for (let i = 0; i < dialogbodyObj.length; i++) {
            $('#' + dialogbodyObj[i].id).removeAttr("disabled");

            if (dialogbodyObj[i].readonly) {
                $('#' + dialogbodyObj[i].id).attr("readonly", 'true');
            }
        };

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
        $('#selectCode').val($('#codetypeQuery').val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeTypeQuery/", $(this));
    });

    $('#codetype_id').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($('#codetype').val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeTypeQuery/", $(this));
    });


    $('#codecodeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($('#codecodeQuery').val());

        initDbSelect("http://127.0.0.1:8000/infrastruct/vaildCodeQuery/", $(this));
    });

    $("#codetype").change(function () {
        $.ajax({
            url: 'http://127.0.0.1:8000/infrastruct/CodeTypeIsExist/',
            type: 'POST',
            data: { 'codetype': $(this).val() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if ("1".localeCompare(data['code']) != 0) {
                    $('#poptips').text(data['msg']);
                } else {
                    $('#poptips').text("");
                }
            },
            error: function (obj) {
                $('#poptips').text(obj);
            }
        });
    });

    $("#codecode").change(function () {
        if (($(this).val()).length == 0) {
            $('#poptips').text("");
        }
        $.ajax({
            url: 'http://127.0.0.1:8000/infrastruct/CodeIsExist/',
            type: 'POST',
            data: { 'codecode': $(this).val() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if ("1".localeCompare(data['code']) == 0) {
                    $('#poptips').text(data['msg']);
                } else {
                    $('#poptips').text("");
                }
            },
            error: function (obj) {
                $('#poptips').text(obj);
            }
        });
    });


});