import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

export interface MouseClickInfo {
  type: 'mousedown' | 'mouseup';
}

@Directive({
  selector: '[appHandleMouseClick]',
})
export class HandleMouseClickDirective {
  @Output() click: EventEmitter<MouseClickInfo> = new EventEmitter();
  constructor(private el: ElementRef) {}
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.handleMouseAction('mousedown');
    console.log(event);
    event.stopPropagation();
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.handleMouseAction('mouseup');
    console.log(event);
    event.stopPropagation();
  }

  handleMouseAction(actionType: 'mousedown' | 'mouseup') {
    this.click.emit({
      type: actionType,
    });
  }
}
