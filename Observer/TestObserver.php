<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Resursbank\OmniCheckout\Observer;

use Magento\Framework\Event\ObserverInterface;

/**
 * Customer Observer Model
 */
class TestObserver implements ObserverInterface
{

    /**
     * @var \Magento\Framework\Logger\Monolog
     */
    private $logger;

    /**
     * @var \Magento\Framework\App\Request\Http
     */
    private $request;
    /**
     * @var \Magento\Store\App\Response\Redirect
     */
    private $redirect;
    /**
     * @var \Magento\Framework\App\Response\Http
     */
    private $response;
    /**
     * @var \Magento\Framework\App\Action\Context
     */
    private $context;
    /**
     * @var \Magento\Customer\Model\Session
     */
    private $session;

    /**
     * TestObserver constructor.
     * @param \Magento\Framework\Logger\Monolog $logger
     * @param \Magento\Framework\App\Request\Http $request
     * @param \Magento\Store\App\Response\Redirect $redirect
     * @param \Magento\Framework\App\Response\Http $response
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Customer\Model\Session $session
     */
    public function __construct(
        \Magento\Framework\Logger\Monolog $logger,
        \Magento\Framework\App\Request\Http $request,
        \Magento\Store\App\Response\Redirect $redirect,
        \Magento\Framework\App\Response\Http $response,
        \Magento\Framework\App\Action\Context $context,
        \Magento\Customer\Model\Session $session
    )
    {
        $this->logger = $logger;
        $this->request = $request;
        $this->redirect = $redirect;
        $this->response = $response;
        $this->context = $context;
        $this->session = $session;
    }

    /**
     * Address before save event handler
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if ($this->request->getRouteName() !== 'customer' && !$this->session->isLoggedIn()) {
            $this->context->getMessageManager()->addError(__('You must login before you can access this page.'));
            $this->session->setAfterAuthUrl($this->request->getUriString());
            $this->redirect->redirect($this->response, 'customer/account/login');
        }
    }
}
