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
                'label' => __('Regex (simplified)')
            ],
            [
                'value' => 'regex_pure',
                'label' => __('Regex (advanced)')
            ]
        ];
    }

}
