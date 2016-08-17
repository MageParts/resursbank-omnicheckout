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
     * Address before save event handler
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // Initialize payment session.
        if (!$this->apiModel->paymentSessionInitialized()) {
            // Assign default address information to quote.
            $this->apiHelper->quoteAssignDefaultAddress();

            // Initialize payment session.
            $this->apiModel->initPaymentSession();
        }
    }

}
