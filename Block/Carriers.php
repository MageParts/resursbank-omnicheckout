<?php

namespace Resursbank\OmniCheckout\Block;

class Carriers extends \Magento\Framework\View\Element\Template
{

    /**
     * @var \Magento\Shipping\Model\Shipping
     */
    private $shippingManager;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @var \Magento\Checkout\Helper\Data
     */
    private $checkoutHelper;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Shipping\Model\Shipping $shippingManager
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Shipping\Model\Shipping $shippingManager,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Checkout\Helper\Data $checkoutHelper,
        array $data = []
    ) {
        $this->shippingManager = $shippingManager;
        $this->apiHelper = $apiHelper;
        $this->checkoutHelper = $checkoutHelper;

        parent::__construct($context, $data);
    }

    /**
     * Return collection of available shipping methods based on quote information.
     *
     * @return \Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection
     */
    public function getRates()
    {
        return $this->apiHelper->getShippingRatesCollection();
    }

    /**
     * @param float $price
     * @return string
     */
    public function formatPrice($price)
    {
        return $this->checkoutHelper->formatPrice((float) $price);
    }

}
