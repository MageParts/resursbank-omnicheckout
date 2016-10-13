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

namespace Resursbank\OmniCheckout\Helper;

use Exception;

require_once(dirname(dirname(__FILE__)) . '/Lib/RBEcomPHP/classes/rbapiloader.php');

/**
 * Class Ecom
 *
 * @package Resursbank\OmniCheckout\Helper
 */
class Ecom extends \Magento\Framework\App\Helper\AbstractHelper
{

    /**
     * @var \ResursBank
     */
    private $connection;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Magento\Framework\App\Helper\Context $context
     */
    public function __construct(
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Magento\Framework\App\Helper\Context $context
    ) {
        $this->context = $context;
        $this->apiModel = $apiModel;

        parent::__construct($context);
    }

    /**
     * @return \ResursBank
     */
    public function getConnection()
    {
        if (is_null($this->connection)) {
            $this->connection = new \ResursBank($this->apiModel->getUsername(), $this->apiModel->getPassword());
        }

        return $this->connection;
    }

    /**
     * Check if ECom integration is enabled.
     *
     * @return bool
     */
    public function isEnabled()
    {
        return $this->scopeConfig->isSetFlag("omnicheckout/ecom/enabled", \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

}
