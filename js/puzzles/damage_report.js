"use strict";

/* ============================================================
   12 損傷報告プロトコル
============================================================ */

const DamageReportPuzzle = (() => {

    const PUZZLE_ID = "damage_report";


    /* ========================================================
       部位
    ======================================================== */

    const PARTS = [
        "nose",
        "tail",
        "left_wing",
        "right_wing",
        "left_jet",
        "right_jet",
    ];


    const PART_NAMES = {
        nose: "先頭部分",
        tail: "後ろの部分",
        left_wing: "左羽",
        right_wing: "右羽",
        left_jet: "左ジェット",
        right_jet: "右ジェット",
    };


    /* ========================================================
       損傷パターン

       true  = 損傷あり
       false = 損傷なし
    ======================================================== */

    const DAMAGE_PATTERNS = [

        {
            code: "4071",
            nose: true,
            tail: false,
            left_wing: false,
            right_wing: true,
            left_jet: false,
            right_jet: false,
        },

        {
            code: "8296",
            nose: false,
            tail: false,
            left_wing: true,
            right_wing: false,
            left_jet: false,
            right_jet: true,
        },

        {
            code: "3518",
            nose: false,
            tail: true,
            left_wing: false,
            right_wing: false,
            left_jet: false,
            right_jet: true,
        },

        {
            code: "6743",
            nose: true,
            tail: false,
            left_wing: false,
            right_wing: false,
            left_jet: true,
            right_jet: false,
        },

        {
            code: "9152",
            nose: true,
            tail: false,
            left_wing: true,
            right_wing: false,
            left_jet: false,
            right_jet: true,
        },

        {
            code: "2807",
            nose: false,
            tail: true,
            left_wing: true,
            right_wing: false,
            left_jet: true,
            right_jet: false,
        },

        {
            code: "5634",
            nose: true,
            tail: true,
            left_wing: false,
            right_wing: true,
            left_jet: false,
            right_jet: false,
        },

        {
            code: "7429",
            nose: false,
            tail: false,
            left_wing: false,
            right_wing: true,
            left_jet: true,
            right_jet: false,
        },

        {
            code: "1386",
            nose: true,
            tail: false,
            left_wing: false,
            right_wing: true,
            left_jet: true,
            right_jet: true,
        },

        {
            code: "6015",
            nose: false,
            tail: true,
            left_wing: true,
            right_wing: true,
            left_jet: true,
            right_jet: false,
        },

        {
            code: "8972",
            nose: true,
            tail: true,
            left_wing: true,
            right_wing: false,
            left_jet: false,
            right_jet: true,
        },

        {
            code: "3260",
            nose: true,
            tail: false,
            left_wing: true,
            right_wing: true,
            left_jet: false,
            right_jet: true,
        },

        {
            code: "5497",
            nose: true,
            tail: true,
            left_wing: false,
            right_wing: true,
            left_jet: true,
            right_jet: true,
        },

        {
            code: "2731",
            nose: true,
            tail: true,
            left_wing: true,
            right_wing: true,
            left_jet: true,
            right_jet: false,
        },

        {
            code: "9048",
            nose: false,
            tail: true,
            left_wing: true,
            right_wing: true,
            left_jet: true,
            right_jet: true,
        },

        {
            code: "4165",
            nose: true,
            tail: false,
            left_wing: true,
            right_wing: true,
            left_jet: true,
            right_jet: true,
        },
    ];


    /* ========================================================
       状態
    ======================================================== */

    let root = null;
    let commonUi = null;

    let damage = createEmptyDamage();


    /* ========================================================
       空状態
    ======================================================== */

    function createEmptyDamage() {

        return {
            nose: false,
            tail: false,
            left_wing: false,
            right_wing: false,
            left_jet: false,
            right_jet: false,
        };
    }


    /* ========================================================
       保存読み込み
    ======================================================== */

    function loadProgress() {

        const saved =
            MaydayStore.getPuzzleData(
                PUZZLE_ID
            ) || {};


        damage =
            createEmptyDamage();


        if (
            !saved.damage ||
            typeof saved.damage !== "object" ||
            Array.isArray(saved.damage)
        ) {
            return;
        }


        PARTS.forEach(
            part => {

                damage[part] =
                    saved.damage[part] === true;
            }
        );
    }


    /* ========================================================
       保存
    ======================================================== */

    function saveProgress() {

        MaydayStore.setPuzzleData(
            PUZZLE_ID,
            {
                damage: {
                    ...damage,
                },
            }
        );
    }


    /* ========================================================
       損傷数
    ======================================================== */

    function getDamageCount() {

        return PARTS.filter(
            part => damage[part]
        ).length;
    }


    /* ========================================================
       一致するコード
    ======================================================== */

    function getMatchingPattern() {

        for (
            const pattern
            of DAMAGE_PATTERNS
        ) {

            let matched = true;


            for (
                const part
                of PARTS
            ) {

                if (
                    damage[part] !==
                    pattern[part]
                ) {

                    matched = false;
                    break;
                }
            }


            if (matched) {
                return pattern;
            }
        }


        return null;
    }


    /* ========================================================
       部位クリック
    ======================================================== */

    function toggleDamage(
        part
    ) {

        if (
            !PARTS.includes(
                part
            )
        ) {
            return;
        }


        damage[part] =
            !damage[part];


        saveProgress();

        refreshAll();


        /*
         * パターンが一致したら
         * 報告コードへスクロール
         */

        if (
            getMatchingPattern()
        ) {

            window.setTimeout(
                () => {

                    scrollToCode();

                },
                100
            );
        }
    }


    /* ========================================================
       全リセット
    ======================================================== */

    function resetDamage() {

        damage =
            createEmptyDamage();


        saveProgress();

        refreshAll();


        window.setTimeout(
            () => {

                const panel =
                    root?.querySelector(
                        "#damageSelection"
                    );


                if (panel) {

                    panel.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }

            },
            100
        );
    }


    /* ========================================================
       コード位置へ
    ======================================================== */

    function scrollToCode() {

        if (!root) {
            return;
        }


        const element =
            root.querySelector(
                "#damageCodePanel"
            );


        if (!element) {
            return;
        }


        element.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }


    /* ========================================================
       部位ボタン更新
    ======================================================== */

    function refreshPartButtons() {

        if (!root) {
            return;
        }


        root
            .querySelectorAll(
                ".damage-part-button"
            )
            .forEach(
                button => {

                    const part =
                        button.dataset.part;


                    const selected =
                        damage[part] === true;


                    button.classList.toggle(
                        "damaged",
                        selected
                    );


                    const state =
                        button.querySelector(
                            ".damage-part-state"
                        );


                    if (state) {

                        state.textContent =
                            selected
                                ? "損傷あり"
                                : "損傷なし";
                    }
                }
            );
    }


    /* ========================================================
       現在の損傷表示
    ======================================================== */

    function refreshDamageStatus() {

        if (!root) {
            return;
        }


        const label =
            root.querySelector(
                "#damageCurrentStatus"
            );


        if (!label) {
            return;
        }


        const damagedParts =
            PARTS.filter(
                part => damage[part]
            );


        if (
            damagedParts.length === 0
        ) {

            label.textContent =
                "現在の損傷：なし";

            return;
        }


        label.textContent =
            "現在の損傷：" +
            damagedParts
                .map(
                    part =>
                        PART_NAMES[part]
                )
                .join(" / ");
    }


    /* ========================================================
       飛行機上の表示更新
    ======================================================== */

    function refreshAirplaneMarkers() {

        if (!root) {
            return;
        }


        root
            .querySelectorAll(
                ".damage-airplane-marker"
            )
            .forEach(
                marker => {

                    const part =
                        marker.dataset.part;


                    marker.classList.toggle(
                        "damaged",
                        damage[part] === true
                    );
                }
            );
    }


    /* ========================================================
       報告コード
    ======================================================== */

    function refreshCode() {

        if (!root) {
            return;
        }


        const pattern =
            getMatchingPattern();


        const code =
            root.querySelector(
                "#damageCode"
            );


        const message =
            root.querySelector(
                "#damageCodeMessage"
            );


        const complete =
            root.querySelector(
                "#damageComplete"
            );


        if (
            !code ||
            !message ||
            !complete
        ) {
            return;
        }


        /* =====================================================
           一致
        ===================================================== */

        if (pattern) {

            code.textContent =
                pattern.code;


            code.classList.add(
                "matched"
            );


            message.textContent =
                "損傷パターンが一致しました";


            complete.disabled =
                false;


            return;
        }


        /* =====================================================
           未一致
        ===================================================== */

        code.textContent =
            "----";


        code.classList.remove(
            "matched"
        );


        if (
            getDamageCount() === 0
        ) {

            message.textContent =
                "損傷箇所を選択してください";

        } else {

            message.textContent =
                "一致する損傷パターンはまだありません";
        }


        complete.disabled =
            true;
    }


    /* ========================================================
       全更新
    ======================================================== */

    function refreshAll() {

        refreshPartButtons();

        refreshDamageStatus();

        refreshAirplaneMarkers();

        refreshCode();
    }


    /* ========================================================
       クリア登録
    ======================================================== */

    function completePuzzle() {

        const pattern =
            getMatchingPattern();


        if (!pattern) {
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


        commonUi =
            PuzzleCommon.create({

                number:
                    "12",

                title:
                    "損傷報告プロトコル",

                description:
                    "パイロットから報告された赤い損傷箇所を、飛行機上で選択してください。選択した損傷状態がパターンと一致すると、パイロットへ伝える4桁のコードを表示します。",

                showGauges:
                    false,
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
            "damage-content";


        content.innerHTML = `

            <!-- ==========================================
                 注意
            =========================================== -->

            <div class="damage-warning">

                ※ 赤 = 損傷あり / 灰 = 損傷なし<br>
                ※ もう一度タップすると損傷を取り消せます。

            </div>


            <!-- ==========================================
                 損傷選択
            =========================================== -->

            <section
                id="damageSelection"
                class="damage-panel"
            >

                <h3>
                    損傷箇所を選択
                </h3>


                <!-- ======================================
                     飛行機
                ======================================= -->

                <div class="damage-airplane-wrap">

                    <img
                        class="damage-airplane-image"
                        src="./assets/damage_report/airplane.png"
                        alt="飛行機"
                    >


                    <span
                        class="damage-airplane-marker damage-marker-nose"
                        data-part="nose"
                    ></span>

                    <span
                        class="damage-airplane-marker damage-marker-tail"
                        data-part="tail"
                    ></span>

                    <span
                        class="damage-airplane-marker damage-marker-left-wing"
                        data-part="left_wing"
                    ></span>

                    <span
                        class="damage-airplane-marker damage-marker-right-wing"
                        data-part="right_wing"
                    ></span>

                    <span
                        class="damage-airplane-marker damage-marker-left-jet"
                        data-part="left_jet"
                    ></span>

                    <span
                        class="damage-airplane-marker damage-marker-right-jet"
                        data-part="right_jet"
                    ></span>

                </div>


                <!-- ======================================
                     部位ボタン
                ======================================= -->

                <div class="damage-part-grid">

                    ${PARTS.map(
                        part => `

                            <button
                                type="button"
                                class="damage-part-button"
                                data-part="${part}"
                            >

                                <strong>
                                    ${PART_NAMES[part]}
                                </strong>

                                <span
                                    class="damage-part-state"
                                >
                                    損傷なし
                                </span>

                            </button>

                        `
                    ).join("")}

                </div>


                <!-- ======================================
                     現在の損傷
                ======================================= -->

                <div
                    id="damageCurrentStatus"
                    class="damage-current-status"
                >
                    現在の損傷：なし
                </div>


                <!-- ======================================
                     リセット
                ======================================= -->

                <button
                    type="button"
                    id="damageReset"
                    class="damage-reset"
                >
                    損傷箇所をすべてリセット
                </button>

            </section>


            <!-- ==========================================
                 報告コード
            =========================================== -->

            <section
                id="damageCodePanel"
                class="
                    damage-panel
                    damage-code-panel
                "
            >

                <h3>
                    報告コード
                </h3>


                <div
                    id="damageCode"
                    class="damage-code"
                >
                    ----
                </div>


                <div
                    id="damageCodeMessage"
                    class="damage-code-message"
                >
                    損傷箇所を選択してください
                </div>


                <button
                    type="button"
                    id="damageComplete"
                    class="damage-complete"
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
           部位
        ==================================================== */

        root
            .querySelectorAll(
                ".damage-part-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            toggleDamage(
                                button.dataset.part
                            );
                        }
                    );
                }
            );


        /* ====================================================
           飛行機上の赤マーカーもクリック可能
        ==================================================== */

        root
            .querySelectorAll(
                ".damage-airplane-marker"
            )
            .forEach(
                marker => {

                    marker.addEventListener(
                        "click",
                        () => {

                            toggleDamage(
                                marker.dataset.part
                            );
                        }
                    );
                }
            );


        /* ====================================================
           リセット
        ==================================================== */

        const resetButton =
            root.querySelector(
                "#damageReset"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetDamage
            );
        }


        /* ====================================================
           CLEAR
        ==================================================== */

        const completeButton =
            root.querySelector(
                "#damageComplete"
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


    return {
        mount,
        unmount,
    };

})();