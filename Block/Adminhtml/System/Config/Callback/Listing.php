<?php

namespace Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback;

/**
 * URL exceptions widget renderer.
 */
class Listing extends \Magento\Backend\Block\Template implements \Magento\Framework\Data\Form\Element\Renderer\RendererInterface
{

//    /**
//     * @var \Resursbank\OmniCheckout\Helper\Callback
//     */
//    private $callback;
//
//    /**
//     * @var string
//     */
    protected $_template = 'Resursbank_OmniCheckout::system/config/callback/listing.phtml';
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

    public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        return $this->toHtml();
    }
}
