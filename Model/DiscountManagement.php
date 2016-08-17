<?php

namespace Resursbank\OmniCheckout\Model;

class DiscountManagement implements \Resursbank\OmniCheckout\Api\DiscountManagementInterface
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
     * Apply discount code.
     *
     * @param string $code
     * @return string JSON
     */
    public function apply($code)
    {
        $this->apiHelper->getQuote()->setCouponCode($code);
        $this->quoteRepository->save($this->apiHelper->getQuote());

        return json_encode([
            'code' => $code
        ]);
    }

}
