export interface FirestoreResponse<T extends object> {
	data?: T;
	message: string;
	status: 'success' | 'failure';
	error?: string;
}
