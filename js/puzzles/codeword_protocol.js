"use strict";

/* ============================================================
   11 コードワード・プロトコル
============================================================ */

const CodewordProtocolPuzzle = (() => {

    const PUZZLE_ID = "codeword_protocol";

    const COLORS = [
        "白",
        "黄",
        "赤",
        "青",
        "緑",
    ];

    const COLOR_HEX = {
        "白": "#F8FAFC",
        "黄": "#FACC15",
        "赤": "#F87171",
        "青": "#60A5FA",
        "緑": "#4ADE80",
    };


    /* ========================================================
       コードワード表
    ======================================================== */

    const CODE_TABLE = {

        "白": [
            "AH",
            "HO",
            "SOS",
            "LEFT",
        ],

        "黄": [
            "UP",
            "NO",
            "HA",
            "OH",
        ],

        "赤": [
            "UH",
            "YES",
            "AS",
            "NOPE",
        ],

        "青": [
            "NBR",
            "OKAY",
            "DOWN",
            "HU",
        ],

        "緑": [
            "SA",
            "RIGHT",
            "HEH",
            "OK",
        ],
    };


    /* ========================================================
       状態
    ======================================================== */

    let root = null;
    let commonUi = null;

    let roundColors = [];


    /* ========================================================
       保存データ読み込み
    ======================================================== */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            ) || {};


        const savedRounds =
            saved.round_colors;


        roundColors = [];


        if (!Array.isArray(savedRounds)) {
            return;
        }


        for (
            const color
            of savedRounds.slice(0, 4)
        ) {

            if (!COLORS.includes(color)) {
                break;
            }


            roundColors.push(
                color
            );
        }
    }


    /* ========================================================
       保存
    ======================================================== */

    function saveProgress() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                round_colors: [
                    ...roundColors,
                ],
            }
        );
    }


    /* ========================================================
       現在ラウンド
    ======================================================== */

    function currentRound() {

        return roundColors.length;
    }


    /* ========================================================
       色選択
    ======================================================== */

    function selectColor(
        color
    ) {

        if (
            !COLORS.includes(
                color
            )
        ) {
            return;
        }


        if (
            currentRound() >= 4
        ) {
            return;
        }


        roundColors.push(
            color
        );


        saveProgress();

        refreshAll();


        /* =====================================================
           4ラウンド完了
           ↓
           入力結果へ
        ===================================================== */

        if (
            roundColors.length === 4
        ) {

            window.setTimeout(
                () => {

                    scrollToAnswer();

                },
                100
            );


            return;
        }


        /* =====================================================
           次ラウンドへ
        ===================================================== */

        window.setTimeout(
            () => {

                scrollToCurrentRound();

            },
            100
        );
    }


    /* ========================================================
       1ラウンド戻す
    ======================================================== */

    function undoRound() {

        if (
            roundColors.length === 0
        ) {
            return;
        }


        roundColors.pop();


        saveProgress();

        refreshAll();


        window.setTimeout(
            () => {

                scrollToCurrentRound();

            },
            100
        );
    }


    /* ========================================================
       ラウンド1からやり直す
    ======================================================== */

    function resetRounds() {

        if (
            roundColors.length === 0
        ) {
            return;
        }


        roundColors = [];


        saveProgress();

        refreshAll();


        window.setTimeout(
            () => {

                scrollToCurrentRound();

            },
            100
        );
    }


    /* ========================================================
       現在ラウンドへスクロール
    ======================================================== */

    function scrollToCurrentRound() {

        if (!root) {
            return;
        }


        const index =
            currentRound();


        if (
            index >= 4
        ) {
            return;
        }


        const element =
            root.querySelector(
                `.codeword-round-column[data-round="${index}"]`
            );


        if (!element) {
            return;
        }


        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }


    /* ========================================================
       入力結果へスクロール
    ======================================================== */

    function scrollToAnswer() {

        if (!root) {
            return;
        }


        const answer =
            root.querySelector(
                "#codewordAnswer"
            );


        if (!answer) {
            return;
        }


        answer.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }


    /* ========================================================
       ラウンド列更新
    ======================================================== */

    function refreshRoundFrames() {

        if (!root) {
            return;
        }


        const current =
            currentRound();


        root
            .querySelectorAll(
                ".codeword-round-column"
            )
            .forEach(
                column => {

                    const index =
                        Number(
                            column.dataset.round
                        );


                    column.classList.toggle(
                        "current",
                        current < 4 &&
                        index === current
                    );


                    column.classList.toggle(
                        "completed",
                        index < current
                    );
                }
            );
    }


    /* ========================================================
       コードワード選択表示
    ======================================================== */

    function refreshWords() {

        if (!root) {
            return;
        }


        root
            .querySelectorAll(
                ".codeword-word"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "selected"
                    );
                }
            );


        roundColors.forEach(
            (
                color,
                roundIndex
            ) => {

                if (
                    roundIndex >= 4
                ) {
                    return;
                }


                const element =
                    root.querySelector(
                        `.codeword-word[data-round="${roundIndex}"][data-color="${color}"]`
                    );


                if (element) {

                    element.classList.add(
                        "selected"
                    );
                }
            }
        );
    }


    /* ========================================================
       画面の色ボタン更新
    ======================================================== */

    function refreshColorButtons() {

        if (!root) {
            return;
        }


        const enabled =
            currentRound() < 4;


        root
            .querySelectorAll(
                ".codeword-table-color-button"
            )
            .forEach(
                button => {

                    button.disabled =
                        !enabled;
                }
            );


        const label =
            root.querySelector(
                "#codewordCurrentRound"
            );


        if (!label) {
            return;
        }


        if (
            currentRound() < 4
        ) {

            label.textContent =
                `現在：ラウンド${currentRound() + 1}`;

        } else {

            label.textContent =
                "4ラウンド入力完了";
        }
    }


    /* ========================================================
       入力結果更新
    ======================================================== */

    function refreshAnswers() {

        if (!root) {
            return;
        }


        for (
            let index = 0;
            index < 4;
            index++
        ) {

            const colorLabel =
                root.querySelector(
                    `.codeword-answer-color[data-index="${index}"]`
                );


            const wordLabel =
                root.querySelector(
                    `.codeword-answer-word[data-index="${index}"]`
                );


            if (
                !colorLabel ||
                !wordLabel
            ) {
                continue;
            }


            if (
                index < roundColors.length
            ) {

                const color =
                    roundColors[
                        index
                    ];


                const word =
                    CODE_TABLE[
                        color
                    ][
                        index
                    ];


                colorLabel.textContent =
                    color;


                colorLabel.style.color =
                    COLOR_HEX[
                        color
                    ];


                wordLabel.textContent =
                    word;


                wordLabel.classList.add(
                    "filled"
                );

            } else {

                colorLabel.textContent =
                    "－";


                colorLabel.style.color =
                    "";


                wordLabel.textContent =
                    "－";


                wordLabel.classList.remove(
                    "filled"
                );
            }
        }


        const completeButton =
            root.querySelector(
                "#codewordComplete"
            );


        if (completeButton) {

            completeButton.disabled =
                roundColors.length !== 4;
        }
    }


    /* ========================================================
       操作ボタン更新
    ======================================================== */

    function refreshControls() {

        if (!root) {
            return;
        }


        const hasInput =
            roundColors.length > 0;


        const undoButton =
            root.querySelector(
                "#codewordUndo"
            );


        const resetButton =
            root.querySelector(
                "#codewordReset"
            );


        if (undoButton) {

            undoButton.disabled =
                !hasInput;
        }


        if (resetButton) {

            resetButton.disabled =
                !hasInput;
        }
    }


    /* ========================================================
       全体更新
    ======================================================== */

    function refreshAll() {

        refreshRoundFrames();

        refreshWords();

        refreshColorButtons();

        refreshAnswers();

        refreshControls();
    }


    /* ========================================================
       ゲームクリア
    ======================================================== */

    function completePuzzle() {

        if (
            roundColors.length !== 4
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
                    "11",

                title:
                    "コードワード・プロトコル",

                description:
                    "パイロットから伝えられた画面の色をクリックしてください。現在のラウンドと色からコードワードを特定します。",

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
            "codeword-content";


        content.innerHTML = `

            <!-- ==========================================
                 注意
            =========================================== -->

            <div class="codeword-warning">

                ⚠ 同じ色が複数のラウンドで出ることがあります。
                ゲーム内でボタンを間違えるとラウンド1に戻りますが、
                色の並びとボタン上の単語は変わりません。

            </div>


            <!-- ==========================================
                 現在ラウンド
            =========================================== -->

            <div
                id="codewordCurrentRound"
                class="codeword-current-round"
            >
                現在：ラウンド1
            </div>


            <!-- ==========================================
                 コードワード表
            =========================================== -->

            <section class="codeword-panel">

                <h3>
                    コードワード表
                </h3>


                <div class="codeword-table-scroll">

                    <div class="codeword-table">


                        <!-- ==============================
                             画面の色
                        =============================== -->

                        <div class="codeword-color-column">

                            <div class="codeword-table-header">
                                画面の色
                            </div>


                            ${COLORS.map(
                                color => `

                                    <button
                                        type="button"
                                        class="codeword-table-color-button"
                                        data-color="${color}"
                                        style="
                                            --codeword-color:
                                            ${COLOR_HEX[color]};
                                        "
                                    >

                                        <span
                                            class="codeword-table-color-dot"
                                        ></span>

                                        <span>
                                            ${color}
                                        </span>

                                    </button>

                                `
                            ).join("")}

                        </div>


                        <!-- ==============================
                             ラウンド1～4
                        =============================== -->

                        ${[0, 1, 2, 3].map(
                            roundIndex => `

                                <div
                                    class="codeword-round-column"
                                    data-round="${roundIndex}"
                                >

                                    <div class="codeword-table-header">
                                        ラウンド${roundIndex + 1}
                                    </div>


                                    ${COLORS.map(
                                        color => `

                                            <div
                                                class="codeword-word"
                                                data-round="${roundIndex}"
                                                data-color="${color}"
                                            >
                                                ${CODE_TABLE[color][roundIndex]}
                                            </div>

                                        `
                                    ).join("")}

                                </div>

                            `
                        ).join("")}

                    </div>

                </div>


                <!-- ======================================
                     表の下に操作ボタン
                ======================================= -->

                <div class="codeword-controls">

                    <button
                        type="button"
                        id="codewordUndo"
                        class="codeword-secondary"
                    >
                        ← 1ラウンド戻す
                    </button>


                    <button
                        type="button"
                        id="codewordReset"
                        class="codeword-reset"
                    >
                        ラウンド1からやり直す
                    </button>

                </div>

            </section>


            <!-- ==========================================
                 入力結果
            =========================================== -->

            <section
                id="codewordAnswer"
                class="
                    codeword-panel
                    codeword-answer-panel
                "
            >

                <h3>
                    入力結果
                </h3>


                <div class="codeword-answer-grid">

                    ${[0, 1, 2, 3].map(
                        index => `

                            <div class="codeword-answer-card">

                                <span
                                    class="codeword-answer-round"
                                >
                                    ラウンド${index + 1}
                                </span>


                                <span
                                    class="codeword-answer-color"
                                    data-index="${index}"
                                >
                                    －
                                </span>


                                <strong
                                    class="codeword-answer-word"
                                    data-index="${index}"
                                >
                                    －
                                </strong>

                            </div>

                        `
                    ).join("")}

                </div>


                <button
                    type="button"
                    id="codewordComplete"
                    class="codeword-complete"
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
           表の「画面の色」をクリック
        ==================================================== */

        root
            .querySelectorAll(
                ".codeword-table-color-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            selectColor(
                                button.dataset.color
                            );
                        }
                    );
                }
            );


        /* ====================================================
           1ラウンド戻す
        ==================================================== */

        const undoButton =
            root.querySelector(
                "#codewordUndo"
            );


        if (undoButton) {

            undoButton.addEventListener(
                "click",
                undoRound
            );
        }


        /* ====================================================
           最初から
        ==================================================== */

        const resetButton =
            root.querySelector(
                "#codewordReset"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetRounds
            );
        }


        /* ====================================================
           CLEAR
        ==================================================== */

        const completeButton =
            root.querySelector(
                "#codewordComplete"
            );


        if (completeButton) {

            completeButton.addEventListener(
                "click",
                completePuzzle
            );
        }


        refreshAll();
    }


    /* ========================================================
       unmount
    ======================================================== */

    function unmount() {

        if (
            commonUi &&
            typeof commonUi.destroy === "function"
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
        unmount,
    };

})();