export function formatOutput(data: any, _pretty: boolean = false): string {
  return JSON.stringify(data, null, 2);
}
