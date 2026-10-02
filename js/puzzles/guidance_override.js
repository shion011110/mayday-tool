"use strict";

const GuidanceOverridePuzzle = (() => {

    const PUZZLE_ID = "guidance_override";

    let root = null;
    let commonUi = null;

    let redLamps = null;
    let upperSwitches = [];
    let greenLamps = null;

    let directionAudio = null;


    /* =========================================================
       フェーズ1
    ========================================================= */

    const PHASE1_TABLES = {

        A: {
            1: { "上":"下", "下":"上", "左":"右", "右":"左" },
            2: { "上":"右", "下":"左", "左":"上", "右":"下" },
            3: { "上":"左", "下":"右", "左":"下", "右":"上" },
            4: { "上":"上", "下":"下", "左":"左", "右":"右" },
            5: { "上":"下", "下":"上", "左":"右", "右":"左" },
            6: { "上":"右", "下":"左", "左":"上", "右":"下" },
        },

        B: {
            1: { "上":"左", "下":"右", "左":"下", "右":"上" },
            2: { "上":"上", "下":"下", "左":"左", "右":"右" },
            3: { "上":"下", "下":"上", "左":"右", "右":"左" },
            4: { "上":"右", "下":"左", "左":"上", "右":"下" },
            5: { "上":"左", "下":"右", "左":"下", "右":"上" },
            6: { "上":"上", "下":"下", "左":"左", "右":"右" },
        },

        C: {
            1: { "上":"右", "下":"左", "左":"上", "右":"下" },
            2: { "上":"下", "下":"上", "左":"右", "右":"左" },
            3: { "上":"上", "下":"下", "左":"左", "右":"右" },
            4: { "上":"左", "下":"右", "左":"下", "右":"上" },
            5: { "上":"右", "下":"左", "左":"上", "右":"下" },
            6: { "上":"下", "下":"上", "左":"右", "右":"左" },
        },
    };


    const DIRECTION_ARROWS = {
        "上": "▲",
        "下": "▼",
        "左": "◀",
        "右": "▶",
    };


    /* =========================================================
       記号読み
    ========================================================= */

    const SYMBOL_NAMES = {

        "1": "ワン",
        "@": "アットマーク",
        "}": "右波括弧",

        "#": "シャープ",
        "$": "ドル",
        "[": "左角括弧",

        "%": "パーセント",
        "^": "キャレット",
        "]": "右角括弧",

        "2": "ツー",
        "&": "アンパサンド",
        "(": "左丸括弧",

        "*": "アスタリスク",
        "!": "エクスクラメーションマーク",
        "{": "左波括弧",

        ")": "右丸括弧",
        "-": "ハイフン",
        "|": "縦線",

        "3": "スリー",
        "=": "イコール",
        ":": "コロン",

        "+": "プラス",
        "_": "アンダースコア",
        ";": "セミコロン",

        "4": "フォー",
        '"': "ダブルクォーテーション",
        "<": "小なり",
    };


    /* =========================================================
       共通計器取得

       PWA版のIDへ変換
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

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }


    /* =========================================================
       保存データ
    ========================================================= */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(PUZZLE_ID)
            || {};


        /* 赤ランプ */

        const red =
            Number(saved.red_lamps);

        redLamps =
            [0, 1, 2].includes(red)
                ? red
                : null;


        /* 上段 */

        upperSwitches = [];

        if (
            Array.isArray(
                saved.upper_switches
            )
        ) {

            for (
                const direction
                of saved.upper_switches
            ) {

                if (
                    ["上", "下", "左", "右"]
                        .includes(direction)
                ) {

                    upperSwitches.push(
                        direction
                    );
                }

                if (
                    upperSwitches.length >= 6
                ) {
                    break;
                }
            }
        }


        /* 緑ランプ */

        const green =
            Number(saved.green_lamps);

        greenLamps =
            Number.isInteger(green)
            && green >= 0
            && green <= 6
                ? green
                : null;
    }


    function saveProgress() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                red_lamps:
                    redLamps,

                upper_switches:
                    [...upperSwitches],

                green_lamps:
                    greenLamps,
            }
        );
    }


    /* =========================================================
       SE
    ========================================================= */

    function playDirectionSound() {

        if (!directionAudio) {
            return;
        }

        try {

            directionAudio.pause();

            directionAudio.currentTime = 0;

            const promise =
                directionAudio.play();

            if (
                promise
                && typeof promise.catch
                    === "function"
            ) {
                promise.catch(() => {});
            }

        } catch (_) {
            // 音声が使えなくてもパズル操作は継続
        }
    }


    /* =========================================================
       テーブル名
    ========================================================= */

    function getTableName() {

        if (redLamps === null) {
            return null;
        }

        if (redLamps === 2) {
            return "A";
        }

        if (redLamps === 1) {
            return "B";
        }

        return "C";
    }


    /* =========================================================
       赤ランプ
    ========================================================= */

    function selectRedLamps(value) {

        if (
            ![0, 1, 2].includes(value)
        ) {
            return;
        }

        redLamps = value;

        saveProgress();
        refreshAll();
    }


    /* =========================================================
       上段方向
    ========================================================= */

    function addUpperDirection(direction) {

        if (redLamps === null) {
            return;
        }

        if (
            !["上", "下", "左", "右"]
                .includes(direction)
        ) {
            return;
        }

        if (
            upperSwitches.length >= 6
        ) {
            return;
        }

        playDirectionSound();

        upperSwitches.push(
            direction
        );

        saveProgress();
        refreshAll();
    }


    function undoUpperDirection() {

        if (
            upperSwitches.length === 0
        ) {
            return;
        }

        upperSwitches.pop();

        saveProgress();
        refreshAll();
    }


    function clearUpperInput() {

        if (
            upperSwitches.length === 0
        ) {
            return;
        }

        upperSwitches = [];

        saveProgress();
        refreshAll();
    }


    /* =========================================================
       下段計算

       ★重要
       配置位置ではなく、
       同じ方向が左から何回目に出たかを数える
    ========================================================= */

    function calculateLowerSwitches() {

        const tableName =
            getTableName();

        if (!tableName) {
            return [];
        }

        const table =
            PHASE1_TABLES[tableName];

        const counts = {
            "上": 0,
            "下": 0,
            "左": 0,
            "右": 0,
        };

        const result = [];

        for (
            const direction
            of upperSwitches
        ) {

            counts[direction] += 1;

            const occurrence =
                counts[direction];

            result.push(
                table[occurrence][direction]
            );
        }

        return result;
    }


    /* =========================================================
       フェーズ1表示
    ========================================================= */

    function refreshPhase1() {

        if (!root) {
            return;
        }


        /* 赤 */

        root
            .querySelectorAll(
                ".guidance-red-button"
            )
            .forEach(button => {

                button.classList.toggle(
                    "selected",
                    Number(
                        button.dataset.value
                    ) === redLamps
                );
            });


        /* テーブル */

        const tableName =
            getTableName();

        root.querySelector(
            "#guidanceTable"
        ).textContent =
            tableName
                ? `使用テーブル：テーブル ${tableName}`
                : "使用テーブル：－";


        /* 現在位置 */

        const position =
            root.querySelector(
                "#guidanceCurrentPosition"
            );

        if (redLamps === null) {

            position.textContent =
                "先に赤ランプの数を選択してください";

        } else if (
            upperSwitches.length === 6
        ) {

            position.textContent =
                "上段6個の入力完了";

        } else {

            position.textContent =
                `上段 ${upperSwitches.length + 1}個目 の方向を入力`;
        }


        /* 方向パッド */

        const canInput =
            redLamps !== null
            && upperSwitches.length < 6;

        root
            .querySelectorAll(
                ".guidance-direction-button"
            )
            .forEach(button => {

                button.disabled =
                    !canInput;
            });


        /* 戻す */

        root.querySelector(
            "#guidanceUndo"
        ).disabled =
            upperSwitches.length === 0;

        root.querySelector(
            "#guidanceClearUpper"
        ).disabled =
            upperSwitches.length === 0;


        /* 上段 */

        const upperLabels =
            root.querySelectorAll(
                ".guidance-upper-value"
            );

        upperLabels.forEach(
            (label, index) => {

                if (
                    index
                    < upperSwitches.length
                ) {

                    label.textContent =
                        DIRECTION_ARROWS[
                            upperSwitches[index]
                        ];

                } else {

                    label.textContent =
                        "－";
                }
            }
        );


        /* 下段 */

        const lower =
            calculateLowerSwitches();

        const lowerLabels =
            root.querySelectorAll(
                ".guidance-lower-value"
            );

        lowerLabels.forEach(
            (label, index) => {

                if (
                    index < lower.length
                ) {

                    label.textContent =
                        DIRECTION_ARROWS[
                            lower[index]
                        ];

                } else {

                    label.textContent =
                        "－";
                }
            }
        );


        /* 完了 */

        const completeLabel =
            root.querySelector(
                "#guidancePhase1Complete"
            );

        const phase2 =
            root.querySelector(
                "#guidancePhase2"
            );

        if (
            upperSwitches.length === 6
        ) {

            completeLabel.textContent =
                "✓ 下段6個のスイッチ位置が確定しました";

            phase2.classList.remove(
                "hidden"
            );

        } else {

            completeLabel.textContent =
                "";

            phase2.classList.add(
                "hidden"
            );
        }
    }


    /* =========================================================
       緑ランプ
    ========================================================= */

    function selectGreenLamps(number) {

        if (
            !Number.isInteger(number)
            || number < 0
            || number > 6
        ) {
            return;
        }

        greenLamps = number;

        saveProgress();
        refreshPhase2();
    }


    /* =========================================================
       使用計器
    ========================================================= */

    function getPhase2GaugeName() {

        if (greenLamps === null) {
            return null;
        }

        if (greenLamps <= 2) {
            return "Temperature";
        }

        if (greenLamps <= 4) {
            return "Fuel";
        }

        return "Tachometer";
    }


    function getPhase2GaugeValue(
        gaugeName
    ) {

        if (
            gaugeName === "Temperature"
        ) {
            return gauge("temperature");
        }

        if (
            gaugeName === "Fuel"
        ) {
            return gauge("fuel");
        }

        if (
            gaugeName === "Tachometer"
        ) {
            return gauge("tachometer");
        }

        return null;
    }


    /* =========================================================
       フェーズ2結果
    ========================================================= */

    function getPhase2Result() {

        const gaugeName =
            getPhase2GaugeName();

        if (!gaugeName) {
            return null;
        }

        const value =
            getPhase2GaugeValue(
                gaugeName
            );

        if (value === null) {

            return {
                gauge:
                    gaugeName,

                condition:
                    `${gaugeName} の値を入力してください`,

                directions:
                    null,

                symbols:
                    null,
            };
        }


        /* =====================================================
           Temperature
        ===================================================== */

        if (
            gaugeName === "Temperature"
        ) {

            if (value <= 200) {

                return {
                    gauge: gaugeName,

                    condition:
                        "Temperature ≤ 200",

                    directions: [
                        ["upper", 2, "左"],
                        ["upper", 5, "下"],
                        ["lower", 1, "右"],
                        ["lower", 4, "上"],
                    ],

                    symbols:
                        ["1", "@", "}"],
                };
            }

            if (value <= 350) {

                return {
                    gauge: gaugeName,

                    condition:
                        "200 < Temperature ≤ 350",

                    directions: [
                        ["upper", 1, "右"],
                        ["upper", 3, "上"],
                        ["lower", 5, "左"],
                        ["lower", 6, "下"],
                    ],

                    symbols:
                        ["#", "$", "["],
                };
            }

            return {
                gauge: gaugeName,

                condition:
                    "Temperature > 350",

                directions: [
                    ["upper", 4, "下"],
                    ["upper", 6, "左"],
                    ["lower", 2, "上"],
                    ["lower", 3, "右"],
                ],

                symbols:
                    ["%", "^", "]"],
            };
        }


        /* =====================================================
           Fuel
        ===================================================== */

        if (
            gaugeName === "Fuel"
        ) {

            if (value <= 10) {

                return {
                    gauge: gaugeName,

                    condition:
                        "Fuel ≤ 10",

                    directions: [
                        ["upper", 3, "上"],
                        ["upper", 5, "右"],
                        ["lower", 1, "下"],
                        ["lower", 4, "左"],
                    ],

                    symbols:
                        ["2", "&", "("],
                };
            }

            if (value <= 20) {

                return {
                    gauge: gaugeName,

                    condition:
                        "10 < Fuel ≤ 20",

                    directions: [
                        ["upper", 1, "左"],
                        ["upper", 4, "下"],
                        ["lower", 2, "右"],
                        ["lower", 6, "上"],
                    ],

                    symbols:
                        ["*", "!", "{"],
                };
            }

            return {
                gauge: gaugeName,

                condition:
                    "Fuel > 20",

                directions: [
                    ["upper", 2, "上"],
                    ["upper", 6, "左"],
                    ["lower", 3, "下"],
                    ["lower", 5, "右"],
                ],

                symbols:
                    [")", "-", "|"],
            };
        }


        /* =====================================================
           Tachometer
        ===================================================== */

        if (
            gaugeName === "Tachometer"
        ) {

            if (value <= 2100) {

                return {
                    gauge: gaugeName,

                    condition:
                        "Tachometer ≤ 2100",

                    directions: [
                        ["upper", 1, "下"],
                        ["upper", 3, "右"],
                        ["lower", 2, "左"],
                        ["lower", 5, "上"],
                    ],

                    symbols:
                        ["3", "=", ":"],
                };
            }

            if (value <= 2400) {

                return {
                    gauge: gaugeName,

                    condition:
                        "2100 < Tachometer ≤ 2400",

                    directions: [
                        ["upper", 2, "右"],
                        ["upper", 4, "左"],
                        ["lower", 1, "上"],
                        ["lower", 6, "下"],
                    ],

                    symbols:
                        ["+", "_", ";"],
                };
            }

            return {
                gauge: gaugeName,

                condition:
                    "Tachometer > 2400",

                directions: [
                    ["upper", 5, "上"],
                    ["upper", 6, "下"],
                    ["lower", 3, "右"],
                    ["lower", 4, "左"],
                ],

                symbols:
                    ["4", '"', "<"],
            };
        }

        return null;
    }


    /* =========================================================
       フェーズ2表示リセット
    ========================================================= */

    function resetPhase2Display() {

        root
            .querySelectorAll(
                ".guidance-phase2-direction"
            )
            .forEach(label => {

                label.textContent = "○";

                label.classList.remove(
                    "active"
                );
            });


        root
            .querySelectorAll(
                ".guidance-symbol-name"
            )
            .forEach(label => {

                label.textContent = "－";
            });


        root
            .querySelectorAll(
                ".guidance-symbol-value"
            )
            .forEach(label => {

                label.textContent = "－";
            });
    }


    /* =========================================================
       フェーズ2表示
    ========================================================= */

    function refreshPhase2() {

        if (!root) {
            return;
        }


        /* 緑ランプ */

        root
            .querySelectorAll(
                ".guidance-green-button"
            )
            .forEach(button => {

                button.classList.toggle(
                    "selected",
                    Number(
                        button.dataset.value
                    ) === greenLamps
                );
            });


        resetPhase2Display();


        const gaugeName =
            getPhase2GaugeName();

        const gaugeLabel =
            root.querySelector(
                "#guidanceGaugeName"
            );

        const conditionLabel =
            root.querySelector(
                "#guidanceCondition"
            );

        const completeButton =
            root.querySelector(
                "#guidanceComplete"
            );


        if (!gaugeName) {

            gaugeLabel.textContent =
                "使用計器：－";

            conditionLabel.textContent =
                "緑ランプの点灯数を選択してください";

            completeButton.disabled =
                true;

            return;
        }


        gaugeLabel.textContent =
            `使用計器：${gaugeName}`;


        const result =
            getPhase2Result();


        if (!result) {

            completeButton.disabled =
                true;

            return;
        }


        conditionLabel.textContent =
            result.condition;


        if (
            !result.directions
            || !result.symbols
        ) {

            completeButton.disabled =
                true;

            return;
        }


        /* 方向 */

        for (
            const [
                row,
                position,
                direction
            ]
            of result.directions
        ) {

            const selector =
                row === "upper"
                    ? `.guidance-phase2-upper[data-position="${position}"]`
                    : `.guidance-phase2-lower[data-position="${position}"]`;

            const label =
                root.querySelector(
                    selector
                );

            if (!label) {
                continue;
            }

            label.textContent =
                DIRECTION_ARROWS[
                    direction
                ];

            label.classList.add(
                "active"
            );
        }


        /* 記号 */

        const names =
            root.querySelectorAll(
                ".guidance-symbol-name"
            );

        const values =
            root.querySelectorAll(
                ".guidance-symbol-value"
            );


        result.symbols.forEach(
            (symbol, index) => {

                names[index].textContent =
                    SYMBOL_NAMES[symbol]
                    || symbol;

                values[index].textContent =
                    symbol;
            }
        );


        completeButton.disabled =
            false;
    }


    /* =========================================================
       全体更新
    ========================================================= */

    function refreshAll() {

        refreshPhase1();
        refreshPhase2();
    }


    /* =========================================================
       CLEAR
    ========================================================= */

    function completePuzzle() {

        if (
            upperSwitches.length !== 6
        ) {
            return;
        }

        const result =
            getPhase2Result();

        if (
            !result
            || !result.directions
            || !result.symbols
        ) {
            return;
        }

        saveProgress();

        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );

        /* PWA統一仕様 */
        closePuzzle();
    }


    /* =========================================================
       mount
    ========================================================= */

    function mount(target) {

        root = target;

        loadProgress();


        /* -----------------------------------------------------
           音声
        ----------------------------------------------------- */

        directionAudio =
            new Audio(
                "./assets/guidance_override/buttom.mp3"
            );

        directionAudio.preload =
            "auto";


        /* -----------------------------------------------------
           共通UI

           09は計器を使用
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "09",

                title:
                    "誘導オーバーライドシステム",

                description:
                    "フェーズ1では上段6個のスイッチ方向を左から順番に入力し、下段6個の正しい方向を求めます。下段6個が確定するとフェーズ2が表示されます。",

                showGauges:
                    true,

                onGaugeChanged:
                    () => {

                        if (
                            upperSwitches.length === 6
                        ) {
                            refreshPhase2();
                        }
                    },
            });


        root.innerHTML = "";

        root.appendChild(
            commonUi
        );


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "guidance-content";


        content.innerHTML = `

            <!-- ============================================
                 フェーズ1
            ============================================= -->

            <section class="guidance-panel">

                <h3>
                    フェーズ1 ― 上段スイッチに基づく下段スイッチ位置
                </h3>


                <div class="guidance-caption red">
                    赤ランプの数を選択
                </div>


                <div class="guidance-red-grid">

                    <button
                        type="button"
                        class="guidance-red-button"
                        data-value="0"
                    >
                        赤 0個
                    </button>

                    <button
                        type="button"
                        class="guidance-red-button"
                        data-value="1"
                    >
                        赤 1個
                    </button>

                    <button
                        type="button"
                        class="guidance-red-button"
                        data-value="2"
                    >
                        赤 2個
                    </button>

                </div>


                <div
                    id="guidanceTable"
                    class="guidance-table-name"
                >
                    使用テーブル：－
                </div>


                <div
                    id="guidanceCurrentPosition"
                    class="guidance-current-position"
                >
                    先に赤ランプの数を選択してください
                </div>


                <!-- 方向パッド -->

                <div class="guidance-pad">

                    <button
                        type="button"
                        class="guidance-direction-button up"
                        data-direction="上"
                    >
                        ▲
                    </button>

                    <button
                        type="button"
                        class="guidance-direction-button left"
                        data-direction="左"
                    >
                        ◀
                    </button>

                    <div class="guidance-pad-center">
                        ●
                    </div>

                    <button
                        type="button"
                        class="guidance-direction-button right"
                        data-direction="右"
                    >
                        ▶
                    </button>

                    <button
                        type="button"
                        class="guidance-direction-button down"
                        data-direction="下"
                    >
                        ▼
                    </button>

                </div>


                <div class="guidance-edit-actions">

                    <button
                        type="button"
                        id="guidanceUndo"
                        class="guidance-secondary"
                    >
                        ← 1つ戻す
                    </button>

                    <button
                        type="button"
                        id="guidanceClearUpper"
                        class="guidance-secondary"
                    >
                        上段入力をやり直す
                    </button>

                </div>


                <!-- 上段 / 下段 -->

                <div class="guidance-switch-table">

                    <div></div>

                    <div class="guidance-number">1</div>
                    <div class="guidance-number">2</div>
                    <div class="guidance-number">3</div>
                    <div class="guidance-number">4</div>
                    <div class="guidance-number">5</div>
                    <div class="guidance-number">6</div>


                    <div class="guidance-row-name">
                        上段
                    </div>

                    ${[1,2,3,4,5,6].map(() => `
                        <div class="guidance-upper-value">
                            －
                        </div>
                    `).join("")}


                    <div class="guidance-row-name lower">
                        下段
                    </div>

                    ${[1,2,3,4,5,6].map(() => `
                        <div class="guidance-lower-value">
                            －
                        </div>
                    `).join("")}

                </div>


                <div
                    id="guidancePhase1Complete"
                    class="guidance-phase1-complete"
                ></div>

            </section>


            <!-- ============================================
                 フェーズ2
            ============================================= -->

            <section
                id="guidancePhase2"
                class="guidance-panel hidden"
            >

                <h3>
                    フェーズ2 ― 計器 + 方向 + キーボード
                </h3>


                <div class="guidance-phase2-description">
                    緑ランプの点灯数を選択してください。<br>
                    0～2個 → Temperature　｜
                    3～4個 → Fuel　｜
                    5～6個 → Tachometer
                </div>


                <div class="guidance-caption green">
                    緑ランプの点灯数
                </div>


                <div class="guidance-green-grid">

                    ${[0,1,2,3,4,5,6].map(number => `
                        <button
                            type="button"
                            class="guidance-green-button"
                            data-value="${number}"
                        >
                            ${number}
                        </button>
                    `).join("")}

                </div>


                <div
                    id="guidanceGaugeName"
                    class="guidance-gauge-name"
                >
                    使用計器：－
                </div>


                <div
                    id="guidanceCondition"
                    class="guidance-condition"
                >
                    緑ランプの点灯数を選択してください
                </div>


                <!-- フェーズ2方向 -->

                <div class="guidance-phase2-table">

                    <div></div>

                    ${[1,2,3,4,5,6].map(number => `
                        <div class="guidance-number">
                            ${number}
                        </div>
                    `).join("")}


                    <div class="guidance-row-name">
                        上段
                    </div>

                    ${[1,2,3,4,5,6].map(number => `
                        <div
                            class="
                                guidance-phase2-direction
                                guidance-phase2-upper
                            "
                            data-position="${number}"
                        >
                            ○
                        </div>
                    `).join("")}


                    <div class="guidance-row-name">
                        下段
                    </div>

                    ${[1,2,3,4,5,6].map(number => `
                        <div
                            class="
                                guidance-phase2-direction
                                guidance-phase2-lower
                            "
                            data-position="${number}"
                        >
                            ○
                        </div>
                    `).join("")}

                </div>


                <!-- 記号 -->

                <div class="guidance-answer">

                    <div class="guidance-symbol">

                        <div class="guidance-symbol-name">
                            －
                        </div>

                        <div class="guidance-symbol-value">
                            －
                        </div>

                    </div>


                    <div class="guidance-symbol">

                        <div class="guidance-symbol-name">
                            －
                        </div>

                        <div class="guidance-symbol-value">
                            －
                        </div>

                    </div>


                    <div class="guidance-symbol">

                        <div class="guidance-symbol-name">
                            －
                        </div>

                        <div class="guidance-symbol-value">
                            －
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    id="guidanceComplete"
                    class="guidance-complete"
                    disabled
                >
                    ゲームクリアを登録
                </button>

            </section>

        `;


        root.appendChild(
            content
        );


        /* =====================================================
           イベント
        ===================================================== */

        root
            .querySelectorAll(
                ".guidance-red-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectRedLamps(
                            Number(
                                button.dataset.value
                            )
                        );
                    }
                );
            });


        root
            .querySelectorAll(
                ".guidance-direction-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        addUpperDirection(
                            button.dataset.direction
                        );
                    }
                );
            });


        root.querySelector(
            "#guidanceUndo"
        ).addEventListener(
            "click",
            undoUpperDirection
        );


        root.querySelector(
            "#guidanceClearUpper"
        ).addEventListener(
            "click",
            clearUpperInput
        );


        root
            .querySelectorAll(
                ".guidance-green-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectGreenLamps(
                            Number(
                                button.dataset.value
                            )
                        );
                    }
                );
            });


        root.querySelector(
            "#guidanceComplete"
        ).addEventListener(
            "click",
            completePuzzle
        );


        refreshAll();
    }


    /* =========================================================
       unmount
    ========================================================= */

    function unmount() {

        if (directionAudio) {

            directionAudio.pause();

            directionAudio.src = "";

            directionAudio = null;
        }


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


    return {
        mount,
        unmount
    };

})();