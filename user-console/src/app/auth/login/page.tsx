'use client'

import { Form, Input, Button, Typography, Space } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import {useRouter} from "next/navigation";
const {Title} = Typography;
export default function Home() {
    const router = useRouter();
    return (
        <Space direction="vertical" size="large" align="center" className="w-full">
            <Title level={3} className="text-center text-white">
                Enter Your Email
            </Title>

            <Form
                name="login"
                initialValues={{ remember: true }}
                className="w-full"
                onFinish={() => {

                    router.push('/console/auth/verify-otp')
                }}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                >
                    <Input
                        prefix={<MailOutlined className="site-form-item-icon" />}
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
        </Space>
    );
}
