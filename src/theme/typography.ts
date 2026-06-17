import { TextStyle } from 'react-native';

type TypographyVariants = {
    display: TextStyle;
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    h4: TextStyle;
    bodyLarge: TextStyle;
    body: TextStyle;
    caption: TextStyle;
    label: TextStyle;
    button: TextStyle;
};

export const InnonshFonts = {
    regular: 'GoogleSans-Regular',
    medium: 'GoogleSans-Medium',
    semiBold: 'GoogleSans-SemiBold',
    bold: 'GoogleSans-Bold',
};

export const InnonshTypography: TypographyVariants = {
    display: {
        fontFamily: InnonshFonts.bold,
        fontSize: 40,
        lineHeight: 48,
    },
    h1: {
        fontFamily: InnonshFonts.bold,
        fontSize: 32,
        lineHeight: 40,
    },
    h2: {
        fontFamily: InnonshFonts.bold,
        fontSize: 24,
        lineHeight: 32,
    },
    h3: {
        fontFamily: InnonshFonts.bold,
        fontSize: 20,
        lineHeight: 28,
    },
    h4: {
        fontFamily: InnonshFonts.bold,
        fontSize: 16,
        lineHeight: 24,
    },
    bodyLarge: {
        fontFamily: InnonshFonts.regular,
        fontSize: 18,
        lineHeight: 28,
    },
    body: {
        fontFamily: InnonshFonts.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontFamily: InnonshFonts.medium,
        fontSize: 14,
        lineHeight: 20,
    },
    label: {
        fontFamily: InnonshFonts.medium,
        fontSize: 12,
        lineHeight: 16,
    },
    button: {
        fontFamily: InnonshFonts.bold,
        fontSize: 16,
        lineHeight: 24,
    },
};

