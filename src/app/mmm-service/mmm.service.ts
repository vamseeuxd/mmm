import {Injectable} from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {auth, User} from 'firebase';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import * as moment from 'moment';
import {AngularFireAuth} from '@angular/fire/auth';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class MmmService {
    userDetails$ = new Subject<User>();
    transactionsRef: AngularFireList<any>;
    transactions$ = this.userDetails$.pipe(
        switchMap(userDetails =>
            this.db.list(
                '/transactions',
                ref => ref.orderByChild('userUid').equalTo(userDetails.uid)
            ).snapshotChanges().pipe(
                map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()})))
            )
        )
    );
    transactionsKeyToUpdate$ = new Subject<string>();
    settledTransactionsToUpdate$ = this.transactionsKeyToUpdate$.pipe(
        switchMap(transactionsKey =>
            this.db.list(
                '/settledTransactions',
                ref => ref.orderByChild('transactionsKey').equalTo(transactionsKey)
            ).snapshotChanges().pipe(
                map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()})))
            )
        )
    );

    settledTransactionsRef: AngularFireList<any>;
    settledTransactions$ = of([]);

    manageTransactionData = {
        key: '',
        label: null,
        amount: null,
        type: 'income',
        repeat: 'monthly',
        userUid: 'user',
        customRepeatCount: 1,
        customRepeat: 'daily',
        startDate: null,
        endDate: null
    };
    manageTransactionTitle = 'Add New Transaction';
    isUpdate = false;

    user: User;
    userSubscription: Subscription;
    mmmState = {selectedMonth: '02', selectedYear: '2020', selectedType: 'income'};
    mmmStateSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.mmmState);
    mmmState$ = this.mmmStateSubject.asObservable();

    years = [
        {id: 2020, label: '2020'},
        {id: 2021, label: '2021'},
        {id: 2022, label: '2022'},
        {id: 2023, label: '2023'},
    ];
    yearsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.years);
    years$ = this.yearsSubject.asObservable();

    months$ = of([
        {id: 1, label: 'Jan'},
        {id: 2, label: 'Feb'},
        {id: 3, label: 'Mar'},
        {id: 4, label: 'Apr'},
        {id: 5, label: 'May'},
        {id: 6, label: 'Jun'},
        {id: 7, label: 'Jul'},
        {id: 8, label: 'Aug'},
        {id: 9, label: 'Sep'},
        {id: 10, label: 'Oct'},
        {id: 11, label: 'Nov'},
        {id: 12, label: 'Dec'},
    ]);

    types$ = of([
        {id: 'income', label: 'Income'},
        {id: 'expenses', label: 'Expenses'},
    ]);


    filteredTransactions$ = this.mmmState$.pipe(switchMap(state => {
        return this.transactions$.pipe(
            switchMap(transactions => of(transactions.filter(
                (d: any) => (
                    d.type === state.selectedType && this.isDateBetween(d, state.selectedYear, state.selectedMonth)
                )
            )))
        );
    }));

    getFullMonth(month) {
        const months = {
            '1': 'January',
            '2': 'February',
            '3': 'March',
            '4': 'April',
            '5': 'May',
            '6': 'June',
            '7': 'July',
            '8': 'August',
            '9': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December',
        };
        return months[month];
    }

    isDateBetween(transaction: any, year: string, month: string): boolean {
        const compareDate = moment(`${month}-02-${year}`, 'MM-DD-YYYY');
        const startDate = moment(transaction.startDate, 'MM-DD-YYYY').date(1);
        const endDate = moment(transaction.endDate, 'MM-DD-YYYY').date(31);
        return compareDate.isBetween(startDate, endDate);
    };

    settledDate = {};

    constructor(
        public authentication: AngularFireAuth,
        public router: Router,
        public db: AngularFireDatabase
    ) {
        this.userSubscription = authentication.user.subscribe(value => {
            this.user = value;
            this.userDetails$.next(value);
            if (!value) {
                this.router.navigate(['/login']);
            }
        });
        // userUid
        this.transactionsRef = db.list('transactions');
        // this.transactions$ = this.transactionsRef.snapshotChanges().pipe(map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()}))));

        this.settledTransactionsRef = db.list('settledTransactions');
        this.settledTransactions$ = this.settledTransactionsRef.snapshotChanges().pipe(map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()}))));


        this.settledTransactionsToUpdate$.subscribe(value => {
            this.settledDate = {};
            value.forEach((d: any) => {
                this.settledDate[d.date] = d;
            });
        });
    }

    setSelectedMonth(setSelectedMonth, mmmState) {
        debugger;
        mmmState.selectedMonth = setSelectedMonth;
        this.mmmStateSubject.next(mmmState);
    }

    setSelectedType(selectedType, mmmState) {
        mmmState.selectedType = selectedType;
        this.mmmStateSubject.next(mmmState);
    }

    setSelectedYear(selectedYear, mmmState) {
        mmmState.selectedYear = selectedYear;
        this.mmmStateSubject.next(mmmState);
    }

    login() {
        this.authentication.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(value => {
            console.log('value', value.user.email);
        }, reason => {
            console.log('reason', reason);
        });
    }

    logout() {
        this.authentication.auth.signOut();
    }

    addNewTransaction() {
        this.manageTransactionTitle = 'Add New Transaction';
        this.manageTransactionData = {
            label: '',
            key: '',
            amount: null,
            type: this.mmmState.selectedType,
            repeat: 'monthly',
            userUid: this.user.uid,
            customRepeatCount: 1,
            customRepeat: 'daily',
            startDate: `${this.mmmState.selectedMonth}-01-${this.mmmState.selectedYear}`,
            endDate: `${this.mmmState.selectedMonth}-01-${this.mmmState.selectedYear}`,
        };
        this.isUpdate = false;
        this.router.navigate(['/manage-transaction']);
    }

    updateTransaction(data) {
        this.manageTransactionTitle = 'Update Transaction';
        this.manageTransactionData = data;
        this.isUpdate = true;
        this.router.navigate(['/manage-transaction']);
        this.transactionsKeyToUpdate$.next(this.manageTransactionData.key);
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }


    recurringDates(startDate, endDate, interval, intervalType, noweekends) {
        intervalType = intervalType || 'Date';
        const date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
        const recurrent = [];
        const setGet = {set: 'set' + intervalType, get: 'get' + intervalType};

        // add 1 day for sunday, subtract one for saturday
        const noWeekend = () => {
            const currentDate = new Date(date), day = date.getDay();
            if (~[6, 0].indexOf(day)) {
                currentDate.setDate(currentDate.getDate() + (day == 6 ? -1 : 1));
            }
            return new Date(currentDate);
        };

        while (date < endDate) {
            recurrent.push(noweekends ? noWeekend() : new Date(date));
            date[setGet.set](date[setGet.get]() + interval);
        }
        return recurrent;
    }
}
