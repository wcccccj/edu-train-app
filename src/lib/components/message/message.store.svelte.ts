export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageOptions {
	/** 消息类型，默认 info */
	type?: MessageType;
	/** 标题，默认根据类型自动生成 */
	title?: string;
	/** 消息正文内容 */
	content: string;
	/** 自动关闭延迟（毫秒），0 表示不自动关闭，默认 3000 */
	duration?: number;
	/** 关闭时触发的回调 */
	onClose?: () => void;
}

export interface MessageItem {
	id: string;
	type: MessageType;
	title: string;
	content: string;
	duration: number;
	onClose?: () => void;
}

const DEFAULT_TITLES: Record<MessageType, string> = {
	success: '成功',
	error: '错误',
	warning: '提示',
	info: '信息'
};

class MessageStore {
	messages = $state<MessageItem[]>([]);

	/** 展示一条消息，返回消息 id，可用于手动关闭 */
	show(options: MessageOptions): string {
		const id = crypto.randomUUID();
		const type = options.type ?? 'info';
		const duration = options.duration ?? 3000;
		const item: MessageItem = {
			id,
			type,
			title: options.title ?? DEFAULT_TITLES[type],
			content: options.content,
			duration,
			onClose: options.onClose
		};
		this.messages.push(item);
		if (duration > 0) {
			setTimeout(() => this.close(id), duration);
		}
		return id;
	}

	/** 关闭指定消息，并触发其 onClose 回调 */
	close(id: string) {
		const item = this.messages.find((m) => m.id === id);
		if (!item) return;
		item.onClose?.();
		this.messages = this.messages.filter((m) => m.id !== id);
	}

	/** 清空所有消息 */
	clear() {
		this.messages = [];
	}

	success(content: string, options?: Omit<MessageOptions, 'type' | 'content'>) {
		return this.show({ ...options, type: 'success', content });
	}

	error(content: string, options?: Omit<MessageOptions, 'type' | 'content'>) {
		return this.show({ ...options, type: 'error', content });
	}

	warning(content: string, options?: Omit<MessageOptions, 'type' | 'content'>) {
		return this.show({ ...options, type: 'warning', content });
	}

	info(content: string, options?: Omit<MessageOptions, 'type' | 'content'>) {
		return this.show({ ...options, type: 'info', content });
	}
}

export const messageStore = new MessageStore();
