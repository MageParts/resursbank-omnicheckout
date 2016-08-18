<?php

namespace Resursbank\OmniCheckout\Block;

class DiscountInfo extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @var \Magento\Checkout\Helper\Data
     */
    private $checkoutHelper;

    /**
     * Iframe constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Checkout\Helper\Data $checkoutHelper,
        array $data = []
    ) {
        $this->apiHelper = $apiHelper;
        $this->checkoutHelper = $checkoutHelper;

        parent::__construct($context, $data);
    }

    /**
     * Retrieve applied coupon code.
     *
     * @return string
     */
    public function getCode()
    {
        return (string) $this->apiHelper->getQuote()->getCouponCode();
    }

    /**
     * Retreive currency formatted discount amount.
     *
     * @return string
     */
    public function getDiscountAmount()
    {
        $amount = (float) ($this->apiHelper->getQuote()->getSubtotal() - $this->apiHelper->getQuote()->getSubtotalWithDiscount());

        return $this->checkoutHelper->formatPrice(-$amount);
    }

    /**
     * Check if coupon code has been applied.
     *
     * @return bool
     */
    public function couponIsApplied()
    {
        return $this->getCode() !== '';
    }

}
