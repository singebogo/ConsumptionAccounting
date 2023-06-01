$(function () {
    $('body').append(dbSelectDialogHtml());
    $('#notices').append(errtipsHtml());
    $('#errtips').css({ display: "none" });
    $('#resultTable').append(resultTableHtml());

    // tag : input  label:.. id:... placeholder:... options:... 
    let bodyObj = [
        { tag: 'text', label: "类型", placeholder: "请双击", id: "configTypeQuery", options: "", },
        { tag: 'text', label: "科目", placeholder: "请双击", id: "codecodeQuery", options: "", },
        { tag: 'textMenoy', label: "限额", placeholder: "请输入", id: "limitQuery", options: "", },
        { tag: 'text', label: "样式", placeholder: "请输入", id: "styleQuery", options: "", },
        {
            tag: 'select', label: "状态", placeholder: "", id: "validindQuery",
            options: [
                { key: "1", value: "有效", selected: "" },
                { key: "0", value: "无效", selected: "" },
                { key: "*", value: "*-所有", selected: "selected" },],
        },
    ];
    let footerObj = [{ id: "query", desc: "查询" }, { id: "reset", desc: "重置" }, { id: "add", desc: "新增" }];
    $('#querytoolbar').append(queryToolbar("查询条件", bodyObj, footerObj, 5));

    // tag : input  label:.. id:... placeholder:... options:... 
    let dialogbodyObj = [
        { tag: 'text', label: "id", placeholder: "", id: "id", readonly: true, display: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'text', label: "类型", placeholder: "", id: "codecodes__codetype", require: true, readonly: true, options: "", labelcol: 3, tagcol: 9, },
        { tag: 'text', label: "科目", placeholder: "请双击", id: "codecode", require: true, readonly: true, options: "", labelcol: 3, tagcol: 9 },
        { tag: 'textMenoy', label: "限额", placeholder: "请输入", id: "limit", require: true, options: "", labelcol: 3, tagcol: 9 },
    
        { tag: 'textarea', label: "样式", placeholder: "请输入", id: "style", require: true, options: "", col: 6, labelcol: 2, tagcol: 10 },
        { tag: 'textarea', label: "备注", placeholder: "请输入", id: "remark", options: "", col: 6, labelcol: 2, tagcol: 10 },

        {
            tag: 'select', label: "状态", placeholder: "", id: "validind", require: true, options: [
                { key: "1", value: "有效", selected: "selected" },
                { key: "0", value: "无效", selected: "" },],
            labelcol: 3, tagcol: 9,
        },
    ];

    initpopoveModalDialog($('#propve'), "新增", dialogbodyObj, 4, "http://127.0.0.1:8000/Metrics/MetricsChange/");

    $("#date").datepicker({ "dateFormat": "yy-mm-dd" });

    $('#vaildiddate').datepicker({ "dateFormat": "yy-mm-dd" });

    var queryUrl = 'http://127.0.0.1:8000/Metrics/MetricsAll/';
    var deleteUrl = 'http://127.0.0.1:8000/Metrics/MetricsDelete/';

    function queryParamsFun(params) {
        //这里的键的名字和控制器的变量名必须一致，这边改动，控制器也需要改成一样的
        var temp = {
            codetypeQuery: $('#codetypeQuery').val(),
            codecodeQuery: $('#codecodeQuery').val(),
            limitQuery: $('#limitQuery').val(),
            styleQuery: $('#styleQuery').val(),
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
        width: '10',
        // formatter: linkFormatter,
    },
    {
        field: 'codecodes',
        title: '科目',
        sortable: true,
        order: "asc",
        width: '10',
        // formatter: linkFormatter,
    }, {
        field: 'limit',
        title: '限额',
        sortable: true,
        order: "asc",
        width: '100',
        formatter: linkFormatter,
    }, {
        field: 'style',
        title: '样式',
        sortable: true,
        order: "asc",
        // formatter: linkFormatter,
    }, {
        field: 'validind',
        title: '是否有效',
        sortable: true,
        order: "asc",
        width: '10',
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
    $('#reset').click(function () {
        for (let i = 0; i < bodyObj.length; i++) {
            $('#' + bodyObj[i].id).val("");
        }
    });

    $('#type').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        initDbSelect("https://console-mock.apipost.cn/app/mock/project/5fdcd2b6-71dc-4919-9f0c-4636d4ca2760/DBSelectQuery", $(this), 'code');
    });


    $('#configTypeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        initDbSelect("https://console-mock.apipost.cn/app/mock/project/5fdcd2b6-71dc-4919-9f0c-4636d4ca2760/DBSelectQuery", $(this), 'code');
    });

    $('#configCodeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        initDbSelect("https://console-mock.apipost.cn/app/mock/project/5fdcd2b6-71dc-4919-9f0c-4636d4ca2760/DBSelectQuery", $(this), 'name');
    });

});