<?php

namespace Resursbank\OmniCheckout\Model\Payment;

/**
 * Card.
 */
class Card extends \Resursbank\OmniCheckout\Model\Payment\Standard
{

    const PAYMENT_METHOD_RESURSBANK_CARD_CODE = 'resursbank_card';

    /**
     * Payment method code.
     *
     * @var string
     */
    protected $_code = self::PAYMENT_METHOD_RESURSBANK_CARD_CODE;

}
