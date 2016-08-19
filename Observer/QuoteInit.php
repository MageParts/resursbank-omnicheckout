<?php

namespace Resursbank\OmniCheckout\Observer;

/**
 * Executes after a quote has been initialized.
 */
class QuoteInit implements \Magento\Framework\Event\ObserverInterface
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
     * TODO: Test if we need to set default shipping method if there is only one availalbe shippign method.
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

//            $this->assignDefaultShippingMethod();

            // Initialize payment session.
            $this->apiModel->initPaymentSession();
        }
    }

//    /**
//     * Assign default shipping method (this only applies if there is only one shipping method available).
//     *
//     * @return $this
//     * @throws Exception
//     */
//    public function assignDefaultShippingMethod()
//    {
//        if ($this->apiHelper->getQuote()) {
//            $rates = $this->apiHelper->getShippingRatesCollection();
//
//            if (count($rates) === 1) {
//                foreach ($rates as $rate) {
//                    $this->apiHelper->getQuote()->getShippingAddress()->setShippingMethod("{$rate->getCarrier()}_{$rate->getCode()}");
//                    $this->apiHelper->getQuote()->collectTotals();
//                    $this->apiHelper->getQuoteRepository()->save($this->apiHelper->getQuote());
//                }
//            }
//        }
//
//        return $this;
//    }

}
