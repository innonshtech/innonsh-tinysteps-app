import React from 'react';
import { Text, TextProps } from 'react-native';
import { PodarTypography, PodarFonts } from '../../theme/typography';
import { PodarColors } from '../../theme/colors';

interface TypographyProps extends TextProps {
    variant?: keyof typeof PodarTypography;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export const Typography: React.FC<TypographyProps> = ({
    children,
    style,
    variant = 'body',
    color = PodarColors.textPrimary,
    align = 'left',
    weight,
    ...props
}) => {
    // If a specific weight is requested, override the variant's font family.
    const fontWeightStyle = weight ? { fontFamily: PodarFonts[weight] } : {};

    return (
        <Text
            style={[
                PodarTypography[variant],
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

