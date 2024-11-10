import React from 'react';

const PropertyCard = ({ property, photos }) => {
    // 处理照片URL
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        
        // 如果已经是完整URL，直接返回
        if (photoPath.startsWith('http')) return photoPath;
        
        // 否则，添加storage前缀
        return `/storage/${photoPath}`;
    };

    // 获取要显示的照片
    const displayPhoto = () => {
        // 优先使用传入的 photos
        if (photos && photos.length > 0) {
            return photos[0];  // 返回第一张照片
        }

        // 如果没有传入 photos，则使用原有的逻辑作为后备
        if (!property.property_photos) return null;
        
        let propertyPhotos = property.property_photos;
        if (typeof propertyPhotos === 'string') {
            try {
                propertyPhotos = JSON.parse(propertyPhotos);
            } catch (e) {
                console.error('Error parsing property photos:', e);
                return null;
            }
        }
        
        if (Array.isArray(propertyPhotos)) {
            return getPhotoUrl(propertyPhotos[0]);
        }
        
        return getPhotoUrl(propertyPhotos);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 属性图片 */}
            <div className="relative h-48">
                {displayPhoto() ? (
                    <img
                        src={displayPhoto()}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // 添加默认图片
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {property.purchase}
                    </span>
                </div>
            </div>

            {/* 属性信息 */}
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.property_name}</h3>
                <p className="text-gray-600 mb-2">{property.city}</p>
                
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-blue-600">
                        RM {Number(property.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                        {property.square_feet} sq ft
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">{property.property_type}</span>
                    {property.number_of_units && (
                        <span>{property.number_of_units} units</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;