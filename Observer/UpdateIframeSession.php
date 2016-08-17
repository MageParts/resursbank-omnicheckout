<?php

namespace Resursbank\OmniCheckout\Observer;

/**
 * Executes when quote is saved.
 */
class UpdateIframeSession implements \Magento\Framework\Event\ObserverInterface
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
        if ($this->apiModel->paymentSessionInitialized()) {
            if ($this->apiHelper->cartIsEmpty()) {
                $this->apiModel->deletePaymentSession();
            } else {
                $this->apiModel->updatePaymentSession();
            }
        }
    }

}
