import { Component, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<any> = of(null);
  public italyParticipationsCount$: Observable<number> = of(0);

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
      this.italyParticipationsCount$ = this.olympics$.pipe(
      map((data) => {
        if (!data) return 0; // Sécurité
        const italy = data.find((o: { country: string; }) => o.country === 'Italy');
        return italy ? italy.participations.length : 0;
      })
    );
  }
}
