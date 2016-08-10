<?php

namespace Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback;

/**
 * URL exceptions widget renderer.
 */
class Listing extends \Magento\Config\Block\System\Config\Form\Field
{

//    /**
//     * @var \Resursbank\OmniCheckout\Helper\Callback
//     */
//    private $callback;
//
//    /**
//     * @var string
//     */

    /**
     * Set template to itself
     *
     * @return \Magento\Customer\Block\Adminhtml\System\Config\Validatevat
     */
    protected function _prepareLayout()
    {
        parent::_prepareLayout();
        if (!$this->getTemplate()) {
            $this->setTemplate('system/config/callback/listing.phtml');
        }
        return $this;
    }

    /**
     * Unset some non-related element parameters
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

//
//    /**
//     * @param \Magento\Backend\Block\Template\Context $context
//     * @param \Resursbank\OmniCheckout\Helper\Callback $callback
//     * @param array $data
//     * @internal param array $data
//     */
//    public function __construct(
//        \Magento\Backend\Block\Template\Context $context,
//        \Resursbank\OmniCheckout\Helper\Callback $callback,
//        array $data = []
//    ) {
//        parent::__construct($context, $data);
//
//        $this->callback = $callback;
//    }
//
//    /**
//     * @return array
//     */
//    public function getCallbacks()
//    {
//        return $this->callback->getCallbacks();
//    }

}
