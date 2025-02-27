import { useWarning } from "@/Contexts/WarningContext";

export default function GlobalWarning() {
    const { warning } = useWarning();

    if (!warning.show) return null; // Hide if no warning

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-red-600 font-semibold">{warning.message}</p>
            </div>
        </div>
    );
}