import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WidgetComponent } from './widget/widget.component';
import { DrawLineDirective } from './directives/draw-line.directive';
import { PropertyTabComponent } from './property-tab/property-tab.component';

@NgModule({
  declarations: [
    AppComponent,
    WidgetComponent,
    DrawLineDirective,
    PropertyTabComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, DragDropModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
