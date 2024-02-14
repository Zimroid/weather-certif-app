import { ViewContainerRef } from "@angular/core";

export interface Tab<T> {
    name: string;
    template: ViewContainerRef;
    data: T;
}