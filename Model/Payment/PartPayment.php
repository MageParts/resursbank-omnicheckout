<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Invoice, in part payments.
 */
class PartPayment extends \Resursbank\OmniCheckout\Model\Payment\Standard
{

    const PAYMENT_METHOD_RESURSBANK_PARTPAYMENT_CODE = 'partpayment';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_PARTPAYMENT_CODE;

}
