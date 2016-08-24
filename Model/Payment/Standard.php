<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Standard payment method, when the request Resursbank method is not implemented.
 */
class Standard extends \Magento\Payment\Model\Method\AbstractMethod
{
    
    const PAYMENT_METHOD_RESURSBANK_STANDARD_CODE = 'default';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_STANDARD_CODE;

    /**
     * Availability option.
     *
     * @var bool
     */
    protected $_isOffline = true;

}
