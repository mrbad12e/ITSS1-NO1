// src/components/common/ProfileImage.jsx
import React from 'react';
import { User } from 'lucide-react';
import ImageService from '@/services/imageService';

const ProfileImage = ({ src, alt, size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    const imageUrl = ImageService.getImageUrl(src);
    const containerClass = `${sizeClasses[size]} rounded-full bg-secondary overflow-hidden`;

    return (
        <div className={containerClass}>
            {imageUrl ? (
                <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                    <User className={`${iconSizes[size]} text-muted-foreground`} />
                </div>
            )}
        </div>
    );
};

export default ProfileImage;
