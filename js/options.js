(function(){

    function saveOptions(options){
        chrome.storage.local.set({options: options});
    }

    function getOptions(callback){
        chrome.storage.local.get('options', function(value){
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
            var updateInterval = document.getElementById('update_interval');
            var logoutButton = document.getElementById('logout');

            if (options.auth.cardNumber && options.auth.cardPassword){
                cardNumber.value = options.auth.cardNumber;
                cardPassword.value = options.auth.cardPassword;
                logoutButton.style.display = 'block';
            }

            if (options.updateInterval){
                updateInterval.value = options.updateInterval;
            }

            logoutButton.addEventListener('click', function(){
                options.auth.cardNumber = null;
                options.auth.cardPassword = null;
                cardNumber.value = '';
                cardPassword.value = '';
                logoutButton.style.display = 'none';
                saveOptions(options);
            });

            var saveButton = document.getElementById('save_options_btn');
            saveButton.addEventListener('click', function(){
                var status = document.getElementById('status');

                if (cardNumber.value.length < 1 || cardPassword.value.length < 1){
                    status.innerHTML = 'Preencha os dois campos de autenticação';
                    status.style.color = 'red';
                    status.style.visibility = 'visible';
                    return false;
                }
                else{
                    // save auth data
                    options.auth.cardNumber = cardNumber.value;
                    options.auth.cardPassword = cardPassword.value;
                    options.updateInterval = updateInterval.value;
                    saveOptions(options);
                    status.innerHTML = '<span class="icon"></span>Dados guardados com sucesso';
                    status.style.color = 'white';
                    status.style.visibility = 'visible';
                }
            });
        });
    });
})();
