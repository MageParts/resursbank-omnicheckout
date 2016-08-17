<?php

namespace Resursbank\OmniCheckout\Api;

interface CartItemManagementInterface
{

    /**
     * Set quote item quantity.
     *
     * @param string $itemId
     * @param float $qty
     * @return mixed
     */
    public function setQty($itemId, $qty);
    public function getQty();

}
