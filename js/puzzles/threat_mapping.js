"use strict";

const ThreatMappingPuzzle = (() => {

    const PUZZLE_ID = "threat_mapping";

    let root = null;
    let commonUi = null;


    /* ==========================================================
       TABLEデータ

       内部列:
       A B C D E F G H

       画面表示:
       8 7 6 5 4 3 2 1

       縦:
       上から 1 → 8
    ========================================================== */

    const TABLES = [

        // TABLE 1
        {
            green: [
                ["B", 1],
                ["C", 1],
                ["E", 1],
                ["F", 1],
                ["G", 1],
            ],
            red: [
                ["D", 4],
                ["E", 4],
                ["B", 7],
                ["C", 7],
                ["D", 7],
            ],
            bombs: [
                ["D", 3],
                ["E", 5],
            ],
        },

        // TABLE 2
        {
            green: [
                ["B", 3],
                ["B", 4],
                ["B", 5],
                ["G", 2],
                ["H", 2],
            ],
            red: [
                ["D", 6],
                ["E", 6],
                ["F", 6],
                ["F", 7],
                ["F", 8],
            ],
            bombs: [
                ["F", 3],
                ["D", 4],
            ],
        },

        // TABLE 3
        {
            green: [
                ["D", 1],
                ["E", 1],
                ["A", 3],
                ["A", 4],
                ["A", 5],
            ],
            red: [
                ["G", 3],
                ["H", 3],
                ["C", 6],
                ["D", 6],
                ["E", 6],
            ],
            bombs: [
                ["E", 3],
                ["D", 5],
            ],
        },

        // TABLE 4
        {
            green: [
                ["F", 1],
                ["G", 1],
                ["C", 2],
                ["D", 2],
                ["E", 2],
            ],
            red: [
                ["A", 4],
                ["B", 4],
                ["F", 5],
                ["F", 6],
                ["F", 7],
            ],
            bombs: [
                ["C", 4],
                ["D", 7],
            ],
        },

        // TABLE 5
        {
            green: [
                ["B", 2],
                ["C", 2],
                ["E", 3],
                ["F", 3],
                ["G", 3],
            ],
            red: [
                ["D", 5],
                ["D", 6],
                ["D", 7],
                ["A", 7],
                ["A", 8],
            ],
            bombs: [
                ["D", 3],
                ["F", 5],
            ],
        },

        // TABLE 6
        {
            green: [
                ["G", 1],
                ["G", 2],
                ["G", 3],
                ["C", 4],
                ["D", 4],
            ],
            red: [
                ["B", 1],
                ["B", 2],
                ["E", 6],
                ["F", 6],
                ["G", 6],
            ],
            bombs: [
                ["C", 3],
                ["E", 4],
            ],
        },

        // TABLE 7
        {
            green: [
                ["E", 2],
                ["F", 2],
                ["B", 5],
                ["C", 5],
                ["D", 5],
            ],
            red: [
                ["A", 2],
                ["A", 3],
                ["A", 4],
                ["G", 7],
                ["H", 7],
            ],
            bombs: [
                ["D", 3],
                ["F", 4],
            ],
        },

        // TABLE 8
        {
            green: [
                ["D", 3],
                ["E", 3],
                ["G", 4],
                ["G", 5],
                ["G", 6],
            ],
            red: [
                ["B", 1],
                ["C", 1],
                ["E", 7],
                ["F", 7],
                ["G", 7],
            ],
            bombs: [
                ["C", 4],
                ["E", 5],
            ],
        },

        // TABLE 9
        {
            green: [
                ["B", 2],
                ["B", 3],
                ["B", 4],
                ["F", 4],
                ["G", 4],
            ],
            red: [
                ["D", 1],
                ["E", 1],
                ["C", 7],
                ["D", 7],
                ["E", 7],
            ],
            bombs: [
                ["D", 3],
                ["F", 5],
            ],
        },

        // TABLE 10
        {
            green: [
                ["A", 2],
                ["A", 3],
                ["D", 2],
                ["E", 2],
                ["F", 2],
            ],
            red: [
                ["C", 4],
                ["C", 5],
                ["C", 6],
                ["H", 5],
                ["H", 6],
            ],
            bombs: [
                ["D", 4],
                ["E", 5],
            ],
        },

    ];


    /* ==========================================================
       座標
    ========================================================== */

    const INTERNAL_COLUMNS = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
    ];

    const DISPLAY_COLUMNS = [
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
        "1",
    ];


    /* ==========================================================
       座標比較
    ========================================================== */

    function containsCell(
        cells,
        column,
        row
    ) {

        return cells.some(
            cell =>
                cell[0] === column
                && cell[1] === row
        );

    }


    /* ==========================================================
       爆弾
    ========================================================== */

    function createBomb() {

        const bomb =
            document.createElement(
                "div"
            );

        bomb.className =
            "threat-bomb";

        bomb.innerHTML = `
            <span class="threat-bomb-body"></span>
            <span class="threat-bomb-cap"></span>
            <span class="threat-bomb-fuse"></span>
            <span class="threat-bomb-spark"></span>
        `;

        return bomb;

    }


    /* ==========================================================
       TABLE生成
    ========================================================== */

    function createTable(
        tableData,
        tableNumber
    ) {

        const card =
            document.createElement(
                "section"
            );

        card.className =
            "threat-table-card";


        /* ------------------------------------------------------
           タイトル
        ------------------------------------------------------ */

        const title =
            document.createElement(
                "div"
            );

        title.className =
            "threat-table-title";

        title.textContent =
            `TABLE ${tableNumber}`;

        card.appendChild(
            title
        );


        /* ------------------------------------------------------
           上側座標
        ------------------------------------------------------ */

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "threat-column-header";


        DISPLAY_COLUMNS.forEach(
            number => {

                const label =
                    document.createElement(
                        "div"
                    );

                label.className =
                    "threat-column-label";

                label.textContent =
                    number;

                header.appendChild(
                    label
                );

            }
        );


        card.appendChild(
            header
        );


        /* ------------------------------------------------------
           グリッド＋右側行番号
        ------------------------------------------------------ */

        const boardArea =
            document.createElement(
                "div"
            );

        boardArea.className =
            "threat-board-area";


        const board =
            document.createElement(
                "div"
            );

        board.className =
            "threat-board";


        for (
            let row = 1;
            row <= 8;
            row += 1
        ) {

            INTERNAL_COLUMNS.forEach(
                column => {

                    const cell =
                        document.createElement(
                            "div"
                        );

                    cell.className =
                        "threat-cell";


                    if (
                        containsCell(
                            tableData.green,
                            column,
                            row
                        )
                    ) {

                        cell.classList.add(
                            "green"
                        );

                    } else if (
                        containsCell(
                            tableData.red,
                            column,
                            row
                        )
                    ) {

                        cell.classList.add(
                            "red"
                        );

                    } else if (
                        containsCell(
                            tableData.bombs,
                            column,
                            row
                        )
                    ) {

                        cell.classList.add(
                            "bomb"
                        );

                        cell.appendChild(
                            createBomb()
                        );
                    }


                    board.appendChild(
                        cell
                    );

                }
            );

        }


        boardArea.appendChild(
            board
        );


        /* ------------------------------------------------------
           右側 1～8
        ------------------------------------------------------ */

        const rowLabels =
            document.createElement(
                "div"
            );

        rowLabels.className =
            "threat-row-labels";


        for (
            let row = 1;
            row <= 8;
            row += 1
        ) {

            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "threat-row-label";

            label.textContent =
                String(row);

            rowLabels.appendChild(
                label
            );

        }


        boardArea.appendChild(
            rowLabels
        );


        card.appendChild(
            boardArea
        );


        return card;

    }


    /* ==========================================================
       TABLE一覧
    ========================================================== */

    function renderTables() {

        const container =
            root.querySelector(
                "#threatTables"
            );


        container.innerHTML =
            "";


        TABLES.forEach(
            (tableData, index) => {

                container.appendChild(
                    createTable(
                        tableData,
                        index + 1
                    )
                );

            }
        );

    }


    /* ==========================================================
       クリア状態
    ========================================================== */

    function refreshCompletionState() {

        if (!root) {

            return;
        }


        const completed =
            MaydayStore
                .isPuzzleCompleted(
                    PUZZLE_ID
                );


        const completeButton =
            root.querySelector(
                "#threatComplete"
            );

        const cancelButton =
            root.querySelector(
                "#threatCancel"
            );

        const clearBox =
            root.querySelector(
                "#threatClearBox"
            );


        if (completed) {

            completeButton.textContent =
                "✓ ゲームクリア登録済み";

            completeButton.disabled =
                true;

            cancelButton.disabled =
                false;

            clearBox.classList.remove(
                "hidden"
            );

        } else {

            completeButton.textContent =
                "ゲームクリアを登録";

            completeButton.disabled =
                false;

            cancelButton.disabled =
                true;

            clearBox.classList.add(
                "hidden"
            );
        }

    }


    /* ==========================================================
       クリア登録
    ========================================================== */

    function completePuzzle() {

        /*
           03をクリア済みにする
        */

        MaydayStore
            .setPuzzleCompleted(
                PUZZLE_ID,
                true
            );


        /*
           ホームへ戻る

           app.js の closePuzzle() を使うことで
           URLの ?puzzle=threat_mapping も解除される。
        */

        closePuzzle();

    }


    /* ==========================================================
       クリア解除
    ========================================================== */

    function cancelCompletion() {

        MaydayStore
            .setPuzzleCompleted(
                PUZZLE_ID,
                false
            );


        refreshCompletionState();

    }


    /* ==========================================================
       mount
    ========================================================== */

    function mount(
        target
    ) {

        root = target;


        commonUi =
            PuzzleCommon.create({

                number: "03",

                title:
                    "脅威マッピンググリッド",

                description:
                    "TABLE 1～10 の脅威マッピンググリッドです。ゲーム画面と対応するTABLEを確認してください。",

                showGauges:
                    false,

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
            "threat-mapping-content";


        content.innerHTML = `

            <div
                id="threatTables"
                class="threat-tables"
            ></div>


            <div
                class="threat-completion-controls"
            >

                <button
                    type="button"
                    id="threatCancel"
                    class="button button-secondary"
                >
                    クリア解除
                </button>

                <button
                    type="button"
                    id="threatComplete"
                    class="button"
                >
                    ゲームクリアを登録
                </button>

            </div>


            <div
                id="threatClearBox"
                class="threat-clear-box hidden"
            >

                <div
                    class="threat-clear-title"
                >
                    ✓ 脅威マッピンググリッド クリア
                </div>

            </div>

        `;


        root.appendChild(
            content
        );


        renderTables();


        root
            .querySelector(
                "#threatComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        root
            .querySelector(
                "#threatCancel"
            )
            .addEventListener(
                "click",
                cancelCompletion
            );


        refreshCompletionState();

    }


    /* ==========================================================
       unmount
    ========================================================== */

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


    return {
        mount,
        unmount
    };

})();