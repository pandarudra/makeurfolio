// --------------------------------------------------------------------------
// Resume Module Types
// --------------------------------------------------------------------------

export interface ResumeParseResult {
  /** Extracted plain text from the PDF */
  text: string;
  /** Number of pages in the PDF */
  pageCount: number;
}
