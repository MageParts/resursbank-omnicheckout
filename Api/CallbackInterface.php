<?php

namespace Resursbank\OmniCheckout\Api;

interface CallbackInterface
{

    /**
     * @return boolean
     */
    public function unfreeze();

    /**
     * @return boolean
     */
    public function booked();

    /**
     * @return boolean
     */
    public function finalization();

    /**
     * @return boolean
     */
    public function automaticFraudControl();

    /**
     * @return boolean
     */
    public function annulment();

    /**
     * @return boolean
     */
    public function update();

}
