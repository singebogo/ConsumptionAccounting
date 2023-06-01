$(document).ready(function (e) {

    var labels = [];
    $("#date").datepicker({
        "dateFormat": "yy-mm",
    });

    $("[data-toggle='popover']").popover(
    );
    $('#notices').append(errtipsHtml());
    $('#errtips').css({ display: "none" });

    // 记录当前显示月
    var curMonth = getMonth();

    $('#date').val(curMonth);

    // 每月天数显示为标题
    function GenerColumns() {
        var columns = [{
            field: 'id',
            title: 'Id',
            sortable: true,
            titleTooltip: "id",
            align: 'center',
            footerFormatter: function (value) {
                return "Sum of monthly daily consumption";
            },
            formatter: function (value, row, index) {
                return index + 1;
            },
        }, {
            field: 'codecodes__codetype',
            title: '收支',
            titleTooltip: "收支",
            align: 'center',
            sortable: true,
        }, {
            field: 'codecodes',
            title: '科目',
            titleTooltip: "科目",
            align: 'center',
            sortable: true
        }];

        var daycount = getMonthDay(curMonth.substring(0, 4), curMonth.substring(5));
        for (var i = 1; i <= daycount; i++) {
            var day = i < 10 ? "0" + i : i;
            day = curMonth + "-" + day;
            obj = {
                field: day,
                title: i,
                align: 'center',
                titleTooltip: day + " " + getweekday(day),       //鼠标移动到列头上就会出现提示文字
                formatter: colorFormatter,
                // formatter: function (value, ele, row, col) {
                //     if (!value) return "-"; else return value;
                // },
                // editable: {
                //     type: 'text',
                //     title: day + " " + getweekday(day) + "收支",
                //     validate: function (v) {
                //         if (!v) return '收支不能为空!';
                //         if (!isDotNum(v)) return '请输入正确的数字!';
                //     },
                //     display: function (value) {
                //         if ("-".localeCompare(value) == 0) {
                //             $(this).text("-");
                //         }
                //         else {
                //             if (value > maxLines) {
                //                 var color = 'Red';
                //             }
                //             else if (minLines < value && value < maxLines) {
                //                 color = 'Green';
                //             }
                //             else {
                //                 color = 'black';
                //             }
                //             $(this).css('color', color);
                //             $(this).addClass("tips");
                //             $(this).attr({ 'title': day + " " + getweekday(day) });
                //             // tips 会替换编辑框中的内容                          
                //             $(this).text(value);
                //         }
                //     },
                // },
            }
            columns.push(obj);
        }
        columns.push({
            field: 'sum',
            title: 'sum',
            titleTooltip: "总和",
            align: 'center',
            formatter: sumFormatter,
            //计算此列的值
            footerFormatter: feetFormatter,
        });
        return columns;
    }

    function dayTableInit() {
        getMetricsNotices();

        $monthTable = $('#dayTable').bootstrapTable({
            url: "http://127.0.0.1:8000/DataPresentation/DataPresentation/",                      //请求后台的URL（*）
            method: "POST",                      //请求方式（*）
            // data: data,
            toolbar: '#toolbar',              //工具按钮用哪个容器
            contentType: "application/x-www-form-urlencoded",      // post请求必须要有，否则后台接受不到参数
            clickToSelect: true,                                   // 是否点击选中行
            striped: true,                      //是否显示行间隔色
            cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            pagination: true,                   //是否显示分页（*）
            sortable: true,                     //是否启用排序
            sortOrder: "asc",                   //排序方式
            sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1,                      //初始化加载第一页，默认第一页,并记录
            pageSize: 20,                       //每页的记录行数（*）
            pageList: [20, 50, 100],            //可供选择的每页的行数（*）
            search: true,                      //是否显示表格搜索
            searchOnEnterkey: true,            //回车执行搜索
            strictSearch: true,
            showColumns: true,                  //是否显示所有的列（选择显示的列）
            showRefresh: true,                  //是否显示刷新按钮
            minimumCountColumns: 2,             //最少允许的列数
            clickToSelect: false,                //是否启用点击选中行
            // height: 650,                      //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
            uniqueId: "Id",                     //每一行的唯一标识，一般为主键列
            showToggle: false,                   //是否显示详细视图和列表视图的切换按钮
            showHeader: true,
            showFooter: true,                     //开启底部   
            showColumns: true,
            showPaginationSwitch: true,         // True to show the pagination switch button.
            cardView: false,                    //是否显示详细视图
            detailView: false,                  //是否显示父子表
            singleSelect: false,                 // 单选checkbox  
            // editable: true,                        // 行内编辑
            columns: GenerColumns(),
            //得到查询的参数
            queryParams: function (params) {
                let year = curMonth.substring(0, 4);
                let month = curMonth.substring(5,);
                return { year: year, month: month, type: '0' };
            },
            responseHandler: function (data) {
                //  format data
                let formatData = [];

                for (var key in data) {
                    let value = JSON.parse(data[key]);
                    let element = {};
                    let sum = 0;
                    for (let i = 0; i < value.length; i++) {
                        let inoutdate = value[i].inoutdate.substring(0, (value[i].inoutdate).indexOf('T'));
                        let item = {};

                        item["id"] = value[i].id;
                        if (inoutdate + "_id" in element) {
                            element[inoutdate + "_id"].push(item);
                        } else {
                            element[inoutdate + "_id"] = [item];
                        }

                        element["codecodes__codetype"] = value[i].codecodes__codetype;
                        element["codecodes"] = value[i].codecodes;
                        // same key need sum ajax get last id
                        if (element[inoutdate]) {
                            element[inoutdate] = parseFloat(element[inoutdate]) + parseFloat(value[i].money);
                            element[inoutdate] = element[inoutdate].toFixed(2);

                        } else {
                            element[inoutdate] = value[i].money;
                        }
                        sum = sum + parseFloat(value[i].money);
                        element["sum"] = sum.toFixed(2);
                    }
                    if (JSON.stringify(element) != '{}') {
                        formatData.push(element);
                    }
                }
                return formatData;
            },
            onRefresh: function (params) {
                // 重新加载数据
            },
            onRefreshOptions: function (options) {

            },
            onPostHeader: function () {
                //表单头部渲染完后执行的事件                  
            },
            onPostFooter: merge_footer,

            onClickCell: function (field, value, row, element) {
                var ele = $(element).children('a');
                if (ele.length == 0) {
                    return;
                }
                $a = $(ele[0]);
                $a.attr('title', field + " " + getweekday(field));
                // ajax post mark [{id:12},{id:34}]
                let ids = row[field + "_id"];
                let idsArray = [];
                ids.forEach(element => {
                    idsArray.push(element.id);
                });
                ids = JSON.stringify(idsArray);
                $.ajax({
                    url: 'http://127.0.0.1:8000/DataPresentation/DataPrsentQueryPrimary/',
                    type: 'POST',
                    data: "id=" + idsArray,
                    success: function (obj) {
                        data = JSON.parse(obj);
                        viewitems = "";
                        data.forEach(element => {
                            viewitems += '<p id=' + element.id + "><span> money: " + element.money + "</span><span> remark: " + element.remark + '</span></p>';
                        });

                        $a.attr('data-content', viewitems);
                        $a.popover('toggle');
                    },
                    error: function (obj) {
                        mark = "got error! please retry....";

                        $a.attr('data-content', mark);
                        $a.popover('toggle');
                    }
                });

                $(element).mouseleave(function () {
                    $a.popover('hide');
                });
            },

            // 编辑
            // onDblClickCell: function (field, value, row, $element) {
            //     alert(1);
            // }

            // onEditableSave: function (field, row, oldValue, ele) {
            //     // field  col
            //     // oldValue 行内编辑框中的值
            //     var tdval = $(ele).text();
            //     $.ajax({
            //         type: "post",
            //         url: 'https://console-mock.apipost.cn/mock/5fdcd2b6-71dc-4919-9f0c-4636d4ca2760/jizhang',
            //         data: row,
            //         dataType: 'JSON',
            //         success: function (data, status) {
            //             if (status == "success") {
            //             }
            //         },
            //         error: function () {
            //             notices("注意： 数据提交失败！");
            //             $(ele).text(tdval);
            //         },
            //         complete: function () {
            //         }
            //     });
            // },
        });
    }


    //合并页脚
    function merge_footer() {
        //获取table表中footer 并获取到这一行的所有列
        var footer_tbody = $('#dayTable tfoot');
        var footer_tr = footer_tbody.find('>tr');
        var footer_th = footer_tr.find('>th');
        var footer_th_1 = footer_th.eq(0);
        //由于我们这里做统计只需要两列，故可以将除第一列与最后一列的列全部隐藏，然后再设置第一列跨列
        //遍历隐藏中间的列 下标从1开始
        for (var i = 1; i < footer_th.length - 1; i++) {
            footer_th.eq(i).hide();
        }
        //设置跨列
        footer_th_1.attr('colspan', footer_th.length - 1).show();
        footer_th_1.css("text-align", "center");
        //这里可以根据自己的表格来设置列的宽度 使对齐
        // footer_th_1.attr('width', "800px").show();
    }

    $('#dayTable').on('mouseenter', 'td', function (e) {
        $e = $(e.target);

        $e.css('border-color', '#8c531b');

        $e.mouseleave(function () {
            $e.css('border-color', "#eceeef");
        });
    });

    dayTableInit();

    $("#date").on("change", function () {
        console.log($('#date').val());
        changeMonth($('#date').val());
    });

    $('#prev').click(function () {
        perv = getPreMonth(curMonth);
        $('#date').val(perv + "-" + ($('#date').val()).substring(8));
        changeMonth(perv);
    });

    $('#next').click(function () {
        next = getNextMonth(curMonth);
        $('#date').val(next + "-" + ($('#date').val()).substring(8));
        changeMonth(next);
    });

    function changeMonth(date) {
        if (curMonth.localeCompare((date).substring(0, 7)) != 0) {
            curMonth = (date).substring(0, 7);

            // 刷新 效率低
            // $('#dayTable').bootstrapTable('destroy');
            // monthTableInit();
            $('#dayTable').bootstrapTable('refreshOptions', {
                columns: GenerColumns(),
            });

            getCharBarData(initChartBars);
        }
    };

    function getCharBarData(func){
        let year = curMonth.substring(0, 4);
        let month = curMonth.substring(5,);

        var daycount = getMonthDay(year, month);
        let labels = [];
        let inoutlabels = [];
        let indatas = [];
        let outdatas  = [];

        for (var i = 1; i <= daycount; i++) {
            var day = i < 10 ? "0" + i : i;
            labels.push(curMonth + "-" + day);
            inoutlabels.push(day);
            indatas.push(0);
            outdatas.push(0);
        }
        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: {year: year, month: month, type: '3'},
            success: function (obj) {
                let data = JSON.parse(obj);
                if(data.out){
                    let dataout = JSON.parse(data.out);
                    for(ous in dataout){
                        let index = labels.indexOf(ous);
                        outdatas[index] = dataout[ous];
                    }
                }
                func(inoutlabels, indatas, outdatas)
            },
            error: function (obj) {
                notices(JSON.parse(notices));
            }
        });
    }
    $('#prints').click(function(){
        print();
    });

    function initChartBars(labels, indatas, outdatas) {

        let $dashChartBarsData = {
            labels: labels,
            datasets: [
                {
                    label: '同期'+curMonth+'支出',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(44,62,80,0.7)',
                    hoverBackgroundColor: "rgba(44,62,80,1)",
                    hoverBorderColor: "rgba(0,0,0,0)",
                    borderRadius: 10,
                    grouped: true,
                    categoryPercentage: 1,
                    barPercentage: 1,
                    barThickness: '30',
                    data: outdatas,
                }
            ]
        };
        var $dashChartBarsCnt = jQuery('.js-chartjs-bar')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($dashChartBarsCnt, {
                type: 'bar',
                data: $dashChartBarsData,
                options: {
                    responsive: true,
                    aspectRatio: 1,
                    maintainAspectRatio: false,
                    categoryPercentage: 1,
                    title: {
                        display: true,//标题展示
                        position: 'top',//标题位置
                        fontSize: 12,//标题字体大小
                        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",//标题字体集
                        fontStyle: 'normal',//标题字体样式
                        fontColor: "#c25534",//标题字体颜色
                        padding: 10,//标题文本上下方间距
                        lineHeight: 1.2,//文本行高
                        text: curMonth+' 当月支出详情',//标题
                    },
                    animation: {
                        duration: 1000,//动画所需时间，毫秒数
                        easing: 'easeOutQuart',//动画趋势，比如线性
                        numSteps: 10000,//动画帧数
                        animateRotate: true,//图表将使用旋转动画进行动画处理，环形图，饼图，极地图专属
                        animateScale: false,//使图表从中心向外缩放。环形图，饼图，极地图专属
                        onProgress(animation) {//进程过程中调用方法
                            // console.log('进度' + animation.animationObject.currentStep / animation.animationObject.numSteps);
                        },
                        onComplete(animation) {//完成调用方法
                            // console.log('完成' + animation.animationObject.currentStep / animation.animationObject.numSteps);
                        },
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0
                        }
                    },
                    tooltips: {
                        enabled: true, //是否开启提示
                        position: 'average',//提示的位置. 更多…
                        backgroundColor: 'rgba(0,0,0,1)', //背景色
                        titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'", //标题字体
                        titleFontSize: 12, //标题字号
                        titleFontStyle: 'bold', //标题样式
                        titleFontColor: '#fff', //标题颜色
                        titleSpacing: 2, //添加到每个标题顶部和底部的内间距
                        titleMarginBottom: 6, //标题部分的下外间距
                        bodyFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'", //内容的字体
                        bodyFontSize: 12, //内容字体大小
                        bodyFontStyle: 'normal', //内容字体样式
                        bodyFontColor: '#fff', //内容字体颜色
                        bodySpacing: 20, //内容的上下内间距
                        footerFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'", //页脚字体(指提示框的底部，下同)
                        footerFontSize: 12, //页脚字体大小
                        footerFontStyle: 'bold', //页脚字体样式
                        footerFontColor: '#fff', //页脚字体颜色
                        footerSpacing: 2, //页脚上下内间距
                        footerMarginTop: 6, //页脚的外边距
                        xPadding: 6, //提示框的左右内边距
                        yPadding: 6, //提示框的上下内边距
                        caretSize: 5, //提示箭头大小，单位:px
                        cornerRadius: 0, //提示框圆角
                        multiKeyBackground: '#fff',//当多个项目位于提示框中时，颜色会在彩色框后面绘制
                        displayColors: true, //如果为 true，则工具提示中会显示颜色框
                        borderColor: 'rgba(255,255,255,1)', //边框颜色
                        borderWidth: 10, //边框大小
                    },
                    scales: {
                        suggestedMin: 0,//雷达图，极地图最小值
                        suggestedMax: 20,//雷达图，极地图最大值
                        yAxes: [{//y轴
                            position: 'left',//y轴位置
                            ticks: {
                                beginAtZero: true//从零开始
                            },
                            // stacked: true,//堆叠
                        }],
                        xAxes: [{//x轴
                            position: 'bottom',//x轴位置
                            ticks: {
                                beginAtZero: true//从零开始
                            },
                            // stacked: true,//堆叠
                        }]
                    },
                    startAngle: 1 * Math.PI,//饼图环形图极地图开始偏转角度
                    circumference: 1 * Math.PI,//饼图环形图允许图形覆盖                     
                },
            });
        }            
    };
    getCharBarData(initChartBars);

});