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

namespace Resursbank\OmniCheckout\Model;

use Exception;
use \Magento\Framework\DataObject;
use stdClass;

/**
 * TODO: Not sure we need to extend DataObject anymore.
 *
 * Class Api
 * @package Resursbank\OmniCheckout\Model
 */
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
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    private $scopeConfig;

    /**
     * @var \Magento\Framework\UrlInterface
     */
    private $url;

    /**
     * @var \Psr\Log\LoggerInterface
     */
    private $log;

    /**
     * @var \Magento\Framework\Message\ManagerInterface
     */
    private $messages;

    /**
     * @var \Zend\Http\Client
     */
    private $httpClient;

    /**
     * @param \Magento\Customer\Model\Session $customerSession
     * @param \Resursbank\OmniCheckout\Helper\Api $helper
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param \Psr\Log\LoggerInterface $log
     * @param \Magento\Framework\UrlInterface $url
     * @param \Magento\Framework\Message\ManagerInterface $messages
     * @param \Magento\Checkout\Model\Session $checkoutSession
     * @param array $data
     */
    public function __construct(
        \Magento\Customer\Model\Session $customerSession,
        \Resursbank\OmniCheckout\Helper\Api $helper,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Psr\Log\LoggerInterface $log,
        \Magento\Framework\UrlInterface $url,
        \Magento\Framework\Message\ManagerInterface $messages,
        \Magento\Checkout\Model\Session $checkoutSession,
        array $data = []
    ) {
        $this->helper = $helper;
        $this->customerSession = $customerSession;
        $this->checkoutSession = $checkoutSession;
        $this->scopeConfig = $scopeConfig;
        $this->url = $url;
        $this->log = $log;
        $this->messages = $messages;

        parent::__construct($data);
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

        // Perform API request.
        $result = $this->call("checkout/payments/{$this->getQuoteToken(true)}", 'post', $data);

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
     * @return \Zend\Http\Response
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

        // Perform API request.
        return $this->call("checkout/payments/{$this->getQuoteToken()}", 'put', $data);
    }

    /**
     * Retrieve completed payment by quote id.
     *
     * @param $quoteToken
     * @return stdClass
     */
    public function getPayment($quoteToken)
    {
        $result = $this->call("checkout/payments/{$quoteToken}", 'get');

        if (!empty($result)) {
            $result = @json_decode($result);
        }

        return $result;
    }

    /**
     * Delete active payment session.
     *
     * @return \Zend\Http\Response
     */
    public function deletePaymentSession()
    {
        return $this->call("checkout/payments/{$this->getQuoteToken()}", 'delete');
    }

    /**
     * Register all callback methods.
     *
     * @return $this
     */
    public function registerCallbacks()
    {
        // Register all callbacks.
        $this->registerTestCallback();
        $this->registerCallback('unfreeze');
        $this->registerCallback('automatic_fraud_control');
        $this->registerCallback('annulment');
        $this->registerCallback('finalization');
//        $this->registerCallback('update');
        $this->registerCallback('booked');

        return $this;
    }

    /**
     * Register callback configuration.
     *
     * Available callbacks:
     *
     *  UNFREEZE
     *  AUTOMATIC_FRAUD_CONTROL
     *  TEST
     *  ANNULMENT
     *  FINALIZATION
     *  UPDATE
     *  BOOKED
     *
     * TODO: Do not use url->getBaseUrl(), use url->getUrl() instead (this currently retrieves a URL for the
     * TODO: administration panel, hence we changed it for now to getBaseUrl()).
     *
     * @param string $type
     * @return \Zend\Http\Response
     * @todo basic_username and basic_password should be tested (.htpasswd)
     */
    public function registerCallback($type)
    {
        $type = strtolower((string) $type);

        return $this->call($this->getCallbackTypePath($type), 'post', array(
            'uriTemplate' => $this->url->getBaseUrl() . "rest/V1/omnicheckout/order/{$type}",
            'basicAuthUserName' => $this->getCallbackSetting('basic_username'),
            'basicAuthPassword' => $this->getCallbackSetting('basic_password')
        ));
    }

    /**
     * Register test callback. This will only work while we are in test mode.
     *
     * @return $this
     */
    public function registerTestCallback()
    {
        // The test callback should only be registered when we are in test mode.
        if ($this->isInTestMode()) {
            $this->registerCallback('test');
        }

        return $this;
    }

    /**
     * Retrieve callback configuration.
     *
     * Available callbacks:
     *
     *  UNFREEZE
     *  AUTOMATIC_FRAUD_CONTROL
     *  TEST
     *  ANNULMENT
     *  FINALIZATION
     *  UPDATE
     *  BOOKED
     *
     * @param string $type
     * @return \Zend\Http\Response
     */
    public function getCallback($type)
    {
        return $this->call($this->getCallbackTypePath($type), 'get');
    }

    /**
     * Get list of all registered callbacks.
     *
     * @return array
     */
    public function getCallbacks()
    {
        $result = $this->call('callbacks', 'get');

        if (is_string($result) && !empty($result)) {
            $result = @json_decode($result);
        }

        if (!is_array($result)) {
            $result = array();
        }

        return $result;
    }

    /**
     * Retrieve the URL path to a callback on Resursbank servers (the actual callback name should be all uppercase).
     *
     * @param string $type
     * @return string
     */
    public function getCallbackTypePath($type)
    {
        return 'callbacks/' . strtoupper((string) $type);
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
     * @return \Zend\Http\Response
     * @throws Exception
     */
    public function call($action, $method, $data = null)
    {
        $this->validateCallMethod($method);

        try {
            // Perform API call.
            $response = $this->handleCall($method, "/{$action}", $data);
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
     * This method should never be called directly, only through call().
     *
     * @param string $method
     * @param string $path
     * @param string|null $data
     * @return \Zend\Http\Response
     */
    private function handleCall($method, $path, $data = null)
    {
        if (is_null($this->httpClient)) {
            $this->prepareHttpClient();
        }

        $this->httpClient->getUri()->setPath($path);

        return $this->httpClient->setEncType('application/json')
            ->setRawBody(json_encode($data))
            ->setMethod($method)
            ->send();
    }

    /**
     * Prepare API client.
     */
    public function prepareHttpClient()
    {
        $this->httpClient = new \Zend\Http\Client($this->getApiUrl());
        $this->httpClient->setAuth($this->getUsername(), $this->getPassword());
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
     * Retrieve iframe of current payment session from checkout/session.
     *
     * @return string
     */
    public function getSessionIframeHtml()
    {
        return (string) $this->checkoutSession->getData(self::PAYMENT_SESSION_IFRAME_KEY);
    }

    /**
     * Handle errors on response object.
     *
     * @param \Zend\Http\Response $response
     * @return $this
     * @throws Exception
     * @todo Test that logging still works.
     */
    public function handleErrors(\Zend\Http\Response $response)
    {
        if (($response->isClientError() || $response->isServerError()) && $this->getApiSetting('debug_enabled', true)) {
            // Log the error.
            $this->log->debug($response->toString());

            // Get readable error message.
            $error = (string) __('We apologize, an error occurred while communicating with the payment gateway. Please contact us as soon as possible so we can review this problem.');

            // Add error to message stack.
            $this->messages->addErrorMessage($error);

            // Stop script.
            throw new Exception($error);
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

        return $this->hasData('quote_token') ? $this->getData('quote_token') : $this->helper->getQuoteToken($this->getQuote(), $refresh);
    }

    /**
     * Shorthand to get current quote object.
     *
     * @return \Magento\Quote\Model\Quote
     */
    public function getQuote()
    {
        return $this->hasData('quote') ? $this->getData('quote') : $this->helper->getQuote();
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

    /**
     * Get a setting from the API configuration.
     *
     * @param string $key
     * @param bool $flag
     * @return mixed
     */
    public function getApiSetting($key, $flag = false)
    {
        return !$flag ? $this->scopeConfig->getValue("omnicheckout/api/{$key}", \Magento\Store\Model\ScopeInterface::SCOPE_STORE) : $this->scopeConfig->isSetFlag("omnicheckout/api/{$key}", \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    /**
     * Get a setting from the CALLBACK configuration.
     *
     * @param string $key
     * @param bool $flag
     * @return mixed
     */
    public function getCallbackSetting($key, $flag = false)
    {
        return !$flag ? $this->scopeConfig->getValue("omnicheckout/callback/{$key}", \Magento\Store\Model\ScopeInterface::SCOPE_STORE) : $this->scopeConfig->isSetFlag("omnicheckout/callback/{$key}", \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    /**
     * Check if API is in development/test mode.
     *
     * @return bool
     */
    public function isInTestMode()
    {
        return $this->getApiSetting('test_mode');
    }

    /**
     * Retrieve API username.
     *
     * @return string
     */
    public function getUsername()
    {
        return (string) $this->getApiSetting('username');
    }

    /**
     * Retrieve API password.
     *
     * @return string
     */
    public function getPassword()
    {
        return (string) $this->getApiSetting('password');
    }

    /**
     * Retrieve API URL.
     *
     * @param string $action
     * @return string
     */
    public function getApiUrl($action = '')
    {
        return $this->isInTestMode() ? (self::TEST_URL . $action) : (self::PRODUCTION_URL . $action);
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
                'description'           => (string) __($name, array($code)),
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

        $amount = (float) $this->getQuote()->getShippingAddress()->getShippingAmount();

        if ($amount > 0) {
            $result = array(
                'artNo'                 => 'shipping',
                'description'           => (string) __('Shipping'),
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
            'unitMeasure'           => $this->getApiSetting('unit_measure'),
            'unitAmountWithoutVat'  => (float) $item->getPrice(),
            'vatPct'                => $this->getItemTaxPercent($item)
        );
    }

    /**
     * Retrieve item tax percent. Certain product types will not include the tax_percent property, and in those cases
     * we must calculate it manually ((tax_amount / price) * 100).
     *
     * @param \Magento\Quote\Model\Quote\Item $item
     * @return float
     */
    public function getItemTaxPercent(\Magento\Quote\Model\Quote\Item $item)
    {
        $result = 0;

        if ($item->hasTaxPercent()) {
            $result = (float) $item->getTaxPercent();
        } else if ($item->hasTaxAmount() && (float) $item->getTaxAmount() > 0) {
            $result = ((float) $item->getTaxAmount() / (float) $item->getPrice()) * 100;
        }

        return (float) $result;
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
        return rtrim($this->url->getBaseUrl(), '/');
    }

    /**
     * Retrieve iframe protocol:domain. This is used for iframe communication (from JavaScript). This follows the same
     * rules as getShopUrl() above, so no trailing slashes (e.g https://resursbank.com)
     *
     * @return string
     */
    public function getIframeUrl()
    {
        return rtrim($this->getApiUrl(), '/');
    }

    /**
     * Retrieve URL for order success callback from API.
     *
     * @return string
     */
    public function getSuccessCallbackUrl()
    {
        return $this->url->getUrl('checkout/onepage/success');
    }

    /**
     * Retrieve URL for order failure callback from API.
     *
     * @return string
     */
    public function getFailureCallbackUrl()
    {
        return $this->url->getUrl('checkout/onepage/failure');
    }

    /**
     * Check if we have credentials for the API.
     *
     * @return bool
     */
    public function hasCredentials()
    {
        $username = $this->getApiSetting('username');
        $password = $this->getApiSetting('password');

        return (!empty($username) && !empty($password));
    }

}
