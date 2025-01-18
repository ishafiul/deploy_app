export class MailService {
    async sentOtp(email: string, otp: number) {
        try {
            const url = new URL('https://api.groundcraft.xyz/mail');

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SERVER_KEY}`
                },
                body: JSON.stringify({
                    "to": email,
                    "type": {
                        "otp": {
                            "otpCode": otp.toString()
                        }
                    }
                }),
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Failed to send email: ${response.status} - ${response.statusText} - ${responseText}`);
            }
        } catch (e) {
            console.error('Error sending OTP:', e);
            throw new Error('Failed to send email');
        }
    }
}