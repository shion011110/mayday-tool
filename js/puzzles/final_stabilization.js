"use strict";

/* ============================================================
   13 最終安定化プロトコル
============================================================ */

const FinalStabilizationPuzzle = (() => {

    const PUZZLE_ID = "final_stabilization";


    /* ========================================================
       最終安定化プロトコル 表
    ======================================================== */

    const TABLE_DATA = [
        ["0:00 - 0:30", "ポジション1", "南（S）"],
        ["0:31 - 1:00", "ポジション2", "南西（SW）"],
        ["1:01 - 1:30", "ポジション2", "南東（SE）"],
        ["1:31 - 2:00", "ポジション3", "西（W）"],
        ["2:01 - 2:30", "ポジション3", "東（E）"],
        ["2:31 - 3:00", "ポジション3", "北（N）"],
        ["3:01 - 3:30", "ポジション4", "北西（NW）"],
        ["3:31 - 4:00", "ポジション4", "北東（NE）"],
        ["4:01 - 4:30", "ポジション5", "北（N）"],
        ["4:30+", "ポジション5", "北東（NE）"],
    ];


    let root = null;
    let commonUi = null;


    /* ========================================================
       ゲームクリア
    ======================================================== */

    function completePuzzle() {

        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            true
        );

        closePuzzle();
    }


    /* ========================================================
       表を作成
    ======================================================== */

    function createTableRows() {

        return TABLE_DATA.map((row, index) => {

            const finalClass =
                index === TABLE_DATA.length - 1
                    ? " final-row"
                    : "";

            return `
                <tr class="${finalClass}">
                    <td>
                        ${row[0]}
                    </td>

                    <td>
                        ${row[1]}
                    </td>

                    <td class="final-direction">
                        ${row[2]}
                    </td>
                </tr>
            `;

        }).join("");
    }


    /* ========================================================
       mount
    ======================================================== */

    function mount(target) {

        root = target;


        /* ----------------------------------------------------
           共通ヘッダー
        ---------------------------------------------------- */

        commonUi = PuzzleCommon.create({

            number: "13",

            title: "最終安定化プロトコル",

            description:
                "このパズルはセッションの最終ステップです。他のすべてのパズルが解かれるまで有効になりません。",

            showGauges: false,
        });


        root.innerHTML = "";

        root.appendChild(commonUi);


        /* ----------------------------------------------------
           メインコンテンツ
        ---------------------------------------------------- */

        const content =
            document.createElement("div");

        content.className =
            "final-stabilization-content";


        content.innerHTML = `

            <section class="final-stabilization-panel">


                <!-- ================================
                     FINAL
                ================================= -->

                <div class="final-stabilization-badge">
                    FINAL
                </div>


                <!-- ================================
                     説明
                ================================= -->

                <div class="final-stabilization-message">

                    残り時間を確認し、<br>
                    対応する左レバーと<br>
                    右レバー（ジョイスティック）を<br>
                    操作してください。

                </div>


                <!-- ================================
                     対応表
                ================================= -->

                <div class="final-stabilization-table-scroll">

                    <table class="final-stabilization-table">

                        <thead>

                            <tr>

                                <th>
                                    残り時間
                                </th>

                                <th>
                                    左レバー
                                </th>

                                <th>
                                    右レバー
                                    <br>
                                    <span>
                                        （ジョイスティック）
                                    </span>
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${createTableRows()}

                        </tbody>

                    </table>

                </div>


                <!-- ================================
                     ゲームクリア
                ================================= -->

                <button
                    type="button"
                    id="finalStabilizationComplete"
                    class="final-stabilization-complete"
                >
                    ゲームクリアを登録
                </button>


            </section>

        `;


        root.appendChild(content);


        /* ----------------------------------------------------
           ゲームクリアボタン
        ---------------------------------------------------- */

        const completeButton =
            root.querySelector(
                "#finalStabilizationComplete"
            );


        if (completeButton) {

            completeButton.addEventListener(
                "click",
                completePuzzle
            );
        }
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


        commonUi = null;
        root = null;
    }


    /* ========================================================
       公開
    ======================================================== */

    return {
        mount,
        unmount,
    };

})();