import {Component} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    user = {email: 'vamsi.flex@gmail.com'};
    userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.user);
    user$ = this.userSubject.asObservable();

    selectedDate = new Date().toISOString();
    mmmState = {selectedMonth: '02', selectedYear: '2020', selectedType: '01'};
    mmmStateSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.mmmState);
    mmmState$ = this.mmmStateSubject.asObservable();

    years = [
        {id: '2020', label: '2020'},
        {id: '2021', label: '2021'},
        {id: '2022', label: '2022'},
        {id: '2023', label: '2023'},
    ];
    yearsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.years);
    years$ = this.yearsSubject.asObservable();

    months$ = of([
        {id: '01', label: 'Jan'},
        {id: '02', label: 'Feb'},
        {id: '03', label: 'Mar'},
        {id: '04', label: 'Apr'},
        {id: '05', label: 'May'},
        {id: '06', label: 'Jun'},
        {id: '07', label: 'Jul'},
        {id: '08', label: 'Aug'},
        {id: '09', label: 'Sep'},
        {id: '10', label: 'Oct'},
        {id: '11', label: 'Nov'},
        {id: '12', label: 'Dec'},
    ]);

    types$ = of([
        {id: '01', label: 'Income'},
        {id: '02', label: 'Expenses'},
    ]);


    transactions$ = of([
        {label: 'Income 01', id: '01', amount: 1000, type: '01', startDate: '01-01-2020', endDate: '01-01-2020'},
        {label: 'Income 02', id: '02', amount: 2000, type: '01', startDate: '02-02-2020', endDate: '02-02-2020'},
        {label: 'Income 03', id: '03', amount: 3000, type: '01', startDate: '03-03-2020', endDate: '03-03-2020'},
        {label: 'Income 03', id: '03', amount: 30000, type: '01', startDate: '01-03-2020', endDate: '12-03-2021'},
        {label: 'Expenses 04', id: '04', amount: 4000, type: '02', startDate: '03-01-2020', endDate: '03-01-2020'},
        {label: 'Expenses 05', id: '05', amount: 5000, type: '02', startDate: '02-02-2020', endDate: '02-02-2020'},
        {label: 'Expenses 06', id: '06', amount: 6000, type: '02', startDate: '01-03-2020', endDate: '01-03-2020'},
        {label: 'Expenses 06', id: '06', amount: 6000, type: '02', startDate: '01-03-2020', endDate: '12-03-2021'},
    ]);

    filteredTransactions$ = this.mmmState$.pipe(switchMap(state => {
        return this.transactions$.pipe(
            switchMap(
                transactions => of(
                    transactions.filter(
                        d => {
                            return d.type === state.selectedType &&
                                this.isDateBetween(d, state.selectedYear, state.selectedMonth);
                        }
                    )
                )
            )
        );
    }));

    isDateBetween(transaction: any, year: string, month: string): boolean {
        const compareDate = moment(`${month}-02-${year}`, 'MM-DD-YYYY');
        const startDate = moment(transaction.startDate, 'MM-DD-YYYY').date(1);
        const endDate = moment(transaction.endDate, 'MM-DD-YYYY').date(31);
        /*console.log(compareDate.format('MMM-DD-YYYY'), startDate.format('MMM-DD-YYYY'), endDate.format('MMM-DD-YYYY'));
        console.log(compareDate.isBetween(startDate, endDate));*/
        return compareDate.isBetween(startDate, endDate);
    }

    constructor() {
    }

    setSelectedMonth(setSelectedMonth) {
        this.mmmState.selectedMonth = setSelectedMonth;
        this.mmmStateSubject.next(this.mmmState);
    }

    setSelectedType(selectedType) {
        this.mmmState.selectedType = selectedType;
        this.mmmStateSubject.next(this.mmmState);
    }

    setSelectedYear(selectedYear) {
        this.mmmState.selectedYear = selectedYear;
        this.mmmStateSubject.next(this.mmmState);
    }

}
