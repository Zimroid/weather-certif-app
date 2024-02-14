import { Injectable, Signal, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrentConditions } from './current-conditions/current-conditions.type';
import { ConditionsAndZip } from './conditions-and-zip.type';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { TimedCacheService } from './timed-cache.service';

@Injectable()
export class WeatherService {
  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);
  private currentForecast = signal<Forecast>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly locationService: LocationService,
    private readonly cacheService: TimedCacheService
  ) {
    effect(() => {
      const locationInitedSignal = this.locationService.getLocationInitedSignal();
      locationInitedSignal()?.forEach(location => {
        this.addCurrentConditions(location);
      });
    }, { allowSignalWrites: true });

    effect(() => {
      const locationAddedSignal = this.locationService.getLocationAddedSignal();
      const location = locationAddedSignal();
      if (location) {
        this.addCurrentConditions(location.value);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const locationRemoveddSignal = this.locationService.getLocationRemovedSignal();
      const location = locationRemoveddSignal();
      if (location) {
        this.removeCurrentConditions(location.value);
      }
    }, { allowSignalWrites: true });
  }

  private addCurrentConditions(zipcode: string): void {
    const cachedResponse = this.cacheService.retrieveValue<CurrentConditions>(`${zipcode}-conditions`);
    if (cachedResponse) {
      this.updateCurrentConditions(zipcode, cachedResponse);
      return;
    }

    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    const observable = this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
      .subscribe(data => {
        observable.unsubscribe();
        this.cacheService.cacheValue(`${zipcode}-conditions`, data, /* 5000 */ /* Customisable cache time */);
        this.updateCurrentConditions(zipcode, data);
      });
  }

  private updateCurrentConditions(zip: string, data: CurrentConditions): void {
    this.currentConditions.update(conditions => [...conditions, { zip, data }]);
  }

  private updateCurrentForecast(data: Forecast): void {
    this.currentForecast.update(() => { return { ...data } });
  }

  private removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return [...conditions];
    })
  }

  public getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  public getCurrentForecast(): Signal<Forecast> {
    return this.currentForecast.asReadonly();
  }

  public getForecast(zipcode: string): void {
    const cachedResponse = this.cacheService.retrieveValue<Forecast>(`${zipcode}-forecast`);
    if (cachedResponse) {
      this.updateCurrentForecast(cachedResponse);
      return;
    }

    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    const observable = this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
      .subscribe(data => {
        observable.unsubscribe();
        this.cacheService.cacheValue(`${zipcode}-forecast`, data);
        this.updateCurrentForecast(data);
      });
  }

  public getWeatherIcon(id: number): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }
}
