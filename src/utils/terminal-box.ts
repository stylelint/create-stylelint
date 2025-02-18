import { stripVTControlCharacters } from 'node:util';

const BOX_SYMBOLS = {
	topLeft: '╭',
	topRight: '╮',
	bottomLeft: '╰',
	bottomRight: '╯',
	vertical: '│',
	horizontal: '─',
} as const;

/**
 * Creates a box around the given content.
 *
 * The process can be visualized like this:
 *
 *     ┌────────────────────────┐  <- Top border created by `createBorder('top', ...)`
 *     │                        │  <- Vertical borders and padding added by `createPaddedLines(...)`
 *     │    Content Line 1      │  <- Content lines are processed and padded here
 *     │    Content Line 2      │
 *     │                        │
 *     └────────────────────────┘  <- Bottom border created by `createBorder('bottom', ...)`
 *
 */
function createBox(
	content: string | string[],
	options: {
		borderColor?: (text: string) => string;
		textColor?: (text: string) => string;
		fileName?: string;
		fileNameColor?: (text: string) => string;
	} = {},
): string {
	const lines = Array.isArray(content) ? content : content.split('\n');
	const { borderColor = (x) => x, textColor = (x) => x, fileName, fileNameColor } = options;

	if (fileNameColor && !fileName) {
		throw new Error('fileNameColor requires fileName');
	}

	const visibleLength = (str: string) => stripVTControlCharacters(str).length;

	const maxContentLength = Math.max(...lines.map((line) => visibleLength(line)));
	const fileNameLength = fileName ? visibleLength(fileName) + 4 : 0;
	const totalLength = Math.max(maxContentLength, fileNameLength);

	const top = createBorder('top', totalLength, fileName, borderColor, fileNameColor);
	const bottom = createBorder('bottom', totalLength, undefined, borderColor);
	const paddedLines = createPaddedLines(lines, totalLength, borderColor, textColor);

	return [top, ...paddedLines, bottom].join('\n');
}

/**
 * Creates a border (top or bottom) for the box.
 *
 * Examples:
 * Top border without filename:    ╭──────────────────────╮
 *
 * Top border with filename:       ╭─── my-file ──────────╮
 * Bottom border:                  ╰──────────────────────╯
 */
function createBorder(
	type: 'top' | 'bottom',
	totalLength: number,
	fileName?: string,
	borderColor: (text: string) => string = (x) => x,
	fileNameColor?: (text: string) => string,
): string {
	const [start, end] =
		type === 'top'
			? [BOX_SYMBOLS.topLeft, BOX_SYMBOLS.topRight]
			: [BOX_SYMBOLS.bottomLeft, BOX_SYMBOLS.bottomRight];

	let border = borderColor(start);

	if (fileName && type === 'top') {
		const cleanName = stripVTControlCharacters(fileName);
		const visibleNameLength = cleanName.length;
		const formattedName = fileNameColor ? fileNameColor(` ${fileName} `) : ` ${cleanName} `;
		const remaining = Math.max(0, totalLength - visibleNameLength - 2);

		border +=
			borderColor(BOX_SYMBOLS.horizontal.repeat(2)) +
			formattedName +
			borderColor(BOX_SYMBOLS.horizontal.repeat(remaining));
	} else {
		border += borderColor(BOX_SYMBOLS.horizontal.repeat(totalLength + 2));
	}

	return border + borderColor(end);
}

/**
 * Creates padded lines for the content with vertical borders.
 *
 * Example output for a line "Hello" with totalLength of 20:
 * │ Hello               │
 */
function createPaddedLines(
	lines: string[],
	totalLength: number,
	borderColor: (text: string) => string,
	textColor: (text: string) => string,
): string[] {
	return lines.map((line) => {
		const cleanLine = stripVTControlCharacters(line);
		const padding = ' '.repeat(totalLength - cleanLine.length);

		return `${borderColor(BOX_SYMBOLS.vertical)} ${textColor(line + padding)} ${borderColor(BOX_SYMBOLS.vertical)}`;
	});
}

export { createBox, createBorder, createPaddedLines };
