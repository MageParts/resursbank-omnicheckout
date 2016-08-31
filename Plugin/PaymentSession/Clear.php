<?php

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
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiHelper = $apiHelper;
    }

    /**
     * Clear payment session after order placement.
     *
     * @param \Magento\Sales\Model\Order $subject
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Sales\Model\Order $subject)
    {
        if ($subject->isObjectNew()) {
            $this->apiHelper->clearPaymentSession();
        }
    }

}
