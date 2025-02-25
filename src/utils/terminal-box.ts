import { stripVTControlCharacters } from 'node:util';

const BOX = {
	corners: {
		top: ['╭', '╮'],
		bottom: ['╰', '╯'],
	},
	vertical: '│',
	horizontal: '─',
} as const;

/**
 * Creates a text box around the given content.
 *
 * The generated box structure:
 *
 *     ╭────────────────────────╮  <- Top border (created by `createTopBorder(...)`)
 *     │                        │  <- Empty padding line (added by `createContentLines(...)`)
 *     │    Content Line 1      │  <- Content lines (processed and padded)
 *     │    Content Line 2      │
 *     │                        │  <- Empty padding line
 *     ╰────────────────────────╯  <- Bottom border (created by `createBottomBorder(...)`)
 *
 * If a filename is provided, it is included in the top border:
 *
 *     ╭─── my-file ────────────╮
 *     │ Content Line 1         │
 *     │ Content Line 2         │
 *     ╰────────────────────────╯
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
		throw new Error('fileNameColor requires fileName to be specified');
	}

	const measure = (str: string) => stripVTControlCharacters(str).length;
	const lineLengths = lines.map(measure);
	const maxLineLength = Math.max(...lineLengths);
	const fileNameWidth = fileName ? measure(fileName) + 4 : 0; // +4 for spacing
	const boxWidth = Math.max(maxLineLength, fileNameWidth);

	return [
		createTopBorder(boxWidth, fileName, borderColor, fileNameColor),
		...createContentLines(lines, boxWidth, borderColor, textColor),
		createBottomBorder(boxWidth, borderColor),
	].join('\n');
}

/**
 * Creates the top border of the box.
 *
 * Example outputs:
 *
 * Without a filename:
 *     ╭──────────────────────╮
 *
 * With a filename:
 *     ╭─── my-file ──────────╮
 */
function createTopBorder(
	width: number,
	fileName?: string,
	borderColor: (text: string) => string = (x) => x,
	fileNameColor?: (text: string) => string,
): string {
	const [start, end] = BOX.corners.top;
	let middle = '';

	if (fileName) {
		const cleanName = stripVTControlCharacters(fileName);
		const formattedName = fileNameColor ? fileNameColor(` ${fileName} `) : ` ${cleanName} `;

		const remainingSpace = Math.max(0, width - cleanName.length - 2);

		middle = `${borderColor(BOX.horizontal.repeat(2))}${formattedName}${borderColor(BOX.horizontal.repeat(remainingSpace))}`;
	} else {
		middle = borderColor(BOX.horizontal.repeat(width + 2));
	}

	return borderColor(start) + middle + borderColor(end);
}

/**
 * Creates the bottom border of the box.
 *
 * Example output:
 *
 * ╰──────────────────────╯
 */
function createBottomBorder(width: number, borderColor: (text: string) => string): string {
	const [start, end] = BOX.corners.bottom;
	const middle = borderColor(BOX.horizontal.repeat(width + 2));

	return `${borderColor(start)}${middle}${borderColor(end)}`;
}

/**
 * Creates the content lines inside the box, adding vertical borders and padding.
 *
 * Example output for a line "Hello" with width 20:
 *     │ Hello               │
 */
function createContentLines(
	lines: string[],
	width: number,
	borderColor: (text: string) => string,
	textColor: (text: string) => string,
): string[] {
	return lines.map((line) => {
		const cleanLine = stripVTControlCharacters(line);
		const padding = ' '.repeat(width - cleanLine.length);

		return `${borderColor(BOX.vertical)} ${textColor(line)}${padding} ${borderColor(BOX.vertical)}`;
	});
}

/**
 * This is the primary function intended for production use.
 */
export { createBox };

/**
 * These are exported for testing purposes only and should not be used directly in production.
 */
export { createTopBorder, createBottomBorder, createContentLines };
