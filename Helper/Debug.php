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

namespace Resursbank\OmniCheckout\Helper;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

/**
 * Class Debug
 *
 * @package Resursbank\OmniCheckout\Helper
 */
class Debug extends \Magento\Framework\App\Helper\AbstractHelper
{

    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $log;

    /**
     * @var \Magento\Framework\App\Filesystem\DirectoryList
     */
    private $directories;

    /**
     * Whether or not debugging is enabled.
     *
     * @var bool
     */
    private $enabled;

    /**
     * @param \Magento\Framework\App\Filesystem\DirectoryList $directories
     * @param \Magento\Framework\App\Helper\Context $context
     */
    public function __construct(
        \Magento\Framework\App\Filesystem\DirectoryList $directories,
        \Magento\Framework\App\Helper\Context $context
    ) {
        $this->context = $context;
        $this->directories = $directories;

        $this->log = new Logger('Resursbank Debug Log');
        $this->log->pushHandler(new StreamHandler($this->directories->getPath('var') . '/log/resursbank_debug.log', Logger::INFO, false));

        parent::__construct($context);
    }

    /**
     * Log info message.
     *
     * @return $this
     */
    public function info($text)
    {
        if ($this->isEnabled()) {
            $this->log->info($this->prepareMessage($text));
        }

        return $this;
    }

    /**
     * Log error message.
     *
     * @return $this
     */
    public function error($text)
    {
        if ($this->isEnabled()) {
            $this->log->error($this->prepareMessage($text));
        }

        return $this;
    }

    /**
     * Prepare message before adding it to a log file.
     *
     * @param mixed $text
     * @return string
     */
    public function prepareMessage($text)
    {
        if (is_array($text)) {
            $text = $this->log->toJson($text);
        }

        return (string) $text;
    }

    /**
     * Check if debugging is enabled.
     *
     * @return bool
     */
    public function isEnabled()
    {
        if (is_null($this->enabled)) {
            $this->enabled = $this->scopeConfig->isSetFlag("omnicheckout/debug/enabled", \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        }

        return (bool) $this->enabled;
    }

}
