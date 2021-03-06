import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ViewChild } from '@angular/core';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MouseClickInfo } from '../directives/handle-mouse-click.directive';
import { Icon } from '../icon-list';
import { ComponentLocation } from '../plant-model';
export interface WidgetInfo {
  mouseEventInfo: MouseClickInfo;
  icon: Icon;
  id: string;
  elementRef: ElementRef<any>;
}

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit {
  @ViewChild('widget', { read: ElementRef })
  widgetRef: ElementRef<any> | null = null;
  @Input() id: string = '';
  @Input() dragPosition: ComponentLocation = { x: 0, y: 0 };
  @Input() icon: Icon | null = null;
  @Input() containerSelector: string = '';
  @Input() isSelecting: boolean = false;
  @Input() width: number = 120;
  @Input() height: number = 100;
  @Output() output: EventEmitter<WidgetInfo> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  onHandleClick(result: MouseClickInfo) {
    console.log(
      'onHandleClick: ' + this.dragPosition.x + ', ' + this.dragPosition.y
    );
    this.output.emit({
      mouseEventInfo: result,
      icon: this.icon!,
      id: this.id,
      elementRef: this.widgetRef!,
    });
  }

  onDragEnd($event: CdkDragEnd) {
    const currentDragPosition = $event.source.getFreeDragPosition();
    this.dragPosition.x = currentDragPosition.x;
    this.dragPosition.y = currentDragPosition.y;
  }
}
