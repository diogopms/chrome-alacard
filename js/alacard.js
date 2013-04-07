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

                remoteURL = 'https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp?_portal=cartao_refeicao&share/key.jsp:KEY='+key+'&consumer/cartao_refeicao/c_login.jsp:login_id_form='+alacardExtension.options.cardNumber+'&consumer/cartao_refeicao/c_login.jsp:password_form='+alacardExtension.options.password+'&x=40&y=14&consumer/cartao_refeicao/c_login.jsp:submit=not_empty&page.jsp:page=consumer/cartao_refeicao/cartao_refeicao.jsp';
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
        var Movimento = function(data, desc, valor, controlo){
            this.data     = data;
            this.desc     = desc;
            this.valor    = valor;
            this.controlo = controlo;
        }
        var all_movimentos = [], coluna;

        for (var i = 1, row; row = table.rows[i]; i++){
            var movimento = [];
            for (var j = 0, col; col = row.cells[j]; j++){
                if(j == 0 || j == 3 || j == 4 || j == 6){
                    coluna = col.innerHTML.replace(/\s+/g, ' ');
                    movimento.push(coluna)
                }
            }
            all_movimentos.push(movimento);
        }

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
        console.log(all_movimentos);
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
        var logged = false;
        chrome.storage.sync.get('options', function(value){
            if (value.options && value.options.hasOwnProperty('cardNumber')){
                alacardExtension.options = value.options;
                document.getElementById('logged-content').style.display = "block";
                document.getElementById('notlogged-content').style.display = "none";
                logged = true;
            }
            else{
                document.getElementById('notlogged-content').style.display = "block";
                document.getElementById('logged-content').style.display = "none";
            }
            if(callback){
                callback(logged);
            }
        });
    },

    saveOptions: function(cardNumber, password, callback){
        alacardExtension.options = {cardNumber: cardNumber, password: password};
        chrome.storage.sync.set({options: alacardExtension.options});
        if(callback){
            callback();
        }
    },

    logout: function(cardNumber, password, callback){
        alacardExtension.options = null;
        chrome.storage.sync.set({options: null});
        alacardExtension.checkLogin();
    }
};

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("balance_placeholder").innerHTML = 'a carregar';//'<img src="../img/loader.gif" alt="loading"/>';

    var logoutBtn = document.getElementById("logout");    
    logoutBtn.addEventListener('click', function(){
        alacardExtension.logout(function(){
            logoutBtn.style.display = "none";
        });
    });

    var historicBtn = document.getElementById("btn-historico"); 
    var historicDiv = document.getElementById("historic-content");
    historicBtn.addEventListener('click', function(){
        if(historicDiv.style.display == "none"){
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

    var loginHandler = function(logged){
        if(logged){            
            logoutBtn.style.display = "block"; //hide logout button
            alacardExtension.init(initHandler);
        }else{
            logoutBtn.style.display = "none"; //show logout button
        }
    }

    alacardExtension.checkLogin(loginHandler);

    document.getElementById('form').onsubmit = function(){
        document.getElementById("balance_placeholder").innerHTML = 'a carregar';
        var card = document.getElementById('cardnumber').value;
        var pass = document.getElementById('password').value;
        alacardExtension.saveOptions(card, pass, function(){
            alacardExtension.checkLogin(loginHandler);
        });
        return false;
    };
});
