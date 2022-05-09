import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { catchError, exhaustMap, map, take, tap } from 'rxjs/operators'
import { environment } from "src/environments/environment";
import { Telemetry } from "../workspace/telemetry.model";
import { Analytics } from "../workspace/analytics.model";
import { DatePipe } from "@angular/common";
import { PlotData } from "../workspace/plotData.model";

@Injectable({
    providedIn: 'root'
})
export class TelemetryService {
    private telemetries: String[];
    error = new Subject<string>();
    constructor(private http: HttpClient,
    ) { };

    getTelemetryNames() {
        return this.http
            .get<string[]>(

                '/api/telemetriesNames',
                {
                    headers: new HttpHeaders().set('Content-Type', 'application/json'),
                }
            )

    }

    getRecordsForTelemetry(telemetry: string) {
        return this.http
            .get<Telemetry[]>(

                '/api/specificTelemetries/' + telemetry,
                {
                    headers: new HttpHeaders().set('Content-Type', 'application/json'),
                }
            ).pipe(
                map(telemetries => {
                    return telemetries.map(telemetry => {
                        // let date= new Date(telemetry.ts);
                        // telemetry.ts=(date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
                        return {
                            ...telemetry
                        };
                    });
                })
            )

    }


    calculatedAnalytics(telemetry: string, fromDate: Date, toDate: Date, entityId: string) {
        if (fromDate == null) {
           fromDate=new Date();
        }
        if (toDate == null) {
            toDate=new Date();
         }

          console.log("fromDate",fromDate);
          

         
        if (toDate.toString() != "" && fromDate.toString() != "") {
            let pipe = new DatePipe('en');
            let fDate = pipe.transform(fromDate, 'dd/MM/yyyy');
            let tDate = pipe.transform(toDate, 'dd/MM/yyyy');
            let params = new HttpParams().set('fromDate', fDate.toString()).set('toDate', tDate.toString()).set('entityId', entityId); //Create new HttpParams
            return this.http
                .get<Analytics>(
                    '/api/calculated_analytics/' + telemetry,
                    {
                        headers: new HttpHeaders().set('Content-Type', 'application/json'),
                        params: params
                    }
                )
        }
        else {
            let params = new HttpParams().set('fromDate', fromDate.toString()).set('toDate', toDate.toString()).set('entityId', entityId); //Create new HttpParams
            return this.http
                .get<Analytics>(
                    '/api/calculated_analytics/' + telemetry,
                    {
                        headers: new HttpHeaders().set('Content-Type', 'application/json'),
                        params: params
                    }
                )
        }

    }



    getDataToPlot(telemetry: string, fromDate: Date, toDate: Date, entityId: string) {

        if (fromDate == null) {
           fromDate=new Date("");
        }
        
        if (toDate == null) {
            toDate=new Date("");
         }
         console.log("toDate");
         console.log(toDate);
        let pipe = new DatePipe('en');
        let fDate = pipe.transform(fromDate, 'dd/MM/yyyy');
        let tDate = pipe.transform(toDate, 'dd/MM/yyyy');



        if (toDate.toString() != "" && fromDate.toString() != "") {
            let params = new HttpParams().set('fromDate', fDate.toString()).set('toDate', tDate.toString()).set('entityId', entityId); //Create new HttpParams
            return this.http
                .get<PlotData>(
                    '/api/plot/' + telemetry,
                    {
                        headers: new HttpHeaders().set('Content-Type', 'application/json'),
                        params: params
                    }
                )
        }
        else {
            let params = new HttpParams().set('fromDate', fromDate.toString()).set('toDate', toDate.toString()).set('entityId', entityId); //Create new HttpParams
            return this.http
                .get<PlotData>(
                    '/api/plot/' + telemetry,
                    {
                        headers: new HttpHeaders().set('Content-Type', 'application/json'),
                        params: params
                    }
                )
        }

    }


    fit_predict_with_prophet(telemetry: string, freq: string, periods: number){
        let params = new HttpParams().set('freq',freq).set('periods', periods); //Create new HttpParams
        return this.http
            .get<PlotData>(
                '/api/fit_predict_with_prophet/' + telemetry,
                {
                    headers: new HttpHeaders().set('Content-Type', 'application/json'),
                    params: params
                }
            )  
    }

}
