<?php
/**
 * Copyright 2016 Resurs Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
