<?php

namespace Resursbank\OmniCheckout\Controller\Index;

use Magento\Backend\App\Action\Context;
use Resursbank\OmniCheckout\Model\Api;

class Index extends \Magento\Framework\App\Action\Action
{

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
        $result = $this->api->getOrderLines();

        die(var_dump($result));
        // Do something.
    }

}
