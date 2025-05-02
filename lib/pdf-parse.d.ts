declare module 'pdf-parse' {
  function parse(buffer: Buffer, options?: any): Promise<{
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }>;
  
  export default parse;
} 