"use strict";


/* ==========================================================
   Mayday Protocol Assistant
   ローカルデータ管理
========================================================== */

const MaydayStore = (() => {

    const STORAGE_KEY =
        "mayday_protocol_assistant_mobile_v1";


    const DEFAULT_DATA = {
        gauges: {
            fuel: null,
            oil_pressure: null,
            airspeed: null,
            altimeter: null,
            tachometer: null,
            temperature: null,
            ammeter: null
        },

        completed: {},

        puzzleData: {},

        descriptionVisible: false,

        gaugeVisible: true
    };


    /* ======================================================
       コピー
    ====================================================== */

    function cloneDefaultData() {

        return JSON.parse(
            JSON.stringify(DEFAULT_DATA)
        );
    }


    /* ======================================================
       読み込み
    ====================================================== */

    function load() {

        const fallback =
            cloneDefaultData();

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {

                return fallback;
            }


            const saved =
                JSON.parse(raw);


            return {
                gauges: {
                    ...fallback.gauges,
                    ...(saved.gauges || {})
                },

                completed: {
                    ...(saved.completed || {})
                },

                puzzleData: {
                    ...(saved.puzzleData || {})
                },

                descriptionVisible:
                    Boolean(
                        saved.descriptionVisible
                    ),

                gaugeVisible:
                    saved.gaugeVisible !== false
            };

        } catch (error) {

            console.error(
                "保存データの読み込みに失敗しました。",
                error
            );

            return fallback;
        }

    }


    let data = load();


    /* ======================================================
       保存
    ====================================================== */

    function save() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "データの保存に失敗しました。",
                error
            );
        }

    }


    /* ======================================================
       計器
    ====================================================== */

    function getGauge(name) {

        return (
            data.gauges[name]
            ?? null
        );
    }


    function setGauge(
        name,
        value
    ) {

        if (
            value === null
            || value === ""
            || value === undefined
        ) {

            data.gauges[name] = null;

        } else {

            const number =
                parseInt(
                    value,
                    10
                );

            data.gauges[name] =
                Number.isFinite(number)
                    ? number
                    : null;
        }

        save();
    }


    function getGauges() {

        return {
            ...data.gauges
        };
    }


    /* ======================================================
       クリア状態
    ====================================================== */

    function isPuzzleCompleted(
        puzzleId
    ) {

        return Boolean(
            data.completed[puzzleId]
        );
    }


    function setPuzzleCompleted(
        puzzleId,
        completed
    ) {

        data.completed[puzzleId] =
            Boolean(completed);

        save();
    }


    /* ======================================================
       パズル個別データ
    ====================================================== */

    function getPuzzleData(
        puzzleId
    ) {

        const value =
            data.puzzleData[puzzleId];

        if (!value) {

            return {};
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }


    function setPuzzleData(
        puzzleId,
        value
    ) {

        data.puzzleData[puzzleId] =
            JSON.parse(
                JSON.stringify(
                    value || {}
                )
            );

        save();
    }


    /* ======================================================
       概要
    ====================================================== */

    function isDescriptionVisible() {

        return Boolean(
            data.descriptionVisible
        );
    }


    function setDescriptionVisible(
        visible
    ) {

        data.descriptionVisible =
            Boolean(visible);

        save();


        /* ======================================================
           概要表示状態が変わったことを全画面へ通知
        ====================================================== */

        window.dispatchEvent(
            new CustomEvent(
                "mayday-description-visibility-changed",
                {
                    detail: {
                        visible:
                            data.descriptionVisible
                    }
                }
            )
        );
    }

    /* ======================================================
       計器表示
    ====================================================== */

    function isGaugeVisible() {

        return (
            data.gaugeVisible !== false
        );
    }

    function setGaugeVisible(
        visible
    ) {

        data.gaugeVisible =
            Boolean(visible);

        save();


        /* ======================================================
           計器表示状態が変わったことを全画面へ通知
        ====================================================== */

        window.dispatchEvent(
            new CustomEvent(
                "mayday-gauge-visibility-changed",
                {
                    detail: {
                        visible:
                            data.gaugeVisible
                    }
                }
            )
        );
    }


    /* ======================================================
       パズルデータだけリセット

       計器は残す
    ====================================================== */

    function clearPuzzleData() {

        data.completed = {};
        data.puzzleData = {};

        save();
    }


    /* ======================================================
       全リセット
    ====================================================== */

    function clearAllData() {

        data =
            cloneDefaultData();

        save();
    }


    /* ======================================================
       公開
    ====================================================== */

    return {
        getGauge,
        setGauge,
        getGauges,

        isPuzzleCompleted,
        setPuzzleCompleted,

        getPuzzleData,
        setPuzzleData,

        isDescriptionVisible,
        setDescriptionVisible,

        isGaugeVisible,
        setGaugeVisible,

        clearPuzzleData,
        clearAllData
    };

})();