<?php

namespace Resursbank\OmniCheckout\Plugin\PaymentSession;

/**
 * Update existing payment session.
 *
 * Class Update
 * @package Resursbank\OmniCheckout\Plugin\PaymentSession
 */
class Update
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
     * Update Resursbank payment session after the quote has been saved.
     *
     * TODO: Check if we can use deletePaymentSession and avoid problems where quote cannot be placed.
     *
     * @param \Magento\Quote\Model\Quote $subject
     * @param \Magento\Quote\Model\Quote $result
     * @return \Magento\Quote\Model\Quote
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Quote\Model\Quote $subject, $result)
    {
        if ($this->apiModel->paymentSessionInitialized()) {
            if ($this->apiHelper->cartIsEmpty()) {
//                $this->apiModel->deletePaymentSession();
            } else {
                $this->apiModel->updatePaymentSession();
            }
        }

        return $result;
    }

}
