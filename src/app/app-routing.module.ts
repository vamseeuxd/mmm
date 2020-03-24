import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ManageTransactionPage} from './manage-transaction/manage-transaction.page';
import {HomePage} from './home/home.page';

const routes: Routes = [
    {path: '', redirectTo: 'manage-transaction', pathMatch: 'full'},
    {
        path: 'home',
        component: HomePage
    },
    {
        path: 'manage-transaction',
        component: ManageTransactionPage
    },
    {
        path: 'login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
