import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, filter, takeUntil, tap } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/OlympicCountry';
import { Participation } from 'src/app/core/models/Participation';
import { OlympicService } from 'src/app/core/services/olympic.service';

interface seriesType {
  name: string;
  value: number;
}

interface DataItem {
  name: string;
  series: seriesType[];
}
@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  currentOlympic$!: Observable<OlympicCountry>;
  // Array to hold data for chart visualization
  chartData!: DataItem[];
  // Counters for athletes and medals
  athletesNumber: number = 0;
  medalsNumber: number = 0;
  olympics$!: Observable<OlympicCountry[]>;
  private destroy$!: Subject<boolean>;
  // Array to hold statistical information
  stats: Object[] = [];

  constructor(
    private olympicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    const name = this.route.snapshot.params['name'];
    try {
      this.olympics$ = this.olympicService.getOlympics();
      // Subscribe to the Olympic data and perform actions based on the existence of the country
      this.olympics$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (!data.find((item) => item.country === name)) {
          // Redirect to a default route if the country is not found
          this.router.navigateByUrl('**');
        } else {
          this.currentOlympic$ = this.olympicService.getOlympicsByName(name);
          // Subscribe to the current OlympicCountry data and update chartData and stats
          this.currentOlympic$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              this.chartData = [
                {
                  name: data.country,
                  series: data.participations.map(
                    (participation: Participation) => {
                      // Update stats number and return series data ready for chart
                      this.athletesNumber += participation.athleteCount;
                      this.medalsNumber += participation.medalsCount;
                      return {
                        name: participation.year.toString(),
                        value: participation.medalsCount,
                      };
                    }
                  ),
                },
              ];
              // Update stats array with statistical information
              this.stats = [
                {
                  name: 'Number of entry',
                  value: this.chartData[0].series.length,
                },
                { name: 'Total number medals', value: this.medalsNumber },
                {
                  name: 'Total number of athletes',
                  value: this.athletesNumber,
                },
              ];
            });
        }
      });
    } catch (error) {
      console.error(error);
      this.router.navigateByUrl('**');
    }
  }

  // Lifecycle hook to handle component destruction and prevent memory leaks
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
