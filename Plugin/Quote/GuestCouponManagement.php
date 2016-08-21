<?php

namespace Resursbank\OmniCheckout\Plugin\Quote;

class GuestCouponManagement
{
    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $apiHelper;

    /**
     * GuestCouponManagement constructor.
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Api $apiHelper
    ) {
        $this->apiHelper = $apiHelper;
    }

    /**
     * Execute after a coupon has been applied on the quote.
     *
     * @param \Magento\Quote\Model\GuestCart\GuestCouponManagement $subject
     * @param boolean $result
     * @return string JSON
     */
    public function afterSet(\Magento\Quote\Model\GuestCart\GuestCouponManagement $subject, $result)
    {
        return json_encode([
            'result' => $result,
            'discount_amount' => $this->apiHelper->getDiscountAmount()
        ]);
    }

}
