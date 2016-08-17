/**
 * Created by Bossehasse on 16/08/16.
 */
define([
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q',
    'Resursbank_OmniCheckout/js/cart/cart',
    'Resursbank_OmniCheckout/js/cart/item/delete'
], function ($, mediator, ajaxQ, cart, itemDelete) {
    var $this = {};

    console.log('ajaxQ:', ajaxQ);
    console.log('mediator:', mediator);

    return {
        testRequest: function () {
            ajaxQ.createChain('omnicheckout')
                .queue({
                    url: 'http://resursbank.dev/index.php/rest/default/V1/omnicheckout/cart/item/10/set_qty/2',
                    chain: 'omnicheckout',
                    data: {
                        qty: 2
                    }
                })
                .run('omnicheckout');
        }
    };
});


