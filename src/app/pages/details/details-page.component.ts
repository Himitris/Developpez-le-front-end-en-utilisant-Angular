import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, filter, takeUntil, tap } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/OlympicCountry';
import { Participation } from 'src/app/core/models/Participation';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  currentOlympic$!: Observable<OlympicCountry>;
  chartData!: any[];
  athletesNumber: number = 0;
  medalsNumber: number = 0;
  olympics$!: Observable<OlympicCountry[]>;
  private destroy$!: Subject<boolean>;
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
      //TODO: check if name is in olympics$ array and if not, redirect to home page
      this.olympics$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (!data.find((item) => item.country === name)) {
          this.router.navigateByUrl('**');
        } else {
          this.currentOlympic$ = this.olympicService.getOlympicsByName(name);
          this.currentOlympic$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              this.chartData = [
                {
                  name: data.country,
                  series: data.participations.map(
                    (participation: Participation) => {
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
      // Gérez l'erreur ici, par exemple, redirigez l'utilisateur vers une page d'erreur ou affichez un message d'erreur à l'utilisateur.
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}