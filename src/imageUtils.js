export const bufferToBase64 = (buffer) => {
  if (!buffer) return null;

  const binary = buffer.data
    .map((byte) => String.fromCharCode(byte))
    .join("");

  return `data:image/jpeg;base64,${window.btoa(binary)}`;
};
