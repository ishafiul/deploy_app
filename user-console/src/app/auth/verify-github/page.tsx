'use client'

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {useRouter, useSearchParams} from "next/navigation";
import React, {useEffect} from "react";
import {useAuthBloc} from "@/hooks/github_hook";

export default function VerifyGithub() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loading, error, loginWithGithub } = useAuthBloc(); // Use the BLoC

    useEffect(() => {
        const code = searchParams.get("code");

        if (code) {
            // Call the login method from the BLoC
            loginWithGithub(code).then((token) => {
                if (token) {
                    router.push("/"); // Redirect on successful login
                }
            });
        } else {
            console.error("No GitHub code found in query parameters");
        }
    }, []);
    if (loading) {
        return (
            <div>
                <Spin indicator={<LoadingOutlined style={{fontSize: 48}} spin/>}/>
                <p className="mt-4 text-lg text-white">Logging in, please wait...</p>
            </div>
        );
    }

    // Handle error state if needed
    if (error) {
        return <div className="text-red-500 text-center">{error}</div>; // Show error message
    }

    return null; // Return null if loading is done and no redirect has happened
}
