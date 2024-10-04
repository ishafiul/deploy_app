"use client";
import React, { useEffect } from "react";
import { useUser } from "@/utils/auth_hook";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const auth = useUser(); // Assuming useUser() is your custom auth hook
    const router = useRouter();

    // Use useEffect to handle the redirect based on auth status
    useEffect(() => {
        if (auth === true) {
            router.push("/"); // Redirect to the home page or other route after auth
        }
    }, [auth, router]); // Only run the effect when `auth` or `router` changes

    // Handle loading state (still inside render)
    if (auth === false) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
        );
    }

    // Return null if redirecting, since we don't want to render anything
    if (auth === true) {
        return null; // Avoid rendering anything while navigating
    }

    // If auth is null (unauthenticated), render the login screen
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 shadow-md rounded-lg">
                {children}
            </div>
        </div>
    );
}
