import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Utils } from './helpers/Utils';
import { Icon, ICONS } from './icon-list';
import { WidgetComponent, WidgetInfo } from './widget/widget.component';

export interface Connection {
  elFrom: ElementRef | null;
  from: string | null;
  elTo: ElementRef | null;
  to: string | null;
  line: LineInfo | null;
}

export interface LineInfo {
  lineId: string | null;
  leaderLine: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('placeholder', { read: ViewContainerRef })
  container!: ViewContainerRef;

  componentRef!: ComponentRef<WidgetComponent>;
  components: Dictionary<ComponentRef<any>> = {};
  componentsSubs: Subscription[] = [];
  connections: Connection[] = [];
  mousedownId: NodeJS.Timeout | null = null;
  selectedIcon: Icon | null = null;
  iconList: Icon[] = ICONS;

  isDeletingConnectionMode: boolean = false;
  deletingConnection: Connection = <Connection>{
    elFrom: null,
    elTo: null,
    from: null,
    to: null,
    line: null,
  };

  isDeletingIconMode: boolean = false;
  deletingIcon: ElementRef | null = null;
  constructor(private resolver: ComponentFactoryResolver) {}

  onDeleteConnection() {
    this.isDeletingConnectionMode = !this.isDeletingConnectionMode;
    console.log(this.isDeletingConnectionMode);
    if (this.isDeletingConnectionMode) {
      this.isDeletingIconMode = false;
      this.deletingIcon = null;
    }
  }

  onDeleteIcon() {
    this.isDeletingIconMode = !this.isDeletingIconMode;
    console.log(this.isDeletingIconMode);
    if (this.isDeletingIconMode) {
      this.isDeletingConnectionMode = false;
      this.deletingConnection = <Connection>{
        elFrom: null,
        elTo: null,
        from: null,
        to: null,
        line: null,
      };
    }
  }

  createComponent(icon: Icon) {
    const factory = this.resolver.resolveComponentFactory(WidgetComponent);

    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.icon = icon;
    this.components[this.componentRef.instance.id] = this.componentRef;

    this.componentsSubs.push(
      this.componentRef.instance.output.subscribe((result: WidgetInfo) => {
        console.log(result);
        if (result.mouseEventInfo.type === 'mousedown') {
          if (this.isDeletingConnectionMode) {
            this.deletingConnection.from = result.id;
          } else {
            this.onMouseDownHandler(result);
          }
        } else {
          if (this.mousedownId != null) {
            clearInterval(this.mousedownId);
            this.mousedownId = null;
          }
          if (this.isDeletingConnectionMode) {
            if (this.deletingConnection.from) {
              var index = this.connections.findIndex(
                (p) =>
                  p.from === this.deletingConnection.from &&
                  p.to === result.id &&
                  p.line != null
              );
              if (index > -1) {
                this.connections[index].line!.leaderLine.remove();
                this.connections.splice(index, 1);
              }
              this.deletingConnection.from = null;
            }
          } else if (this.isDeletingIconMode) {
            this.connections.forEach((p) => {
              if (p.from === result.id || p.to === result.id) {
                p.line?.leaderLine.remove();
              }
            });
            this.connections = this.connections.filter(
              (p) => p.from !== result.id && p.to !== result.id
            );
            this.components[result.id].destroy();
            delete this.components[result.id];
          } else {
            this.onMouseUpHandler(result);
          }
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
      line: null,
    });
    if (this.mousedownId == null) {
      this.mousedownId = setInterval(() => {
        this.reRenderLines();
      }, 50);
    }
  }

  onMouseUpHandler(result: WidgetInfo) {
    const index = this.connections.findIndex((p) => p.to == null);
    if (index > -1 && this.connections[index].from !== result.id) {
      this.connections[index].elTo = result.mouseEventInfo.el;
      this.connections[index].to = result.id;
      var line = new LeaderLine(
        this.connections[index].elFrom!.nativeElement,
        this.connections[index].elTo!.nativeElement,
        {
          dash: { animation: true },
        }
      );
      line.path = 'grid';
      this.connections[index].line = <LineInfo>{
        lineId: Utils.generateNewId(),
        leaderLine: line,
      };
    }
    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
    this.selectedIcon = result.icon;
    this.reRenderLines();
  }

  reRenderLines() {
    this.connections
      .filter((p) => p.line != null)
      .forEach((p) => {
        p.line!.leaderLine.remove();
        var line = new LeaderLine(
          p.elFrom!.nativeElement,
          p.elTo!.nativeElement,
          {
            dash: { animation: true },
          }
        );
        line.path = 'grid';
        p.line = <LineInfo>{
          lineId: Utils.generateNewId(),
          leaderLine: line,
        };
      });
  }

  ngOnDestroy() {
    this.componentRef.destroy();
    this.componentsSubs.forEach((p) => p.unsubscribe());
  }
}
