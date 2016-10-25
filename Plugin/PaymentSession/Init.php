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

namespace Resursbank\OmniCheckout\Plugin\PaymentSession;

/**
 * Initialize payment session.
 *
 * Class Init
 * @package Resursbank\OmniCheckout\Plugin\PaymentSession
 */
class Init
{

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @var \Magento\Framework\UrlInterface
     */
    private $url;

    /**
     * @var \Magento\Framework\App\ResponseFactory
     */
    private $responseFactory;

    /**
     * @var \Magento\Framework\Message\ManagerInterface
     */
    private $messageManager;

    /**
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Framework\App\ResponseFactory $responseFactory
     * @param \Magento\Framework\UrlInterface $url
     * @param \Magento\Framework\Message\ManagerInterface $messageManager
     */
    public function __construct(
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Framework\App\ResponseFactory $responseFactory,
        \Magento\Framework\UrlInterface $url,
        \Magento\Framework\Message\ManagerInterface $messageManager
    ) {
        $this->apiModel = $apiModel;
        $this->apiHelper = $apiHelper;
        $this->url = $url;
        $this->responseFactory = $responseFactory;
        $this->messageManager = $messageManager;
    }

    /**
     * Initialize payment session before the checkout page loads (predispatch of checkout_index_index).
     *
     * @param \Magento\Checkout\Controller\Index\Index $subject
     * @return  null
     * @throws \Exception
     */
    public function beforeExecute(\Magento\Checkout\Controller\Index\Index $subject)
    {
        if (!$this->apiModel->paymentSessionInitialized()) {
            try {
                $this->apiModel->initPaymentSession();
            } catch (\Exception $e) {
                $this->messageManager->addErrorMessage($e->getMessage());
                $this->responseFactory->create()->setRedirect($this->url->getUrl('checkout/cart'))->sendResponse();
                die();
            }
        }
    }

}
