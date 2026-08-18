import React from 'react';
import { Text, TextProps } from 'react-native';
import { InnonshTypography, InnonshFonts } from '../../theme/typography';
import { InnonshColors } from '../../theme/colors';

interface TypographyProps extends TextProps {
    variant?: keyof typeof InnonshTypography;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export const Typography: React.FC<TypographyProps> = ({
    children,
    style,
    variant = 'body',
    color = InnonshColors.textPrimary,
    align = 'left',
    weight,
    ...props
}) => {
    // If a specific weight is requested, override the variant's font family.
    const fontWeightStyle = weight ? { fontFamily: InnonshFonts[weight] } : {};

    return (
        <Text
            style={[
                InnonshTypography[variant],
                { color, textAlign: align },
                fontWeightStyle,
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

