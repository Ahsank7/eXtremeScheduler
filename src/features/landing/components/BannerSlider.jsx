import { useState, useEffect } from "react";
import { Box, Container, Group, UnstyledButton, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";

const defaultGradient = "linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.85) 100%)";

/** Default slides for Products page: CareSyncX, Home Care, HMS */
export const PRODUCT_SLIDES = [
  {
    id: "caresynx",
    image: "/caresynx-logo.png",
    alt: "",
    title: "",
    subtitle: "",
    gradient: defaultGradient,
  },
  {
    id: "homecare",
    image: "/LoginPage-HC.png",
    alt: "",
    title: "",
    subtitle: "",
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)",
  },
  {
    id: "hms",
    image: "/caresynx-logo-HMS.png",
    alt: "",
    title: "",
    subtitle: "",
    gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
  },
];

/** Slides for Main page: Welcome banner + product images + AI */
export const MAIN_PAGE_SLIDES = [
  {
    id: "welcome",
    image: "/caresynx-welcome.png",
    gradient: "linear-gradient(135deg, #6366f1 0%, #06b6d4 40%, #8b5cf6 100%)",
  },
  {
    id: "homecare",
    image: "/LoginPage-HC.png",
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)",
  },
  {
    id: "hms",
    image: "/caresynx-logo-HMS.png",
    gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
  },
  {
    id: "ai",
    image: "/AI-Image.png",
    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.85) 100%)",
  },
];

const AUTOPLAY_MS = 5000;

const BannerSlider = ({ slides = PRODUCT_SLIDES, height = 340, borderRadius = 16 }) => {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (index) => setCurrent((index + slides.length) % slides.length);

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(99, 102, 241, 0.15)",
      }}
    >
      {slides.map((s, i) => (
        <Box
          key={s.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.02)",
            transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            background: s.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {s.image && (
            <img
              src={s.image}
              alt={s.alt || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                objectPosition: "center center",
                display: loaded[s.id] ? "block" : "none",
              }}
              onLoad={() => setLoaded((p) => ({ ...p, [s.id]: true }))}
              onError={() => setLoaded((p) => ({ ...p, [s.id]: false }))}
            />
          )}
          <Box
            style={{
              position: "absolute",
              inset: 0,
              background:
                s.image && loaded[s.id] === true
                  ? "linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 60%)"
                  : "transparent",
              display: "flex",
              alignItems: "center",
              padding: "0 4rem",
            }}
          >
            <Container size="md" style={{ width: "100%", margin: 0, maxWidth: "100%" }}>
              <Text
                size="xl"
                fw={700}
                c="white"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </Text>
              <Text
                size="md"
                c="white"
                style={{
                  textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  opacity: 0.95,
                }}
              >
                {s.subtitle}
              </Text>
            </Container>
          </Box>
        </Box>
      ))}

      {/* Navigation arrows */}
      <UnstyledButton
        onClick={() => go(current - 1)}
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          zIndex: 2,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.15)";
        }}
      >
        <IconChevronLeft size={24} color="#302b63" />
      </UnstyledButton>
      <UnstyledButton
        onClick={() => go(current + 1)}
        style={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          zIndex: 2,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.15)";
        }}
      >
        <IconChevronRight size={24} color="#302b63" />
      </UnstyledButton>

      {/* Pill-shaped indicators */}
      <Group
        position="center"
        spacing={8}
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          zIndex: 2,
        }}
      >
        {slides.map((_, i) => (
          <UnstyledButton
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 28 : 10,
              height: 10,
              borderRadius: 5,
              background: i === current ? "white" : "rgba(255, 255, 255, 0.45)",
              boxShadow: "0 1px 6px rgba(0, 0, 0, 0.2)",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
            }}
          />
        ))}
      </Group>
    </Box>
  );
};

export default BannerSlider;
