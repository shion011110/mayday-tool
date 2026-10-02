"use strict";

/* ============================================================
   10 レーダー航法プロトコル
============================================================ */

const RadarNavigationPuzzle = (() => {

    const PUZZLE_ID = "radar_navigation";


    /* ========================================================
       図形 / 色
    ======================================================== */

    const SHAPES = [
        "正方形",
        "円",
        "三角形",
        "長方形",
        "星",
    ];

    const COLORS = [
        "白",
        "赤",
        "黄",
        "緑",
        "青",
    ];


    const COLOR_INFO = {

        "白": {
            color: "#F8FAFC",
            selectedBg: "#475569",
        },

        "赤": {
            color: "#F87171",
            selectedBg: "#7F1D1D",
        },

        "黄": {
            color: "#FACC15",
            selectedBg: "#713F12",
        },

        "緑": {
            color: "#4ADE80",
            selectedBg: "#14532D",
        },

        "青": {
            color: "#60A5FA",
            selectedBg: "#1E3A8A",
        },
    };


    /* ========================================================
       条件
    ======================================================== */

    const RULES = [

        {
            number: 1,

            positive: [
                "正方形",
                "赤",
            ],

            negative: [
                "円",
                "黄",
            ],

            text:
                "正方形が赤、かつ円が黄ではない",

            order: [
                "正方形",
                "星",
                "三角形",
                "円",
                "長方形",
            ],
        },


        {
            number: 2,

            positive: [
                "三角形",
                "白",
            ],

            negative: [
                "長方形",
                "青",
            ],

            text:
                "三角形が白、かつ長方形が青ではない",

            order: [
                "三角形",
                "長方形",
                "円",
                "正方形",
                "星",
            ],
        },


        {
            number: 3,

            positive: [
                "星",
                "緑",
            ],

            negative: [
                "正方形",
                "青",
            ],

            text:
                "星が緑、かつ正方形が青ではない",

            order: [
                "星",
                "円",
                "長方形",
                "三角形",
                "正方形",
            ],
        },


        {
            number: 4,

            positive: [
                "長方形",
                "黄",
            ],

            negative: [
                "三角形",
                "赤",
            ],

            text:
                "長方形が黄、かつ三角形が赤ではない",

            order: [
                "長方形",
                "正方形",
                "星",
                "三角形",
                "円",
            ],
        },


        {
            number: 5,

            positive: [
                "円",
                "青",
            ],

            negative: [
                "星",
                "白",
            ],

            text:
                "円が青、かつ星が白ではない",

            order: [
                "円",
                "三角形",
                "正方形",
                "長方形",
                "星",
            ],
        },


        {
            number: 6,

            positive: [
                "正方形",
                "緑",
            ],

            negative: [
                "長方形",
                "白",
            ],

            text:
                "正方形が緑、かつ長方形が白ではない",

            order: [
                "正方形",
                "長方形",
                "三角形",
                "星",
                "円",
            ],
        },


        {
            number: 7,

            positive: [
                "三角形",
                "黄",
            ],

            negative: [
                "円",
                "赤",
            ],

            text:
                "三角形が黄、かつ円が赤ではない",

            order: [
                "三角形",
                "星",
                "円",
                "長方形",
                "正方形",
            ],
        },


        {
            number: 8,

            positive: [
                "星",
                "青",
            ],

            negative: [
                "正方形",
                "白",
            ],

            text:
                "星が青、かつ正方形が白ではない",

            order: [
                "星",
                "正方形",
                "長方形",
                "円",
                "三角形",
            ],
        },


        {
            number: 9,

            positive: [
                "長方形",
                "緑",
            ],

            negative: [
                "三角形",
                "青",
            ],

            text:
                "長方形が緑、かつ三角形が青ではない",

            order: [
                "長方形",
                "円",
                "星",
                "正方形",
                "三角形",
            ],
        },
    ];


    /* ========================================================
       条件10
    ======================================================== */

    const DEFAULT_RULE = {

        number: 10,

        text:
            "上記のいずれにも当てはまらない場合",

        order: [
            "円",
            "正方形",
            "三角形",
            "星",
            "長方形",
        ],
    };


    /* ========================================================
       状態
    ======================================================== */

    let root = null;

    let commonUi = null;

    let shapeColors = {};


    /* ========================================================
       保存データ読み込み
    ======================================================== */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            ) || {};


        const savedColors =
            saved.shape_colors;


        shapeColors = {};


        if (
            !savedColors
            ||
            typeof savedColors !== "object"
            ||
            Array.isArray(savedColors)
        ) {
            return;
        }


        /*
         * Windows版と同じ。
         *
         * 正方形
         * ↓
         * 円
         * ↓
         * 三角形
         * ↓
         * 長方形
         * ↓
         * 星
         *
         * の順で連続している入力のみ復元。
         */

        for (
            const shape
            of SHAPES
        ) {

            const color =
                savedColors[
                    shape
                ];


            if (
                !COLORS.includes(
                    color
                )
            ) {
                break;
            }


            shapeColors[
                shape
            ] = color;
        }
    }


    /* ========================================================
       保存
    ======================================================== */

    function saveProgress() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                shape_colors: {
                    ...shapeColors,
                },
            }
        );
    }


    /* ========================================================
       現在入力する図形
    ======================================================== */

    function getCurrentShape() {

        for (
            const shape
            of SHAPES
        ) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    shapeColors,
                    shape
                )
            ) {

                return shape;
            }
        }


        return null;
    }


    /* ========================================================
       条件状態

       impossible
           条件成立不可

       matched
           条件成立

       pending
           まだ判定できない
    ======================================================== */

    function getRuleState(
        rule
    ) {

        const [
            positiveShape,
            positiveColor
        ] = rule.positive;


        const [
            negativeShape,
            negativeColor
        ] = rule.negative;


        /* =====================================================
           肯定条件
        ===================================================== */

        if (
            Object.prototype.hasOwnProperty.call(
                shapeColors,
                positiveShape
            )
        ) {

            const actual =
                shapeColors[
                    positiveShape
                ];


            if (
                actual !== positiveColor
            ) {

                return "impossible";
            }
        }


        /* =====================================================
           否定条件
        ===================================================== */

        if (
            Object.prototype.hasOwnProperty.call(
                shapeColors,
                negativeShape
            )
        ) {

            const actual =
                shapeColors[
                    negativeShape
                ];


            if (
                actual === negativeColor
            ) {

                return "impossible";
            }
        }


        const positiveReady =
            Object.prototype.hasOwnProperty.call(
                shapeColors,
                positiveShape
            );


        const negativeReady =
            Object.prototype.hasOwnProperty.call(
                shapeColors,
                negativeShape
            );


        if (
            positiveReady
            &&
            negativeReady
        ) {

            return "matched";
        }


        return "pending";
    }


    /* ========================================================
       確定条件

       条件1から順番に確認する。

       上位条件が pending の場合は、
       下位条件が成立していてもまだ確定しない。
    ======================================================== */

    function getConfirmedRule() {

        for (
            const rule
            of RULES
        ) {

            const state =
                getRuleState(
                    rule
                );


            if (
                state === "impossible"
            ) {

                continue;
            }


            if (
                state === "matched"
            ) {

                return rule;
            }


            if (
                state === "pending"
            ) {

                return null;
            }
        }


        /*
         * 条件1～9が全部不成立。
         *
         * 5図形すべて入力済みなら
         * 条件10を確定。
         */

        if (
            Object.keys(
                shapeColors
            ).length === 5
        ) {

            return DEFAULT_RULE;
        }


        return null;
    }


    /* ========================================================
       指定した図形へスムーススクロール
    ======================================================== */

    function smoothScrollToShape(
        shape
    ) {

        if (!root) {
            return;
        }


        const row =
            root.querySelector(
                `.radar-shape-row[data-shape="${shape}"]`
            );


        if (!row) {
            return;
        }


        row.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }


    /* ========================================================
       通過順へスムーススクロール
    ======================================================== */

    function smoothScrollToAnswer() {

        if (!root) {
            return;
        }


        const answer =
            root.querySelector(
                "#radarAnswerGroup"
            );


        if (
            !answer
            ||
            answer.classList.contains(
                "hidden"
            )
        ) {
            return;
        }


        answer.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }


    /* ========================================================
       色選択

       ★スクロール優先順位

       1.
       今回のクリックによって
       通過順が初めて確定した
       ↓
       通過順へ最優先スクロール

       2.
       まだ確定していない
       ↓
       次の図形へスクロール
    ======================================================== */

    function selectColor(
        shape,
        color
    ) {

        const currentShape =
            getCurrentShape();


        /* =====================================================
           現在入力中の図形だけ操作可能
        ===================================================== */

        if (
            shape !== currentShape
        ) {
            return;
        }


        if (
            !COLORS.includes(
                color
            )
        ) {
            return;
        }


        /* =====================================================
           入力前の条件
        ===================================================== */

        const beforeRule =
            getConfirmedRule();


        /* =====================================================
           色を登録
        ===================================================== */

        shapeColors[
            shape
        ] = color;


        saveProgress();


        /* =====================================================
           入力後の条件
        ===================================================== */

        const afterRule =
            getConfirmedRule();


        /* =====================================================
           次に入力する図形
        ===================================================== */

        const nextShape =
            getCurrentShape();


        /* =====================================================
           UI更新

           通過順が確定した場合、
           ここで回答エリアが表示される。
        ===================================================== */

        refreshAll();


        /* =====================================================
           ★最優先

           今回のクリックによって
           通過順が初めて確定した場合
        ===================================================== */

        if (
            beforeRule === null
            &&
            afterRule !== null
        ) {

            window.setTimeout(
                () => {

                    smoothScrollToAnswer();

                },
                100
            );


            return;
        }


        /* =====================================================
           まだ条件が確定していない
           ↓
           次の図形へ
        ===================================================== */

        if (
            afterRule === null
            &&
            nextShape !== null
        ) {

            window.setTimeout(
                () => {

                    smoothScrollToShape(
                        nextShape
                    );

                },
                100
            );


            return;
        }


        /* =====================================================
           通過順がすでに存在する場合

           基本的には上の
           「今回初めて確定」
           で処理されるが、安全用。
        ===================================================== */

        if (
            afterRule !== null
        ) {

            window.setTimeout(
                () => {

                    smoothScrollToAnswer();

                },
                100
            );
        }
    }


    /* ========================================================
       1つ戻す
    ======================================================== */

    function undoLastColor() {

        if (
            Object.keys(
                shapeColors
            ).length === 0
        ) {
            return;
        }


        let lastShape =
            null;


        for (
            const shape
            of SHAPES
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    shapeColors,
                    shape
                )
            ) {

                lastShape =
                    shape;

            } else {

                break;
            }
        }


        if (
            lastShape === null
        ) {
            return;
        }


        delete shapeColors[
            lastShape
        ];


        saveProgress();

        refreshAll();


        /* =====================================================
           戻した図形へスクロール
        ===================================================== */

        window.setTimeout(
            () => {

                smoothScrollToShape(
                    lastShape
                );

            },
            100
        );
    }


    /* ========================================================
       色入力を最初から
    ======================================================== */

    function resetColors() {

        if (
            Object.keys(
                shapeColors
            ).length === 0
        ) {
            return;
        }


        shapeColors =
            {};


        saveProgress();

        refreshAll();


        /* =====================================================
           正方形へ戻る
        ===================================================== */

        window.setTimeout(
            () => {

                smoothScrollToShape(
                    "正方形"
                );

            },
            100
        );
    }


    /* ========================================================
       SVG図形
    ======================================================== */

    function shapeSvg(
        shape,
        colorName = null
    ) {

        const color =
            (
                colorName
                &&
                COLOR_INFO[
                    colorName
                ]
            )
                ?
                COLOR_INFO[
                    colorName
                ].color
                :
                "#64748B";


        let body =
            "";


        /* =====================================================
           正方形
        ===================================================== */

        if (
            shape === "正方形"
        ) {

            body = `
                <rect
                    x="18"
                    y="8"
                    width="28"
                    height="28"
                    rx="1"
                    fill="${color}"
                />
            `;
        }


        /* =====================================================
           円
        ===================================================== */

        else if (
            shape === "円"
        ) {

            body = `
                <circle
                    cx="32"
                    cy="22"
                    r="14"
                    fill="${color}"
                />
            `;
        }


        /* =====================================================
           三角形
        ===================================================== */

        else if (
            shape === "三角形"
        ) {

            body = `
                <polygon
                    points="
                        32,5
                        15,36
                        49,36
                    "
                    fill="${color}"
                />
            `;
        }


        /* =====================================================
           長方形
        ===================================================== */

        else if (
            shape === "長方形"
        ) {

            body = `
                <rect
                    x="11"
                    y="12"
                    width="42"
                    height="21"
                    rx="1"
                    fill="${color}"
                />
            `;
        }


        /* =====================================================
           星
        ===================================================== */

        else if (
            shape === "星"
        ) {

            body = `
                <polygon
                    points="
                        32,4
                        36.7,15.5
                        49,16.4
                        39.6,24.3
                        42.7,36
                        32,29.5
                        21.3,36
                        24.4,24.3
                        15,16.4
                        27.3,15.5
                    "
                    fill="${color}"
                />
            `;
        }


        return `
            <svg
                class="radar-shape-svg"
                viewBox="0 0 64 44"
                aria-hidden="true"
            >
                ${body}
            </svg>
        `;
    }


    /* ========================================================
       入力UI更新
    ======================================================== */

    function refreshInputUi() {

        if (!root) {
            return;
        }


        const currentShape =
            getCurrentShape();


        const hasInput =
            Object.keys(
                shapeColors
            ).length > 0;


        const undoButton =
            root.querySelector(
                "#radarUndo"
            );


        const resetButton =
            root.querySelector(
                "#radarResetColors"
            );


        if (undoButton) {

            undoButton.disabled =
                !hasInput;
        }


        if (resetButton) {

            resetButton.disabled =
                !hasInput;
        }


        /* =====================================================
           各図形
        ===================================================== */

        for (
            const shape
            of SHAPES
        ) {

            const row =
                root.querySelector(
                    `.radar-shape-row[data-shape="${shape}"]`
                );


            if (!row) {
                continue;
            }


            const icon =
                row.querySelector(
                    ".radar-input-icon"
                );


            const status =
                row.querySelector(
                    ".radar-shape-status"
                );


            const selectedColor =
                shapeColors[
                    shape
                ] || null;


            /* =================================================
               アイコン
            ================================================= */

            if (icon) {

                icon.innerHTML =
                    shapeSvg(
                        shape,
                        selectedColor
                    );
            }


            /* =================================================
               現在入力中
            ================================================= */

            row.classList.toggle(
                "current",
                shape === currentShape
            );


            /* =================================================
               ステータス
            ================================================= */

            if (status) {

                if (
                    selectedColor !== null
                ) {

                    status.textContent =
                        selectedColor;


                    status.style.color =
                        COLOR_INFO[
                            selectedColor
                        ].color;


                    status.classList.add(
                        "selected"
                    );

                } else if (
                    shape === currentShape
                ) {

                    status.textContent =
                        "入力中";


                    status.style.color =
                        "#FACC15";


                    status.classList.remove(
                        "selected"
                    );

                } else {

                    status.textContent =
                        "未入力";


                    status.style.color =
                        "#64748B";


                    status.classList.remove(
                        "selected"
                    );
                }
            }


            /* =================================================
               色ボタン
            ================================================= */

            row
                .querySelectorAll(
                    ".radar-color-button"
                )
                .forEach(
                    button => {

                        const color =
                            button.dataset.color;


                        const isSelected =
                            selectedColor === color;


                        /*
                         * 現在入力中の図形のみ
                         * 操作可能
                         */

                        button.disabled =
                            shape !== currentShape;


                        button.classList.toggle(
                            "selected",
                            isSelected
                        );


                        const info =
                            COLOR_INFO[
                                color
                            ];


                        if (info) {

                            button.style.setProperty(
                                "--radar-color",
                                info.color
                            );


                            button.style.setProperty(
                                "--radar-selected-bg",
                                info.selectedBg
                            );
                        }
                    }
                );
        }
    }


    /* ========================================================
       条件一覧更新
    ======================================================== */

    function refreshRuleVisibility() {

        if (!root) {
            return;
        }


        const confirmedRule =
            getConfirmedRule();


        const group =
            root.querySelector(
                "#radarRulesGroup"
            );


        if (!group) {
            return;
        }


        /* =====================================================
           条件確定
           ↓
           条件一覧を隠す
        ===================================================== */

        if (
            confirmedRule !== null
        ) {

            group.classList.add(
                "hidden"
            );


            return;
        }


        group.classList.remove(
            "hidden"
        );


        let allImpossible =
            true;


        /* =====================================================
           条件1～9
        ===================================================== */

        for (
            const rule
            of RULES
        ) {

            const state =
                getRuleState(
                    rule
                );


            const element =
                root.querySelector(
                    `.radar-rule[data-rule="${rule.number}"]`
                );


            if (!element) {
                continue;
            }


            const visible =
                state !== "impossible";


            element.classList.toggle(
                "hidden",
                !visible
            );


            if (visible) {

                allImpossible =
                    false;
            }
        }


        /* =====================================================
           条件10
        ===================================================== */

        const defaultRule =
            root.querySelector(
                "#radarDefaultRule"
            );


        if (defaultRule) {

            defaultRule.classList.toggle(
                "candidate",
                allImpossible
            );
        }
    }


    /* ========================================================
       通過順更新
    ======================================================== */

    function refreshAnswer() {

        if (!root) {
            return;
        }


        const group =
            root.querySelector(
                "#radarAnswerGroup"
            );


        if (!group) {
            return;
        }


        const rule =
            getConfirmedRule();


        /* =====================================================
           未確定
        ===================================================== */

        if (
            rule === null
        ) {

            group.classList.add(
                "hidden"
            );


            return;
        }


        /* =====================================================
           確定
        ===================================================== */

        group.classList.remove(
            "hidden"
        );


        /* =====================================================
           条件表示
        ===================================================== */

        const matchedLabel =
            root.querySelector(
                "#radarMatchedRule"
            );


        if (matchedLabel) {

            if (
                rule.number === 10
            ) {

                matchedLabel.textContent =
                    "条件：上記のいずれにも当てはまらない";

            } else {

                matchedLabel.textContent =
                    `条件 ${rule.number}：${rule.text}`;
            }
        }


        /* =====================================================
           通過順カード
        ===================================================== */

        const cards =
            root.querySelectorAll(
                ".radar-answer-card"
            );


        rule.order.forEach(
            (
                shape,
                index
            ) => {

                const card =
                    cards[
                        index
                    ];


                if (!card) {
                    return;
                }


                const icon =
                    card.querySelector(
                        ".radar-answer-icon"
                    );


                const shapeLabel =
                    card.querySelector(
                        ".radar-answer-shape"
                    );


                if (icon) {

                    icon.innerHTML =
                        shapeSvg(
                            shape,
                            shapeColors[
                                shape
                            ] || null
                        );
                }


                if (shapeLabel) {

                    shapeLabel.textContent =
                        shape;
                }
            }
        );


        /* =====================================================
           CLEARボタン
        ===================================================== */

        const completeButton =
            root.querySelector(
                "#radarComplete"
            );


        if (completeButton) {

            completeButton.disabled =
                false;
        }
    }


    /* ========================================================
       全体更新
    ======================================================== */

    function refreshAll() {

        if (!root) {
            return;
        }


        refreshInputUi();

        refreshRuleVisibility();

        refreshAnswer();
    }


    /* ========================================================
       CLEAR登録

       PWA共通仕様

       保存
       ↓
       CLEAR登録
       ↓
       ホーム
    ======================================================== */

    function completePuzzle() {

        const rule =
            getConfirmedRule();


        if (
            rule === null
        ) {
            return;
        }


        saveProgress();


        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );


        closePuzzle();
    }


    /* ========================================================
       mount
    ======================================================== */

    function mount(
        target
    ) {

        root =
            target;


        loadProgress();


        /* ====================================================
           共通UI
        ==================================================== */

        commonUi =
            PuzzleCommon.create({

                number:
                    "10",

                title:
                    "レーダー航法プロトコル",

                description:
                    "レーダー画面に表示されている5つの図形の色を、正方形 → 円 → 三角形 → 長方形 → 星 の順番に入力してください。入力内容から成立しなくなった条件を自動的に除外し、最初に成立する条件から正しい通過順を表示します。",

                showGauges:
                    false,
            });


        root.innerHTML =
            "";


        root.appendChild(
            commonUi
        );


        /* ====================================================
           本体
        ==================================================== */

        const content =
            document.createElement(
                "div"
            );


        content.className =
            "radar-content";


        content.innerHTML = `

            <!-- ==========================================
                 注意
            =========================================== -->

            <div class="radar-warning">

                ⚠ 同じ色が複数の図形に現れることがあります。
                レーダー開始時に決まっている各図形の色を入力してください。

            </div>


            <!-- ==========================================
                 色入力
            =========================================== -->

            <section class="radar-panel">

                <h3>
                    図形の色を入力
                </h3>


                <div class="radar-help">

                    正方形 → 円 → 三角形 → 長方形 → 星
                    の順に、色を1つずつ選択してください。
                    選択すると自動的に次の図形へ進みます。

                </div>


                <div class="radar-input-list">

                    ${SHAPES.map(
                        shape => `

                            <div
                                class="radar-shape-row"
                                data-shape="${shape}"
                            >

                                <div class="radar-shape-header">

                                    <strong>
                                        ${shape}
                                    </strong>


                                    <div class="radar-input-icon">

                                        ${shapeSvg(
                                            shape
                                        )}

                                    </div>


                                    <span
                                        class="radar-shape-status"
                                    >
                                        未入力
                                    </span>

                                </div>


                                <div class="radar-color-grid">

                                    ${COLORS.map(
                                        color => `

                                            <button
                                                type="button"
                                                class="radar-color-button"
                                                data-color="${color}"
                                            >
                                                ${color}
                                            </button>

                                        `
                                    ).join("")}

                                </div>

                            </div>

                        `
                    ).join("")}

                </div>


                <!-- ======================================
                     編集
                ======================================= -->

                <div class="radar-edit-actions">

                    <button
                        type="button"
                        id="radarUndo"
                        class="radar-secondary"
                    >
                        ← 1つ戻す
                    </button>


                    <button
                        type="button"
                        id="radarResetColors"
                        class="radar-secondary"
                    >
                        色入力を最初からやり直す
                    </button>

                </div>

            </section>


            <!-- ==========================================
                 条件
            =========================================== -->

            <section
                id="radarRulesGroup"
                class="radar-panel"
            >

                <h3>
                    現在残っている条件
                </h3>


                <div class="radar-help">

                    入力済みの色によって成立しなくなった条件は、
                    この一覧から自動的に消えていきます。

                </div>


                <div class="radar-rules">

                    ${RULES.map(
                        rule => `

                            <div
                                class="radar-rule"
                                data-rule="${rule.number}"
                            >

                                <span
                                    class="radar-rule-number"
                                >
                                    ${rule.number}.
                                </span>


                                <div class="radar-rule-body">

                                    <strong>
                                        ${rule.text}
                                    </strong>


                                    <span>
                                        ${rule.order.join(
                                            " → "
                                        )}
                                    </span>

                                </div>

                            </div>

                        `
                    ).join("")}


                    <!-- ==================================
                         条件10
                    =================================== -->

                    <div
                        id="radarDefaultRule"
                        class="
                            radar-rule
                            radar-default-rule
                        "
                    >

                        <span
                            class="radar-rule-number"
                        >
                            10.
                        </span>


                        <div class="radar-rule-body">

                            <strong>
                                ${DEFAULT_RULE.text}
                            </strong>


                            <span>
                                ${DEFAULT_RULE.order.join(
                                    " → "
                                )}
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 通過順
            =========================================== -->

            <section
                id="radarAnswerGroup"
                class="
                    radar-panel
                    radar-answer-panel
                    hidden
                "
            >

                <h3>
                    通過順
                </h3>


                <div
                    id="radarMatchedRule"
                    class="radar-matched-rule"
                >
                </div>


                <div class="radar-answer-order">

                    ${[0, 1, 2, 3, 4].map(
                        index => `

                            <div class="radar-answer-item">

                                <div class="radar-answer-card">

                                    <span
                                        class="radar-answer-number"
                                    >
                                        ${index + 1}番目
                                    </span>


                                    <div
                                        class="radar-answer-icon"
                                    >
                                    </div>


                                    <strong
                                        class="radar-answer-shape"
                                    >
                                        －
                                    </strong>

                                </div>


                                ${
                                    index < 4
                                        ?
                                        `
                                        <span
                                            class="radar-answer-arrow"
                                        >
                                            →
                                        </span>
                                        `
                                        :
                                        ""
                                }

                            </div>

                        `
                    ).join("")}

                </div>


                <!-- ======================================
                     CLEAR
                ======================================= -->

                <button
                    type="button"
                    id="radarComplete"
                    class="radar-complete"
                    disabled
                >
                    ゲームクリアを登録
                </button>

            </section>
        `;


        root.appendChild(
            content
        );


        /* ====================================================
           色ボタン
        ==================================================== */

        root
            .querySelectorAll(
                ".radar-color-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const row =
                                button.closest(
                                    ".radar-shape-row"
                                );


                            if (!row) {
                                return;
                            }


                            selectColor(
                                row.dataset.shape,
                                button.dataset.color
                            );
                        }
                    );
                }
            );


        /* ====================================================
           1つ戻す
        ==================================================== */

        const undoButton =
            root.querySelector(
                "#radarUndo"
            );


        if (undoButton) {

            undoButton.addEventListener(
                "click",
                undoLastColor
            );
        }


        /* ====================================================
           最初から
        ==================================================== */

        const resetButton =
            root.querySelector(
                "#radarResetColors"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetColors
            );
        }


        /* ====================================================
           CLEAR
        ==================================================== */

        const completeButton =
            root.querySelector(
                "#radarComplete"
            );


        if (completeButton) {

            completeButton.addEventListener(
                "click",
                completePuzzle
            );
        }


        /* ====================================================
           初期表示
        ==================================================== */

        refreshAll();
    }


    /* ========================================================
       unmount
    ======================================================== */

    function unmount() {

        if (
            commonUi
            &&
            typeof commonUi.destroy
                === "function"
        ) {

            commonUi.destroy();
        }


        commonUi =
            null;


        root =
            null;
    }


    /* ========================================================
       公開
    ======================================================== */

    return {
        mount,
        unmount,
    };

})();