import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageTransactionPageRoutingModule } from './manage-transaction-routing.module';

import { ManageTransactionPage } from './manage-transaction.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageTransactionPageRoutingModule
  ],
  declarations: [ManageTransactionPage]
})
export class ManageTransactionPageModule {}
