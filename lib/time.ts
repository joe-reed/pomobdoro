export function getMinutes(time: number) {
  return Math.floor(time / 60);
}

export function getSeconds(time: number) {
  return time % 60;
}
