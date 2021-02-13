import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppDrawLineResult } from '../directives/draw-line.directive';
import { Utils } from '../helpers/Utils';
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
  id: string = Utils.generateNewId();
  @Input() dragPosition = { x: 0, y: 0 };
  @Input() icon: Icon | null = null;
  @Output() output: EventEmitter<WidgetInfo> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  onHandleClick(result: AppDrawLineResult) {
    console.log(this.dragPosition);
    this.output.emit({
      icon: this.icon!,
      mouseEventInfo: result,
      id: this.id,
    });
  }
}
