import { Component, Signal } from '@angular/core';
import { WeatherService } from '../weather.service';
import { ActivatedRoute } from '@angular/router';
import { Forecast, List } from './forecast.type';

@Component({
  selector: 'app-forecasts-list',
  templateUrl: './forecasts-list.component.html',
  styleUrls: ['./forecasts-list.component.css']
})
export class ForecastsListComponent {
  private zipcode: string;
  protected currentForecast: Signal<Forecast>;

  constructor(
    private readonly weatherService: WeatherService,
    private readonly route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.zipcode = params['zipcode'];

      this.weatherService.getForecast(this.zipcode)
      this.currentForecast = this.weatherService.getCurrentForecast();
    });
  }

  public getWeatherIcon(listForecast: List): string {
    return this.weatherService.getWeatherIcon(listForecast.weather[0].id)
  }
}
