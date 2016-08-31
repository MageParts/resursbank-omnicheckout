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
 * Clear payment session.
 *
 * Class Clear
 * @package Resursbank\OmniCheckout\Plugin\PaymentSession
 */
class Clear
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Resursbank\OmniCheckout\Model\Api $apiModel
    ) {
        $this->apiHelper = $apiHelper;
        $this->apiModel = $apiModel;
    }

    /**
     * Clear payment session after order placement.
     *
     * @param \Magento\Sales\Model\Order $subject
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Sales\Model\Order $subject)
    {
        if ($this->apiModel->paymentSessionInitialized()) {
            $this->apiHelper->clearPaymentSession();
        }
    }

}
