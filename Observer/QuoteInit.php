<?php

namespace Resursbank\OmniCheckout\Observer;

use Magento\Framework\Event\ObserverInterface;

/**
 * Executed after a quote has been initialized.
 */
class QuoteInit implements ObserverInterface
{

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     */
    public function __construct(
        \Resursbank\OmniCheckout\Model\Api $apiModel
    ) {
        $this->apiModel = $apiModel;
    }

    /**
     * Address before save event handler
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // Initialize payment session.
        if (!$this->apiModel->paymentSessionInitialized()) {
            $this->apiModel->initPaymentSession();
        }
    }

}
