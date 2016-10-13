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

namespace Resursbank\OmniCheckout\Plugin\Block\Adminhtml\Sales\Order\View;

/**
 * Prepends Omnicheckout information (invoice information from Resursbank) to the information block on the order view.
 *
 * Class AppendResursbankInfo
 * @package Resursbank\OmniCheckout\Plugin\Block\Adminhtml\Sales\Order\View
 */
class AppendPaymentInfo
{

    /**
     * @var \Magento\Framework\ObjectManagerInterface
     */
    private $objectManager;

    /**
     * @param \Magento\Framework\ObjectManagerInterface $objectManager
     */
    public function __construct(
        \Magento\Framework\ObjectManagerInterface $objectManager
    ) {
        $this->objectManager = $objectManager;
    }

    /**
     * Prepend OmniCheckout information to order information block.
     *
     * @param \Magento\Sales\Block\Adminhtml\Order\View\Info $subject
     * @param $result
     * @return string
     */
    public function afterToHtml(\Magento\Sales\Block\Adminhtml\Order\View\Info $subject, $result)
    {
        /** @var \Resursbank\OmniCheckout\Block\Adminhtml\Sales\Order\View\Info\OmniCheckout $block */
        $block = $this->objectManager->create('\Resursbank\OmniCheckout\Block\Adminhtml\Sales\Order\View\Info\OmniCheckout');

        return ($block && substr($block->getOrder()->getPayment()->getMethod(), 0, 11) === 'resursbank_') ? ($block->toHtml() . $result) : $result;
    }

}
