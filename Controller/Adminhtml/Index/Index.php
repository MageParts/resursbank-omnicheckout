<?php

namespace Resursbank\OmniCheckout\Controller\Adminhtml\Index;

use Magento\Backend\App\Action\Context;
use Resursbank\OmniCheckout\Model\Api;

class Index extends \Magento\Backend\App\Action
{
    /**
     * Authorization level of a basic admin session
     *
     * @see _isAllowed()
     */
    const ADMIN_RESOURCE = 'Resursbank_OmniCheckout::index';

    /**
     * @var Api
     */
    private $api;

    /**
     * @param Context $context
     * @param Api $api
     */
    public function __construct(
        Context $context,
        Api $api
    ) {
        parent::__construct($context);

        $this->api = $api;
    }

    /**
     * Index action
     */
    public function execute()
    {
        // Do something.
    }

}
