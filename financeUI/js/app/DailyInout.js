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
    initpopoveModalDialog($('#propve'), "新增", dialogbodyObj, 4, DailyinoutChange_url);

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

    function queryParamsFun(params) {
        //这里的键的名字和控制器的变量名必须一致，这边改动，控制器也需要改成一样的
        return {
            codetypeQuery: $('#codetypeQuery').val(),
            codecodeQuery: $('#codecodeQuery').val(),
            moneyQuery: $('#moneyQuery').val(),
            startdateQuery: $('#start-date').val(),
            enddateQuery: $('#end-date').val(),
            validindQuery: $('#validindQuery').val(),
        };
    }

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

    initResultTable(DailyinoutAllQuery_url, DailyinoutDelete_url, "POST", columns, 'id', dialogbodyObj, queryParamsFun, onLoadSuccessFun, onLoadErrorFun);


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
        }
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

        initDbSelect(DailyinoutCodeTypeQuery_url, $(this));
    });


    $('#codecodeQuery').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($(this).val());

        initDbSelect(DailyinoutCodeQuery_url, $(this));
    });

    $('#codecodes').dblclick(function () {
        $('#dbSelectModal').css({ display: "block" });
        $('#dbselectfade').css({ display: "block" });

        // 查询条件初始化
        $('#selectCode').val($(this).val());

        initDbSelect(DailyinoutCodeQuery_url, $(this));
    });

    $('#dataImport').click(function () {
        $("#fileImportmodalDialog").draggable();
        $("#fileImportmodal").css("overflow", "hidden");

        // 🟢 确保打开时是全新状态
        // 不清空文件输入框，让用户可以选择新文件
        // 但清空表格数据
        if ($('#fileImportTable').data('bootstrap.table')) {
            $('#fileImportTable').bootstrapTable("destroy");
            $('#fileImportTable').empty();
        }
        $('#fileImportPoptips').text('');

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


    /**
     * 读取并解析导入的文件（支持 Excel、CSV、TXT）
     * @param {Event} e - 文件上传事件对象
     * @param {string} type - 账单类型（wechat / ailplay）
     * @param {string} nickNameLabel - 昵称标识字段（微信：微信昵称，支付宝：姓名）
     * @param {string} billLabel - 账单明细开始标识
     * @param {string} billEndLabel - 账单明细结束标识（可为空）
     */
    function readFile(e, type, nickNameLabel, billLabel, billEndLabel) {
        // 1. 检查是否选择了文件
        if (!e.target.files || !e.target.files[0]) {
            $('#fileImportPoptips').text("❌ 未选择要导入的文件！");
            return;
        }

        const file = e.target.files[0];
        const fileName = file.name;
        const fileExt = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();

        // 显示正在读取
        $('#fileImportPoptips').text(`⏳ 正在读取文件: ${fileName}`);

        // 2. 根据文件格式分别处理
        if (fileExt === 'xlsx' || fileExt === 'xls') {
            parseExcelFile(file, type, nickNameLabel, billLabel, billEndLabel);
        }
        else if (fileExt === 'csv' || fileExt === 'txt') {
            parseTextFile(file, type, fileExt, nickNameLabel, billLabel, billEndLabel);
        }
        else {
            $('#fileImportPoptips').text(`❌ 不支持的文件格式: .${fileExt}，请上传 .xlsx, .xls, .csv, .txt`);
            // 🟢 清空文件输入框
            $(e.target).val('');
        }
    }

    /**
     * 解析 Excel 文件（.xlsx / .xls）
     */
    function parseExcelFile(file, type, nickNameLabel, billLabel, billEndLabel) {
        // 检查 SheetJS 库是否已加载
        if (typeof XLSX === 'undefined') {
            $('#fileImportPoptips').text("❌ 缺少 Excel 解析库，请刷新页面或联系管理员");
            console.error("SheetJS (XLSX) 库未加载");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                // 读取 Excel 二进制数据
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellText: false,
                    cellDates: true,    // 保留日期格式
                });

                // 默认取第一个 sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // 转换为 CSV 格式（保留原始数据格式）
                const csvContent = XLSX.utils.sheet_to_csv(worksheet, {
                    blankrows: false,   // 跳过空行
                    dateNF: 'yyyy-MM-dd HH:mm:ss'  // 日期格式
                });

                // 复用 CSV 解析逻辑
                $('#fileImportPoptips').text("✅ Excel 读取成功，正在解析账单数据...");
                dataImportFormat(type, csvContent, nickNameLabel, billLabel, billEndLabel);
            } catch (error) {
                $('#fileImportPoptips').text(`❌ Excel 解析失败: ${error.message}`);
                console.error("Excel 解析错误:", error);
                resetImportFileInput();
            }
        };

        reader.onerror = function (error) {
            $('#fileImportPoptips').text(`❌ 文件读取失败: ${error.target.error?.message || '未知错误'}`);
            resetImportFileInput();
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * 解析文本文件（.csv / .txt）
     */
    function parseTextFile(file, type, fileExt, nickNameLabel, billLabel, billEndLabel) {
        // 检测浏览器是否支持 FileReader 的 readAsBinaryString
        const rABS = typeof FileReader !== 'undefined' &&
            typeof FileReader.prototype !== 'undefined' &&
            typeof FileReader.prototype.readAsBinaryString !== 'undefined';

        const reader = new FileReader();

        reader.onerror = function (error) {
            $('#fileImportPoptips').text(`❌ 文件读取失败: ${error.target.error?.message || '未知错误'}`);
            resetImportFileInput();
        };

        reader.onloadend = function (e) {
            try {
                // 获取原始数据
                const result = e.target.result;

                // 处理 CSV/TXT 编码问题
                processTextFileContent(result, fileExt, rABS, type, nickNameLabel, billLabel, billEndLabel);
            } catch (error) {
                $('#fileImportPoptips').text(`❌ 文本解析失败: ${error.message}`);
                console.error("文本解析错误:", error);
                resetImportFileInput();
            }
        };

        // 发起异步读取
        if (rABS) {
            reader.readAsBinaryString(file);  // 以二进制字符串方式读取
        } else {
            reader.readAsArrayBuffer(file);   // 以 ArrayBuffer 方式读取
        }
    }

    /**
     * 处理文本文件内容（编码检测与转换）
     */
    function processTextFileContent(data, fileExt, rABS, type, nickNameLabel, billLabel, billEndLabel) {
        // 检查 jschardet 编码检测库
        if (typeof jschardet === 'undefined') {
            $('#fileImportPoptips').text("⚠️ 未加载编码检测库，将使用 UTF-8 尝试解析");
            console.warn("jschardet 库未加载");
        }

        let binaryData;
        let previewStr = '';

        // 将数据转为 Uint8Array 用于编码检测
        if (rABS) {
            // data 是 binarystring，转换为 Uint8Array
            const byteArray = [];
            for (let i = 0; i < data.length; i++) {
                byteArray.push(data.charCodeAt(i));
            }
            binaryData = new Uint8Array(byteArray);

            // 取前 2000 字节用于编码检测
            for (let i = 0; i < Math.min(2000, data.length); i++) {
                previewStr += String.fromCharCode(data.charCodeAt(i));
            }
        } else {
            // data 是 ArrayBuffer
            binaryData = new Uint8Array(data);

            // 取前 2000 字节用于编码检测
            previewStr = '';
            for (let i = 0; i < Math.min(2000, binaryData.length); i++) {
                previewStr += String.fromCharCode(binaryData[i]);
            }
        }

        // 检测文件编码
        let encoding = 'UTF-8';  // 默认编码
        try {
            if (typeof jschardet !== 'undefined' && previewStr) {
                const detected = jschardet.detect(previewStr);
                if (detected && detected.encoding) {
                    encoding = detected.encoding;

                    // 统一编码名称
                    if (encoding === 'GB2312' || encoding === 'GBK' || encoding === 'GB18030') {
                        encoding = 'GB18030';
                    } else if (encoding === 'ascii' || encoding === 'UTF-8' ||
                        encoding === 'UTF-16BE' || encoding === 'UTF-16LE') {
                        encoding = 'UTF-8';
                    } else {
                        // 不支持的编码，尝试用 UTF-8
                        $('#fileImportPoptips').text(`⚠️ 检测到不常见编码(${encoding})，尝试 UTF-8 解析`);
                        encoding = 'UTF-8';
                    }
                }
            }
        } catch (e) {
            console.warn("编码检测失败，使用 UTF-8", e);
        }

        try {
            // 使用检测到的编码解码文件内容
            const content = new TextDecoder(encoding).decode(binaryData);

            // 空文件检查
            if (!content || content.trim().length === 0) {
                $('#fileImportPoptips').text("❌ 文件内容为空");
                resetImportFileInput();
                return;
            }

            $('#fileImportPoptips').text(`✅ 文件读取成功 (${encoding})，正在解析账单数据...`);

            // 调用数据格式化函数
            dataImportFormat(type, content, nickNameLabel, billLabel, billEndLabel);

        } catch (error) {
            $('#fileImportPoptips').text(`❌ 解码失败: ${error.message}`);
            console.error("解码错误:", error);
            resetImportFileInput();
        }
    }

    /**
     * 重置文件上传输入框
     */
    function resetImportFileInput() {
        $('#wechatImport, #ailplayImport').val('');

        // 如果表格存在，也清空表格
        if ($('#fileImportTable').data('bootstrap.table')) {
            $('#fileImportTable').bootstrapTable("destroy");
            $('#fileImportTable').empty();
        }
        // 3秒后清除提示信息
        setTimeout(() => {
            const currentText = $('#fileImportPoptips').text();
            if (currentText.includes('✅') || currentText.includes('❌') || currentText.includes('⚠️')) {
                $('#fileImportPoptips').text('');
            }
        }, 5000);
    }

    /**
     * 格式化导入的账单数据（按列索引精确清理）
     * @param {string} type - 账单类型（wechat / ailplay）
     * @param {string} content - 文件内容
     * @param {string} nickNameLabel - 昵称标识字段
     * @param {string} billLabel - 账单明细开始标识
     * @param {string} billEndLabel - 账单明细结束标识
     */
    function dataImportFormat(type, content, nickNameLabel, billLabel, billEndLabel) {
        if (!content || content.length === 0) {
            $('#fileImportPoptips').text("❌ 文件内容为空");
            return;
        }

        // 按行分割
        content = content.split('\n');
        $('#fileImportPoptips').text(`⏳ 共读取 ${content.length} 行数据，正在解析...`);

        // ========== 1. 定义列映射（微信/支付宝通用） ==========
        const COLUMN_INDEX = {
            // 微信支付账单列位置（基于导出CSV格式）
            WECHAT: {
                TIME: 0,        // 交易时间
                TYPE: 1,        // 交易类型
                PARTNER: 2,     // 交易对方
                PRODUCT: 3,     // 商品
                INOUT: 4,       // 收/支
                AMOUNT: 5,      // 金额(元)
                PAYMENT: 6,     // 支付方式
                STATUS: 7,      // 当前状态
                ORDER_ID: 8,    // 交易单号
                MERCHANT_ID: 9, // 商户单号
                NOTE: 10        // 备注
            },
            // 支付宝账单列位置
            AILPLAY: {
                TIME: 0,        // 交易时间
                TYPE: 1,        // 交易类型
                PARTNER: 2,     // 交易对方
                PRODUCT: 3,     // 商品说明
                INOUT: 4,       // 收/支
                AMOUNT: 5,      // 金额
                PAYMENT: 6,     // 支付方式
                STATUS: 7,      // 交易状态
                ORDER_ID: 8,    // 交易订单号
                MERCHANT_ID: 9, // 商户订单号
                NOTE: 10        // 备注
            }
        };

        // ========== 2. 定义清理函数（精确控制，无破坏性正则） ==========

        /**
         * 🟢 金额清理：只删除¥和逗号，保留小数点、负号、数字
         */
        function cleanMoney(value) {
            if (!value || typeof value !== 'string') return value || '';
            // 只删除人民币符号和千位分隔逗号，保留其他所有字符
            return value.replace(/[¥,]/g, '').trim();
        }

        /**
         * 🟢 时间清理：完全保留原始格式，只去首尾空格
         * 支持格式：2025-12-31 10:44:59 或 2025/12/31 10:44:59
         */
        function cleanTime(value) {
            if (!value || typeof value !== 'string') return value || '';
            return value.trim();  // 保留斜杠/和横杠-，不做任何替换
        }

        /**
         * 🟢 昵称清理：只删除标签文字，保留昵称内容
         */
        function cleanNickName(value, type) {
            if (!value || typeof value !== 'string') return '';

            if (type === 'wechat') {
                return value.replace(/微信昵称：|【|】|\[|\]/g, '').trim();
            } else if (type === 'ailplay') {
                return value.replace(/姓名：|【|】|\[|\]/g, '').trim();
            }
            return value.replace(/昵称：|姓名：|【|】|\[|\]/g, '').trim();
        }

        /**
         * 🟢 通用清理：只去首尾空格，保留原始内容
         */
        function cleanGeneral(value) {
            if (!value || typeof value !== 'string') return value || '';
            return value.trim();  // 不删除任何字符，只去空格
        }

        /**
         * 🟢 备注清理：保留原始内容，只去空格
         */
        function cleanNote(value) {
            if (!value || typeof value !== 'string') return value || '';
            return value.trim();
        }

        // ========== 3. 查找账单起始行和结束行 ==========

        // 查找昵称行
        let nickName = '';
        for (let i = 0; i < Math.min(20, content.length); i++) {
            if (content[i].indexOf(nickNameLabel) !== -1) {
                nickName = content[i];
                break;
            }
        }

        // 查找账单明细起始行
        function findBillIndex(element) {
            return element && element.indexOf(billLabel) !== -1;
        }
        let billStartIndex = content.findIndex(findBillIndex);

        if (billStartIndex === -1) {
            $('#fileImportPoptips').text(`❌ 未找到账单明细起始标记: ${billLabel}`);
            return;
        }

        // 查找账单明细结束行
        let billEndIndex = content.length;
        if (billEndLabel && billEndLabel.length > 0) {
            function findBillEndIndex(element) {
                return element && element.indexOf(billEndLabel) !== -1;
            }
            let endIdx = content.findIndex(findBillEndIndex);
            if (endIdx !== -1) {
                billEndIndex = endIdx;
            }
        }

        // ========== 4. 解析列名（用于动态适配） ==========

        // 列名行在起始行的下一行
        let colNameRow = billStartIndex + 1;
        if (colNameRow >= content.length) {
            $('#fileImportPoptips').text("❌ 账单格式错误：缺少列名行");
            return;
        }

        let colNames = content[colNameRow].split(',').filter(item => item && item.trim() !== '');

        // 计算空列数量（有些CSV有尾随逗号）
        let colNameStr = content[colNameRow];
        let commaCount = (colNameStr.match(/,/g) || []).length;
        let emptyColCount = commaCount - colNames.length + 1;

        // ========== 5. 获取科目数据（用于下拉选择） ==========
        let infrastructureCode = [];
        try {
            $.ajax({
                url: DailyinoutCodeQuery_url,
                async: false,
                success: function (result) {
                    result = JSON.parse(result);
                    for (let i = 0; i < result.length; i++) {
                        infrastructureCode.push({
                            value: result[i]["pk"],
                            text: result[i]["fields"].codename
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error("获取科目数据失败:", error);
                    $('#fileImportPoptips').text("⚠️ 获取科目列表失败，将使用空列表");
                }
            });
        } catch (e) {
            console.error("科目数据请求异常:", e);
        }

        // ========== 6. 构建表格列定义 ==========
        let columns = [
            {
                field: 'Id',
                title: 'ID',
                align: 'center',
                width: 50,
                formatter: function(value, row, index) {
                    return index + 1;
                }
            }
        ];

        // 根据列名动态创建列
        for (let i = 0; i < colNames.length; i++) {
            let colTitle = colNames[i].trim();

            // 根据不同字段类型设置不同的编辑/显示属性
            if (colTitle.indexOf('金额') !== -1 || colTitle.indexOf('Amount') !== -1) {
                // 金额列
                columns.push({
                    field: i.toString(),
                    title: colTitle,
                    align: 'right',
                    width: 100,
                    formatter: function(value) {
                        return value ? `¥${parseFloat(value).toFixed(2)}` : '¥0.00';
                    }
                });
            }
            else if (colTitle.indexOf('时间') !== -1 || colTitle.indexOf('Date') !== -1) {
                // 时间列
                columns.push({
                    field: i.toString(),
                    title: colTitle,
                    align: 'center',
                    width: 160,
                    formatter: function(value) {
                        return value || '--';
                    }
                });
            }
            else if (colTitle.indexOf('备注') !== -1 || colTitle.indexOf('Note') !== -1) {
                // 备注列 - 可编辑
                columns.push({
                    field: i.toString(),
                    title: colTitle,
                    align: 'left',
                    width: 200,
                    editable: {
                        type: 'text',
                        title: colTitle,
                        emptytext: '--',
                        placeholder: '请输入备注',
                        validate: function(value) {
                            $(this).attr('data-value', value || '');
                            return '';
                        }
                    },
                    formatter: function(value) {
                        return value || '--';
                    }
                });
            }
            else {
                // 普通列 - 只读
                columns.push({
                    field: i.toString(),
                    title: colTitle,
                    align: 'left',
                    formatter: function(value) {
                        return value || '--';
                    }
                });
            }
        }

        // 添加昵称列
        columns.push({
            field: (colNames.length).toString(),
            title: type === 'wechat' ? '微信昵称' : '支付宝姓名',
            align: 'left',
            width: 150,
            formatter: function(value) {
                return value || '--';
            }
        });

        // 添加科目列（可编辑下拉框）
        columns.push({
            field: (colNames.length + 1).toString(),
            title: '科目',
            align: 'left',
            width: 150,
            editable: {
                type: 'select',
                title: '科目',
                emptytext: '-- 请选择 --',
                source: function() {
                    return infrastructureCode.length > 0 ? infrastructureCode : [
                        { value: '', text: '无科目数据' }
                    ];
                },
                validate: function(value) {
                    if (!value) {
                        return '请选择科目';
                    }
                    $(this).attr('data-value', value);
                    return '';
                }
            },
            formatter: function(value, row, index) {
                if (!value) return '<span class="text-muted">-- 请选择 --</span>';

                // 根据value查找对应的text
                for (let i = 0; i < infrastructureCode.length; i++) {
                    if (infrastructureCode[i].value === value) {
                        return infrastructureCode[i].text;
                    }
                }
                return value;
            }
        });

        // 添加操作列（删除按钮）
        columns.push({
            field: 'action',
            title: '操作',
            align: 'center',
            width: 80,
            formatter: function(value, row, index) {
                return '<a href="javascript:void(0);" class="btn btn-xs btn-danger" ' +
                    'onclick="deleteFileImportRow(this)" title="删除">' +
                    '<span class="glyphicon glyphicon-trash"></span> 删除</a>';
            }
        });

        // ========== 7. 解析账单数据行（核心：按列索引精确清理） ==========
        let billDatas = [];
        let currentColumns = type === 'wechat' ? COLUMN_INDEX.WECHAT : COLUMN_INDEX.AILPLAY;

        // 数据行从起始行+2开始（跳过列名行）
        for (let rowIdx = billStartIndex + 2, id = 0; rowIdx < billEndIndex; rowIdx++, id++) {
            let line = content[rowIdx];

            // 跳过空行
            if (!line || line.trim().length === 0) {
                continue;
            }

            // 分割CSV行（需要考虑引号内的逗号）
            let fields = line.split(',').map(f => f.trim());

            // 跳过全空行
            if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) {
                continue;
            }

            let billdata = { Id: id };

            // ===== 按列索引精确清理数据 =====
            for (let colIdx = 0; colIdx < fields.length - emptyColCount; colIdx++) {
                let rawValue = fields[colIdx] || '';

                // 🎯 根据列位置应用不同的清理规则
                if (colIdx === currentColumns.AMOUNT) {
                    // 金额列：只删除¥和逗号
                    billdata[colIdx] = cleanMoney(rawValue);
                }
                else if (colIdx === currentColumns.TIME) {
                    // 时间列：完全保留原始格式（保留/和-）
                    billdata[colIdx] = cleanTime(rawValue);
                }
                else if (colIdx === currentColumns.NOTE) {
                    // 备注列：保留原始内容
                    billdata[colIdx] = cleanNote(rawValue);
                }
                else if (colIdx === currentColumns.ORDER_ID || colIdx === currentColumns.MERCHANT_ID) {
                    // 单号列：完全保留
                    billdata[colIdx] = cleanGeneral(rawValue);
                }
                else if (colIdx === currentColumns.STATUS) {
                    // 状态列：完全保留
                    billdata[colIdx] = cleanGeneral(rawValue);
                }
                else {
                    // 其他列：通用清理（只去空格）
                    billdata[colIdx] = cleanGeneral(rawValue);
                }
            }

            // 处理昵称（使用精确清理）
            billdata[fields.length - emptyColCount] = cleanNickName(nickName, type);

            // 科目列初始为空
            billdata[fields.length - emptyColCount + 1] = "";

            // 添加到数据集
            billDatas.push(billdata);
        }

        // ========== 8. 初始化导入表格 ==========
        if (billDatas.length === 0) {
            $('#fileImportPoptips').text("⚠️ 未解析到任何账单数据");
            return;
        }

        // 在 dataImportFormat 函数的末尾，调用 initFileImportTable 之前
        $('#fileImportPoptips').text(`✅ 解析成功，共 ${billDatas.length} 条账单记录`);

        // 🟢 先清理旧的事件绑定和数据
        if ($('#fileImportTable').data('bootstrap.table')) {
            $('#fileImportTable').bootstrapTable("destroy");
        }
        $('#fileImportTable').empty();

        // 调用初始化表格函数
        initFileImportTable(type, columns, billDatas);
    }


});