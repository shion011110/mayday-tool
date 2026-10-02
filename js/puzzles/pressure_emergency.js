"use strict";

const PressureEmergencyPuzzle = (() => {

    const PUZZLE_ID = "pressure_emergency";

    let root = null;
    let commonUi = null;
    let currentActivation = null;


    /* =========================================================
       計器取得

       PWAの共通計器IDを使用
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
       1回目
       Oil Pressure
    ========================================================= */

    function calculateFirstCode(value) {

        if (value <= 12) {
            return {
                code: "950",
                range: "Oil Pressure：0～12",
            };
        }

        if (value <= 24) {
            return {
                code: "875",
                range: "Oil Pressure：13～24",
            };
        }

        if (value <= 37) {
            return {
                code: "780",
                range: "Oil Pressure：25～37",
            };
        }

        if (value <= 49) {
            return {
                code: "640",
                range: "Oil Pressure：38～49",
            };
        }

        if (value <= 62) {
            return {
                code: "520",
                range: "Oil Pressure：50～62",
            };
        }

        return {
            code: "410",
            range: "Oil Pressure：63以上",
        };
    }


    /* =========================================================
       2回目
       Temperature
    ========================================================= */

    function calculateSecondCode(value) {

        if (value <= 83) {
            return {
                code: "320",
                range: "Temperature：0～83",
            };
        }

        if (value <= 166) {
            return {
                code: "485",
                range: "Temperature：84～166",
            };
        }

        if (value <= 249) {
            return {
                code: "590",
                range: "Temperature：167～249",
            };
        }

        if (value <= 333) {
            return {
                code: "715",
                range: "Temperature：250～333",
            };
        }

        if (value <= 416) {
            return {
                code: "840",
                range: "Temperature：334～416",
            };
        }

        return {
            code: "960",
            range: "Temperature：417以上",
        };
    }


    /* =========================================================
       3回目
       Tachometer
    ========================================================= */

    function calculateThirdCode(value) {

        if (value <= 500) {
            return {
                code: "105",
                range: "Tachometer：0～500",
            };
        }

        if (value <= 1000) {
            return {
                code: "230",
                range: "Tachometer：501～1000",
            };
        }

        if (value <= 1500) {
            return {
                code: "355",
                range: "Tachometer：1001～1500",
            };
        }

        if (value <= 2000) {
            return {
                code: "470",
                range: "Tachometer：1501～2000",
            };
        }

        if (value <= 2500) {
            return {
                code: "615",
                range: "Tachometer：2001～2500",
            };
        }

        return {
            code: "750",
            range: "Tachometer：2501以上",
        };
    }


    /* =========================================================
       現在の結果
    ========================================================= */

    function getCurrentResult() {

        if (currentActivation === null) {

            return {
                activation: null,
                gaugeName: null,
                value: null,
                code: null,
                range: null,
            };
        }


        /* -----------------------------------------------------
           1回目
        ----------------------------------------------------- */

        if (currentActivation === 1) {

            const value =
                gauge("oil_pressure");

            if (value === null) {

                return {
                    activation: 1,
                    gaugeName: "Oil Pressure",
                    value: null,
                    code: null,
                    range: null,
                };
            }

            const result =
                calculateFirstCode(value);

            return {
                activation: 1,
                gaugeName: "Oil Pressure",
                value,
                code: result.code,
                range: result.range,
            };
        }


        /* -----------------------------------------------------
           2回目
        ----------------------------------------------------- */

        if (currentActivation === 2) {

            const value =
                gauge("temperature");

            if (value === null) {

                return {
                    activation: 2,
                    gaugeName: "Temperature",
                    value: null,
                    code: null,
                    range: null,
                };
            }

            const result =
                calculateSecondCode(value);

            return {
                activation: 2,
                gaugeName: "Temperature",
                value,
                code: result.code,
                range: result.range,
            };
        }


        /* -----------------------------------------------------
           3回目
        ----------------------------------------------------- */

        const value =
            gauge("tachometer");

        if (value === null) {

            return {
                activation: 3,
                gaugeName: "Tachometer",
                value: null,
                code: null,
                range: null,
            };
        }

        const result =
            calculateThirdCode(value);

        return {
            activation: 3,
            gaugeName: "Tachometer",
            value,
            code: result.code,
            range: result.range,
        };
    }


    /* =========================================================
       保存
    ========================================================= */

    function saveActivation() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                last_activation:
                    currentActivation,
            }
        );
    }


    function loadProgress() {

        const data =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            );

        if (
            data
            && [1, 2, 3].includes(
                Number(data.last_activation)
            )
        ) {

            currentActivation =
                Number(
                    data.last_activation
                );

        } else {

            currentActivation =
                null;
        }
    }


    /* =========================================================
       発動選択
    ========================================================= */

    function selectActivation(number) {

        currentActivation =
            number;

        saveActivation();

        refresh();
    }


    /* =========================================================
       表示更新
    ========================================================= */

    function refresh() {

        if (!root) {
            return;
        }


        /* -----------------------------------------------------
           選択ボタン
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".pressure-activation-button"
            )
            .forEach(button => {

                const number =
                    Number(
                        button.dataset.activation
                    );

                button.classList.toggle(
                    "selected",
                    number === currentActivation
                );
            });


        const result =
            getCurrentResult();

        const status =
            root.querySelector(
                "#pressureResultStatus"
            );

        const code =
            root.querySelector(
                "#pressureResultCode"
            );

        const detail =
            root.querySelector(
                "#pressureResultDetail"
            );


        /* -----------------------------------------------------
           未選択
        ----------------------------------------------------- */

        if (
            result.activation === null
        ) {

            status.textContent =
                "発動回数を選択してください";

            code.textContent =
                "---";

            detail.textContent =
                "1回目・2回目・3回目のいずれかを選択してください。";

            return;
        }


        /* -----------------------------------------------------
           計器未入力
        ----------------------------------------------------- */

        if (
            result.value === null
        ) {

            status.textContent =
                `${result.activation}回目の発動`;

            code.textContent =
                "---";

            detail.textContent =
                `${result.gaugeName} が入力されていません。`;

            return;
        }


        /* -----------------------------------------------------
           結果
        ----------------------------------------------------- */

        status.textContent =
            `${result.activation}回目の発動`;

        code.textContent =
            result.code;

        detail.textContent =
            `${result.gaugeName}：${result.value}　／　${result.range}`;
    }


    /* =========================================================
       最初から
    ========================================================= */

    function resetPuzzle() {

        currentActivation =
            null;

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                last_activation: null,
            }
        );

        MaydayStore.setPuzzleCompleted(
            PUZZLE_ID,
            false
        );

        refresh();
    }


    /* =========================================================
       ゲームクリア

       PWA統一仕様
       保存 → CLEAR → ホーム
    ========================================================= */

    function completePuzzle() {

        saveActivation();

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

           07は共通計器あり
        ----------------------------------------------------- */

        commonUi =
            PuzzleCommon.create({

                number:
                    "07",

                title:
                    "圧力緊急対応",

                description:
                    "発動回数を選択し、対応する共通計器の値から3桁のコードを確認します。",

                showGauges:
                    true,

                onGaugeChanged:
                    () => {
                        refresh();
                    },
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
            "pressure-emergency-content";

        content.innerHTML = `

            <!-- ============================================
                 発動回数
            ============================================= -->

            <section
                class="pressure-activation-panel"
            >

                <div
                    class="pressure-activation-grid"
                >

                    <div
                        class="pressure-activation-item first"
                    >

                        <div
                            class="pressure-activation-title"
                        >
                            1回目
                        </div>

                        <div
                            class="pressure-reference"
                        >
                            Oil Pressure
                        </div>

                        <button
                            type="button"
                            class="pressure-activation-button"
                            data-activation="1"
                        >
                            1回目の発動
                        </button>

                    </div>


                    <div
                        class="pressure-activation-item second"
                    >

                        <div
                            class="pressure-activation-title"
                        >
                            2回目
                        </div>

                        <div
                            class="pressure-reference"
                        >
                            Temperature
                        </div>

                        <button
                            type="button"
                            class="pressure-activation-button"
                            data-activation="2"
                        >
                            2回目の発動
                        </button>

                    </div>


                    <div
                        class="pressure-activation-item third"
                    >

                        <div
                            class="pressure-activation-title"
                        >
                            3回目
                        </div>

                        <div
                            class="pressure-reference"
                        >
                            Tachometer
                        </div>

                        <button
                            type="button"
                            class="pressure-activation-button"
                            data-activation="3"
                        >
                            3回目の発動
                        </button>

                    </div>

                </div>

            </section>


            <!-- ============================================
                 結果
            ============================================= -->

            <section
                class="pressure-result-panel"
            >

                <div
                    id="pressureResultStatus"
                    class="pressure-result-status"
                >
                    発動回数を選択してください
                </div>


                <div
                    id="pressureResultCode"
                    class="pressure-result-code"
                >
                    ---
                </div>


                <div
                    id="pressureResultDetail"
                    class="pressure-result-detail"
                ></div>

            </section>


            <!-- ============================================
                 CLEAR
            ============================================= -->

            <button
                type="button"
                id="pressureComplete"
                class="button pressure-complete"
            >
                ゲームクリアを登録
            </button>


            <!-- ============================================
                 RESET
            ============================================= -->

            <button
                type="button"
                id="pressureReset"
                class="pressure-reset"
            >
                最初からやり直す
            </button>

        `;


        root.appendChild(
            content
        );


        /* -----------------------------------------------------
           発動ボタン
        ----------------------------------------------------- */

        root
            .querySelectorAll(
                ".pressure-activation-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectActivation(
                            Number(
                                button.dataset.activation
                            )
                        );
                    }
                );
            });


        /* -----------------------------------------------------
           CLEAR
        ----------------------------------------------------- */

        root
            .querySelector(
                "#pressureComplete"
            )
            .addEventListener(
                "click",
                completePuzzle
            );


        /* -----------------------------------------------------
           RESET
        ----------------------------------------------------- */

        root
            .querySelector(
                "#pressureReset"
            )
            .addEventListener(
                "click",
                resetPuzzle
            );


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