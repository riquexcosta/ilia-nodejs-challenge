const transactionService = require('../services/TransactionService');
const { AppError } = require('../errors');

class TransactionController {
  /**
   * Creates a new transaction
   * POST /transactions
   */
  async createTransaction(req, res, next) {
    try {
      const { user_id, type, amount } = req.body;

      const transaction = await transactionService.createTransaction(
        user_id,
        type,
        amount
      );

      // Return in the expected API format
      res.status(200).json({
        id: transaction.id,
        user_id: req.body.user_id,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lists user transactions
   * GET /transactions?type=CREDIT|DEBIT
   */
  async getTransactions(req, res, next) {
    try {
      const { type } = req.query;
      const userId = req.user?.userId || req.user?.id;

      const transactions = await transactionService.getTransactions(userId, type);

      // Format response according to schema
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      }));

      res.status(200).json(formattedTransactions);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Returns user consolidated balance
   * GET /balance
   */
  async getBalance(req, res, next) {
    try {
      const userId = req.user?.userId || req.user?.id;

      const balance = await transactionService.getBalance(userId);

      res.status(200).json({
        amount: parseInt(balance),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Creates a new transaction (internal route)
   * POST /internal/transactions
   * Receives internal call from other services
   */
  async createTransactionInternal(req, res, next) {
    try {
      const { userId, type, amount, description } = req.body;

      const transaction = await transactionService.createTransaction(
        userId,
        type,
        amount
      );

      // Return in the expected API format
      res.status(200).json({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lists user transactions (internal route)
   * GET /internal/transactions
   * Receives internal call from other services
   */
  async getTransactionsInternal(req, res, next) {
    try {
      const { userId, type } = req.query;

      if (!userId) {
        throw new AppError('userId is required', 400);
      }

      const transactions = await transactionService.getTransactions(userId, type);

      // Format response according to schema
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: parseInt(transaction.amount),
      }));

      res.status(200).json(formattedTransactions);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Returns user consolidated balance (internal route)
   * GET /internal/balance
   * Receives internal call from other services
   */
  async getBalanceInternal(req, res, next) {
    try {
      const { userId } = req.query;

      if (!userId) {
        throw new AppError('userId is required', 400);
      }

      const balance = await transactionService.getBalance(userId);

      res.status(200).json({
        amount: parseInt(balance),
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TransactionController();

