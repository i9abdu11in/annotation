import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Annotation } from '../../../models/models';

@Component({
  selector: 'app-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside role="tooltip" class="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-xl">
      <p class="mb-2">{{ annotation().note }}</p>
      <button
        type="button"
        (click)="deleted.emit()"
        class="text-red-400 hover:text-red-200 text-xs font-medium"
      >
        Delete annotation
      </button>
    </aside>
  `,
})
export class TooltipComponent {
  annotation = input.required<Annotation>();
  deleted = output<void>();
}
