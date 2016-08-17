<?php

namespace Resursbank\OmniCheckout\Api;

interface DiscountManagementInterface
{

    /**
     * Apply discount code.
     *
     * @param string $code
     * @return string JSON
     */
    public function apply($code);

}
