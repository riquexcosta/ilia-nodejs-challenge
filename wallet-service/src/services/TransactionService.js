const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { sequelize } = require('../database');
const { QueryTypes } = require('sequelize');
const { InsufficientBalanceError } = require('../errors');

class TransactionService {
  /**
   * Creates a new transaction
   * Uses SQL transaction to ensure atomicity and prevent double credit/debit
   * @param {string} userId - User ID
   * @param {string} type - Transaction type (CREDIT or DEBIT)
   * @param {number} amount - Transaction amount
   * @returns {Promise<Transaction>}
   */
  async createTransaction(userId, type, amount) {
    // Use SQL transaction to ensure atomicity
    return await sequelize.transaction(async (t) => {
      // Find wallet with lock (SELECT FOR UPDATE) to prevent race conditions
      let wallet = await Wallet.findOne({ 
        where: { userId },
        lock: true,
        transaction: t
      });
      
      if (!wallet) {
        // If wallet doesn't exist, create one with initial balance 0
        wallet = await Wallet.create({
          userId,
          balance: 0,
        }, { transaction: t });
      }

      // Validate balance before processing debit
      if (type.toUpperCase() === 'DEBIT') {
        const currentBalance = parseFloat(wallet.balance);
        if (currentBalance < parseFloat(amount)) {
          throw new InsufficientBalanceError();
        }
      }

      // Create the transaction
      const transaction = await Transaction.create({
        walletId: wallet.id,
        type: type.toUpperCase(),
        amount,
      }, { transaction: t });

      // Update wallet balance
      if (type.toUpperCase() === 'CREDIT') {
        wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
      } else if (type.toUpperCase() === 'DEBIT') {
        wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
      }
      
      await wallet.save({ transaction: t });

      return transaction;
    });
  }

  /**
   * Lists user transactions with optional type filter
   * @param {string} userId - User ID
   * @param {string} type - Optional type to filter (CREDIT or DEBIT)
   * @returns {Promise<Transaction[]>}
   */
  async getTransactions(userId, type = null) {
    // Find user wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      return [];
    }

    const whereClause = { walletId: wallet.id };
    
    if (type) {
      whereClause.type = type.toUpperCase();
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    return transactions;
  }

  /**
   * Calculates the consolidated balance from transactions
   * Uses SQL query to calculate directly in the database (as per requirements)
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getBalance(userId) {
    // Find user wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      return 0;
    }

    // Single aggregation query to avoid multiple round-trips
    const result = await sequelize.query(
      `
        SELECT COALESCE(SUM(
          CASE 
            WHEN type = 'CREDIT' THEN amount 
            WHEN type = 'DEBIT' THEN -amount 
            ELSE 0
          END
        ), 0) AS balance
        FROM transactions
        WHERE wallet_id = :walletId
      `,
      {
        replacements: { walletId: wallet.id },
        type: QueryTypes.SELECT,
      }
    );

    return parseFloat(result[0]?.balance || 0);
  }
}

module.exports = new TransactionService();

