<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Credit card (VISA/MasterCard etc.).
 */
class NetsCard extends \Resursbank\OmniCheckout\Model\Payment\Standard
{

    const PAYMENT_METHOD_RESURSBANK_NETSCARD_CODE = 'netscard';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_NETSCARD_CODE;

}
