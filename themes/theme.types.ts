export interface Theme {
  name: string;
  /** Full product name shown in header, auth, and metadata (e.g. "Keyra Videos"). */
  productName: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryDisabled: string;
    onPrimary: string;
    textLink: string;
    canvas: string;
    canvasSoft: string;
    surfaceCard: string;
    surfaceSoft: string;
    surfaceStrong: string;
    surfaceDark: string;
    surfaceDarkElevated: string;
    gradientSkyLight: string;
    gradientSkyMid: string;
    hairline: string;
    hairlineSoft: string;
    hairlineStrong: string;
    ink: string;
    body: string;
    muted: string;
    mutedSoft: string;
    onDark: string;
    onDarkSoft: string;
    warning: string;
    success: string;
    error: string;
  };
  typography: {
    fontSans: string;
    fontMono: string;
  };
  radius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
  shadow: {
    card: string;
  };
}
