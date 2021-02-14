import { OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
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
import { ComponentLocation, PlantModel, PlantModel1 } from './plant-model';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('placeholder', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  containerClassName: string = 'example-boundary';

  componentRef!: ComponentRef<WidgetComponent>;
  componentDict: Dictionary<ComponentRef<WidgetComponent>> = {};
  componentsSubs: Subscription[] = [];
  connections: Connection[] = [];
  mousedownId: NodeJS.Timeout | null = null;
  selectedIcon: Icon | null = null;
  iconDict: Dictionary<Icon> = {};
  plantModel: PlantModel | null = null;

  private _deletingConnectionFromComponent: string | null = null;
  private _isDeletingConnectionMode: boolean = false;
  get isDeletingConnectionMode(): boolean {
    return this._isDeletingConnectionMode;
  }

  set isDeletingConnectionMode(v: boolean) {
    this._isDeletingConnectionMode = v;
    if (!this._isDeletingConnectionMode) {
      this._deletingConnectionFromComponent = null;
    }
  }

  private _isDeletingIconMode: boolean = false;
  get isDeletingIconMode(): boolean {
    return this._isDeletingIconMode;
  }

  set isDeletingIconMode(v: boolean) {
    this._isDeletingIconMode = v;
  }

  constructor(private resolver: ComponentFactoryResolver) {}
  ngOnInit(): void {
    this.iconDict = Utils.toDictionary(ICONS, (p) => p.id);
    this.plantModel = PlantModel1;

    const plantComponents = this.plantModel!.plantComponents;
    plantComponents.forEach((p) => {
      this.createComponent(p.id, this.iconDict[p.iconId], p.location);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const plantConnections = this.plantModel!.plantConnections;
      this.connections = plantConnections.map((p) => {
        return <Connection>{
          elFrom: this.componentDict[p.from].instance.widgetRef,
          from: p.from,
          elTo: this.componentDict[p.to].instance.widgetRef,
          to: p.to,
          line: <LineInfo>{
            lineId: p.lineId,
            leaderLine: this.createNewConnector(
              this.componentDict[p.from].instance.widgetRef!.nativeElement,
              this.componentDict[p.to].instance.widgetRef!.nativeElement
            ),
          },
        };
      });
    });
  }

  onDeleteConnection() {
    this.isDeletingConnectionMode = !this.isDeletingConnectionMode;
    console.log(this.isDeletingConnectionMode);
    this.isDeletingIconMode = false;
  }

  onDeleteIcon() {
    this.isDeletingIconMode = !this.isDeletingIconMode;
    console.log(this.isDeletingIconMode);
    this.isDeletingConnectionMode = false;
  }

  createComponent(
    id: string | null,
    icon: Icon,
    location: ComponentLocation = { x: 0, y: 0 }
  ) {
    const factory = this.resolver.resolveComponentFactory(WidgetComponent);

    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.id = id == null ? Utils.generateNewId() : id;
    this.componentRef.instance.icon = icon;
    this.componentRef.instance.containerSelector =
      '.' + this.containerClassName;
    this.componentRef.instance.dragPosition = location;
    this.componentDict[this.componentRef.instance.id] = this.componentRef;

    this.componentsSubs.push(
      this.componentRef.instance.output.subscribe((result: WidgetInfo) => {
        console.log(result);
        if (this.mousedownId != null) {
          clearInterval(this.mousedownId);
          this.mousedownId = null;
        }
        if (result.mouseEventInfo.type === 'mousedown') {
          if (this.isDeletingConnectionMode) {
            this._deletingConnectionFromComponent = result.id;
          } else {
            this.onMouseDownHandler(result);
          }
        } else {
          if (this.isDeletingConnectionMode) {
            if (this._deletingConnectionFromComponent) {
              var index = this.connections.findIndex(
                (p) =>
                  p.from === this._deletingConnectionFromComponent &&
                  p.to === result.id &&
                  p.line != null
              );
              if (index > -1) {
                this.connections[index].line!.leaderLine.remove();
                this.connections.splice(index, 1);
              }
              this._deletingConnectionFromComponent = null;
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
            this.componentDict[result.id].destroy();
            delete this.componentDict[result.id];
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
      elFrom: result.elementRef,
      from: result.id,
      elTo: null,
      to: null,
      line: null,
    });

    this.mousedownId = setInterval(() => {
      this.reRenderLines();
    }, 50);
  }

  onMouseUpHandler(result: WidgetInfo) {
    const index = this.connections.findIndex((p) => p.to == null);
    if (index > -1 && this.connections[index].from !== result.id) {
      this.connections[index].elTo = result.elementRef;
      this.connections[index].to = result.id;
      var line = this.createNewConnector(
        this.connections[index].elFrom!.nativeElement,
        this.connections[index].elTo!.nativeElement
      );
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
        p.line!.leaderLine.position();
      });
  }

  createNewConnector(startElement: Element, endElement: Element): LeaderLine {
    return new LeaderLine(startElement, endElement, {
      dash: { animation: true },
    });
  }

  ngOnDestroy() {
    this.componentRef.destroy();
    this.componentsSubs.forEach((p) => p.unsubscribe());
  }
}
