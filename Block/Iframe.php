<?php

namespace Resursbank\OmniCheckout\Block;

class Iframe extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * Iframe constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        array $data = []
    ) {
        $this->apiModel = $apiModel;
        
        parent::__construct($context, $data);
    }

    /**
     * @return \Resursbank\OmniCheckout\Model\Api
     */
    public function getApiModel()
    {
        return $this->apiModel;
    }

}
