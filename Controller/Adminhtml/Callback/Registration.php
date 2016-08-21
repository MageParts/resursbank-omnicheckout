<?php

namespace Resursbank\OmniCheckout\Controller\Adminhtml\Callback;

class Registration extends \Magento\Backend\App\Action
{

    /**
     * Authorization level of a basic admin session
     *
     * @see _isAllowed()
     */
    const ADMIN_RESOURCE = 'Resursbank_OmniCheckout::index';

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @param \Magento\Backend\App\Action\Context $context
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     */
    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Resursbank\OmniCheckout\Model\Api $apiModel
    ) {
        $this->apiHelper = $apiHelper;
        $this->apiModel = $apiModel;

        parent::__construct($context);
    }

    /**
     * Register callback URLs.
     *
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        // Register callback URLs.
        $this->apiModel->registerCallbacks();

        // Redirect back to the config section.
        $this->_redirect($this->_redirect->getRefererUrl());
    }

}
