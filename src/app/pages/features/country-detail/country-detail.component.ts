import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartData, ChartOptions, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit, OnDestroy {
  countryName = '';
  totalMedals = 0;
  totalAthletes = 0;
  totalEntries = 0;

  lineChartData: ChartConfiguration<'line'>['data'] = {labels:[], datasets:[]};

  //Configuration for line chart
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Dates' } },
      y: { title: { display: true, text: 'Number of Medals' } }
    }
  };

  private sub: Subscription | null = null;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      this.countryName = params.get('countryName') ?? '';
      this.loadCountryData();
    })
    
  }

  loadCountryData() {
    this.olympicService.getOlympicByCountryName(this.countryName).subscribe(country => {
      if(!country) {
        //Redirect user in error page if he try to write a country that doesn't exist in the url
        this.router.navigate(['/error']);
        return;
      } 

      const year = country.participations.map(p => p.year);
      const medals = country.participations.map(p => p.medalsCount);

      this.totalMedals = medals.reduce((a, b) => a+b, 0);
      this.totalEntries = country.participations.length;
      this.totalAthletes = country.participations.reduce(
        (a, p) => a + (p.athleteCount ?? 0), 0
      );
      this.buildChart(country);
    },
    );
  }

  //Create a Line chart using data from one country
  buildChart(country: Olympic) {
    const labels = country.participations.map(p => p.year);
    const data = country.participations.map(p => p.medalsCount);

    this.lineChartData ={
      labels,
      datasets: [{
        data,
        label: country.country,
        borderColor: '#0E7C7B',
        backgroundColor: 'rgba(14, 124 123, 0.3)',
        fill:false,
        tension: 0.3,
      }]
    };

    //Calculation to have a curve without setting min et max value
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;

    const suggestedmin = Math.max(0, minValue - range * 0.2);
    const suggestedMax = maxValue + range * 0.2;

    this.lineChartOptions = {
      scales: {
      y: { min: suggestedmin, max: suggestedMax, beginAtZero: false, 
          ticks: {
            stepSize: Math.ceil((suggestedMax - suggestedmin) / 5),
          }, 
        },
      },
    };
  }

  goBack() {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if(this.sub) this.sub.unsubscribe();
  }

}
