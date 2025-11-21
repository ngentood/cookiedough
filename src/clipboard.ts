/**
 * Tools for working with the clipboard
 */

/**
 * Copy the text to the clipboard using modern Clipboard API with fallback
 */
export async function copyToClipboard(text: string): Promise<void> {
	try {
		// Try modern Clipboard API first
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard using modern API');
			return;
		}
	} catch (error) {
		console.warn('Modern clipboard API failed, falling back to legacy method:', error);
	}

	// Fallback to legacy method for older browsers or insecure contexts
	fallbackCopyTextToClipboard(text);
}

/**
 * Legacy fallback method for copying text to clipboard
 */
function fallbackCopyTextToClipboard(text: string): void {
	const textArea = document.createElement("textarea");

	// Position the textarea off-screen
	textArea.style.position = 'fixed';
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.width = '2em';
	textArea.style.height = '2em';
	textArea.style.padding = '0';
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';
	textArea.style.background = 'transparent';

	textArea.value = text;

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand('copy');
		if (successful) {
			console.log('Text copied to clipboard using fallback method');
		} else {
			console.error('Failed to copy text to clipboard using fallback method');
		}
	} catch (err) {
		console.error('Oops, unable to copy:', err);
		throw new Error('Failed to copy text to clipboard');
	} finally {
		document.body.removeChild(textArea);
	}
}