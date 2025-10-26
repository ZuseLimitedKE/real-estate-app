export function formatAddress(address: string): string {
    const front = address.slice(0, 6);
    const end = address.slice(-3);
    return `${front}...${end}`;
}