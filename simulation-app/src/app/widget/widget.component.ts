import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppDrawLineResult } from '../directives/draw-line.directive';
import { Icon } from '../icon-list';
export interface WidgetInfo {
  mouseEventInfo: AppDrawLineResult;
  icon: Icon;
  id: string;
}

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit {
  id: string = Date.now().toString();
  @Input() icon: Icon | null = null;
  @Output() output: EventEmitter<WidgetInfo> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  onHandleClick(result: AppDrawLineResult) {
    this.output.emit({
      icon: this.icon!,
      mouseEventInfo: result,
      id: this.id,
    });
  }
}
