<?php

namespace Resursbank\OmniCheckout\Model;

use Symfony\Component\Config\Definition\Exception\Exception;

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
     * @var \Magento\Framework\UrlInterface
     */
    private $urlManager;

    /**
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     * @param \Magento\Framework\UrlInterface $urlManager
     */
    public function __construct(
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Checkout\Helper\Data $checkoutHelper,
        \Magento\Framework\UrlInterface $urlManager
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
        $this->checkoutHelper = $checkoutHelper;
        $this->urlManager = $urlManager;
    }

    /**
     * Set quote item quantity.
     *
     * @param int $id
     * @param float $qty
     * @return string JSON
     */
    public function setItemQty($id, $qty)
    {
        /** @var \Magento\Quote\Model\Quote\Item $item */
        $item = $this->apiHelper->getQuote()->getItemById($id);

        // Update item qty.
        $item->setQty($qty);

        // Save quote changes.
        $this->quoteRepository->save($this->apiHelper->getQuote());

        return json_encode([
            'id' => $id,
            'item_total' => $this->checkoutHelper->formatPrice($item->getRowTotalInclTax()),
            'item_total_excl_tax' => $this->checkoutHelper->formatPrice($item->getRowTotal()),
            'cart_qty' => $item->getQty()
        ]);
    }

    /**
     * Remove item from quote.
     *
     * @param int $id
     * @return string JSON
     */
    public function removeItem($id)
    {
        $this->apiHelper->getQuote()->removeItem($id);

        return json_encode([
            'redirect' => $this->urlManager->getBaseUrl('checkout')
        ]);
    }

}
