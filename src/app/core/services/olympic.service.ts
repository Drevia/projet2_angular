import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[] | null>(null);

  constructor(private http: HttpClient,
    private router: Router
  ) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next(null);
        throw error;
      })
    );
  }

  getOlympics(): Observable<Olympic[] | null> {
    return this.olympics$.asObservable();
  }

  getOlympicByCountryName(countryName: string): Observable<Olympic> {
    return this.olympics$.pipe(map((countries) => 
      {
        console.log("name: ", countryName)
        const country = countries?.find(
          (c) => c.country.toLowerCase() === countryName.toLowerCase()
        )
        console.log("service", countries);
        console.log("country find: ", country);
        if(country === undefined) {
          this.router.navigate(['/error']);
          throw new Error();
        }
        return country
      }
      ));
  }
}
