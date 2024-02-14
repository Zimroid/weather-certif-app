import { Component, Input, Output, Signal, computed, signal } from '@angular/core';
import { Tab } from './tabs.types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent<T> {
  @Input({ required: true }) public tabs: Signal<Tab<T>[]>;
  @Output() public tabClosed = new Subject<Tab<T>>();
  protected selectedTab: Signal<Tab<T>>;
  protected selectedIndex = signal<number>(0);

  constructor() {
    this.selectedTab = computed(() => {
      return this.tabs()?.[this.selectedIndex()];
    });
  }

  public open(index: number): void {
    this.selectedIndex.set(index);
  }

  public close(index: number): void {
    this.tabClosed.next(this.tabs()[index]);
    if (index <= this.selectedIndex() && this.selectedIndex() !== 0) {
      this.selectedIndex.update(oldIndex => { return oldIndex - 1 });
    }
  }
}
