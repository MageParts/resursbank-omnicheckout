<?php
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

namespace Resursbank\OmniCheckout\Plugin\PaymentSession;

/**
 * Update existing payment session.
 *
 * Class Update
 * @package Resursbank\OmniCheckout\Plugin\PaymentSession
 */
class Update
{

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiModel = $apiModel;
        $this->apiHelper = $apiHelper;
    }

    /**
     * Update Resursbank payment session after the quote has been saved.
     *
     * TODO: During order placement the cart becomes empty, thus deletePaymentSession is triggered and yields an error.
     * TODO: See if there is any way to utilize deletePaymentSession except when order placement occurs, and if it
     * TODO: causes any problems if is doesn't occur during order placement. Check past commits for an implementation
     * TODO: example of deletePaymentSession (should occur if cart is empty, so cartIsEmpty() {delete} else {update}).
     *
     * @param \Magento\Quote\Model\Quote $subject
     * @param \Magento\Quote\Model\Quote $result
     * @return \Magento\Quote\Model\Quote
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Quote\Model\Quote $subject, $result)
    {
        if ($this->apiModel->paymentSessionInitialized()) {
            if ($subject->getItemsCount() > 0) {
                $this->apiModel->updatePaymentSession();
            } else {
                $this->apiHelper->clearPaymentSession();
            }
        }

        return $result;
    }

}
