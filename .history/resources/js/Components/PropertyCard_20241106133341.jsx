import React from "react";

const PropertyCard = ({ property }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 图片区域 */}
            <div className="relative h-48">
                {property.property_photos?.length > 0 ? (
                    <img 
                        src={URL.createObjectURL(property.property_photos[0])} 
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        No Image
                    </div>
                )}
                <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm">
                    +{property.property_photos?.length || 0}
                </span>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{property.property_name}</h3>
                    <span className="text-xl font-bold text-red-600">
                        RM {property.price}
                    </span>
                </div>
                <p className="text-gray-600 mb-2">{property.property_address_line_1}</p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {property.property_type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {property.purchase}
                    </span>
                </div>

                {/* 属性信息 */}
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                        <i className="fas fa-expand"></i> {property.square_feet} sq ft
                    </div>
                    <div>
                        <i className="fas fa-bed"></i> {property.number_of_units} units
                    </div>
                    <div>
                        <i className="fas fa-car"></i> {property.parking}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard; 