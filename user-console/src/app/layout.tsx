"use client";
import "./globals.css";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {useUser} from "@/utils/auth_hook";
import {usePathname, useRouter} from "next/navigation";
import {LoadingOutlined} from "@ant-design/icons";
import {Spin, ConfigProvider, theme} from "antd";
import {Layout, Menu, Avatar, Dropdown, Space, Breadcrumb} from "antd";
import {UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";

const {Header, Sider, Content} = Layout;
import React, {useEffect, useState} from "react";
import AuthService from "@/services/AuthService";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const auth = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };
    const userMenu = (
        <Menu>
            <Menu.Item key="1">Profile</Menu.Item>
            <Menu.Item key="2"
                       onClick={async () => {
                          const authService = new AuthService()
                           await authService.logout()
                           router.push("/auth/login")
                       }}>Logout</Menu.Item>
        </Menu>
    );
    useEffect(() => {
        // Perform redirection inside useEffect to avoid updating state during render
        if (!auth && !pathname.startsWith("/auth")) {
            router.push("/auth/login");
        }
    }, [auth, pathname, router]);

    // Show loading spinner while auth is false
    if (auth === false) {
        return (
            <html lang="en">
            <body>
            <div className="flex justify-center items-center h-screen w-screen">
                <Spin indicator={<LoadingOutlined style={{fontSize: 48}} spin/>}/>
            </div>
            </body>
            </html>
        );
    }
    if (pathname.startsWith("/auth")) {
        return (
            <html lang="en">
            <body>
            <AntdRegistry>
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        token: {
                            // Seed Token
                            colorPrimary: "#097D5D",
                        },
                    }}
                >
                    {children}
                </ConfigProvider>
            </AntdRegistry>
            </body>
            </html>
        )
    }
    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        // Seed Token
                        colorPrimary: "#097D5D",
                    },
                }}
            >
                <Layout style={{minHeight: "100vh"}}>
                    {/* Sidebar */}
                    <Sider collapsible collapsed={collapsed} trigger={null}>
                        <div className="flex items-center justify-center h-16 text-white text-xl">
                            Admin Panel
                        </div>
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                            <Menu.Item key="1" icon={<UserOutlined/>}>
                                Dashboard
                            </Menu.Item>
                            <Menu.Item key="2" icon={<UserOutlined/>}>
                                Users
                            </Menu.Item>
                            <Menu.Item key="3" icon={<UserOutlined/>}>
                                Settings
                            </Menu.Item>
                        </Menu>
                    </Sider>

                    {/* Main layout */}
                    <Layout className="site-layout">
                        {/* Top Navbar */}
                        <Header className="site-layout-background" style={{padding: 0}}>
                            <div className="flex justify-between items-center px-4">
                                {/* Collapsible sidebar button */}
                                <div onClick={toggleCollapsed} className="cursor-pointer text-white">
                                    {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                </div>

                                {/* User dropdown */}
                                <Dropdown overlay={userMenu} placement="bottomRight">
                                    <Space className="cursor-pointer">
                                        <Avatar icon={<UserOutlined/>}/>
                                    </Space>
                                </Dropdown>
                            </div>
                        </Header>

                        {/* Breadcrumbs and Content */}
                        <Content className="p-4">
                            <Breadcrumb style={{margin: "16px 0"}}>
                                <Breadcrumb.Item>Home</Breadcrumb.Item>
                                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                            </Breadcrumb>
                            <div
                                className="site-layout-background p-6"
                                style={{minHeight: 360}}
                            >
                                {children}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
