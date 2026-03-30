export interface Article {
  id: string;
  title: string;
  content: string;   // always plain text — no HTML
  createdAt: number;
  updatedAt: number;
}

export interface Annotation {
  id: string;
  articleId: string;
  startOffset: number;  // char index in Article.content (plain text)
  endOffset: number;    // exclusive end index
  color: AnnotationColor;
  note: string;
  createdAt: number;
}

export const ANNOTATION_COLORS = [
  { label: 'Yellow', value: 'yellow', underline: 'decoration-yellow-400', bg: 'bg-yellow-100' },
  { label: 'Green',  value: 'green',  underline: 'decoration-green-400',  bg: 'bg-green-100'  },
  { label: 'Blue',   value: 'blue',   underline: 'decoration-blue-400',   bg: 'bg-blue-100'   },
  { label: 'Pink',   value: 'pink',   underline: 'decoration-pink-400',   bg: 'bg-pink-100'   },
] as const;

export type AnnotationColor = (typeof ANNOTATION_COLORS)[number]['value'];
