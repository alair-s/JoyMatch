/**
 * 404 页面组件
 */

import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-8xl">🔍</div>
            <h1 className="text-3xl font-bold text-white">页面不存在</h1>
            <p className="text-white/60 text-center max-w-md">
                你访问的页面可能已被移除或地址错误
            </p>
            <Link
                to="/"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
            >
                返回首页
            </Link>
        </div>
    );
}

// 默认导出 + Component 导出（支持 lazy 加载）
export default NotFound;
export const Component = NotFound;
