import { OlympicCountry } from '../models/OlympicCountry';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        // TODO: improve error handling
        console.error(error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.next(null);
        return caught;
      })
    );
  }

  getOlympics(): Observable<OlympicCountry[]> {
    return this.olympics$.asObservable();
  }

  getOlympicsByName(olympicName: string): Observable<OlympicCountry> {
    const olympicsData = this.olympics$.value;

    if (olympicsData) {
      const foundOlympic = olympicsData.find(
        (olympic: OlympicCountry) => olympic.country === olympicName
      );

      if (foundOlympic) {
        return of(foundOlympic);
      } else {
        throw new Error('Olympic not found');
      }
    } else {
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
          // Gérer les erreurs ici
          return throwError(() => error);
        })
      );
    }
  }
}
