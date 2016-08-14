<?php
/**
 * Created by PhpStorm.
 * User: Bossehasse
 * Date: 09/08/16
 * Time: 11:48
 */

namespace Resursbank\OmniCheckout\Helper;


class Callback extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $api;

    /**
     * Callback constructor.
     * 
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \Resursbank\OmniCheckout\Model\Api $api
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Resursbank\OmniCheckout\Model\Api $api
    ) {
        $this->api = $api;

        parent::__construct($context);
    }

    /**
     * Returns a list of all registered callbacks.
     *
     * @return array
     */
    public function getCallbacks()
    {
        return $this->api->hasCredentials() ? $this->api->getCallbacks() : [];
    }

}