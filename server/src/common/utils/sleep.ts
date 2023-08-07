/**
 * Sleep for a given amount of time
 * @param timeout - The amount of time to sleep in milliseconds
 */
export function sleep(timeout: number) {
	return new Promise(resolve => {
		setTimeout(resolve, timeout)
	})
}
