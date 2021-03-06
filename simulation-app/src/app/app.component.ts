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
  lineInfo: LineInfo | null;
}
export interface LineInfo {
  lineId: string;
  line: Line;
}
export class Line {
  public chosenFollowXAxis: boolean = false;

  private motionPoint: Point | null = null;
  private get componentWidth(): number {
    return this.component.nativeElement.offsetWidth;
  }
  private get componentHeight(): number {
    return this.component.nativeElement.offsetHeight;
  }
  private startPoint: Point = { x: 0, y: 0 };
  private endPoint: Point = { x: 0, y: 0 };
  private moveDown: boolean | null = null;
  private moveRight: boolean | null = null;

  private constructedPoints: Point[] = [];
  private animationPoints: Point[] = [];
  private image: HTMLImageElement = new Image();

  private isReverse: boolean = false;
  private lastWaitingTime: Date | null = null;

  private maxStep: number = 1;
  private currentStep: number = this.maxStep;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private startComponent: ComponentRef<WidgetComponent>,
    private endComponent: ComponentRef<WidgetComponent>,
    private component: ElementRef<any>,
    imageSrc: string = '../assets/icons/forklift.jpg',
    public imageWidth: number = 40,
    public imageHeight: number = 40,
    public distance: number = 5,
    public color = 'black',
    private supportReverse = true,
    private waitingDurationAtStart = 0,
    private waitingDurationAtEnd = 0,
    private speed = 1,
    public forceFollowXAxis?: boolean
  ) {
    this.ctx.strokeStyle = this.color;
    this.image.src = imageSrc;
    this.rePosition();
  }

  rePosition() {
    this.isReverse = false;
    this.motionPoint = null;
    this.reCalculateStartEndPoint();
    this.reCalculatePoints();
  }

  reCalculateStartEndPoint() {
    this.startPoint.x =
      this.startComponent.instance.dragPosition.x + this.componentWidth / 2;
    this.startPoint.y =
      this.startComponent.instance.dragPosition.y + this.componentHeight / 2;
    this.endPoint.x =
      this.endComponent.instance.dragPosition.x + this.componentWidth / 2;
    this.endPoint.y =
      this.endComponent.instance.dragPosition.y + this.componentHeight / 2;

    const xDistance = this.endPoint.x - this.startPoint.x;
    const yDistance = this.endPoint.y - this.startPoint.y;

    this.moveDown = yDistance === 0 ? null : yDistance > 0;
    this.moveRight = xDistance === 0 ? null : xDistance > 0;
  }

  reCalculatePoints() {
    const deltaX = Math.abs(this.endPoint.x - this.startPoint.x);
    const deltaY = Math.abs(this.endPoint.y - this.startPoint.y);
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    this.chosenFollowXAxis =
      this.forceFollowXAxis == null ||
      deltaX <= this.componentWidth / 2 ||
      deltaY <= this.componentHeight / 2
        ? deltaX >= deltaY
        : this.forceFollowXAxis;

    this.buildConstructionPoints(deltaX, deltaY);
    this.buildAnimationPoints();
  }

  draw() {
    this.drawGridLine();
    this.drawAnimation();
  }

  buildConstructionPoints(
    deltaX: number,
    deltaY: number
  ) {
    const constructedPoints: Point[] = [];
    if (this.chosenFollowXAxis) {
      constructedPoints.push({
        x: Math.round(
          this.moveRight
            ? this.startPoint.x + this.componentWidth / 2
            : this.startPoint.x - this.componentWidth / 2
        ),
        y: this.startPoint.y,
      });
      if (this.moveDown != null) {
        if (deltaY > this.componentHeight / 2) {
          constructedPoints.push({
            x: this.endPoint.x,
            y: this.startPoint.y,
          });
          constructedPoints.push({
            x: this.endPoint.x,
            y: Math.round(
              this.moveDown
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
              this.moveRight
                ? this.endPoint.x - this.componentWidth / 2
                : this.endPoint.x + this.componentWidth / 2
            ),
            y: this.endPoint.y,
          });
        }
      } else {
        constructedPoints.push({
          x: this.moveRight
            ? this.endPoint.x - this.componentWidth / 2
            : this.endPoint.x + this.componentWidth / 2,
          y: this.endPoint.y,
        });
      }
    } else {
      constructedPoints.push({
        x: this.startPoint.x,
        y: Math.round(
          this.moveDown
            ? this.startPoint.y + this.componentHeight / 2
            : this.startPoint.y - this.componentHeight / 2
        ),
      });
      if (this.moveRight != null) {
        if (deltaX > this.componentWidth / 2) {
          constructedPoints.push({
            x: this.startPoint.x,
            y: this.endPoint.y,
          });
          constructedPoints.push({
            x: Math.round(
              this.moveRight
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
              this.moveDown
                ? this.endPoint.y - this.componentHeight / 2
                : this.endPoint.y + this.componentHeight / 2
            ),
          });
        }
      } else {
        constructedPoints.push({
          x: this.endPoint.x,
          y: this.moveDown
            ? this.endPoint.y - this.componentHeight / 2
            : this.endPoint.y + this.componentHeight / 2,
        });
      }
    }
    this.constructedPoints = constructedPoints;
  }

  buildAnimationPoints() {
    const animationPoints: Point[] = [];

    for (let index = 0; index < this.constructedPoints.length - 1; index++) {
      const point = this.constructedPoints[index];
      const nextPoint = this.constructedPoints[index + 1];
      const isFirstPoint = index === 0;
      const isLastPoint = index === this.constructedPoints.length - 2;
      const isHorizontal = nextPoint.y === point.y;

      if (isFirstPoint) {
        if (isHorizontal) {
          animationPoints.push({
            x: this.moveRight
              ? point.x - this.imageWidth
              : point.x,
            y:
            this.moveDown === true || this.moveDown == null
                ? point.y - this.distance - this.imageHeight
                : point.y + this.distance,
          });
        } else {
          animationPoints.push({
            x:
            this.moveRight === true || this.moveRight == null
                ? point.x + this.distance
                : point.x - this.distance - this.imageWidth,
            y: this.moveDown
              ? point.y - this.imageHeight
              : point.y,
          });
        }
      }

      const animationPoint: Point = { x: 0, y: 0 };
      if (isHorizontal) {
        // moveRight here is always not null
        if (this.moveRight) {
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

        if (this.moveDown === true || this.moveDown == null) {
          animationPoint.y = nextPoint.y - this.distance - this.imageHeight;
        } else {
          animationPoint.y = nextPoint.y + this.distance;
        }
      } else {
        if (this.moveRight === true || this.moveRight == null) {
          animationPoint.x = nextPoint.x + this.distance;
        } else {
          animationPoint.x = nextPoint.x - this.distance - this.imageWidth;
        }

        if (isLastPoint) {
          if (this.moveDown) {
            animationPoint.y = nextPoint.y;
          } else {
            animationPoint.y = nextPoint.y - this.imageHeight;
          }
        } else {
          // moveDown here is always not null
          if (this.moveDown) {
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
    let willFollowAnimationPoints = true;
    if (this.motionPoint == null) {
      this.motionPoint = {
        x: firstPoint.x,
        y: firstPoint.y,
      };
    }

    if (this.compareIfTwoPointsAreOverlapping(this.motionPoint, firstPoint)) {
      if (!this.checkIfWaitingLongEnough(this.waitingDurationAtStart)) {
        willFollowAnimationPoints = false;
      } else {
        if (this.supportReverse) {
          this.isReverse = false;
        }
        this.currentStep = this.maxStep;
      }

    } else if (this.compareIfTwoPointsAreOverlapping(this.motionPoint, lastPoint)) {
      if (!this.checkIfWaitingLongEnough(this.waitingDurationAtEnd)) {
        willFollowAnimationPoints = false;
      } else {
        if (this.supportReverse) {
          this.isReverse = true;
        } else {
          this.motionPoint = {
            x: firstPoint.x,
            y: firstPoint.y,
          };
        }
        this.currentStep = this.maxStep;
      }
    }


    if (willFollowAnimationPoints) {
      if (this.currentStep >= this.maxStep) {
        this.followAnimationPoints();
        this.currentStep = 0;
      } else {
        this.currentStep += this.speed;
      }
    }
    this.drawImage();
    // console.log('x: ' + this.motionPoint.x + ', y: ' + this.motionPoint.y)
  }

  compareIfTwoPointsAreOverlapping(point1: Point, point2: Point): boolean {
    return point1.x === point2.x && point1.y === point2.y;
  }

  checkIfWaitingLongEnough(duration: number): boolean {
    if (this.lastWaitingTime == null) {
      this.lastWaitingTime = new Date();
      return false;
    }

    const elapsedTime = new Date().getTime() - this.lastWaitingTime.getTime();
    if (elapsedTime >= duration) {
      this.lastWaitingTime = null;
      return true;
    }
    return false;
  }

  followAnimationPoints() {
    const chosenAnimationPoints = !this.isReverse ? this.animationPoints : [...this.animationPoints].reverse();

    for (let index = 0; index < chosenAnimationPoints.length - 1; index++) {
      const point = chosenAnimationPoints[index];
      const nextPoint = chosenAnimationPoints[index + 1];
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
        (this.motionPoint!.x !== nextPoint.x ||
          this.motionPoint!.y !== nextPoint.y) &&
        parameterC ===
          parameterA * this.motionPoint!.x + parameterB * this.motionPoint!.y
      ) {
        const toTheRight = nextPoint.x > point.x;
        const toTheBottom = nextPoint.y > point.y;
        if (isHorizontal) {
          if (toTheRight) {
            this.motionPoint!.x++;
          } else {
            this.motionPoint!.x--;
          }
        } else {
          if (toTheBottom) {
            this.motionPoint!.y++;
          } else {
            this.motionPoint!.y--;
          }
        }
        break;
      }
    }
  }

  drawImage() {
    if ((!this.isReverse && (this.moveRight === true || this.moveRight == null)) ||
    (this.isReverse && this.moveRight === false)) {
      this.ctx.drawImage(
        this.image,
        this.motionPoint!.x,
        this.motionPoint!.y,
        this.imageWidth,
        this.imageHeight
      );
    } else {
      this.ctx.translate(this.motionPoint!.x + this.imageWidth, this.motionPoint!.y);

      // scaleX by -1; this "trick" flips horizontally
      this.ctx.scale(-1,1);

      // draw the img
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.imageWidth,
        this.imageHeight
      );
      this.ctx.setTransform(1,0,0,1,0,0);
    }
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
        const line = new Line(
          this.canvasCtx!,
          this.componentDict[p.from],
          this.componentDict[p.to],
          this.componentDict[p.from].instance.widgetRef!
        );
        return <Connection>{
          elFrom: this.componentDict[p.from].instance.widgetRef,
          from: p.from,
          elTo: this.componentDict[p.to].instance.widgetRef,
          to: p.to,
          lineInfo: <LineInfo>{
            lineId: p.lineId,
            line: line,
          },
        };
      });

      this.onResizeCanvas();
    });
  }

  reDrawCanvas() {
    this.ngZone.runOutsideAngular(() => {
      clearInterval(this.reRenderCanvasId!);
      const lines = this.connections
        .filter((p) => p.lineInfo != null)
        .map((p) => p.lineInfo!.line);
      lines.forEach((line: Line) => {
        line.rePosition();
      });
      this.reRenderCanvasId = setInterval(() => {
        this.canvasCtx!.clearRect(
          0,
          0,
          this.canvasCtx!.canvas.width,
          this.canvasCtx!.canvas.height
        );
        lines.forEach((line: Line) => {
          line.draw();
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
      if (p.lineInfo) {
        if (p.lineInfo.line.forceFollowXAxis != null) {
          p.lineInfo.line.forceFollowXAxis = !p.lineInfo.line.forceFollowXAxis;
        } else {
          p.lineInfo.line.forceFollowXAxis = !p.lineInfo.line.chosenFollowXAxis;
        }
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
      lineInfo: null,
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
        const line = new Line(
          this.canvasCtx!,
          this.componentDict[this.connections[index].from!],
          this.componentDict[this.connections[index].to!],
          this.componentDict[this.connections[index].from!].instance.widgetRef!
        );
        this.connections[index].lineInfo = <LineInfo>{
          lineId: Utils.generateNewId(),
          line: line,
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
    this.reDrawCanvas();
  }

  ngOnDestroy() {
    this.componentRef.destroy();
    this.componentsSubs.forEach((p) => p.unsubscribe());
    clearInterval(this.mousedownId!);
    clearInterval(this.reRenderCanvasId!);
  }
}
