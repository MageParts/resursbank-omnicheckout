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

namespace Resursbank\OmniCheckout\Block;

/**
 * JavaScript.
 *
 * Class Js
 * @package Resursbank\OmniCheckout\Block
 */
class Js extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Magento\Framework\UrlInterface
     */
    private $urlManager;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Magento\Framework\Data\Form\FormKey
     */
    private $formKey;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\UrlInterface $urlManager
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Magento\Framework\Data\Form\FormKey $formKey
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\UrlInterface $urlManager,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Magento\Framework\Data\Form\FormKey $formKey,
        array $data = []
    ) {
        $this->urlManager = $urlManager;
        $this->apiModel = $apiModel;
        $this->formKey = $formKey;

        parent::__construct($context, $data);
    }

    /**
     * Get form key.
     *
     * @return string
     */
    public function getFormKey()
    {
        return $this->formKey->getFormKey();
    }

    /**
     * Retrieve URL manager.
     *
     * @return \Magento\Framework\UrlInterface
     */
    public function getUrlManager()
    {
        return $this->urlManager;
    }

    /**
     * Retrieve API model.
     *
     * @return \Resursbank\OmniCheckout\Model\Api
     */
    public function getApiModel()
    {
        return $this->apiModel;
    }

}
