import net from 'net';

export interface RouterConnectionResult {
  success: boolean;
  latencyMs?: number;
  message: string;
}

export function testRouterConnection(
  host: string,
  port: number,
  timeoutMs = 4000
): Promise<RouterConnectionResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isFinished = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      if (!isFinished) {
        isFinished = true;
        const latencyMs = Date.now() - startTime;
        socket.destroy();
        resolve({
          success: true,
          latencyMs,
          message: `Koneksi berhasil ke ${host}:${port} (${latencyMs}ms)`,
        });
      }
    });

    socket.on('timeout', () => {
      if (!isFinished) {
        isFinished = true;
        socket.destroy();
        resolve({
          success: false,
          message: `Koneksi timeout setelah ${timeoutMs}ms ke ${host}:${port}`,
        });
      }
    });

    socket.on('error', (err: Error) => {
      if (!isFinished) {
        isFinished = true;
        socket.destroy();
        resolve({
          success: false,
          message: `Koneksi gagal ke ${host}:${port}: ${err.message}`,
        });
      }
    });
  });
}
