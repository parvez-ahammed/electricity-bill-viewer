export function jsonToXml(json: unknown): string {
    return Object.entries(json)
        .map(([key, value]) =>
            Array.isArray(value)
                ? value
                      .map((item) => `<${key}>${jsonToXml(item)}</${key}>`)
                      .join('')
                : typeof value === 'object'
                  ? `<${key}>${jsonToXml(value)}</${key}>`
                  : `<${key}>${value}</${key}>`
        )
        .join('');
}
