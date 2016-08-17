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
     * Retrieve quote repository model.
     *
     * @return \Magento\Quote\Api\CartRepositoryInterface
     */
    public function getQuoteRepository()
    {
        return $this->quoteRepository;
    }

    /**
     * Check if quote object have any items.
     *
     * @return bool
     */
    public function quoteHasItems()
    {
        return $this->getQuote()->hasItems();
    }

    /**
     * Check if the quote object is unusable (ie. cannot be checked out).
     *
     * @return bool
     */
    public function quoteIsUnusable()
    {
        return (!$this->getQuote()->hasItems() || $this->getQuote()->getHasError());
    }

    /**
     * Redirect back to previous URL.
     */
    public function redirectBack()
    {
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    }

    /**
     * Perform a hard redirect to $url
     *
     * @param $url
     * @throws Exception
     */
    public function hardRedirect($url)
    {
        $url = (string) $url;

        if (empty($url)) {
            throw new Exception("Cannot redirect to empty URL.");
        }

        header('Location: ' . (string) $url) ;

        exit;
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
     * Check if some value has changed based on a hash stored in the checkout session (useful when checking if certain
     * blocks have been updated as values are changed in checkout, otherwise we do not need to transport the HTML back
     * to the client and ultimately we conserve resources that way).
     *
     * @param string $value
     * @param string $key
     * @return bool
     */
    public function blockHasChanged($value, $key)
    {
        $result = false;

        $value = (string) $value;
        $key = preg_replace('/[^a-z0-9]/', '', strtolower((string) $key));

        $key = 'omnicheckout_hash_' . $key;

        $current = $this->checkoutSession->getData($key);
        $new = md5($value);

        if ($current !== $new) {
            $this->checkoutSession->setData($key, $new);
            $result = true;
        }

        return $result;
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

    /**
     * Check if any address information is missing on the quote object.
     *
     * @return bool
     * @todo Check if this is the proper way of checking this, can probably be improved.
     */
    public function quoteIsMissingAddress()
    {
        return (!$this->getQuote()->getShippingAddress()->getData('country_id') || !$this->getQuote()->getBillingAddress()->getData('country_id'));
    }

    /**
     * Assign default address information to quote object (in order to collect available shipping methods).
     *
     * @param bool $shipping
     * @param bool $billing
     * @return $this
     * @todo This might function differently if users are logged in.
     */
    public function quoteAssignDefaultAddress($shipping = true, $billing = true)
    {
        if ($shipping) {
            $this->quoteAssignAddress(array(
                'country_id' => $this->directoryHelper->getDefaultCountry()
            ), 'shipping');
        }

        if ($billing) {
            $this->quoteAssignAddress(array(
                'country_id' => $this->directoryHelper->getDefaultCountry()
            ), 'billing');
        }

        return $this;
    }

    /**
     * Assign address information to quote object.
     *
     * @param array $data
     * @param string $type
     * @return $this
     * @throws Exception
     */
    public function quoteAssignAddress(array $data, $type)
    {
        $this->quoteValidateAddressType($type);

        // Create empty address objects if they are missing.
        $this->quoteCreateMissingAddressObject($type);

        if ($type === 'billing') {
            $this->getQuote()->getBillingAddress()->addData($data);
        } else {
            $this->getQuote()->getShippingAddress()->addData($data);
        }

        $this->quoteRepository->save($this->getQuote());

        return $this;
    }

    /**
     * Assign a clean \Magento\Quote\Model\Quote\Address instance to quote billing/shipping address if needed.
     *
     * TODO: could be more compact
     *
     * @param string $type (billing|shipping)
     * @return $this
     * @throws Exception
     */
    public function quoteCreateMissingAddressObject($type)
    {
        $this->quoteValidateAddressType($type);

        if ($type === 'billing') {
            if (!$this->getQuote()->getBillingAddress()) {
                $this->getQuote()->setBillingAddress($this->objectManager->create('Magento\Quote\Model\Quote\Address'));
            }
        } else {
            if (!$this->getQuote()->getShippingAddress()) {
                $this->getQuote()->setShippingAddress($this->objectManager->create('Magento\Quote\Model\Quote\Address'));
            }
        }

        return $this;
    }

    /**
     * Validate address type, should be either billing or shipping.
     *
     * @param string $type
     * @return bool
     * @throws Exception
     */
    public function quoteValidateAddressType(&$type)
    {
        $type = (string) $type;

        if ($type !== 'billing' && $type !== 'shipping') {
            throw new Exception("Invalid address type provided.");
        }

        return true;
    }

    /**
     * Return collection of available shipping methods based on quote information.
     *
     * @return \Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection
     */
    public function getShippingRatesCollection()
    {
        return $this->getQuote()->getShippingAddress()->getAllShippingRates();
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
     * Render checkout elements (useful for return values from AJAX calls).
     *
     * @param Mage_Core_Model_Layout $layout
     * @param bool $onlyUpdated
     * @return array
     */
    public function renderCheckoutElements(Mage_Core_Model_Layout $layout, $onlyUpdated = true)
    {
        $result = array();

        if (!$this->legacySetup()) {
            $result['header-cart'] = $this->renderCheckoutElementMiniCart($layout, $onlyUpdated);
        }

        $result['omnicheckout-shipping-methods-list'] = $this->renderCheckoutElementShippingMethods($layout, $onlyUpdated);
        $result['current-coupon-code'] = $this->renderCheckoutElementCurrentCoupon($layout, $onlyUpdated);

        foreach ($result as $id => $el) {
            if (is_null($el)) {
                unset($result[$id]);
            }
        }

        return $result;
    }

    /**
     * Render mini-cart element.
     *
     * @param Mage_Core_Model_Layout $layout
     * @param bool $onlyUpdated
     * @return null|string
     */
    public function renderCheckoutElementMiniCart(Mage_Core_Model_Layout $layout, $onlyUpdated = true)
    {
        // Render mini-cart element.
        $result = $layout->getBlock('minicart_content')->toHtml();

        if ($onlyUpdated && !$this->blockHasChanged($result, 'header-cart')) {
            $result = null;
        }

        return $result;
    }

    /**
     * Render element displaying currently applied coupon code.
     *
     * @param Mage_Core_Model_Layout $layout
     * @param bool $onlyUpdated
     * @return null|string
     * @todo This should be able to function more like renderCheckoutElementMiniCart() but it does not right now. Figure out why when there is time.
     */
    public function renderCheckoutElementCurrentCoupon(Mage_Core_Model_Layout $layout, $onlyUpdated = true)
    {
        $result = null;

        /** @var Resursbank_Omnicheckout_Block_Coupon $block */
        $block = Mage::getBlockSingleton('omnicheckout/coupon');

        if ($block) {
            // Render element.
            $result = $block->toHtml();

            if ($onlyUpdated && !$this->blockHasChanged($result, 'current-coupon-code')) {
                $result = null;
            }
        }

        return $result;
    }

    /**
     * Render shipping methods block displayed at checkout.
     *
     * @param Mage_Core_Model_Layout $layout
     * @param bool $onlyUpdated
     * @return null|string
     * @throws Mage_Core_Exception
     * @todo This should be able to function more like renderCheckoutElementMiniCart() but it does not right now. Figure out why when there is time.
     */
    public function renderCheckoutElementShippingMethods(Mage_Core_Model_Layout $layout, $onlyUpdated = true)
    {
        $result = null;

        /** @var Mage_Checkout_Block_Onepage_Shipping_Method_Available $block */
        $block = Mage::getBlockSingleton('checkout/onepage_shipping_method_available');

        if ($block) {
            // Set template.
            $block->setTemplate('checkout/onepage/shipping_method/available.phtml');

            // Render element.
            $result = $block->toHtml();

            if ($onlyUpdated && !$this->blockHasChanged($result, 'omnicheckout-shipping-methods-list')) {
                $result = null;
            }
        }

        return $result;
    }
    
}
