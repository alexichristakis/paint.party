export const base64 = (data: string) => {
  let enc = "";
  for (let i = 5, n = data.length * 8 + 5; i < n; i += 6)
    enc += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      (((data.charCodeAt(~~(i / 8) - 1) << 8) | data.charCodeAt(~~(i / 8))) >>
        (7 - (i % 8))) &
        63
    ];
  for (; enc.length % 4; enc += "=");
  return enc;
};
