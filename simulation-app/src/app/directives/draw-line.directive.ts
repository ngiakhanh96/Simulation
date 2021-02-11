import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

export interface AppDrawLineResult {
  type: 'mousedown' | 'mouseup';
  el: ElementRef;
}

@Directive({
  selector: '[appDrawLine]',
})
export class DrawLineDirective {
  @Output() click: EventEmitter<AppDrawLineResult> = new EventEmitter();
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
    this.click.emit({
      type: actionType,
      el: this.el,
    });
  }
}
