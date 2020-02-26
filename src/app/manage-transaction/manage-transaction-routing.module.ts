import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageTransactionPage } from './manage-transaction.page';

const routes: Routes = [
  {
    path: '',
    component: ManageTransactionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageTransactionPageRoutingModule {}
