<?php

namespace Resursbank\OmniCheckout\Plugin\Block\Adminhtml\Sales\Order\View;

/**
 * Prepends Omnicheckout information (invoice information from Resursbank) to the information block on the order view.
 *
 * Class AppendResursbankInfo
 * @package Resursbank\OmniCheckout\Plugin\Block\Adminhtml\Sales\Order\View
 */
class AppendPaymentInfo
{

    /**
     * @var \Magento\Framework\ObjectManagerInterface
     */
    private $objectManager;

    /**
     * @param \Magento\Framework\ObjectManagerInterface $objectManager
     */
    public function __construct(
        \Magento\Framework\ObjectManagerInterface $objectManager
    ) {
        $this->objectManager = $objectManager;
    }

    /**
     * Prepend OmniCheckout information to order information block.
     *
     * @param \Magento\Sales\Block\Adminhtml\Order\View\Info $subject
     * @param $result
     * @return string
     */
    public function afterToHtml(\Magento\Sales\Block\Adminhtml\Order\View\Info $subject, $result)
    {
        /** @var \Resursbank\OmniCheckout\Block\Adminhtml\Sales\Order\View\Info\OmniCheckout $block */
        $block = $this->objectManager->create('\Resursbank\OmniCheckout\Block\Adminhtml\Sales\Order\View\Info\OmniCheckout');

        return $block ? ($block->toHtml() . $result) : $result;
    }

}
