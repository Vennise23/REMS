import React, { useState, useEffect, use } from "react";
import { Link, Head, router } from "@inertiajs/react";
import ApplicationLogo from "../Components/ApplicationLogo";
import { usePage } from '@inertiajs/react';
import axios from "axios";
import SideMenu from "../Components/SideMenu";
import SideMenuToggleButton from "../Components/SideMenuToggleBtn";
import NavLinks from "../Components/NavLinks";
import Dropdown from '@/Components/Dropdown';
import { IoNotifications } from "react-icons/io5";
import { FaEnvelope } from "react-icons/fa";

export default function Authenticated({ user, header, children }) {
    // Header Menu Declaration
    const [menuOpen, setMenuOpen] = useState(true);
    const [menuLinks, setMenuLinks] = useState([]);
    const [sideLinks, setSideLinks] = useState([]);
    const [smallScreenOnly, setSmallScreenOnly] = useState(false);
    // Header Design Declaration
    const [bgOpacity, setBgOpacity] = useState("bg-gray-100 bg-opacity-100 shadow-md");
    const [textColor, setTextColor] = useState("text-grey-600 hover:text-grey-900");
    const [fillColor, setFillColor] = useState("rgb(118,139,114)");
    // Toggle Menu Notification, Chat
    const [notifications, setNotifications] = useState([]);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [chatRooms, setChatRooms] = useState([]);
    const [totalUnreadChat, settotalUnreadChat] = useState(0);

    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.withCredentials = true;

        setMenuLinks([
            {
                href: "main",
                label: "Home",
                icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>),
            },
            {
                href: "buy",
                label: "Buy",
                icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13a3 3 0 100 6 3 3 0 000-6m10 0a3 3 0 100 6 3 3 0 000-6" />
                </svg>),
            },
            {
                href: "rent",
                label: "Rent",
                icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12h6v-2h-3v-2h-3v4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>),
            },
            {
                href: "new-launches",
                label: "New Launches",
                icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="5" y="5" width="14" height="14" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2" />
                </svg>),
            },
            {
                href: "find-seller",
                label: "Find Seller",
                icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>),
            },
        ])

        setSideLinks([
            {
                id: 1,
                type: "single",
                href: "",
                label: "Dashboard",
                icon: (<svg className="fill-stroke " width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4H5C4.44772 4 4 4.44772 4 5V9C4 9.55228 4.44772 10 5 10H9C9.55228 10 10 9.55228 10 9V5C10 4.44772 9.55228 4 9 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 4H15C14.4477 4 14 4.44772 14 5V9C14 9.55228 14.4477 10 15 10H19C19.5523 10 20 9.55228 20 9V5C20 4.44772 19.5523 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 14H5C4.44772 14 4 14.4477 4 15V19C4 19.5523 4.44772 20 5 20H9C9.55228 20 10 19.5523 10 19V15C10 14.4477 9.55228 14 9 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 14H15C14.4477 14 14 14.4477 14 15V19C14 19.5523 14.4477 20 15 20H19C19.5523 20 20 19.5523 20 19V15C20 14.4477 19.5523 14 19 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>),
            },
            {
                id: 2,
                type: "parent",
                href: "",
                label: "My Properties",
                icon: (<></>),
                links: [
                    {
                        href: "manage.property",
                        label: "Add Property",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 576" width='24' height='24'><path fill="currentColor" d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1h32V448c0 35.3 28.7 64 64 64h320.4c35.5 0 64.2-28.8 64-64.3l-.7-160.2h32zM256 208c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v48h48c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-48v48c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-48h-48c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h48z" /></svg>)
                    },
                    {
                        href: "my.properties",
                        label: "My Listing",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path d="M18.991 2H9.01C7.899 2 7 2.899 7 4.01v5.637l-4.702 4.642A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4.009C21 2.899 20.102 2 18.991 2zm-8.069 13.111V20H5v-5.568l2.987-2.949l2.935 3.003v.625zM13 9h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" fill="currentColor" /><path d="M7 15h2v2H7z" fill="currentColor" /></svg>)
                    },
                    {
                        href: "",
                        label: "Requests & Inquiries",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width='24' height='24'><path fill="none" stroke="currentColor" d="M11 12.5h3.5v-7L8 3.5l-6.5 2V8m3-1.5v6m0 0l-2-2m2 2l2-2m1.5-1l2-2m0 0l2 2m-2-2V12" /></svg>)
                    },
                    // {
                    //     href: "",
                    //     label: "Submissions & Approval",
                    //     icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width='24' height='24'><path fill="currentColor" d="m18.1 24.543l-9.204-5.19l3.199-5.61l9.206 5.187zm18.37 4.788l-15.552-8.76l-1.599 2.808l15.55 8.761zm1.888 1.065l-1.604 2.806l8.02 4.514l1.604-2.803zm-2.16 2.806c-.123.219-.459.271-.751.111c-.291-.164-.42-.475-.296-.697l1.875-3.285c.129-.223.465-.277.754-.111c.287.164.417.482.293.705zm11.832 1.799a2 2 0 0 0-1.011-.248l-2.051 3.592c.165.301.411.564.735.74c.904.512 2.041.217 2.538-.652l.526-.93c.498-.875.17-1.99-.737-2.502M22.191 17.849a.9.9 0 0 1-1.225.342l-8.056-4.542a.89.89 0 0 1-.339-1.223a.904.904 0 0 1 1.23-.334l8.054 4.536a.89.89 0 0 1 .336 1.221m1.129-1.972a.9.9 0 0 1-1.227.34l-8.059-4.541a.885.885 0 0 1-.337-1.217a.9.9 0 0 1 1.23-.341l8.056 4.537a.89.89 0 0 1 .337 1.222m-6.808 11.944a.907.907 0 0 1-1.229.334l-8.062-4.542a.894.894 0 0 1-.338-1.223a.91.91 0 0 1 1.229-.334l8.058 4.542a.9.9 0 0 1 .342 1.223m1.126-1.979a.9.9 0 0 1-1.234.335L8.348 21.64a.9.9 0 0 1-.339-1.223a.9.9 0 0 1 1.231-.335l8.055 4.537a.9.9 0 0 1 .343 1.223M4.119 33.921h14.204v1.633H4.119zm17.306 3.406a1.15 1.15 0 0 0-1.135-.963H2.156a1.15 1.15 0 0 0-1.135.963H1v2.674h20.446v-2.674z" /></svg>)
                    // }
                ]
            },
            {
                id: 3,
                type: "parent",
                href: "",
                label: "Marketplace",
                icon: (<></>),
                links: [
                    {
                        href: "",
                        label: "Saved Listing",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width='24' height='24'><g fill="currentColor"><path d="M7.293 1.5a1 1 0 0 1 1.414 0L11 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1-.708.708L8 2.207l-5 5V13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 2 13.5V8.207l-.646.647a.5.5 0 1 1-.708-.708z" /><path d="M12.5 16a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7m1.679-4.493l-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.707l.547.547l1.17-1.951a.5.5 0 1 1 .858.514" /></g></svg>)
                    },
                    {
                        href: "",
                        label: "My Applications",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width='24' height='24'><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="6.5" height="6.5" x="5.5" y="3" rx="1" /><path d="M4 12h7.61a1 1 0 0 1 .7.29l1.19 1.21M.5.5h1a1 1 0 0 1 1 1V10M4 11.75A2.11 2.11 0 0 1 4 12a1.74 1.74 0 1 1 0-.25ZM8.5 7h1" /></g></svg>)
                    },
                    {
                        href: "",
                        label: "Compare Listing",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" width='24' height='24'><path fill="currentColor" d="M272 288h-64a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v37.12c11.11-12.88 27-21.12 44.8-21.12h136.94l6.65-7.53A16.5 16.5 0 0 0 480 207a16.3 16.3 0 0 0-4.75-10.61L416 144V48a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v39.3L263.5 8.92C258 4 247.45 0 240.05 0s-17.93 4-23.47 8.92L4.78 196.42A16.15 16.15 0 0 0 0 207a16.4 16.4 0 0 0 3.55 9.39l18.79 21.31A16.22 16.22 0 0 0 33 242.48a16.5 16.5 0 0 0 9.34-3.48L64 219.88V384a32 32 0 0 0 32 32h176Zm357.33 160H592V288c0-17.67-12.89-32-28.8-32H332.8c-15.91 0-28.8 14.33-28.8 32v160h-37.33A10.67 10.67 0 0 0 256 458.67v10.66A42.82 42.82 0 0 0 298.6 512h298.8a42.82 42.82 0 0 0 42.6-42.67v-10.66A10.67 10.67 0 0 0 629.33 448M544 448H352V304h192Z" /></svg>)
                    }
                ]
            },
            {
                id: 4,
                type: "parent",
                href: "",
                label: "Transactions & Payments",
                icon: (<></>),
                links: [
                    {
                        href: "",
                        label: "My Orders",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2s-.9-2-2-2M1 2v2h2l3.6 7.59l-1.35 2.45c-.16.28-.25.61-.25.96c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2s2-.9 2-2s-.9-2-2-2" /></svg>)
                    },
                    {
                        href: "",
                        label: "Payment History",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 576" width='24' height='24'><path fill="currentColor" d="M64 64C28.7 64 0 92.7 0 128v256c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64zm208 128h224c8.8 0 16 7.2 16 16s-7.2 16-16 16H272c-8.8 0-16-7.2-16-16s7.2-16 16-16m-16 112c0-8.8 7.2-16 16-16h224c8.8 0 16 7.2 16 16s-7.2 16-16 16H272c-8.8 0-16-7.2-16-16m-92-152v13.9c7.5 1.2 14.6 2.9 21.1 4.7c10.7 2.8 17 13.8 14.2 24.5s-13.8 17-24.5 14.2c-11-2.9-21.6-5-31.2-5.2c-7.9-.1-16 1.8-21.5 5c-4.8 2.8-6.2 5.6-6.2 9.3c0 1.8.1 3.5 5.3 6.7c6.3 3.8 15.5 6.7 28.3 10.5l.7.2c11.2 3.4 25.6 7.7 37.1 15c12.9 8.1 24.3 21.3 24.6 41.6c.3 20.9-10.5 36.1-24.8 45c-7.2 4.5-15.2 7.3-23.2 9v13.8c0 11-9 20-20 20s-20-9-20-20v-14.6c-10.3-2.2-20-5.5-28.2-8.4c-2.1-.7-4.1-1.4-6.1-2.1c-10.5-3.5-16.1-14.8-12.6-25.3s14.8-16.1 25.3-12.6c2.5.8 4.9 1.7 7.2 2.4c13.6 4.6 24 8.1 35.1 8.5c8.6.3 16.5-1.6 21.4-4.7c4.1-2.5 6-5.5 5.9-10.5c0-2.9-.8-5-5.9-8.2c-6.3-4-15.4-6.9-28-10.7l-1.7-.5c-10.9-3.3-24.6-7.4-35.6-14C88 251.8 76.1 239 76 218.8c-.1-21.1 11.8-35.7 25.8-43.9c6.9-4.1 14.5-6.8 22.2-8.5v-14c0-11 9-20 20-20s20 9 20 20z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Billing & Invoice",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M.5 13.5h13m-9 0V.5h-4v13m8 0v-7h-4v7m8 0v-10h-4v10" /></svg>)
                    },
                    {
                        href: "",
                        label: "Wallet/Account Balance",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width='24' height='24'><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12.91 5.5H1.09c-.56 0-.8-.61-.36-.9L6.64.73a.71.71 0 0 1 .72 0l5.91 3.87c.44.29.2.9-.36.9Z" /><rect width="13" height="2.5" x=".5" y="11" rx=".5" /><path d="M2 5.5V11m2.5-5.5V11M7 5.5V11m2.5-5.5V11M12 5.5V11" /></g></svg>)
                    }
                ]
            },
            {
                id: 5,
                type: "parent",
                href: "",
                label: "Messages & Notifications",
                icon: (<></>),
                links: [
                    {
                        href: "",
                        label: "Messages",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6l3 3v-3h2V9h-2M4 4h11v8H9l-3 3v-3H4z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Notifications",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5.365V3m0 2.365a5.34 5.34 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175c0 .593 0 1.193-.538 1.193H5.538c-.538 0-.538-.6-.538-1.193c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.34 5.34 0 0 1 12 5.365m-8.134 5.368a8.46 8.46 0 0 1 2.252-5.714m14.016 5.714a8.46 8.46 0 0 0-2.252-5.714M8.54 17.901a3.48 3.48 0 0 0 6.92 0z" /></svg>)
                    }
                ]
            },
            {
                id: 6,
                type: "parent",
                href: "",
                label: "Profile & Account",
                icon: (<></>),
                links: [
                    {
                        href: "profile.show",
                        label: "Personal Info",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372l6.07-6.07a1.907 1.907 0 0 1 2.697 0Z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Security & Password",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm7 10c0 4.52-2.98 8.69-7 9.93c-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11l7 3.11zm-11.59.59L6 13l4 4l8-8l-1.41-1.42L10 14.17z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Settings",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width='24' height='24'><path fill="currentColor" fill-rule="evenodd" d="m392.18 256l.001 22.836a88.8 88.8 0 0 1 28.134 16.268l19.797-11.43l29.63 51.32l-19.784 11.423a89.4 89.4 0 0 1 1.482 16.25c0 5.55-.509 10.982-1.482 16.25l19.784 11.423l-29.63 51.32l-19.797-11.43a88.8 88.8 0 0 1-28.134 16.268v22.836h-59.26v-22.836a88.8 88.8 0 0 1-28.134-16.267l-19.797 11.43l-29.63-51.32l19.784-11.424a89.4 89.4 0 0 1-1.482-16.25c0-5.55.509-10.982 1.482-16.251l-19.784-11.422l29.63-51.32l19.796 11.43a88.8 88.8 0 0 1 28.135-16.268V256zm-141.513-21.333c19.434 0 37.713 5.092 53.644 14.049a128.5 128.5 0 0 0-38.57 30.345a66 66 0 0 0-11.166-1.613l-3.908-.114H176c-36.708 0-67.166 30.026-69.223 68.392l-.11 4.141V384l129.77.001a127.2 127.2 0 0 0 15.353 42.665L64 426.667v-76.8c0-62.033 47.668-112.614 107.383-115.104l4.617-.096zm111.884 92.444c-19.637 0-35.556 15.92-35.556 35.556c0 19.637 15.92 35.556 35.556 35.556c19.637 0 35.555-15.92 35.555-35.556c0-19.637-15.918-35.556-35.555-35.556M213.333 42.667c41.238 0 74.667 33.43 74.667 74.667c0 39.862-31.238 72.429-70.57 74.556l-4.097.11c-41.237 0-74.666-33.43-74.666-74.666c0-39.863 31.238-72.43 70.57-74.557zm0 42.667c-17.673 0-32 14.327-32 32s14.327 32 32 32s32-14.327 32-32s-14.327-32-32-32" /></svg>)
                    },
                    {
                        href: "",
                        label: "Goals & Wishlist",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linejoin="round" d="M2.5 14v-.5a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v.5m2.421-10a1 1 0 0 0-.414.093c-.13.062-.25.152-.35.265l-.156.18l-.16-.18a1.1 1.1 0 0 0-.349-.265a.97.97 0 0 0-.827 0q-.198.094-.35.265a1.32 1.32 0 0 0-.315.866c0 .324.113.635.316.866L13 8l1.683-1.91c.203-.231.316-.542.316-.866s-.113-.635-.316-.866a1.1 1.1 0 0 0-.35-.265A1 1 0 0 0 13.922 4ZM9.5 5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" /></svg>)
                    }
                ]
            },
            {
                id: 7,
                type: "parent",
                href: "",
                label: "Support & Help Center",
                icon: (<></>),
                links: [
                    {
                        href: "",
                        label: "FAQs",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width='24' height='24'><path fill="currentColor" d="M13 0C5.925 0 0 5.08 0 11.5c0 3.03 1.359 5.748 3.5 7.781a6.7 6.7 0 0 1-1.094 1.875A16.5 16.5 0 0 1 .375 23.22A1 1 0 0 0 1 25c2.215 0 3.808-.025 5.25-.406c1.29-.342 2.399-1.058 3.531-2.063c1.03.247 2.093.469 3.219.469c7.075 0 13-5.08 13-11.5S20.075 0 13 0m0 2c6.125 0 11 4.32 11 9.5S19.125 21 13 21c-1.089 0-2.22-.188-3.25-.469a1 1 0 0 0-.938.25c-1.125 1.079-1.954 1.582-3.062 1.875c-.51.135-1.494.103-2.188.157c.14-.158.271-.242.407-.407c.786-.96 1.503-1.975 1.719-3.125a1 1 0 0 0-.344-.937C3.249 16.614 2 14.189 2 11.5C2 6.32 6.875 2 13 2m-1.906 3.906a1 1 0 0 0-.469.25l-1.5 1.407l1.344 1.468l1.187-1.125h2.406L15 8.97v1.469l-2.563 1.718A1 1 0 0 0 12 13v2h2v-1.438l2.563-1.718A1 1 0 0 0 17 11V8.594a1 1 0 0 0-.25-.656l-1.5-1.688a1 1 0 0 0-.75-.344h-3.188a1 1 0 0 0-.218 0M12 16v2h2v-2z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Contact Support",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.079 6.839a3 3 0 0 0-4.255.1M13 20h1.083A3.916 3.916 0 0 0 18 16.083V9A6 6 0 1 0 6 9v7m7 4v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1m-7-4v-6H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2zm12-6h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1z" /></svg>)
                    },
                    {
                        href: "",
                        label: "Guides & Tutorials",
                        icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 17h.01M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" /></g></svg>)
                    }
                ]
            },
        ])
        setSmallScreenOnly(false);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(route("logout"), {}, {
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content
                }
            });
            window.location.reload();
        } catch (error) {
            if (error.response && error.response.status === 419) {
                console.warn("Error 419: CSRF token issue. Reloading page...");
                window.location.reload(); // Reload to refresh CSRF token
            } else {
                console.error("Logout failed:", error);
            }
        }
    };

    // Get auth data from Inertia page props
    const { auth } = usePage().props;

    return (
        <div className="min-h-[screen] bg-gray-100">
            <header className={`p-6 fixed top-0 left-0 w-full flex flex-nowrap item-center z-50 shadow-md transition-colors duration-500 ease-in-out ${bgOpacity}`}>
                {menuLinks.length > 0 && (
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        className={`focus:outline-none flex-grow justify-center w-fit
                                ${smallScreenOnly ? "md:hidden" : ""}`}>
                        <SideMenuToggleButton />
                    </button>
                )}
                <div className="container mx-auto flex justify-between items-center">

                    <div className="flex items-center space-x-4">
                        <Link href={route("main")} >
                            <div className="w-13 h-12">
                                <ApplicationLogo fillColor={fillColor.toString()} />
                            </div>
                        </Link>
                    </div>

                    <NavLinks textColor={textColor} links={menuLinks} />

                    <div className="flex items-center space-x-4">
                        {auth?.user && (
                            <>
                                <Dropdown id="Notification">
                                    <Dropdown.Trigger notify={totalNotifications}>
                                        <IoNotifications className="w-6 h-6" />
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Title>Notification</Dropdown.Title>
                                        {notifications.length === 0 ? (
                                            <Dropdown.Text>No related notifications</Dropdown.Text>
                                        ) : (
                                            notifications.map((notification) => (
                                                <Dropdown.Link
                                                    href={route('notification-detail/' + notification.id)}
                                                    className={(notification.isRead) ? '' : ((notification.status === 'approved') ? 'bg-green-100' : 'bg-reed-100')}
                                                >
                                                    <Dropdown.BoxLink title={notification.property_name}>
                                                        {notification.status === 'approved' ? (
                                                            <span>This property has been approved.</span>
                                                        ) : notification.status === 'rejected' ? (
                                                            <>
                                                                <span>This property has been rejected.</span>
                                                                <br />
                                                                <span className="font-bold text-red-500 text-sm">Rejection Reason: {notification.rejection_reason}.</span>
                                                            </>
                                                        ) : ('')}
                                                    </Dropdown.BoxLink>
                                                </Dropdown.Link>
                                            ))
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>

                                <Dropdown id="Message">
                                    <Dropdown.Trigger notify={totalUnreadChat}>
                                        <FaEnvelope className="w-6 h-6" />
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Title>Message</Dropdown.Title>
                                        {chatRooms.length === 0 ? (
                                            <Dropdown.Text>No Message Received.</Dropdown.Text>
                                        ) : (
                                            chatRooms.map((room) => {
                                                const otherUser = auth.user.id === room.buyer?.id ? room.seller : room.buyer;
                                                return (
                                                    <Dropdown.Link
                                                        href={route('chatRoom/' + room.id)}
                                                        className={(room.unread_count > 0) ? 'bg-orange-100' : ''}
                                                    >
                                                        <Dropdown.BoxLink title={otherUser?.firstname} notify={room.unread_count}>
                                                            {room.property?.property_name}
                                                        </Dropdown.BoxLink>
                                                    </Dropdown.Link>
                                                );
                                            })
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>

                                <Dropdown id="user">
                                    <Dropdown.Trigger className={"inline-flex items-center justify-around w-28"}>
                                        <img
                                            src={auth.user.profile_picture ? `/storage/${auth.user.profile_picture}` : "https://ui-avatars.com/api/?name=User&background=random"}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                        {auth.user.firstname}
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        {auth.user?.role === "admin" && (
                                            <Dropdown.Link href={route("admin.dashboard")}>Admin Dashboard</Dropdown.Link>
                                        )}
                                        <Dropdown.Link href={route("profile.show")}>User Profile</Dropdown.Link>
                                        <Dropdown.Link href={route("my.properties")}>Manage Properties</Dropdown.Link>
                                        <Dropdown.Link as="button" onClick={handleLogout}>Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </>
                        )}
                    </div>
                </div>
                <div className={`focus:outline-none flex-grow justify-center w-[30px]
                                ${smallScreenOnly ? "md:hidden" : ""}`}>
                    </div>
            </header>
            <div className="relative w-full max min-h-screen h-full overflow-hidden">
                <div className="flex h-screen w-full pt-[100px] min-h-screen">
                    {menuLinks.length > 0 &&
                        <>
                            <div className=" z-20 transition-all duration-500">
                                <SideMenu menuState={menuOpen} links={sideLinks} smallScreenOnly={smallScreenOnly} phoneOnlyLinks={menuLinks} />
                            </div>
                        </>
                    }
                    <main className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 bg-gray-100 transition-all duration-500 ${menuOpen ? "pl-[250px]" : "pl-[70px]"}`}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
