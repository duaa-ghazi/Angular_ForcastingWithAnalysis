import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { Subject, Subscription } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { TelemetryService } from '../sidenav/telemetry.service';
import { Analytics } from './analytics.model';
import { PlotData } from './plotData.model';
import { Telemetry } from './telemetry.model';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {

  chartData: number[]  
  chartData2: number[]

  dataToPlot: PlotData

  chartLabels: string[] = [];
  chartLabels2: string[] = [];

  lineChartdata = []

  chartLabelsChanged = new Subject<string[]>();
  chartLabels2Changed = new Subject<string[]>();

  chartLabelsSubscription: Subscription;
  chartLabels2Subscription: Subscription;

  chartDataChanged = new Subject<number[]>();
  chartData2Changed = new Subject<number[]>();

  chartDataSubscription: Subscription;
  chartData2Subscription: Subscription;

  telemetry: string
  recordsForTelemetry: Telemetry[]

  statisticsFunctions: Analytics
  statisticsFunctionsChanged = new Subject<Analytics>();

  paramsSubscription: Subscription
  analyticsubscription: Subscription;

   

  displayedColumns: string[] = ['ts', 'doubleValue', 'strKey', 'entityId'];
  dataSource = null

  @ViewChild(MatPaginator) paginator: MatPaginator
  pipe: DatePipe;
  filterForm = new FormGroup({
    fromDate: new FormControl(""),
    toDate: new FormControl(""),
    filterEntityId:new FormControl("")
  });

  @ViewChild(MatTableExporterDirective, { static: false })
  exporter: MatTableExporterDirective;


  constructor(private telemetryService: TelemetryService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(
      (params: Params) => {
        this.telemetry = params['telemetry'];
        this.getRecordsForTelemetry(this.telemetry);
        this.getAnalytic()
        this.getDataToPlot()
       this. makeForcast()
      })

    this.analyticsubscription = this.statisticsFunctionsChanged
      .subscribe(
        (analytic: Analytics) => {
          this.statisticsFunctions = analytic;
        })
    this.chartLabelsSubscription = this.chartLabelsChanged
      .subscribe(
        (lineChartLabels: string[]) => {
          this.chartLabels = lineChartLabels;
        })

        this.chartLabels2Subscription =  this.chartLabels2Changed
      .subscribe(
        (lineChartLabels2: string[]) => {
          this.chartLabels2 = lineChartLabels2;
        })


    this.chartDataSubscription = this.chartDataChanged
      .subscribe(
        (chartData: number[]) => {
          this.chartData=chartData;
        })

        this.chartData2Subscription = this.chartData2Changed
        .subscribe(
          (chartData2: number[]) => {
            this.chartData2=chartData2;
          })

  }


  get fromDate() { return this.filterForm.get('fromDate').value; }
  get toDate() { return this.filterForm.get('toDate').value; }
  get filterEntityId() { return this.filterForm.get('filterEntityId').value; }
  
  applyFilter() {
    console.log("submit");
    console.log(this.fromDate);

    this.pipe = new DatePipe('en');
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data, filter) => {
        if (this.fromDate && this.toDate) {
          let date = new Date(data.ts);
          let toDateBefore = new Date(this.toDate);
          let toDateAfter = new Date(toDateBefore.setDate(toDateBefore.getDate() + 1))
          return date >= this.fromDate && date <= toDateAfter
        }
        return true;
      }
    }
    this.dataSource.filter = '' + Math.random();
    // this.routeToStart();
    // this.getAnalytic()
    // this.getDataToPlot()
  }

  applyFilterBy() {
    // filterValue = filterValue.trim(); // Remove whitespace
    // filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
  //  this. applyFilter() ;
    let filterValue= this.filterEntityId.trim();
     filterValue= this.filterEntityId.toLowerCase();

    //  this.dataSource.filter = filterValue;
    // this.filterEntityId = filterValue

    console.log("filterValue",filterValue);
    console.log( this.fromDate && this.toDate &&filterValue !="" )
    this.dataSource.filterPredicate = (data, filter) => {
      if (this.fromDate && this.toDate &&filterValue !="" ) {
        console.log('hhhh')
        let date = new Date(data.ts);
        let toDateBefore = new Date(this.toDate);
        let toDateAfter = new Date(toDateBefore.setDate(toDateBefore.getDate() + 1))
        return date >= this.fromDate && date <= toDateAfter && data.entityId == filterValue
      }
      else if (this.fromDate && this.toDate &&filterValue =="") { 
        return  this. applyFilter() ; }
      return true;
    }
    
    this.dataSource.filter = '' + Math.random();
    this.routeToStart();
    this.getAnalytic()
    this.getDataToPlot()
    this.makeForcast()
  }

  getRecordsForTelemetry(telemetry: string) {
    this.telemetryService.getRecordsForTelemetry(telemetry).subscribe(
      (response) => {
        this.recordsForTelemetry = response
        this.dataSource = new MatTableDataSource<Telemetry>(this.recordsForTelemetry);
        this.dataSource.paginator = this.paginator;
      }
    )
  }


  getAnalytic() {
    
    this.telemetryService.calculatedAnalytics(this.telemetry, this.fromDate, this.toDate, this.filterEntityId).subscribe(
      (response) => {
        if (isNaN(response.std)) { response.std = 0 }
        this.statisticsFunctions = response
        this.statisticsFunctionsChanged.next(this.statisticsFunctions);
      }
    )
  }


  getDataToPlot() {
    this.telemetryService.getDataToPlot(this.telemetry, this.fromDate, this.toDate, this.filterEntityId).subscribe(
      (response: PlotData) => {
        this.dataToPlot = response
        this.chartLabels = this.dataToPlot.x
        this.chartData = this.dataToPlot.y
        this.chartLabelsChanged.next(this.chartLabels);
        this.chartDataChanged.next(this.chartData);
      }
    )
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
    this.analyticsubscription.unsubscribe();
    this.chartDataSubscription.unsubscribe();
    this.chartData2Subscription.unsubscribe();
    this.chartLabelsSubscription.unsubscribe();
    this.chartLabels2Subscription.unsubscribe();

  }


  routeToStart() {
    this.router.navigate(["workspace/" + this.telemetry + ''])
  }

  plotLineChart() {
  
    this.router.navigate(["workspace/" + this.telemetry + '/line-chart'], { queryParams: { xLabels: this.chartLabels, data: this.chartData } })
  }

  plotBarChart() {
    this.router.navigate(["workspace/" + this.telemetry + '/bar-chart'], { queryParams: { xLabels: this.chartLabels, data: this.chartData } })
  }

  plotPieChart() {
    this.router.navigate(["workspace/" + this.telemetry + '/pie-chart'], { queryParams: { xLabels: this.chartLabels, data: this.chartData } })
  }

  makeForcast(){
    this.telemetryService.fit_predict_with_prophet(this.telemetry,'d',30).subscribe(
      (response)=>{
         console.log('fit',response);
        
        this.chartLabels2=response.x
        console.log("this.chartLabels",this.chartLabels);
        
        this.chartData2 = response.y
        this.chartLabels2Changed.next(this.chartLabels2);
        this.chartData2Changed.next(this.chartData2);
      }
      )

  }

  Forcast(){
    this.router.navigate(["workspace/" + this.telemetry + '/line-chart'], { queryParams: { xLabels: this.chartLabels2, data: this.chartData2 } })
  }


}
