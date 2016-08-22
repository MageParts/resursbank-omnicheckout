<?php

namespace Resursbank\OmniCheckout\Controller\Cart;

use Exception;

/**
 * TODO: This could possibly be an API service instead.
 *
 * Class RemoveItem
 * @package Resursbank\OmniCheckout\Controller\Cart
 */
class RemoveItem extends \Magento\Checkout\Controller\Cart\Delete
{
    /**
     * Initializes payment session at Resursbank and renders the checkout page.
     *
     * @return string JSON
     * @throws Exception
     */
    public function execute()
    {
        parent::execute();

        $apiHelper = $this->_objectManager->create('\Resursbank\OmniCheckout\Helper\Api');
        $resultFactory = $this->_objectManager->create('\Magento\Framework\Controller\ResultFactory');

        // Build response object.
        $result = $resultFactory->create(\Magento\Framework\Controller\ResultFactory::TYPE_JSON);
        $result->setData(['cart_qty' => $apiHelper->getQuote()->getItemsQty()]);

        // Respond.
        return $result;
    }

}
