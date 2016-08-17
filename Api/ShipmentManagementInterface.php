<?php

namespace Resursbank\OmniCheckout\Api;

interface ShipmentManagementInterface
{

    /**
     * Set shipping method.
     *
     * @param string $code
     * @return string JSON
     */
    public function setMethod($code);

}
