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
  selector: 'app-line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  public data: number[] = [];
  public xLabels: Date[] = [];

  title = 'Line Chart';
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
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
    console.log('init');

    this.paramsSubscription = this.route.pathFromRoot[1].params.subscribe(
      (params: Params) => {
        this.telemetry = params['telemetry'];
      })
      this.queryParamSubscription =   this.route.queryParams
      .subscribe(params => {
        this.Points = [];
        this.xLabels = params.xLabels;
        this.data = params.data

        this.xLabels = this.covertToDate(this.xLabels);
        this.xLabels.forEach(element => {
          this.Points.push({
            date: new Date(element), value:
              this.data[this.xLabels.indexOf(element)]
          })
        });
        console.log(this.Points);
        
        d3.select("my_dataviz").select("my_svg_line").remove();
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawLine();
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

    console.log("bar")
    console.log(this.data)
    
    this.svg = d3
      .select("#my_svg_line")
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
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.Points, (d) => d.date)).nice();
    this.y.domain(d3Array.extent(this.Points, (d) => d.value));
  }

  private drawAxis() {
    this.svg.append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x).ticks(d3time.timeDay))
      .attr("stroke-width", 3);

    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .attr("stroke-width", 3)
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .attr("alignment-baseline", "middle")
      .style('text-anchor', 'end')
      .style("font-size", "16px")
      .style("cursor", "pointer")
      .style("fill", this.color)
      .text(this.telemetry);
  }

  private drawLine() {
    this.line = d3Shape.line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    this.svg.append('path')
      .attr("stroke-width", 3)
      .datum(this.Points)
      .attr('class', 'line')
      .attr('d', this.line);
  }


ngOnDestroy() {
  this.paramsSubscription.unsubscribe();
  this.queryParamSubscription.unsubscribe();
}
}

