"use client"
import {useEffect, useState} from "react";


export function useUser() {
    const [auth, setUser] = useState<true | null | false>(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            setUser(true);
        } else {
            setUser(null);
        }

    }, []);

    return auth;
}
