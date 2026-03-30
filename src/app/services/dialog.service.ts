import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AnnotationRequest {
  articleId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _events$ = new Subject<AnnotationRequest | null>();
  readonly events$ = this._events$.asObservable();

  open(req: AnnotationRequest): void {
    this._events$.next(req);
  }

  close(): void {
    this._events$.next(null);
  }
}
