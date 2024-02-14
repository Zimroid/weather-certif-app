import { AfterViewInit, Component, computed, signal, Signal, ViewChild, ViewContainerRef } from '@angular/core';
import { WeatherService } from "../weather.service";
import { LocationService } from "../location.service";
import { Router } from "@angular/router";
import { ConditionsAndZip } from '../conditions-and-zip.type';
import { Tab } from 'app/tabs/tabs.types';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent implements AfterViewInit {
  @ViewChild('locationTemplate') private locationTemplate: ViewContainerRef;

  protected tabs: Signal<Tab<ConditionsAndZip>[]> = computed(() => {
    this.isTemplateReady(); // To be sure to refresh when template is ready
    return this.currentConditionsByZip().map((conditionsAndZip) => {
      // The list of tabs is based on the list of currentConditionsByZip
      return {
        name: `${conditionsAndZip.data.name} (${conditionsAndZip.zip})`,
        template: this.locationTemplate,
        data: conditionsAndZip
      }
    })
  })

  private isTemplateReady = signal(false);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();

  constructor(
    private readonly weatherService: WeatherService,
    private readonly router: Router,
    private readonly locationService: LocationService
  ) { }

  public ngAfterViewInit(): void {
    this.isTemplateReady.set(true);
  }

  protected showForecast(zipcode: string) {
    this.router.navigate(['/forecast', zipcode])
  }

  protected close(closedTab: Tab<ConditionsAndZip>): void {
    this.locationService.removeLocation(closedTab.data.zip)
  }
}
