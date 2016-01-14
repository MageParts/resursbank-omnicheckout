<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace MageParts\RequireLogin\Model\Backend;

use Magento\Config\Model\Config\Backend\Serialized\ArraySerialized;
use Magento\Framework\Exception\LocalizedException;

class UrlExceptions extends ArraySerialized
{

    /**
     * Validate value
     *
     * @return $this
     * @throws LocalizedException
     * if there is no field value, search value is empty or regular expression is not valid
     */
    public function beforeSave()
    {
        // For value validations
        $exceptions = $this->getValue();

        foreach ($exceptions as $rowKey => $row) {
            if ($rowKey === '__empty') {
                continue;
            }

            // Ensure all required keys are available for this value row.
            $this->validateRowKeys($row);

            // Ignore entries with an empty URL as they mean nothing.
            if (!strlen($row['url'])) {
                unset($exceptions[$rowKey]);
                continue;
            }
        }

        $this->setValue($exceptions);

        return parent::beforeSave();
    }

    /**
     * Ensure value row contain all required keys.
     *
     * @param $row
     * @return $this
     * @throws LocalizedException
     */
    private function validateRowKeys($row)
    {
        foreach (['url', 'validation'] as $fieldName) {
            if (!isset($row[$fieldName])) {
                throw new LocalizedException(__('Exception does not contain field \'%1\'', $fieldName));
            }
        }

        return $this;
    }

//    /**
//     * Composes regexp by user entered value
//     *
//     * @param string $search
//     * @return string
//     * @throws LocalizedException on invalid regular expression
//     */
//    protected function _composeRegexp($search)
//    {
//        // If valid regexp entered - do nothing
//        if (@preg_match($search, '') !== false) {
//            return $search;
//        }
//
//        // Find out - whether user wanted to enter regexp or normal string.
//        if ($this->_isRegexp($search)) {
//            throw new LocalizedException(__('Invalid regular expression: "%1".', $search));
//        }
//
//        return '/' . preg_quote($search, '/') . '/i';
//    }
//
//    /**
//     * Checks search string, whether it was intended to be a regexp or normal search string
//     *
//     * @param string $search
//     * @return bool
//     */
//    protected function _isRegexp($search)
//    {
//        if (strlen($search) < 3) {
//            return false;
//        }
//
//        $possibleDelimiters = '/#~%';
//        // Limit delimiters to reduce possibility, that we miss string with regexp.
//
//        // Starts with a delimiter
//        if (strpos($possibleDelimiters, $search[0]) !== false) {
//            return true;
//        }
//
//        // Ends with a delimiter and (possible) modifiers
//        $pattern = '/[' . preg_quote($possibleDelimiters, '/') . '][imsxeADSUXJu]*$/';
//        if (preg_match($pattern, $search)) {
//            return true;
//        }
//
//        return false;
//    }

}
