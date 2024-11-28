"use client"
import {useEffect, useState} from "react";
import LocalStorageService from "@/services/local_store_service";


export function useUser() {
    const [auth, setUser] = useState<true | null | false>(false);

    useEffect(() => {
        const token = LocalStorageService.getToken();

        if (token) {
            setUser(true);
        } else {
            setUser(null);
        }

    }, []);

    return auth;
}
