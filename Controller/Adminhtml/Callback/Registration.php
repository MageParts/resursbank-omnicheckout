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

namespace Resursbank\OmniCheckout\Controller\Adminhtml\Callback;

/**
 * Class Registration
 * @package Resursbank\OmniCheckout\Controller\Adminhtml\Callback
 */
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
     * Register callback URLs.
     *
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        // Register callback URLs.
        $this->apiModel->registerCallbacks();

        // Redirect back to the config section.
        $this->_redirect($this->_redirect->getRefererUrl());
    }

}
