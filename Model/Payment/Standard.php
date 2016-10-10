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

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Standard payment method, when the request Resursbank method is not implemented.
 *
 * Class Standard
 * @package Resursbank\OmniCheckout\Model\Payment
 */
class Standard extends \Magento\Payment\Model\Method\AbstractMethod
{
    
    const PAYMENT_METHOD_RESURSBANK_STANDARD_CODE = 'resursbank_default';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_STANDARD_CODE;

    /**
     * Can capture payment.
     *
     * @var bool
     */
    protected $_canCapture = true;

    /**
     * Can be refunded.
     *
     * @var bool
     */
    protected $_canRefund = true;

    /**
     * Can refund partial invoice amount.
     *
     * @var bool
     */
    protected $_canRefundInvoicePartial = true;

    /**
     * Can be used during checkout.
     *
     * @var bool
     */
    protected $_canUseCheckout = true;

    /**
     * Cannot be used from the administration panel.
     *
     * @var bool
     */
    protected $_canUseInternal = true;

    /**
     * @var \Magento\Sales\Model\Order\Payment\Transaction\BuilderInterface
     */
    private $transactionBuilder;

    /**
     * @var \Magento\Framework\Message\ManagerInterface
     */
    private $messageManager;

    /**
     * @var \Resursbank\OmniCheckout\Helper\Ecom
     */
    private $ecomHelper;

    /**
     * @param \Magento\Framework\Model\Context $context
     * @param \Magento\Framework\Registry $registry
     * @param \Magento\Framework\Api\ExtensionAttributesFactory $extensionFactory
     * @param \Magento\Framework\Api\AttributeValueFactory $customAttributeFactory
     * @param \Magento\Payment\Helper\Data $paymentData
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param \Magento\Payment\Model\Method\Logger $logger
     * @param \Magento\Sales\Model\Order\Payment\Transaction\BuilderInterface $transactionBuilder
     * @param \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper
     * @param \Magento\Framework\Message\ManagerInterface $messageManager
     * @param \Magento\Framework\Model\ResourceModel\AbstractResource $resource
     * @param \Magento\Framework\Data\Collection\AbstractDb $resourceCollection
     * @param array $data
     * @SuppressWarnings(PHPMD.ExcessiveParameterList)
     */
    public function __construct(
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\Api\ExtensionAttributesFactory $extensionFactory,
        \Magento\Framework\Api\AttributeValueFactory $customAttributeFactory,
        \Magento\Payment\Helper\Data $paymentData,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Payment\Model\Method\Logger $logger,
        \Magento\Sales\Model\Order\Payment\Transaction\BuilderInterface $transactionBuilder,
        \Resursbank\OmniCheckout\Helper\Ecom $ecomHelper,
        \Magento\Framework\Message\ManagerInterface $messageManager,
        \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
        \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
        array $data = []
    ) {
        parent::__construct(
            $context,
            $registry,
            $extensionFactory,
            $customAttributeFactory,
            $paymentData,
            $scopeConfig,
            $logger,
            $resource,
            $resourceCollection,
            $data
        );

        $this->transactionBuilder = $transactionBuilder;
        $this->messageManager = $messageManager;
        $this->ecomHelper = $ecomHelper;
    }

    /**
     * Capture payment.
     *
     * @param \Magento\Framework\DataObject|\Magento\Payment\Model\InfoInterface|\Magento\Sales\Model\Order\Payment $payment
     * @param float $amount
     * @return $this
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function capture(\Magento\Payment\Model\InfoInterface $payment, $amount)
    {
        parent::capture($payment, $amount);

        /** @var \ResursBank $connection */
        $connection = $this->ecomHelper->getConnection();

        // Payment token (identifier).
        $token = $payment->getOrder()->getData('resursbank_token');

        /** @var \resurs_payment $paymentSession */
        $paymentSession = $connection->getPayment($token);

        // Finalize Resursbank payment.
        if (!$paymentSession->finalized && !$this->paymentSessionDebited($paymentSession)) {
            if ($paymentSession->frozen) {
                throw new \Magento\Framework\Exception\LocalizedException(__('Resursbank payment %1 is still frozen.', $token));
            }

            if (strtoupper($paymentSession->status) !== 'DEBITABLE') {
                throw new \Magento\Framework\Exception\LocalizedException(__('Resursbank payment %1 is not debitable yet.', $token));
            }

            // Finalize payment session.
            if (!$connection->finalizePayment($token)) {
                throw new \Magento\Framework\Exception\LocalizedException(__('Failed to finalize Resursbank payment %1.', $token));
            }
        }

        // Set token as transaction identifier.
        $payment->setTransactionId($token);

        /** @var \Magento\Sales\Model\Order\Payment\Transaction $transaction */
        $transaction = $this->transactionBuilder->setPayment($payment)
            ->setOrder($payment->getOrder())
            ->setTransactionId($payment->getTransactionId())
            ->build(\Magento\Sales\Model\Order\Payment\Transaction::TYPE_ORDER);

        // Add history entry.
        $payment->addTransactionCommentsToOrder($transaction, __('Finalized Resursbank payment.', $token));

        // Close transaction to complete process.
        $transaction->setIsClosed(true);

        return $this;
    }

    /**
     * Check if a payment session already has been debited.
     *
     * @param \resurs_payment $session
     * @return bool
     */
    public function paymentSessionDebited(\resurs_payment $session)
    {
        $result = false;

        if (isset($session->status) && ((is_array($session->status) && in_array('IS_DEBITED', $session->status)) || (is_string($session->status) && strtoupper($session->status) === 'IS_DEBITED'))) {
            $result = true;
        }

        return $result;
    }

}
