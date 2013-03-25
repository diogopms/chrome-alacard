var alacardExtension = {
    
    dom: null,

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
                        remoteURL = 'https://www.alacard.pt/jsp/portlet/consumer/cartao_refeicao/c_login.jsp?_portal=cartao_refeicao&share/key.jsp:KEY='+key+'&consumer/cartao_refeicao/c_login.jsp:login_id_form='+options.cardNumber+'&consumer/cartao_refeicao/c_login.jsp:password_form='+options.password+'&x=40&y=14&consumer/cartao_refeicao/c_login.jsp:submit=not_empty';
                        console.log(key)
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
            }else console.log('erro')
        };

        alacardExtension.sendRequest('GET', remoteURL, handleFirstPhase);
    },

    getBalance: function(){
        var saldoElem = getElementByClass('currencyAmountBold', alacardExtension.dom);
        return saldoElem.innerHTML;
    },

    sendRequest: function(method, url, callback){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function(){
            if (request.readyState == 4 && request.status == 200){
                callback(request);
            }else{
                callback(false);
            }
        }
        request.send();        
    }
};

var options = {
    cardNumber: 'CARDNUMBER',
    password: 'PASSWORD'
};

function getElementByClass(className, html) {
    var elems = html.getElementsByTagName('*');
    for (i in elems) {
        if(elems[i].className === className){
            console.log(elems[i]);
            return elems[i];
        }
    }
};

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("balance_placeholder").innerHTML = '<img src="../img/loader.gif" alt="loading"/>';
    alacardExtension.init(function(){
        document.getElementById('balance_placeholder').innerHTML = alacardExtension.getBalance();
    });
});