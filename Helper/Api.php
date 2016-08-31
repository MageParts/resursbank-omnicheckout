<?php

namespace Resursbank\OmniCheckout\Helper;

use Exception;

class Api extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @var \Magento\Quote\Api\CartRepositoryInterface
     */
    private $quoteRepository;

    /**
     * @var \Magento\Directory\Helper\Data
     */
    private $directoryHelper;

    /**
     * @var \Magento\Framework\ObjectManagerInterface
     */
    private $objectManager;

    /**
     * @var \Magento\CheckoutAgreements\Model\CheckoutAgreementsRepository
     */
    private $checkoutAgreementsRepository;

    /**
     * @param \Magento\Checkout\Model\Session $checkoutSession
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param \Magento\Directory\Helper\Data $directoryHelper
     * @param \Magento\Framework\ObjectManagerInterface $objectManager
     * @param \Magento\CheckoutAgreements\Model\CheckoutAgreementsRepository $checkoutAgreementsRepository
     */
    public function __construct(
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        \Magento\Directory\Helper\Data $directoryHelper,
        \Magento\Framework\ObjectManagerInterface $objectManager,
        \Magento\CheckoutAgreements\Model\CheckoutAgreementsRepository $checkoutAgreementsRepository
    ) {
        $this->checkoutSession = $checkoutSession;
        $this->context = $context;
        $this->quoteRepository = $quoteRepository;
        $this->directoryHelper = $directoryHelper;
        $this->objectManager = $objectManager;
        $this->checkoutAgreementsRepository = $checkoutAgreementsRepository;

        parent::__construct($context);

    }

    /**
     * Retrieve checkout quote.
     *
     * @return \Magento\Quote\Model\Quote
     */
    public function getQuote()
    {
        return $this->checkoutSession->getQuote();
    }

    /**
     * Retrieve/generate unique token used to identify quote/order object when communicating with Resursbank servers.
     * The token is a completely unique string to ensure that callbacks made from Resursbank will identify the correct
     * quote/order.
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param bool $refresh
     * @return string
     * @throws Exception
     */
    public function getQuoteToken(\Magento\Quote\Model\Quote $quote, $refresh = false)
    {
        if (!$quote->getId()) {
            throw new Exception('Uninitialized quote object.');
        }

        // Retrieve existing token form quote, if any.
        $result = $quote->getData('resursbank_token');

        if ($refresh || !is_string($result)) {
            // Generate unique token.
            $result = sha1($this->strRand(64) . $quote->getId() . time());

            // Store token on quote for later usage.
            $quote->setData('resursbank_token', $result);

            // Save quote updates.
            $this->quoteRepository->save($quote);
        }

        return (string) $result;
    }

    /**
     * Retrieve completely random string.
     *
     * @param int $length
     * @param string $charset
     * @return string
     */
    public function strRand($length, $charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    {
        $result = '';

        $length = (int) $length;

        if ($length > 0) {
            $max = strlen($charset)-1;

            for ($i = 0; $i < $length; $i++) {
                $result.= $charset[mt_rand(0, $max)];
            }
        }

        return $result;
    }

    /**
     * Check if shopping cart is empty.
     *
     * @return bool
     */
    public function cartIsEmpty()
    {
        return ((float) $this->getQuote()->getItemsCount() < 1);
    }

    /**
     * Clear payment session information from checkout session.
     *
     * @return $this
     */
    public function clearPaymentSession()
    {
        // Unset session data.
        $this->checkoutSession
            ->unsetData(\Resursbank\OmniCheckout\Model\Api::PAYMENT_SESSION_ID_KEY)
            ->unsetData(\Resursbank\OmniCheckout\Model\Api::PAYMENT_SESSION_IFRAME_KEY);

        return $this;
    }

}
