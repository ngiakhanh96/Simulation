import { Component, Input, OnInit } from '@angular/core';
import { Icon } from '../icon-list';

@Component({
  selector: 'app-property-tab',
  templateUrl: './property-tab.component.html',
  styleUrls: ['./property-tab.component.scss'],
})
export class PropertyTabComponent implements OnInit {
  @Input() iconProperties: Icon | null = null;
  constructor() {}

  ngOnInit(): void {}
}
