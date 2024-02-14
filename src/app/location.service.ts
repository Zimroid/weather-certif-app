import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {
  private locationsList: string[] = [];
  private locationInited: WritableSignal<string[]> = signal(null);
  private locationAdded: WritableSignal<{ value: string }> = signal(null);
  private locationRemoved: WritableSignal<{ value: string }> = signal(null);

  constructor() {
    let savedLocations = localStorage.getItem(LOCATIONS);
    if (savedLocations) {
      this.locationsList = JSON.parse(savedLocations);
    }

    this.locationInited.set(this.locationsList);
  }

  public getLocationInitedSignal(): Signal<string[]> {
    return this.locationInited.asReadonly();
  }

  public getLocationAddedSignal(): Signal<{ value: string }> {
    return this.locationAdded.asReadonly();
  }

  public getLocationRemovedSignal(): Signal<{ value: string }> {
    return this.locationRemoved.asReadonly();
  }

  public addLocation(zipcode: string) {
    this.locationsList.push(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locationsList));
    this.locationAdded.set({ value: zipcode });
  }

  public removeLocation(zipcode: string) {
    let index = this.locationsList.indexOf(zipcode);
    if (index !== -1) {
      this.locationsList.splice(index, 1);
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locationsList));
      this.locationRemoved.set({ value: zipcode });
    }
  }
}
