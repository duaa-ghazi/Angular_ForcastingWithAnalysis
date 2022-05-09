import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { HomeComponent } from './home/home.component';
import { StartComponent } from './start/start.component';
import { WorkspaceComponent } from './workspace/workspace.component';

const routes: Routes = [

  {
    path: 'workspace/:telemetry', component: WorkspaceComponent,
    children: [
      {path: '', component: StartComponent},
      { path: 'line-chart', component: LineChartComponent },
      { path: 'bar-chart', component: BarChartComponent },
      { path: 'pie-chart', component: PieChartComponent }

    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
