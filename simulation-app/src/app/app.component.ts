import { OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
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
import { KeyPressInfo } from './directives/handle-key-press-directive';
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
  lineId: string;
  leaderLine: LeaderLine;
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

  private _selectingIconIds: string[] = [];
  get selectingIconIds(): string[] {
    return this._selectingIconIds;
  }

  set selectingIconIds(v: string[]) {
    if (v.length === 0) {
      this._selectingIconIds.forEach((p) => {
        this.componentDict[p].instance.isSelecting = false;
      });
    }
    this._selectingIconIds = v;
  }
  private _isMultipleSelectingMode: boolean = false;
  get isMultipleSelectingMode(): boolean {
    return this._isMultipleSelectingMode;
  }

  set isMultipleSelectingMode(v: boolean) {
    this._isMultipleSelectingMode = v;
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
    const toDeleteConnectionConditionFunc = (p: Connection) =>
      p.from != null &&
      p.to != null &&
      this.selectingIconIds.includes(p.from) &&
      this.selectingIconIds.includes(p.to);
    const toDeleteConnections = this.connections.filter((p) =>
      toDeleteConnectionConditionFunc(p)
    );
    toDeleteConnections.forEach((p) => p.line?.leaderLine.remove());
    this.connections = this.connections.filter(
      (p) => !toDeleteConnectionConditionFunc(p)
    );
  }

  onDeleteIcon() {
    const toDeleteConnectionConditionFunc = (p: Connection) =>
      p.from != null &&
      p.to != null &&
      (this.selectingIconIds.includes(p.from) ||
        this.selectingIconIds.includes(p.to));
    const toDeleteConnections = this.connections.filter((p) =>
      toDeleteConnectionConditionFunc(p)
    );
    toDeleteConnections.forEach((p) => p.line?.leaderLine.remove());
    this.connections = this.connections.filter(
      (p) => !toDeleteConnectionConditionFunc(p)
    );
    this.selectingIconIds.forEach((p) => this.componentDict[p].destroy());
    this.selectingIconIds = [];
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
          this.onMouseDownHandler(result);
        } else {
          this.onMouseUpHandler(result);
        }
      })
    );
  }

  @HostListener('mouseup', ['$event'])
  onMouseDown(event: MouseEvent): void {
    console.log('parent: ' + event);
    if ((event.target as any).nodeName !== 'BUTTON') {
      this.selectingIconIds = [];
    }
  }

  onKeyPress($event: KeyPressInfo) {
    this.isMultipleSelectingMode = $event.type === 'keydown' ? true : false;
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
    if (index > -1) {
      if (this.connections[index].from === result.id) {
        if (!this.isMultipleSelectingMode) {
          this.selectingIconIds = [];
        }
        this.addSelectingIconId(result.id);
      } else {
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
    }

    this.connections = this.connections.filter(
      (p) => p.from != null && p.to != null
    );
    this.selectedIcon = result.icon;
    this.reRenderLines();
  }

  addSelectingIconId(id: string) {
    this.selectingIconIds.push(id);
    this.componentDict[id].instance.isSelecting = true;
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
