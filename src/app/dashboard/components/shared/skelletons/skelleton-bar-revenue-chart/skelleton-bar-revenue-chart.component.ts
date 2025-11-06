import { Component } from '@angular/core';

@Component({
  selector: 'app-skelleton-bar-revenue-chart',
  templateUrl: './skelleton-bar-revenue-chart.component.html',
  styleUrl: './skelleton-bar-revenue-chart.component.scss'
})
export class SkelletonBarRevenueChartComponent {

  months = [
    { currentHeight: '180px', previousHeight: '160px' },
    { currentHeight: '220px', previousHeight: '200px' },
    { currentHeight: '240px', previousHeight: '190px' },
    { currentHeight: '200px', previousHeight: '170px' },
    { currentHeight: '260px', previousHeight: '240px' },
    { currentHeight: '280px', previousHeight: '250px' },
    { currentHeight: '230px', previousHeight: '210px' },
    { currentHeight: '250px', previousHeight: '220px' },
    { currentHeight: '210px', previousHeight: '185px' },
    { currentHeight: '240px', previousHeight: '215px' },
    { currentHeight: '270px', previousHeight: '245px' },
    { currentHeight: '190px', previousHeight: '175px' }
  ];

}
