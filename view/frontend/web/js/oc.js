//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-01-plugins.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

// Place any jQuery/helper plugins in here.

// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});
    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-01-plugins.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-02-translate.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

// this code works with the js-ified version of language.xml
// see gulpfile.js (task currently called 'languageXml2js')

/**
 *  is a function that can be used to translate msgKeys from language.xml
 *  e.g. omniTranslate("label-address-extra","swedish", "extra address info") -> "Adressinformation (frivilligt)"
 *  @param {string} msgKey - the key (as used in language.xml) of the message
 *  @param {string} lang - the language of the translated message
 *  @param {string} defaultMsg - (optional, defaults to msgKey) default value that is returned if no translation was found
 *  @returns {string} the message indexed by msgKey and lang or defaultMsg, if no translation could be found
 */
var omniTranslate = (
    // transform terrible data-structure in omnicheckoutTranslations into nice data-structure in omniDict
    function (allTranslations) {
        var resultDict = {};

        $.each(allTranslations.translations, function(_categoryKey, translationCategory) {
            var translationList = translationCategory[0].translation;

            $.each(translationList, function(_index, translation) {
                var msgKey = translation.$.class;
                translationByLang = {};
                /*
                 e.g. translation = {
                 "$": {"class": "label-address-extra"},
                 "swedish": ["Adressinformation (frivilligt)"],
                 "norwegian": ["Adresseinfo (valgfritt )"]
                 }
                 ->  translationByLang = {
                 "swedish": "Adressinformation (frivilligt)",
                 "norwegian": "Adresseinfo (valgfritt )"
                 }*/

                $.each(translation, function(langName, translatedMsg) {
                    if(langName!=="$") {
                        translationByLang[langName] = translatedMsg[0];
                    }
                });

                resultDict[msgKey] = translationByLang;
            });
        });

        return function (msgKey, lang, defaultMsg) {
            if( resultDict[msgKey] ) {
                var translations = resultDict[msgKey];
                if( translations[lang] ) {
                    return translations[lang];
                }
            }
            //if no defaultMsg is specified, fall back on msgKey
            if(!defaultMsg) {
                defaultMsg = msgKey;
            }
            return defaultMsg;
        };
    })(omnicheckoutTranslations);

// clear translations from omnicheckoutTranslations, information is available in omniTranslate's closure now
omnicheckoutTranslations = "use omniTranslate(msgKey,lang, defaultMsg) to translate msgKeys from language.xml";


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-02-translate.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-03-basics.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

// returns true if str is undefined, null or a string but either with 0 chars or only spaces.
function isEmpty(str) {
    if(isNotSetOrNull(str)) {
        return true;
    }
    if (!isOfType(str, 'string')) {
        console.log("isEmpty: illegal parameter type! expected string but got "+(typeof str));
        return false;
    }
    return str.trim().length===0;
}

function isNotEmpty(str) {
    return !isEmpty(str);
}

function isSet(variable) {
    return !isOfType(variable, typeof undefined);
}

function isSetAndNotNull(variable) {
    return isSet(variable) && variable!==null;
}

function isNotSetOrNull(variable) {
    return (variable===null)|| !isSet(variable);
}

function isOfType (obj, typeStr) {
    return typeof obj === typeStr;
}

function isArray(maybeAnArray) {
    return Object.prototype.toString.call( maybeAnArray ) === '[object Array]';
}

/**
 * empty callback doesn nothing (but might be a usefull placeholder for callback)
 */
function noop() {}

/**
 * remove possible values null and undefined, return "" in that case
 * @param str {string}
 * @returns {string}
 */
function noNPE(str) {
    return str ? str : "";
}

/**
 * @param val
 * @returns a Promise that will be rejected immediatly with the provided value
 */
function getRejectedPromise(val) {
    var defer = $.Deferred();
    defer.reject(val);
    return defer.promise();
}

/**
 * @param val
 * @returns a Promise that will be resolved immediatly with the provided value
 */
function getResolvedPromise(val) {
    var defer = $.Deferred();
    defer.resolve(val);
    return defer.promise();
}

//const default promises that can be reused
var RESOLVED_PROMISE_OF_NULL = getResolvedPromise(null);



//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-03-basics.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-04-backend.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

var REST_ROOT_URL_PROMISE = $.Deferred(function (defer) {
    $.ajax({
        type: "GET",
        url: '../../omnicheckout/url',
        //contentType: "text/plain;charset=UTF-8",
        dataType: "text",
        success: function (data) {
            defer.resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            defer.reject("server error: status("+noNPE(textStatus)+"), err("+noNPE(errorThrown)+")")
        }
    });

    _setTimeoutOnDeferred(defer, "REST_ROOT_URL_PROMISE");
}).promise();
var FIND_CUSTOMER_URL_PROMISE = $.Deferred(function (defer) {
    REST_ROOT_URL_PROMISE.done(function (rest_root_url) {
        defer.resolve(rest_root_url + 'omnicheckout/customers/search');
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });
}).promise();
var WEBSOCKET_URL_PROMISE = $.Deferred(function (defer) {
    REST_ROOT_URL_PROMISE.done(function (rest_root_url) {
        defer.resolve(rest_root_url + 'web/update');
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });
}).promise();
var PAYMENT_ID_PROMISE = $.Deferred(function (defer) {
    // wait until document is loaded
    // basically equivalent to window.addEventListener("DOMContentLoaded", function () ... (only more stable)
    $(function() {
        // Retreived the PaymentID which is appended to the URL of omni-checkout.html
        //like this http://checkout.resurs.se/omni-checkout.html?JF2J3J4KF5J5J5F55400JHFJ001
        payment_id = window.location.search.substring(1);
        defer.resolve(payment_id);
    });
}).promise();
var GET_ORDER_URL_PROMISE = $.Deferred(function (defer) {
    REST_ROOT_URL_PROMISE.done(function (rest_root_url) {
        defer.resolve(rest_root_url + 'omnicheckout/payments/');
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });
}).promise();


function _setTimeoutOnDeferred(defer, name, msTimeout) {
    if(!name) {
        name = "";
    }
    if(isNotSetOrNull(msTimeout)) {
        // by default reject a deferred operation after 20s
        msTimeout = 20000;
    }
    setTimeout(function () {
        // if the defer-object was resolved within the timeout, this reject will have no effect
        defer.reject(name+" timed out after "+(msTimeout/1000)+"s");
    }, msTimeout);
}

// a promise might already have timed out (=been rejected) when a second reject arrives.
// in that case log the reason
function rejectOrLog(deferred, errObj) {
    if(deferred.state()==="pending") {
        deferred.reject(errObj);
    }else{
        console.log("promise failed: "+errObj);
    }
}

function ajaxErrorToStr(occuredInMethod, jqXHR, textStatus, errorThrown) {
    return occuredInMethod+" ajax error: status("+noNPE(textStatus)+"), err("+noNPE(errorThrown)+")";
}

/**
 * checks the format of the personnumber and calls a service to retrieve the address of the corresponding person
 * @param pnrStr {string} - personnumber
 * @returns {Promise} - either the address data in map form or an error object with additional info {
 *   isFormatError {bool} - true if the format of the pnr is illegal, wrong if the connection to the server failed
 *   errMsg {string}
 * }
 */
var getPromiseOfAddressByPnr = (
    // use an internal function definition so that i can hide a private cache within the closure-scope
    function () {
        // pnr and their addresses are pretty much static information so they can be cached for this session
        var addressByPnrCache = {},
            formatErrorByPnrCache = {};

        return function (pnrStr) {
            var defer = $.Deferred(),
                errResult = {
                    isFormatError: true,
                    errMsg: null},
                foundPnrInCache = false;

            // it's a good idea to have some minimal client-side validation left
            if(isEmpty(pnrStr)) {
                errResult.errMsg = "pnrStr is empty";
                defer.reject(errResult);
                // close enough
                foundPnrInCache = true;
            } else if(addressByPnrCache[pnrStr]) {
                defer.resolve(addressByPnrCache[pnrStr]);
                foundPnrInCache = true;
                // console.log("found pnr in cache: "+pnrStr);
            }else if(formatErrorByPnrCache[pnrStr]) {
                defer.reject(formatErrorByPnrCache[pnrStr]);
                foundPnrInCache = true;
            }

            if(!foundPnrInCache) {
                // check the remote service
                FIND_CUSTOMER_URL_PROMISE.done(function (findCustomerUrl) {
                    $.ajax({
                        type: "POST",
                        url: findCustomerUrl,
                        data: JSON.stringify({
                            governmentId: pnrStr
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data, textStatus, xhr) {
                            if (data == 0) {
                                errResult.errMsg = "server: no json (illegal format?!)";
                                formatErrorByPnrCache[pnrStr] = errResult;
                                defer.reject(errResult);
                            } else {
                                addressByPnrCache[pnrStr] = data;
                                defer.resolve(data);
                                // console.log("found pnr on service: "+pnrStr);
                            }
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            errResult.isFormatError = false;
                            errResult.errMsg = ajaxErrorToStr("getPromiseOfAddressByPnr", xhr, textStatus, errorThrown);
                            rejectOrLog(defer, errResult);
                            // server errors can't be cached, servers might come up again
                        }
                    });
                    _setTimeoutOnDeferred(defer, "getPromiseOfAddressByPnr");
                }).fail(function (errMsg) {
                    defer.reject("dependency promise failed: "+noNPE(errMsg));
                });

            }

            return defer.promise();
        };
    })();

function getOrderPromise() {
    var defer = $.Deferred();

    $.when(GET_ORDER_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (getOrderUrl, paymentId) {
        var orderUrlWithOrderId = getOrderUrl + paymentId;

        $.ajax({
            type: "GET",
            url: orderUrlWithOrderId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, p1, p2) {
                defer.resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                rejectOrLog(defer, ajaxErrorToStr("getOrderPromise", jqXHR, textStatus, errorThrown));
            }
        });
        _setTimeoutOnDeferred(defer, "getOrderPromise");
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });

    return defer.promise();
}

function getCustomerCookiesPromise() {
    var defer = $.Deferred();

    $.when(REST_ROOT_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (restRootUrl, paymentId) {
        var customerDataUrl = restRootUrl + 'cookies/' + paymentId;

        $.ajax({
            type: "GET",
            url: customerDataUrl,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, p1, p2) {
                defer.resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                rejectOrLog(defer, ajaxErrorToStr("getCustomerCookiesPromise", jqXHR, textStatus, errorThrown));
            }
        });
        _setTimeoutOnDeferred(defer, "getCustomerCookiesPromise");
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });

    return defer.promise();
}

function getLatestPaymentMethodsPromise() {
    var defer = $.Deferred();

    $.when(REST_ROOT_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (restRootUrl, paymentId) {
        var latestPaymentMethodsUrl = restRootUrl + 'omnicheckout/payments/' + paymentId + '/paymentMethods';

        $.ajax({
            type: "GET",
            url: latestPaymentMethodsUrl,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, p1, p2) {
                defer.resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                rejectOrLog(defer, ajaxErrorToStr("getLatestPaymentMethodsPromise", jqXHR, textStatus, errorThrown));
            }
        });
        _setTimeoutOnDeferred(defer, "getLatestPaymentMethodsPromise");
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });

    return defer.promise();
}

function getBookPaymentPromise(msgBody) {
    var defer = $.Deferred();

    $.when(REST_ROOT_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (restRootUrl, paymentId) {
        var bookPaymentUrl = restRootUrl + 'omnicheckout/payments/' + paymentId;

        $.ajax({
            type: "POST",
            url: bookPaymentUrl,
            data: JSON.stringify(msgBody),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (json, p1, p2) {
                defer.resolve(json);
            },
            error: function (jqXHR, status, e) {
                rejectOrLog(defer, jqXHR.responseJSON);
            }
        });
        _setTimeoutOnDeferred(defer, "getBookPaymentPromise");
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });

    return defer.promise();
}

getCostOfPurchaseHtmlPromise = function (paymentMethodId) {
    var defer = $.Deferred();

    $.when(REST_ROOT_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (restRootUrl, paymentId) {
        var costOfPurchaseUrl = restRootUrl + 'omnicheckout/payments/' + paymentId + '/' + paymentMethodId;

        $.ajax({
            type: "GET",
            url: costOfPurchaseUrl,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, p1, p2) {
                defer.resolve(data.costOfPurchase);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                rejectOrLog(defer, ajaxErrorToStr("getCostOfPurchaseHtmlPromise", jqXHR, textStatus, errorThrown));
            }
        });
        _setTimeoutOnDeferred(defer, "getCostOfPurchaseHtmlPromise");
    }).fail(function (errMsg) {
        defer.reject("dependency promise failed: "+noNPE(errMsg));
    });

    return defer.promise();
};

function getOpenWebsocketPromise() {
    var defer = $.Deferred();

    $.when(WEBSOCKET_URL_PROMISE, PAYMENT_ID_PROMISE).done(function (websocketUrl, paymentId) {
        try {
            var ws = new SockJS(websocketUrl);

            ws.onclose = function () {
            };

            ws.onopen = function () {
                ws.send("UUID:" + paymentId);
                defer.resolve(ws);
            };
        }catch (e) {
            defer.reject("couldn't initialise websocket: "+noNPE(e));
        }
    }).fail(function (err) {
        defer.reject("dependency promise failed: "+noNPE(err));
    });

    return defer.promise();
}

//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-04-backend.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-10-validation.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function DisplayableError(cssClasses, errMsgKey) {
    var self = this;
    self.errMsgKey = noNPE(errMsgKey);
    self.cssClasses = noNPE(cssClasses);
}

/**
 * all the Validators return a Promise<Bool> instead of Bool
 * so that there implementations can call remote services to retrieve the value.
 * (currently only pnrValidator needs this, but email/phone/postalCode-Validators might follow).
 */

function createIsNotEmptyValidator(errMsgKey) {
    var rejectedPromise = getRejectedPromise(new DisplayableError("error-empty", errMsgKey));
    return function (value) {
        if (isNotEmpty(value)) {
            return RESOLVED_PROMISE_OF_NULL;
        } else {
            return rejectedPromise;
        }
    }
}

function alwaysValidValidator(unusedValue) {
    // useful for optional fields
    return RESOLVED_PROMISE_OF_NULL;
}

function neverValidValidator(unusedValue) {
    // useful while feature is in development (e.g. as a stand-in before a custom validation is available)
    return getRejectedPromise(new DisplayableError("", "hardcoded-as-invalid"));
}

function emailValidator(emailStr) {
    if (isEmpty(emailStr)) {
        return getRejectedPromise(new DisplayableError("error-empty", "error-email"));
    }

    var regexEmail = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;

    if (regexEmail.test(emailStr)) {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "error-email-format"));
    }
}

function phoneNrValidator(telStr) {
    if (isEmpty(telStr)) {
        return getRejectedPromise(new DisplayableError("error-empty", "error-telephone"));
    }

    // will only allow swedish (!) mobilnumbers (!)
    var regexMobile = /^(\+46|0046|0)[ |-]?(7)([ |-]?[0-9]){8}$/;

    if (regexMobile.test(telStr)) {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "error-telephone-format"));
    }
}

function postalCodeValidator(postalStr) {
    if (isEmpty(postalStr)) {
        return getRejectedPromise(new DisplayableError("error-empty", "error-postal"));
    }

    if (postalStr.length === 5 && $.isNumeric(postalStr)) {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "error-postal-format"));
    }
}

function countryCodeValidator(countryCodeStr) {
    // the default implementation supports only Sweden (SE)
    if (countryCodeStr.toUpperCase() === "SE") {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "error-unknown-countrycode"));
    }
}

function customerTypeValidator(customerTypeStr) {
    // the default implementation supports only NATURAL
    if (customerTypeStr.toUpperCase() === "NATURAL") {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "error-unknown-customertype"));
    }
}

function resursCardValidator(resurscardNrStr) {
    if (isEmpty(resurscardNrStr)) {
        return getRejectedPromise(new DisplayableError("error-empty", "resurscard-empty-error"));
    }

    var resursCardFormatRegex = /^([1-9][0-9]{3}[ ]{0,1}[0-9]{4}[ ]{0,1}[0-9]{4}[ ]{0,1}[0-9]{4})$/;

    if (resursCardFormatRegex.test(resurscardNrStr)) {
        return RESOLVED_PROMISE_OF_NULL;
    } else {
        return getRejectedPromise(new DisplayableError("error-format", "resurscard-format-error"));
    }
}

function pnrValidator(pnrStr) {
    if (isEmpty(pnrStr)) {
        return getRejectedPromise(new DisplayableError("error-empty", "error-pnr-format"));
    }

    if (!isValidPnrFormat(pnrStr)) {
        return getRejectedPromise(new DisplayableError("error-format", "error-pnr-format"));
    }

    // check the backend (which should be cached), if we get an address for this pnr, that the pnr is valid
    var validPnrPromise = $.Deferred(),
        addressByPnrPromise = getPromiseOfAddressByPnr(pnrStr);

    addressByPnrPromise.done(function (addressData) {
        // could find an address for this pnr -> accept it
        validPnrPromise.resolve(null);
    }).fail(function (errResult) {
        // couldn't find an address for this pnr -> reject it
        var displayErr = null;
        if(errResult.isFormatError) {
            displayErr = new DisplayableError("error-format", "error-pnr-format");
        }else{
            displayErr = new DisplayableError("error-pnr-service", "no-service");
        }
        validPnrPromise.reject(displayErr);
    });

    return validPnrPromise.promise();
}

function isValidPnrFormat(pnrStr) {
    //ok-examples: "19790131-0000", "121201+9999", "680920 2957", "9910192957"
    var pnrFormatRegex = /^(19|20)?[0-9]{2}((0[1-9])|(10|11|12))(([0-2][0-9])|(3[0-1])|(([7-8][0-9])|(6[1-9])|(9[0-1])))(\+|-| )?[0-9]{4}$/;

    return isNotEmpty(pnrStr) && pnrFormatRegex.test(pnrStr);
}


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-10-validation.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-60-ko-send-data-via-post.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function PostMaster(parentPageUrl, customerModel, selectedPaymentMethodIdObs) {
    var self = this;

    /**
     * Can have three possible values: null, false, true
     * If null: use ajax to send booking request, checkOrderBeforeBooking can still be modified by setBookingRule(...)
     * If false: use ajax to send booking request (see getBookPaymentPromise(...))
     * If true: us postBookingOrder() to send booking request
     * {Boolean}
     */
    var checkOrderBeforeBooking = null,
        checkOrderDeferred = null;

    // update backend with every change in the customer address (really?!?!?!? Maybe only if combination is valid??)
    customerModel.stateChangeCounter.subscribe(function () {
        postUserInformation();
    });

    // update backend if selected payment method changed
    selectedPaymentMethodIdObs.subscribe(function (selectedPaymentMethodId) {
        if(selectedPaymentMethodId) {
            postPaymentMethod();
        }
    });

    self.checkBookingPromise = function() {
        if(checkOrderBeforeBooking) {
            if(checkOrderDeferred!==null) {
                console.log("illegal state: got second checkBookingPromise-request before first returned");
                return;
            }
            // create a new checkOrderDeferred and send a check-request to the server
            checkOrderDeferred = $.Deferred();
            postMsg({
                eventType: 'omnicheckout:booking-order'
            });

            return checkOrderDeferred.promise();
        }else{
            // no check was neccessary/required so return a resolved promise
            return RESOLVED_PROMISE_OF_NULL;
        }
    };

    /**
     * Books the order. This method is meant to be used when there must be a check to see if the
     * order is ready to be booked. It's used when posting messages to and from the iframe.
     *
     * @param data {Object}
     */
    function checkOrderResponse(data) {
        if(checkOrderDeferred===null) {
            console.log("illegal state: got checkOrderResponse-call without a checkBookingPromise-request");
            return;
        }
        var orderCheckPasses = data.hasOwnProperty('isOrderReady') && data.isOrderReady === true;

        if(orderCheckPasses) {
            checkOrderDeferred.resolve();
        }else{
            checkOrderDeferred.reject();
        }

        //reset the checkOrderDeferred so that a new checkBookingPromise-call is possible
        checkOrderDeferred = null;
    }

    // Post initial payment method
    postPaymentMethod();
    // This assumes that at this point the Iframe has been fully loaded: All AJAX requests and other stuff to get
    // the iframe up and running has been completed (which is not completly clear if that's really always the case).
    $(function () {
        postMsg({
            eventType: 'omnicheckout:loaded'
        });
    });


    function collectCustomerInfo() {
        var info = {
            address: {
                firstname: customerModel.legalAddress.firstName.value(),
                surname: customerModel.legalAddress.lastName.value(),
                address: customerModel.legalAddress.streetAndNr.value(),
                addressExtra: customerModel.legalAddress.extraInfo.value(),
                postal: customerModel.legalAddress.postal.value(),
                city: customerModel.legalAddress.city.value(),
                countryCode: customerModel.legalAddress.countryCode.value(),
                telephone: customerModel.telefon.value(),
                email: customerModel.email.value()
            },

            ssn: customerModel.pnr.value(),
            paymentMethod: selectedPaymentMethodIdObs() || "-1"
        };

        if (customerModel.wantsDeliveryAddress()) {
            info.delivery = {
                firstname: customerModel.deliveryAddress.firstName.value(),
                surname: customerModel.deliveryAddress.lastName.value(),
                address: customerModel.deliveryAddress.streetAndNr.value(),
                addressExtra: customerModel.deliveryAddress.extraInfo.value(),
                postal: customerModel.deliveryAddress.postal.value(),
                city: customerModel.deliveryAddress.city.value(),
                countryCode: customerModel.deliveryAddress.countryCode.value()
            };
        }

        return info;
    }

    /**
     * Posts a message to the parent window via window.postMessage().
     * The data argument must have an eventType property (the serverside relies on it).
     * @param data {Object} Information to be passed to the parent window.
     */
    function postMsg(data) {
        var eventType = data.eventType,
            sendMessageTo = parentPageUrl;

        if (isNotEmpty(sendMessageTo)) {
            if(isSetAndNotNull(eventType) && isNotEmpty(eventType)) {
                window.parent.postMessage(JSON.stringify(data), sendMessageTo);
            }else{
                console.log('postMsg-data without eventType: '+JSON.stringify(data));
            }
        }
    }

    /**
     * Setting up the handler for receiving messages.
     * @param data {Object} Information to be passed to the parent window.
     */
    //
    function receiveMsg(eventType, data) {
        switch (eventType) {
            case 'omnicheckout:set-booking-rule': setBookingRule(data); break;
            case 'omnicheckout:booking-order': checkOrderResponse(data); break;
            default:
        }
    }

    /**
     * Delegates incoming messages from the 'message' event to receiveMsg
     */
    window.addEventListener(
        'message',
        function(event) {
            var origin = event.origin || event.originalEvent.origin,
                acceptMessagesFrom = parentPageUrl;

            //some basic sanity checks
            if (origin !== acceptMessagesFrom ||
                event.source !== window.parent ||
                typeof event.data !== 'string') {
                return;
            }

            //oc-shops.js takes care of these messages
            if (event.data.indexOf("[iFrameSizer]") > -1) {
                return;
            }

            try {
                //delegate data to receiveMsg
                var data = JSON.parse(event.data);
                receiveMsg(data.eventType, data);
            } catch (e) {
                console.log(e);
            }
        },
        false
    );

    /**
     * Posts the user information.
     */
    function postUserInformation () {
        var data = collectCustomerInfo();
        data.eventType = 'omnicheckout:user-info-change';

        postMsg(data);
    }

    /**
     * Posts the chosen payment method.
     */
    function postPaymentMethod () {
        var selectedPaymentMethodId = selectedPaymentMethodIdObs();

        if(selectedPaymentMethodId) {
            postMsg({
                method: selectedPaymentMethodId,
                eventType: 'omnicheckout:payment-method-change'
            });
        }
    }

    /**
     * Used to set the booking variab (self.doBookingByPostMsgFlag) that is used to check if
     * the order is ready to be booked.     *
     * NOTE: You can only set the value once from a postMessage() event!
     */
    function setBookingRule(data) {
        if (checkOrderBeforeBooking === null) {
            if(isOfType(data.checkOrderBeforeBooking, 'boolean')) {
                checkOrderBeforeBooking = data.checkOrderBeforeBooking;
            }
        }
    }
}


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-60-ko-send-data-via-post.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-62-ko-send-data-via-websocket.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function WebsocketMaster(ws, omnicheckoutModel) {
    var self = this;

    ws.onmessage = function (event) {
        if (event.data == 'update') {
            var orderPromise = getOrderPromise();
            orderPromise.done(function (orderData) {
                omniCheckoutModel.updateOrderInfo(orderData);
            });
        }
        else if (event.data.match('^amount:')) {
            var arr = event.data.match(/^amount\:(.*)/) || ["", ""],
                orderValue = arr[1];

            omnicheckoutModel.paymentModel.totalAmount(orderValue);
        }
    };

    // update backend if selected payment method changed
    omnicheckoutModel.paymentMethodsModel.selectedPaymentMethodId.subscribe(function (selectedPaymentMethodId) {
        if (selectedPaymentMethodId) {
            ws.send("paymentMethodId:" + selectedPaymentMethodId);
        }
    });

    // send everything to ws-target
    // Notice: the question is, if it would be better to go a clear knockoutjs-subscribe route (as done with
    // selectedPaymentMethodId) instead of setting an omni-attribute with an old-school global event listener.
    // The global event listener way is pretty concise, but "it leaks a bit into the rest of the app"
    // by requiring an omni-parameter in mdl-input bindingHandler (which could be removed otherwise).
    $('body').on('change','input',function() {
        // check if event source has an omni-attribute (whose value is the omni-Name of that element)
        var omniName  = $(this).attr('omni');
        if(omniName) {
            var value = $(this).val();
            ws.send(omniName + ":" +  value);
        }

    });
}

//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-62-ko-send-data-via-websocket.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-80-ko-extensions.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

/**
 * equals a value-binding + MaterialDesign dirtyCheck!
 * the dirtyCheck is neccessary to animate the labels of input-fields
 * @link http://stackoverflow.com/questions/32957407/material-design-lite-how-to-programatically-reset-a-floating-label-input-text
 */
ko.bindingHandlers['mdl-value'] = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            $parent = $(element).parent();

        ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context);
        if(isNotEmpty(value)) {
            $parent.addClass('is-dirty');
        }else{
            $parent.removeClass('is-dirty');
        }
    }
};

/**
 * mdl-input is the upgraded version of mdl-value.
 * While mdl-value assumes that its input-element (which is attributed with mdl-value) is followed
 * by a label (with mdl-classes) and surrounded by a div (with mdl-classes).
 * This bindingHandler creates those two fields on it's own.
 * <input data-bind="mdl-input: {id:'input_firstname', type:'text', omni:'firstName',
 *                               labelTextKey: 'label-firstname', labelDefaultText: 'Förnamn',
 *                               value: customer.legalAddress.firstName.value}" />
 * is equivalent to
 * <div class="input-background unfilled mdl-js-textfield mdl-textfield--floating-label">
 *   <input id="input_firstname" type="text" class="mdl-textfield__input"
 *          placeholder="" spellcheck="false" omni="firstName"
 *          data-bind="mdl-value: customer.legalAddress.firstName.value" />
 *   <label class="mdl-textfield__label label-firstname" for="input_firstname">Förnamn</label>
 * </div>
 * @type {{init: ko.bindingHandlers.mdl-input.init, update: ko.bindingHandlers.mdl-input.update}}
 */
ko.bindingHandlers['mdl-input'] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var omniCheckoutModel = context.$root,
            $input = $(element),
            $parentDiv = $('<div>').insertAfter($input),
            $label = $('<label>'),
            params = valueAccessor();

        //div config
        $parentDiv.append($input).append($label); //div is now parent of $input and $label
        $parentDiv.addClass("input-background unfilled mdl-js-textfield mdl-textfield--floating-label");

        var inputId = params.id,
            inputType = params.type || "text",
            inputOmni = params.omni,
            labelTextKey = params.labelTextKey,
            labelText = params.labelDefaultText || omniCheckoutModel.translate(labelTextKey);

        //input field config
        $input.attr('id', inputId);
        $input.attr('type', inputType);
        $input.attr('placeholder', "");
        $input.attr('spellcheck', false);
        if(inputOmni) {
            $input.attr('omni', inputOmni);
        }
        $input.addClass('mdl-textfield__input');
        //label config
        $label.attr('for', inputId);
        $label.addClass('mdl-textfield__label');
        $label.addClass(labelTextKey);
        $label.text(labelText);

        ko.bindingHandlers.value.init(element, function () { return params.value; }, allBindingsAccessor, viewModel_deprecated, context);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var params = valueAccessor(),
            value = ko.utils.unwrapObservable(params.value),
            $parentDiv = $(element).parent();

        ko.bindingHandlers.value.update(element, function () { return params.value; }, allBindingsAccessor, viewModel_deprecated, context);

        // important so label moves up/down after a new values was set
        if(isNotEmpty(value)) {
            $parentDiv.addClass('is-dirty');
        }else{
            $parentDiv.removeClass('is-dirty');
        }
    }
};

/**
 * watches an Observable<DisplayableError>
 * shows an error box with the styling and message of the DisplayableError
 * <div data-bind="error-box: dErrObservable"></div>
 * is equivalent to
 * <div class="error-box">
 *   <div class="error-background">
 *     <span class="icon" aria-hidden="true"></span>
 *     <p class="{dErrObservable().cssClasses}">{translate(dErrObservable().errMsgKey)}</p>
 *   </div>
 * </div>
 * which is only visible if dErrObservable()!==null
 */
ko.bindingHandlers['error-box'] = {
    init: function (element) {
        var $elemDiv = $(element),
            $backgroundDiv = $('<div>').appendTo($elemDiv),
            $iconSpan = $('<span>').appendTo($backgroundDiv),
            $msgP = $('<p>').appendTo($backgroundDiv);

        $elemDiv.addClass('error-box');
        $backgroundDiv.addClass('error-background');
        $iconSpan.attr({
            "class": "icon",
            "aria-hidden": "true"
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var displayableError = ko.utils.unwrapObservable(valueAccessor()),
            omniCheckoutModel = context.$root,
            $elemDiv = $(element),
            $msgP = $elemDiv.find("p");

        if(displayableError===null) {
            $elemDiv.hide();
        }else{
            var translatedErrMsg = omniCheckoutModel.translate(displayableError.errMsgKey);
            $msgP.removeClass().addClass(displayableError.cssClasses);
            $msgP.text(translatedErrMsg);

            $elemDiv.show();
        }
    }
};

/**
 * watches an Observable<DisplayableError>
 * shows an error on the lower border of the abouve element with the styling and message of the DisplayableError
 * <div data-bind="error-subtext: dErrObservable"></div>
 * is equivalent to
 * <div class="error-box pos-absolute">
 *   <span class="icon" aria-hidden="true"></span>
 *   <p class="{dErrObservable().cssClasses}">{translate(dErrObservable().errMsgKey)}</p>
 * </div>
 * which is only visible if dErrObservable()!==null
 */
ko.bindingHandlers['error-subtext'] = {
    init: function (element) {
        var $elemDiv = $(element),
            $iconSpan = $('<span>').appendTo($elemDiv),
            $msgP = $('<p>').appendTo($elemDiv);

        $elemDiv.addClass('error-box pos-absolute');
        $iconSpan.attr({
            "class": "icon",
            "aria-hidden": "true"
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var displayableError = ko.utils.unwrapObservable(valueAccessor()),
            omniCheckoutModel = context.$root,
            $elemDiv = $(element),
            $msgP = $elemDiv.find("p");

        if(displayableError===null) {
            $elemDiv.hide();
        }else{
            var translatedErrMsg = omniCheckoutModel.translate(displayableError.errMsgKey);
            $msgP.removeClass().addClass(displayableError.cssClasses);
            $msgP.text(translatedErrMsg);

            $elemDiv.show();
        }
    }
};

/**
 * <div data-bind="translate: key">default text</div> is equivalent to
 * <div data-bind="text: translate(key)">default text</div> with 'key' being a string or an observable/computed of a string
 * at least if the current context object is the omniCheckoutModel, otherwise the text-binding will require a little
 * more effort to reach the translate-function.
 * The two also differenciate when no translation can be found. The translate function used in the text-Binding will
 * return the key itself (if not provided with a second parameter that would take the place as a default value).
 * The translate binding on the other hand will leave the initial content of the tag (e.g. in our example 'default text')
 * unchanged and log an error message that a certain key has no translation.
 * Both ways will update the value of the string, if
 * 1) key is an observable/computed (and not a primitive string) whose value changed
 * 2) omniCheckoutModel.active_language() changes
 *
 * Generally the use of the translate-binding is preferable.
 */
ko.bindingHandlers['translate'] = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var $elem = $(element),
            omniCheckoutModel = context.$root,
            TRANSLATION_IS_MISSING = "no_translation_found",
            translationKey = ko.utils.unwrapObservable(valueAccessor()),
            translation = omniCheckoutModel.translate(translationKey, TRANSLATION_IS_MISSING);

        if(translation!==TRANSLATION_IS_MISSING) {
            $elem.text(translation);
        }else{
            console.log("missing translation for key: "+translationKey);
        }
    }
};

/**
 * inserts the html from a backend call to getCostOfPurchaseHtmlPromise into the
 */
ko.bindingHandlers['load-cost-of-purchase'] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var omniCheckoutModel = context.$root,
            $elemDiv = $(element),
            $loadingImg = $('<img>').appendTo($elemDiv),
            $loadingMsg = $('<span>').appendTo($elemDiv);

        // $elemDiv.attr({
        //     "class": "main-spinner-container"
        // });

        $loadingImg.attr({
            "class": "main-spinner",
            "title": "Loading",
            "alt": "Loading",
            "src" : "img/graphics/main-spinner.GIF"
        });
        $loadingMsg.text(omniCheckoutModel.translate('main-spinner', 'Loading'));
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var paymentMethodId = ko.utils.unwrapObservable(valueAccessor()),
            omniCheckoutModel = context.$root,
            $elem = $(element),
            costOfPurchasePromise = getCostOfPurchaseHtmlPromise(paymentMethodId);

        costOfPurchasePromise.done(function (copHtml) {
            $elem.html(copHtml);
        }).fail(function (errMsg) {
            $elem.text(omniCheckoutModel.translate("error-no-information"));
        });
    }
};

/**
 * adds a click-handler that opens a popup with the content of a template
 */
ko.bindingHandlers['popup-on-click'] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel_deprecated, context) {
        var popupTemplate = ko.utils.unwrapObservable(valueAccessor()),
            omniCheckoutModel = context.$root,
            $elem = $(element);

        $elem.click(function () {
            omniCheckoutModel.ui.popupTemplate(popupTemplate);
        });
    }
};



// log knockout erros
ko.onError = function(error) {
    console.log("knockout error: "+ error);
};

/**
 * A koStateChangeCounter returns an observable that increments its value, as soon as one of the observable changes
 * it's value. The intertesting part is not the value it observes (the number of changes) but the event itself.
 * It your interessted in observing many observables and want to be informed as soon as one of them changes (and you
 * don't care which one), this might be the way to go.
 * @param arrayOfObservables { [<koObservables>] }: the observables that are monitored for a state change
 */
function koStateChangeCounter(arrayOfObservables) {
    var counterObservable = ko.observable(0),
        subscriptions = [];

    // parameter sanitation
    if(isNotSetOrNull(arrayOfObservables) || !isArray(arrayOfObservables)) {
        console.log('illegal parameter! expected an array but got '+typeof arrayOfObservables);
        //initialise as empty array
        arrayOfObservables = [];
    }

    function triggerStateChanged() {
        var oldCount = counterObservable();
        counterObservable(oldCount+1);
    }

    //subscribe to all elements of arrayOfObservables
    for (var i = 0; i < arrayOfObservables.length; i++) {
        var observable = arrayOfObservables[i],
            subscription = observable.subscribe(function (newValue) {
                //i don't care for the new value, just that something changed
                triggerStateChanged();
            });
        subscriptions.push(subscription);
    }

    //overwrite dispose to dispose subscriptions as well
    var superDispose = counterObservable.dispose;
    counterObservable.dispose = function () {
        for (var i = 0; i < subscriptions.length; i++) {
            var subscription = subscriptions[i];
            subscription.dispose();
        }
        superDispose();
    };

    // let's tune down the rate of firing events for this one to 100ms
    // else if the arrays of observales is initialised at the same time, each single change will trigger an event
    counterObservable.extend({ rateLimit: 100 });

    return counterObservable;
}

//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-80-ko-extensions.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-82-ko-validatable.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

/**
 *
 * @param asyncValidationFunc (optional) of form asyncValidationFunc(validatable : Validatable) : Promise<DisplayableError>
 *   with promise.done provides a null as data
 *   and promise.fail providse a DisplayableError
 *   @see validator-functions in oc-10-validation.js
 *   If no asyncValidationFunc is provided, alwaysValidValidator will be used as a default (which never flags an error).
 *   This signifies a Validatable without validation (at this point only used for the optional addressRow2/extraInfo).
 * @param the (optional) initial value of the validatable.value observable (default value is "")
 *   The value of this param determines what reset() resets the value of this Validatable, too.
 *   If this parameter is provided (and not false-ish), validate will be called after reset
 *   to update isConfirmedValid immediatly.
 * @constructor
 */
function Validatable (asyncValidationFunc, defaultValueStr) {
    // if no validation function is provided, every value is valid
    asyncValidationFunc = asyncValidationFunc || alwaysValidValidator;
    // if no initial value for self.value is provided, use the empty string
    defaultValueStr = defaultValueStr || "";

    var self = this,
        validateOnValueChange = true,
        hasDefaultValue = defaultValueStr!=="";
    self.isRequired = true;
    // this assumes that alwaysValidValidator is the only validator to always return true
    if(asyncValidationFunc===alwaysValidValidator) {
        self.isRequired = false;
    }
    self.value = ko.observable(defaultValueStr);
    // validate() has to be called exlicitly (on purpose) to update foundError
    self.foundError = ko.observable(null); //Observable<DisplayableError>
    // was validate function called? (important for isConfirmedValid method)
    self.wasValidated = ko.observable(false);
    // make sure instance is valid without triggering validation (and therefore error messages)
    self.isConfirmedValid = ko.pureComputed(function () {
        if(self.isRequired) {
            if(self.wasValidated()) {
                //
                return self.foundError()===null;
            }else{
                return false;
            }
        }else{
            // a validatable that isn't required, is always valid
            return true;
        }
    });
    // run the validation code (this triggers validation errors to become visible)
    self.validate = function () {
        var errorPromise = asyncValidationFunc(self.value()); //Promise<DisplayableError>
        errorPromise.always(function (errorOrNull) {
            self.foundError(errorOrNull);
            self.wasValidated(true);
        });
    };
    self.isEmpty = function () {
        //maybe a isInitial would be more appropriate??
        return self.value()==="";
    };
    self.setValueWithoutValidation = function(value) {
        validateOnValueChange = false;
        self.value(value);
        validateOnValueChange = true;
    };
    self.setValidValueIfEmpty = function (newValue) {
        //only set the value if none has been set and the new value is valid
        if(self.isEmpty()) {
            var validationPromise = asyncValidationFunc(newValue);
            //do the validation beforehand beause we don't want to have error-popups initially
            validationPromise.done(function () {
                // newValue is valid
                self.setValueWithoutValidation(newValue);
                // but we want the benefits of successful validation
                self.wasValidated(true);
            });
        }
    };
    self.reset = function () {
        // we don't want validation on clearing the value
        // (setting validateOnValueChange to false disables the validate-subscription on self.value)
        self.setValueWithoutValidation(defaultValueStr); // normally this will be the empty string (but not in the case of e.g. countryCode)
        self.wasValidated(false);
        self.foundError(null);

        // if defaultValue was set, we have to trigger the reevaluation of that default
        // which should set isConfirmedValid to true (the assumption is, that the default is valid)
        if(hasDefaultValue) {
            self.validate(defaultValueStr);
        }
    };

    //* Subscriptions:
    //validate on value change
    self.value.subscribe(function (newValueStr) {
        if(validateOnValueChange) {
            self.validate(newValueStr);
        }
    });

    // if defaultValueStr is set, the validatable should be valid to start with
    // so let's call validate to confirm that
    // (otherwise the validation of invisible fields like customer.type and address.countryCode is never triggered)
    if(hasDefaultValue) {
        self.validate();
    }
}

/**
 * This classes value and isConfirmedValid methods reflect the state of primaryValidatable, and if that instance isn't
 * confirmed valid, then it falls back to fallbackValidatable.
 * @param primaryValidatable of type Validatable
 * @param fallbackValidatable of type Validatable
 * @constructor
 */
// (used for pnr-field in customer, with a fallback in the payment section)
function ValidatableWithFallback(primaryValidatable, fallbackValidatable) {
    var self = this;
    self.value = ko.pureComputed(function () {
        if(primaryValidatable.isConfirmedValid()) {
            return primaryValidatable.value();
        }else{
            return fallbackValidatable.value();
        }
    });
    self.isConfirmedValid = ko.pureComputed(function () {
        return primaryValidatable.isConfirmedValid() || fallbackValidatable.isConfirmedValid();
    });
}

//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-82-ko-validatable.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-86-ko-address-models.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function AddressModel() {
    var self = this;
    self.firstName = new Validatable(createIsNotEmptyValidator("error-firstname"));
    self.lastName = new Validatable(createIsNotEmptyValidator("error-surname"));
    self.streetAndNr = new Validatable(createIsNotEmptyValidator("error-address"));
    self.extraInfo = new Validatable();
    self.postal = new Validatable(postalCodeValidator);
    self.city = new Validatable(createIsNotEmptyValidator("error-city"));
    self.countryCode = new Validatable(countryCodeValidator, "SE");
    self.stateChangeCounter = koStateChangeCounter(
        [self.firstName.value, self.lastName.value, self.streetAndNr.value, self.extraInfo.value,
            self.postal.value, self.city.value, self.countryCode.value]
    );

    self.isConfirmedValid = ko.pureComputed(function () {
        return self.firstName.isConfirmedValid() && self.lastName.isConfirmedValid() &&
            self.streetAndNr.isConfirmedValid() && self.extraInfo.isConfirmedValid() &&
            self.postal.isConfirmedValid() && self.city.isConfirmedValid() && self.countryCode.isConfirmedValid();
    });
    self.validate = function () {
        self.firstName.validate();
        self.lastName.validate();
        self.streetAndNr.validate();
        self.extraInfo.validate();
        self.postal.validate();
        self.city.validate();
        self.countryCode.validate();
    };
    self.updateIfEmpty = function(firstNameStr, lastNameStr, addressRow1Str, addressRow2Str, postalCodeStr, postalAreaStr, countryCodeStr) {
        self.firstName.setValidValueIfEmpty(noNPE(firstNameStr));
        self.lastName.setValidValueIfEmpty(noNPE(lastNameStr));
        self.streetAndNr.setValidValueIfEmpty(noNPE(addressRow1Str));
        self.extraInfo.setValidValueIfEmpty(noNPE(addressRow2Str));
        self.postal.setValidValueIfEmpty(noNPE(postalCodeStr));
        self.city.setValidValueIfEmpty(noNPE(postalAreaStr));
        if(isSetAndNotNull(countryCodeStr) && isNotEmpty(countryCodeStr)) {
            //country code is more prone to breaking so let's be extra carefull and leave validation in
            if(self.countryCode.isEmpty()) {self.countryCode.value(countryCodeStr);}
        }
    };
    self.isEmpty = function () {
        return self.firstName.isEmpty() && self.lastName.isEmpty() && self.streetAndNr.isEmpty() &&
            self.extraInfo.isEmpty() && self.postal.isEmpty() && self.city.isEmpty();
    };
    self.reset = function () {
        self.firstName.reset();
        self.lastName.reset();
        self.streetAndNr.reset();
        self.extraInfo.reset();
        self.postal.reset();
        self.city.reset();
        self.countryCode.reset();
    };
}

function CustomerModel(legalTerms) {
    var self = this;
    self.pnr = new Validatable(pnrValidator);
    self.pnr.showSpinner = ko.observable(false);
    self.legalAddress = new AddressModel();
    self.email = new Validatable(emailValidator);
    self.telefon = new Validatable(phoneNrValidator);
    self.type = new Validatable(customerTypeValidator, "NATURAL");
    self.wantsDeliveryAddress = ko.observable(false);
    self.wantsDeliveryAddressError = ko.observable(null); //Observable<DisplayableError>
    self.deliveryAddress = new AddressModel();
    self.stateChangeCounter = koStateChangeCounter(
        [self.legalAddress.stateChangeCounter, self.email.value, self.telefon.value,
            self.wantsDeliveryAddress, self.deliveryAddress.stateChangeCounter, self.type.value]
    );
    // addrCol contains the different ui states (which part of customer data are displayed)
    self.addrCol = new AddressColumnStateModel();
    self.addrCol.state.subscribe(function (newState) {
        switch(newState) {
            case _AddressStatesEnum.PNR_INPUT:
                self.reset();
                break;
            case _AddressStatesEnum.PNR_DATA_PROVIDED:
                self.setFocus();
                break;
            case _AddressStatesEnum.DROP_PNR:
                // drop the pnr
                // (otherwise it's an interesting questions what happens if you insert a valid pnr,
                // but click on 'manual mode' instead of 'get address')
                self.pnr.value("");
                self.setFocus();
                break;
            default:
        }
    });

    self.isActive = ko.pureComputed(function () {
        return legalTerms.haveLatestBeenAccepted();
    });
    self.isLegalDataConfirmedValid = ko.pureComputed(function () {
        return self.legalAddress.isConfirmedValid() && self.email.isConfirmedValid() &&
            self.telefon.isConfirmedValid() && self.type.isConfirmedValid();
    });
    self.isConfirmedValid = ko.pureComputed(function () {
        return legalTerms.haveLatestBeenAccepted() && self.isLegalDataConfirmedValid() &&
            ( (!self.wantsDeliveryAddress())||self.deliveryAddress.isConfirmedValid());
    });

    self.validateLegalData = function() {
        self.legalAddress.validate();
        self.email.validate();
        self.telefon.validate();
        self.type.validate();
    };
    self.validate = function() {
        self.validateLegalData();
        if( self.wantsDeliveryAddress() ) {
            self.deliveryAddress.validate();
        }
    };
    self.toggleDeliveryAddress = function () {
        var wantsDeliveryAddressNow = !self.wantsDeliveryAddress();
        if(wantsDeliveryAddressNow) {
            // validate legal data (address/email/telefonnr)
            // so that isLegalDataConfirmedValid doesn't fine unconfirmed/unvalidated values
            self.validateLegalData();
            var isLegalDataValid = self.isLegalDataConfirmedValid();

            if(isLegalDataValid) {
                self.wantsDeliveryAddressError(null);
                self.wantsDeliveryAddress(true);
            }else{
                self.wantsDeliveryAddressError(new DisplayableError("", "another-deliery-error"));
            }
        }else{
            self.wantsDeliveryAddress(false);
        }
    };
    self.reset = function () {
        self.pnr.reset();
        self.legalAddress.reset();
        self.email.reset();
        self.telefon.reset();
        self.pnr.reset();
        self.type.reset();
        self.resetDeliveryAddress();
    };
    self.resetDeliveryAddress = function () {
        self.wantsDeliveryAddress(false);
        self.deliveryAddress.reset();
    };
    self.setFocus = function () {
        // don't set the focus if this column isn't active (legal terms are still visible)
        if(!self.isActive()) {
            return;
        }
        // let knockout finish with it's dependencies before changing the ui
        setTimeout(function () {
            //set the focus to the first non-optional field that is empty
            if (self.legalAddress.firstName.isEmpty()) {
                $("#input_firstname").focus();
            } else if(self.legalAddress.lastName.isEmpty()) {
                $("#input_surname").focus();
            } else if(self.legalAddress.streetAndNr.isEmpty()) {
                $("#input_address").focus();
            } else if (self.legalAddress.postal.isEmpty()) {
                $("#input_postal").focus();
            } else if (self.legalAddress.city.isEmpty()) {
                $("#input_city").focus();
            } else if (self.telefon.isEmpty()) {
                $("#input_telephone").focus();
            } else if (self.email.isEmpty()) {
                $("#input_email").focus();
            } else {
                // all neccessary fields got input
                // let's see if it's valid (which will unlock the paymentMethod section if successful)
                self.validate();
            }
        }, 0);
    };

    self.pnr.isConfirmedValid.subscribe(function (isValid) {
        // if the pnr is being evaluated as valid instaciate the costumer's primary information
        if(isValid) {
            var pnrStr = self.pnr.value(),
                addressPromise = getPromiseOfAddressByPnr(pnrStr);

            addressPromise.done(function(data) {
                //on success
                var addr = data.invoiceAddress;
                self.legalAddress.updateIfEmpty(
                    addr.firstName, addr.lastName, addr.addressRow1,
                    addr.addressRow2, addr.postalCode, addr.postalArea);
                self.telefon.setValidValueIfEmpty(data.mobile);
                self.email.setValidValueIfEmpty(data.email);

                //reset the customer's delivery address
                self.resetDeliveryAddress();

                self.addrCol.setPnrDataProvided();
            }).fail(function(errObj) {
                // this should never happen, the validation of the pnrStr should have been successfull at this point
                // which means that valid data for this pnrStr should have been cached!
                // Most likely the code was modified without keeping this relationship (e.g. the caching of the address by pnr) intact.
                // Check pnr.reset(), a racing condition there might have triggered this.
                // While this is an illegal state, it probably didn't corrupt the application state, so the app should still run correctly.
                // console.log(
                //     "invalid state: pnr validated as valid but getting an address for it failed (which is part of validation)"+
                //     ", pnrStr: '"+pnrStr+"', errorObj: "+JSON.stringify(errObj)
                // );
            })
        }
    });
    self.isActive.subscribe(function (isActiveNow) {
        if(isActiveNow) {
            self.setFocus();
        }
    });
}

var _AddressStatesEnum = {
    PNR_INPUT : 1, //show only pnr-field with "Hämta Adress"-button and manual address-link, hide address fields
    PNR_DATA_PROVIDED : 2, //deactivated pnr-field, "Hämta Adress"->"Inte du?"
    DROP_PNR : 3 //no pnr-field but "tillbaka till ange pnr"-link
};
function AddressColumnStateModel() {
    var self = this;
    self.state = ko.observable(_AddressStatesEnum.PNR_INPUT);
    self.showLegalAddressInfo = ko.observable(false);
    self.showDeliveryAddressInfo = ko.observable(false);

    self.isPnrInput = ko.pureComputed(function () {
        return self.state()===_AddressStatesEnum.PNR_INPUT;
    });
    self.isPnrDataProvided = ko.pureComputed(function () {
        return self.state()===_AddressStatesEnum.PNR_DATA_PROVIDED;
    });
    self.isDropPnr = ko.pureComputed(function () {
        return self.state()===_AddressStatesEnum.DROP_PNR;
    });

    self.setPnrInput = function () {
        self.state(_AddressStatesEnum.PNR_INPUT);
    };
    self.setPnrDataProvided = function () {
        self.state(_AddressStatesEnum.PNR_DATA_PROVIDED);
    };
    self.setDropPnr = function () {
        self.state(_AddressStatesEnum.DROP_PNR);
    };

    self.toggleLegalAddressInfo = function() {
        self.showLegalAddressInfo(!self.showLegalAddressInfo());
    };
    self.toggleDeliveryAddressInfo = function() {
        self.showDeliveryAddressInfo(!self.showDeliveryAddressInfo());
    };
}


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-86-ko-address-models.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-88-ko-payment-models.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function PaymentMethodsModel(isCustomerConfirmedValidObservable, customerPnrValidatable) {
    var self = this,
        selectedPaymentMethodIdRateLimit = 50;
    self.isActive = isCustomerConfirmedValidObservable;
    self.generalPaymentError = ko.observable(null); //Observable<DisplayableError>
    self.paymentMethods = ko.observableArray();
    self.selectedPaymentMethodId = ko.observable(null);
    // don't update this observable more often than every 50ms (don't fire too many events in initialisation)
    self.selectedPaymentMethodId.extend({ rateLimit: selectedPaymentMethodIdRateLimit });
    self.fallbackPnr = new Validatable(pnrValidator);
    self.effectivePnr = new ValidatableWithFallback(customerPnrValidatable, self.fallbackPnr);

    self.selectedPaymentMethod = ko.pureComputed(function () {
        // select the paymentMethod in the observale array that has the observed selected id
        var selectedId = self.selectedPaymentMethodId();
        if(isNotSetOrNull(selectedId)) {
            return null;
        }
        var paymentMethodArray = self.paymentMethods();
        if(isNotSetOrNull(paymentMethodArray)) {
            return null;
        }
        // look within the payment method array for the selected id
        for(var i=0; i<paymentMethodArray.length; i++) {
            var paymentMethod = paymentMethodArray[i];
            if(paymentMethod.id === selectedId) {
                // we found the payment method with the right id
                return paymentMethod;
            }
        }
        // paymentMethods doesn't contain an item with the right id
        return null;
    });
    self.isConfirmedValid = ko.pureComputed(function () {
        var selectedMethod = self.selectedPaymentMethod();
        if(selectedMethod===null) {
            return false;
        }
        return self.isActive() && selectedMethod.isConfirmedValid();
    });

    self.updatePaymentMethods = function (paymentMethodsArray) {
        var wasPaymentMethodsPrefilled = self.paymentMethods().length!==0;
        // unsubscribe all old paymentMethods (knockout subscriptions) before deleting them (else memory leak)
        $.each(self.paymentMethods(), function (index, oldPaymentMethod) {
            oldPaymentMethod.unsubscribe();
        });
        //maybe there is a less invasive way to update payments?
        self.paymentMethods.removeAll();

        var paymentMethodIds = [];
        $.each(paymentMethodsArray, function (index, paymentMethod) {
            paymentMethodIds.push(paymentMethod.id);
            //add cardnumber validator to ResursKort
            _addPropertiesTo(paymentMethod, self);
            self.paymentMethods.push(paymentMethod);
        });
        //update selectedPaymentMethodId
        var selectedId = self.selectedPaymentMethodId(),
            waitForIdChangeTimeout = 0;
        if(isSetAndNotNull(selectedId)) {
            if($.inArray(selectedId, paymentMethodIds)===-1) {
                // former selected paymentMethod is no longer available
                self.selectedPaymentMethodId(selectedId);
                waitForIdChangeTimeout = selectedPaymentMethodIdRateLimit +10;
            }
        }
        // wait
        setTimeout(function () {
            // don't focus on the first element if the list was (initially) empty
            if(wasPaymentMethodsPrefilled) {
                self.setFocus();
            }
        }, waitForIdChangeTimeout);
    };
    self.selectTemplate = function (paymentMethod) {
        switch(paymentMethod.internalType) {
            case InternalType.INVOICE:      return "invoice-template";
            case InternalType.PART_PAYMENT: return "installment-template";
            case InternalType.RESURS_CARD:  return "resurscard-template";
            case InternalType.NEW_CARD:     return "new-resurscard-template";
            case InternalType.CARD_TEST:    return "card-template";
            // InternalType.INTERNET not yet supported and therefore deactivated for now -> fallback to UNKNOWN
            //case InternalType.INTERNET:     return "direct-template";
            default:
                //e.g. InternalType.UNKNOWN
                return "unknown-payment-method-template";
        }
    };
    self.setFocus = function () {
        // let knockout finish with it's dependencies before changing the ui
        setTimeout(function () {
            // make sure a paymentMethod is selected (if cookie-data didn't set on, take the first one)
            var setFocusTimeout = 0;
            if(self.selectedPaymentMethod()===null) {
                var paymentMethodsArray = self.paymentMethods();
                if(paymentMethodsArray.length===0) {
                    // nothing to select here
                    return;
                }
                self.selectedPaymentMethodId(paymentMethodsArray[0].id);
                // it takes 50ms for changes to to selectedPaymentMethodId to take effect
                // so lets wait a little longer
                setFocusTimeout = selectedPaymentMethodIdRateLimit+10;
            }

            setTimeout(function () {
                var selPaymentMethod = self.selectedPaymentMethod();
                if(selPaymentMethod!==null) {
                    selPaymentMethod.setFocus();
                }
            },setFocusTimeout);
        }, 0);
    };

    self.selectedPaymentMethodId.subscribe(function (_) {
        // if a new payment method is selected,
        // make sure a potential former payment error is no longer displayed
        self.generalPaymentError(null);
    });
    self.isActive.subscribe(function (isActiveNow) {
        if(isActiveNow) {
            self.setFocus();
        }
    });
}

// using an internal type for PaymentMethods makes the code is easier to understand and fix
var InternalType = {
    // PaymentMethod.id by internal name
    // specific int values carry no meaning (but have to be distinct, of course)
    RESURS_CARD:   101,
    NEW_CARD:      102,
    INVOICE :      103,
    PART_PAYMENT : 104,
    INTERNET:      105,
    CARD_TEST:     106,
    UNKNOWN:       999
};

function getInternalTypeOf(paymentMethod) {
    var compositeType = noNPE(paymentMethod.type) + '-' + noNPE(paymentMethod.specificType);
    switch(compositeType) {
        case "CARD-CARD":                          return InternalType.RESURS_CARD;  //id:"7"
        case "REVOLVING_CREDIT-REVOLVING_CREDIT":  return InternalType.NEW_CARD;     //id:"8"
        case "INVOICE-INVOICE":                    return InternalType.INVOICE;      //id:"9"
        case "REVOLVING_CREDIT-PART_PAYMENT":      return InternalType.PART_PAYMENT; //id:"16"
        case "PAYMENT_PROVIDER-CARD":              return InternalType.CARD_TEST;    //id:"CARD_TEST"
        case "PAYMENT_PROVIDER-INTERNET":          return InternalType.INTERNET;     //id:?
        default:                                   return InternalType.UNKNOWN;      //other
    }
    //id to internal type mapping
}


function _addPropertiesTo(paymentMethod, paymentMethodsModel) {
    //* properties/observales to add to every paymentMethod

    // overwrite this (and possibly 'isConfirmedValid') if a payment method works without the PNR
    paymentMethod['requiresPnr'] = ko.observable(true);
    paymentMethod['isPnrProvidedOrNotRequired'] = ko.pureComputed(function () {
        return (!paymentMethod.requiresPnr()) || paymentMethodsModel.effectivePnr.isConfirmedValid();
    });
    paymentMethod['internalType'] = getInternalTypeOf(paymentMethod);
    paymentMethod['isActive'] = ko.pureComputed(function () {
        var selectedId = paymentMethodsModel.selectedPaymentMethodId(),
            id = paymentMethod.id;

        if(isSetAndNotNull(selectedId) && isSetAndNotNull(id)) {
            return selectedId===id;
        }else {
            return false;
        }
    });
    // default implementation of setFocus does nothing
    paymentMethod['setFocus'] = noop;
    // default implementation of isConfirmedValid
    if(!paymentMethod.isConfirmedValid) {
        paymentMethod['isConfirmedValid'] = ko.pureComputed(function () {
            // default implementation only requires the payment method to be selected
            // no extra validation is neccessary
            return paymentMethod.isActive() && paymentMethod.isPnrProvidedOrNotRequired();
        });
    }

    //* overwrite methods or/and add observables to specific paymentMethod types
    switch(paymentMethod.internalType) {
        case InternalType.RESURS_CARD:
            var resurscardValidatable = new Validatable(resursCardValidator);
            paymentMethod['resursCardNumber'] = resurscardValidatable;
            paymentMethod['isConfirmedValid'] = ko.pureComputed(function () {
                // default implementation only requires the payment method to be selected
                // no extra validation is neccessary
                return paymentMethod.isActive() &&
                    paymentMethod.isPnrProvidedOrNotRequired() &&
                    resurscardValidatable.isConfirmedValid();
            });
            paymentMethod['setFocus'] = function () {
                // let knockout finish with it's dependencies before changing the ui
                setTimeout(function () {
                    // focus on the resurscard-field
                    $("#input_resurs_card_payment").focus();
                },0);
            };
            break;
        case InternalType.NEW_CARD:
            // let's make sure the array is initialised
            if(!paymentMethod.newCardCreditInterval || paymentMethod.newCardCreditInterval.length===0) {
                // the 0-value is an invalid valit in isConfirmedValid (and will therefor lock the Buy-button)
                // but will leave the gui intact
                paymentMethod.newCardCreditInterval = [0];
            }
            paymentMethod['selectedCredit'] = ko.observable(paymentMethod.newCardCreditInterval[0]);
            paymentMethod['isConfirmedValid'] = ko.pureComputed(function () {
                // default implementation only requires the payment method to be selected
                // no extra validation is neccessary
                return paymentMethod.isActive() &&
                    paymentMethod.isPnrProvidedOrNotRequired() &&
                    paymentMethod.selectedCredit()>0;
            });
            paymentMethod['setFocus'] = function () {
                // let knockout finish with it's dependencies before changing the ui
                setTimeout(function () {
                    // focus on 'new card'- credit selector
                    var $newCardCreditSelect = $("#credit-selector");
                    $newCardCreditSelect.focus();
                },100);
            };
            break;
        case InternalType.UNKNOWN:
            paymentMethod['isConfirmedValid'] = ko.pureComputed(function () {
                // an unknown payment type can't be confirmed
                return false;
            });
            break;
    }

    paymentMethod['unsubscribe'] = function () {
        $.each(paymentMethod.subscriptions, function (index, koSubscription) {
            koSubscription.dispose();
        });
    };

    paymentMethod['subscriptions'] = [paymentMethod.isActive.subscribe(function (isActiveNow) {
        if(isActiveNow) {
            paymentMethod.setFocus();
        }
    })];
}


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-88-ko-payment-models.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-90-ko-models.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

function ShopModel() {
    var self = this;
    // async initialisation of name and link is expected via init-method
    self.name = ko.observable("");
    self.link = ko.observable("");
}

function PaymentModel(isActiveFunction, bookPaymentFunction, updatePaymentMethodsFunction) {
    var self = this;
    self.isActive = isActiveFunction;
    self.saveCustomerData = ko.observable(false);
    self.totalAmount = ko.observable(0);
    self.totalAmount.subscribe(function(oldTotalAmount) {
        // whenever the value of totalAmount changes (apart from the first time from 0 to something)
        // update also the payment methods
        if(oldTotalAmount!==0) {
            var latestPaymentMethodsPromise = getLatestPaymentMethodsPromise();
            latestPaymentMethodsPromise.done(function (paymentMethodsJson) {
                updatePaymentMethodsFunction(paymentMethodsJson);
            });
        }
    }, null, "beforeChange");

    var isPaymentOngoingObservable = ko.observable(false);
    self.isAllowedToPurchase = ko.pureComputed(function () {
        return isActiveFunction() && !isPaymentOngoingObservable();
    });
    self.bookPayment = function() {
        bookPaymentFunction(isPaymentOngoingObservable);
    }
}

function LegalTermsModel() {
    var self = this;
    self.legalTermsVersionOfOrder = ko.observable(null); //Observable<int>
    self.legalTermsVersionAccepted = ko.observable(null); //Observable<int>
    self.haveLatestBeenAccepted = ko.pureComputed(function () {
        return isSetAndNotNull(self.legalTermsVersionOfOrder()) &&
            self.legalTermsVersionOfOrder()===self.legalTermsVersionAccepted();
    });
    self.haveAnyBeenAccepted = ko.pureComputed(function () {
        return isSetAndNotNull(self.legalTermsVersionAccepted());
    });
    self.accept = function () {
        self.legalTermsVersionAccepted(self.legalTermsVersionOfOrder());
    };
}

function UiModel() {
    var self = this;
    self.isLoading = ko.observable(true);
    //Observable<string> <-see template-scripts at the buttom of omni-checkout.html
    self.popupTemplate = ko.observable(null);
    self.isShowingPopup = ko.pureComputed(function () {
        return self.popupTemplate()!==null;
    });
    self.closePopup = function () {
        self.popupTemplate(null);
    };

    self.hasMobilLayout = ko.observable(false);
    var _gadjetWidthDefs = {
        smaller_layout_width : 1024,
        tablet_layout_width : 768,
        mobile_layout_width : 550
    };
    self.recomputeLayoutType = function () {
        var windowWidth = $(window).width();
        self.hasMobilLayout(windowWidth<=_gadjetWidthDefs.mobile_layout_width);
    };

    // compute the layout and recompute it, if the window-size changes
    self.recomputeLayoutType();
    $( window ).resize(function() {
        self.recomputeLayoutType();
    });

    self.isBrowserObsolete = function() {
        //is old Internet Explorer
        var $html = $('html');
        if($html.hasClass('old-ie')) {
            var isLowerThanIE7 = $html.hasClass('lt-ie7'),
                isIE7 = $html.hasClass('ie7'),
                isIE8 = $html.hasClass('ie8'),
                isIE9 = $html.hasClass('ie9');

            // we don't support Internet Explorer below IE9
            if(isLowerThanIE7 || isIE7 || isIE8 ) {
                return true;
            }
        }
        return false;
    };
}

function OmniCheckoutModel() {
    var self = this;
    self.active_language = ko.observable("swedish"); // see languages in language.xml: swedish, norwegian
    self.translate = function (key, defaultMsg) {
        if(!key) {
            return "provide a key-parameter"
        }
        return omniTranslate(key, self.active_language(), defaultMsg);
    };

    self.ui = new UiModel();
    self.legalTermsModel = new LegalTermsModel();
    self.customerModel = new CustomerModel(self.legalTermsModel);
    self.paymentMethodsModel = new PaymentMethodsModel(self.customerModel.isConfirmedValid, self.customerModel.pnr);
    self.paymentModel = new PaymentModel(self.paymentMethodsModel.isConfirmedValid, bookPaymentWithCheck, self.paymentMethodsModel.updatePaymentMethods);
    self.shopModel = new ShopModel(self.customerModel, self.paymentMethodsModel.selectedPaymentMethodId);
    // is initialized in init-method
    self.postMaster = null;
    // is initialized in init-method
    self.websocketMaster = null;
    self.hasFatalError = ko.observable(false);
    self.fatalError = ko.pureComputed(function () {
        if(self.hasFatalError()) {
            return new DisplayableError("", "no-service");
        }else{
            return null;
        }
    });

    self.init = function(orderData, cookies, wsPromise) {
        // set up object that communicats with "home" via window.post
        self.postMaster = new PostMaster(
            orderData.shopUrl,
            self.customerModel,
            self.paymentMethodsModel.selectedPaymentMethodId);
        // set up object that communicats with "home" via websocket
        wsPromise.done(function (ws) {
            self.websocketMaster = new WebsocketMaster(ws, self);
        }).fail(function (errMsg) {
            console.log("ws-init failed: "+errMsg)
        });


        self.updateOrderInfo(orderData);

        //update cookie info
        if(isSetAndNotNull(cookies) && isSetAndNotNull(cookies.firstName)) {
            self.customerModel.legalAddress.updateIfEmpty(
                cookies.firstName, cookies.lastName, cookies.addressRow1, cookies.addressRow2,
                cookies.postalCode, cookies.postalArea, null);
            self.customerModel.telefon.setValidValueIfEmpty(cookies.mobile);
            self.customerModel.email.setValidValueIfEmpty(cookies.email);
            //maybe the user already started to write in his pnr, so lets check

            self.legalTermsModel.legalTermsVersionAccepted(parseInt(cookies.legal_terms_version));

            // Open last uses paymnet method from saved cookie
            // if that payment method is still available
            var preselectedPaymentMethodId = cookies.payment_method;
            for (var i = 0; i < orderData.paymentMethods.length; i++) {
                var availablePaymentMethod = orderData.paymentMethods[i];
                if (availablePaymentMethod.id === preselectedPaymentMethodId) {
                    self.paymentMethodsModel.selectedPaymentMethodId(preselectedPaymentMethodId);
                    // no need to look in other payment methods, we found the right one
                    break;
                }
            }

            //the customer already agreed to cookies (elsewise i wouldn't have cookie data now)
            self.paymentModel.saveCustomerData(true);

            // get immediately address for cookie-pnr
            // (and put this last because this will download new data which shouldn't interfere with cookie data)
            var currentPnr = self.customerModel.pnr.value();
            if (cookies.governmentId.indexOf(currentPnr) === 0) {
                self.customerModel.pnr.value(cookies.governmentId);
            }
        }

        // let's wait slightly longer to remove the loading-screen
        setTimeout(function () {
            self.ui.isLoading(false);
        }, 200);
    };

    self.updateOrderInfo = function(orderData) {
        //update order info
        self.paymentModel.totalAmount(orderData.totalAmount);
        //update the legal terms
        self.legalTermsModel.legalTermsVersionOfOrder(orderData.legalTermsVersion);

        //set shop info
        self.shopModel.link(orderData.shopTermsLink);
        self.shopModel.name(orderData.shopName);

        self.paymentMethodsModel.updatePaymentMethods(orderData.paymentMethods);

        //If delivery address is available, show delivery address (but don't overwrite it)
        var customer = orderData.customer,
            currentDeliveryAddress = self.customerModel.deliveryAddress;

        if (customer != null && customer.deliveryAddress != null && currentDeliveryAddress.isEmpty()) {
            currentDeliveryAddress.updateIfEmpty(
                addr.firstName, addr.lastName, addr.addressRow1,
                addr.addressRow2, addr.postalCode, addr.postalArea);
        }
    };

    function bookPaymentWithCheck(isPaymentOngoingObservable) {
        isPaymentOngoingObservable(true);
        // we can request a server-side booking check
        var checkOrderPromise = self.postMaster.checkBookingPromise();

        checkOrderPromise.done(function () {
            bookPaymentWithoutCheck();
        }).fail(function () {
            //show general error
            var err = new DisplayableError("", "error-payment-method");
            self.paymentMethodsModel.generalPaymentError(err);
        }).always(function () {
            isPaymentOngoingObservable(false);
        })
    }

    var bookPaymentWithoutCheck = function () {

        var customerDto = {
            invoiceAddress : {
                firstName: self.customerModel.legalAddress.firstName.value(),
                lastName: self.customerModel.legalAddress.lastName.value(),
                addressRow1: self.customerModel.legalAddress.streetAndNr.value(),
                addressRow2: self.customerModel.legalAddress.extraInfo.value(),
                postalCode: self.customerModel.legalAddress.postal.value(),
                postalArea: self.customerModel.legalAddress.city.value(),
                countryCode: self.customerModel.legalAddress.countryCode.value()
            },
            mobile: self.customerModel.telefon.value(),
            email: self.customerModel.email.value(),
            governmentId: self.paymentMethodsModel.effectivePnr.value(),
            customerType: self.customerModel.type.value()
        };

        if(self.customerModel.wantsDeliveryAddress()) {
            customerDto.deliveryAddress = {
                firstName: self.customerModel.deliveryAddress.firstName.value(),
                lastName: self.customerModel.deliveryAddress.lastName.value(),
                addressRow1: self.customerModel.deliveryAddress.streetAndNr.value(),
                addressRow2: self.customerModel.deliveryAddress.extraInfo.value(),
                postalCode: self.customerModel.deliveryAddress.postal.value(),
                postalArea: self.customerModel.deliveryAddress.city.value(),
                countryCode: self.customerModel.deliveryAddress.countryCode.value()
            };
        }

        var selectedPaymentMethod = self.paymentMethodsModel.selectedPaymentMethod();

        var ocDto = {
            customer: customerDto,
            paymentMethod: selectedPaymentMethod.id
        };

        if(self.paymentModel.saveCustomerData()) {
            ocDto.cookiesAllowed = true;
        }

        if (self.legalTermsModel.haveAnyBeenAccepted()) {
            ocDto.approvedLegalTermsVersion = self.legalTermsModel.legalTermsVersionAccepted();
        }

        //add card information for several payment types
        switch(selectedPaymentMethod.internalType) {
            case InternalType.RESURS_CARD:
                ocDto.card = {
                    cardNumber: selectedPaymentMethod.resursCardNumber.value()
                };
                break;
            case InternalType.NEW_CARD:
                ocDto.card = {
                    newCardAmount: selectedPaymentMethod.selectedCredit()
                };
                break;
            default:
            //no card information to add
        }

        var bookingPromise = getBookPaymentPromise(ocDto);

        bookingPromise.done(function (json) {
            top.location.replace(json.redirectUrl);
        }).fail(function (responseJSON) {
            var err = null;
            switch (responseJSON.errorCode) {
                case 5:
                    err = new DisplayableError("", "error-payment-method-credit");
                    break;
                case 6:
                    err = new DisplayableError("", "error-payment-method-nomatch");
                    break;
                default:
                    err = new DisplayableError("", "error-payment-method");
            }
            self.paymentMethodsModel.generalPaymentError(err);
        });
    };
}


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-90-ko-models.js
//<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>
//>>> start with file: minifiable/concatenatable/oc-main.js
//>>>>>>>>>>>>>>>>>>>>>>>>>

// the instanciatiation of the OmniCheckoutModel doesn't have to wait for the page to be loaded
var omniCheckoutModel = new OmniCheckoutModel();
ko.applyBindings(omniCheckoutModel);


// get a websocket to parent
var websocketPromise = getOpenWebsocketPromise();
// get the data for this order
var orderPromise = getOrderPromise();
// if the customer already commited his data and allowed cookies
var customerDataPromise = getCustomerCookiesPromise();


//order information and the websocket are the minimum requirements
orderPromise.done(function (orderData) {
    //the cookie data is optional
    customerDataPromise.done(function (cookieData) {
        omniCheckoutModel.init(orderData, cookieData, websocketPromise);
    }).fail(function () {
        omniCheckoutModel.init(orderData, null, websocketPromise);
    }).always(function () {
        $(function () {
            //one-time ui-changes after initial load-> close app overlay
            $('#checkout-overlay').addClass('inital-loaded');
        });
    });
}).fail(function (errMsg) {
    omniCheckoutModel.hasFatalError(true);
    console.log("couldn't retrieve order: "+errMsg);
});


//<<<<<<<<<<<<<<<<<<<<<<<<<
//<<< end with file: minifiable/concatenatable/oc-main.js
//<<<<<<<<<<<<<<<<<<<<<<<<<



event = MessageEvent {isTrusted: true, data: "{"eventType":"omnicheckout:set-booking-rule","checkOrderBeforeBooking":true}", origin: "http://resursbank.dev", lastEventId: "", source: Window…}
814
typeof event.data !== 'string') {

