import * as admin from 'firebase-admin';
import {Request} from 'firebase-functions/lib/providers/https';

export interface TransactionsModel {
    amount: number;
    customRepeat: string;
    customRepeatCount: number;
    endDate: string;
    label: string;
    repeat: string;
    startDate: string;
    type: string;
    userUid: string;
    id: string;
}

export class Transactions {

    private firestore = admin.firestore();

    add(request: Request, response: any) {
        const model: TransactionsModel = request.body;
        if (this.isValidate(model)) {
            const documentRef = this.firestore.collection('transactions').doc();
            documentRef.create(request.body).then(function() {
                const responseObject = {color: 'success', message: 'transaction have been saved.', duration: 2000};
                console.log(responseObject);
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
        const model: TransactionsModel = request.body;
        if (model.id && model.id.length > 0) {
            this.firestore.doc('transactions/' + request.body.id).delete().then(function() {
                const responseObject = {color: 'success', message: 'transaction have been deleted.', duration: 2000};
                console.log(responseObject);
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
        // userUid
        if (request.query.userUid && request.query.userUid.length > 0) {
            this.firestore.collection('transactions').where('userUid', '==', request.query.userUid).get().then(function(snapshot) {
                const responseObject = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                console.log(responseObject);
                response.send(responseObject);
            }).catch(function(error) {
                const responseObject = {error, color: 'danger', message: 'error while getting transactions.', duration: 2000};
                console.error(responseObject);
                response.status(500).send(responseObject);
            });
        }else{
            const responseObject = {color: 'warning', message: 'please provide valid userUid.', duration: 2000};
            console.error(responseObject);
            response.status(500).send(responseObject);
        }

        /*this.firestore.collection('transactions').get().then(function(snapshot) {
            const responseObject = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            console.log(responseObject);
            response.send(responseObject);
        }).catch(function(error) {
            const responseObject = {error, color: 'danger', message: 'error while getting transactions.', duration: 2000};
            console.error(responseObject);
            response.send(responseObject);
        });*/
    }

    update(request: Request, response: any) {
        const model: TransactionsModel = JSON.parse(JSON.stringify(request.body));
        if (
            (model.id && model.id.length > 0) &&
            this.isValidate(model)
        ) {
            delete model.id;
            this.firestore.doc('transactions/' + request.body.id).update(model).then(function() {
                const responseObject = {color: 'success', message: 'transaction have been updated.', duration: 2000};
                console.log(responseObject);
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
            (model.customRepeat && model.customRepeat.length > 0) &&
            (model.customRepeatCount && model.customRepeatCount >= 0) &&
            (model.endDate && model.endDate.length > 0) &&
            (model.label && model.label.length > 0) &&
            (model.repeat && model.repeat.length > 0) &&
            (model.startDate && model.startDate.length > 0) &&
            (model.type && model.type.length > 0) &&
            (model.userUid && model.userUid.length > 0)
        );
    }
}