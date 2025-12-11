const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateInternalToken } = require('../middleware/auth');
const { 
  validateCreateTransaction,
  validateCreateTransactionInternal,
  validateGetTransactions,
  validateGetTransactionsInternal,
  validateGetBalance
} = require('../middleware/validators');
const transactionController = require('../controllers/TransactionController');

// External routes (client-facing)
router.post(
  '/transactions',
  authenticateToken,
  ...validateCreateTransaction,
  transactionController.createTransaction.bind(transactionController)
);

router.get(
  '/transactions',
  authenticateToken,
  ...validateGetTransactions,
  transactionController.getTransactions.bind(transactionController)
);

router.get(
  '/balance',
  authenticateToken,
  transactionController.getBalance.bind(transactionController)
);

// Internal routes (service-to-service communication)
router.post(
  '/internal/transactions',
  authenticateInternalToken,
  ...validateCreateTransactionInternal,
  transactionController.createTransactionInternal.bind(transactionController)
);

router.get(
  '/internal/transactions',
  authenticateInternalToken,
  ...validateGetTransactionsInternal,
  transactionController.getTransactionsInternal.bind(transactionController)
);

router.get(
  '/internal/balance',
  authenticateInternalToken,
  ...validateGetBalance,
  transactionController.getBalanceInternal.bind(transactionController)
);

module.exports = router;

