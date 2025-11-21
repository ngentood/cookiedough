// Browser compatibility layer
declare global {
	interface Window {
		browser?: any;
	}
}

export const getBrowserAPI = () => {
	// Try to detect the available browser API
	if (typeof window !== 'undefined' && typeof window.browser !== 'undefined') {
		return window.browser; // Firefox, some Edge versions
	} else if (typeof chrome !== 'undefined') {
		return chrome; // Chrome, Chromium-based browsers
	}
	throw new Error('No supported browser API found');
};

export const isChromeAPI = () => {
	return typeof chrome !== 'undefined' && chrome !== null;
};

export const isBrowserAPI = () => {
	return typeof window !== 'undefined' && typeof window.browser !== 'undefined' && window.browser !== null;
};