(function(){

    function saveOptions(options){
        chrome.storage.sync.set({options: options});
    }

    function getOptions(callback){
        chrome.storage.sync.get('options', function(value){
            if (!value.options){
                value = { auth: {} };
                saveOptions(value);
                callback(value);
            }
            else{
                callback(value.options);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function(){
        getOptions(function(options){
            var cardNumber = document.getElementById('card_number');
            var cardPassword = document.getElementById('card_password');

            if (options.auth.cardNumber && options.auth.cardPassword){
                cardNumber.value = options.auth.cardNumber;
                cardPassword.value = options.auth.cardPassword;
            }

            var saveButton = document.getElementById('save_options_btn');
            saveButton.addEventListener('click', function(){
                var status = document.getElementById('status');

                if (cardNumber.value.length < 1 || cardPassword.value.length < 1){
                    status.innerHTML = 'Preencha os dois campos';
                    status.style.color = 'red';
                    return false;
                }
                else{
                    // save auth data
                    options.auth.cardNumber = cardNumber.value;
                    options.auth.cardPassword = cardPassword.value;
                    saveOptions(options);
                    status.style.color = 'green';
                    status.innerHTML = 'Dados guardados com sucesso';
                }
            });
        });
    });
})();
