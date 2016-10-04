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

namespace Resursbank\OmniCheckout\Plugin\Order;

/**
 * Update payment session whenever its order counterpart gets updated.
 *
 * Class UpdatePayment
 * @package Resursbank\OmniCheckout\Plugin\Order
 */
class UpdatePayment
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Ecom
     */
    private $ecomHelper;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
    ) {
        $this->ecomHelper = $ecomHelper;
    }

    /**
     * Before we save a revised order we need to append the original payment id to it.
     *
     * @param \Magento\Sales\Model\AdminOrder\Create $subject
     * @param \Magento\Sales\Model\Order\Interceptor $result
     * @return \Magento\Sales\Model\Order\Interceptor
     * @throws \Exception
     */
    public function afterCreateOrder(\Magento\Sales\Model\AdminOrder\Create $subject, $result)
    {
        $token = $subject->getSession()->getOrder() ? (string) $subject->getSession()->getOrder()->getData('resursbank_token') : '';

        if (!empty($token)) {
            $result->setData('resursbank_token', $token)->save();

            /** @var \ResursBank $connection */
            $connection = $this->ecomHelper->getConnection();

            // additionalDebitOfPayment

            $connection->updatePaymentdata();

            $payment = $connection->getPayment($token);
            $a = 'asd';
        }

        return $result;
    }

}
