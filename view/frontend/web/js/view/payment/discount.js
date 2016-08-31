/**
 * Copyright 2016 Resurs Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        'Magento_Catalog/js/price-utils',
        'Magento_Checkout/js/action/get-payment-information'
    ],
    function (
        $,
        ko,
        Component,
        quote,
        setCouponCodeAction,
        cancelCouponAction,
        priceUtils,
        getPaymentInformationAction
    ) {
        'use strict';
        var totals = quote.getTotals();
        var couponCode = ko.observable(null);
        var discountAmount = ko.observable(null);
        if (totals()) {
            couponCode(totals()['coupon_code']);
            discountAmount(priceUtils.formatPrice(totals()['discount_amount'], quote.getPriceFormat()));
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

                    $.when(setCouponCodeAction(couponCode(), isApplied, isLoading)).done(function () {
                        // Get the discount amount element.
                        var discountEl = $('#omnicheckout-applied-discount-amount');

                        if (discountEl.length > 0) {
                            // Temporarily hide the element (initially it will display a value of 0.00 and we want to avoid that).
                            discountEl.hide();

                            // Refresh quote totals.
                            var deferred = $.Deferred();
                            getPaymentInformationAction(deferred);

                            $.when(deferred).done(function () {
                                totals = quote.getTotals();

                                // Set the new amount and display the element again.
                                discountEl.text(priceUtils.formatPrice(totals()['discount_amount'], quote.getPriceFormat()));
                                discountEl.show();
                            });
                        }
                    });
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
