import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

export interface AppDrawLineResult {
  type: 'mousedown' | 'mouseup';
  id: string;
  el: ElementRef;
}

@Directive({
  selector: '[appDrawLine]',
})
export class DrawLineDirective {
  id: string = Date.now().toString();
  @Output() result: EventEmitter<AppDrawLineResult> = new EventEmitter();
  constructor(private el: ElementRef) {}
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.handleMouseAction('mousedown');
    console.log(event);
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.handleMouseAction('mouseup');
    console.log(event);
  }

  handleMouseAction(actionType: 'mousedown' | 'mouseup') {
    this.result.emit({
      type: actionType,
      id: this.id,
      el: this.el,
    });
  }
}
