<?php

namespace MageParts\RequireLogin\Helper;

use Magento\Framework\App\Helper\AbstractHelper;

class UrlExceptions extends AbstractHelper
{

    /**
     * Get validation types.
     *
     * @return array
     */
    public function getValidationTypes()
    {
        return [
            [
                'value' => 'regex',
                'label' => __('Regex')
            ],
            [
                'value' => 'absolute',
                'label' => __('Absolute')
            ]
        ];
    }

}
