import { OlympicCountry } from '../models/OlympicCountry';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient, private router: Router) {}

  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error) => {
        console.error(error);
        this.olympics$.next(null);
        // Redirect to the not-found route in case of an error
        this.router.navigateByUrl('**');
        throw new Error(error.status + ' ' + error.statusText);
      })
    );
  }

  getOlympics(): Observable<OlympicCountry[]> {
    return this.olympics$.asObservable();
  }

  getOlympicsByName(olympicName: string): Observable<OlympicCountry> {
    const olympicsData = this.olympics$.value;

    if (olympicsData) {
      // If data is available, find the OlympicCountry by name
      const foundOlympic = olympicsData.find(
        (olympic: OlympicCountry) => olympic.country === olympicName
      );

      if (foundOlympic) {
        return of(foundOlympic);
      } else {
        throw new Error('Olympic not found');
      }
    } else {
      // If data is not available, load the initial data and handle errors
      return this.loadInitialData().pipe(
        switchMap(() => {
          const reloadedData = this.olympics$.value;
          const foundOlympic = reloadedData.find(
            (olympic: OlympicCountry) => olympic.country === olympicName
          );

          if (foundOlympic) {
            return of(foundOlympic);
          } else {
            return throwError(() => new Error('Olympic not found'));
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
    }
  }
}
