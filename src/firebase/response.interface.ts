export interface FirestoreResponse<T> {
	data?: T | T[];
	message: string;
	status: 'success' | 'failure';
	error?: string;
}
