/**
 * 用户数据生成器（mockjs）
 * 用于冷启动时种子化 5 个预定义用户
 */
import Mock from 'mockjs';
import type { Gender, User } from '$lib/types/user.types';

const DEPARTMENTS = ['研发部', '市场部', '人力资源部', '财务部', '运营部'];
const POSITIONS = ['前端工程师', '后端工程师', '产品经理', 'UI 设计师', '测试工程师', '运营专员', 'HR 主管', '财务经理'];

function pad3(n: number): string {
	return n.toString().padStart(3, '0');
}

export function generateUsers(count = 5): User[] {
	const list: User[] = [];
	for (let i = 0; i < count; i++) {
		const seed = Mock.mock({
			name: '@cname',
			'gender|1': ['male', 'female'] as Gender[],
			phone: /^1[3-9]\d{9}$/,
			email: '@email',
			'department|1': DEPARTMENTS,
			'position|1': POSITIONS
		}) as Omit<User, 'id'>;
		list.push({ id: `user-${pad3(i + 1)}`, ...seed });
	}
	return list;
}
