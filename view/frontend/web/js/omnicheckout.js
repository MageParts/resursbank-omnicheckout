/**
 * Created by Bossehasse on 16/08/16.
 */
define([
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q',
    'Resursbank_OmniCheckout/js/cart/item/delete',
    'Resursbank_OmniCheckout/js/cart/item/update'
], function ($, mediator, ajaxQ, itemDelete, itemUpdate) {
    var $this = {};
    var initialized = false;
    var deleteButtons = [];

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

    var initiateQuantityInputs = function () {
        $.each($this.getQuantityInputs(), function (i, input) {
            console.log(input, $this.getIdFromQuantityInput(input));
            // deleteButtons.push(itemDelete({
            //     element: button,
            //     baseUrl: $this.baseUrl,
            //     formKey: $this.formKey,
            //     id: $this.getIdFromDeleteButton(button)
            // }));
        });
    };

    $this.baseUrl = '';
    $this.formKey = '';
    $this.iframeUrl = '';

    $this.init = function (config) {
        var i;

        if (!initialized) {
            for (i in config) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = config[i];
                }
            }

            ajaxQ.createChain('omnicheckout');

            initiateDeleteButtons();
            initiateQuantityInputs();

            initialized = true;
        }
    };

    $this.testRequest = function () {
        console.log('omnicheckout.restRequest()');
        ajaxQ.createChain('omnicheckout')
            .queue({
                url: 'http://resursbank.dev/index.php/rest/default/V1/omnicheckout/cart/item/10/set_qty/4',
                method: 'POST',
                chain: 'omnicheckout',

                success: function (response, status, jqXhr) {
                    console.log('success:', JSON.parse(response));
                    console.log('status:', status);
                    console.log('jqXhr:', jqXhr);
                },

                error: function (response) {
                    console.log('ERROR!:', response);
                }
            })
            .run('omnicheckout');
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


