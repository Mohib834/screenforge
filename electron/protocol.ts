import { protocol } from 'electron';
import fs from 'node:fs';
import { Readable } from 'node:stream';

export const registerProtocols = (): void => {
  // Serve local files via screenforge://local/<absolute-path>
  // Range requests are handled so Chromium can seek video.
  protocol.handle('screenforge', (req) => {
    const { pathname } = new URL(req.url);

    let stat: fs.Stats;
    try { stat = fs.statSync(pathname); } catch { return new Response('Not found', { status: 404 }); }

    const fileSize = stat.size;
    const ext = pathname.split('.').pop()?.toLowerCase() ?? '';
    const contentType =
      ext === 'mp4'  ? 'video/mp4' :
      ext === 'webm' ? 'video/webm' :
      ext === 'mov'  ? 'video/quicktime' : 'video/mp4';

    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      const webStream = Readable.toWeb(fs.createReadStream(pathname, { start, end })) as ReadableStream;
      return new Response(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(end - start + 1),
          'Content-Type': contentType,
        },
      });
    }

    const webStream = Readable.toWeb(fs.createReadStream(pathname)) as ReadableStream;
    return new Response(webStream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Content-Type': contentType,
      },
    });
  });
};
