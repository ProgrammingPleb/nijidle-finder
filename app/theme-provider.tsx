"use client";

import { ConfigProvider, theme } from "antd";

export default function ThemeProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ConfigProvider
            theme={{
                algorithm: [theme.darkAlgorithm],
            }}
        >
            {children}
        </ConfigProvider>
    );
}
