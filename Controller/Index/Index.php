<?php

namespace Resursbank\OmniCheckout\Controller\Index;

use Exception;

class Index extends \Magento\Framework\App\Action\Action
{

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Magento\Framework\View\Result\PageFactory
     */
    private $pageFactory;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Framework\View\Result\PageFactory $pageFactory
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\View\Result\PageFactory $pageFactory,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiModel = $apiModel;
        $this->pageFactory = $pageFactory;
        $this->apiHelper = $apiHelper;

        parent::__construct($context);
    }

    /**
     * Initializes payment session at Resursbank and renders the checkout page.
     *
     * @return \Magento\Framework\View\Result\Page
     */
    public function execute()
    {
        // Initialize payment session.
        if (!$this->apiModel->paymentSessionInitialized()) {
            try {
                // Assign default address information to quote.
                $this->apiHelper->quoteAssignDefaultAddress(true, false);

                // Assign default shipping method.
                //$this->assignDefaultShippingMethod();

                // Initialize payment session.
                //$this->apiModel->initPaymentSession();
            } catch (Exception $e) {
                // Do nothing.
            }
        }

        return $this->pageFactory->create();
    }

    /**
     * Assign default shipping method (this only applies if there is only one shipping method available).
     *
     * @return $this
     * @throws Exception
     */
    public function assignDefaultShippingMethod()
    {
        if ($this->apiHelper->getQuote()) {
            $rates = $this->apiHelper->getShippingRatesCollection();

            if (count($rates) === 1) {
                foreach ($rates as $rate) {
                    $this->apiHelper->getQuote()->getShippingAddress()->setShippingMethod("{$rate->getCarrier()}_{$rate->getCode()}");
                    $this->apiHelper->getQuote()->collectTotals();
                    $this->apiHelper->getQuoteRepository()->save($this->apiHelper->getQuote());
                }
            }
        }

        return $this;
    }

}
