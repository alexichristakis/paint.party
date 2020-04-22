import { base64 } from "./util";

type Color = [number, number, number, number];

export class Bitmap {
  width: number;
  height: number;
  pixel: Color[][];

  constructor(width: number, height: number, backgroundColor: Color) {
    this.width = width;
    this.height = height;

    this.pixel = new Array(width);
    for (let x = 0; x < width; x++) {
      this.pixel[x] = new Array(height);
      for (let y = 0; y < height; y++) {
        this.pixel[x][y] = backgroundColor;
      }
    }
  }

  private sample = (v: number) => ~~(Math.max(0, Math.min(1, v)) * 255);
  private gamma = (v: number) => this.sample(Math.pow(v, 0.45455));
  private row = (pixel: Color[][], width: number, y: number) => {
    let data = "\0";
    for (let x = 0; x < width; x++) {
      const r = pixel[x][y];
      data += String.fromCharCode(
        this.gamma(r[0]),
        this.gamma(r[1]),
        this.gamma(r[2]),
        this.sample(r[3])
      );
    }

    return data;
  };

  private rows = (pixel: Color[][], width: number, height: number) => {
    let data = "";
    for (let y = 0; y < height; y++) data += this.row(pixel, width, y);

    return data;
  };

  private adler = (data: string) => {
    let s1 = 1,
      s2 = 0;
    for (let i = 0; i < data.length; i++) {
      s1 = (s1 + data.charCodeAt(i)) % 65521;
      s2 = (s2 + s1) % 65521;
    }
    return (s2 << 16) | s1;
  };

  private hton = (i: number) => {
    return String.fromCharCode(
      i >>> 24,
      (i >>> 16) & 255,
      (i >>> 8) & 255,
      i & 255
    );
  };

  private deflate = (data: string) => {
    let compressed = "\x78\x01";
    let i = 0;
    do {
      const block = data.slice(i, i + 65535);
      const len = block.length;
      compressed += String.fromCharCode(
        (i += block.length) === data.length ? 1 : 0 << 0,
        len & 255,
        len >>> 8,
        ~len & 255,
        (~len >>> 8) & 255
      );
      compressed += block;
    } while (i < data.length);

    return compressed + this.hton(this.adler(data));
  };

  private crc32 = (data: string) => {
    let c = ~0;
    for (let i = 0; i < data.length; i++)
      for (let b = data.charCodeAt(i) | 0x100; b != 1; b >>>= 1)
        c = (c >>> 1) ^ ((c ^ b) & 1 ? 0xedb88320 : 0);
    return ~c;
  };

  private chunk = (type: string, data: string) => {
    return (
      this.hton(data.length) + type + data + this.hton(this.crc32(type + data))
    );
  };

  dataURL = () => {
    const png =
      "\x89PNG\r\n\x1a\n" +
      this.chunk(
        "IHDR",
        this.hton(this.width) + this.hton(this.height) + "\x08\x06\0\0\0"
      ) +
      this.chunk(
        "IDAT",
        this.deflate(this.rows(this.pixel, this.width, this.height))
      ) +
      this.chunk("IEND", "");

    // return "data:image/png;base64," + this.base64(png);
    return base64(png);
  };
}
