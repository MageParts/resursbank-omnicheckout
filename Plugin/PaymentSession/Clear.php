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
