import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { DialogService, AnnotationRequest } from '../../services/dialog.service';
import { AnnotationService } from '../../services/annotation.service';
import { ANNOTATION_COLORS, AnnotationColor } from '../../models/models';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-annotation-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogComponent],
  template: `
    <app-dialog [open]="request() !== null" (closed)="onClose()">
      @if (request(); as req) {
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Add Annotation</h2>

          <p class="text-sm text-gray-600">
            Selected: <span class="font-medium text-gray-900">{{ req.selectedText }}</span>
          </p>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div class="flex gap-2">
              @for (color of colors; track color.value) {
                <button
                  type="button"
                  [class.ring-2]="selectedColor() === color.value"
                  [class.ring-offset-2]="selectedColor() === color.value"
                  [class]="getButtonClasses(color.value)"
                  (click)="selectedColor.set(color.value)"
                  class="w-10 h-10 rounded-full transition-transform hover:scale-110"
                  [attr.aria-label]="color.label"
                ></button>
              }
            </div>
          </div>

          <div>
            <label for="note" class="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              id="note"
              [formControl]="noteControl"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add your note here..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="onSave(req)"
              [disabled]="!noteControl.value"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      }
    </app-dialog>
  `,
})
export class AnnotationDialogComponent {
  private readonly dialogService = inject(DialogService);
  private readonly annotationService = inject(AnnotationService);

  protected readonly request = signal<AnnotationRequest | null>(null);
  protected readonly colors = ANNOTATION_COLORS;
  protected readonly selectedColor = signal<AnnotationColor>('yellow');
  protected readonly noteControl = new FormControl('', { validators: [Validators.required], nonNullable: true });

  constructor() {
    effect(() => {
      const event = this.dialogService.events$;
      // Subscribe to events via a simple approach
    });

    // Subscribe to dialog events
    this.dialogService.events$.subscribe((req) => {
      this.request.set(req);
      if (req === null) {
        this.noteControl.reset('');
        this.selectedColor.set('yellow');
      }
    });
  }

  protected getButtonClasses(color: AnnotationColor): string {
    const colorMap: Record<AnnotationColor, string> = {
      yellow: 'bg-yellow-400',
      green: 'bg-green-400',
      blue: 'bg-blue-400',
      pink: 'bg-pink-400',
    };
    return colorMap[color];
  }

  onSave(req: AnnotationRequest): void {
    if (!this.noteControl.value) return;

    this.annotationService.add({
      articleId: req.articleId,
      startOffset: req.startOffset,
      endOffset: req.endOffset,
      color: this.selectedColor(),
      note: this.noteControl.value,
    });

    this.noteControl.reset('');
    this.dialogService.close();
  }

  onClose(): void {
    this.noteControl.reset('');
    this.selectedColor.set('yellow');
    this.dialogService.close();
  }
}
