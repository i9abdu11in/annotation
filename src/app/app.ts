import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AnnotationDialogComponent } from './features/annotation-dialog/annotation-dialog.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, AnnotationDialogComponent],
  templateUrl: './app.html',
})
export class App {}
