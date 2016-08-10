<?php
/**
 * Created by PhpStorm.
 * User: Bossehasse
 * Date: 10/08/16
 * Time: 10:38
 */

namespace Resursbank\OmniCheckout\Block\Adminhtml\System\Config\Callback;


class Registration extends \Magento\Config\Block\System\Config\Form\Field
{

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param array $data
     * @internal param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    /**
     * Remove scope label
     *
     * @param  \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        $element->unsScope()->unsCanUseWebsiteValue()->unsCanUseDefaultValue();
        return parent::render($element);
    }

    /**
     * Get the button and scripts contents
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        $this->setElement($element);

        return $this->getLayout()
            ->createBlock('Magento\Backend\Block\Widget\Button')
            ->setType('button')
            ->setClass('scalable')
            ->setLabel(__('Update callbacks'))
            ->setOnClick("setLocation('" . $this->getUrl('omnicheckout/index/registration') . "')")
            ->toHtml();
    }

}