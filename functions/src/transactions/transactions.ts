import * as admin from 'firebase-admin';
import {Request} from 'firebase-functions/lib/providers/https';
import {RecurringTransactions} from '../recurring-transactions/recurring-transactions';

export interface TransactionsModel {
    amount: number;
    interval: number;
    endDate: string;
    label: string;
    repeat: string;
    startDate: string;
    type: string;
    remarks: string;
    userUid: string;
    id: string;
}

export class Transactions {

    private firestore = admin.firestore();
    private recurringTransactions: RecurringTransactions = new RecurringTransactions();

    add(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = request.body;
        if (this.isValidate(model)) {
            const documentRef = this.firestore.collection('transactions').doc();

            const amount = Number(model.amount);
            const interval = Number(model.interval);
            const endDate = model.endDate.toString();
            const label = model.label.toString();
            const repeat = model.repeat.toString();
            const startDate = model.startDate.toString();
            const type = model.type.toString();
            const remarks = model.remarks.toString();
            const userUid = model.userUid.toString();

            documentRef.create({amount, interval, endDate, label, repeat, startDate, type, userUid, remarks}).then(function() {
                const responseObject = {color: 'success', message: 'transaction have been saved.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while saving transaction.', duration: 2000};
                console.error(responseObject);
                response.send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid transaction details.', duration: 2000};
            console.error(responseObject);
            response.send(responseObject);
        }
    }

    remove(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = request.body;
        if (model.id && model.id.length > 0) {
            this.firestore.doc('transactions/' + request.body.id).delete().then(function() {
                const responseObject = {color: 'success', message: 'transaction have been deleted.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while deleting transaction.', duration: 2000};
                console.error(responseObject);
                response.send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid transaction id.', duration: 2000};
            console.error(responseObject);
            response.send(responseObject);
        }
    }

    get(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        if (request.query.userUid && request.query.userUid.length > 0) {
            this.firestore.collection('transactions').where('userUid', '==', request.query.userUid).get().then(
                (snapshot) => {
                    const responseObject = snapshot.docs.map(doc => {
                        const transaction = {...doc.data(), id: doc.id};
                        const breakups = this.recurringTransactions.getTransactionBreakups(transaction);
                        return ({...doc.data(), id: doc.id, breakups});
                    });
                    response.send(responseObject);
                }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while getting transactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid userUid.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }
    }

    getTransactionBreakups(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = request.query;
        if (model.id && model.id.length > 0) {
            this.firestore.doc('transactions/' + model.id).get().then((snapshot) => {
                const transaction = {...snapshot.data(), id: snapshot.id};
                const breakups: any[] = this.recurringTransactions.getTransactionBreakups(transaction);
                response.send(breakups);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while getting transaction.', duration: 2000};
                console.error(responseObject);
                response.send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid transaction id.', duration: 2000};
            console.error(responseObject);
            response.send(responseObject);
        }
    }

    getByMonth(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        if (
            (request.query.userUid && request.query.userUid.length > 0) &&
            (request.query.month && request.query.month.length > 0) &&
            (request.query.type && request.query.type.length > 0) &&
            (request.query.year && request.query.year.length > 0)
        ) {
            this.firestore.collection('transactions')
                .where('userUid', '==', request.query.userUid)
                .where('type', '==', request.query.type)
                .get().then(
                (snapshot) => {
                    const month = Number(request.query.month);
                    const year = Number(request.query.year);
                    let responseObject: any[] = [];
                    snapshot.docs.forEach(doc => {
                        const transaction = {...doc.data(), id: doc.id};
                        const breakups: any[] = this.recurringTransactions.getTransactionBreakups(transaction).filter(d => {
                            const _month = Number(d.dueOn.split('-')[0]);
                            const _year = Number(d.dueOn.split('-')[2]);
                            return ((month === _month) && (_year === year));
                        });
                        responseObject = [...responseObject, ...breakups];
                    });
                    response.send(responseObject);
                }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while getting transactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid userUid.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }
    }

    update(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = JSON.parse(JSON.stringify(request.body));
        if (
            (model.id && model.id.length > 0) &&
            this.isValidate(model)
        ) {
            delete model.id;
            const amount = Number(model.amount);
            const interval = Number(model.interval);
            const endDate = model.endDate.toString();
            const label = model.label.toString();
            const repeat = model.repeat.toString();
            const startDate = model.startDate.toString();
            const type = model.type.toString();
            const remarks = model.remarks.toString();
            const userUid = model.userUid.toString();
            this.firestore.doc('transactions/' + request.body.id).update({
                amount,
                interval,
                endDate,
                label,
                repeat,
                startDate,
                type,
                remarks,
                userUid
            }).then(function() {
                const responseObject = {color: 'success', message: 'transaction have been updated.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while updating transaction.', duration: 2000};
                console.error(responseObject);
                response.send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid transaction details.', duration: 2000};
            console.error(responseObject);
            response.send(responseObject);
        }
    }

    isValidate(model: TransactionsModel) {
        return (
            (model.amount && model.amount > 0) &&
            (model.interval && model.interval > 0) &&
            (model.endDate && model.endDate.length > 0) &&
            (model.label && model.label.length > 0) &&
            (model.repeat && model.repeat.length > 0) &&
            (model.startDate && model.startDate.length > 0) &&
            (model.remarks && model.remarks.length > 0) &&
            (model.type && model.type.length > 0) &&
            (model.userUid && model.userUid.length > 0)
        );
    }
}