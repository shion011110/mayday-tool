"use strict";


/* ==========================================================
   パズル画面 共通UI
   ・概要
   ・共通計器

   表示状態は MaydayStore を唯一の正解とする。
   ホームとパズルで別の表示状態を持たない。
========================================================== */

const PuzzleCommon = (() => {

    const GAUGES = [
        {
            id: "fuel",
            name: "Fuel"
        },
        {
            id: "oil_pressure",
            name: "Oil Pressure"
        },
        {
            id: "airspeed",
            name: "Airspeed"
        },
        {
            id: "altimeter",
            name: "Altimeter"
        },
        {
            id: "tachometer",
            name: "Tachometer"
        },
        {
            id: "temperature",
            name: "Temperature"
        },
        {
            id: "ammeter",
            name: "Ammeter"
        }
    ];


    /* ======================================================
       全角数字 → 半角数字
    ====================================================== */

    function normalizeDigits(value) {

        return String(value).replace(
            /[０-９]/g,
            character => {

                return String.fromCharCode(
                    character.charCodeAt(0)
                    - 0xFEE0
                );

            }
        );
    }


    /* ======================================================
       共通UI生成
    ====================================================== */

    function create(options = {}) {

        const {
            number = "",
            title = "",
            description = "",
            showGauges = false,
            onGaugeChanged = null
        } = options;


        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "puzzle-common";


        /* ==================================================
           タイトル行
        ================================================== */

        const titleRow =
            document.createElement(
                "div"
            );

        titleRow.className =
            "puzzle-common-title-row";


        const titleBlock =
            document.createElement(
                "div"
            );

        titleBlock.className =
            "puzzle-common-title-block";


        const numberElement =
            document.createElement(
                "div"
            );

        numberElement.className =
            "puzzle-common-number";

        numberElement.textContent =
            number;


        const titleElement =
            document.createElement(
                "h2"
            );

        titleElement.className =
            "puzzle-common-title";

        titleElement.textContent =
            title;


        titleBlock.append(
            numberElement,
            titleElement
        );


        /* ==================================================
           操作ボタン
        ================================================== */

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "puzzle-common-actions";


        const descriptionButton =
            document.createElement(
                "button"
            );

        descriptionButton.type =
            "button";

        descriptionButton.className =
            "button button-secondary small-button";


        actions.appendChild(
            descriptionButton
        );


        let gaugeButton = null;


        if (showGauges) {

            gaugeButton =
                document.createElement(
                    "button"
                );

            gaugeButton.type =
                "button";

            gaugeButton.className =
                "button button-secondary small-button";


            actions.appendChild(
                gaugeButton
            );
        }


        titleRow.append(
            titleBlock,
            actions
        );


        wrapper.appendChild(
            titleRow
        );


        /* ==================================================
           概要
        ================================================== */

        const descriptionPanel =
            document.createElement(
                "div"
            );

        descriptionPanel.className =
            "puzzle-common-description";

        descriptionPanel.textContent =
            description;


        wrapper.appendChild(
            descriptionPanel
        );


        /* ==================================================
           共通計器
        ================================================== */

        let gaugePanel = null;


        if (showGauges) {

            gaugePanel =
                document.createElement(
                    "section"
                );

            gaugePanel.className =
                "puzzle-common-gauges";


            const gaugeHeading =
                document.createElement(
                    "div"
                );

            gaugeHeading.className =
                "puzzle-common-gauge-heading";

            gaugeHeading.textContent =
                "共通計器";


            const gaugeGrid =
                document.createElement(
                    "div"
                );

            gaugeGrid.className =
                "puzzle-common-gauge-grid";


            GAUGES.forEach(gauge => {

                const card =
                    document.createElement(
                        "label"
                    );

                card.className =
                    "puzzle-common-gauge-card";


                const name =
                    document.createElement(
                        "span"
                    );

                name.className =
                    "puzzle-common-gauge-name";

                name.textContent =
                    gauge.name;


                const input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "text";

                input.inputMode =
                    "numeric";

                input.pattern =
                    "[0-9]*";

                input.placeholder =
                    "未入力";

                input.dataset.puzzleGauge =
                    gauge.id;


                /* ==========================================
                   保存値を表示
                ========================================== */

                const savedValue =
                    MaydayStore.getGauge(
                        gauge.id
                    );


                if (savedValue !== null) {

                    input.value =
                        String(savedValue);
                }


                /* ==========================================
                   計器入力
                ========================================== */

                input.addEventListener(
                    "input",
                    () => {

                        let value =
                            normalizeDigits(
                                input.value
                            );


                        value =
                            value.replace(
                                /[^0-9]/g,
                                ""
                            );


                        input.value =
                            value;


                        const storeValue =
                            value === ""
                                ? null
                                : parseInt(
                                    value,
                                    10
                                );


                        MaydayStore.setGauge(
                            gauge.id,
                            storeValue
                        );


                        /*
                           ホーム側の計器入力欄にも反映
                        */

                        const homeInput =
                            document.querySelector(
                                `[data-gauge="${gauge.id}"]`
                            );


                        if (homeInput) {

                            homeInput.value =
                                value;
                        }


                        /*
                           パズル本体へ通知
                        */

                        if (
                            typeof onGaugeChanged
                            === "function"
                        ) {

                            onGaugeChanged(
                                gauge.id,
                                storeValue
                            );
                        }

                    }
                );


                card.append(
                    name,
                    input
                );


                gaugeGrid.appendChild(
                    card
                );

            });


            gaugePanel.append(
                gaugeHeading,
                gaugeGrid
            );


            wrapper.appendChild(
                gaugePanel
            );
        }


        /* ==================================================
           概要表示更新
        ================================================== */

        function refreshDescription() {

            const visible =
                MaydayStore
                    .isDescriptionVisible();


            descriptionPanel.classList.toggle(
                "hidden",
                !visible
            );


            descriptionButton.textContent =
                visible
                    ? "概要を非表示"
                    : "概要を表示";
        }


        /* ==================================================
           計器表示更新
        ================================================== */

        function refreshGauges() {

            if (
                !showGauges
                || !gaugePanel
                || !gaugeButton
            ) {

                return;
            }


            const visible =
                MaydayStore
                    .isGaugeVisible();


            gaugePanel.classList.toggle(
                "hidden",
                !visible
            );


            gaugeButton.textContent =
                visible
                    ? "計器を非表示"
                    : "計器を表示";
        }


        /* ==================================================
           概要ボタン

           Store変更
             ↓
           Storeがイベント発行
             ↓
           ホーム・パズル双方が更新
        ================================================== */

        descriptionButton.addEventListener(
            "click",
            () => {

                const next =
                    !MaydayStore
                        .isDescriptionVisible();


                MaydayStore
                    .setDescriptionVisible(
                        next
                    );

            }
        );


        /* ==================================================
           計器ボタン
        ================================================== */

        if (gaugeButton) {

            gaugeButton.addEventListener(
                "click",
                () => {

                    const next =
                        !MaydayStore
                            .isGaugeVisible();


                    MaydayStore
                        .setGaugeVisible(
                            next
                        );

                }
            );
        }


        /* ==================================================
           概要イベント受信
        ================================================== */

        const descriptionVisibilityHandler =
            () => {

                refreshDescription();

            };


        window.addEventListener(
            "mayday-description-visibility-changed",
            descriptionVisibilityHandler
        );


        /* ==================================================
           計器イベント受信
        ================================================== */

        const gaugeVisibilityHandler =
            () => {

                refreshGauges();

            };


        window.addEventListener(
            "mayday-gauge-visibility-changed",
            gaugeVisibilityHandler
        );


        /* ==================================================
           初期状態
        ================================================== */

        refreshDescription();

        refreshGauges();


        /* ==================================================
           後始末

           パズルを閉じる時に呼べるようにする
        ================================================== */

        wrapper.destroy =
            () => {

                window.removeEventListener(
                    "mayday-description-visibility-changed",
                    descriptionVisibilityHandler
                );


                window.removeEventListener(
                    "mayday-gauge-visibility-changed",
                    gaugeVisibilityHandler
                );

            };


        return wrapper;
    }


    /* ======================================================
       公開
    ====================================================== */

    return {
        create
    };

})();