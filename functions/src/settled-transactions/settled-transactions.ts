import * as admin from 'firebase-admin';
import {Request} from 'firebase-functions/lib/providers/https';

export interface TransactionsModel {
    date: string;
    isSettled: boolean;
    transactionsKey: string;
    id: string;
}

export class SettledTransactions {

    private firestore = admin.firestore();
    private tableName = 'settledTransactions';

    add(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = request.body;
        if (this.isValidate(model)) {
            const documentRef = this.firestore.collection(this.tableName).doc();
            documentRef.create(request.body).then(function() {
                const responseObject = {color: 'success', message: 'settledTransactions have been saved.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while saving settledTransactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid settledTransactions details.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }
    }

    remove(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        const model: TransactionsModel = request.body;
        if (model.id && model.id.length > 0) {
            this.firestore.doc(this.tableName + '/' + request.body.id).delete().then(function() {
                const responseObject = {color: 'success', message: 'settledTransactions have been deleted.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while deleting settledTransactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid settledTransactions id.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }
    }

    get(request: Request, response: any) {
        response.set('Access-Control-Allow-Origin', '*');
        if (request.query.transactionsKey && request.query.transactionsKey.length > 0) {
            this.firestore.collection(this.tableName).where('transactionsKey', '==', request.query.transactionsKey).get().then(function(snapshot) {
                const responseObject = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while getting transactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        }else{
            const responseObject = {color: 'warning', message: 'please provide valid transactionsKey.', duration: 2000};
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
            this.firestore.doc(this.tableName + '/' + request.body.id).update(model).then(function() {
                const responseObject = {color: 'success', message: 'settledTransactions have been updated.', duration: 2000};
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while updating settledTransactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        } else {
            const responseObject = {color: 'warning', message: 'please provide valid settledTransactions details.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }
    }

    isValidate(model: TransactionsModel) {
        return (
            (model.hasOwnProperty('date') && model.date.length > 0) &&
            (model.hasOwnProperty('isSettled')) &&
            (model.hasOwnProperty('transactionsKey') && model.transactionsKey.length > 0)
        );
    }
}