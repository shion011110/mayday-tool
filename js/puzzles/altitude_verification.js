"use strict";


const AltitudeVerificationPuzzle = (() => {

    const PUZZLE_ID =
        "altitude_verification";

    let root = null;
    let commonUi = null;


    /* =========================================================
       フェーズ1
    ========================================================= */

    const PHASE1_TABLES = {

        A: {
            condition:
                "Fuel > 20 かつ Altimeter < 5000",

            words: [
                ["ブレーキ", "BRAKE"],
                ["クライム", "CLIMB"],
                ["スピード", "SPEED"],
                ["フォース", "FORCE"],
                ["パワー", "POWER"],
                ["ウィングス", "WINGS"],
            ],
        },

        B: {
            condition:
                "Fuel ≤ 20 または Airspeed > 150",

            words: [
                ["フラップス", "FLAPS"],
                ["ドリフト", "DRIFT"],
                ["ストール", "STALL"],
                ["ピッチ", "PITCH"],
                ["レディオ", "RADIO"],
                ["タワー", "TOWER"],
            ],
        },

        C: {
            condition:
                "Tachometer > 2500",

            words: [
                ["ブースト", "BOOST"],
                ["ローター", "ROTOR"],
                ["モーター", "MOTOR"],
                ["ベイパー", "VAPOR"],
                ["カーゴ", "CARGO"],
                ["パネル", "PANEL"],
            ],
        },

        D: {
            condition:
                "Oil Pressure < 40",

            words: [
                ["チェック", "CHECK"],
                ["リセット", "RESET"],
                ["アラート", "ALERT"],
                ["フォルト", "FAULT"],
                ["エラー", "ERROR"],
                ["アボート", "ABORT"],
            ],
        },

        E: {
            condition:
                "上記のいずれにも該当しない",

            words: [
                ["コースト", "COAST"],
                ["グライド", "GLIDE"],
                ["ホバー", "HOVER"],
                ["レベル", "LEVEL"],
                ["オービット", "ORBIT"],
                ["フロート", "FLOAT"],
            ],
        },
    };


    /* =========================================================
       フェーズ2
    ========================================================= */

    const PHASE2_TABLES = {

        A: {
            condition:
                "Altimeter > 8000",

            numbers: [
                "29920",
                "30120",
                "30450",
                "29780",
                "30010",
                "29850",
            ],
        },

        B: {
            condition:
                "Airspeed > 130",

            numbers: [
                "28950",
                "29430",
                "29670",
                "28820",
                "29150",
                "28760",
            ],
        },

        C: {
            condition:
                "Fuel < 15",

            numbers: [
                "27890",
                "28230",
                "27560",
                "28010",
                "27920",
                "27650",
            ],
        },

        D: {
            condition:
                "Temperature > 250",

            numbers: [
                "30870",
                "31020",
                "30560",
                "31150",
                "30920",
                "31080",
            ],
        },

        E: {
            condition:
                "上記のいずれにも該当しない",

            numbers: [
                "29450",
                "29580",
                "29720",
                "29340",
                "29810",
                "29670",
            ],
        },
    };


    /* =========================================================
       計器取得

       ★重要
       store.js の実際のIDを使用する

       fuel
       oil_pressure
       airspeed
       altimeter
       tachometer
       temperature
       ammeter
    ========================================================= */

    function gauge(id) {

        const value =
            MaydayStore.getGauge(id);


        if (
            value === null
            || value === undefined
            || value === ""
        ) {

            return null;
        }


        const number =
            Number(value);


        return Number.isFinite(number)
            ? number
            : null;
    }


    /* =========================================================
       フェーズ1判定

       A → B → C → D → E
    ========================================================= */

    function determinePhase1() {

        /* -----------------------------------------------------
           Fuel
        ----------------------------------------------------- */

        const fuel =
            gauge("fuel");


        if (fuel === null) {

            return {
                table: null,
                reason:
                    "Fuel を入力してください。"
            };
        }


        /* -----------------------------------------------------
           A
           Fuel > 20
           かつ
           Altimeter < 5000
        ----------------------------------------------------- */

        if (fuel > 20) {

            const altimeter =
                gauge("altimeter");


            if (altimeter === null) {

                return {
                    table: null,
                    reason:
                        "Altimeter を入力してください。"
                };
            }


            if (altimeter < 5000) {

                return {
                    table: "A",
                    reason:
                        "Fuel > 20 かつ Altimeter < 5000"
                };
            }
        }


        /* -----------------------------------------------------
           B
           Fuel ≤ 20
           または
           Airspeed > 150
        ----------------------------------------------------- */

        if (fuel <= 20) {

            return {
                table: "B",
                reason:
                    "Fuel ≤ 20"
            };
        }


        const airspeed =
            gauge("airspeed");


        if (airspeed === null) {

            return {
                table: null,
                reason:
                    "Airspeed を入力してください。"
            };
        }


        if (airspeed > 150) {

            return {
                table: "B",
                reason:
                    "Airspeed > 150"
            };
        }


        /* -----------------------------------------------------
           C
           Tachometer > 2500
        ----------------------------------------------------- */

        const tachometer =
            gauge("tachometer");


        if (tachometer === null) {

            return {
                table: null,
                reason:
                    "Tachometer を入力してください。"
            };
        }


        if (tachometer > 2500) {

            return {
                table: "C",
                reason:
                    "Tachometer > 2500"
            };
        }


        /* -----------------------------------------------------
           D
           Oil Pressure < 40
        ----------------------------------------------------- */

        const oilPressure =
            gauge("oil_pressure");


        if (oilPressure === null) {

            return {
                table: null,
                reason:
                    "Oil Pressure を入力してください。"
            };
        }


        if (oilPressure < 40) {

            return {
                table: "D",
                reason:
                    "Oil Pressure < 40"
            };
        }


        /* -----------------------------------------------------
           E
        ----------------------------------------------------- */

        return {
            table: "E",
            reason:
                "A～Dのいずれにも該当しない"
        };
    }


    /* =========================================================
       フェーズ2判定

       A → B → C → D → E
    ========================================================= */

    function determinePhase2() {

        /* -----------------------------------------------------
           A
           Altimeter > 8000
        ----------------------------------------------------- */

        const altimeter =
            gauge("altimeter");


        if (altimeter === null) {

            return {
                table: null,
                reason:
                    "Altimeter を入力してください。"
            };
        }


        if (altimeter > 8000) {

            return {
                table: "A",
                reason:
                    "Altimeter > 8000"
            };
        }


        /* -----------------------------------------------------
           B
           Airspeed > 130
        ----------------------------------------------------- */

        const airspeed =
            gauge("airspeed");


        if (airspeed === null) {

            return {
                table: null,
                reason:
                    "Airspeed を入力してください。"
            };
        }


        if (airspeed > 130) {

            return {
                table: "B",
                reason:
                    "Airspeed > 130"
            };
        }


        /* -----------------------------------------------------
           C
           Fuel < 15
        ----------------------------------------------------- */

        const fuel =
            gauge("fuel");


        if (fuel === null) {

            return {
                table: null,
                reason:
                    "Fuel を入力してください。"
            };
        }


        if (fuel < 15) {

            return {
                table: "C",
                reason:
                    "Fuel < 15"
            };
        }


        /* -----------------------------------------------------
           D
           Temperature > 250
        ----------------------------------------------------- */

        const temperature =
            gauge("temperature");


        if (temperature === null) {

            return {
                table: null,
                reason:
                    "Temperature を入力してください。"
            };
        }


        if (temperature > 250) {

            return {
                table: "D",
                reason:
                    "Temperature > 250"
            };
        }


        /* -----------------------------------------------------
           E
        ----------------------------------------------------- */

        return {
            table: "E",
            reason:
                "A～Dのいずれにも該当しない"
        };
    }


    /* =========================================================
       フェーズ1表示
    ========================================================= */

    function refreshPhase1() {

        const result =
            determinePhase1();


        const tableLabel =
            root.querySelector(
                "#altitudePhase1Table"
            );


        const reasonLabel =
            root.querySelector(
                "#altitudePhase1Reason"
            );


        const list =
            root.querySelector(
                "#altitudePhase1Words"
            );


        list.innerHTML = "";


        /* -----------------------------------------------------
           判定待ち
        ----------------------------------------------------- */

        if (!result.table) {

            tableLabel.textContent =
                "判定待ち";


            tableLabel.classList.remove(
                "ready"
            );


            reasonLabel.textContent =
                result.reason;


            for (
                let i = 0;
                i < 6;
                i += 1
            ) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "altitude-word-row";


                row.innerHTML = `
                    <span>－</span>
                    <strong>-----</strong>
                `;


                list.appendChild(row);
            }


            return false;
        }


        /* -----------------------------------------------------
           判定完了
        ----------------------------------------------------- */

        tableLabel.textContent =
            `使用テーブル：${result.table}`;


        tableLabel.classList.add(
            "ready"
        );


        reasonLabel.textContent =
            `判定条件：${result.reason}`;


        const table =
            PHASE1_TABLES[
                result.table
            ];


        table.words.forEach(
            ([kana, english]) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "altitude-word-row";


                row.innerHTML = `
                    <span>${kana}</span>
                    <strong>${english}</strong>
                `;


                list.appendChild(row);
            }
        );


        return true;
    }


    /* =========================================================
       フェーズ2表示
    ========================================================= */

    function refreshPhase2() {

        const result =
            determinePhase2();


        const tableLabel =
            root.querySelector(
                "#altitudePhase2Table"
            );


        const reasonLabel =
            root.querySelector(
                "#altitudePhase2Reason"
            );


        const list =
            root.querySelector(
                "#altitudePhase2Numbers"
            );


        list.innerHTML = "";


        /* -----------------------------------------------------
           判定待ち
        ----------------------------------------------------- */

        if (!result.table) {

            tableLabel.textContent =
                "判定待ち";


            tableLabel.classList.remove(
                "ready"
            );


            reasonLabel.textContent =
                result.reason;


            for (
                let i = 0;
                i < 6;
                i += 1
            ) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "altitude-number";


                item.textContent =
                    "-----";


                list.appendChild(item);
            }


            return false;
        }


        /* -----------------------------------------------------
           判定完了
        ----------------------------------------------------- */

        tableLabel.textContent =
            `使用テーブル：${result.table}`;


        tableLabel.classList.add(
            "ready"
        );


        reasonLabel.textContent =
            `判定条件：${result.reason}`;


        const table =
            PHASE2_TABLES[
                result.table
            ];


        table.numbers.forEach(
            number => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "altitude-number";


                item.textContent =
                    number;


                list.appendChild(item);
            }
        );


        return true;
    }


    /* =========================================================
       全体更新
    ========================================================= */

    function refresh() {

        if (!root) {

            return;
        }


        const phase1Ready =
            refreshPhase1();


        const phase2Ready =
            refreshPhase2();


        const completeButton =
            root.querySelector(
                "#altitudeComplete"
            );


        if (completeButton) {

            completeButton.disabled =
                !(
                    phase1Ready
                    && phase2Ready
                );
        }
    }


    /* =========================================================
       ゲームクリア

       PWA共通仕様:
       保存 → ホームへ戻る
    ========================================================= */

    function completePuzzle() {

        const phase1 =
            determinePhase1();


        const phase2 =
            determinePhase2();


        if (
            !phase1.table
            || !phase2.table
        ) {

            return;
        }


        /* -----------------------------------------------------
           使用テーブル保存
        ----------------------------------------------------- */

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                phase1_table:
                    phase1.table,

                phase2_table:
                    phase2.table
            }
        );


        /* -----------------------------------------------------
           CLEAR保存
        ----------------------------------------------------- */

        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );


        /* -----------------------------------------------------
           ホームへ戻る
        ----------------------------------------------------- */

        closePuzzle();
    }


    /* =========================================================
       mount
    ========================================================= */

    function mount(target) {

        root = target;


        /* -----------------------------------------------------
           共通UI
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "04",

                title:
                    "高度検証モジュール",

                description:
                    "共通計器からフェーズ1の単語テーブルとフェーズ2の数字テーブルを自動判定します。",

                showGauges:
                    true,

                onGaugeChanged:
                    () => {

                        refresh();
                    }
            });


        root.innerHTML = "";


        root.appendChild(
            commonUi
        );


        /* -----------------------------------------------------
           パズル本体
        ----------------------------------------------------- */

        const content =
            document.createElement(
                "div"
            );


        content.className =
            "altitude-content";


        content.innerHTML = `

            <div class="altitude-phases">

                <!-- =========================================
                     フェーズ1
                ========================================== -->

                <section class="altitude-phase">

                    <div class="altitude-phase-heading">
                        フェーズ1
                    </div>


                    <div
                        id="altitudePhase1Table"
                        class="altitude-table-name"
                    >
                        判定待ち
                    </div>


                    <div
                        id="altitudePhase1Reason"
                        class="altitude-reason"
                    ></div>


                    <div class="altitude-subtitle">
                        5文字の単語
                    </div>


                    <div
                        id="altitudePhase1Words"
                        class="altitude-word-list"
                    ></div>

                </section>


                <!-- =========================================
                     フェーズ2
                ========================================== -->

                <section class="altitude-phase">

                    <div class="altitude-phase-heading">
                        フェーズ2
                    </div>


                    <div
                        id="altitudePhase2Table"
                        class="altitude-table-name"
                    >
                        判定待ち
                    </div>


                    <div
                        id="altitudePhase2Reason"
                        class="altitude-reason"
                    ></div>


                    <div class="altitude-subtitle">
                        5桁の数字
                    </div>


                    <div
                        id="altitudePhase2Numbers"
                        class="altitude-number-list"
                    ></div>

                </section>

            </div>


            <button
                type="button"
                id="altitudeComplete"
                class="button altitude-complete"
                disabled
            >
                ゲームクリアを登録
            </button>

        `;


        root.appendChild(
            content
        );


        /* -----------------------------------------------------
           クリアボタン
        ----------------------------------------------------- */

        root
            .querySelector(
                "#altitudeComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        /* -----------------------------------------------------
           開いた瞬間に判定

           ホームで既に入力済みの場合も
           ここで即座に反映される
        ----------------------------------------------------- */

        refresh();
    }


    /* =========================================================
       unmount
    ========================================================= */

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


    /* =========================================================
       公開
    ========================================================= */

    return {
        mount,
        unmount
    };

})();