import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getBase64(filePath: string): Promise<string> {
  const file = await readFile(filePath);
  return `data:image/png;base64,${file.toString('base64')}`;
}
