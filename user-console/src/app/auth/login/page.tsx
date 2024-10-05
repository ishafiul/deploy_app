'use client'

import {Form, Input, Button, Typography, Space, Divider} from 'antd';
import {useRouter} from "next/navigation";
import {MailOutlined, GithubOutlined} from '@ant-design/icons';
import AuthService from "@/services/AuthService";

const {Title} = Typography;
export default function Login() {
    const router = useRouter();
    return (
        <Space direction="vertical" size="large" align="center" className="w-full">
            <Title level={3} className="text-center text-white">
                Enter Your Email
            </Title>

            <Form
                name="login"
                initialValues={{remember: true}}
                className="w-full"
                onFinish={() => {
                    router.push('/console/auth/verify-otp');
                }}
            >
                <Form.Item
                    name="email"
                    rules={[
                        {required: true, message: 'Please input your email!'},
                        {type: 'email', message: 'Please enter a valid email!'},
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="site-form-item-icon"/>}
                        placeholder="Email"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        size="large"
                    >
                        Send OTP
                    </Button>
                </Form.Item>
            </Form>

            <Divider>Or</Divider>
            <Button
                type="default"
                icon={<GithubOutlined/>}
                className="w-full"
                size="large"
                onClick={() => {
                    const authService = new AuthService();
                    authService.loginWithGithub();
                }}
            >
                Login with GitHub
            </Button>
        </Space>
    );
}
