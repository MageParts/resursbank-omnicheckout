<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Invoice.
 */
class Invoice extends \Resursbank\OmniCheckout\Model\Payment\Standard
{

    const PAYMENT_METHOD_RESURSBANK_INVOICE_CODE = 'resursbank_invoice';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_INVOICE_CODE;

}
