import { Component, ChangeDetectionStrategy, input, output, viewChild, ElementRef, effect } from '@angular/core';

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }
    dialog {
      padding: 0;
      border: none;
      background: transparent;
      margin: auto;
      overflow: visible;
      max-width: min(28rem, calc(100vw - 2rem));
    }
  `,
  template: `
    <dialog
      #dialogEl
      (cancel.prevent)="close()"
      (click)="onBackdropClick($event)"
    >
      <div class="bg-white rounded-lg p-6 shadow-2xl">
        <ng-content />
      </div>
    </dialog>
  `,
})
export class DialogComponent {
  open = input<boolean>(false);
  closed = output<void>();

  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  constructor() {
    effect(() => {
      const el = this.dialogEl().nativeElement;
      if (this.open() && !el.open) {
        el.showModal();
      } else if (!this.open() && el.open) {
        el.close();
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = (event.target as HTMLElement).closest('dialog');
    if (dialog && event.target === dialog) {
      this.close();
    }
  }
}
