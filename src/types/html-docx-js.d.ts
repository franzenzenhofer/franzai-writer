declare module 'html-docx-js' {
  interface ConversionOptions {
    pageSize?: 'A4' | 'Letter';
    margins?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    header?: boolean;
    footer?: boolean;
  }
  
  function asBlob(htmlSource: string, options?: ConversionOptions): Blob;
  function asBuffer(htmlSource: string, options?: ConversionOptions): Buffer;
  
  const htmlDocxJs = {
    asBlob,
    asBuffer,
  };
  
  export default htmlDocxJs;
} 