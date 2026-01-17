/**
 * 根布局组件
 * 用于数据路由的 lazy 加载
 */

import React, { Suspense } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';

/** 加载状态组件 */
const LoadingFallback = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white/60 text-sm">加载中...</span>
        </div>
    </div>
);

/** 根布局 */
function RootLayout() {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';

    return (
        <div className="relative">
            {/* 全局加载指示器 */}
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-purple-500/30 z-50">
                    <div className="h-full bg-purple-500 animate-pulse" style={{ width: '30%' }} />
                </div>
            )}

            {/* 页面内容 */}
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        </div>
    );
}

// 默认导出 + Component 导出（支持 lazy 加载）
export default RootLayout;
export const Component = RootLayout;
