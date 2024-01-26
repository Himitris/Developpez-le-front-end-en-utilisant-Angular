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
  public chartData: Object[] = [];
  chartSize!: [number, number];
  // Counters for the number of JOs and countries
  joNumber: number = 0;
  countriesNumber: number = 0;
  private destroy$!: Subject<boolean>;
  // Array to hold statistical information
  stats: Object[] = [];

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.chartSize = [innerWidth / 1.1, 400];
    this.olympics$ = this.olympicService.getOlympics();
    // Subscribe to the Olympic data and perform actions based on the existence of the country
    this.olympics$
      .pipe(
        // Filter data to ensure it's not null or empty
        filter((data) => data && data.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        // Update counters and chartData based on Olympic data
        this.joNumber = data[0].participations.length;
        this.chartData = data.map((item: OlympicCountry) => {
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
        // Update stats array with statistical information
        this.stats = [
          { name: "Number of JO's", value: this.joNumber },
          { name: 'Number of countries', value: this.countriesNumber },
        ];
      });
  }

  // Method to navigate to details page when a chart item is selected
  onSelect(data: JSON): void {
    this.router.navigateByUrl(
      `details/${JSON.parse(JSON.stringify(data)).name}`
    );
  }

  onResize(event: any) {
    this.chartSize = [event.target.innerWidth / 1.1, 400];
  }

  // Lifecycle hook to handle component destruction and prevent memory leaks
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
