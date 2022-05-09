import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TelemetryService } from './telemetry.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

telemetries:string[]
constructor(private telemetryService:TelemetryService ,
  private route : ActivatedRoute ,
  private router :Router ){
}


ngOnInit() {
  
  this.telemetryService.getTelemetryNames().subscribe(
    (response) => {  //next() callback
      console.log('response received')
      this.telemetries = response;
      console.log(this.telemetries)
    })
}

onClickTelemetry(telemetry){
 console.log(telemetry);
 this.router.navigate(['./workspace/'+telemetry]);
}

}
