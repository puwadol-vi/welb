export type DigitalContentType = "Video" | "E-book" | "Slide" | "Article";

export interface DigitalContent {
  id: string;
  title: string;
  contentType: DigitalContentType;
  creatorName: string;
  category: string;
  previewUrl: string;
  externalUrl: string;
}

export type DigitalContentCategory =
  | "Education"
  | "Books"
  | "Technical"
  | "Opinion"
  | "Security";
