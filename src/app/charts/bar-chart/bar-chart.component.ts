import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3time from 'd3-time';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';

export interface PointValue {
  date: Date;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  public data: number[] = [];
  public xLabels: Date[] = [];

  title = 'Bar Chart';
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private g: any;
  private Points: PointValue[]
  telemetry: string
  paramsSubscription: Subscription
  queryParamSubscription:Subscription
  color: string = "orange"

  constructor(private route: ActivatedRoute,
    private router: Router) {
      this.width = 2000 - this.margin.left - this.margin.right;
      this.height = 500 - this.margin.top - this.margin.bottom;
  }
  
  ngOnInit() {
    this.paramsSubscription = this.route.pathFromRoot[1].params.subscribe(
      (params: Params) => {
        this.telemetry = params['telemetry'];
      })
      this.queryParamSubscription =  this.route.queryParams
      .subscribe(params => {
        this.Points = [];
        // d3.select("#my_dataviz").select("svg").remove();
        this.xLabels = params.xLabels;
        this.data = params.data
        this.xLabels = this.covertToDate(this.xLabels);
        this.xLabels.forEach(element => {
          this.Points.push({
            date:element, value:
              this.data[this.xLabels.indexOf(element)]
          })
        });

        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawBars();
      });
  }

  private covertToDate(array: any[]) {
    array = array.map(element => {
      let pipe = new DatePipe('en');
      let date = pipe.transform(element, 'yyyy-MM-dd');
      return date;
    });
    return array.sort();
  }

  private initSvg() { 
    this.svg = d3
    .select("#my_svg_bar")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    .attr(
      "viewBox",
      `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height +
      this.margin.top +
      this.margin.bottom}`
    )
    .append("g")
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  }
  private initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.Points.map((d) => d.date));
    this.y.domain([0, d3Array.max(this.Points, (d) => d.value)]);
  }

  private drawAxis() {
    this.svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3Axis.axisBottom(this.x));
    this.svg.append('g')
        .attr('class', 'axis axis--y')
        .call(d3Axis.axisLeft(this.y).ticks(10, '%'))
        .append('text')
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Frequency '+this.telemetry)
        .style("fill", 'orange');
}

private drawBars() {
    this.svg.selectAll('.bar')
        .data(this.Points)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => this.x(d.date) )
        .attr('y', (d) => this.y(d.value) )
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.height - this.y(d.value) );
}

ngOnDestroy() {
  this.paramsSubscription.unsubscribe();
  this.queryParamSubscription.unsubscribe();
}
}

