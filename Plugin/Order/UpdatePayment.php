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

namespace Resursbank\OmniCheckout\Plugin\Order;

/**
 * Update payment session whenever its order counterpart gets updated.
 *
 * Class UpdatePayment
 * @package Resursbank\OmniCheckout\Plugin\Order
 */
class UpdatePayment
{

    /**
     * @var \Resursbank\OmniCheckout\Helper\Ecom
     */
    private $ecomHelper;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Magento\Quote\Model\QuoteRepository
     */
    private $quoteRepository;

    /**
     * @var \Magento\Framework\Message\ManagerInterface
     */
    private $messageManager;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Debug
     */
    private $log;

    /**
     * @param \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Magento\Quote\Model\QuoteRepository $quoteRepository
     * @param \Magento\Framework\Message\ManagerInterface $messageManager
     * @param \Resursbank\OmniCheckout\Helper\Debug $log
     */
    public function __construct(
        \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Magento\Quote\Model\QuoteRepository $quoteRepository,
        \Magento\Framework\Message\ManagerInterface $messageManager,
        \Resursbank\OmniCheckout\Helper\Debug $log
    ) {
        $this->ecomHelper = $ecomHelper;
        $this->apiModel = $apiModel;
        $this->quoteRepository = $quoteRepository;
        $this->messageManager = $messageManager;
        $this->log = $log;
    }

    /**
     * Before we save a revised order we need to append the original payment id to it.
     *
     * @param \Magento\Sales\Model\AdminOrder\Create $subject
     * @param \Magento\Sales\Model\Order\Interceptor $order
     * @return \Magento\Sales\Model\Order\Interceptor
     * @throws \Exception
     */
    public function afterCreateOrder(\Magento\Sales\Model\AdminOrder\Create $subject, $order)
    {
        if ($this->ecomHelper->isEnabled()) {
            // Retrieve resursbank_token from old order.
            $token = $subject->getSession()->getOrder() ? (string)$subject->getSession()->getOrder()->getData('resursbank_token') : '';

            try {
                if (!empty($token)) {
                    // Set resursbank_token on new order.
                    $order->setData('resursbank_token', $token)->save();

                    /** @var \Magento\Quote\Model\Quote $quote */
                    $quote = $this->getQuote($order);

                    // Set resursbank_token on new quote.
                    $quote->setData('resursbank_token', $token);
                    $this->quoteRepository->save($quote);

                    /** @var \ResursBank $connection */
                    $connection = $this->ecomHelper->getConnection();

                    // This cannot be removed, otherwise creditPayment won't work as getPayment stores necessary
                    // information on the helper.
                    /** @var \resurs_payment $payment */
                    $payment = $connection->getPayment($token);

                    if ($payment && ($payment instanceof \resurs_payment)) {
                        // Set quote on API model (this allows us to collect the cart information we will submit to the API to update the payment).
                        $this->apiModel->setData('quote', $quote);

                        //                $data = $this->getPaymentSpec($quote, $payment);
                        //                $paymentSpecLines = $connection->handleClientPaymentSpec($this->correctOrderLines($quote, $this->apiModel->getOrderLines(), $payment));
                        //
                        //                $connection->updateCart($paymentSpecLines);
                        //                $connection->updatePaymentSpec($connection->_paymentSpeclines);
                        //
                        //                $test = $connection->_paymentOrderData;
                        //
                        //                $parameters = $connection->renderPaymentSpecContainer($token, \ResursAfterShopRenderTypes::UPDATE, $payment, $paymentSpecLines, array(), false, true);
                        //
                        //                if ($connection->afterShopFlowService->__soapCall('additionalDebitOfPayment', array($parameters))) {
                        //                    $this->messageManager->addSuccessMessage(__('Resursbank payment %1 has been updated.', $token));
                        //                } else {
                        //                    $this->messageManager->addErrorMessage(__('Failed to update Resursbank payment %1. Please use the payment administration to manually update the payment.', $token));
                        //                }
                    }
                }
            } catch (\Exception $e) {
                $this->messageManager->addErrorMessage(__('Failed to update Resursbank payment %1. Please use the payment administration to manually update the payment.', $token));
                $this->log->error($e->getMessage());
            }
        }

        return $order;
    }

    /**
     * Retrieve quote object from order.
     *
     * @param \Magento\Sales\Model\Order $order
     * @return \Magento\Quote\Api\Data\CartInterface|\Magento\Quote\Model\Quote
     */
    public function getQuote(\Magento\Sales\Model\Order $order)
    {
        return $this->quoteRepository->get($order->getQuoteId());
    }

    /**
     * Collect the udpated order data which will be submitted to the API.
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param \resurs_payment $payment
     * @return array
     * @todo we should check if $payment is an instance of resurs_payment and otherwise give an error message.
     */
    public function getPaymentSpec(\Magento\Quote\Model\Quote $quote, $payment)
    {
        $result = array(
            'paymentId' => $quote->getData('resursbank_token'),
            'paymentSpec' => $this->correctOrderLines($quote, $this->apiModel->getOrderLines(), $payment)
        );

        return $result;
    }

    /**
     * Get quote item by SKU.
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param string $sku
     * @return \Magento\Quote\Model\Quote\Item|null
     */
    public function getQuoteItemBySku(\Magento\Quote\Model\Quote $quote, $sku)
    {
        $result = null;

        $sku = (string) $sku;

        if (count($quote->getAllItems())) {
            /** @var \Magento\Quote\Model\Quote\Item $item */
            foreach ($quote->getAllItems() as $item) {
                if ($item->getSku() === $sku) {
                    $result = $item;
                    break;
                }
            }
        }

        return $result;
    }

    /**
     * Correct order lines collected by our API model to function with ECom calls.
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param array $orderLines
     * @param \resurs_payment $payment
     * @return \resurs_paymentSpec
     * @todo we should check if $payment is an instance of resurs_payment and otherwise give an error message.
     */
    public function correctOrderLines(\Magento\Quote\Model\Quote $quote, array $orderLines, $payment)
    {
        $specLines = array();

        if (count($orderLines)) {
            foreach ($orderLines as &$item) {
                $specLines[] = $this->createSpecLine($quote, $item, $payment);
            }
        }

        return $specLines;
    }

    /**
     * Retrieve total amount from all spec lines.
     *
     * @param array $specLines
     * @return float|int
     */
    public function getSpecTotalAmount(array $specLines)
    {
        $result = 0;

        if (count($specLines)) {
            /** @var \resurs_specLine $line */
            foreach ($specLines as $line) {
                $result+= (float) $line->totalAmount;
            }
        }

        return $result;
    }

    /**
     * Create resursbank_specLine from item.
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param array $item
     * @param \resurs_payment $payment
     * @return \resurs_specLine
     * @todo disocunt, $item['totalAmount'] = 0;, should it actually be 0?
     * @todo we should check if $payment is an instance of resurs_payment and otherwise give an error message.
     */
    public function createSpecLine(\Magento\Quote\Model\Quote $quote, array $item, $payment)
    {
        $specLine = $this->getSpecLineBySku($payment, $item['artNo']);

        $item['id'] = ($specLine instanceof \resurs_specLine) ? $specLine->id : null;

        return [
            'id' => $item['id'],
            'artNo' => $item['artNo'],
            'quantity' => $item['quantity']
        ];

//
//
//
//
//
//
//        if ($item['artNo'] === 'shipping') {
//            $item['totalVatAmount'] = $quote->getShippingAddress()->getTaxAmount();
//            $item['totalAmount'] = $quote->getShippingAddress()->getShippingInclTax();
//        } else if ($item['artNo'] === 'discount' || $item['artNo'] === $quote->getCouponCode()) {
//            $item['totalVatAmount'] = 0;
//            $item['totalAmount'] = 0;
//        } else {
//            $quoteItem = $this->getQuoteItemBySku($quote, $item['artNo']);
//
//            if ($quoteItem instanceof \Magento\Quote\Model\Quote\Item) {
//                $item['totalVatAmount'] = $quoteItem->getTaxAmount();
//                $item['totalAmount'] = $quoteItem->getRowTotalInclTax();
//            }
//        }
//
//        return new \resurs_specLine(
//            $item['id'],
//            $item['artNo'],
//            $item['description'],
//            $item['quantity'],
//            $item['unitMeasure'],
//            $item['unitAmountWithoutVat'],
//            $item['vatPct'],
//            $item['totalVatAmount'],
//            $item['totalAmount']
//        );
    }

    /**
     * Retrieve spec line from payment session matching a given SKU.
     *
     * @param \resurs_payment $payment
     * @param string $sku
     * @return null|\resurs_specLine
     * @todo we should check if $payment is an instance of resurs_payment and otherwise give an error message.
     */
    public function getSpecLineBySku($payment, $sku)
    {
        $result = null;

        $sku = (string) $sku;

        if (isset($payment->paymentDiffs)) {
            $info = is_array($payment->paymentDiffs) ? $payment->paymentDiffs[0] : $payment->paymentDiffs;

            if (($info instanceof \resurs_paymentDiff) &&
                isset($info->paymentSpec) &&
                ($info->paymentSpec instanceof \resurs_paymentSpec) &&
                isset($info->paymentSpec->specLines) &&
                is_array($info->paymentSpec->specLines) &&
                count($info->paymentSpec->specLines)
            ) {
                foreach ($info->paymentSpec->specLines as $line) {
                    if (($line instanceof \resurs_specLine) && $line->artNo === $sku) {
                        $result = $line;
                        break;
                    }
                }
            }
        }

        return $result;
    }

}
