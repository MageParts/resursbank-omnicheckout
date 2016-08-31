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

namespace Resursbank\OmniCheckout\Plugin\Order;

/**
 * Append Resursbank payment id token on order before its saved. This allows us to identify the order when incoming
 * calls from Resursbank are made.
 *
 * Class AppendToken
 * @package Resursbank\OmniCheckout\Plugin\Order
 */
class AppendToken
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiHelper = $apiHelper;
    }

    /**
     * Append Resursbank token to order before saving it.
     *
     * @param \Magento\Sales\Model\Order $subject
     * @throws \Exception
     */
    public function beforeBeforeSave(\Magento\Sales\Model\Order $subject)
    {
        if (!$subject->getData('resursbank_token') && $this->apiHelper->getQuote() && $this->apiHelper->getQuote()->getId()) {
            $subject->setData('resursbank_token', $this->apiHelper->getQuoteToken($this->apiHelper->getQuote()));
        }
    }

}
