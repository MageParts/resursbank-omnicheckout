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
 * Create credit payment when a credit memo is created in Magento.
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
     * @var \Psr\Log\LoggerInterface
     */
    private $log;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
     * @param \Magento\Framework\Message\ManagerInterface $messageManager
     * @param \Psr\Log\LoggerInterface $log
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper,
        \Magento\Framework\Message\ManagerInterface $messageManager,
        \Psr\Log\LoggerInterface $log
    ) {
        $this->ecomHelper = $ecomHelper;
        $this->messageManager = $messageManager;
        $this->log = $log;
    }

    /**
     * When a credit memo is created in Magento we will create a credit payment matching its content.
     *
     * @param \Magento\Sales\Model\Order\Creditmemo $subject
     * @param \Magento\Sales\Model\Order\Interceptor $result
     * @return \Magento\Sales\Model\Order\Interceptor
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Sales\Model\Order\Creditmemo $subject, $result)
    {
        try {
            /** @var \Magento\Sales\Model\Order $order */
            $order = $subject->getOrder();

            if ($order) {
                /** @var \ResursBank $connection */
                $connection = $this->ecomHelper->getConnection();

                // Payment token (identifier).
                $token = $subject->getOrder()->getData('resursbank_token');

                /** @var \resurs_payment $payment */
                $payment = $connection->getPayment($token);

                if ($connection->creditPayment($token, $this->getCreditMemoItems($subject), array(), false, true)) {
                    $this->messageManager->addSuccessMessage(__('Resursbank payment %1 has been credited.', $token));
                } else {
                    throw new \Exception('Something went wrong while communicating with the RBECom API.');
                }
            }
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(__('Failed to credit Resursbank payment %1. Please use the payment administration to manually credit the payment.', $token));
            $this->log->debug($e->getMessage());
        }

        return $result;
    }

    /**
     * Retrieve creditmemo items as an array formatted to function with outgoing Resursbank calls.
     *
     * @param \Magento\Sales\Model\Order\Creditmemo $creditmemo
     * @return array
     */
    private function getCreditMemoItems(\Magento\Sales\Model\Order\Creditmemo $creditmemo)
    {
        $result = array();

        if (count($creditmemo->getAllItems())) {
            foreach ($creditmemo->getAllItems() as $item) {
                $result[] = array(
                    'artNo' => $item->getSku(),
                    'quantity' => $item->getQty()
                );
            }

            if ((float) $creditmemo->getShippingAmount() > 0) {
                $result[] = array(
                    'artNo' => 'shipping',
                    'quantity' => 1
                );
            }
        }

        return $result;
    }

}
