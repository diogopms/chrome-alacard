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

            var saveButton = document.getElementById('save_options_btn'),
                closeButton = document.getElementById('close_options_btn');

            closeButton.addEventListener('click', function(){
                window.close();
            });

            saveButton.addEventListener('click', function(){
                var status = document.getElementById('status');

                if (cardNumber.value.length < 1 || cardPassword.value.length < 1){
                    status.innerHTML = 'Preencha os dois campos de autenticação';
                    status.className = 'error';
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
                    status.style.visibility = 'visible';
                    status.className = 'ok';
                    logoutButton.style.display = 'block';
                }
            });
        });
    });
})();
