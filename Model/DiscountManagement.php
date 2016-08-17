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
     * @var Api
     */
    private $apiModel;

    /**
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param Api $apiModel
     */
    public function __construct(
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Resursbank\OmniCheckout\Model\Api $apiModel
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
        $this->apiModel = $apiModel;
    }

    /**
     * Apply discount code.
     *
     * @param string $code
     * @return string JSON
     */
    public function apply($code)
    {
        // Set coupon code on quote.
        $this->apiHelper->getQuote()->setCouponCode($code);

        // Save quote.
        $this->quoteRepository->save($this->apiHelper->getQuote());

        // Update iframe session (event won't work since this is an API request).
        $this->apiModel->updatePaymentSession();

        return json_encode([
            'code' => $code
        ]);
    }

}
