<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * New card (create new Resursbank card while placing order).
 */
class NewCard extends \Resursbank\OmniCheckout\Model\Payment\Standard
{

    const PAYMENT_METHOD_RESURSBANK_NEWCARD_CODE = 'resursbank_newcard';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_NEWCARD_CODE;

}
