'use client'

import {Form, Input, Button, Typography, Space} from 'antd';
import {useRouter} from "next/navigation";

const {Title} = Typography;
export default function Home() {
    const router = useRouter();
    return (
        <Space direction="vertical" size="large" align="center" className="w-full">
            <Title level={3} className="text-center text-white">
                Verify Your OTP
            </Title>

            <Form
                name="otp-verification"
                initialValues={{remember: true}}
                className="w-full"
                onFinish={() => {

                    router.push('/auth/login')
                }}
            >
                <Form.Item
                    name="otp"
                    rules={[{required: true, message: 'Please input the OTP!'}]}
                >
                    <Input.OTP length={5}/>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        size="large"
                    >
                        Verify OTP
                    </Button>
                </Form.Item>
            </Form>
        </Space>
    );
}
