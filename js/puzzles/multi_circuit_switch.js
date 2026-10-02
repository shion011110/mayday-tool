"use strict";

const MultiCircuitSwitchPuzzle = (() => {

    const PUZZLE_ID = "multi_circuit_switch";

    let root = null;
    let commonUi = null;

    let selectedColor = null;
    let ledSequence = [];


    /* =========================================================
       フェーズ1
    ========================================================= */

    const SWITCH_TABLE = {

        yellow: [
            "上", "下", "左", "上",
            "右", "下", "左", "右",
        ],

        red: [
            "下", "右", "上", "左",
            "下", "上", "右", "左",
        ],

        green: [
            "左", "上", "右", "下",
            "上", "左", "下", "右",
        ],

        blue: [
            "右", "左", "下", "右",
            "左", "上", "上", "下",
        ],
    };


    const COLOR_NAMES = {
        yellow: "黄",
        red: "赤",
        green: "緑",
        blue: "青",
    };


    /* =========================================================
       フェーズ2
    ========================================================= */

    const LED_TABLE = {

        "1-2-3-4": "ABCD",
        "1-2-4-3": "ACBE",

        "1-3-2-4": "BADC",
        "1-3-4-2": "BDAF",

        "1-4-2-3": "CAEB",
        "1-4-3-2": "CEAD",

        "2-1-3-4": "DBFA",
        "2-1-4-3": "DFBC",

        "2-3-1-4": "EACF",
        "2-3-4-1": "ECFA",

        "2-4-1-3": "FBDC",
        "2-4-3-1": "FDBE",

        "3-1-2-4": "ADEF",
        "3-1-4-2": "BCFD",

        "3-2-1-4": "CBAE",
        "3-2-4-1": "DAFB",

        "3-4-1-2": "EFCA",
        "3-4-2-1": "FEDB",

        "4-1-2-3": "AEBC",
        "4-1-3-2": "BFCD",

        "4-2-1-3": "CDEA",
        "4-2-3-1": "DCBF",

        "4-3-1-2": "EBFC",
        "4-3-2-1": "FADE",
    };


    /* =========================================================
       フェーズ3

       現在はUI非表示。
       Windows版と同じくデータだけ保持。
    ========================================================= */

    const KEYPAD_TABLE = [

        ["1234", "4321"],
        ["1357", "7531"],
        ["2468", "8642"],

        ["2847", "4782"],
        ["3159", "9513"],
        ["3698", "8963"],

        ["4126", "6214"],
        ["4789", "9874"],
        ["5283", "3825"],

        ["5917", "7195"],
        ["6542", "2456"],
        ["7361", "1637"],
    ];


    /* =========================================================
       保存データ読み込み
    ========================================================= */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            ) || {};


        /* -----------------------------------------------------
           フェーズ1
        ----------------------------------------------------- */

        if (
            saved.selected_color
            && SWITCH_TABLE[
                saved.selected_color
            ]
        ) {

            selectedColor =
                saved.selected_color;

        } else {

            selectedColor =
                null;
        }


        /* -----------------------------------------------------
           フェーズ2
        ----------------------------------------------------- */

        ledSequence = [];


        if (
            Array.isArray(
                saved.led_sequence
            )
        ) {

            for (
                const rawValue
                of saved.led_sequence
            ) {

                const number =
                    Number(
                        rawValue
                    );


                if (
                    [1, 2, 3, 4].includes(
                        number
                    )
                    && !ledSequence.includes(
                        number
                    )
                ) {

                    ledSequence.push(
                        number
                    );
                }


                if (
                    ledSequence.length >= 4
                ) {
                    break;
                }
            }
        }
    }


    /* =========================================================
       保存
    ========================================================= */

    function saveProgress() {

        const data = {

            selected_color:
                selectedColor,

            led_sequence:
                [...ledSequence],
        };


        /*
         * 現在のPWA Storeは
         * setPuzzleData() を使用
         */

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            data
        );
    }


    /* =========================================================
       フェーズ1
    ========================================================= */

    function selectColor(color) {

        if (
            !SWITCH_TABLE[color]
        ) {
            return;
        }


        selectedColor =
            color;


        saveProgress();

        refreshPhase1();

        updateCompleteButton();
    }


    function refreshPhase1() {

        if (!root) {
            return;
        }


        /* -----------------------------------------------------
           色ボタン
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".multi-color-button"
            )
            .forEach(button => {

                const color =
                    button.dataset.color;


                button.classList.toggle(
                    "selected",
                    color === selectedColor
                );
            });


        /* -----------------------------------------------------
           選択色
        ----------------------------------------------------- */

        const selectedLabel =
            root.querySelector(
                "#multiSelectedColor"
            );


        const switchLabels =
            root.querySelectorAll(
                ".multi-switch-value"
            );


        if (
            selectedColor === null
        ) {

            selectedLabel.textContent =
                "色を選択してください";


            switchLabels.forEach(
                label => {

                    label.textContent =
                        "－";
                }
            );


            return;
        }


        selectedLabel.textContent =
            `選択色：${COLOR_NAMES[selectedColor]}`;


        const values =
            SWITCH_TABLE[
                selectedColor
            ];


        switchLabels.forEach(
            (label, index) => {

                label.textContent =
                    values[index];
            }
        );
    }


    /* =========================================================
       フェーズ2
    ========================================================= */

    function toggleLedNumber(number) {

        if (
            ![1, 2, 3, 4].includes(
                number
            )
        ) {
            return;
        }


        /* -----------------------------------------------------
           すでにON

           そのLEDと、そのLED以降を全部OFF
        ----------------------------------------------------- */

        if (
            ledSequence.includes(
                number
            )
        ) {

            const index =
                ledSequence.indexOf(
                    number
                );


            ledSequence =
                ledSequence.slice(
                    0,
                    index
                );


            saveProgress();

            refreshPhase2();

            updateCompleteButton();

            return;
        }


        /* -----------------------------------------------------
           4個入力済み
        ----------------------------------------------------- */

        if (
            ledSequence.length >= 4
        ) {
            return;
        }


        /* -----------------------------------------------------
           新しく追加
        ----------------------------------------------------- */

        ledSequence.push(
            number
        );


        saveProgress();

        refreshPhase2();

        updateCompleteButton();
    }


    /* =========================================================
       LEDリセット
    ========================================================= */

    function resetLedSequence() {

        ledSequence =
            [];


        saveProgress();

        refreshPhase2();

        updateCompleteButton();
    }


    /* =========================================================
       LED回答
    ========================================================= */

    function getLedAnswer() {

        if (
            ledSequence.length !== 4
        ) {
            return "----";
        }


        const key =
            ledSequence.join(
                "-"
            );


        return (
            LED_TABLE[key]
            || "----"
        );
    }


    /* =========================================================
       フェーズ2表示
    ========================================================= */

    function refreshPhase2() {

        if (!root) {
            return;
        }


        /* -----------------------------------------------------
           入力順
        ----------------------------------------------------- */

        const display =
            [];


        for (
            let index = 0;
            index < 4;
            index += 1
        ) {

            if (
                index
                < ledSequence.length
            ) {

                display.push(
                    String(
                        ledSequence[index]
                    )
                );

            } else {

                display.push(
                    "－"
                );
            }
        }


        root.querySelector(
            "#multiLedSequence"
        ).textContent =
            display.join(
                " → "
            );


        /* -----------------------------------------------------
           LEDボタン
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".multi-led-button"
            )
            .forEach(button => {

                const number =
                    Number(
                        button.dataset.number
                    );


                const selected =
                    ledSequence.includes(
                        number
                    );


                button.classList.toggle(
                    "selected",
                    selected
                );


                /*
                 * 選択済みLEDは
                 * 4個完成後も押せる。
                 *
                 * Windows版と同じく
                 * 押した場所以降を消せる。
                 */

                if (selected) {

                    button.disabled =
                        false;

                    return;
                }


                button.disabled =
                    ledSequence.length >= 4;
            });


        /* -----------------------------------------------------
           回答
        ----------------------------------------------------- */

        root.querySelector(
            "#multiLedAnswer"
        ).textContent =
            getLedAnswer();
    }


    /* =========================================================
       CLEAR可能
    ========================================================= */

    function isReadyToComplete() {

        const phase1Ready =
            selectedColor !== null
            && Boolean(
                SWITCH_TABLE[
                    selectedColor
                ]
            );


        let phase2Ready =
            false;


        if (
            ledSequence.length === 4
        ) {

            const key =
                ledSequence.join(
                    "-"
                );


            phase2Ready =
                Boolean(
                    LED_TABLE[key]
                );
        }


        /*
         * Windows最新版と同じ。
         *
         * フェーズ3は
         * CLEAR条件に含めない。
         */

        return (
            phase1Ready
            && phase2Ready
        );
    }


    /* =========================================================
       CLEARボタン
    ========================================================= */

    function updateCompleteButton() {

        if (!root) {
            return;
        }


        const button =
            root.querySelector(
                "#multiComplete"
            );


        if (!button) {
            return;
        }


        button.disabled =
            !isReadyToComplete();
    }


    /* =========================================================
       全体リセット
    ========================================================= */

    function resetAll() {

        const confirmed =
            window.confirm(
                "マルチ回路スイッチングパネルの入力内容とクリア状態をリセットしますか？"
            );


        if (!confirmed) {
            return;
        }


        selectedColor =
            null;


        ledSequence =
            [];


        /*
         * Storeに空状態を保存
         */

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                selected_color: null,
                led_sequence: [],
            }
        );


        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            false
        );


        refreshPhase1();

        refreshPhase2();

        updateCompleteButton();
    }


    /* =========================================================
       CLEAR

       PWA共通仕様
       保存 → CLEAR → HOME
    ========================================================= */

    function completePuzzle() {

        if (
            !isReadyToComplete()
        ) {

            window.alert(
                "フェーズ1の色とフェーズ2のLEDシーケンスを入力してください。"
            );

            return;
        }


        saveProgress();


        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );


        closePuzzle();
    }


    /* =========================================================
       mount
    ========================================================= */

    function mount(target) {

        root =
            target;


        loadProgress();


        /* -----------------------------------------------------
           共通UI

           08は共通計器なし
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "08",

                title:
                    "マルチ回路スイッチングパネル",

                description:
                    "フェーズ1でスイッチの色を選択し、フェーズ2でLEDの点灯順を入力して対応する答えを確認します。",

                showGauges:
                    false,
            });


        root.innerHTML =
            "";


        root.appendChild(
            commonUi
        );


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "multi-circuit-content";


        content.innerHTML = `

            <!-- ============================================
                 フェーズ3重要情報

                 概要とは別。
                 常時表示。
            ============================================= -->

            <div
                class="multi-phase3-notice"
            >
                フェーズ3は
                [<strong>2847</strong>]の場合
                [<strong>4782</strong>]<br>
                それ以外は逆順
            </div>


            <!-- ============================================
                 フェーズ1
            ============================================= -->

            <section
                class="multi-phase-panel"
            >

                <h3>
                    フェーズ1 ― スイッチ設定
                </h3>


                <div
                    class="multi-color-grid"
                >

                    <button
                        type="button"
                        class="multi-color-button yellow"
                        data-color="yellow"
                    >
                        黄
                    </button>


                    <button
                        type="button"
                        class="multi-color-button red"
                        data-color="red"
                    >
                        赤
                    </button>


                    <button
                        type="button"
                        class="multi-color-button green"
                        data-color="green"
                    >
                        緑
                    </button>


                    <button
                        type="button"
                        class="multi-color-button blue"
                        data-color="blue"
                    >
                        青
                    </button>

                </div>


                <div
                    id="multiSelectedColor"
                    class="multi-selected-color"
                >
                    色を選択してください
                </div>


                <div
                    class="multi-switch-grid"
                >

                    <div class="multi-switch-cell">
                        <span>スイッチ 1</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 2</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 3</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 4</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 5</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 6</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 7</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                    <div class="multi-switch-cell">
                        <span>スイッチ 8</span>
                        <strong class="multi-switch-value">－</strong>
                    </div>

                </div>

            </section>


            <!-- ============================================
                 フェーズ2
            ============================================= -->

            <section
                class="multi-phase-panel"
            >

                <h3>
                    フェーズ2 ― LEDシーケンス + 文字
                </h3>


                <div
                    class="multi-led-grid"
                >

                    <button
                        type="button"
                        class="multi-led-button"
                        data-number="1"
                    >
                        1
                    </button>

                    <button
                        type="button"
                        class="multi-led-button"
                        data-number="2"
                    >
                        2
                    </button>

                    <button
                        type="button"
                        class="multi-led-button"
                        data-number="3"
                    >
                        3
                    </button>

                    <button
                        type="button"
                        class="multi-led-button"
                        data-number="4"
                    >
                        4
                    </button>

                </div>


                <div
                    id="multiLedSequence"
                    class="multi-led-sequence"
                >
                    － → － → － → －
                </div>


                <div
                    class="multi-answer-caption"
                >
                    入力する4文字
                </div>


                <div
                    id="multiLedAnswer"
                    class="multi-led-answer"
                >
                    ----
                </div>


                <button
                    type="button"
                    id="multiLedReset"
                    class="multi-led-reset"
                >
                    LED入力をやり直す
                </button>

            </section>


            <!-- ============================================
                 操作
            ============================================= -->

            <div
                class="multi-actions"
            >

                <button
                    type="button"
                    id="multiReset"
                    class="multi-reset"
                >
                    最初からやり直す
                </button>


                <button
                    type="button"
                    id="multiComplete"
                    class="multi-complete"
                    disabled
                >
                    ゲームクリアを登録
                </button>

            </div>

        `;


        root.appendChild(
            content
        );


        /* -----------------------------------------------------
           色
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".multi-color-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectColor(
                            button.dataset.color
                        );
                    }
                );
            });


        /* -----------------------------------------------------
           LED
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".multi-led-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleLedNumber(
                            Number(
                                button.dataset.number
                            )
                        );
                    }
                );
            });


        /* -----------------------------------------------------
           LED reset
        ----------------------------------------------------- */

        root.querySelector(
            "#multiLedReset"
        ).addEventListener(
            "click",
            resetLedSequence
        );


        /* -----------------------------------------------------
           全体reset
        ----------------------------------------------------- */

        root.querySelector(
            "#multiReset"
        ).addEventListener(
            "click",
            resetAll
        );


        /* -----------------------------------------------------
           CLEAR
        ----------------------------------------------------- */

        root.querySelector(
            "#multiComplete"
        ).addEventListener(
            "click",
            completePuzzle
        );


        refreshPhase1();

        refreshPhase2();

        updateCompleteButton();
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


        commonUi =
            null;

        root =
            null;
    }


    return {
        mount,
        unmount
    };

})();