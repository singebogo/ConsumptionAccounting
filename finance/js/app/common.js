
// -----------------------------提示框 --------------------------------------------------------------
/**
* 重写确认框 fun:函数对象 params:参数列表， 可以是数组
*/
function confirm(fun, params) {
    if ($("#myConfirm").length > 0) {
        $("#myConfirm").remove();
    }
    var html = "<div class='modal fade' id='myConfirm' >"
        + "<div class='modal-backdrop in' style='opacity:0; '></div>"
        + "<div class='modal-dialog' style='z-index:2901; margin-top:60px; width:400px; '>"
        + "<div class='modal-content'>"
        + "<div class='modal-header'  style='font-size:16px; '>"
        + "<span class='glyphicon glyphicon-envelope'>&nbsp;</span>信息！<button type='button' class='close' data-dismiss='modal'>"
        + "<span style='font-size:20px;' class='glyphicon glyphicon-remove'></span><tton></div>"
        + "<div class='modal-body text-center' id='myConfirmContent' style='font-size:18px; '>"
        + "是否确定要删除？"
        + "</div>"
        + "<div class='modal-footer' style=''>"
        + "<button class='btn btn-danger btn-xs' id='confirmOk' >确定<tton>"
        + "<button class='btn btn-info btn-xs' data-dismiss='modal'>取消<tton>"
        + "</div>" + "</div></div></div>";
    $("body").append(html);

    $("#myConfirm").modal("show");

    $("#confirmOk").on("click", function () {
        $("#myConfirm").modal("hide");
        fun(params); // 执行函数
    });
};

// tips提示框 
function alerterrtipsHtml() {
    return '<div class="row">'
        + '<div class="col-md-offset-1 col-md-5 alerthidden" id="errtips">'
        + '<div class="alert alert-warning alert-dismissible">'
        + '<button type="button" class="close btn btn-warning btn-xs" data-dismiss="alert">&times;</button>'
        + '<strong><span id="msgs"></span></strong>'
        + '</div>'
        + '</div>'
        + '</div>';
};

// tips提示框 
function errtipsHtml() {
    return '<div class="row">'
        + '<div class="col-xs-offset-1 col-xs-3 alerthidden" id="errtips">'
        + '<div class="alert alert-warning alert-dismissible">'
        + '<button type="button" class="close btn btn-warning btn-xs" data-dismiss="alert">&times;</button>'
        + '<strong><span id="msgs"></span></strong>'
        + '</div>'
        + '</div>'
        + '</div>';
};

// 警告提示框
function notices(msg) {
    $('#msgs').text("");
    $('#msgs').text(msg);
    $('#errtips').css({ display: "block", "z-index": 1010 });
    window.setTimeout(function () {
        $('#errtips').css({ display: "none" });
    }, 2000);//显示的时间
};

// -----------------------------boostarp table 双击域 --------------------------------------------------------------

function dbSelectDialogHtml() {
    var dialogHtml = '<div id="dbselectfade" class="black_overlay">\
    </div><div class="white_content_dbselect" id="dbSelectModal" tabindex="-1" role="dialog" aria-labelledby="dbSelectModal"> \
    <div id="dbSelectModalDialog" class="dbselectmodal-dialog" role="document"> \
        <div class="modal-content" style="width:400px;"> \
            <div class="modal-header"> \
                <div class="row"> \
                    <div class="col-sm-3"> \
                        <span id="title">请选择 </span> \
                    </div> \
                    <div class="col-sm-offset-8 col-sm-1"> \
                        <a href="javascript:void(0)" id="close" \
                            onclick="$(\'#dbSelectModal\').css({display:\'none\'});$(\'#dbselectfade\').css({display:\'none\'});"> \
                            <i class="glyphicon glyphicon-remove"></i> \
                        </a> \
                    </div> \
                </div> \
            </div> \
            <div class="modal-body"> \
                <form class="form-horizontal" role="form"> \
                    <div class="row"> \
                        <div class="col-xs-12"> \
                            <div class="col-lg-6 col-md-6 col-xs-6"> \
                                <div class="form-group"> \
                                    <label for="selectCode" class="col-lg-5 col-md-5 col-xs-5 control-label">代码</label> \
                                    <div class="col-lg-7 col-md-7 col-xs-7"> \
                                        <input type="text" class="form-control input-sm" id="selectCode" \
                                            placeholder="请双击"> \
                                    </div> \
                                </div> \
                            </div> \
                            <div class="col-lg-6 col-md-6 col-xs-6"> \
                                <div class="form-group"> \
                                    <label for="selectName" \
                                        class="col-lg-5 col-md-5 col-xs-5 control-label">代码名称</label> \
                                    <div class="col-lg-7 col-md-7 col-xs-7"> \
                                        <input type="text" class="form-control input-sm" id="selectName" \
                                            placeholder="请输入"> \
                                    </div> \
                                </div> \
                            </div> \
                            <div class="clearfix"></div> \
                            <div class="col-lg-8 col-md-8 col-xs-8"> \
                                <div class="form-group"> \
                                    <input type="button" class= \'btn btn-primary btn-xs\' id=\'dbSelectQuery\' value="查询" /> \
                                    <input type="button" class= \'btn btn-primary btn-xs\' id=\'dbSelectReset\' value="重置" /> \
                                    <input type="button" class= \'btn btn-primary btn-xs\' id=\'dbSelectCancel\' value="取消" \
                                        onclick="$(\'#dbSelectModal\').css({display:\'none\'});$(\'#dbselectfade\').css({display:\'none\'});"/> \
                                </div> \
                            </div> \
                            <div class="clearfix"></div> \
                            </div> \
                    </div> \
                </form> \
            </div> \
            <div class="modal-footer"> \
                <div class="row"> \
                    <div class="col-xs-12"> \
                        <table id="dbselecttable"> \
                        </table> \
                    </div> \
                </div> \
            </div> \
        </div> \
    </div> \
</div> ';
    return dialogHtml;
};

// 初始化双击域

function initDbSelect(url, $target) {

    $('#dbselecttable').bootstrapTable("destroy");
    var columns = [{
        field: 'Id',
        title: 'Id',
        formatter: function (value, row, index) {
            return index + 1;
        },
    }, {
        field: 'pk',
        title: 'code'
    }, {
        field: 'fields.codename',
        title: 'name'
    }];

    $('#dbselecttable').bootstrapTable({
        url: url,        // 表格数据来源
        method: 'POST',                      //请求方式（*）
        // ajaxOptions: {
        //     headers: { "Access-Control-Allow-Origin": '*' }
        // },
        contentType: "application/x-www-form-urlencoded",
        toolbar: '#toolbar',                //工具按钮用哪个容器
        striped: true,                      //是否显示行间隔色
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true,                   //是否显示分页（*）
        sortable: true,                    //是否启用排序
        sortOrder: "asc",                   //排序方式
        sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                       //初始化加载第一页，默认第一页
        pageSize: 5,                       //每页的记录行数（*）
        pageList: [5],                      //可供选择的每页的行数（*）
        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
        strictSearch: false,
        showColumns: false,                  //是否显示所有的列
        showRefresh: false,                  //是否显示刷新按钮
        minimumCountColumns: 2,             //最少允许的列数
        clickToSelect: true,                //是否启用点击选中行
        uniqueId: "Id",                     //每一行的唯一标识，一般为主键列
        showToggle: false,                    //是否显示详细视图和列表视图的切换按钮
        cardView: false,                    //是否显示详细视图
        detailView: false,                   //是否显示父子表
        queryParams: queryParamsFun(),
        columns: columns,
        onClickRow: function (data, $element, field) {
            $target.val(data['pk']);
            // 关闭
            $('#dbSelectModal').css({ display: 'none' });
            $('#dbselectfade').css({ display: 'none' });
        },
    });

    function queryParamsFun(params) {
        //这里的键的名字和控制器的变量名必须一致，这边改动，控制器也需要改成一样的
        var temp = {
            selectCode: $('#selectCode').val(),
            selectName: $('#selectName').val(),
        };
        return temp;
    };

    $('#dbSelectQuery').click(function () {
        $("#dbselecttable").bootstrapTable('refreshOptions', { pageNumber: 1, queryParams: queryParamsFun() });
    });

    $('#dbSelectCancel').click(function () {
        $('#selectCode').val("");
        $('#selectName').val("");
    });

    $('#dbSelectReset').click(function () {
        $('#selectCode').val("");
        $('#selectName').val("");
    });
};

// -------------------------------------------数据导入展示模块-----------------------------------------------------------------------

function fileImportDialogHtml() {
    var dialogHtml = '<div id="fileImportFade" class="black_overlay">\
    </div><div class="white_content_fileImport" id="fileImportModal" tabindex="-1" role="dialog" aria-labelledby="fileImportModal"> \
    <div id="fileImportModalDialog" class="fileImportmodalDialog" role="document"> \
        <div class="modal-content"> \
            <div class="modal-header"> \
                <div class="row"> \
                    <div class="col-xs-3"> \
                        <span id="title">数据批量导入 </span> \
                    </div> \
                    <div class="col-xs-offset-11 col-xs-1" style="margin-left: 96%;"> \
                        <a href="javascript:void(0)" id="fileImportclose"> \
                            <i class="glyphicon glyphicon-remove"></i> \
                        </a> \
                    </div> \
                </div> \
            </div> \
            <div class="modal-body"> \
                <form class="form-horizontal" role="form"> \
                    <div class="row"> \
                        <div class="col-xs-12"> \
                            <div class="col-lg-6 col-md-6 col-xs-6"> \
                                <div class="form-group"> \
                                    <label for="wechatImport" class="col-lg-5 col-md-5 col-xs-5 control-label">微信账单导入</label> \
                                    <div class="col-lg-7 col-md-7 col-xs-7"> \
                                        <input type="file" class="form-control input-sm" id="wechatImport" \
                                            placeholder="请输入"> \
                                    </div> \
                                </div> \
                            </div> \
                            <div class="col-lg-6 col-md-6 col-xs-6"> \
                                <div class="form-group"> \
                                    <label for="ailplayImport" \
                                        class="col-lg-5 col-md-5 col-xs-5 control-label">支付宝账单导入</label> \
                                    <div class="col-lg-7 col-md-7 col-xs-7"> \
                                        <input type="file" class="form-control input-sm" id="ailplayImport" \
                                            placeholder="请输入"> \
                                    </div> \
                                </div> \
                            </div> \
                            <div class="clearfix"></div> \
                        </div> \
                        <div class="col-xs-12"> \
                            <table id="fileImportTable"></table> \
                            <div class="clearfix"></div> \
                        </div> \
                    </div> \
                </form> \
            </div> \
            <div class="modal-footer"> \
                <div class="row"> \
                <div class="col-xs-10"> \
                    <div id ="fileImportPoptips" style="float:left;color:red;"></div> \
                </div> \
                <div class="col-lg-7 col-md-7 col-xs-7"> \
                    <div class="form-group"> \
                        <input type="button" class= \'btn btn-primary btn-xs\' id=\'fileImport\' value="提交" /> \
                        <input type="button" class= \'btn btn-primary btn-xs\' id=\'fileImportReset\' value="重置" /> \
                        <input type="button" class= \'btn btn-primary btn-xs\' id=\'fileImportCancel\' value="取消" \
                            onclick="$(\'#fileImportModal\').css({display:\'none\'});$(\'#fileImportFade\').css({display:\'none\'});"/> \
                    </div> \
                </div> \
                </div> \
            </div> \
        </div> \
    </div> \
</div> ';
    return dialogHtml;
};

// 初始化账单导入

function initFileImportTable(type, columns, data) {

    $('#fileImportTable').bootstrapTable("destroy");
   
    $('#fileImportTable').bootstrapTable({
        data:data,
        toolbar: '#toolbar',                //工具按钮用哪个容器
        striped: true,                      //是否显示行间隔色
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true,                   //是否显示分页（*）
        sortable: true,                    //是否启用排序
        sortOrder: "asc",                   //排序方式
        sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                       //初始化加载第一页，默认第一页
        pageSize: 10,                       //每页的记录行数（*）
        pageList: [10, 30, 50],                      //可供选择的每页的行数（*）
        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
        strictSearch: false,
        showColumns: false,                  //是否显示所有的列
        showRefresh: false,                  //是否显示刷新按钮
        minimumCountColumns: 2,             //最少允许的列数
        clickToSelect: true,                //是否启用点击选中行
        uniqueId: "Id",                     //每一行的唯一标识，一般为主键列
        idField: "Id",
        showToggle: false,                    //是否显示详细视图和列表视图的切换按钮
        cardView: false,                    //是否显示详细视图
        detailView: false,                   //是否显示父子表
        columns: columns,
    });

    $('#fileImport').click(function () {


        if(($('#wechatImport').val()).length == 0 && ($('#ailplayImport').val()).length == 0){
            $('#fileImportPoptips').text("未选择要导入的文件!");
            return;
        }

        let options=$("#fileImportTable").bootstrapTable('getOptions');
        let columnsArray=options.columns[0];
        let infrastructureCode_index;
        for(let i = 0; i < columnsArray.length; i++){
            if("科目".localeCompare(columnsArray[i].title) == 0){
                infrastructureCode_index = columnsArray[i].field;
                break;
            }
        } 

       

        let dataLists = $("#fileImportTable").bootstrapTable('getData');
        // requried 
        let requriedArray = [];
        
        for(let i = 0; i < dataLists.length; i++){
            if((dataLists[i][infrastructureCode_index]).length == 0 || (dataLists[i][infrastructureCode_index]).localeCompare('null') == 0){
                requriedArray.push(i);
            }
        }
        if(requriedArray.length > 0){
            $('#fileImportPoptips').text(("ID: " + JSON.stringify(requriedArray) + " 列为[科目]必填!!!"));
            return;
        }
        // 0   		2   	3   	-1  	-1 		    9   	8    	5    	微信    			1   			10    11   12
        // 0  		2 	    4       -1 	    -1   	    9      11  		6        支付宝 			   1  	    	11    12   13    
        // 交易时间,交易对方,商品名称,账务流水号,业务流水号,商户订单号,交易单号,金额(元),交易渠道(支付宝/微信),业务类型(转账，其他),备注,消费人,科目
        let datasArray = [];
        creatorcode = '1';
        createtime = getDate();
        vaildid = '1';

        if(type.localeCompare("ailplay") == 0){
            let aliPlayArray = [0, 2, 4, -1, -1, 9, 11, 6, "channel", 1, 11, 12, 13 ];
            for(let i = 0; i < dataLists.length; i++){
                let dataArray = []; 
                for(let j = 0; j < aliPlayArray.length; j++){
                    if("channel".localeCompare(aliPlayArray[j]) == 0){
                        dataArray.push("支付宝");
                    }else if(aliPlayArray[j] == -1){
                        dataArray.push("");
                    }
                    else{
                        dataArray.push(dataLists[i][aliPlayArray[j]]);
                    }                    
                }
                dataArray.push(creatorcode);
                dataArray.push(createtime);
                dataArray.push(vaildid);
                datasArray.push(dataArray);
            }
        }else if (type.localeCompare("wechat") == 0){
            let wechatArray = [0, 2, 3, -1, -1, 9, 8, 5, "channel", 1, 10, 11, 12];
            for(let i = 0; i < dataLists.length; i++){
                let dataArray = []; 
                for(let j = 0; j < wechatArray.length; j++){
                    if("channel".localeCompare(wechatArray[j]) == 0){
                        dataArray.push("微信");
                    }else if(wechatArray[j] == -1){
                        dataArray.push("");
                    }else{
                        dataArray.push(dataLists[i][wechatArray[j]]);
                    }  
                }
                dataArray.push(creatorcode);
                dataArray.push(createtime);
                dataArray.push(vaildid);
                datasArray.push(dataArray);
            }
        }
        // let data = {columns:JSON.stringify(columns), data: JSON.stringify(dataLists)};
     
        let data = {data: JSON.stringify(datasArray)};
        $.ajax({
            url: "http://127.0.0.1:8000/DailyInout/blukCreate/",
            type: 'POST',
            data: data,
            traditional: true,//这里设置为true
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if ("1".localeCompare(data['code']) == 0) {
                    notices(data['msg']);
                    $('#wechatImport').val("");
                    $('#ailplayImport').val("");
                    $('#fileImportTable').bootstrapTable("destroy");

                    $('#fileImportModal').css({ display: "none" });
                    $('#fileImportFade').css({ display: "none" });
                } else {
                    $('#fileImportPoptips').text("");
                    $('#fileImportPoptips').text(data['msg']);
                }
            },
            error: function (obj) {
                $('#fileImportPoptips').text("");
                $('#fileImportPoptips').text(obj);
            }
        });

    });

    $('#fileImportCancel').click(function () {
        $('#wechatImport').val("");
        $('#ailplayImport').val("");
        $('#fileImportTable').bootstrapTable("destroy");
        $('#fileImportPoptips').text("");
    });
    $('#fileImportclose').click(function(){
        $('#wechatImport').val("");
        $('#ailplayImport').val("");
        $('#fileImportTable').bootstrapTable("destroy");

        $('#fileImportModal').css({ display: "none" });
        $('#fileImportFade').css({ display: "none" });
        $('#fileImportPoptips').text("");
    });

    $('#fileImportReset').click(function () {
        $('#wechatImport').val("");
        $('#ailplayImport').val("");
        $('#fileImportTable').bootstrapTable("destroy");
        $('#fileImportPoptips').text("");
    }); 
};

function FileImportDeleteByIds(that){
    var uniqueId = that.parentNode.parentNode.getAttribute('data-uniqueid');
    $('#fileImportTable').bootstrapTable('removeByUniqueId', parseInt(uniqueId));
}; 



// -----------------------------boostarp table 结果表格 --------------------------------------------------------------
var maxLimit;
var minLimit;

function resultTableHtml() {
    return '<div class="row">'
        + '<div class="col-md-12">'
        + '<table id="table"></table>'
        + '</div>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-6">'
        + '<button class="btn btn-primary btn-xs" id="change">修改</button> '
        + '<button class="btn btn-primary btn-xs" id="delete">刪除</button> '
        + '<button class="btn btn-primary btn-xs" id="copy">复制</button>'
        + '</div>'
        + '</div>';
};

//初始化bootstrap-table的内容
function initResultTable(queryUrl, deleteurl, method, columns, uniqueId, dialogbodyObj, queryParamsFun, onLoadSuccessFun, onLoadErrorFun) {
    //记录页面bootstrap-table全局变量$table，方便应用
    $table = $('#table').bootstrapTable({
        url: queryUrl,                      //请求后台的URL（*）
        method: method,                      //请求方式（*）
        toolbar: '#toolbar',              //工具按钮用哪个容器
        contentType: "application/x-www-form-urlencoded",      // post请求必须要有，否则后台接受不到参数
        // ajaxOptions: {
        //     headers: { "Access-Control-Allow-Origin": '*' }
        // },
        clickToSelect: true,                                   // 是否点击选中行
        striped: true,                      //是否显示行间隔色
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true,                   //是否显示分页（*）
        sortable: true,                     //是否启用排序
        sortOrder: "asc",                   //排序方式
        sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                      //初始化加载第一页，默认第一页,并记录
        pageSize: 15,                       //每页的记录行数（*）
        pageList: [15, 30, 50, 100],        //可供选择的每页的行数（*）
        search: false,                      //是否显示表格搜索
        strictSearch: true,
        showColumns: true,                  //是否显示所有的列（选择显示的列）
        showRefresh: true,                  //是否显示刷新按钮
        minimumCountColumns: 2,             //最少允许的列数
        clickToSelect: true,                //是否启用点击选中行
        // height: 650,                      //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
        uniqueId: uniqueId,                     //每一行的唯一标识，一般为主键列
        showToggle: true,                   //是否显示详细视图和列表视图的切换按钮
        showFooter: true,
        showHeader: true,
        showColumns: true,
        showPaginationSwitch: true,         // True to show the pagination switch button.
        cardView: false,                    //是否显示详细视图
        detailView: false,                  //是否显示父子表
        singleSelect: true,                 // 单选checkbox 
        //得到查询的参数
        queryParams: queryParamsFun(),
        columns: columns,

        onLoadSuccess: onLoadSuccessFun,
        onLoadError: onLoadErrorFun,
    });

    // 查询按钮
    $('#query').click(function () {
        $("#table").bootstrapTable('refreshOptions', { pageNumber: 1, queryParams: queryParamsFun() });
    });

    function change(title, style, bVisiblePk = false) {
        // 	返回所选的行，当没有选择任何行的时候返回一个空数组。
        var seles = $('#table').bootstrapTable('getSelections');
        if (seles.length > 1) {
            notices("警告！只能选择一条数据...");
            return;
        } else if (seles.length == 0) {
            notices("警告！请选择一条数据...");
            return;
        }
        // 修改页面
        // 初始化
        $('#popoveModal').css({ display: "block" });
        $('#fade').css({ display: "block" });

        $('#title').text(title);

        let tags = $('#popoveModalDialog .modal-body .form-horizontal .form-group div').children();

        $.each(tags, function (i, item) {
            $(item).removeAttr("disabled");
        });
        var row = $('#table').bootstrapTable('getSelections');

        for (let i = 0; i < dialogbodyObj.length; i++) {
            id = dialogbodyObj[i].id;
            value = row[0][id];
            $('#' + id).val(value);

            if (dialogbodyObj[i].pk) {
                $('#' + id).attr("disabled", "disabled");
                if (!bVisiblePk) {
                    $('#' + id).val("");
                }
            }
            if (dialogbodyObj[i].readonly) {
                $('#' + id).attr("readonly", "true");
            }
            if (dialogbodyObj[i].display) {
                $($('#' + dialogbodyObj[i].id).parent().parent().parent()).css({ display: style });
            }
        };
    }

    $('#copy').click(function () {
        change("复制配置", 'none');
    });

    $('#change').click(function () {
        change("修改配置", 'block', bVisiblePk = true);
    });

    $('#delete').click(function () {
        // 删除
        var row = $('#table').bootstrapTable('getSelections');
        if (row.length > 1) {
            notices("警告！只能选择一条数据...");
            return;
        } else if (row.length == 0) {
            notices("警告！请选择一条数据...");
            return;
        }
        confirm(function (pk) {
            $.ajax({
                url: deleteurl, //也可以反向解析{% url 'login' %}
                type: 'POST',
                data: { 'pk': pk },
                // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
                success: function (obj) {
                    data = JSON.parse(obj);
                    if ("1".localeCompare(data['code']) == 0) {
                        notices(data['msg']);
                        $('#table').bootstrapTable('removeByUniqueId', pk);
                    } else {
                        notices(data['msg']);
                    }
                },
                error: function (obj) {
                    notices(obj);
                }
            });
        }, row[0][uniqueId]);
    });

    // 查看
    $('#table').on('click', 'a', function (e) {
        $target = $(e.target);
        row = $target.attr("row");
        $('#popoveModal').css({ display: "block" });
        $('#fade').css({ display: "block" });

        $('#title').text("查看配置");

        // disabled 
        $('#sure').css("visibility", "hidden");
        $('#cancel').css("visibility", "hidden");

        let tags = $('#popoveModalDialog .modal-body .form-horizontal .form-group div').children();

        // 数据展示
        row = JSON.parse(row);
        for (let i = 0; i < dialogbodyObj.length; i++) {
            id = dialogbodyObj[i].id;
            $('#' + id).val(row[id]);

            if (dialogbodyObj[i].display) {
                $($('#' + dialogbodyObj[i].id).parent().parent().parent()).css({ display: "block" });
            }
        };

        $.each(tags, function (i, item) {
            $(item).attr("disabled", "disabled");
        });
    });
};


// -----------------------------boostarp table columns format--------------------------------------------------------------

function linkFormatter(value, row, index) {

    function replacer(key, value) {        
        if(key.localeCompare('codecodes') == 0 || key.localeCompare('remark') == 0){
            // replace backspace
            if(value.indexOf(' ') != -1){
                value = value.replace(/\s/g, "&nbsp;");
            }
        }
        return value;
    }

    row = JSON.stringify(row, replacer);
    let html = '<a href=\'javascript:void(0)\' row='+ row +' title=\'单击打开连接\'>' + value + '</a>';
    return html;
}

function ellipsisFormater(value, row, index){
    if(value && value.length > 20){
        value = value.slice(0, 20) + "....";
    }
    return value;
}

//Email字段格式化
function emailFormatter(value, row, index) {
    return "<a href='mailto:" + value + "' title='单击打开连接'>" + value + "</a>";
}
//性别字段格式化
function sexFormatter(value) {
    if (value == "女") { color = 'Red'; }
    else if (value == "男") { color = 'Green'; }
    else { color = 'Yellow'; }
    return '<div  style="color: ' + color + '">' + value + '</div>';
}
//操作栏的格式化
function actionFormatter(value, row, index) {
    var id = value;
    var result = "";
    result += "<a href='javascript:;' class='btn btn-xs green' onclick=\"EditViewById('" + id + "', view='view')\" title='查看'><span class='glyphicon glyphicon-search'></span></a>";
    result += "<a href='javascript:;' class='btn btn-xs blue' onclick=\"EditViewById('" + id + "')\" title='编辑'><span class='glyphicon glyphicon-pencil'></span></a>";
    result += "<a href='javascript:;' class='btn btn-xs red' onclick=\"DeleteByIds('" + id + "')\" title='删除'><span class='glyphicon glyphicon-remove'></span></a>";
    return result;
}

var MetricsNotices;

function getMetricsNotices(){
    // get notices info
    $.ajax({
        url: 'http://127.0.0.1:8000/Metrics/limitTypeMetrics/',
        type: 'POST',
        data: { limittype: "0" },
        success: function (obj) {
            MetricsNotices = JSON.parse(obj);
        },
        error: function (obj) {
            notices(obj);
        }
    });
}

function sumFormatter(value, ele, row, col) {
    // 支出
    if ('out'.localeCompare(ele['codecodes__codetype']) == 0) {
        ele.sum = - Math.abs(ele.sum);

    }
    let color = FormatNotices(ele, "1", ele.sum);
    return '<div><span style="' + color + '">' + ele.sum + '</span></div>';
}

//计算此列的值
function feetFormatter(rows) {
    var total = 0;
    for (var i = 0; i < rows.length; i++) {
        total += parseFloat(rows[i].sum);
    }
    return total.toFixed(2);
}


//字段格式化
function colorFormatter(value, ele, row, col) {
    if (!value) {
        return '<div style="color: black">' + " - " + '</div>';
    }
    let color = FormatNotices(ele, "0", value);
    // value 值
    // ele 字典
    // index 索引

    return '<a data-container="body" data-toggle="popover" data-placement="top" data-html=true '
        + 'style="' + color + ';"'
        + 'href="javascript:void(0)" ele=' + JSON.stringify(ele) + ' row=' + row + ' col=' + col + '>'
        + value
        + '</a>';
}

// 获取预警配置并设置预警信息
function FormatNotices(ele, sumlimittype, value) {
    color = 'color: black';

    if (MetricsNotices && ele.codecodes in MetricsNotices) {
        let Metricsobj = JSON.parse(MetricsNotices[ele.codecodes]);
        if (sumlimittype in Metricsobj && Metricsobj[sumlimittype]) {
            let dayMetricsobj = JSON.parse(Metricsobj[sumlimittype]);

            let minLimit, maxLimit;
            let minLimitStyle, maxLimitStyle = color;

            if (dayMetricsobj.length != 0) {
                if (dayMetricsobj[1]) {
                    minLimit = dayMetricsobj[1].limit;
                    minLimitStyle = dayMetricsobj[1].style;
                }
                if (dayMetricsobj[0]) {
                    maxLimit = dayMetricsobj[0].limit;
                    maxLimitStyle = dayMetricsobj[0].style;
                }
                if (maxLimit) {
                    if (Math.abs(value) > maxLimit) { color = maxLimitStyle; }
                }
                if (minLimit) {
                    if (minLimit < Math.abs(value) && Math.abs(value) < maxLimit) { color = minLimitStyle; }
                }
            }
        }
    }
    return color;
}

// ----------------------------时间相关--------------------------------------------------------------

function getDate() {
    var mydate = new Date();
    var str = "" + mydate.getFullYear() + "-";
    str += ("0" + (mydate.getMonth() + 1)).slice(-2) + "-";
    str += ("0" + (mydate.getDate())).slice(-2);
    return str;
};

function getMonth() {
    var mydate = new Date();
    var str = "" + mydate.getFullYear() + "-";
    str += ("0" + (mydate.getMonth() + 1)).slice(-2);
    return str;
};

function getCurMonth() {
    var mydate = new Date();
    return ("0" + (mydate.getMonth() + 1)).slice(-2);
};

function getYear() {
    var mydate = new Date();
    return mydate.getFullYear();
};

function getCurrentMonthDay() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    return new Date(year, month, 0).getDate();
}

function getMonthDay(year, month) {
    return new Date(year, month, 0).getDate();
}

// 计算指定时间是星期几
function getweekday(date) {
    // date例如:'2022-03-05'
    var weekArray = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")
    var week = weekArray[new Date(date).getDay()]
    return week
}


function getPreMonth(yearMonth) {
    var arr = yearMonth.split("-");
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份

    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        //1月的上一月是前一年的12月
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }

    if (month2 < 10) {
        //10月之前都需要补0
        month2 = "0" + month2;
    }
    var preMonth = year2 + "-" + month2;
    return preMonth;
}


function getNextMonth(yearMonth) {
    var arr = yearMonth.split("-");
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日

    var year2 = year;
    var month2 = parseInt(month) + 1;
    if (month2 == 13) {
        //12月的下月是下年的1月
        year2 = parseInt(year2) + 1;
        month2 = 1;
    }
    if (month2 < 10) {
        //10月之前都需要补0
        month2 = "0" + month2;
    }

    var nextMonth = year2 + "-" + month2;
    return nextMonth;
}

// true:数值型的，false：非数值型
function myIsNaN(value) {
    return (typeof value === 'number' && !isNaN(value));
}

/**
 * 校验是否包含小数
 * @param numVal
 * @returns {boolean}
 */
function isDotNum(numVal) {
    var reg = /^\d+(?=\.{0,1}\d+$|$)/;
    if (!reg.test(numVal)) {
        // 返回，不往下执行
        return false;
    }
    return true;
}

function color16(){//十六进制颜色随机
    const r = Math.floor(Math.random()*256);
    const g = Math.floor(Math.random()*256);
    const b = Math.floor(Math.random()*256);
    const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    return color;
  }
  

// ----------------------------查询工具栏--------------------------------------------------------------

function queryToolbar(title, bodyobj, footerobj, linebreak) {
    let html = '<div class="form-inline">'
    html += queryToolbarHeader(title);
    html += queryToolbarBody(bodyobj, linebreak);
    html += queryToolbarFooter(footerobj);
    html += "</div>"
    return html;
}

function queryToolbarHeader(title = "查询条件") {
    return '<div class="querytoolbar-header">'
        + '<div class="row">'
        + '<div class=" col-lg-2 col-md-2 col-xs-2">'
        + '<span class="querytoolbar-title">' + title + '</span>'
        + '</div>'
        + '</div>'
        + '</div>';
}

function queryToolbarBody(obj, linebreak) {
    let html = '<div class="querytoolbar-body">'
        + '<div class="row">'
        + '<div class="col-xs-12">';
    html += formGroup(obj, linebreak);
    html += '</div></div></div>';
    return html;
}

function formGroup(obj, linebreak) {
    // tag : input  label:.. id:... placeholder:... options:... label ...
    let formgrouphtml = "";
    // 各种类型的标签 5个标签换行
    for (let i = 0; i < obj.length; i++) {
        let col = obj[i].col ? obj[i].col : Math.floor(12 / linebreak);
        let labelcol = obj[i].labelcol ? obj[i].labelcol : 5;
        let tagcol = obj[i].tagcol ? obj[i].tagcol : 7;

        let html = '<div class="col-lg-' + col + ' col-md-' + col + ' col-xs-' + col + '">'
            + '<div class="form-group">'
            + '<label for="' + obj[i].id + '" class="col-lg-' + labelcol + ' col-md-' + labelcol + ' col-xs-' + labelcol + ' control-label">' + obj[i].label + '</label>'
            + '<div class="col-lg-' + tagcol + ' col-md-' + tagcol + ' col-xs-' + tagcol + '">';
        if ('text'.localeCompare(obj[i].tag) == 0) {
            html += inputTag(obj[i].id, obj[i].placeholder);
        } else if ('select'.localeCompare(obj[i].tag) == 0) {
            html += selectTag(obj[i].id, obj[i].options);
        } else if ('textMenoy'.localeCompare(obj[i].tag) == 0) {
            html += inputMenoyTag(obj[i].id, obj[i].placeholder);
        } else if ('textarea'.localeCompare(obj[i].tag) == 0) {
            html += inputtextarea(obj[i].id, obj[i].placeholder);
        }
        html += '</div></div></div>';
        if (i != 0 && i % (linebreak - 1) == 0 || obj[i].linebreak) {
            html += '<div class="clearfix"></div>';
        }
        formgrouphtml += html;
    }
    if (obj.length % linebreak != 0) {
        formgrouphtml += '<div class="clearfix"></div>';
    }
    return formgrouphtml;
}

function inputTag(id, placeholder) {
    return '<input class="form-control input-sm" type="text" id="' + id + '" placeholder="' + placeholder + '">';
}

function inputtextarea(id, placeholder) {
    return '<input type="textarea" class="form-control  input-sm" id="' + id + '" placeholder="' + placeholder + '">';
}

// type="text" class="form-control  input-sm" id="' + id + '" 
function inputMenoyTag(id, placeholder) {
    let html = '<input type="text" class="form-control  input-sm" value="" \
    onkeyup="checkInput(this)" onkeydown="checkInput(this)"  onblur="checkNum(this)" id="' + id + '" + placeholder="' + placeholder + '"/>';
    return html;
}

function checkInput(_this) {
    if (_this.value != '' && _this.value.substr(0, 1) == '.') {
        _this.value = '0.00';
    }
    if (_this.value == '') {
        _this.value = '';
        return;
    }
    _this.value = _this.value.replace(/^0*(0\.|[1-9])/, '$1'); // 禁止粘贴
    _this.value = _this.value.replace(/[^\d.]/g, ''); // 禁止输入非数字
    _this.value = _this.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    _this.value = _this.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    _this.value = _this.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 只能输入两个小数

    if (_this.value.indexOf('.') < 0 && _this.value != '') {
        // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        if (_this.value.substr(0, 1) == '0' && _this.value.length == 2) {
            _this.value = _this.value.substr(1, _this.value.length);
        }
    }
    if (!_this.value) {
        _this.value = 0.0;
    }
}

function checkNum(_this) {
    // 失去焦点的时候判断 如果最后一位是 . 末尾补0
    if (_this.value == '') {
        _this.value = '';
    }
    else if (_this.value.indexOf('.') != -1) {
        if (_this.value.endsWith('.')) {
            _this.value += '00';
        }
        else if (_this.value.charAt(_this.value.length - 2) == '.') {
            _this.value += '0';
        }
    }
    else {
        _this.value += '.00';
    }
}

function selectTag(id, options) {
    // options  {value:name, value:name}
    let html = '<select class="form-control input-sm" id="' + id + '">';

    for (let i = 0; i < options.length; i++) {
        html += '<option value="' + options[i].key + '"';
        if (options[i].selected) {
            html += 'selected="selected"';
        }
        html += ' >' + options[i].value + '</option>';
    }
    return html + '</select>';
}

function queryToolbarFooter(obj) {
    let html = '<div class="querytoolbar-footer">'
        + '<div class="row">'
    let queryFooter = '<div class="col-xs-offset-5">';
    for (let i = 0; i < obj.length; i++) {
        if('button'.localeCompare(obj[i].tag) == 0){
            queryFooter += '<button class="btn btn-primary btn-xs" id="' + obj[i].id + '">' + obj[i].desc + '</button> &nbsp;';
        }
    }
    html += queryFooter;
    html += '</div><div class="clearfix"></div>';
    html += '</div></div>';
    return html;
}

function initQueryToolbar($ele, title, bodyobj, footerobj, linebreak, dialogbodyObj) {
    $ele.append(queryToolbar(title, bodyobj, footerobj, linebreak));

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
            if ("select".localeCompare(dialogbodyObj[i].tag) == 0) {
                dialogbodyObj[i].options.forEach(element => {
                    if (element.selected) {
                        $('#' + dialogbodyObj[i].id).val(element.key);
                    }
                });
            }
        };
        $('#popoveModal').css({ display: "block" });
        $('#fade').css({ display: "block" });
    });

    $('#reset').click(function () {
        for (let i = 0; i < bodyobj.length; i++) {
            if ("select".localeCompare(bodyobj[i].tag) == 0) {
                for (let j = 0; j < bodyobj[i].options.length; j++) {
                    let element = bodyobj[i].options[j]
                    if (element.selected) {
                        $('#' + bodyobj[i].id).get(0).selectedIndex = j;//index为索引值
                    }
                };
            } else {
                $('#' + bodyobj[i].id).val("");
            }
        }
    });
}

// ----------------------------弹框录入--------------------------------------------------------------

function dialogPopove(title, bodyobj, linebreak) {
    let html = '<div class="white_content"  id="popoveModal" tabindex="-1" role="dialog" aria-labelledby="popoveModal">'
    html += '<div id="popoveModalDialog" class="modal-dialog" role="document">'
    html += '<div class="modal-content">';
    html += dialogPopoveHeader(title);
    html += dialogPopoveBody(bodyobj, linebreak);
    html += dialogPopoveFooter();
    html += "</div></div></div>";

    return html;
}

function dialogPopoveHeader(title) {
    return '<div class="modal-header">'
        + '<div class="col-sm-offset-1 col-sm-2">'
        + '<span id="title">' + title + '</span>'
        + '</div>'
        + '<div class="col-sm-offset-8 col-sm-1">'
        + '<a href="javascript:void(0)" id="close">'
        + '<i class="glyphicon glyphicon-remove"></i>'
        + '</a>'
        + '</div>'
        + '</div>';
}

function dialogPopoveBody(obj, linebreak) {
    let html = '<div class="modal-body">'
        + '<form class="form-horizontal" role="form">'
        + '<div class="row">'
        + '<div class="col-xs-12">';

    html += formGroup(obj, linebreak);

    html += "</div></div></form></div>";
    return html;
}

function dialogPopoveFooter() {
    return '<div class="modal-footer"> \
        <div id ="poptips" style="float:left;color:red;"></div> \
        <button type="submit" class="btn btn-primary  btn-xs" id="sure">确定</button> \
        <input type="button" class= \'btn btn-primary btn-xs\' value="取消" id="cancel"/> \
        </div>';
}

function initpopoveModalDialog($element, title, dialogbodyObj, linebreak, url) {
    $element.append(dialogPopove(title, dialogbodyObj, linebreak));

    $("#popoveModalDialog").draggable();//为模态对话框添加拖拽
    $("#popoveModal").css("overflow", "hidden");//禁止模态对话框的半透明背景滚动

    $("#dbSelectModalDialog").draggable();//为模态对话框添加拖拽
    $("#dbSelectModal").css("overflow", "hidden");//禁止模态对话框的半透明背景滚动
    
    $("#fileImportModalDialog").draggable();//为模态对话框添加拖拽
    $("#fileImportModal").css("overflow", "auto");//禁止模态对话框的半透明背景滚动

    // 绑定弹框事件
    $('#cancel').click(function () {
        $('#popoveModal').css({ display: 'none' });
        $('#fade').css({ display: 'none' });
        for (let i = 0; i < dialogbodyObj.length; i++) {
            $('#' + dialogbodyObj[i].id).val("");
        };
    });


    $('#close').click(function () {
        $('#popoveModal').css({ display: 'none' });
        $('#fade').css({ display: 'none' });
        for (let i = 0; i < dialogbodyObj.length; i++) {
            $('#' + dialogbodyObj[i].id).val("");
        };
    });

    // 确定按钮

    $('#sure').click(function () {
        let data = {}
        let requireTips = [];

        for (let i = 0; i < dialogbodyObj.length; i++) {
            let value = $('#' + dialogbodyObj[i].id).val();
            if (dialogbodyObj[i].require) {
                if (value) {
                    data[dialogbodyObj[i].id] = value;
                } else {
                    requireTips.push(dialogbodyObj[i].label);
                }
            } else {
                data[dialogbodyObj[i].id] = value;
            }
        }
        if (requireTips.length > 0) {
            let tips = "必填："
            for (let i = 0; i < requireTips.length; i++) {
                tips = tips + requireTips[i] + "/";
            }
            $('#poptips').text(tips);

            return;
        }
        $('#poptips').text("");
        data["creatorcode"] = '1';
        data["createtime"] = getDate();

        $.ajax({
            url: url,
            type: 'post',
            data: data,
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if ("1".localeCompare(data['code']) == 0) {
                    $('#popoveModal').css({ display: 'none' });
                    $('#fade').css({ display: 'none' });
                    for (let i = 0; i < dialogbodyObj.length; i++) {
                        $('#' + dialogbodyObj[i].id).val("");
                    };
                    $("#table").bootstrapTable('refreshOptions', { pageNumber: 1, });
                    notices(data['msg']);
                } else {
                    $('#poptips').text(data['msg']);
                }
            },
            error: function (obj) {
                $('#poptips').text(obj);
            }
        });
    });    
}
