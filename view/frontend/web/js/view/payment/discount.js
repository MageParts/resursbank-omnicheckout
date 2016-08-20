/**
 * TODO: find a way to avoid this file, it only injects discountAmount.
 *
 * TODO: what happens if you apply a discount code, and then enter payment/shipping information relevant for that code?
 * TODO: for example, if a discount code is dependant on a shipping method being selected, will the code first be
 * TODO: applied after the proper shipping method has been selected, or will it not be applied at all without the user
 * TODO: manually re-applying it? Test this.
 *
 * Copied from vendor/magento/module-sales-rule/view/frontend/web/js/view/payment/discount.js
 */
define(
    [
        'jquery',
        'ko',
        'uiComponent',
        'Magento_Checkout/js/model/quote',
        'Magento_SalesRule/js/action/set-coupon-code',
        'Magento_SalesRule/js/action/cancel-coupon',
        'Magento_Catalog/js/price-utils'
    ],
    function ($, ko, Component, quote, setCouponCodeAction, cancelCouponAction, utils) {
        'use strict';
        var totals = quote.getTotals();
        var couponCode = ko.observable(null);
        var discountAmount = ko.observable(null);
        if (totals()) {
            couponCode(totals()['coupon_code']);
            discountAmount(utils.formatPrice(totals()['discount_amount'], quote.getPriceFormat()));
        }
        var isApplied = ko.observable(couponCode() != null);
        var isLoading = ko.observable(false);
        return Component.extend({
            defaults: {
                template: 'Resursbank_OmniCheckout/payment/discount'
            },
            couponCode: couponCode,
            discountAmount: discountAmount,
            /**
             * Applied flag
             */
            isApplied: isApplied,
            isLoading: isLoading,
            /**
             * Coupon code application procedure
             */
            apply: function() {
                if (this.validate()) {
                    isLoading(true);
                    setCouponCodeAction(couponCode(), isApplied, isLoading);
                }
            },
            /**
             * Cancel using coupon
             */
            cancel: function() {
                if (this.validate()) {
                    isLoading(true);
                    couponCode('');
                    cancelCouponAction(isApplied, isLoading);
                }
            },
            /**
             * Coupon form validation
             *
             * @returns {boolean}
             */
            validate: function() {
                var form = '#discount-form';
                return $(form).validation() && $(form).validation('isValid');
            }
        });
    }
);
