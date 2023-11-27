(function (f) {
    s = document.createElement("script");
    s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
    s.onload = function () {
        f(jQuery.noConflict(true))
    }
    document.body.appendChild(s);
}
)(function ($) {
    if (!confirm('集計を開始しますか？\n1~2分かかります、処理中はページを開いたままにしてください。\nまた、利用後はタブを閉じるようお願いします。')) {
        alert('キャンセルしました');
        return;
    }
    class ComprehensiveRecord {
        constructor() {
            this.data = [];
        }

        add(monthlyRecord) {
            this.data.push(monthlyRecord);
        }

        totalAggregateByTitle() {
            let _totalAggregateByTitleData = {};

            for (let [_, monthlyRecord] of Object.entries(this.data)) {
                for (let [title, value] of Object.entries(monthlyRecord.aggregateByTitle())) {

                    if (!_totalAggregateByTitleData[title]) { _totalAggregateByTitleData[title] = {} }
                    for (let [issue, count] of Object.entries(value)) {
                        if (!_totalAggregateByTitleData[title][issue]) { _totalAggregateByTitleData[title][issue] = 0 }
                        _totalAggregateByTitleData[title][issue] += count;
                    }
                }
            }

            return _totalAggregateByTitleData;
        }
    }
    class MonthlyRecord {
        // title_calendar: 2021年1月, 2021年2月
        constructor(title_calendar) {
            this.title_calendar = title_calendar;
            this.winCount = 0;
            this.loseCount = 0;
            this.drawCount = 0;
            this.totalCount = 0;
            this.data = [];
        }

        append(battleListRecord) {
            this.data.push(battleListRecord);
        }

        getDailies() {
            let _getDailiesData = {};

            for (let [_k, battleListRecord] of Object.entries(this.data)) {
                for (let [daily, data] of Object.entries(battleListRecord.data)) {
                    _getDailiesData[daily] = data;
                    for (let [title, value] of Object.entries(data)) {
                    }
                }
            }

            return _getDailiesData;
        }

        aggregateByTitle() {
            let _aggregateByTitleData = {};
            for (let [_daily, data] of Object.entries(this.getDailies())) {
                for (let [title, value] of Object.entries(data)) {
                    if (!_aggregateByTitleData[title]) { _aggregateByTitleData[title] = {} }
                    for (let [issue, count] of Object.entries(value)) {
                        if (!_aggregateByTitleData[title][issue]) { _aggregateByTitleData[title][issue] = 0 }
                        _aggregateByTitleData[title][issue] += count;
                    }
                }
            }

            return _aggregateByTitleData;
        }
    }
    class BattleListRecord {
        // daily: daily?y=2021&m=2&d=1
        constructor(daily) {
            this.daily = daily;
            this.data = {};
        }

        append(lineRecordBlock) {
            let r = lineRecordBlock;


            if (!this.data[this.daily]) { this.data[this.daily] = {}; }
            if (!this.data[this.daily][r.title]) { this.data[this.daily][r.title] = {}; }

            this.data[this.daily][r.title] = {
                winCount: r.winCount,
                loseCount: r.loseCount,
                drawCount: r.drawCount,
                totalCount: r.totalCount,
            }
        }
    }
    class LineRecordBlock {
        // title: 全国対戦戦績, 戦友対戦戦績, 武練の章戦績, 義勇ロード戦績, 店内対戦戦績
        constructor(title) {
            this.title = title;
            this.winCount = 0;
            this.loseCount = 0;
            this.drawCount = 0;
            this.totalCount = 0;
        }

        setCountByAlt(alt, count, title) {
            this.title = title;
            if (alt == '勝') {
                this.winCount = Number(count);
            } else if (alt == '敗') {
                this.loseCount = Number(count);
            } else if (alt == '分') {
                this.drawCount = Number(count);
            } else if (alt == '戦') {
                this.totalCount = Number(count);
            }
        }
    }
    class ResultHtml {
        constructor(comprehensiveRecord) {
            this.comprehensive = comprehensiveRecord;
        }

        generate() {
            return this.totalBattleHtml() + this.monthsBattleHtml();
        }

        totalBattleHtml() {
            let innerHtml = '<div class="frame01 cmn_frame pad_m mt20"><div class="frame01_top mid"></div><p class="calendar_head mincho mid pb20">総合戦績</p><div class="statistics_data mid">';
            innerHtml += '<table class="calendar" align="center" style="width: 70%">'
            innerHtml += '<tbody><tr><th>種別</th><th>勝ち/負け</th><th>勝率</th></tr>'

            for (let [title, value] of Object.entries(this.comprehensive.totalAggregateByTitle())) {
                var calc = new VCalc(value);

                innerHtml += `<tr style="height: 30px; line-height: 2;"><td>${title}</td><td>${calc.winCount}/${calc.loseCount}</td><td>${calc.winPer()}</td></tr>`;
            }

            innerHtml += '</table>'
            innerHtml += '</div><div></div></div>'

            return innerHtml;
        }

        monthsBattleHtml() {
            let innerHtml = '';
            for (let [_, monthlyRecord] of Object.entries(this.comprehensive.data)) {
                innerHtml += `<div class="frame01 cmn_frame pad_m mt20"><div class="frame01_top mid"></div><p class="calendar_head mincho mid pb20">${monthlyRecord.title_calendar}</p><div class="statistics_data mid">`;
                innerHtml += '<table class="calendar" style="width: 70%">'
                innerHtml += '<tbody><tr><th>種別</th><th>勝ち/負け</th><th>勝率</th></tr>'

                for (let [title, value] of Object.entries(monthlyRecord.aggregateByTitle())) {
                    var calc = new VCalc(value);
                    innerHtml += `<tr style="height: 30px; line-height: 2;"><td>${title}</td><td>${calc.winCount}/${calc.loseCount}</td><td>${calc.winPer()}</td></tr>`;
                }

                innerHtml += '</table>'
                innerHtml += '</div><div></div></div>'
            }

            return innerHtml;
        }
    }
    class VCalc {
        constructor(value) {
            this.winCount = value['winCount'];
            this.loseCount = value['loseCount'];
            this.drawCount = value['drawCount'];
            this.totalCount = value['totalCount'];
        }

        winPer(fixedNum = 1) {
            let _winPer = this.winCount / (this.winCount + this.loseCount) * 100;
            return _winPer.toFixed(fixedNum);
        }
    }

    function refreshResultHtml() {
        var d = new $.Deferred();
        setTimeout(function () {
            $("#bookmarklet_result").remove();
            d.resolve();
        }, 0);
        return d.promise();
    }

    function dispLoading() {
        var d = new $.Deferred();
        setTimeout(function () {
            var msg = 'loading';
            var dispMsg = "<div class='bookmarklet_loading_msg'>" + msg + "</div>";

            if ($("#bookmarklet_loading").length == 0) {



                $("#app").append("<div id='bookmarklet_loading'>" + dispMsg + "</div>");

                var ua = navigator.userAgent;
                var width = window.innerWidth;
                var height = window.innerHeight;
                if ((ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0) && ua.indexOf('Mobile') > 0) {
                    // スマートフォン用処理
                    width = "100%";
                    height = "100%";
                } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
                    // タブレット用処理
                    width = "100%";
                    height = "100%";
                }
                $("#bookmarklet_loading").css({
                    "display": "table",
                    "width": width,
                    "height": height,
                    "position": "fixed",
                    "top": "0",
                    "left": "0",
                    "background-color": "#fff",
                    "opacity": "0.8",
                    "z-index": 2001
                });

                $("#bookmarklet_loading").find(".bookmarklet_loading_msg").css({
                    "display": "table-cell",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "padding-top": "140px",
                    "background": "url('https://megumin-zz.github.io/eiketsutaisen/img/loading.gif') center center no-repeat"
                });
            }

            d.resolve();
        }, 10);
        return d.promise();
    }

    // daily?y=2021&m=2&d=4 → 2021年2月4日
    function daily2humanize(daily) {
        let matched = daily.match(/daily\?y=(\d+)&m=(\d+)&d=(\d+)/);
        return `${matched[1]}年${matched[2]}月${matched[3]}日`;
    }

    function updateLoading(daily, nowCount, maxCount) {
        var d = new $.Deferred();
        setTimeout(function () {
            if ($("#bookmarklet_loading").length > 0) {
                var per = (nowCount / maxCount * 100).toFixed(0);
                $("#bookmarklet_loading").find(".bookmarklet_loading_msg").html(`${per}%<br>${daily2humanize(daily)}取得中`);
            }
            d.resolve();
        }, 20);
        return d.promise();
    }

    function removeLoading() {
        var d = new $.Deferred();
        setTimeout(function () {
            $("#bookmarklet_loading").remove();
            d.resolve();
        }, 500);
        return d.promise();
    }

    function wait(milliseconds = 2000) {
        var d = new $.Deferred();
        setTimeout(function () {
            console.log("waiting " + milliseconds + " milliseconds");
            d.resolve();
        }, milliseconds);
        return d.promise();
    }

    function callApi(monthlyRecord, daily) {
        var d = new $.Deferred();

        $.ajax({
            url: "https://eiketsu-taisen.net/members/history/" + daily,
        }).done(function (data, status, xhr) {

            playDayNowCount++;

            if ($(data).find('#container p').text() == "短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。") {
                return d.reject('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
            }

            if (xhr.status !== 200) {
                return d.reject('サーバの応答が停止しました、時間を置いてから実行してください。');
            }

            if (status !== 'success') {
                return d.reject('不明なステータスを受信しました、時間を置いてから実行してください。');
            }

            let battleListRecord = new BattleListRecord(daily);
            var out_html = $($.parseHTML(data));
            const listData = out_html.get();
            const lineRecordBlock = new LineRecordBlock(listData);
            for (var i = 0; i < listData.length; i++) {
                if (listData[i].id == 'template') {
                    const elem = listData[i].parentNode.getElementById('template');
                    const wrapContents = elem.content.querySelector('.p-daily-record__inner');
                    const dl = wrapContents.querySelectorAll('dl:not(.p-daily-record__container--total)');
                    dl.forEach(item => {
                        const dds = item.getElementsByTagName('dd');
                        [].forEach.call(dds, (dd) => {
                            const title = item.getElementsByTagName('dt')[0].textContent;
                            const count_value = dd.getElementsByTagName('span')[0].textContent;
                            const count_alt = dd.childNodes[1].textContent;
                            lineRecordBlock.setCountByAlt(count_alt, count_value, title);
                        })
                        battleListRecord.append(lineRecordBlock);
                    });

                }
            }
            monthlyRecord.append(battleListRecord);
            d.resolve();
        }).fail(function (data) {
            return d.reject('取得に失敗しました、時間を置いてから実行してください。');
        });

        return d.promise();
    }

    let debugMode = false;
    let deferred = wait(0);
    let comprehensiveRecord = new ComprehensiveRecord();
    let playDayNowCount = 1;

    deferred.then(function () {
        return $.when(refreshResultHtml(), dispLoading());
    });

    var contents = document.getElementById('app');
    const elem = contents.getElementsByTagName('ekt-main')[0];
    const playDays = elem.shadowRoot.querySelectorAll(`[class^='date_']`);
    const calender = elem.shadowRoot.querySelectorAll('.mid');
    let playDaysCount = 0;
    playDays.forEach((item) => {
        if (item.getElementsByTagName('a').length) {
            playDaysCount++;
        }
    })

    calender.forEach((item) => {
        const monthlyRecord = new MonthlyRecord(item.getElementsByClassName('calendar_head')[0].firstElementChild.textContent);
        const a = item.getElementsByTagName('a');

        [].forEach.call(a, (playDay) => {
            const daily = playDay.getAttribute('href').replace(/^\.\//, '');
                deferred = deferred.then(function () {
                    return $.when(callApi(monthlyRecord, daily), updateLoading(daily, playDayNowCount, playDaysCount), wait(2500));
                });
        });
        comprehensiveRecord.add(monthlyRecord);
    })

    deferred.always(function () {
        console.log("Always ：）");
        removeLoading();
    }).done(function () {
        console.log("Done ；）");
        let resultHtml = new ResultHtml(comprehensiveRecord);
        var contents = document.getElementById('app');
        const elem = contents.getElementsByTagName('ekt-main')[0];
        const resultContent = elem.shadowRoot.getElementById('contents')
        resultContent.insertAdjacentHTML('afterbegin', "<span id='bookmarklet_result'>" + resultHtml.generate() + "<br></span>")
    }).fail(function (e) {
        console.log("Fail ：’）");
        alert(e);
    });
});
