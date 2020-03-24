import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    constructor(
        public auth: AngularFireAuth,
        private router: Router
    ) {
        this.auth.user.subscribe(value => {
            console.log('value', value);
            if (value) {
                this.router.navigate(['/home']);
            }
        });
    }

    ngOnInit() {
        // this.login();
    }

    login() {
        this.auth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(value => {
            console.log('value', value.user.email);
        }, reason => {
            console.log('reason', reason);
        });
    }

    logout() {
        this.auth.auth.signOut();
    }

}
