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
 * Credit payment when order is canceled.
 *
 * Class CancelPayment
 * @package Resursbank\OmniCheckout\Plugin\Order
 */
class CreditPayment
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Ecom
     */
    private $ecomHelper;

    /**
     * @var \Magento\Framework\Message\ManagerInterface
     */
    private $messageManager;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
     * @param \Magento\Framework\Message\ManagerInterface $messageManager
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper,
        \Magento\Framework\Message\ManagerInterface $messageManager
    ) {
        $this->ecomHelper = $ecomHelper;
        $this->messageManager = $messageManager;
    }

    /**
     * Before we save a revised order we need to append the original payment id to it.
     *
     * @param \Magento\Sales\Model\Order $subject
     * @param \Magento\Sales\Model\Order\Interceptor $result
     * @return \Magento\Sales\Model\Order\Interceptor
     * @throws \Exception
     */
    public function afterCancel(\Magento\Sales\Model\Order $subject, $result)
    {
        /** @var \ResursBank $connection */
        $connection = $this->ecomHelper->getConnection();

        // Payment token (identifier).
        $token = $subject->getData('resursbank_token');

        $payment = $connection->getPayment($token);

        if ($connection->creditPayment($token)) {
            $this->messageManager->addSuccessMessage(__('Resursbank payment %1 has been canceled.', $token));
        } else {
            $this->messageManager->addErrorMessage(__('Failed to cancel Resursbank payment %1. Please use the payment administration to manually cancel the payment.', $token));
        }

        return $result;
    }

}
