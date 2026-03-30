import { Directive, ElementRef, inject, ViewContainerRef, ComponentRef, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TooltipComponent } from '../components/tooltip/tooltip.component';
import { AnnotationService } from '../../services/annotation.service';

@Directive({
  selector: '[appTooltipHost]',
})
export class TooltipHostDirective implements OnDestroy {
  private static readonly HIDE_DELAY_MS = 180;

  private readonly vcr = inject(ViewContainerRef);
  private readonly annotationService = inject(AnnotationService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  private tooltipRef: ComponentRef<TooltipComponent> | null = null;
  private readonly destroy$ = new Subject<void>();
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    fromEvent(this.el.nativeElement, 'mouseover')
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: Event) => this.show(e as MouseEvent));

    fromEvent(this.el.nativeElement, 'mouseout')
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: Event) => this.hide(e as MouseEvent));
  }

  private show(event: MouseEvent): void {
    this.cancelScheduledHide();

    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-annotation-id]');
    if (!target) return;

    // For nested spans, get the innermost annotation (the actual target)
    const id = target.dataset['annotationId']!;
    if (this.tooltipRef?.instance.annotation().id === id) return;

    const ann = this.annotationService.annotations().find((a) => a.id === id);
    if (!ann) return;

    this.destroyTooltip();

    this.tooltipRef = this.vcr.createComponent(TooltipComponent);
    this.tooltipRef.setInput('annotation', ann);
    this.tooltipRef.instance.deleted.subscribe(() => {
      this.annotationService.delete(id);
      this.destroyTooltip();
    });

    const rect = target.getBoundingClientRect();
    const tooltipEl = this.tooltipRef.location.nativeElement as HTMLElement;
    tooltipEl.addEventListener('mouseenter', () => this.cancelScheduledHide());
    tooltipEl.addEventListener('mouseleave', () => this.scheduleHide());
    tooltipEl.style.cssText = `position:fixed;top:${rect.bottom + 6}px;left:${rect.left}px;z-index:50`;
    document.body.appendChild(tooltipEl);
  }

  private hide(event: MouseEvent): void {
    const related = event.relatedTarget as HTMLElement | null;

    if (related?.closest('[data-annotation-id]')) return;
    if (this.tooltipRef?.location.nativeElement.contains(related)) return;

    this.scheduleHide();
  }

  private scheduleHide(): void {
    if (!this.tooltipRef) return;

    this.cancelScheduledHide();
    this.hideTimer = setTimeout(() => {
      this.destroyTooltip();
    }, TooltipHostDirective.HIDE_DELAY_MS);
  }

  private cancelScheduledHide(): void {
    if (!this.hideTimer) return;

    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }

  private destroyTooltip(): void {
    this.cancelScheduledHide();

    if (!this.tooltipRef) return;

    const el = this.tooltipRef.location.nativeElement as HTMLElement;
    if (el.parentNode === document.body) {
      el.remove();
    }
    this.tooltipRef.destroy();
    this.tooltipRef = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyTooltip();
  }
}
