<?php

namespace Resursbank\OmniCheckout\Plugin\Order;

class AppendToken
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * AppendToken constructor.
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiHelper = $apiHelper;
    }

    /**
     * Append Resursbank token to order before saving it.
     *
     * @param \Magento\Sales\Model\Order $subject
     * @throws \Exception
     */
    public function beforeBeforeSave(\Magento\Sales\Model\Order $subject)
    {
        if (!$subject->getData('resursbank_token') && $this->apiHelper->getQuote() && $this->apiHelper->getQuote()->getId()) {
            $subject->setData('resursbank_token', $this->apiHelper->getQuoteToken($this->apiHelper->getQuote()));
        }
    }

}
