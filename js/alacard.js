/**
 * chrome-alacard extension
 *
 * Copyright (c) 2013 lxpixel.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, inclu * ding without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

var alacardExtension = {

    balance: null,

    history: null,

    options: {},

    init: function(callback, skipCache){

        // start the loading gif
        var loadingStr = '<img class="loading" src="../img/loader.gif" alt="loading"/>';
        document.getElementById("balance_placeholder").innerHTML = loadingStr;

        if (!skipCache && alacardExtension.options.cache.balance){
            var lastUpdate = alacardExtension.options.cache.lastUpdate,
                updateInterval = (alacardExtension.options.updateInterval * 60) * 1000,
                currentTime = new Date().getTime();

            if ((currentTime - lastUpdate) <= updateInterval){
                alacardExtension.balance = alacardExtension.options.cache.balance;
                alacardExtension.history = alacardExtension.options.cache.history;
                var lastUpdatePlaceholder = document.getElementById('last_update');
                var lastUpdateStr = alacardExtension.dateBuilder(alacardExtension.options.cache.lastUpdate);
                lastUpdatePlaceholder.innerHTML = lastUpdateStr
                return callback();
            }
        }


        document.getElementById('last_update').innerHTML = alacardExtension.dateBuilder(new Date().getTime());
        var remoteURL = "https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp";

        var handleFirstPhase = function(html) {
            var doc = document.createElement("html");
            doc.innerHTML = html;
            var key = doc.getElementsByTagName("input")[1].value;
            var action = doc.getElementsByTagName("form")[0].getAttribute('action');

            remoteURL = 'https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp?_portal=cartao_refeicao&share/key.jsp:KEY='+key+'&consumer/cartao_refeicao/c_login.jsp:login_id_form='+alacardExtension.options.auth.cardNumber+'&consumer/cartao_refeicao/c_login.jsp:password_form='+alacardExtension.options.auth.cardPassword+'&x=40&y=14&consumer/cartao_refeicao/c_login.jsp:submit=not_empty&page.jsp:page=consumer/cartao_refeicao/cartao_refeicao.jsp';
            alacardExtension.sendRequest('POST', remoteURL, handleSecondPhase);
        };

        var handleSecondPhase = function(html){
            var tmpDoc = document.createElement('html');
            tmpDoc.innerHTML = html;
            var balanceElem = tmpDoc.getElementsByClassName('currencyAmountBold');
            alacardExtension.balance = balanceElem.length > 0 ? balanceElem[0].innerHTML : null;
            var table = tmpDoc.getElementsByTagName('table')[8];
            alacardExtension.history = table.innerHTML;

            // cache it!
            alacardExtension.saveToCache();
            tmpDoc = undefined;
            callback();
        };
        alacardExtension.sendRequest('GET', remoteURL, handleFirstPhase);
    },

    getHistory: function (){
        var table = document.createElement('table');
        table.innerHTML = alacardExtension.history;
        var all_movimentos = [], coluna, debito;

        var rows = table.getElementsByTagName('tr');
        for (var i = 1, row; row = rows[i]; i++){
            debito = true;
            var movimento = [];
            for (var j = 0, col; col = row.cells[j]; j++){
                coluna = col.innerHTML.replace(/\s+/g, ' ');
                if(j == 2){
                    if(coluna == ' Carregamento '){
                        debito = false;
                    }
                }
                if(j == 0 || j == 3 || (j == 4 && debito) || (j == 5 && !debito) || j == 6){
                    if(j == 5){
                        coluna = '+'+coluna;
                    }else if(j == 4){
                        coluna = '-'+coluna;
                    }
                    movimento.push(coluna)
                }
            }
            all_movimentos.push(movimento);
        }

        //remove last row, containing pagination elements
        all_movimentos.pop();

        var html = '';
        for(var i=0, mlength = all_movimentos.length; i<mlength; i++){
            html += '<tr>'+
                        '<td class="col-yellow">'+all_movimentos[i][0]+'</td>'+
                        '<td class="col-red">'+all_movimentos[i][1]+'</td>'+
                        '<td class="col-orange">'+all_movimentos[i][2]+'</td>'+
                        '<td class="col-green">'+all_movimentos[i][3]+'</td>'+
                    '</tr>';
        }
        document.getElementById('thistorico').innerHTML = html;
    },

    sendRequest: function(method, url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                callback(xhr.responseText);
            }
        }
        xhr.send();
    },

    checkLogin: function(callback){
        var hasCredentials = false;
        chrome.storage.local.get('options', function(value){
            if (value.options && value.options.auth.cardNumber){
                alacardExtension.options = value.options;
                document.getElementById('logged-content').style.display = "block";
                document.getElementById('notlogged-content').style.display = "none";
                hasCredentials = true;
            }
            else{
                alacardExtension.optionsSetup();
                document.getElementById('notlogged-content').style.display = "block";
                document.getElementById('logged-content').style.display = "none";
            }
            if(callback){
                callback(hasCredentials);
            }
        });
    },

    saveCredentials: function(cardNumber, cardPassword, callback){
        alacardExtension.options.auth.cardNumber = cardNumber;
        alacardExtension.options.auth.cardPassword = cardPassword;
        chrome.storage.local.set({options: alacardExtension.options});
        if(callback){
            callback();
        }
    },

    saveToCache: function(){
        alacardExtension.options.cache.balance = alacardExtension.balance;
        alacardExtension.options.cache.history = alacardExtension.history;
        alacardExtension.options.cache.lastUpdate = new Date().getTime();
        chrome.storage.local.set({options: alacardExtension.options});
    },

    optionsSetup: function(){
        alacardExtension.options = {
            auth: {
                cardNumber: null,
                cardPassword: null
            },
            cache: {
                balance: null,
                history: null,
                lastUpdate: 0
            },
            updateInterval: 60,
            alertLowBalance: false
        };
        chrome.storage.local.set({options: alacardExtension.options});
    },

    dateBuilder: function(dat){
        var lastUpdateDate = new Date(dat);
        var day = lastUpdateDate.getDate(),
            month = lastUpdateDate.getMonth(),
            year = lastUpdateDate.getFullYear(),
            hour = lastUpdateDate.getHours(),
            minutes = lastUpdateDate.getMinutes();

        var lastUpdateStr = (day < 10 ? '0' + day : day) + "/" + (month < 10 ? '0' + month : month);
        lastUpdateStr += "/" + year + " " + (hour < 10 ? '0' + hour : hour) + ":";
        lastUpdateStr += (minutes < 10 ? '0' + minutes : minutes);
        return lastUpdateStr;
    }
};

document.addEventListener('DOMContentLoaded', function(){

    var refreshButton = document.getElementById('refresh_button');
    var historyBtn = document.getElementById("btn-historico");
    var historyDiv = document.getElementById("history-content");

    refreshButton.addEventListener('click', function(){
        alacardExtension.init(initHandler, true);
    });

    historyBtn.addEventListener('click', function(){
        //only shows history if alacardExtension is loaded
        if(historyDiv.style.display == "none" && alacardExtension.history){
            historyDiv.style.display = "block";
        } else{
            historyDiv.style.display = "none";
        }
    });

    var initHandler = function(){
        var balance = alacardExtension.balance;
        document.getElementById('balance_placeholder').innerHTML = balance ? balance : 'erro';
        alacardExtension.getHistory();
    }

    var loginHandler = function(hasCredentials){
        if(hasCredentials){
            alacardExtension.init(initHandler);
        }
    }

    alacardExtension.checkLogin(loginHandler);

    document.getElementById('form').onsubmit = function(){
        document.getElementById("balance_placeholder").innerHTML = 'a carregar';
        var card = document.getElementById('cardnumber').value;
        var pass = document.getElementById('password').value;
        alacardExtension.saveCredentials(card, pass, function(){
            alacardExtension.checkLogin(loginHandler);
        });
        return false;
    };
});
