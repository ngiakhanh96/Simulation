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
  square: Square;
}
export class Square {
  private color = 'red';
  private motionPoint: Point | null = null;
  private startPoint: Point = { x: 500, y: 300 };
  private endPoint: Point = { x: 400, y: 100 };
  private constructedPoints: Point[] = [];
  private animationPoints: Point[] = [];
  private image: HTMLImageElement = new Image();

  constructor(
    private ctx: CanvasRenderingContext2D,
    private startComponent: ComponentRef<WidgetComponent>,
    private endComponent: ComponentRef<WidgetComponent>,
    private componentWidth: number,
    private componentHeight: number,
    imageSrc: string = '../assets/icons/conveyor.svg',
    public imageWidth: number = 5,
    public imageHeight: number = 5,
    public distance: number = 10,
    public followXAxis?: boolean
  ) {
    this.image.src = 'imageSrc';
    this.rePosition();
  }

  // private calculateMotionPointY() {
  //   if (this.endPoint.y >= this.startPoint.y) {
  //     if (this.motionPoint.y < this.endPoint.y) {
  //       this.motionPoint.y++;
  //     } else {
  //       this.motionPoint.y = this.endPoint.y;
  //     }
  //   } else {
  //     if (this.motionPoint.y > this.endPoint.y) {
  //       this.motionPoint.y--;
  //     } else {
  //       this.motionPoint.y = this.endPoint.y;
  //     }
  //   }
  // }

  // private calculateMotionPointX() {
  //   if (this.endPoint.x >= this.startPoint.x) {
  //     if (this.motionPoint.x < this.endPoint.x) {
  //       this.motionPoint.x++;
  //     } else {
  //       this.motionPoint.x = this.endPoint.x;
  //     }
  //   } else {
  //     if (this.motionPoint.x > this.endPoint.x) {
  //       this.motionPoint.x--;
  //     } else {
  //       this.motionPoint.x = this.endPoint.x;
  //     }
  //   }
  // }

  rePosition() {
    this.startPoint.x =
      this.startComponent.instance.dragPosition.x + this.componentWidth / 2;
    this.startPoint.y =
      this.startComponent.instance.dragPosition.y + this.componentHeight / 2;
    this.endPoint.x =
      this.endComponent.instance.dragPosition.x + this.componentWidth / 2;
    this.endPoint.y =
      this.endComponent.instance.dragPosition.y + this.componentHeight / 2;
    this.motionPoint = null;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    const xDistance = this.endPoint.x - this.startPoint.x;
    const yDistance = this.endPoint.y - this.startPoint.y;

    const moveDown = yDistance === 0 ? null : yDistance > 0;
    const moveRight = xDistance === 0 ? null : xDistance > 0;

    const deltaX = Math.abs(this.endPoint.x - this.startPoint.x);
    const deltaY = Math.abs(this.endPoint.y - this.startPoint.y);
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    const chosenFollowXAxis =
      this.followXAxis == null ||
      deltaX <= this.componentWidth / 2 ||
      deltaY <= this.componentHeight / 2
        ? deltaX >= deltaY
        : this.followXAxis;

    this.buildConstructionPoints(
      chosenFollowXAxis,
      moveDown,
      moveRight,
      deltaX,
      deltaY
    );

    this.drawGridLine();
    this.buildAnimationPoints(moveDown, moveRight);
    this.drawAnimation();
  }

  buildAnimationPoints(moveDown: boolean | null, moveRight: boolean | null) {
    const animationPoints: Point[] = [];
    for (let index = 0; index < this.constructedPoints.length - 1; index++) {
      const point = this.constructedPoints[index];
      const nextPoint = this.constructedPoints[index + 1];
      const isLastPoint = index === this.constructedPoints.length - 2;
      const isHorizontal = nextPoint.y === point.y;

      if (index === 0) {
        if (isHorizontal) {
          animationPoints.push({
            x: moveRight
              ? point.x - this.imageWidth
              : point.x + this.imageWidth,
            y:
              moveDown === true || moveDown == null
                ? point.y - this.distance - this.imageHeight
                : point.y + this.distance,
          });
        } else {
          animationPoints.push({
            x:
              moveRight === true || moveRight == null
                ? point.x + this.distance
                : point.x - this.distance - this.imageWidth,
            y: moveDown
              ? point.y - this.imageHeight
              : point.y + this.imageHeight,
          });
        }
      }

      const animationPoint: Point = { x: 0, y: 0 };
      if (isHorizontal) {
        // moveRight here is always not null
        if (moveRight) {
          if (isLastPoint) {
            animationPoint.x = nextPoint.x;
          } else {
            animationPoint.x = nextPoint.x + this.distance;
          }
        } else {
          if (isLastPoint) {
            animationPoint.x = nextPoint.x - this.imageWidth;
          } else {
            animationPoint.x = nextPoint.x - this.distance - this.imageWidth;
          }
        }

        if (moveDown === true || moveDown == null) {
          animationPoint.y = nextPoint.y - this.distance - this.imageHeight;
        } else {
          animationPoint.y = nextPoint.y + this.distance;
        }
      } else {
        if (moveRight === true || moveRight == null) {
          animationPoint.x = nextPoint.x + this.distance;
        } else {
          animationPoint.x = nextPoint.x - this.distance - this.imageWidth;
        }

        if (isLastPoint) {
          animationPoint.y = nextPoint.y;
        } else {
          // moveDown here is always not null
          if (moveDown) {
            animationPoint.y = nextPoint.y - this.distance - this.imageHeight;
          } else {
            animationPoint.y = nextPoint.y + this.distance;
          }
        }
      }
      animationPoints.push(animationPoint);
    }
    this.animationPoints = animationPoints;
  }

  drawAnimation() {
    const firstPoint = this.animationPoints[0];
    const lastPoint = this.animationPoints[this.animationPoints.length - 1];
    if (
      this.motionPoint == null ||
      (this.motionPoint.x === lastPoint.x && this.motionPoint.y === lastPoint.y)
    ) {
      this.motionPoint = {
        x: firstPoint.x,
        y: firstPoint.y,
      };
    } else {
      for (let index = 0; index < this.animationPoints.length - 1; index++) {
        const point = this.animationPoints[index];
        const nextPoint = this.animationPoints[index + 1];
        let parameterA = 0;
        let parameterB = 0;
        let parameterC = 0;
        const isHorizontal = nextPoint.y === point.y;
        if (!isHorizontal) {
          parameterA = 1;
          parameterB = 0;
          parameterC = point.x;
        } else {
          parameterA = 0;
          parameterB = 1;
          parameterC = point.y;
        }
        if (
          (this.motionPoint.x !== nextPoint.x ||
            this.motionPoint.y !== nextPoint.y) &&
          parameterC ===
            parameterA * this.motionPoint.x + parameterB * this.motionPoint.y
        ) {
          const toTheRight = nextPoint.x > point.x;
          const toTheBottom = nextPoint.y > point.y;
          if (isHorizontal) {
            if (toTheRight) {
              this.motionPoint.x++;
            } else {
              this.motionPoint.x--;
            }
          } else {
            if (toTheBottom) {
              this.motionPoint.y++;
            } else {
              this.motionPoint.y--;
            }
          }
          break;
        }
      }
    }
    // this.ctx.drawImage(
    //   this.image,
    //   this.motionPoint.x,
    //   this.motionPoint.y,
    //   50,
    //   50
    // );
    this.ctx.fillRect(
      this.motionPoint.x,
      this.motionPoint.y,
      this.imageWidth,
      this.imageHeight
    );
  }

  buildConstructionPoints(
    chosenFollowXAxis: boolean,
    moveDown: boolean | null,
    moveRight: boolean | null,
    deltaX: number,
    deltaY: number
  ) {
    const constructedPoints: Point[] = [];
    if (chosenFollowXAxis) {
      constructedPoints.push({
        x: Math.round(
          moveRight
            ? this.startPoint.x + this.componentWidth / 2
            : this.startPoint.x - this.componentWidth / 2
        ),
        y: this.startPoint.y,
      });
      if (moveDown != null) {
        if (deltaY > this.componentHeight / 2) {
          constructedPoints.push({
            x: this.endPoint.x,
            y: this.startPoint.y,
          });
          constructedPoints.push({
            x: this.endPoint.x,
            y: Math.round(
              moveDown
                ? this.endPoint.y - this.componentHeight / 2
                : this.endPoint.y + this.componentHeight / 2
            ),
          });
        } else {
          constructedPoints.push({
            x: Math.round((this.endPoint.x + this.startPoint.x) / 2),
            y: this.startPoint.y,
          });
          constructedPoints.push({
            x: Math.round((this.endPoint.x + this.startPoint.x) / 2),
            y: this.endPoint.y,
          });
          constructedPoints.push({
            x: Math.round(
              moveRight
                ? this.endPoint.x - this.componentWidth / 2
                : this.endPoint.x + this.componentWidth / 2
            ),
            y: this.endPoint.y,
          });
        }
      } else {
        constructedPoints.push({
          x: moveRight
            ? this.endPoint.x - this.componentWidth / 2
            : this.endPoint.x + this.componentWidth / 2,
          y: this.endPoint.y,
        });
      }
    } else {
      constructedPoints.push({
        x: this.startPoint.x,
        y: Math.round(
          moveDown
            ? this.startPoint.y + this.componentHeight / 2
            : this.startPoint.y - this.componentHeight / 2
        ),
      });
      if (moveRight != null) {
        if (deltaX > this.componentWidth / 2) {
          constructedPoints.push({
            x: this.startPoint.x,
            y: this.endPoint.y,
          });
          constructedPoints.push({
            x: Math.round(
              moveRight
                ? this.endPoint.x - this.componentWidth / 2
                : this.endPoint.x + this.componentWidth / 2
            ),
            y: this.endPoint.y,
          });
        } else {
          constructedPoints.push({
            x: this.startPoint.x,
            y: Math.round((this.endPoint.y + this.startPoint.y) / 2),
          });
          constructedPoints.push({
            x: this.endPoint.x,
            y: Math.round((this.endPoint.y + this.startPoint.y) / 2),
          });
          constructedPoints.push({
            x: this.endPoint.x,
            y: Math.round(
              moveDown
                ? this.endPoint.y - this.componentHeight / 2
                : this.endPoint.y + this.componentHeight / 2
            ),
          });
        }
      } else {
        constructedPoints.push({
          x: this.endPoint.x,
          y: moveDown
            ? this.endPoint.y - this.componentHeight / 2
            : this.endPoint.y + this.componentHeight / 2,
        });
      }
    }
    this.constructedPoints = constructedPoints;
  }

  drawGridLine() {
    this.ctx.beginPath();
    for (let index = 0; index < this.constructedPoints.length - 1; index++) {
      const point = this.constructedPoints[index];
      const nextPoint = this.constructedPoints[index + 1];
      if (index === this.constructedPoints.length - 2) {
        this.drawArrow(point.x, point.y, nextPoint.x, nextPoint.y);
      } else {
        this.ctx.moveTo(point.x, point.y);
        this.ctx.lineTo(nextPoint.x, nextPoint.y);
      }
    }
    this.ctx.stroke();
  }

  drawArrow(fromx: number, fromy: number, tox: number, toy: number) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    this.ctx.moveTo(fromx, fromy);
    this.ctx.lineTo(tox, toy);
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6)
    );
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
    this.canvasCtx = this.canvasArea.nativeElement.getContext('2d')!;
    this.canvasCtx.fillStyle = 'red';
    setTimeout(() => {
      const plantConnections = this.plantModel!.plantConnections;
      this.connections = plantConnections.map((p) => {
        const square = new Square(
          this.canvasCtx!,
          this.componentDict[p.from],
          this.componentDict[p.to],
          this.componentDict[
            p.from
          ].instance.widgetRef!.nativeElement.offsetWidth,
          this.componentDict[
            p.from
          ].instance.widgetRef!.nativeElement.offsetHeight
        );
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
            square: square,
          },
        };
      });

      this.onResizeCanvas();
    });
  }

  reDrawCanvas() {
    this.ngZone.runOutsideAngular(() => {
      clearInterval(this.reRenderCanvasId!);
      const squares = this.connections
        .filter((p) => p.line != null)
        .map((p) => p.line!.square);
      squares.forEach((square: Square) => {
        square.rePosition();
      });
      this.reRenderCanvasId = setInterval(() => {
        this.canvasCtx!.clearRect(
          0,
          0,
          this.canvasCtx!.canvas.width,
          this.canvasCtx!.canvas.height
        );
        squares.forEach((square: Square) => {
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
    this.reDrawCanvas();
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
    this.reDrawCanvas();
  }

  onRedirectConnection() {
    const toRedirectConnectionConditionFunc = (p: Connection) =>
      p.from != null &&
      p.to != null &&
      this.selectingIconIds.includes(p.from) &&
      this.selectingIconIds.includes(p.to);

    const toRedirectConnections = this.connections.filter((p) =>
      toRedirectConnectionConditionFunc(p)
    );
    toRedirectConnections.forEach((p) => {
      if (p.line) {
        p.line.square.followXAxis = !p.line.square.followXAxis;
      }
    });
    this.reDrawCanvas();
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
        const line = this.createNewConnector(
          this.connections[index].elFrom!.nativeElement,
          this.connections[index].elTo!.nativeElement
        );
        const square = new Square(
          this.canvasCtx!,
          this.componentDict[this.connections[index].from!],
          this.componentDict[this.connections[index].to!],
          this.componentDict[
            this.connections[index].from!
          ].instance.widgetRef!.nativeElement.offsetWidth,
          this.componentDict[
            this.connections[index].from!
          ].instance.widgetRef!.nativeElement.offsetHeight
        );
        this.connections[index].line = <LineInfo>{
          lineId: Utils.generateNewId(),
          leaderLine: line,
          square: square,
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
    this.reDrawCanvas();
  }

  createNewConnector(startElement: Element, endElement: Element): LeaderLine {
    return new LeaderLine(startElement, endElement, {
      dash: { animation: true },
      path: 'grid',
    });
  }

  ngOnDestroy() {
    this.componentRef.destroy();
    this.componentsSubs.forEach((p) => p.unsubscribe());
    clearInterval(this.mousedownId!);
    clearInterval(this.reRenderCanvasId!);
  }
}
