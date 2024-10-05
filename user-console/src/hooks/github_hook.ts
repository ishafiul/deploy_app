import {useState} from "react";
import AuthService from "@/services/AuthService";

export const useAuthBloc = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginWithGithub = async (code: string) => {
        setLoading(true);
        setError(null); // Reset error state

        try {
            const authService = new AuthService();
            return await authService.verifyGithubAuthCode(code);
        } catch (err) {
            console.log(err)
            setError("Login failed, please try again."); // Handle error
        } finally {
            setLoading(false); // Set loading to false after the operation
        }
    };

    return {loading, error, loginWithGithub};
};