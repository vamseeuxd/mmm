import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {MmmService} from '../mmm-service/mmm.service';
import {AlertController} from '@ionic/angular';
import * as _ from 'lodash';

@Component({
    selector: 'app-manage-transaction',
    templateUrl: './manage-transaction.page.html',
    styleUrls: ['./manage-transaction.page.scss'],
})
export class ManageTransactionPage {

    activeTab = 'transaction-details';
    redirectToHome = false;
    public transactionForm: FormGroup;

    masterTransactionData = null;
    masterSettledDate = null;


    constructor(
        public formBuilder: FormBuilder,
        public mmmService: MmmService,
        public alertController: AlertController
    ) {
        this.transactionForm = formBuilder.group({
            label: [this.mmmService.manageTransactionData.label, Validators.required],
            amount: [this.mmmService.manageTransactionData.amount, Validators.required],
            type: [this.mmmService.manageTransactionData.type, Validators.required],
            repeat: [this.mmmService.manageTransactionData.repeat, Validators.required],
            customRepeatCount: [this.mmmService.manageTransactionData.customRepeatCount, Validators.required],
            customRepeat: [this.mmmService.manageTransactionData.customRepeat, Validators.required],
            startDate: [this.mmmService.manageTransactionData.startDate, Validators.required],
            endDate: [this.mmmService.manageTransactionData.endDate, Validators.required],
        });
    }

    ionViewDidEnter() {
        this.masterSettledDate = _.cloneDeep(this.mmmService.settledDate);
        this.masterTransactionData = _.cloneDeep(this.mmmService.manageTransactionData);
        console.log('-------------------------------------------');
        console.log(this.masterTransactionData);
    }

    isDirty() {
        return (
            _.isEqual(this.masterTransactionData, this.mmmService.manageTransactionData) &&
            _.isEqual(this.masterSettledDate, this.mmmService.settledDate)
        );

    }


    getDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
    }

    isSettled(date) {
        const dueData = this.getDate(date);
        return this.mmmService.settledDate[dueData] && this.mmmService.settledDate[dueData].isSettled;
    }

    addSettledTransaction(date, isSettled) {
        const dueData = this.getDate(date);
        if (this.mmmService.settledDate[dueData]) {
            this.mmmService.settledDate[dueData].isSettled = isSettled;
        } else {
            this.mmmService.settledDate[dueData] = {};
            this.mmmService.settledDate[dueData].isSettled = isSettled;
        }
        if (!isSettled && !this.mmmService.settledDate[dueData].hasOwnProperty('key')) {
            delete this.mmmService.settledDate[dueData];
        }
    }

    addTransaction() {
        this.transactionForm.value.userUid = this.mmmService.user.uid;
        this.transactionForm.value.startDate = this.getDate(this.transactionForm.value.startDate);
        this.transactionForm.value.endDate = this.getDate(this.transactionForm.value.endDate);
        this.mmmService.transactionsRef.push(this.transactionForm.value).then(value => {
            this.saveSettledDates(value.key);
        });
    }

    async showSaveConfirmation() {
        const alert = await this.alertController.create({
            header: 'Save Confirmation',
            subHeader: '',
            message: 'Are you sure! Do you want to save Transaction Details?',
            buttons: [
                {
                    text: 'Cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Save & Close',
                    handler: () => {
                        this.redirectToHome = true;
                        this.mmmService.isUpdate ? this.updateTransaction() : this.addTransaction();
                    }
                },
                {
                    text: 'Save & Add New',
                    handler: () => {
                        this.redirectToHome = false;
                        this.mmmService.isUpdate ? this.updateTransaction() : this.addTransaction();
                    }
                }
            ]
        });
        await alert.present();
    }


    async showDeleteConfirmation() {
        const alert = await this.alertController.create({
            header: 'Delete Confirmation',
            subHeader: '',
            message: 'Are you sure! Do you want to Delete Transaction?',
            buttons: [
                {
                    text: 'Cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Delete & Close',
                    handler: () => {
                        this.deleteTransaction(this.mmmService.manageTransactionData.key);
                        this.redirectToHome = true;
                    }
                },
                {
                    text: 'Delete & Add New',
                    handler: () => {
                        this.deleteTransaction(this.mmmService.manageTransactionData.key);
                        this.redirectToHome = false;
                    }
                }
            ]
        });
        await alert.present();
    }

    async showCloseConfirmation() {
        const alert = await this.alertController.create({
            header: 'Close Confirmation',
            subHeader: '',
            message: 'Are you sure! Do you want to Close?',
            buttons: [
                {
                    text: 'No',
                    cssClass: 'secondary'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.mmmService.router.navigate(['/home']);
                    }
                }
            ]
        });
        await alert.present();
    }

    saveSettledDates(transactionsKey) {
        const settledDatesToSave = [];
        Object.keys(this.mmmService.settledDate).forEach(date => {
            const isSettled = this.mmmService.settledDate[date].isSettled;
            if (!isSettled) {
                if (this.mmmService.settledDate[date].hasOwnProperty('key')) {
                    settledDatesToSave.push(this.mmmService.settledTransactionsRef.remove(this.mmmService.settledDate[date]['key']));
                }
            } else if (isSettled) {
                settledDatesToSave.push(this.mmmService.settledTransactionsRef.push({date, transactionsKey, isSettled}));
            }
        });
        if (settledDatesToSave.length > 0) {
            forkJoin(settledDatesToSave).subscribe(value1 => {
                this.mmmService.addNewTransaction();
                this.transactionForm.reset(this.mmmService.manageTransactionData);
                if (this.redirectToHome) {
                    this.mmmService.router.navigate(['/home']);
                    this.activeTab = 'transaction-details';
                }
            });
        } else {
            this.mmmService.addNewTransaction();
            this.transactionForm.reset(this.mmmService.manageTransactionData);
            this.mmmService.router.navigate(['/home']);
            this.activeTab = 'transaction-details';
        }
    }

    updateTransaction() {
        this.transactionForm.value.userUid = this.mmmService.user.uid;
        this.transactionForm.value.startDate = this.getDate(this.transactionForm.value.startDate);
        this.transactionForm.value.endDate = this.getDate(this.transactionForm.value.endDate);
        this.mmmService.transactionsRef.update(this.mmmService.manageTransactionData.key, this.transactionForm.value).then(value => {
            this.saveSettledDates(this.mmmService.manageTransactionData.key);
        });
    }

    deleteTransaction(key: string) {
        this.mmmService.transactionsRef.remove(key).then(value => {
            Object.keys(this.mmmService.settledDate).forEach(date => {
                const isSettled = this.mmmService.settledDate[date].isSettled = false;
            });
            this.saveSettledDates(key);
        });
    }

    deleteEveryTransaction() {
        this.mmmService.transactionsRef.remove();
    }

    getIntervalType() {
        let returnsValue = 'Month';
        switch (this.mmmService.manageTransactionData.repeat) {
            case 'monthly':
                returnsValue = 'Month';
                break;
            case 'never':
                returnsValue = 'Date';
                break;
            case 'daily':
                returnsValue = 'Date';
                break;
            case 'weekly':
                returnsValue = 'Date';
                break;
            case 'monthly':
                returnsValue = 'Month';
                break;
            case 'yearly':
                returnsValue = 'FullYear';
                break;
        }
        return returnsValue;
    }

}
