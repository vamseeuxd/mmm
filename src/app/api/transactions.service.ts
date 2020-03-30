import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, merge, of} from 'rxjs';
import {combineLatest} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TransactionsService {

    readonly url = 'https://us-central1-monthly-money-manager-d772a.cloudfunctions.net';

    transactions$ = this.http.get(this.url + '/getTransactions?userUid=ARTToO6L48R5SCnCzqnHtcfXLM02');

    selectedSate = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: 'income',
    };
    selectedSateAction: BehaviorSubject<any> = new BehaviorSubject<any>(this.selectedSate);
    selectedSate$ = this.selectedSateAction.asObservable();
    transactionsByMonth$ = this.selectedSate$.pipe(
        switchMap(
            (selectedSate) => {
                return merge(
                    of(null),
                    this.http.get(this.url + `/getTransactionsByMonth?userUid=ARTToO6L48R5SCnCzqnHtcfXLM02&month=${selectedSate.month}&year=${selectedSate.year}&type=${selectedSate.type}`)
                );
            }
        )
    );

    constructor(private http: HttpClient) {
    }

    setSelectedMonth(month: number) {
        debugger;
        this.selectedSate.month = month;
        this.selectedSateAction.next(this.selectedSate);
    }

    setSelectedYear(year: number) {
        this.selectedSate.year = year;
        this.selectedSateAction.next(this.selectedSate);
    }

    setSelectedType(type: string) {
        this.selectedSate.type = type;
        this.selectedSateAction.next(this.selectedSate);
    }
}
