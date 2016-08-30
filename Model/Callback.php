<?php

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
class Callback implements CallbackInterface
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Callback
     */
    private $callbackHelper;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Callback $callbackHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Callback $callbackHelper
    )
    {
        $this->callbackHelper = $callbackHelper;
    }

    /**
     * Payment is unfrozen, which means it can be captured.
     *
     * @return boolean
     */
    public function unfreeze()
    {
        $this->_addOrderComment('Resursbank: payment was unfrozen.');

        return true;
    }

    /**
     * Payment has been booked by Resursbank. This means the payment has been unfrozen and is preparing to be
     * finalized.
     *
     * @return boolean
     */
    public function booked()
    {
        $this->_addOrderComment('Resursbank: payment was booked.');

        return true;
    }

    /**
     * Payment has been finalized by Resursbank. This means the client has been debited by Resursbank.
     *
     * @return boolean
     */
    public function finalization()
    {
        $this->_addOrderComment('Resursbank: payment was finalized.');

        return true;
    }

    /**
     * Payment passed automatic fraud screening from Resursbank.
     *
     * @return boolean
     */
    public function automaticFraudControl()
    {
        $this->_addOrderComment('Resursbank: payment passed automatic fraud screening.');

        return true;
    }

    /**
     * Payment has been fully annulled by Resursbank. This can for example occur if a fraud screening fails.
     *
     * @return boolean
     */
    public function annulment()
    {
        $this->callbackHelper->annulOrder($this->_getOrder());
        $this->_addOrderComment('Resursbank: payment was annulled.');

        return true;
    }

    /**
     * Payment has been updated at Resursbank.
     *
     * @return boolean
     */
    public function update()
    {
        $this->_addOrderComment('Resursbank: payment was updated.');

        return true;
    }

    /**
     * Retrieve request order.
     *
     * @return \Magento\Sales\Model\Order
     */
    protected function _getOrder()
    {
        return $this->callbackHelper->getOrderFromRequest();
    }

    /**
     * Add history comment to requested order.
     *
     * @param string $comment
     */
    protected function _addOrderComment($comment)
    {
        $this->callbackHelper->addOrderComment($this->_getOrder(), __($comment));
    }

}
