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

        var remoteURL = 'https://www.euroticket-alacard.pt/alc/pages/login.jsf?windowId=682';
        var fieldsString = 'loginform=loginform&loginform:username='+alacardExtension.options.auth.cardNumber+'&loginform:password='+
                            alacardExtension.options.auth.cardPassword+
                            '&loginform:loginButton=Entrar&javax.faces.ViewState='+encodeURIComponent('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');

        var handleFirstPhase = function(html) {
            remoteURL = "https://www.euroticket-alacard.pt/alc/pages/private/customer/customer.jsf?windowId=682";
            alacardExtension.sendRequest('GET', remoteURL, null, handleSecondPhase);
        };

        var handleSecondPhase = function(html){
            var tmpDoc = document.createElement('html');
            tmpDoc.innerHTML = html;
            var table = tmpDoc.getElementsByClassName('rf-dt-b')[0];
            alacardExtension.history = table.innerHTML;

            // cache it!
            alacardExtension.saveToCache();
            tmpDoc = undefined;
            callback();
        };
        
        alacardExtension.sendRequest('POST', remoteURL, fieldsString, handleFirstPhase);
    },

    processData: function (){
        var table = document.createElement('table');
        table.innerHTML = alacardExtension.history;
        var allTransactions = [], coluna, debito;

        var rows = table.getElementsByTagName('tr');
        for (var i = 0, row; row = rows[i]; i++){
            debito = true;
            var transaction = [];
            for (var j = 0, col; col = row.cells[j]; j++){

                //get content from span
                if(j > 3){
                    coluna = col.children[0].innerHTML;
                }else{
                    coluna = col.innerHTML;
                }

                coluna = coluna.replace(/\s+/g, ' ');

                //check if this transaction is debit or credit
                if(j == 4){
                    if(coluna.indexOf('0,00') !== -1){
                        debito = false;
                    }
                }

                //get balance in first row, last column
                if(j == 6 && i==0){
                    alacardExtension.balance = coluna;
                }

                //validate columns
                if(j == 0 || j == 3 || (j == 4 && debito) || (j == 5 && !debito) || j == 6){
                    if(j == 5){
                        coluna = '+'+coluna;
                    }else if(j == 4){
                        coluna = '-'+coluna;
                    }
                    transaction.push(coluna)
                }
            }
            allTransactions.push(transaction);
        }

        var html = '';
        for(var i=0, mlength = allTransactions.length; i<mlength; i++){
            html += '<tr>'+
                        '<td class="col-yellow">'+allTransactions[i][0]+'</td>'+
                        '<td class="col-red">'+allTransactions[i][1]+'</td>'+
                        '<td class="col-orange">'+allTransactions[i][2]+'</td>'+
                        '<td class="col-green">'+allTransactions[i][3]+'</td>'+
                    '</tr>';
        }
        document.getElementById('thistorico').innerHTML = html;
    },

    sendRequest: function(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                callback(xhr.responseText);
            }
        }
        if(data){
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }else{
            xhr.send();
        }
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
        alacardExtension.processData();
        var balance = alacardExtension.balance;
        document.getElementById('balance_placeholder').innerHTML = balance ? balance : 'erro';
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
