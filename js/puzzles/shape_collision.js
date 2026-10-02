"use strict";

const ShapeCollisionPuzzle = (() => {

    const PUZZLE_ID = "shape_collision";

    let root = null;
    let commonUi = null;

    let selections = createEmptySelections();

    let currentPair = 0;
    let selectionStep = "top";


    /* =========================================================
       色
    ========================================================= */

    const COLOR_INFO = {

        R: {
            name: "赤",
            color: "#EF4444",
            text: "#FFFFFF",
        },

        B: {
            name: "青",
            color: "#2563EB",
            text: "#FFFFFF",
        },

        Y: {
            name: "黄",
            color: "#FACC15",
            text: "#111827",
        },

        G: {
            name: "緑",
            color: "#22C55E",
            text: "#FFFFFF",
        },

        P: {
            name: "紫",
            color: "#9333EA",
            text: "#FFFFFF",
        },

        O: {
            name: "オレンジ",
            color: "#F97316",
            text: "#FFFFFF",
        },

        K: {
            name: "黒",
            color: "#09090B",
            text: "#FFFFFF",
        },

        I: {
            name: "ピンク",
            color: "#EC4899",
            text: "#FFFFFF",
        },
    };


    /* =========================================================
       20 × 20 判定表

       上の絵柄 = 列
       下の絵柄 = 行
    ========================================================= */

    const COLOR_TABLE = [

        // 下01
        [
            "R","B","G","P","Y",
            "O","K","I","G","B",
            "R","Y","P","O","K",
            "I","B","G","R","Y",
        ],

        // 下02
        [
            "B","Y","P","O","K",
            "I","R","G","B","Y",
            "P","O","K","I","R",
            "G","B","Y","P","O",
        ],

        // 下03
        [
            "G","P","K","I","R",
            "B","Y","O","G","P",
            "K","I","R","B","Y",
            "O","G","P","K","I",
        ],

        // 下04
        [
            "P","O","I","G","B",
            "Y","R","K","P","O",
            "I","G","B","Y","R",
            "K","P","O","I","G",
        ],

        // 下05
        [
            "Y","K","R","B","O",
            "G","P","I","Y","K",
            "R","B","O","G","P",
            "I","Y","K","R","B",
        ],

        // 下06
        [
            "O","I","B","Y","G",
            "P","K","R","O","I",
            "B","Y","G","P","K",
            "R","O","I","B","Y",
        ],

        // 下07
        [
            "K","R","Y","R","P",
            "K","I","B","G","O",
            "Y","R","P","K","I",
            "B","G","O","Y","R",
        ],

        // 下08
        [
            "I","G","O","K","I",
            "R","B","Y","P","G",
            "O","K","I","R","B",
            "Y","P","G","O","K",
        ],

        // 下09
        [
            "G","B","G","P","Y",
            "O","B","P","R","K",
            "I","Y","O","B","P",
            "R","K","I","Y","O",
        ],

        // 下10
        [
            "B","Y","P","O","K",
            "I","O","G","K","B",
            "R","Y","P","O","K",
            "I","B","G","R","Y",
        ],

        // 下11
        [
            "R","P","K","I","R",
            "B","Y","O","I","R",
            "G","B","P","Y","O",
            "K","I","R","G","B",
        ],

        // 下12
        [
            "Y","O","I","G","B",
            "Y","R","K","Y","Y",
            "B","P","O","K","I",
            "R","G","B","P","O",
        ],

        // 下13
        [
            "P","K","R","B","O",
            "G","P","I","O","P",
            "P","O","K","I","R",
            "B","Y","G","P","K",
        ],

        // 下14
        [
            "O","I","B","Y","G",
            "P","K","R","B","O",
            "Y","K","K","R","B",
            "Y","P","G","O","R",
        ],

        // 下15
        [
            "K","R","Y","R","P",
            "K","I","B","P","K",
            "O","I","R","B","G",
            "Y","P","K","I","B",
        ],

        // 下16
        [
            "I","G","O","K","I",
            "R","B","Y","R","I",
            "K","R","B","Y","Y",
            "P","O","K","I","R",
        ],

        // 下17
        [
            "B","B","G","P","Y",
            "O","G","P","K","B",
            "I","G","Y","P","P",
            "O","R","B","G","Y",
        ],

        // 下18
        [
            "G","Y","P","O","K",
            "I","O","G","I","G",
            "R","B","G","G","K",
            "K","B","Y","P","O",
        ],

        // 下19
        [
            "R","P","K","I","R",
            "B","Y","O","Y","R",
            "G","P","P","O","I",
            "I","G","P","K","I",
        ],

        // 下20
        [
            "Y","O","I","G","B",
            "Y","R","K","O","Y",
            "B","O","K","R","B",
            "R","Y","O","I","G",
        ],
    ];


    /* =========================================================
       初期状態
    ========================================================= */

    function createEmptySelections() {

        return Array.from(
            { length: 4 },
            () => ({
                top: null,
                bottom: null,
            })
        );
    }


    /* =========================================================
       画像
    ========================================================= */

    function imagePath(number) {

        return (
            "./assets/shape_collision/"
            + `shape${String(number).padStart(2, "0")}.png`
        );
    }


    /* =========================================================
       色判定

       ★絶対に逆にしない

       COLOR_TABLE[下 - 1][上 - 1]
    ========================================================= */

    function getColorCode(
        topNumber,
        bottomNumber
    ) {

        if (
            topNumber === null
            || bottomNumber === null
        ) {
            return null;
        }


        return COLOR_TABLE[
            bottomNumber - 1
        ][
            topNumber - 1
        ];
    }


    /* =========================================================
       保存データ
    ========================================================= */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            );


        selections =
            createEmptySelections();


        if (
            !saved
            || !Array.isArray(
                saved.selections
            )
        ) {

            findResumePosition();

            return;
        }


        for (
            let index = 0;
            index < Math.min(
                4,
                saved.selections.length
            );
            index += 1
        ) {

            const item =
                saved.selections[index];


            if (
                !item
                || typeof item !== "object"
            ) {
                continue;
            }


            let top =
                Number.isInteger(item.top)
                && item.top >= 1
                && item.top <= 20
                    ? item.top
                    : null;


            let bottom =
                Number.isInteger(item.bottom)
                && item.bottom >= 1
                && item.bottom <= 20
                    ? item.bottom
                    : null;


            if (top === null) {
                bottom = null;
            }


            selections[index] = {
                top,
                bottom,
            };
        }


        findResumePosition();
    }


    function saveProgress() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                selections:
                    selections.map(
                        pair => ({
                            top: pair.top,
                            bottom: pair.bottom,
                        })
                    ),
            }
        );
    }


    /* =========================================================
       再開位置
    ========================================================= */

    function findResumePosition() {

        for (
            let index = 0;
            index < 4;
            index += 1
        ) {

            const pair =
                selections[index];


            if (pair.top === null) {

                currentPair =
                    index;

                selectionStep =
                    "top";

                return;
            }


            if (pair.bottom === null) {

                currentPair =
                    index;

                selectionStep =
                    "bottom";

                return;
            }
        }


        currentPair =
            4;

        selectionStep =
            "done";
    }


    /* =========================================================
       4色結果
    ========================================================= */

    function renderResults() {

        if (!root) {
            return;
        }


        root
            .querySelectorAll(
                ".shape-result"
            )
            .forEach(
                (element, index) => {

                    const pair =
                        selections[index];


                    const colorCode =
                        getColorCode(
                            pair.top,
                            pair.bottom
                        );


                    if (!colorCode) {

                        element.textContent =
                            "未判定";

                        element.style.backgroundColor =
                            "#172337";

                        element.style.color =
                            "#64748B";

                        element.style.borderColor =
                            "#334155";

                        return;
                    }


                    const info =
                        COLOR_INFO[
                            colorCode
                        ];


                    element.textContent =
                        info.name;

                    element.style.backgroundColor =
                        info.color;

                    element.style.color =
                        info.text;

                    element.style.borderColor =
                        info.color;
                }
            );


        refreshCompleteButton();
    }


    /* =========================================================
       4組完了
    ========================================================= */

    function allPairsCompleted() {

        return selections.every(
            pair =>
                pair.top !== null
                && pair.bottom !== null
        );
    }


    function refreshCompleteButton() {

        if (!root) {
            return;
        }


        const button =
            root.querySelector(
                "#shapeComplete"
            );


        if (!button) {
            return;
        }


        button.disabled =
            !allPairsCompleted();
    }


    /* =========================================================
       選択画面
    ========================================================= */

    function openSelector() {

        findResumePosition();


        const overlay =
            root.querySelector(
                "#shapeSelectorOverlay"
            );


        overlay.classList.remove(
            "hidden"
        );


        document.body.classList.add(
            "shape-selector-open"
        );


        renderSelector();
    }


    function closeSelector() {

        const overlay =
            root.querySelector(
                "#shapeSelectorOverlay"
            );


        overlay.classList.add(
            "hidden"
        );


        document.body.classList.remove(
            "shape-selector-open"
        );


        renderResults();
    }


    /* =========================================================
       選択画面更新
    ========================================================= */

    function renderSelector() {

        if (!root) {
            return;
        }


        renderSelectorColors();


        const guide =
            root.querySelector(
                "#shapeSelectorGuide"
            );


        const selectedTop =
            root.querySelector(
                "#shapeSelectedTop"
            );


        const backButton =
            root.querySelector(
                "#shapeBackOne"
            );


        const hasSelection =
            selections.some(
                pair =>
                    pair.top !== null
                    || pair.bottom !== null
            );


        backButton.disabled =
            !hasSelection;


        /* -----------------------------------------------------
           全4組完了
        ----------------------------------------------------- */

        if (
            currentPair >= 4
            || selectionStep === "done"
        ) {

            currentPair =
                4;

            selectionStep =
                "done";


            guide.textContent =
                "4組すべて選択済み";


            selectedTop.classList.add(
                "hidden"
            );


            return;
        }


        /* -----------------------------------------------------
           上
        ----------------------------------------------------- */

        if (
            selectionStep === "top"
        ) {

            guide.textContent =
                `第${currentPair + 1}組：上の絵柄を選択してください`;


            selectedTop.classList.add(
                "hidden"
            );


            return;
        }


        /* -----------------------------------------------------
           下
        ----------------------------------------------------- */

        const topNumber =
            selections[
                currentPair
            ].top;


        if (topNumber === null) {

            selectionStep =
                "top";


            renderSelector();

            return;
        }


        guide.textContent =
            `第${currentPair + 1}組：下の絵柄を選択してください`;


        root.querySelector(
            "#shapeSelectedTopNumber"
        ).textContent =
            String(
                topNumber
            ).padStart(
                2,
                "0"
            );


        root.querySelector(
            "#shapeSelectedTopImage"
        ).src =
            imagePath(
                topNumber
            );


        selectedTop.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       選択画面上部4色
    ========================================================= */

    function renderSelectorColors() {

        root
            .querySelectorAll(
                ".shape-selector-result"
            )
            .forEach(
                (element, index) => {

                    const pair =
                        selections[index];


                    const colorCode =
                        getColorCode(
                            pair.top,
                            pair.bottom
                        );


                    if (!colorCode) {

                        element.textContent =
                            "未判定";

                        element.style.backgroundColor =
                            "#172337";

                        element.style.color =
                            "#64748B";

                        element.style.borderColor =
                            "#334155";

                        return;
                    }


                    const info =
                        COLOR_INFO[
                            colorCode
                        ];


                    element.textContent =
                        info.name;

                    element.style.backgroundColor =
                        info.color;

                    element.style.color =
                        info.text;

                    element.style.borderColor =
                        info.color;
                }
            );
    }


    /* =========================================================
       絵柄クリック
    ========================================================= */

    function shapeClicked(number) {

        if (
            currentPair >= 4
        ) {
            return;
        }


        const pair =
            selections[
                currentPair
            ];


        /* -----------------------------------------------------
           上
        ----------------------------------------------------- */

        if (
            selectionStep === "top"
        ) {

            pair.top =
                number;

            pair.bottom =
                null;


            selectionStep =
                "bottom";


            saveProgress();

            renderResults();

            renderSelector();

            return;
        }


        /* -----------------------------------------------------
           下
        ----------------------------------------------------- */

        if (
            selectionStep === "bottom"
        ) {

            pair.bottom =
                number;


            saveProgress();

            renderResults();


            currentPair += 1;


            /* -------------------------------------------------
               4組完了
            ------------------------------------------------- */

            if (
                currentPair >= 4
            ) {

                selectionStep =
                    "done";


                renderSelector();


                /*
                 * Windows版と同じく
                 * 4組目完成で選択画面を自動で閉じる
                 */

                setTimeout(
                    closeSelector,
                    180
                );


                return;
            }


            /* -------------------------------------------------
               次の組
            ------------------------------------------------- */

            selectionStep =
                "top";


            renderSelector();
        }
    }


    /* =========================================================
       ひとつ戻す
    ========================================================= */

    function goBackOneSelection() {

        /* -----------------------------------------------------
           現在「下」を選ぶ状態
           → 現在組の上を消す
        ----------------------------------------------------- */

        if (
            currentPair < 4
            && selectionStep === "bottom"
        ) {

            selections[
                currentPair
            ].top = null;


            selections[
                currentPair
            ].bottom = null;


            selectionStep =
                "top";


            saveProgress();

            renderResults();

            renderSelector();

            return;
        }


        /* -----------------------------------------------------
           現在「上」を選ぶ状態
           → 前組の下を消す
        ----------------------------------------------------- */

        if (
            currentPair < 4
            && selectionStep === "top"
        ) {

            if (
                currentPair <= 0
            ) {
                return;
            }


            currentPair -= 1;


            selections[
                currentPair
            ].bottom = null;


            selectionStep =
                "bottom";


            saveProgress();

            renderResults();

            renderSelector();

            return;
        }


        /* -----------------------------------------------------
           全4組完成
           → 4組目の下を消す
        ----------------------------------------------------- */

        if (
            selectionStep === "done"
        ) {

            currentPair =
                3;


            selections[3].bottom =
                null;


            selectionStep =
                "bottom";


            saveProgress();

            renderResults();

            renderSelector();
        }
    }


    /* =========================================================
       最初から
    ========================================================= */

    function resetAll() {

        selections =
            createEmptySelections();


        currentPair =
            0;


        selectionStep =
            "top";


        saveProgress();

        renderResults();

        renderSelector();
    }


    /* =========================================================
       画像一覧生成
    ========================================================= */

    function createShapeChoices() {

        const container =
            root.querySelector(
                "#shapeChoices"
            );


        container.innerHTML =
            "";


        for (
            let number = 1;
            number <= 20;
            number += 1
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "shape-choice";


            button.innerHTML = `

                <span
                    class="shape-choice-number"
                >
                    ${String(number).padStart(2, "0")}
                </span>

                <span
                    class="shape-choice-image-box"
                >
                    <img
                        src="${imagePath(number)}"
                        alt="絵柄 ${String(number).padStart(2, "0")}"
                        class="shape-choice-image"
                    >
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    shapeClicked(
                        number
                    );
                }
            );


            container.appendChild(
                button
            );
        }
    }


    /* =========================================================
       CLEAR

       統一仕様:
       CLEAR保存 → ホーム
    ========================================================= */

    function completePuzzle() {

        if (
            !allPairsCompleted()
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


    /* =========================================================
       mount
    ========================================================= */

    function mount(target) {

        root =
            target;


        loadProgress();


        /* -----------------------------------------------------
           共通UI

           06は共通計器なし
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "06",

                title:
                    "シェイプ衝突マトリクス",

                description:
                    "パイロットから伝えられた2つの絵柄を選択し、組み合わせから対応する色を確認します。4組すべての結果を順番に確認してください。",

                showGauges:
                    false,
            });


        root.innerHTML =
            "";


        root.appendChild(
            commonUi
        );


        /* -----------------------------------------------------
           本体
        ----------------------------------------------------- */

        const content =
            document.createElement(
                "div"
            );


        content.className =
            "shape-collision-content";


        content.innerHTML = `

            <div class="shape-notice">
                ※同じ絵柄を複数回選択できます。
            </div>


            <section
                class="shape-results-panel"
            >

                <button
                    type="button"
                    id="shapeOpenSelector"
                    class="shape-select-button"
                >
                    絵柄を選ぶ
                </button>


                <div
                    class="shape-main-results"
                >

                    <div class="shape-result">
                        未判定
                    </div>

                    <div class="shape-result">
                        未判定
                    </div>

                    <div class="shape-result">
                        未判定
                    </div>

                    <div class="shape-result">
                        未判定
                    </div>

                </div>

            </section>


            <button
                type="button"
                id="shapeComplete"
                class="button shape-complete"
                disabled
            >
                ゲームクリアを登録
            </button>


            <!-- ============================================
                 選択画面
            ============================================= -->

            <div
                id="shapeSelectorOverlay"
                class="shape-selector-overlay hidden"
            >

                <div
                    class="shape-selector-dialog"
                >

                    <div
                        class="shape-selector-results"
                    >

                        <div class="shape-selector-result">
                            未判定
                        </div>

                        <div class="shape-selector-result">
                            未判定
                        </div>

                        <div class="shape-selector-result">
                            未判定
                        </div>

                        <div class="shape-selector-result">
                            未判定
                        </div>

                    </div>


                    <div
                        id="shapeSelectedTop"
                        class="shape-selected-top hidden"
                    >

                        <span
                            class="shape-selected-top-label"
                        >
                            上
                        </span>


                        <strong
                            id="shapeSelectedTopNumber"
                        ></strong>


                        <img
                            id="shapeSelectedTopImage"
                            src=""
                            alt="選択済みの上の絵柄"
                        >

                    </div>


                    <div
                        id="shapeSelectorGuide"
                        class="shape-selector-guide"
                    ></div>


                    <div
                        id="shapeChoices"
                        class="shape-choices"
                    ></div>


                    <div
                        class="shape-selector-actions"
                    >

                        <button
                            type="button"
                            id="shapeBackOne"
                            class="shape-secondary-button"
                        >
                            ← ひとつ前の選択に戻る
                        </button>


                        <button
                            type="button"
                            id="shapeReset"
                            class="shape-reset-button"
                        >
                            最初からやりなおす
                        </button>


                        <button
                            type="button"
                            id="shapeCloseSelector"
                            class="shape-secondary-button"
                        >
                            閉じる
                        </button>

                    </div>

                </div>

            </div>

        `;


        root.appendChild(
            content
        );


        /* -----------------------------------------------------
           イベント
        ----------------------------------------------------- */

        root
            .querySelector(
                "#shapeOpenSelector"
            )
            .addEventListener(
                "click",
                openSelector
            );


        root
            .querySelector(
                "#shapeCloseSelector"
            )
            .addEventListener(
                "click",
                closeSelector
            );


        root
            .querySelector(
                "#shapeBackOne"
            )
            .addEventListener(
                "click",
                goBackOneSelection
            );


        root
            .querySelector(
                "#shapeReset"
            )
            .addEventListener(
                "click",
                resetAll
            );


        root
            .querySelector(
                "#shapeComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        createShapeChoices();

        renderResults();
    }


    /* =========================================================
       unmount
    ========================================================= */

    function unmount() {

        document.body.classList.remove(
            "shape-selector-open"
        );


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


    /* =========================================================
       公開
    ========================================================= */

    return {
        mount,
        unmount
    };

})();