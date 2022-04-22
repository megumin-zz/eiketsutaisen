main();

function main() {
    if (!location.href.startsWith("https://eiketsu-taisen.net/members/history/daily")) {
        alert("英傑大戦.NETの対戦履歴ページ又は戦いの記録ページを開いた状態で実行してください");
        return;
    }

    if (isScreenshotMode()) {
        alert("スクリーンショットモードには対応していません、通常モードで実行してください");
        return;
    }

    removeAppendedElements();

    if (location.href.startsWith("https://eiketsu-taisen.net/members/history/daily")) {
        showDeckAtHistory()
    }
}

function getMainElement() {
    const host = document.getElementById('app');
    const elem = host.getElementsByTagName('ekt-main')[0];
    return elem.shadowRoot.querySelectorAll('.mb5');
}


function showDeckAtHistory() {
    appendDeckArea();
    appendToggleNameButton();
}

function removeAppendedElements() {
    const host = document.getElementById('app');
    const elem = host.getElementsByTagName('ekt-main')[0];

    const contentList = elem.shadowRoot.querySelectorAll('.daily_log')[0];

    const appendedElementList = contentList.getElementsByClassName("appended-class");

    if (appendedElementList.length > 0) {
        while (appendedElementList.length) {
            appendedElementList.item(0).remove()
        }
    }

}


function appendDeckArea() {
    const wraparea = getMainElement();
    for (var i = 0; i < wraparea.length; i++) {
        wraparea[i].style.position = "relative";
        wraparea[i].style.height = "135px";
    }

    [].forEach.call(wraparea, (battleBlock, index) => {
        var battleType = battleBlock.getElementsByClassName("ta_r")[0];
        const SHOW_DECK_BATTLE_TYPE = ["全国対戦", "群雄伝", "店内対戦", "戦友対戦"];
        if (SHOW_DECK_BATTLE_TYPE.includes(battleType.textContent)) {
            const myDeckDiv = document.createElement("div");
            myDeckDiv.style.position = "absolute";
            myDeckDiv.style.width = "300px";
            myDeckDiv.style.height = "70px";
            myDeckDiv.classList.add("appended-class");

            const myGageDiv = document.createElement("div");
            myGageDiv.style.position = "relative";
            myGageDiv.classList.add("my-gage");
            myDeckDiv.appendChild(myGageDiv);


            const myCardTable = document.createElement("div");
            const myCardTr = document.createElement("ul");
            myCardTr.style.display = "flex";
            myCardTr.style.justifyContent = "center";
            myCardTr.style.alignContent = "center";
            myCardTr.style.gap = "6px 4px";
            myCardTr.id = battleBlock.href + "_mydata";
            myCardTable.appendChild(myCardTr);
            myDeckDiv.appendChild(myCardTable);



            const enemyDeckDiv = document.createElement("div")
            enemyDeckDiv.style.position = "absolute";
            enemyDeckDiv.style.right = "0";
            enemyDeckDiv.style.width = "300px";
            enemyDeckDiv.style.height = "70px";
            enemyDeckDiv.style.top = "58px";
            enemyDeckDiv.classList.add("appended-class");

            const enemyGageDiv = document.createElement("div");
            enemyGageDiv.style.position = "relative";
            enemyGageDiv.classList.add("enemy-gage");
            enemyDeckDiv.appendChild(enemyGageDiv);

            const enemyCardTable = document.createElement("div");
            enemyCardTable.style.margin = "auto";
            const enemyCardTr = document.createElement("ul");
            enemyCardTr.style.display = "flex";
            enemyCardTr.style.gap = "6px 4px";
            enemyCardTr.style.justifyContent = "center";
            enemyCardTr.style.alignContent = "center";
            enemyCardTr.id = battleBlock.href + "_enemydata";
            enemyCardTable.appendChild(enemyCardTr);
            enemyDeckDiv.appendChild(enemyCardTable);

            battleBlock.appendChild(myDeckDiv)
            battleBlock.appendChild(enemyDeckDiv)

            appendDeck(battleBlock)

        }
    })
}

function appendDeck(historyBlock) {
    const host = document.getElementById('app');
    const elem = host.getElementsByTagName('ekt-main')[0];
    const myDeckArea = elem.shadowRoot.getElementById(historyBlock.href + "_mydata");
    const enemyDeckArea = elem.shadowRoot.getElementById(historyBlock.href + "_enemydata");

    const request = new XMLHttpRequest();
    request.open("GET", historyBlock.href);
    request.responseType = "document";
    request.addEventListener("load", (event) => {
        if (event.target.status !== 200) {
            alert("データ取得に失敗しました、ステータスコード：" + event.target.status);
            return;
        }

        const template = event.target.responseXML.getElementById('template');
        const mygage = event.target.responseXML.importNode(template.content, true);

        const playerwraparea = mygage.querySelector('.gauge_base.player');
        const playerchildwraparea = playerwraparea.querySelectorAll('.gauge')[0]
        playerchildwraparea.style.width = playerchildwraparea.style.width + 'px';
        playerchildwraparea.style.position = "absolute";
        playerchildwraparea.style.background = '#00f000';
        playerchildwraparea.style.height = "20px";
        playerchildwraparea.style.top = "-13px";
        // 城ゲージ
        playerchildwraparea.style.display = "none";

        myDeckArea.parentNode.style.border = "none";
        myDeckArea.parentNode.style.position = "absolute";
        myDeckArea.parentNode.style.top = "0";
        myDeckArea.parentNode.style.left = "0";
        myDeckArea.parentNode.style.right = "0";
        myDeckArea.parentNode.style.margin = "0 auto";

        historyBlock.getElementsByClassName("my-gage")[0].appendChild(playerchildwraparea);
        const myCardList = mygage.querySelector(".detail_data.player").getElementsByClassName("general_data")[0].querySelectorAll(".general_1, .general_2, .general_3, .general_4, .general_5, .general_6, .general_7, .general_8");
        const myCardCount = myCardList.length;
        for (var i = myCardCount - 1; i >= 0; i--) {
            addCardToDeckArea(myDeckArea, myCardList[i]);
        };



        const enemywraparea = mygage.querySelector('.gauge_base.enemy');
        const enemychildwraparea = enemywraparea.querySelectorAll('.gauge')[0]
        enemychildwraparea.style.width = enemychildwraparea.style.width + 'px';
        enemychildwraparea.style.position = "absolute";
        enemychildwraparea.style.background = '#00f000';
        enemychildwraparea.style.height = "20px";
        enemychildwraparea.style.top = "2px";
        // 城ゲージ
        enemychildwraparea.style.display = "none";


        enemyDeckArea.parentNode.style.border = "none";
        enemyDeckArea.parentNode.style.position = "absolute";
        enemyDeckArea.parentNode.style.top = "27px";
        enemyDeckArea.parentNode.style.left = "0";
        enemyDeckArea.parentNode.style.right = "0";
        enemyDeckArea.parentNode.style.margin = "0 auto";

        historyBlock.getElementsByClassName("enemy-gage")[0].appendChild(enemychildwraparea);
        const enemyCardList = mygage.querySelector(".detail_data.enemy").getElementsByClassName("general_data")[0].querySelectorAll(".general_1, .general_2, .general_3, .general_4, .general_5, .general_6, .general_7, .general_8");
        const enemyCardCount = enemyCardList.length;
        for (var i = enemyCardCount - 1; i >= 0; i--) {
            addCardToDeckArea(enemyDeckArea, enemyCardList[i]);
        };
    });
    request.send();
}

function addCardToDeckArea(deckArea, card) {
    const li = document.createElement("li");

    if (card.firstElementChild === null) {
        return;
    };

    card = card.firstElementChild;

    card.style.position = "relative"
    card.style.backgroundColor = "inherit";
    card.style.overflow = "hidden";
    card.style.height = "auto";

    li.appendChild(card);

    deckArea.insertBefore(li, deckArea.firstChild);

    const areas = deckArea.getElementsByClassName('era');
    const unitnames = deckArea.getElementsByClassName('unit_name');

    while (areas.length) {
        areas.item(0).remove();
    }
    while (unitnames.length) {
        unitnames.item(0).remove();
    }

    const images = deckArea.getElementsByClassName('card');
    for (var i = 0; i < images.length; i++) {
        images[i].style.width = "30px";
    }

}

function toggleMyName() {
    const targetElement = getMainElement();
    [].forEach.call(targetElement, (mydata) => {
        toggleVisibility(mydata.getElementsByClassName("player")[0].firstElementChild)
    }
    );
}

function toggleEnemyName() {
    const targetElement = getMainElement();
    [].forEach.call(targetElement, (mydata) => {
        toggleVisibility(mydata.getElementsByClassName("player")[0].nextElementSibling.firstElementChild)
    }
    );
}

function toggleVisibility(target) {
    if (target.style.visibility != "hidden") {
        target.style.visibility = "hidden";
    } else {
        target.style.visibility = "visible"
    }
}

function appendToggleNameButton() {
    const toggleMyNameButton = document.createElement("button");
    toggleMyNameButton.addEventListener('click', function () {
        toggleMyName()
    });
    toggleMyNameButton.innerHTML = "自軍名 on/off";
    toggleMyNameButton.classList.add("appended-class");
    toggleMyNameButton.style.display = "inline-block";
    toggleMyNameButton.style.margin = "0 5px";
    toggleMyNameButton.style.padding = "13px";
    toggleMyNameButton.style.fontWeight = "bold";
    toggleMyNameButton.style.border = "1px solid gray";
    toggleMyNameButton.style.color = "black";
    toggleMyNameButton.style.fontSize = "0.8rem";

    const toggleEnemyNameButton = document.createElement("button");
    toggleEnemyNameButton.addEventListener('click', function () {
        toggleEnemyName()
    });
    toggleEnemyNameButton.innerHTML = "敵軍名 on/off";
    toggleEnemyNameButton.classList.add("appended-class");
    toggleEnemyNameButton.style.display = "inline-block";
    toggleEnemyNameButton.style.margin = "0 5px";
    toggleEnemyNameButton.style.padding = "13px";
    toggleEnemyNameButton.style.fontWeight = "bold";
    toggleEnemyNameButton.style.border = "1px solid gray";
    toggleEnemyNameButton.style.color = "black";
    toggleEnemyNameButton.style.fontSize = "0.8rem";

    const host = document.getElementById('app');
    const elem = host.getElementsByTagName('ekt-main')[0];
    const targetElement = elem.shadowRoot.querySelectorAll(".daily_log")[0];

    targetElement.insertBefore(toggleEnemyNameButton, targetElement.firstChild);
    targetElement.insertBefore(toggleMyNameButton, targetElement.firstChild);

}

function isScreenshotMode() {
    return document.getElementsByClassName("btn_switch_screen on").length > 0;
}