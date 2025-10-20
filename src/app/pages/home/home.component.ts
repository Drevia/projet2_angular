import { Component, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { ChartData, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<Olympic[] | null> = of(null);
  public italyParticipationsCount$: Observable<number> = of(0);
  public italyMedalsCount$: Observable<number> = of(0);

  pieChartData: ChartData<'pie'> = {labels: [], datasets: [{data: [] }] };
  
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins:{
      legend: {
        position: 'right',
      }
    }
  };

  numberOfCountries = 0;
  numberofJos=0 // nombre distinct d'éditions (années) parmi toutes les participations

  private sub: Subscription | null = null;

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();

    this.olympicService.getOlympics().pipe(
      map((countries : Olympic[] | null) => {
          if(!countries || countries.length === 0) {
            return {labels: [], medals: [], numCountries: 0, numJOs:0};
          }

          const labels = countries.map(c => c.country);

          const medals = countries.map(c =>
            (c.participations || []).reduce(
              (acc, p) => acc + (p?.medalsCount ?? 0), 0)
          );

          // calcul du nombre d'années distinctes (nombre de JO)
          const yearSet = new Set<number>();

          countries.forEach(c => {
            (c.participations || []).forEach(p =>{
              if(p && p.year) yearSet.add(p.year);
            });
          });

          return{labels,
            medals,
            numCountries: labels.length,
            numJOs: yearSet.size
          };
      })
    ).subscribe(({ labels, medals, numCountries, numJOs }) => {
      this.pieChartData = {
        labels,
        datasets: [{ data: medals }]
      };

      this.numberOfCountries = numCountries;
      this.numberofJos = numJOs;

    });
    

    
  }

  ngOnDestroy(): void{
    if(this.sub) this.sub.unsubscribe();
  }
}
