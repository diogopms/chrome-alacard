var alacardExtension = {

    balance: null,

    history: null,

    options: {},

    init: function(callback){

        var remoteURL = "https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp";

        var handleFirstPhase = function(request) {
            if(request){
                var html = request.responseText;
                var doc = document.createElement("html");
                doc.innerHTML = html;
                var key = doc.getElementsByTagName("input")[1].value;
                var action = doc.getElementsByTagName("form")[0].getAttribute('action');

                remoteURL = 'https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp?_portal=cartao_refeicao&share/key.jsp:KEY='+key+'&consumer/cartao_refeicao/c_login.jsp:login_id_form='+alacardExtension.options.auth.cardNumber+'&consumer/cartao_refeicao/c_login.jsp:password_form='+alacardExtension.options.auth.cardPassword+'&x=40&y=14&consumer/cartao_refeicao/c_login.jsp:submit=not_empty&page.jsp:page=consumer/cartao_refeicao/cartao_refeicao.jsp';
                alacardExtension.sendRequest('POST', remoteURL, handleSecondPhase);
            }
            else{
               console.log("Erro no servidor!");
            }
        };

        var handleSecondPhase = function(request){
            if(request){
                var tmpDoc = document.createElement('html');
                tmpDoc.innerHTML = request.responseText;
                var balanceElem = tmpDoc.getElementsByClassName('currencyAmountBold');
                alacardExtension.balance = balanceElem.length > 0 ? balanceElem[0].innerHTML : null;
                alacardExtension.history = tmpDoc.getElementsByTagName('table')[8];
                callback();
            } else {
                console.log('erro');
            }
        };
        alacardExtension.sendRequest('GET', remoteURL, handleFirstPhase);
    },

    getHistory: function (){
        var table = alacardExtension.history;
        var all_movimentos = [], coluna;

        for (var i = 1, row; row = table.rows[i]; i++){
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
        var request = new XMLHttpRequest();
        request.open(method, url, true);

        request.onreadystatechange = function(){
            if (request.status == 200){
                callback(request);
            }else{
                callback(false);
            }
        }
        request.send();        
    },

    checkLogin: function(callback){
        var hasCredentials = false;
        chrome.storage.sync.get('options', function(value){
            console.log(value);
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
        chrome.storage.sync.set({options: alacardExtension.options});
        if(callback){
            callback();
        }
    },

    logout: function(callback){
        alacardExtension.options = null;
        chrome.storage.sync.set({options: null});
        alacardExtension.checkLogin();
    },

    optionsSetup: function(){
        alacardExtension.options = {
            auth: {
                cardNumber: null,
                cardPassword: null
            },
            updateInterval: 60,
            alertLowBalance: false,
            lastUpdate: 0
        };
        chrome.storage.sync.set({options: alacardExtension.options});
    }
};

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("balance_placeholder").innerHTML = 'a carregar';//'<img src="../img/loader.gif" alt="loading"/>';

    var logoutBtn = document.getElementById("logout");    
    logoutBtn.addEventListener('click', function(){
        alacardExtension.logout(function(){
            logoutBtn.style.display = "none";
            historicDiv.style.display = "none";
        });
    });

    var historicBtn = document.getElementById("btn-historico"); 
    var historicDiv = document.getElementById("historic-content");
    historicBtn.addEventListener('click', function(){

        //only shows historic if alacardExtension is loaded
        if(historicDiv.style.display == "none" && alacardExtension.dom){
            historicDiv.style.display = "block";
        }else{
            historicDiv.style.display = "none";
        }
    });

    var initHandler = function(){
        var balance = alacardExtension.balance;
        document.getElementById('balance_placeholder').innerHTML = balance ? balance : 'erro';

        var historic = alacardExtension.getHistory();
    }

    var loginHandler = function(hasCredentials){
        if(hasCredentials){            
            logoutBtn.style.display = "block"; //hide logout button
            alacardExtension.init(initHandler);
        }else{
            logoutBtn.style.display = "none"; //hide logout button
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
