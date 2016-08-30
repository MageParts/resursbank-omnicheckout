<?php
/**
 * Created by PhpStorm.
 * User: Bossehasse
 * Date: 09/08/16
 * Time: 11:48
 */

namespace Resursbank\OmniCheckout\Helper;

use Exception;

class Callback extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var \Resursbank\OmniCheckout\Model\Api
     */
    private $apiModel;

    /**
     * @var \Magento\Sales\Model\OrderRepository
     */
    private $orderRepository;
    /**
     * @var \Magento\Sales\Model\OrderFactory
     */
    private $orderFactory;

    /**
     * Callback constructor.
     *
     * @param \Magento\Framework\App\Helper\Context $context
     * @param \Resursbank\OmniCheckout\Model\Api $apiModel
     * @param \Magento\Sales\Model\OrderRepository $orderRepository
     * @param \Magento\Sales\Model\OrderFactory $orderFactory
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Resursbank\OmniCheckout\Model\Api $apiModel,
        \Magento\Sales\Model\OrderRepository $orderRepository,
        \Magento\Sales\Model\OrderFactory $orderFactory
    ) {
        $this->apiModel = $apiModel;
        $this->orderRepository = $orderRepository;
        $this->orderFactory = $orderFactory;

        parent::__construct($context);
    }

    /**
     * Returns a list of all registered callbacks.
     *
     * @return array
     */
    public function getCallbacks()
    {
        return $this->apiModel->hasCredentials() ? $this->apiModel->getCallbacks() : [];
    }

    /**
     * TODO: We should use the order repository instead, however that doesn't support loading entities by any column
     * TODO: except their prim key right now.
     *
     * @return \Magento\Sales\Model\Order
     * @throws Exception
     */
    public function getOrderFromRequest()
    {
        $token =  $this->_request->getParam('paymentId');

        if (empty($token)) {
            throw new Exception('No order token supplied.');
        }

        /** @var \Magento\Sales\Model\Order $order */
        $order = $this->orderFactory->create();
        $order->loadByAttribute('resursbank_token', $token);

        if (!$order->getId()) {
            throw new Exception('Failed to locate referenced order.');
        }

        return $order;
    }

    /**
     * Add order comment.
     *
     * @param \Magento\Sales\Model\Order $order
     * @param string $comment
     * @throws Exception
     */
    public function addOrderComment(\Magento\Sales\Model\Order $order, $comment)
    {
        if (!is_string($comment)) {
            throw new Exception('Comment must be strings.');
        }

        $order->addStatusHistoryComment($comment, false);

        $this->orderRepository->save($order);
    }

    /**
     * Cancel order.
     *
     * @param \Magento\Sales\Model\Order $order
     * @return $this
     */
    public function annulOrder(\Magento\Sales\Model\Order $order)
    {
        // Mark order as cancelled.
        $order->cancel();

        // Save order.
        $this->orderRepository->save($order);

        return $this;
    }

}