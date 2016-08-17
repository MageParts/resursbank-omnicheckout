<?php

namespace Resursbank\OmniCheckout\Api;

interface CartItemManagementInterface
{

    /**
     * Set quote item quantity.
     *
     * @param int $itemId
     * @param float $qty
     * @return string JSON
     */
    public function setItemQty($itemId, $qty);

    /**
     * @param int $itemId
     * @return string JSON
    */
    public function removeItem($itemId);

}
