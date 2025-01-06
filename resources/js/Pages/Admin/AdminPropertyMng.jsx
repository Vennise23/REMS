import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "@/Layouts/Admin/AdminSidebar";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { usePendingCount } from "@/Contexts/PendingCountContext";
import { Head } from "@inertiajs/react";
import ViewPropertyModal from "@/Components/Admin/ViewPropertyModal";

export default function AdminPropertyMng({ auth, user }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNewData, setHasNewData] = useState(false);
    const [lastSnapshot, setLastSnapshot] = useState([]);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [shouldReload, setShouldReload] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const { fetchPendingCount } = usePendingCount();

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedProperties = properties
        .filter(
            (property) =>
                property.property_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                property.username
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                property.purchase
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                property.approval_status
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let order = 0;
            if (sortConfig.key === "approval_status") {
                const statusOrder = ["Pending", "Approved", "Rejected"];
                const aIndex = statusOrder.indexOf(a[sortConfig.key]);
                const bIndex = statusOrder.indexOf(b[sortConfig.key]);
                order =
                    sortConfig.direction === "asc"
                        ? aIndex - bIndex
                        : bIndex - aIndex;
            } else {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    order = sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    order = sortConfig.direction === "asc" ? 1 : -1;
                }
            }
            return order;
        });

    const fetchProperties = async () => {
        setLoading(true);
        try {
            console.log("fetchProperties");
            const response = await axios.get("/properties/data");
            if (response.data) {
                localStorage.setItem(
                    "lastSnapshot",
                    JSON.stringify(response.data)
                );
                setProperties(response.data);
                const pending = response.data.filter(
                    (property) => property.approval_status === "Pending"
                ).length;
                setPendingCount(pending);
                setLastSnapshot(response.data);
                setHasNewData(false);
            }
        } catch (error) {
            alert("Failed to load properties. Please try refreshing the page.");
        } finally {
            setLoading(false);
        }
    };

    const fetchReloadProperties = async () => {
        try {
            const response = await axios.get("/properties/data");
            if (response.data && response.data.length > 0) {
                if (response.data && response.data.length > 0) {
                    let lastSnapshot =
                        JSON.parse(localStorage.getItem("lastSnapshot")) || [];
                    if (
                        JSON.stringify(response.data) !==
                        JSON.stringify(lastSnapshot)
                    ) {
                        setHasNewData(true);
                    } else {
                        setHasNewData(false);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to check for changes", error);
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await axios.post(`/api/properties/${id}/approve`);
            if (response.data.status) {
                setProperties(
                    properties.map((property) =>
                        property.id === id
                            ? { ...property, approval_status: "Approved" }
                            : property
                    )
                );

                await fetchPendingCount();
            }
        } catch (error) {
            alert("Failed to approve property. Please try again.");
        }
    };
    const handleReject = async (id) => {
        try {
            const response = await axios.post(`/api/properties/${id}/reject`);
            if (response.data.status) {
                setProperties(
                    properties.map((property) =>
                        property.id === id
                            ? { ...property, approval_status: "Rejected" }
                            : property
                    )
                );

                await fetchPendingCount();
            }
        } catch (error) {
            alert("Failed to reject property. Please try again.");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Rejected":
                return "bg-red-100 text-red-800";
            case "Approved":
                return "bg-green-100 text-green-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "";
        }
    };

    const getPurchaseClass = (purchase) => {
        switch (purchase) {
            case "For Sale":
                return "bg-blue-100 text-blue-800";
            case "For Rent":
                return "bg-green-100 text-green-800";
            default:
                return "";
        }
    };

    const isButtonDisabled = (status, action) => {
        return (
            (status === "Rejected" && action === "reject") ||
            (status === "Approved" && action === "approve")
        );
    };

    const paginatedProperties = sortedProperties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (propertyDetails) => {
        setSelectedProperty(propertyDetails);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchProperties();
        const interval = setInterval(() => {
            fetchReloadProperties();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (shouldReload) {
            fetchProperties();
            setShouldReload(false);
        }
    }, [shouldReload]);

    const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);

    return (
        <>
            <Head title="Manage Property" />

            <div className="flex h-screen overflow-hidden">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    pendingCount={pendingCount}
                />
                {isSidebarOpen && (
                    <div
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black opacity-50 lg:hidden z-10"
                    ></div>
                )}
                <div className="flex-1 flex flex-col h-full overflow-y-auto">
                    <AdminLayout>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-4 text-blue-800"
                        >
                            Toggle Sidebar
                        </button>
                        <main className="p-6 bg-white rounded-lg shadow-md flex-1">
                            <h2 className="text-2xl font-bold mb-4">
                                Property Management
                            </h2>
                            <div className="flex mb-4">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search property..."
                                    className="p-2 border rounded"
                                    style={{
                                        width: "500px",
                                    }}
                                />
                                <button
                                    className="relative px-2 py-1 rounded bg-blue-700 text-white"
                                    onClick={() => {
                                        fetchProperties();
                                    }}
                                    disabled={loading}
                                    style={{
                                        marginLeft: "10px",
                                    }}
                                >
                                    {"Reload Properties"}
                                    {hasNewData && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                                            !
                                        </span>
                                    )}
                                </button>
                            </div>
                            {loading ? (
                                <div className="flex justify-center items-center max-h-screen">
                                    <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                                </div>
                            ) : properties.length === 0 ? (
                                <div className="text-center text-lg font-semibold text-gray-600 mt-8">
                                    No Properties available at the moment.
                                </div>
                            ) : (
                                <>
                                    <table className="min-w-full bg-white border rounded shadow-lg">
                                        <thead>
                                            <tr className="bg-gray-100 text-left">
                                                <th
                                                    className="px-4 py-2 cursor-pointer"
                                                    onClick={() =>
                                                        handleSort(
                                                            "property_name"
                                                        )
                                                    }
                                                >
                                                    Property Name
                                                </th>
                                                <th
                                                    className="px-4 py-2 cursor-pointer text-center"
                                                    onClick={() =>
                                                        handleSort("username")
                                                    }
                                                >
                                                    User
                                                </th>
                                                <th
                                                    className="px-4 py-2 cursor-pointer text-center"
                                                    onClick={() =>
                                                        handleSort("purchase")
                                                    }
                                                    style={{ width: "200px" }}
                                                >
                                                    Purchase
                                                </th>
                                                <th
                                                    className="px-4 py-2 cursor-pointer text-center"
                                                    onClick={() =>
                                                        handleSort(
                                                            "approval_status"
                                                        )
                                                    }
                                                    style={{ width: "200px" }}
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    className="px-4 py-2 text-center"
                                                    style={{ width: "250px" }}
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedProperties.map(
                                                (property) => (
                                                    <tr key={property.id}>
                                                        <td className="px-4 py-2">
                                                            {
                                                                property.property_name
                                                            }
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {property.username}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span
                                                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPurchaseClass(
                                                                    property.purchase
                                                                )}`}
                                                                style={{
                                                                    width: "100px",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                            >
                                                                {
                                                                    property.purchase
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span
                                                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                                                                    property.approval_status
                                                                )}`}
                                                                style={{
                                                                    width: "100px",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                            >
                                                                {
                                                                    property.approval_status
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                className="px-2 py-1 rounded bg-blue-800 text-white"
                                                                style={{
                                                                    width: "100px",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        property
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>
                                                            {/* <button
                                                                className={`px-2 py-1 rounded mr-2 ${
                                                                    isButtonDisabled(
                                                                        property.approval_status,
                                                                        "approve"
                                                                    )
                                                                        ? "bg-gray-500 text-white cursor-not-allowed"
                                                                        : "bg-green-500 text-white"
                                                                }`}
                                                                style={{
                                                                    width: "100px",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        property.id
                                                                    )
                                                                }
                                                                disabled={isButtonDisabled(
                                                                    property.approval_status,
                                                                    "approve"
                                                                )}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className={`px-2 py-1 rounded ${
                                                                    isButtonDisabled(
                                                                        property.approval_status,
                                                                        "reject"
                                                                    )
                                                                        ? "bg-gray-500 text-white cursor-not-allowed"
                                                                        : "bg-red-500 text-white"
                                                                }`}
                                                                style={{
                                                                    width: "100px",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                                onClick={() =>
                                                                    handleReject(
                                                                        property.id
                                                                    )
                                                                }
                                                                disabled={isButtonDisabled(
                                                                    property.approval_status,
                                                                    "reject"
                                                                )}
                                                            >
                                                                Reject
                                                            </button> */}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                    {isModalOpen && (
                                        <ViewPropertyModal
                                            isOpen={isModalOpen}
                                            propertyDetails={selectedProperty}
                                            onClose={handleCloseModal}
                                            setShouldReload={setShouldReload}
                                        />
                                    )}
                                    <div
                                        className="flex justify-between mt-4"
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "10px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            style={{
                                                width: "100px",
                                            }}
                                        >
                                            Previous
                                        </button>
                                        <span className="flex items-center">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            style={{
                                                width: "100px",
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </main>
                    </AdminLayout>
                </div>
            </div>
        </>
    );
}
