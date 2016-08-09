<?php

namespace Resursbank\OmniCheckout\Model;

use Exception;
use \Magento\Framework\DataObject;
use stdClass;

class Api extends DataObject
{

    /**
     * Name of error log file.
     */
    const ERROR_LOG = 'resurs_api.log';

    /**
     * Test API URL.
     */
    const TEST_URL = 'https://omnitest.resurs.com/';

    /**
     * Production API URL.
     */
    const PRODUCTION_URL = 'https://checkout.resurs.com/';

    /**
     * Key in checkout/session where we store the payment session id provided by the API.
     */
    const PAYMENT_SESSION_ID_KEY = 'omnicheckout_payment_session_id';

    /**
     * Key in checkout/session where we store the resulting iframe provided by the API when we initialize a new session.
     */
    const PAYMENT_SESSION_IFRAME_KEY = 'omnicheckout_payment_session_iframe';

    /**
     * @var \Resursbank\OmniCheckout\Helper\Api
     */
    private $helper;

    /**
     * @var \Magento\Customer\Model\Session
     */
    private $customerSession;

    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    private $storeManager;
    /**
     * @var \Magento\Framework\Event\ManagerInterface
     */
    private $eventManager;

    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @param \Magento\Customer\Model\Session $customerSession
     * @param \Resursbank\OmniCheckout\Helper\Api $helper
     * @param \Magento\Store\Model\StoreManagerInterface $storeManager
     * @param \Magento\Framework\Event\ManagerInterface $eventManager
     * @param \Magento\Checkout\Model\Session $checkoutSession
     * @param array $data
     */
    public function __construct(
        \Magento\Customer\Model\Session $customerSession,
        \Resursbank\OmniCheckout\Helper\Api $helper,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Framework\Event\ManagerInterface $eventManager,
        \Magento\Checkout\Model\Session $checkoutSession,
        array $data = []
    ) {
        parent::__construct($data);

        $this->helper = $helper;
        $this->customerSession = $customerSession;
        $this->storeManager = $storeManager;
        $this->eventManager = $eventManager;
        $this->checkoutSession = $checkoutSession;
    }

    /**
     * Initialize payment session.
     *
     * @return stdClass
     * @throws Exception
     */
    public function initPaymentSession()
    {
        // Collect data submitted in the API request.
        $data = array(
            'orderLines' => $this->getOrderLines(),
            'successUrl' => $this->getSuccessCallbackUrl(),
            'backUrl'    => $this->getFailureCallbackUrl(),
            'shopUrl'    => $this->getShopUrl(),
            'customer'   => $this->getCustomerInformation()
        );

        // Allows observers to modify the data submitted to the API.
        $this->eventManager->dispatch(
            'omnicheckout_api_init_session_before',
            array(
                'data'  => $data,
                'quote' => $this->getQuote()
            )
        );

        // Perform API request.
        $result = $this->call("checkout/payments/{$this->getQuoteToken(true)}", 'post', $data);

        // Allows observers to perform actions based on API response.
        $this->eventManager->dispatch(
            'omnicheckout_api_init_session_after',
            array(
                'data'      => $data,
                'response'  => $result,
                'quote'     => $this->getQuote()
            )
        );

        // Handle API response.
        $result = @json_decode($result);

        if (!is_object($result) || !isset($result->paymentSessionId) || !isset($result->html)) {
            throw new Exception(__('Failed to create payment session, unexpected return value.'));
        }

        $this->checkoutSession->setData(self::PAYMENT_SESSION_ID_KEY, $result->paymentSessionId);
        $this->checkoutSession->setData(self::PAYMENT_SESSION_IFRAME_KEY, $result->html);

        return $result;
    }

    /**
     * Update existing payment session.
     *
     * @return Zend_Http_Response
     * @throws Exception
     */
    public function updatePaymentSession()
    {
        if (!$this->paymentSessionInitialized()) {
            throw new Exception("Please initialize your payment session before you updating it.");
        }

        $data = array(
            'orderLines' => $this->getOrderLines()
        );

        // Allows observers to modify the data submitted to the API.
        $this->eventManager->dispatch(
            'omnicheckout_api_update_session_before',
            array(
                'data'  => $data,
                'quote' => $this->getQuote()
            )
        );

        // Perform API request.
        $result = $this->call("checkout/payments/{$this->getQuoteToken()}", 'put', $data);

        // Allows observers to perform actions based on API response.
        $this->eventManager->dispatch(
            'omnicheckout_api_update_session_after',
            array(
                'data'      => $data,
                'response'  => $result,
                'quote'     => $this->getQuote()
            )
        );

        return $result;
    }

    /**
     * Perform API call.
     *
     * If it's ever necessary to urlencode data sent to the API please refer to the urlencodeArray() method in
     * Helper\Data.php
     *
     * @param string $action
     * @param string $method (post|put|delete|get)
     * @param string|array $data
     * @return Zend_Http_Response
     * @throws Exception
     * @throws Zend_Http_Client_Exception
     */
    public function call($action, $method, $data = null)
    {
        $this->validateCallMethod($method);

        /** @var Resursbank_Omnicheckout_Model_Rest_Client $client */
        $client = $this->prepareClient();

        try {
            // Perform API call.
            $response = $this->handleCall($client, $method, "/{$action}", $data);
        } catch (Exception $e) {
            // Clear the payment session, ensuring that a new session will be started once the API is reachable again.
            $this->helper->clearPaymentSession();

            // Throw the error forward.
            throw $e;
        }

        // Handle potential errors.
        $this->handleErrors($response);

        return $response->getBody();
    }

    /**
     * Retrieve order lines submitted to the API with initialize / update requests.
     *
     * @return array
     * @throws Exception
     */
    public function getOrderLines()
    {
        $data = $this->getProductLines();

        // Add discount row to order lines.
        $discount = $this->getDiscountLine();

        if (count($discount)) {
            $data[] = $discount;
        }

        // Add shipping cost row to order lines.
        $shipping = $this->getShippingLine();

        if (count($shipping)) {
            $data[] = $shipping;
        }

        return $data;
    }

    /**
     * Retrieve order line for discount amount.
     *
     * @return array
     */
    public function getDiscountLine()
    {
        $result = array();

        $amount = (float) ($this->getQuote()->getSubtotal() - $this->getQuote()->getSubtotalWithDiscount());

        if ($amount > 0) {
            $name = 'Discount';
            $code = (string) $this->getQuote()->getCouponCode();

            if (strlen($code)) {
                $name.= ' (%s)';
            }

            $result = array(
                'artNo'                 => $code ? $code : 'discount',
                'description'           => __($name, array($code)),
                'quantity'              => 1,
                'unitMeasure'           => 'pcs',
                'unitAmountWithoutVat'  => -$amount,
                'vatPct'                => 0
            );
        }

        return $result;
    }

    /**
     * Retrieve order line for shipping amount.
     *
     * @return array
     */
    public function getShippingLine()
    {
        $result = array();

        $amount = (float) $this->getQuote()->getShippingAddress()->getShippingInclTax();

        if ($amount > 0) {
            $result = array(
                'artNo'                 => 'shipping',
                'description'           => __('Shipping'),
                'quantity'              => 1,
                'unitMeasure'           => 'pcs',
                'unitAmountWithoutVat'  => $amount,
                'vatPct'                => $this->getShippingTax()
            );
        }

        return $result;
    }

    /**
     * Retrieve shipping tax percentage from quote.
     *
     * @return float|int
     */
    public function getShippingTax()
    {
        $result = 0;

        $inclTax = (float) $this->getQuote()->getShippingAddress()->getShippingInclTax();
        $exclTax = (float) $this->getQuote()->getShippingAddress()->getShippingAmount();

        if ($inclTax > $exclTax) {
            $result = ((($inclTax / $exclTax) - 1) * 100);
        }

        return $result;
    }

    /**
     * Retrieve array of all order lines in quote.
     *
     * @return array
     * @throws Exception
     */
    public function getProductLines()
    {
        $result = array();

        $items = $this->getQuote()->getAllItems();

        if (!count($items)) {
            throw new Exception(__('No items in shopping cart.'));
        }

        /** @var \Magento\Quote\Model\Quote\Item $item */
        foreach ($items as $item) {
            if ($this->validateProductLine($item)) {
                $result[] = $this->getProductLine($item);
            }
        }

        return $result;
    }

    /**
     * Validate product before including it in product lines sent to Resursbank.
     *
     * @param \Magento\Quote\Model\Quote\Item $item
     * @return array|bool
     */
    public function validateProductLine(\Magento\Quote\Model\Quote\Item $item)
    {
        $result = ((float) $item->getQty() > 0 && !$item->getParentItem());

        if ($item->getProductType() === 'configurable') {
            $result = $item->getChildren();
        }

        return $result;
    }

    /**
     * Convert Mage_Sales_Model_Quote_Item to an order line for the API.
     *
     * @param \Magento\Quote\Model\Quote\Item $item
     * @return array
     */
    public function getProductLine(\Magento\Quote\Model\Quote\Item $item)
    {
        return array(
            'artNo'                 => $item->getSku(),
            'description'           => $item->getName(),
            'quantity'              => (float) $item->getQty(),
            'unitMeasure'           => $this->getApiSetting('weight_unit'),
            'unitAmountWithoutVat'  => (float) $item->getPrice(),
            'vatPct'                => (float) $item->getTaxPercent()
        );
    }

    /**
     * Get a setting from the API configuration.
     *
     * @param string $key
     * @param bool $flag
     * @return mixed
     */
    public function getApiSetting($key, $flag = false)
    {
        $result = '';

        $key = (string) $key;

        if ($key === 'weight_unit') {
            $result = 'kg';
        }

        return $result;

//        return !$flag ? Mage::getStoreConfig("omnicheckout/api/{$key}", $this->_getHelper()->getStoreId()) : Mage::getStoreConfigFlag("omnicheckout/api/{$key}", $this->_getHelper()->getStoreId());
    }

    /**
     * Retrieve customer information used when initializing a payment session.
     *
     * @return array
     */
    public function getCustomerInformation()
    {
        return array(
            'mobile' => $this->getCustomer()->getPrimaryBillingAddress() ? $this->getCustomer()->getPrimaryBillingAddress()->getData('telephone') : null,
            'email'  => $this->getCustomer()->getData('email')
        );
    }

    /**
     * Get the currently logged in customer.
     *
     * @return \Magento\Customer\Model\Customer
     */
    public function getCustomer()
    {
        return $this->customerSession->getCustomer();
    }

    /**
     * Retrieve shop url (used for iframe communication, the return value will be the target origin). Basically this is
     * your Magento websites protocol:domain without any trailing slashes. For example http://www.testing.com
     *
     * @return string
     */
    public function getShopUrl()
    {
        return rtrim($this->storeManager->getStore()->getBaseUrl(), '/');
    }

    /**
     * Prepare API client.
     *
     * @return Resursbank_Omnicheckout_Model_Rest_Client
     * @throws Zend_Http_Client_Exception
     */
    public function prepareClient()
    {
        $client = new Resursbank_Omnicheckout_Model_Rest_Client($this->getApiUrl());
        $client->getHttpClient()->setAuth($this->getUsername(), $this->getPassword());

        return $client;
    }

    /**
     * Validate API request method.
     *
     * @param string $method
     * @return $this
     * @throws Exception
     */
    public function validateCallMethod($method)
    {
        if ($method !== 'get' && $method !== 'put' && $method !== 'post' && $method !== 'delete') {
            throw new Exception(__('Invalid API method requested.'));
        }

        return $this;
    }

    /**
     * Retrieve payment session id.
     *
     * @return string
     * @throws Exception
     */
    public function getPaymentSessionId()
    {
        return (string) $this->checkoutSession->getData(self::PAYMENT_SESSION_ID_KEY);
    }

    /**
     * Retrieve quote token.
     *
     * @param bool $refresh
     * @return int
     * @throws Exception
     */
    public function getQuoteToken($refresh = false)
    {
        if (!$this->getQuote()) {
            throw new Exception(__('Missing quote object.'));
        }

        return $this->helper->getQuoteToken($this->getQuote(), $refresh);
    }

    /**
     * Shorthand to get current quote object.
     *
     * @return \Magento\Quote\Model\Quote
     */
    public function getQuote()
    {
        return $this->helper->getQuote();
    }

    /**
     * Check if a payment session has been initialized.
     *
     * @return bool
     * @throws Exception
     */
    public function paymentSessionInitialized()
    {
        return (bool) $this->getPaymentSessionId();
    }

}
