"use strict";


const EmergencyFrequencyPuzzle = (() => {

    const PUZZLE_ID =
        "emergency_frequency";


    let root = null;

    let commonUi = null;


    /* ======================================================
       保存データ
    ====================================================== */

    function getSavedEquipment() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            );


        return {
            extinguisher:
                safeInt(
                    saved.extinguisher,
                    0,
                    1
                ),

            flare:
                safeInt(
                    saved.flare,
                    0,
                    4
                ),

            oxygen:
                safeInt(
                    saved.oxygen,
                    0,
                    4
                )
        };
    }


    function safeInt(
        value,
        minimum,
        maximum
    ) {

        if (
            value === null
            || value === undefined
            || value === ""
        ) {

            return null;
        }


        const number =
            parseInt(
                value,
                10
            );


        if (
            !Number.isFinite(number)
            || number < minimum
            || number > maximum
        ) {

            return null;
        }


        return number;
    }


    function readEquipment() {

        return {
            extinguisher:
                readSelect(
                    "emergencyExtinguisher"
                ),

            flare:
                readSelect(
                    "emergencyFlare"
                ),

            oxygen:
                readSelect(
                    "emergencyOxygen"
                )
        };
    }


    function readSelect(id) {

        const element =
            document.getElementById(
                id
            );


        if (
            !element
            || element.value === ""
        ) {

            return null;
        }


        return parseInt(
            element.value,
            10
        );
    }


    function saveEquipment() {

        const equipment =
            readEquipment();


        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            equipment
        );
    }


    /* ======================================================
       テーブル判定
    ====================================================== */

    function determineTable(
        extinguisher,
        flare,
        oxygen
    ) {

        if (extinguisher === null) {

            return {
                table: null,
                reason:
                    "消火器の数を入力してください。"
            };
        }


        if (flare === null) {

            return {
                table: null,
                reason:
                    "照明弾の数を入力してください。"
            };
        }


        if (oxygen === null) {

            return {
                table: null,
                reason:
                    "酸素ボンベの数を入力してください。"
            };
        }


        /*
           A
           消火器 = 1
           かつ
           照明弾 < 3
        */

        if (
            extinguisher === 1
            && flare < 3
        ) {

            return {
                table: "A",
                reason:
                    "消火器 = 1 かつ 照明弾 < 3"
            };
        }


        /*
           B

           Aに該当しなかった上で

           照明弾 >= 3
           または
           酸素ボンベ >= 2
        */

        if (
            flare >= 3
            || oxygen >= 2
        ) {

            const reasons = [];


            if (flare >= 3) {

                reasons.push(
                    "照明弾 ≥ 3"
                );
            }


            if (oxygen >= 2) {

                reasons.push(
                    "酸素ボンベ ≥ 2"
                );
            }


            return {
                table: "B",

                reason:
                    "テーブルAには該当せず、"
                    + reasons.join(
                        " または "
                    )
            };
        }


        /*
           その他
        */

        return {
            table: "C",

            reason:
                "テーブルA・Bのどちらにも該当しない"
        };
    }


    /* ======================================================
       テーブルA
    ====================================================== */

    function determineFrequencyA(
        oxygen
    ) {

        const ammeter =
            MaydayStore.getGauge(
                "ammeter"
            );


        if (ammeter === null) {

            return {
                frequency: null,
                reason:
                    "Ammeter を入力してください。"
            };
        }


        if (ammeter > 15) {

            return {
                frequency: 121.5,
                reason:
                    "テーブルA：Ammeter > 15"
            };
        }


        const altimeter =
            MaydayStore.getGauge(
                "altimeter"
            );


        if (altimeter === null) {

            return {
                frequency: null,
                reason:
                    "Altimeter を入力してください。"
            };
        }


        if (
            ammeter <= 15
            && altimeter > 8000
        ) {

            return {
                frequency: 118.1,

                reason:
                    "テーブルA：Ammeter ≤ 15 かつ "
                    + "Altimeter > 8000"
            };
        }


        if (
            altimeter <= 8000
            && oxygen >= 2
        ) {

            return {
                frequency: 127.3,

                reason:
                    "テーブルA：Altimeter ≤ 8000 かつ "
                    + "酸素ボンベ ≥ 2"
            };
        }


        const airspeed =
            MaydayStore.getGauge(
                "airspeed"
            );


        if (airspeed === null) {

            return {
                frequency: null,
                reason:
                    "Airspeed を入力してください。"
            };
        }


        if (airspeed > 120) {

            return {
                frequency: 124.8,

                reason:
                    "テーブルA：Airspeed > 120"
            };
        }


        return {
            frequency: 132.9,

            reason:
                "テーブルA：上記のいずれにも該当しない"
        };
    }


    /* ======================================================
       テーブルB
    ====================================================== */

    function determineFrequencyB(
        flare,
        oxygen
    ) {

        const airspeed =
            MaydayStore.getGauge(
                "airspeed"
            );


        if (airspeed === null) {

            return {
                frequency: null,
                reason:
                    "Airspeed を入力してください。"
            };
        }


        if (airspeed > 150) {

            return {
                frequency: 119.2,
                reason:
                    "テーブルB：Airspeed > 150"
            };
        }


        const oilPressure =
            MaydayStore.getGauge(
                "oil_pressure"
            );


        if (oilPressure === null) {

            return {
                frequency: null,

                reason:
                    "Oil Pressure を入力してください。"
            };
        }


        if (oilPressure < 40) {

            return {
                frequency: 125.4,

                reason:
                    "テーブルB：Oil Pressure < 40"
            };
        }


        if (oxygen === 3) {

            return {
                frequency: 128.6,

                reason:
                    "テーブルB：酸素ボンベ = 3"
            };
        }


        if (flare === 4) {

            return {
                frequency: 130.1,

                reason:
                    "テーブルB：照明弾 = 4"
            };
        }


        return {
            frequency: 122.8,

            reason:
                "テーブルB：上記のいずれにも該当しない"
        };
    }


    /* ======================================================
       テーブルC
    ====================================================== */

    function determineFrequencyC(
        flare,
        oxygen
    ) {

        const altimeter =
            MaydayStore.getGauge(
                "altimeter"
            );


        if (altimeter === null) {

            return {
                frequency: null,

                reason:
                    "Altimeter を入力してください。"
            };
        }


        if (altimeter > 10000) {

            return {
                frequency: 121.5,

                reason:
                    "テーブルC：Altimeter > 10000"
            };
        }


        const tachometer =
            MaydayStore.getGauge(
                "tachometer"
            );


        if (tachometer === null) {

            return {
                frequency: null,

                reason:
                    "Tachometer を入力してください。"
            };
        }


        if (tachometer > 2500) {

            return {
                frequency: 118.1,

                reason:
                    "テーブルC：Tachometer > 2500"
            };
        }


        if (flare === 2) {

            return {
                frequency: 127.3,

                reason:
                    "テーブルC：照明弾 = 2"
            };
        }


        if (oxygen === 1) {

            return {
                frequency: 124.8,

                reason:
                    "テーブルC：酸素ボンベ = 1"
            };
        }


        return {
            frequency: 119.2,

            reason:
                "テーブルC：上記のいずれにも該当しない"
        };
    }


    /* ======================================================
       全体判定
    ====================================================== */

    function calculateResult() {

        const equipment =
            readEquipment();


        const tableResult =
            determineTable(
                equipment.extinguisher,
                equipment.flare,
                equipment.oxygen
            );


        if (
            tableResult.table === null
        ) {

            return {
                table: null,

                tableReason:
                    tableResult.reason,

                frequency: null,

                frequencyReason: ""
            };
        }


        let frequencyResult;


        if (
            tableResult.table === "A"
        ) {

            frequencyResult =
                determineFrequencyA(
                    equipment.oxygen
                );

        } else if (
            tableResult.table === "B"
        ) {

            frequencyResult =
                determineFrequencyB(
                    equipment.flare,
                    equipment.oxygen
                );

        } else {

            frequencyResult =
                determineFrequencyC(
                    equipment.flare,
                    equipment.oxygen
                );
        }


        return {
            table:
                tableResult.table,

            tableReason:
                tableResult.reason,

            frequency:
                frequencyResult.frequency,

            frequencyReason:
                frequencyResult.reason
        };
    }


    /* ======================================================
       表示更新
    ====================================================== */

    function refresh() {

        if (!root) {
            return;
        }


        const result =
            calculateResult();


        const tableValue =
            root.querySelector(
                "#emergencyTableValue"
            );

        const tableReason =
            root.querySelector(
                "#emergencyTableReason"
            );

        const frequencyStatus =
            root.querySelector(
                "#emergencyFrequencyStatus"
            );

        const frequencyValue =
            root.querySelector(
                "#emergencyFrequencyValue"
            );

        const frequencyReason =
            root.querySelector(
                "#emergencyFrequencyReason"
            );

        const completeButton =
            root.querySelector(
                "#emergencyComplete"
            );

        const clearPanel =
            root.querySelector(
                "#emergencyClear"
            );

        const clearResult =
            root.querySelector(
                "#emergencyClearResult"
            );


        /* ==================================================
           テーブル未確定
        ================================================== */

        if (result.table === null) {

            tableValue.textContent =
                "判定待ち";

            tableValue.className =
                "emergency-table-value";


            tableReason.textContent =
                result.tableReason;


            frequencyStatus.textContent =
                "まず装備数を入力してください。";

            frequencyValue.textContent =
                "－";

            frequencyReason.textContent =
                "";


            completeButton.disabled =
                true;


            clearPanel.classList.add(
                "hidden"
            );


            return;
        }


        /* ==================================================
           テーブル確定
        ================================================== */

        tableValue.textContent =
            `テーブル${result.table}`;


        tableValue.className =
            "emergency-table-value "
            + `table-${result.table.toLowerCase()}`;


        tableReason.textContent =
            "判定理由："
            + result.tableReason;


        /* ==================================================
           周波数未確定
        ================================================== */

        if (
            result.frequency === null
        ) {

            frequencyStatus.textContent =
                "周波数判定に必要な計器を入力してください。";


            frequencyValue.textContent =
                "－";


            frequencyReason.textContent =
                result.frequencyReason;


            completeButton.disabled =
                true;


            clearPanel.classList.add(
                "hidden"
            );


            return;
        }


        /* ==================================================
           周波数確定
        ================================================== */

        frequencyStatus.textContent =
            "選択する周波数";


        frequencyValue.textContent =
            result.frequency.toFixed(
                1
            );


        frequencyReason.textContent =
            "判定理由："
            + result.frequencyReason;


        completeButton.disabled =
            false;


        if (
            MaydayStore.isPuzzleCompleted(
                PUZZLE_ID
            )
        ) {

            clearResult.innerHTML = `
                使用テーブル：
                <strong>
                    テーブル${result.table}
                </strong>

                <br><br>

                周波数：
                <strong>
                    ${result.frequency.toFixed(1)}
                </strong>
            `;


            clearPanel.classList.remove(
                "hidden"
            );

        } else {

            clearPanel.classList.add(
                "hidden"
            );
        }
    }


    /* ======================================================
       クリア
    ====================================================== */

    function completePuzzle() {

        /*
           現在の装備情報を保存
        */
        saveEquipment();


        /*
           02をクリア済みにする
        */
        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );


        /*
           ホームへ戻る
        */
        closePuzzle();
    }


    /* ======================================================
       リセット
    ====================================================== */

    function resetPuzzle() {

        const answer =
            window.confirm(
                "緊急周波数調整装置の装備数・進行状況・"
                + "クリア状態をリセットしますか？\n\n"
                + "共通計器の値は残ります。"
            );


        if (!answer) {
            return;
        }


        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {}
        );


        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            false
        );


        const extinguisher =
            root.querySelector(
                "#emergencyExtinguisher"
            );

        const flare =
            root.querySelector(
                "#emergencyFlare"
            );

        const oxygen =
            root.querySelector(
                "#emergencyOxygen"
            );


        extinguisher.value = "";
        flare.value = "";
        oxygen.value = "";


        refresh();
    }


    /* ======================================================
       イベント
    ====================================================== */

    function bindEvents() {

        [
            "emergencyExtinguisher",
            "emergencyFlare",
            "emergencyOxygen"
        ].forEach(id => {

            const element =
                root.querySelector(
                    `#${id}`
                );


            element.addEventListener(
                "change",
                () => {

                    saveEquipment();

                    refresh();

                }
            );

        });


        root
            .querySelector(
                "#emergencyComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        root
            .querySelector(
                "#emergencyReset"
            )
            .addEventListener(
                "click",
                resetPuzzle
            );
    }


    /* ======================================================
       HTML
    ====================================================== */

    function render() {

        if (!root) {
            return;
        }


        const saved =
            getSavedEquipment();


        root.innerHTML = `
            <div class="emergency-page">

                <section class="emergency-equipment">

                    <div class="emergency-section-title">
                        装備数
                    </div>

                    <div class="emergency-equipment-grid">

                        <label class="emergency-equipment-card">

                            <span>
                                消火器
                            </span>

                            <select id="emergencyExtinguisher">

                                <option value="">
                                    0～1
                                </option>

                                <option value="0">
                                    0
                                </option>

                                <option value="1">
                                    1
                                </option>

                            </select>

                        </label>


                        <label class="emergency-equipment-card">

                            <span>
                                照明弾
                            </span>

                            <select id="emergencyFlare">

                                <option value="">
                                    0～4
                                </option>

                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>

                            </select>

                        </label>


                        <label class="emergency-equipment-card">

                            <span>
                                酸素ボンベ
                            </span>

                            <select id="emergencyOxygen">

                                <option value="">
                                    0～4
                                </option>

                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>

                            </select>

                        </label>

                    </div>

                </section>


                <section class="emergency-result-card">

                    <div class="emergency-result-label">
                        使用テーブル
                    </div>

                    <div
                        id="emergencyTableValue"
                        class="emergency-table-value"
                    >
                        判定待ち
                    </div>

                    <div
                        id="emergencyTableReason"
                        class="emergency-reason"
                    ></div>

                </section>


                <section class="emergency-result-card">

                    <div
                        id="emergencyFrequencyStatus"
                        class="emergency-result-label"
                    >
                        まず装備数を入力してください。
                    </div>

                    <div
                        id="emergencyFrequencyValue"
                        class="emergency-frequency-value"
                    >
                        －
                    </div>

                    <div
                        id="emergencyFrequencyReason"
                        class="emergency-reason"
                    ></div>

                </section>


                <div class="emergency-actions">

                    <button
                        type="button"
                        id="emergencyReset"
                        class="button button-secondary"
                    >
                        最初からやり直す
                    </button>

                    <button
                        type="button"
                        id="emergencyComplete"
                        class="button button-primary"
                        disabled
                    >
                        ゲームクリアを登録
                    </button>

                </div>


                <section
                    id="emergencyClear"
                    class="emergency-clear hidden"
                >

                    <div class="emergency-clear-title">
                        ✓ CLEAR
                    </div>

                    <div
                        id="emergencyClearResult"
                        class="emergency-clear-result"
                    ></div>

                </section>

            </div>
        `;


        /* ==================================================
           保存済み装備を復元
        ================================================== */

        root
            .querySelector(
                "#emergencyExtinguisher"
            )
            .value =
                saved.extinguisher === null
                    ? ""
                    : String(
                        saved.extinguisher
                    );


        root
            .querySelector(
                "#emergencyFlare"
            )
            .value =
                saved.flare === null
                    ? ""
                    : String(
                        saved.flare
                    );


        root
            .querySelector(
                "#emergencyOxygen"
            )
            .value =
                saved.oxygen === null
                    ? ""
                    : String(
                        saved.oxygen
                    );


        /* ==================================================
           共通UI
        ================================================== */

        commonUi =
            PuzzleCommon.create({

                number: "02",

                title: "118",

                description:
                    "装備数と共通計器から、"
                    + "使用するテーブルと選択すべき周波数を"
                    + "自動判定します。",

                showGauges: true,

                onGaugeChanged:
                    () => {

                        refresh();

                    }

            });


        const page =
            root.querySelector(
                ".emergency-page"
            );


        page.insertBefore(
            commonUi,
            page.firstChild
        );


        bindEvents();

        refresh();
    }


    /* ======================================================
       mount
    ====================================================== */

    function mount(element) {

        root =
            element;


        render();
    }


    /* ======================================================
       unmount
    ====================================================== */

    function unmount() {

        if (
            commonUi
            && typeof commonUi.destroy
                === "function"
        ) {

            commonUi.destroy();
        }


        commonUi = null;

        root = null;
    }


    /* ======================================================
       外部から計器変更
    ====================================================== */

    function onGaugeChanged() {

        refresh();
    }


    return {
        mount,
        unmount,
        onGaugeChanged
    };

})();