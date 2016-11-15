<?php
/**
 * Copyright 2016 Resurs Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Resursbank\OmniCheckout\Api;

/**
 * Interface CallbackInterface
 * @package Resursbank\OmniCheckout\Api
 */
interface CallbackInterface
{

    /**
     * @param string$paymentId
     * @return bool
     */
    public function unfreeze($paymentId);

    /**
     * @param string $paymentId
     * @return bool
     */
    public function booked($paymentId);

    /**
     * @param string $paymentId
     * @return bool
     */
    public function finalization($paymentId);

    /**
     * @param string $paymentId
     * @param string $result (FROZEN = failed, THAWED = passed)
     * @return bool
     */
    public function automaticFraudControl($paymentId, $result);

    /**
     * @param string $paymentId
     * @return bool
     */
    public function annulment($paymentId);

    /**
     * @param string $paymentId
     * @return bool
     */
    public function update($paymentId);

}
