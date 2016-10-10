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

namespace Resursbank\OmniCheckout\Block\Adminhtml\Sales\Order\View\Info;

/**
 * Rewrite of Mage_Adminhtml_Block_Sales_Order_View_Info. This class allows us to include custom HTML on the order view
 * in the admin panel.
 *
 * TODO: \Magento\Checkout\Helper\Data is being utilized to format price values. This doesn't seem like the correct
 * TODO: appraoch, we should look for a better way.
 *
 * Class Info
 */
class OmniCheckout extends \Magento\Backend\Block\Template
{

    /**
     * Payment information.
     *
     * @var array
     */
    private $paymentInfo;

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Magento\Framework\Registry
     */
    private $registry;

    /**
     * @var \Magento\Checkout\Helper\Data
     */
    private $checkoutHelper;

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Magento\Framework\Registry $registry
     * @param \Magento\Checkout\Helper\Data $checkoutHelper
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Magento\Framework\Registry $registry,
        \Magento\Checkout\Helper\Data $checkoutHelper,
        array $data = []
    ) {
        $this->apiModel = $apiModel;
        $this->registry = $registry;
        $this->checkoutHelper = $checkoutHelper;

        parent::__construct($context, $data);

        $this->setTemplate('Resursbank_OmniCheckout::sales/order/view/info/omnicheckout.phtml');
    }

    /**
     * Get payment status.
     *
     * @return string
     */
    public function getStatus()
    {
        $result = $this->getPaymentInformation('status');

        if (is_array($result)) {
//            if (count($result)) {
//                foreach ($result as &$word) {
//                    $word = __($word);
//                }
//            }

            $result = implode(', ', $result);
        }

        return (string) $result;
    }

    /**
     * Retrieve order reference.
     *
     * @return string
     */
    public function getPaymentId()
    {
        return $this->getPaymentInformation('id');
    }

    /**
     * Retrieve payment total.
     *
     * @return float
     */
    public function getPaymentTotal()
    {
        return $this->checkoutHelper->formatPrice((float) $this->getPaymentInformation('totalAmount'));
    }

    /**
     * Retrieve payment limit.
     *
     * @return float
     */
    public function getPaymentLimit()
    {
        return $this->checkoutHelper->formatPrice((float) $this->getPaymentInformation('limit'));
    }

    /**
     * Check if payment is frozen.
     *
     * @return bool
     */
    public function isFrozen()
    {
        return ($this->getPaymentInformation('frozen') === true);
    }

    /**
     * Check if payment is fraud marked.
     *
     * @return bool
     */
    public function isFraud()
    {
        return ($this->getPaymentInformation('fraud') === true);
    }

    /**
     * Retrieve full customer name attached to payment.
     *
     * @return mixed
     */
    public function getCustomerName()
    {
        return $this->getCustomerInformation('fullName', true);
    }

    /**
     * Retrieve full customer address attached to payment.
     *
     * @return mixed
     */
    public function getCustomerAddress()
    {
        $street = $this->getCustomerInformation('addressRow1', true);
        $street2 = $this->getCustomerInformation('addressRow2', true);
        $postal = $this->getCustomerInformation('postalCode', true);
        $city = $this->getCustomerInformation('postalArea', true);
        $country = $this->getCustomerInformation('country', true);

        $result = "{$street}<br />";

        if ($street2) {
            $result.= "{$street2}<br />";
        }

        $result.= "{$city}<br />";
        $result.= "{$country} - {$postal}";

        return $result;
    }

    /**
     * Retrieve customer telephone number attached to payment.
     *
     * @return mixed
     */
    public function getCustomerTelephone()
    {
        return $this->getCustomerInformation('telephone');
    }

    /**
     * Retrieve customer email attached to payment.
     *
     * @return mixed
     */
    public function getCustomerEmail()
    {
        return $this->getCustomerInformation('email');
    }

    /**
     * Retrieve customer information from Resursbank payment.
     *
     * @param string $key
     * @param bool $address
     * @return mixed
     */
    public function getCustomerInformation($key = '', $address = false)
    {
        $result = (array) $this->getPaymentInformation('customer');

        if ($address) {
            $result = (is_array($result) && isset($result['address'])) ? (array) $result['address'] : null;
        }

        if (!empty($key)) {
            $result = isset($result[$key]) ? $result[$key] : null;
        }

        return $result;
    }

    /**
     * Retrieve payment information from Resursbank.
     *
     * @param string $key
     * @return mixed|null|stdClass
     */
    public function getPaymentInformation($key = '')
    {
        $result = null;

        $key = (string) $key;

        if (is_null($this->paymentInfo)) {
            $this->paymentInfo = (array) $this->apiModel->getPayment($this->getOrder()->getData('resursbank_token'));
        }

        if (empty($key)) {
            $result = $this->paymentInfo;
        } else if (is_array($this->paymentInfo) && isset($this->paymentInfo[$key])) {
            $result = $this->paymentInfo[$key];
        }

        return $result;
    }

    /**
     * Retrieve order model instance
     *
     * @return \Magento\Sales\Model\Order
     */
    public function getOrder()
    {
        $result = $this->registry->registry('current_order');

        if (!$result) {
            if ($this->_request->getControllerName() === 'order_invoice') {
                /** @var \Magento\Sales\Model\Order\Invoice $invoice */
                $invoice = $this->registry->registry('current_invoice');

                if ($invoice) {
                    $result = $invoice->getOrder();
                }
            } else if ($this->_request->getControllerName() === 'order_creditmemo') {
                /** @var \Magento\Sales\Model\Order\Creditmemo $creditmemo */
                $creditmemo = $this->registry->registry('current_creditmemo');

                if ($creditmemo) {
                    $result = $creditmemo->getOrder();
                }
            } else if ($this->_request->getControllerName() === 'order_shipment') {
                /** @var \Magento\Sales\Model\Order\Shipment $shipment */
                $shipment = $this->registry->registry('current_shipment');

                if ($shipment) {
                    $result = $shipment->getOrder();
                }
            }
        }

        return $result;
    }

}
