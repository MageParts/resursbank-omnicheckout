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

namespace Resursbank\OmniCheckout\Model;

/**
 * TODO: The API methods should perhaps return something other than a simple boolean.
 *
 * TODO: The API methods should be protected by HTTP authentication, validating against the username/password settings
 * TODO: available in the callback configuration section of the module.
 *
 * Class Callback
 * @package Resursbank\OmniCheckout\Model
 */
class Callback implements \Resursbank\OmniCheckout\Api\CallbackInterface
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Callback
     */
    private $callbackHelper;
    /**
     * @var \Resursbank\OmniCheckout\Helper\Debug
     */
    private $debug;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Callback $callbackHelper
     * @param \Resursbank\OmniCheckout\Helper\Debug $debug
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Callback $callbackHelper,
        \Resursbank\OmniCheckout\Helper\Debug $debug
    ) {
        $this->callbackHelper = $callbackHelper;
        $this->debug = $debug;
    }

    /**
     * Payment is unfrozen, which means it can be captured.
     *
     * @param string $paymentId
     * @return bool
     */
    public function unfreeze($paymentId)
    {
        $this->_addLogEntry($paymentId, 'unfreeze')
            ->_addOrderComment($paymentId, 'Resursbank: payment was unfrozen.');

        return true;
    }

    /**
     * Payment has been booked by Resursbank. This means the payment has been unfrozen and is preparing to be
     * finalized.
     *
     * @param string $paymentId
     * @return bool
     */
    public function booked($paymentId)
    {
        $this->_addLogEntry($paymentId, 'booked')
            ->_addOrderComment($paymentId, 'Resursbank: payment was booked.');

        return true;
    }

    /**
     * Payment has been finalized by Resursbank. This means the client has been debited by Resursbank.
     *
     * @param string $paymentId
     * @return bool
     */
    public function finalization($paymentId)
    {
        $this->_addLogEntry($paymentId, 'finalization')
            ->_addOrderComment($paymentId, 'Resursbank: payment was finalized.');

        return true;
    }

    /**
     * Payment passed automatic fraud screening from Resursbank.
     *
     * @param string $paymentId
     * @return bool
     */
    public function automaticFraudControl($paymentId)
    {
        $this->_addLogEntry($paymentId, 'automatic fraud control.')
            ->_addOrderComment($paymentId, 'Resursbank: payment passed automatic fraud screening.');

        return true;
    }

    /**
     * Payment has been fully annulled by Resursbank. This can for example occur if a fraud screening fails.
     *
     * @return boolean
     */
    public function annulment($paymentId)
    {
        $this->_addLogEntry($paymentId, 'annulment');
        $this->callbackHelper->annulOrder($this->_getOrder($paymentId));
        $this->_addOrderComment($paymentId, 'Resursbank: payment was annulled.');

        return true;
    }

    /**
     * Payment has been updated at Resursbank.
     *
     * @return boolean
     */
    public function update($paymentId)
    {
        $this->_addLogEntry($paymentId, 'update')
            ->_addOrderComment($paymentId, 'Resursbank: payment was updated.');

        return true;
    }

    /**
     * Retrieve request order.
     *
     * @param string $paymentId
     * @return \Magento\Sales\Model\Order
     * @throws \Exception
     */
    protected function _getOrder($paymentId)
    {
        return $this->callbackHelper->getOrderFromRequest($paymentId);
    }

    /**
     * Add history comment to requested order.
     *
     * @param string $paymentId
     * @param string $comment
     * @return $this
     */
    protected function _addOrderComment($paymentId, $comment)
    {
        $this->callbackHelper->addOrderComment($this->_getOrder($paymentId), __($comment));

        return $this;
    }

    /**
     * Log that we received a callback.
     *
     * @param string $paymentId
     * @param $text
     * @return $this
     */
    public function _addLogEntry($paymentId, $text)
    {
        /** @var \Magento\Sales\Model\Order $order */
        $order = $this->_getOrder($paymentId);
        $orderId = $order ? $order->getId() : 'unknown';

        $this->debug->info("Received callback {$text} for order {$orderId}.");

        return $this;
    }

}
