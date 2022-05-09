import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3time from 'd3-time';
import { DatePipe } from '@angular/common';

export interface PointValue {
  date: Date;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

  public data: number[] = [];
  public xLabels: Date[] = [];

  title = 'Pie Chart';
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };
  private width: number;
  private height: number;
  private radius: number;
  private arc: any;
  private labelArc: any;
  private pie: any;
  private color: any;
  private svg: any;

  private Points: PointValue[]
  telemetry: string
  paramsSubscription: Subscription
  queryParamSubscription: Subscription
  labelColor: string = "orange"

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;
  }

  ngOnInit() {
    console.log('init');
    this.paramsSubscription = this.route.pathFromRoot[1].params.subscribe(
      (params: Params) => {
        this.telemetry = params['telemetry'];
      })
    this.queryParamSubscription = this.route.queryParams
      .subscribe(params => {

        this.Points = [];
        d3.select("#my_dataviz").select("svg").remove;
        this.xLabels = params.xLabels;
        this.data = params.data

        // this.xLabels = this.covertToDate(this.xLabels);
        this.xLabels.forEach(element => {
          this.Points.push({
            date: element, value:
              this.data[this.xLabels.indexOf(element)]
          })
        });
        this.initSvg();
        this.drawPie();
      });
  }


  private initSvg() {

    this.color = d3Scale.scaleOrdinal()
      .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
    this.arc = d3Shape.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);
    this.labelArc = d3Shape.arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40);
    this.pie = d3Shape.pie()
      .sort(null)
      .value((d: any) => d.value);


    this.svg = d3
      .select("#my_svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height +
        this.margin.top +
        this.margin.bottom}`
      )
      .append("g")
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
  }

  private drawPie() {
    let g = this.svg.selectAll('.arc')
      .data(this.pie(this.Points))
      .enter().append('g')
      .attr('class', 'arc');
    g.append('path').attr('d', this.arc)
      .style('fill', (d: any) => this.color(d.data.date));
    g.append('text').attr('transform', (d: any) => 'translate(' + this.labelArc.centroid(d) + ')')
      .attr('dy', '.35em')
      .text((d: any) => d.data.date);
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
    this.queryParamSubscription.unsubscribe();
  }

}
