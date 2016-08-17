<?php

namespace Resursbank\OmniCheckout\Model;

class CartItemManagement implements \Resursbank\OmniCheckout\Api\CartItemManagementInterface
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
     * @var \Magento\Checkout\Helper\Data
     */
    private $checkoutHelper;

    /**
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     */
    public function __construct(
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Checkout\Helper\Data $checkoutHelper
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
        $this->checkoutHelper = $checkoutHelper;
    }

    /**
     * Set quote item quantity.
     *
     * @param string $itemId
     * @param float $qty
     * @return array
     */
    public function setQty($itemId, $qty)
    {
        /** @var \Magento\Quote\Model\Quote\Item $item */
        $item = $this->apiHelper->getQuote()->getItemById($itemId);

        // Update item qty.
        $item->setQty($qty);

        // Save quote changes.
        $this->quoteRepository->save($this->apiHelper->getQuote());

        return [
            'id' => $itemId,
            'item_total' => $this->checkoutHelper->formatPrice($item->getRowTotalInclTax()),
            'item_total_excl_tax' => $this->checkoutHelper->formatPrice($item->getRowTotal()),
            'cart_qty' => $item->getQty()
        ];
    }

}
