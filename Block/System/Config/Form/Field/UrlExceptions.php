<?php

namespace MageParts\RequireLogin\Block\System\Config\Form\Field;

use Magento\Config\Block\System\Config\Form\Field\FieldArray\AbstractFieldArray;

/**
 * URL exceptions widget renderer.
 */
class UrlExceptions extends AbstractFieldArray
{
    /**
     * @var \Magento\Framework\Data\Form\Element\Factory
     */
    private $_elementFactory;

    /**
     * @var \Magento\Framework\View\Design\Theme\LabelFactory
     */
    private $_labelFactory;

    /**
     * @var \MageParts\RequireLogin\Helper\UrlExceptions
     */
    private $urlExceptionHelper;

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Magento\Framework\Data\Form\Element\Factory $elementFactory
     * @param \Magento\Framework\View\Design\Theme\LabelFactory $labelFactory
     * @param \MageParts\RequireLogin\Helper\UrlExceptions $urlExceptionHelper
     * @internal param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Magento\Framework\Data\Form\Element\Factory $elementFactory,
        \Magento\Framework\View\Design\Theme\LabelFactory $labelFactory,
        \MageParts\RequireLogin\Helper\UrlExceptions $urlExceptionHelper,
        array $data = []
    ) {
        $this->_elementFactory = $elementFactory;
        $this->_labelFactory = $labelFactory;
        $this->urlExceptionHelper = $urlExceptionHelper;

        parent::__construct($context, $data);
    }

    /**
     * Initialise form fields
     *
     * @return void
     */
    protected function _construct()
    {
        $this->setupColumns()
            ->setupButtons();

        parent::_construct();
    }

    /**
     * Add widget columns (1 column per field type).
     *
     * @return $this
     */
    private function setupColumns()
    {
        $this->addColumn('url', ['label' => __('URL')]);
        $this->addColumn('validation', ['label' => __('Validation')]);

        return $this;
    }

    /**
     * Add widget buttons. To add new rows etc.
     *
     * @return $this
     */
    private function setupButtons()
    {
        $this->_addAfter = false;
        $this->_addButtonLabel = __('Add');

        return $this;
    }

    /**
     * Render widget column.
     *
     * @param string $columnName
     * @return string
     */
    public function renderCellTemplate($columnName)
    {
        return ($columnName === 'validation' && isset($this->_columns[$columnName])) ? $this->renderValidationColumn() : parent::renderCellTemplate($columnName);
    }

    /**
     * Render validation column.
     *
     * @return string
     */
    private function renderValidationColumn()
    {
        /** @var $label \Magento\Framework\View\Design\Theme\Label */
        $label = $this->_labelFactory->create();

        /** @var @var $element \Magento\Framework\Data\Form\Element\AbstractElement */
        $element = $this->_elementFactory->create('select');

        $element->setForm($this->getForm())
            ->setName($this->_getCellInputElementName('validation'))
            ->setHtmlId($this->_getCellInputElementId('<%- _id %>', 'validation'))
            ->setValues($this->urlExceptionHelper->getValidationTypes());

        return str_replace("\n", '', $element->getElementHtml());
    }

}
