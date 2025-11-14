import { Component, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { ChartData, ChartOptions, Chart, Plugin } from 'chart.js';
import { Subscription } from 'rxjs';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import { Router } from '@angular/router';


Chart.register(ChartDataLabels);


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

   /** Shared observable of all Olympic countries */
  public olympics$: Observable<Olympic[] | null> = of(null);
  public italyParticipationsCount$: Observable<number> = of(0);
  public italyMedalsCount$: Observable<number> = of(0);

  public pieChartPlugins = [ChartDataLabels as unknown as Plugin<'pie'>];

  pieChartData: ChartData<'pie'> = {labels: [], datasets: [{data: [] }] };

  //Configuration for the pie chart
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins:{
      legend: {
       display: true,
      },
      tooltip: {
        backgroundColor: '#0E7C7B',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        boxPadding: 6,
        boxWidth: 40,
        boxHeight: 25,
        displayColors:false,
        caretSize: 8,
        callbacks:{
          label: (context) => {
            // Displays a medal icon + value
          const medalIcon = '🏅';
          const value = context.parsed || 0;
          
          return [`${medalIcon} ${value}`];
          }
        }
      },
      datalabels: {
        color: '#970707ff',
        font: {weight: 'bold', size: 12},
        formatter: (value, ctx) =>{
          const label = ctx.chart.data.labels?.[ctx.dataIndex] ?? '';
          return `${label}\n${value}`;
        },
        anchor: 'end',
        align: 'end',
        offset: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: (ctx: any) => {
        const bg = (ctx.dataset as any).backgroundColor;
        // if bg is an array we take index color, else we return bg or fallback
        if (Array.isArray(bg)) {
          return bg[ctx.dataIndex] ?? '#000000';
        }
        return (bg as string) ?? '#000000';
      },
        clip: false,
      }
    }
  };

  numberOfCountries = 0;
  numberofJos=0

  colorPalette = [
    '#956065',
    '#B8CBE7',
    '#9780A1',
    '#89A1DB',
    '#793D52',
    '#D97706',
  ];

  private sub: Subscription | null = null;

  constructor(private olympicService: OlympicService, private router: Router) {}

  /** Loads all olympics data when component initializes */
  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();

    this.CreateCharts();
  }

  /**
   * Builds the pie chart using global Olympic data.
   * Computes total medals, number of countries, and number of JO editions.
   */
  private CreateCharts() {
    this.olympicService.getOlympics().pipe(
      map((countries: Olympic[] | null) => {
        if (!countries || countries.length === 0) {
          return { labels: [], medals: [], numCountries: 0, numJOs: 0 };
        }

        const labels = countries.map(c => c.country);

        const medals = countries.map(c => (c.participations || []).reduce(
          (acc, p) => acc + (p?.medalsCount ?? 0), 0)
        );

        const yearSet = new Set<number>();

        countries.forEach(c => {
          (c.participations || []).forEach(p => {
            if (p && p.year) yearSet.add(p.year);
          });
        });

        return {
          labels,
          medals,
          numCountries: labels.length,
          numJOs: yearSet.size
        };
      })
    ).subscribe(({ labels, medals, numCountries, numJOs }) => {
      this.pieChartData = {
        labels,
        datasets: [{
          data: medals,
          backgroundColor: this.colorPalette.slice(0, labels.length),
          hoverOffset: 10
        }]
      };

      this.numberOfCountries = numCountries;
      this.numberofJos = numJOs;

    });
  }

  ngOnDestroy(): void{
    if(this.sub) this.sub.unsubscribe();
  }


  //redirection to the country page we click on
  onChartClick(event: any): void {
    if (event.active && event.active.length > 0) {
    const chart = event.active[0].element.$context.chart;
    const index = event.active[0].index;
    const countryName = chart.data.labels[index];
    this.router.navigate(['/country', countryName]);
  }
  }
}
