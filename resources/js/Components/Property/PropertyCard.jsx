import React from 'react';
import { Link } from '@inertiajs/react';
import { FaHome, FaDollarSign, FaBuilding, FaRulerCombined } from 'react-icons/fa';

const PropertyCard = ({ property = {}, photos = [] }) => {
    if (property.approval_status === 'Rejected'){
        return null;
    }
    if (property.approval_status === 'Pending'){
        return null;
    }
    const defaultProperty = {
        id: property?.id || 0,
        property_name: property?.property_name || 'Untitled Property',
        property_type: property?.property_type || 'Conventional Condominium',
        price: property?.price || 0,
        square_feet: property?.square_feet || 0,
        number_of_units: property?.number_of_units || 1,
        purchase: property?.purchase || 'For Sale',
    };

    const displayPhoto = () => {
        const photoUrl = photos && photos.length > 0 ? photos[0] : null;
        // console.log("photoUrl", photoUrl)
        return photoUrl;
    };

    // 定义主题颜色
    const themeColors = {
        blue: 'text-blue-600',
        green: 'text-green-600'
    };

    // 根据 purchase 类型自动设置主题颜色
    const autoTheme = defaultProperty.purchase === 'For Sale' ? 'blue' : 'green';
    const themeColor = themeColors[autoTheme];

    const getStatusOverlay = () => {
        if (!property.status || property.status === 'available') return null;

        const overlayClass = {
            sold: 'bg-red-900',
            rented: 'bg-blue-900',
            cancelled: 'bg-gray-900'
        }[property.status];

        const statusText = {
            sold: 'SOLD',
            rented: 'RENTED',
            cancelled: 'CANCELLED'
        }[property.status];

        return (
            <div className={`absolute inset-0 ${overlayClass} bg-opacity-50 flex items-center justify-center`}>
                <span className="text-white text-2xl font-bold transform -rotate-45">
                    {statusText}
                </span>
            </div>
        );
    };

    // 添加一个判断函数来确定卡片是否可点击
    const isClickable = () => {
        return !property.status || property.status === 'available';
    };

    return (
        <div className="relative">
            {isClickable() ? (
                <Link 
                    href={`/property/${defaultProperty.id}`} 
                    className="block bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                    <CardContent 
                        defaultProperty={defaultProperty} 
                        displayPhoto={displayPhoto} 
                        themeColor={themeColor} 
                        property={property}
                        getStatusOverlay={getStatusOverlay}
                    />
                </Link>
            ) : (
                <div className="block bg-white rounded-lg shadow-md overflow-hidden">
                    <CardContent 
                        defaultProperty={defaultProperty} 
                        displayPhoto={displayPhoto} 
                        themeColor={themeColor} 
                        property={property}
                        getStatusOverlay={getStatusOverlay}
                    />
                </div>
            )}
        </div>
    );
};

// 将卡片内容抽取为一个单独的组件以避免代码重复
const CardContent = ({ defaultProperty, displayPhoto, themeColor, property, getStatusOverlay }) => (
    <>
        <div className="relative h-48 group">
            {displayPhoto() ? (
                <>
                    <img
                        src={displayPhoto()}
                        alt={defaultProperty.property_name}
                        className={`w-full h-full object-cover group-hover:opacity-90 transition-opacity ${
                            property.status !== 'available' ? 'filter grayscale' : ''
                        }`}
                    />
                    {getStatusOverlay()}
                </>
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaHome className="w-12 h-12 text-gray-400" />
                </div>
            )}
        </div>

        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaBuilding className={`w-5 h-5 mr-2 ${themeColor}`} />
                {defaultProperty.property_name}
            </h3>

            <div className="flex justify-between items-center mb-3">
                <span className={`text-lg font-bold ${themeColor} flex items-center`}>
                    <FaDollarSign className="w-5 h-5 mr-1" />
                    RM {Number(defaultProperty.price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                    <FaRulerCombined className="w-4 h-4 mr-1" />
                    {defaultProperty.square_feet} sq ft
                </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 border-t pt-3">
                <span className="mr-4 flex items-center">
                    <FaHome className="w-4 h-4 mr-1" />
                    {defaultProperty.property_type}
                </span>
                {defaultProperty.number_of_units && (
                    <span className="flex items-center">
                        <FaBuilding className="w-4 h-4 mr-1" />
                        {defaultProperty.number_of_units} units
                    </span>
                )}
            </div>
        </div>
    </>
);

export default PropertyCard;