/*
 * QuantumLeap2ECharts
 * Copyright (c) 2018 Future Internet Consulting and Development Solutions S.L.
 *
 */

/* exported QuantumLeap2ECharts */
/* globals moment */

const QuantumLeap2ECharts = (function () {

    "use strict";

    /* *****************************************************************************/
    /* **************************** CLASS DEFINITION *******************************/
    /* *****************************************************************************/

    const QuantumLeap2ECharts = function QuantumLeap2ECharts() {

        // Set preference callbacks
        MashupPlatform.prefs.registerCallback(handlerPreferences.bind(this));

        // Set inputHandler
        MashupPlatform.wiring.registerCallback("ql_history", transformQL2Echart.bind(this));

        // Set wiring status callback
        MashupPlatform.wiring.registerStatusCallback(() => {
            // TODO
        });

    };

    /* *****************************************************************************/
    /* ******************************** PRIVATE ************************************/
    /* *****************************************************************************/

    const transformQL2Echart = function transformQL2Echart(hDataset) {

        const options = transform2multiChart(hDataset);

        // hDataset.attributes.forEach( attr => {
        //    transform2LineChart(attr, hDataset.index)
        // });
        MashupPlatform.wiring.pushEvent("echarts_data", options);
    };
    const average = list => list.reduce((prev, curr) => prev + curr) / list.length;

    let meta = {};
    const getChartsOptions = function getChartsOptions(history) {

        let attributes = history.attributes;
        let dates = history.index;
        let res = {};
        let charts = ["chart1", "chart2", "chart3", "chart4"];
        let totalCharts = 0;
        let yAxisIndex = 0;

        let withAreas = MashupPlatform.prefs.get('areas');
        let showStyledGradients = MashupPlatform.prefs.get('styled_gradient');
        let showPoints = MashupPlatform.prefs.get('show_points');

        meta = {};
        charts.forEach(c => {

            let chartName = MashupPlatform.prefs.get(c + '_title');
            let type = MashupPlatform.prefs.get(c + '_type');
            let fields = MashupPlatform.prefs.get(c + '_attr');
            let axisDateFormat = MashupPlatform.prefs.get("axis_date_format");
            if (axisDateFormat.trim() === "") {
                axisDateFormat = "L LTS";
            }

            if (type != null && fields != null && fields !== "") {
                res[c] = {
                    type: type,
                    title: {},
                    grid: {},
                    series: [],
                    xAxis: [],
                    yAxis: [],
                    visualMap: []
                };

                fields = fields.trim().split(new RegExp(',\\s*'));
                if (fields.length > 2) {
                    // Max 2 attributes
                    fields = fields.slice(0, 2);
                }
                attributes.forEach(a => {
                    if (fields.indexOf(a.attrName) >= 0) {
                        let unit = "";
                        let factor = 1;
                        if (a.metadata != null) {
                            // get formater info from metadata
                            if (a.metadata.unit != null) {
                                unit = " " + a.metadata.unit.value;
                            }
                            if (a.metadata.factor) {
                                factor = a.metadata.factor.value;
                            }
                        }
                        meta[a.attrName] = {
                            unit: unit,
                            factor: factor
                        };
                        // yAxis
                        let nyA = {
                            splitLine: {show: false},
                            gridIndex: totalCharts,
                            name: a.attrName,
                            nameGap: 8,
                            axisLabel: {
                                formatter: function (value, index) {
                                    return (value / factor) + unit;
                                },
                                fontSize: 10
                            }
                        };
                        if (res[c].yAxis.length === 1) {
                            // second yAxis for the second series
                            nyA.position = 'right'
                        }
                        // series
                        let series = {
                            name: a.attrName,
                            type: type,
                            showSymbol: showPoints,
                            xAxisIndex: totalCharts,
                            yAxisIndex: yAxisIndex,
                            data: a.values,
                            animation: false
                        };
                        if (withAreas) {
                            series.areaStyle = {};
                        }
                        res[c].series.push(series);
                        res[c].yAxis.push(nyA);
                        if (showStyledGradients) {
                            let colors = MashupPlatform.prefs.get('gradient_colors');
                            if (colors != "") {
                                colors = colors.trim().split(new RegExp(',\\s*'));
                            } else {
                                // Default
                                colors = ['#030161', 'red'];
                            }
                            res[c].visualMap.push({
                                "show": false,
                                "type": 'continuous',
                                "seriesIndex": yAxisIndex,
                                "max": Math.max.apply(null, a.values),
                                "min": parseInt(average(a.values)),
                                "inRange": {
                                    "color": colors
                                }
                            })
                        }
                        yAxisIndex++;
                    }
                });
                // Title
                res[c].title.text = chartName;
                // xAxis
                // calculate date label interval
                let interval;
                if (dates.length < 10) {
                    interval = 1;
                } else if (dates.length < 30) {
                    interval = 5;
                } else if (dates.length < 60) {
                    interval = 8;
                } else if (dates.length < 100) {
                    interval = 12;
                } else if (dates.length < 300) {
                    interval = 30;
                } else if (dates.length < 500) {
                    interval = 50;
                } else if (dates.length < 1000) {
                    interval = 100;
                } else {
                    interval = 50 * parseInt(dates.length / 500);
                }

                // xAxis dates
                res[c].xAxis.push({
                    data: dates,
                    gridIndex: totalCharts,
                    axisLabel: {
                        formatter: function (value, index) {
                            return moment(value).format(axisDateFormat);
                        },
                        rotate: -18,
                        interval: interval,
                        fontSize: 10
                    }
                });

                totalCharts++;
            }
        });

        switch (totalCharts) {
        case 0:
            MashupPlatform.widget.log("Invalid Preferences. At least one chart config is required",
                MashupPlatform.log.ERROR);
            return null;
        case 1:
            res.chart1.title.textStyle = {};
            res.chart1.title.textStyle.fontSize = 16;
            res.chart1.title.top = 0;
            res.chart1.title.left = 'center';
            res.chart1.grid.y = '7%';
            res.chart1.grid.x = '7%';
            res.chart1.grid.height = "75%";
            res.chart1.grid.width = "85%";
            break;
        case 2:
            res.chart1.title.textStyle = {};
            res.chart1.title.textStyle.fontSize = 16;
            res.chart1.title.top = 0;
            res.chart1.title.left = 'center';
            res.chart2.title.textStyle = {};
            res.chart2.title.textStyle.fontSize = 16;
            res.chart2.title.top = '50%';
            res.chart2.title.left = 'center';
            res.chart1.grid.y = '7%';
            res.chart1.grid.x = '7%';
            res.chart1.grid.height = "31%";
            res.chart1.grid.width = "85%";
            res.chart2.grid.y2 = '10%';
            res.chart2.grid.x = '7%';
            res.chart2.grid.height = "31%";
            res.chart2.grid.width = "85%";
            break;
        case 3:
            res.chart1.title.textStyle = {};
            res.chart1.title.textStyle.fontSize = 16;
            res.chart1.title.top = 0;
            res.chart1.title.left = '5%';
            res.chart2.title.textStyle = {};
            res.chart2.title.textStyle.fontSize = 16;
            res.chart2.title.top = 0;
            res.chart2.title.left = '55%';
            res.chart3.title.textStyle = {};
            res.chart3.title.textStyle.fontSize = 16;
            res.chart3.title.top = '50%';
            res.chart3.title.left = 'center';
            res.chart1.grid.y = '7%';
            res.chart1.grid.x = '7%';
            res.chart1.grid.height = "31%";
            res.chart1.grid.width = "33%";
            res.chart2.grid.y = '7%';
            res.chart2.grid.x2 = '7%';
            res.chart2.grid.height = "31%";
            res.chart2.grid.width = "33%";
            res.chart3.grid.y2 = '10%';
            res.chart3.grid.x = '7%';
            res.chart3.grid.height = "31%";
            res.chart3.grid.width = "85%";
            break;
        case 4:
            res.chart1.title.textStyle = {};
            res.chart1.title.textStyle.fontSize = 16;
            res.chart1.title.top = 0;
            res.chart1.title.left = '10%';
            res.chart2.title.textStyle = {};
            res.chart2.title.textStyle.fontSize = 16;
            res.chart2.title.top = 0;
            res.chart2.title.left = '60%';
            res.chart3.title.textStyle = {};
            res.chart3.title.textStyle.fontSize = 16;
            res.chart3.title.top = '50%';
            res.chart3.title.left = '10%';
            res.chart4.title.textStyle = {};
            res.chart4.title.textStyle.fontSize = 16;
            res.chart4.title.top = '50%';
            res.chart4.title.left = '60%';
            res.chart1.grid.y = '7%';
            res.chart1.grid.x = '7%';
            res.chart1.grid.height = "31%";
            res.chart1.grid.width = "33%";
            res.chart2.grid.y = '7%';
            res.chart2.grid.x2 = '7%';
            res.chart2.grid.height = "31%";
            res.chart2.grid.width = "33%";
            res.chart3.grid.y2 = '10%';
            res.chart3.grid.x = '7%';
            res.chart3.grid.height = "31%";
            res.chart3.grid.width = "33%";
            res.chart4.grid.y2 = '10%';
            res.chart4.grid.x2 = '7%';
            res.chart4.grid.height = "31%";
            res.chart4.grid.width = "33%";
            break;
        }

        return res;
    };

    const transform2multiChart = function transform2multiChart(data) {

        let chartPrefs = getChartsOptions(data);

        if (chartPrefs == null) {
            return [];
        }

        let tooltipDateFormat = MashupPlatform.prefs.get("tooltip_date_format");
        if (tooltipDateFormat === "") {
            tooltipDateFormat = "llll";
        }

        let titles = [];
        let xAxis = [];
        let yAxis = [];
        let grid = [];
        let series = [];
        let visualMap = [];

        for (let chart in chartPrefs) {
            titles.push(chartPrefs[chart].title);
            xAxis = xAxis.concat(chartPrefs[chart].xAxis);
            yAxis = yAxis.concat(chartPrefs[chart].yAxis);
            grid.push(chartPrefs[chart].grid);
            series = series.concat(chartPrefs[chart].series);
            visualMap = visualMap.concat(chartPrefs[chart].visualMap);
        }

        return {
            // visualMap: [],
            title: titles,
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    if (params.length < 1) {
                        return;
                    }

                    var valuesCode = '<spam>' + moment(params[0].name).format(tooltipDateFormat) + '</spam>';

                    var keyLabels = [];
                    params.forEach((p, index) => {
                        if (keyLabels.indexOf(p.seriesName) === -1) {
                            let unit = meta[p.seriesName] != null ? meta[p.seriesName].unit : "";
                            let factor = meta[p.seriesName] != null ? meta[p.seriesName].factor : "";

                            valuesCode += '\<br/>\<spam> ' + p.seriesName + ': </spam>' + (p.value / factor) + unit;
                            keyLabels.push(p.seriesName);
                        }
                    });

                    return valuesCode;
                }
            },
            xAxis: xAxis,
            yAxis: yAxis,
            grid: grid,
            series: series,
            visualMap: visualMap
        };
    };

    /* *************************** Preference Handler *****************************/
    const handlerPreferences = function handlerPreferences(new_values) {
        // TODO
    };


    // var paintEChart = function paintEChart(data, container, dateRange, stayLoading) {
    //
    //     if (data == null) {
    //         // Empty chart
    //         echart = echarts.init(container);
    //         var msgOption = {
    //             title: {
    //                 show: true,
    //                 textStyle: {
    //                     color: 'grey',
    //                     fontSize: 20
    //                 },
    //                 text: "No Data",
    //                 left: 'center',
    //                 top: 'center'
    //             },
    //             xAxis: {
    //                 show: false
    //             },
    //             yAxis: {
    //                 show: false
    //             },
    //             series: []
    //         };
    //         echart.clear();
    //         echart.setOption(msgOption);
    //         if (stayLoading !== true) {
    //             echart.hideLoading();
    //         } else {
    //             echart.showLoading();
    //         }
    //         return;
    //     }
    //
    //     // Loading
    //     if (stayLoading !== true) {
    //         echart.hideLoading();
    //     } else {
    //         echart.showLoading();
    //     }
    //
    //     var option = {
    //         tooltip: {
    //             trigger: 'axis',
    //             // formatter: '{b0}: {c0}<br />{b1}: {c1}'
    //             formatter: function (params) {
    //
    //                 if (params.length < 1) {
    //                     return;
    //                 }
    //
    //                 var valuesCode = '<spam style="color:#ffffff">' +
    //                     moment(params[0].value[0]).tz(timezone).format("YYYY-MM-DD, HH:mm z") + '</spam>';
    //
    //                 var keyLabels = [];
    //                 params.forEach((p, index) => {
    //                     if (keyLabels.indexOf(p.name) === -1) {
    //                         var unit = lastEChartOptions.series[index] != null ? lastEChartOptions.series[index].unit : "";
    //                         valuesCode += '\<br/>\<i class="fas fa-circle" style="color:' +
    //                             p.color + '; text-shadow: 0px 0px 2px white;"></i>' +
    //                             '<spam style="color:#bbbbbb"> ' + p.name + ': </spam>' + p.value[1] + " " +
    //                             unit;
    //                         keyLabels.push(p.name);
    //                     }
    //                 });
    //
    //                 return valuesCode;
    //             },
    //             textStyle: {
    //                 fontSize: 12
    //             },
    //             backgroundColor: 'rgba(58, 0, 0, 0.49)'
    //         },
    //         backgroundColor: data.backgroundColor,
    //         legend: {
    //             data: [],
    //             right: "5%"
    //         },
    //         dataZoom: [{
    //             type: 'inside',
    //             filterMode: 'none'
    //         }, {
    //             type: 'slider',
    //             filterMode: 'none',
    //             handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    //             handleSize: '80%',
    //             handleStyle: {
    //                 color: '#fff',
    //                 shadowBlur: 3,
    //                 shadowColor: 'rgba(0, 0, 0, 0.6)',
    //                 shadowOffsetX: 2,
    //                 shadowOffsetY: 2
    //             },
    //             bottom: 0 // Avoid dataZoom + time xAxis bug.
    //         }],
    //         toolbox: {
    //             show: true,
    //             feature: {
    //                 saveAsImage: {
    //                     title: "Save"
    //                 },
    //                 // dataZoom: {
    //                 //     title: "Zoom",
    //                 //     yAxisIndex: false
    //                 // }
    //             },
    //             left: "0"
    //         },
    //         xAxis: {
    //             type: 'time',
    //             min: dateRange[0],
    //             max: dateRange[1],
    //             splitLine: {
    //                 show: false
    //             },
    //             axisLabel: {
    //                 margin: 5,
    //             }
    //         },
    //         yAxis: [],
    //         series: []
    //     };
    //
    //     data.attributes.forEach(a => {
    //         option.legend.data.push(a.name);
    //         option.yAxis.push({
    //             type: 'value',
    //             splitLine: {
    //                 show: false
    //             },
    //             min: a.range[0],
    //             max: a.range[1],
    //             axisLabel: a.axisLabel
    //         });
    //         var op = {
    //             name: a.name,
    //             attribName: a.attribName,
    //             type: a.type,
    //             data: a.values,
    //             yAxisIndex: option.yAxis.length - 1,
    //             symbolSize: a.symbolSize,
    //             itemStyle: a.itemStyle,
    //             areaStyle: a.areaStyle,
    //             lineStyle: a.lineStyle,
    //             smooth: a.smooth,
    //             unit: a.unit
    //         };
    //         if (a.step != null) {
    //             op.step = a.step;
    //         }
    //         if (a.showSymbol) {
    //             op.showSymbol = a.showSymbol;
    //         } else {
    //
    //             op.showSymbol = false;
    //         }
    //         option.series.push(op);
    //     });
    //     echart = echarts.init(container);
    //
    //     if (option && typeof option === "object") {
    //         echart.setOption(option, true);
    //         lastEChartOptions = option;
    //     }
    //
    //     return echart;
    // };

    /* test-code */

    /* end-test-code */

    return QuantumLeap2ECharts;

})();
