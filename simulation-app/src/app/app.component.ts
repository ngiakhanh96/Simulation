import {
  NgZone,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit,
} from '@angular/core';
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

export interface Point {
  x: number;
  y: number;
}
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
export class Square {
  private color = 'red';
  private motionPoint: Point = { x: 0, y: 0 };
  private distance: number = 10;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private startPoint: Point = { x: 500, y: 300 },
    private endPoint: Point = { x: 400, y: 100 }
  ) {}

  private calculateMotionPointY() {
    if (this.endPoint.y >= this.startPoint.y) {
      if (this.motionPoint.y < this.endPoint.y) {
        this.motionPoint.y++;
      } else {
        this.motionPoint.y = this.endPoint.y;
      }
    } else {
      if (this.motionPoint.y > this.endPoint.y) {
        this.motionPoint.y--;
      } else {
        this.motionPoint.y = this.endPoint.y;
      }
    }
  }

  private calculateMotionPointX() {
    if (this.endPoint.x >= this.startPoint.x) {
      if (this.motionPoint.x < this.endPoint.x) {
        this.motionPoint.x++;
      } else {
        this.motionPoint.x = this.endPoint.x;
      }
    } else {
      if (this.motionPoint.x > this.endPoint.x) {
        this.motionPoint.x--;
      } else {
        this.motionPoint.x = this.endPoint.x;
      }
    }
  }

  draw() {
    this.ctx.fillStyle = this.color;
    const deltaX = Math.abs(this.endPoint.x - this.startPoint.x);
    const deltaY = Math.abs(this.endPoint.y - this.startPoint.y);
    this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
    if (deltaX >= deltaY) {
      this.ctx.lineTo(this.endPoint.x, this.startPoint.y);
      this.ctx.moveTo(this.endPoint.x, this.startPoint.y);
      if (
        (this.motionPoint.x === 0 && this.motionPoint.y === 0) ||
        (this.motionPoint.x ===
          (this.endPoint.x >= this.startPoint.x
            ? this.endPoint.x + this.distance
            : this.endPoint.x - this.distance - 5) &&
          this.motionPoint.y === this.endPoint.y)
      ) {
        this.motionPoint.x = this.startPoint.x;
        if (this.endPoint.y >= this.startPoint.y) {
          this.motionPoint.y = this.startPoint.y - this.distance - 5;
        } else {
          this.motionPoint.y = this.startPoint.y + this.distance;
        }
      } else if (this.endPoint.x >= this.startPoint.x) {
        if (this.motionPoint.x < this.endPoint.x + this.distance) {
          this.motionPoint.x++;
        } else {
          this.calculateMotionPointY();
        }
      } else {
        if (this.motionPoint.x > this.endPoint.x - this.distance - 5) {
          this.motionPoint.x--;
        } else {
          this.calculateMotionPointY();
        }
      }
    } else {
      this.ctx.lineTo(this.startPoint.x, this.endPoint.y);
      this.ctx.moveTo(this.startPoint.x, this.endPoint.y);
      if (
        (this.motionPoint.x === 0 && this.motionPoint.y === 0) ||
        (this.motionPoint.y ===
          (this.endPoint.y >= this.startPoint.y
            ? this.endPoint.y - this.distance - 5
            : this.endPoint.y + this.distance) &&
          this.motionPoint.x === this.endPoint.x)
      ) {
        this.motionPoint.y = this.startPoint.y;
        if (this.startPoint.x >= this.endPoint.x) {
          this.motionPoint.x = this.startPoint.x - this.distance - 5;
        } else {
          this.motionPoint.x = this.startPoint.x + this.distance;
        }
      } else if (this.endPoint.y >= this.startPoint.y) {
        if (this.motionPoint.y < this.endPoint.y - this.distance - 5) {
          this.motionPoint.y++;
        } else {
          this.calculateMotionPointX();
        }
      } else {
        if (this.motionPoint.y > this.endPoint.y + this.distance) {
          this.motionPoint.y--;
        } else {
          this.calculateMotionPointX();
        }
      }
    }
    this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    this.ctx.stroke();
    this.ctx.fillRect(this.motionPoint.x, this.motionPoint.y, 5, 5);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('placeholder', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  @ViewChild('mainContainer', { static: true })
  mainContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('canvas', { static: true })
  canvasArea!: ElementRef<HTMLCanvasElement>;

  canvasCtx: CanvasRenderingContext2D | null = null;
  reRenderCanvasId: NodeJS.Timeout | null = null;

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
    this._selectingIconIds.forEach((p) => {
      this.componentDict[p].instance.isSelecting = false;
    });
    this._selectingIconIds = [];
    v.forEach((p) => this.addSelectingIconId(p));
  }
  private _isMultipleSelectingMode: boolean = false;
  get isMultipleSelectingMode(): boolean {
    return this._isMultipleSelectingMode;
  }

  set isMultipleSelectingMode(v: boolean) {
    this._isMultipleSelectingMode = v;
  }

  private squares: Square[] = [];
  constructor(
    private resolver: ComponentFactoryResolver,
    private ngZone: NgZone
  ) {}
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

      this.canvasCtx = this.canvasArea.nativeElement.getContext('2d')!;
      this.canvasCtx.fillStyle = 'red';
      this.squares = [new Square(this.canvasCtx!)];
      this.onResizeCanvas();
    });
  }

  reDrawCanvas() {
    this.ngZone.runOutsideAngular(() => {
      clearInterval(this.reRenderCanvasId!);
      this.reRenderCanvasId = setInterval(() => {
        this.canvasCtx!.clearRect(
          0,
          0,
          this.canvasCtx!.canvas.width,
          this.canvasCtx!.canvas.height
        );
        this.squares.forEach((square: Square) => {
          square.draw();
        });
      }, 10);
    });
  }

  onResizeCanvas() {
    this.canvasCtx!.canvas.width = this.mainContainer!.nativeElement.offsetWidth;
    this.canvasCtx!.canvas.height = this.mainContainer!.nativeElement.offsetHeight;
    this.reDrawCanvas();
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
        clearInterval(this.mousedownId!);

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

    this.ngZone.runOutsideAngular(() => {
      this.mousedownId = setInterval(() => {
        this.reRenderLines();
      }, 50);
    });
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
    clearInterval(this.mousedownId!);
    clearInterval(this.reRenderCanvasId!);
  }
}
