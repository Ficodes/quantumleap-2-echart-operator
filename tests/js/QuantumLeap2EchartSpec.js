/*
 * QuantumLeap2ECharts
 * Copyright (c) 2019 Future Internet Consulting and Development Solutions S.L.
 *
 */

/* globals MashupPlatform, MockMP, beforeAll, afterAll, beforeEach, QuantumLeap2ECharts */

(function () {

    "use strict";

    describe("QuantumLeap2ECharts operator should", function () {

        var operator;

        let entity_idMock = "mocki";
        var historyExampleSeries;
        const lastIndex = "2019-10-04T21:59:00.000";
        const lastIndexZ = "2019-10-04T21:59:00.00Z";

        const INITIAL_SERIE = {
            attributes: [
                {
                    attrName: "attr1",
                    values: [
                        0.359375,
                        0.369375,
                        0.379375,
                        0.389375,
                        0.399375,
                        0.409375,
                        0.419375,
                        0.429375,
                        0.439375,
                        0.449375
                    ]
                },
                {
                    attrName: "attr2",
                    values: [
                        0,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        0,
                        1
                    ]
                }
            ],
            entityId: entity_idMock,
            index: [
                "2019-10-03T22:00:00.000",
                "2019-10-03T22:56:10.000",
                "2019-10-04T15:00:11.000",
                "2019-10-04T15:03:13.000",
                "2019-10-04T15:05:11.000",
                "2019-10-04T15:10:11.000",
                "2019-10-04T15:15:10.000",
                "2019-10-04T15:20:10.000",
                "2019-10-04T15:25:10.000",
                "2019-10-04T15:26:26.000",
                lastIndex
            ]
        };

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'operator',
                prefs: {
                    'styled_gradient': true,
                    'gradient_colors': "#030161, red",
                    'areas': false,
                    'show_points': true,
                    'chart1_type': 'line',
                    'chart1_attr': 'pressure',
                    'chart2_type': 'line',
                    'chart2_attr': 'waterTemperature',
                    'chart3_type': 'line',
                    'chart3_attr': 'windSpeed',
                    'chart4_type': 'line',
                    'chart4_attr': 'meanWavePeriod',
                },
                inputs: ['ql_history'],
                outputs: ['echart_data']
            });
        });

        beforeEach(function () {
            jasmine.clock().install();
            MashupPlatform.reset();
            historyExampleSeries = JSON.parse(JSON.stringify(INITIAL_SERIE));
            operator = new QuantumLeap2ECharts();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
            expect(operator).not.toEqual(null);
        });

        it("does not try to connect on init if the output endpoint is not connected", () => {
            expect(operator).not.toEqual(null);
        });

        it("connects on wiring change", () => {
            expect(operator).not.toEqual(null);
        });

        it("connect on init", () => {

            expect(operator).not.toEqual(null);

        });

        it("on prefs changes", () => {
            expect(operator).not.toEqual(null);

        });
    });

})();
