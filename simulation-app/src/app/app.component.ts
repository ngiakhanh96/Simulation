import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AppDrawLineResult } from './directives/draw-line.directive';
import { WidgetComponent } from './widget/widget.component';

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
  componentRef!: ComponentRef<any>;
  components: ComponentRef<any>[] = [];
  componentsSubs: Subscription[] = [];
  connections: Connection[] = [];
  lines: any[] = [];
  mousedownId: NodeJS.Timeout | null = null;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent(type: any) {
    const factory = this.resolver.resolveComponentFactory(WidgetComponent);

    this.componentRef = this.container.createComponent(factory);
    this.components.push(this.componentRef);
    this.componentRef.instance.type = type;

    this.componentsSubs.push(
      this.componentRef.instance.output.subscribe(
        (result: AppDrawLineResult) => {
          console.log(result);
          if (result.type === 'mousedown') {
            this.onMouseDownHandler(result);
          } else {
            this.onMouseUpHandler(result);
          }
        }
      )
    );
  }

  onMouseDownHandler(result: AppDrawLineResult) {
    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
    this.connections.push(<Connection>{
      elFrom: result.el,
      from: result.id,
      elTo: null,
      to: null,
    });
    if (this.mousedownId == null) {
      this.mousedownId = setInterval(() => {
        // this.reRenderLines();
        this.reRenderLines();
      }, 50);
    }
  }

  onMouseUpHandler(result: AppDrawLineResult) {
    if (this.mousedownId != null) {
      clearInterval(this.mousedownId);
      this.mousedownId = null;
    }
    const index = this.connections.findIndex((p) => p.to == null);
    if (index > -1 && this.connections[index].from !== result.id) {
      this.connections[index].elTo = result.el;
      this.connections[index].to = result.id;
    }
    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
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
