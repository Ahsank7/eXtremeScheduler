import { Box } from "@mantine/core";
import caresynxLogoPng from "../../../assets/images/caresynx-logo.png";

/**
 * Logo that blends with header (light) or footer (dark) background.
 * Uses a subtle "surface" wrapper so the PNG reads well in both contexts.
 * To use an SVG instead: add caresynx-logo.svg to src/assets/images and
 * use the svg prop, or replace the <img> below with an inline SVG / <img src={logoSvg} />.
 */
const CareSyncXLogo = ({ variant = "header", height, onClick, style = {} }) => {
  const isFooter = variant === "footer";
  const logoHeight = height ?? (isFooter ? 36 : 44);

  const wrapperStyle = isFooter
    ? {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 14px",
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.65)",
        boxShadow: "0 2px 12px rgba(79, 140, 255, 0.12)",
      };

  return (
    <Box
      style={{ ...wrapperStyle, ...style }}
      onClick={onClick}
      sx={onClick ? { cursor: "pointer" } : {}}
    >
      <img
        src={caresynxLogoPng}
        alt="caresynX"
        style={{
          height: logoHeight,
          width: "auto",
          display: "block",
          objectFit: "contain",
          verticalAlign: "middle",
        }}
      />
    </Box>
  );
};

export default CareSyncXLogo;
