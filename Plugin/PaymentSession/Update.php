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
     * TODO: During order placement the cart becomes empty, thus deletePaymentSession is triggered and yields an error.
     * TODO: See if there is any way to utilize deletePaymentSession except when order placement occurs, and if it
     * TODO: causes any problems if is doesn't occur during order placement. Check past commits for an implementation
     * TODO: example of deletePaymentSession (should occur if cart is empty, so cartIsEmpty() {delete} else {update}).
     *
     * @param \Magento\Quote\Model\Quote $subject
     * @param \Magento\Quote\Model\Quote $result
     * @return \Magento\Quote\Model\Quote
     * @throws \Exception
     */
    public function afterAfterSave(\Magento\Quote\Model\Quote $subject, $result)
    {
        if ($this->apiModel->paymentSessionInitialized()) {
            if (!$this->apiHelper->cartIsEmpty()) {
                $this->apiModel->updatePaymentSession();
            }
        }

        return $result;
    }

}
