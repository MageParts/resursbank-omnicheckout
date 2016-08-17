<?php

namespace Resursbank\OmniCheckout\Model;

class ShipmentManagement implements \Resursbank\OmniCheckout\Api\ShipmentManagementInterface
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
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
    }

    /**
     * Set shipping method.
     *
     * @param string $code
     * @return string JSON
     */
    public function setMethod($code)
    {
        $this->apiHelper->getQuote()->getShippingAddress()->setShippingMethod($code);

        return json_encode([
            'code' => $code
        ]);
    }

}
