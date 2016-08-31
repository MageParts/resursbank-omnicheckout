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

namespace Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback;

/**
 * Render all registered callbacks.
 *
 * Class Listing
 * @package Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback
 */
class Listing extends \Magento\Config\Block\System\Config\Form\Field
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Callback
     */
    private $callback;

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Resursbank\OmniCheckout\Helper\Callback $callback
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Resursbank\OmniCheckout\Helper\Callback $callback,
        array $data = []
    ) {
        $this->callback = $callback;

        $this->setTemplate('system/config/callback/listing.phtml');

        parent::__construct($context, $data);
    }

    /**
     * Retrieve array of registered callbacks.
     *
     * @return array
     */
    public function getCallbacks()
    {
        return $this->callback->getCallbacks();
    }

    /**
     * Unset some non-related element parameters.
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        $element->unsScope()->unsCanUseWebsiteValue()->unsCanUseDefaultValue();

        return parent::render($element);
    }

    /**
     * Get the button and scripts contents
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        return $this->_toHtml();
    }

}
