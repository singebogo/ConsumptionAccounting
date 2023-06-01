$(document).ready(function (e) {

    function initOverview(){ 
        $.ajax({
            url: 'http://127.0.0.1:8000/Overview/everyDay/',
            type: 'POST',
            data: { 'day': getDate() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);

                if(data['in']){
                    data['in'].forEach(element => {
                        element = JSON.parse(element);
                        $('#todayin').text(element.today);                        
                        $('#yesterdayin').text(element.yesterday);
                    });
                }
                if(data['out']){
                    data['out'].forEach(element => {
                        element = JSON.parse(element);
                        $('#todayout').text(element.today);
                        $('#yesterdayout').text(element.yesterday);
                    });
                }      
            },
            error: function (obj) {
                notices(obj);
            },
        });
        $.ajax({
            url: 'http://127.0.0.1:8000/Overview/curMonth/',
            type: 'POST',
            data: { 'curYear': getYear(), 'curMonth': getCurMonth() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if(data['in']){
                    element = JSON.parse(data['in']);
                    $('#monthin').text(element.month);                        
                }
                if(data['out']){
                    element = JSON.parse(data['out']);
                    $('#monthout').text(element.month);
                }     
            },
            error: function (obj) {
                notices(obj);
            },
        });
        $.ajax({
            url: 'http://127.0.0.1:8000/Overview/curYear/',
            type: 'POST',
            data: { 'curYear': getYear() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if(data['in']){
                    element = JSON.parse(data['in']);
                    $('#yearin').text(element.year);                        
                }
                if(data['out']){
                    element = JSON.parse(data['out']);
                    $('#yearout').text(element.year);
                }                
            },
            error: function (obj) {
                notices(obj);
            },
        });
        $.ajax({
            url: 'http://127.0.0.1:8000/Overview/sevenDay/',
            type: 'POST',
            data: { 'day': getDate() },
            // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
            success: function (obj) {
                data = JSON.parse(obj);
                if(data['in']){
                    element = JSON.parse(data['in']);
                    $('#yearin').text(element.year);                        
                }
                if(data['out']){
                    element = JSON.parse(data['out']);
                    $('#yearout').text(element.year);
                }                
            },
            error: function (obj) {
                notices(obj);
            },
        });
    }
    initOverview(initEachMonthbar);

    function eachMonth(func){
        let monthcount = 12;
        let labels = [];
        let inoutlabels = [];
        let indatas = [];
        let outdatas  = [];

        for (var i = 1; i <= monthcount; i++) {
            var month = i < 10 ? "0" + i : i;
            labels.push(getYear() + "-" + month);
            inoutlabels.push(month);
            indatas.push(0);
            outdatas.push(0);
        }

        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: { year: getYear(), type:'4' },
            success: function (obj) {
                let data = JSON.parse(obj);
                if(data.in){
                    let datain = JSON.parse(data.in);
                    for(ins in datain){
                        let index = labels.indexOf(ins);
                        indatas[index] = datain[ins];
                    }
                }
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
    };
    function initEachMonthbar(labels, indatas, outdatas) {

        let $dashChartBarsData = {
            labels: labels,
            datasets: [
                {
                    label: '同期'+ getYear() +'收入',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(72,116,207,0.7)',
                    hoverBackgroundColor: "rgba(72,176,247,1)",
                    hoverBorderColor: "rgba(0,0,0,0)",
                    borderRadius: 10,
                    grouped: true,
                    categoryPercentage: 1,
                    barPercentage: 1,
                    barThickness: '30',
                    data: indatas,
                },
                {
                    label: '同期'+ getYear() +'支出',
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
        let $eachMonthbar = jQuery('.eachMonth-chartjs-bars')[0].getContext('2d');     
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($eachMonthbar, {
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
                        text:  getYear() + ' 当年收支详情',//标题
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
    function eachYear(func){
        let labels = [];
        let aRound = 12;
        let inoutlabels = [];
        let indatas = [];
        let outdatas  = [];
        let curyear = getYear();
        let pervyear = curyear - aRound - 1;

        for (let i = curyear - aRound; i <= curyear; i++) {
            labels.push(i);
            inoutlabels.push(i);
            indatas.push(0);
            outdatas.push(0);
        }
        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: {year: curyear, pervyear: pervyear, type: '5'},
            success: function (obj) {
                let data = JSON.parse(obj);
                if(data.out){
                    let dataout = JSON.parse(data.out);
                    for(ous in dataout){
                        let index = labels.indexOf(parseInt(ous));
                        outdatas[index] = dataout[ous];
                    }
                }
                if(data.in){
                    let datain = JSON.parse(data.in);
                    for(ins in datain){
                        let index = labels.indexOf(parseInt(ins));
                        indatas[index] = datain[ins];
                    }
                }
                func(inoutlabels, indatas, outdatas, curyear, pervyear)
            },
            error: function (obj) {
                notices(JSON.parse(notices));
            }
        });
    }
    function initeachYearLines(labels, indatas, outdatas, curyear, pervyear) {

        let $dashChartBarsData = {
            labels: labels,
            datasets: [
                {
                    label: '同期收入',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(72,116,207,0.7)',
                    hoverBackgroundColor: "rgba(72,176,247,1)",
                    hoverBorderColor: "rgba(0,0,0,0)",
                    borderRadius: 10,
                    grouped: true,
                    categoryPercentage: 1,
                    barPercentage: 1,
                    barThickness: '30',
                    lineTension: 0.5,
                    data: indatas,
                },
                {
                    label: '同期支出',
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
                    lineTension: 0.5,
                    data: outdatas,
                }
            ]
        };
        let $eachYearLines = jQuery('.eachYear-chartjs-lines')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($eachYearLines, {
                type: 'line',
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
                        text: pervyear + ' -- ' + curyear +' 收支详情',//标题
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

    function curMonthEveryDay(func){       
        let curMonth = getMonth();
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
                if(data.in){
                    let datain = JSON.parse(data.in);
                    for(ins in datain){
                        let index = labels.indexOf(ins);
                        indatas[index] = datain[ins];
                    }
                }
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

    function initCurMonthEveryDayLines(labels, indatas, outdatas) {

        let $dashChartBarsData = {
            labels: labels,
            datasets: [            
                {
                    label: '同期收入',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(72,116,207,0.7)',
                    hoverBackgroundColor: "rgba(72,176,247,1)",
                    hoverBorderColor: "rgba(0,0,0,0)",
                    borderRadius: 10,
                    grouped: true,
                    categoryPercentage: 1,
                    barPercentage: 1,
                    barThickness: '30',
                    lineTension: 0.5,
                    data: indatas,
                },
                {
                    label: '同期支出',
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
                    lineTension: 0.5,
                    data: outdatas,
                }
            ]
        };
        var $dashChartLinesCnt = jQuery('.curMonthEveryDays-chartjs-lines')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($dashChartLinesCnt, {
                type: 'line',
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
                        text: getMonth() +' 当月收支详情',//标题
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
    
    function RevenueExpenseTypePie(callback){
        let curMonth = getMonth();
        let year = curMonth.substring(0, 4);
        let month = curMonth.substring(5,);
        let inoutlabels = [];
        let inoutdatas = [];
        let backgroundColor = [];

        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: {year: year, month: month, type: '0'},
            success: function (obj) {
                let data = JSON.parse(obj);
                for(let key in data){
                    let values = JSON.parse(data[key]);
                    let sum = 0;
                    let codetype;
                    for(let index in values){
                        let value = values[index];
                        codetype = value['codecodes__codetype'];
                        if('in'.localeCompare(codetype) == 0){
                            break;
                        }
                        sum = sum + Math.abs(value['money']);
                    }
                    if('in'.localeCompare(codetype) == 0){
                        continue;
                    }
                    inoutlabels.push(key);
                    inoutdatas.push(sum.toFixed(2));
                    backgroundColor.push(color16());
                }   
                callback(inoutlabels, inoutdatas, backgroundColor)
            },
            error: function (obj) {
                notices(JSON.parse(notices));
            }
        });
    }

    function initRevenueExpenseTypePie(labels, data, backgroundColor){
        const $dashChartPieCntData = {
            labels: labels,
            datasets: [{         
                data: data,
                backgroundColor: backgroundColor
            }]
        };

        var $dashChartPieCnt = jQuery('.revenue-ExpenseType-chartjs-lines')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($dashChartPieCnt, {
                type: 'pie',
                data: $dashChartPieCntData,
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
                        text: getMonth() +' 当月支出详情',//标题
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
                    // scales: {
                    //     suggestedMin: 0,//雷达图，极地图最小值
                    //     suggestedMax: 20,//雷达图，极地图最大值
                    //     yAxes: [{//y轴
                    //         position: 'left',//y轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }],
                    //     xAxes: [{//x轴
                    //         position: 'bottom',//x轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }]
                    // },
                    // startAngle: 1 * Math.PI,//饼图环形图极地图开始偏转角度
                    // circumference: 1 * Math.PI,//饼图环形图允许图形覆盖                     
                },
            });
        }  
    }

    function RevenueExpenseCurYearTypePie(callback){
        let year = getYear();
        let inoutlabels = [];
        let inoutdatas = [];
        let backgroundColor = [];

        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: {year: year, type: '1'},
            success: function (obj) {
                let data = JSON.parse(obj);
                for(let key in data){
                    let values = JSON.parse(data[key]);
                    let sum = 0;
                    for(let index in values){
                        let value = values[index];
                        codetype = value['codecodes__codetype'];

                        sum = sum + Math.abs(value['money']);
                    }
                    inoutlabels.push(key);
                    inoutdatas.push(sum.toFixed(2));
                    backgroundColor.push(color16());
                } 
                callback(inoutlabels, inoutdatas, backgroundColor)
            },
            error: function (obj) {
                notices(JSON.parse(notices));
            }
        });
    }

    function initRevenueExpenseCurYearTypePie(labels, data, backgroundColor){
        const $dashChartPieCntData = {
            labels: labels,
            datasets: [{         
                data: data,
                backgroundColor: backgroundColor
            }]
        };

        var $dashChartPieCnt = jQuery('.revenue-ExpenseType-CurYear-chartjs-lines')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($dashChartPieCnt, {
                type: 'pie',
                data: $dashChartPieCntData,
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
                        text: getYear() +' 当年收支详情',//标题
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
                    // scales: {
                    //     suggestedMin: 0,//雷达图，极地图最小值
                    //     suggestedMax: 20,//雷达图，极地图最大值
                    //     yAxes: [{//y轴
                    //         position: 'left',//y轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }],
                    //     xAxes: [{//x轴
                    //         position: 'bottom',//x轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }]
                    // },
                    // startAngle: 1 * Math.PI,//饼图环形图极地图开始偏转角度
                    // circumference: 1 * Math.PI,//饼图环形图允许图形覆盖                     
                },
            });
        }  
    }

    function RevenueExpenseAroundYearTypePie(callback){
       
        let inoutlabels = [];
        let inoutdatas = [];
        let backgroundColor = [];
        var aRound = 12;
        let year = getYear();
        let pervyear = year - aRound;

        $.ajax({
            url: 'http://127.0.0.1:8000/DataPresentation/DataPresentation/',
            type: 'POST',
            data: {year: year, pervyear:pervyear, type: '2'},
            success: function (obj) {
                let data = JSON.parse(obj);
                for(let key in data){
                    let values = JSON.parse(data[key]);
                    let sum = 0;
                    for(let index in values){
                        let value = values[index];
                        codetype = value['codecodes__codetype'];

                        sum = sum + Math.abs(value['money']);
                    }
                    inoutlabels.push(key);
                    inoutdatas.push(sum.toFixed(2));
                    backgroundColor.push(color16());
                } 
                callback(inoutlabels, inoutdatas, backgroundColor, year, pervyear)
            },
            error: function (obj) {
                notices(JSON.parse(notices));
            }
        });
    }

    function initRevenueExpenseAroundYearTypePie(labels, data, backgroundColor, year, pervyear){
        const $dashChartPieCntData = {
            labels: labels,
            datasets: [{         
                data: data,
                backgroundColor: backgroundColor
            }]
        };

        var $dashChartPieCnt = jQuery('.revenue-ExpenseType-AroundYear-chartjs-lines')[0].getContext('2d');
        if (inoutBar && inoutBar.instances[0] != null) 
    	    var pre_chart = inoutBar.instances[0].chart;
        if(pre_chart != null) {
            pre_chart['data']['datasets'][0]['data'] = outdatas;
            pre_chart['data']['datasets'][0]['labels'] = labels;
            pre_chart.update();
        }
        else{
            var inoutBar = new Chart($dashChartPieCnt, {
                type: 'pie',
                data: $dashChartPieCntData,
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
                        text: year+ ' - '+ pervyear +' 一年轮收支详情',//标题
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
                    // scales: {
                    //     suggestedMin: 0,//雷达图，极地图最小值
                    //     suggestedMax: 20,//雷达图，极地图最大值
                    //     yAxes: [{//y轴
                    //         position: 'left',//y轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }],
                    //     xAxes: [{//x轴
                    //         position: 'bottom',//x轴位置
                    //         ticks: {
                    //             beginAtZero: true//从零开始
                    //         },
                    //         // stacked: true,//堆叠
                    //     }]
                    // },
                    startAngle: 2 * Math.PI,//饼图环形图极地图开始偏转角度
                    circumference: 2 * Math.PI,//饼图环形图允许图形覆盖                     
                },
            });
        }  
    }
    eachMonth(initEachMonthbar);  
    eachYear(initeachYearLines); 
    curMonthEveryDay(initCurMonthEveryDayLines);
    RevenueExpenseTypePie(initRevenueExpenseTypePie);
    RevenueExpenseCurYearTypePie(initRevenueExpenseCurYearTypePie);
    RevenueExpenseAroundYearTypePie(initRevenueExpenseAroundYearTypePie);
});