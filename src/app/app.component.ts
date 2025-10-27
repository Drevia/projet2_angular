import { Component, OnInit } from '@angular/core';
import { catchError, take } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';
import { Router, RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    //rajouter un catchError dans le pipe
    this.olympicService.loadInitialData().pipe(take(1), catchError((_error, _caught) => {
      console.log("error");
      this.router.navigate(['/erreur']);
      return _error;

    }
  )).subscribe(x => {
      console.log(x);
    });
  }
}
