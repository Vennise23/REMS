import React from "react";
import { Link, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";

export default function Buy({ auth }) {
    return (
        <>
            <Head title="Buy" />
            <Header auth={auth} />





            <main className="pt-32 min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold text-gray-700">This is the buy page(example)</h1>
            </main>
        </>
    );
}