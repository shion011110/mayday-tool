"use strict";


const CircuitFlowPuzzle = (() => {

    const PUZZLE_ID =
        "circuit_flow";

    const IMAGE_FILES = {
        1: "table1.png",
        2: "table2.png",
        3: "table3.png",
    };


    let root = null;
    let commonUi = null;
    let selectedNumber = 1;


    /* =========================================================
       画像パス
    ========================================================= */

    function getImagePath(number) {

        return (
            "./assets/circuit_flow/"
            + IMAGE_FILES[number]
        );
    }


    /* =========================================================
       選択状態更新
    ========================================================= */

    function selectNumber(number) {

        if (!IMAGE_FILES[number]) {
            return;
        }


        selectedNumber =
            number;


        /* -----------------------------------------------------
           ボタン
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".circuit-number-button"
            )
            .forEach(
                button => {

                    const buttonNumber =
                        Number(
                            button.dataset.number
                        );


                    button.classList.toggle(
                        "selected",
                        buttonNumber === number
                    );
                }
            );


        /* -----------------------------------------------------
           タイトル
        ----------------------------------------------------- */

        const title =
            root.querySelector(
                "#circuitTableTitle"
            );


        title.textContent =
            `パイロットが${number}を選んだ場合 → テーブル${number}`;


        /* -----------------------------------------------------
           画像
        ----------------------------------------------------- */

        const image =
            root.querySelector(
                "#circuitTableImage"
            );


        image.src =
            getImagePath(number);


        image.alt =
            `テーブル${number}`;


        /* -----------------------------------------------------
           画像エラー表示を初期化
        ----------------------------------------------------- */

        const error =
            root.querySelector(
                "#circuitImageError"
            );


        error.classList.add(
            "hidden"
        );


        image.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       画像読み込みエラー
    ========================================================= */

    function handleImageError() {

        if (!root) {
            return;
        }


        const image =
            root.querySelector(
                "#circuitTableImage"
            );


        const error =
            root.querySelector(
                "#circuitImageError"
            );


        image.classList.add(
            "hidden"
        );


        error.textContent =
            "画像を読み込めませんでした。\n"
            + getImagePath(
                selectedNumber
            );


        error.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       ゲームクリア

       PWA共通仕様
       CLEAR保存 → ホームへ戻る
    ========================================================= */

    function completePuzzle() {

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


        selectedNumber =
            1;


        /* -----------------------------------------------------
           共通UI

           05は共通計器なし
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "05",

                title:
                    "回路フロートラッカー",

                description:
                    "パイロットが選んだ数字と同じテーブルを確認してください。",

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
            "circuit-flow-content";


        content.innerHTML = `

            <section
                class="circuit-selector-panel"
            >

                <div
                    class="circuit-selector-label"
                >
                    パイロットが選んだ数字
                </div>


                <div
                    class="circuit-number-buttons"
                >

                    <button
                        type="button"
                        class="circuit-number-button"
                        data-number="1"
                    >
                        1
                    </button>


                    <button
                        type="button"
                        class="circuit-number-button"
                        data-number="2"
                    >
                        2
                    </button>


                    <button
                        type="button"
                        class="circuit-number-button"
                        data-number="3"
                    >
                        3
                    </button>

                </div>

            </section>


            <section
                class="circuit-table-panel"
            >

                <div
                    id="circuitTableTitle"
                    class="circuit-table-title"
                >
                </div>


                <div
                    class="circuit-image-container"
                >

                    <img
                        id="circuitTableImage"
                        class="circuit-table-image"
                        src=""
                        alt=""
                    >


                    <div
                        id="circuitImageError"
                        class="circuit-image-error hidden"
                    ></div>

                </div>

            </section>


            <button
                type="button"
                id="circuitComplete"
                class="button circuit-complete"
            >
                ゲームクリアを登録
            </button>

        `;


        root.appendChild(
            content
        );


        /* -----------------------------------------------------
           1 / 2 / 3
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".circuit-number-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            selectNumber(
                                Number(
                                    button.dataset.number
                                )
                            );
                        }
                    );
                }
            );


        /* -----------------------------------------------------
           画像エラー
        ----------------------------------------------------- */

        root
            .querySelector(
                "#circuitTableImage"
            )
            .addEventListener(
                "error",
                handleImageError
            );


        /* -----------------------------------------------------
           CLEAR
        ----------------------------------------------------- */

        root
            .querySelector(
                "#circuitComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        /* -----------------------------------------------------
           Windows版と同じく初期値1
        ----------------------------------------------------- */

        selectNumber(
            1
        );
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

        selectedNumber =
            1;
    }


    /* =========================================================
       公開
    ========================================================= */

    return {
        mount,
        unmount
    };

})();