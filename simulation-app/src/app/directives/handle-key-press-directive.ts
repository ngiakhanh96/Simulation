import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

export interface KeyPressInfo {
  type: 'keydown' | 'keyup';
}

@Directive({
  selector: '[appHandleKeyPress]',
})
export class HandleKeyPressDirective {
  @Input('appHandleKeyPress') eventKey: string = 'Control';
  @Output() keyPress: EventEmitter<KeyPressInfo> = new EventEmitter();
  constructor() {}
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.handleKeyboardAction('keydown');
    console.log(event);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.handleKeyboardAction('keyup');
    console.log(event);
  }

  handleKeyboardAction(actionType: 'keydown' | 'keyup') {
    this.keyPress.emit({
      type: actionType,
    });
  }
}
