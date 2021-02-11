import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AppDrawLineResult } from '../directives/draw-line.directive';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit {
  @Input() type: string = 'success';
  @Output() output: EventEmitter<AppDrawLineResult> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  onHandleClick(result: AppDrawLineResult) {
    this.output.emit(result);
  }
}
