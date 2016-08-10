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
     * @param \Magento\Checkout\Model\Session $checkoutSession
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     */
    public function __construct(
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
    ) {
        parent::__construct($context);

        $this->checkoutSession = $checkoutSession;
        $this->context = $context;
        $this->quoteRepository = $quoteRepository;
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

        // Reset rendered checkout blocks.
        $this->resetCheckoutElements();

        return $this;
    }

    /**
     * Reset checkout elements.
     *
     * @return $this
     */
    public function resetCheckoutElements()
    {
        $this->checkoutSession->setData('omnicheckout_hash_header-cart', null);
        $this->checkoutSession->setData('omnicheckout_hash_omnicheckout-shipping-methods-list', null);
        $this->checkoutSession->setData('omnicheckout_hash_current-coupon-code', null);

        return $this;
    }
    
}
