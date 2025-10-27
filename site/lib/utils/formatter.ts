export function formatAddress(address: string): string {
    if (address.startsWith('0x')) {
        const front = address.slice(0, 6);
        const end = address.slice(-3);
        return `${front}...${end}`;
    } else {
        return address
    }
}