'use client'

import { Flex, Input, } from 'antd';
import type { GetProps } from 'antd';

type OTPProps = GetProps<typeof Input.OTP>;
export default function Home() {
    const onChange: OTPProps['onChange'] = (text:string) => {
        console.log('onChange:', text);
    };

    const sharedProps: OTPProps = {
        onChange,
    };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <Flex gap="middle" align="flex-start" vertical>
            <Input.OTP length={8} {...sharedProps} />
        </Flex>
    </div>
  );
}
