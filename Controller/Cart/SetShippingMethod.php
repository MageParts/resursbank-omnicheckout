<?php

namespace Resursbank\OmniCheckout\Controller\Cart;

use Exception;

class SetShippingMethod extends \Magento\Framework\App\Action\Action
{
    /**
     * @var \Magento\Quote\Api\CartRepositoryInterface
     */
    private $quoteRepository;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Framework\Controller\ResultFactory $resultFactory
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Framework\Controller\ResultFactory $resultFactory
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
        $this->resultFactory = $resultFactory;

        parent::__construct($context);
    }

    /**
     * Initializes payment session at Resursbank and renders the checkout page.
     *
     * @return string JSON
     * @throws Exception
     */
    public function execute()
    {
        // Get request parameters.
        $code = (int) $this->getRequest()->getParam('code');

        if (!$code) {
            throw new Exception('Please provide a valid shipping method.');
        }

        // Set shipping method on quote.
        $this->apiHelper->getQuote()->getShippingAddress()->setShippingMethod($code);

        // Save quote changes.
        $this->quoteRepository->save($this->apiHelper->getQuote());

        // Build response object.
        $result = $this->resultFactory->create(\Magento\Framework\Controller\ResultFactory::TYPE_JSON);
        $result->setData([
            'code' => $code
        ]);

        // Respond.
        return $result;
    }

}
