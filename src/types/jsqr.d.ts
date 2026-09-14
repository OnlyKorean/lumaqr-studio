declare module 'jsqr' {
  export interface QRPoint {
    x: number;
    y: number;
  }
  export interface QRCode {
    data: string;
    location: {
      topLeftCorner: QRPoint;
      topRightCorner: QRPoint;
      bottomLeftCorner: QRPoint;
      bottomRightCorner: QRPoint;
    };
  }
  export default function jsQR(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: 'attemptBoth' | 'onlyInvert' | 'dontInvert' },
  ): QRCode | null;
}
