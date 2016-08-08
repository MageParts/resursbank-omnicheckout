<?php

namespace Resursbank\OmniCheckout\Setup;

use Magento\Framework\Setup\UpgradeSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;

/**
 * Upgrade the Cms module DB scheme
 */
class UpgradeSchema implements UpgradeSchemaInterface
{
    /**
     * {@inheritdoc}
     */
    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        if (version_compare($context->getVersion(), '1.0.1', '<')) {
            $this->addTokenFields($setup);
        }
    }

    /**
     * Add meta title
     *
     * @param SchemaSetupInterface $setup
     * @return $this
     */
    protected function addMetaTitleField(SchemaSetupInterface $setup)
    {
        $setup->getConnection()->addColumn(
            $setup->getTable('cms_page'),
            'meta_title',
            [
                'type' => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                'length' => 255,
                'nullable' => true,
                'comment' => 'Page Meta Title'
            ]
        );
        return $this;
    }
}
