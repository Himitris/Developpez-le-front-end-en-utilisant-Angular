import { Participation } from './../../core/models/Participation';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/OlympicCountry';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$!: Observable<OlympicCountry[]>;
  public chartData: any[] = [];
  joNumber: number = 0;
  countriesNumber: number = 0;
  private destroy$!: Subject<boolean>;
  stats: Object[] = [];

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.olympics$ = this.olympicService.getOlympics();
    this.olympics$
      .pipe(
        filter((data) => data && data.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.joNumber = data[0].participations.length;
        this.chartData = data.map((item: any) => {
          this.countriesNumber++;
          return {
            name: item.country,
            value: item.participations.reduce(
              (total: number, participation: Participation) =>
                total + participation.medalsCount,
              0
            ),
          };
        });
        this.stats = [
          { name: "Number of JO's", value: this.joNumber },
          { name: 'Number of countries', value: this.countriesNumber },
        ];
      });
  }

  onSelect(data: any): void {
    this.router.navigateByUrl(
      `details/${JSON.parse(JSON.stringify(data)).name}`
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
