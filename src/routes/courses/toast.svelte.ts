export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
}

class ToastStore {
	toasts = $state<Toast[]>([]);

	add(message: string, type: 'success' | 'error' | 'info' = 'info') {
		const id = crypto.randomUUID();
		this.toasts.push({ id, message, type });
		setTimeout(() => {
			this.remove(id);
		}, 3000);
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toastStore = new ToastStore();
