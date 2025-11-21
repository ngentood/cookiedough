import { getBrowserAPI } from "./browserCompat";

export async function getAllCookies(url: string): Promise<chrome.cookies.Cookie[]> {
	return new Promise<chrome.cookies.Cookie[]>((resolve, reject) => {
		try {
			const browserAPI = getBrowserAPI();

			// Check if cookies API is available
			if (!browserAPI || !browserAPI.cookies) {
				reject(new Error('Browser cookies API not available'));
				return;
			}

			browserAPI.cookies.getAll({
				url: url,
			}, (cookies: any[]) => {
				if (browserAPI.runtime && browserAPI.runtime.lastError) {
					reject(new Error(browserAPI.runtime.lastError.message || 'Unknown error getting cookies'));
				} else {
					resolve(cookies || []);
				}
			});
		} catch (error) {
			reject(new Error(`Failed to get cookies: ${error instanceof Error ? error.message : 'Unknown error'}`));
		}
	});
}

export async function removeAllCookies(url: string): Promise<void> {
	try {
		const cookies = await getAllCookies(url);
		const promises = cookies.map(cookie => removeCookie(url, cookie));
		await Promise.all(promises);
	} catch (error) {
		throw new Error(`Failed to remove cookies: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export async function removeCookie(url: string, cookie: chrome.cookies.Cookie): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		try {
			const browserAPI = getBrowserAPI();

			// Check if cookies API is available
			if (!browserAPI || !browserAPI.cookies) {
				reject(new Error('Browser cookies API not available'));
				return;
			}

			console.log(`Removing cookie ${cookie.name} from ${url}`);

			browserAPI.cookies.remove({
				url: url,
				name: cookie.name,
			}, (details: any) => {
				if (browserAPI.runtime && browserAPI.runtime.lastError) {
					reject(new Error(browserAPI.runtime.lastError.message || 'Unknown error removing cookie'));
				} else {
					console.log(`Successfully removed cookie: ${cookie.name}`);
					resolve();
				}
			});
		} catch (error) {
			reject(new Error(`Failed to remove cookie: ${error instanceof Error ? error.message : 'Unknown error'}`));
		}
	});
}

export async function setCookie(url: string, name: string, value: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		try {
			const browserAPI = getBrowserAPI();

			// Check if cookies API is available
			if (!browserAPI || !browserAPI.cookies) {
				reject(new Error('Browser cookies API not available'));
				return;
			}

			console.log(`Setting cookie ${name}=${value} on ${url}`);

			browserAPI.cookies.set({
				url: url,
				name: name,
				value: value,
			}, (cookie: any) => {
				if (browserAPI.runtime && browserAPI.runtime.lastError) {
					reject(new Error(browserAPI.runtime.lastError.message || 'Unknown error setting cookie'));
				} else {
					console.log(`Successfully set cookie: ${name}`);
					resolve();
				}
			});
		} catch (error) {
			reject(new Error(`Failed to set cookie: ${error instanceof Error ? error.message : 'Unknown error'}`));
		}
	});
}
