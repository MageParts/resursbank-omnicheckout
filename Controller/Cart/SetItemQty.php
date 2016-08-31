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

namespace Resursbank\OmniCheckout\Controller\Cart;

use Exception;

/**
 * TODO: This could possibly be an API service instead.
 * TODO: Get MessageManager working so we can get a proper error message when the requested quantity exceeds item stock.
 *
 * Class SetItemQty
 * @package Resursbank\OmniCheckout\Controller\Cart
 */
class SetItemQty extends \Magento\Framework\App\Action\Action
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
     * @var \Magento\CatalogInventory\Model\StockStateProvider
     */
    private $stockStateProvider;

    /**
     * @var \Magento\CatalogInventory\Api\StockRegistryInterface
     */
    private $stockRegistry;

    /**
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Resursbank\OmniCheckout\Helper\Api $apiHelper
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     * @param \Magento\Framework\Controller\ResultFactory $resultFactory
     * @param \Magento\CatalogInventory\Model\Spi\StockStateProviderInterface $stockStateProvider
     * @param \Magento\CatalogInventory\Api\StockRegistryInterface $stockRegistry
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Resursbank\OmniCheckout\Helper\Api $apiHelper,
        \Magento\Checkout\Helper\Data $checkoutHelper,
        \Magento\Framework\Controller\ResultFactory $resultFactory,
        \Magento\CatalogInventory\Model\Spi\StockStateProviderInterface $stockStateProvider,
        \Magento\CatalogInventory\Api\StockRegistryInterface $stockRegistry
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->apiHelper = $apiHelper;
        $this->resultFactory = $resultFactory;
        $this->checkoutHelper = $checkoutHelper;
        $this->stockStateProvider = $stockStateProvider;
        $this->stockRegistry = $stockRegistry;

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
        $id = (int) $this->getRequest()->getParam('id');

        if (!$id) {
            throw new Exception('Please provide a valid item id.');
        }

        $qty = (float) $this->getRequest()->getParam('qty');

        /** @var \Magento\Quote\Model\Quote\Item $item */
        $item = $this->apiHelper->getQuote()->getItemById($id);

        /** @var \Magento\CatalogInventory\Model\Stock\Item $stockItem */
        $stockItem = $this->stockRegistry->getStockItem($item->getProduct()->getId(), $item->getProduct()->getStore()->getWebsiteId());

        // Make sure the requested quantity is available before proceeding.
        if (!$this->stockStateProvider->checkQty($stockItem, $qty)) {
//            $this->messageManager->addErrorMessage('The requested item quantity is not available.');
            throw new Exception(__('The requested item quantity is not available.'));
        }

        // Update item qty.
        $item->setQty($qty);

        // Save quote changes.
        $this->quoteRepository->save($this->apiHelper->getQuote());

        // Build response object.
        $result = $this->resultFactory->create(\Magento\Framework\Controller\ResultFactory::TYPE_JSON);
        $result->setData([
            'item_total' => $this->checkoutHelper->formatPrice($item->getRowTotalInclTax()),
            'item_total_excl_tax' => $this->checkoutHelper->formatPrice($item->getRowTotal())
        ]);

        // Respond.
        return $result;
    }

}
