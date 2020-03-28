import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {Transactions} from './transactions/transactions';
import {SettledTransactions} from './settled-transactions/settled-transactions';

admin.initializeApp();

/**
 * Transactions
 * */
const transactions: Transactions = new Transactions();
export const addNewTransaction = functions.https.onRequest(transactions.add.bind(transactions));
export const getTransactions = functions.https.onRequest(transactions.get.bind(transactions));
export const deleteTransaction = functions.https.onRequest(transactions.remove.bind(transactions));
export const updateTransaction = functions.https.onRequest(transactions.update.bind(transactions));

/**
 * settledTransactions
 * */
const settledTransactions: SettledTransactions = new SettledTransactions();
export const addNewSettledTransaction = functions.https.onRequest(settledTransactions.add.bind(settledTransactions));
export const getSettledTransactions = functions.https.onRequest(settledTransactions.get.bind(settledTransactions));
export const deleteSettledTransaction = functions.https.onRequest(settledTransactions.remove.bind(settledTransactions));
export const updateSettledTransaction = functions.https.onRequest(settledTransactions.update.bind(settledTransactions));