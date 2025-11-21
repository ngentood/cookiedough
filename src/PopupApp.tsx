import React, { useState, useEffect } from "react";
import { copyToClipboard } from "./clipboard";
import { getAllCookies, removeAllCookies, setCookie } from "./cookies";
import { getBrowserAPI, isChromeAPI } from "./browserCompat";

interface Cookie {
	name: string;
	value: string;
}

// Error boundary component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error?: Error }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('React Error Boundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
					<h3>Extension Error</h3>
					<p>Something went wrong with the Cookiedough extension.</p>
					<p><strong>Error:</strong> {this.state.error?.message}</p>
					<p>Please try refreshing the page or restarting your browser.</p>
				</div>
			);
		}

		return this.props.children;
	}
}

const PopupApp: React.FC = () => {
	const [cookies, setCookies] = useState<string>('');
	const [clear, setClear] = useState<boolean>(true);
	const [oldCookies, setOldCookies] = useState<string | null>(null);
	const [url, setUrl] = useState<string | null>(null);
	const [browserAPI] = useState(() => {
		try {
			return getBrowserAPI();
		} catch (error) {
			console.error('Browser API detection failed:', error);
			return null;
		}
	});
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				console.log('Browser API available:', !!browserAPI);

				// Check if browser APIs are available
				if (!browserAPI || !browserAPI.tabs) {
					throw new Error('Browser extension APIs not available');
				}

				let tabs;

				// Use callback-based approach for better compatibility
				tabs = await new Promise<any[]>((resolve, reject) => {
					try {
						browserAPI.tabs.query(
							{ active: true, currentWindow: true },
							(result: any[]) => {
								if (browserAPI.runtime && browserAPI.runtime.lastError) {
									console.error('Browser runtime error:', browserAPI.runtime.lastError);
									reject(new Error(browserAPI.runtime.lastError.message));
								} else {
									resolve(result);
								}
							}
						);
					} catch (error) {
						console.error('Tabs query error:', error);
						reject(error);
					}
				});

				if (!tabs || tabs.length === 0) {
					throw new Error('No active tab found');
				}

				const tab = tabs[0];
				const currentUrl = tab.url;

				if (!currentUrl) {
					throw new Error('No URL found for current tab');
				}

				// Check if we can access this URL
				if (currentUrl.startsWith('chrome://') ||
					currentUrl.startsWith('chrome-extension://') ||
					currentUrl.startsWith('moz-extension://') ||
					currentUrl.startsWith('edge://')) {
					throw new Error('Cannot access browser internal pages');
				}

				console.log('Current URL:', currentUrl);
				setUrl(currentUrl);

				const existingCookies = await getCookies(currentUrl);
				setOldCookies(existingCookies);
				setIsInitialized(true);

				// Hide loading message
				const loadingDiv = document.getElementById('loading');
				if (loadingDiv) {
					loadingDiv.style.display = 'none';
				}
			} catch (error) {
				console.error('Error initializing app:', error);
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				const browserType = isChromeAPI() ? 'Chrome/Chromium' : 'Firefox/Other';

				// Show error message
				const errorDiv = document.getElementById('error');
				const loadingDiv = document.getElementById('loading');
				if (errorDiv) {
					errorDiv.textContent = `Error: ${errorMessage}\n\nBrowser: ${browserType}\n\nThis extension may not be compatible with your browser.\n\nTry refreshing the page or restarting the browser.`;
					errorDiv.style.display = 'block';
				}
				if (loadingDiv) {
					loadingDiv.style.display = 'none';
				}
			}
		};

		// Add a small delay to ensure extension context is ready
		const timer = setTimeout(initializeApp, 200);

		return () => clearTimeout(timer);
	}, []);

	const handleClick = async (): Promise<void> => {
		if (!url) return;

		const cookieString = cookies;

		try {
			if (clear) {
				await removeAllCookies(url);
			}

			await applyCookies(cookieString);
			window.close();
		} catch (err: any) {
			alert(err.message);
		}
	};

	const applyCookies = (cookieString: string): Promise<any> => {
		const cookieList = cookieString.split(/; */);

		const promises = cookieList.map(cookieString => {
			const keyVal = cookieString.split('=');
			const key = keyVal[0];
			const value = keyVal.length > 1 ? keyVal[1] : '';

			return setCookie(url!, key, value);
		});

		return Promise.all(promises);
	};

	const getCookies = async (url: string): Promise<string> => {
		const cookies = await getAllCookies(url);
		return cookies
			.map(cookie => cookie.name + "=" + cookie.value)
			.join("; ");
	};

	const handleCopyToClipboard = async () => {
		if (oldCookies) {
			try {
				await copyToClipboard(oldCookies);
			} catch (error) {
				console.error('Failed to copy to clipboard:', error);
				alert('Failed to copy cookies to clipboard');
			}
		}
	};

	if (url === null || oldCookies === null || !isInitialized) {
		return null;
	}

	return (
		<ErrorBoundary>
			<div>
				<div style={{ color: 'grey' }}>
					Existing cookies <button onClick={handleCopyToClipboard}>copy</button>
				</div>

				<div style={{ marginTop: '0.5em' }}>
					<textarea
						rows={5}
						cols={100}
						value={oldCookies}
						readOnly={true}
					></textarea>
				</div>

				<div style={{ color: 'grey', marginTop: '1em' }}>
					Update cookies with a cookie header, e.g. <code>foo=bar; bat=baz; oof=rab</code>
				</div>

				<div style={{ marginTop: '0.5em' }}>
					<textarea
						rows={5}
						cols={100}
						value={cookies}
						onChange={event => setCookies(event.target.value)}
					></textarea>
				</div>

				<div style={{ marginTop: '1em' }}>
					<label>
						<input
							type="checkbox"
							checked={clear}
							onChange={event => setClear(event.target.checked)}
						/>
						Clear existing cookies first
					</label>
				</div>

				<div style={{ marginTop: '1em' }}>
					<button onClick={handleClick}>Set Cookies</button>
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default PopupApp;
