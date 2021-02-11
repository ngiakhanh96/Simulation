import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AppDrawLineResult } from './directives/draw-line.directive';
import { Icon, ICONS } from './icon-list';
import { WidgetComponent, WidgetInfo } from './widget/widget.component';

export interface Connection {
  elFrom: ElementRef | null;
  from: string | null;
  elTo: ElementRef | null;
  to: string | null;
}

export interface LineConnection {
  elFrom: ElementRef | null;
  from: string | null;
  elTo: ElementRef | null;
  to: string | null;
}

declare var LeaderLine: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('placeholder', { read: ViewContainerRef })
  container!: ViewContainerRef;
  componentRef!: ComponentRef<WidgetComponent>;
  components: ComponentRef<any>[] = [];
  componentsSubs: Subscription[] = [];
  connections: Connection[] = [];
  lines: any[] = [];
  mousedownId: NodeJS.Timeout | null = null;
  selectedIcon: Icon | null = null;
  iconList: Icon[] = ICONS;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent(icon: Icon) {
    const factory = this.resolver.resolveComponentFactory(WidgetComponent);

    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.icon = icon;
    this.components.push(this.componentRef);

    this.componentsSubs.push(
      this.componentRef.instance.output.subscribe((result: WidgetInfo) => {
        console.log(result);
        if (result.mouseEventInfo.type === 'mousedown') {
          this.onMouseDownHandler(result);
        } else {
          this.onMouseUpHandler(result);
        }
      })
    );
  }

  onMouseDownHandler(result: WidgetInfo) {
    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
    this.connections.push(<Connection>{
      elFrom: result.mouseEventInfo.el,
      from: result.id,
      elTo: null,
      to: null,
    });
    if (this.mousedownId == null) {
      this.mousedownId = setInterval(() => {
        this.reRenderLines();
      }, 50);
    }
  }

  onMouseUpHandler(result: WidgetInfo) {
    if (this.mousedownId != null) {
      clearInterval(this.mousedownId);
      this.mousedownId = null;
    }
    const index = this.connections.findIndex((p) => p.to == null);
    if (index > -1 && this.connections[index].from !== result.id) {
      this.connections[index].elTo = result.mouseEventInfo.el;
      this.connections[index].to = result.id;
    }
    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
    this.selectedIcon = result.icon;
    this.reRenderLines();
  }

  reRenderLines() {
    this.lines.forEach((p) => p.remove());
    this.lines = [];
    this.connections
      .filter((p) => p.from != null && p.to != null)
      .forEach((p) => {
        var line = new LeaderLine(
          p.elFrom!.nativeElement,
          p.elTo!.nativeElement,
          {
            dash: { animation: true },
          }
        );
        line.path = 'grid';
        this.lines.push(line);
      });
  }

  ngOnDestroy() {
    this.componentRef.destroy();
    this.componentsSubs.forEach((p) => p.unsubscribe());
  }
}
