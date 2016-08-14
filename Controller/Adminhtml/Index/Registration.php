<?php

namespace Resursbank\OmniCheckout\Controller\Adminhtml\Index;

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
     * Index action
     * @todo Redirect back.
     */
    public function execute()
    {
        $this->apiModel->registerCallbacks();
    }

}
