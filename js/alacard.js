var alacardExtension = {
    
    dom: null,

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
                chrome.cookies.get({url:"https://www.alacard.pt", name:"sess"},
                    function(value) {
                        remoteURL = 'https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp?_portal=cartao_refeicao&share/key.jsp:KEY='+key+'&consumer/cartao_refeicao/c_login.jsp:login_id_form='+alacardExtension.options.cardNumber+'&consumer/cartao_refeicao/c_login.jsp:password_form='+alacardExtension.options.password+'&x=40&y=14&consumer/cartao_refeicao/c_login.jsp:submit=not_empty';
                        alacardExtension.sendRequest('POST', remoteURL, handleSecondPhase);
                    }
                );
            }
            else{
               console.log("Erro no servidor!");
            }
        };

        var handleSecondPhase = function(request){
            if(request){
                alacardExtension.dom = document.createElement('div');
                alacardExtension.dom.innerHTML = request.responseText;
                callback();
            }else console.log('erro');
        };

        alacardExtension.sendRequest('GET', remoteURL, handleFirstPhase);
    },

    getBalance: function(){
        var saldoElem = getElementByClass('currencyAmountBold', alacardExtension.dom);
        if(saldoElem){
            return saldoElem.innerHTML;
        }
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

function getElementByClass(className, html) {
    var elems = html.getElementsByTagName('*');
    for (var i in elems) {
        if(elems[i].className === className){
            return elems[i];
        }
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

    var initHandler = function(){
        var balance = alacardExtension.getBalance();
        document.getElementById('balance_placeholder').innerHTML = balance ? balance : 'erro';
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