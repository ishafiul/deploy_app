"use client";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { useUser } from "@/utils/auth_hook";
import { usePathname, useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin, ConfigProvider, theme } from "antd";
import React, { useEffect } from "react";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const auth = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Perform redirection inside useEffect to avoid updating state during render
        if (!auth && !pathname.startsWith("/auth")) {
            router.push("/auth/login");
        }
    }, [auth, pathname, router]);

    // Show loading spinner while auth is false
    if (auth === false) {
        return (
            <html lang="en">
            <body>
            <div className="flex justify-center items-center h-screen w-screen">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
            </body>
            </html>
        );
    }

    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        // Seed Token
                        colorPrimary: "#097D5D",
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
