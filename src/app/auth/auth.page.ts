import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin = true;

  constructor() { }

  ngOnInit() {
  }

  switcher() {
    this.isLogin = !this.isLogin;
  }

}
