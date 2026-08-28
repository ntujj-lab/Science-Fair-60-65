import type { Metadata } from 'next';
import './globals.css';
import './analysis.css';
export const metadata:Metadata={title:'科展脈絡｜全國國中科展研究分析',description:'第60–66屆全國國中科展得獎作品分類、關鍵字查詢與研究架構分析。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><body>{children}</body></html>}
