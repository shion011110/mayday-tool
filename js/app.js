"use strict";


/* ==========================================================
   パズル
========================================================== */

const PUZZLES = [

    {
        id: "signal_color",
        number: "01",
        name: "色ボタン"
    },

    {
        id: "emergency_frequency",
        number: "02",
        name: "118"
    },

    {
        id: "threat_mapping",
        number: "03",
        name: "将棋"
    },

    {
        id: "altitude_verification",
        number: "04",
        name: "英単語と数字"
    },

    {
        id: "circuit_flow",
        number: "05",
        name: "糸のやつ"
    },

    {
        id: "shape_collision",
        number: "06",
        name: "絵柄のやつ"
    },

    {
        id: "pressure_emergency",
        number: "07",
        name: "じゃまもの"
    },

    {
        id: "multi_circuit_switch",
        number: "08",
        name: "フェーズ3まであるやつ"
    },

    {
        id: "guidance_override",
        number: "09",
        name: "3文字の記号と数字のやつ"
    },

    {
        id: "radar_navigation",
        number: "10",
        name: "レーダー"
    },

    {
        id: "codeword_protocol",
        number: "11",
        name: "色で英語伝えるやつ"
    },

    {
        id: "damage_report",
        number: "12",
        name: "飛行機の故障場所"
    },

    {
        id: "final_stabilization",
        number: "13",
        name: "最終安定化プロトコル"
    }

];


/* ==========================================================
   DOM
========================================================== */

const descriptionToggle =
    document.getElementById(
        "descriptionToggle"
    );

const descriptionPanel =
    document.getElementById(
        "descriptionPanel"
    );

const gaugeToggle =
    document.getElementById(
        "gaugeToggle"
    );

const gaugePanel =
    document.getElementById(
        "gaugePanel"
    );

const puzzleGrid =
    document.getElementById(
        "puzzleGrid"
    );

const clearCount =
    document.getElementById(
        "clearCount"
    );

const puzzleScreen =
    document.getElementById(
        "puzzleScreen"
    );

const puzzleBackButton =
    document.getElementById(
        "puzzleBackButton"
    );

const placeholderNumber =
    document.getElementById(
        "placeholderNumber"
    );

const placeholderTitle =
    document.getElementById(
        "placeholderTitle"
    );

const clearPuzzleDataButton =
    document.getElementById(
        "clearPuzzleDataButton"
    );

const clearAllDataButton =
    document.getElementById(
        "clearAllDataButton"
    );

const dialogOverlay =
    document.getElementById(
        "dialogOverlay"
    );

const dialogTitle =
    document.getElementById(
        "dialogTitle"
    );

const dialogMessage =
    document.getElementById(
        "dialogMessage"
    );

const dialogCancel =
    document.getElementById(
        "dialogCancel"
    );

const dialogConfirm =
    document.getElementById(
        "dialogConfirm"
    );


let dialogAction = null;


/*
   現在開いているパズルID
*/

let currentPuzzleId = null;


/* ==========================================================
   全角数字 → 半角数字
========================================================== */

function normalizeDigits(value) {

    return value.replace(
        /[０-９]/g,
        character => {

            return String.fromCharCode(
                character.charCodeAt(0)
                - 0xFEE0
            );

        }
    );

}


/* ==========================================================
   計器
========================================================== */

function setupGauges() {

    const inputs =
        document.querySelectorAll(
            "[data-gauge]"
        );


    inputs.forEach(input => {

        const gaugeName =
            input.dataset.gauge;

        const savedValue =
            MaydayStore.getGauge(
                gaugeName
            );


        if (savedValue !== null) {

            input.value =
                String(savedValue);
        }


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


                MaydayStore.setGauge(
                    gaugeName,
                    value === ""
                        ? null
                        : value
                );

            }
        );

    });

}


/* ==========================================================
   概要
========================================================== */

function refreshDescription() {

    const visible =
        MaydayStore
            .isDescriptionVisible();


    descriptionPanel.classList.toggle(
        "hidden",
        !visible
    );


    descriptionToggle.textContent =
        visible
            ? "概要を非表示"
            : "概要を表示";

}


descriptionToggle.addEventListener(
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


/* ==========================================================
   概要表示状態の同期
========================================================== */

window.addEventListener(
    "mayday-description-visibility-changed",
    () => {

        refreshDescription();

    }
);


/* ==========================================================
   計器表示
========================================================== */

function refreshGaugeVisibility() {

    const visible =
        MaydayStore
            .isGaugeVisible();


    gaugePanel.classList.toggle(
        "hidden",
        !visible
    );


    gaugeToggle.textContent =
        visible
            ? "計器を非表示"
            : "計器を表示";

}


gaugeToggle.addEventListener(
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


/* ==========================================================
   計器表示状態の同期
========================================================== */

window.addEventListener(
    "mayday-gauge-visibility-changed",
    () => {

        refreshGaugeVisibility();

    }
);


/* ==========================================================
   パズル一覧
========================================================== */

function renderPuzzleGrid() {

    puzzleGrid.innerHTML = "";

    let completedCount = 0;


    PUZZLES.forEach(puzzle => {

        const completed =
            MaydayStore
                .isPuzzleCompleted(
                    puzzle.id
                );


        if (completed) {

            completedCount += 1;
        }


        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "puzzle-button";


        if (completed) {

            button.classList.add(
                "completed"
            );
        }


        const number =
            document.createElement(
                "span"
            );

        number.className =
            "puzzle-number";

        number.textContent =
            puzzle.number;


        const name =
            document.createElement(
                "span"
            );

        name.className =
            "puzzle-name";

        name.textContent =
            puzzle.name;


        const status =
            document.createElement(
                "span"
            );

        status.className =
            "puzzle-status";

        status.textContent =
            completed
                ? "✓ CLEAR"
                : "OPEN";


        button.append(
            number,
            name,
            status
        );


        button.addEventListener(
            "click",
            () => {

                navigateToPuzzle(
                    puzzle
                );

            }
        );


        puzzleGrid.appendChild(
            button
        );

    });


    clearCount.textContent =
        `${completedCount} / ${PUZZLES.length} CLEAR`;

}


/* ==========================================================
   URLをパズル用に変更
========================================================== */

function setPuzzleUrl(
    puzzleId,
    replace = false
) {

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "puzzle",
        puzzleId
    );


    if (replace) {

        history.replaceState(
            {
                puzzle:
                    puzzleId
            },
            "",
            url
        );

    } else {

        history.pushState(
            {
                puzzle:
                    puzzleId
            },
            "",
            url
        );
    }

}


/* ==========================================================
   URLをホーム用に変更
========================================================== */

function setHomeUrl(
    replace = false
) {

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.delete(
        "puzzle"
    );


    if (replace) {

        history.replaceState(
            {
                puzzle: null
            },
            "",
            url
        );

    } else {

        history.pushState(
            {
                puzzle: null
            },
            "",
            url
        );
    }

}


/* ==========================================================
   パズルを選択
========================================================== */

function navigateToPuzzle(
    puzzle
) {

    /*
       まずURLを変更
    */

    setPuzzleUrl(
        puzzle.id,
        false
    );


    /*
       その後パズルを表示
    */

    openPuzzle(
        puzzle
    );

}


/* ==========================================================
   パズルを開く
========================================================== */

function openPuzzle(
    puzzle
) {

    if (!puzzle) {

        return;
    }

    currentPuzzleId =
        puzzle.id;

    if (
        placeholderTitle
        && placeholderTitle.isConnected
    ) {

        placeholderTitle.textContent =
            puzzle.name;
    }

    puzzleScreen.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    puzzleScreen.scrollTo({
        top: 0,
        behavior: "auto"
    });


    /* ======================================================
       01 色ボタン
    ====================================================== */

    if (
        puzzle.id === "signal_color"
        && typeof SignalColorPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );


        placeholderPanel.innerHTML = `
            <div
                id="signalColorRoot"
            ></div>
        `;


        SignalColorPuzzle.mount(
            document.getElementById(
                "signalColorRoot"
            )
        );


        return;
    }


    /* ======================================================
       02 118
    ====================================================== */

    if (
        puzzle.id === "emergency_frequency"
        && typeof EmergencyFrequencyPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );


        placeholderPanel.innerHTML = `
            <div
                id="emergencyFrequencyRoot"
            ></div>
        `;


        EmergencyFrequencyPuzzle.mount(
            document.getElementById(
                "emergencyFrequencyRoot"
            )
        );


        return;
    }

    /* ======================================================
       03 将棋
    ====================================================== */

    if (
        puzzle.id === "threat_mapping"
        && typeof ThreatMappingPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );


        placeholderPanel.innerHTML = `
            <div
                id="threatMappingRoot"
            ></div>
        `;


        ThreatMappingPuzzle.mount(
            document.getElementById(
                "threatMappingRoot"
            )
        );


        return;
    }

    /* ======================================================
       04 英単語と数字
    ====================================================== */

    if (
        puzzle.id === "altitude_verification"
        && typeof AltitudeVerificationPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="altitudeVerificationRoot"></div>
        `;

        AltitudeVerificationPuzzle.mount(
            document.getElementById(
                "altitudeVerificationRoot"
            )
        );

        return;
    }

    /* ======================================================
       05 糸のやつ
    ====================================================== */

    if (
        puzzle.id === "circuit_flow"
        && typeof CircuitFlowPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );


        placeholderPanel.innerHTML = `
            <div id="circuitFlowRoot"></div>
        `;


        CircuitFlowPuzzle.mount(
            document.getElementById(
                "circuitFlowRoot"
            )
        );


        return;
    }

    /* ======================================================
       07 じゃまもの
    ====================================================== */

    if (
        puzzle.id === "pressure_emergency"
        && typeof PressureEmergencyPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="pressureEmergencyRoot"></div>
        `;

        PressureEmergencyPuzzle.mount(
            document.getElementById(
                "pressureEmergencyRoot"
            )
        );

        return;
    }

    /* ======================================================
       08 フェーズ3まであるやつ
    ====================================================== */

    if (
        puzzle.id === "multi_circuit_switch"
        && typeof MultiCircuitSwitchPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="multiCircuitSwitchRoot"></div>
        `;

        MultiCircuitSwitchPuzzle.mount(
            document.getElementById(
                "multiCircuitSwitchRoot"
            )
        );

        return;
    }

    /* ======================================================
       09 誘導オーバーライド
    ====================================================== */

    if (
        puzzle.id === "guidance_override"
        && typeof GuidanceOverridePuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="guidanceOverrideRoot"></div>
        `;

        GuidanceOverridePuzzle.mount(
            document.getElementById(
                "guidanceOverrideRoot"
            )
        );

        return;
    }

    /* ======================================================
       10 レーダー
    ====================================================== */

    if (
        puzzle.id === "radar_navigation" &&
        typeof RadarNavigationPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="radarNavigationRoot"></div>
        `;

        RadarNavigationPuzzle.mount(
            document.getElementById(
                "radarNavigationRoot"
            )
        );

        return;
    }

    /* ======================================================
       11 色で英語伝えるやつ
    ====================================================== */

    if (
        puzzle.id === "codeword_protocol" &&
        typeof CodewordProtocolPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="codewordProtocolRoot"></div>
        `;

        CodewordProtocolPuzzle.mount(
            document.getElementById(
                "codewordProtocolRoot"
            )
        );

        return;
    }

    /* ======================================================
       12 飛行機の故障場所
    ====================================================== */

    if (
        puzzle.id === "damage_report" &&
        typeof DamageReportPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="damageReportRoot"></div>
        `;

        DamageReportPuzzle.mount(
            document.getElementById(
                "damageReportRoot"
            )
        );

        return;
    }

    /* ======================================================
       13 最終安定化プロトコル
    ====================================================== */

    if (
        puzzle.id === "final_stabilization" &&
        typeof FinalStabilizationPuzzle !== "undefined"
    ) {

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );

        placeholderPanel.innerHTML = `
            <div id="finalStabilizationRoot"></div>
        `;

        FinalStabilizationPuzzle.mount(
            document.getElementById(
                "finalStabilizationRoot"
            )
        );

        return;
    }

        /* ======================================================
            未実装
        ====================================================== */

        const placeholderPanel =
            document.querySelector(
                ".placeholder-panel"
            );


        placeholderPanel.innerHTML = `
            <div class="placeholder-content">

                <div class="placeholder-number">
                    ${puzzle.number}
                </div>

                <h2>
                    ${puzzle.name}
                </h2>

                <p>
                    このパズルは現在作成中です。
                </p>

            </div>
        `;

        /* ======================================================
           06 絵柄のやつ
        ====================================================== */

        if (
            puzzle.id === "shape_collision"
            && typeof ShapeCollisionPuzzle !== "undefined"
        ) {

            const placeholderPanel =
                document.querySelector(
                    ".placeholder-panel"
                );


            placeholderPanel.innerHTML = `
                <div id="shapeCollisionRoot"></div>
            `;


            ShapeCollisionPuzzle.mount(
                document.getElementById(
                    "shapeCollisionRoot"
                )
            );


            return;
        }

    }


/* ==========================================================
   現在のパズルを終了
========================================================== */

function unmountCurrentPuzzle() {

    if (
        currentPuzzleId === "signal_color" &&
        typeof SignalColorPuzzle !== "undefined"
    ) {
        SignalColorPuzzle.unmount();
    }

    if (
        currentPuzzleId === "emergency_frequency" &&
        typeof EmergencyFrequencyPuzzle !== "undefined"
    ) {
        EmergencyFrequencyPuzzle.unmount();
    }

    if (
        currentPuzzleId === "threat_mapping" &&
        typeof ThreatMappingPuzzle !== "undefined"
    ) {
        ThreatMappingPuzzle.unmount();
    }

    if (
        currentPuzzleId === "altitude_verification" &&
        typeof AltitudeVerificationPuzzle !== "undefined"
    ) {
        AltitudeVerificationPuzzle.unmount();
    }

    if (
        currentPuzzleId === "circuit_flow" &&
        typeof CircuitFlowPuzzle !== "undefined"
    ) {
        CircuitFlowPuzzle.unmount();
    }

    if (
        currentPuzzleId === "shape_collision" &&
        typeof ShapeCollisionPuzzle !== "undefined"
    ) {
        ShapeCollisionPuzzle.unmount();
    }

    if (
        currentPuzzleId === "pressure_emergency" &&
        typeof PressureEmergencyPuzzle !== "undefined"
    ) {
        PressureEmergencyPuzzle.unmount();
    }

    if (
        currentPuzzleId === "multi_circuit_switch" &&
        typeof MultiCircuitSwitchPuzzle !== "undefined"
    ) {
        MultiCircuitSwitchPuzzle.unmount();
    }

    if (
        currentPuzzleId === "guidance_override" &&
        typeof GuidanceOverridePuzzle !== "undefined"
    ) {
        GuidanceOverridePuzzle.unmount();
    }

    if (
        currentPuzzleId === "radar_navigation" &&
        typeof RadarNavigationPuzzle !== "undefined"
    ) {
        RadarNavigationPuzzle.unmount();
    }

    if (
        currentPuzzleId === "damage_report" &&
        typeof DamageReportPuzzle !== "undefined"
    ) {
        DamageReportPuzzle.unmount();
    }

    if (
        currentPuzzleId === "final_stabilization" &&
        typeof FinalStabilizationPuzzle !== "undefined"
    ) {
        FinalStabilizationPuzzle.unmount();
    }

    /* ======================================================
       11 コードワード
    ====================================================== */

    if (
        currentPuzzleId === "codeword_protocol" &&
        typeof CodewordProtocolPuzzle !== "undefined"
    ) {
        CodewordProtocolPuzzle.unmount();
    }


    currentPuzzleId = null;
}

/* ==========================================================
   パズル画面を非表示
========================================================== */

function hidePuzzleScreen() {

    unmountCurrentPuzzle();


    puzzleScreen.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";


    refreshDescription();

    refreshGaugeVisibility();

    renderPuzzleGrid();

}


/* ==========================================================
   パズルの「戻る」
========================================================== */

function closePuzzle() {

    /*
       URLにパズルが入っている場合は
       ブラウザ履歴を1つ戻す。

       これでホームへ戻る。
    */

    const url =
        new URL(
            window.location.href
        );


    if (
        url.searchParams.has(
            "puzzle"
        )
    ) {

        history.back();

        return;
    }


    /*
       URLにpuzzleがない特殊ケース
    */

    hidePuzzleScreen();

}


puzzleBackButton.addEventListener(
    "click",
    closePuzzle
);


/* ==========================================================
   URLから現在の画面を復元
========================================================== */

function restoreScreenFromUrl() {

    const url =
        new URL(
            window.location.href
        );


    const puzzleId =
        url.searchParams.get(
            "puzzle"
        );


    /* ======================================================
       puzzle指定なし → ホーム
    ====================================================== */

    if (!puzzleId) {

        hidePuzzleScreen();

        return;
    }


    /* ======================================================
       IDからパズルを探す
    ====================================================== */

    const puzzle =
        PUZZLES.find(
            item =>
                item.id === puzzleId
        );


    /*
       不正なIDならホームへ戻す
    */

    if (!puzzle) {

        setHomeUrl(
            true
        );


        hidePuzzleScreen();

        return;
    }


    /*
       すでに別パズルが開いている場合は
       先に終了。
    */

    if (
        currentPuzzleId
        && currentPuzzleId
            !== puzzle.id
    ) {

        unmountCurrentPuzzle();
    }


    /*
       同じパズルがすでに開いている場合は
       再mountしない。
    */

    if (
        currentPuzzleId
        === puzzle.id
        && !puzzleScreen
            .classList
            .contains(
                "hidden"
            )
    ) {

        return;
    }


    openPuzzle(
        puzzle
    );

}


/* ==========================================================
   ブラウザの戻る / 進む
========================================================== */

window.addEventListener(
    "popstate",
    () => {

        restoreScreenFromUrl();

    }
);


/* ==========================================================
   ダイアログ
========================================================== */

function showDialog(
    title,
    message,
    action
) {

    dialogTitle.textContent =
        title;

    dialogMessage.textContent =
        message;

    dialogAction =
        action;

    dialogOverlay.classList.remove(
        "hidden"
    );

}


function closeDialog() {

    dialogOverlay.classList.add(
        "hidden"
    );

    dialogAction = null;

}


dialogCancel.addEventListener(
    "click",
    closeDialog
);


dialogOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target
            === dialogOverlay
        ) {

            closeDialog();
        }

    }
);


dialogConfirm.addEventListener(
    "click",
    () => {

        const action =
            dialogAction;

        closeDialog();


        if (action) {

            action();
        }

    }
);


/* ==========================================================
   パズルデータリセット
========================================================== */

clearPuzzleDataButton.addEventListener(
    "click",
    () => {

        showDialog(
            "パズル進行状況をリセット",
            "共通計器は残したまま、パズルの進行状況とクリア状態をすべてリセットします。",
            () => {

                MaydayStore
                    .clearPuzzleData();


                renderPuzzleGrid();

            }
        );

    }
);


/* ==========================================================
   全データリセット
========================================================== */

clearAllDataButton.addEventListener(
    "click",
    () => {

        showDialog(
            "すべてのデータをリセット",
            "共通計器を含む、保存されているすべてのデータをリセットします。",
            () => {

                MaydayStore
                    .clearAllData();


                /*
                   URLもホームへ戻してから再読み込み
                */

                setHomeUrl(
                    true
                );


                location.reload();

            }
        );

    }
);


/* ==========================================================
   Service Worker
========================================================== */

function registerServiceWorker() {

    if (
        "serviceWorker"
        in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator
                    .serviceWorker
                    .register(
                        "./service-worker.js"
                    )
                    .then(registration => {

                        console.log(
                            "Service Worker registered:",
                            registration.scope
                        );

                    })
                    .catch(error => {

                        console.warn(
                            "Service Worker registration failed:",
                            error
                        );

                    });

            }
        );

    }

}


/* ==========================================================
   初期URL状態を登録
========================================================== */

function initializeHistoryState() {

    const url =
        new URL(
            window.location.href
        );


    const puzzleId =
        url.searchParams.get(
            "puzzle"
        );


    history.replaceState(
        {
            puzzle:
                puzzleId || null
        },
        "",
        url
    );

}


/* ==========================================================
   初期化
========================================================== */

function initialize() {

    setupGauges();

    refreshDescription();

    refreshGaugeVisibility();

    renderPuzzleGrid();


    /*
       現在のURLを履歴状態として登録
    */

    initializeHistoryState();


    /*
       URLに ?puzzle= があれば
       そのパズルを自動で開く。
    */

    restoreScreenFromUrl();


    registerServiceWorker();

}


initialize();