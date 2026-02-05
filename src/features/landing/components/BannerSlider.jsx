import { useState, useEffect } from "react";
import { Box, Container, Group, UnstyledButton, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";

const defaultGradient = "linear-gradient(135deg, rgba(79, 140, 255, 0.85) 0%, rgba(124, 58, 237, 0.85) 100%)";

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
    gradient: "linear-gradient(135deg, rgba(34, 211, 238, 0.85) 0%, rgba(79, 140, 255, 0.85) 100%)",
  },
  {
    id: "hms",
    image: "/caresynx-logo-HMS.png",
    alt: "",
    title: "",
    subtitle: "",
    gradient: "linear-gradient(135deg, rgba(124, 58, 237, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
  },
];

/** Slides for Main page: Welcome banner + product images + AI */
export const MAIN_PAGE_SLIDES = [
  {
    id: "welcome",
    image: "/caresynx-welcome.png",
    gradient: "linear-gradient(135deg, #4f8cff 0%, #22d3ee 40%, #7c3aed 100%)",
  },
  {
    id: "homecare",
    image: "/LoginPage-HC.png",
    gradient: "linear-gradient(135deg, rgba(34, 211, 238, 0.85) 0%, rgba(79, 140, 255, 0.85) 100%)",
  },
  {
    id: "hms",
    image: "/caresynx-logo-HMS.png",
    gradient: "linear-gradient(135deg, rgba(124, 58, 237, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
  },
  {
    id: "ai",
    image: "/AI-Image.png",
    gradient: "linear-gradient(135deg, rgba(79, 140, 255, 0.85) 0%, rgba(124, 58, 237, 0.85) 100%)",
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
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      {slides.map((s, i) => (
        <Box
          key={s.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.6s ease",
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
                  ? "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)"
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

      <UnstyledButton
        onClick={() => go(current - 1)}
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          zIndex: 2,
        }}
      >
        <IconChevronLeft size={24} color="#334155" />
      </UnstyledButton>
      <UnstyledButton
        onClick={() => go(current + 1)}
        style={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          zIndex: 2,
        }}
      >
        <IconChevronRight size={24} color="#334155" />
      </UnstyledButton>

      <Group
        position="center"
        spacing="xs"
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
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i === current ? "white" : "rgba(255,255,255,0.5)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </Group>
    </Box>
  );
};

export default BannerSlider;
