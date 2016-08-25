<?php

namespace Resursbank\OmniCheckout\Plugin\PaymentSession;

/**
 * Initialize payment session.
 *
 * Class Init
 * @package Resursbank\OmniCheckout\Plugin\PaymentSession
 */
class Init
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
     * Initialize payment session before the checkout page loads (predispatch of checkout_index_index).
     *
     * @param \Magento\Checkout\Controller\Index\Index $subject
     * @return  null
     * @throws \Exception
     */
    public function beforeExecute(\Magento\Checkout\Controller\Index\Index $subject)
    {
        if (!$this->apiModel->paymentSessionInitialized()) {
            $this->apiModel->initPaymentSession();
        }
    }

}
