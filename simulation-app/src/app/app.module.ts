import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WidgetComponent } from './widget/widget.component';
import { HandleMouseClickDirective } from './directives/handle-mouse-click.directive';
import { PropertyTabComponent } from './property-tab/property-tab.component';
import { CdkScrollableModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    WidgetComponent,
    HandleMouseClickDirective,
    PropertyTabComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    // TODO consider remove if not work
    CdkScrollableModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
