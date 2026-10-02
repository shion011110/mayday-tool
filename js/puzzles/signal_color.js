"use strict";


/* ==========================================================
   01 シグナルカラーエンコーダー
========================================================== */

const SignalColorPuzzle = (() => {

    const PUZZLE_ID = "signal_color";


    /* ======================================================
       色
    ====================================================== */

    const COLORS = [
        {
            id: "red",
            name: "赤",
            background: "#DC2626",
            text: "#FFFFFF"
        },
        {
            id: "blue",
            name: "青",
            background: "#2563EB",
            text: "#FFFFFF"
        },
        {
            id: "yellow",
            name: "黄",
            background: "#EAB308",
            text: "#111827"
        },
        {
            id: "green",
            name: "緑",
            background: "#16A34A",
            text: "#FFFFFF"
        },
        {
            id: "black",
            name: "黒",
            background: "#111111",
            text: "#FFFFFF"
        }
    ];


    const COLOR_NAMES = {};

    COLORS.forEach(color => {
        COLOR_NAMES[color.id] =
            color.name;
    });


    /* ======================================================
       条件

       Windows版と同一
    ====================================================== */

    const RULES = {

        1: [
            {
                color: "green",
                text:
                    '緑ボタンに「Black」と書かれている'
                    + '  →  緑ボタンを選択'
            },
            {
                color: "yellow",
                text:
                    '黄ボタンに「Black」と書かれていない'
                    + '  →  黄ボタンを選択'
            },
            {
                color: "black",
                text:
                    '黒ボタンに「Green」と書かれていない'
                    + '  →  黒ボタンを選択'
            },
            {
                color: "blue",
                text:
                    '上記のいずれにも該当しない'
                    + '  →  青ボタンを選択'
            }
        ],

        2: [
            {
                color: "red",
                text:
                    '赤ボタンに「Blue」と書かれている'
                    + '  →  赤ボタンを選択'
            },
            {
                color: "yellow",
                text:
                    '黄ボタンに「Blue」と書かれている'
                    + '  →  黄ボタンを選択'
            },
            {
                color: "black",
                text:
                    '黒ボタンに「Green」と書かれている'
                    + '  →  黒ボタンを選択'
            },
            {
                manual: true,
                text:
                    '上記のいずれにも該当しない'
                    + '  →  最初の残り色を選択'
            }
        ],

        3: [
            {
                color: "red",
                text:
                    '赤ボタンに「Green」と書かれている'
                    + '  →  赤ボタンを選択'
            },
            {
                color: "blue",
                text:
                    '青ボタンに「Red」と書かれていない'
                    + '  →  青ボタンを選択'
            },
            {
                color: "green",
                text:
                    '緑ボタンに「Red」と書かれていない'
                    + '  →  緑ボタンを選択'
            },
            {
                manual: true,
                text:
                    '上記のいずれにも該当しない'
                    + '  →  最初の残り色を選択'
            }
        ],

        4: [
            {
                color: "yellow",
                text:
                    '黄ボタンに「Red」と書かれている'
                    + '  →  黄ボタンを選択'
            },
            {
                color: "black",
                text:
                    '黒ボタンに「Yellow」と書かれている'
                    + '  →  黒ボタンを選択'
            },
            {
                manual: true,
                text:
                    '上記のいずれにも該当しない'
                    + '  →  最初の残り色を選択'
            }
        ]

    };


    /* ======================================================
       状態
    ====================================================== */

    let root = null;

    let answers = [];

    let currentPosition = 1;

    let manualMode = false;


    /* ======================================================
       HTMLエスケープ
    ====================================================== */

    function escapeHtml(text) {

        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }


    /* ======================================================
       条件文

       「書かれていない」の
       「いない」だけ赤
    ====================================================== */

    function makeRuleHtml(text) {

        let escaped =
            escapeHtml(text);

        escaped =
            escaped.replaceAll(
                "書かれていない",
                '書かれて<span class="signal-negative">'
                + 'いない'
                + '</span>'
            );

        return escaped;
    }


    /* ======================================================
       保存済みデータ読み込み
    ====================================================== */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            );

        const savedAnswers =
            Array.isArray(saved.answers)
                ? saved.answers
                : [];

        const cleanAnswers = [];

        savedAnswers.forEach(colorId => {

            if (
                COLOR_NAMES[colorId]
                && !cleanAnswers.includes(
                    colorId
                )
            ) {

                cleanAnswers.push(
                    colorId
                );
            }

        });

        answers =
            cleanAnswers.slice(0, 5);

        currentPosition =
            answers.length >= 5
                ? 5
                : answers.length + 1;

        manualMode = false;
    }


    /* ======================================================
       保存
    ====================================================== */

    function saveProgress() {

        const sideData =
            determineSide();

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                current_position:
                    currentPosition,

                answers:
                    [...answers],

                side:
                    sideData.side
            }
        );
    }


    /* ======================================================
       辺判定

       優先順位：
       Oil Pressure < 40
       ↓
       Airspeed > 120
       ↓
       Altimeter > 8000
       ↓
       左辺
    ====================================================== */

    function determineSide() {

        const oil =
            MaydayStore.getGauge(
                "oil_pressure"
            );

        const airspeed =
            MaydayStore.getGauge(
                "airspeed"
            );

        const altimeter =
            MaydayStore.getGauge(
                "altimeter"
            );


        if (oil === null) {

            return {
                side: null,
                reason:
                    "Oil Pressure を入力してください。"
            };
        }


        if (oil < 40) {

            return {
                side: "上辺",
                reason:
                    "Oil Pressure < 40 に該当"
            };
        }


        if (airspeed === null) {

            return {
                side: null,
                reason:
                    "Airspeed を入力してください。"
            };
        }


        if (airspeed > 120) {

            return {
                side: "右辺",
                reason:
                    "Oil Pressure < 40 は「いいえ」／"
                    + "Airspeed > 120 に該当"
            };
        }


        if (altimeter === null) {

            return {
                side: null,
                reason:
                    "Altimeter を入力してください。"
            };
        }


        if (altimeter > 8000) {

            return {
                side: "下辺",
                reason:
                    "Oil Pressure < 40 は「いいえ」／"
                    + "Airspeed > 120 は「いいえ」／"
                    + "Altimeter > 8000 に該当"
            };
        }


        return {
            side: "左辺",
            reason:
                "3項目すべて「いいえ」"
        };
    }


    /* ======================================================
       画面
    ====================================================== */

    function render() {

        if (!root) {
            return;
        }


        const completed =
            MaydayStore.isPuzzleCompleted(
                PUZZLE_ID
            );


        root.innerHTML = `
            <div class="signal-page">

                <section class="signal-side-card">

                    <div class="signal-section-caption">
                        解く辺
                    </div>

                    <div
                        id="signalSide"
                        class="signal-side-value"
                    ></div>

                    <div
                        id="signalSideReason"
                        class="signal-side-reason"
                    ></div>

                </section>


                <div
                    id="signalPosition"
                    class="signal-position"
                ></div>


                <section class="signal-section">

                    <div class="signal-section-title">
                        色
                    </div>

                    <div
                        id="signalColors"
                        class="signal-color-grid"
                    ></div>

                    <div
                        id="signalManualMessage"
                        class="signal-manual-message"
                    ></div>

                </section>


                <section
                    id="signalRuleSection"
                    class="signal-section"
                >

                    <div class="signal-section-title">
                        条件を選択
                    </div>

                    <div class="signal-rule-help">
                        操縦士の画面を確認し、
                        最初に該当する条件をタップしてください。
                    </div>

                    <div
                        id="signalRules"
                        class="signal-rules"
                    ></div>

                </section>


                <section class="signal-section">

                    <div class="signal-section-title">
                        現在の解答
                    </div>

                    <div
                        id="signalResult"
                        class="signal-result"
                    ></div>

                </section>


                <div class="signal-actions">

                    <button
                        id="signalReset"
                        class="button button-danger"
                        type="button"
                    >
                        最初からやり直す
                    </button>

                    <button
                        id="signalPrevious"
                        class="button button-secondary"
                        type="button"
                    >
                        ← 1つ前に戻る
                    </button>

                </div>


                <section
                    id="signalClear"
                    class="signal-clear ${completed && answers.length === 5 ? "" : "hidden"}"
                >

                    <div class="signal-clear-title">
                        ✓ シグナルカラーエンコーダー クリア
                    </div>

                    <div
                        id="signalFinalResult"
                        class="signal-final-result"
                    ></div>

                    <button
                        id="signalClearBack"
                        class="button signal-home-button"
                        type="button"
                    >
                        パズル一覧へ戻る
                    </button>

                </section>

            </div>
        `;


        /* ==================================================
           01 共通ヘッダー・概要・共通計器
        ================================================== */

        const commonUi =
            PuzzleCommon.create({

                number: "01",

                title: "色ボタン",

                description:
                    "共通計器から解く辺を自動判定します。"
                    + "位置1から順番に、最初に該当する条件を"
                    + "選択してください。",

                showGauges: true,

                onGaugeChanged: () => {

                    onGaugeChanged();

                }

            });


        const signalPage =
            root.querySelector(
                ".signal-page"
            );


        signalPage.insertBefore(
            commonUi,
            signalPage.firstChild
        );


        bindEvents();

        refresh();
    }


    /* ======================================================
       イベント
    ====================================================== */

    function bindEvents() {

        document
            .getElementById(
                "signalReset"
            )
            .addEventListener(
                "click",
                confirmReset
            );


        document
            .getElementById(
                "signalPrevious"
            )
            .addEventListener(
                "click",
                goPrevious
            );


        document
            .getElementById(
                "signalClearBack"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        typeof closePuzzle
                        === "function"
                    ) {

                        closePuzzle();
                    }

                }
            );
    }


    /* ======================================================
       表示更新
    ====================================================== */

    function refresh() {

        updateSide();

        updatePosition();

        updateColors();

        updateResult();

        updateRules();

        updateClear();
    }


    /* ======================================================
       辺
    ====================================================== */

    function updateSide() {

        const data =
            determineSide();

        const side =
            document.getElementById(
                "signalSide"
            );

        const reason =
            document.getElementById(
                "signalSideReason"
            );

        if (!side || !reason) {
            return;
        }


        side.textContent =
            data.side ?? "判定待ち";

        reason.textContent =
            data.reason;
    }


    /* ======================================================
       位置
    ====================================================== */

    function updatePosition() {

        const element =
            document.getElementById(
                "signalPosition"
            );

        if (!element) {
            return;
        }

        element.textContent =
            `位置 ${currentPosition} / 5`;
    }


    /* ======================================================
       色
    ====================================================== */

    function updateColors() {

        const container =
            document.getElementById(
                "signalColors"
            );

        const message =
            document.getElementById(
                "signalManualMessage"
            );

        if (!container || !message) {
            return;
        }


        container.innerHTML = "";


        COLORS.forEach(color => {

            const used =
                answers.includes(
                    color.id
                );

            const selectable =
                manualMode
                && !used;


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "signal-color-button";

            button.style.background =
                color.background;

            button.style.color =
                color.text;


            if (used) {

                button.classList.add(
                    "used"
                );

                button.textContent =
                    `✓ ${color.name}`;

            } else {

                button.textContent =
                    color.name;
            }


            if (selectable) {

                button.classList.add(
                    "manual-selectable"
                );

                button.addEventListener(
                    "click",
                    () => {

                        selectManualColor(
                            color.id
                        );

                    }
                );

            } else {

                button.disabled = true;
            }


            container.appendChild(
                button
            );

        });


        if (manualMode) {

            message.textContent =
                "「最初の残り色」を操縦士に確認し、"
                + "上の未使用色をタップしてください。";

        } else {

            message.textContent =
                "使用済みの色には ✓ と白い太枠が付きます。";
        }
    }


    /* ======================================================
       条件
    ====================================================== */

    function updateRules() {

        const section =
            document.getElementById(
                "signalRuleSection"
            );

        const container =
            document.getElementById(
                "signalRules"
            );

        if (!section || !container) {
            return;
        }


        const completed =
            MaydayStore.isPuzzleCompleted(
                PUZZLE_ID
            );


        if (
            completed
            && answers.length === 5
        ) {

            section.classList.add(
                "hidden"
            );

            return;
        }


        section.classList.remove(
            "hidden"
        );

        container.innerHTML = "";


        if (currentPosition >= 5) {

            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "signal-rule-help";

            label.textContent =
                "残り1色を自動的に位置5へ割り当てます。";

            container.appendChild(
                label
            );

            return;
        }


        const rules =
            RULES[currentPosition]
            || [];


        let visibleCount = 0;


        rules.forEach(rule => {

            const ruleColor =
                rule.color ?? null;

            const isManual =
                Boolean(
                    rule.manual
                );


            // 使用済み色のルールは表示しない
            if (
                ruleColor !== null
                && answers.includes(
                    ruleColor
                )
            ) {

                return;
            }


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "signal-rule-choice";


            const marker =
                document.createElement(
                    "span"
                );

            marker.className =
                "signal-rule-marker";

            marker.textContent =
                "○";


            const text =
                document.createElement(
                    "span"
                );

            text.className =
                "signal-rule-text";

            text.innerHTML =
                makeRuleHtml(
                    rule.text
                );


            button.append(
                marker,
                text
            );


            button.addEventListener(
                "click",
                () => {

                    selectRule(
                        isManual,
                        ruleColor
                    );

                }
            );


            container.appendChild(
                button
            );

            visibleCount += 1;
        });


        if (visibleCount === 0) {

            const warning =
                document.createElement(
                    "div"
                );

            warning.className =
                "signal-rule-help";

            warning.textContent =
                "選択可能な条件がありません。";

            container.appendChild(
                warning
            );
        }
    }


    /* ======================================================
       条件選択
    ====================================================== */

    function selectRule(
        isManual,
        resultColor
    ) {

        const side =
            determineSide();


        if (side.side === null) {

            alert(
                "解く辺を判定するために必要な"
                + "計器を入力してください。"
            );

            return;
        }


        if (isManual) {

            manualMode = true;

            updateColors();

            return;
        }


        manualMode = false;

        acceptColor(
            resultColor
        );
    }


    /* ======================================================
       手動色
    ====================================================== */

    function selectManualColor(
        colorId
    ) {

        if (!manualMode) {
            return;
        }

        if (
            answers.includes(
                colorId
            )
        ) {

            return;
        }


        acceptColor(
            colorId
        );
    }


    /* ======================================================
       色確定
    ====================================================== */

    function acceptColor(
        selectedColor
    ) {

        if (
            !selectedColor
            || !COLOR_NAMES[selectedColor]
        ) {

            return;
        }


        if (
            answers.includes(
                selectedColor
            )
        ) {

            alert(
                "この色はすでに使用されています。"
            );

            return;
        }


        answers.push(
            selectedColor
        );

        manualMode = false;


        /* ==================================================
           位置4確定
           ↓
           残り1色を位置5へ自動割当
        ================================================== */

        if (answers.length === 4) {

            const remaining =
                COLORS
                    .map(color => color.id)
                    .filter(
                        colorId =>
                            !answers.includes(
                                colorId
                            )
                    );


            if (remaining.length === 1) {

                answers.push(
                    remaining[0]
                );

                currentPosition = 5;

                saveProgress();

                MaydayStore
                    .setPuzzleCompleted(
                        PUZZLE_ID,
                        true
                    );

                refresh();

                setTimeout(
                    scrollToClear,
                    80
                );

                return;
            }
        }


        currentPosition =
            answers.length + 1;

        saveProgress();

        refresh();
    }


    /* ======================================================
       1つ前へ
    ====================================================== */

    function goPrevious() {

        if (answers.length === 0) {
            return;
        }


        if (
            MaydayStore.isPuzzleCompleted(
                PUZZLE_ID
            )
            && answers.length === 5
        ) {

            // 自動割当された位置5
            answers.pop();

            // 位置4
            if (answers.length > 0) {
                answers.pop();
            }


            MaydayStore
                .setPuzzleCompleted(
                    PUZZLE_ID,
                    false
                );

        } else {

            answers.pop();
        }


        currentPosition =
            answers.length + 1;

        manualMode = false;

        saveProgress();

        refresh();
    }


    /* ======================================================
       解答
    ====================================================== */

    function updateResult() {

        const element =
            document.getElementById(
                "signalResult"
            );

        if (!element) {
            return;
        }


        const numbers = [
            "①",
            "②",
            "③",
            "④",
            "⑤"
        ];


        const parts =
            numbers.map(
                (number, index) => {

                    const colorId =
                        answers[index];

                    const name =
                        colorId
                            ? COLOR_NAMES[colorId]
                            : "－";

                    return (
                        `${number} ${name}`
                    );
                }
            );


        element.textContent =
            parts.join("　");
    }


    /* ======================================================
       クリア
    ====================================================== */

    function updateClear() {

        const clear =
            document.getElementById(
                "signalClear"
            );

        const finalResult =
            document.getElementById(
                "signalFinalResult"
            );

        const previous =
            document.getElementById(
                "signalPrevious"
            );


        if (
            !clear
            || !finalResult
            || !previous
        ) {

            return;
        }


        const completed =
            MaydayStore.isPuzzleCompleted(
                PUZZLE_ID
            );


        if (
            !completed
            || answers.length !== 5
        ) {

            clear.classList.add(
                "hidden"
            );

            previous.classList.remove(
                "hidden"
            );

            previous.disabled =
                answers.length === 0;

            return;
        }


        clear.classList.remove(
            "hidden"
        );

        previous.classList.add(
            "hidden"
        );


        const side =
            determineSide();


        const numbers = [
            "①",
            "②",
            "③",
            "④",
            "⑤"
        ];


        const order =
            answers.map(
                (colorId, index) => {

                    return (
                        `${numbers[index]} `
                        + COLOR_NAMES[colorId]
                    );
                }
            );


        finalResult.innerHTML = `
            <div>
                解く辺：
                <strong>
                    ${escapeHtml(
                        side.side ?? "判定不可"
                    )}
                </strong>
            </div>

            <div class="signal-final-caption">
                押す順番
            </div>

            <div class="signal-final-order">
                ${order
                    .map(escapeHtml)
                    .join(
                        '<span class="signal-arrow">→</span>'
                    )
                }
            </div>
        `;
    }


    /* ======================================================
       スムーススクロール
    ====================================================== */

    function scrollToClear() {

        const clear =
            document.getElementById(
                "signalClear"
            );

        if (!clear) {
            return;
        }


        clear.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* ======================================================
       リセット
    ====================================================== */

    function confirmReset() {

        const accepted =
            confirm(
                "シグナルカラーエンコーダーの進行状況を"
                + "最初からやり直しますか？"
            );


        if (!accepted) {
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


        answers = [];

        currentPosition = 1;

        manualMode = false;

        refresh();
    }


    /* ======================================================
       外部から計器変更通知
    ====================================================== */

    function onGaugeChanged() {

        if (!root) {
            return;
        }

        updateSide();
    }


    /* ======================================================
       開く
    ====================================================== */

    function mount(container) {

        root = container;

        loadProgress();

        render();
    }


    /* ======================================================
       閉じる
    ====================================================== */

    function unmount() {

        root = null;
    }


    return {
        mount,
        unmount,
        onGaugeChanged
    };

})();