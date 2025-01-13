// This is an extremely simplified version of [`boxen`](https://github.com/sindresorhus/boxen)
const BOX_SYMBOLS = {
	topLeft: '╭',
	topRight: '╮',
	bottomLeft: '╰',
	bottomRight: '╯',
	vertical: '│',
	horizontal: '─',
} as const;

// Creates a box around text content with customizable styling
export function createBox(
  content: string | string[],
  options: {
    borderColor?: (text: string) => string;
    textColor?: (text: string) => string;
    fileName?: string;
    fileNameColor?: (text: string) => string;
  } = {}
): string {
	const lines = Array.isArray(content) ? content : content.split('\n');
	const { borderColor = (x) => x, textColor = (x) => x, fileName, fileNameColor } = options;

	if (fileNameColor && !fileName) {
		throw new Error('fileNameColor cannot be used without fileName.');
	}

	// Calculate width to place content and fileName
	const maxContentLength = Math.max(...lines.map((line) => line.length));
	const fileNameLength = fileName ? fileName.length + 4 : 0;
	const totalLength = Math.max(maxContentLength, fileNameLength);

	// Assemble the box from its components
	const top = createBorder('top', totalLength, fileName, borderColor, fileNameColor);
	const bottom = createBorder('bottom', totalLength, undefined, borderColor);
	const paddedLines = createPaddedLines(lines, totalLength, borderColor, textColor);

	return [top, ...paddedLines, bottom].join('\n');
}

// Generates top/bottom border with optional embedded fileName in top border
export function createBorder(
	type: 'top' | 'bottom',
	totalLength: number,
	fileName?: string,
	borderColor: (text: string) => string = (x) => x,
	fileNameColor?: (text: string) => string,
): string {
	// Slecting corner symbols based on border type
	const [startSymbol, endSymbol] =
		type === 'top'
			? [BOX_SYMBOLS.topLeft, BOX_SYMBOLS.topRight]
			: [BOX_SYMBOLS.bottomLeft, BOX_SYMBOLS.bottomRight];

	let border = borderColor(startSymbol);

	// Handle top border with filename
	if (fileName && type === 'top') {
		const formattedFileName = fileNameColor ? fileNameColor(` ${fileName} `) : ` ${fileName} `;
		border += borderColor(BOX_SYMBOLS.horizontal.repeat(2)) + formattedFileName;

		// Fill remaining space with horizontal lines
		const remainingLength = totalLength - fileName.length - 4 + 2;
		if (remainingLength > 0) {
			border += borderColor(BOX_SYMBOLS.horizontal.repeat(remainingLength));
		}
	} else {
		border += borderColor(BOX_SYMBOLS.horizontal.repeat(totalLength + 2));
	}

	return border + borderColor(endSymbol);
}

// Pads content lines to uniform width and wraps with vertical borders
export function createPaddedLines(
	lines: string[],
	totalLength: number,
	borderColor: (text: string) => string,
	textColor: (text: string) => string,
): string[] {
	return lines.map((line) => {
		const paddedLine = line.padEnd(totalLength);
		return `${borderColor(BOX_SYMBOLS.vertical)} ${textColor(paddedLine)} ${borderColor(
			BOX_SYMBOLS.vertical,
		)}`;
	});
}

let stdout = process.stdout;
export const log = (message: string) => stdout.write(message + '\n');
export const newline = () => stdout.write('\n');
