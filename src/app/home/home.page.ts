import {Component, OnDestroy} from '@angular/core';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {MmmService} from '../mmm-service/mmm.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage  {


    constructor(
        public mmmService: MmmService,
        public alertController: AlertController,
    ) {

    }

    async presentLogoutConfirm() {
        const alert = await this.alertController.create({
            header: 'Logout Confirmation!',
            message: 'Are you sure! Do you want to  <strong>Logout</strong>?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Yes',
                    handler: () => {
                        this.mmmService.logout();
                    }
                }
            ]
        });

        await alert.present();
    }

}
