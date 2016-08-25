/**
 * Created by Bossehasse on 16/08/16.
 */
define([
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q',
    'Resursbank_OmniCheckout/js/cart/item/delete',
    'Resursbank_OmniCheckout/js/cart/item/quantity',
    'Resursbank_OmniCheckout/js/shipping-methods',
    'Resursbank_OmniCheckout/js/user-information',
    'Resursbank_OmniCheckout/js/view/shipping-service'
], function ($, mediator, ajaxQ, itemDelete, itemQuantity, shippingMethod, userInformation, shippingService) {
    var $this = {};
    var initialized = false;
    var deleteButtons = [];
    var quantityInputs = [];

    /**
     * The Omnicheckout iframe element.
     *
     * @type {Element}
     */
    var iframe = null;

    /**
     * The URL of the Omnicheckout iframe.
     *
     * @type {string}
     */
    var iframeUrl = null;

    /**
     * Whether or not finalizeIframeSetup() has been called.
     *
     * @type {boolean}
     */
    var finalizedIframe = false;

    /**
     * Initiates the delete buttons for all items.
     */
    var initiateDeleteButtons = function () {
        $.each($this.getDeleteButtons(), function (i, button) {
            deleteButtons.push(itemDelete({
                element: button,
                baseUrl: $this.baseUrl,
                formKey: $this.formKey,
                id: $this.getIdFromDeleteButton(button)
            }));
        });
    };

    /**
     * Initiates the quantity inputs for all items.
     */
    var initiateQuantityInputs = function () {
        $.each($this.getQuantityInputs(), function (i, input) {
            quantityInputs.push(itemQuantity({
                element: input,
                baseUrl: $this.baseUrl,
                formKey: $this.formKey,
                id: $this.getIdFromQuantityInput(input)
            }));
        });
    };

    var initiateShippingMethods = function () {
        shippingMethod.init({
            element: $('#checkout-shipping-method-load')[0]
        });

        mediator.ignore('omnicheckout:init-shipping-methods', {
            identifier: $this,
            callback: initiateShippingMethods
        });
    };

    /**
     * Receives and delegates messages from the Omnicheckout iframe when it uses window.postMessage(). This function
     * expects event.data to be a string which is an JSON encoded object. The string is then parsed with JSON and will
     * then check for an data.eventType property, which is also a string and tells the delegator how to handle the
     * message. If this data.eventType does not exists, the message will be ignored.
     *
     * NOTE: The event argument is an object with information about the message, where it came from and such. The data
     * that was passed along with the message will be under a event.data property.
     *
     * @param event
     */
    var postMessageDelegator = function (event) {
        var data;
        var origin = event.origin || event.originalEvent.origin;

        // console.log('message event:', event);

        if (origin !== iframeUrl ||
            typeof event.data !== 'string' ||
            event.data === '[iFrameResizerChild]Ready') {
            return;
        }

        data = JSON.parse(event.data);

        console.log('message data:', data);

        if (data.hasOwnProperty('eventType') && typeof data.eventType === 'string') {
            switch (data.eventType) {
                case 'omnicheckout:user-info-change': mediator.broadcast('user-info:change', data); break;
                case 'omnicheckout:payment-method-change': mediator.broadcast('payment-method:change', data); break;
                case 'omnicheckout:booking-order': mediator.broadcast('book-order', data); break;
                case 'omnicheckout:loaded': finalizeIframeSetup(); break;
                default:;
            }
        }
    };

    /**
     * Posts a message to the iframe window with postMessage(). The data argument will be sent to the iframe window and
     * and it should have an eventType property set. The eventType property is a string and is used by the receiver to
     * determine how the message and its data should be handled.
     *
     * @param {Object} data - Information to be passed to the iframe.
     * @param {String} data.eventType - The event that the receiving end should handle.
     */
    var postMessage = function (data) {
        var iframeWindow;

        // console.log('posting:', data);

        if (iframe && typeof iframeUrl === 'string' && iframeUrl !== '') {
            iframeWindow = iframe.contentWindow || iframe.contentDocument;
            iframeWindow.postMessage(JSON.stringify(data), iframeUrl);
        }
    };

    /**
     * When the iframe is done loading, this method will do some final work in order to make the checkout page and
     * the iframe communicate and work together as intended.
     *
     * NOTE: Should only be called once when the iframe has fully loaded. That is, when it has done all of its AJAX
     * requests and other preparations.
     */
    var finalizeIframeSetup = function () {
        if (!finalizedIframe) {
            console.log('finalizeIframeSetup()');
            // Post the booking rule to Omnicheckout. This post basically says that when a user presses the button
            // to finalize the order, check with the server if the order is ready to be booked.
            postMessage({
                eventType: 'omnicheckout:set-booking-rule',
                checkOrderBeforeBooking: true
            });

            finalizedIframe = true;
        }
    };

    $this.baseUrl = '';
    $this.formKey = '';

    /**
     * Initializes OmniCheckout.
     *
     * @param config
     * @returns {Object} $this.
     */
    $this.init = function (config) {
        var i, temp;

        if (!initialized) {
            for (i in config) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = config[i];
                }
                else if (i === 'iframeUrl') {
                    iframeUrl = config[i];
                }
                else if (i === 'iframe') {
                    iframe = $(config[i])[0];
                }
            }

            mediator.listen({
                event: 'omnicheckout:init-shipping-methods',
                identifier: $this,
                callback: initiateShippingMethods
            });

            ajaxQ.createChain('omnicheckout');

            window.addEventListener('beforeunload', function (event) {
                $.each(deleteButtons, function (i, button) {
                    button.destroy();
                });

                $.each(quantityInputs, function (i, input) {
                    input.destroy();
                });
            }, false);

            // Add message listener.
            window.addEventListener('message', postMessageDelegator, false);

            $this.placeIframe();

            shippingService.init();

            userInformation.init({
                baseUrl: $this.baseUrl,
                formKey: $this.formKey
            });

            initiateDeleteButtons();
            initiateQuantityInputs();


            initialized = true;
        }

        return $this;
    };

    /**
     * Place the Iframe element after the page-cache has finished loading, otherwise we will receive errors.
     *
     * @returns {Object} $this.
     */
    $this.placeIframe = function() {
        var run = setInterval(function() {
            if ($('#block-discount-heading').length > 0) {
                $('#omnicheckout-iframe-container').prepend(iframe);

                clearInterval(run);
            }
        }, 1000);

        return $this;
    };

    /**
     * Returns an empty array or an array of the delete buttons for every product in the cart.
     *
     * @returns {Array}
     */
    $this.getDeleteButtons = function () {
        var buttons = $('#shopping-cart-table .item-actions .action.action-delete');

        return buttons.length ? $.makeArray(buttons) : [];
    };

    /**
     * Returns an empty array or an array of the quantity inputs for every product in the cart.
     *
     * @returns {Array}
     */
    $this.getQuantityInputs = function () {
        var inputs = $('#shopping-cart-table input[data-role="cart-item-qty"]');

        return inputs.length ? $.makeArray(inputs) : [];
    };

    /**
     * Returns the id from a remove button of a product.
     *
     * @param {Element} button
     * @returns {String}
     */
    $this.getIdFromDeleteButton = function (button) {
        return JSON.parse(button.getAttribute('data-post')).data.id;
    };

    /**
     * Returns the id from a quantity input of a product.
     *
     * @param {Element} input
     * @returns {String}
     */
    $this.getIdFromQuantityInput = function (input) {
        return parseInt(input.name.match(/cart\[(\d+)\]/)[1], 10);
    };

    return $this;
});


