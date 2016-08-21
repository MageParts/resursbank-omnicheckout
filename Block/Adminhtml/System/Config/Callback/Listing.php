<?php

namespace Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback;

/**
 * Render all registered callbacks.
 *
 * Class Listing
 * @package Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback
 */
class Listing extends \Magento\Config\Block\System\Config\Form\Field
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Callback
     */
    private $callback;

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Resursbank\OmniCheckout\Helper\Callback $callback
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Resursbank\OmniCheckout\Helper\Callback $callback,
        array $data = []
    ) {
        $this->callback = $callback;

        $this->setTemplate('system/config/callback/listing.phtml');

        parent::__construct($context, $data);
    }

    /**
     * Retrieve array of registered callbacks.
     *
     * @return array
     */
    public function getCallbacks()
    {
        return $this->callback->getCallbacks();
    }

    /**
     * Unset some non-related element parameters.
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        $element->unsScope()->unsCanUseWebsiteValue()->unsCanUseDefaultValue();

        return parent::render($element);
    }

    /**
     * Get the button and scripts contents
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        return $this->_toHtml();
    }

}
